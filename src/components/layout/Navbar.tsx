import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Logo } from '../common/Logo';
import { DemoGuideModal } from '../common/DemoGuideModal';
import { useAuth } from '../../context/AuthContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import {
  Menu,
  X,
  PlusCircle,
  MessageSquare,
  User,
  LogOut,
  Sparkles,
  ShoppingBag,
  Repeat,
  Calendar,
  Compass,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();
  const { conversations } = useMarketplace();
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';

  // Total unread messages
  const unreadMessagesCount = conversations.reduce(
    (acc, c) => acc + (c.unread_count || 0),
    0
  );

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Explore', path: '/explore' },
    { label: 'Rent', path: '/rent' },
    { label: 'Trade', path: '/trade' },
    { label: 'Purchase', path: '/purchase' },
    { label: 'About', path: '/about' },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-narmis-bg/95 backdrop-blur-md border-b border-narmis-mountain/40 shadow-lg py-3.5 transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Logo variant="cream" />

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/'}
                  className={({ isActive }) =>
                    `px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-narmis-mountain text-narmis-parchment font-semibold shadow-inner'
                        : 'text-narmis-cream/85 hover:text-narmis-parchment hover:bg-narmis-surface/60'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Right Action Icons & Auth */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Hackathon Guide Modal Button */}
            <button
              onClick={() => setIsDemoGuideOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-narmis-mountain/60 hover:bg-narmis-mountain border border-narmis-gold/40 text-narmis-parchment transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-narmis-gold animate-pulse" />
              <span>Demo Guide</span>
            </button>

            {/* Create Listing Button */}
            <Link
              to="/create-listing"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Item</span>
            </Link>

            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                {/* Messages Icon */}
                <Link
                  to="/messages"
                  className="relative p-2 rounded-full text-narmis-cream hover:text-narmis-parchment hover:bg-narmis-surface transition-colors"
                  title="Messages"
                  aria-label="Messages"
                >
                  <MessageSquare className="w-5 h-5" />
                  {unreadMessagesCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-narmis-terracotta rounded-full ring-2 ring-narmis-bg animate-pulse" />
                  )}
                </Link>

                {/* User Profile Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-2 p-1 pl-2 pr-3 rounded-full bg-narmis-surface hover:bg-narmis-mountain/60 border border-narmis-mountain transition-colors text-left"
                    aria-expanded={isProfileDropdownOpen}
                  >
                    <img
                      src={user.avatar_url}
                      alt={user.full_name}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-narmis-gold"
                    />
                    <span className="text-xs font-medium text-narmis-cream max-w-[100px] truncate">
                      {user.full_name.split(' ')[0]}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-narmis-surface border border-narmis-mountain/70 shadow-2xl py-2 z-50 text-narmis-cream divide-y divide-narmis-mountain/40">
                      <div className="px-4 py-2.5">
                        <p className="text-xs text-narmis-parchment/70 font-serif">Signed in as</p>
                        <p className="text-sm font-semibold text-narmis-parchment truncate">{user.full_name}</p>
                        <p className="text-xs text-narmis-cream/60 truncate">{user.email}</p>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-2.5 px-4 py-2 text-xs hover:bg-narmis-mountain/50 transition-colors"
                        >
                          <User className="w-4 h-4 text-narmis-gold" />
                          <span>My Dashboard</span>
                        </Link>
                        <Link
                          to={`/profile/${user.id}`}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs hover:bg-narmis-mountain/50 transition-colors"
                        >
                          <Sparkles className="w-4 h-4 text-narmis-gold" />
                          <span>Public Profile</span>
                        </Link>
                        <Link
                          to="/messages"
                          className="flex items-center justify-between px-4 py-2 text-xs hover:bg-narmis-mountain/50 transition-colors"
                        >
                          <span className="flex items-center gap-2.5">
                            <MessageSquare className="w-4 h-4 text-narmis-gold" />
                            <span>Messages</span>
                          </span>
                          {unreadMessagesCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-narmis-terracotta text-[10px] font-bold text-white">
                              {unreadMessagesCount}
                            </span>
                          )}
                        </Link>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            logout();
                            navigate('/');
                          }}
                          className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-red-300 hover:bg-red-950/40 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-1.5 rounded-full text-xs font-semibold text-narmis-parchment hover:text-white transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-1.5 rounded-full text-xs font-semibold bg-narmis-parchment text-narmis-charcoal hover:bg-narmis-cream transition-all shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              to="/create-listing"
              className="p-2 rounded-full bg-narmis-gold text-narmis-charcoal"
              title="Create Listing"
            >
              <PlusCircle className="w-5 h-5" />
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-narmis-cream hover:bg-narmis-surface transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-narmis-surface/98 backdrop-blur-xl border-b border-narmis-mountain/60 px-4 pt-4 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1">
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-narmis-cream hover:bg-narmis-mountain/50"
            >
              <Compass className="w-4 h-4 text-narmis-gold" />
              <span>Home</span>
            </Link>
            <Link
              to="/explore"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-narmis-cream hover:bg-narmis-mountain/50"
            >
              <Compass className="w-4 h-4 text-narmis-gold" />
              <span>Explore Marketplace</span>
            </Link>
            <Link
              to="/rent"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-narmis-cream hover:bg-narmis-mountain/50"
            >
              <Calendar className="w-4 h-4 text-narmis-gold" />
              <span>Rent</span>
            </Link>
            <Link
              to="/trade"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-narmis-cream hover:bg-narmis-mountain/50"
            >
              <Repeat className="w-4 h-4 text-narmis-gold" />
              <span>Trade</span>
            </Link>
            <Link
              to="/purchase"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-narmis-cream hover:bg-narmis-mountain/50"
            >
              <ShoppingBag className="w-4 h-4 text-narmis-gold" />
              <span>Purchase</span>
            </Link>
            <Link
              to="/about"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-narmis-cream hover:bg-narmis-mountain/50"
            >
              <Sparkles className="w-4 h-4 text-narmis-gold" />
              <span>About NARMIS</span>
            </Link>
          </nav>

          <div className="pt-3 border-t border-narmis-mountain/40 flex flex-col space-y-2">
            {isAuthenticated && user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-narmis-parchment hover:bg-narmis-mountain/50"
                >
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span>Dashboard ({user.full_name})</span>
                </Link>
                <Link
                  to="/messages"
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-narmis-cream hover:bg-narmis-mountain/50"
                >
                  <span className="flex items-center gap-3">
                    <MessageSquare className="w-4 h-4 text-narmis-gold" />
                    <span>Messages</span>
                  </span>
                  {unreadMessagesCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-narmis-terracotta text-xs font-bold text-white">
                      {unreadMessagesCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-red-300 hover:bg-red-950/40 text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  className="w-full text-center py-2.5 rounded-xl text-xs font-semibold border border-narmis-mountain text-narmis-cream"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="w-full text-center py-2.5 rounded-xl text-xs font-semibold bg-narmis-parchment text-narmis-charcoal"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hackathon Demo Guide Modal */}
      <DemoGuideModal
        isOpen={isDemoGuideOpen}
        onClose={() => setIsDemoGuideOpen(false)}
      />
    </header>
  );
};
