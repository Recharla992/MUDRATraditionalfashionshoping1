import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { VirtualTryOnModule } from './VirtualTryOnModule';
import { ColorCombinationStudio } from './ColorCombinationStudio';
import { InteractiveDesignStudio } from './InteractiveDesignStudio';
import { SmartFabricIdentifier } from './SmartFabricIdentifier';
import { OccasionPlannerModule } from './OccasionPlannerModule';
import {
  Camera,
  Scissors,
  Shirt,
  Palette,
  Microscope,
  CalendarHeart,
  Compass,
  Sparkles,
} from 'lucide-react';

export type AIStudioTab =
  | 'try-on'
  | 'color-studio'
  | 'design-studio'
  | 'fabric-identifier'
  | 'occasion-planner';

interface AIFashionLabHubProps {
  initialTab?: AIStudioTab;
  initialProductId?: string | null;
}

const STUDIO_TABS: Array<{
  id: AIStudioTab;
  label: string;
  subtitle: string;
  icon: React.FC<{ className?: string }>;
}> = [
  {
    id: 'try-on',
    label: 'Virtual Outfit Try-On',
    subtitle: 'Visualize on portrait',
    icon: Shirt,
  },
  {
    id: 'color-studio',
    label: 'Colour Combination Studio',
    subtitle: 'Blouse, border & zari',
    icon: Palette,
  },
  {
    id: 'design-studio',
    label: 'Design Customization Studio',
    subtitle: 'Neckline, sleeves & motifs',
    icon: Scissors,
  },
  {
    id: 'fabric-identifier',
    label: 'Smart Fabric Identifier',
    subtitle: 'Texture & weave care',
    icon: Microscope,
  },
  {
    id: 'occasion-planner',
    label: 'Occasion Fashion Planner',
    subtitle: 'Event & budget picks',
    icon: CalendarHeart,
  },
];

export const AIFashionLabHub: React.FC<AIFashionLabHubProps> = ({
  initialTab = 'try-on',
  initialProductId = null,
}) => {
  const { openVisualSearch } = useApp();
  const [activeTab, setActiveTab] = useState<AIStudioTab>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const scrollToHeritage = () => {
    const el = document.getElementById('textile-heritage-explorer');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section
      id="mudra-ai-fashion-lab"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6"
    >
      {/* Complete AI Fashion Journey Banner */}
      <div className="bg-gradient-to-r from-[#0C2B4E] via-[#09223D] to-[#07172C] rounded-2xl p-6 sm:p-8 text-white border border-[#D4AF37]/40 shadow-lg space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-[#D4AF37]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>MUDRA AI Atelier · Complete AI Fashion Journey</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#F3E8CE]">
              Discover · Experiment · Visualize · Personalize · Learn
            </h2>
            <p className="text-xs sm:text-sm text-[#D9D0C3] leading-relaxed">
              An integrated suite of intelligent Indian couture tools — search by photo, customize silhouettes, compare outfits on your portrait, test complementary zari colours, identify fabrics, plan occasions, and explore handloom heritage.
            </p>
          </div>
        </div>

        {/* 5-Stage Interactive Journey Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <button
            type="button"
            onClick={() => openVisualSearch()}
            className="text-left p-3.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/15 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-[#D4AF37] mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider">01 · Discover</span>
              <Camera className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </div>
            <p className="font-heading text-sm font-bold text-[#F3E8CE]">Visual Search</p>
            <p className="text-[11px] text-[#D9D0C3] mt-0.5 leading-snug">
              Upload a reference image and find similar designs.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('design-studio')}
            className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer group ${
              activeTab === 'design-studio'
                ? 'bg-[#D4AF37]/20 border-[#D4AF37]'
                : 'bg-white/5 hover:bg-white/15 border-white/15'
            }`}
          >
            <div className="flex items-center justify-between text-[#D4AF37] mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider">02 · Experiment</span>
              <Scissors className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </div>
            <p className="font-heading text-sm font-bold text-[#F3E8CE]">Design Studio</p>
            <p className="text-[11px] text-[#D9D0C3] mt-0.5 leading-snug">
              Customize neckline, embroidery, fabric colours & patterns.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('try-on')}
            className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer group ${
              activeTab === 'try-on'
                ? 'bg-[#D4AF37]/20 border-[#D4AF37]'
                : 'bg-white/5 hover:bg-white/15 border-white/15'
            }`}
          >
            <div className="flex items-center justify-between text-[#D4AF37] mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider">03 · Visualize</span>
              <Shirt className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </div>
            <p className="font-heading text-sm font-bold text-[#F3E8CE]">Virtual Try-On</p>
            <p className="text-[11px] text-[#D9D0C3] mt-0.5 leading-snug">
              Try selected outfits virtually on your portrait photo.
            </p>
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab(activeTab === 'color-studio' ? 'occasion-planner' : 'color-studio')
            }
            className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer group ${
              activeTab === 'color-studio' || activeTab === 'occasion-planner'
                ? 'bg-[#D4AF37]/20 border-[#D4AF37]'
                : 'bg-white/5 hover:bg-white/15 border-white/15'
            }`}
          >
            <div className="flex items-center justify-between text-[#D4AF37] mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider">04 · Personalize</span>
              <Palette className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </div>
            <p className="font-heading text-sm font-bold text-[#F3E8CE]">Colours & Occasions</p>
            <p className="text-[11px] text-[#D9D0C3] mt-0.5 leading-snug">
              Get tailored colour palettes & occasion recommendations.
            </p>
          </button>

          <button
            type="button"
            onClick={scrollToHeritage}
            className="text-left p-3.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/15 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between text-[#D4AF37] mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider">05 · Learn</span>
              <Compass className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </div>
            <p className="font-heading text-sm font-bold text-[#F3E8CE]">Textile Heritage</p>
            <p className="text-[11px] text-[#D9D0C3] mt-0.5 leading-snug">
              Explore Indian handloom origins & regional techniques.
            </p>
          </button>
        </div>
      </div>

      {/* Interactive Module Switcher Tabs */}
      <div className="bg-white border border-[#E8E2D9] rounded-2xl shadow-xs overflow-hidden">
        <div className="bg-[#EFEAE2]/70 border-b border-[#E8E2D9] p-2 sm:p-3 flex flex-wrap gap-2">
          {STUDIO_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[165px] flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0C2B4E] text-white shadow-sm'
                    : 'bg-white/80 hover:bg-white text-[#1E252B] border border-[#E8E2D9]'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-[#D4AF37] text-[#07172C]' : 'bg-[#FAF5E8] text-[#0C2B4E]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p
                    className={`text-xs font-bold truncate ${
                      isActive ? 'text-[#F3E8CE]' : 'text-[#0C2B4E]'
                    }`}
                  >
                    {tab.label}
                  </p>
                  <p
                    className={`text-[10px] truncate ${
                      isActive ? 'text-[#D9D0C3]' : 'text-[#718096]'
                    }`}
                  >
                    {tab.subtitle}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Module Viewport */}
        <div className="p-5 sm:p-7">
          {activeTab === 'try-on' && (
            <VirtualTryOnModule initialProductId={initialProductId} />
          )}
          {activeTab === 'color-studio' && (
            <ColorCombinationStudio initialProductId={initialProductId} />
          )}
          {activeTab === 'design-studio' && (
            <InteractiveDesignStudio initialProductId={initialProductId} />
          )}
          {activeTab === 'fabric-identifier' && <SmartFabricIdentifier />}
          {activeTab === 'occasion-planner' && <OccasionPlannerModule />}
        </div>
      </div>
    </section>
  );
};
