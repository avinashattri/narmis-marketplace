import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Listing } from '../../types';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useToast } from '../../context/ToastContext';
import {
  Heart,
  MapPin,
  Star,
  Repeat,
  Calendar,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';

interface ProductCardProps {
  listing: Listing;
  featured?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ listing }) => {
  const { toggleSaveListing, isSaved } = useMarketplace();
  const { showToast } = useToast();
  const saved = isSaved(listing.id);
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/product/${listing.id}`);
  };

  const getBadgeStyle = () => {
    switch (listing.listing_type) {
      case 'rent':
        return {
          bg: 'bg-sky-950/80 text-sky-200 border-sky-600/40',
          icon: <Calendar className="w-3 h-3" />,
          label: 'FOR RENT',
        };
      case 'trade':
        return {
          bg: 'bg-amber-950/80 text-amber-200 border-amber-600/40',
          icon: <Repeat className="w-3 h-3" />,
          label: 'FOR TRADE',
        };
      case 'purchase':
        return {
          bg: 'bg-emerald-950/80 text-emerald-200 border-emerald-600/40',
          icon: <ShoppingBag className="w-3 h-3" />,
          label: 'FOR SALE',
        };
      default:
        return {
          bg: 'bg-narmis-mountain text-narmis-cream border-narmis-gold/30',
          icon: <Sparkles className="w-3 h-3" />,
          label: 'LISTING',
        };
    }
  };

  const badge = getBadgeStyle();

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-narmis-surface rounded-2xl border border-narmis-mountain/50 hover:border-narmis-gold/60 transition-all duration-300 shadow-md hover:shadow-2xl hover:-translate-y-1.5 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Image Thumbnail with Overlay Badges */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-narmis-forestDark">
        <img
          src={listing.images[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800'}
          alt={listing.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-narmis-charcoal/80 via-transparent to-black/30 pointer-events-none" />

        {/* Listing Type Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase backdrop-blur-md border shadow-sm ${badge.bg}`}
          >
            {badge.icon}
            {badge.label}
          </span>
        </div>

        {/* Condition Badge */}
        <div className="absolute top-3 right-12 z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-black/60 text-narmis-cream/90 backdrop-blur-md border border-white/10">
            {listing.condition}
          </span>
        </div>

        {/* Save/Favorite Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleSaveListing(listing.id);
            showToast(saved ? 'Removed from saved items' : 'Saved to your favorites', 'info');
          }}
          className={`absolute top-2.5 right-2.5 z-20 p-2 rounded-full backdrop-blur-md transition-all ${
            saved
              ? 'bg-red-500/90 text-white shadow-lg scale-110'
              : 'bg-black/40 text-narmis-cream hover:bg-black/70 hover:text-red-400'
          }`}
          aria-label={saved ? 'Remove from saved' : 'Save listing'}
        >
          <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
        </button>

        {/* Location chip bottom-left of image */}
        <div className="absolute bottom-2.5 left-3 flex items-center gap-1 text-[11px] text-narmis-cream/80 backdrop-blur-sm bg-black/40 px-2 py-0.5 rounded-md">
          <MapPin className="w-3 h-3 text-narmis-gold" />
          <span className="truncate max-w-[150px]">{listing.location.split(',')[0]}</span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-narmis-gold font-medium">
            {listing.category}
          </span>
          <h3 className="font-serif text-base font-semibold text-narmis-parchment line-clamp-1 group-hover:text-narmis-gold transition-colors mt-0.5">
            {listing.title}
          </h3>
          <p className="text-xs text-narmis-cream/70 line-clamp-2 mt-1 leading-relaxed">
            {listing.description}
          </p>
        </div>

        {/* Pricing / Exchange Info Specifics */}
        <div className="pt-2 border-t border-narmis-mountain/40 flex items-end justify-between">
          <div>
            {listing.listing_type === 'rent' && (
              <div>
                <span className="text-[10px] text-narmis-cream/60 uppercase">Rental Rate</span>
                <div className="text-lg font-bold text-narmis-parchment font-serif">
                  ₹{listing.rental_price?.toLocaleString('en-IN')}{' '}
                  <span className="text-xs font-normal text-narmis-cream/70">
                    /{listing.rental_duration || 'Day'}
                  </span>
                </div>
              </div>
            )}

            {listing.listing_type === 'trade' && (
              <div>
                <span className="text-[10px] text-narmis-cream/60 uppercase">Est. Value</span>
                <div className="text-base font-bold text-narmis-parchment font-serif">
                  ₹{listing.estimated_value?.toLocaleString('en-IN')}
                </div>
                {listing.trade_cash_adjustment !== undefined && listing.trade_cash_adjustment !== 0 && (
                  <span className="text-[10px] text-amber-300 font-medium">
                    {listing.trade_cash_adjustment > 0
                      ? `+₹${listing.trade_cash_adjustment} Cash`
                      : `-₹${Math.abs(listing.trade_cash_adjustment)} Cash`}
                  </span>
                )}
              </div>
            )}

            {listing.listing_type === 'purchase' && (
              <div>
                <span className="text-[10px] text-narmis-cream/60 uppercase">Price</span>
                <div className="text-lg font-bold text-emerald-300 font-serif">
                  ₹{listing.purchase_price?.toLocaleString('en-IN')}
                </div>
              </div>
            )}
          </div>

          {/* Quick CTA Pill */}
          <Link
            to={`/product/${listing.id}`}
            onClick={(e) => e.stopPropagation()}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-narmis-mountain/70 hover:bg-narmis-gold hover:text-narmis-charcoal text-narmis-parchment transition-all border border-narmis-mountain"
          >
            {listing.listing_type === 'rent'
              ? 'Rent'
              : listing.listing_type === 'trade'
              ? 'Trade'
              : 'Purchase'}
          </Link>
        </div>

        {/* User Mini Bar */}
        {listing.user && (
          <div className="pt-2 border-t border-narmis-mountain/30 flex items-center justify-between text-[11px] text-narmis-cream/60">
            <div className="flex items-center gap-1.5 truncate max-w-[160px]">
              <img
                src={listing.user.avatar_url}
                alt={listing.user.full_name}
                className="w-4 h-4 rounded-full object-cover"
              />
              <span className="truncate">{listing.user.full_name}</span>
            </div>
            {listing.user.rating && (
              <div className="flex items-center gap-0.5 text-amber-300 font-medium">
                <Star className="w-3 h-3 fill-current" />
                <span>{listing.user.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
