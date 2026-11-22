import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { useToast } from '../context/ToastContext';
import { PaymentQRDisplay } from '../components/marketplace/PaymentQRDisplay';
import {
  Repeat,
  ShieldCheck,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Calendar,
  Lock,
  RefreshCw,
  Shield,
  Loader2,
} from 'lucide-react';

export const SubscriptionPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const {
    tradeAccess,
    isLoadingTradeAccess,
    isAdmin,
    subscriptionPayments,
    adminSubscriptionPayments,
    refreshTradeAccess,
    refreshAdminSubscriptionPayments,
    recordSubscriptionPaymentSubmission,
    reviewSubscriptionPayment,
  } = useMarketplace();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [paymentReference, setPaymentReference] = useState('');
  const [hasCompletedPayment, setHasCompletedPayment] = useState(false);
  const [isSubmittingUpi, setIsSubmittingUpi] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Admin panel state
  const [adminFilter, setAdminFilter] = useState<'Pending Verification' | 'ALL' | 'Approved' | 'Rejected'>(
    'Pending Verification'
  );
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({});
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [isLoadingAdminList, setIsLoadingAdminList] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      refreshTradeAccess();
    }
  }, [isAuthenticated, refreshTradeAccess]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      setIsLoadingAdminList(true);
      refreshAdminSubscriptionPayments(adminFilter === 'ALL' ? undefined : adminFilter)
        .catch((err) => console.warn('[NARMIS] admin list error:', err))
        .finally(() => setIsLoadingAdminList(false));
    }
  }, [isAuthenticated, isAdmin, adminFilter, refreshAdminSubscriptionPayments]);

  const handleRefreshStatus = async () => {
    setIsRefreshing(true);
    try {
      await refreshTradeAccess();
      if (isAdmin) {
        await refreshAdminSubscriptionPayments(adminFilter === 'ALL' ? undefined : adminFilter);
      }
      showToast('Synced latest Trade Pass & payment status from Supabase.', 'info');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUpiSubscriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!hasCompletedPayment) {
      setErrorMsg('Please confirm that you have completed the ₹299 UPI payment before submitting.');
      return;
    }
    if (!paymentReference.trim() || paymentReference.trim().length < 6) {
      setErrorMsg('Please enter a valid UPI Transaction ID / UTR reference (minimum 6 characters).');
      return;
    }

    setErrorMsg('');
    setIsSubmittingUpi(true);
    try {
      const payment = await recordSubscriptionPaymentSubmission({
        paymentReference: paymentReference.trim(),
      });
      setSubmittedRef(payment.provider_order_id);
      setPaymentReference('');
      setHasCompletedPayment(false);
      showToast(
        'UPI payment reference saved in Supabase with Pending Verification status.',
        'success'
      );
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to submit payment reference.');
    } finally {
      setIsSubmittingUpi(false);
    }
  };

  const handleAdminDecision = async (paymentId: string, decision: 'approve' | 'reject') => {
    setReviewingId(paymentId);
    try {
      await reviewSubscriptionPayment({
        paymentId,
        decision,
        rejectionReason: decision === 'reject' ? rejectionReasons[paymentId] : undefined,
      });
      showToast(
        decision === 'approve'
          ? 'Payment approved! Annual Trade Pass activated for 365 days.'
          : 'Payment submission rejected. Subscription was not activated.',
        decision === 'approve' ? 'success' : 'info'
      );
    } catch (err: any) {
      showToast(err?.message || 'Unable to process admin review.', 'error');
    } finally {
      setReviewingId(null);
    }
  };

  const formattedExpiry = tradeAccess.subscription_expires_at
    ? new Date(tradeAccess.subscription_expires_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  const getDynamicStatusHeadline = () => {
    if (isLoadingTradeAccess) return 'Checking live Trade Pass status...';
    if (tradeAccess.subscription_active) {
      return `Trade Pass Active — Expires ${formattedExpiry}`;
    }
    if (tradeAccess.free_trials_remaining === 3) return '3 free offers remaining';
    if (tradeAccess.free_trials_remaining === 2) return '2 free offers remaining';
    if (tradeAccess.free_trials_remaining === 1) return '1 free offer remaining';
    return 'Free offers exhausted — Upgrade to Trade Pass';
  };

  const hasPendingPayment = subscriptionPayments.some(
    (p) => p.verification_status === 'Pending Verification'
  );

  return (
    <div className="pt-28 pb-24 bg-narmis-bg min-h-screen text-narmis-cream">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-950/80 text-amber-200 border border-amber-600/40">
              <Repeat className="w-3.5 h-3.5" />
              NARMIS TRADE PASS
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-black text-narmis-parchment mt-2">
              Free Trade Trials & ₹299/Year Trade Pass
            </h1>
            <p className="text-xs sm:text-sm text-narmis-cream/75 mt-1">
              Every member gets 3 free trade offers. Upgrade via the NARMIS UPI QR code for 365 days
              of unlimited peer-to-peer trading — with manual administrator verification and zero
              automatic recurring charges.
            </p>
          </div>

          {isAuthenticated && (
            <button
              type="button"
              onClick={handleRefreshStatus}
              disabled={isRefreshing}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-narmis-surface hover:bg-narmis-mountain border border-narmis-mountain text-xs font-semibold text-narmis-parchment transition-all"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-narmis-gold ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span>Refresh Status</span>
            </button>
          )}
        </div>

        {/* Dynamic Subscription & Trial Status Card */}
        <div className="bg-narmis-surface rounded-3xl p-6 sm:p-8 border border-narmis-mountain/60 shadow-xl">
          {!isAuthenticated || !user ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <h2 className="font-serif text-xl font-bold text-narmis-parchment">
                  Sign in to view your Trade Pass & free offer balance
                </h2>
                <p className="text-xs text-narmis-cream/70">
                  Your 3 free trade offers and ₹299 annual Trade Pass status are tracked securely in
                  Supabase across all your devices.
                </p>
              </div>
              <Link
                to="/login"
                className="px-6 py-3 rounded-full bg-narmis-gold text-narmis-charcoal text-xs font-bold uppercase tracking-wider hover:bg-narmis-accent transition-all shrink-0"
              >
                Sign In to Continue
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Free Offers Counter */}
              <div className="p-5 rounded-2xl bg-narmis-forestDark border border-narmis-mountain/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80">
                    Free Trade Offers
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      tradeAccess.free_trials_remaining > 0
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {isLoadingTradeAccess
                      ? '...'
                      : `${tradeAccess.free_trials_remaining} of ${tradeAccess.free_trials_total} left`}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-3xl font-black text-narmis-parchment">
                    {isLoadingTradeAccess ? '—' : tradeAccess.free_trials_remaining}
                  </span>
                  <span className="text-xs text-narmis-cream/60">
                    remaining ({tradeAccess.free_trials_used} used)
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[1, 2, 3].map((slot) => {
                    const isUsed = slot <= tradeAccess.free_trials_used;
                    return (
                      <div
                        key={slot}
                        className={`h-2.5 rounded-full transition-all ${
                          isUsed
                            ? 'bg-narmis-mountain/60 border border-narmis-mountain'
                            : 'bg-narmis-gold shadow-sm'
                        }`}
                        title={isUsed ? `Offer ${slot}: Used` : `Offer ${slot}: Available`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Annual Subscription Status */}
              <div className="p-5 rounded-2xl bg-narmis-forestDark border border-narmis-mountain/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80">
                    NARMIS Trade Pass
                  </span>
                  {tradeAccess.subscription_active ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                      Active
                    </span>
                  ) : hasPendingPayment ? (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-950 text-amber-300 border border-amber-500/40">
                      Pending Verification
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-narmis-surface text-narmis-cream/70 border border-narmis-mountain">
                      Not Active
                    </span>
                  )}
                </div>

                <div className="font-serif text-xl font-bold text-narmis-parchment">
                  {tradeAccess.subscription_active ? 'Trade Pass Active' : '₹299 / Year'}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-narmis-cream/70">
                  <Calendar className="w-3.5 h-3.5 text-narmis-gold shrink-0" />
                  <span>
                    {formattedExpiry
                      ? `Valid until ${formattedExpiry}`
                      : '365 days upon admin approval'}
                  </span>
                </div>
              </div>

              {/* Live Eligibility Summary */}
              <div className="p-5 rounded-2xl bg-narmis-forestDark border border-narmis-gold/40 space-y-2.5">
                <div className="flex items-center gap-2">
                  {tradeAccess.can_trade ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                  )}
                  <span className="font-serif text-base font-bold text-narmis-parchment">
                    {getDynamicStatusHeadline()}
                  </span>
                </div>
                <p className="text-xs text-narmis-cream/75 leading-relaxed">
                  {tradeAccess.subscription_active
                    ? 'You can propose unlimited peer-to-peer trades across NARMIS.'
                    : tradeAccess.free_trials_remaining > 0
                    ? 'You can still propose free trades. Upgrade anytime via UPI QR with zero recurring charges.'
                    : 'Submit your ₹299 UPI payment reference below. An administrator will verify and activate your 365-day Trade Pass.'}
                </p>
                <Link
                  to="/trade"
                  className="inline-flex items-center gap-1 text-xs font-bold text-narmis-gold hover:underline"
                >
                  <span>Browse Trade Listings</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Main Two-Column Plan + UPI QR Submission */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Plan Details & User's Payment Submissions (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-narmis-surface rounded-3xl p-6 sm:p-7 border border-narmis-gold/40 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-narmis-gold">
                    Annual Trade Membership
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-narmis-parchment">
                    NARMIS TRADE PASS
                  </h2>
                </div>
                <div className="text-right">
                  <span className="font-serif text-3xl font-black text-narmis-gold">₹299</span>
                  <span className="block text-[11px] text-narmis-cream/60">per year</span>
                </div>
              </div>

              <ul className="space-y-3 text-xs text-narmis-cream/85">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>3 FREE trade offers</strong> for every user account.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    After using all 3 free offers, unlock <strong>365 days of unlimited trades</strong>{' '}
                    for ₹299/year.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>No recurring automatic charges</strong> — renew manually only when you
                    choose to.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-narmis-gold shrink-0 mt-0.5" />
                  <span>
                    <strong>Direct NARMIS UPI QR payment</strong> verified manually by an
                    administrator before activation.
                  </span>
                </li>
              </ul>
            </div>

            {/* User's Payment Verification History */}
            {isAuthenticated && (
              <div className="bg-narmis-surface rounded-3xl p-6 border border-narmis-mountain/60 space-y-3">
                <h3 className="font-serif text-base font-bold text-narmis-parchment flex items-center gap-2">
                  <Clock className="w-4 h-4 text-narmis-gold" />
                  <span>Your Payment Verification Status</span>
                </h3>

                {subscriptionPayments.length === 0 ? (
                  <p className="text-xs text-narmis-cream/65 leading-relaxed">
                    No Trade Pass payment submissions recorded yet. After scanning the UPI QR code
                    and paying ₹299, submit your UPI transaction reference on the right.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {subscriptionPayments.map((sp) => (
                      <div
                        key={sp.id}
                        className="p-3.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/50 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono font-bold text-narmis-parchment">
                            {sp.provider_order_id}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              sp.verification_status === 'Approved'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                : sp.verification_status === 'Rejected'
                                ? 'bg-red-950 text-red-300 border border-red-500/40'
                                : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {sp.verification_status}
                          </span>
                        </div>

                        <p className="text-[11px] text-narmis-cream/70">
                          UPI Ref:{' '}
                          <strong className="font-mono text-narmis-gold">
                            {sp.upi_reference || sp.provider_payment_id || 'N/A'}
                          </strong>{' '}
                          · ₹{(sp.amount_paise / 100).toLocaleString('en-IN')}
                        </p>

                        <p className="text-[11px] text-narmis-cream/55">
                          Submitted: {new Date(sp.created_at).toLocaleString('en-IN')}
                        </p>

                        {sp.verification_status === 'Approved' && sp.period_end && (
                          <p className="text-[11px] text-emerald-300 font-medium">
                            Active for 365 days (until{' '}
                            {new Date(sp.period_end).toLocaleDateString('en-IN')})
                          </p>
                        )}

                        {sp.verification_status === 'Rejected' && (
                          <p className="text-[11px] text-red-300">
                            Reason:{' '}
                            {sp.rejection_reason ||
                              'Payment reference could not be verified. Subscription not activated.'}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Existing NARMIS UPI QR & Reference Submission (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-narmis-surface rounded-3xl p-6 sm:p-8 border border-narmis-mountain/60 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-narmis-mountain/40 pb-4">
                <div>
                  <h2 className="font-serif text-xl font-bold text-narmis-parchment">
                    Pay ₹299 via NARMIS UPI QR Code
                  </h2>
                  <p className="text-xs text-narmis-cream/70 mt-0.5">
                    Scan the QR code with any UPI app, pay ₹299, and submit your UPI transaction
                    reference below for administrator verification.
                  </p>
                </div>
                <Lock className="w-5 h-5 text-narmis-gold shrink-0" />
              </div>

              {submittedRef ? (
                <div className="p-6 rounded-2xl bg-amber-950/30 border border-amber-500/40 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center mx-auto">
                    <Clock className="w-7 h-7" />
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 text-amber-200 border border-amber-500/40 text-[11px] font-bold uppercase">
                    <Clock className="w-3 h-3" />
                    <span>Pending Verification</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-narmis-parchment">
                    UPI Payment Reference Submitted
                  </h3>
                  <p className="text-xs text-narmis-cream/80 max-w-md mx-auto leading-relaxed">
                    Your ₹299 Trade Pass submission (
                    <strong className="text-narmis-gold font-mono">{submittedRef}</strong>) is saved
                    in Supabase with status <strong>Pending Verification</strong>. Once an
                    administrator verifies your UPI transfer, your annual Trade Pass will be
                    activated for 365 days.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmittedRef(null)}
                    className="px-5 py-2 rounded-full bg-narmis-mountain text-narmis-parchment text-xs font-semibold hover:bg-narmis-mountain/80"
                  >
                    Submit Another Reference
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpiSubscriptionSubmit} className="space-y-4">
                  <PaymentQRDisplay amount={299} />

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                      UPI Transaction Reference / 12-Digit UTR Number *
                    </label>
                    <input
                      type="text"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="e.g. 432189654321"
                      maxLength={80}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold font-mono"
                      required
                    />
                  </div>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl bg-narmis-forestDark/80 border border-narmis-gold/30 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasCompletedPayment}
                      onChange={(e) => {
                        setHasCompletedPayment(e.target.checked);
                        if (e.target.checked) setErrorMsg('');
                      }}
                      className="mt-0.5 rounded border-narmis-gold text-narmis-gold focus:ring-narmis-gold"
                    />
                    <span className="text-xs text-narmis-cream/90 leading-relaxed">
                      I have scanned the NARMIS UPI QR code and paid <strong>₹299</strong>. I
                      understand this submission will remain in <strong>Pending Verification</strong>{' '}
                      until manually approved by an administrator (365 days validity, no automatic
                      recurring charges).
                    </span>
                  </label>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-xs text-red-200 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmittingUpi}
                    className="w-full py-3.5 rounded-2xl bg-narmis-gold hover:bg-narmis-accent disabled:opacity-50 text-narmis-charcoal text-xs font-bold uppercase tracking-wider shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>
                      {isSubmittingUpi
                        ? 'Saving Payment Reference...'
                        : 'Submit ₹299 UPI Reference for Verification'}
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* ADMIN-ONLY VERIFICATION WORKFLOW (Server-Side Enforced via RLS)  */}
        {/* ================================================================ */}
        {isAuthenticated && isAdmin && (
          <div className="bg-narmis-surface rounded-3xl p-6 sm:p-8 border-2 border-narmis-gold/60 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-narmis-mountain/50 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-narmis-gold/20 text-narmis-gold border border-narmis-gold/40">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-narmis-gold">
                    Administrator Verification Console
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-narmis-parchment">
                    Trade Pass UPI Payment Approvals
                  </h2>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {(['Pending Verification', 'ALL', 'Approved', 'Rejected'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setAdminFilter(tab)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${
                      adminFilter === tab
                        ? 'bg-narmis-gold text-narmis-charcoal'
                        : 'bg-narmis-forestDark text-narmis-cream/75 border border-narmis-mountain/60 hover:border-narmis-gold/40'
                    }`}
                  >
                    {tab === 'ALL' ? 'All' : tab}
                  </button>
                ))}
              </div>
            </div>

            {isLoadingAdminList ? (
              <div className="py-10 text-center space-y-2">
                <Loader2 className="w-6 h-6 text-narmis-gold animate-spin mx-auto" />
                <p className="text-xs text-narmis-cream/70">Loading submissions from Supabase...</p>
              </div>
            ) : adminSubscriptionPayments.length === 0 ? (
              <div className="p-8 rounded-2xl bg-narmis-forestDark/70 border border-narmis-mountain/50 text-center text-xs text-narmis-cream/70">
                No subscription payment submissions found for filter &ldquo;{adminFilter}&rdquo;.
              </div>
            ) : (
              <div className="space-y-4">
                {adminSubscriptionPayments.map((item) => {
                  const isPending = item.verification_status === 'Pending Verification';
                  const isBusy = reviewingId === item.id;
                  return (
                    <div
                      key={item.id}
                      className="p-5 rounded-2xl bg-narmis-forestDark border border-narmis-mountain/60 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-serif text-base font-bold text-narmis-parchment">
                              {item.user_name || 'Member'}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                item.verification_status === 'Approved'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                  : item.verification_status === 'Rejected'
                                  ? 'bg-red-950 text-red-300 border border-red-500/40'
                                  : 'bg-amber-950 text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              {item.verification_status}
                            </span>
                          </div>
                          <p className="text-xs text-narmis-cream/70">
                            {item.user_email || item.user_id}
                            {item.college_name ? ` · ${item.college_name}` : ''}
                          </p>
                          <p className="text-xs text-narmis-cream/85">
                            Order: <span className="font-mono">{item.provider_order_id}</span> · UPI
                            Reference:{' '}
                            <strong className="font-mono text-narmis-gold">
                              {item.upi_reference || item.provider_payment_id}
                            </strong>
                          </p>
                          <p className="text-[11px] text-narmis-cream/55">
                            Amount: ₹{(item.amount_paise / 100).toLocaleString('en-IN')} · Submitted:{' '}
                            {new Date(item.created_at).toLocaleString('en-IN')}
                          </p>
                        </div>

                        {item.verification_status === 'Approved' && item.period_end && (
                          <div className="text-xs text-emerald-300 font-semibold">
                            Active until {new Date(item.period_end).toLocaleDateString('en-IN')}
                          </div>
                        )}
                      </div>

                      {isPending && (
                        <div className="pt-3 border-t border-narmis-mountain/40 flex flex-col md:flex-row items-stretch md:items-center gap-3">
                          <input
                            type="text"
                            value={rejectionReasons[item.id] || ''}
                            onChange={(e) =>
                              setRejectionReasons((prev) => ({
                                ...prev,
                                [item.id]: e.target.value,
                              }))
                            }
                            placeholder="Optional rejection note (if rejecting)..."
                            className="flex-1 px-3 py-2 rounded-xl bg-narmis-surface border border-narmis-mountain/60 text-xs text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold"
                          />
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleAdminDecision(item.id, 'approve')}
                              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-narmis-charcoal text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition-all"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{isBusy ? 'Processing...' : 'Approve (365 Days)'}</span>
                            </button>
                            <button
                              type="button"
                              disabled={isBusy}
                              onClick={() => handleAdminDecision(item.id, 'reject')}
                              className="px-4 py-2 rounded-xl bg-red-900/80 hover:bg-red-800 disabled:opacity-50 text-red-100 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 transition-all"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
