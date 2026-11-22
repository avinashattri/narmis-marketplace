import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/marketplace/ProductCard';
import { ConditionBadge } from '../components/marketplace/ConditionBadge';
import { ProductImage } from '../components/marketplace/ProductImage';
import { RentalRequestModal } from '../components/marketplace/RentalRequestModal';
import { TradeOfferModal } from '../components/marketplace/TradeOfferModal';
import { PurchaseModal } from '../components/marketplace/PurchaseModal';
import { ShareModal } from '../components/marketplace/ShareModal';
import { useToast } from '../context/ToastContext';
import { CONDITION_DESCRIPTIONS } from '../services/conditionOptions';
import {
  Heart,
  Share2,
  MapPin,
  Star,
  ShieldCheck,
  Calendar,
  Repeat,
  ShoppingBag,
  ShoppingCart,
  Loader2,
  MessageSquare,
  ArrowLeft,
  Sparkles,
  Check,
  Tag,
  Clock,
  FileCheck,
  Package,
  Wrench,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Info,
  Edit3,
  Trash2,
  Camera,
  X,
  FileText,
  AlertTriangle,
  GraduationCap,
} from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getListing,
    fetchListingById,
    listings,
    isSaved,
    toggleSaveListing,
    startOrGetConversation,
    getListingReviews,
    addReview,
    hasUserCompletedTransaction,
    addToCart,
    deleteListing,
    tradeAccess,
  } = useMarketplace();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const listing = getListing(id || '');
  const [isFetchingDirect, setIsFetchingDirect] = useState(false);

  useEffect(() => {
    if (id && !listing) {
      let active = true;
      setIsFetchingDirect(true);
      fetchListingById(id).finally(() => {
        if (active) setIsFetchingDirect(false);
      });
      return () => {
        active = false;
      };
    }
  }, [id, listing, fetchListingById]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isCopied, _setIsCopied] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedConditionPhoto, setSelectedConditionPhoto] = useState<string | null>(null);

  // Reviews state (filtered specifically for this listing)
  const listingReviews = listing ? getListingReviews(listing.id) : [];
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [isAddingReview, setIsAddingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Modals state
  const [isRentalModalOpen, setIsRentalModalOpen] = useState(false);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  if (!listing && isFetchingDirect) {
    return (
      <div className="pt-32 pb-24 max-w-4xl mx-auto px-4 text-center space-y-3">
        <Loader2 className="w-8 h-8 text-narmis-gold animate-spin mx-auto" />
        <p className="text-sm text-narmis-cream/70">Loading listing...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="pt-32 pb-24 max-w-4xl mx-auto px-4 text-center">
        <h2 className="font-serif text-3xl font-bold text-narmis-parchment mb-4">
          Listing Not Found
        </h2>
        <p className="text-sm text-narmis-cream/70 mb-8">
          The requested item may have been completed, reserved, or removed by its owner.
        </p>
        <Link
          to="/explore"
          className="px-6 py-2.5 rounded-full bg-narmis-gold text-narmis-charcoal text-xs font-bold uppercase tracking-wider"
        >
          Return to Marketplace
        </Link>
      </div>
    );
  }

  const saved = isSaved(listing.id);
  const isOwner = user?.id === listing.user_id;
  const userAlreadyReviewed = user ? listingReviews.some((r) => r.reviewer_id === user.id) : false;

  // Real review statistics
  const reviewCount = listingReviews.length;
  const averageRating =
    reviewCount > 0
      ? (listingReviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1)
      : null;

  // Share handler
  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  const handleAddToCartClick = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await addToCart(listing.id, 1);
      showToast(`Added "${listing.title}" to your purchase cart!`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Unable to add item to cart.', 'error');
    }
  };

  // Contact seller handler
  const handleContactSeller = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await startOrGetConversation(listing.id, listing.user_id, `Inquiry about ${listing.title}`);
      navigate('/messages');
    } catch (err: any) {
      showToast(err?.message || 'Unable to start conversation.', 'error');
    }
  };

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isOwner) {
      setReviewError('You cannot review your own listing.');
      return;
    }

    if (userAlreadyReviewed) {
      setReviewError('You have already submitted a review for this listing.');
      return;
    }

    if (!newComment.trim()) {
      setReviewError('Please write your review feedback.');
      return;
    }

    try {
      await addReview({
        reviewer_id: user?.id || 'user',
        reviewer: user || undefined,
        target_user_id: listing.user_id,
        listing_id: listing.id,
        rating: newRating,
        comment: newComment.trim(),
      });

      setNewComment('');
      setIsAddingReview(false);
      showToast('Your verified review has been posted!', 'success');
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review.');
    }
  };

  const relatedListings = listings
    .filter((l) => l.id !== listing.id && (l.category === listing.category || l.listing_type === listing.listing_type))
    .slice(0, 3);

  const hasNoDamage = listing.defects?.includes('No visible damage');
  const hasSpecificDefects = listing.defects && listing.defects.some((d) => d !== 'No visible damage');

  return (
    <div className="pt-28 pb-24 bg-narmis-bg min-h-screen text-narmis-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb & Navigation */}
        <div className="flex items-center justify-between mb-8 text-xs text-narmis-cream/60">
          <Link
            to="/explore"
            className="inline-flex items-center gap-1.5 hover:text-narmis-parchment transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Marketplace</span>
          </Link>

          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            {isOwner && (
              <>
                <Link
                  to={`/create-listing?edit=${listing.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-narmis-mountain hover:bg-narmis-mountain/80 border border-narmis-gold/40 text-xs font-semibold text-narmis-gold transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Listing</span>
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    if (!window.confirm(`Delete "${listing.title}" from your listings?`)) return;
                    try {
                      await deleteListing(listing.id);
                      showToast('Listing deleted.', 'success');
                      navigate('/dashboard');
                    } catch (err: any) {
                      showToast(err?.message || 'Unable to delete listing.', 'error');
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 hover:bg-red-900/70 border border-red-500/40 text-xs font-semibold text-red-200 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </>
            )}
            <div className="flex items-center gap-2">
              <span className="capitalize">{listing.listing_type}</span>
              <span>/</span>
              <span className="text-narmis-gold">{listing.category}</span>
            </div>
          </div>
        </div>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Image Gallery & Structured Details (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. PRODUCT OVERVIEW: Featured Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-narmis-forestDark border border-narmis-mountain/60 shadow-2xl">
                <ProductImage
                  src={listing.images && listing.images.length > 0 ? (listing.images[activeImageIndex] || listing.images[0]) : undefined}
                  alt={listing.title}
                  category={listing.category}
                  title={listing.title}
                  className="w-full h-full object-cover"
                  loading="eager"
                />

                {/* Status Badges Overlay */}
                <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2 items-center">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-md border shadow-md ${
                      listing.listing_type === 'rent'
                        ? 'bg-sky-950/80 text-sky-200 border-sky-600/40'
                        : listing.listing_type === 'trade'
                        ? 'bg-amber-950/80 text-amber-200 border-amber-600/40'
                        : 'bg-emerald-950/80 text-emerald-200 border-emerald-600/40'
                    }`}
                  >
                    {listing.listing_type === 'rent' ? (
                      <Calendar className="w-3.5 h-3.5" />
                    ) : listing.listing_type === 'trade' ? (
                      <Repeat className="w-3.5 h-3.5" />
                    ) : (
                      <ShoppingBag className="w-3.5 h-3.5" />
                    )}
                    {listing.listing_type.toUpperCase()}
                  </span>

                  {/* Prominent Condition Badge */}
                  <ConditionBadge condition={listing.condition} size="md" />

                  {listing.invoice_available && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-950/80 text-emerald-300 backdrop-blur-md border border-emerald-600/30 flex items-center gap-1">
                      <FileCheck className="w-3 h-3" />
                      <span>Invoice Available</span>
                    </span>
                  )}
                </div>

                {/* Action Buttons top right */}
                <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                  <button
                    onClick={handleShare}
                    className="p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-narmis-cream backdrop-blur-md transition-all border border-white/10"
                    title="Share Listing Link"
                  >
                    {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => toggleSaveListing(listing.id)}
                    className={`p-2.5 rounded-full backdrop-blur-md transition-all border border-white/10 ${
                      saved
                        ? 'bg-red-500 text-white shadow-lg'
                        : 'bg-black/60 hover:bg-black/90 text-narmis-cream'
                    }`}
                    title={saved ? 'Remove from Saved' : 'Save to Favorites'}
                  >
                    <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Thumbnails */}
              {listing.images && listing.images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {listing.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${
                        activeImageIndex === idx
                          ? 'border-narmis-gold scale-105 shadow-md'
                          : 'border-narmis-mountain/50 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <ProductImage
                        src={img}
                        alt=""
                        category={listing.category}
                        title={listing.title}
                        compact
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PRODUCT OVERVIEW: Description */}
            <div className="bg-narmis-surface rounded-3xl p-6 sm:p-8 border border-narmis-mountain/50 space-y-4">
              <h3 className="font-serif text-xl font-bold text-narmis-parchment">
                Product Overview & Description
              </h3>
              <p className="text-sm text-narmis-cream/85 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            {/* SECTION 1: PRODUCT CONDITION, WEAR & TEAR, DEFECTS */}
            <div className="bg-narmis-surface rounded-3xl p-6 sm:p-8 border border-narmis-mountain/50 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-narmis-mountain/40">
                <div className="flex items-center gap-2.5">
                  <Wrench className="w-5 h-5 text-amber-400" />
                  <h3 className="font-serif text-xl font-bold text-narmis-parchment">
                    Product Condition & Wear Disclosure
                  </h3>
                </div>
                <ConditionBadge condition={listing.condition} size="md" />
              </div>

              {/* Condition Criteria Guide */}
              <div className="p-3.5 rounded-2xl bg-narmis-forestDark/60 border border-narmis-mountain/40 text-xs text-narmis-cream/80">
                <strong className="text-narmis-parchment">{listing.condition}: </strong>
                <span>{CONDITION_DESCRIPTIONS[listing.condition] || 'Inspected item condition.'}</span>
              </div>

              {/* Disclosed Scratches & Defects */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80">
                  Disclosed Defects & Physical Damage
                </h4>

                {hasNoDamage ? (
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-emerald-200 text-xs">
                        Seller Verified: No Visible Damage
                      </p>
                      <p className="text-[11px] text-emerald-300/80 mt-0.5">
                        The seller has explicitly confirmed that this product has no noticeable scratches, dents, cracks, or functional issues.
                      </p>
                    </div>
                  </div>
                ) : hasSpecificDefects ? (
                  <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-600/40 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Disclosed Wear / Defects:</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {listing.defects?.map((defect) => (
                        <span
                          key={defect}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-amber-950/80 text-amber-200 border border-amber-500/50"
                        >
                          {defect}
                        </span>
                      ))}
                    </div>

                    {listing.defect_other && (
                      <p className="text-xs text-amber-200/90 pt-1">
                        <strong>Other Issue:</strong> {listing.defect_other}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-narmis-forestDark/40 border border-narmis-mountain/40 text-xs text-narmis-cream/60">
                    Defects & wear details: <strong className="text-narmis-parchment">Not specified by seller</strong>.
                  </div>
                )}

                {/* Seller's detailed damage description */}
                {listing.defect_description && (
                  <div className="p-4 rounded-2xl bg-narmis-forestDark/70 border border-narmis-mountain/50 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-narmis-gold block">
                      Seller's Wear & Tear Notes
                    </span>
                    <p className="text-xs text-narmis-cream/90 leading-relaxed whitespace-pre-line">
                      {listing.defect_description}
                    </p>
                  </div>
                )}
              </div>

              {/* SEPARATE CONDITION PHOTOS GALLERY */}
              <div className="pt-2 border-t border-narmis-mountain/40 space-y-3">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-narmis-parchment">
                    Condition Photos (Close-ups of Wear & Defects)
                  </h4>
                </div>

                {listing.condition_images && listing.condition_images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {listing.condition_images.map((cImg, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedConditionPhoto(cImg)}
                        className="group relative aspect-square rounded-2xl overflow-hidden border border-amber-500/40 bg-black cursor-pointer shadow-md hover:border-amber-400 transition-all"
                      >
                        <img
                          src={cImg}
                          alt={`Condition ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[11px] text-white font-medium">
                          Click to enlarge
                        </div>
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-amber-300 font-mono">
                          Defect #{idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-narmis-cream/60 italic">
                    No close-up condition or defect photographs were uploaded for this item.
                  </p>
                )}
              </div>
            </div>

            {/* SECTION 2: INCLUDED ACCESSORIES ("WHAT'S INCLUDED?") */}
            <div className="bg-narmis-surface rounded-3xl p-6 sm:p-8 border border-narmis-mountain/50 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-narmis-mountain/40">
                <Package className="w-5 h-5 text-sky-400" />
                <h3 className="font-serif text-xl font-bold text-narmis-parchment">
                  What's Included?
                </h3>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 block">
                  Items & Accessories Provided with this Listing
                </span>

                {listing.included_items && listing.included_items.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {listing.included_items.map((item) => (
                      <span
                        key={item}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 ${
                          item === 'Product only'
                            ? 'bg-amber-950/70 border-amber-500/70 text-amber-200'
                            : 'bg-sky-950/70 border-sky-500/70 text-sky-200'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 text-current" />
                        <span>{item}</span>
                      </span>
                    ))}
                  </div>
                ) : listing.accessories_included ? (
                  <div className="p-3.5 rounded-2xl bg-narmis-forestDark/70 border border-narmis-mountain/40 text-xs text-narmis-cream/90">
                    {listing.accessories_included}
                  </div>
                ) : (
                  <p className="text-xs text-narmis-cream/60 italic">
                    Included accessories: Not specified by seller.
                  </p>
                )}

                {/* Custom items */}
                {listing.included_custom && (
                  <div className="p-3 rounded-xl bg-narmis-forestDark/60 border border-narmis-mountain/40 text-xs text-narmis-cream/90">
                    <strong className="text-sky-300">Additional Accessories: </strong>
                    <span>{listing.included_custom}</span>
                  </div>
                )}

                {/* Missing accessories */}
                <div className="p-3.5 rounded-2xl bg-narmis-forestDark/50 border border-narmis-mountain/40 text-xs flex items-center justify-between">
                  <span className="text-narmis-cream/70">Missing standard accessories:</span>
                  <span className={`font-semibold ${listing.missing_accessories ? 'text-amber-300' : 'text-emerald-300'}`}>
                    {listing.missing_accessories || 'None reported'}
                  </span>
                </div>

                {/* Packaging availability */}
                <div className="p-3.5 rounded-2xl bg-narmis-forestDark/50 border border-narmis-mountain/40 text-xs flex items-center justify-between">
                  <span className="text-narmis-cream/70">Original packaging / box:</span>
                  <span className={`font-semibold ${listing.packaging_available === true ? 'text-emerald-300' : listing.packaging_available === false ? 'text-amber-300' : 'text-narmis-cream/60'}`}>
                    {listing.packaging_available === true
                      ? 'Available (Original Box Included)'
                      : listing.packaging_available === false
                      ? 'No original box'
                      : 'Not specified'}
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 3: PURCHASE & TECHNICAL INFORMATION */}
            <div className="bg-narmis-surface rounded-3xl p-6 sm:p-8 border border-narmis-mountain/50 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-narmis-mountain/40">
                <Clock className="w-5 h-5 text-emerald-400" />
                <h3 className="font-serif text-xl font-bold text-narmis-parchment">
                  Purchase, Warranty & Technical Details
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-narmis-forestDark/70 border border-narmis-mountain/40">
                  <span className="text-narmis-cream/60 uppercase tracking-wider block mb-1">Brand / Maker</span>
                  <p className="font-semibold text-narmis-parchment text-sm">
                    {listing.brand || 'Unbranded / Custom Craft'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-narmis-forestDark/70 border border-narmis-mountain/40">
                  <span className="text-narmis-cream/60 uppercase tracking-wider block mb-1">Model / Reference</span>
                  <p className="font-semibold text-narmis-parchment text-sm">
                    {listing.model_name || 'Standard Edition'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-narmis-forestDark/70 border border-narmis-mountain/40">
                  <span className="text-narmis-cream/60 uppercase tracking-wider block mb-1">Product Age</span>
                  <p className="font-semibold text-narmis-parchment text-sm">
                    {listing.product_age || 'Not specified'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-narmis-forestDark/60 border border-narmis-mountain/40 space-y-1">
                  <span className="text-narmis-cream/60 block">Purchase Bill / Invoice Availability</span>
                  <p className={`font-semibold ${listing.invoice_available === true ? 'text-emerald-400' : listing.invoice_available === false ? 'text-amber-300' : 'text-narmis-cream/70'}`}>
                    {listing.invoice_available === true
                      ? 'Available upon request (Proof of purchase verified)'
                      : listing.invoice_available === false
                      ? 'No invoice available'
                      : 'Not specified'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-narmis-forestDark/60 border border-narmis-mountain/40 space-y-1">
                  <span className="text-narmis-cream/60 block">Warranty Status</span>
                  <p className={`font-semibold ${listing.warranty_valid === true ? 'text-emerald-400' : 'text-narmis-parchment'}`}>
                    {listing.warranty_valid === true
                      ? `Active Warranty (${listing.warranty_status || 'Valid'})`
                      : listing.warranty_valid === false
                      ? 'Warranty Expired / None'
                      : listing.warranty_status || 'Not specified'}
                  </p>
                </div>
              </div>

              {listing.purchase_date && (
                <div className="p-3 rounded-xl bg-narmis-forestDark/40 border border-narmis-mountain/40 text-xs text-narmis-cream/70 flex items-center justify-between">
                  <span>Approximate Purchase Date:</span>
                  <strong className="text-narmis-parchment">
                    {new Date(listing.purchase_date).toLocaleDateString('en-IN', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </strong>
                </div>
              )}

              {listing.documentation_notes && (
                <div className="p-3 rounded-xl bg-narmis-forestDark/40 border border-narmis-mountain/40 text-xs text-narmis-cream/70">
                  <strong className="text-narmis-parchment">Documentation Notes: </strong>
                  <span>{listing.documentation_notes}</span>
                </div>
              )}
            </div>

            {/* LOCATION & PICKUP */}
            <div className="bg-narmis-surface rounded-3xl p-6 sm:p-8 border border-narmis-mountain/50 space-y-3">
              <h3 className="font-serif text-xl font-bold text-narmis-parchment flex items-center gap-2">
                <MapPin className="w-5 h-5 text-narmis-gold" />
                <span>Approximate Locality & Handover</span>
              </h3>
              <p className="text-xs text-narmis-cream/80">
                Item is available for peer handover in <strong className="text-narmis-parchment">{listing.location}</strong>.
              </p>
              <div className="p-3 rounded-xl bg-narmis-forestDark/60 border border-narmis-mountain/40 text-[11px] text-narmis-cream/60 flex items-center gap-2">
                <Info className="w-4 h-4 text-narmis-gold shrink-0" />
                <span>Exact pickup spots (campus library, metro station, local café) can be coordinated safely in Messages.</span>
              </div>
            </div>

            {/* REVIEWS SECTION (No fake reviews!) */}
            <div className="bg-narmis-surface rounded-3xl p-6 sm:p-8 border border-narmis-mountain/50 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-narmis-mountain/40">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400 fill-current" />
                  <h3 className="font-serif text-xl font-bold text-narmis-parchment">
                    Reviews ({reviewCount})
                  </h3>
                </div>

                {!isOwner && (
                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        navigate('/login');
                        return;
                      }
                      setIsAddingReview(!isAddingReview);
                    }}
                    className="px-3 py-1.5 rounded-full bg-narmis-mountain hover:bg-narmis-mountain/80 border border-narmis-gold/30 text-xs font-semibold text-narmis-gold transition-colors"
                  >
                    {isAddingReview ? 'Cancel' : '+ Add Review'}
                  </button>
                )}
              </div>

              {/* Add Review Form */}
              {isAddingReview && (
                <form onSubmit={handlePostReview} className="p-4 rounded-2xl bg-narmis-forestDark border border-narmis-mountain/60 space-y-3 animate-fadeIn">
                  <h4 className="font-serif font-bold text-narmis-parchment text-sm">
                    Leave a Verified Peer Review
                  </h4>

                  {reviewError && (
                    <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs">
                      {reviewError}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-narmis-cream/70">Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className={`p-1 ${newRating >= star ? 'text-amber-400' : 'text-narmis-cream/30'}`}
                        >
                          <Star className="w-4 h-4 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Share handover experience, equipment cleanliness, promptness..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-narmis-surface border border-narmis-mountain/60 text-xs text-narmis-cream placeholder-narmis-cream/40 focus:outline-none focus:border-narmis-gold resize-none"
                    required
                  />

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-narmis-gold text-narmis-charcoal text-xs font-bold uppercase tracking-wider hover:bg-narmis-accent transition-all"
                  >
                    Post Review
                  </button>
                </form>
              )}

              {/* Reviews List or Genuine Empty State */}
              {reviewCount === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <Star className="w-8 h-8 text-narmis-cream/30 mx-auto" />
                  <p className="font-serif text-base font-semibold text-narmis-parchment">
                    No reviews yet
                  </p>
                  <p className="text-xs text-narmis-cream/60 max-w-sm mx-auto">
                    This item has not received any peer reviews yet. Complete a transaction or rental to leave the first verified feedback.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-2xl bg-narmis-forestDark/60 border border-narmis-mountain/40 text-xs">
                    <div className="flex items-center gap-1 text-amber-300 font-bold text-sm">
                      <Star className="w-4 h-4 fill-current" />
                      <span>{averageRating}</span>
                    </div>
                    <span className="text-narmis-cream/60">
                      Based on {reviewCount} verified peer review{reviewCount > 1 ? 's' : ''}
                    </span>
                  </div>

                  {listingReviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-2xl bg-narmis-forestDark/50 border border-narmis-mountain/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={rev.reviewer?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                            alt={rev.reviewer?.full_name || 'Reviewer'}
                            className="w-6 h-6 rounded-full object-cover ring-1 ring-narmis-gold/30"
                          />
                          <span className="text-xs font-bold text-narmis-parchment">
                            {rev.reviewer?.full_name || 'Verified Member'}
                          </span>
                        </div>
                        <div className="flex items-center gap-0.5 text-amber-300">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-narmis-cream/80 leading-relaxed italic">
                        "{rev.comment}"
                      </p>
                      <span className="text-[10px] text-narmis-cream/50 block">
                        {new Date(rev.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Pricing & Options (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-narmis-surface rounded-3xl p-6 sm:p-8 border border-narmis-mountain/60 shadow-xl space-y-6 sticky top-24">
              {/* Category, Title & Condition */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs uppercase tracking-wider font-semibold text-narmis-gold">
                    {listing.category}
                  </span>
                  <ConditionBadge condition={listing.condition} size="sm" />
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-narmis-parchment mt-1 leading-tight">
                  {listing.title}
                </h1>
                <div className="flex items-center gap-2 text-xs text-narmis-cream/70 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-narmis-gold shrink-0" />
                  <span>{listing.location}</span>
                </div>
              </div>

              {/* ORIGINAL MRP AND ASKING PRICE */}
              <div className="p-5 rounded-2xl bg-narmis-forestDark border border-narmis-mountain/60 space-y-3">
                <div>
                  <span className="text-xs text-narmis-cream/60 uppercase tracking-wider block">
                    Current Asking {listing.listing_type === 'rent' ? 'Rental Rate' : listing.listing_type === 'trade' ? 'Trade Valuation' : 'Price'}
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="font-serif text-3xl sm:text-4xl font-bold text-narmis-gold">
                      ₹
                      {listing.listing_type === 'rent'
                        ? listing.rental_price?.toLocaleString('en-IN')
                        : listing.listing_type === 'trade'
                        ? listing.estimated_value?.toLocaleString('en-IN')
                        : listing.purchase_price?.toLocaleString('en-IN')}
                    </span>
                    {listing.listing_type === 'rent' && (
                      <span className="text-sm text-narmis-cream/70">
                        / {listing.rental_duration || 'Day'}
                      </span>
                    )}
                  </div>
                </div>

                {listing.original_mrp && (
                  <div className="pt-3 border-t border-narmis-mountain/50 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-narmis-cream/60 block">Original Retail MRP:</span>
                      <span className="line-through text-narmis-cream/70 font-semibold">
                        ₹{listing.original_mrp.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 font-bold text-[11px] border border-emerald-600/30">
                      Circular Reuse Value
                    </div>
                  </div>
                )}
              </div>

              {/* RENTAL, TRADE, OR PURCHASE ACTION BUTTONS */}
              <div className="space-y-3">
                {listing.listing_type === 'rent' && (
                  <button
                    onClick={() => setIsRentalModalOpen(true)}
                    className="w-full py-4 rounded-2xl bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal font-serif text-sm font-bold uppercase tracking-wider transition-all shadow-xl hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Request Rental</span>
                  </button>
                )}

                {listing.listing_type === 'trade' && (
                  <div className="space-y-2">
                    <button
                      onClick={() => setIsTradeModalOpen(true)}
                      className="w-full py-4 rounded-2xl bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal font-serif text-sm font-bold uppercase tracking-wider transition-all shadow-xl hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Repeat className="w-4 h-4" />
                      <span>Make Trade Offer</span>
                    </button>
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-narmis-forestDark/80 border border-narmis-gold/30 text-[11px] text-narmis-cream/80">
                      <span>
                        {tradeAccess.subscription_active
                          ? 'Annual Trade Pass Active'
                          : `${tradeAccess.free_trials_remaining} of ${tradeAccess.free_trials_total} Free Trade Trials Left`}
                      </span>
                      <Link
                        to="/subscription"
                        className="text-narmis-gold font-bold hover:underline"
                      >
                        {tradeAccess.subscription_active ? 'Pass Info' : '₹299/yr Pass'}
                      </Link>
                    </div>
                  </div>
                )}

                {listing.listing_type === 'purchase' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      onClick={() => setIsPurchaseModalOpen(true)}
                      className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-narmis-charcoal font-serif text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-xl hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Buy Now</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAddToCartClick}
                      disabled={isOwner || listing.status !== 'active'}
                      className="w-full py-4 rounded-2xl bg-narmis-mountain hover:bg-narmis-gold hover:text-narmis-charcoal disabled:opacity-45 text-narmis-parchment font-serif text-xs sm:text-sm font-bold uppercase tracking-wider transition-all border border-narmis-gold/40 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                )}

                {/* Secondary Chat with Owner */}
                <button
                  onClick={handleContactSeller}
                  className="w-full py-3.5 rounded-2xl bg-narmis-forestDark hover:bg-narmis-mountain text-narmis-cream font-medium text-xs tracking-wider transition-all border border-narmis-mountain/60 flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 text-narmis-gold" />
                  <span>Chat with Owner</span>
                </button>

                {/* Edit Button for owner */}
                {isOwner && (
                  <Link
                    to={`/create-listing?edit=${listing.id}`}
                    className="w-full py-3 rounded-2xl bg-narmis-mountain/50 hover:bg-narmis-mountain text-narmis-parchment text-xs font-semibold tracking-wider transition-all border border-narmis-gold/30 flex items-center justify-center gap-2"
                  >
                    <Edit3 className="w-4 h-4 text-narmis-gold" />
                    <span>Edit Listing & Condition</span>
                  </Link>
                )}
              </div>

              {/* SELLER INFORMATION */}
              {listing.user && (
                <div className="pt-6 border-t border-narmis-mountain/40">
                  <span className="text-xs uppercase tracking-wider text-narmis-cream/60 font-medium block mb-3">
                    Listing Owner
                  </span>
                  <div className="flex items-start gap-4">
                    <Link to={`/profile/${listing.user.id}`}>
                      <img
                        src={listing.user.avatar_url}
                        alt={listing.user.full_name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-narmis-gold/50"
                      />
                    </Link>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Link
                          to={`/profile/${listing.user.id}`}
                          className="font-serif font-bold text-narmis-parchment hover:text-narmis-gold transition-colors text-sm"
                        >
                          {listing.user.full_name}
                        </Link>
                        {listing.user.college_verification_status === 'Verified' && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/40"
                            title={`Verified student at ${listing.user.college_name || 'Chitkara University'}`}
                          >
                            <GraduationCap className="w-3 h-3" />
                            <span>Verified Campus ID</span>
                          </span>
                        )}
                      </div>
                      {listing.user.college_name && (
                        <p className="text-[11px] text-narmis-gold/90 mt-0.5 flex items-center gap-1">
                          <GraduationCap className="w-3 h-3 shrink-0" />
                          <span>{listing.user.college_name}</span>
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-narmis-cream/70 mt-0.5">
                        <div className="flex items-center gap-1 text-amber-300 font-bold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{listing.user.rating?.toFixed(1) || '5.0'}</span>
                        </div>
                        <span>·</span>
                        <span>{listing.user.review_count || 12} reviews</span>
                      </div>
                      <p className="text-[11px] text-narmis-cream/60 mt-1 line-clamp-2">
                        {listing.user.bio || 'Active peer member.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Similar / Recommended Products */}
        {relatedListings.length > 0 && (
          <div className="mt-20 pt-12 border-t border-narmis-mountain/40">
            <h3 className="font-serif text-2xl font-bold text-narmis-parchment mb-6">
              You Might Also Be Interested In
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedListings.map((rel) => (
                <ProductCard key={rel.id} listing={rel} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Condition Photo Enlarged Modal */}
      {selectedConditionPhoto && (
        <div
          onClick={() => setSelectedConditionPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl max-h-[90vh] bg-narmis-surface rounded-3xl p-4 border border-amber-500/50 shadow-2xl space-y-3 cursor-default"
          >
            <div className="flex items-center justify-between pb-2 border-b border-narmis-mountain/40">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                <span>Condition & Defect Inspection Photo</span>
              </span>
              <button
                onClick={() => setSelectedConditionPhoto(null)}
                className="p-1 rounded-full text-narmis-cream/60 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-hidden rounded-2xl bg-black flex items-center justify-center">
              <img
                src={selectedConditionPhoto}
                alt="Defect Close-up"
                className="max-h-[75vh] w-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Transaction Modals */}
      <RentalRequestModal
        listing={listing}
        isOpen={isRentalModalOpen}
        onClose={() => setIsRentalModalOpen(false)}
      />

      <TradeOfferModal
        listing={listing}
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
      />

      <PurchaseModal
        listing={listing}
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
      />

      <ShareModal
        listing={listing}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </div>
  );
};
