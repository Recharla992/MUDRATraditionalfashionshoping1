import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Camera,
  Upload,
  X,
  Sparkles,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  Scissors,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  ArrowRight,
  Feather,
  Eye,
  AlertCircle,
  Video,
} from 'lucide-react';
import { Product, VisualSearchResult, VisualSamplePreset } from '../types';

const SAMPLE_PRESETS: VisualSamplePreset[] = [
  {
    id: 'sample-kanchipuram',
    title: 'Bridal Kanchipuram Saree',
    subtitle: 'Pure Mulberry Silk with Temple Zari Pallu',
    imageUrl: '/src/assets/images/mudra_women_kanchipuram_saree_1793641347386.jpg',
    tag: 'Bridal Crimson & Gold',
  },
  {
    id: 'sample-tissue',
    title: 'Liquid Gold Tissue Silk',
    subtitle: 'High-glamour metallic sheen drape',
    imageUrl: '/src/assets/images/mudra_tissue_silk_saree_1793643995228.jpg',
    tag: 'Metallic Zari Sheen',
  },
  {
    id: 'sample-kora',
    title: 'Vrindavan Kora Organza',
    subtitle: 'Translucent sheer drape with floral border',
    imageUrl: '/src/assets/images/mudra_kora_organza_saree_1793643995592.jpg',
    tag: 'Crisp Meenakari Silk',
  },
  {
    id: 'sample-sherwani',
    title: 'Royal Velvet Sherwani',
    subtitle: 'Navy & Antique Gold Groom Ensemble',
    imageUrl: '/src/assets/images/mudra_men_royal_sherwani_1793641348047.jpg',
    tag: "Men's Imperial Wear",
  },
  {
    id: 'sample-bangles',
    title: 'Temple Kada Bangles',
    subtitle: '22K Gold Plated with Radha-Krishna Motifs',
    imageUrl: '/src/assets/images/mudra_temple_kada_bangles_1793643997507.jpg',
    tag: 'Antique Nakshi Jewelry',
  },
  {
    id: 'sample-pendant',
    title: 'Krishna Flute & Mor-Pankh',
    subtitle: '22K Dipped Devotional Sacred Pendant',
    imageUrl: '/src/assets/images/mudra_spiritual_pendant_1793641347310.jpg',
    tag: 'Spiritual Sacred Keepsake',
  },
];

export const VisualSearchModal: React.FC = () => {
  const {
    isVisualSearchOpen,
    setIsVisualSearchOpen,
    products,
    navigateTo,
    addToCart,
    showToast,
    visualSearchInitialPreset,
    setVisualSearchInitialPreset,
  } = useApp();

  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analyzingStep, setAnalyzingStep] = useState<string>('Analyzing weave & colors...');
  const [analysisResult, setAnalysisResult] = useState<VisualSearchResult | null>(null);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<string>('all');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  // Camera states
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto trigger if initial preset was provided
  useEffect(() => {
    if (isVisualSearchOpen && visualSearchInitialPreset) {
      const preset = SAMPLE_PRESETS.find((p) => p.id === visualSearchInitialPreset);
      if (preset) {
        handlePresetSelect(preset);
      }
      setVisualSearchInitialPreset(null);
    }
  }, [isVisualSearchOpen, visualSearchInitialPreset]);

  // Clean up camera on modal close
  useEffect(() => {
    if (!isVisualSearchOpen) {
      stopCamera();
    }
  }, [isVisualSearchOpen]);

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const startCamera = async () => {
    setErrorNotice(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera error:', err);
      setErrorNotice('Unable to access camera. Please upload an image file instead.');
    }
  };

  const captureCameraPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    stopCamera();
    processImage(dataUrl, 'image/jpeg', 'Live Camera Capture');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readFileAndAnalyze(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      readFileAndAnalyze(file);
    }
  };

  const readFileAndAnalyze = (file: File) => {
    setErrorNotice(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        processImage(result, file.type, file.name);
      }
    };
    reader.onerror = () => {
      setErrorNotice('Error reading file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const handlePresetSelect = async (preset: VisualSamplePreset) => {
    setUploadedImagePreview(preset.imageUrl);
    setErrorNotice(null);
    setIsAnalyzing(true);
    setAnalyzingStep(`Analyzing ${preset.title}...`);

    try {
      // Send sampleId to backend
      const res = await fetch('/api/visual-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sampleId: preset.id,
          hint: `${preset.title} ${preset.subtitle} ${preset.tag}`,
          catalogSummaries: products.map((p) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            subcategory: p.subcategory,
            fabric: p.material || p.fabricDetails,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      if (data.result) {
        setAnalysisResult(data.result);
      }
    } catch (err: any) {
      console.error('Visual search error:', err);
      setErrorNotice('Connected via local visual matching.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const processImage = async (base64Data: string, mimeType: string, filename?: string) => {
    setUploadedImagePreview(base64Data);
    setIsAnalyzing(true);
    setErrorNotice(null);

    // Dynamic animation sequence for visual delight
    setAnalyzingStep('Scanning weave texture & gold zari motifs...');
    const t1 = setTimeout(() => {
      setAnalyzingStep('Identifying Indian traditional silhouette & craft heritage...');
    }, 900);
    const t2 = setTimeout(() => {
      setAnalyzingStep("Matching against MUDRA's Vrindavan heirloom archives...");
    }, 1800);

    try {
      const res = await fetch('/api/visual-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType,
          hint: filename || 'Traditional Indian Couture or Jewelry',
          catalogSummaries: products.map((p) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            subcategory: p.subcategory,
            fabric: p.material || p.fabricDetails,
          })),
        }),
      });

      clearTimeout(t1);
      clearTimeout(t2);

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();
      if (data.result) {
        setAnalysisResult(data.result);
      }
    } catch (err: any) {
      console.error('Visual search processing error:', err);
      setErrorNotice('Using instant cultural matching engine.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetSearch = () => {
    setUploadedImagePreview(null);
    setAnalysisResult(null);
    setErrorNotice(null);
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Resolve matching product instances from catalog
  const matchedProducts: { product: Product; score: number }[] = [];
  if (analysisResult?.matchedProductIds) {
    analysisResult.matchedProductIds.forEach((id) => {
      const found = products.find((p) => p.id === id);
      if (found) {
        const score = analysisResult.matchScores?.[id] || 92;
        matchedProducts.push({ product: found, score });
      }
    });
  }

  // If few direct ID matches, supplement with category/subcategory matches
  if (matchedProducts.length < 3 && analysisResult) {
    const supplements = products.filter(
      (p) =>
        !matchedProducts.some((m) => m.product.id === p.id) &&
        (p.category === analysisResult.category ||
          p.subcategory.toLowerCase().includes(analysisResult.subcategory.toLowerCase()) ||
          p.material.toLowerCase().includes((analysisResult.fabrics?.[0] || '').toLowerCase()))
    );
    supplements.slice(0, 4 - matchedProducts.length).forEach((p, idx) => {
      matchedProducts.push({ product: p, score: 88 - idx * 3 });
    });
  }

  // Filter products by selected category pill
  const displayedMatches = matchedProducts.filter(({ product }) => {
    if (selectedFilterCategory === 'all') return true;
    return product.category === selectedFilterCategory;
  });

  if (!isVisualSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#FAF8F5] w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl border border-[#D4AF37]/50 flex flex-col overflow-hidden text-[#1E252B] my-auto">
        
        {/* Header */}
        <div className="bg-[#0C2B4E] text-[#F3E8CE] p-4 sm:p-5 flex items-center justify-between border-b border-[#D4AF37]/40 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-full bg-gradient-to-b from-[#0F355F] to-[#041021] p-1.5 border-2 border-[#E5B23A] ring-2 ring-[#D4AF37]/50 shadow-md flex items-center justify-center shrink-0 overflow-hidden">
              <img src="/mudra-logo.png" alt="MUDRA" className="w-full h-full object-contain filter drop-shadow-[0_2px_6px_rgba(255,226,133,0.85)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-lg sm:text-xl font-bold tracking-wide text-[#F3E8CE]">
                  MUDRA Drishti AI
                </h2>
                <span className="px-2 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] text-[10px] font-mono rounded tracking-wider uppercase">
                  Visual Match
                </span>
              </div>
              <p className="text-xs text-[#A0AEC0]">
                Upload any outfit or ornament photo to discover authentic matching creations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {uploadedImagePreview && (
              <button
                onClick={resetSearch}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#F3E8CE] hover:text-white bg-[#07172C] hover:bg-black rounded-lg border border-[#D4AF37]/30 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>New Photo</span>
              </button>
            )}
            <button
              onClick={() => {
                stopCamera();
                setIsVisualSearchOpen(false);
              }}
              className="p-2 text-[#A0AEC0] hover:text-[#F3E8CE] rounded-lg transition-colors cursor-pointer"
              aria-label="Close visual search modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* Active Camera View */}
          {isCameraActive && (
            <div className="relative bg-black rounded-2xl overflow-hidden border-2 border-[#D4AF37] max-w-lg mx-auto aspect-4/3 flex flex-col items-center justify-center shadow-xl">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-2 border-dashed border-[#D4AF37]/50 rounded-xl m-6 pointer-events-none" />
              <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 bg-black/50 py-3 backdrop-blur-xs">
                <button
                  onClick={stopCamera}
                  className="px-4 py-2 text-xs text-white bg-gray-800 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={captureCameraPhoto}
                  className="px-6 py-2.5 bg-[#D4AF37] hover:bg-[#C59B27] text-[#0C2B4E] font-bold text-xs rounded-full shadow-lg flex items-center gap-2 cursor-pointer transition-transform transform active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>Take Snapshot</span>
                </button>
              </div>
            </div>
          )}

          {/* Upload Drop Zone & Actions (When no image is uploaded and camera inactive) */}
          {!uploadedImagePreview && !isCameraActive && (
            <div className="space-y-6">
              
              {/* Drag & Drop Hero Box */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center transition-all ${
                  dragActive
                    ? 'border-[#0C2B4E] bg-[#EFEAE2]/60 scale-[1.01]'
                    : 'border-[#D9D0C3] hover:border-[#0C2B4E] bg-white'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="mudra-visual-file-input"
                />

                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FAF5E8] border border-[#D4AF37] flex items-center justify-center text-[#0C2B4E] shadow-xs">
                  <Upload className="w-8 h-8 text-[#0C2B4E]" />
                </div>

                <h3 className="font-heading text-lg sm:text-xl font-bold text-[#0C2B4E] mb-1">
                  Upload an Outfit, Saree, or Jewelry Image
                </h3>
                <p className="text-xs sm:text-sm text-[#718096] max-w-md mx-auto mb-5">
                  Drag and drop a photo from Pinterest, Instagram, or a wedding album. Our AI analyzes fabric texture, zari weave, and temple craftsmanship to find the exact or closest MUDRA creation.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 bg-[#0C2B4E] hover:bg-[#07172C] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-md transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4 text-[#D4AF37]" />
                    <span>Choose Photo from Device</span>
                  </button>
                  <button
                    onClick={startCamera}
                    className="px-5 py-2.5 bg-white hover:bg-[#FAF5E8] text-[#0C2B4E] border border-[#D9D0C3] hover:border-[#0C2B4E] text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Camera className="w-4 h-4 text-[#0C2B4E]" />
                    <span>Capture with Camera</span>
                  </button>
                </div>
                <p className="text-[11px] text-[#A0AEC0] mt-3">
                  Supports JPG, PNG, WEBP up to 20MB
                </p>
              </div>

              {/* Instant Sample Presets Carousel */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                    <h4 className="text-xs sm:text-sm font-bold text-[#0C2B4E] font-heading">
                      Or Try with One-Click Sample Attire
                    </h4>
                  </div>
                  <span className="text-[11px] text-[#8C7A58]">Click to test instantly</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {SAMPLE_PRESETS.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset)}
                      className="group relative bg-white rounded-xl border border-[#E8E2D9] hover:border-[#0C2B4E] hover:shadow-md transition-all cursor-pointer overflow-hidden p-2 flex flex-col"
                    >
                      <div className="aspect-square w-full rounded-lg overflow-hidden bg-gray-100 mb-2 relative">
                        <img
                          src={preset.imageUrl}
                          alt={preset.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute bottom-1 left-1 right-1 bg-black/60 backdrop-blur-xs text-[9px] text-[#F3E8CE] px-1 py-0.5 rounded truncate text-center font-medium">
                          {preset.tag}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-[#0C2B4E] leading-tight line-clamp-1 group-hover:text-[#D4AF37] transition-colors">
                        {preset.title}
                      </p>
                      <p className="text-[10px] text-[#718096] line-clamp-1 mt-0.5">
                        {preset.subtitle}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Analysis In-Progress Scanning State */}
          {isAnalyzing && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
              <div className="relative">
                {uploadedImagePreview && (
                  <div className="w-44 h-44 rounded-2xl overflow-hidden border-2 border-[#D4AF37] shadow-xl relative">
                    <img
                      src={uploadedImagePreview}
                      alt="Uploaded attire preview"
                      className="w-full h-full object-cover"
                    />
                    {/* Glowing scanning bar */}
                    <div className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent shadow-[0_0_12px_#D4AF37] animate-[bounce_2s_infinite]" />
                    <div className="absolute inset-0 bg-[#0C2B4E]/10" />
                  </div>
                )}
                <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full bg-[#0C2B4E] text-[#D4AF37] flex items-center justify-center border-2 border-[#D4AF37] shadow-lg animate-spin">
                  <RefreshCw className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-2 max-w-sm">
                <h4 className="font-heading text-lg font-bold text-[#0C2B4E]">
                  MUDRA Drishti AI is Scanning
                </h4>
                <p className="text-xs sm:text-sm text-[#8C7A58] italic font-serif flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>{analyzingStep}</span>
                </p>
                <div className="w-48 h-1 bg-[#E8E2D9] rounded-full mx-auto overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#0C2B4E] via-[#D4AF37] to-[#0C2B4E] w-full animate-[pulse_1.5s_infinite]" />
                </div>
              </div>
            </div>
          )}

          {/* Analysis Completed Results */}
          {!isAnalyzing && analysisResult && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* Visual Breakdown Card */}
              <div className="bg-white rounded-2xl border border-[#E8E2D9] p-4 sm:p-6 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* Uploaded Thumbnail */}
                <div className="md:col-span-4 flex flex-col items-center">
                  <div className="relative w-48 aspect-4/5 rounded-xl overflow-hidden border-2 border-[#D4AF37] shadow-md group">
                    <img
                      src={uploadedImagePreview || ''}
                      alt="Your submitted outfit"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-[#0C2B4E]/85 text-[#F3E8CE] text-[10px] px-2 py-0.5 rounded font-mono border border-[#D4AF37]/40">
                      Your Photo
                    </div>
                  </div>
                  <button
                    onClick={resetSearch}
                    className="mt-3 text-xs text-[#0C2B4E] hover:text-[#D4AF37] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Upload Different Image</span>
                  </button>
                </div>

                {/* AI Detected Attributes */}
                <div className="md:col-span-8 space-y-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-[#FAF5E8] border border-[#D4AF37]/50 text-[#8C7A58] text-[10px] font-semibold tracking-wider uppercase rounded-full">
                      {analysisResult.category} • {analysisResult.subcategory}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Visual Match Complete
                    </span>
                  </div>

                  <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#0C2B4E]">
                    {analysisResult.detectedItem}
                  </h3>

                  {/* Fabrics & Occasion */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 bg-[#FAF8F5] rounded-lg border border-[#E8E2D9]">
                      <span className="text-[10px] text-[#718096] uppercase font-semibold block mb-1">
                        Craftsmanship & Fabrics
                      </span>
                      <p className="font-semibold text-[#0C2B4E]">
                        {analysisResult.fabrics?.join(', ') || 'Pure Handloom Silk & Zari'}
                      </p>
                    </div>
                    <div className="p-2.5 bg-[#FAF8F5] rounded-lg border border-[#E8E2D9]">
                      <span className="text-[10px] text-[#718096] uppercase font-semibold block mb-1">
                        Auspicious Occasion
                      </span>
                      <p className="font-semibold text-[#0C2B4E]">
                        {analysisResult.occasion || 'Muhurtham Wedding & Receptions'}
                      </p>
                    </div>
                  </div>

                  {/* Detected Color Palette */}
                  <div>
                    <span className="text-[10px] text-[#718096] uppercase font-semibold block mb-1.5">
                      Identified Color Palette:
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {analysisResult.colors?.map((c, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#D9D0C3] rounded-full text-xs shadow-2xs"
                        >
                          <span
                            className="w-3 h-3 rounded-full border border-gray-300 shrink-0"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span className="text-[#2D3748] font-medium text-[11px]">{c.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cultural Analysis Quote */}
                  <div className="p-3 bg-[#FAF5E8] border-l-4 border-[#D4AF37] rounded-r-lg text-xs text-[#4A5568] leading-relaxed">
                    <p className="font-medium text-[#0C2B4E] mb-0.5 flex items-center gap-1">
                      <Feather className="w-3 h-3 text-[#D4AF37]" />
                      <span>MUDRA Curatorial Note:</span>
                    </p>
                    <p className="italic">"{analysisResult.culturalAnalysis}"</p>
                  </div>
                </div>

              </div>

              {/* Matched Products Catalog Header & Filters */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-2 border-b border-[#E8E2D9]">
                  <div>
                    <h4 className="font-heading text-lg font-bold text-[#0C2B4E] flex items-center gap-2">
                      <span>Matching MUDRA Creations ({displayedMatches.length})</span>
                      <span className="text-xs font-normal text-[#718096]">
                        ranked by visual harmony
                      </span>
                    </h4>
                  </div>

                  {/* Category Filter Chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
                    <button
                      onClick={() => setSelectedFilterCategory('all')}
                      className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                        selectedFilterCategory === 'all'
                          ? 'bg-[#0C2B4E] text-white font-semibold'
                          : 'bg-white border border-[#D9D0C3] text-[#4A5568] hover:text-[#0C2B4E]'
                      }`}
                    >
                      All Matches
                    </button>
                    <button
                      onClick={() => setSelectedFilterCategory('women')}
                      className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                        selectedFilterCategory === 'women'
                          ? 'bg-[#0C2B4E] text-white font-semibold'
                          : 'bg-white border border-[#D9D0C3] text-[#4A5568] hover:text-[#0C2B4E]'
                      }`}
                    >
                      Women's Weaves
                    </button>
                    <button
                      onClick={() => setSelectedFilterCategory('men')}
                      className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                        selectedFilterCategory === 'men'
                          ? 'bg-[#0C2B4E] text-white font-semibold'
                          : 'bg-white border border-[#D9D0C3] text-[#4A5568] hover:text-[#0C2B4E]'
                      }`}
                    >
                      Men's Wear
                    </button>
                    <button
                      onClick={() => setSelectedFilterCategory('jewelry')}
                      className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                        selectedFilterCategory === 'jewelry'
                          ? 'bg-[#0C2B4E] text-white font-semibold'
                          : 'bg-white border border-[#D9D0C3] text-[#4A5568] hover:text-[#0C2B4E]'
                      }`}
                    >
                      Jewelry & Bangles
                    </button>
                  </div>
                </div>

                {/* Matched Products Grid */}
                {displayedMatches.length === 0 ? (
                  <div className="bg-white rounded-xl p-8 text-center border border-[#E8E2D9]">
                    <p className="text-sm text-[#718096]">
                      No creations match this specific category filter.
                    </p>
                    <button
                      onClick={() => setSelectedFilterCategory('all')}
                      className="mt-2 text-xs font-bold text-[#0C2B4E] underline cursor-pointer"
                    >
                      View all visual matches
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {displayedMatches.map(({ product, score }) => (
                      <div
                        key={product.id}
                        className="bg-white rounded-xl border border-[#E8E2D9] hover:border-[#D4AF37] hover:shadow-lg transition-all p-3 flex flex-col justify-between group"
                      >
                        <div>
                          {/* Image with Match Badge */}
                          <div
                            onClick={() => {
                              stopCamera();
                              setIsVisualSearchOpen(false);
                              navigateTo('product-detail', { productId: product.id });
                            }}
                            className="aspect-4/5 w-full rounded-lg overflow-hidden bg-gray-50 relative cursor-pointer"
                          >
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            
                            {/* Match Accuracy Pill */}
                            <div className="absolute top-2.5 left-2.5 bg-[#0C2B4E]/90 text-[#F3E8CE] border border-[#D4AF37] px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono shadow-sm flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                              <span>{score}% Match</span>
                            </div>

                            {/* Category Subtext */}
                            <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-xs text-white px-2 py-1 rounded text-[10px] truncate">
                              {product.subcategory} • {product.material.split('&')[0]}
                            </div>
                          </div>

                          {/* Info */}
                          <div className="mt-3">
                            <h5
                              onClick={() => {
                                stopCamera();
                                setIsVisualSearchOpen(false);
                                navigateTo('product-detail', { productId: product.id });
                              }}
                              className="text-xs sm:text-sm font-bold text-[#0C2B4E] line-clamp-1 group-hover:text-[#D4AF37] transition-colors cursor-pointer"
                            >
                              {product.name}
                            </h5>

                            <p className="text-[11px] text-[#718096] line-clamp-1 mt-0.5">
                              {product.fabricDetails}
                            </p>

                            <div className="flex items-baseline gap-2 mt-2">
                              <span className="font-heading text-sm font-bold text-[#0C2B4E]">
                                ₹{product.price.toLocaleString('en-IN')}
                              </span>
                              {product.originalPrice > product.price && (
                                <span className="text-xs text-[#A0AEC0] line-through">
                                  ₹{product.originalPrice.toLocaleString('en-IN')}
                                </span>
                              )}
                              <span className="text-[10px] text-emerald-700 font-bold ml-auto">
                                {product.discountPercentage}% OFF
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#F0EBE1]">
                          <button
                            onClick={() => {
                              stopCamera();
                              setIsVisualSearchOpen(false);
                              navigateTo('product-detail', { productId: product.id });
                            }}
                            className="px-2.5 py-1.5 text-xs text-[#0C2B4E] bg-[#FAF8F5] hover:bg-[#EFEAE2] border border-[#D9D0C3] rounded-md font-medium transition-colors text-center cursor-pointer flex items-center justify-center gap-1"
                          >
                            <span>Details</span>
                            <ChevronRight className="w-3 h-3 text-[#8C7A58]" />
                          </button>

                          <button
                            onClick={() => {
                              addToCart(product);
                              showToast(`Added ${product.name} to your bag!`);
                            }}
                            className="px-2.5 py-1.5 text-xs font-semibold text-white bg-[#0C2B4E] hover:bg-[#07172C] rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                          >
                            <ShoppingBag className="w-3 h-3 text-[#D4AF37]" />
                            <span>Add to Bag</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* AI Styling & Jewelry Complementary Pairing Section */}
              {analysisResult.stylingAdvice && (
                <div className="bg-gradient-to-r from-[#FAF5E8] to-[#F3EFE9] rounded-xl p-4 sm:p-5 border border-[#D4AF37]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#0C2B4E] font-heading">
                      <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                      <span>MUDRA Assist Styling & Pairing Recommendation:</span>
                    </div>
                    <p className="text-xs text-[#4A5568] leading-relaxed max-w-2xl">
                      {analysisResult.stylingAdvice}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      stopCamera();
                      setIsVisualSearchOpen(false);
                      navigateTo('shop');
                    }}
                    className="px-4 py-2 bg-[#0C2B4E] hover:bg-[#07172C] text-white text-xs font-semibold rounded-lg shrink-0 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Explore Full Wardrobe</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-[#FAF5E8] border-t border-[#E8E2D9] flex flex-wrap items-center justify-between gap-2 text-xs text-[#718096] shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#0C2B4E]">MUDRA Vrindavan Atelier</span>
            <span>•</span>
            <span>Handloom Certified Silk Mark</span>
            <span>•</span>
            <span>22K Nakshi Gold</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                stopCamera();
                setIsVisualSearchOpen(false);
              }}
              className="text-xs font-semibold text-[#0C2B4E] hover:underline cursor-pointer"
            >
              Close Visual Match
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
