import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { safePostJson } from '../../utils/canvasImageAnalysis';
import { normalizeImageUrl, handleImageError } from '../../utils/imageHelper';
import { CalendarHeart, Sparkles, Loader2, ArrowRight, Star } from 'lucide-react';

interface OccasionOption {
  id: string;
  label: string;
  keywords: string[];
  defaultReason: string;
}

const OCCASIONS: OccasionOption[] = [
  {
    id: 'wedding',
    label: 'Weddings & Receptions',
    keywords: ['bridal', 'kanchipuram', 'banarasi', 'sherwani', 'lehenga', 'zari', 'zardozi'],
    defaultReason: 'Rich gold zari and heirloom weave density suited for mandap & reception lighting.',
  },
  {
    id: 'festival',
    label: 'Festivals & Pooja Rituals',
    keywords: ['festive', 'tissue', 'chanderi', 'kurta', 'dhoti', 'pendant', 'pooja', 'temple'],
    defaultReason: 'Luminous celebratory silhouette rooted in devotional Vrindavan & temple heritage.',
  },
  {
    id: 'college',
    label: 'College Events & Farewell',
    keywords: ['organza', 'kora', 'tissue', 'anarkali', 'nehru', 'floral', 'jhumkas'],
    defaultReason: 'Youthful movement with effortless drape that stands out across ethnic day & farewell events.',
  },
  {
    id: 'office',
    label: 'Office Ethnic & Formal',
    keywords: ['chanderi', 'tussar', 'kora', 'kurta', 'blouse', 'pendant', 'anklets'],
    defaultReason: 'Breathable handloom structure offering polished comfort across full workdays.',
  },
  {
    id: 'casual',
    label: 'Casual Outings & Family Dinners',
    keywords: ['chanderi', 'anarkali', 'kurta', 'kora', 'potli', 'mojaris'],
    defaultReason: 'Featherlight craftsmanship ideal for relaxed gatherings and sunlit outings.',
  },
];

const STYLES = [
  'Royal Heritage Traditional',
  'Light & Effortless Minimal',
  'Bridal & Statement Grand',
  'Refined Menswear Classic',
];

const COLOR_PREFERENCES = [
  { id: 'any', label: 'Any Heritage Palette', tokens: [] as string[] },
  { id: 'crimson', label: 'Crimson, Maroon & Rose', tokens: ['red', 'crimson', 'maroon', 'pink', 'rose', 'sindoor', 'rust'] },
  { id: 'navy', label: 'Midnight Navy & Teal', tokens: ['navy', 'blue', 'peacock', 'teal', 'midnight'] },
  { id: 'gold', label: 'Molten Gold, Ivory & Cream', tokens: ['gold', 'ivory', 'cream', 'champagne', 'ochre', 'yellow', 'haldi'] },
  { id: 'emerald', label: 'Emerald, Mint & Pastel', tokens: ['green', 'emerald', 'mint', 'pistachio', 'pastel', 'peach'] },
];

const BUDGET_RANGES = [
  { id: 'all', label: 'All Budgets', min: 0, max: Infinity },
  { id: 'under-6k', label: 'Under ₹6,000', min: 0, max: 6000 },
  { id: '6k-15k', label: '₹6,000 – ₹15,000', min: 6000, max: 15000 },
  { id: '15k-plus', label: 'Heirloom Luxury (₹15,000+)', min: 15000, max: Infinity },
];

interface PlannerApiResponse {
  isFallback: boolean;
  plannerIntro?: string;
  recommendations: Array<{
    productId: string;
    explanation: string;
    stylingTip: string;
  }>;
}

interface PlannedRecommendation {
  product: Product;
  explanation: string;
  stylingTip: string;
}

export const OccasionPlannerModule: React.FC = () => {
  const { products, navigateTo } = useApp();

  const [occasionId, setOccasionId] = useState<string>('wedding');
  const [style, setStyle] = useState<string>(STYLES[0]);
  const [colorPrefId, setColorPrefId] = useState<string>('any');
  const [budgetId, setBudgetId] = useState<string>('all');

  const [isPlanning, setIsPlanning] = useState<boolean>(false);
  const [plannerIntro, setPlannerIntro] = useState<string>('');
  const [recommendations, setRecommendations] = useState<PlannedRecommendation[] | null>(null);
  const [usedAi, setUsedAi] = useState<boolean>(false);

  const selectedOccasion = OCCASIONS.find((o) => o.id === occasionId) || OCCASIONS[0];
  const selectedColorPref = COLOR_PREFERENCES.find((c) => c.id === colorPrefId) || COLOR_PREFERENCES[0];
  const selectedBudget = BUDGET_RANGES.find((b) => b.id === budgetId) || BUDGET_RANGES[0];

  const computeLocalMatches = (): PlannedRecommendation[] => {
    const styleTokens = style.toLowerCase().split(/\s+/);
    const isMensPreference = style.includes('Menswear');

    const scored = products.map((p) => {
      let score = 0;
      const hay = `${p.name} ${p.subcategory} ${p.description} ${p.material} ${p.fabricDetails} ${p.availableColors.map((c) => c.name).join(' ')}`.toLowerCase();

      // Budget alignment
      if (p.price >= selectedBudget.min && p.price <= selectedBudget.max) {
        score += 40;
      } else {
        score -= 25;
      }

      // Occasion keywords
      for (const kw of selectedOccasion.keywords) {
        if (hay.includes(kw)) score += 14;
      }
      if (occasionId === 'festival' && p.isFestive) score += 12;

      // Color preference
      if (selectedColorPref.tokens.length > 0) {
        const colorMatch = selectedColorPref.tokens.some((tok) => hay.includes(tok));
        if (colorMatch) score += 28;
      }

      // Style alignment
      if (isMensPreference && p.category === 'men') score += 35;
      if (!isMensPreference && style.includes('Bridal') && (hay.includes('bridal') || p.price >= 14000)) {
        score += 22;
      }
      if (style.includes('Light') && (hay.includes('organza') || hay.includes('chanderi') || hay.includes('kora'))) {
        score += 24;
      }
      for (const tok of styleTokens) {
        if (tok.length > 3 && hay.includes(tok)) score += 8;
      }

      // Apparel boost over small keepsakes unless budget is low
      if ((p.category === 'women' || p.category === 'men') && selectedBudget.max > 6000) {
        score += 10;
      }

      return { product: p, score };
    });

    const topProducts = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(({ product }) => ({
        product,
        explanation: `${selectedOccasion.defaultReason} Crafted in ${product.material}, priced at ₹${product.price.toLocaleString('en-IN')}.`,
        stylingTip:
          product.category === 'men'
            ? 'Complete with handcrafted silk mojaris and an antique kalgi brooch.'
            : 'Pair with antique 22K temple jhumkas and a matching zardozi potli.',
      }));

    return topProducts;
  };

  const handlePlanOutfits = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsPlanning(true);

    const localTop = computeLocalMatches();
    const candidatesPayload = localTop.map(({ product }) => ({
      productId: product.id,
      name: product.name,
      category: product.category,
      subcategory: product.subcategory,
      price: product.price,
      material: product.material,
      colors: product.availableColors.map((c) => c.name),
    }));

    const apiRes = await safePostJson<PlannerApiResponse>('/api/ai/occasion-planner', {
      occasion: selectedOccasion.label,
      style,
      colorPreference: selectedColorPref.label,
      budgetLabel: selectedBudget.label,
      candidates: candidatesPayload,
    });

    if (apiRes && !apiRes.isFallback && apiRes.recommendations?.length) {
      const merged = localTop.map((item) => {
        const aiRec = apiRes.recommendations.find((r) => r.productId === item.product.id);
        return aiRec
          ? {
              product: item.product,
              explanation: aiRec.explanation || item.explanation,
              stylingTip: aiRec.stylingTip || item.stylingTip,
            }
          : item;
      });
      setRecommendations(merged);
      setPlannerIntro(
        apiRes.plannerIntro ||
          `Curated for ${selectedOccasion.label} · ${style} · ${selectedBudget.label}`
      );
      setUsedAi(true);
    } else {
      setRecommendations(localTop);
      setPlannerIntro(
        `Matched ${localTop.length} MUDRA designs for ${selectedOccasion.label} (${selectedBudget.label}).`
      );
      setUsedAi(false);
    }

    setIsPlanning(false);
  };

  // Auto-populate initial plan so the feature looks alive immediately
  const displayedRecommendations = useMemo(
    () => recommendations ?? computeLocalMatches(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [recommendations]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#E8E2D9]">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-[#8C7A58] block mb-1">
          Personalize Stage · Smart Wardrobe Curation
        </span>
        <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#0C2B4E]">
          Occasion-Based Fashion Planner
        </h3>
        <p className="text-xs sm:text-sm text-[#718096] mt-1">
          Choose your upcoming event, aesthetic mood, colour preference, and budget to receive tailored outfit recommendations directly from the live MUDRA collection.
        </p>
      </div>

      {/* Interactive Filter Form */}
      <form
        onSubmit={handlePlanOutfits}
        className="bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end text-xs"
      >
        <div className="space-y-1.5">
          <label className="font-semibold text-[#0C2B4E] block">Occasion</label>
          <select
            value={occasionId}
            onChange={(e) => setOccasionId(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-[#D9D0C3] rounded-md text-[#1E252B]"
          >
            {OCCASIONS.map((occ) => (
              <option key={occ.id} value={occ.id}>
                {occ.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="font-semibold text-[#0C2B4E] block">Preferred Style</label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-[#D9D0C3] rounded-md text-[#1E252B]"
          >
            {STYLES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="font-semibold text-[#0C2B4E] block">Colour Preference</label>
          <select
            value={colorPrefId}
            onChange={(e) => setColorPrefId(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-[#D9D0C3] rounded-md text-[#1E252B]"
          >
            {COLOR_PREFERENCES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="font-semibold text-[#0C2B4E] block">Budget Range</label>
          <select
            value={budgetId}
            onChange={(e) => setBudgetId(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-[#D9D0C3] rounded-md text-[#1E252B]"
          >
            {BUDGET_RANGES.map((b) => (
              <option key={b.id} value={b.id}>
                {b.label}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isPlanning}
          className="w-full py-2.5 px-4 bg-[#0C2B4E] hover:bg-[#07172C] disabled:opacity-60 text-white font-semibold rounded-md shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
        >
          {isPlanning ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
              <span>Curating...</span>
            </>
          ) : (
            <>
              <CalendarHeart className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Recommend Outfits</span>
            </>
          )}
        </button>
      </form>

      {/* Results Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 font-semibold text-[#0C2B4E]">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          <span>
            {plannerIntro ||
              `Recommended Picks for ${selectedOccasion.label} · ${selectedBudget.label}`}
          </span>
        </div>
        <span className="text-[11px] text-[#8C7A58]">
          {usedAi ? 'Gemini Personal Stylist Notes' : 'Live Collection Match'} · Click any design to explore
        </span>
      </div>

      {/* Clickable Recommended Outfits Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {displayedRecommendations.map(({ product, explanation, stylingTip }) => (
          <div
            key={product.id}
            onClick={() => navigateTo('product-detail', { productId: product.id })}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigateTo('product-detail', { productId: product.id });
              }
            }}
            className="group bg-white border border-[#E8E2D9] hover:border-[#0C2B4E] rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col"
          >
            <div className="aspect-4/5 bg-[#F3EFE9] overflow-hidden relative">
              <img
                src={normalizeImageUrl(product.images[0], product.category)}
                alt={product.name}
                onError={(e) => handleImageError(e, product.category)}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-3 text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-[#8C7A58] uppercase font-semibold tracking-wider">
                  <span>{product.subcategory}</span>
                  <span className="flex items-center gap-0.5 text-[#0C2B4E]">
                    <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
                    {product.rating}
                  </span>
                </div>

                <h4 className="font-heading text-sm font-bold text-[#0C2B4E] group-hover:text-[#8C7A58] transition-colors line-clamp-2 leading-snug">
                  {product.name}
                </h4>

                <p className="text-[11px] text-[#4A5568] leading-relaxed">{explanation}</p>
                <p className="text-[11px] text-[#8C7A58] italic leading-snug">
                  Tip: {stylingTip}
                </p>
              </div>

              <div className="pt-2.5 border-t border-[#F0EBE1] flex items-center justify-between">
                <span className="text-sm font-bold text-[#0C2B4E] font-mono">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] font-semibold text-[#0C2B4E] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>View Design</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
