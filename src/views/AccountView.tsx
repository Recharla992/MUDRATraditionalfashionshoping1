import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  User,
  Package,
  Heart,
  MapPin,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Truck,
  Sparkles,
} from 'lucide-react';

export const AccountView: React.FC = () => {
  const {
    currentUser,
    logout,
    orders,
    wishlist,
    products,
    navigateTo,
    switchRole,
    setIsAuthModalOpen,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'addresses'>('orders');

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-heading text-2xl font-bold text-[#0C2B4E]">Sign In Required</h2>
        <p className="text-xs text-[#718096]">
          Please sign in to view your orders, saved addresses, and profile.
        </p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="px-6 py-2.5 bg-[#0C2B4E] text-white text-xs font-semibold rounded-md"
        >
          Sign In Now
        </button>
      </div>
    );
  }

  const userOrders = orders.filter((o) => o.customerEmail === currentUser.email || o.userId === currentUser.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Account Header */}
      <div className="bg-white rounded-xl border border-[#E8E2D9] p-6 sm:p-8 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#0C2B4E] border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] text-xl font-bold font-heading">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-xl font-bold text-[#0C2B4E]">{currentUser.name}</h1>
              {currentUser.role === 'admin' && (
                <span className="text-[10px] bg-[#0C2B4E] text-[#D4AF37] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-[#718096]">{currentUser.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentUser.role === 'admin' ? (
            <button
              onClick={() => navigateTo('admin')}
              className="px-4 py-2 bg-[#0C2B4E] hover:bg-[#07172C] text-[#D4AF37] text-xs font-semibold rounded-md border border-[#D4AF37] transition-colors cursor-pointer"
            >
              Open Admin Dashboard
            </button>
          ) : (
            <button
              onClick={() => switchRole('admin')}
              className="px-3 py-1.5 text-xs text-[#0C2B4E] bg-[#FAF5E8] hover:bg-[#EFEAE2] border border-[#D4AF37]/50 rounded-md font-medium cursor-pointer"
            >
              Test Admin Mode
            </button>
          )}

          <button
            onClick={logout}
            className="p-2 text-[#718096] hover:text-rose-600 rounded-md border border-[#D9D0C3] hover:border-rose-300 transition-colors cursor-pointer"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation Sidebar (3 cols) */}
        <aside className="lg:col-span-3 bg-white rounded-xl border border-[#E8E2D9] p-3 space-y-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between p-3 rounded-md transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#0C2B4E] text-[#D4AF37]'
                : 'text-[#4A5568] hover:bg-[#FAF8F5]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span>My Orders</span>
            </span>
            <span className="font-mono text-[11px]">{userOrders.length}</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center justify-between p-3 rounded-md transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#0C2B4E] text-[#D4AF37]'
                : 'text-[#4A5568] hover:bg-[#FAF8F5]'
            }`}
          >
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Personal Profile</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`w-full flex items-center justify-between p-3 rounded-md transition-colors cursor-pointer ${
              activeTab === 'addresses'
                ? 'bg-[#0C2B4E] text-[#D4AF37]'
                : 'text-[#4A5568] hover:bg-[#FAF8F5]'
            }`}
          >
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Saved Addresses</span>
            </span>
            <span className="font-mono text-[11px]">{currentUser.savedAddresses?.length || 0}</span>
          </button>

          <button
            onClick={() => navigateTo('wishlist')}
            className="w-full flex items-center justify-between p-3 rounded-md text-[#4A5568] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#C45B74]" />
              <span>Saved Wishlist</span>
            </span>
            <span className="font-mono text-[11px]">{wishlist.length}</span>
          </button>
        </aside>

        {/* Tab Content (9 cols) */}
        <main className="lg:col-span-9 bg-white rounded-xl border border-[#E8E2D9] p-6 sm:p-8 shadow-xs">
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E8E2D9]">
                <h2 className="font-heading text-lg font-bold text-[#0C2B4E]">Order History</h2>
                <span className="text-xs text-[#718096] font-mono">{userOrders.length} orders found</span>
              </div>

              {userOrders.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <p className="text-xs text-[#718096]">You haven't placed any orders yet.</p>
                  <button
                    onClick={() => navigateTo('shop')}
                    className="px-5 py-2 bg-[#0C2B4E] text-white text-xs font-semibold rounded-md"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {userOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="border border-[#E8E2D9] rounded-lg p-5 space-y-4 bg-[#FAF8F5]"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E8E2D9] text-xs">
                        <div>
                          <span className="font-bold text-[#0C2B4E] font-mono">
                            {ord.orderNumber}
                          </span>
                          <span className="text-[#A0AEC0] ml-2">
                            {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="bg-[#FAF5E8] text-[#0C2B4E] border border-[#D4AF37]/50 px-2 py-0.5 rounded font-semibold text-[11px]">
                            {ord.status}
                          </span>
                          <button
                            onClick={() => navigateTo('tracking', { orderId: ord.orderNumber })}
                            className="px-3 py-1 bg-[#0C2B4E] text-[#D4AF37] rounded text-xs font-semibold hover:bg-[#07172C] flex items-center gap-1 cursor-pointer"
                          >
                            <Truck className="w-3 h-3" />
                            <span>Track</span>
                          </button>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-3">
                        {ord.items.map((item, idx) => {
                          const isCustom = item.customization?.isCustomized;
                          const unitPrice = item.product.price + (item.customization?.totalFee || 0);
                          const itemTotal = unitPrice * item.quantity;

                          return (
                            <div
                              key={`${item.product.id}-${idx}`}
                              className="flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.product.images[0]}
                                  alt={item.product.name}
                                  className="w-12 h-14 object-cover rounded bg-[#F3EFE9] shrink-0"
                                />
                                <div>
                                  <h4
                                    onClick={() =>
                                      navigateTo('product-detail', { productId: item.product.id })
                                    }
                                    className="font-semibold text-[#1A202C] hover:text-[#0C2B4E] cursor-pointer"
                                  >
                                    {item.product.name}
                                  </h4>
                                  <p className="text-[11px] text-[#718096]">
                                    Qty: {item.quantity} · Size: {item.selectedSize} · Color: {item.selectedColor}
                                  </p>
                                  {isCustom && item.customization && (
                                    <p className="text-[10px] text-[#8C7A58] font-medium">
                                      ✂ Customized: {item.customization.stitchingOption !== 'unstitched' ? 'Tailored' : 'Standard'}
                                      {item.customization.monogramText && ` · Monogram: "${item.customization.monogramText}"`}
                                    </p>
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

                      <div className="pt-3 border-t border-[#E8E2D9] flex justify-between items-center text-xs">
                        <span className="text-[#718096]">Payment: <strong className="uppercase text-[#2D3748]">{ord.paymentMethod}</strong></span>
                        <span className="text-sm font-bold text-[#0C2B4E] font-mono">
                          Total: ₹{ord.total.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-lg text-xs">
              <h2 className="font-heading text-lg font-bold text-[#0C2B4E] pb-3 border-b border-[#E8E2D9]">
                Personal Profile
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block font-semibold text-[#2D3748] mb-1">Full Name</label>
                  <input
                    type="text"
                    defaultValue={currentUser.name}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9D0C3] rounded-md text-[#1A202C]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2D3748] mb-1">Email Address</label>
                  <input
                    type="email"
                    disabled
                    defaultValue={currentUser.email}
                    className="w-full px-3 py-2 bg-[#F3EFE9] border border-[#D9D0C3] rounded-md text-[#718096]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2D3748] mb-1">Mobile Contact</label>
                  <input
                    type="tel"
                    defaultValue={currentUser.phone || '+91 98765 43210'}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9D0C3] rounded-md text-[#1A202C]"
                  />
                </div>
                <button
                  type="button"
                  className="px-5 py-2.5 bg-[#0C2B4E] text-white font-semibold rounded-md"
                >
                  Save Profile Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="space-y-6 text-xs">
              <h2 className="font-heading text-lg font-bold text-[#0C2B4E] pb-3 border-b border-[#E8E2D9]">
                Saved Delivery Addresses
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentUser.savedAddresses?.map((addr, idx) => (
                  <div
                    key={idx}
                    className="p-4 border border-[#E8E2D9] rounded-lg bg-[#FAF8F5] space-y-1 relative"
                  >
                    <span className="text-[10px] uppercase font-bold text-[#8C7A58]">
                      Default Address
                    </span>
                    <p className="font-bold text-[#1A202C] text-sm">{addr.fullName}</p>
                    <p className="text-[#4A5568]">{addr.street}</p>
                    <p className="text-[#4A5568]">
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="text-[#718096] pt-1 font-mono">{addr.phone}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
