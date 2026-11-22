import React, { useState } from 'react';
import { Listing } from '../../types';
import { useToast } from '../../context/ToastContext';
import {
  Share2,
  Copy,
  Check,
  X,
  MessageCircle,
  Send,
  Mail,
  ExternalLink,
  Smartphone,
} from 'lucide-react';

export const getListingPublicUrl = (listingId: string): string => {
  const origin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://narmis-marketplace-1752.netlify.app';
  return `${origin}/product/${encodeURIComponent(listingId)}`;
};

export const getListingShareText = (listing: Listing): string => {
  const priceTag =
    listing.listing_type === 'rent'
      ? `Rent for ₹${(listing.rental_price || 0).toLocaleString('en-IN')}/${listing.rental_duration || 'Day'}`
      : listing.listing_type === 'trade'
      ? `Trade (Est. ₹${(listing.estimated_value || 0).toLocaleString('en-IN')})`
      : `Buy for ₹${(listing.purchase_price || 0).toLocaleString('en-IN')}`;
  return `${listing.title} (${listing.condition}) — ${priceTag} on NARMIS Marketplace`;
};

interface ShareModalProps {
  listing: Listing;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ listing, isOpen, onClose }) => {
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const publicUrl = getListingPublicUrl(listing.id);
  const shareText = getListingShareText(listing);
  const canNativeShare =
    typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      showToast('Listing link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback copy via temporary input
      const input = document.createElement('input');
      input.value = publicUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      showToast('Listing link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (!canNativeShare) {
      await handleCopyLink();
      return;
    }
    try {
      await navigator.share({
        title: `${listing.title} | NARMIS Marketplace`,
        text: shareText,
        url: publicUrl,
      });
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        await handleCopyLink();
      }
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    `${shareText}\n${publicUrl}`
  )}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(
    publicUrl
  )}&text=${encodeURIComponent(shareText)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(
    `${listing.title} on NARMIS Marketplace`
  )}&body=${encodeURIComponent(`${shareText}\n\nView listing: ${publicUrl}`)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}&url=${encodeURIComponent(publicUrl)}`;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-narmis-surface border border-narmis-mountain w-full max-w-md rounded-3xl p-6 shadow-2xl relative text-narmis-cream space-y-5"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-narmis-cream/60 hover:text-white p-1.5 rounded-full hover:bg-narmis-mountain/50 transition-colors"
          aria-label="Close share dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-narmis-mountain/60 text-narmis-gold border border-narmis-gold/30">
            <Share2 className="w-5 h-5" />
          </div>
          <div className="pr-6">
            <h3 className="font-serif text-lg font-bold text-narmis-parchment">
              Share Listing
            </h3>
            <p className="text-xs text-narmis-cream/70 line-clamp-1">{listing.title}</p>
          </div>
        </div>

        {/* Stable Public Link Box */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-narmis-parchment/80">
            Public Listing Link
          </label>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-narmis-forestDark border border-narmis-mountain/60">
            <input
              type="text"
              readOnly
              value={publicUrl}
              onFocus={(e) => e.target.select()}
              className="flex-1 bg-transparent text-xs text-narmis-cream font-mono focus:outline-none truncate px-1.5"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shrink-0 ${
                copied
                  ? 'bg-emerald-500 text-narmis-charcoal'
                  : 'bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Native Device Share Sheet Button (Mobile / Supported Browsers) */}
        {canNativeShare && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="w-full py-3 rounded-xl bg-narmis-mountain hover:bg-narmis-gold hover:text-narmis-charcoal text-narmis-parchment text-xs font-bold uppercase tracking-wider transition-all border border-narmis-gold/40 flex items-center justify-center gap-2"
          >
            <Smartphone className="w-4 h-4" />
            <span>Share via Device Apps</span>
          </button>
        )}

        {/* Quick App Share Targets */}
        <div className="space-y-2">
          <span className="block text-[11px] font-semibold uppercase tracking-wider text-narmis-parchment/70">
            Share Directly Through Apps
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-narmis-forestDark hover:bg-emerald-950/60 border border-narmis-mountain/50 hover:border-emerald-500/40 flex flex-col items-center gap-1.5 text-xs font-medium text-narmis-cream transition-all"
            >
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              <span>WhatsApp</span>
            </a>

            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-narmis-forestDark hover:bg-sky-950/60 border border-narmis-mountain/50 hover:border-sky-500/40 flex flex-col items-center gap-1.5 text-xs font-medium text-narmis-cream transition-all"
            >
              <Send className="w-5 h-5 text-sky-400" />
              <span>Telegram</span>
            </a>

            <a
              href={emailUrl}
              className="p-3 rounded-xl bg-narmis-forestDark hover:bg-amber-950/60 border border-narmis-mountain/50 hover:border-amber-500/40 flex flex-col items-center gap-1.5 text-xs font-medium text-narmis-cream transition-all"
            >
              <Mail className="w-5 h-5 text-narmis-gold" />
              <span>Email</span>
            </a>

            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-narmis-forestDark hover:bg-narmis-mountain/60 border border-narmis-mountain/50 hover:border-narmis-gold/40 flex flex-col items-center gap-1.5 text-xs font-medium text-narmis-cream transition-all"
            >
              <ExternalLink className="w-5 h-5 text-narmis-parchment" />
              <span>Post / X</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
