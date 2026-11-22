import React from 'react';
import { HardDrive, ShieldCheck } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';

interface LocalListingsBannerProps {
  compact?: boolean;
  className?: string;
}

export const LocalListingsBanner: React.FC<LocalListingsBannerProps> = ({
  compact = false,
  className = '',
}) => {
  const { isLocalListingMode } = useMarketplace();

  if (!isLocalListingMode) return null;

  if (compact) {
    return (
      <div
        role="status"
        className={`inline-flex flex-wrap items-center gap-2 px-3.5 py-2 rounded-xl bg-narmis-surface/90 border border-narmis-gold/35 text-[11px] text-narmis-cream/85 ${className}`}
      >
        <HardDrive className="w-3.5 h-3.5 text-narmis-gold shrink-0" />
        <span>
          <strong className="text-narmis-parchment">Local Listings Mode:</strong> Listings are
          saved locally in this browser and are not synchronised across devices.
        </span>
      </div>
    );
  }

  return (
    <div
      role="status"
      className={`rounded-2xl bg-narmis-surface/90 border border-narmis-gold/40 px-4 py-3.5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-narmis-forestDark border border-narmis-gold/35 text-narmis-gold shrink-0 mt-0.5 sm:mt-0">
          <HardDrive className="w-4 h-4" />
        </div>
        <div className="space-y-0.5 text-xs">
          <p className="font-semibold text-narmis-parchment">
            Listings are currently stored locally on this device
          </p>
          <p className="text-narmis-cream/75 leading-relaxed">
            New, edited, and deleted Rent, Trade, and Purchase listings are saved in your browser&apos;s
            local storage and persist across refreshes, but are{' '}
            <span className="text-narmis-gold font-medium">not synchronised across devices</span>.
          </p>
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/35 text-[11px] font-semibold text-emerald-200 shrink-0 self-start sm:self-center">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
        <span>Auth &amp; Trade Pass live on Supabase</span>
      </div>
    </div>
  );
};
