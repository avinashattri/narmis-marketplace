import React, { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  HTMLMotionProps,
} from 'framer-motion';

interface ScrollRevealProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  delay?: number;
  yOffset?: number;
  className?: string;
}

/**
 * Smooth GPU-friendly viewport reveal respecting prefers-reduced-motion.
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  delay = 0,
  yOffset = 26,
  className = '',
  ...rest
}) => {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{
        duration: 0.65,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glowColor?: string;
}

/**
 * Refined 3D perspective hover tilt with subtle antique-gold light sheen.
 * Active on desktop mouse hover only; automatically disabled on touch & reduced motion.
 */
export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  maxTilt = 4.5,
  glowColor = 'rgba(234, 211, 170, 0.11)',
}) => {
  const prefersReduced = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const isHovered = useMotionValue(0);

  const smoothX = useSpring(mouseX, { stiffness: 220, damping: 24, mass: 0.5 });
  const smoothY = useSpring(mouseY, { stiffness: 220, damping: 24, mass: 0.5 });
  const smoothHover = useSpring(isHovered, { stiffness: 260, damping: 28 });

  const rotateX = useTransform(smoothY, [0, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(smoothX, [0, 1], [-maxTilt, maxTilt]);
  const glowBg = useTransform(
    [smoothX, smoothY],
    ([x, y]: number[]) =>
      `radial-gradient(360px circle at ${Math.round(x * 100)}% ${Math.round(
        y * 100
      )}%, ${glowColor}, transparent 68%)`
  );

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReduced || e.pointerType !== 'mouse' || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const px = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const py = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    mouseX.set(px);
    mouseY.set(py);
    isHovered.set(1);
  };

  const handlePointerLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
    isHovered.set(0);
  };

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div style={{ perspective: 1000 }} className="h-full">
      <motion.div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        whileHover={{ y: -6 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        className={`relative h-full will-change-transform ${className}`}
      >
        <motion.div
          aria-hidden="true"
          style={{ background: glowBg, opacity: smoothHover }}
          className="pointer-events-none absolute inset-0 rounded-[inherit] z-10"
        />
        {children}
      </motion.div>
    </div>
  );
};
