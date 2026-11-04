import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Trash2, Minus, Plus, ArrowRight, ShieldCheck, Tag, Sparkles } from 'lucide-react';
import { normalizeImageUrl, handleImageError } from '../utils/imageHelper';

export const CartView: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    cartSubtotal,
    deliveryCharge,
    cartDiscount,
    cartTotal,
    freeDeliveryThreshold,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    navigateTo,
  } = useApp();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleApply = (code: string) => {
    setCouponError('');
    const res = applyCoupon(code);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponCode('');
    }
  };

  const amountNeeded = Math.max(0, freeDeliveryThreshold - cartSubtotal);

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#FAF5E8] flex items-center justify-center mx-auto text-[#D4AF37]">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-[#0C2B4E]">Your Sacred Bag is Empty</h2>
        <p className="text-xs text-[#718096] max-w-sm mx-auto">
          Adorn yourself in divine elegance. Discover our handwoven Banarasi sarees, royal sherwanis, and temple jewelry.
        </p>
        <button
          onClick={() => navigateTo('shop')}
          className="px-6 py-3 bg-[#0C2B4E] hover:bg-[#07172C] text-white text-xs font-semibold rounded-md shadow-xs cursor-pointer"
        >
          Explore Divine Collections
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#0C2B4E] mb-8 pb-4 border-b border-[#E8E2D9]">
        Sacred Shopping Bag ({cart.reduce((t, i) => t + i.quantity, 0)} Items)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Cart Items (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item, idx) => {
            const isCustom = item.customization?.isCustomized;
            const unitPrice = item.product.price + (item.customization?.totalFee || 0);
            const itemTotal = unitPrice * item.quantity;

            return (
              <div
                key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${idx}`}
                className="bg-white p-5 rounded-xl border border-[#E8E2D9] flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
              >
                <div className="flex gap-4 items-start w-full sm:w-auto">
                  <img
                    src={normalizeImageUrl(item.product.images[0], item.product.category)}
                    alt={item.product.name}
                    onError={(e) => handleImageError(e, item.product.category)}
                    className="w-20 h-24 sm:w-24 sm:h-28 object-cover rounded-md bg-[#F3EFE9] shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-[#8C7A58] font-bold">
                      {item.product.subcategory}
                    </span>
                    <h3
                      onClick={() => navigateTo('product-detail', { productId: item.product.id })}
                      className="text-sm font-semibold text-[#1A202C] hover:text-[#0C2B4E] cursor-pointer line-clamp-1"
                    >
                      {item.product.name}
                    </h3>
                    <div className="text-xs text-[#718096] flex items-center gap-3">
                      <span>Size: <strong className="text-[#2D3748]">{item.selectedSize}</strong></span>
                      <span>·</span>
                      <span>Color: <strong className="text-[#2D3748]">{item.selectedColor}</strong></span>
                    </div>

                    {isCustom && item.customization && (
                      <div className="mt-1.5 p-2 bg-[#FAF6EE] border border-[#D4AF37]/40 rounded text-xs text-[#0C2B4E] max-w-sm space-y-0.5">
                        <div className="flex items-center justify-between font-semibold text-[11px]">
                          <span className="text-[#8C7A58]">✂ Bespoke Tailoring & Options:</span>
                          <span className="font-mono text-[#0C2B4E]">+₹{item.customization.totalFee}</span>
                        </div>
                        {item.customization.stitchingOption !== 'unstitched' && (
                          <p className="text-[11px] text-[#4A5568]">
                            Style: {item.customization.stitchingOption === 'bespoke_madetomeasure' ? 'Custom Made-to-Measure' : 'Standard Stitched'}
                            {item.customization.necklineStyle && ` (${item.customization.necklineStyle})`}
                          </p>
                        )}
                        {item.customization.monogramText && (
                          <p className="text-[11px] font-mono text-amber-900">
                            Zari Monogram: "{item.customization.monogramText}"
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2 text-[10px] text-emerald-800 pt-0.5">
                          {item.customization.fallPico && <span>✓ Fall & Pico</span>}
                          {item.customization.matchingInskirt && <span>✓ Cotton Inskirt</span>}
                          {item.customization.tasselsLatkans && <span>✓ Zari Latkans</span>}
                        </div>
                        {item.customization.blessingNote && (
                          <p className="text-[10px] text-rose-700 italic">
                            "{item.customization.blessingNote}"
                          </p>
                        )}
                      </div>
                    )}

                    <p className="text-xs font-bold text-[#0C2B4E] font-mono tabular-nums sm:hidden pt-1">
                      ₹{itemTotal.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Quantity Stepper & Subtotal */}
                <div className="flex items-center justify-between w-full sm:w-auto sm:gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#F0EBE1]">
                  <div className="flex items-center border border-[#D9D0C3] rounded-md bg-[#FAF8F5]">
                    <button
                      onClick={() =>
                        updateCartQuantity(item.product.id, item.selectedSize, item.selectedColor, -1, isCustom)
                      }
                      className="p-1.5 text-[#718096] hover:text-[#0C2B4E] cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-mono font-bold text-[#1A202C]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateCartQuantity(item.product.id, item.selectedSize, item.selectedColor, 1, isCustom)
                      }
                      disabled={item.quantity >= item.product.stock}
                      className="p-1.5 text-[#718096] hover:text-[#0C2B4E] disabled:opacity-30 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="hidden sm:block text-right">
                    <span className="text-sm font-black text-[#0C2B4E] font-mono tabular-nums">
                      ₹{itemTotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      removeFromCart(item.product.id, item.selectedSize, item.selectedColor, isCustom)
                    }
                    className="text-[#A0AEC0] hover:text-rose-600 p-1.5 cursor-pointer"
                    title="Remove from bag"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Sidebar (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-[#E8E2D9] space-y-5 shadow-xs">
          <h2 className="font-heading text-lg font-bold text-[#0C2B4E] pb-3 border-b border-[#E8E2D9]">
            Order Summary
          </h2>

          {/* Coupon Code Section */}
          <div>
            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-md text-xs">
                <div className="flex items-center gap-1.5 text-emerald-800">
                  <Tag className="w-4 h-4" />
                  <span>
                    Coupon <strong>{appliedCoupon.code}</strong> applied (-₹
                    {cartDiscount.toLocaleString('en-IN')})
                  </span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Coupon Code"
                    className="flex-1 text-xs px-3 py-2 bg-[#FAF8F5] border border-[#D9D0C3] rounded-md uppercase font-mono tracking-wider focus:outline-hidden focus:border-[#0C2B4E]"
                  />
                  <button
                    onClick={() => handleApply(couponCode)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#0C2B4E] hover:bg-[#07172C] rounded-md transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {couponError && <p className="text-[11px] text-rose-600">{couponError}</p>}
                <div className="flex gap-1.5 text-[10px] text-[#718096]">
                  <span>Try:</span>
                  <button
                    onClick={() => handleApply('VRINDAVAN')}
                    className="underline text-[#0C2B4E] cursor-pointer"
                  >
                    VRINDAVAN (₹500 OFF)
                  </button>
                  <span>·</span>
                  <button
                    onClick={() => handleApply('MUDRA10')}
                    className="underline text-[#0C2B4E] cursor-pointer"
                  >
                    MUDRA10 (10% OFF)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Pricing Math */}
          <div className="space-y-2 text-xs text-[#4A5568] pt-2 border-t border-[#E8E2D9]">
            <div className="flex justify-between">
              <span>Bag Subtotal</span>
              <span className="font-mono tabular-nums text-[#1A202C]">
                ₹{cartSubtotal.toLocaleString('en-IN')}
              </span>
            </div>
            {cartDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Coupon Discount</span>
                <span className="font-mono tabular-nums">-₹{cartDiscount.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Sacred Express Logistics</span>
              <span className="font-mono tabular-nums text-[#1A202C]">
                {deliveryCharge === 0 ? (
                  <span className="text-emerald-700 font-semibold">FREE</span>
                ) : (
                  `₹${deliveryCharge}`
                )}
              </span>
            </div>
            {amountNeeded > 0 && (
              <p className="text-[11px] text-[#8C7A58] italic">
                Add ₹{amountNeeded.toLocaleString('en-IN')} more for free delivery
              </p>
            )}
            <div className="flex justify-between text-base font-bold text-[#0C2B4E] pt-3 border-t border-[#E8E2D9]">
              <span>Grand Total</span>
              <span className="font-mono tabular-nums">₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <button
            onClick={() => navigateTo('checkout')}
            className="w-full py-3 bg-[#0C2B4E] hover:bg-[#07172C] text-[#FAF8F5] text-xs sm:text-sm font-semibold rounded-md shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-[#718096]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Silk Mark Guarantee · Free 7-Day Exchanges</span>
          </div>
        </div>
      </div>
    </div>
  );
};
