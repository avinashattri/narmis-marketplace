import React, { useState, useRef, useEffect } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/marketplace/ProductCard';
import { ConditionBadge } from '../components/marketplace/ConditionBadge';
import { ProductImage } from '../components/marketplace/ProductImage';
import {
  DEFAULT_CAMPUS_LOCATION,
  DEFAULT_COLLEGE_NAME,
  formatApproximateLocation,
} from '../services/locationDefaults';
import { validateImageFile } from '../services/conditionOptions';
import {
  User,
  PlusCircle,
  Package,
  Calendar,
  Repeat,
  ShoppingBag,
  Heart,
  Settings,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  Sparkles,
  ExternalLink,
  MapPin,
  Loader2,
  Camera,
  GraduationCap,
  IdCard,
  Upload,
  X,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, updateProfile, submitCollegeVerification } = useAuth();
  const {
    listings,
    deleteListing,
    updateListing,
    savedIds,
    rentalRequests,
    tradeOffers,
    purchases,
    updateRentalStatus,
    updateTradeStatus,
  } = useMarketplace();

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'listings' | 'rentals' | 'trades' | 'purchases' | 'saved' | 'settings'
  >('overview');

  // Profile Edit State (preserves user's saved location; defaults only if none entered)
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || DEFAULT_CAMPUS_LOCATION);
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locFeedback, setLocFeedback] = useState('');

  // College Verification State (Owner Settings)
  const [collegeName, setCollegeName] = useState(user?.college_name || DEFAULT_COLLEGE_NAME);
  const [collegeIdNumber, setCollegeIdNumber] = useState(user?.college_id_number || '');
  const [collegeIdPreview, setCollegeIdPreview] = useState<string | undefined>(undefined);
  const [verificationFeedback, setVerificationFeedback] = useState<{ msg: string; isError: boolean } | null>(null);
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false);
  const collegeIdFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setBio(user.bio || '');
      setLocation(user.location || DEFAULT_CAMPUS_LOCATION);
      setCollegeName(user.college_name || DEFAULT_COLLEGE_NAME);
      setCollegeIdNumber(user.college_id_number || '');
    }
  }, [user]);

  const handleCollegeIdFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateImageFile(file);
    if (err) {
      setVerificationFeedback({ msg: err, isError: true });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCollegeIdPreview(reader.result);
        setVerificationFeedback(null);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingVerification(true);
    setVerificationFeedback(null);
    const res = await submitCollegeVerification({
      collegeName,
      collegeIdNumber,
      collegeIdImageDataUrl: collegeIdPreview,
    });
    setIsSubmittingVerification(false);
    if (res.success) {
      setVerificationFeedback({
        msg: collegeIdPreview
          ? 'College ID submitted! Your status is now Pending Verification.'
          : 'College details saved.',
        isError: false,
      });
    } else {
      setVerificationFeedback({ msg: res.error || 'Submission failed.', isError: true });
    }
  };

  const handleDetectProfileLocation = () => {
    if (!navigator.geolocation) {
      setLocFeedback('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setLocFeedback('');

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
            const detected = formatApproximateLocation(data.address || {});
            setLocation(detected);
            setLocFeedback(`Detected approximate area: ${detected}`);
          } else {
            setLocation(DEFAULT_CAMPUS_LOCATION);
            setLocFeedback('Approximate campus suggestion set.');
          }
        } catch {
          setLocation(DEFAULT_CAMPUS_LOCATION);
          setLocFeedback('Location lookup unavailable; enter your area manually.');
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        setLocFeedback('Location permission denied. Enter location manually.');
      },
      { timeout: 10000 }
    );
  };

  if (!user) {
    return (
      <div className="pt-32 pb-24 max-w-md mx-auto px-4 text-center">
        <h2 className="font-serif text-3xl font-bold text-narmis-parchment mb-4">
          Please Log In
        </h2>
        <p className="text-xs sm:text-sm text-narmis-cream/70 mb-6">
          Access your listings, trade proposals, rental requests, and purchase history.
        </p>
        <Link
          to="/login"
          className="px-6 py-2.5 rounded-full bg-narmis-gold text-narmis-charcoal text-xs font-bold uppercase tracking-wider"
        >
          Sign In
        </Link>
      </div>
    );
  }

  // User's specific items
  const myListings = listings.filter((l) => l.user_id === user.id);
  const mySavedListings = listings.filter((l) => savedIds.includes(l.id));

  // Statistics
  const activeCount = myListings.filter((l) => l.status === 'active').length;
  const pendingRentalsCount = rentalRequests.filter((r) => r.status === 'pending').length;
  const pendingTradesCount = tradeOffers.filter((t) => t.status === 'pending').length;
  const completedPurchasesCount = purchases.length;

  const verificationStatus = user.college_verification_status || 'Not Submitted';

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      full_name: fullName,
      bio,
      location: location.trim() || DEFAULT_CAMPUS_LOCATION,
    });
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
  };

  return (
    <div className="pt-28 pb-24 bg-narmis-bg min-h-screen text-narmis-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* User Profile Header Card */}
        <div className="bg-narmis-surface rounded-3xl p-6 sm:p-8 border border-narmis-mountain/60 shadow-xl mb-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <img
              src={user.avatar_url}
              alt={user.full_name}
              className="w-20 h-20 rounded-full object-cover ring-2 ring-narmis-gold shadow-lg"
            />
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-narmis-parchment">
                  {user.full_name}
                </h1>
                {verificationStatus === 'Verified' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 inline-flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    <span>Verified Campus ID</span>
                  </span>
                ) : verificationStatus === 'Pending Verification' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-500/40 inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>ID Pending Verification</span>
                  </span>
                ) : verificationStatus === 'Rejected' ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-950 text-red-300 border border-red-500/40">
                    ID Verification Rejected
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveTab('settings')}
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-narmis-mountain/80 text-narmis-cream/80 border border-narmis-gold/30 hover:border-narmis-gold transition-colors"
                  >
                    Campus ID: Not Submitted
                  </button>
                )}
              </div>
              <p className="text-xs text-narmis-cream/70 mt-1 max-w-md">
                {user.bio || 'Believer in giving things a second life.'}
              </p>
              <p className="text-[11px] text-narmis-gold mt-1">
                📍 {user.location || DEFAULT_CAMPUS_LOCATION}
                {user.college_name ? ` · 🎓 ${user.college_name}` : ''} · Member since{' '}
                {user.joined_date || '2026'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/create-listing"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal text-xs font-bold uppercase tracking-wider transition-all shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List New Item</span>
            </Link>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-narmis-surface border border-narmis-mountain/60 shadow-md mb-8 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-narmis-gold text-narmis-charcoal shadow-sm'
                : 'text-narmis-cream/80 hover:text-narmis-parchment hover:bg-narmis-mountain/40'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'listings'
                ? 'bg-narmis-gold text-narmis-charcoal shadow-sm'
                : 'text-narmis-cream/80 hover:text-narmis-parchment hover:bg-narmis-mountain/40'
            }`}
          >
            <span>My Listings</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40">
              {myListings.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('rentals')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'rentals'
                ? 'bg-narmis-gold text-narmis-charcoal shadow-sm'
                : 'text-narmis-cream/80 hover:text-narmis-parchment hover:bg-narmis-mountain/40'
            }`}
          >
            <span>Rentals</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40">
              {rentalRequests.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('trades')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'trades'
                ? 'bg-narmis-gold text-narmis-charcoal shadow-sm'
                : 'text-narmis-cream/80 hover:text-narmis-parchment hover:bg-narmis-mountain/40'
            }`}
          >
            <span>Trade Offers</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40">
              {tradeOffers.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('purchases')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'purchases'
                ? 'bg-narmis-gold text-narmis-charcoal shadow-sm'
                : 'text-narmis-cream/80 hover:text-narmis-parchment hover:bg-narmis-mountain/40'
            }`}
          >
            <span>Purchases</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40">
              {purchases.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'saved'
                ? 'bg-narmis-gold text-narmis-charcoal shadow-sm'
                : 'text-narmis-cream/80 hover:text-narmis-parchment hover:bg-narmis-mountain/40'
            }`}
          >
            <span>Saved</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40">
              {mySavedListings.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeTab === 'settings'
                ? 'bg-narmis-gold text-narmis-charcoal shadow-sm'
                : 'text-narmis-cream/80 hover:text-narmis-parchment hover:bg-narmis-mountain/40'
            }`}
          >
            Settings
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Quick Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-narmis-surface rounded-2xl p-5 border border-narmis-mountain/60 shadow-md">
                <div className="flex items-center justify-between text-narmis-gold mb-2">
                  <Package className="w-5 h-5" />
                  <span className="text-[11px] font-bold uppercase">Active Listings</span>
                </div>
                <div className="font-serif text-3xl font-bold text-narmis-parchment">
                  {activeCount}
                </div>
              </div>

              <div className="bg-narmis-surface rounded-2xl p-5 border border-narmis-mountain/60 shadow-md">
                <div className="flex items-center justify-between text-sky-400 mb-2">
                  <Calendar className="w-5 h-5" />
                  <span className="text-[11px] font-bold uppercase">Rental Requests</span>
                </div>
                <div className="font-serif text-3xl font-bold text-narmis-parchment">
                  {pendingRentalsCount}
                </div>
              </div>

              <div className="bg-narmis-surface rounded-2xl p-5 border border-narmis-mountain/60 shadow-md">
                <div className="flex items-center justify-between text-amber-400 mb-2">
                  <Repeat className="w-5 h-5" />
                  <span className="text-[11px] font-bold uppercase">Trade Proposals</span>
                </div>
                <div className="font-serif text-3xl font-bold text-narmis-parchment">
                  {pendingTradesCount}
                </div>
              </div>

              <div className="bg-narmis-surface rounded-2xl p-5 border border-narmis-mountain/60 shadow-md">
                <div className="flex items-center justify-between text-emerald-400 mb-2">
                  <ShoppingBag className="w-5 h-5" />
                  <span className="text-[11px] font-bold uppercase">Purchases</span>
                </div>
                <div className="font-serif text-3xl font-bold text-narmis-parchment">
                  {completedPurchasesCount}
                </div>
              </div>
            </div>

            {/* Recent Activity Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Trade Offers Card */}
              <div className="bg-narmis-surface rounded-3xl p-6 border border-narmis-mountain/60 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Repeat className="w-4 h-4 text-amber-400" />
                    <h3 className="font-serif text-lg font-bold text-narmis-parchment">
                      Active Trade Offers
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('trades')}
                    className="text-xs text-narmis-gold hover:underline"
                  >
                    View All
                  </button>
                </div>

                {tradeOffers.length === 0 ? (
                  <p className="text-xs text-narmis-cream/60 py-6 text-center">
                    No active trade offers currently.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {tradeOffers.slice(0, 3).map((offer) => (
                      <div
                        key={offer.id}
                        className="p-3.5 rounded-2xl bg-narmis-forestDark/80 border border-narmis-mountain/40 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-narmis-parchment">
                            {offer.offered_item_title}
                          </p>
                          <p className="text-[11px] text-narmis-cream/60">
                            Est. ₹{offer.offered_item_value} · for {offer.listing?.title}
                          </p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-950/80 text-amber-300 border border-amber-500/40">
                          {offer.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Purchases Card */}
              <div className="bg-narmis-surface rounded-3xl p-6 border border-narmis-mountain/60 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-serif text-lg font-bold text-narmis-parchment">
                      Purchase & Payment Records
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('purchases')}
                    className="text-xs text-narmis-gold hover:underline"
                  >
                    View All
                  </button>
                </div>

                {purchases.length === 0 ? (
                  <p className="text-xs text-narmis-cream/60 py-6 text-center">
                    No purchases recorded yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {purchases.slice(0, 3).map((purch) => (
                      <div
                        key={purch.id}
                        className="p-3.5 rounded-2xl bg-narmis-forestDark/80 border border-narmis-mountain/40 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-narmis-parchment">{purch.listing?.title}</p>
                          <p className="text-[11px] text-narmis-cream/60">
                            Ref: {purch.receipt_number} · ₹{purch.amount}
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            purch.status === 'completed'
                              ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                              : 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {purch.status === 'payment_submitted' ? 'Payment Submitted' : purch.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY LISTINGS */}
        {activeTab === 'listings' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-2xl font-bold text-narmis-parchment">
                Manage My Listings ({myListings.length})
              </h2>
              <Link
                to="/create-listing"
                className="px-4 py-2 rounded-full bg-narmis-gold text-narmis-charcoal text-xs font-bold uppercase tracking-wider"
              >
                + New Listing
              </Link>
            </div>

            {myListings.length === 0 ? (
              <div className="bg-narmis-surface rounded-3xl p-12 text-center border border-narmis-mountain/40">
                <p className="text-sm text-narmis-cream/70 mb-4">You have not listed any items yet.</p>
                <Link
                  to="/create-listing"
                  className="px-6 py-2.5 rounded-full bg-narmis-gold text-narmis-charcoal text-xs font-bold uppercase tracking-wider"
                >
                  Create Your First Listing
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myListings.map((item) => (
                  <div
                    key={item.id}
                    className="bg-narmis-surface rounded-2xl p-4 sm:p-5 border border-narmis-mountain/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-narmis-forestDark">
                        <ProductImage
                          src={item.images?.[0]}
                          alt={item.title}
                          category={item.category}
                          title={item.title}
                          compact
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-narmis-mountain text-narmis-parchment">
                            {item.listing_type}
                          </span>
                          <ConditionBadge condition={item.condition} size="sm" />
                          <span className="text-xs text-narmis-cream/50">· {item.category}</span>
                        </div>
                        <h4 className="font-serif text-base font-bold text-narmis-parchment mt-0.5">
                          {item.title}
                        </h4>
                        <p className="text-xs text-narmis-gold font-semibold">
                          {item.listing_type === 'rent'
                            ? `₹${item.rental_price}/${item.rental_duration}`
                            : item.listing_type === 'trade'
                            ? `Est. ₹${item.estimated_value}`
                            : `₹${item.purchase_price}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <Link
                        to={`/product/${item.id}`}
                        className="p-2 rounded-xl bg-narmis-mountain/40 hover:bg-narmis-mountain text-narmis-cream text-xs flex items-center gap-1"
                        title="View Live Listing"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span className="hidden sm:inline">View</span>
                      </Link>

                      <Link
                        to={`/create-listing?edit=${item.id}`}
                        className="p-2 rounded-xl bg-narmis-gold/20 hover:bg-narmis-gold/30 text-narmis-gold text-xs flex items-center gap-1 border border-narmis-gold/30"
                        title="Edit Listing & Condition"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </Link>

                      <button
                        onClick={() =>
                          updateListing(item.id, {
                            status: item.status === 'active' ? 'inactive' : 'active',
                          })
                        }
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold ${
                          item.status === 'active'
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-600/40'
                            : 'bg-emerald-950/60 text-emerald-300 border border-emerald-600/40'
                        }`}
                      >
                        {item.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>

                      <button
                        onClick={() => deleteListing(item.id)}
                        className="p-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 transition-colors"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: RENTALS */}
        {activeTab === 'rentals' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-narmis-parchment">
                  Rental Requests & Bookings
                </h2>
                <p className="text-xs text-narmis-cream/60">
                  Review rental requests, verify availability, and approve reservations.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-sky-950/80 text-sky-300 border border-sky-600/40 text-xs font-bold">
                {rentalRequests.length} Total Bookings
              </span>
            </div>

            {rentalRequests.length === 0 ? (
              <div className="bg-narmis-surface rounded-3xl p-10 text-center border border-narmis-mountain/50 text-xs text-narmis-cream/60">
                No rental bookings or requests recorded yet.
              </div>
            ) : (
              <div className="space-y-4">
                {rentalRequests.map((req) => {
                  const isIncoming = req.owner_id === user.id;

                  return (
                    <div
                      key={req.id}
                      className="bg-narmis-surface rounded-2xl p-5 border border-narmis-mountain/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              req.status === 'approved'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                : req.status === 'rejected'
                                ? 'bg-red-950 text-red-300 border border-red-500/40'
                                : req.status === 'cancelled'
                                ? 'bg-gray-800 text-gray-400 border border-gray-600'
                                : 'bg-sky-950 text-sky-200 border border-sky-600/40'
                            }`}
                          >
                            {req.status === 'approved' ? '✓ Confirmed & Approved' : req.status}
                          </span>
                          <span className="text-[11px] text-narmis-gold font-medium">
                            {isIncoming ? 'Incoming Request from ' + (req.renter?.full_name || 'Renter') : 'Your Request to Owner'}
                          </span>
                        </div>

                        <h4 className="font-serif text-base font-bold text-narmis-parchment">
                          {req.listing?.title}
                        </h4>

                        <p className="text-xs text-narmis-cream/70">
                          Dates: <strong>{req.start_date}</strong> → <strong>{req.end_date}</strong> ({req.duration_units}{' '}
                          {req.duration_type})
                        </p>

                        <p className="text-xs text-narmis-gold font-semibold">
                          Total Rental Amount: ₹{req.total_amount}
                        </p>

                        {req.message && (
                          <p className="text-xs text-narmis-cream/60 italic bg-narmis-forestDark/50 p-2 rounded-xl">
                            "{req.message}"
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                        <Link
                          to="/messages"
                          className="px-3 py-1.5 rounded-xl bg-narmis-mountain/60 hover:bg-narmis-mountain text-narmis-parchment text-xs font-semibold"
                        >
                          Chat / Negotiate
                        </Link>

                        {isIncoming && req.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateRentalStatus(req.id, 'approved')}
                              className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-narmis-charcoal text-xs font-bold shadow"
                            >
                              Confirm & Approve
                            </button>
                            <button
                              onClick={() => updateRentalStatus(req.id, 'rejected')}
                              className="px-3 py-1.5 rounded-xl bg-red-950/60 text-red-300 border border-red-500/40 text-xs font-bold hover:bg-red-900/60"
                            >
                              Decline
                            </button>
                          </>
                        )}

                        {!isIncoming && req.status === 'pending' && (
                          <button
                            onClick={() => updateRentalStatus(req.id, 'cancelled')}
                            className="px-3 py-1.5 rounded-xl bg-narmis-forestDark text-narmis-cream/60 border border-narmis-mountain/40 text-xs hover:text-white"
                          >
                            Cancel Request
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: TRADES */}
        {activeTab === 'trades' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-narmis-parchment">
                  Trade Proposals & Negotiations
                </h2>
                <p className="text-xs text-narmis-cream/60">
                  Negotiate exchanges, adjust cash offsets, and accept barter terms.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-950/80 text-amber-300 border border-amber-600/40 text-xs font-bold">
                {tradeOffers.length} Active Trades
              </span>
            </div>

            {tradeOffers.length === 0 ? (
              <div className="bg-narmis-surface rounded-3xl p-10 text-center border border-narmis-mountain/50 text-xs text-narmis-cream/60">
                No trade proposals recorded yet.
              </div>
            ) : (
              <div className="space-y-4">
                {tradeOffers.map((trade) => {
                  const isIncoming = trade.owner_id === user.id;

                  return (
                    <div
                      key={trade.id}
                      className="bg-narmis-surface rounded-2xl p-5 border border-narmis-mountain/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              trade.status === 'accepted'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                : trade.status === 'rejected'
                                ? 'bg-red-950 text-red-300 border border-red-500/40'
                                : trade.status === 'cancelled'
                                ? 'bg-gray-800 text-gray-400 border border-gray-600'
                                : 'bg-amber-950 text-amber-200 border border-amber-600/40'
                            }`}
                          >
                            {trade.status === 'accepted' ? '✓ Accepted & Finalized' : trade.status}
                          </span>
                          <span className="text-[11px] text-narmis-gold font-medium">
                            {isIncoming ? 'Proposal from ' + (trade.requester?.full_name || 'Peer') : 'Your Offer to Owner'}
                          </span>
                        </div>

                        <h4 className="font-serif text-base font-bold text-narmis-parchment">
                          Offered: {trade.offered_item_title} (Est. ₹{trade.offered_item_value})
                        </h4>

                        <p className="text-xs text-narmis-cream/70">
                          Target Listing: <strong className="text-narmis-parchment">{trade.listing?.title}</strong>
                        </p>

                        <p className="text-xs text-amber-300 font-semibold">
                          Cash offset:{' '}
                          {trade.cash_adjustment > 0
                            ? `+₹${trade.cash_adjustment} extra cash`
                            : trade.cash_adjustment < 0
                            ? `-₹${Math.abs(trade.cash_adjustment)} cash requested`
                            : 'No cash offset (Straight Trade)'}
                        </p>

                        {trade.negotiation_notes && (
                          <p className="text-xs text-narmis-cream/60 italic bg-narmis-forestDark/50 p-2 rounded-xl">
                            "{trade.negotiation_notes}"
                          </p>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                        <Link
                          to="/messages"
                          className="px-3 py-1.5 rounded-xl bg-narmis-mountain/60 hover:bg-narmis-mountain text-narmis-parchment text-xs font-semibold"
                        >
                          Chat / Negotiate
                        </Link>

                        {isIncoming && trade.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateTradeStatus(trade.id, 'accepted')}
                              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-narmis-charcoal text-xs font-bold shadow"
                            >
                              Accept Deal
                            </button>
                            <button
                              onClick={() => updateTradeStatus(trade.id, 'rejected')}
                              className="px-3 py-1.5 rounded-xl bg-red-950/60 text-red-300 border border-red-500/40 text-xs font-bold hover:bg-red-900/60"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {!isIncoming && trade.status === 'pending' && (
                          <button
                            onClick={() => updateTradeStatus(trade.id, 'cancelled')}
                            className="px-3 py-1.5 rounded-xl bg-narmis-forestDark text-narmis-cream/60 border border-narmis-mountain/40 text-xs hover:text-white"
                          >
                            Cancel Offer
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PURCHASES */}
        {activeTab === 'purchases' && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="font-serif text-2xl font-bold text-narmis-parchment">
              Purchase History & Payment Records
            </h2>
            {purchases.length === 0 ? (
              <div className="bg-narmis-surface rounded-3xl p-12 text-center border border-narmis-mountain/40">
                <p className="text-sm text-narmis-cream/70">No purchase submissions recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {purchases.map((purch) => (
                  <div
                    key={purch.id}
                    className="bg-narmis-surface rounded-2xl p-5 border border-narmis-mountain/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          purch.status === 'completed'
                            ? 'bg-emerald-950 text-emerald-200 border border-emerald-600/40'
                            : 'bg-amber-950 text-amber-200 border border-amber-500/40'
                        }`}
                      >
                        {purch.status === 'payment_submitted'
                          ? 'Payment Submitted · Pending Verification'
                          : purch.status}
                      </span>
                      <h4 className="font-serif text-base font-bold text-narmis-parchment mt-1">
                        {purch.listing?.title}
                      </h4>
                      <p className="text-xs text-narmis-cream/70 mt-1">
                        Reference Number:{' '}
                        <span className="font-mono text-narmis-gold">{purch.receipt_number}</span>
                        {purch.payment_reference && (
                          <span className="ml-2 text-narmis-cream/60">
                            · UPI UTR: <span className="font-mono">{purch.payment_reference}</span>
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-narmis-cream/60 mt-0.5">
                        Handover address: {purch.shipping_address}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="font-serif text-xl font-bold text-narmis-gold">
                        ₹{purch.amount.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-narmis-cream/60 uppercase">
                        {purch.payment_method || 'UPI QR Payment'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: SAVED ITEMS */}
        {activeTab === 'saved' && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="font-serif text-2xl font-bold text-narmis-parchment">
              Saved Items ({mySavedListings.length})
            </h2>
            {mySavedListings.length === 0 ? (
              <div className="bg-narmis-surface rounded-3xl p-12 text-center border border-narmis-mountain/40">
                <p className="text-sm text-narmis-cream/70">You have not bookmarked any items yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {mySavedListings.map((item) => (
                  <ProductCard key={item.id} listing={item} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
            <div className="bg-narmis-surface rounded-3xl p-6 sm:p-8 border border-narmis-mountain/60 space-y-6">
              <h2 className="font-serif text-2xl font-bold text-narmis-parchment pb-3 border-b border-narmis-mountain/40">
                Account & Location Settings
              </h2>

              {isSavedNotice && (
                <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs">
                  Profile changes successfully updated!
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-sm text-narmis-cream focus:outline-none focus:border-narmis-gold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                    Bio / Tagline
                  </label>
                  <textarea
                    rows={2}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-sm text-narmis-cream focus:outline-none focus:border-narmis-gold resize-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80">
                      Campus / Neighborhood Location
                    </label>
                    <button
                      type="button"
                      onClick={handleDetectProfileLocation}
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
                    className="w-full px-4 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-sm text-narmis-cream focus:outline-none focus:border-narmis-gold"
                  />
                  {locFeedback && (
                    <p className="text-[11px] text-narmis-gold/90 mt-1">{locFeedback}</p>
                  )}
                  <p className="text-[11px] text-narmis-cream/60 mt-1">
                    Only your approximate area or campus name is shown publicly. Exact coordinates
                    are never exposed.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal text-xs font-bold uppercase tracking-wider transition-all shadow-md"
                  >
                    Save Profile Changes
                  </button>
                </div>
              </form>
            </div>

            {/* College ID Verification Panel (Private Owner Controls) */}
            <div className="bg-narmis-surface rounded-3xl p-6 sm:p-8 border border-narmis-mountain/60 space-y-5">
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-narmis-mountain/40">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-narmis-gold" />
                  <h2 className="font-serif text-xl font-bold text-narmis-parchment">
                    Campus ID Verification
                  </h2>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    verificationStatus === 'Verified'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : verificationStatus === 'Pending Verification'
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      : verificationStatus === 'Rejected'
                      ? 'bg-red-950 text-red-300 border border-red-500/40'
                      : 'bg-narmis-forestDark text-narmis-cream/70 border border-narmis-mountain/60'
                  }`}
                >
                  {verificationStatus}
                </span>
              </div>

              {verificationFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs border ${
                    verificationFeedback.isError
                      ? 'bg-red-950/60 border-red-500/50 text-red-200'
                      : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                  }`}
                >
                  {verificationFeedback.msg}
                </div>
              )}

              <form onSubmit={handleVerificationSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                    College / University
                  </label>
                  <input
                    type="text"
                    value={collegeName}
                    onChange={(e) => setCollegeName(e.target.value)}
                    placeholder={DEFAULT_COLLEGE_NAME}
                    className="w-full px-4 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-sm text-narmis-cream focus:outline-none focus:border-narmis-gold"
                    required
                  />
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-sm text-narmis-cream focus:outline-none focus:border-narmis-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                    College ID Card Photo (Private)
                  </label>
                  <input
                    ref={collegeIdFileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleCollegeIdFileSelect}
                    className="hidden"
                  />

                  {collegeIdPreview ? (
                    <div className="p-3 rounded-2xl bg-narmis-forestDark border border-narmis-gold/40 space-y-2">
                      <div className="relative rounded-xl overflow-hidden bg-black/30 max-h-40 flex items-center justify-center">
                        <img
                          src={collegeIdPreview}
                          alt="College ID card preview"
                          className="max-h-40 w-auto object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => setCollegeIdPreview(undefined)}
                          className="absolute top-2 right-2 p-1 rounded-full bg-red-950/90 text-red-200 hover:bg-red-800"
                          title="Remove selected image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => collegeIdFileRef.current?.click()}
                        className="text-[11px] text-narmis-gold hover:underline font-semibold"
                      >
                        Replace ID Image
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => collegeIdFileRef.current?.click()}
                      className="w-full p-4 rounded-2xl border-2 border-dashed border-narmis-mountain/70 hover:border-narmis-gold/70 bg-narmis-forestDark/50 text-center transition-colors"
                    >
                      <Upload className="w-5 h-5 text-narmis-gold mx-auto mb-1" />
                      <span className="block text-xs font-semibold text-narmis-parchment">
                        {verificationStatus === 'Pending Verification'
                          ? 'Upload New College ID Photo (Optional)'
                          : 'Upload College ID'}
                      </span>
                      <span className="block text-[11px] text-narmis-cream/60">
                        JPG, PNG, or WebP · Max 8 MB
                      </span>
                    </button>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-narmis-forestDark/70 border border-narmis-mountain/40 text-[11px] text-narmis-cream/75 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-narmis-gold shrink-0 mt-0.5" />
                  <span>
                    ID documents are stored privately in restricted storage and are never shown on
                    public profiles. Verification is granted after manual review.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingVerification}
                  className="px-6 py-2.5 rounded-full bg-narmis-mountain hover:bg-narmis-gold hover:text-narmis-charcoal text-narmis-parchment text-xs font-bold uppercase tracking-wider border border-narmis-gold/40 transition-all"
                >
                  {isSubmittingVerification ? 'Submitting...' : 'Submit for Verification'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
