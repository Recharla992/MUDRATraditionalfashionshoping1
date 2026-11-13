import React, { useMemo, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { compressImageToDataUrl, safePostJson } from '../../utils/canvasImageAnalysis';
import { normalizeImageUrl, handleImageError } from '../../utils/imageHelper';
import {
  Camera,
  Upload,
  Sparkles,
  Loader2,
  AlertCircle,
  RefreshCw,
  Columns2,
  Layers,
  CheckCircle2,
  ArrowRight,
  Shirt,
} from 'lucide-react';

interface TryOnAssessment {
  harmonySummary: string;
  drapeTip: string;
  tailoringNote: string;
  occasionFit: string;
}

interface TryOnResponse {
  synthesisAvailable: boolean;
  aiAnalysisAvailable: boolean;
  fallbackReason: string;
  assessment: TryOnAssessment;
}

interface VirtualTryOnModuleProps {
  initialProductId?: string | null;
}

export const VirtualTryOnModule: React.FC<VirtualTryOnModuleProps> = ({ initialProductId }) => {
  const { products, navigateTo, showToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const apparelProducts = useMemo(
    () => products.filter((p) => p.category === 'women' || p.category === 'men'),
    [products]
  );

  const [selectedProductId, setSelectedProductId] = useState<string>(() => {
    if (initialProductId && apparelProducts.some((p) => p.id === initialProductId)) {
      return initialProductId;
    }
    return apparelProducts[0]?.id || 'prod-001';
  });

  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userPhotoName, setUserPhotoName] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'women' | 'men'>('all');
  const [previewMode, setPreviewMode] = useState<'side-by-side' | 'drape-overlay'>('side-by-side');
  const [overlayOpacity, setOverlayOpacity] = useState<number>(48);
  const [overlayScale, setOverlayScale] = useState<number>(100);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tryOnResult, setTryOnResult] = useState<TryOnResponse | null>(null);
  const [lastTriedProductId, setLastTriedProductId] = useState<string | null>(null);

  const selectedProduct: Product | undefined = useMemo(
    () => apparelProducts.find((p) => p.id === selectedProductId) || apparelProducts[0],
    [apparelProducts, selectedProductId]
  );

  const visibleOutfits = useMemo(() => {
    if (categoryFilter === 'all') return apparelProducts;
    return apparelProducts.filter((p) => p.category === categoryFilter);
  }, [apparelProducts, categoryFilter]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid JPG, PNG, or WebP photograph.');
      return;
    }
    try {
      setErrorMessage(null);
      const dataUrl = await compressImageToDataUrl(file, 768);
      setUserPhoto(dataUrl);
      setUserPhotoName(file.name);
      setTryOnResult(null);
      showToast('Portrait uploaded. Select any outfit and click Try On.', 'success');
    } catch {
      setErrorMessage('Unable to read the selected photograph. Please try another file.');
    }
  };

  const runTryOn = async (targetProduct?: Product) => {
    const outfit = targetProduct || selectedProduct;
    if (!userPhoto) {
      setErrorMessage('Please upload your photograph first before clicking Try On.');
      return;
    }
    if (!outfit) {
      setErrorMessage('Please select an outfit from the MUDRA collection.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const payload = await safePostJson<TryOnResponse>('/api/ai/virtual-tryon', {
      userPhotoBase64: userPhoto,
      product: {
        id: outfit.id,
        name: outfit.name,
        category: outfit.category,
        subcategory: outfit.subcategory,
        material: outfit.material,
        fabricDetails: outfit.fabricDetails,
        availableColors: outfit.availableColors,
      },
    });

    if (payload) {
      setTryOnResult(payload);
    } else {
      // Honest offline fallback when server API route isn't reachable (e.g., static deploy)
      setTryOnResult({
        synthesisAvailable: false,
        aiAnalysisAvailable: false,
        fallbackReason:
          'Photorealistic AI image rendering requires a paid image-generation key and active backend server. Displaying an honest interactive side-by-side comparison preview instead of a synthetic fake image.',
        assessment: {
          harmonySummary: `${outfit.name} is crafted in ${outfit.material}. Use the side-by-side or translucent drape overlay controls to compare proportions against your uploaded portrait.`,
          drapeTip: `For ${outfit.subcategory}, keep pleats structured and pair with subtle 22K gold accents matching the border sheen.`,
          tailoringNote: 'Use MUDRA Bespoke Atelier on the product page for made-to-measure blouse/kurta sizing.',
          occasionFit: 'Suited for weddings, festive rituals, receptions, and celebratory gatherings.',
        },
      });
    }

    setLastTriedProductId(outfit.id);
    setIsProcessing(false);
  };

  const handleOutfitSelect = (product: Product) => {
    setSelectedProductId(product.id);
    // Keep the uploaded photo intact so user never has to re-upload
    if (userPhoto && tryOnResult) {
      runTryOn(product);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D9]">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#8C7A58] block mb-1">
            Visualize Stage · Honest Try-On Studio
          </span>
          <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#0C2B4E]">
            AI Virtual Outfit Try-On & Drape Comparison
          </h3>
          <p className="text-xs sm:text-sm text-[#718096] mt-1">
            Upload your portrait once, then switch seamlessly across MUDRA sarees, lehengas, and sherwanis without re-uploading.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 bg-white border border-[#0C2B4E] text-[#0C2B4E] hover:bg-[#FAF5E8] text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{userPhoto ? 'Change Portrait Photo' : 'Upload Your Photo'}</span>
          </button>

          <button
            type="button"
            onClick={() => runTryOn()}
            disabled={!userPhoto || isProcessing || !selectedProduct}
            className="px-5 py-2.5 bg-[#0C2B4E] hover:bg-[#07172C] disabled:opacity-50 text-white text-xs font-semibold rounded-md shadow-sm transition-colors cursor-pointer flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
                <span>Analyzing & Preparing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Try On Outfit</span>
              </>
            )}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Portrait & Live Comparison Stage (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl p-4 sm:p-5 space-y-4">
            {/* Stage Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#0C2B4E]">
                <Camera className="w-4 h-4 text-[#D4AF37]" />
                <span>
                  {userPhoto
                    ? `Portrait Ready (${userPhotoName || 'Uploaded'})`
                    : 'Step 1: Upload Portrait Photograph'}
                </span>
              </div>

              {userPhoto && (
                <div className="flex items-center gap-1 p-1 bg-[#EFEAE2] rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('side-by-side')}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors ${
                      previewMode === 'side-by-side'
                        ? 'bg-white text-[#0C2B4E] shadow-xs font-semibold'
                        : 'text-[#718096] hover:text-[#0C2B4E]'
                    }`}
                  >
                    <Columns2 className="w-3 h-3" />
                    <span>Side-by-Side</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('drape-overlay')}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors ${
                      previewMode === 'drape-overlay'
                        ? 'bg-white text-[#0C2B4E] shadow-xs font-semibold'
                        : 'text-[#718096] hover:text-[#0C2B4E]'
                    }`}
                  >
                    <Layers className="w-3 h-3" />
                    <span>Drape Overlay</span>
                  </button>
                </div>
              )}
            </div>

            {/* Canvas Stage */}
            {!userPhoto ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#D9D0C3] hover:border-[#0C2B4E] bg-white rounded-xl py-14 px-6 text-center cursor-pointer transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-[#FAF5E8] border border-[#D4AF37]/40 mx-auto flex items-center justify-center mb-3">
                  <Upload className="w-5 h-5 text-[#0C2B4E]" />
                </div>
                <p className="font-heading text-base font-bold text-[#0C2B4E]">
                  Upload Your Full or Half-Body Photo
                </p>
                <p className="text-xs text-[#718096] max-w-md mx-auto mt-1.5 leading-relaxed">
                  Your uploaded photo stays active across the entire session — switch between sarees, lehengas, kurtas, and sherwanis freely without re-uploading.
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-[#0C2B4E] text-white text-xs font-semibold rounded-md">
                  <Camera className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Choose Photograph
                </span>
              </div>
            ) : (
              <div className="space-y-4">
                {previewMode === 'side-by-side' ? (
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-white rounded-lg border border-[#E8E2D9] overflow-hidden">
                      <div className="px-3 py-1.5 bg-[#EFEAE2] text-[11px] font-semibold text-[#0C2B4E] flex justify-between">
                        <span>Your Photograph</span>
                        <span className="text-[#8C7A58]">Preserved</span>
                      </div>
                      <div className="aspect-3/4 bg-[#F3EFE9]">
                        <img
                          src={userPhoto}
                          alt="Uploaded customer portrait"
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                    </div>

                    {selectedProduct && (
                      <div className="bg-white rounded-lg border border-[#E8E2D9] overflow-hidden">
                        <div className="px-3 py-1.5 bg-[#0C2B4E] text-[11px] font-semibold text-[#F3E8CE] flex justify-between items-center">
                          <span className="truncate">Selected Garment</span>
                          <span className="text-[#D4AF37] font-mono shrink-0">
                            ₹{selectedProduct.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <div className="aspect-3/4 bg-[#F3EFE9]">
                          <img
                            src={normalizeImageUrl(selectedProduct.images[0], selectedProduct.category)}
                            alt={selectedProduct.name}
                            onError={(e) => handleImageError(e, selectedProduct.category)}
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative aspect-3/4 max-h-[460px] mx-auto w-full max-w-sm bg-[#F3EFE9] rounded-xl overflow-hidden border border-[#E8E2D9]">
                      <img
                        src={userPhoto}
                        alt="Uploaded customer portrait"
                        className="w-full h-full object-cover object-top"
                      />
                      {selectedProduct && (
                        <img
                          src={normalizeImageUrl(selectedProduct.images[0], selectedProduct.category)}
                          alt={selectedProduct.name}
                          onError={(e) => handleImageError(e, selectedProduct.category)}
                          style={{
                            opacity: overlayOpacity / 100,
                            transform: `scale(${overlayScale / 100})`,
                          }}
                          className="absolute inset-0 w-full h-full object-cover object-top mix-blend-multiply transition-all duration-200 pointer-events-none"
                        />
                      )}
                      <div className="absolute bottom-2 inset-x-2 bg-[#07172C]/85 text-[#F3E8CE] text-[10px] px-2.5 py-1.5 rounded text-center">
                        Interactive Drape Comparison Fallback (Non-Generative)
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3 rounded-lg border border-[#E8E2D9] text-xs">
                      <label className="space-y-1">
                        <div className="flex justify-between text-[#4A5568]">
                          <span>Garment Overlay Opacity</span>
                          <span className="font-mono font-semibold text-[#0C2B4E]">{overlayOpacity}%</span>
                        </div>
                        <input
                          type="range"
                          min={20}
                          max={80}
                          value={overlayOpacity}
                          onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                          className="w-full accent-[#0C2B4E]"
                        />
                      </label>
                      <label className="space-y-1">
                        <div className="flex justify-between text-[#4A5568]">
                          <span>Drape Frame Scale</span>
                          <span className="font-mono font-semibold text-[#0C2B4E]">{overlayScale}%</span>
                        </div>
                        <input
                          type="range"
                          min={85}
                          max={120}
                          value={overlayScale}
                          onChange={(e) => setOverlayScale(Number(e.target.value))}
                          className="w-full accent-[#0C2B4E]"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* Try-On Response / Honest Fallback Banner */}
                {isProcessing && (
                  <div className="p-4 bg-white border border-[#D4AF37]/40 rounded-lg flex items-center gap-3 text-xs text-[#0C2B4E]">
                    <Loader2 className="w-4 h-4 animate-spin text-[#D4AF37] shrink-0" />
                    <span>
                      Checking image synthesis availability & evaluating silhouette and drape compatibility...
                    </span>
                  </div>
                )}

                {!isProcessing && tryOnResult && (
                  <div className="space-y-3">
                    {!tryOnResult.synthesisAvailable && (
                      <div className="p-3.5 bg-[#FAF5E8] border border-[#D4AF37]/60 rounded-lg text-xs text-[#0C2B4E] space-y-1">
                        <div className="font-semibold flex items-center gap-1.5 text-[#8C7A58]">
                          <AlertCircle className="w-4 h-4 text-[#D4AF37] shrink-0" />
                          <span>Photorealistic Image Generation Unavailable — Honest Fallback Active</span>
                        </div>
                        <p className="text-[#4A5568] leading-relaxed">{tryOnResult.fallbackReason}</p>
                      </div>
                    )}

                    <div className="p-4 bg-white border border-[#E8E2D9] rounded-lg space-y-2.5 text-xs">
                      <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-2">
                        <span className="font-heading font-bold text-sm text-[#0C2B4E] flex items-center gap-1.5">
                          {tryOnResult.aiAnalysisAvailable ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Shirt className="w-4 h-4 text-[#D4AF37]" />
                          )}
                          <span>
                            {tryOnResult.aiAnalysisAvailable
                              ? 'Gemini Vision Stylist & Fit Assessment'
                              : 'Curated Styling & Fit Guidance'}
                          </span>
                        </span>
                        {lastTriedProductId && selectedProduct && (
                          <button
                            type="button"
                            onClick={() => navigateTo('product-detail', { productId: selectedProduct.id })}
                            className="text-[11px] font-semibold text-[#0C2B4E] hover:text-[#8C7A58] flex items-center gap-1 cursor-pointer"
                          >
                            <span>View Product</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-2.5 bg-[#FAF8F5] rounded border border-[#E8E2D9]">
                          <p className="text-[10px] uppercase tracking-wider font-semibold text-[#8C7A58] mb-0.5">
                            Portrait Harmony
                          </p>
                          <p className="text-[#2D3748] leading-relaxed">{tryOnResult.assessment.harmonySummary}</p>
                        </div>
                        <div className="p-2.5 bg-[#FAF8F5] rounded border border-[#E8E2D9]">
                          <p className="text-[10px] uppercase tracking-wider font-semibold text-[#8C7A58] mb-0.5">
                            Drape & Silhouette Tip
                          </p>
                          <p className="text-[#2D3748] leading-relaxed">{tryOnResult.assessment.drapeTip}</p>
                        </div>
                        <div className="p-2.5 bg-[#FAF8F5] rounded border border-[#E8E2D9]">
                          <p className="text-[10px] uppercase tracking-wider font-semibold text-[#8C7A58] mb-0.5">
                            Tailoring Recommendation
                          </p>
                          <p className="text-[#2D3748] leading-relaxed">{tryOnResult.assessment.tailoringNote}</p>
                        </div>
                        <div className="p-2.5 bg-[#FAF8F5] rounded border border-[#E8E2D9]">
                          <p className="text-[10px] uppercase tracking-wider font-semibold text-[#8C7A58] mb-0.5">
                            Occasion Match
                          </p>
                          <p className="text-[#2D3748] leading-relaxed">{tryOnResult.assessment.occasionFit}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Switch Outfits Without Re-Uploading Photo (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-[#E8E2D9] rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h4 className="font-heading text-sm font-bold text-[#0C2B4E]">
                Select or Switch Outfit
              </h4>
              <p className="text-[11px] text-[#718096]">
                Click any saree, lehenga, or sherwani to preview immediately
              </p>
            </div>
            {userPhoto && selectedProduct && (
              <button
                type="button"
                onClick={() => runTryOn(selectedProduct)}
                disabled={isProcessing}
                className="px-2.5 py-1.5 text-[11px] font-semibold bg-[#FAF5E8] text-[#0C2B4E] border border-[#D4AF37]/50 rounded cursor-pointer hover:bg-[#EFEAE2] flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>Refresh Try-On</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#EFEAE2] rounded-lg text-xs">
            {(['all', 'women', 'men'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setCategoryFilter(tab)}
                className={`flex-1 py-1.5 rounded-md capitalize font-medium cursor-pointer transition-colors ${
                  categoryFilter === tab
                    ? 'bg-white text-[#0C2B4E] font-semibold shadow-xs'
                    : 'text-[#718096] hover:text-[#0C2B4E]'
                }`}
              >
                {tab === 'all' ? 'All Outfits' : `${tab}'s`}
              </button>
            ))}
          </div>

          {/* Selected Highlight */}
          {selectedProduct && (
            <div className="p-3 rounded-lg bg-[#FAF5E8] border border-[#D4AF37]/40 flex items-center gap-3">
              <img
                src={normalizeImageUrl(selectedProduct.images[0], selectedProduct.category)}
                alt={selectedProduct.name}
                onError={(e) => handleImageError(e, selectedProduct.category)}
                className="w-12 h-14 object-cover object-top rounded border border-[#E8E2D9] shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase font-semibold text-[#8C7A58]">
                  Active Outfit · {selectedProduct.subcategory}
                </p>
                <p className="text-xs font-bold text-[#0C2B4E] truncate">{selectedProduct.name}</p>
                <p className="text-[11px] text-[#4A5568] font-mono mt-0.5">
                  ₹{selectedProduct.price.toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          )}

          {/* Scrollable Outfit List */}
          <div className="grid grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
            {visibleOutfits.map((outfit) => {
              const isSelected = outfit.id === selectedProduct?.id;
              return (
                <button
                  key={outfit.id}
                  type="button"
                  onClick={() => handleOutfitSelect(outfit)}
                  className={`text-left rounded-lg border overflow-hidden transition-all cursor-pointer bg-white ${
                    isSelected
                      ? 'border-[#0C2B4E] ring-2 ring-[#D4AF37]/50 shadow-sm'
                      : 'border-[#E8E2D9] hover:border-[#8C7A58]'
                  }`}
                >
                  <div className="aspect-4/5 bg-[#F3EFE9] overflow-hidden relative">
                    <img
                      src={normalizeImageUrl(outfit.images[0], outfit.category)}
                      alt={outfit.name}
                      onError={(e) => handleImageError(e, outfit.category)}
                      className="w-full h-full object-cover object-top"
                    />
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-[#0C2B4E] text-[#F3E8CE] text-[9px] font-bold rounded">
                        Selected
                      </span>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-[11px] font-semibold text-[#0C2B4E] line-clamp-1">
                      {outfit.name}
                    </p>
                    <p className="text-[10px] text-[#718096] font-mono mt-0.5">
                      ₹{outfit.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
