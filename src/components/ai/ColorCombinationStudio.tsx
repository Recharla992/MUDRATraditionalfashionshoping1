import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  compressImageToDataUrl,
  extractDominantColors,
  generateComputationalPalettes,
  PaletteSuggestion,
  safePostJson,
  SwatchColor,
} from '../../utils/canvasImageAnalysis';
import { normalizeImageUrl, handleImageError } from '../../utils/imageHelper';
import { Palette, Upload, Sparkles, Loader2, ArrowRight, Check } from 'lucide-react';

interface ColorStudioResponse {
  isFallback: boolean;
  reason?: string;
  data?: {
    dominantAnalysis: string;
    palettes: PaletteSuggestion[];
  };
}

interface ColorCombinationStudioProps {
  initialProductId?: string | null;
}

export const ColorCombinationStudio: React.FC<ColorCombinationStudioProps> = ({
  initialProductId,
}) => {
  const { products, navigateTo, showToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const apparelProducts = useMemo(
    () => products.filter((p) => p.category === 'women' || p.category === 'men'),
    [products]
  );

  const [sourceMode, setSourceMode] = useState<'product' | 'upload'>('product');
  const [selectedProductId, setSelectedProductId] = useState<string>(() => {
    if (initialProductId && apparelProducts.some((p) => p.id === initialProductId)) {
      return initialProductId;
    }
    return apparelProducts[0]?.id || 'prod-001';
  });
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const [dominantColors, setDominantColors] = useState<SwatchColor[]>([]);
  const [dominantAnalysis, setDominantAnalysis] = useState<string>('');
  const [palettes, setPalettes] = useState<PaletteSuggestion[]>([]);
  const [activePaletteIndex, setActivePaletteIndex] = useState<number>(0);

  // Interactive customizable colour preview selections (clickable swatches override individual pieces)
  const [previewColors, setPreviewColors] = useState<{
    baseBody: SwatchColor;
    blouse: SwatchColor;
    border: SwatchColor;
    embroidery: SwatchColor;
    accessory: SwatchColor;
  }>({
    baseBody: { name: 'Royal Crimson', hex: '#8B0000' },
    blouse: { name: 'Krishna Midnight Navy', hex: '#0C2B4E' },
    border: { name: 'Temple Gold', hex: '#D4AF37' },
    embroidery: { name: 'Ivory Parchment', hex: '#FAF5E8' },
    accessory: { name: 'Vrindavan Emerald', hex: '#164E43' },
  });

  const [activeTargetSlot, setActiveTargetSlot] = useState<
    'blouse' | 'border' | 'embroidery' | 'accessory'
  >('blouse');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisNote, setAnalysisNote] = useState<string | null>(null);

  const selectedProduct = useMemo(
    () => apparelProducts.find((p) => p.id === selectedProductId) || apparelProducts[0],
    [apparelProducts, selectedProductId]
  );

  const activeImageSrc =
    sourceMode === 'upload' && uploadedImage
      ? uploadedImage
      : normalizeImageUrl(selectedProduct?.images[0], selectedProduct?.category || 'women');

  const analyzeImageAndSuggest = async (
    imageSrc: string,
    isUploadedDataUrl: boolean,
    prodName?: string,
    material?: string
  ) => {
    setIsAnalyzing(true);
    setAnalysisNote(null);

    const extracted = await extractDominantColors(imageSrc, 5);
    setDominantColors(extracted);

    const primaryColor = extracted[0] || { name: 'Royal Crimson', hex: '#8B0000' };
    const fallbackPalettes = generateComputationalPalettes(extracted);

    const res = await safePostJson<ColorStudioResponse>('/api/ai/color-studio', {
      imageBase64: isUploadedDataUrl ? imageSrc : undefined,
      dominantHexes: extracted.map((c) => `${c.name} (${c.hex})`),
      productName: prodName,
      material,
    });

    if (res && !res.isFallback && res.data?.palettes?.length) {
      setPalettes(res.data.palettes);
      setDominantAnalysis(
        res.data.dominantAnalysis ||
          `Dominant base tones measured around ${extracted.map((c) => c.name).slice(0, 3).join(', ')}.`
      );
      const first = res.data.palettes[0];
      setActivePaletteIndex(0);
      setPreviewColors({
        baseBody: primaryColor,
        blouse: first.blouseColor,
        border: first.borderColor,
        embroidery: first.embroideryColor,
        accessory: first.accessoryColor,
      });
    } else {
      setPalettes(fallbackPalettes);
      setDominantAnalysis(
        `Canvas pixel analysis detected ${extracted
          .slice(0, 3)
          .map((c) => `${c.name} (${c.percentage || 25}%)`)
          .join(', ')}. Palettes below use Indian color-wheel harmony.`
      );
      const first = fallbackPalettes[0];
      setActivePaletteIndex(0);
      setPreviewColors({
        baseBody: primaryColor,
        blouse: first.blouseColor,
        border: first.borderColor,
        embroidery: first.embroideryColor,
        accessory: first.accessoryColor,
      });
      if (res?.reason) {
        setAnalysisNote(res.reason);
      }
    }

    setIsAnalyzing(false);
  };

  useEffect(() => {
    if (sourceMode === 'product' && selectedProduct) {
      analyzeImageAndSuggest(
        normalizeImageUrl(selectedProduct.images[0], selectedProduct.category),
        false,
        selectedProduct.name,
        selectedProduct.material
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProductId, sourceMode]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const dataUrl = await compressImageToDataUrl(file, 640);
    setUploadedImage(dataUrl);
    setSourceMode('upload');
    showToast('Uploaded design scanned for colour harmony.', 'success');
    await analyzeImageAndSuggest(dataUrl, true);
  };

  const applyPalette = (idx: number) => {
    const pal = palettes[idx];
    if (!pal) return;
    setActivePaletteIndex(idx);
    setPreviewColors((prev) => ({
      ...prev,
      blouse: pal.blouseColor,
      border: pal.borderColor,
      embroidery: pal.embroideryColor,
      accessory: pal.accessoryColor,
    }));
  };

  const handleSwatchClick = (swatch: SwatchColor) => {
    setPreviewColors((prev) => ({
      ...prev,
      [activeTargetSlot]: swatch,
    }));
  };

  const activePalette = palettes[activePaletteIndex];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D9]">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#8C7A58] block mb-1">
            Personalize Stage · Indian Couture Colorimetry
          </span>
          <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#0C2B4E]">
            AI Colour Combination Studio
          </h3>
          <p className="text-xs sm:text-sm text-[#718096] mt-1">
            Upload a fashion photograph or pick any MUDRA weave to extract dominant tones and preview tailored blouse, border, embroidery & accessory pairings.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 bg-[#0C2B4E] hover:bg-[#07172C] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Upload Design Photo</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Input Design & Dominant Colours (5 cols) */}
        <div className="lg:col-span-5 space-y-4 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#0C2B4E]">Choose Source Design</span>
            <select
              value={sourceMode === 'product' ? selectedProductId : ''}
              onChange={(e) => {
                setSourceMode('product');
                setSelectedProductId(e.target.value);
              }}
              className="max-w-[210px] text-xs px-2.5 py-1.5 bg-white border border-[#D9D0C3] rounded-md text-[#0C2B4E]"
            >
              {apparelProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-5 gap-3 items-start">
            <div className="col-span-2 aspect-4/5 rounded-lg overflow-hidden border border-[#E8E2D9] bg-white">
              <img
                src={activeImageSrc}
                alt="Source design for color extraction"
                onError={(e) => handleImageError(e, selectedProduct?.category || 'women')}
                className="w-full h-full object-cover object-top"
              />
            </div>

            <div className="col-span-3 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0C2B4E]">
                <Palette className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Measured Dominant Tones</span>
                {isAnalyzing && <Loader2 className="w-3 h-3 animate-spin text-[#8C7A58]" />}
              </div>

              <div className="space-y-1.5">
                {dominantColors.map((c, idx) => (
                  <button
                    key={`${c.hex}-${idx}`}
                    type="button"
                    onClick={() => handleSwatchClick(c)}
                    className="w-full flex items-center justify-between p-1.5 bg-white hover:bg-[#FAF5E8] border border-[#E8E2D9] rounded-md text-left cursor-pointer transition-colors"
                    title={`Click to apply ${c.name} to active ${activeTargetSlot} slot`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-5 h-5 rounded border border-black/15 shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-[11px] font-medium text-[#1E252B] truncate">
                        {c.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#718096] shrink-0">
                      {c.hex}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {dominantAnalysis && (
            <p className="text-[11px] text-[#4A5568] bg-white p-3 rounded-lg border border-[#E8E2D9] leading-relaxed">
              {dominantAnalysis}
            </p>
          )}
          {analysisNote && (
            <p className="text-[11px] text-[#8C7A58] italic">{analysisNote}</p>
          )}
        </div>

        {/* Right: AI Palettes + Live Clickable Colour Combination Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Palette Selector Tabs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-heading text-sm font-bold text-[#0C2B4E] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>Recommended Complementary & Contrasting Palettes</span>
              </h4>
              <span className="text-[11px] text-[#718096]">Click a palette or any swatch</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {palettes.map((pal, idx) => {
                const isSelected = idx === activePaletteIndex;
                return (
                  <button
                    key={pal.title}
                    type="button"
                    onClick={() => applyPalette(idx)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FAF5E8] border-[#0C2B4E] ring-1 ring-[#D4AF37]'
                        : 'bg-white border-[#E8E2D9] hover:border-[#8C7A58]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-[#0C2B4E] line-clamp-1">
                        {pal.title}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#0C2B4E] shrink-0" />}
                    </div>
                    <div className="flex items-center gap-1.5 mb-2">
                      {[pal.blouseColor, pal.borderColor, pal.embroideryColor, pal.accessoryColor].map(
                        (sw, sIdx) => (
                          <span
                            key={sIdx}
                            className="w-5 h-5 rounded-full border border-black/15"
                            style={{ backgroundColor: sw.hex }}
                            title={sw.name}
                          />
                        )
                      )}
                    </div>
                    <p className="text-[11px] text-[#4A5568] line-clamp-2 leading-snug">
                      {pal.mood}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Live Preview + Clickable Element Swatch Customizer */}
          <div className="bg-white border border-[#E8E2D9] rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0EBE1] pb-3">
              <div>
                <h4 className="font-heading text-sm font-bold text-[#0C2B4E]">
                  Live Ensemble Colour Preview
                </h4>
                <p className="text-[11px] text-[#718096]">
                  Select a target piece below, then click any dominant or palette swatch to test live.
                </p>
              </div>
              {sourceMode === 'product' && selectedProduct && (
                <button
                  type="button"
                  onClick={() => navigateTo('product-detail', { productId: selectedProduct.id })}
                  className="text-xs font-semibold text-[#0C2B4E] hover:text-[#8C7A58] flex items-center gap-1 cursor-pointer"
                >
                  <span>Shop This Weave</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* Visual Drape & Blouse Color Preview Card */}
              <div className="md:col-span-5">
                <div className="rounded-xl border border-[#E8E2D9] overflow-hidden shadow-xs bg-[#FAF8F5] p-3 space-y-2">
                  {/* Top Blouse / Choli Block */}
                  <div
                    className="h-16 rounded-lg border border-black/10 flex items-center justify-between px-3 transition-colors duration-300"
                    style={{ backgroundColor: previewColors.blouse.hex }}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-white/90 text-[#0C2B4E]">
                      Blouse · {previewColors.blouse.name}
                    </span>
                  </div>

                  {/* Saree / Main Drape Body with Border & Embroidery Motif */}
                  <div
                    className="h-36 rounded-lg border-4 relative overflow-hidden p-3 flex flex-col justify-between transition-colors duration-300"
                    style={{
                      backgroundColor: previewColors.baseBody.hex,
                      borderColor: previewColors.border.hex,
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-white/90 text-[#0C2B4E]">
                        Drape · {previewColors.baseBody.name}
                      </span>
                    </div>

                    {/* Simulated Embroidery Butis */}
                    <div className="flex items-center justify-around py-2">
                      {[0, 1, 2, 3].map((dot) => (
                        <div
                          key={dot}
                          className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-300"
                          style={{
                            borderColor: previewColors.embroidery.hex,
                            backgroundColor: previewColors.border.hex,
                          }}
                        >
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: previewColors.embroidery.hex }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Zari Border Strip */}
                    <div
                      className="h-5 rounded px-2 flex items-center justify-between text-[9px] font-bold uppercase tracking-wider transition-colors duration-300"
                      style={{
                        backgroundColor: previewColors.border.hex,
                        color: '#07172C',
                      }}
                    >
                      <span>Border: {previewColors.border.name}</span>
                      <span>Embroidery: {previewColors.embroidery.name}</span>
                    </div>
                  </div>

                  {/* Potli / Accessory Bar */}
                  <div
                    className="h-9 rounded-lg border border-black/10 flex items-center justify-between px-3 transition-colors duration-300"
                    style={{ backgroundColor: previewColors.accessory.hex }}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-white/90 text-[#0C2B4E]">
                      Potli & Accent · {previewColors.accessory.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Controls & Recommendations */}
              <div className="md:col-span-7 space-y-3 text-xs">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8C7A58]">
                  Active Slot to Customize
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { key: 'blouse', label: 'Blouse Colour', color: previewColors.blouse },
                      { key: 'border', label: 'Saree / Garment Border', color: previewColors.border },
                      { key: 'embroidery', label: 'Embroidery Thread', color: previewColors.embroidery },
                      { key: 'accessory', label: 'Potli & Accessories', color: previewColors.accessory },
                    ] as const
                  ).map((slot) => {
                    const active = activeTargetSlot === slot.key;
                    return (
                      <button
                        key={slot.key}
                        type="button"
                        onClick={() => setActiveTargetSlot(slot.key)}
                        className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                          active
                            ? 'border-[#0C2B4E] bg-[#FAF5E8]'
                            : 'border-[#E8E2D9] bg-[#FAF8F5] hover:border-[#8C7A58]'
                        }`}
                      >
                        <div className="text-[10px] text-[#718096] font-medium">{slot.label}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className="w-4 h-4 rounded-full border border-black/15 shrink-0"
                            style={{ backgroundColor: slot.color.hex }}
                          />
                          <span className="font-semibold text-[#0C2B4E] truncate">
                            {slot.color.name}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Quick Clickable Swatch Strip */}
                {activePalette && (
                  <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E8E2D9] space-y-2">
                    <div className="text-[11px] font-semibold text-[#0C2B4E]">
                      Click a Swatch to Paint "{activeTargetSlot}":
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        activePalette.blouseColor,
                        activePalette.borderColor,
                        activePalette.embroideryColor,
                        activePalette.accessoryColor,
                        { name: 'Temple Gold', hex: '#D4AF37' },
                        { name: 'Midnight Navy', hex: '#0C2B4E' },
                        { name: 'Sindoor Crimson', hex: '#8B0000' },
                        { name: 'Ivory Cream', hex: '#FAF5E8' },
                      ].map((sw, i) => (
                        <button
                          key={`${sw.hex}-${i}`}
                          type="button"
                          onClick={() => handleSwatchClick(sw)}
                          className="inline-flex items-center gap-1.5 px-2 py-1 bg-white border border-[#D9D0C3] hover:border-[#0C2B4E] rounded text-[11px] cursor-pointer"
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-black/15"
                            style={{ backgroundColor: sw.hex }}
                          />
                          <span className="text-[#1E252B]">{sw.name}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-[#4A5568] pt-1 border-t border-[#E8E2D9]">
                      <strong className="text-[#0C2B4E]">Jewelry Pairing:</strong>{' '}
                      {activePalette.jewelryMetalRecommendation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
