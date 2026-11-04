import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, Package, Truck, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const OrderConfirmationView: React.FC = () => {
  const { orderForConfirmation, navigateTo } = useApp();

  if (!orderForConfirmation) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-heading text-2xl font-bold text-[#0C2B4E]">Order Placed</h2>
        <p className="text-xs text-[#718096]">
          View your order progress or search with your tracking code.
        </p>
        <button
          onClick={() => navigateTo('tracking')}
          className="px-6 py-2.5 bg-[#0C2B4E] text-white text-xs font-semibold rounded-md"
        >
          Track An Order
        </button>
      </div>
    );
  }

  const order = orderForConfirmation;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Celebration Header */}
      <div className="text-center space-y-3 mb-10">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C7A58] uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Order Confirmed with Divine Grace</span>
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#0C2B4E]">
          Thank You, {order.customerName}
        </h1>
        <p className="text-xs sm:text-sm text-[#718096] max-w-md mx-auto">
          Your order has been consecrated and sent to our master weavers and artisans. A confirmation dispatch note was sent to <strong>{order.customerEmail}</strong>.
        </p>
      </div>

      {/* Main Order Card */}
      <div className="bg-white rounded-xl border border-[#E8E2D9] overflow-hidden shadow-xs space-y-6 p-6 sm:p-8">
        {/* Order Identifier & Tracking Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#FAF5E8] rounded-lg border border-[#D4AF37]/30 text-xs">
          <div>
            <span className="text-[#8C7A58] block">Order Number</span>
            <span className="text-base font-bold font-mono text-[#0C2B4E]">{order.orderNumber}</span>
          </div>
          <div>
            <span className="text-[#8C7A58] block">Estimated Delivery</span>
            <span className="font-semibold text-[#1A202C]">{order.expectedDelivery}</span>
          </div>
          <div>
            <span className="text-[#8C7A58] block">Tracking Code</span>
            <span className="font-mono font-semibold text-[#0C2B4E]">{order.trackingNumber}</span>
          </div>
          <button
            onClick={() => navigateTo('tracking', { orderId: order.orderNumber })}
            className="px-4 py-2 bg-[#0C2B4E] hover:bg-[#07172C] text-[#F3E8CE] text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-center"
          >
            <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Track Order</span>
          </button>
        </div>

        {/* Products Purchased */}
        <div>
          <h3 className="font-heading text-sm font-bold text-[#0C2B4E] mb-3 pb-2 border-b border-[#E8E2D9]">
            Purchased Creations ({order.items.length})
          </h3>
          <div className="divide-y divide-[#F0EBE1]">
            {order.items.map((item, idx) => {
              const isCustom = item.customization?.isCustomized;
              const unitPrice = item.product.price + (item.customization?.totalFee || 0);
              const itemTotal = unitPrice * item.quantity;

              return (
                <div
                  key={`${item.product.id}-${item.selectedSize}-${idx}`}
                  className="py-3 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-14 h-16 object-cover rounded bg-[#F3EFE9] shrink-0"
                    />
                    <div>
                      <h4 className="font-semibold text-[#1A202C] line-clamp-1">{item.product.name}</h4>
                      <p className="text-[11px] text-[#718096]">
                        Qty: {item.quantity} · Size: {item.selectedSize} · Color: {item.selectedColor}
                      </p>
                      {isCustom && item.customization && (
                        <div className="mt-1 text-[10px] text-[#8C7A58] bg-[#FAF6EE] px-2 py-0.5 rounded border border-[#D4AF37]/30">
                          ✂ Custom Tailoring: {item.customization.stitchingOption !== 'unstitched' ? (item.customization.stitchingOption === 'bespoke_madetomeasure' ? 'Bespoke Fit' : 'Stitched') : 'Unstitched'}
                          {item.customization.monogramText && ` · Monogram: "${item.customization.monogramText}"`}
                          {item.customization.fallPico && ' · Fall & Pico'}
                          <span className="font-mono text-[#0C2B4E] font-bold ml-1">(+₹{item.customization.totalFee})</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="font-mono font-bold text-[#0C2B4E]">
                    ₹{itemTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Address and Payment Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#E8E2D9] text-xs">
          <div>
            <h4 className="font-semibold text-[#0C2B4E] uppercase tracking-wider mb-2">
              Shipping Address
            </h4>
            <div className="text-[#4A5568] space-y-0.5 leading-relaxed bg-[#FAF8F5] p-3 rounded-md">
              <p className="font-bold text-[#1A202C]">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street}</p>
              {order.shippingAddress.landmark && <p>Landmark: {order.shippingAddress.landmark}</p>}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                {order.shippingAddress.pincode}
              </p>
              <p>Contact: {order.shippingAddress.phone}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-[#0C2B4E] uppercase tracking-wider mb-2">
              Payment Summary
            </h4>
            <div className="bg-[#FAF8F5] p-3 rounded-md space-y-1.5 text-[#4A5568]">
              <div className="flex justify-between">
                <span>Method</span>
                <span className="font-semibold uppercase text-[#0C2B4E]">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Status</span>
                <span className="text-emerald-700 font-semibold">{order.paymentStatus}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Coupon Savings</span>
                  <span className="font-mono">-₹{order.discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-[#0C2B4E] pt-2 border-t border-[#E8E2D9]">
                <span>Total Amount Paid</span>
                <span className="font-mono">₹{order.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 text-center flex items-center justify-center gap-4">
        <button
          onClick={() => navigateTo('shop')}
          className="px-6 py-2.5 bg-[#0C2B4E] hover:bg-[#07172C] text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer"
        >
          Continue Shopping
        </button>
        <button
          onClick={() => navigateTo('account')}
          className="px-6 py-2.5 bg-white border border-[#D9D0C3] hover:border-[#0C2B4E] text-[#0C2B4E] text-xs font-semibold rounded-md transition-colors cursor-pointer"
        >
          View My Orders
        </button>
      </div>
    </div>
  );
};
