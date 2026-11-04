import React, { useState } from 'react';
import { Product, ProductCustomization } from '../types';
import {
  Scissors,
  Sparkles,
  Check,
  X,
  Feather,
  Info,
  Heart,
  Ruler,
} from 'lucide-react';

interface CustomizationStudioModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onApplyCustomization: (customization: ProductCustomization) => void;
  initialCustomization?: ProductCustomization | null;
}

export const CustomizationStudioModal: React.FC<CustomizationStudioModalProps> = ({
  product,
  isOpen,
  onClose,
  onApplyCustomization,
  initialCustomization,
}) => {
  const isSaree = product.subcategory.toLowerCase().includes('saree');
  const isMen = product.gender === 'men';
  const isJewelry = product.category === 'jewelry';

  // State
  const [stitchingOption, setStitchingOption] = useState<
    'unstitched' | 'standard_stitched' | 'bespoke_madetomeasure'
  >(initialCustomization?.stitchingOption || (isJewelry ? 'unstitched' : 'bespoke_madetomeasure'));

  // Measurements
  const [bustChest, setBustChest] = useState(initialCustomization?.measurements?.bustChest || '36');
  const [waist, setWaist] = useState(initialCustomization?.measurements?.waist || '30');
  const [hips, setHips] = useState(initialCustomization?.measurements?.hips || '38');
  const [shoulderWidth, setShoulderWidth] = useState(
    initialCustomization?.measurements?.shoulderWidth || '14.5'
  );
  const [sleeveLength, setSleeveLength] = useState(
    initialCustomization?.measurements?.sleeveLength || '10.5'
  );
  const [blouseKurtaLength, setBlouseKurtaLength] = useState(
    initialCustomization?.measurements?.blouseKurtaLength || (isMen ? '40' : '14')
  );
  const [frontNeckDepth, setFrontNeckDepth] = useState(
    initialCustomization?.measurements?.frontNeckDepth || '7'
  );
  const [backNeckDepth, setBackNeckDepth] = useState(
    initialCustomization?.measurements?.backNeckDepth || '9.5'
  );

  // Styles
  const [necklineStyle, setNecklineStyle] = useState(
    initialCustomization?.necklineStyle || (isMen ? 'Royal Mandarin Collar' : 'Temple Sweetheart')
  );
  const [sleeveStyle, setSleeveStyle] = useState(
    initialCustomization?.sleeveStyle || 'Elbow Length with Temple Zari'
  );
  const [liningPreference, setLiningPreference] = useState(
    initialCustomization?.liningPreference || 'Pure Mulmul Cotton (Breathable)'
  );
  const [tasselsAndLatkans, setTasselsAndLatkans] = useState(
    initialCustomization?.tasselsAndLatkans || 'Basra Pearl & Zari Drops (+₹200)'
  );

  // Monogramming
  const [enableMonogram, setEnableMonogram] = useState(Boolean(initialCustomization?.monogramText));
  const [monogramText, setMonogramText] = useState(initialCustomization?.monogramText || 'श्री');
  const [monogramScript, setMonogramScript] = useState<'devanagari' | 'english'>(
    initialCustomization?.monogramScript === 'english' ? 'english' : 'devanagari'
  );
  const [monogramPlacement, setMonogramPlacement] = useState(
    initialCustomization?.monogramPlacement || (isSaree ? 'Pallu Zari Corner' : 'Cuff / Stole Border')
  );

  // Add-ons
  const [fallAndPico, setFallAndPico] = useState(initialCustomization?.fallAndPico ?? true);
  const [includeInskirt, setIncludeInskirt] = useState(false);
  const [giftBlessingNote, setGiftBlessingNote] = useState(
    initialCustomization?.giftBlessingNote || ''
  );

  if (!isOpen) return null;

  // Calculate fees
  let fee = 0;
  if (stitchingOption === 'bespoke_madetomeasure') {
    fee += isMen ? 1800 : 1200;
  } else if (stitchingOption === 'standard_stitched') {
    fee += 650;
  }

  if (enableMonogram && monogramText.trim()) {
    fee += 350;
  }

  if (tasselsAndLatkans.includes('+₹200')) {
    fee += 200;
  } else if (tasselsAndLatkans.includes('+₹350')) {
    fee += 350;
  }

  if (includeInskirt) {
    fee += 450;
  }

  const handleApply = () => {
    const customData: ProductCustomization = {
      isCustomized: stitchingOption !== 'unstitched' || enableMonogram || Boolean(giftBlessingNote),
      stitchingOption,
      measurements: {
        bustChest,
        waist,
        hips,
        shoulderWidth,
        sleeveLength,
        blouseKurtaLength,
        frontNeckDepth,
        backNeckDepth,
      },
      necklineStyle,
      sleeveStyle,
      liningPreference,
      tasselsAndLatkans,
      monogramText: enableMonogram ? monogramText.trim() : undefined,
      monogramScript: enableMonogram ? monogramScript : 'none',
      monogramPlacement: enableMonogram ? monogramPlacement : undefined,
      fallAndPico,
      giftBlessingNote: giftBlessingNote.trim() || undefined,
      customizationFee: fee,
    };

    onApplyCustomization(customData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#FAF8F5] border border-[#D4AF37]/40 rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto z-10 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-[#0C2B4E] px-6 py-4 text-[#F3E8CE] flex items-center justify-between border-b border-[#D4AF37]/30 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#07172C] border border-[#D4AF37] flex items-center justify-center text-[#D4AF37]">
              <Scissors className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-white">
                MUDRA Bespoke Atelier Studio
              </h2>
              <p className="text-[10px] text-[#D9D0C3]">
                Custom Hand-Tailoring & Sacred Zari Inscriptions for {product.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#D9D0C3] hover:text-white p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Body */}
        <div className="p-6 space-y-6 text-xs text-[#2D3748] flex-1">
          {/* Section 1: Tailoring Mode */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-heading font-bold text-sm text-[#0C2B4E] uppercase tracking-wide">
                1. Select Tailoring & Fit Experience
              </label>
              <span className="text-[11px] text-[#8C7A58] font-medium">Generational Master Tailors</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'bespoke_madetomeasure',
                  title: 'Bespoke Custom Fit',
                  desc: 'Handcrafted to your exact body measurements',
                  price: isMen ? '+₹1,800' : '+₹1,200',
                },
                {
                  id: 'standard_stitched',
                  title: 'Standard Pre-Stitched',
                  desc: 'Stitched to selected size (S/M/L) with 2" margins',
                  price: '+₹650',
                },
                {
                  id: 'unstitched',
                  title: 'Unstitched Fabric',
                  desc: 'Pure unstitched material piece with borders',
                  price: 'Included (+₹0)',
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setStitchingOption(opt.id as any)}
                  className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer ${
                    stitchingOption === opt.id
                      ? 'border-[#0C2B4E] bg-white ring-2 ring-[#0C2B4E]/20 shadow-xs'
                      : 'border-[#E8E2D9] bg-[#F5EFE6] hover:bg-white'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-xs text-[#0C2B4E]">{opt.title}</span>
                    <span className="font-mono text-[11px] font-semibold text-emerald-800">
                      {opt.price}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#718096] leading-relaxed">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Detailed Measurements (Only when custom fit chosen) */}
          {stitchingOption === 'bespoke_madetomeasure' && (
            <div className="bg-white p-5 rounded-xl border border-[#E8E2D9] space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-2">
                <div className="flex items-center gap-1.5 font-heading font-bold text-xs text-[#0C2B4E]">
                  <Ruler className="w-4 h-4 text-[#D4AF37]" />
                  <span>Bespoke Measurement Profile (Inches)</span>
                </div>
                <span className="text-[10px] text-[#8C7A58]">All measurements are in inches</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#4A5568] mb-1">
                    {isMen ? 'Chest Circumference' : 'Bust (Fullest)'} *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={bustChest}
                    onChange={(e) => setBustChest(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-[#FAF8F5] border border-[#D9D0C3] rounded font-mono font-bold text-[#0C2B4E]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#4A5568] mb-1">
                    Natural Waist *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={waist}
                    onChange={(e) => setWaist(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-[#FAF8F5] border border-[#D9D0C3] rounded font-mono font-bold text-[#0C2B4E]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#4A5568] mb-1">
                    Shoulder Width *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={shoulderWidth}
                    onChange={(e) => setShoulderWidth(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-[#FAF8F5] border border-[#D9D0C3] rounded font-mono font-bold text-[#0C2B4E]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#4A5568] mb-1">
                    Sleeve Length *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={sleeveLength}
                    onChange={(e) => setSleeveLength(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-[#FAF8F5] border border-[#D9D0C3] rounded font-mono font-bold text-[#0C2B4E]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#4A5568] mb-1">
                    {isMen ? 'Kurta / Sherwani Length' : 'Blouse Length'} *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={blouseKurtaLength}
                    onChange={(e) => setBlouseKurtaLength(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-[#FAF8F5] border border-[#D9D0C3] rounded font-mono font-bold text-[#0C2B4E]"
                  />
                </div>

                {!isMen && (
                  <>
                    <div>
                      <label className="block text-[11px] font-medium text-[#4A5568] mb-1">
                        Front Neck Depth
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={frontNeckDepth}
                        onChange={(e) => setFrontNeckDepth(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 bg-[#FAF8F5] border border-[#D9D0C3] rounded font-mono font-bold text-[#0C2B4E]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-[#4A5568] mb-1">
                        Back Neck Depth
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={backNeckDepth}
                        onChange={(e) => setBackNeckDepth(e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 bg-[#FAF8F5] border border-[#D9D0C3] rounded font-mono font-bold text-[#0C2B4E]"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[11px] font-medium text-[#4A5568] mb-1">
                    Hip Circumference
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={hips}
                    onChange={(e) => setHips(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-[#FAF8F5] border border-[#D9D0C3] rounded font-mono font-bold text-[#0C2B4E]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section 3: Neckline, Sleeves & Latkans Styling */}
          {stitchingOption !== 'unstitched' && !isJewelry && (
            <div className="bg-white p-5 rounded-xl border border-[#E8E2D9] space-y-4 shadow-xs">
              <label className="font-heading font-bold text-xs text-[#0C2B4E] uppercase tracking-wide block">
                2. Design & Artisan Silhouette Preferences
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-[#4A5568] mb-1">
                    Neckline Style
                  </label>
                  <select
                    value={necklineStyle}
                    onChange={(e) => setNecklineStyle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9D0C3] rounded text-xs text-[#1A202C]"
                  >
                    {!isMen ? (
                      <>
                        <option value="Temple Sweetheart">Temple Sweetheart Neck</option>
                        <option value="Deep U with Braided Dori">Deep U with Gold Braided Dori</option>
                        <option value="Royal Boat Neck with Zari Piping">Royal Boat Neck with Zari Piping</option>
                        <option value="Scalloped V-Neckline">Scalloped V-Neckline</option>
                        <option value="High Neck Glass Back">High Neck with Keyhole Glass Back</option>
                      </>
                    ) : (
                      <>
                        <option value="Royal Mandarin Collar">Royal Mandarin Collar with Gold Piping</option>
                        <option value="Angrakha Cross Over Neck">Traditional Angrakha Cross Over</option>
                        <option value="Classic Bandhgala">Imperial High Bandhgala</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#4A5568] mb-1">
                    Sleeve Style
                  </label>
                  <select
                    value={sleeveStyle}
                    onChange={(e) => setSleeveStyle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9D0C3] rounded text-xs text-[#1A202C]"
                  >
                    <option value="Elbow Length with Temple Zari">Elbow Length with Temple Zari Border</option>
                    <option value="Classic Short Sleeve (7 inches)">Classic Short Sleeve (7 inches)</option>
                    <option value="Full Churidar Sleeves (Gathered)">Full Churidar Sleeves (Gathered)</option>
                    <option value="Sleeveless with Zari Piping">Sleeveless with Soft Zari Piping</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#4A5568] mb-1">
                    Inner Lining Fabric
                  </label>
                  <select
                    value={liningPreference}
                    onChange={(e) => setLiningPreference(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9D0C3] rounded text-xs text-[#1A202C]"
                  >
                    <option value="Pure Mulmul Cotton (Breathable)">Pure Mulmul Cotton (Soft & Breathable)</option>
                    <option value="Butter Crepe Silk">Butter Crepe Silk (Smooth Glide)</option>
                    <option value="Satin Silk Lining">Heavy Satin Silk Lining</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#4A5568] mb-1">
                    Back Dori & Tassels (Latkans)
                  </label>
                  <select
                    value={tasselsAndLatkans}
                    onChange={(e) => setTasselsAndLatkans(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9D0C3] rounded text-xs text-[#1A202C]"
                  >
                    <option value="Basra Pearl & Zari Drops (+₹200)">Handcrafted Basra Pearl Drops (+₹200)</option>
                    <option value="Heavy Zardozi Bell Latkans (+₹350)">Heavy Antique Zardozi Bells (+₹350)</option>
                    <option value="Simple Tone-on-Tone Dori">Minimalist Dori (+₹0)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Sacred Monogram / Couple Initials Embroidery */}
          <div className="bg-white p-5 rounded-xl border border-[#E8E2D9] space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableMonogram}
                  onChange={(e) => setEnableMonogram(e.target.checked)}
                  className="rounded text-[#0C2B4E] focus:ring-[#0C2B4E]"
                />
                <span className="font-heading font-bold text-xs text-[#0C2B4E] uppercase tracking-wide">
                  3. Inscribe Sacred Monogram in Gold Zari (+₹350)
                </span>
              </label>
              <span className="text-[11px] font-mono text-[#D4AF37] font-semibold">Devotee Signature</span>
            </div>

            {enableMonogram && (
              <div className="pt-2 border-t border-[#F0EBE1] grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#4A5568] mb-1">
                    Monogram Text / Initials
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    value={monogramText}
                    onChange={(e) => setMonogramText(e.target.value)}
                    placeholder="e.g. श्री or R & K"
                    className="w-full text-xs px-3 py-1.5 bg-[#FAF8F5] border border-[#D9D0C3] rounded font-bold text-[#0C2B4E]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#4A5568] mb-1">
                    Sacred Script
                  </label>
                  <select
                    value={monogramScript}
                    onChange={(e) => setMonogramScript(e.target.value as any)}
                    className="w-full text-xs px-3 py-1.5 bg-[#FAF8F5] border border-[#D9D0C3] rounded"
                  >
                    <option value="devanagari">Devanagari (देवनागरी)</option>
                    <option value="english">English Roman Calligraphy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#4A5568] mb-1">
                    Placement Location
                  </label>
                  <select
                    value={monogramPlacement}
                    onChange={(e) => setMonogramPlacement(e.target.value)}
                    className="w-full text-xs px-3 py-1.5 bg-[#FAF8F5] border border-[#D9D0C3] rounded"
                  >
                    {isSaree ? (
                      <>
                        <option value="Pallu Zari Corner">Pallu Zari Corner</option>
                        <option value="Blouse Sleeve Hem">Blouse Sleeve Hem</option>
                      </>
                    ) : (
                      <>
                        <option value="Stole / Angavastram Edge">Stole / Angavastram Edge</option>
                        <option value="Achkan Inner Pocket">Achkan Inner Pocket</option>
                        <option value="Cuff Border">Cuff Border</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Section 5: Finishing & Keepsake Blessing Note */}
          <div className="bg-[#FAF5E8] p-4 rounded-xl border border-[#D4AF37]/30 space-y-3">
            <h4 className="font-heading font-bold text-xs text-[#0C2B4E] uppercase tracking-wide">
              4. Ceremonial Packaging & Sacred Additions
            </h4>

            <div className="space-y-2">
              {isSaree && (
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={fallAndPico}
                    onChange={(e) => setFallAndPico(e.target.checked)}
                    className="rounded text-[#0C2B4E]"
                  />
                  <span>
                    <strong>Fall & Pico Finishing</strong> (Complimentary standard inclusion ✦)
                  </span>
                </label>
              )}

              {isSaree && (
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={includeInskirt}
                    onChange={(e) => setIncludeInskirt(e.target.checked)}
                    className="rounded text-[#0C2B4E]"
                  />
                  <span>
                    Include Color-Matched <strong>Pure Cotton Satin Inskirt / Petticoat (+₹450)</strong>
                  </span>
                </label>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-[#0C2B4E] mb-1">
                  Enclose Handwritten Vrindavan Blessing / Gift Card (Complimentary)
                </label>
                <input
                  type="text"
                  value={giftBlessingNote}
                  onChange={(e) => setGiftBlessingNote(e.target.value)}
                  placeholder="e.g. Wishing divine prosperity and lifelong grace for your sacred wedding muhurtham."
                  className="w-full text-xs px-3 py-2 bg-white border border-[#D9D0C3] rounded-md placeholder-slate-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Price Summary and Apply CTA */}
        <div className="sticky bottom-0 bg-white p-4 sm:p-5 border-t border-[#E8E2D9] flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-20">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-[#718096]">Customization Add-on:</span>
              <span className="font-mono font-bold text-base text-[#0C2B4E]">
                {fee === 0 ? 'FREE (Complimentary)' : `+₹${fee.toLocaleString('en-IN')}`}
              </span>
            </div>
            <p className="text-[11px] text-[#8C7A58]">
              Includes precision atelier tailoring & certified inspection by master artisans
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#D9D0C3] text-[#4A5568] hover:bg-slate-50 text-xs font-semibold rounded-md cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-6 py-2.5 bg-[#0C2B4E] hover:bg-[#07172C] text-[#F3E8CE] text-xs font-semibold rounded-md shadow-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4 text-[#D4AF37]" />
              <span>Apply Bespoke Customization</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
