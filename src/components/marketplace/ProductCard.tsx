import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Listing } from '../../types';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ConditionBadge } from './ConditionBadge';
import { ProductImage } from './ProductImage';
import { ShareModal } from './ShareModal';
import {
  Heart,
  MapPin,
  Star,
  Repeat,
  Calendar,
  ShoppingBag,
  ShoppingCart,
  Share2,
  Sparkles,
} from 'lucide-react';

interface ProductCardProps {
  listing: Listing;
  featured?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ listing }) => {
  const { toggleSaveListing, isSaved, addToCart } = useMarketplace();
  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const saved = isSaved(listing.id);
  const navigate = useNavigate();
  const [isShareOpen, setIsShareOpen] = useState(false);

  const handleCardClick = () => {
    navigate(`/product/${listing.id}`);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await addToCart(listing.id, 1);
      showToast(`Added "${listing.title}" to your purchase cart!`, 'success');
    } catch (err: any) {
      showToast(err?.message || 'Could not add item to cart.', 'error');
    }
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
  const isOwner = Boolean(user?.id && listing.user_id === user.id);

  return (
    <>
      <motion.div
        onClick={handleCardClick}
        whileHover={{ y: -6 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        className="group relative bg-narmis-surface rounded-2xl border border-narmis-mountain/55 hover:border-narmis-gold/65 transition-colors duration-300 shadow-md hover:shadow-[0_18px_40px_rgba(13,26,24,0.65)] flex flex-col overflow-hidden cursor-pointer will-change-transform"
      >
        {/* Subtle top antique-gold shimmer rim on hover */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-narmis-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30"
        />

        {/* Image Thumbnail with Overlay Badges */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-narmis-forestDark flex items-center justify-center">
          <ProductImage
            src={listing.images && listing.images.length > 0 ? listing.images[0] : undefined}
            alt={listing.title}
            category={listing.category}
            title={listing.title}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-narmis-charcoal/85 via-transparent to-black/30 pointer-events-none" />

          {/* Listing Type Badge */}
          <div className="absolute top-3 left-3 z-10">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase backdrop-blur-md border shadow-sm transition-transform duration-300 group-hover:scale-105 ${badge.bg}`}
            >
              {badge.icon}
              {badge.label}
            </span>
          </div>

          {/* Top-right Action Buttons: Condition, Share, Save */}
          <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5">
            <ConditionBadge condition={listing.condition} size="sm" />

            <motion.button
              type="button"
              whileTap={{ scale: 0.88 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsShareOpen(true);
              }}
              className="p-2 rounded-full backdrop-blur-md bg-black/45 text-narmis-cream hover:bg-black/75 hover:text-narmis-gold transition-colors"
              aria-label="Share listing"
              title="Share listing"
            >
              <Share2 className="w-4 h-4" />
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.85 }}
              onClick={(e) => {
                e.stopPropagation();
                toggleSaveListing(listing.id);
                showToast(saved ? 'Removed from saved items' : 'Saved to your favorites', 'info');
              }}
              className={`p-2 rounded-full backdrop-blur-md transition-all ${
                saved
                  ? 'bg-red-500/90 text-white shadow-lg scale-110'
                  : 'bg-black/45 text-narmis-cream hover:bg-black/75 hover:text-red-400'
              }`}
              aria-label={saved ? 'Remove from saved' : 'Save listing'}
              title={saved ? 'Remove from saved' : 'Save listing'}
            >
              <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
            </motion.button>
          </div>

          {/* Location chip bottom-left of image */}
          <div className="absolute bottom-2.5 left-3 flex items-center gap-1 text-[11px] text-narmis-cream/85 backdrop-blur-sm bg-black/45 px-2.5 py-0.5 rounded-md border border-white/5">
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
          <div className="pt-2 border-t border-narmis-mountain/40 flex items-end justify-between gap-2">
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
                  {listing.trade_cash_adjustment !== undefined &&
                    listing.trade_cash_adjustment !== 0 && (
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

            {/* Responsive Action Pills */}
            <div className="flex items-center gap-1.5">
              {listing.listing_type === 'purchase' && !isOwner && listing.status === 'active' && (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.9 }}
                  onClick={handleAddToCart}
                  className="p-2 rounded-lg text-xs font-semibold bg-emerald-950/80 hover:bg-emerald-500 text-emerald-200 hover:text-narmis-charcoal transition-colors border border-emerald-500/40"
                  title="Add to Purchase Cart"
                  aria-label="Add to Purchase Cart"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                </motion.button>
              )}

              <motion.div whileTap={{ scale: 0.94 }}>
                <Link
                  to={`/product/${listing.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-block px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-narmis-mountain/75 hover:bg-narmis-gold hover:text-narmis-charcoal text-narmis-parchment transition-colors border border-narmis-mountain hover:border-narmis-gold"
                >
                  {listing.listing_type === 'rent'
                    ? 'Rent'
                    : listing.listing_type === 'trade'
                    ? 'Trade'
                    : 'Purchase'}
                </Link>
              </motion.div>
            </div>
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
      </motion.div>

      <ShareModal
        listing={listing}
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </>
  );
};
