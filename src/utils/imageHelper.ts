import React from 'react';

/**
 * Authentic image pools per category for full 5-image galleries and fallbacks
 */
export const CATEGORY_IMAGE_POOLS: Record<string, string[]> = {
  women: [
    '/images/mudra_women_kanchipuram_saree_1793641347386.jpg',
    '/images/banarasi_silk_saree_1793794026510.jpg',
    '/images/mudra_tissue_silk_saree_1793643995228.jpg',
    '/images/mudra_kora_organza_saree_1793643995592.jpg',
    '/images/chanderi_silk_saree_1793794041755.jpg',
    '/images/chanderi_anarkali_suit_1793794151720.jpg',
    '/images/mudra_accessories_bridal_potli_1793643997562.jpg',
  ],
  men: [
    '/images/mudra_men_royal_sherwani_1793641348047.jpg',
    '/images/mens_kurta_jacket_1793794082318.jpg',
    '/images/men_dhoti_kurta_set_1793794209207.jpg',
    '/images/mens_silk_mojari_1793794096375.jpg',
    '/images/mudra_hero_divine_couture_1793641346974.jpg',
  ],
  jewelry: [
    '/images/temple_necklace_set_1793794054267.jpg',
    '/images/mudra_temple_jewelry_ornament_1793641350294.jpg',
    '/images/mudra_temple_kada_bangles_1793643997507.jpg',
    '/images/bridal_chuda_bangles_1793794068525.jpg',
    '/images/silver_temple_anklets_1793794138067.jpg',
    '/images/temple_kamarbandh_waistband_1793794110146.jpg',
  ],
  spiritual: [
    '/images/radhakrishna_peacock_pendant_1793794123748.jpg',
    '/images/mudra_spiritual_pendant_1793641347310.jpg',
    '/images/vrindavan_pooja_thali_1793794223647.jpg',
    '/images/temple_necklace_set_1793794054267.jpg',
    '/images/mudra_temple_jewelry_ornament_1793641350294.jpg',
  ],
};

/**
 * Normalizes any image URL to ensure production-readiness on Vercel and Vite builds.
 * Handles missing slashes, legacy paths, filenames without directory, and empty inputs.
 */
export function normalizeImageUrl(url?: string | null, category?: string): string {
  if (!url || typeof url !== 'string' || url.trim() === '' || url === 'undefined' || url === 'null') {
    return getCategoryFallbackImage(category);
  }

  const trimmed = url.trim();

  // If already an absolute web URL or data/blob URI, leave it intact
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  // Handle legacy /src/assets/images/ or src/assets/images/
  if (trimmed.startsWith('/src/assets/images/')) {
    return trimmed.replace('/src/assets/images/', '/images/');
  }
  if (trimmed.startsWith('src/assets/images/')) {
    return trimmed.replace('src/assets/images/', '/images/');
  }

  // Handle public/ prefix
  if (trimmed.startsWith('public/images/')) {
    return '/' + trimmed.replace('public/', '');
  }
  if (trimmed.startsWith('/public/images/')) {
    return trimmed.replace('/public/', '/');
  }

  // Handle images/ without leading slash
  if (trimmed.startsWith('images/')) {
    return '/' + trimmed;
  }

  // Handle already valid /images/ path
  if (trimmed.startsWith('/images/')) {
    return trimmed;
  }

  // Handle bare filename like "mudra_women_kanchipuram_saree_...jpg"
  if (!trimmed.startsWith('/') && (trimmed.endsWith('.jpg') || trimmed.endsWith('.png') || trimmed.endsWith('.webp') || trimmed.endsWith('.jpeg'))) {
    return `/images/${trimmed}`;
  }

  // Handle root filename like "/mudra_women_kanchipuram_saree_...jpg" that is missing "/images/"
  if (trimmed.startsWith('/') && !trimmed.startsWith('/images/')) {
    const filename = trimmed.slice(1);
    const pool = [
      ...CATEGORY_IMAGE_POOLS.women,
      ...CATEGORY_IMAGE_POOLS.men,
      ...CATEGORY_IMAGE_POOLS.jewelry,
      ...CATEGORY_IMAGE_POOLS.spiritual,
    ];
    if (pool.some((p) => p.endsWith(filename))) {
      return `/images/${filename}`;
    }
    return trimmed;
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

/**
 * Returns a category-specific authentic fallback image
 */
export function getCategoryFallbackImage(category?: string): string {
  const cat = category?.toLowerCase();
  switch (cat) {
    case 'women':
      return CATEGORY_IMAGE_POOLS.women[0];
    case 'men':
      return CATEGORY_IMAGE_POOLS.men[0];
    case 'jewelry':
      return CATEGORY_IMAGE_POOLS.jewelry[0];
    case 'spiritual':
      return CATEGORY_IMAGE_POOLS.spiritual[0];
    default:
      return CATEGORY_IMAGE_POOLS.women[1]; // Banarasi silk
  }
}

/**
 * Produces a complete 5-image gallery for any product.
 * Preserves the primary image as index 0, and supplements with 4 unique category-matching images.
 */
export function ensure5GalleryImages(images: string[] | undefined, category: string = 'women'): string[] {
  const pool = CATEGORY_IMAGE_POOLS[category.toLowerCase()] || CATEGORY_IMAGE_POOLS.women;
  const normalized = (images || [])
    .filter((img) => Boolean(img && typeof img === 'string' && img.trim()))
    .map((img) => normalizeImageUrl(img, category));

  // If already at least 5 normalized images, return them
  if (normalized.length >= 5) {
    return normalized;
  }

  // If we have some images, keep them and fill up to 5 from the pool
  const result = [...normalized];
  for (const fallback of pool) {
    if (result.length >= 5) break;
    if (!result.includes(fallback)) {
      result.push(fallback);
    }
  }

  // As a final guarantee, pad until exactly 5
  let index = 0;
  while (result.length < 5) {
    result.push(pool[index % pool.length]);
    index++;
  }

  return result;
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

  // Avoid infinite loop if the fallback also fails
  if (!target.dataset.hasFailed) {
    target.dataset.hasFailed = 'true';
    target.src = fallback;
  } else if (!target.dataset.hasFailedSvg) {
    target.dataset.hasFailedSvg = 'true';
    // Ultimate SVG fallback with gold insignia if network completely blocks image files
    target.src =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500" fill="%230C2B4E"><rect width="400" height="500" fill="%230C2B4E"/><text x="50%" y="46%" dominant-baseline="middle" text-anchor="middle" fill="%23D4AF37" font-family="serif" font-size="28" font-weight="bold">MUDRA</text><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="%23E8E2D9" font-family="sans-serif" font-size="14">Divine Heritage Collection</text></svg>';
  }
}
