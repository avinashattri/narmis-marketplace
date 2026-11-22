import React, { useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useReducedMotion,
} from 'framer-motion';
import { Link } from 'react-router-dom';
import { MountainForestLandscape } from '../illustrations/MountainForestLandscape';
import { ArrowRight, Repeat, ShieldCheck, Sparkles, Compass } from 'lucide-react';

const PILLARS = [
  { label: 'RENT', to: '/rent' },
  { label: 'TRADE', to: '/trade' },
  { label: 'PURCHASE', to: '/purchase' },
];

export const HeroParallax: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Smooth spring-damped scroll progress for natural, cinematic depth
  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 26,
    mass: 0.35,
  });

  const activeScroll = prefersReduced ? scrollYProgress : smoothScroll;

  // Desktop mouse-parallax motion values (centered at 0)
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothMouseX = useSpring(pointerX, { stiffness: 75, damping: 24, mass: 0.6 });
  const smoothMouseY = useSpring(pointerY, { stiffness: 75, damping: 24, mass: 0.6 });

  // Multi-layer vertical scroll speeds (background slowest -> foreground fastest)
  const skyY = useTransform(activeScroll, [0, 1], [0, prefersReduced ? 0 : 36]);
  const cloudsX = useTransform(activeScroll, [0, 1], [0, prefersReduced ? 0 : 105]);
  const farMountainsY = useTransform(activeScroll, [0, 1], [0, prefersReduced ? 0 : 90]);
  const farMountainsScale = useTransform(activeScroll, [0, 1], [1, prefersReduced ? 1 : 1.045]);
  const backFogY = useTransform(activeScroll, [0, 1], [0, prefersReduced ? 0 : 120]);
  const midMountainsY = useTransform(activeScroll, [0, 1], [0, prefersReduced ? 0 : 175]);
  const nearRidgeY = useTransform(activeScroll, [0, 1], [0, prefersReduced ? 0 : 215]);
  const particlesY = useTransform(activeScroll, [0, 1], [0, prefersReduced ? 0 : 140]);
  const foregroundY = useTransform(activeScroll, [0, 1], [0, prefersReduced ? 0 : 275]);

  // Subtle horizontal/vertical mouse depth per layer (0 when reduced motion)
  const sunX = useTransform(smoothMouseX, [-1, 1], prefersReduced ? [0, 0] : [12, -12]);
  const sunY = useTransform(smoothMouseY, [-1, 1], prefersReduced ? [0, 0] : [8, -8]);
  const farMountainsX = useTransform(smoothMouseX, [-1, 1], prefersReduced ? [0, 0] : [9, -9]);
  const midMountainsX = useTransform(smoothMouseX, [-1, 1], prefersReduced ? [0, 0] : [-15, 15]);
  const nearRidgeX = useTransform(smoothMouseX, [-1, 1], prefersReduced ? [0, 0] : [-21, 21]);
  const foregroundX = useTransform(smoothMouseX, [-1, 1], prefersReduced ? [0, 0] : [-28, 28]);

  // Hero editorial text smooth lift & fade on scroll
  const textY = useTransform(activeScroll, [0, 1], [0, prefersReduced ? 0 : 115]);
  const textOpacity = useTransform(activeScroll, [0, 0.58], [1, 0]);
  const indicatorOpacity = useTransform(activeScroll, [0, 0.16], [1, 0]);

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (prefersReduced || e.pointerType !== 'mouse' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    pointerX.set(nx);
    pointerY.set(ny);
  };

  const handlePointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  const scrollToMarketplace = () => {
    const target = document.getElementById('impact') || document.getElementById('features');
    if (target) {
      target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
    }
  };

  return (
    <section
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="relative w-full min-h-[96vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-narmis-bg pt-20 md:pt-0"
    >
      {/* Cinematic Multi-Layer Mountain & Forest Wilderness */}
      <MountainForestLandscape
        skyY={skyY}
        sunX={sunX}
        sunY={sunY}
        cloudsX={cloudsX}
        farMountainsY={farMountainsY}
        farMountainsX={farMountainsX}
        farMountainsScale={farMountainsScale}
        backFogY={backFogY}
        midMountainsY={midMountainsY}
        midMountainsX={midMountainsX}
        nearRidgeY={nearRidgeY}
        nearRidgeX={nearRidgeX}
        particlesY={particlesY}
        foregroundY={foregroundY}
        foregroundX={foregroundX}
      />

      {/* Editorial Foreground Content */}
      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-28 flex flex-col items-center lg:items-start text-center lg:text-left"
      >
        <div className="max-w-2xl lg:max-w-xl">
          {/* Refined Editorial Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-narmis-charcoal/75 border border-narmis-gold/45 backdrop-blur-md mb-6 shadow-xl"
          >
            <Compass className="w-3.5 h-3.5 text-narmis-gold" />
            <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-narmis-parchment">
              Peer-to-Peer Circular Marketplace
            </span>
          </motion.div>

          {/* Main Display Heading with Masked Editorial Entrance */}
          <div className="overflow-hidden">
            <motion.h1
              initial={{ opacity: 0, y: 42, letterSpacing: '0.16em' }}
              animate={{ opacity: 1, y: 0, letterSpacing: '0.03em' }}
              transition={{ duration: 0.85, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black text-narmis-parchment drop-shadow-[0_6px_28px_rgba(13,26,24,0.85)] leading-[0.95]"
            >
              NARMIS
            </motion.h1>
          </div>

          {/* Sweeping Antique-Gold Accent Rule */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.75, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="h-[2px] w-24 bg-gradient-to-r from-narmis-gold via-narmis-parchment to-transparent mt-4 mb-3 mx-auto lg:mx-0 origin-left"
          />

          {/* Brand Tagline */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif italic text-2xl sm:text-3xl md:text-4xl text-narmis-cream font-medium drop-shadow-[0_2px_14px_rgba(13,26,24,0.75)]"
          >
            Things have more than one life.
          </motion.h2>

          {/* Interactive RENT · TRADE · PURCHASE Pillars */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center lg:justify-start gap-2.5 sm:gap-3.5 my-5 text-xs sm:text-sm font-bold tracking-[0.22em] text-narmis-gold uppercase"
          >
            {PILLARS.map((pillar, idx) => (
              <React.Fragment key={pillar.label}>
                <Link
                  to={pillar.to}
                  className="group relative py-1 px-1.5 rounded-md hover:text-narmis-parchment transition-colors"
                >
                  <span>{pillar.label}.</span>
                  <span className="absolute left-1.5 right-1.5 bottom-0 h-[1.5px] bg-narmis-parchment scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </Link>
                {idx < PILLARS.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="w-1.5 h-1.5 rounded-full bg-narmis-gold/60"
                  />
                )}
              </React.Fragment>
            ))}
          </motion.div>

          {/* Editorial Description */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.48, ease: [0.22, 1, 0.36, 1] }}
            className="text-sm sm:text-base md:text-lg text-narmis-cream/90 font-sans leading-relaxed drop-shadow-md mb-8 max-w-lg"
          >
            Why buy when you can rent? Why sell when you can trade? Discover a calmer, smarter way
            to share, exchange, and own quality gear in a trusted community.
          </motion.p>

          {/* Responsive Tactile CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.56, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto"
          >
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className="w-full sm:w-auto"
            >
              <Link
                to="/explore"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal transition-colors duration-300 shadow-[0_10px_30px_rgba(184,138,74,0.3)] hover:shadow-[0_14px_34px_rgba(184,138,74,0.45)] group"
              >
                <span>Explore Marketplace</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className="w-full sm:w-auto"
            >
              <Link
                to="/trade"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider bg-narmis-surface/80 hover:bg-narmis-surface text-narmis-parchment border border-narmis-gold/50 hover:border-narmis-gold backdrop-blur-md transition-colors duration-300 shadow-lg group"
              >
                <Repeat className="w-4 h-4 text-narmis-gold transition-transform duration-500 group-hover:rotate-180" />
                <span>Start Trading</span>
              </Link>
            </motion.div>
          </motion.div>

          {/* Subtle Editorial Trust Highlights */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.85, delay: 0.72 }}
            className="mt-8 pt-6 border-t border-narmis-parchment/15 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-narmis-cream/80"
          >
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-narmis-gold" />
              <span>Verified Campus &amp; Neighborhood Peers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-narmis-gold" />
              <span>Zero Platform Commission</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Interactive Scroll Indicator */}
      <motion.button
        type="button"
        onClick={scrollToMarketplace}
        style={{ opacity: indicatorOpacity }}
        whileHover={{ y: 2 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Scroll down to discover NARMIS"
        className="absolute bottom-7 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 text-narmis-parchment/80 hover:text-narmis-gold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-narmis-gold rounded-full px-3 py-1"
      >
        <span className="text-[10px] tracking-[0.24em] uppercase font-semibold">
          Scroll to Explore
        </span>
        <span className="w-5 h-8 rounded-full border border-narmis-gold/55 bg-narmis-charcoal/40 backdrop-blur-sm flex items-start justify-center p-1">
          <motion.span
            animate={prefersReduced ? undefined : { y: [0, 12, 0], opacity: [0.9, 0.35, 0.9] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1.5 h-1.5 rounded-full bg-narmis-gold"
          />
        </span>
      </motion.button>
    </section>
  );
};
