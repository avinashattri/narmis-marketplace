import React, { useState } from 'react';
import { Listing, PurchaseTransaction } from '../../types';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { PaymentQRDisplay } from './PaymentQRDisplay';
import { DEFAULT_CAMPUS_LOCATION } from '../../services/locationDefaults';
import {
  X,
  ShoppingBag,
  Clock,
  Truck,
  Printer,
  CheckCircle2,
  Receipt,
  ShieldCheck,
} from 'lucide-react';

interface PurchaseModalProps {
  listing: Listing;
  isOpen: boolean;
  onClose: () => void;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  listing,
  isOpen,
  onClose,
}) => {
  const { submitPurchasePayment } = useMarketplace();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState(
    user?.location || DEFAULT_CAMPUS_LOCATION
  );
  const [paymentReference, setPaymentReference] = useState('');
  const [hasCompletedPayment, setHasCompletedPayment] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedPurchase, setSubmittedPurchase] = useState<PurchaseTransaction | null>(null);

  if (!isOpen) return null;

  const price = listing.purchase_price || 0;
  const platformFee = 0;
  const deliveryEstimated = 0;
  const total = price + platformFee + deliveryEstimated;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!hasCompletedPayment) {
      setErrorMsg('Please confirm that you have completed the payment before continuing.');
      return;
    }

    setErrorMsg('');
    setIsProcessing(true);
    try {
      const result = await submitPurchasePayment({
        listingId: listing.id,
        address: shippingAddress.trim() || DEFAULT_CAMPUS_LOCATION,
        paymentReference: paymentReference.trim() || undefined,
      });

      setSubmittedPurchase(result);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to submit payment confirmation. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-narmis-surface border border-narmis-mountain w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl relative text-narmis-cream max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-narmis-cream/60 hover:text-white p-1 rounded-full hover:bg-narmis-mountain/50 transition-colors"
          aria-label="Close payment modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedPurchase ? (
          /* Honest Payment Submitted Screen (Does NOT falsely claim verified) */
          <div className="space-y-6 text-center py-3">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 text-amber-200 border border-amber-500/40 text-[11px] font-bold uppercase mb-2">
                <Clock className="w-3 h-3" />
                <span>Pending Verification</span>
              </div>
              <h3 className="font-serif text-2xl font-bold text-narmis-parchment">
                Payment Submitted
              </h3>
              <p className="text-xs text-narmis-cream/75 mt-1.5 max-w-sm mx-auto leading-relaxed">
                Your payment confirmation has been recorded and shared with the seller. Final order
                status updates once the seller verifies receipt.
              </p>
            </div>

            {/* Submission Summary Card */}
            <div className="p-4 rounded-2xl bg-narmis-forestDark/90 border border-narmis-mountain/60 text-left text-xs space-y-2.5">
              <div className="flex justify-between gap-3 text-narmis-cream/60">
                <span>Submission Ref:</span>
                <span className="font-mono font-bold text-narmis-gold">
                  {submittedPurchase.receipt_number}
                </span>
              </div>
              <div className="flex justify-between gap-3 text-narmis-cream/60">
                <span>Item:</span>
                <span className="font-semibold text-narmis-parchment text-right">
                  {listing.title}
                </span>
              </div>
              <div className="flex justify-between gap-3 text-narmis-cream/60">
                <span>Amount Payable:</span>
                <span className="font-bold text-narmis-gold font-serif">
                  ₹{submittedPurchase.amount.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between gap-3 text-narmis-cream/60">
                <span>Payment Method:</span>
                <span className="font-medium text-narmis-parchment">UPI QR Payment</span>
              </div>
              {submittedPurchase.payment_reference && (
                <div className="flex justify-between gap-3 text-narmis-cream/60">
                  <span>UPI Ref / UTR:</span>
                  <span className="font-mono text-narmis-cream">
                    {submittedPurchase.payment_reference}
                  </span>
                </div>
              )}
              <div className="flex justify-between gap-3 text-narmis-cream/60">
                <span>Verification Status:</span>
                <span className="font-semibold text-amber-300">
                  {submittedPurchase.payment_verification_status || 'Payment Submitted'}
                </span>
              </div>
              <div className="flex justify-between gap-3 text-narmis-cream/60">
                <span>Handover Address:</span>
                <span className="truncate max-w-[210px] text-narmis-parchment text-right">
                  {submittedPurchase.shipping_address}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-narmis-forestDark/70 border border-narmis-mountain/50 text-[11px] text-narmis-cream/80 text-left flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-narmis-gold shrink-0 mt-0.5" />
              <span>
                A message thread has been opened with the seller so you can share your UPI payment
                screenshot if requested and coordinate handover.
              </span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2.5 rounded-full bg-narmis-forestDark hover:bg-narmis-mountain text-narmis-parchment border border-narmis-mountain text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Summary</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/dashboard');
                }}
                className="px-6 py-2.5 rounded-full bg-narmis-gold text-narmis-charcoal text-xs font-bold uppercase tracking-wider hover:bg-narmis-accent transition-all"
              >
                View in Dashboard
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full bg-narmis-mountain text-narmis-parchment text-xs font-medium hover:bg-narmis-mountain/80 transition-all"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          /* Payment Form */
          <form onSubmit={handleCheckout} className="space-y-5">
            <div className="flex items-center gap-3 pr-8">
              <div className="p-2.5 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-600/40 shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-narmis-parchment">
                  Complete Payment
                </h3>
                <p className="text-xs text-narmis-cream/70 line-clamp-1">{listing.title}</p>
              </div>
            </div>

            {/* Order Breakdown */}
            <div className="p-4 rounded-2xl bg-narmis-forestDark/80 border border-narmis-mountain/50 space-y-2 text-xs">
              <div className="flex justify-between text-narmis-cream/70">
                <span>Item Price:</span>
                <span className="font-semibold text-narmis-parchment">
                  ₹{price.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-narmis-cream/70">
                <span>Platform Fee:</span>
                <span className="font-semibold text-emerald-400">FREE</span>
              </div>
              <div className="flex justify-between text-narmis-cream/70">
                <span>Campus / Local Handover:</span>
                <span className="font-semibold text-emerald-400">FREE</span>
              </div>
              <div className="pt-2 border-t border-narmis-mountain/40 flex justify-between items-center text-sm font-bold">
                <span className="text-narmis-parchment">Total Amount Payable:</span>
                <span className="font-serif text-xl text-narmis-gold">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* QR Code Display Component */}
            <PaymentQRDisplay amount={total} />

            {/* Handover / Delivery Address */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-narmis-gold" />
                <span>Handover / Delivery Location *</span>
              </label>
              <textarea
                rows={2}
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder={DEFAULT_CAMPUS_LOCATION}
                className="w-full px-3 py-2 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs text-narmis-cream focus:outline-none focus:border-narmis-gold resize-none"
                required
              />
            </div>

            {/* Optional UPI Transaction Reference */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5 flex items-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-narmis-gold" />
                <span>UPI Transaction ID / Reference (Optional)</span>
              </label>
              <input
                type="text"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="e.g. 12-digit UTR number from your UPI app"
                maxLength={60}
                className="w-full px-3 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold"
              />
            </div>

            {/* Explicit Buyer Confirmation Step */}
            <label className="flex items-start gap-2.5 p-3.5 rounded-xl bg-narmis-forestDark/80 border border-narmis-mountain/60 cursor-pointer hover:border-narmis-gold/50 transition-colors">
              <input
                type="checkbox"
                checked={hasCompletedPayment}
                onChange={(e) => setHasCompletedPayment(e.target.checked)}
                className="mt-0.5 rounded border-narmis-mountain text-narmis-gold focus:ring-narmis-gold bg-narmis-surface shrink-0"
              />
              <span className="text-xs text-narmis-cream/90 leading-relaxed">
                I confirm that I have completed the payment of{' '}
                <strong className="text-narmis-gold">₹{total.toLocaleString('en-IN')}</strong> via
                the UPI QR code above. I understand the seller will verify receipt before final
                handover.
              </span>
            </label>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-xs text-red-200">
                {errorMsg}
              </div>
            )}

            <div className="pt-1 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-3 rounded-xl bg-narmis-mountain/60 text-narmis-cream text-xs font-semibold hover:bg-narmis-mountain transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing || !hasCompletedPayment}
                className="w-2/3 py-3 rounded-xl bg-narmis-gold hover:bg-narmis-accent disabled:opacity-50 disabled:cursor-not-allowed text-narmis-charcoal text-xs font-bold uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isProcessing
                    ? 'Submitting Confirmation...'
                    : `Confirm Payment (₹${total.toLocaleString('en-IN')})`}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
