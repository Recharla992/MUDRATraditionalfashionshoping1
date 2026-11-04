import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  CartItem,
  Order,
  User,
  Review,
  Coupon,
  CategoryMeta,
  ProductCategory,
  OrderStatus,
  OrderTimelineStep,
  ShippingAddress,
  ProductCustomization,
  VisualSearchResult,
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CATEGORIES,
  INITIAL_COUPONS,
  INITIAL_REVIEWS,
} from '../data/initialProducts';

interface AppContextType {
  // Navigation
  currentView: string;
  navigateTo: (view: string, options?: { productId?: string; category?: string; subcategory?: string; orderId?: string }) => void;
  selectedProductId: string | null;
  activeCategoryFilter: string | null;
  activeSubcategoryFilter: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Visual Search (Drishti AI)
  isVisualSearchOpen: boolean;
  setIsVisualSearchOpen: (open: boolean) => void;
  activeVisualSearchResult: VisualSearchResult | null;
  setActiveVisualSearchResult: (result: VisualSearchResult | null) => void;
  visualSearchInitialPreset: string | null;
  setVisualSearchInitialPreset: (preset: string | null) => void;
  openVisualSearch: (presetId?: string) => void;

  // Products
  products: Product[];
  categories: CategoryMeta[];
  getProductById: (id: string) => Product | undefined;
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviewCount'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  updateStock: (id: string, newStock: number) => void;
  addCategory: (category: CategoryMeta) => void;

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, size?: string, color?: string, quantity?: number, customization?: ProductCustomization) => void;
  removeFromCart: (productId: string, size?: string, color?: string, isCustomized?: boolean) => void;
  updateCartQuantity: (productId: string, size: string, color: string, delta: number, isCustomized?: boolean) => void;
  clearCart: () => void;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  cartSubtotal: number;
  deliveryCharge: number;
  cartTotal: number;
  cartDiscount: number;
  freeDeliveryThreshold: number;

  // Coupon
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  addCoupon: (coupon: Coupon) => void;
  toggleCoupon: (code: string) => void;

  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  moveToCartFromWishlist: (product: Product) => void;

  // Orders
  orders: Order[];
  placeOrder: (shippingAddress: ShippingAddress, paymentMethod: 'cod' | 'upi' | 'card' | 'razorpay') => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  getOrderById: (orderId: string) => Order | undefined;
  orderForConfirmation: Order | null;
  trackingOrderId: string | null;
  setTrackingOrderId: (id: string | null) => void;

  // Reviews
  reviews: Review[];
  getProductReviews: (productId: string) => Review[];
  addReview: (review: Omit<Review, 'id' | 'date' | 'helpfulCount'>) => { success: boolean; message: string };
  voteHelpful: (reviewId: string) => void;

  // Auth
  currentUser: User | null;
  login: (email: string, role?: 'customer' | 'admin') => void;
  logout: () => void;
  register: (name: string, email: string, phone?: string) => void;
  switchRole: (role: 'customer' | 'admin') => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // UI Toast
  toast: { message: string; type: 'success' | 'info' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEMO_USER: User = {
  id: 'usr-devotee-01',
  name: 'Radhika Sen',
  email: 'radhika.sen@mudra.in',
  phone: '+91 98765 43210',
  role: 'customer',
  savedAddresses: [
    {
      fullName: 'Radhika Sen',
      phone: '+91 98765 43210',
      email: 'radhika.sen@mudra.in',
      street: 'Flat 402, Vrindavan Heights, Temple Road',
      landmark: 'Near Krishna Balaram Mandir',
      city: 'Mathura',
      state: 'Uttar Pradesh',
      pincode: '281121',
    },
  ],
};

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1042',
    orderNumber: 'MUDRA-2026-8942',
    userId: 'usr-devotee-01',
    customerName: 'Radhika Sen',
    customerEmail: 'radhika.sen@mudra.in',
    customerPhone: '+91 98765 43210',
    items: [
      {
        product: INITIAL_PRODUCTS[4], // Kamakshi Temple Necklace Set
        selectedSize: 'Adjustable Free Size',
        selectedColor: 'Antique Temple Gold',
        quantity: 1,
      },
    ],
    shippingAddress: {
      fullName: 'Radhika Sen',
      phone: '+91 98765 43210',
      email: 'radhika.sen@mudra.in',
      street: 'Flat 402, Vrindavan Heights, Temple Road',
      landmark: 'Near Krishna Balaram Mandir',
      city: 'Mathura',
      state: 'Uttar Pradesh',
      pincode: '281121',
    },
    paymentMethod: 'upi',
    paymentStatus: 'Paid',
    subtotal: 6499,
    discount: 500,
    deliveryCharge: 0,
    total: 5999,
    couponApplied: 'VRINDAVAN',
    status: 'Shipped',
    trackingNumber: 'BLUEDART-IND-894210',
    carrier: 'BlueDart Express Sacred Logistics',
    createdAt: '2026-02-28T14:30:00Z',
    expectedDelivery: '2026-03-05',
    timeline: [
      {
        status: 'Order Placed',
        date: '28 Feb 2026, 02:30 PM',
        completed: true,
        current: false,
        description: 'Order placed and authenticated securely via UPI.',
      },
      {
        status: 'Order Confirmed',
        date: '28 Feb 2026, 03:00 PM',
        completed: true,
        current: false,
        description: 'MUDRA artisan atelier verified Temple Jewelry specifications.',
      },
      {
        status: 'Processing',
        date: '01 Mar 2026, 10:15 AM',
        completed: true,
        current: false,
        description: 'Sanctified pooja blessing performed and quality tested.',
      },
      {
        status: 'Packed',
        date: '01 Mar 2026, 04:45 PM',
        completed: true,
        current: false,
        description: 'Packed in silk velvet keepsake gift case with Tulsi sprig.',
      },
      {
        status: 'Shipped',
        date: '02 Mar 2026, 08:20 AM',
        completed: true,
        current: true,
        description: 'Dispatched via BlueDart Express (Air Courier). In transit to Mathura hub.',
      },
      {
        status: 'Out for Delivery',
        date: 'Expected 05 Mar 2026',
        completed: false,
        current: false,
        description: 'Courier agent will arrive with OTP verification.',
      },
      {
        status: 'Delivered',
        date: 'Pending Delivery',
        completed: false,
        current: false,
        description: 'Delivered with sacred care.',
      },
    ],
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & View state
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);
  const [activeSubcategoryFilter, setActiveSubcategoryFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [orderForConfirmation, setOrderForConfirmation] = useState<Order | null>(null);
  const [trackingOrderId, setTrackingOrderId] = useState<string | null>('MUDRA-2026-8942');

  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('mudra_products_v5');
    if (!saved) return INITIAL_PRODUCTS;
    try {
      const parsed: Product[] = JSON.parse(saved);
      // Ensure all INITIAL_PRODUCTS exist and have latest complete 5-image galleries
      const existingIds = new Set(parsed.map((p) => p.id));
      const missing = INITIAL_PRODUCTS.filter((p) => !existingIds.has(p.id));
      // Overwrite any older session product with fresh 5-image data from INITIAL_PRODUCTS
      const updated = parsed.map((p) => {
        const init = INITIAL_PRODUCTS.find((ip) => ip.id === p.id);
        return init && (!p.images || p.images.length < 5) ? init : p;
      });
      return [...updated, ...missing];
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Categories
  const [categories, setCategories] = useState<CategoryMeta[]>(INITIAL_CATEGORIES);

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('mudra_cart');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Wishlist
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('mudra_wishlist');
    return saved ? JSON.parse(saved) : ['prod-001', 'prod-006'];
  });

  // Coupons
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('mudra_coupons');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Orders
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('mudra_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  // Reviews
  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('mudra_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  // Auth
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('mudra_user');
    return saved ? JSON.parse(saved) : DEMO_USER;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Visual Search (Drishti AI)
  const [isVisualSearchOpen, setIsVisualSearchOpen] = useState(false);
  const [activeVisualSearchResult, setActiveVisualSearchResult] = useState<VisualSearchResult | null>(null);
  const [visualSearchInitialPreset, setVisualSearchInitialPreset] = useState<string | null>(null);

  const openVisualSearch = (presetId?: string) => {
    if (presetId) {
      setVisualSearchInitialPreset(presetId);
    }
    setIsVisualSearchOpen(true);
  };

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Persistence side effects
  useEffect(() => {
    localStorage.setItem('mudra_products_v5', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('mudra_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('mudra_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('mudra_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('mudra_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('mudra_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('mudra_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('mudra_user');
    }
  }, [currentUser]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const navigateTo = (
    view: string,
    options?: { productId?: string; category?: string; subcategory?: string; orderId?: string }
  ) => {
    setCurrentView(view);
    if (options?.productId) setSelectedProductId(options.productId);
    if (options?.category) setActiveCategoryFilter(options.category);
    if (options?.subcategory) setActiveSubcategoryFilter(options.subcategory);
    if (options?.orderId) setTrackingOrderId(options.orderId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getProductById = (id: string) => {
    return products.find((p) => p.id === id);
  };

  // Cart Calculations
  // Cart Calculations
  const cartSubtotal = cart.reduce(
    (sum, item) =>
      sum + (item.product.price + (item.customization?.customizationFee || 0)) * item.quantity,
    0
  );
  const freeDeliveryThreshold = 1999;
  const deliveryCharge = cartSubtotal === 0 || cartSubtotal >= freeDeliveryThreshold ? 0 : 99;

  let cartDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.flatDiscount) {
      cartDiscount = appliedCoupon.flatDiscount;
    } else if (appliedCoupon.discountPercentage) {
      cartDiscount = Math.round((cartSubtotal * appliedCoupon.discountPercentage) / 100);
    }
  }
  const cartTotal = Math.max(0, cartSubtotal - cartDiscount + deliveryCharge);

  const addToCart = (
    product: Product,
    size?: string,
    color?: string,
    quantity: number = 1,
    customization?: ProductCustomization
  ) => {
    const selectedSize = size || product.availableSizes[0] || 'Standard';
    const selectedColor = color || (product.availableColors[0]?.name ?? 'Standard');

    setCart((prev) => {
      // If customized, separate line item so custom specs are preserved
      const existingIndex = customization?.isCustomized
        ? -1
        : prev.findIndex(
            (item) =>
              item.product.id === product.id &&
              item.selectedSize === selectedSize &&
              item.selectedColor === selectedColor &&
              !item.customization?.isCustomized
          );

      if (existingIndex > -1) {
        const existingItem = prev[existingIndex];
        const newQty = existingItem.quantity + quantity;
        if (newQty > product.stock) {
          showToast(`Only ${product.stock} units available in stock.`, 'error');
          return prev;
        }
        const updated = [...prev];
        updated[existingIndex] = { ...existingItem, quantity: newQty };
        showToast(`Updated "${product.name}" quantity to ${newQty}.`, 'info');
        return updated;
      } else {
        if (quantity > product.stock) {
          showToast(`Only ${product.stock} units available in stock.`, 'error');
          return prev;
        }
        const msg = customization?.isCustomized
          ? `Added bespoke custom "${product.name}" to your sacred bag.`
          : `Added "${product.name}" to your sacred bag.`;
        showToast(msg, 'success');
        return [...prev, { product, selectedSize, selectedColor, quantity, customization }];
      }
    });

    setIsCartDrawerOpen(true);
  };

  const removeFromCart = (
    productId: string,
    size?: string,
    color?: string,
    isCustomized?: boolean
  ) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product.id === productId &&
            (!size || item.selectedSize === size) &&
            (!color || item.selectedColor === color) &&
            (isCustomized === undefined || Boolean(item.customization?.isCustomized) === isCustomized)
          )
      )
    );
    showToast('Item removed from shopping bag.', 'info');
  };

  const updateCartQuantity = (
    productId: string,
    size: string,
    color: string,
    delta: number,
    isCustomized?: boolean
  ) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (
            item.product.id === productId &&
            item.selectedSize === size &&
            item.selectedColor === color &&
            (isCustomized === undefined || Boolean(item.customization?.isCustomized) === isCustomized)
          ) {
            const nextQty = item.quantity + delta;
            if (nextQty > item.product.stock) {
              showToast(`Cannot exceed available stock of ${item.product.stock}.`, 'error');
              return item;
            }
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Coupons
  const applyCoupon = (code: string) => {
    const trimmed = code.trim().toUpperCase();
    const found = coupons.find((c) => c.code.toUpperCase() === trimmed && c.isActive);
    if (!found) {
      return { success: false, message: 'Invalid or expired coupon code.' };
    }
    if (cartSubtotal < found.minOrderValue) {
      return {
        success: false,
        message: `Minimum order value for ${found.code} is ₹${found.minOrderValue.toLocaleString('en-IN')}.`,
      };
    }
    setAppliedCoupon(found);
    return { success: true, message: `Coupon ${found.code} applied successfully!` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed.', 'info');
  };

  const addCoupon = (newCoupon: Coupon) => {
    setCoupons((prev) => [newCoupon, ...prev]);
    showToast(`Created coupon ${newCoupon.code}`, 'success');
  };

  const toggleCoupon = (code: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.code === code ? { ...c, isActive: !c.isActive } : c))
    );
  };

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      if (exists) {
        showToast('Removed from sacred wishlist.', 'info');
        return prev.filter((id) => id !== productId);
      } else {
        showToast('Added to your sacred wishlist.', 'success');
        return [...prev, productId];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const moveToCartFromWishlist = (product: Product) => {
    addToCart(product);
    setWishlist((prev) => prev.filter((id) => id !== product.id));
  };

  // Order Placement
  const placeOrder = (
    shippingAddress: ShippingAddress,
    paymentMethod: 'cod' | 'upi' | 'card' | 'razorpay'
  ): Order => {
    const orderNumber = `MUDRA-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const deliveryDate = new Date();
    deliveryDate.setDate(now.getDate() + 4);

    const timeline: OrderTimelineStep[] = [
      {
        status: 'Order Placed',
        date: `${now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
        completed: true,
        current: true,
        description: `Order successfully placed via ${paymentMethod.toUpperCase()}.`,
      },
      {
        status: 'Order Confirmed',
        date: 'Within 2 hours',
        completed: false,
        current: false,
        description: 'Artisan order verified and authenticity seal allocated.',
      },
      {
        status: 'Processing',
        date: 'Scheduled tomorrow',
        completed: false,
        current: false,
        description: 'Handloom inspection and ceremonial packaging.',
      },
      {
        status: 'Packed',
        date: 'Scheduled in 2 days',
        completed: false,
        current: false,
        description: 'Packed securely in divine tamper-proof MUDRA carton.',
      },
      {
        status: 'Shipped',
        date: 'Scheduled in 3 days',
        completed: false,
        current: false,
        description: 'Handed over to high-priority express logistics.',
      },
      {
        status: 'Out for Delivery',
        date: 'Scheduled in 4 days',
        completed: false,
        current: false,
        description: 'Assigned to courier partner for final doorstep delivery.',
      },
      {
        status: 'Delivered',
        date: `Estimated ${deliveryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`,
        completed: false,
        current: false,
        description: 'Delivered with sacred blessings.',
      },
    ];

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      userId: currentUser?.id || 'guest',
      customerName: shippingAddress.fullName,
      customerEmail: shippingAddress.email,
      customerPhone: shippingAddress.phone,
      items: [...cart],
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Paid',
      subtotal: cartSubtotal,
      discount: cartDiscount,
      deliveryCharge,
      total: cartTotal,
      couponApplied: appliedCoupon?.code,
      status: 'Order Placed',
      trackingNumber: `MUDRA-EXP-${Math.floor(100000 + Math.random() * 900000)}`,
      carrier: 'BlueDart Divine Express',
      createdAt: now.toISOString(),
      expectedDelivery: deliveryDate.toISOString().split('T')[0],
      timeline,
    };

    // Reduce stocks
    setProducts((prev) =>
      prev.map((prod) => {
        const cartMatch = cart.find((c) => c.product.id === prod.id);
        if (cartMatch) {
          return { ...prod, stock: Math.max(0, prod.stock - cartMatch.quantity) };
        }
        return prod;
      })
    );

    setOrders((prev) => [newOrder, ...prev]);
    setOrderForConfirmation(newOrder);
    setTrackingOrderId(newOrder.orderNumber);
    clearCart();
    setIsCartDrawerOpen(false);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId || ord.orderNumber === orderId) {
          const statuses: OrderStatus[] = [
            'Order Placed',
            'Order Confirmed',
            'Processing',
            'Packed',
            'Shipped',
            'Out for Delivery',
            'Delivered',
          ];
          const targetIndex = statuses.indexOf(newStatus);

          const updatedTimeline = ord.timeline.map((step) => {
            const stepIndex = statuses.indexOf(step.status);
            if (targetIndex >= 0 && stepIndex >= 0) {
              return {
                ...step,
                completed: stepIndex <= targetIndex,
                current: stepIndex === targetIndex,
              };
            }
            return step;
          });

          return {
            ...ord,
            status: newStatus,
            paymentStatus: newStatus === 'Delivered' ? 'Paid' : ord.paymentStatus,
            timeline: updatedTimeline,
          };
        }
        return ord;
      })
    );
    showToast(`Order status updated to "${newStatus}"`, 'info');
  };

  const getOrderById = (query: string) => {
    const q = query.trim().toUpperCase();
    return orders.find(
      (o) =>
        o.id.toUpperCase() === q ||
        o.orderNumber.toUpperCase() === q ||
        o.trackingNumber.toUpperCase() === q
    );
  };

  // Reviews
  const getProductReviews = (productId: string) => {
    return reviews.filter((r) => r.productId === productId);
  };

  const addReview = (reviewData: Omit<Review, 'id' | 'date' | 'helpfulCount'>) => {
    // Check if user already reviewed this product
    const existing = reviews.find(
      (r) => r.productId === reviewData.productId && r.userEmail === reviewData.userEmail
    );
    if (existing) {
      return { success: false, message: 'You have already submitted a review for this product.' };
    }

    const newRev: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      helpfulCount: 0,
    };

    setReviews((prev) => [newRev, ...prev]);

    // Recalculate average rating & review count for product
    setProducts((prev) =>
      prev.map((prod) => {
        if (prod.id === reviewData.productId) {
          const prodReviews = [...getProductReviews(prod.id), newRev];
          const avg =
            prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
          return {
            ...prod,
            rating: Number(avg.toFixed(1)),
            reviewCount: prodReviews.length,
          };
        }
        return prod;
      })
    );

    return { success: true, message: 'Thank you! Your verified review has been published.' };
  };

  const voteHelpful = (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r))
    );
    showToast('Thank you for your feedback.', 'info');
  };

  // Product Management (Admin)
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviewCount'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      rating: 5.0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [newProduct, ...prev]);
    showToast(`Product "${newProduct.name}" added to catalog.`, 'success');
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    showToast(`Updated "${updated.name}" details.`, 'success');
  };

  const deleteProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast(`Removed "${target?.name || 'Product'}" from catalog.`, 'info');
  };

  const updateStock = (id: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: Math.max(0, newStock) } : p))
    );
  };

  const addCategory = (newCat: CategoryMeta) => {
    setCategories((prev) => [...prev, newCat]);
    showToast(`Added new collection category: ${newCat.name}`, 'success');
  };

  // Auth
  const login = (email: string, role: 'customer' | 'admin' = 'customer') => {
    const isAdmin = email.toLowerCase().includes('admin') || role === 'admin';
    const user: User = {
      id: `usr-${Date.now()}`,
      name: isAdmin ? 'MUDRA Royal Administrator' : email.split('@')[0],
      email,
      role: isAdmin ? 'admin' : 'customer',
      savedAddresses: DEMO_USER.savedAddresses,
    };
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    showToast(`Welcome back, ${user.name}!`, 'success');
  };

  const logout = () => {
    setCurrentUser(null);
    showToast('Signed out securely.', 'info');
  };

  const register = (name: string, email: string, phone?: string) => {
    const user: User = {
      id: `usr-${Date.now()}`,
      name,
      email,
      phone,
      role: 'customer',
      savedAddresses: [],
    };
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    showToast(`Welcome to MUDRA family, ${name}!`, 'success');
  };

  const switchRole = (newRole: 'customer' | 'admin') => {
    if (!currentUser) {
      setCurrentUser({
        id: 'usr-admin-demo',
        name: newRole === 'admin' ? 'MUDRA Chief Curator' : 'Radhika Sen',
        email: newRole === 'admin' ? 'admin@mudra.in' : 'radhika.sen@mudra.in',
        role: newRole,
      });
    } else {
      setCurrentUser({
        ...currentUser,
        role: newRole,
        name: newRole === 'admin' ? 'MUDRA Chief Curator' : 'Radhika Sen',
      });
    }
    showToast(`Switched active view mode to: ${newRole.toUpperCase()}`, 'info');
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        navigateTo,
        selectedProductId,
        activeCategoryFilter,
        activeSubcategoryFilter,
        searchQuery,
        setSearchQuery,
        products,
        categories,
        getProductById,
        addProduct,
        updateProduct,
        deleteProduct,
        updateStock,
        addCategory,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        cartSubtotal,
        deliveryCharge,
        cartTotal,
        cartDiscount,
        freeDeliveryThreshold,
        coupons,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        addCoupon,
        toggleCoupon,
        wishlist,
        toggleWishlist,
        isInWishlist,
        moveToCartFromWishlist,
        orders,
        placeOrder,
        updateOrderStatus,
        getOrderById,
        orderForConfirmation,
        trackingOrderId,
        setTrackingOrderId,
        reviews,
        getProductReviews,
        addReview,
        voteHelpful,
        currentUser,
        login,
        logout,
        register,
        switchRole,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isVisualSearchOpen,
        setIsVisualSearchOpen,
        activeVisualSearchResult,
        setActiveVisualSearchResult,
        visualSearchInitialPreset,
        setVisualSearchInitialPreset,
        openVisualSearch,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
