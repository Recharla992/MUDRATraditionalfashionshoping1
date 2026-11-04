import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Trash2, Plus, Minus, ArrowRight, Tag, ShieldCheck, Sparkles } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
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

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!isCartDrawerOpen) return null;

  const handleApplyCoupon = (code: string) => {
    setCouponError('');
    const res = applyCoupon(code);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
    }
  };

  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - cartSubtotal);
  const freeDeliveryProgress = Math.min(100, Math.round((cartSubtotal / freeDeliveryThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#07172C]/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] border-l border-[#E8E2D9] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#E8E2D9] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2">
              <span className="font-heading text-lg font-bold text-[#0C2B4E]">
                Sacred Shopping Bag
              </span>
              <span className="text-xs text-[#718096] font-mono">
                ({cart.reduce((t, i) => t + i.quantity, 0)} items)
              </span>
            </div>
            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1.5 text-[#718096] hover:text-[#0C2B4E] rounded-md hover:bg-[#EFEAE2] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Meter */}
          <div className="bg-[#FAF5E8] px-5 py-3 border-b border-[#E8E2D9] text-xs">
            {amountNeededForFreeDelivery > 0 ? (
              <p className="text-[#8C7A58] mb-1.5">
                Add <strong className="text-[#0C2B4E] font-mono">₹{amountNeededForFreeDelivery.toLocaleString('en-IN')}</strong> more for <strong className="text-[#0C2B4E]">Complimentary Sacred Delivery</strong>
              </p>
            ) : (
              <p className="text-emerald-700 font-semibold mb-1.5 flex items-center gap-1.5">
                <span>✦</span> You have unlocked Complimentary Sacred Delivery!
              </p>
            )}
            <div className="w-full bg-[#E8E2D9] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#D4AF37] to-[#0C2B4E] h-full transition-all duration-300"
                style={{ width: `${freeDeliveryProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#EFEAE2] flex items-center justify-center text-[#8C7A58]">
                  <Sparkles className="w-8 h-8 text-[#D4AF37]" />
                </div>
                <h4 className="font-heading text-base font-semibold text-[#1E252B]">
                  Your sacred bag is empty
                </h4>
                <p className="text-xs text-[#718096] max-w-xs">
                  Explore our handcrafted Kanchipuram silks, raw silk sherwanis, and temple jewelry.
                </p>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    navigateTo('shop');
                  }}
                  className="mt-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#0C2B4E] hover:bg-[#07172C] rounded-md transition-colors cursor-pointer"
                >
                  Explore Collections
                </button>
              </div>
            ) : (
              cart.map((item, idx) => {
                const isCustom = item.customization?.isCustomized;
                const unitPrice = item.product.price + (item.customization?.totalFee || 0);
                const itemTotal = unitPrice * item.quantity;

                return (
                  <div
                    key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}-${idx}`}
                    className="flex gap-3 bg-white p-3 rounded-lg border border-[#E8E2D9] relative"
                  >
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-20 h-24 object-cover object-top rounded-md bg-[#F3EFE9]"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-semibold text-[#1A202C] line-clamp-2 leading-tight">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() =>
                              removeFromCart(item.product.id, item.selectedSize, item.selectedColor, isCustom)
                            }
                            className="text-[#A0AEC0] hover:text-rose-600 transition-colors p-1 cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="mt-1 text-[11px] text-[#718096] space-y-0.5">
                          <p>Size: <span className="text-[#2D3748] font-medium">{item.selectedSize}</span></p>
                          <p>Color: <span className="text-[#2D3748] font-medium">{item.selectedColor}</span></p>
                        </div>

                        {/* Customization Details */}
                        {isCustom && item.customization && (
                          <div className="mt-1.5 p-1.5 bg-[#FAF6EE] border border-[#D4AF37]/40 rounded text-[10px] text-[#0C2B4E] space-y-0.5">
                            <div className="flex items-center justify-between font-semibold">
                              <span className="flex items-center gap-1 text-[#8C7A58]">
                                ✂ Custom Atelier
                              </span>
                              <span className="font-mono text-[#0C2B4E]">
                                +₹{item.customization.totalFee}
                              </span>
                            </div>
                            {item.customization.stitchingOption !== 'unstitched' && (
                              <p className="text-[#4A5568]">
                                Fit: {item.customization.stitchingOption === 'bespoke_madetomeasure' ? 'Bespoke Fit' : 'Stitched'}
                              </p>
                            )}
                            {item.customization.monogramText && (
                              <p className="font-mono text-amber-900">
                                Monogram: "{item.customization.monogramText}"
                              </p>
                            )}
                            {item.customization.fallPico && (
                              <p className="text-emerald-700">✓ Fall & Pico attached</p>
                            )}
                            {item.customization.matchingInskirt && (
                              <p className="text-emerald-700">✓ Cotton Inskirt included</p>
                            )}
                            {item.customization.tasselsLatkans && (
                              <p className="text-purple-700">✓ Zari Latkans</p>
                            )}
                            {item.customization.blessingNote && (
                              <p className="text-rose-700 truncate">
                                💌 "{item.customization.blessingNote}"
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F0EBE1]">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-[#D9D0C3] rounded-md bg-[#FAF8F5]">
                          <button
                            onClick={() =>
                              updateCartQuantity(item.product.id, item.selectedSize, item.selectedColor, -1, isCustom)
                            }
                            className="p-1 text-[#718096] hover:text-[#0C2B4E] cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-mono font-semibold text-[#1A202C]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateCartQuantity(item.product.id, item.selectedSize, item.selectedColor, 1, isCustom)
                            }
                            disabled={item.quantity >= item.product.stock}
                            className="p-1 text-[#718096] hover:text-[#0C2B4E] disabled:opacity-30 cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-[#0C2B4E] font-mono tabular-nums">
                            ₹{itemTotal.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Calculations */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#E8E2D9] bg-white space-y-4">
              {/* Coupon Application */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-md text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-800">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Coupon <strong>{appliedCoupon.code}</strong> applied (-₹{cartDiscount.toLocaleString('en-IN')})</span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs text-rose-600 hover:underline font-medium cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Enter coupon (e.g. VRINDAVAN)"
                        className="flex-1 text-xs px-3 py-2 bg-[#FAF8F5] border border-[#D9D0C3] rounded-md uppercase font-mono tracking-wider focus:outline-hidden focus:border-[#0C2B4E]"
                      />
                      <button
                        onClick={() => handleApplyCoupon(couponInput)}
                        className="px-4 py-2 text-xs font-semibold text-white bg-[#0C2B4E] hover:bg-[#07172C] rounded-md transition-colors cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-[11px] text-rose-600 mt-1">{couponError}</p>
                    )}
                    {/* Fast Coupon Suggestions */}
                    <div className="flex items-center gap-1.5 mt-2 overflow-x-auto text-[10px]">
                      <span className="text-[#8C7A58]">Quick:</span>
                      <button
                        onClick={() => handleApplyCoupon('VRINDAVAN')}
                        className="px-2 py-0.5 bg-[#F3EFE9] hover:bg-[#EAE2D5] text-[#0C2B4E] rounded border border-[#D9D0C3] font-mono cursor-pointer"
                      >
                        VRINDAVAN (₹500 OFF)
                      </button>
                      <button
                        onClick={() => handleApplyCoupon('MUDRA10')}
                        className="px-2 py-0.5 bg-[#F3EFE9] hover:bg-[#EAE2D5] text-[#0C2B4E] rounded border border-[#D9D0C3] font-mono cursor-pointer"
                      >
                        MUDRA10 (10% OFF)
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-[#4A5568] pt-2 border-t border-[#E8E2D9]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums text-[#1A202C]">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>
                {cartDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Coupon Discount</span>
                    <span className="font-mono tabular-nums">-₹{cartDiscount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="font-mono tabular-nums text-[#1A202C]">
                    {deliveryCharge === 0 ? (
                      <span className="text-emerald-700 font-semibold">FREE</span>
                    ) : (
                      `₹${deliveryCharge}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#0C2B4E] pt-2 border-t border-[#E8E2D9]">
                  <span>Total Amount</span>
                  <span className="font-mono tabular-nums">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    navigateTo('checkout');
                  }}
                  className="w-full py-3 bg-[#0C2B4E] hover:bg-[#07172C] text-[#FAF8F5] text-xs sm:text-sm font-semibold rounded-md shadow-md flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Proceed to Sacred Checkout</span>
                  <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
                </button>
                <button
                  onClick={() => {
                    setIsCartDrawerOpen(false);
                    navigateTo('cart');
                  }}
                  className="w-full py-2 bg-[#F3EFE9] hover:bg-[#EAE2D5] text-[#0C2B4E] text-xs font-medium rounded-md transition-colors cursor-pointer text-center block"
                >
                  View Full Cart & Items
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-[#718096]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>100% Genuine Handlooms · Secure UPI & Card Checkout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
