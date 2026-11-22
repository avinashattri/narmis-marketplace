import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { Github, Heart, ShieldCheck, RefreshCw, Sparkles, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-narmis-forestDark text-narmis-cream border-t border-narmis-mountain/50 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-14">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Logo variant="cream" />
            <p className="font-serif italic text-narmis-parchment text-lg">
              Things have more than one life.
            </p>
            <p className="text-sm text-narmis-cream/70 max-w-sm leading-relaxed">
              A peer-to-peer sustainable marketplace connecting communities through circular commerce.
              Rent what you need, trade what you love, and purchase what matters.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com/avinashattri/narmis-marketplace"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-narmis-surface hover:bg-narmis-mountain border border-narmis-mountain/60 text-narmis-parchment transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>GitHub Repository</span>
              </a>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-narmis-mountain/60 text-narmis-gold border border-narmis-gold/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Campus Circular Edition</span>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-sm font-semibold tracking-wider uppercase text-narmis-parchment mb-4">
              Marketplace
            </h4>
            <ul className="space-y-2.5 text-xs text-narmis-cream/75">
              <li>
                <Link to="/explore" className="hover:text-narmis-parchment transition-colors">
                  All Listings
                </Link>
              </li>
              <li>
                <Link to="/rent" className="hover:text-narmis-parchment transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  <span>Rent Gear & Gadgets</span>
                </Link>
              </li>
              <li>
                <Link to="/trade" className="hover:text-narmis-parchment transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>Trade & Barter</span>
                </Link>
              </li>
              <li>
                <Link to="/purchase" className="hover:text-narmis-parchment transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  <span>Direct Purchase</span>
                </Link>
              </li>
              <li>
                <Link to="/create-listing" className="hover:text-narmis-parchment transition-colors">
                  Create a Listing
                </Link>
              </li>
            </ul>
          </div>

          {/* Core Philosophy */}
          <div>
            <h4 className="font-serif text-sm font-semibold tracking-wider uppercase text-narmis-parchment mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs text-narmis-cream/75">
              <li>
                <Link to="/about" className="hover:text-narmis-parchment transition-colors">
                  About NARMIS
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-narmis-parchment transition-colors">
                  User Dashboard
                </Link>
              </li>
              <li>
                <Link to="/messages" className="hover:text-narmis-parchment transition-colors">
                  Live Chat System
                </Link>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-narmis-parchment transition-colors">
                  How NARMIS Works
                </a>
              </li>
              <li>
                <span className="text-narmis-cream/50 cursor-not-allowed">Community Safety</span>
              </li>
            </ul>
          </div>

          {/* Trust & Legal */}
          <div>
            <h4 className="font-serif text-sm font-semibold tracking-wider uppercase text-narmis-parchment mb-4">
              Trust & Legal
            </h4>
            <ul className="space-y-2.5 text-xs text-narmis-cream/75">
              <li className="flex items-center gap-1.5 text-narmis-gold">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Peer Trust</span>
              </li>
              <li className="flex items-center gap-1.5 text-emerald-300">
                <RefreshCw className="w-4 h-4" />
                <span>100% Circular Mission</span>
              </li>
              <li>
                <span className="hover:text-narmis-parchment cursor-pointer">Privacy Policy</span>
              </li>
              <li>
                <Link to="/terms" className="hover:text-narmis-gold transition-colors underline-offset-4 hover:underline">
                  Terms & Conditions
                </Link>
              </li>
              <li className="flex items-center gap-1.5 pt-2 text-narmis-parchment/80">
                <Mail className="w-3.5 h-3.5" />
                <span>contact@narmis.in</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 mt-8 border-t border-narmis-mountain/30 flex flex-col sm:flex-row items-center justify-between text-xs text-narmis-cream/60 gap-4">
          <p>© {new Date().getFullYear()} NARMIS Marketplace. All rights reserved.</p>
          <div className="flex items-center gap-1 text-narmis-cream/70">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-narmis-terracotta fill-narmis-terracotta" />
            <span>for Sustainable Campus Sharing</span>
          </div>
          <p className="font-mono text-[11px] text-narmis-gold/80">
            PHILOSOPHY: RENT · TRADE · PURCHASE
          </p>
        </div>
      </div>
    </footer>
  );
};
