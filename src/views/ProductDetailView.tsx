import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Star,
  Heart,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Check,
  ThumbsUp,
  MapPin,
  Clock,
  Feather,
  Scissors,
} from 'lucide-react';
import { ProductCustomization } from '../types';
import { CustomizationStudioModal } from '../components/CustomizationStudioModal';
import { normalizeImageUrl, handleImageError } from '../utils/imageHelper';

interface ProductDetailViewProps {
  productId: string;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({ productId }) => {
  const {
    getProductById,
    addToCart,
    toggleWishlist,
    isInWishlist,
    navigateTo,
    getProductReviews,
    addReview,
    voteHelpful,
    showToast,
  } = useApp();

  const product = getProductById(productId);

  // States
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(
    product?.availableSizes[0] || 'Free Size'
  );
  const [selectedColor, setSelectedColor] = useState<string>(
    product?.availableColors[0]?.name || 'Standard'
  );
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'story' | 'specifications' | 'reviews'>('story');

  // Customer Customization State
  const [customization, setCustomization] = useState<ProductCustomization | null>(null);
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);

  // Pincode check
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);

  // Reset image view when product changes
  React.useEffect(() => {
    setSelectedImageIndex(0);
  }, [productId]);

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewEmail, setReviewEmail] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="font-heading text-2xl font-bold text-[#0C2B4E]">Product Not Found</h2>
        <p className="text-sm text-[#718096] mt-2 mb-6">
          The requested creation may have been archived or is temporarily unavailable.
        </p>
        <button
          onClick={() => navigateTo('shop')}
          className="px-6 py-2.5 bg-[#0C2B4E] text-white text-xs font-semibold rounded-md"
        >
          Return to Collections
        </button>
      </div>
    );
  }

  const reviews = getProductReviews(product.id);
  const wishlisted = isInWishlist(product.id);

  // Rating distribution calculations
  const ratingCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    if (ratingCounts[r.rating] !== undefined) ratingCounts[r.rating]++;
  });
  const totalReviews = reviews.length || 1;

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode || pincode.length !== 6) {
      setPincodeStatus('Please enter a valid 6-digit Indian PIN code.');
      return;
    }
    const days = Math.floor(Math.random() * 3) + 2;
    setPincodeStatus(`Standard Sacred Delivery available! Expected delivery within ${days}-${days + 2} business days.`);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTitle || !reviewComment || !reviewAuthor || !reviewEmail) {
      showToast('Please fill all review fields.', 'error');
      return;
    }
    setIsSubmittingReview(true);
    const result = addReview({
      productId: product.id,
      userName: reviewAuthor,
      userEmail: reviewEmail,
      rating: reviewRating,
      title: reviewTitle,
      comment: reviewComment,
      verifiedPurchase: true,
      location: 'India',
    });

    setIsSubmittingReview(false);
    if (result.success) {
      showToast(result.message, 'success');
      setReviewTitle('');
      setReviewComment('');
      setReviewAuthor('');
      setReviewEmail('');
    } else {
      showToast(result.message, 'error');
    }
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedColor, quantity, customization || undefined);
    navigateTo('checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#718096] mb-8">
        <button onClick={() => navigateTo('home')} className="hover:text-[#0C2B4E] cursor-pointer">
          Home
        </button>
        <ChevronRight className="w-3 h-3" />
        <button
          onClick={() => navigateTo(product.category)}
          className="hover:text-[#0C2B4E] capitalize cursor-pointer"
        >
          {product.category}
        </button>
        <ChevronRight className="w-3 h-3" />
        <span className="text-[#0C2B4E] font-medium truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Contiguous Purchase Module Layout: Sticky Gallery Left + Contiguous Purchase Module Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left Column: Image Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-4/5 w-full bg-[#F3EFE9] rounded-xl overflow-hidden border border-[#E8E2D9] shadow-xs">
            <img
              src={normalizeImageUrl(product.images[selectedImageIndex] || product.images[0], product.category)}
              alt={product.name}
              onError={(e) => handleImageError(e, product.category)}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top"
            />
            {/* Wishlist Button */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/95 backdrop-blur-xs flex items-center justify-center text-[#2C3539] hover:text-[#C45B74] shadow-md transition-colors cursor-pointer"
              aria-label="Toggle wishlist"
            >
              <Heart
                className={`w-5 h-5 ${
                  wishlisted ? 'fill-[#C45B74] text-[#C45B74]' : 'text-[#4A5568]'
                }`}
              />
            </button>

            {product.discountPercentage > 0 && (
              <span className="absolute top-4 left-4 bg-[#0C2B4E] text-[#F3E8CE] text-xs font-semibold px-2.5 py-1 rounded-sm">
                {product.discountPercentage}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails Row */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-24 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedImageIndex === idx
                      ? 'border-[#0C2B4E] shadow-sm'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={normalizeImageUrl(img, product.category)}
                    alt=""
                    onError={(e) => handleImageError(e, product.category)}
                    className="w-full h-full object-cover object-top"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Contiguous Purchase Module (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-xl border border-[#E8E2D9] shadow-xs space-y-6">
          {/* Metadata & Title */}
          <div>
            <div className="flex items-center gap-2 text-xs text-[#718096] uppercase tracking-wider font-semibold mb-1">
              <span>{product.subcategory}</span>
              {product.fabricType && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#0C2B4E]">{product.fabricType}</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span className="text-[#8C7A58]">{product.sku}</span>
            </div>
            <h1 className="font-heading text-xl sm:text-2xl font-bold text-[#0C2B4E] leading-snug">
              {product.name}
            </h1>
          </div>

          {/* Price & Rating Bar */}
          <div className="flex items-baseline justify-between pt-2 border-t border-[#E8E2D9]">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-black text-[#0C2B4E] font-mono tabular-nums">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-[#A0AEC0] line-through font-mono tabular-nums">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
              <span className="text-xs text-emerald-700 font-semibold font-mono">
                Save ₹{(product.originalPrice - product.price).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#718096]">
              <div className="flex text-[#D4AF37]">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(product.rating) ? 'fill-[#D4AF37]' : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-[#1A202C] font-mono">{product.rating}</span>
              <span className="text-[#A0AEC0]">({product.reviewCount})</span>
            </div>
          </div>

          {/* Stock Indicator */}
          <div className="text-xs">
            {product.stock > 0 ? (
              <span className="text-emerald-700 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                In Stock ({product.stock} units handloom verified at atelier)
              </span>
            ) : (
              <span className="text-rose-600 font-medium">Temporarily out of stock</span>
            )}
          </div>

          {/* Size Selector */}
          {product.availableSizes.length > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-[#1A202C]">Select Size:</span>
                <span className="text-[#8C7A58] underline cursor-pointer">Size Guide</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.availableSizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`px-3 py-2 text-xs font-semibold rounded-md border transition-all cursor-pointer ${
                      selectedSize === sz
                        ? 'border-[#0C2B4E] bg-[#0C2B4E] text-[#F3E8CE]'
                        : 'border-[#D9D0C3] bg-white text-[#2D3748] hover:border-[#0C2B4E]'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selector */}
          {product.availableColors.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#1A202C] block">
                Color Shade: <span className="font-normal text-[#718096]">{selectedColor}</span>
              </span>
              <div className="flex items-center gap-2">
                {product.availableColors.map((col) => (
                  <button
                    key={col.name}
                    onClick={() => setSelectedColor(col.name)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs cursor-pointer ${
                      selectedColor === col.name
                        ? 'border-[#0C2B4E] bg-[#FAF5E8] font-semibold text-[#0C2B4E]'
                        : 'border-[#D9D0C3] bg-white text-[#4A5568]'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: col.hex }}
                    />
                    <span>{col.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customer Customization Involvement Card */}
          <div className="p-3.5 bg-gradient-to-r from-[#FAF6EE] to-[#F5EEDC] border border-[#D4AF37]/40 rounded-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-[#0C2B4E] text-[#D4AF37] flex items-center justify-center">
                  <Scissors className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-heading text-xs font-bold text-[#0C2B4E] flex items-center gap-1.5">
                    <span>MUDRA Bespoke Atelier</span>
                    <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                  </h4>
                  <p className="text-[11px] text-[#718096]">
                    Tailoring, zari monograms, necklines & festive touches
                  </p>
                </div>
              </div>
              {customization?.isCustomized && (
                <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#0C2B4E] text-[#F3E8CE]">
                  +₹{customization.totalFee} Applied
                </span>
              )}
            </div>

            {customization?.isCustomized ? (
              <div className="bg-white/80 rounded-md p-2.5 border border-[#D4AF37]/30 text-xs space-y-1.5">
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {customization.stitchingOption !== 'unstitched' && (
                    <span className="px-2 py-0.5 bg-[#0C2B4E]/5 text-[#0C2B4E] rounded font-medium">
                      ✂ {customization.stitchingOption === 'bespoke_madetomeasure' ? 'Bespoke Custom Fit' : 'Standard Stitched'}
                    </span>
                  )}
                  {customization.necklineStyle && (
                    <span className="px-2 py-0.5 bg-[#FAF5E8] text-[#8C7A58] border border-[#D4AF37]/20 rounded font-medium">
                      Neck: {customization.necklineStyle}
                    </span>
                  )}
                  {customization.sleeveStyle && (
                    <span className="px-2 py-0.5 bg-[#FAF5E8] text-[#8C7A58] border border-[#D4AF37]/20 rounded font-medium">
                      Sleeves: {customization.sleeveStyle}
                    </span>
                  )}
                  {customization.monogramText && (
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 rounded font-mono font-medium">
                      Zari: "{customization.monogramText}"
                    </span>
                  )}
                  {customization.fallPico && (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded">
                      ✓ Fall & Pico
                    </span>
                  )}
                  {customization.matchingInskirt && (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded">
                      ✓ Pure Cotton Inskirt
                    </span>
                  )}
                  {customization.tasselsLatkans && (
                    <span className="px-2 py-0.5 bg-purple-50 text-purple-800 rounded">
                      ✓ Zari Latkans
                    </span>
                  )}
                  {customization.blessingNote && (
                    <span className="px-2 py-0.5 bg-rose-50 text-rose-800 rounded truncate max-w-full">
                      💌 Note: "{customization.blessingNote}"
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setIsCustomizationModalOpen(true)}
                    className="text-[#0C2B4E] font-semibold underline hover:text-[#8C7A58] cursor-pointer"
                  >
                    Edit Specifications
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomization(null);
                      showToast('Customization removed', 'info');
                    }}
                    className="text-rose-600 hover:text-rose-800 cursor-pointer"
                  >
                    Remove Customization
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsCustomizationModalOpen(true)}
                className="w-full py-2 px-3 bg-white hover:bg-[#FAF8F5] text-[#0C2B4E] border border-[#D4AF37] rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Scissors className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Customize Fit, Stitching, Monogram & Notes</span>
                <ChevronRight className="w-3.5 h-3.5 ml-auto text-[#8C7A58]" />
              </button>
            )}
          </div>

          {/* Quantity Stepper & CTAs */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-[#1A202C]">Quantity:</span>
              <div className="flex items-center border border-[#D9D0C3] rounded-md bg-[#FAF8F5]">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-2.5 py-1 text-xs text-[#718096] hover:text-[#0C2B4E] cursor-pointer"
                >
                  -
                </button>
                <span className="px-3 text-xs font-bold font-mono text-[#0C2B4E]">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  disabled={quantity >= product.stock}
                  className="px-2.5 py-1 text-xs text-[#718096] hover:text-[#0C2B4E] disabled:opacity-30 cursor-pointer"
                >
                  +
                </button>
              </div>
              {customization?.isCustomized && (
                <span className="text-[11px] text-[#8C7A58] italic">
                  (Includes ₹{customization.totalFee} atelier fee)
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => addToCart(product, selectedSize, selectedColor, quantity, customization || undefined)}
                className="py-3 px-4 bg-[#FAF5E8] hover:bg-[#EFEAE2] text-[#0C2B4E] border border-[#0C2B4E] text-xs sm:text-sm font-semibold rounded-md shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
                <span>Add to Bag</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="py-3 px-4 bg-[#0C2B4E] hover:bg-[#07172C] text-white text-xs sm:text-sm font-semibold rounded-md shadow-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Buy Now</span>
              </button>
            </div>
          </div>

          {/* Pincode Delivery Estimator */}
          <div className="pt-4 border-t border-[#E8E2D9] text-xs">
            <label className="font-semibold text-[#1A202C] flex items-center gap-1.5 mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Check Delivery & Temple Dispatch to your PIN Code</span>
            </label>
            <form onSubmit={handlePincodeCheck} className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Enter 6-digit PIN"
                className="w-36 text-xs px-3 py-1.5 bg-[#FAF8F5] border border-[#D9D0C3] rounded-md font-mono"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#0C2B4E] text-white text-xs font-semibold rounded-md cursor-pointer hover:bg-[#07172C]"
              >
                Verify
              </button>
            </form>
            {pincodeStatus && (
              <p className="mt-1.5 text-[11px] text-[#0C2B4E] font-medium">{pincodeStatus}</p>
            )}
          </div>

          {/* Value Props */}
          <div className="pt-4 border-t border-[#E8E2D9] space-y-2 text-xs text-[#718096]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>100% Certified Authentic Handloom with Silk Mark India</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>7-Day Sanctified Return & Exchange Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#D4AF37] shrink-0" />
              <span>Insured express logistics with tamper-evident packaging</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section: Heritage Story | Specifications | Verified Reviews */}
      <div className="mt-16 pt-8 border-t border-[#E8E2D9]">
        <div className="flex border-b border-[#E8E2D9] gap-8 text-sm font-medium">
          <button
            onClick={() => setActiveTab('story')}
            className={`pb-3 transition-colors cursor-pointer ${
              activeTab === 'story'
                ? 'text-[#0C2B4E] font-bold border-b-2 border-[#D4AF37]'
                : 'text-[#718096] hover:text-[#0C2B4E]'
            }`}
          >
            Divine Heritage & Inspiration
          </button>
          <button
            onClick={() => setActiveTab('specifications')}
            className={`pb-3 transition-colors cursor-pointer ${
              activeTab === 'specifications'
                ? 'text-[#0C2B4E] font-bold border-b-2 border-[#D4AF37]'
                : 'text-[#718096] hover:text-[#0C2B4E]'
            }`}
          >
            Fabric & Specifications
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 transition-colors cursor-pointer ${
              activeTab === 'reviews'
                ? 'text-[#0C2B4E] font-bold border-b-2 border-[#D4AF37]'
                : 'text-[#718096] hover:text-[#0C2B4E]'
            }`}
          >
            Verified Devotee Reviews ({reviews.length})
          </button>
        </div>

        {/* Tab 1: Heritage Story */}
        {activeTab === 'story' && (
          <div className="py-8 space-y-4 max-w-3xl text-sm text-[#4A5568] leading-relaxed">
            <h3 className="font-heading text-lg font-bold text-[#0C2B4E]">
              The Sacred Tapestry of Vrindavan
            </h3>
            <p>{product.description}</p>
            {product.story && (
              <div className="p-4 bg-[#FAF5E8] border border-[#D4AF37]/30 rounded-lg text-xs leading-relaxed text-[#0C2B4E]">
                <strong className="block text-sm font-heading mb-1 text-[#0C2B4E]">
                  Artisan Inspiration:
                </strong>
                {product.story}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Specifications */}
        {activeTab === 'specifications' && (
          <div className="py-8 max-w-3xl space-y-6 text-xs text-[#2D3748]">
            <div>
              <h4 className="font-semibold text-sm text-[#0C2B4E] mb-2">Material & Weave</h4>
              <p className="text-[#4A5568] mb-1">
                <strong>Fabric Details:</strong> {product.fabricDetails}
              </p>
              <p className="text-[#4A5568]">
                <strong>Primary Material:</strong> {product.material}
              </p>
            </div>

            <div className="border border-[#E8E2D9] rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <tbody>
                  {Object.entries(product.specifications).map(([key, val], idx) => (
                    <tr
                      key={key}
                      className={idx % 2 === 0 ? 'bg-[#FAF8F5]' : 'bg-white'}
                    >
                      <td className="py-2.5 px-4 font-semibold text-[#0C2B4E] w-1/3 border-b border-[#E8E2D9]">
                        {key}
                      </td>
                      <td className="py-2.5 px-4 text-[#4A5568] border-b border-[#E8E2D9]">
                        {val}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Customer Reviews */}
        {activeTab === 'reviews' && (
          <div className="py-8 space-y-10">
            {/* Reviews Overview & Rating Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start bg-white p-6 rounded-xl border border-[#E8E2D9]">
              <div className="md:col-span-4 text-center md:text-left space-y-2">
                <span className="font-heading text-4xl font-black text-[#0C2B4E] font-mono">
                  {product.rating}
                </span>
                <div className="flex justify-center md:justify-start text-[#D4AF37]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating) ? 'fill-[#D4AF37]' : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-[#718096]">
                  Based on {reviews.length} authentic patron reviews
                </p>
              </div>

              {/* Breakdown Bars */}
              <div className="md:col-span-8 space-y-1.5 text-xs text-[#718096]">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = ratingCounts[stars] || 0;
                  const pct = Math.round((count / totalReviews) * 100);
                  return (
                    <div key={stars} className="flex items-center gap-3">
                      <span className="w-8 font-mono">{stars} ★</span>
                      <div className="flex-1 bg-[#E8E2D9] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#D4AF37] h-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-10 text-right font-mono">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Write a Review Section */}
            <div className="bg-[#FAF8F5] p-6 rounded-xl border border-[#D9D0C3]">
              <h4 className="font-heading text-base font-bold text-[#0C2B4E] mb-2">
                Submit a Verified Devotee Review
              </h4>
              <p className="text-xs text-[#718096] mb-4">
                Share your impressions of the drape, craftsmanship, and divine luster.
              </p>
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1A202C] mb-1">
                    Rating
                  </label>
                  <div className="flex items-center gap-1.5 text-[#D4AF37]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1 cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= reviewRating ? 'fill-[#D4AF37]' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-xs font-semibold text-[#0C2B4E] font-mono">
                      {reviewRating} out of 5 stars
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#2D3748] mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={reviewAuthor}
                      onChange={(e) => setReviewAuthor(e.target.value)}
                      placeholder="e.g. Priyadarshini Iyer"
                      className="w-full text-xs px-3 py-2 bg-white border border-[#D9D0C3] rounded-md focus:outline-hidden focus:border-[#0C2B4E]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#2D3748] mb-1">
                      Your Email (for verification)
                    </label>
                    <input
                      type="email"
                      required
                      value={reviewEmail}
                      onChange={(e) => setReviewEmail(e.target.value)}
                      placeholder="e.g. priya.iyer@gmail.com"
                      className="w-full text-xs px-3 py-2 bg-white border border-[#D9D0C3] rounded-md focus:outline-hidden focus:border-[#0C2B4E]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2D3748] mb-1">
                    Review Headline
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="e.g. Royal zari drape that felt truly divine!"
                    className="w-full text-xs px-3 py-2 bg-white border border-[#D9D0C3] rounded-md focus:outline-hidden focus:border-[#0C2B4E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2D3748] mb-1">
                    Your Detailed Review
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe the fabric weight, embroidery finishing, color accuracy, and overall experience..."
                    className="w-full text-xs p-3 bg-white border border-[#D9D0C3] rounded-md focus:outline-hidden focus:border-[#0C2B4E]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-[#0C2B4E] hover:bg-[#07172C] rounded-md shadow-xs transition-colors cursor-pointer"
                >
                  Publish Verified Review
                </button>
              </form>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-xs text-[#718096] italic">
                  No written reviews yet. Be the first to bless this creation with your words.
                </p>
              ) : (
                reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white p-5 rounded-lg border border-[#E8E2D9] space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex text-[#D4AF37]">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-[#D4AF37]" />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-[#1A202C]">{rev.title}</span>
                      </div>
                      <span className="text-[11px] text-[#A0AEC0] font-mono">{rev.date}</span>
                    </div>

                    <p className="text-xs text-[#4A5568] leading-relaxed">{rev.comment}</p>

                    <div className="pt-2 border-t border-[#F0EBE1] flex items-center justify-between text-xs text-[#718096]">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#0C2B4E]">{rev.userName}</span>
                        {rev.verifiedPurchase && (
                          <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3" />
                            Verified Purchase
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => voteHelpful(rev.id)}
                        className="flex items-center gap-1 text-[11px] hover:text-[#0C2B4E] cursor-pointer"
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>Helpful ({rev.helpfulCount})</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bespoke Customization Studio Modal */}
      {product && (
        <CustomizationStudioModal
          isOpen={isCustomizationModalOpen}
          onClose={() => setIsCustomizationModalOpen(false)}
          product={product}
          initialCustomization={customization}
          onApplyCustomization={(updated) => {
            setCustomization(updated);
            showToast('Customization choices saved to your creation!', 'success');
          }}
        />
      )}
    </div>
  );
};
