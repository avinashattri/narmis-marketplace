import React, { useState, useEffect } from 'react';
import { ListingCategory } from '../../types';
import { CategoryFallbackArtwork } from './CategoryFallbackArtwork';

interface ProductImageProps {
  src?: string;
  alt: string;
  category?: ListingCategory | string;
  title?: string;
  className?: string;
  compact?: boolean;
  loading?: 'lazy' | 'eager';
}

export const ProductImage: React.FC<ProductImageProps> = ({
  src,
  alt,
  category,
  title,
  className = 'w-full h-full object-cover',
  compact = false,
  loading = 'lazy',
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  const trimmedSrc = typeof src === 'string' ? src.trim() : '';

  if (!trimmedSrc || hasError) {
    return (
      <CategoryFallbackArtwork
        category={category}
        title={title || alt}
        compact={compact}
      />
    );
  }

  return (
    <img
      src={trimmedSrc}
      alt={alt}
      className={className}
      loading={loading}
      onError={() => setHasError(true)}
    />
  );
};
