import React from 'react';

/**
 * Normalizes any image URL to ensure production-readiness on Vercel and Vite builds.
 * Converts legacy '/src/assets/images/' paths to the production-safe '/images/' public path.
 */
export function normalizeImageUrl(url?: string, category?: string): string {
  if (!url || typeof url !== 'string') {
    return getCategoryFallbackImage(category);
  }

  // Trim whitespace
  const trimmed = url.trim();

  // If path starts with /src/assets/images/ or src/assets/images/, convert to /images/
  if (trimmed.startsWith('/src/assets/images/')) {
    return trimmed.replace('/src/assets/images/', '/images/');
  }
  if (trimmed.startsWith('src/assets/images/')) {
    return trimmed.replace('src/assets/images/', '/images/');
  }

  return trimmed;
}

/**
 * Returns a category-specific authentic fallback image
 */
export function getCategoryFallbackImage(category?: string): string {
  switch (category?.toLowerCase()) {
    case 'women':
      return '/images/mudra_women_kanchipuram_saree_1793641347386.jpg';
    case 'men':
      return '/images/mudra_men_royal_sherwani_1793641348047.jpg';
    case 'jewelry':
      return '/images/temple_necklace_set_1793794054267.jpg';
    case 'spiritual':
      return '/images/radhakrishna_peacock_pendant_1793794123748.jpg';
    default:
      return '/images/banarasi_silk_saree_1793794026510.jpg';
  }
}

/**
 * Safe image error handler that prevents infinite error loops and falls back gracefully.
 */
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  category?: string
): void {
  const target = event.currentTarget;
  const fallback = getCategoryFallbackImage(category);

  // Avoid infinite loops if the fallback itself also fails
  if (!target.dataset.hasFailed) {
    target.dataset.hasFailed = 'true';
    target.src = fallback;
  }
}
