import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { safePostJson } from '../../utils/canvasImageAnalysis';
import { normalizeImageUrl, handleImageError } from '../../utils/imageHelper';
import {
  Scissors,
  Sparkles,
  RotateCcw,
  Bookmark,
  Loader2,
  Trash2,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface SavedCustomDesign {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  createdAt: string;
  selections: DesignSelections;
  specTitle: string;
}

interface DesignSelections {
  neckline: string;
  sleeves: string;
  embroidery: string;
  border: string;
  pattern: string;
  colorName: string;
  colorHex: string;
  accentColorName: string;
  accentColorHex: string;
}

interface DesignPreviewSpec {
  artisanTitle: string;
  craftSummary: string;
  weavingTechniqueNote: string;
  estimatedCraftingDays: string;
  stylingPairings: string;
}

interface DesignPreviewApiResponse {
  isFallback: boolean;
  imageSynthesisAvailable: boolean;
  spec: DesignPreviewSpec;
}

const NECKLINE_OPTIONS = [
  'Boat Temple Neck',
  'Sweetheart Bridal',
  'Deep U-Back with Tassels',
  'High Mandarin Collar',
  'Square Kanjivaram Cut',
];

const SLEEVE_OPTIONS = [
  'Elbow Kundan Border',
  'Sleeveless Classic',
  'Full Zari Churidar',
  'Sheer Organza Bell',
  'Cap Temple Sleeve',
];

const EMBROIDERY_OPTIONS = [
  'Hand Zardozi Dabka',
  'Meenakari Floral',
  'Chikankari Shadow Stitch',
  'Gota Patti Mirror',
  'Antique Kasab Piping',
];

const BORDER_OPTIONS = [
  'Temple Gopuram Zari',
  'Scalloped Cutwork',
  'Broad Kadhwa Brocade',
  'Zari Checks & Coin',
];

const PATTERN_OPTIONS = [
  'Mayur Peacock',
  'Lotus & Vine Jaal',
  'Asharfi Gold Coin',
  'Paisley Kairi',
  'Pochampally Diamond',
];

const FABRIC_COLORS = [
  { name: 'Royal Crimson', hex: '#8B0000' },
  { name: 'Krishna Navy', hex: '#0C2B4E' },
  { name: 'Radha Rani Rose', hex: '#C45B74' },
  { name: 'Vrindavan Emerald', hex: '#164E43' },
  { name: 'Ivory Kora', hex: '#EFE6D5' },
  { name: 'Marigold Ochre', hex: '#C88A2B' },
];

const ACCENT_COLORS = [
  { name: '24K Temple Gold', hex: '#D4AF37' },
  { name: 'Champagne Zari', hex: '#E6CA65' },
  { name: 'Antique Silver', hex: '#CBD5E1' },
  { name: 'Kemp Ruby', hex: '#9E1B32' },
];

const SAVED_DESIGNS_STORAGE_KEY = 'mudra_saved_ai_designs';

interface InteractiveDesignStudioProps {
  initialProductId?: string | null;
}

export const InteractiveDesignStudio: React.FC<InteractiveDesignStudioProps> = ({
  initialProductId,
}) => {
  const { products, navigateTo, showToast } = useApp();

  const customizableProducts = useMemo(
    () => products.filter((p) => p.category === 'women' || p.category === 'men'),
    [products]
  );

  const [selectedProductId, setSelectedProductId] = useState<string>(() => {
    if (initialProductId && customizableProducts.some((p) => p.id === initialProductId)) {
      return initialProductId;
    }
    return customizableProducts[0]?.id || 'prod-001';
  });

  const selectedProduct = useMemo(
    () => customizableProducts.find((p) => p.id === selectedProductId) || customizableProducts[0],
    [customizableProducts, selectedProductId]
  );

  const getDefaultSelections = (): DesignSelections => ({
    neckline: NECKLINE_OPTIONS[0],
    sleeves: SLEEVE_OPTIONS[0],
    embroidery: EMBROIDERY_OPTIONS[0],
    border: BORDER_OPTIONS[0],
    pattern: PATTERN_OPTIONS[0],
    colorName: selectedProduct?.availableColors[0]?.name || FABRIC_COLORS[0].name,
    colorHex: selectedProduct?.availableColors[0]?.hex || FABRIC_COLORS[0].hex,
    accentColorName: ACCENT_COLORS[0].name,
    accentColorHex: ACCENT_COLORS[0].hex,
  });

  const [selections, setSelections] = useState<DesignSelections>(getDefaultSelections);
  const [generatedSpec, setGeneratedSpec] = useState<DesignPreviewSpec | null>(null);
  const [isFallbackSpec, setIsFallbackSpec] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const [savedDesigns, setSavedDesigns] = useState<SavedCustomDesign[]>(() => {
    try {
      const raw = localStorage.getItem(SAVED_DESIGNS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(SAVED_DESIGNS_STORAGE_KEY, JSON.stringify(savedDesigns));
    } catch {
      // Ignore storage write limits
    }
  }, [savedDesigns]);

  const handleProductChange = (newId: string) => {
    setSelectedProductId(newId);
    const prod = customizableProducts.find((p) => p.id === newId);
    if (prod?.availableColors[0]) {
      setSelections((prev) => ({
        ...prev,
        colorName: prod.availableColors[0].name,
        colorHex: prod.availableColors[0].hex,
      }));
    }
    setGeneratedSpec(null);
  };

  const handleReset = () => {
    setSelections(getDefaultSelections());
    setGeneratedSpec(null);
    showToast('Design studio options reset to garment defaults.', 'info');
  };

  const handleGeneratePreview = async () => {
    if (!selectedProduct) return;
    setIsGenerating(true);

    const res = await safePostJson<DesignPreviewApiResponse>('/api/ai/design-preview', {
      product: {
        id: selectedProduct.id,
        name: selectedProduct.name,
        subcategory: selectedProduct.subcategory,
        material: selectedProduct.material,
      },
      selections,
    });

    if (res?.spec) {
      setGeneratedSpec(res.spec);
      setIsFallbackSpec(Boolean(res.isFallback));
    } else {
      setIsFallbackSpec(true);
      setGeneratedSpec({
        artisanTitle: `Bespoke ${selections.colorName} ${selectedProduct.subcategory}`,
        craftSummary: `Tailored configuration combining a ${selections.neckline} neckline and ${selections.sleeves} sleeves with ${selections.embroidery} needlework, ${selections.border} borders, and ${selections.pattern} motifs.`,
        weavingTechniqueNote: `Recommended execution on ${selectedProduct.material} using ${selections.accentColorName} highlight threads so the ${selections.border} border drapes cleanly.`,
        estimatedCraftingDays: '12–16 Artisan Days',
        stylingPairings: 'Pair with antique 22K temple jewelry and a matching zardozi potli.',
      });
    }

    setIsGenerating(false);
    showToast('Updated bespoke design preview & weaver specification generated.', 'success');
  };

  const handleSaveDesign = () => {
    if (!selectedProduct) return;
    const entry: SavedCustomDesign = {
      id: `dsn-${Date.now()}`,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productImage: normalizeImageUrl(selectedProduct.images[0], selectedProduct.category),
      createdAt: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      selections: { ...selections },
      specTitle:
        generatedSpec?.artisanTitle || `Bespoke ${selections.colorName} ${selectedProduct.subcategory}`,
    };
    setSavedDesigns((prev) => [entry, ...prev].slice(0, 8));
    showToast('Bespoke design saved to your studio collection!', 'success');
  };

  const handleLoadSaved = (saved: SavedCustomDesign) => {
    setSelectedProductId(saved.productId);
    setSelections(saved.selections);
    showToast(`Loaded "${saved.specTitle}" into studio.`, 'info');
  };

  const handleDeleteSaved = (id: string) => {
    setSavedDesigns((prev) => prev.filter((item) => item.id !== id));
    showToast('Saved design removed.', 'info');
  };

  // SVG Schematic geometry helpers driven directly by user selections
  const necklinePath = useMemo(() => {
    switch (selections.neckline) {
      case 'Boat Temple Neck':
        return 'M 88 46 Q 120 56 152 46';
      case 'Sweetheart Bridal':
        return 'M 94 44 Q 108 64 120 56 Q 132 64 146 44';
      case 'Deep U-Back with Tassels':
        return 'M 95 44 C 96 84 144 84 145 44';
      case 'High Mandarin Collar':
        return 'M 98 38 L 142 38 L 140 50 L 100 50 Z';
      default:
        return 'M 95 44 L 95 68 L 145 68 L 145 44';
    }
  }, [selections.neckline]);

  const sleeveLengthY = useMemo(() => {
    if (selections.sleeves.includes('Sleeveless')) return 56;
    if (selections.sleeves.includes('Cap')) return 78;
    if (selections.sleeves.includes('Full')) return 148;
    return 112;
  }, [selections.sleeves]);

  const sleeveWidth = selections.sleeves.includes('Bell') ? 34 : 24;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D9]">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#8C7A58] block mb-1">
            Experiment Stage · Bespoke Couture Builder
          </span>
          <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#0C2B4E]">
            Interactive Design Customization Studio
          </h3>
          <p className="text-xs sm:text-sm text-[#718096] mt-1">
            Customize neckline, sleeves, embroidery, border craft, motifs, and colour palette for any MUDRA saree or ensemble.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 bg-white border border-[#D9D0C3] hover:border-[#0C2B4E] text-[#4A5568] hover:text-[#0C2B4E] text-xs font-semibold rounded-md cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleSaveDesign}
            className="px-3.5 py-2 bg-[#FAF5E8] border border-[#D4AF37] text-[#0C2B4E] hover:bg-[#EFEAE2] text-xs font-semibold rounded-md cursor-pointer flex items-center gap-1.5"
          >
            <Bookmark className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Save Design</span>
          </button>

          <button
            type="button"
            onClick={handleGeneratePreview}
            disabled={isGenerating}
            className="px-4 py-2 bg-[#0C2B4E] hover:bg-[#07172C] disabled:opacity-60 text-white text-xs font-semibold rounded-md shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
                <span>Generating Brief...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Generate Updated Design</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Controls (7 cols) */}
        <div className="lg:col-span-7 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl p-4 sm:p-5 space-y-5">
          {/* Base Product Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-white rounded-lg border border-[#E8E2D9]">
            {selectedProduct && (
              <img
                src={normalizeImageUrl(selectedProduct.images[0], selectedProduct.category)}
                alt={selectedProduct.name}
                onError={(e) => handleImageError(e, selectedProduct.category)}
                className="w-12 h-14 object-cover object-top rounded border border-[#E8E2D9] shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#8C7A58] block mb-1">
                Base Silhouette from Collection
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2 bg-[#FAF8F5] border border-[#D9D0C3] rounded-md text-[#0C2B4E]"
              >
                {customizableProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.subcategory})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3 Option Groups */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Neckline */}
            <div className="space-y-1.5">
              <label className="font-semibold text-[#0C2B4E] block">1. Neckline Architecture</label>
              <select
                value={selections.neckline}
                onChange={(e) => setSelections((s) => ({ ...s, neckline: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-[#D9D0C3] rounded-md text-[#1E252B]"
              >
                {NECKLINE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Sleeves */}
            <div className="space-y-1.5">
              <label className="font-semibold text-[#0C2B4E] block">2. Sleeve Tailoring</label>
              <select
                value={selections.sleeves}
                onChange={(e) => setSelections((s) => ({ ...s, sleeves: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-[#D9D0C3] rounded-md text-[#1E252B]"
              >
                {SLEEVE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Embroidery */}
            <div className="space-y-1.5">
              <label className="font-semibold text-[#0C2B4E] block">3. Hand Embroidery Craft</label>
              <select
                value={selections.embroidery}
                onChange={(e) => setSelections((s) => ({ ...s, embroidery: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-[#D9D0C3] rounded-md text-[#1E252B]"
              >
                {EMBROIDERY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Borders */}
            <div className="space-y-1.5">
              <label className="font-semibold text-[#0C2B4E] block">4. Pallu & Hem Border</label>
              <select
                value={selections.border}
                onChange={(e) => setSelections((s) => ({ ...s, border: e.target.value }))}
                className="w-full px-3 py-2 bg-white border border-[#D9D0C3] rounded-md text-[#1E252B]"
              >
                {BORDER_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Motifs / Patterns */}
          <div className="space-y-2 text-xs">
            <label className="font-semibold text-[#0C2B4E] block">5. Heritage Motif Pattern</label>
            <div className="flex flex-wrap gap-2">
              {PATTERN_OPTIONS.map((pat) => {
                const active = selections.pattern === pat;
                return (
                  <button
                    key={pat}
                    type="button"
                    onClick={() => setSelections((s) => ({ ...s, pattern: pat }))}
                    className={`px-3 py-1.5 rounded-md border text-xs font-medium cursor-pointer transition-all ${
                      active
                        ? 'bg-[#0C2B4E] text-[#F3E8CE] border-[#0C2B4E]'
                        : 'bg-white text-[#4A5568] border-[#D9D0C3] hover:border-[#0C2B4E]'
                    }`}
                  >
                    {pat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Fabric Color + Zari Accent Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
            <div className="space-y-2">
              <label className="font-semibold text-[#0C2B4E] block">
                6. Base Fabric Dye:{' '}
                <span className="font-normal text-[#718096]">{selections.colorName}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {[...(selectedProduct?.availableColors || []), ...FABRIC_COLORS]
                  .filter((c, i, arr) => arr.findIndex((x) => x.hex === c.hex) === i)
                  .slice(0, 7)
                  .map((col) => (
                    <button
                      key={`${col.name}-${col.hex}`}
                      type="button"
                      onClick={() =>
                        setSelections((s) => ({
                          ...s,
                          colorName: col.name,
                          colorHex: col.hex,
                        }))
                      }
                      className={`w-7 h-7 rounded-full border-2 cursor-pointer transition-transform ${
                        selections.colorHex === col.hex
                          ? 'border-[#0C2B4E] scale-110 ring-2 ring-[#D4AF37]'
                          : 'border-white shadow-xs hover:scale-105'
                      }`}
                      style={{ backgroundColor: col.hex }}
                      title={col.name}
                    />
                  ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-[#0C2B4E] block">
                7. Zari & Thread Accent:{' '}
                <span className="font-normal text-[#718096]">{selections.accentColorName}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {ACCENT_COLORS.map((col) => (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() =>
                      setSelections((s) => ({
                        ...s,
                        accentColorName: col.name,
                        accentColorHex: col.hex,
                      }))
                    }
                    className={`w-7 h-7 rounded-full border-2 cursor-pointer transition-transform ${
                      selections.accentColorHex === col.hex
                        ? 'border-[#0C2B4E] scale-110 ring-2 ring-[#0C2B4E]/30'
                        : 'border-white shadow-xs hover:scale-105'
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Active Selections Summary Strip */}
          <div className="p-3 bg-white rounded-lg border border-[#E8E2D9] text-xs space-y-1.5">
            <div className="font-semibold text-[#0C2B4E] flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Selected Specification Summary</span>
            </div>
            <div className="text-[11px] text-[#4A5568] flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>Neckline: <strong className="text-[#0C2B4E]">{selections.neckline}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Sleeves: <strong className="text-[#0C2B4E]">{selections.sleeves}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Embroidery: <strong className="text-[#0C2B4E]">{selections.embroidery}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Border: <strong className="text-[#0C2B4E]">{selections.border}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Motif: <strong className="text-[#0C2B4E]">{selections.pattern}</strong></span>
            </div>
          </div>
        </div>

        {/* Right: Live Schematic Visualizer + AI Spec Brief (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-[#E8E2D9] rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0C2B4E] font-heading">
                Live Bespoke Silhouette Blueprint
              </span>
              <span className="text-[11px] text-[#8C7A58] font-mono">Updates in Real Time</span>
            </div>

            {/* Dynamic Responsive SVG Garment & Saree Drape Schematic */}
            <div className="bg-[#FAF8F5] rounded-lg border border-[#E8E2D9] p-3 flex flex-col items-center">
              <svg
                viewBox="0 0 240 270"
                className="w-full max-w-[230px] h-auto"
                role="img"
                aria-label="Live interactive garment customization preview"
              >
                {/* Bodice / Choli / Upper Kurta */}
                <path
                  d="M 65 44 L 175 44 L 168 124 L 72 124 Z"
                  fill={selections.colorHex}
                  stroke={selections.accentColorHex}
                  strokeWidth="3"
                />

                {/* Sleeves Left & Right */}
                {!selections.sleeves.includes('Sleeveless') && (
                  <>
                    <path
                      d={`M 65 44 L ${65 - sleeveWidth} ${sleeveLengthY} L ${72 - sleeveWidth + 10} ${sleeveLengthY + 6} L 70 86 Z`}
                      fill={selections.colorHex}
                      stroke={selections.accentColorHex}
                      strokeWidth="2.5"
                    />
                    <path
                      d={`M 175 44 L ${175 + sleeveWidth} ${sleeveLengthY} L ${168 + sleeveWidth - 10} ${sleeveLengthY + 6} L 170 86 Z`}
                      fill={selections.colorHex}
                      stroke={selections.accentColorHex}
                      strokeWidth="2.5"
                    />
                  </>
                )}

                {/* Neckline Cutout */}
                <path
                  d={necklinePath}
                  fill="#FAF8F5"
                  stroke={selections.accentColorHex}
                  strokeWidth="3"
                />

                {/* Flowing Drape / Skirt / Saree Pleats */}
                <path
                  d="M 70 128 L 170 128 L 204 246 L 36 246 Z"
                  fill={selections.colorHex}
                  stroke={selections.accentColorHex}
                  strokeWidth="3"
                />

                {/* Diagonal Pallu Sash */}
                <path
                  d="M 74 44 L 104 44 L 194 246 L 154 246 Z"
                  fill={selections.accentColorHex}
                  fillOpacity="0.24"
                  stroke={selections.accentColorHex}
                  strokeWidth="1.5"
                />

                {/* Hem Border Style Indicator */}
                {selections.border === 'Scalloped Cutwork' ? (
                  <path
                    d="M 38 238 Q 52 252 66 238 Q 80 252 94 238 Q 108 252 122 238 Q 136 252 150 238 Q 164 252 178 238 Q 192 252 204 238"
                    fill="none"
                    stroke={selections.accentColorHex}
                    strokeWidth="5"
                  />
                ) : (
                  <rect
                    x="38"
                    y="230"
                    width="164"
                    height="15"
                    fill={selections.accentColorHex}
                    fillOpacity="0.88"
                  />
                )}

                {/* Embroidery Motif Nodes */}
                {[
                  { x: 96, y: 170 },
                  { x: 120, y: 196 },
                  { x: 144, y: 170 },
                  { x: 82, y: 210 },
                  { x: 158, y: 210 },
                ].map((pt, i) => (
                  <g key={i}>
                    {selections.pattern === 'Pochampally Diamond' ? (
                      <polygon
                        points={`${pt.x},${pt.y - 6} ${pt.x + 6},${pt.y} ${pt.x},${pt.y + 6} ${pt.x - 6},${pt.y}`}
                        fill={selections.accentColorHex}
                      />
                    ) : (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="4.5"
                        fill="none"
                        stroke={selections.accentColorHex}
                        strokeWidth="2"
                      />
                    )}
                  </g>
                ))}
              </svg>

              <p className="text-[10px] text-[#718096] text-center mt-1">
                Schematic reflects {selections.neckline} · {selections.sleeves} · {selections.border}
              </p>
            </div>

            {/* AI Generated Specification Card */}
            {generatedSpec && (
              <div className="p-3.5 bg-[#FAF5E8] border border-[#D4AF37]/50 rounded-lg space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-heading font-bold text-[#0C2B4E] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{generatedSpec.artisanTitle}</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#8C7A58]">
                    {generatedSpec.estimatedCraftingDays}
                  </span>
                </div>
                <p className="text-[#2D3748] leading-relaxed">{generatedSpec.craftSummary}</p>
                <p className="text-[11px] text-[#4A5568]">
                  <strong className="text-[#0C2B4E]">Loom & Craft Note:</strong>{' '}
                  {generatedSpec.weavingTechniqueNote}
                </p>
                <p className="text-[11px] text-[#4A5568]">
                  <strong className="text-[#0C2B4E]">Stylist Pairing:</strong>{' '}
                  {generatedSpec.stylingPairings}
                </p>
                <p className="text-[10px] text-[#8C7A58] italic pt-1 border-t border-[#D4AF37]/30">
                  {isFallbackSpec
                    ? 'Atelier specification generated via local couture rules; photorealistic image synthesis disabled without paid key.'
                    : 'Bespoke weaver brief powered by Gemini Couture Intelligence (paired with live SVG schematic above).'}
                </p>
              </div>
            )}

            {selectedProduct && (
              <button
                type="button"
                onClick={() => navigateTo('product-detail', { productId: selectedProduct.id })}
                className="w-full py-2 text-xs font-semibold text-[#0C2B4E] border border-[#0C2B4E] hover:bg-[#FAF5E8] rounded-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Open Base Garment for Checkout & Stitching</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
              </button>
            )}
          </div>

          {/* Saved Designs List */}
          {savedDesigns.length > 0 && (
            <div className="bg-white border border-[#E8E2D9] rounded-xl p-4 space-y-2.5">
              <h5 className="font-heading text-xs font-bold uppercase tracking-wider text-[#0C2B4E]">
                Saved Custom Designs ({savedDesigns.length})
              </h5>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {savedDesigns.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#FAF8F5] border border-[#E8E2D9] text-xs"
                  >
                    <button
                      type="button"
                      onClick={() => handleLoadSaved(item)}
                      className="flex items-center gap-2.5 min-w-0 text-left flex-1 cursor-pointer"
                    >
                      <span
                        className="w-5 h-5 rounded-full border border-black/15 shrink-0"
                        style={{ backgroundColor: item.selections.colorHex }}
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-[#0C2B4E] truncate">{item.specTitle}</p>
                        <p className="text-[10px] text-[#718096] truncate">
                          {item.selections.neckline} · {item.selections.embroidery} · {item.createdAt}
                        </p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSaved(item.id)}
                      className="p-1 text-[#718096] hover:text-rose-600 cursor-pointer"
                      aria-label="Delete saved design"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
