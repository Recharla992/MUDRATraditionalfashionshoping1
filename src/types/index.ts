export type ProductCategory = 'women' | 'men' | 'jewelry' | 'spiritual';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  subcategory: string;
  gender: 'women' | 'men' | 'unisex';
  price: number;
  originalPrice: number;
  discountPercentage: number;
  stock: number;
  images: string[];
  description: string;
  story?: string;
  material: string;
  fabricDetails: string;
  fabricType?: string;
  specifications: Record<string, string>;
  availableSizes: string[];
  availableColors: { name: string; hex: string }[];
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  isBestseller?: boolean;
  isTrending?: boolean;
  isFestive?: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userEmail: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
  helpfulCount: number;
  location?: string;
}

export interface ProductCustomization {
  isCustomized: boolean;
  stitchingOption?: 'unstitched' | 'standard_stitched' | 'bespoke_madetomeasure';
  measurements?: {
    bustChest?: string;
    waist?: string;
    hips?: string;
    shoulderWidth?: string;
    sleeveLength?: string;
    blouseKurtaLength?: string;
    frontNeckDepth?: string;
    backNeckDepth?: string;
  };
  necklineStyle?: string;
  sleeveStyle?: string;
  liningPreference?: string;
  tasselsAndLatkans?: string;
  tasselsLatkans?: string;
  monogramText?: string;
  monogramScript?: 'devanagari' | 'english' | 'none';
  monogramPlacement?: string;
  fallAndPico?: boolean;
  fallPico?: boolean;
  matchingInskirt?: boolean;
  giftBlessingNote?: string;
  blessingNote?: string;
  customizationFee: number;
  totalFee?: number;
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
  customization?: ProductCustomization;
}

export type OrderStatus =
  | 'Order Placed'
  | 'Order Confirmed'
  | 'Processing'
  | 'Packed'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Returned';

export interface OrderTimelineStep {
  status: OrderStatus;
  date: string;
  completed: boolean;
  current: boolean;
  description: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'cod' | 'upi' | 'card' | 'razorpay';
  paymentStatus: 'Pending' | 'Paid';
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  couponApplied?: string;
  status: OrderStatus;
  trackingNumber: string;
  carrier: string;
  createdAt: string;
  expectedDelivery: string;
  timeline: OrderTimelineStep[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
  savedAddresses?: ShippingAddress[];
}

export interface Coupon {
  code: string;
  discountPercentage?: number;
  flatDiscount?: number;
  minOrderValue: number;
  description: string;
  isActive: boolean;
}

export interface CategoryMeta {
  id: ProductCategory;
  name: string;
  description: string;
  bannerImage: string;
  subcategories: string[];
}

export interface VisualSearchResult {
  detectedItem: string;
  category: ProductCategory;
  subcategory: string;
  fabrics: string[];
  colors: { name: string; hex: string }[];
  motifs: string[];
  occasion: string;
  culturalAnalysis: string;
  stylingAdvice: string;
  matchedProductIds: string[];
  matchScores: Record<string, number>;
}

export interface VisualSamplePreset {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  tag: string;
}
