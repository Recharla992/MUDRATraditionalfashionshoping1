import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product, OrderStatus, Coupon, ProductCategory } from '../types';
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Users,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  Truck,
  Tag,
  Star,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Search,
  Filter,
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    orders,
    updateOrderStatus,
    categories,
    addCategory,
    coupons,
    addCoupon,
    toggleCoupon,
    reviews,
    switchRole,
    navigateTo,
    showToast,
  } = useApp();

  // Navigation tab inside admin
  const [activeAdminTab, setActiveAdminTab] = useState<
    'analytics' | 'products' | 'orders' | 'categories' | 'coupons' | 'reviews'
  >('analytics');

  // Product Manager state
  const [productSearch, setProductSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New Product Form state
  const [newProdName, setNewProdName] = useState('');
  const [newProdSku, setNewProdSku] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<ProductCategory>('women');
  const [newProdSubcategory, setNewProdSubcategory] = useState('Silk Sarees');
  const [newProdPrice, setNewProdPrice] = useState(4999);
  const [newProdOriginalPrice, setNewProdOriginalPrice] = useState(6999);
  const [newProdStock, setNewProdStock] = useState(15);
  const [newProdMaterial, setNewProdMaterial] = useState('100% Pure Mulberry Silk');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdImage, setNewProdImage] = useState('/src/assets/images/mudra_women_kanchipuram_saree_1793641347386.jpg');

  // New Category Form state
  const [newCatName, setNewCatName] = useState('');
  const [newCatId, setNewCatId] = useState<ProductCategory>('women');
  const [newCatDesc, setNewCatDesc] = useState('');

  // New Coupon Form state
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState(10);
  const [newCouponMin, setNewCouponMin] = useState(1999);

  // Analytics Math
  const totalRevenue = orders.reduce((sum, ord) => sum + ord.total, 0);
  const totalOrdersCount = orders.length;
  const totalProductsCount = products.length;
  const lowStockCount = products.filter((p) => p.stock < 10).length;
  const totalPatrons = 482 + orders.length;

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName) return;

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name: newProdName,
        sku: newProdSku || editingProduct.sku,
        category: newProdCategory,
        subcategory: newProdSubcategory,
        price: Number(newProdPrice),
        originalPrice: Number(newProdOriginalPrice),
        discountPercentage: Math.max(
          0,
          Math.round(((newProdOriginalPrice - newProdPrice) / newProdOriginalPrice) * 100)
        ),
        stock: Number(newProdStock),
        material: newProdMaterial,
        description: newProdDesc,
        images: [newProdImage],
      });
      setEditingProduct(null);
    } else {
      addProduct({
        name: newProdName,
        sku: newProdSku || `MUD-${Math.floor(1000 + Math.random() * 9000)}`,
        category: newProdCategory,
        subcategory: newProdSubcategory,
        gender: newProdCategory === 'men' ? 'men' : 'women',
        price: Number(newProdPrice),
        originalPrice: Number(newProdOriginalPrice),
        discountPercentage: Math.max(
          0,
          Math.round(((newProdOriginalPrice - newProdPrice) / newProdOriginalPrice) * 100)
        ),
        stock: Number(newProdStock),
        material: newProdMaterial,
        fabricDetails: 'Pure Handcrafted Masterpiece',
        specifications: { Weave: 'Handloom Authenticated' },
        description: newProdDesc || 'Authentic traditional Indian ensemble.',
        images: [newProdImage],
        availableSizes: ['Free Size'],
        availableColors: [{ name: 'Royal Gold', hex: '#D4AF37' }],
        isFeatured: true,
      });
    }

    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditClick = (p: Product) => {
    setEditingProduct(p);
    setNewProdName(p.name);
    setNewProdSku(p.sku);
    setNewProdCategory(p.category);
    setNewProdSubcategory(p.subcategory);
    setNewProdPrice(p.price);
    setNewProdOriginalPrice(p.originalPrice);
    setNewProdStock(p.stock);
    setNewProdMaterial(p.material);
    setNewProdDesc(p.description);
    setNewProdImage(p.images[0] || '');
    setIsAddModalOpen(true);
  };

  const resetForm = () => {
    setNewProdName('');
    setNewProdSku('');
    setNewProdPrice(4999);
    setNewProdOriginalPrice(6999);
    setNewProdStock(15);
    setNewProdDesc('');
    setEditingProduct(null);
  };

  const handleAddCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode) return;
    addCoupon({
      code: newCouponCode.toUpperCase().trim(),
      discountPercentage: newCouponDiscount,
      minOrderValue: newCouponMin,
      description: `${newCouponDiscount}% off on orders above ₹${newCouponMin}`,
      isActive: true,
    });
    setNewCouponCode('');
  };

  const filteredAdminProducts = products.filter((p) => {
    if (!productSearch) return true;
    const q = productSearch.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.subcategory.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Admin Header */}
      <div className="bg-[#07172C] text-white rounded-xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#D4AF37]/30 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4AF37] bg-[#0C2B4E] px-2 py-0.5 rounded border border-[#D4AF37]/40">
              MUDRA Command Atelier
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold mt-1">
            Curator & Merchant Console
          </h1>
          <p className="text-xs text-[#D9D0C3] mt-0.5">
            Real-time management of handloom inventories, orders, pricing, and master artisans.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => switchRole('customer')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-md text-xs font-semibold transition-colors cursor-pointer"
          >
            Switch to Customer View
          </button>
          <button
            onClick={() => navigateTo('home')}
            className="px-4 py-2 bg-[#D4AF37] hover:bg-[#C59B27] text-[#07172C] rounded-md text-xs font-bold transition-colors cursor-pointer"
          >
            View Live Store
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex border-b border-[#E8E2D9] mb-8 overflow-x-auto text-xs font-semibold gap-1 pb-1">
        {[
          { id: 'analytics', label: 'Analytics & KPIs', icon: TrendingUp },
          { id: 'products', label: 'Product Catalog', icon: Package },
          { id: 'orders', label: 'Customer Orders', icon: ShoppingBag },
          { id: 'categories', label: 'Collections & Taxonomies', icon: Layers },
          { id: 'coupons', label: 'Coupons & Promos', icon: Tag },
          { id: 'reviews', label: 'Customer Reviews', icon: Star },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeAdminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAdminTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#0C2B4E] text-[#D4AF37] shadow-xs'
                  : 'text-[#4A5568] hover:bg-[#FAF8F5] hover:text-[#0C2B4E]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Analytics & KPIs */}
      {activeAdminTab === 'analytics' && (
        <div className="space-y-8">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            <div className="bg-white p-5 rounded-xl border border-[#E8E2D9] shadow-xs">
              <span className="text-xs text-[#718096] font-medium">Total Revenue</span>
              <p className="text-2xl font-black text-[#0C2B4E] font-mono mt-1">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </p>
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-0.5 mt-2">
                <ArrowUpRight className="w-3.5 h-3.5" /> +18.4% this month
              </span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E8E2D9] shadow-xs">
              <span className="text-xs text-[#718096] font-medium">Total Orders</span>
              <p className="text-2xl font-black text-[#0C2B4E] font-mono mt-1">
                {totalOrdersCount}
              </p>
              <span className="text-[11px] text-[#8C7A58] mt-2 block">100% fulfilled via express</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E8E2D9] shadow-xs">
              <span className="text-xs text-[#718096] font-medium">Registered Patrons</span>
              <p className="text-2xl font-black text-[#0C2B4E] font-mono mt-1">
                {totalPatrons}
              </p>
              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-0.5 mt-2">
                <ArrowUpRight className="w-3.5 h-3.5" /> 84% repeat rate
              </span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E8E2D9] shadow-xs">
              <span className="text-xs text-[#718096] font-medium">Active Handloom SKUs</span>
              <p className="text-2xl font-black text-[#0C2B4E] font-mono mt-1">
                {totalProductsCount}
              </p>
              <span className="text-[11px] text-[#718096] mt-2 block">Across 4 major domains</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#E8E2D9] shadow-xs">
              <span className="text-xs text-[#718096] font-medium">Low Stock Alerts</span>
              <p className="text-2xl font-black text-rose-600 font-mono mt-1">
                {lowStockCount}
              </p>
              <span className="text-[11px] text-rose-600 font-medium flex items-center gap-1 mt-2">
                <AlertTriangle className="w-3.5 h-3.5" /> Reorder from master weavers
              </span>
            </div>
          </div>

          {/* Simulated Sales Revenue Trend Bar Chart */}
          <div className="bg-white p-6 sm:p-8 rounded-xl border border-[#E8E2D9] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-lg font-bold text-[#0C2B4E]">
                  Monthly Sales Volume (INR ₹)
                </h3>
                <p className="text-xs text-[#718096]">
                  Sales distribution across Varanasi, Kanchipuram, and South Indian jewel ateliers
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#0C2B4E] bg-[#FAF5E8] px-3 py-1 rounded border border-[#D4AF37]/40">
                FY 2026 Live
              </span>
            </div>

            <div className="grid grid-cols-6 gap-3 items-end h-44 pt-6 px-2">
              {[
                { month: 'Oct 2025', val: 45, label: '₹4.5L' },
                { month: 'Nov 2025 (Diwali)', val: 95, label: '₹9.5L' },
                { month: 'Dec 2025 (Weddings)', val: 85, label: '₹8.5L' },
                { month: 'Jan 2026', val: 65, label: '₹6.5L' },
                { month: 'Feb 2026', val: 78, label: '₹7.8L' },
                { month: 'Mar 2026 (Holi/Current)', val: 92, label: '₹9.2L' },
              ].map((item) => (
                <div key={item.month} className="flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-mono text-[#0C2B4E] font-semibold">
                    {item.label}
                  </span>
                  <div
                    className="w-full bg-gradient-to-t from-[#0C2B4E] to-[#D4AF37] rounded-t-md transition-all duration-500 hover:opacity-90"
                    style={{ height: `${item.val}%` }}
                  />
                  <span className="text-[10px] text-[#718096] text-center truncate max-w-full">
                    {item.month}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div className="bg-white p-6 rounded-xl border border-[#E8E2D9] shadow-xs space-y-4">
            <h3 className="font-heading text-base font-bold text-[#0C2B4E]">
              Recent Consignment Orders
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5] text-[#718096] uppercase font-semibold border-b border-[#E8E2D9]">
                  <tr>
                    <th className="py-2.5 px-4">Order ID</th>
                    <th className="py-2.5 px-4">Patron</th>
                    <th className="py-2.5 px-4">Items</th>
                    <th className="py-2.5 px-4">Amount</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E2D9]">
                  {orders.slice(0, 5).map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#FAF8F5]">
                      <td className="py-3 px-4 font-mono font-bold text-[#0C2B4E]">
                        {ord.orderNumber}
                      </td>
                      <td className="py-3 px-4 text-[#1A202C]">
                        {ord.customerName}
                        <span className="block text-[10px] text-[#718096]">{ord.customerEmail}</span>
                      </td>
                      <td className="py-3 px-4">{ord.items.length} items</td>
                      <td className="py-3 px-4 font-mono font-bold">
                        ₹{ord.total.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FAF5E8] text-[#0C2B4E] border border-[#D4AF37]/40">
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Product Catalog Management */}
      {activeAdminTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#8C7A58] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products by SKU, name, or subcategory..."
                className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-[#D9D0C3] rounded-md focus:outline-hidden focus:border-[#0C2B4E]"
              />
            </div>

            <button
              onClick={() => {
                resetForm();
                setIsAddModalOpen(true);
              }}
              className="px-4 py-2 bg-[#0C2B4E] hover:bg-[#07172C] text-[#F3E8CE] text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#D4AF37]" />
              <span>Add New Creation</span>
            </button>
          </div>

          {/* Product Table */}
          <div className="bg-white rounded-xl border border-[#E8E2D9] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5] text-[#718096] uppercase font-semibold border-b border-[#E8E2D9]">
                  <tr>
                    <th className="py-3 px-4">Product / SKU</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E2D9]">
                  {filteredAdminProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FAF8F5]">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images[0]}
                            alt=""
                            className="w-10 h-12 object-cover rounded bg-[#F3EFE9]"
                          />
                          <div>
                            <p className="font-semibold text-[#1A202C] line-clamp-1">{p.name}</p>
                            <p className="text-[10px] text-[#8C7A58] font-mono">{p.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium capitalize text-[#2D3748]">{p.category}</span>
                        <span className="block text-[10px] text-[#718096]">{p.subcategory}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-[#0C2B4E]">
                          ₹{p.price.toLocaleString('en-IN')}
                        </span>
                        {p.originalPrice > p.price && (
                          <span className="block text-[10px] text-[#A0AEC0] line-through font-mono">
                            ₹{p.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            value={p.stock}
                            onChange={(e) => updateStock(p.id, Number(e.target.value))}
                            className="w-16 px-2 py-1 border border-[#D9D0C3] rounded text-center font-mono font-bold"
                          />
                          {p.stock < 10 && (
                            <span className="text-[10px] text-rose-600 font-semibold">Low</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {p.rating} ★ ({p.reviewCount})
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(p)}
                            className="p-1.5 text-[#0C2B4E] hover:bg-[#EFEAE2] rounded cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteProduct(p.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Customer Orders Management */}
      {activeAdminTab === 'orders' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#E8E2D9] overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[#E8E2D9] flex justify-between items-center">
              <h3 className="font-heading text-base font-bold text-[#0C2B4E]">
                All Customer Consignments ({orders.length})
              </h3>
              <p className="text-xs text-[#718096]">
                Changing status triggers live customer notification & timeline progression.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF8F5] text-[#718096] uppercase font-semibold border-b border-[#E8E2D9]">
                  <tr>
                    <th className="py-3 px-4">Order ID & Date</th>
                    <th className="py-3 px-4">Customer & Address</th>
                    <th className="py-3 px-4">Items Ordered</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E2D9]">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#FAF8F5]">
                      <td className="py-3 px-4 font-mono">
                        <span className="font-bold text-[#0C2B4E] block">{ord.orderNumber}</span>
                        <span className="text-[10px] text-[#718096]">
                          {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-[#1A202C]">{ord.customerName}</p>
                        <p className="text-[11px] text-[#718096]">
                          {ord.shippingAddress.city}, {ord.shippingAddress.state}
                        </p>
                        <p className="text-[10px] text-[#718096] font-mono">{ord.customerPhone}</p>
                      </td>
                      <td className="py-3 px-4">
                        {ord.items.map((i, idx) => (
                          <div key={idx} className="text-[11px] mb-1">
                            <span className="font-medium text-[#1A202C]">{i.quantity}x {i.product.name}</span>
                            {i.customization?.isCustomized && (
                              <div className="text-[10px] text-[#8C7A58] bg-[#FAF5E8] px-1.5 py-0.5 rounded border border-[#D4AF37]/30 mt-0.5 space-y-0.5">
                                <p className="font-bold">✂ {i.customization.stitchingOption !== 'unstitched' ? (i.customization.stitchingOption === 'bespoke_madetomeasure' ? 'Bespoke Fit' : 'Stitched') : 'Unstitched'}</p>
                                {i.customization.monogramText && <p className="font-mono text-amber-900">Zari: "{i.customization.monogramText}"</p>}
                                <p className="text-[9px] text-[#4A5568]">
                                  {[
                                    i.customization.fallPico && 'Fall & Pico',
                                    i.customization.matchingInskirt && 'Inskirt',
                                    i.customization.tasselsLatkans && 'Latkans',
                                    i.customization.blessingNote && `Note: "${i.customization.blessingNote}"`,
                                  ]
                                    .filter(Boolean)
                                    .join(' · ')}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#0C2B4E]">
                        ₹{ord.total.toLocaleString('en-IN')}
                        <span className="block text-[10px] uppercase font-sans text-emerald-700">
                          {ord.paymentStatus} ({ord.paymentMethod})
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={ord.status}
                          onChange={(e) =>
                            updateOrderStatus(ord.id, e.target.value as OrderStatus)
                          }
                          className="text-xs bg-white border border-[#D9D0C3] rounded-md px-2.5 py-1.5 font-semibold text-[#0C2B4E] focus:outline-hidden focus:border-[#0C2B4E]"
                        >
                          <option value="Order Placed">Order Placed</option>
                          <option value="Order Confirmed">Order Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Packed">Packed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Returned">Returned</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Categories & Taxonomies Management */}
      {activeAdminTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="bg-white p-6 rounded-xl border border-[#E8E2D9] space-y-4 shadow-xs">
            <h3 className="font-heading text-base font-bold text-[#0C2B4E]">
              Current Taxonomy Collections
            </h3>
            <div className="space-y-4">
              {categories.map((cat) => (
                <div key={cat.id} className="p-3 bg-[#FAF8F5] rounded-lg border border-[#E8E2D9]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-[#0C2B4E]">{cat.name}</span>
                    <span className="text-[10px] font-mono text-[#8C7A58] uppercase">{cat.id}</span>
                  </div>
                  <p className="text-xs text-[#718096] mb-2">{cat.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {cat.subcategories.map((sub) => (
                      <span
                        key={sub}
                        className="text-[11px] bg-white border border-[#D9D0C3] px-2 py-0.5 rounded text-[#2D3748]"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Category Form */}
          <div className="bg-white p-6 rounded-xl border border-[#E8E2D9] space-y-4 shadow-xs text-xs">
            <h3 className="font-heading text-base font-bold text-[#0C2B4E]">
              Add New Collection Category
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newCatName) return;
                addCategory({
                  id: newCatId,
                  name: newCatName,
                  description: newCatDesc || 'Traditional Indian handloom collection.',
                  bannerImage: '/src/assets/images/mudra_women_kanchipuram_saree_1793641347386.jpg',
                  subcategories: ['Festive Special', 'Artisan Handloom'],
                });
                setNewCatName('');
                setNewCatDesc('');
              }}
              className="space-y-3"
            >
              <div>
                <label className="block font-semibold text-[#2D3748] mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Royal Bridal Trousseau"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9D0C3] rounded-md"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2D3748] mb-1">Category Scope</label>
                <select
                  value={newCatId}
                  onChange={(e) => setNewCatId(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9D0C3] rounded-md"
                >
                  <option value="women">Women's Collection</option>
                  <option value="men">Men's Collection</option>
                  <option value="jewelry">Jewelry & Ornaments</option>
                  <option value="spiritual">Spiritual & Cultural</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#2D3748] mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Describe the cultural lineage..."
                  className="w-full p-2 bg-[#FAF8F5] border border-[#D9D0C3] rounded-md"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#0C2B4E] text-white font-semibold rounded-md hover:bg-[#07172C] cursor-pointer"
              >
                Create Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 5: Coupons & Promos */}
      {activeAdminTab === 'coupons' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-8 bg-white p-6 rounded-xl border border-[#E8E2D9] shadow-xs space-y-4">
            <h3 className="font-heading text-base font-bold text-[#0C2B4E]">
              Promotional Coupons & Festive Discounts
            </h3>
            <div className="divide-y divide-[#E8E2D9]">
              {coupons.map((c) => (
                <div key={c.code} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-sm text-[#0C2B4E] mr-3">
                      {c.code}
                    </span>
                    <span className="text-[#4A5568]">{c.description}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        c.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Disabled'}
                    </span>
                    <button
                      onClick={() => toggleCoupon(c.code)}
                      className="text-xs text-[#0C2B4E] hover:underline font-medium cursor-pointer"
                    >
                      {c.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-4 bg-white p-6 rounded-xl border border-[#E8E2D9] shadow-xs space-y-4 text-xs">
            <h3 className="font-heading text-base font-bold text-[#0C2B4E]">
              Create Discount Code
            </h3>
            <form onSubmit={handleAddCouponSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-[#2D3748] mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={newCouponCode}
                  onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. FESTIVE20"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9D0C3] rounded-md font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#2D3748] mb-1">Discount %</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={newCouponDiscount}
                  onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9D0C3] rounded-md font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#2D3748] mb-1">
                  Min Order Amount (₹)
                </label>
                <input
                  type="number"
                  step="100"
                  value={newCouponMin}
                  onChange={(e) => setNewCouponMin(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9D0C3] rounded-md font-mono"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-[#0C2B4E] text-white font-semibold rounded-md hover:bg-[#07172C] cursor-pointer"
              >
                Save Coupon
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 6: Reviews Moderation */}
      {activeAdminTab === 'reviews' && (
        <div className="bg-white rounded-xl border border-[#E8E2D9] p-6 shadow-xs space-y-4">
          <h3 className="font-heading text-base font-bold text-[#0C2B4E]">
            Customer Reviews & Ratings Moderation ({reviews.length})
          </h3>
          <div className="divide-y divide-[#E8E2D9]">
            {reviews.map((r) => (
              <div key={r.id} className="py-4 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#1A202C]">{r.userName}</span>
                    <span className="text-[11px] text-[#718096]">({r.userEmail})</span>
                    <span className="text-[#D4AF37] font-mono">{r.rating} ★</span>
                  </div>
                  <span className="text-[11px] text-[#A0AEC0] font-mono">{r.date}</span>
                </div>
                <p className="font-semibold text-[#0C2B4E]">{r.title}</p>
                <p className="text-[#4A5568]">{r.comment}</p>
                <p className="text-[10px] text-emerald-700 font-medium">
                  Verified Purchase · {r.helpfulCount} patrons found this helpful
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E8E2D9]">
            <div className="bg-[#0C2B4E] text-white p-4 flex justify-between items-center">
              <h3 className="font-heading text-base font-bold text-[#F3E8CE]">
                {editingProduct ? 'Edit Artisan Creation' : 'Add New Handloom Creation'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#D9D0C3] hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#2D3748] mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g. Vrindavan Kadhwa Pure Silk Lehenga"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9D0C3] rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#2D3748] mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={newProdSku}
                    onChange={(e) => setNewProdSku(e.target.value)}
                    placeholder="MUD-SAR-01"
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9D0C3] rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2D3748] mb-1">Category</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9D0C3] rounded-md"
                  >
                    <option value="women">Women's Collection</option>
                    <option value="men">Men's Collection</option>
                    <option value="jewelry">Jewelry & Ornaments</option>
                    <option value="spiritual">Spiritual & Cultural</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-[#2D3748] mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9D0C3] rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2D3748] mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={newProdOriginalPrice}
                    onChange={(e) => setNewProdOriginalPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9D0C3] rounded-md font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#2D3748] mb-1">Stock Units</label>
                  <input
                    type="number"
                    required
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9D0C3] rounded-md font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#2D3748] mb-1">Material / Fabric</label>
                <input
                  type="text"
                  value={newProdMaterial}
                  onChange={(e) => setNewProdMaterial(e.target.value)}
                  placeholder="Pure Kanchipuram Mulberry Silk"
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9D0C3] rounded-md"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#2D3748] mb-1">Product Image URL</label>
                <select
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                  className="w-full px-3 py-2 bg-[#FAF8F5] border border-[#D9D0C3] rounded-md font-mono"
                >
                  <option value="/src/assets/images/mudra_tissue_silk_saree_1793643995228.jpg">
                    Metallic Gold Tissue Silk Saree
                  </option>
                  <option value="/src/assets/images/mudra_kora_organza_saree_1793643995592.jpg">
                    Banarasi Kora Organza Silk Saree
                  </option>
                  <option value="/src/assets/images/mudra_temple_kada_bangles_1793643997507.jpg">
                    Antique Temple Bangles & Kadas
                  </option>
                  <option value="/src/assets/images/mudra_accessories_bridal_potli_1793643997562.jpg">
                    Bridal Zardozi Potli Bag & Kamarbandh
                  </option>
                  <option value="/src/assets/images/mudra_women_kanchipuram_saree_1793641347386.jpg">
                    Kanchipuram Silk Bridal Saree
                  </option>
                  <option value="/src/assets/images/mudra_men_royal_sherwani_1793641348047.jpg">
                    Royal Navy Raw Silk Sherwani
                  </option>
                  <option value="/src/assets/images/mudra_temple_jewelry_ornament_1793641350294.jpg">
                    Antique Temple Jewelry Set
                  </option>
                  <option value="/src/assets/images/mudra_spiritual_pendant_1793641347310.jpg">
                    Radha-Krishna Divine Pendant
                  </option>
                  <option value="/src/assets/images/mudra_hero_divine_couture_1793641346974.jpg">
                    Palace Heritage Couple Couture
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#2D3748] mb-1">Product Description</label>
                <textarea
                  rows={3}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Detailed description of the weave, motifs, and craftsmanship..."
                  className="w-full p-2.5 bg-[#FAF8F5] border border-[#D9D0C3] rounded-md"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E8E2D9]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-[#D9D0C3] text-[#4A5568] rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#0C2B4E] hover:bg-[#07172C] text-[#F3E8CE] font-semibold rounded-md shadow-xs cursor-pointer"
                >
                  {editingProduct ? 'Update Creation' : 'Publish to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
