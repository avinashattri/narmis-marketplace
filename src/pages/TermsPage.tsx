import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Scale, ArrowLeft, Camera, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="pt-28 pb-24 bg-narmis-bg min-h-screen text-narmis-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs text-narmis-cream/70 hover:text-narmis-parchment transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-narmis-surface border border-narmis-gold/30 text-xs font-semibold uppercase tracking-wider text-narmis-gold mb-3">
            <Scale className="w-3.5 h-3.5" />
            <span>Community Trust & Platform Policy</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-narmis-parchment">
            Terms & Conditions
          </h1>
          <p className="text-xs sm:text-sm text-narmis-cream/70 mt-2">
            Version 1.0 · Last Updated: November 2026 · Governed by Applicable Indian Law
          </p>
        </div>

        {/* Core Policy Container */}
        <div className="space-y-8 bg-narmis-surface rounded-3xl p-6 sm:p-10 border border-narmis-mountain/60 shadow-2xl">
          {/* Section 1: Product Care and Damage Responsibility */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-narmis-mountain/40">
              <ShieldCheck className="w-6 h-6 text-narmis-gold" />
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-narmis-parchment">
                1. Product Care and Damage Responsibility
              </h2>
            </div>

            <div className="p-5 rounded-2xl bg-narmis-forestDark border border-narmis-gold/30 space-y-3 text-sm text-narmis-cream/90 leading-relaxed">
              <p>
                When a user rents or borrows an item through <strong>NARMIS</strong>, the user accepting possession of the item is responsible for taking reasonable care of it throughout the agreed rental period.
              </p>
              <p>
                The user is responsible for loss, damage, or misuse occurring while the product is in their possession, subject to applicable law and the circumstances of the incident.
              </p>
              <p>
                If an item is damaged or lost, the responsible user may be required to compensate the owner for the reasonable, documented repair cost or actual replacement value of the item, as applicable.
              </p>
              <p>
                The owner and renter should document the item's condition before and after the rental period, preferably using photographs.
              </p>
              <p>
                Any damage-related claim must be supported by appropriate evidence and communicated through the platform. Both parties should have an opportunity to respond to a claim.
              </p>
              <p>
                NARMIS provides a platform for connecting users and facilitating transactions. Users are responsible for providing accurate product information, following agreed transaction terms, and complying with applicable laws.
              </p>
            </div>
          </div>

          {/* Section 2: Recommended Documentation Practices */}
          <div className="space-y-3">
            <h3 className="font-serif text-lg font-bold text-narmis-parchment flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-400" />
              <span>2. Mandatory Pre-Handover Checklist</span>
            </h3>
            <p className="text-xs sm:text-sm text-narmis-cream/80 leading-relaxed">
              To protect both parties, owners and renters must follow these verification practices before completing handovers:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-4 rounded-xl bg-narmis-forestDark/60 border border-narmis-mountain/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-1.5" />
                <h4 className="text-xs font-bold text-narmis-parchment">Pre-Rental Photos</h4>
                <p className="text-[11px] text-narmis-cream/60 mt-1">
                  Take high-resolution photos of all sides, serial numbers, and functional test status.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-narmis-forestDark/60 border border-narmis-mountain/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-1.5" />
                <h4 className="text-xs font-bold text-narmis-parchment">Accessory Verification</h4>
                <p className="text-[11px] text-narmis-cream/60 mt-1">
                  Verify included cables, chargers, memory cards, and cases in presence of both peers.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-narmis-forestDark/60 border border-narmis-mountain/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mb-1.5" />
                <h4 className="text-xs font-bold text-narmis-parchment">Platform Confirmation</h4>
                <p className="text-[11px] text-narmis-cream/60 mt-1">
                  Confirm receipt and return timestamps directly in NARMIS Messages or Dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: User Representations and Indian Legal Framework */}
          <div className="space-y-3">
            <h3 className="font-serif text-lg font-bold text-narmis-parchment flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-400" />
              <span>3. User Representations & Compliance</span>
            </h3>
            <p className="text-xs sm:text-sm text-narmis-cream/80 leading-relaxed">
              By listing, renting, trading, or purchasing items on NARMIS:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-narmis-cream/70 ml-2">
              <li>You represent that you have lawful ownership or authorized possession of any item listed.</li>
              <li>You agree to provide accurate descriptions regarding product age, condition, original MRP, and included accessories.</li>
              <li>You agree not to list stolen, counterfeit, prohibited, hazardous, or restricted items under applicable Indian legislation (including the Information Technology Act, 2000 and the Consumer Protection Act, 2019).</li>
              <li>All peer transactions are entered into voluntarily between registered users.</li>
            </ul>
          </div>

          {/* Section 4: Legal Disclaimer */}
          <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-600/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200/90 leading-relaxed">
              <strong>Notice:</strong> This policy constitutes the platform terms of use for community facilitation. It is not a substitute for independent legal counsel and remains subject to ongoing legal review under applicable laws of India. NARMIS does not guarantee legal enforceability in third-party disputes outside platform remediation mechanisms.
            </div>
          </div>

          {/* Back to actions */}
          <div className="pt-4 flex justify-between items-center border-t border-narmis-mountain/40 text-xs">
            <span className="text-narmis-cream/50">Questions? Contact support@narmis.in</span>
            <Link
              to="/explore"
              className="px-6 py-2.5 rounded-full bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal font-bold uppercase tracking-wider transition-all"
            >
              Explore Marketplace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
