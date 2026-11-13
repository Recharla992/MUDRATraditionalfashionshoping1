import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { HeroSection } from '../components/HeroSection';
import { ProductCard } from '../components/ProductCard';
import { ArrowRight, Star, Sparkles, ShieldCheck, Heart, Feather, Camera, Upload, Eye } from 'lucide-react';
import { normalizeImageUrl, handleImageError } from '../utils/imageHelper';
import { AIFashionLabHub } from '../components/ai/AIFashionLabHub';
import { TextileHeritageExplorer } from '../components/ai/TextileHeritageExplorer';

export const HomeView: React.FC = () => {
  const { products, categories, navigateTo, reviews, openVisualSearch } = useApp();
  const [activeTab, setActiveTab] = useState<'featured' | 'bestseller' | 'festive'>('featured');

  const filteredProducts = products.filter((p) => {
    if (activeTab === 'featured') return p.isFeatured;
    if (activeTab === 'bestseller') return p.isBestseller;
    if (activeTab === 'festive') return p.isFestive;
    return true;
  });

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <HeroSection />

      {/* Category Pillars Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-xs uppercase font-semibold tracking-widest text-[#8C7A58] mb-1">
            Curated Sacred Collections
          </p>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#0C2B4E]">
            Heirloom Weaves & Temple Ornaments
          </h2>
          <p className="text-xs sm:text-sm text-[#718096] mt-2">
            Each creation is handcrafted in sacred handloom centers across India, carrying centuries of devotional artistry.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => navigateTo(cat.id)}
              className="group relative rounded-lg overflow-hidden border border-[#E8E2D9] shadow-xs hover:shadow-lg transition-all duration-300 cursor-pointer bg-[#F3EFE9]"
            >
              <div className="aspect-4/5 w-full overflow-hidden">
                <img
                  src={normalizeImageUrl(cat.bannerImage, cat.id)}
                  alt={cat.name}
                  onError={(e) => handleImageError(e, cat.id)}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07172C]/90 via-[#07172C]/30 to-transparent" />
              </div>

              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <p className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold mb-1">
                  MUDRA Atelier
                </p>
                <h3 className="font-heading text-lg font-bold group-hover:text-[#F3E8CE] transition-colors leading-snug">
                  {cat.name}
                </h3>
                <p className="text-xs text-[#D9D0C3] line-clamp-2 mt-1 font-normal opacity-90">
                  {cat.description}
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-[#D4AF37] group-hover:translate-x-1 transition-transform">
                  <span>Explore Collection</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Collections Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#E8E2D9]">
          <div>
            <p className="text-xs uppercase font-semibold tracking-widest text-[#8C7A58] mb-1">
              Divine Creations
            </p>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#0C2B4E]">
              Featured Masterpieces
            </h2>
          </div>

          {/* Interactive Filter Control Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#EFEAE2] rounded-lg">
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                activeTab === 'featured'
                  ? 'bg-white text-[#0C2B4E] shadow-xs font-semibold'
                  : 'text-[#718096] hover:text-[#0C2B4E]'
              }`}
            >
              Curated Picks
            </button>
            <button
              onClick={() => setActiveTab('bestseller')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                activeTab === 'bestseller'
                  ? 'bg-white text-[#0C2B4E] shadow-xs font-semibold'
                  : 'text-[#718096] hover:text-[#0C2B4E]'
              }`}
            >
              Bestsellers
            </button>
            <button
              onClick={() => setActiveTab('festive')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                activeTab === 'festive'
                  ? 'bg-white text-[#0C2B4E] shadow-xs font-semibold'
                  : 'text-[#718096] hover:text-[#0C2B4E]'
              }`}
            >
              Festive Edit
            </button>
          </div>
        </div>

        {/* Product Cards Grid (3 or 4 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => navigateTo('shop')}
            className="px-6 py-3 text-xs sm:text-sm font-semibold text-[#0C2B4E] bg-white border border-[#D9D0C3] hover:border-[#0C2B4E] rounded-md transition-all cursor-pointer shadow-xs inline-flex items-center gap-2"
          >
            <span>View All {products.length} Divine Creations</span>
            <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
          </button>
        </div>
      </section>

      {/* MUDRA Drishti AI: Visual Search Feature Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-[#0C2B4E] via-[#09223D] to-[#07172C] rounded-2xl p-6 sm:p-10 text-white relative overflow-hidden border-2 border-[#D4AF37]/50 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D4AF37]/20 border border-[#D4AF37]/50 rounded-full text-[#F3E8CE] text-xs font-mono tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>AI Drishti • Visual Search & Match</span>
              </div>

              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F3E8CE] leading-tight">
                Found a Dream Outfit on Pinterest? <br />
                <span className="text-[#D4AF37]">Find the Exact Match at MUDRA.</span>
              </h2>

              <p className="text-xs sm:text-sm text-[#D9D0C3] leading-relaxed max-w-xl">
                Upload any picture of a bridal saree, Kora organza, tissue drape, sherwani, or temple kada bangles. Our AI scans weave texture, pure zari luster, and temple carvings to match creations directly from our sacred handloom collection.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => openVisualSearch()}
                  className="px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#C59B27] hover:from-[#E5BF48] hover:to-[#D4AF37] text-[#0C2B4E] text-xs sm:text-sm font-bold rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center gap-2"
                >
                  <Camera className="w-4 h-4 text-[#0C2B4E]" />
                  <span>Upload Photo & Find Products</span>
                </button>

                <button
                  onClick={() => openVisualSearch('sample-kanchipuram')}
                  className="px-4 py-3 bg-[#07172C]/80 hover:bg-[#07172C] text-[#F3E8CE] border border-[#D4AF37]/40 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Try Sample Bridal Saree</span>
                </button>
              </div>

              {/* Quick Preset Badges */}
              <div className="pt-3 flex flex-wrap items-center gap-2 text-xs text-[#A0AEC0]">
                <span className="text-[11px] text-[#D4AF37]">Instant Match Presets:</span>
                <button
                  onClick={() => openVisualSearch('sample-tissue')}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-[#F3E8CE] rounded text-[11px] border border-white/10 transition-colors cursor-pointer"
                >
                  ✨ Liquid Tissue Silk
                </button>
                <button
                  onClick={() => openVisualSearch('sample-bangles')}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-[#F3E8CE] rounded text-[11px] border border-white/10 transition-colors cursor-pointer"
                >
                  👑 Temple Kada Bangles
                </button>
                <button
                  onClick={() => openVisualSearch('sample-sherwani')}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-[#F3E8CE] rounded text-[11px] border border-white/10 transition-colors cursor-pointer"
                >
                  🪷 Royal Velvet Sherwani
                </button>
                <button
                  onClick={() => openVisualSearch('sample-kora')}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-[#F3E8CE] rounded text-[11px] border border-white/10 transition-colors cursor-pointer"
                >
                  🌸 Kora Organza
                </button>
              </div>
            </div>

            {/* Right Visual Interactive Card Mockup */}
            <div className="lg:col-span-5 flex justify-center">
              <div
                onClick={() => openVisualSearch()}
                className="relative bg-[#07172C]/90 p-3 rounded-2xl border border-[#D4AF37]/60 shadow-2xl max-w-xs w-full cursor-pointer group hover:scale-[1.02] transition-transform"
              >
                <div className="relative aspect-4/5 rounded-xl overflow-hidden mb-3">
                  <img
                    src="/images/mudra_tissue_silk_saree_1793643995228.jpg"
                    alt="Visual Search Match Preview"
                    onError={(e) => handleImageError(e, 'women')}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                  
                  {/* Glowing Scanning Reticle */}
                  <div className="absolute inset-4 border-2 border-dashed border-[#D4AF37]/70 rounded-lg pointer-events-none flex flex-col justify-between p-2">
                    <span className="text-[9px] font-mono text-[#D4AF37] uppercase bg-black/60 px-1.5 py-0.5 rounded self-start">
                      Target: Tissue Silk Drape
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400 uppercase bg-black/60 px-1.5 py-0.5 rounded self-end">
                      98% Visual Harmony
                    </span>
                  </div>

                  <div className="absolute bottom-2.5 left-2.5 right-2.5 text-center bg-[#0C2B4E]/90 backdrop-blur-xs py-1.5 px-2 rounded-lg border border-[#D4AF37]/40">
                    <p className="text-[11px] text-[#F3E8CE] font-bold flex items-center justify-center gap-1">
                      <Camera className="w-3 h-3 text-[#D4AF37]" /> Click to Test with Any Photo
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#D9D0C3] px-1">
                  <span>Pure Metallic Zari Analysis</span>
                  <span className="text-[#D4AF37] font-semibold">1-Click Match</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialty Handloom Weaves & Ornaments: Kora, Tissue, Chanderi, Bangles & Accessories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-[#E8E2D9]">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#8C7A58] uppercase tracking-widest mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Imperial Fabric Craftsmanship</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#0C2B4E]">
              Kora, Chanderi, Tissue & Temple Bangles
            </h2>
            <p className="text-xs sm:text-sm text-[#718096] mt-1">
              Discover diaphanous Kora organzas, liquid gold Tissue weaves, and heavy 22K temple bangles.
            </p>
          </div>

          <button
            onClick={() => navigateTo('shop')}
            className="text-xs font-semibold text-[#0C2B4E] hover:text-[#D4AF37] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Filter By Fabric & Accessories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products
            .filter((p) =>
              ['prod-003', 'prod-004', 'prod-005', 'prod-018'].includes(p.id)
            )
            .map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
        </div>
      </section>

      {/* Complete AI Fashion Lab Hub (Try-On, Colour Studio, Design Studio, Fabric ID, Occasion Planner) */}
      <AIFashionLabHub />

      {/* Indian Textile Heritage Explorer */}
      <TextileHeritageExplorer />

      {/* Philosophy & Radha-Krishna Story Spotlight */}
      <section className="bg-[#FAF5E8] border-y border-[#E8E2D9] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-4/3 rounded-xl overflow-hidden shadow-lg border border-[#D4AF37]/30">
              <img
                src="/images/mudra_hero_divine_couture_1793641346974.jpg"
                alt="Radha Krishna Divine Fashion Heritage"
                onError={(e) => handleImageError(e, 'women')}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07172C]/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white p-3 bg-black/40 backdrop-blur-xs rounded-lg">
                <p className="text-xs font-medium text-[#F3E8CE]">Vrindavan Courtyard Couture</p>
                <p className="text-[11px] text-[#D9D0C3]">Pure Banarasi & Kanchipuram bridal drapes</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#8C7A58] uppercase tracking-widest">
                <Feather className="w-4 h-4 text-[#D4AF37]" />
                <span>The Story of MUDRA</span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#0C2B4E] leading-snug">
                Where Devotional Artistry Meets Imperial Silks
              </h2>
              <p className="text-sm text-[#4A5568] leading-relaxed">
                In classical Sanskrit, <strong>MUDRA</strong> signifies a sacred gesture — an expression of divine grace, sanctity, and eternal love. Inspired by the celestial romance of Radha-Krishna and the sacred temple sanctums of India, each piece in our collection is an ode to timeless traditions.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 bg-white border border-[#E8E2D9] rounded-lg">
                  <p className="text-lg font-bold text-[#0C2B4E] font-mono">100%</p>
                  <p className="text-xs text-[#718096] mt-0.5">Authentic Handloom Certified by Silk Mark India</p>
                </div>
                <div className="p-3.5 bg-white border border-[#E8E2D9] rounded-lg">
                  <p className="text-lg font-bold text-[#0C2B4E] font-mono">22K Micron</p>
                  <p className="text-xs text-[#718096] mt-0.5">Gold Dipped Temple Jewelry with Kempu Rubies</p>
                </div>
              </div>
              <div>
                <button
                  onClick={() => navigateTo('about')}
                  className="px-5 py-2.5 bg-[#0C2B4E] hover:bg-[#07172C] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Read Our Heritage Story</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews & Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <p className="text-xs uppercase font-semibold tracking-widest text-[#8C7A58] mb-1">
            Reverence & Trust
          </p>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#0C2B4E]">
            Voices of Our Devotees
          </h2>
          <p className="text-xs sm:text-sm text-[#718096] mt-1">
            Over 12,000 patrons have adorned their auspicious celebrations with MUDRA.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.slice(0, 3).map((rev) => (
            <div
              key={rev.id}
              className="bg-white p-6 rounded-xl border border-[#E8E2D9] shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-[#D4AF37] mb-3">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#D4AF37]" />
                  ))}
                </div>
                <h4 className="text-sm font-semibold text-[#1A202C] mb-2 leading-snug">
                  "{rev.title}"
                </h4>
                <p className="text-xs text-[#4A5568] leading-relaxed italic">
                  {rev.comment}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-[#F0EBE1] flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-[#0C2B4E]">{rev.userName}</p>
                  <p className="text-[11px] text-[#A0AEC0]">{rev.location || 'Verified Buyer'}</p>
                </div>
                <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Promotional Festive Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#0C2B4E] via-[#0F5C72] to-[#07172C] rounded-2xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl border border-[#D4AF37]/30">
          <div className="relative z-10 max-w-xl">
            <span className="text-xs uppercase font-semibold tracking-widest text-[#D4AF37] block mb-2">
              Festive Season Blessing
            </span>
            <h3 className="font-heading text-2xl sm:text-3xl font-bold mb-3 leading-tight">
              Flat ₹500 Off with Code <span className="text-[#D4AF37]">VRINDAVAN</span>
            </h3>
            <p className="text-xs sm:text-sm text-[#D9D0C3] leading-relaxed mb-6">
              Celebrate weddings, Diwali, Janmashtami, and pooja festivities with authentic handloom sarees and royal sherwanis. Valid on orders above ₹2,499.
            </p>
            <button
              onClick={() => navigateTo('shop')}
              className="px-6 py-3 bg-[#D4AF37] hover:bg-[#C59B27] text-[#07172C] text-xs sm:text-sm font-semibold rounded-md shadow-md transition-colors cursor-pointer"
            >
              Claim Festive Blessing
            </button>
          </div>
          {/* Decorative peacock feather medallion overlay */}
          <div className="absolute right-[-40px] -bottom-10 opacity-20 pointer-events-none hidden sm:block">
            <Sparkles className="w-80 h-80 text-[#D4AF37]" />
          </div>
        </div>
      </section>
    </div>
  );
};
