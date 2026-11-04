import React from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from '../components/ProductCard';
import { Heart, Sparkles, ArrowRight, ShoppingBag, Trash2 } from 'lucide-react';

export const WishlistView: React.FC = () => {
  const { wishlist, products, toggleWishlist, addToCart, navigateTo } = useApp();

  const wishlistedProducts = products.filter((p) => wishlist.includes(p.id));

  if (wishlistedProducts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#FAF5E8] flex items-center justify-center mx-auto text-[#C45B74]">
          <Heart className="w-8 h-8" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-[#0C2B4E]">Your Sacred Wishlist is Empty</h2>
        <p className="text-xs text-[#718096] max-w-sm mx-auto">
          Save your cherished heirloom weaves, bridal lehengas, and temple jewelry sets to review anytime.
        </p>
        <button
          onClick={() => navigateTo('shop')}
          className="px-6 py-3 bg-[#0C2B4E] hover:bg-[#07172C] text-white text-xs font-semibold rounded-md shadow-xs cursor-pointer inline-flex items-center gap-2"
        >
          <span>Discover Handlooms</span>
          <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#E8E2D9]">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#0C2B4E]">
            Sacred Wishlist
          </h1>
          <p className="text-xs text-[#718096] mt-1">
            You have {wishlistedProducts.length} saved treasures
          </p>
        </div>
        <button
          onClick={() => navigateTo('shop')}
          className="text-xs text-[#0C2B4E] font-medium hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#D4AF37]" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlistedProducts.map((prod) => (
          <div key={prod.id} className="relative group flex flex-col">
            <ProductCard product={prod} />
          </div>
        ))}
      </div>
    </div>
  );
};
