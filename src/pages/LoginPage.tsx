import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/common/Logo';
import {
  ArrowRight,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  KeyRound,
  RefreshCw,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    login,
    resetPassword,
    updatePassword,
    resendVerificationEmail,
    isAuthenticated,
    isLoading: isAuthLoading,
    isPasswordRecovery,
    clearPasswordRecovery,
    isSupabaseConnected,
    supabaseConfigError,
  } = useAuth();

  // Redirect destination after successful login
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isResending, setIsResending] = useState(false);

  // Forgot password modal state
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<{
    loading: boolean;
    msg: string;
    isError: boolean;
  } | null>(null);

  // Password recovery (Set New Password) state
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Detect email confirmation / recovery errors or confirmation status in URL query or hash
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const hashParams = new URLSearchParams(location.hash.replace(/^#/, ''));

    const urlError = hashParams.get('error') || searchParams.get('error');
    const urlErrorCode = hashParams.get('error_code') || searchParams.get('error_code');
    const urlErrorDesc =
      hashParams.get('error_description') || searchParams.get('error_description');

    if (urlError || urlErrorDesc) {
      const readable = urlErrorDesc
        ? decodeURIComponent(urlErrorDesc.replace(/\+/g, ' '))
        : 'The authentication link is invalid or has expired. Please request a new one.';
      setErrorMsg(readable);
      setErrorCode(urlErrorCode || urlError || 'auth_link_error');
      return;
    }

    if (searchParams.get('confirmed') === '1' || hashParams.get('type') === 'signup') {
      setSuccessMsg('Email confirmed! Signing you into your NARMIS account...');
    }
  }, [location.search, location.hash]);

  // If already signed in (e.g., after clicking email confirmation link) and NOT resetting password, redirect
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated && !isPasswordRecovery) {
      navigate(from, { replace: true });
    }
  }, [isAuthLoading, isAuthenticated, isPasswordRecovery, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;

    setIsLoading(true);
    setErrorMsg('');
    setErrorCode('');
    setSuccessMsg('');

    try {
      const res = await login(email, password);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setErrorMsg(res.error || 'Invalid email or password.');
        setErrorCode(res.code || '');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email.trim()) return;
    setIsResending(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await resendVerificationEmail(email);
      if (res.success) {
        setSuccessMsg(res.message);
      } else {
        setErrorMsg(res.message);
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;

    setResetStatus({ loading: true, msg: '', isError: false });
    const res = await resetPassword(resetEmail);
    setResetStatus({
      loading: false,
      msg: res.message,
      isError: !res.success,
    });
  };

  const handleUpdatePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await updatePassword(newPassword);
      if (res.success) {
        setSuccessMsg(res.message);
        setNewPassword('');
        setConfirmNewPassword('');
        navigate('/dashboard', { replace: true });
      } else {
        setErrorMsg(res.message);
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="pt-28 pb-20 bg-narmis-bg min-h-screen flex items-center justify-center px-4 text-narmis-cream">
      <div className="w-full max-w-md bg-narmis-surface rounded-3xl p-8 sm:p-10 border border-narmis-mountain/60 shadow-2xl relative">
        <div className="text-center mb-8">
          <Logo variant="cream" className="justify-center inline-block mb-3" />
          <h1 className="font-serif text-2xl font-bold text-narmis-parchment">
            {isPasswordRecovery ? 'Set a New Password' : 'Welcome to NARMIS'}
          </h1>
          <p className="text-xs text-narmis-cream/70 mt-1">
            {isPasswordRecovery
              ? 'Choose a strong new password for your NARMIS account.'
              : 'Sign in to manage your rentals, listings, and trade negotiations.'}
          </p>
        </div>

        {!isSupabaseConnected && supabaseConfigError && (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-950/70 border border-amber-500/60 text-amber-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{supabaseConfigError}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-950/70 border border-red-500/60 text-red-200 text-xs space-y-2.5">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
            {errorCode === 'email_not_confirmed' && email.trim() && (
              <div className="pt-1 pl-6">
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={isResending}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-narmis-gold text-narmis-charcoal font-bold text-[11px] uppercase tracking-wider hover:bg-narmis-accent transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                  <span>{isResending ? 'Sending...' : 'Resend Confirmation Email'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-200 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {isPasswordRecovery ? (
          <form onSubmit={handleUpdatePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                New Password (min. 6 characters) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-narmis-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  minLength={6}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs sm:text-sm text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-narmis-cream/60 hover:text-narmis-gold p-1"
                  title={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                Confirm New Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-narmis-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs sm:text-sm text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold"
                  required
                />
              </div>
            </div>

            <div className="pt-2 space-y-2.5">
              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="w-full py-3.5 rounded-2xl bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {isUpdatingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Update Password</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  clearPasswordRecovery();
                  setErrorMsg('');
                  navigate('/login', { replace: true });
                }}
                className="w-full py-2.5 rounded-2xl bg-narmis-mountain/50 hover:bg-narmis-mountain text-narmis-cream text-xs font-medium transition-colors"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-narmis-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs sm:text-sm text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80">
                  Password *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setIsForgotPasswordOpen(true);
                    setResetStatus(null);
                  }}
                  className="text-[11px] text-narmis-gold hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-narmis-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs sm:text-sm text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-narmis-cream/60 hover:text-narmis-gold p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal text-xs font-bold uppercase tracking-wider transition-all shadow-lg hover:scale-[1.01] active:scale-98 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to NARMIS</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {!isPasswordRecovery && (
          <div className="mt-6 text-center text-xs text-narmis-cream/60">
            <span>Don&apos;t have an account yet? </span>
            <Link to="/signup" className="text-narmis-gold font-bold hover:underline">
              Create an Account
            </Link>
          </div>
        )}
      </div>

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-narmis-surface border border-narmis-mountain w-full max-w-sm rounded-3xl p-6 sm:p-8 shadow-2xl relative text-narmis-cream space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-narmis-mountain/60 text-narmis-gold">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-narmis-parchment">
                  Reset Password
                </h3>
                <p className="text-xs text-narmis-cream/60">
                  Enter your email to receive recovery instructions.
                </p>
              </div>
            </div>

            {resetStatus && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                  resetStatus.isError
                    ? 'bg-red-950/70 border border-red-500/60 text-red-200'
                    : 'bg-emerald-950/70 border border-emerald-500/60 text-emerald-200'
                }`}
              >
                {resetStatus.isError ? (
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <span>{resetStatus.msg}</span>
              </div>
            )}

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                  Your Account Email
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs sm:text-sm text-narmis-cream focus:outline-none focus:border-narmis-gold"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(false)}
                  className="px-4 py-2 rounded-xl bg-narmis-mountain text-narmis-cream text-xs font-medium hover:bg-narmis-mountain/80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetStatus?.loading}
                  className="px-5 py-2 rounded-xl bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal text-xs font-bold uppercase tracking-wider transition-all"
                >
                  {resetStatus?.loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
