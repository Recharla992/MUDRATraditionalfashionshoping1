import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  HeritageCategory,
  TEXTILE_HERITAGE_ITEMS,
  TextileHeritageItem,
} from '../../data/textileHeritageData';
import { normalizeImageUrl, handleImageError } from '../../utils/imageHelper';
import { BookOpen, MapPin, Sparkles, ArrowRight, Compass, Layers } from 'lucide-react';

const HERITAGE_FILTERS: Array<{ id: HeritageCategory; label: string }> = [
  { id: 'all', label: 'All Traditions (8)' },
  { id: 'handloom-silk', label: 'Handloom Silks' },
  { id: 'resist-dye', label: 'Resist-Dyed Ikat & Patola' },
  { id: 'painted-printed', label: 'Kalamkari Painted Art' },
  { id: 'heritage-embroidery', label: 'Chikankari & Zardozi' },
];

export const TextileHeritageExplorer: React.FC = () => {
  const { products, navigateTo } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<HeritageCategory>('all');
  const [activeId, setActiveId] = useState<string>(TEXTILE_HERITAGE_ITEMS[0].id);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return TEXTILE_HERITAGE_ITEMS;
    return TEXTILE_HERITAGE_ITEMS.filter((item) => item.category === selectedCategory);
  }, [selectedCategory]);

  const activeItem: TextileHeritageItem = useMemo(() => {
    const foundInFilter = filteredItems.find((i) => i.id === activeId);
    return foundInFilter || filteredItems[0] || TEXTILE_HERITAGE_ITEMS[0];
  }, [filteredItems, activeId]);

  const relatedProducts = useMemo(() => {
    return products
      .filter((p) => activeItem.relatedProductIds.includes(p.id))
      .slice(0, 3);
  }, [products, activeItem]);

  return (
    <section
      id="textile-heritage-explorer"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"
    >
      <div className="bg-white border border-[#E8E2D9] rounded-2xl p-6 sm:p-10 shadow-xs space-y-8">
        {/* Section Header + Category Filters */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 pb-6 border-b border-[#E8E2D9]">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#8C7A58] uppercase tracking-widest mb-1.5">
              <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Learn Stage · Living Craft Archive</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#0C2B4E]">
              Indian Textile Heritage Explorer
            </h2>
            <p className="text-xs sm:text-sm text-[#718096] mt-1.5 leading-relaxed">
              Explore the centuries-old looms, resist-dye mathematics, bamboo-pen narratives, and sacred needlework behind India’s GI-certified textiles — from Pochampally Ikat and Kalamkari to Banarasi, Kanchipuram, and Lucknowi Chikankari.
            </p>
          </div>

          {/* Interactive Category Filter Buttons */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-[#EFEAE2] rounded-lg self-start lg:self-end">
            {HERITAGE_FILTERS.map((flt) => {
              const active = selectedCategory === flt.id;
              return (
                <button
                  key={flt.id}
                  type="button"
                  onClick={() => setSelectedCategory(flt.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    active
                      ? 'bg-white text-[#0C2B4E] shadow-xs font-semibold'
                      : 'text-[#718096] hover:text-[#0C2B4E]'
                  }`}
                >
                  {flt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive Explorer Split: Selection Cards + Detailed Monograph */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Heritage Tradition Cards (5 cols) */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            {filteredItems.map((item) => {
              const isSelected = item.id === activeItem.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveId(item.id)}
                  className={`flex items-center gap-3.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FAF5E8] border-[#0C2B4E] ring-1 ring-[#D4AF37] shadow-xs'
                      : 'bg-[#FAF8F5] border-[#E8E2D9] hover:border-[#8C7A58] hover:bg-white'
                  }`}
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#E8E2D9] shrink-0 bg-[#F3EFE9]">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      onError={(e) => handleImageError(e, 'women')}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8C7A58] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#D4AF37] shrink-0" />
                      <span className="truncate">
                        {item.region}, {item.state}
                      </span>
                    </p>
                    <h3 className="font-heading text-sm font-bold text-[#0C2B4E] truncate mt-0.5">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-[#718096] mt-0.5 truncate">
                      {item.categoryLabel} · {item.giTagStatus}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Active Textile Deep-Dive Monograph (7 cols) */}
          <div className="lg:col-span-7 bg-[#FAF8F5] border border-[#E8E2D9] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12">
              <div className="md:col-span-5 relative min-h-[260px] bg-[#07172C]">
                <img
                  src={activeItem.imageUrl}
                  alt={activeItem.name}
                  onError={(e) => handleImageError(e, 'women')}
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07172C]/85 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold">
                    {activeItem.giTagStatus}
                  </p>
                  <p className="font-heading text-base font-bold leading-snug mt-0.5">
                    {activeItem.name}
                  </p>
                </div>
              </div>

              <div className="md:col-span-7 p-5 sm:p-6 space-y-4 text-xs">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold text-[#8C7A58]">
                  <span className="flex items-center gap-1 text-[#0C2B4E]">
                    <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                    Origin: {activeItem.region}, {activeItem.state}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{activeItem.categoryLabel}</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-[#0C2B4E] flex items-center gap-1.5 mb-1">
                      <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Weaving / Printing / Needle Technique</span>
                    </h4>
                    <p className="text-[#4A5568] leading-relaxed">{activeItem.technique}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-[#0C2B4E] flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Fabric Characteristics</span>
                    </h4>
                    <p className="text-[#4A5568] leading-relaxed">
                      {activeItem.fabricCharacteristics}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-[#0C2B4E] flex items-center gap-1.5 mb-1">
                      <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Cultural & Devotional Significance</span>
                    </h4>
                    <p className="text-[#4A5568] leading-relaxed">
                      {activeItem.culturalSignificance}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E8E2D9] text-[11px] text-[#4A5568]">
                  <strong className="text-[#0C2B4E]">Signature Motifs:</strong>{' '}
                  {activeItem.signatureMotifs.join(' · ')}
                </div>
              </div>
            </div>

            {/* Related MUDRA Products Strip */}
            {relatedProducts.length > 0 && (
              <div className="bg-white border-t border-[#E8E2D9] p-4 sm:px-6 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#0C2B4E]">
                    Shop Inspired Pieces in MUDRA Atelier
                  </span>
                  <button
                    type="button"
                    onClick={() => navigateTo('shop')}
                    className="text-[11px] font-semibold text-[#8C7A58] hover:text-[#0C2B4E] cursor-pointer flex items-center gap-1"
                  >
                    <span>Browse All Collections</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {relatedProducts.map((prod) => (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => navigateTo('product-detail', { productId: prod.id })}
                      className="flex items-center gap-2.5 p-2 rounded-lg border border-[#E8E2D9] hover:border-[#0C2B4E] bg-[#FAF8F5] text-left cursor-pointer transition-colors"
                    >
                      <img
                        src={normalizeImageUrl(prod.images[0], prod.category)}
                        alt={prod.name}
                        onError={(e) => handleImageError(e, prod.category)}
                        className="w-10 h-12 rounded object-cover object-top shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold text-[#0C2B4E] truncate">
                          {prod.name}
                        </p>
                        <p className="text-[10px] text-[#718096] font-mono">
                          ₹{prod.price.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <ArrowRight className="w-3 h-3 text-[#D4AF37] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
