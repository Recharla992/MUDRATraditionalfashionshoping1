import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShoppingBag,
  Heart,
  Search,
  User as UserIcon,
  Menu,
  X,
  ShieldCheck,
  Sparkles,
  Camera,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    navigateTo,
    currentView,
    cart,
    wishlist,
    setIsCartDrawerOpen,
    currentUser,
    setIsAuthModalOpen,
    switchRole,
    searchQuery,
    setSearchQuery,
    openVisualSearch,
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [announcementDismissed, setAnnouncementDismissed] = useState(false);

  const totalCartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateTo('shop');
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E2D9] transition-all">
      {/* Sacred Announcement Strip */}
      {!announcementDismissed && (
        <div className="bg-[#0C2B4E] text-[#F3E8CE] text-xs py-1.5 px-4 flex items-center justify-between font-sans border-b border-[#D4AF37]/30">
          <div className="flex-1 text-center font-medium tracking-wide flex items-center justify-center gap-2">
            <span className="text-[#D4AF37]">✦</span>
            <span>Tradition Woven with Divine Grace</span>
            <span className="hidden sm:inline text-[#D4AF37]/60">|</span>
            <span className="hidden sm:inline">Complimentary Sacred Shipping on orders above ₹1,999 • Code: <strong className="text-[#D4AF37]">VRINDAVAN</strong></span>
            <span className="text-[#D4AF37]">✦</span>
          </div>
          <button
            onClick={() => setAnnouncementDismissed(true)}
            aria-label="Dismiss announcement"
            className="text-[#F3E8CE]/70 hover:text-white text-xs ml-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Top Bar Contract: Zone 1 (Brand) — Zone 2 (4-5 Nav Links) — Zone 3 (Primary Actions) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-22 flex items-center justify-between gap-6">
        
        {/* Zone 1: Single Brand Wordmark Element */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => navigateTo('home')}
            className="flex items-center gap-3.5 text-left group cursor-pointer"
          >
            {/* Official MUDRA Radha-Krishna Insignia - Bold & Radiant */}
            <div className="w-14 h-14 sm:w-15 sm:h-15 rounded-full bg-gradient-to-b from-[#0F355F] via-[#08203D] to-[#041021] p-2 border-2 border-[#E5B23A] ring-2 ring-[#D4AF37]/50 shadow-[0_4px_18px_rgba(212,175,55,0.4)] flex items-center justify-center shrink-0 overflow-hidden group-hover:border-[#FFE285] group-hover:ring-[#D4AF37] group-hover:shadow-[0_4px_24px_rgba(212,175,55,0.65)] transition-all duration-300">
              <img
                src="/mudra-logo.png"
                alt="MUDRA - Divine Traditional Indian Fashion & Ornaments"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.dataset.tried) {
                    target.dataset.tried = 'true';
                    target.src = '/mudra-logo-gold.png';
                  }
                }}
                className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(255,226,133,0.85)] group-hover:scale-108 transition-transform duration-300"
              />
            </div>
            <div>
              <span className="font-heading text-2xl sm:text-3xl font-black tracking-[0.16em] text-[#0C2B4E] block leading-tight">
                MUDRA
              </span>
              <span className="text-[10px] uppercase font-sans tracking-[0.24em] text-[#9E731C] font-bold block flex items-center gap-1">
                <span className="text-[#D4AF37] text-[8px]">✦</span>
                <span>DIVINE GRACE</span>
                <span className="text-[#D4AF37] text-[8px]">✦</span>
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: 4-5 Concise Single-Line Nav Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#2C3539]">
          <button
            onClick={() => navigateTo('women')}
            className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentView === 'women'
                ? 'text-[#0C2B4E] font-semibold border-b-2 border-[#D4AF37]'
                : 'hover:text-[#0C2B4E]'
            }`}
          >
            Women's Weaves
          </button>
          <button
            onClick={() => navigateTo('men')}
            className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentView === 'men'
                ? 'text-[#0C2B4E] font-semibold border-b-2 border-[#D4AF37]'
                : 'hover:text-[#0C2B4E]'
            }`}
          >
            Men's Regal Wear
          </button>
          <button
            onClick={() => navigateTo('jewelry')}
            className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentView === 'jewelry'
                ? 'text-[#0C2B4E] font-semibold border-b-2 border-[#D4AF37]'
                : 'hover:text-[#0C2B4E]'
            }`}
          >
            Temple Jewelry
          </button>
          <button
            onClick={() => navigateTo('spiritual')}
            className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentView === 'spiritual'
                ? 'text-[#0C2B4E] font-semibold border-b-2 border-[#D4AF37]'
                : 'hover:text-[#0C2B4E]'
            }`}
          >
            Spiritual Adornments
          </button>
          <button
            onClick={() => navigateTo('shop')}
            className={`cursor-pointer whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentView === 'shop'
                ? 'text-[#0C2B4E] font-semibold border-b-2 border-[#D4AF37]'
                : 'hover:text-[#0C2B4E]'
            }`}
          >
            All Collections
          </button>
        </nav>

        {/* Zone 3: Actions (Visual Search, Search, Wishlist, Bag, User & Admin Switch) */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Visual Search (Shop by Photo) Trigger */}
          <button
            onClick={() => openVisualSearch()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF5E8] hover:bg-[#F3EFE9] text-[#0C2B4E] border border-[#D4AF37]/70 rounded-full text-xs font-semibold shadow-2xs hover:border-[#0C2B4E] transition-all cursor-pointer group"
            title="Visual Match • Upload any outfit or jewelry photo to find matching products"
            aria-label="Shop by Photo (Visual Search)"
          >
            <Camera className="w-3.5 h-3.5 text-[#0C2B4E] group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline font-heading tracking-wide">Shop by Photo</span>
          </button>

          {/* Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 text-[#4A5568] hover:text-[#0C2B4E] transition-colors rounded-full hover:bg-[#EFEAE2] cursor-pointer"
            aria-label="Search divine collections"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Wishlist */}
          <button
            onClick={() => navigateTo('wishlist')}
            className="p-2 text-[#4A5568] hover:text-[#C45B74] transition-colors rounded-full hover:bg-[#EFEAE2] relative cursor-pointer"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 bg-[#C45B74] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center font-mono">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart Bag */}
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="p-2 text-[#4A5568] hover:text-[#0C2B4E] transition-colors rounded-full hover:bg-[#EFEAE2] relative cursor-pointer"
            aria-label="Shopping Bag"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalCartCount > 0 && (
              <span className="absolute top-1 right-1 bg-[#0C2B4E] text-[#D4AF37] border border-[#D4AF37] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center font-mono">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* Account & Admin Role Switch */}
          <div className="hidden sm:flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateTo(currentUser.role === 'admin' ? 'admin' : 'account')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#0C2B4E] bg-[#EFEAE2] hover:bg-[#E6DEC8] border border-[#D9D0C3] rounded-md transition-colors cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#0C2B4E]" />
                  <span className="truncate max-w-[90px]">{currentUser.name.split(' ')[0]}</span>
                </button>

                {/* Role Switcher Pill */}
                <button
                  onClick={() => switchRole(currentUser.role === 'admin' ? 'customer' : 'admin')}
                  title="Switch between Customer & Admin view for evaluation"
                  className={`text-[11px] px-2.5 py-1 rounded border font-medium cursor-pointer transition-all ${
                    currentUser.role === 'admin'
                      ? 'bg-[#0C2B4E] text-[#D4AF37] border-[#D4AF37]'
                      : 'bg-white text-[#5A6578] border-[#D9D0C3] hover:text-[#0C2B4E]'
                  }`}
                >
                  {currentUser.role === 'admin' ? 'Admin Mode' : 'Customer'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0C2B4E] hover:bg-[#07172C] rounded-md transition-colors tracking-wide cursor-pointer shadow-xs"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-[#4A5568] hover:text-[#0C2B4E] cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Expandable Search Input Bar */}
      {isSearchOpen && (
        <div className="bg-[#FAF8F5] border-t border-[#E8E2D9] px-4 py-3 shadow-xs animate-in slide-in-from-top-2">
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C7A58]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Kora silk, Chanderi, metallic tissue sarees, temple bangles, bridal potlis, sherwanis..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-[#D9D0C3] rounded-md focus:outline-hidden focus:border-[#0C2B4E] focus:ring-1 focus:ring-[#0C2B4E] text-[#1E252B]"
                autoFocus
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsSearchOpen(false);
                  openVisualSearch();
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#0C2B4E] bg-[#FAF5E8] hover:bg-[#F3EFE9] border border-[#D4AF37] rounded-md transition-colors cursor-pointer shadow-2xs whitespace-nowrap"
                title="Upload image to search"
              >
                <Camera className="w-3.5 h-3.5 text-[#0C2B4E]" />
                <span>Shop by Photo</span>
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-[#0C2B4E] hover:bg-[#07172C] rounded-md transition-colors cursor-pointer whitespace-nowrap"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="text-xs text-[#5A6578] hover:text-[#0C2B4E] px-2 py-1 cursor-pointer"
              >
                Close
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF8F5] border-b border-[#E8E2D9] px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-2">
            {/* Visual Search mobile highlight */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                openVisualSearch();
              }}
              className="text-left py-2.5 px-3 text-sm font-semibold text-[#0C2B4E] bg-[#FAF5E8] border border-[#D4AF37] rounded-md flex items-center justify-between shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#D4AF37]" />
                <span>MUDRA Drishti AI • Shop by Photo</span>
              </div>
              <span className="text-[10px] bg-[#0C2B4E] text-[#F3E8CE] px-2 py-0.5 rounded font-mono">
                NEW
              </span>
            </button>
            <button
              onClick={() => {
                navigateTo('women');
                setIsMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 text-sm font-medium text-[#1E252B] hover:bg-[#EFEAE2] rounded-md"
            >
              Women's Weaves (Sarees, Lehengas, Anarkalis)
            </button>
            <button
              onClick={() => {
                navigateTo('men');
                setIsMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 text-sm font-medium text-[#1E252B] hover:bg-[#EFEAE2] rounded-md"
            >
              Men's Regal Wear (Sherwanis, Kurtas, Dhotis)
            </button>
            <button
              onClick={() => {
                navigateTo('jewelry');
                setIsMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 text-sm font-medium text-[#1E252B] hover:bg-[#EFEAE2] rounded-md"
            >
              Temple Jewelry & Ornaments
            </button>
            <button
              onClick={() => {
                navigateTo('spiritual');
                setIsMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 text-sm font-medium text-[#1E252B] hover:bg-[#EFEAE2] rounded-md"
            >
              Spiritual & Cultural Treasures
            </button>
            <button
              onClick={() => {
                navigateTo('shop');
                setIsMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 text-sm font-medium text-[#1E252B] hover:bg-[#EFEAE2] rounded-md"
            >
              Browse All Collections
            </button>
            <button
              onClick={() => {
                navigateTo('tracking');
                setIsMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 text-sm font-medium text-[#0C2B4E] hover:bg-[#EFEAE2] rounded-md flex items-center justify-between"
            >
              <span>Track Your Order</span>
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            </button>
          </div>

          <div className="pt-4 border-t border-[#E8E2D9] flex items-center justify-between">
            {currentUser ? (
              <div className="flex items-center gap-2 w-full justify-between">
                <button
                  onClick={() => {
                    navigateTo(currentUser.role === 'admin' ? 'admin' : 'account');
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-xs font-semibold text-[#0C2B4E]"
                >
                  My Account ({currentUser.name})
                </button>
                <button
                  onClick={() => switchRole(currentUser.role === 'admin' ? 'customer' : 'admin')}
                  className="text-xs bg-[#0C2B4E] text-[#D4AF37] px-2 py-1 rounded"
                >
                  Switch to {currentUser.role === 'admin' ? 'Customer' : 'Admin'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsAuthModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2 text-xs font-semibold text-white bg-[#0C2B4E] rounded-md"
              >
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
