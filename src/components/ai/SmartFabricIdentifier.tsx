import React, { useMemo, useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  analyzeFabricOpticalSignature,
  compressImageToDataUrl,
  FabricEstimateResult,
  safePostJson,
} from '../../utils/canvasImageAnalysis';
import { normalizeImageUrl, handleImageError } from '../../utils/imageHelper';
import {
  Upload,
  Microscope,
  Loader2,
  AlertCircle,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface IdentifyFabricApiResponse {
  isFallback: boolean;
  reason?: string;
  result?: FabricEstimateResult;
}

const REFERENCE_FABRIC_CATEGORIES = [
  'Silk',
  'Cotton',
  'Linen',
  'Chiffon',
  'Georgette',
  'Velvet',
  'Organza',
];

const QUICK_SAMPLE_SWATCHES = [
  {
    id: 'sample-banarasi',
    label: 'Banarasi Katan Silk',
    image: '/images/banarasi_silk_saree_1793794026510.jpg',
  },
  {
    id: 'sample-organza',
    label: 'Kora Organza Floral',
    image: '/images/mudra_kora_organza_saree_1793643995592.jpg',
  },
  {
    id: 'sample-chanderi',
    label: 'Chanderi Silk-Cotton',
    image: '/images/chanderi_silk_saree_1793794041755.jpg',
  },
  {
    id: 'sample-velvet',
    label: 'Velvet Zardozi',
    image: '/images/mens_silk_mojari_1793794096375.jpg',
  },
];

export const SmartFabricIdentifier: React.FC = () => {
  const { products, navigateTo, showToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [fabricImage, setFabricImage] = useState<string | null>(null);
  const [imageLabel, setImageLabel] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<FabricEstimateResult | null>(null);

  const runFabricIdentification = async (imageSrc: string, sendBase64ToServer: boolean) => {
    setIsAnalyzing(true);
    setErrorMessage(null);

    let dataUrlToSend = imageSrc;
    if (!sendBase64ToServer && !imageSrc.startsWith('data:')) {
      // Convert local sample path into data URL via canvas so Gemini Vision inspects the actual pixels
      try {
        const resp = await fetch(imageSrc);
        const blob = await resp.blob();
        const reader = new FileReader();
        dataUrlToSend = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(String(reader.result || ''));
          reader.readAsDataURL(blob);
        });
      } catch {
        dataUrlToSend = imageSrc;
      }
    }

    const apiRes = dataUrlToSend.startsWith('data:image/')
      ? await safePostJson<IdentifyFabricApiResponse>('/api/ai/identify-fabric', {
          imageBase64: dataUrlToSend,
        })
      : null;

    if (apiRes && !apiRes.isFallback && apiRes.result) {
      setEstimate({
        ...apiRes.result,
        isOfflineOpticalEstimate: false,
      });
    } else {
      const opticalFallback = await analyzeFabricOpticalSignature(imageSrc);
      setEstimate(opticalFallback);
    }

    setIsAnalyzing(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a JPG, PNG, or WebP photograph of the fabric.');
      return;
    }
    try {
      const compressed = await compressImageToDataUrl(file, 768);
      setFabricImage(compressed);
      setImageLabel(file.name);
      showToast('Analyzing uploaded fabric texture...', 'info');
      await runFabricIdentification(compressed, true);
    } catch {
      setErrorMessage('Unable to process this image. Please try another photograph.');
    }
  };

  const handleSampleClick = async (sample: (typeof QUICK_SAMPLE_SWATCHES)[number]) => {
    setFabricImage(sample.image);
    setImageLabel(sample.label);
    await runFabricIdentification(sample.image, false);
  };

  const matchingCatalogProducts = useMemo(() => {
    if (!estimate) return [];
    const tokens = `${estimate.fabricCategory} ${estimate.likelySubType}`
      .toLowerCase()
      .split(/[\s/,]+/)
      .filter((t) => t.length > 2);

    const scored = products
      .filter((p) => p.category === 'women' || p.category === 'men')
      .map((p) => {
        const hay = `${p.name} ${p.material} ${p.fabricDetails} ${p.fabricType || ''}`.toLowerCase();
        const hits = tokens.reduce((acc, tok) => (hay.includes(tok) ? acc + 1 : acc), 0);
        return { product: p, hits };
      })
      .filter((item) => item.hits > 0)
      .sort((a, b) => b.hits - a.hits);

    return (scored.length > 0 ? scored.map((s) => s.product) : products.slice(0, 3)).slice(0, 3);
  }, [estimate, products]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D9]">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#8C7A58] block mb-1">
            Textile Conservation Lab · Visual Fiber Estimator
          </span>
          <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#0C2B4E]">
            Smart Fabric Identifier
          </h3>
          <p className="text-xs sm:text-sm text-[#718096] mt-1">
            Upload a close-up photograph of any fabric to estimate its category (Silk, Cotton, Linen, Chiffon, Georgette, Velvet, Organza), drape characteristics, and care guide.
          </p>
        </div>

        <div className="shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2.5 bg-[#0C2B4E] hover:bg-[#07172C] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Upload Fabric Photo</span>
          </button>
        </div>
      </div>

      {/* Explicit Honest Estimate Notice */}
      <div className="p-3 bg-[#FAF5E8] border border-[#D4AF37]/50 rounded-lg text-xs text-[#0C2B4E] flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-semibold">Honest Identification Note:</strong> Identifying textile composition from a single photograph provides an informed visual <strong>estimate</strong> based on surface sheen, weave density, and fold behavior. Blended yarns or pure silk certification (Silk Mark) always require physical yarn or laboratory verification.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Upload Zone & Sample Swatches (5 cols) */}
        <div className="lg:col-span-5 space-y-4 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl p-4">
          {fabricImage ? (
            <div className="space-y-3">
              <div className="aspect-4/3 rounded-lg overflow-hidden border border-[#E8E2D9] bg-white relative">
                <img
                  src={fabricImage}
                  alt={imageLabel || 'Uploaded fabric sample'}
                  className="w-full h-full object-cover"
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-[#07172C]/70 flex flex-col items-center justify-center text-white text-xs gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#D4AF37]" />
                    <span>Inspecting weave sheen & texture...</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#4A5568] truncate font-medium">
                  Inspecting: <strong className="text-[#0C2B4E]">{imageLabel}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => runFabricIdentification(fabricImage, fabricImage.startsWith('data:'))}
                  disabled={isAnalyzing}
                  className="text-[11px] font-semibold text-[#0C2B4E] underline cursor-pointer shrink-0"
                >
                  Re-analyze
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#D9D0C3] hover:border-[#0C2B4E] bg-white rounded-xl py-12 px-5 text-center cursor-pointer transition-colors"
            >
              <div className="w-11 h-11 rounded-full bg-[#FAF5E8] border border-[#D4AF37]/40 mx-auto flex items-center justify-center mb-3">
                <Microscope className="w-5 h-5 text-[#0C2B4E]" />
              </div>
              <p className="font-heading text-sm font-bold text-[#0C2B4E]">
                Upload Macro or Fold Photo of Any Fabric
              </p>
              <p className="text-[11px] text-[#718096] mt-1 max-w-xs mx-auto leading-relaxed">
                Supports close-ups of sarees, dupattas, suit yardage, kurtas, or upholstery. Natural daylight gives clearest estimates.
              </p>
            </div>
          )}

          {/* Supported Categories & Quick Swatches */}
          <div className="space-y-2.5 pt-2 border-t border-[#E8E2D9]">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8C7A58]">
              Quick Test with Handloom Swatches
            </p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_SAMPLE_SWATCHES.map((sw) => (
                <button
                  key={sw.id}
                  type="button"
                  onClick={() => handleSampleClick(sw)}
                  className="flex items-center gap-2 p-1.5 bg-white hover:bg-[#FAF5E8] border border-[#E8E2D9] rounded-lg text-left cursor-pointer transition-colors"
                >
                  <img
                    src={sw.image}
                    alt={sw.label}
                    className="w-8 h-8 rounded object-cover shrink-0"
                  />
                  <span className="text-[11px] font-medium text-[#0C2B4E] leading-tight line-clamp-2">
                    {sw.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="pt-2 text-[11px] text-[#718096]">
              <strong className="text-[#0C2B4E]">Categories Covered:</strong>{' '}
              {REFERENCE_FABRIC_CATEGORIES.join(' · ')}
            </div>
          </div>
        </div>

        {/* Right: Structured Fabric Analysis Results (7 cols) */}
        <div className="lg:col-span-7">
          {!estimate && !isAnalyzing && (
            <div className="bg-white border border-[#E8E2D9] rounded-xl p-8 text-center space-y-3">
              <Sparkles className="w-7 h-7 text-[#D4AF37] mx-auto" />
              <h4 className="font-heading text-base font-bold text-[#0C2B4E]">
                Awaiting Fabric Sample
              </h4>
              <p className="text-xs text-[#718096] max-w-md mx-auto leading-relaxed">
                Upload a fabric photograph on the left or click one of the handloom swatches to inspect its estimated weave category, drape profile, common garment uses, and washing instructions.
              </p>
            </div>
          )}

          {isAnalyzing && !estimate && (
            <div className="bg-white border border-[#E8E2D9] rounded-xl p-10 text-center space-y-3">
              <Loader2 className="w-7 h-7 animate-spin text-[#0C2B4E] mx-auto" />
              <p className="text-xs font-semibold text-[#0C2B4E]">
                Evaluating specular reflection, fold geometry & yarn granularity...
              </p>
            </div>
          )}

          {estimate && (
            <div className="bg-white border border-[#E8E2D9] rounded-xl p-5 space-y-4">
              {/* Top Result Header */}
              <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-[#F0EBE1]">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[#8C7A58] block">
                    Estimated Fabric Category
                  </span>
                  <h4 className="font-heading text-xl font-bold text-[#0C2B4E] mt-0.5">
                    {estimate.fabricCategory}
                  </h4>
                  <p className="text-xs text-[#4A5568] mt-0.5">
                    Likely Weave: <strong className="text-[#0C2B4E]">{estimate.likelySubType}</strong>
                  </p>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0C2B4E] bg-[#FAF5E8] border border-[#D4AF37]/40 px-2.5 py-1 rounded">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{estimate.confidenceLevel}</span>
                  </span>
                </div>
              </div>

              {/* Texture Profile */}
              <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E8E2D9] text-xs">
                <p className="font-semibold text-[#0C2B4E] mb-1">Likely Texture & Drape Profile</p>
                <p className="text-[#4A5568] leading-relaxed">{estimate.textureProfile}</p>
              </div>

              {/* Three Info Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E8E2D9] space-y-1.5">
                  <p className="font-semibold text-[#0C2B4E]">Key Characteristics</p>
                  <ul className="space-y-1 text-[11px] text-[#4A5568] list-disc pl-4">
                    {estimate.characteristics.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E8E2D9] space-y-1.5">
                  <p className="font-semibold text-[#0C2B4E]">Common Uses</p>
                  <ul className="space-y-1 text-[11px] text-[#4A5568] list-disc pl-4">
                    {estimate.commonUses.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E8E2D9] space-y-1.5">
                  <p className="font-semibold text-[#0C2B4E]">Maintenance & Care</p>
                  <ul className="space-y-1 text-[11px] text-[#4A5568] list-disc pl-4">
                    {estimate.maintenanceInstructions.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Observed Cues & Explicit Estimate Disclaimer */}
              <div className="text-[11px] text-[#4A5568] space-y-1.5 pt-2 border-t border-[#F0EBE1]">
                {estimate.visualCuesObserved?.length > 0 && (
                  <p>
                    <strong className="text-[#0C2B4E]">Observed Visual Cues:</strong>{' '}
                    {estimate.visualCuesObserved.join(' · ')}
                  </p>
                )}
                <p className="text-[#8C7A58] italic">{estimate.estimateDisclaimer}</p>
              </div>

              {/* Matching MUDRA Creations */}
              {matchingCatalogProducts.length > 0 && (
                <div className="pt-3 border-t border-[#E8E2D9] space-y-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8C7A58]">
                    Comparable Fabrics in MUDRA Collection
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {matchingCatalogProducts.map((prod) => (
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
                        <ArrowRight className="w-3 h-3 text-[#8C7A58] shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
