import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, ArrowRight, ShieldCheck, Feather, HeartHandshake } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { navigateTo } = useApp();

  return (
    <section className="relative bg-[#07172C] text-[#FAF8F5] overflow-hidden">
      {/* Background Hero Image with Measured Contrast Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src="/src/assets/images/mudra_hero_divine_couture_1793641346974.jpg"
          alt="MUDRA Divine Traditional Indian Fashion & Silk Attire"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-95"
        />
        {/* Subtle radial and directional scrim for 4.5:1 WCAG legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#07172C]/95 via-[#07172C]/80 to-transparent lg:w-3/5" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07172C] via-transparent to-transparent opacity-60" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 flex flex-col justify-center min-h-[580px]">
        <div className="max-w-2xl">
          {/* Quiet Divine Kicker */}
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#D4AF37] mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-b from-[#0F355F] to-[#041021] p-1 border border-[#E5B23A] shadow-md flex items-center justify-center overflow-hidden shrink-0">
              <img src="/mudra-logo.png" alt="MUDRA" className="w-full h-full object-contain filter drop-shadow-[0_1px_4px_rgba(255,226,133,0.85)]" />
            </div>
            <span>Radha-Krishna Inspired Couturiers</span>
            <span className="w-8 h-px bg-[#D4AF37]" />
          </div>

          {/* Main Display Headline (with text-wrap: balance) */}
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight tracking-tight mb-5 [text-wrap:balance]">
            Celebrate Tradition. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F3E8CE] via-[#D4AF37] to-[#E2C775]">
              Wear Divine Elegance.
            </span>
          </h1>

          {/* Subtitle introducing MUDRA */}
          <p className="text-sm sm:text-base text-[#D9D0C3] leading-relaxed mb-8 max-w-xl font-normal">
            Immerse yourself in authentic handloom Kanchipuram silks, Banarasi zardozi weaves, royal raw silk sherwanis, and 22K temple jewelry handcrafted by generational master artisans of India.
          </p>

          {/* Primary & Secondary Action CTAs */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => navigateTo('shop')}
              className="px-7 py-3 text-sm font-semibold text-[#07172C] bg-[#D4AF37] hover:bg-[#C59B27] rounded-md transition-all shadow-md flex items-center gap-2 cursor-pointer group"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => navigateTo('women')}
              className="px-6 py-3 text-sm font-medium text-[#FAF8F5] bg-white/10 hover:bg-white/20 backdrop-blur-xs border border-white/20 rounded-md transition-all cursor-pointer"
            >
              Explore Collections
            </button>
          </div>
        </div>
      </div>

      {/* Trust & Heritage Value Strip */}
      <div className="relative z-10 bg-[#0C2B4E]/90 backdrop-blur-md border-t border-[#D4AF37]/20 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-xs text-[#F3E8CE]">
          <div className="flex items-center gap-3">
            <Feather className="w-5 h-5 text-[#D4AF37] shrink-0" />
            <div>
              <p className="font-semibold text-white">Pure Mulberry & Tussar Silk</p>
              <p className="text-[#D9D0C3]/80 text-[11px]">Silk Mark Certified Handlooms</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[#D4AF37] shrink-0" />
            <div>
              <p className="font-semibold text-white">22K Antique Temple Gold</p>
              <p className="text-[#D9D0C3]/80 text-[11px]">Authentic Chola & Kempu Craft</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <HeartHandshake className="w-5 h-5 text-[#D4AF37] shrink-0" />
            <div>
              <p className="font-semibold text-white">250+ Master Weavers</p>
              <p className="text-[#D9D0C3]/80 text-[11px]">Fair Trade Artisan Cooperatives</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#D4AF37] shrink-0" />
            <div>
              <p className="font-semibold text-white">Sacred Puja Packaging</p>
              <p className="text-[#D9D0C3]/80 text-[11px]">Insured Worldwide Delivery</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
