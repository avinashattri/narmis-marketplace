import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'cream';
}

export const Logo: React.FC<LogoProps> = ({ className = '', variant = 'cream' }) => {
  const textColor =
    variant === 'dark'
      ? 'text-narmis-charcoal'
      : variant === 'cream'
      ? 'text-narmis-cream hover:text-narmis-parchment'
      : 'text-narmis-parchment';

  return (
    <Link
      to="/"
      className={`font-serif text-2xl md:text-3xl font-extrabold tracking-[0.2em] uppercase transition-colors select-none ${textColor} ${className}`}
      aria-label="NARMIS Home"
    >
      NARMIS
    </Link>
  );
};
