import React from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { Heart, Star, ShoppingBag, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { navigateTo, addToCart, toggleWishlist, isInWishlist } = useApp();
  const wishlisted = isInWishlist(product.id);

  const formattedPrice = `₹${product.price.toLocaleString('en-IN')}`;
  const formattedOriginalPrice = `₹${product.originalPrice.toLocaleString('en-IN')}`;

  return (
    <div className="group flex flex-col bg-[#FAF8F5] border border-[#E8E2D9] rounded-lg overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-[#D9D0C3]">
      {/* Product Image Stage (65-75% height) */}
      <div className="relative aspect-4/5 w-full bg-[#F3EFE9] overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />

        {/* Fallback pattern container if image fails */}
        <div className="absolute inset-0 bg-[#EFEAE2] flex items-center justify-center -z-10 text-[#8C7A58] text-xs">
          <span>{product.name}</span>
        </div>

        {/* Quick Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#2C3539] hover:text-[#C45B74] shadow-xs transition-colors cursor-pointer"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              wishlisted ? 'fill-[#C45B74] text-[#C45B74]' : 'text-[#4A5568]'
            }`}
          />
        </button>

        {/* Quiet Discount Flag (Single subtle label, no pill sandwich) */}
        {product.discountPercentage > 0 && (
          <div className="absolute top-3 left-3 bg-[#0C2B4E]/90 backdrop-blur-xs text-[#F3E8CE] text-[11px] font-medium tracking-wide px-2 py-0.5 rounded-sm">
            {product.discountPercentage}% OFF
          </div>
        )}

        {/* Quick Actions Overlay Bar on Desktop */}
        <div className="absolute inset-x-3 bottom-3 hidden group-hover:flex items-center gap-2 transition-opacity duration-200">
          <button
            onClick={() => addToCart(product)}
            className="flex-1 py-2 px-3 bg-[#0C2B4E] hover:bg-[#07172C] text-[#FAF8F5] text-xs font-semibold rounded-md shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Add to Bag</span>
          </button>
          <button
            onClick={() => navigateTo('product-detail', { productId: product.id })}
            aria-label="View product details"
            className="p-2 bg-white/95 hover:bg-white text-[#0C2B4E] rounded-md shadow-sm transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card Metadata & Information Area */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* Subcategory & Gender (Clean text with separator, no pills) */}
          <div className="flex items-center gap-1.5 text-xs text-[#718096] uppercase tracking-wider font-medium mb-1">
            <span>{product.subcategory}</span>
            <span aria-hidden="true">·</span>
            <span>{product.fabricType || product.material.split('&')[0].trim()}</span>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => navigateTo('product-detail', { productId: product.id })}
            className="text-sm font-semibold text-[#1A202C] line-clamp-2 hover:text-[#0C2B4E] cursor-pointer transition-colors leading-snug"
            title={product.name}
          >
            {product.name}
          </h3>
        </div>

        {/* Price & Rating Row */}
        <div className="pt-2 border-t border-[#E8E2D9]/70 flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-[#0C2B4E] font-mono tabular-nums">
              {formattedPrice}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-[#A0AEC0] line-through font-mono tabular-nums">
                {formattedOriginalPrice}
              </span>
            )}
          </div>

          {/* Review Stars & Average */}
          <div className="flex items-center gap-1 text-xs text-[#718096]">
            <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
            <span className="font-semibold text-[#2D3748] font-mono tabular-nums">
              {product.rating}
            </span>
            <span className="text-[#A0AEC0]">({product.reviewCount})</span>
          </div>
        </div>

        {/* Mobile View Add to Cart Button */}
        <div className="sm:hidden mt-1">
          <button
            onClick={() => addToCart(product)}
            className="w-full py-2 bg-[#0C2B4E] text-[#FAF8F5] text-xs font-semibold rounded-md flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Add to Bag</span>
          </button>
        </div>
      </div>
    </div>
  );
};
