import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Logo } from '../components/common/Logo';
import { validateImageFile } from '../services/conditionOptions';
import {
  DEFAULT_CAMPUS_LOCATION,
  DEFAULT_COLLEGE_NAME,
  formatApproximateLocation,
} from '../services/locationDefaults';
import {
  ArrowRight,
  ArrowLeft,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Loader2,
  GraduationCap,
  IdCard,
  Upload,
  X,
  MapPin,
  Camera,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup, resendVerificationEmail } = useAuth();

  // Multi-step wizard (1 = Account, 2 = College Info, 3 = Profile & Location)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Account Details
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Step 2: College Information
  const [collegeName, setCollegeName] = useState(DEFAULT_COLLEGE_NAME);
  const [collegeIdNumber, setCollegeIdNumber] = useState('');
  const [collegeIdPreview, setCollegeIdPreview] = useState<string | undefined>(undefined);
  const collegeIdInputRef = useRef<HTMLInputElement>(null);

  // Step 3: Profile & Location
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [location, setLocation] = useState(DEFAULT_CAMPUS_LOCATION);
  const [isLocating, setIsLocating] = useState(false);
  const [locationNotice, setLocationNotice] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [verificationNotice, setVerificationNotice] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendFeedback, setResendFeedback] = useState<{ msg: string; isError: boolean } | null>(
    null
  );

  const handleResendVerification = async () => {
    if (!email.trim()) return;
    setIsResending(true);
    setResendFeedback(null);
    try {
      const res = await resendVerificationEmail(email);
      setResendFeedback({ msg: res.message, isError: !res.success });
    } finally {
      setIsResending(false);
    }
  };

  const readFileAsDataUrl = (file: File, onLoaded: (dataUrl: string) => void) => {
    const check = validateImageFile(file);
    if (check) {
      setErrorMsg(check);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setErrorMsg('');
        onLoaded(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCollegeIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      readFileAsDataUrl(file, setCollegeIdPreview);
    }
    e.target.value = '';
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      readFileAsDataUrl(file, setAvatarPreview);
    }
    e.target.value = '';
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser. Please enter your location manually.');
      return;
    }
    setIsLocating(true);
    setErrorMsg('');
    setLocationNotice('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (res.ok) {
            const data = await res.json();
            const approx = formatApproximateLocation(data.address || {});
            setLocation(approx);
            setLocationNotice(`Detected approximate area: ${approx}`);
          } else {
            setLocation(DEFAULT_CAMPUS_LOCATION);
            setLocationNotice('Could not resolve address; campus suggestion kept.');
          }
        } catch {
          setLocation(DEFAULT_CAMPUS_LOCATION);
          setLocationNotice('Location service unavailable; edit location manually below.');
        } finally {
          setIsLocating(false);
        }
      },
      (geoErr) => {
        setIsLocating(false);
        if (geoErr.code === geoErr.PERMISSION_DENIED) {
          setErrorMsg('Location permission denied. You can edit your location manually below.');
        } else {
          setErrorMsg('Unable to detect location. Please type your city or campus manually.');
        }
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  const handleNextStep = () => {
    setErrorMsg('');
    if (step === 1) {
      if (!fullName.trim() || !email.trim() || !password) {
        setErrorMsg('Please fill in your full name, email address, and password.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password) {
      setStep(1);
      setErrorMsg('Please complete all required account fields.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await signup({
        fullName,
        email,
        password,
        collegeName: collegeName.trim() || DEFAULT_COLLEGE_NAME,
        collegeIdNumber: collegeIdNumber.trim() || undefined,
        collegeIdImageDataUrl: collegeIdPreview,
        avatarDataUrl: avatarPreview,
        location: location.trim() || DEFAULT_CAMPUS_LOCATION,
      });

      if (res.success) {
        if (res.needsEmailVerification) {
          setVerificationNotice(true);
        } else {
          navigate('/dashboard');
        }
      } else {
        setErrorMsg(res.error || 'Failed to create account.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error signing up.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-20 bg-narmis-bg min-h-screen flex items-center justify-center px-4 text-narmis-cream">
      <div className="w-full max-w-lg bg-narmis-surface rounded-3xl p-6 sm:p-10 border border-narmis-mountain/60 shadow-2xl relative">
        <div className="text-center mb-6">
          <Logo variant="cream" className="justify-center inline-block mb-3" />
          <h1 className="font-serif text-2xl font-bold text-narmis-parchment">
            Join the NARMIS Circle
          </h1>
          <p className="text-xs text-narmis-cream/70 mt-1">
            Rent, trade, and purchase sustainably across your campus community.
          </p>
        </div>

        {/* Clean Multi-Step Progress Bar */}
        {!verificationNotice && (
          <div className="mb-6">
            <div className="grid grid-cols-3 gap-2 text-[11px] font-semibold">
              {[
                { num: 1, label: 'Account' },
                { num: 2, label: 'College ID (Optional)' },
                { num: 3, label: 'Profile & Area' },
              ].map((s) => (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => {
                    if (s.num < step) {
                      setErrorMsg('');
                      setStep(s.num as 1 | 2 | 3);
                    }
                  }}
                  className={`py-2 px-2 rounded-xl border text-center transition-all ${
                    step === s.num
                      ? 'bg-narmis-gold text-narmis-charcoal border-narmis-gold font-bold shadow-sm'
                      : step > s.num
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 cursor-pointer'
                      : 'bg-narmis-forestDark/70 text-narmis-cream/50 border-narmis-mountain/50 cursor-default'
                  }`}
                >
                  {s.num}. {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-500/60 text-red-200 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {verificationNotice ? (
          <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl font-bold text-narmis-parchment">
              Verify Your Email
            </h3>
            <p className="text-xs text-narmis-cream/80 leading-relaxed">
              Your account has been created in Supabase and a confirmation link was sent to{' '}
              <strong className="text-narmis-parchment">{email}</strong>. Because email
              confirmation is enabled in your Supabase Auth settings, you must confirm your email
              before logging in (or disable <strong>&ldquo;Confirm email&rdquo;</strong> in{' '}
              <strong>Supabase Dashboard &rarr; Authentication &rarr; Providers &rarr; Email</strong>).
              {collegeIdPreview && (
                <span className="block mt-2 text-amber-300">
                  Note: Once signed in, you can review or upload your College ID status in Dashboard
                  Settings.
                </span>
              )}
            </p>
            {resendFeedback && (
              <div
                className={`p-3 rounded-xl text-xs text-left ${
                  resendFeedback.isError
                    ? 'bg-red-950/70 border border-red-500/60 text-red-200'
                    : 'bg-emerald-950/70 border border-emerald-500/60 text-emerald-200'
                }`}
              >
                {resendFeedback.msg}
              </div>
            )}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={isResending}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-narmis-mountain hover:bg-narmis-mountain/80 text-narmis-parchment text-xs font-semibold transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
                <span>{isResending ? 'Resending...' : 'Resend Confirmation Email'}</span>
              </button>
              <Link
                to="/login"
                className="inline-block px-6 py-2.5 rounded-full bg-narmis-gold text-narmis-charcoal text-xs font-bold uppercase tracking-wider hover:bg-narmis-accent transition-all"
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* STEP 1: ACCOUNT DETAILS */}
            {step === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-narmis-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs sm:text-sm text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-narmis-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@chitkara.edu.in"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs sm:text-sm text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                    Password (min. 6 characters) *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-narmis-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
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

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-narmis-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      minLength={6}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs sm:text-sm text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full py-3.5 rounded-2xl bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>Continue to College Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: COLLEGE INFORMATION (OPTIONAL) */}
            {step === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-narmis-forestDark/80 border border-narmis-gold/30 text-[11px] text-narmis-cream/85">
                  <span>
                    <strong className="text-narmis-gold">Optional Step:</strong> You can verify your
                    College ID now or skip and complete it later from Dashboard Settings.
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setStep(3);
                    }}
                    className="shrink-0 px-3 py-1 rounded-lg bg-narmis-mountain hover:bg-narmis-gold hover:text-narmis-charcoal text-narmis-parchment font-bold transition-colors"
                  >
                    Skip Step
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                    College / University Name (Optional)
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-narmis-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={collegeName}
                      onChange={(e) => setCollegeName(e.target.value)}
                      placeholder={DEFAULT_COLLEGE_NAME}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs sm:text-sm text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                    College ID / Roll Number (Optional)
                  </label>
                  <div className="relative">
                    <IdCard className="w-4 h-4 text-narmis-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={collegeIdNumber}
                      onChange={(e) => setCollegeIdNumber(e.target.value)}
                      placeholder="e.g. 231099XXXX"
                      maxLength={40}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs sm:text-sm text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold"
                    />
                  </div>
                  <p className="text-[11px] text-narmis-cream/60 mt-1">
                    Your full ID number is kept confidential and never shown on public profiles.
                  </p>
                </div>

                {/* Upload College ID (Optional) */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                    Upload College ID (Optional)
                  </label>
                  <input
                    ref={collegeIdInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleCollegeIdChange}
                    className="hidden"
                  />

                  {collegeIdPreview ? (
                    <div className="p-3 rounded-2xl bg-narmis-forestDark border border-narmis-gold/40 space-y-3">
                      <div className="relative rounded-xl overflow-hidden bg-black/30 max-h-44 flex items-center justify-center">
                        <img
                          src={collegeIdPreview}
                          alt="College ID Preview"
                          className="max-h-44 w-auto object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => setCollegeIdPreview(undefined)}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-red-950/90 text-red-200 hover:bg-red-800 transition-colors"
                          title="Remove College ID"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-amber-300 font-semibold">
                          Status upon signup: Pending Verification
                        </span>
                        <button
                          type="button"
                          onClick={() => collegeIdInputRef.current?.click()}
                          className="text-narmis-gold hover:underline font-semibold"
                        >
                          Replace Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => collegeIdInputRef.current?.click()}
                      className="w-full p-5 rounded-2xl border-2 border-dashed border-narmis-mountain/70 hover:border-narmis-gold/70 bg-narmis-forestDark/60 text-center transition-all group"
                    >
                      <Upload className="w-6 h-6 text-narmis-gold mx-auto mb-1.5 group-hover:scale-110 transition-transform" />
                      <span className="block text-xs font-semibold text-narmis-parchment">
                        Upload College ID Card Image
                      </span>
                      <span className="block text-[11px] text-narmis-cream/60 mt-0.5">
                        JPG, PNG or WebP (max 8 MB) · Stored privately for verification review
                      </span>
                    </button>
                  )}

                  <div className="mt-2 p-2.5 rounded-xl bg-narmis-forestDark/70 border border-narmis-mountain/40 text-[11px] text-narmis-cream/70 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-narmis-gold shrink-0 mt-0.5" />
                    <span>
                      Uploading a College ID is optional and marks your badge status as{' '}
                      <strong className="text-amber-300">Pending Verification</strong> until an
                      administrator reviews it. Pending Verification never blocks login or account
                      access. IDs are stored privately and never shown publicly.
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setStep(1);
                    }}
                    className="w-1/3 py-3 rounded-2xl bg-narmis-mountain/60 hover:bg-narmis-mountain text-narmis-cream text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-2/3 py-3 rounded-2xl bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal text-xs font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>Continue to Profile</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PROFILE & LOCATION */}
            {step === 3 && (
              <div className="space-y-4 animate-fadeIn">
                {/* Optional Profile Picture */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-2">
                    Profile Picture (Optional)
                  </label>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />

                  <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-narmis-forestDark/80 border border-narmis-mountain/60">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-narmis-surface border-2 border-narmis-gold/50 flex items-center justify-center shrink-0">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera className="w-6 h-6 text-narmis-gold/70" />
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <p className="text-xs text-narmis-parchment font-medium">
                        {avatarPreview ? 'Custom photo selected' : 'Add a friendly profile avatar'}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => avatarInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-narmis-mountain hover:bg-narmis-mountain/80 text-narmis-parchment text-[11px] font-semibold transition-colors"
                        >
                          {avatarPreview ? 'Replace Photo' : 'Choose Photo'}
                        </button>
                        {avatarPreview && (
                          <button
                            type="button"
                            onClick={() => setAvatarPreview(undefined)}
                            className="px-2.5 py-1.5 rounded-xl bg-red-950/60 text-red-300 text-[11px] font-semibold hover:bg-red-900/60"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Campus / Neighborhood Location */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80">
                      Preferred Area / Location
                    </label>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isLocating}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-narmis-gold hover:text-narmis-accent transition-colors"
                    >
                      {isLocating ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Detecting...</span>
                        </>
                      ) : (
                        <>
                          <MapPin className="w-3 h-3" />
                          <span>Use My Current Location</span>
                        </>
                      )}
                    </button>
                  </div>

                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={DEFAULT_CAMPUS_LOCATION}
                    className="w-full px-4 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs sm:text-sm text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold"
                  />

                  {locationNotice && (
                    <p className="text-[11px] text-emerald-300 mt-1">{locationNotice}</p>
                  )}

                  <p className="text-[11px] text-narmis-cream/60 mt-1">
                    Suggested starting point: Chitkara University, Rajpura, Punjab, India. You may
                    edit this freely; exact GPS coordinates are never published.
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg('');
                      setStep(2);
                    }}
                    className="w-1/3 py-3.5 rounded-2xl bg-narmis-mountain/60 hover:bg-narmis-mountain text-narmis-cream text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-2/3 py-3.5 rounded-2xl bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal text-xs font-bold uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}

        <div className="mt-6 text-center text-xs text-narmis-cream/60">
          <span>Already registered? </span>
          <Link to="/login" className="text-narmis-gold font-bold hover:underline">
            Log In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
