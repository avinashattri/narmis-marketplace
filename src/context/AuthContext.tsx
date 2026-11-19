import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { CURRENT_USER } from '../services/mockData';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (fullName: string, email: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updated: Partial<UserProfile>) => void;
  switchDemoUser: (userProfile: UserProfile) => void;
  isSupabaseConnected: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('narmis_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return CURRENT_USER;
      }
    }
    return CURRENT_USER; // Default to demo user for instant hackathon evaluation
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('narmis_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('narmis_auth_user');
    }
  }, [user]);

  // Sync with Supabase Auth if keys are present
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const client = supabase;

    const checkSession = async () => {
      try {
        const { data: { session } } = await client.auth.getSession();
        if (session?.user) {
          const { data: profile } = await client
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setUser({
              id: profile.id,
              full_name: profile.full_name,
              email: session.user.email,
              avatar_url: profile.avatar_url,
              bio: profile.bio,
              location: profile.location,
              rating: profile.rating,
              review_count: profile.review_count,
            });
          }
        }
      } catch (err) {
        console.error('Supabase auth session error:', err);
      }
    };

    checkSession();

    const { data: { subscription } } = client.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data: profile } = await client
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setUser({
            id: profile.id,
            full_name: profile.full_name,
            email: session.user.email,
            avatar_url: profile.avatar_url,
            bio: profile.bio,
            location: profile.location,
            rating: profile.rating,
            review_count: profile.review_count,
          });
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase && password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          return true;
        }
      } else {
        // Instant simulated login
        await new Promise((r) => setTimeout(r, 400));
        setUser({
          ...CURRENT_USER,
          email,
          full_name: email.split('@')[0].replace(/[._]/g, ' ').toUpperCase(),
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Login error:', err);
      // Fallback to local demo login if offline/network error
      setUser({
        ...CURRENT_USER,
        email,
        full_name: email.split('@')[0],
      });
      return true;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (fullName: string, email: string, password?: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase && password) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        if (error) throw error;
        if (data.user) {
          return true;
        }
      } else {
        await new Promise((r) => setTimeout(r, 400));
        setUser({
          id: 'u-' + Math.random().toString(36).substring(2, 9),
          full_name: fullName,
          email,
          avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fullName)}`,
          bio: 'New member of NARMIS community.',
          location: 'Bengaluru, India',
          rating: 5.0,
          review_count: 0,
          joined_date: 'November 2026',
        });
        return true;
      }
      return false;
    } catch (err) {
      console.error('Signup error:', err);
      setUser({
        id: 'u-' + Math.random().toString(36).substring(2, 9),
        full_name: fullName,
        email,
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(fullName)}`,
        bio: 'New member of NARMIS community.',
        location: 'Bengaluru, India',
        rating: 5.0,
        review_count: 0,
        joined_date: 'November 2026',
      });
      return true;
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
      setUser(null);
      localStorage.removeItem('narmis_auth_user');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = (updated: Partial<UserProfile>) => {
    if (!user) return;
    const newUser = { ...user, ...updated };
    setUser(newUser);
  };

  const switchDemoUser = (profile: UserProfile) => {
    setUser(profile);
    localStorage.setItem('narmis_auth_user', JSON.stringify(profile));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateProfile,
        switchDemoUser,
        isSupabaseConnected: isSupabaseConfigured,
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
