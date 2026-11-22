import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { DEMO_PROFILES } from '../services/mockData';
import { ProductCard } from '../components/marketplace/ProductCard';
import { DEFAULT_CAMPUS_LOCATION } from '../services/locationDefaults';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { UserProfile } from '../types';
import { Star, MapPin, MessageSquare, GraduationCap, ArrowLeft } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { listings, startOrGetConversation } = useMarketplace();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [fetchedProfile, setFetchedProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !id || user?.id === id) return;
    let cancelled = false;
    supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled && data) {
          setFetchedProfile({
            id: data.id,
            full_name: data.full_name,
            avatar_url: data.avatar_url,
            bio: data.bio,
            location: data.location,
            college_name: data.college_name,
            college_verification_status: data.college_verification_status,
            rating: data.rating,
            review_count: data.review_count,
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id, user?.id]);

  // Sensitive fields (college_id_number, college_id_image) are NEVER rendered on public profiles
  const matchedFromListings = listings.find((l) => l.user_id === id)?.user;
  const profile: UserProfile =
    user?.id === id && user
      ? user
      : fetchedProfile ||
        DEMO_PROFILES.find((p) => p.id === id) ||
        matchedFromListings || {
          id: id || '',
          full_name: 'Marketplace Member',
          avatar_url:
            'https://ui-avatars.com/api/?name=Member&background=304943&color=EAD3AA&bold=true&size=150',
          bio: 'NARMIS circular community member.',
          location: DEFAULT_CAMPUS_LOCATION,
          college_verification_status: 'Not Submitted',
          rating: 5.0,
          review_count: 0,
          joined_date: '2026',
        };

  const userListings = listings.filter((l) => l.user_id === profile.id && l.status === 'active');

  const handleMessage = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    await startOrGetConversation(userListings[0]?.id || '', profile.id, `Hello ${profile.full_name}`);
    navigate('/messages');
  };

  const isCollegeVerified = profile.college_verification_status === 'Verified';

  return (
    <div className="pt-28 pb-24 bg-narmis-bg min-h-screen text-narmis-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 text-xs text-narmis-cream/70 hover:text-narmis-parchment mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>

        {/* Public Profile Bio Card */}
        <div className="bg-narmis-surface rounded-3xl p-6 sm:p-10 border border-narmis-mountain/60 shadow-xl mb-12 flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-narmis-gold/60 shadow-xl"
            />
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="font-serif text-3xl font-bold text-narmis-parchment">
                  {profile.full_name}
                </h1>
                {/* Small campus badge shown ONLY when user's verification status is genuinely Verified */}
                {isCollegeVerified && (
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 flex items-center gap-1"
                    title={`Verified student at ${profile.college_name || 'Chitkara University'}`}
                  >
                    <GraduationCap className="w-3 h-3" />
                    <span>Verified Campus ID</span>
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-narmis-cream/80">
                <div className="flex items-center gap-1 text-amber-300 font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{profile.rating?.toFixed(1) || '5.0'}</span>
                </div>
                <span>·</span>
                <span>{profile.review_count || 0} community reviews</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-narmis-gold" />
                  <span>{profile.location || DEFAULT_CAMPUS_LOCATION}</span>
                </span>
                {profile.college_name && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-narmis-gold">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>{profile.college_name}</span>
                    </span>
                  </>
                )}
              </div>

              <p className="text-xs sm:text-sm text-narmis-cream/70 max-w-lg leading-relaxed pt-1">
                {profile.bio || 'Passionate about sustainable living, gadgets, and sharing resources.'}
              </p>
            </div>
          </div>

          {user?.id !== profile.id && (
            <button
              onClick={handleMessage}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal text-xs font-bold uppercase tracking-wider transition-all shadow-md"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Contact Member</span>
            </button>
          )}
        </div>

        {/* User Listings Grid */}
        <div>
          <h2 className="font-serif text-2xl font-bold text-narmis-parchment mb-6">
            Active Listings by {profile.full_name} ({userListings.length})
          </h2>

          {userListings.length === 0 ? (
            <div className="bg-narmis-surface rounded-3xl p-12 text-center border border-narmis-mountain/40">
              <p className="text-sm text-narmis-cream/70">No active listings available right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userListings.map((item) => (
                <ProductCard key={item.id} listing={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
