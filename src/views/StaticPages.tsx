import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const AboutView: React.FC = () => {
  const { navigateTo } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C7A58] uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>The Sacred Genesis</span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#0C2B4E]">
          Tradition Woven with Divine Grace
        </h1>
        <p className="text-sm text-[#718096] max-w-xl mx-auto">
          MUDRA was founded to preserve the timeless sanctity of Indian devotional craftsmanship and handloom weaving.
        </p>
      </div>

      <div className="aspect-16/9 rounded-xl overflow-hidden shadow-lg border border-[#D4AF37]/30">
        <img
          src="/src/assets/images/mudra_hero_divine_couture_1793641346974.jpg"
          alt="MUDRA Divine Heritage"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="space-y-6 text-sm text-[#4A5568] leading-relaxed">
        <h2 className="font-heading text-xl font-bold text-[#0C2B4E]">
          Our Divine Inspiration: Radha-Krishna & Vrindavan Culture
        </h2>
        <p>
          At <strong>MUDRA</strong>, every weave tells a sacred story. From the celestial love of Radha-Krishna to the melodious resonance of the divine flute beneath the kadamba trees of Vrindavan, our designs embody reverence, dignity, and grace.
        </p>
        <p>
          Our atelier works directly with master handloom weavers across Kanchipuram, Varanasi, Chanderi, and temple jewelry artisans in South India. By omitting intermediaries, we ensure fair livelihood for generational artisans while delivering authentic Silk Mark certified fabrics to devotees worldwide.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-[#E8E2D9]">
          <div className="p-4 bg-white border border-[#E8E2D9] rounded-lg text-center space-y-1">
            <span className="font-mono text-2xl font-bold text-[#0C2B4E]">250+</span>
            <p className="font-semibold text-xs text-[#1A202C]">Master Artisan Families</p>
            <p className="text-[11px] text-[#718096]">Supported across 6 handloom clusters</p>
          </div>
          <div className="p-4 bg-white border border-[#E8E2D9] rounded-lg text-center space-y-1">
            <span className="font-mono text-2xl font-bold text-[#0C2B4E]">100%</span>
            <p className="font-semibold text-xs text-[#1A202C]">Silk Mark Certified</p>
            <p className="text-[11px] text-[#718096]">Tested pure gold & silver dipped zari</p>
          </div>
          <div className="p-4 bg-white border border-[#E8E2D9] rounded-lg text-center space-y-1">
            <span className="font-mono text-2xl font-bold text-[#0C2B4E]">12,000+</span>
            <p className="font-semibold text-xs text-[#1A202C]">Devotee Patrons</p>
            <p className="text-[11px] text-[#718096]">Adorning weddings & festive poojas</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContactView: React.FC = () => {
  const { showToast } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Your message has been received with reverence. Our concierge will contact you within 24 hours.', 'success');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="text-center space-y-2 mb-10">
        <h1 className="font-heading text-3xl font-bold text-[#0C2B4E]">Contact Our Ateliers</h1>
        <p className="text-xs sm:text-sm text-[#718096]">
          Have questions regarding bespoke bridal orders, temple sizing, or international shipping?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Contact Info */}
        <div className="space-y-6 text-xs text-[#4A5568]">
          <div className="bg-white p-5 rounded-xl border border-[#E8E2D9] space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm text-[#0C2B4E] font-heading">
                  Vrindavan Heritage Atelier
                </strong>
                <p>MUDRA Bhavan, Raman Reti Road, Near ISKCON Temple, Vrindavan, Mathura, UP - 281121</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm text-[#0C2B4E] font-heading">
                  Devotee Helpline
                </strong>
                <p>+91 (0565) 244-MUDRA / +91 98765 43210 (Mon-Sat, 9 AM - 8 PM IST)</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm text-[#0C2B4E] font-heading">
                  Electronic Concierge
                </strong>
                <p>care@mudra.in · orders@mudra.in</p>
              </div>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="bg-white p-6 rounded-xl border border-[#E8E2D9]">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#2D3748] mb-1">Your Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Priyadarshini Sen"
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9D0C3] rounded-md"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#2D3748] mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="priya@example.com"
                className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9D0C3] rounded-md"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#2D3748] mb-1">Your Inquiry</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Inquire about bridal customization, blouse stitching, or pooja gift hampers..."
                className="w-full p-2.5 bg-[#FAF8F5] border border-[#D9D0C3] rounded-md"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-[#0C2B4E] hover:bg-[#07172C] text-[#F3E8CE] font-semibold rounded-md shadow-xs cursor-pointer"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export const FAQView: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Are your sarees and dhotis certified pure handloom silk?',
      a: 'Yes, 100%. Every silk saree and kurta set comes with an official Silk Mark Organization of India tag and QR authentication guaranteeing pure mulberry, tussar, or muga silk fibers and tested gold dipped zari.',
    },
    {
      q: 'How long does temple delivery take within India?',
      a: 'Orders are dispatched within 24 to 48 hours from our Vrindavan or Chennai fulfillment facilities. Standard express delivery takes 2 to 4 business days to metro cities and 4 to 6 business days for other regional areas.',
    },
    {
      q: 'Can I pay via Cash on Delivery (COD)?',
      a: 'Yes, Cash on Delivery is supported across all serviceable Indian pincodes up to ₹25,000. You may pay in cash or via courier UPI QR upon parcel arrival.',
    },
    {
      q: 'What is your return and exchange policy?',
      a: 'We offer a 7-day reverent exchange and return guarantee for unworn items with tags intact. Handloom sarees and temple jewelry must be in their original keepsake box with the authenticity certificate.',
    },
    {
      q: 'What materials are used for the Radha-Krishna temple jewelry?',
      a: 'Our temple jewelry is sculpted in high-density brass alloy and coated with 22K antique gold micron plating. We use authentic Kempu cabochon rubies, emerald cubic zirconia, and cultured pearls.',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="font-heading text-3xl font-bold text-[#0C2B4E]">Frequently Asked Questions</h1>
        <p className="text-xs text-[#718096]">Answers to common questions about our weaves, care, and orders.</p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="border border-[#E8E2D9] rounded-lg bg-white overflow-hidden shadow-xs"
          >
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full p-4 text-left font-semibold text-xs sm:text-sm text-[#0C2B4E] flex items-center justify-between gap-4 cursor-pointer"
            >
              <span>{faq.q}</span>
              {openIndex === idx ? (
                <ChevronUp className="w-4 h-4 text-[#D4AF37] shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#8C7A58] shrink-0" />
              )}
            </button>
            {openIndex === idx && (
              <div className="px-4 pb-4 pt-1 text-xs text-[#4A5568] leading-relaxed border-t border-[#F0EBE1]">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const PolicyView: React.FC<{ type: 'shipping' | 'returns' | 'privacy' | 'terms' }> = ({
  type,
}) => {
  const titles = {
    shipping: 'Shipping & Temple Delivery Policy',
    returns: 'Return & Exchange Sanctuary Policy',
    privacy: 'Privacy & Devotee Data Security Policy',
    terms: 'Terms & Conditions of Service',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-6 text-xs text-[#4A5568] leading-relaxed">
      <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#0C2B4E]">
        {titles[type]}
      </h1>
      <p className="text-xs text-[#718096]">Last updated: March 2026 · MUDRA Ateliers Pvt. Ltd.</p>

      {type === 'shipping' && (
        <div className="space-y-4">
          <p>
            All MUDRA consignments are packed with ceremonial care in tamper-evident velvet boxes. Complimentary Sacred Delivery is provided for all orders exceeding ₹1,999 across all Indian states.
          </p>
          <h3 className="font-bold text-sm text-[#0C2B4E]">Delivery Timelines</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Metropolitan Cities (Mumbai, Delhi NCR, Bengaluru, Chennai, Kolkata, Hyderabad): 2-3 business days.</li>
            <li>Tier 2 and Regional Towns: 3-5 business days.</li>
            <li>Special Festive/Bridal Customized Orders: 7-10 business days for bespoke zardozi embroidery.</li>
          </ul>
        </div>
      )}

      {type === 'returns' && (
        <div className="space-y-4">
          <p>
            We honor your peace of mind. If any handloom drape or jewelry piece does not meet your expectations, we offer a hassle-free 7-day exchange or refund guarantee.
          </p>
          <h3 className="font-bold text-sm text-[#0C2B4E]">Return Requirements</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Item must be unused, unwashed, and with all Silk Mark / MUDRA tags intact.</li>
            <li>Temple jewelry must include the original velvet storage box and purity seal.</li>
            <li>Reverse courier pickup is scheduled without extra charge to your doorstep.</li>
          </ul>
        </div>
      )}

      {type === 'privacy' && (
        <div className="space-y-4">
          <p>
            MUDRA takes customer privacy and data sanctity with paramount gravity. We never sell or share patron phone numbers, addresses, or payment logs with third-party advertisers.
          </p>
          <p>
            Payment transactions are secured via 256-bit bank-grade encryption certified under RBI and PCI-DSS compliance.
          </p>
        </div>
      )}

      {type === 'terms' && (
        <div className="space-y-4">
          <p>
            By accessing and placing orders on MUDRA, patrons agree to celebrate Indian craft heritage in good faith. Handloom variations in weave slubs, zari textures, and vegetable dye shades are the authentic hall-marks of genuine artisan hand craftsmanship.
          </p>
        </div>
      )}
    </div>
  );
};
