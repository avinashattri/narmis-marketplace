import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Session, User as SupabaseAuthUser } from '@supabase/supabase-js';
import { CollegeVerificationStatus, UserProfile } from '../types';
import { supabase, isSupabaseConfigured, supabaseConfigError } from '../services/supabase';
import { DEFAULT_CAMPUS_LOCATION, DEFAULT_COLLEGE_NAME } from '../services/locationDefaults';
import { uploadImage, uploadPrivateCollegeId } from '../services/storage';

export interface SignupPayload {
  fullName: string;
  email: string;
  password?: string;
  collegeName?: string;
  collegeIdNumber?: string;
  collegeIdImageDataUrl?: string;
  avatarDataUrl?: string;
  location?: string;
}

export interface CollegeVerificationSubmission {
  collegeName: string;
  collegeIdNumber: string;
  collegeIdImageDataUrl?: string;
}

export interface AuthActionResult {
  success: boolean;
  error?: string;
  code?: string;
  needsEmailVerification?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isPasswordRecovery: boolean;
  clearPasswordRecovery: () => void;
  login: (email: string, password?: string) => Promise<AuthActionResult>;
  signup: (payload: SignupPayload) => Promise<AuthActionResult>;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (updated: Partial<UserProfile>) => Promise<void>;
  submitCollegeVerification: (
    submission: CollegeVerificationSubmission
  ) => Promise<{ success: boolean; error?: string }>;
  isSupabaseConnected: boolean;
  supabaseConfigError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const buildBaseProfileFromAuthUser = (authUser: SupabaseAuthUser): UserProfile => {
  const meta = (authUser.user_metadata || {}) as Record<string, any>;
  const fallbackName =
    (typeof meta.full_name === 'string' && meta.full_name.trim()) ||
    authUser.email?.split('@')[0] ||
    'Marketplace Member';

  const resolvedLocation =
    (typeof meta.location === 'string' && meta.location.trim()) || DEFAULT_CAMPUS_LOCATION;

  const verificationStatus: CollegeVerificationStatus =
    (meta.college_verification_status as CollegeVerificationStatus) || 'Not Submitted';

  const formattedJoinDate = authUser.created_at
    ? new Date(authUser.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : 'November 2026';

  return {
    id: authUser.id,
    full_name: fallbackName,
    email: authUser.email,
    avatar_url:
      meta.avatar_url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        fallbackName
      )}&background=304943&color=EAD3AA&bold=true&size=150`,
    bio: meta.bio || 'Member of NARMIS circular community.',
    location: resolvedLocation,
    college_name: meta.college_name || DEFAULT_COLLEGE_NAME,
    college_id_number: meta.college_id_number || undefined,
    college_verification_status: verificationStatus,
    college_submitted_at: meta.college_submitted_at || undefined,
    rating: 5.0,
    review_count: 0,
    joined_date: formattedJoinDate,
  };
};

const hasRecoveryMarkerInUrl = (): boolean => {
  if (typeof window === 'undefined') return false;
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  return (
    search.get('mode') === 'recovery' ||
    search.get('type') === 'recovery' ||
    hash.get('type') === 'recovery'
  );
};

const mapAuthErrorMessage = (error: any): { code: string; message: string } => {
  const errCode = String(error?.code || '').toLowerCase();
  const errMsg = String(error?.message || 'Authentication failed.');

  if (errCode === 'email_not_confirmed' || /email not confirmed/i.test(errMsg)) {
    return {
      code: 'email_not_confirmed',
      message:
        'Your email address has not been confirmed yet. Please open the confirmation link sent to your inbox (or click "Resend Confirmation Email" below).',
    };
  }

  if (
    errCode === 'over_email_send_rate_limit' ||
    error?.status === 429 ||
    /rate limit|security purposes/i.test(errMsg)
  ) {
    return {
      code: 'over_email_send_rate_limit',
      message: 'Too many authentication requests. Please wait a minute and try again.',
    };
  }

  if (errCode === 'invalid_credentials' || /invalid login credentials/i.test(errMsg)) {
    return {
      code: 'invalid_credentials',
      message:
        'Invalid email or password. Double-check your credentials, or verify your email if you just signed up.',
    };
  }

  if (errCode === 'user_already_exists' || /already registered|already exists/i.test(errMsg)) {
    return {
      code: 'user_already_exists',
      message: 'An account with this email address already exists. Please sign in instead.',
    };
  }

  if (errCode === 'weak_password' || /password should be at least/i.test(errMsg)) {
    return {
      code: 'weak_password',
      message: 'Password is too weak. Please use at least 6 characters.',
    };
  }

  if (errCode === 'same_password' || /new password should be different/i.test(errMsg)) {
    return {
      code: 'same_password',
      message: 'Your new password must be different from your previous password.',
    };
  }

  if (errCode === 'email_address_invalid' || /invalid email/i.test(errMsg)) {
    return {
      code: 'email_address_invalid',
      message: 'Please enter a valid email address.',
    };
  }

  return { code: errCode || 'auth_error', message: errMsg };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState<boolean>(() =>
    hasRecoveryMarkerInUrl()
  );

  const clearPasswordRecovery = useCallback(() => {
    setIsPasswordRecovery(false);
  }, []);

  const hydrateUserFromSupabase = useCallback(
    async (authUser: SupabaseAuthUser): Promise<UserProfile> => {
      const base = buildBaseProfileFromAuthUser(authUser);
      if (!supabase) return base;

      let profile: any = null;
      let verification: any = null;

      try {
        const { data: profData, error: profErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();
        if (!profErr && profData) {
          profile = profData;
        }
      } catch {
        // fallback to auth metadata if profiles query fails
      }

      try {
        const { data: verifData, error: verifErr } = await supabase
          .from('college_verifications')
          .select('college_name, college_id_number, verification_status, submitted_at, reviewed_at')
          .eq('user_id', authUser.id)
          .maybeSingle();
        if (!verifErr && verifData) {
          verification = verifData;
        }
      } catch {
        // college_verifications optional
      }

      const fallbackName = profile?.full_name || base.full_name;
      const verificationStatus: CollegeVerificationStatus =
        (verification?.verification_status as CollegeVerificationStatus) ||
        (profile?.college_verification_status as CollegeVerificationStatus) ||
        base.college_verification_status ||
        'Not Submitted';

      return {
        ...base,
        full_name: fallbackName,
        avatar_url: profile?.avatar_url || base.avatar_url,
        bio: profile?.bio || base.bio,
        location:
          profile?.location && profile.location.trim() ? profile.location : base.location,
        college_name:
          verification?.college_name || profile?.college_name || base.college_name,
        college_id_number: verification?.college_id_number || base.college_id_number,
        college_verification_status: verificationStatus,
        college_submitted_at: verification?.submitted_at || base.college_submitted_at,
        college_verified_at: verification?.reviewed_at || profile?.college_verified_at,
        rating:
          profile?.rating !== undefined && profile?.rating !== null
            ? Number(profile.rating)
            : base.rating,
        review_count:
          profile?.review_count !== undefined && profile?.review_count !== null
            ? Number(profile.review_count)
            : base.review_count,
      };
    },
    []
  );

  // 1. Synchronize Supabase Auth session & keep onAuthStateChange synchronous (no lock deadlocks)
  useEffect(() => {
    // Purge legacy non-Supabase localStorage auth keys from older prototypes
    localStorage.removeItem('narmis_auth_user');
    localStorage.removeItem('narmis_registered_accounts');
    localStorage.removeItem('narmis_supabase_accounts_meta');

    if (!isSupabaseConfigured || !supabase) {
      setSession(null);
      setUser(null);
      setIsLoading(false);
      return;
    }

    const client = supabase;
    let isMounted = true;

    const applySessionSync = (activeSession: Session | null) => {
      if (!isMounted) return;
      if (activeSession?.user && activeSession?.access_token) {
        setSession(activeSession);
        setUser((prev) => {
          const base = buildBaseProfileFromAuthUser(activeSession.user);
          if (prev && prev.id === base.id) {
            return { ...base, ...prev, email: activeSession.user.email || prev.email };
          }
          return base;
        });
      } else {
        setSession(null);
        setUser(null);
      }
    };

    // Subscribe BEFORE getSession so PKCE / URL hash callbacks are never missed
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, currentSession) => {
      if (!isMounted) return;

      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
        applySessionSync(currentSession);
        setIsLoading(false);
        return;
      }

      if (event === 'SIGNED_OUT') {
        setIsPasswordRecovery(false);
        setSession(null);
        setUser(null);
        setIsLoading(false);
        return;
      }

      applySessionSync(currentSession);
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        setIsLoading(false);
      }
    });

    client.auth
      .getSession()
      .then(({ data: { session: initialSession }, error }) => {
        if (!isMounted) return;
        if (!error && initialSession?.user && initialSession?.access_token) {
          applySessionSync(initialSession);
        } else if (error) {
          console.error('[NARMIS] Supabase getSession error:', error.message);
          setSession(null);
          setUser(null);
        }
      })
      .catch((err) => {
        console.error('[NARMIS] Supabase auth init error:', err);
        if (isMounted) {
          setSession(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // 2. Hydrate full profile & college verification outside the Supabase auth lock
  useEffect(() => {
    if (!session?.user || !session?.access_token) return;
    let active = true;
    hydrateUserFromSupabase(session.user).then((loaded) => {
      if (active) setUser(loaded);
    });
    return () => {
      active = false;
    };
  }, [session?.user?.id, session?.access_token, hydrateUserFromSupabase]);

  const login = async (email: string, password?: string): Promise<AuthActionResult> => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error:
          supabaseConfigError ||
          'Supabase authentication is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      };
    }

    if (!trimmedEmail || !password) {
      return {
        success: false,
        error: 'Please enter both your email address and password.',
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        const mapped = mapAuthErrorMessage(error);
        setSession(null);
        setUser(null);
        return {
          success: false,
          code: mapped.code,
          error: mapped.message,
        };
      }

      if (data.session?.access_token && data.user) {
        setIsPasswordRecovery(false);
        setSession(data.session);
        setUser(buildBaseProfileFromAuthUser(data.user));
        const loadedUser = await hydrateUserFromSupabase(data.user);
        setUser(loadedUser);
        return { success: true };
      }

      setSession(null);
      setUser(null);
      return {
        success: false,
        error: 'Sign in did not return an active session. Please try again.',
      };
    } catch (err: any) {
      setSession(null);
      setUser(null);
      return {
        success: false,
        error: err?.message || 'Sign in failed due to a network or server error.',
      };
    }
  };

  const signup = async (payload: SignupPayload): Promise<AuthActionResult> => {
    const trimmedEmail = payload.email.trim().toLowerCase();
    const cleanName = payload.fullName.trim();
    const cleanCollege = payload.collegeName?.trim() || DEFAULT_COLLEGE_NAME;
    const cleanCollegeId = payload.collegeIdNumber?.trim() || '';
    const cleanLocation = payload.location?.trim() || DEFAULT_CAMPUS_LOCATION;
    const hasUploadedIdImage = Boolean(payload.collegeIdImageDataUrl);
    const initialVerificationStatus: CollegeVerificationStatus = hasUploadedIdImage
      ? 'Pending Verification'
      : 'Not Submitted';

    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error:
          supabaseConfigError ||
          'Supabase authentication is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
      };
    }

    if (!trimmedEmail || !payload.password || !cleanName) {
      return {
        success: false,
        error: 'Full name, email address, and password are required.',
      };
    }

    if (payload.password.length < 6) {
      return {
        success: false,
        code: 'weak_password',
        error: 'Password must be at least 6 characters long.',
      };
    }

    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      cleanName
    )}&background=304943&color=EAD3AA&bold=true&size=150`;
    const nowIso = new Date().toISOString();

    try {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: payload.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login?confirmed=1`,
          data: {
            full_name: cleanName,
            location: cleanLocation,
            college_name: cleanCollege,
            college_id_number: cleanCollegeId || undefined,
            college_verification_status: initialVerificationStatus,
            college_submitted_at: hasUploadedIdImage ? nowIso : undefined,
            bio: 'Member of NARMIS circular community.',
          },
        },
      });

      if (error) {
        const mapped = mapAuthErrorMessage(error);
        return {
          success: false,
          code: mapped.code,
          error: mapped.message,
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: 'Account creation did not return a user record. Please try again.',
        };
      }

      // Supabase returns an obfuscated user with empty `identities: []` when email already exists
      if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        return {
          success: false,
          code: 'user_already_exists',
          error:
            'An account with this email address already exists. Please sign in on the Login page.',
        };
      }

      const hasValidSession = Boolean(data.session?.access_token);
      if (!hasValidSession) {
        return {
          success: true,
          needsEmailVerification: true,
        };
      }

      let resolvedAvatarUrl = defaultAvatar;
      let storedCollegeIdPath: string | undefined;

      if (payload.avatarDataUrl) {
        try {
          resolvedAvatarUrl = await uploadImage(
            payload.avatarDataUrl,
            data.user.id,
            'avatar',
            'avatars'
          );
        } catch (avatarErr) {
          console.warn('[NARMIS] Avatar upload notice:', avatarErr);
        }
      }

      if (payload.collegeIdImageDataUrl) {
        try {
          storedCollegeIdPath = await uploadPrivateCollegeId(
            payload.collegeIdImageDataUrl,
            data.user.id
          );
        } catch (idErr) {
          console.warn('[NARMIS] College ID upload notice:', idErr);
        }
      }

      if (resolvedAvatarUrl !== defaultAvatar) {
        try {
          await supabase.auth.updateUser({
            data: { avatar_url: resolvedAvatarUrl },
          });
        } catch {
          // non-fatal
        }
      }

      const newProfile: UserProfile = {
        id: data.user.id,
        full_name: cleanName,
        email: trimmedEmail,
        avatar_url: resolvedAvatarUrl,
        bio: 'Member of NARMIS circular community.',
        location: cleanLocation,
        college_name: cleanCollege,
        college_id_number: cleanCollegeId || undefined,
        college_id_image: storedCollegeIdPath,
        college_verification_status: initialVerificationStatus,
        college_submitted_at: hasUploadedIdImage ? nowIso : undefined,
        rating: 5.0,
        review_count: 0,
        joined_date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      };

      try {
        await supabase.from('profiles').upsert(
          [
            {
              id: data.user.id,
              full_name: cleanName,
              avatar_url: resolvedAvatarUrl,
              bio: newProfile.bio,
              location: cleanLocation,
              college_name: cleanCollege,
              college_verification_status: initialVerificationStatus,
            },
          ],
          { onConflict: 'id' }
        );

        if (cleanCollegeId || storedCollegeIdPath) {
          await supabase.from('college_verifications').upsert(
            [
              {
                user_id: data.user.id,
                college_name: cleanCollege,
                college_id_number: cleanCollegeId || 'PENDING_NUMBER',
                college_id_image_path: storedCollegeIdPath || null,
                verification_status: initialVerificationStatus,
                submitted_at: hasUploadedIdImage ? nowIso : null,
              },
            ],
            { onConflict: 'user_id' }
          );
        }
      } catch (profileErr) {
        console.warn('[NARMIS] Profile table upsert notice:', profileErr);
      }

      setSession(data.session);
      setUser(newProfile);

      return {
        success: true,
        needsEmailVerification: false,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Error creating account.',
      };
    }
  };

  const resendVerificationEmail = async (
    email: string
  ): Promise<{ success: boolean; message: string }> => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        message: 'Supabase authentication is not configured.',
      };
    }
    if (!trimmedEmail) {
      return {
        success: false,
        message: 'Please enter your email address first.',
      };
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: trimmedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/login?confirmed=1`,
        },
      });

      if (error) {
        return { success: false, message: mapAuthErrorMessage(error).message };
      }

      return {
        success: true,
        message: `Confirmation email sent to ${trimmedEmail}. Please check your inbox and spam folder.`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Failed to resend verification email.',
      };
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        message: 'Supabase authentication is not configured.',
      };
    }
    if (!trimmedEmail) {
      return {
        success: false,
        message: 'Please enter your account email address.',
      };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/login?mode=recovery`,
      });
      if (error) {
        return { success: false, message: mapAuthErrorMessage(error).message };
      }
      return {
        success: true,
        message: `Password reset link sent to ${trimmedEmail}. Click the link in your email to set a new password.`,
      };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to request password reset.' };
    }
  };

  const updatePassword = async (
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        message: 'Supabase authentication is not configured.',
      };
    }
    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        message: 'New password must be at least 6 characters long.',
      };
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        return { success: false, message: mapAuthErrorMessage(error).message };
      }
      setIsPasswordRecovery(false);
      return { success: true, message: 'Your password has been updated successfully!' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Error updating password.' };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
    } finally {
      setIsPasswordRecovery(false);
      setSession(null);
      setUser(null);
    }
  };

  const updateProfile = async (updated: Partial<UserProfile>): Promise<void> => {
    if (!user || !session?.access_token) return;
    const newUser: UserProfile = {
      ...user,
      ...updated,
      college_verification_status: user.college_verification_status,
    };

    if (isSupabaseConfigured && supabase) {
      const { error: dbErr } = await supabase
        .from('profiles')
        .update({
          full_name: newUser.full_name,
          bio: newUser.bio,
          location: newUser.location,
          avatar_url: newUser.avatar_url,
        })
        .eq('id', user.id);

      if (dbErr) {
        throw new Error(`Failed to update profile in Supabase: ${dbErr.message}`);
      }

      try {
        await supabase.auth.updateUser({
          data: {
            full_name: newUser.full_name,
            bio: newUser.bio,
            location: newUser.location,
            avatar_url: newUser.avatar_url,
            college_name: newUser.college_name,
          },
        });
      } catch {
        // metadata sync optional
      }
    }

    setUser(newUser);
  };

  const submitCollegeVerification = async (
    submission: CollegeVerificationSubmission
  ): Promise<{ success: boolean; error?: string }> => {
    if (!user || !session?.access_token) {
      return { success: false, error: 'You must be logged in with a valid Supabase session.' };
    }
    const cleanCollege = submission.collegeName.trim() || DEFAULT_COLLEGE_NAME;
    const cleanIdNum = submission.collegeIdNumber.trim();
    const hasImage = Boolean(submission.collegeIdImageDataUrl);

    if (!cleanIdNum && !hasImage) {
      return {
        success: false,
        error: 'Please provide your College ID number or upload a College ID image.',
      };
    }

    const nextStatus: CollegeVerificationStatus =
      hasImage || user.college_id_image
        ? 'Pending Verification'
        : user.college_verification_status === 'Verified'
        ? 'Pending Verification'
        : 'Not Submitted';

    try {
      let privatePath = user.college_id_image;
      if (submission.collegeIdImageDataUrl && isSupabaseConfigured && supabase) {
        privatePath = await uploadPrivateCollegeId(submission.collegeIdImageDataUrl, user.id);
      }

      const nowIso = new Date().toISOString();

      if (isSupabaseConfigured && supabase) {
        const { error: verifErr } = await supabase.from('college_verifications').upsert(
          [
            {
              user_id: user.id,
              college_name: cleanCollege,
              college_id_number: cleanIdNum || 'PENDING_NUMBER',
              college_id_image_path: privatePath || null,
              verification_status: nextStatus,
              submitted_at: hasImage ? nowIso : user.college_submitted_at || null,
            },
          ],
          { onConflict: 'user_id' }
        );

        if (verifErr) {
          return {
            success: false,
            error: `Failed to save college verification: ${verifErr.message}`,
          };
        }

        try {
          await supabase.auth.updateUser({
            data: {
              college_name: cleanCollege,
              college_id_number: cleanIdNum || undefined,
              college_verification_status: nextStatus,
              college_submitted_at: hasImage ? nowIso : user.college_submitted_at,
            },
          });
        } catch {
          // non-fatal
        }
      }

      const updatedUser: UserProfile = {
        ...user,
        college_name: cleanCollege,
        college_id_number: cleanIdNum || user.college_id_number,
        college_id_image: privatePath,
        college_verification_status: nextStatus,
        college_submitted_at: hasImage ? nowIso : user.college_submitted_at,
      };
      setUser(updatedUser);

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to submit college ID.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAuthenticated: Boolean(user && session?.access_token),
        isLoading,
        isPasswordRecovery,
        clearPasswordRecovery,
        login,
        signup,
        resendVerificationEmail,
        logout,
        resetPassword,
        updatePassword,
        updateProfile,
        submitCollegeVerification,
        isSupabaseConnected: isSupabaseConfigured,
        supabaseConfigError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
