import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CastleLandscape } from '../illustrations/CastleLandscape';
import { ArrowRight, Repeat, ShieldCheck, Sparkles, ChevronDown } from 'lucide-react';

export const HeroParallax: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  // Multilayer Parallax speeds
  const skyY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const cloudsX = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const distantMountainsY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const midMountainsY = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const castleY = useTransform(scrollYProgress, [0, 1], [0, 190]);
  const foregroundY = useTransform(scrollYProgress, [0, 1], [0, 300]);

  // Hero Text smooth transition
  const textY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[92vh] md:min-h-screen flex items-center justify-center overflow-hidden bg-narmis-bg pt-20 md:pt-0"
    >
      {/* Visual Landscape Artwork with Layered Parallax */}
      <CastleLandscape
        skyY={skyY}
        cloudsX={cloudsX}
        distantMountainsY={distantMountainsY}
        midMountainsY={midMountainsY}
        castleY={castleY}
        foregroundY={foregroundY}
      />

      {/* Hero Foreground Content */}
      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center lg:items-start text-center lg:text-left"
      >
        <div className="max-w-2xl lg:max-w-xl">
          {/* Tagline Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-narmis-charcoal/80 border border-narmis-gold/50 backdrop-blur-md mb-6 shadow-xl"
          >
            <Sparkles className="w-3.5 h-3.5 text-narmis-gold" />
            <span className="text-xs uppercase tracking-widest font-semibold text-narmis-parchment">
              PEER-TO-PEER CIRCULAR MARKETPLACE
            </span>
          </motion.div>

          {/* Main Cinematic Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-narmis-parchment tracking-tight drop-shadow-[0_4px_16px_rgba(10,25,22,0.9)] leading-none"
          >
            NARMIS
          </motion.h1>

          {/* Main Brand Tagline */}
          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-serif italic text-2xl sm:text-3xl md:text-4xl text-narmis-cream mt-3 font-medium drop-shadow-md"
          >
            Things have more than one life.
          </motion.h2>

          {/* Philosophy Pillars Pill */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex items-center justify-center lg:justify-start gap-3 my-4 text-xs sm:text-sm font-semibold tracking-widest text-narmis-gold uppercase"
          >
            <span>RENT</span>
            <span className="w-1.5 h-1.5 rounded-full bg-narmis-gold/60" />
            <span>TRADE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-narmis-gold/60" />
            <span>PURCHASE</span>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="text-base sm:text-lg text-narmis-cream/90 font-sans leading-relaxed drop-shadow-md mb-8 max-w-lg"
          >
            Why buy when you can rent? Why sell when you can trade? Discover a smarter way to share,
            exchange and own things in a trusted community.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <Link
              to="/explore"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold uppercase tracking-wider bg-narmis-gold hover:bg-narmis-accent text-narmis-charcoal transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95"
            >
              <span>EXPLORE MARKETPLACE</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/trade"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold uppercase tracking-wider bg-narmis-surface/90 hover:bg-narmis-surface text-narmis-parchment border border-narmis-gold/50 backdrop-blur-md transition-all duration-300 shadow-lg hover:border-narmis-gold"
            >
              <Repeat className="w-4 h-4 text-narmis-gold" />
              <span>START TRADING</span>
            </Link>
          </motion.div>

          {/* Trust Highlights */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8 pt-6 border-t border-narmis-cream/20 flex items-center justify-center lg:justify-start gap-6 text-xs text-narmis-cream/80"
          >
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-narmis-gold" />
              <span>Verified Campus & Neighborhood Peers</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-narmis-gold" />
              <span>Zero Platform Commission (Demo)</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Down Indicator */}
      <a
        href="#features"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1 text-narmis-parchment/70 hover:text-narmis-parchment transition-colors"
        aria-label="Scroll to features"
      >
        <span className="text-[10px] tracking-widest uppercase font-semibold">DISCOVER</span>
        <ChevronDown className="w-4 h-4 animate-bounce" />
      </a>
    </section>
  );
};
