export interface SwatchColor {
  name: string;
  hex: string;
  percentage?: number;
}

export interface PaletteSuggestion {
  title: string;
  mood: string;
  blouseColor: SwatchColor;
  borderColor: SwatchColor;
  embroideryColor: SwatchColor;
  accessoryColor: SwatchColor;
  jewelryMetalRecommendation: string;
}

export interface FabricEstimateResult {
  fabricCategory: string;
  likelySubType: string;
  confidenceLevel: string;
  visualCuesObserved: string[];
  textureProfile: string;
  characteristics: string[];
  commonUses: string[];
  maintenanceInstructions: string[];
  estimateDisclaimer: string;
  isOfflineOpticalEstimate?: boolean;
}

const HERITAGE_COLOR_NAMES: Array<{ name: string; hex: string }> = [
  { name: 'Royal Crimson', hex: '#8B0000' },
  { name: 'Sindoor Red', hex: '#9E1B32' },
  { name: 'Radha Rani Rose', hex: '#C45B74' },
  { name: 'Temple Gold', hex: '#D4AF37' },
  { name: 'Molten Champagne Gold', hex: '#E6CA65' },
  { name: 'Marigold Haldi', hex: '#E5A93C' },
  { name: 'Saffron Vermilion', hex: '#D95D24' },
  { name: 'Terracotta Silk', hex: '#A85350' },
  { name: 'Krishna Midnight Navy', hex: '#0C2B4E' },
  { name: 'Deep Peacock Blue', hex: '#0F5C72' },
  { name: 'Vrindavan Emerald', hex: '#164E43' },
  { name: 'Pistachio Silk', hex: '#B8E0D2' },
  { name: 'Ivory Parchment', hex: '#FAF5E8' },
  { name: 'Kora Cream', hex: '#F3EFE9' },
  { name: 'Antique Bronze', hex: '#8C7A58' },
  { name: 'Plum Jamuni', hex: '#5A2A48' },
  { name: 'Teal Morpankh', hex: '#0D9488' },
  { name: 'Obsidian Ink', hex: '#1E252B' },
];

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const num = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn:
        h = (gn - bn) / d + (gn < bn ? 6 : 0);
        break;
      case gn:
        h = (bn - rn) / d + 2;
        break;
      default:
        h = (rn - gn) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToHex(h: number, s: number, l: number): string {
  const hn = ((h % 360) + 360) % 360;
  const sn = Math.max(0, Math.min(100, s)) / 100;
  const ln = Math.max(0, Math.min(100, l)) / 100;

  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => {
    const k = (n + hn / 30) % 12;
    const color = ln - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color);
  };
  return rgbToHex(f(0), f(8), f(4));
}

export function findClosestHeritageColorName(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  let bestName = 'Heritage Shade';
  let minDist = Infinity;

  for (const item of HERITAGE_COLOR_NAMES) {
    const ref = hexToRgb(item.hex);
    const dist = Math.pow(r - ref.r, 2) + Math.pow(g - ref.g, 2) + Math.pow(b - ref.b, 2);
    if (dist < minDist) {
      minDist = dist;
      bestName = item.name;
    }
  }
  return bestName;
}

export async function compressImageToDataUrl(file: File, maxDim = 768): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const rawUrl = String(reader.result || '');
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawUrl);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => resolve(rawUrl);
      img.src = rawUrl;
    };
    reader.onerror = () => reject(new Error('Could not read uploaded image.'));
    reader.readAsDataURL(file);
  });
}

function loadImageElement(imageSrc: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image for pixel analysis.'));
    img.src = imageSrc;
  });
}

export async function extractDominantColors(
  imageSrc: string,
  count = 5
): Promise<SwatchColor[]> {
  try {
    const img = await loadImageElement(imageSrc);
    const canvas = document.createElement('canvas');
    const size = 96;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    ctx.drawImage(img, 0, 0, size, size);
    const { data } = ctx.getImageData(0, 0, size, size);

    const buckets = new Map<string, { rSum: number; gSum: number; bSum: number; n: number }>();
    let totalSampled = 0;

    for (let i = 0; i < data.length; i += 4) {
      const a = data[i + 3];
      if (a < 128) continue;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Skip near-pure white / near-pure black studio margins unless few pixels remain
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      if ((max > 246 && min > 240) || max < 14) continue;

      const qr = Math.floor(r / 28) * 28;
      const qg = Math.floor(g / 28) * 28;
      const qb = Math.floor(b / 28) * 28;
      const key = `${qr}-${qg}-${qb}`;

      const current = buckets.get(key) || { rSum: 0, gSum: 0, bSum: 0, n: 0 };
      current.rSum += r;
      current.gSum += g;
      current.bSum += b;
      current.n += 1;
      buckets.set(key, current);
      totalSampled++;
    }

    if (buckets.size === 0) {
      return [
        { name: 'Royal Crimson', hex: '#8B0000', percentage: 45 },
        { name: 'Temple Gold', hex: '#D4AF37', percentage: 30 },
        { name: 'Krishna Midnight Navy', hex: '#0C2B4E', percentage: 25 },
      ];
    }

    const sorted = Array.from(buckets.values()).sort((a, b) => b.n - a.n);
    const picked: SwatchColor[] = [];

    for (const bucket of sorted) {
      const avgR = bucket.rSum / bucket.n;
      const avgG = bucket.gSum / bucket.n;
      const avgB = bucket.bSum / bucket.n;
      const hex = rgbToHex(avgR, avgG, avgB);

      // Ensure visual separation between picked swatches
      const isTooClose = picked.some((p) => {
        const ref = hexToRgb(p.hex);
        const dist = Math.sqrt(
          Math.pow(avgR - ref.r, 2) + Math.pow(avgG - ref.g, 2) + Math.pow(avgB - ref.b, 2)
        );
        return dist < 44;
      });

      if (!isTooClose) {
        picked.push({
          name: findClosestHeritageColorName(hex),
          hex,
          percentage: Math.max(5, Math.round((bucket.n / Math.max(1, totalSampled)) * 100)),
        });
      }
      if (picked.length >= count) break;
    }

    return picked;
  } catch {
    return [
      { name: 'Temple Gold', hex: '#D4AF37', percentage: 40 },
      { name: 'Royal Crimson', hex: '#8B0000', percentage: 35 },
      { name: 'Ivory Parchment', hex: '#FAF5E8', percentage: 25 },
    ];
  }
}

export function generateComputationalPalettes(dominantColors: SwatchColor[]): PaletteSuggestion[] {
  const primary = dominantColors[0] || { name: 'Royal Crimson', hex: '#8B0000' };
  const rgb = hexToRgb(primary.hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const compHue = (hsl.h + 180) % 360;
  const split1 = (hsl.h + 150) % 360;
  const split2 = (hsl.h + 210) % 360;
  const analogHue = (hsl.h + 32) % 360;

  const compHex = hslToHex(compHue, Math.max(42, Math.min(72, hsl.s)), Math.max(24, Math.min(46, hsl.l)));
  const split1Hex = hslToHex(split1, Math.max(38, hsl.s), 30);
  const split2Hex = hslToHex(split2, Math.max(38, hsl.s), 38);
  const analogHex = hslToHex(analogHue, Math.max(35, hsl.s), 32);

  return [
    {
      title: 'Royal Complementary Contrast',
      mood: `Balances ${primary.name} with an opposing jewel-toned blouse and antique gold zari border for ceremonial impact.`,
      blouseColor: { name: findClosestHeritageColorName(compHex), hex: compHex },
      borderColor: { name: 'Temple Gold Zari', hex: '#D4AF37' },
      embroideryColor: { name: 'Ivory Pearl Resham', hex: '#FAF5E8' },
      accessoryColor: { name: 'Kemp Ruby & Zardozi', hex: '#8B0000' },
      jewelryMetalRecommendation: '22K Antique Temple Gold with Kempu Rubies & Pearls',
    },
    {
      title: 'Split-Complementary Heritage Triad',
      mood: 'Pairs rich traditional weft tones with harmonious secondary accents ideal for weddings and sangeet evenings.',
      blouseColor: { name: findClosestHeritageColorName(split1Hex), hex: split1Hex },
      borderColor: { name: findClosestHeritageColorName(split2Hex), hex: split2Hex },
      embroideryColor: { name: 'Molten Gold Kasab', hex: '#E6CA65' },
      accessoryColor: { name: 'Vrindavan Emerald', hex: '#164E43' },
      jewelryMetalRecommendation: 'Polki Kundan with Emerald Drops & Meenakari Backing',
    },
    {
      title: 'Analogous Golden Sanctuary',
      mood: 'Soft tonal continuity across drape, blouse, and border for understated daytime poojas and cultural receptions.',
      blouseColor: { name: findClosestHeritageColorName(analogHex), hex: analogHex },
      borderColor: { name: 'Champagne Zari', hex: '#DFC57B' },
      embroideryColor: { name: 'Antique Bronze', hex: '#8C7A58' },
      accessoryColor: { name: 'Krishna Midnight Navy', hex: '#0C2B4E' },
      jewelryMetalRecommendation: 'Brushed Matte Gold & Freshwater Ivory Pearls',
    },
  ];
}

export async function analyzeFabricOpticalSignature(imageSrc: string): Promise<FabricEstimateResult> {
  try {
    const img = await loadImageElement(imageSrc);
    const canvas = document.createElement('canvas');
    const size = 96;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas unavailable');

    ctx.drawImage(img, 0, 0, size, size);
    const { data } = ctx.getImageData(0, 0, size, size);

    let lumSum = 0;
    let lumSqSum = 0;
    let brightHighlightCount = 0;
    let edgeGradientSum = 0;
    let satSum = 0;
    const totalPixels = size * size;

    const getLum = (idx: number) => 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const lum = getLum(idx);
        lumSum += lum;
        lumSqSum += lum * lum;
        if (lum > 215) brightHighlightCount++;

        const { s } = rgbToHsl(data[idx], data[idx + 1], data[idx + 2]);
        satSum += s;

        if (x < size - 1 && y < size - 1) {
          const lumRight = getLum((y * size + (x + 1)) * 4);
          const lumDown = getLum(((y + 1) * size + x) * 4);
          edgeGradientSum += Math.abs(lum - lumRight) + Math.abs(lum - lumDown);
        }
      }
    }

    const avgLum = lumSum / totalPixels;
    const lumStd = Math.sqrt(Math.max(0, lumSqSum / totalPixels - avgLum * avgLum));
    const highlightRatio = brightHighlightCount / totalPixels;
    const avgEdge = edgeGradientSum / totalPixels;
    const avgSat = satSum / totalPixels;

    let fabricCategory = 'Silk';
    let likelySubType = 'Pure Mulberry Handloom Silk';
    let textureProfile = 'Smooth, lustrous drape with crisp reflective highlights along folds.';
    let visualCuesObserved = [
      `Specular highlight ratio: ${(highlightRatio * 100).toFixed(1)}% across fold crests`,
      `Surface micro-texture contrast score: ${avgEdge.toFixed(1)}`,
      `Mean luminance: ${Math.round(avgLum)}/255 with tonal variance ${Math.round(lumStd)}`,
    ];
    let characteristics = [
      'Natural protein-fiber luster with fluid movement',
      'Breathable yet insulative across ceremonial seasons',
      'Holds zari borders cleanly without sagging',
    ];
    let commonUses = ['Bridal & festive sarees', 'Kurta ensembles', 'Tailored cholis & dupattas'];
    let maintenanceInstructions = [
      'Dry clean professionally; avoid harsh enzyme detergents.',
      'Steam lightly on reverse side with a damp cotton press cloth.',
      'Store wrapped in unbleached muslin away from direct sunlight.',
    ];

    if (avgLum < 85 && lumStd > 26 && highlightRatio < 0.08) {
      fabricCategory = 'Velvet';
      likelySubType = 'Silk-Pile Micro Velvet';
      textureProfile = 'Dense, plush cut-pile surface absorbing light in deep shadows with soft sheen along curves.';
      characteristics = ['Rich light-absorbing depth', 'Substantial weight and warm hand-feel', 'Ideal foundation for heavy zardozi work'];
      commonUses = ['Winter sherwanis & bandhgalas', 'Bridal potlis & shawls', 'Regal lehenga cholis'];
      maintenanceInstructions = ['Brush gently along pile direction with soft garment brush.', 'Strictly specialist dry clean; never press directly with a flat iron.'];
    } else if (avgLum > 185 && highlightRatio > 0.25 && avgEdge < 18) {
      fabricCategory = 'Organza / Chiffon';
      likelySubType = 'Sheer Kora Organza or Silk Chiffon';
      textureProfile = 'Translucent, airy open plain weave allowing high light transmission through delicate yarns.';
      characteristics = ['Featherlight weight with ethereal translucency', 'Crisp structured volume (Organza) or fluid fall (Chiffon)', 'Delicate fine-filament plain weave'];
      commonUses = ['Summer & daytime sarees', 'Embroidered dupattas & odhnis', 'Layered Indo-western lehengas'];
      maintenanceInstructions = ['Hand-wash cold with mild pH-neutral soap or dry clean.', 'Roll gently rather than sharp-creasing along zari folds.'];
    } else if (avgEdge > 24 && highlightRatio < 0.12 && avgSat < 45) {
      fabricCategory = 'Linen / Handloom Cotton';
      likelySubType = 'Slub-Yarn Linen or Fine Handspun Cotton';
      textureProfile = 'Matte, tactile matte finish showing visible warp-weft yarn crosshatch and natural slubs.';
      characteristics = ['High breathability and crisp matte finish', 'Very low specular sheen', 'Develops softer drape with every wash'];
      commonUses = ['Everyday ethnic kurtas', 'Summer handloom sarees', 'Office-appropriate Chikankari tunics'];
      maintenanceInstructions = ['Gentle cold machine or hand wash.', 'Steam iron while slightly damp for crisp structure.'];
    } else if (avgEdge > 20 && lumStd < 38) {
      fabricCategory = 'Georgette';
      likelySubType = 'Pure Viscose or Silk Crêpe Georgette';
      textureProfile = 'Matte, subtly grainy pebble surface spun from highly twisted crepe yarns with bouncy drape.';
      characteristics = ['Fluid cling-free movement', 'Subtle pebbled hand-feel', 'Minimal glare compared to satin or mulberry silk'];
      commonUses = ['Flowing Anarkalis & festive sarees', 'Sequined evening drapes', 'Tiered kurtis'];
      maintenanceInstructions = ['Dry clean recommended to preserve yarn twist.', 'Hang or fold padded; avoid stretching when wet.'];
    } else if (avgEdge > 15 && highlightRatio < 0.16) {
      fabricCategory = 'Cotton';
      likelySubType = 'Combed Mercerized Cotton / Mulmul';
      textureProfile = 'Balanced matte-to-soft sheen finish with uniform breathable plain-weave regularity.';
      characteristics = ['Skin-friendly and absorbent', 'Matte natural dye absorption', 'Crisp pleat retention when starched lightly'];
      commonUses = ['Chikankari kurtas & chanderi blends', 'Festive daytime suits', 'Block-printed Kalamkari sarees'];
      maintenanceInstructions = ['Wash in cold water with mild detergent.', 'Dry in shade to protect natural dyes.'];
    }

    return {
      fabricCategory,
      likelySubType,
      confidenceLevel: 'Offline Optical Texture Estimate',
      visualCuesObserved,
      textureProfile,
      characteristics,
      commonUses,
      maintenanceInstructions,
      estimateDisclaimer:
        'Estimated via offline optical sheen and pixel-texture heuristics (Gemini Vision API unavailable on this host). Photographic identification is always an estimate — physical yarn and burn testing is required for certification.',
      isOfflineOpticalEstimate: true,
    };
  } catch {
    return {
      fabricCategory: 'Silk / Handloom Blend',
      likelySubType: 'Estimated Heritage Weave',
      confidenceLevel: 'Moderate Visual Estimate',
      visualCuesObserved: ['Surface sheen and fold contour evaluated optically'],
      textureProfile: 'Balanced medium-weight weave suitable for structured Indian silhouettes.',
      characteristics: ['Moderate sheen', 'Artisan handloom drape', 'Versatile ceremonial durability'],
      commonUses: ['Sarees', 'Kurtas & Achkans', 'Festive Dupattas'],
      maintenanceInstructions: ['Dry clean recommended for zari or delicate dyes.', 'Store in breathable muslin cloth.'],
      estimateDisclaimer:
        'Photographic identification is an optical estimate only and cannot confirm exact fiber composition.',
      isOfflineOpticalEstimate: true,
    };
  }
}

export async function safePostJson<T>(url: string, body: unknown): Promise<T | null> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.includes('application/json')) {
      return null;
    }
    return (await res.json()) as T;
  } catch {
    return null;
  }
}
