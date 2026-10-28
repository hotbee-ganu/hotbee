export interface Product {
  id: string;
  qikink_id?: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  rating: number;
  reviewsCount: number;
  category: string;
  collection: string;
  images: string[];
  colors: { name: string; hex: string; image?: string }[];
  sizes: string[];
  inStock: boolean;
  isTrending?: boolean;
  isNew?: boolean;
  material: string;
  printType: string;
  shippingInfo: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  itemCount: number;
}

export interface CartItem {
  product: Product;
  selectedColor: string;
  selectedSize: string;
  quantity: number;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderValue: number;
  active: boolean;
  description: string;
}

export interface Address {
  fullName: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export type OrderStatus = 'placed' | 'qikink_submitted' | 'printing' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderTimelineStep {
  status: OrderStatus;
  label: string;
  date?: string;
  completed: boolean;
  current: boolean;
}

export interface Order {
  id: string;
  trackingNumber: string;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: Address;
  items: {
    productId: string;
    productTitle: string;
    productImage: string;
    selectedColor: string;
    selectedSize: string;
    quantity: number;
    price: number;
  }[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  razorpayPaymentId?: string;
  qikinkOrderId?: string;
  status: OrderStatus;
  estimatedDelivery: string;
  courierName?: string;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  date: string;
  title: string;
  comment: string;
  verifiedPurchase: boolean;
}

export interface AdminMetrics {
  totalRevenue: number;
  ordersToday: number;
  pendingPrintJobs: number;
  deliveredOrders: number;
  qikinkWalletBalance: number;
  activeProductsCount: number;
}
