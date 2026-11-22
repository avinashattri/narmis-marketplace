import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { useToast } from '../context/ToastContext';
import { ProductImage } from '../components/marketplace/ProductImage';
import { ConditionBadge } from '../components/marketplace/ConditionBadge';
import { PaymentQRDisplay } from '../components/marketplace/PaymentQRDisplay';
import { DEFAULT_CAMPUS_LOCATION } from '../services/locationDefaults';
import { PurchaseTransaction } from '../types';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  AlertTriangle,
  Clock,
  Truck,
  ShieldCheck,
  Receipt,
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const {
    cartItems,
    cartSubtotal,
    removeFromCart,
    updateCartQuantity,
    clearCart,
    checkoutCart,
  } = useMarketplace();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState(
    user?.location || DEFAULT_CAMPUS_LOCATION
  );
  const [paymentReference, setPaymentReference] = useState('');
  const [hasCompletedPayment, setHasCompletedPayment] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [completedOrders, setCompletedOrders] = useState<PurchaseTransaction[] | null>(null);

  if (!isAuthenticated || !user) {
    return (
      <div className="pt-32 pb-24 max-w-lg mx-auto px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-narmis-surface border border-narmis-mountain flex items-center justify-center mx-auto text-narmis-gold">
          <ShoppingCart className="w-7 h-7" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-narmis-parchment">
          Your Purchase Cart
        </h1>
        <p className="text-xs sm:text-sm text-narmis-cream/70 leading-relaxed">
          Sign in to access your persistent shopping cart synced across all your devices via
          Supabase.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            to="/login"
            className="px-6 py-2.5 rounded-full bg-narmis-gold text-narmis-charcoal text-xs font-bold uppercase tracking-wider hover:bg-narmis-accent transition-all"
          >
            Sign In
          </Link>
          <Link
            to="/purchase"
            className="px-6 py-2.5 rounded-full bg-narmis-mountain text-narmis-parchment text-xs font-semibold hover:bg-narmis-mountain/80 transition-all"
          >
            Browse Purchase Store
          </Link>
        </div>
      </div>
    );
  }

  // Separate valid purchase items vs unavailable / deleted items
  const unavailableItems = cartItems.filter((ci) => {
    const l = ci.listing;
    return (
      !l ||
      l.status !== 'active' ||
      l.listing_type !== 'purchase' ||
      l.user_id === user.id ||
      (l.quantity_available ?? 1) < 1
    );
  });

  const activeCartItems = cartItems.filter((ci) => {
    const l = ci.listing;
    return (
      l &&
      l.status === 'active' &&
      l.listing_type === 'purchase' &&
      l.user_id !== user.id &&
      (l.quantity_available ?? 1) >= 1
    );
  });

  const platformFee = 0;
  const grandTotal = cartSubtotal + platformFee;

  const handleQtyChange = async (listingId: string, nextQty: number) => {
    try {
      await updateCartQuantity(listingId, nextQty);
    } catch (err: any) {
      showToast(err?.message || 'Could not update quantity.', 'error');
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (unavailableItems.length > 0) {
      setErrorMsg(
        'Please remove unavailable or sold items from your cart before completing checkout.'
      );
      return;
    }
    if (activeCartItems.length === 0) {
      setErrorMsg('Your cart is empty.');
      return;
    }
    if (!hasCompletedPayment) {
      setErrorMsg('Please confirm that you have completed the UPI payment before continuing.');
      return;
    }

    setErrorMsg('');
    setIsCheckingOut(true);
    try {
      const orders = await checkoutCart({
        address: shippingAddress.trim() || DEFAULT_CAMPUS_LOCATION,
        paymentReference: paymentReference.trim() || undefined,
      });
      setCompletedOrders(orders);
      showToast(`Order submitted for ${orders.length} item(s)!`, 'success');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Checkout failed. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (completedOrders && completedOrders.length > 0) {
    const totalPaid = completedOrders.reduce((acc, o) => acc + o.amount, 0);
    return (
      <div className="pt-28 pb-24 bg-narmis-bg min-h-screen text-narmis-cream">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-narmis-surface rounded-3xl p-6 sm:p-10 border border-narmis-mountain/60 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 text-amber-200 border border-amber-500/40 text-[11px] font-bold uppercase mb-2">
                <Clock className="w-3 h-3" />
                <span>Payment Submitted · Pending Seller Verification</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-narmis-parchment">
                Cart Order Recorded
              </h1>
              <p className="text-xs sm:text-sm text-narmis-cream/75 mt-1 max-w-md mx-auto">
                Your payment confirmation for {completedOrders.length} item(s) totaling{' '}
                <strong className="text-emerald-300">
                  ₹{totalPaid.toLocaleString('en-IN')}
                </strong>{' '}
                has been sent to the seller(s).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-narmis-forestDark border border-narmis-mountain/60 text-left space-y-3 text-xs">
              {completedOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="flex items-center justify-between gap-3 pb-2.5 last:pb-0 border-b last:border-b-0 border-narmis-mountain/40"
                >
                  <div>
                    <p className="font-semibold text-narmis-parchment">
                      {ord.listing?.title || 'Marketplace Item'} (Qty: {ord.quantity || 1})
                    </p>
                    <p className="text-[11px] text-narmis-cream/60 font-mono">
                      Receipt: {ord.receipt_number}
                    </p>
                  </div>
                  <span className="font-serif font-bold text-emerald-300">
                    ₹{ord.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/messages')}
                className="px-6 py-3 rounded-full bg-narmis-gold text-narmis-charcoal text-xs font-bold uppercase tracking-wider hover:bg-narmis-accent transition-all"
              >
                Coordinate Handover in Messages
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 rounded-full bg-narmis-mountain text-narmis-parchment text-xs font-semibold hover:bg-narmis-mountain/80 transition-all"
              >
                View in Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 bg-narmis-bg min-h-screen text-narmis-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              to="/purchase"
              className="inline-flex items-center gap-1.5 text-xs text-narmis-cream/70 hover:text-narmis-gold mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Continue Shopping in Purchase Store</span>
            </Link>
            <h1 className="font-serif text-3xl sm:text-4xl font-black text-narmis-parchment flex items-center gap-3">
              <ShoppingCart className="w-8 h-8 text-narmis-gold" />
              <span>Purchase Cart</span>
            </h1>
          </div>

          {cartItems.length > 0 && (
            <button
              type="button"
              onClick={() => {
                clearCart();
                showToast('Cleared all items from your cart.', 'info');
              }}
              className="self-start sm:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-950/60 hover:bg-red-900/70 border border-red-500/40 text-red-200 text-xs font-semibold transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Cart</span>
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-narmis-surface rounded-3xl p-12 border border-narmis-mountain/60 text-center space-y-4 max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-narmis-forestDark border border-narmis-mountain flex items-center justify-center mx-auto text-narmis-gold">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-narmis-parchment">
              Your cart is currently empty
            </h2>
            <p className="text-xs sm:text-sm text-narmis-cream/70 leading-relaxed">
              Add verified pre-loved items from the Purchase Store to your cart. Your cart syncs
              automatically across all your signed-in devices.
            </p>
            <div className="pt-2">
              <Link
                to="/purchase"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-narmis-gold text-narmis-charcoal text-xs font-bold uppercase tracking-wider hover:bg-narmis-accent transition-all"
              >
                <span>Explore Purchase Listings</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cart Items List (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {unavailableItems.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/50 space-y-3">
                  <div className="flex items-start gap-2.5 text-amber-200 text-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">
                        {unavailableItems.length} item(s) in your cart are no longer available
                      </p>
                      <p className="text-amber-200/80 mt-0.5">
                        Items that have been sold, reserved, or removed cannot be purchased. Please
                        remove them below to proceed.
                      </p>
                    </div>
                  </div>
                  {unavailableItems.map((ui) => (
                    <div
                      key={ui.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-black/30 border border-amber-500/30 text-xs"
                    >
                      <span className="text-narmis-cream/80 truncate">
                        {ui.listing?.title || `Unavailable Listing (${ui.listing_id.slice(0, 8)})`}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromCart(ui.listing_id)}
                        className="px-3 py-1 rounded-lg bg-red-900/80 hover:bg-red-800 text-red-100 font-semibold shrink-0"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeCartItems.map((item) => {
                const l = item.listing!;
                const unitPrice = Number(l.purchase_price) || 0;
                const lineTotal = unitPrice * item.quantity;
                const maxStock = l.quantity_available ?? 1;

                return (
                  <div
                    key={item.id}
                    className="bg-narmis-surface rounded-2xl p-4 sm:p-5 border border-narmis-mountain/60 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <Link
                        to={`/product/${l.id}`}
                        className="w-20 h-20 rounded-xl overflow-hidden bg-narmis-forestDark shrink-0 border border-narmis-mountain/50"
                      >
                        <ProductImage
                          src={l.images?.[0]}
                          alt={l.title}
                          category={l.category}
                          title={l.title}
                          className="w-full h-full object-cover"
                        />
                      </Link>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-narmis-gold">
                            {l.category}
                          </span>
                          <ConditionBadge condition={l.condition} size="sm" />
                        </div>
                        <Link
                          to={`/product/${l.id}`}
                          className="font-serif text-base font-bold text-narmis-parchment hover:text-narmis-gold transition-colors line-clamp-1"
                        >
                          {l.title}
                        </Link>
                        <p className="text-xs text-narmis-cream/60">
                          Unit Price: ₹{unitPrice.toLocaleString('en-IN')} · Seller:{' '}
                          {l.user?.full_name || 'Campus Seller'}
                        </p>
                      </div>
                    </div>

                    {/* Quantity Controls & Line Subtotal */}
                    <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-narmis-mountain/40">
                      <div className="flex items-center gap-1.5 bg-narmis-forestDark rounded-xl p-1 border border-narmis-mountain/60">
                        <button
                          type="button"
                          onClick={() => handleQtyChange(l.id, item.quantity - 1)}
                          className="p-1.5 rounded-lg hover:bg-narmis-mountain text-narmis-cream transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-narmis-parchment">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQtyChange(l.id, item.quantity + 1)}
                          disabled={item.quantity >= maxStock}
                          className="p-1.5 rounded-lg hover:bg-narmis-mountain text-narmis-cream disabled:opacity-35 transition-colors"
                          aria-label="Increase quantity"
                          title={
                            item.quantity >= maxStock
                              ? `Maximum available stock (${maxStock}) reached`
                              : 'Increase quantity'
                          }
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right min-w-[90px]">
                        <span className="block text-[10px] text-narmis-cream/60 uppercase">
                          Line Total
                        </span>
                        <span className="font-serif text-base font-bold text-emerald-300">
                          ₹{lineTotal.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          removeFromCart(l.id);
                          showToast('Removed item from cart.', 'info');
                        }}
                        className="p-2 rounded-xl bg-red-950/50 hover:bg-red-900/70 text-red-300 transition-colors"
                        title="Remove from cart"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Order Summary & UPI QR Checkout Panel (5 cols) */}
            <div className="lg:col-span-5">
              <form
                onSubmit={handleCheckoutSubmit}
                className="bg-narmis-surface rounded-3xl p-6 sm:p-7 border border-narmis-mountain/60 shadow-2xl space-y-5"
              >
                <div className="flex items-center justify-between border-b border-narmis-mountain/40 pb-3">
                  <h2 className="font-serif text-xl font-bold text-narmis-parchment flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-narmis-gold" />
                    <span>Cart Summary & Checkout</span>
                  </h2>
                  <span className="text-xs text-narmis-cream/70">
                    {activeCartItems.reduce((s, i) => s + i.quantity, 0)} item(s)
                  </span>
                </div>

                {/* Subtotal & Total Breakdown */}
                <div className="p-4 rounded-2xl bg-narmis-forestDark/80 border border-narmis-mountain/50 space-y-2 text-xs">
                  <div className="flex justify-between text-narmis-cream/70">
                    <span>Items Subtotal:</span>
                    <span className="font-semibold text-narmis-parchment">
                      ₹{cartSubtotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-narmis-cream/70">
                    <span>Platform Fee:</span>
                    <span className="text-emerald-400 font-semibold">₹0 (Campus P2P)</span>
                  </div>
                  <div className="pt-2.5 border-t border-narmis-mountain/40 flex justify-between items-center text-base font-bold">
                    <span className="text-narmis-parchment">Total Amount Payable:</span>
                    <span className="font-serif text-xl text-emerald-300">
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* UPI QR Display */}
                <PaymentQRDisplay amount={grandTotal} />

                {/* Handover Address & Optional UTR */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1">
                      <span className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-narmis-gold" />
                        <span>Delivery / Campus Handover Location *</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder={DEFAULT_CAMPUS_LOCATION}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs text-narmis-cream focus:outline-none focus:border-narmis-gold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1">
                      UPI Transaction ID / 12-Digit UTR (Optional)
                    </label>
                    <input
                      type="text"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="e.g. 412389456123"
                      maxLength={60}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-xs text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold"
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
                      I have completed the UPI payment of{' '}
                      <strong>₹{grandTotal.toLocaleString('en-IN')}</strong>. Order status will be
                      recorded as <em>Payment Submitted</em> pending seller verification.
                    </span>
                  </label>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-xs text-red-200">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    isCheckingOut || activeCartItems.length === 0 || unavailableItems.length > 0
                  }
                  className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-narmis-charcoal text-xs font-bold uppercase tracking-wider shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {isCheckingOut
                      ? 'Submitting Cart Order...'
                      : `Confirm & Submit Payment (₹${grandTotal.toLocaleString('en-IN')})`}
                  </span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
