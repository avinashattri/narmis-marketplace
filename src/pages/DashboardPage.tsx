import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/marketplace/ProductCard';
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
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
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

  // Profile Edit State
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  if (!user) {
    return (
      <div className="pt-32 pb-24 max-w-md mx-auto px-4 text-center">
        <h2 className="font-serif text-3xl font-bold text-narmis-parchment mb-4">
          Please Log In
        </h2>
        <p className="text-xs sm:text-sm text-narmis-cream/70 mb-6">
          Access your listings, trade proposals, rental requests, and demo purchase history.
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

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      full_name: fullName,
      bio,
      location,
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
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-narmis-mountain text-narmis-gold border border-narmis-gold/30">
                  Verified Member
                </span>
              </div>
              <p className="text-xs text-narmis-cream/70 mt-1 max-w-md">
                {user.bio || 'Believer in giving things a second life.'}
              </p>
              <p className="text-[11px] text-narmis-gold mt-1">
                📍 {user.location || 'Bengaluru, India'} · Member since {user.joined_date || '2026'}
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

              {/* Recent Purchases & Rentals Card */}
              <div className="bg-narmis-surface rounded-3xl p-6 border border-narmis-mountain/60 shadow-lg space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-serif text-lg font-bold text-narmis-parchment">
                      Completed Purchases (Demo)
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
                            Receipt: {purch.receipt_number} · ₹{purch.amount}
                          </p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                          {purch.status}
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
                      <img
                        src={item.images[0]}
                        alt=""
                        className="w-16 h-16 rounded-xl object-cover shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-narmis-mountain text-narmis-parchment">
                            {item.listing_type}
                          </span>
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
            <h2 className="font-serif text-2xl font-bold text-narmis-parchment">
              Rental Requests & Bookings
            </h2>
            <div className="space-y-4">
              {rentalRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-narmis-surface rounded-2xl p-5 border border-narmis-mountain/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-sky-950 text-sky-200 border border-sky-600/40">
                      {req.status}
                    </span>
                    <h4 className="font-serif text-base font-bold text-narmis-parchment mt-1">
                      {req.listing?.title}
                    </h4>
                    <p className="text-xs text-narmis-cream/70 mt-1">
                      Dates: {req.start_date} to {req.end_date} ({req.duration_units}{' '}
                      {req.duration_type})
                    </p>
                    <p className="text-xs text-narmis-gold font-semibold mt-0.5">
                      Total Rental: ₹{req.total_amount}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateRentalStatus(req.id, 'approved')}
                      className="px-4 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500/30"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateRentalStatus(req.id, 'rejected')}
                      className="px-4 py-1.5 rounded-xl bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-bold hover:bg-red-500/30"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: TRADES */}
        {activeTab === 'trades' && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="font-serif text-2xl font-bold text-narmis-parchment">
              Trade Proposals & Negotiations
            </h2>
            <div className="space-y-4">
              {tradeOffers.map((trade) => (
                <div
                  key={trade.id}
                  className="bg-narmis-surface rounded-2xl p-5 border border-narmis-mountain/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-950 text-amber-200 border border-amber-600/40">
                      {trade.status}
                    </span>
                    <h4 className="font-serif text-base font-bold text-narmis-parchment mt-1">
                      Offered: {trade.offered_item_title} (Est. ₹{trade.offered_item_value})
                    </h4>
                    <p className="text-xs text-narmis-cream/70 mt-1">
                      Target Listing: {trade.listing?.title}
                    </p>
                    <p className="text-xs text-amber-300 font-semibold mt-0.5">
                      Cash offset:{' '}
                      {trade.cash_adjustment > 0
                        ? `+₹${trade.cash_adjustment} extra cash`
                        : trade.cash_adjustment < 0
                        ? `-₹${Math.abs(trade.cash_adjustment)} cash requested`
                        : 'No cash offset'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateTradeStatus(trade.id, 'accepted')}
                      className="px-4 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500/30"
                    >
                      Accept Offer
                    </button>
                    <button
                      onClick={() => updateTradeStatus(trade.id, 'rejected')}
                      className="px-4 py-1.5 rounded-xl bg-red-500/20 text-red-300 border border-red-500/40 text-xs font-bold hover:bg-red-500/30"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: PURCHASES */}
        {activeTab === 'purchases' && (
          <div className="space-y-6 animate-fadeIn">
            <h2 className="font-serif text-2xl font-bold text-narmis-parchment">
              Purchase History & Receipts (Demo)
            </h2>
            <div className="space-y-4">
              {purchases.map((purch) => (
                <div
                  key={purch.id}
                  className="bg-narmis-surface rounded-2xl p-5 border border-narmis-mountain/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950 text-emerald-200 border border-emerald-600/40">
                      {purch.status}
                    </span>
                    <h4 className="font-serif text-base font-bold text-narmis-parchment mt-1">
                      {purch.listing?.title}
                    </h4>
                    <p className="text-xs text-narmis-cream/70 mt-1">
                      Receipt Number: <span className="font-mono text-narmis-gold">{purch.receipt_number}</span>
                    </p>
                    <p className="text-xs text-narmis-cream/60 mt-0.5">
                      Handover address: {purch.shipping_address}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="font-serif text-xl font-bold text-emerald-400">
                      ₹{purch.amount.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] text-narmis-cream/50 uppercase">Demo Checkout</span>
                  </div>
                </div>
              ))}
            </div>
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
          <div className="bg-narmis-surface rounded-3xl p-6 sm:p-8 border border-narmis-mountain/60 max-w-xl animate-fadeIn space-y-6">
            <h2 className="font-serif text-2xl font-bold text-narmis-parchment pb-3 border-b border-narmis-mountain/40">
              Account Settings
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
                <label className="block text-xs font-semibold uppercase tracking-wider text-narmis-parchment/80 mb-1.5">
                  Neighborhood / Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60 text-sm text-narmis-cream focus:outline-none focus:border-narmis-gold"
                />
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
        )}
      </div>
    </div>
  );
};
