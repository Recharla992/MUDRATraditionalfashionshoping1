import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, ArrowRight, ShieldCheck, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo, showToast } = useApp();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      showToast('Thank you for subscribing to MUDRA Sacred Chronicles!', 'success');
      setNewsletterEmail('');
    }
  };

  return (
    <footer className="bg-[#07172C] text-[#D9D0C3] border-t border-[#D4AF37]/20 pt-16 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          
          {/* Brand Column (2 cols wide on desktop) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3.5">
              <div className="w-16 h-16 rounded-full bg-gradient-to-b from-[#0F355F] via-[#08203D] to-[#041021] p-2 border-2 border-[#E5B23A] ring-2 ring-[#D4AF37]/50 shadow-[0_0_24px_rgba(212,175,55,0.45)] flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src="/mudra-logo.png"
                  alt="MUDRA Divine Heritage"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.dataset.tried) {
                      target.dataset.tried = 'true';
                      target.src = '/mudra-logo-gold.png';
                    }
                  }}
                  className="w-full h-full object-contain filter drop-shadow-[0_2px_10px_rgba(255,226,133,0.9)]"
                />
              </div>
              <div>
                <span className="font-heading text-2xl font-black tracking-[0.16em] text-white block">
                  MUDRA
                </span>
                <span className="text-[10px] uppercase font-sans tracking-[0.22em] text-[#E5B23A] font-bold block mt-0.5">
                  ✦ Tradition Woven with Divine Grace ✦
                </span>
              </div>
            </div>

            <p className="text-xs text-[#A0AEC0] leading-relaxed max-w-sm">
              Born from the spiritual poetry of Vrindavan and centuries of Indian artisanal mastery. We craft pure silk sarees, bespoke sherwanis, and sacred temple adornments that honor Indian heritage.
            </p>

            {/* Newsletter */}
            <div className="pt-2">
              <p className="text-xs font-semibold text-white mb-2">
                Join the MUDRA Sacred Circle
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1 text-xs px-3 py-2 bg-white/5 border border-white/15 rounded-md text-white placeholder-slate-400 focus:outline-hidden focus:border-[#D4AF37]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-[#07172C] bg-[#D4AF37] hover:bg-[#C59B27] rounded-md transition-colors cursor-pointer"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>

          {/* Collections Column */}
          <div className="space-y-3 text-xs">
            <h4 className="font-heading text-sm font-semibold text-white tracking-wider">
              Collections
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigateTo('women')}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  Kanchipuram & Banarasi Sarees
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('women')}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  Bridal Lehengas & Anarkalis
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('men')}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  Raw Silk Sherwanis & Kurtas
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('jewelry')}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  22K Temple Gold Jewelry
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('spiritual')}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  Radha-Krishna Pendants & Pooja Sets
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3 text-xs">
            <h4 className="font-heading text-sm font-semibold text-white tracking-wider">
              Customer Care
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigateTo('tracking')}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  Track Your Order
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('account')}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  My Sacred Account
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('shipping')}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  Shipping & Temple Delivery
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('returns')}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  Return & Exchange Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('faq')}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  Frequently Asked Questions
                </button>
              </li>
            </ul>
          </div>

          {/* Sanctuary & Legal */}
          <div className="space-y-3 text-xs">
            <h4 className="font-heading text-sm font-semibold text-white tracking-wider">
              The Sanctuary
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigateTo('about')}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  About MUDRA Heritage
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('contact')}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  Contact Ateliers
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('privacy')}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('terms')}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('ai-studio', { aiTab: 'try-on' })}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  AI Fashion Atelier & Try-On
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('ai-studio', { aiTab: 'occasion-planner' })}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  Occasion Planner & Heritage
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('admin')}
                  className="text-[#D4AF37] hover:underline transition-colors cursor-pointer font-medium"
                >
                  Curator / Admin Console
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#718096]">
          <p>© {new Date().getFullYear()} MUDRA Ateliers Pvt. Ltd. All rights reserved. Handcrafted with reverence in India.</p>
          <div className="flex items-center gap-3 text-white/60 font-mono text-[11px]">
            <span>UPI</span>
            <span>·</span>
            <span>RuPay</span>
            <span>·</span>
            <span>Visa</span>
            <span>·</span>
            <span>Mastercard</span>
            <span>·</span>
            <span>Razorpay</span>
            <span>·</span>
            <span>Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
