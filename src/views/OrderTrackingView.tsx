import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  ShieldCheck,
  MapPin,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export const OrderTrackingView: React.FC = () => {
  const { orders, trackingOrderId, setTrackingOrderId, getOrderById } = useApp();
  const [searchInput, setSearchInput] = useState(trackingOrderId || 'MUDRA-2026-8942');
  const [searchedOrder, setSearchedOrder] = useState(() =>
    getOrderById(trackingOrderId || 'MUDRA-2026-8942') || orders[0]
  );
  const [notFound, setNotFound] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    const found = getOrderById(searchInput);
    if (found) {
      setSearchedOrder(found);
      setTrackingOrderId(found.orderNumber);
      setNotFound(false);
    } else {
      // Also try to find by phone or email
      const altFound = orders.find(
        (o) =>
          o.customerEmail.toLowerCase() === searchInput.trim().toLowerCase() ||
          o.customerPhone.includes(searchInput.trim())
      );
      if (altFound) {
        setSearchedOrder(altFound);
        setTrackingOrderId(altFound.orderNumber);
        setNotFound(false);
      } else {
        setNotFound(true);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Title */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <p className="text-xs uppercase font-semibold tracking-widest text-[#8C7A58] mb-1">
          Real-Time Consignment Tracker
        </p>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#0C2B4E]">
          Sacred Order Journey
        </h1>
        <p className="text-xs text-[#718096] mt-1">
          Follow your handwoven ensemble from Vrindavan & Kanchipuram loom to your sanctum.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mt-6 flex gap-2 max-w-md mx-auto">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8C7A58] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Enter Order ID (e.g. MUDRA-2026-8942) or Email"
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#D9D0C3] rounded-md font-mono focus:outline-hidden focus:border-[#0C2B4E]"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold text-white bg-[#0C2B4E] hover:bg-[#07172C] rounded-md transition-colors cursor-pointer"
          >
            Track
          </button>
        </form>

        {notFound && (
          <div className="mt-3 p-3 bg-rose-50 text-rose-700 text-xs rounded-md border border-rose-200 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>No order located for "{searchInput}". Please verify your order number.</span>
          </div>
        )}
      </div>

      {searchedOrder && (
        <div className="space-y-8">
          {/* Status Header Card */}
          <div className="bg-white rounded-xl border border-[#E8E2D9] p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E2D9]">
              <div>
                <span className="text-xs uppercase font-semibold text-[#8C7A58] tracking-wider">
                  Consignment #{searchedOrder.orderNumber}
                </span>
                <h2 className="font-heading text-xl font-bold text-[#0C2B4E] mt-0.5">
                  Current Status: <span className="text-[#D4AF37]">{searchedOrder.status}</span>
                </h2>
                <p className="text-xs text-[#718096] mt-0.5">
                  Carrier: <strong className="text-[#1A202C]">{searchedOrder.carrier}</strong> · Tracking ID: <strong className="font-mono text-[#0C2B4E]">{searchedOrder.trackingNumber}</strong>
                </p>
              </div>

              <div className="text-left sm:text-right bg-[#FAF5E8] p-3 rounded-lg border border-[#D4AF37]/30 text-xs">
                <span className="text-[#8C7A58] block">Expected Arrival</span>
                <span className="text-sm font-bold text-[#0C2B4E] font-mono">
                  {searchedOrder.expectedDelivery}
                </span>
              </div>
            </div>

            {/* Visual Step-by-Step Timeline */}
            <div className="py-8">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#0C2B4E] mb-6">
                Milestone Progress
              </h3>

              <div className="relative pl-6 sm:pl-8 space-y-8 border-l-2 border-[#E8E2D9] ml-3">
                {searchedOrder.timeline.map((step, idx) => {
                  const isDone = step.completed;
                  const isCurrent = step.current;

                  return (
                    <div key={step.status} className="relative group">
                      {/* Milestone Node */}
                      <div
                        className={`absolute -left-[31px] sm:-left-[39px] top-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-[#0C2B4E] border-[#D4AF37] text-[#D4AF37]'
                            : isCurrent
                            ? 'bg-[#D4AF37] border-[#0C2B4E] text-[#0C2B4E] animate-pulse'
                            : 'bg-white border-[#D9D0C3] text-transparent'
                        }`}
                      >
                        {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {isCurrent && <span className="w-2 h-2 rounded-full bg-[#0C2B4E]" />}
                      </div>

                      {/* Content */}
                      <div className="space-y-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs">
                          <span
                            className={`font-semibold text-sm ${
                              isDone || isCurrent ? 'text-[#0C2B4E]' : 'text-[#A0AEC0]'
                            }`}
                          >
                            {step.status}
                          </span>
                          <span className="text-[11px] text-[#8C7A58] font-mono">
                            {step.date}
                          </span>
                        </div>
                        <p className="text-xs text-[#718096] max-w-xl">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Inclusions & Shipping Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[#E8E2D9] text-xs">
              <div>
                <h4 className="font-semibold text-[#0C2B4E] uppercase tracking-wider mb-2">
                  Destination Address
                </h4>
                <div className="bg-[#FAF8F5] p-3.5 rounded-lg text-[#4A5568] space-y-0.5">
                  <p className="font-bold text-[#1A202C]">{searchedOrder.shippingAddress.fullName}</p>
                  <p>{searchedOrder.shippingAddress.street}</p>
                  <p>
                    {searchedOrder.shippingAddress.city}, {searchedOrder.shippingAddress.state} -{' '}
                    {searchedOrder.shippingAddress.pincode}
                  </p>
                  <p>Phone: {searchedOrder.shippingAddress.phone}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-[#0C2B4E] uppercase tracking-wider mb-2">
                  Consignment Items ({searchedOrder.items.length})
                </h4>
                <div className="space-y-2">
                  {searchedOrder.items.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-center justify-between bg-[#FAF8F5] p-2.5 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-10 h-12 object-cover rounded bg-[#F3EFE9]"
                        />
                        <div>
                          <p className="font-semibold text-[#1A202C] line-clamp-1">
                            {item.product.name}
                          </p>
                          <p className="text-[10px] text-[#718096]">
                            Qty: {item.quantity} · {item.selectedSize}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-[#0C2B4E]">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
