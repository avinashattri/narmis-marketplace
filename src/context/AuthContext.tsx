import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const hydrateUserFromSupabase = async (
    authUserId: string,
    authEmail: string | undefined,
    userMetadata?: Record<string, any>,
    createdAt?: string
  ): Promise<UserProfile> => {
    let profile: any = null;
    let verification: any = null;

    if (supabase) {
      try {
        const { data: profData, error: profErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUserId)
          .maybeSingle();
        if (!profErr && profData) {
          profile = profData;
        }
      } catch {
        // public.profiles table may not be migrated yet
      }

      try {
        const { data: verifData, error: verifErr } = await supabase
          .from('college_verifications')
          .select('college_name, college_id_number, verification_status, submitted_at, reviewed_at')
          .eq('user_id', authUserId)
          .maybeSingle();
        if (!verifErr && verifData) {
          verification = verifData;
        }
      } catch {
        // public.college_verifications table may not be migrated yet
      }
    }

    const fallbackName =
      profile?.full_name ||
      userMetadata?.full_name ||
      authEmail?.split('@')[0] ||
      'Marketplace Member';

    const resolvedLocation =
      profile?.location && profile.location.trim()
        ? profile.location
        : userMetadata?.location?.trim() || DEFAULT_CAMPUS_LOCATION;

    // College ID verification is independent of authentication:
    // preserve 'Pending Verification', 'Not Submitted', 'Verified', or 'Rejected'
    const verificationStatus: CollegeVerificationStatus =
      (verification?.verification_status as CollegeVerificationStatus) ||
      (profile?.college_verification_status as CollegeVerificationStatus) ||
      (userMetadata?.college_verification_status as CollegeVerificationStatus) ||
      'Not Submitted';

    const formattedJoinDate = createdAt
      ? new Date(createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : 'November 2026';

    return {
      id: authUserId,
      full_name: fallbackName,
      email: authEmail,
      avatar_url:
        profile?.avatar_url ||
        userMetadata?.avatar_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          fallbackName
        )}&background=304943&color=EAD3AA&bold=true&size=150`,
      bio: profile?.bio || userMetadata?.bio || 'Member of NARMIS circular community.',
      location: resolvedLocation,
      college_name:
        verification?.college_name ||
        profile?.college_name ||
        userMetadata?.college_name ||
        DEFAULT_COLLEGE_NAME,
      college_id_number:
        verification?.college_id_number || userMetadata?.college_id_number || undefined,
      college_verification_status: verificationStatus,
      college_submitted_at:
        verification?.submitted_at || userMetadata?.college_submitted_at || undefined,
      college_verified_at:
        verification?.reviewed_at || profile?.college_verified_at || undefined,
      rating: typeof profile?.rating === 'number' ? profile.rating : 5.0,
      review_count: typeof profile?.review_count === 'number' ? profile.review_count : 0,
      joined_date: formattedJoinDate,
    };
  };

  // Strictly synchronize authenticated user state with a genuine Supabase session
  useEffect(() => {
    // Purge any legacy non-Supabase localStorage auth keys from earlier builds
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

    const checkSession = async () => {
      try {
        const {
          data: { session: activeSession },
          error,
        } = await client.auth.getSession();

        if (!isMounted) return;

        if (!error && activeSession?.user && activeSession?.access_token) {
          setSession(activeSession);
          const loaded = await hydrateUserFromSupabase(
            activeSession.user.id,
            activeSession.user.email,
            activeSession.user.user_metadata,
            activeSession.user.created_at
          );
          if (isMounted) setUser(loaded);
        } else {
          // Never preserve a logged-in user after reload if Supabase has no valid session
          setSession(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Supabase auth session error:', err);
        if (isMounted) {
          setSession(null);
          setUser(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    checkSession();

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (event, currentSession) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT' || !currentSession?.user || !currentSession?.access_token) {
        setSession(null);
        setUser(null);
        return;
      }

      setSession(currentSession);
      const loaded = await hydrateUserFromSupabase(
        currentSession.user.id,
        currentSession.user.email,
        currentSession.user.user_metadata,
        currentSession.user.created_at
      );
      if (isMounted) setUser(loaded);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password?: string): Promise<AuthActionResult> => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error:
          supabaseConfigError ||
          'Supabase authentication is not configured. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file or Netlify environment variables.',
      };
    }

    if (!trimmedEmail || !password) {
      return {
        success: false,
        error: 'Please enter both your email address and password.',
      };
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        const errCode = (error as any).code || '';
        const errMsg = error.message || 'Authentication failed.';

        // Never treat email_not_confirmed as an authenticated login
        if (errCode === 'email_not_confirmed' || /email not confirmed/i.test(errMsg)) {
          setSession(null);
          setUser(null);
          return {
            success: false,
            code: 'email_not_confirmed',
            error:
              'Your email address has not been confirmed yet. Please click the confirmation link sent to your email inbox (or disable "Confirm email" in Supabase Dashboard → Authentication → Providers → Email for development).',
          };
        }

        if (
          errCode === 'over_email_send_rate_limit' ||
          error.status === 429 ||
          /rate limit/i.test(errMsg)
        ) {
          setSession(null);
          setUser(null);
          return {
            success: false,
            code: 'over_email_send_rate_limit',
            error:
              'Too many requests. Please wait a few minutes before trying again.',
          };
        }

        if (errCode === 'invalid_credentials' || /invalid login credentials/i.test(errMsg)) {
          setSession(null);
          setUser(null);
          return {
            success: false,
            code: 'invalid_credentials',
            error: 'Invalid email or password. Please check your credentials and try again.',
          };
        }

        setSession(null);
        setUser(null);
        return {
          success: false,
          code: errCode,
          error: errMsg,
        };
      }

      // Require a genuine Supabase session (with access_token) and user before authenticating
      if (data.session?.access_token && data.user) {
        setSession(data.session);
        const loadedUser = await hydrateUserFromSupabase(
          data.user.id,
          data.user.email,
          data.user.user_metadata,
          data.user.created_at
        );
        setUser(loadedUser);
        return { success: true };
      }

      setSession(null);
      setUser(null);
      return {
        success: false,
        error: 'Supabase did not return a valid authenticated session.',
      };
    } catch (err: any) {
      setSession(null);
      setUser(null);
      return {
        success: false,
        error: err?.message || 'Login failed due to a network or server error.',
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (payload: SignupPayload): Promise<AuthActionResult> => {
    const trimmedEmail = payload.email.trim().toLowerCase();
    const cleanName = payload.fullName.trim();
    const cleanCollege = payload.collegeName?.trim() || DEFAULT_COLLEGE_NAME;
    const cleanCollegeId = payload.collegeIdNumber?.trim() || '';
    const cleanLocation = payload.location?.trim() || DEFAULT_CAMPUS_LOCATION;
    const hasUploadedIdImage = Boolean(payload.collegeIdImageDataUrl);
    // College ID verification is optional and independent of authentication:
    // - Uploading a College ID marks status as 'Pending Verification'
    // - Not uploading a College ID marks status as 'Not Submitted'
    const initialVerificationStatus: CollegeVerificationStatus = hasUploadedIdImage
      ? 'Pending Verification'
      : 'Not Submitted';

    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error:
          supabaseConfigError ||
          'Supabase authentication is not configured. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file or Netlify environment variables.',
      };
    }

    if (!trimmedEmail || !payload.password || !cleanName) {
      return {
        success: false,
        error: 'Full name, email address, and password are required.',
      };
    }

    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      cleanName
    )}&background=304943&color=EAD3AA&bold=true&size=150`;
    const nowIso = new Date().toISOString();

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: payload.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
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
        const errCode = (error as any).code || '';
        const errMsg = error.message || 'Error creating account.';

        // Handle HTTP 429 email rate limits by displaying a clear retry message (no local-only fallback account)
        if (
          errCode === 'over_email_send_rate_limit' ||
          error.status === 429 ||
          /rate limit/i.test(errMsg)
        ) {
          return {
            success: false,
            code: 'over_email_send_rate_limit',
            error:
              'Email rate limit exceeded (HTTP 429). Too many confirmation emails were sent recently. Please wait before retrying, or disable "Confirm email" in Supabase Dashboard → Authentication → Providers → Email during development.',
          };
        }

        return {
          success: false,
          code: errCode,
          error: errMsg,
        };
      }

      if (!data.user) {
        return {
          success: false,
          error: 'Supabase did not return a user record.',
        };
      }

      // Supabase returns an obfuscated user with empty `identities: []` when the email is already registered
      if (Array.isArray(data.user.identities) && data.user.identities.length === 0) {
        return {
          success: false,
          code: 'user_already_exists',
          error:
            'An account with this email address already exists. Please sign in on the Login page.',
        };
      }

      // Only authenticate the user if Supabase returned a genuine session (e.g., when email confirmation is disabled or satisfied)
      const hasValidSession = Boolean(data.session?.access_token);

      if (!hasValidSession) {
        // Do NOT call setUser() without a genuine Supabase session
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
          console.warn('Avatar upload fallback:', avatarErr);
        }
      }

      if (payload.collegeIdImageDataUrl) {
        try {
          storedCollegeIdPath = await uploadPrivateCollegeId(
            payload.collegeIdImageDataUrl,
            data.user.id
          );
        } catch (idErr) {
          console.warn('College ID storage fallback:', idErr);
        }
      }

      if (resolvedAvatarUrl !== defaultAvatar) {
        try {
          await supabase.auth.updateUser({
            data: { avatar_url: resolvedAvatarUrl },
          });
        } catch {
          // ignore metadata update error
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
        joined_date: 'November 2026',
      };

      try {
        await supabase.from('profiles').upsert([
          {
            id: data.user.id,
            full_name: cleanName,
            avatar_url: resolvedAvatarUrl,
            bio: newProfile.bio,
            location: cleanLocation,
            college_name: cleanCollege,
            college_verification_status: initialVerificationStatus,
          },
        ]);

        if (cleanCollegeId || storedCollegeIdPath) {
          await supabase.from('college_verifications').upsert([
            {
              user_id: data.user.id,
              college_name: cleanCollege,
              college_id_number: cleanCollegeId || 'PENDING_NUMBER',
              college_id_image_path: storedCollegeIdPath || null,
              verification_status: initialVerificationStatus,
              submitted_at: hasUploadedIdImage ? nowIso : null,
            },
          ]);
        }
      } catch (profileErr) {
        console.warn('Profile table upsert notice:', profileErr);
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
    } finally {
      setIsLoading(false);
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
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        if (error.status === 429 || /rate limit/i.test(error.message)) {
          return {
            success: false,
            message:
              'Email rate limit reached (HTTP 429). Please wait before requesting another confirmation email, or disable "Confirm email" in Supabase Dashboard during development.',
          };
        }
        return { success: false, message: error.message };
      }

      return {
        success: true,
        message: `Confirmation email resent to ${trimmedEmail}. Please check your inbox and spam folder.`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Failed to resend verification email.',
      };
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    const trimmedEmail = email.trim().toLowerCase();

    try {
      if (!isSupabaseConfigured || !supabase) {
        return {
          success: false,
          message: 'Supabase authentication is not configured.',
        };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) {
        if (error.status === 429 || /rate limit/i.test(error.message)) {
          return {
            success: false,
            message:
              'Email rate limit reached (HTTP 429). Please wait a few minutes before requesting another password reset link.',
          };
        }
        return { success: false, message: error.message };
      }
      return {
        success: true,
        message: 'Password reset link has been dispatched to your email address.',
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to request password reset.' };
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured || !supabase) {
        return {
          success: false,
          message: 'Supabase authentication is not configured.',
        };
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { success: false, message: error.message };

      return { success: true, message: 'Password updated successfully!' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Error updating password.' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
      setSession(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updated: Partial<UserProfile>): Promise<void> => {
    if (!user || !session?.access_token) return;
    const newUser: UserProfile = {
      ...user,
      ...updated,
      college_verification_status: user.college_verification_status,
    };
    setUser(newUser);

    if (isSupabaseConfigured && supabase) {
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
        // ignore if session expired
      }

      try {
        await supabase
          .from('profiles')
          .update({
            full_name: newUser.full_name,
            bio: newUser.bio,
            location: newUser.location,
            avatar_url: newUser.avatar_url,
          })
          .eq('id', user.id);
      } catch (err) {
        console.warn('Supabase profiles update notice:', err);
      }
    }
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
      } else if (submission.collegeIdImageDataUrl) {
        privatePath = submission.collegeIdImageDataUrl;
      }

      const nowIso = new Date().toISOString();

      if (isSupabaseConfigured && supabase) {
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
          // ignore metadata update error
        }

        try {
          await supabase.from('college_verifications').upsert([
            {
              user_id: user.id,
              college_name: cleanCollege,
              college_id_number: cleanIdNum || 'PENDING_NUMBER',
              college_id_image_path: privatePath || null,
              verification_status: nextStatus,
              submitted_at: hasImage ? nowIso : user.college_submitted_at || null,
            },
          ]);
        } catch (dbErr) {
          console.warn('Supabase college_verifications table notice:', dbErr);
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
        // Strictly require BOTH a hydrated user AND a genuine Supabase session token
        isAuthenticated: Boolean(user && session?.access_token),
        isLoading,
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
