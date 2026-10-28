import { Product, Category, Coupon, Order, Review } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Oversized Tees',
    slug: 'oversized-tees',
    description: 'Heavyweight 240 GSM 100% Combed Cotton Streetwear Tees',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    itemCount: 14,
  },
  {
    id: 'cat-2',
    name: 'Premium Hoodies',
    slug: 'hoodies',
    description: 'Ultra-Soft 350 GSM Fleece Lined Graphic Hoodies',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
    itemCount: 9,
  },
  {
    id: 'cat-3',
    name: 'Acid Wash Drop',
    slug: 'acid-wash',
    description: 'Vintage Distressed Acid Wash Drop-Shoulder Collection',
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
    itemCount: 7,
  },
  {
    id: 'cat-4',
    name: 'Accessories & Mugs',
    slug: 'accessories',
    description: 'High Gloss Ceramic Mugs, Tote Bags & Embroidered Caps',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    itemCount: 12,
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'hb-001',
    qikink_id: 'QK-TSH-240-BLK',
    title: 'HOTBEE Cyber Honey Heavyweight Oversized Tee',
    slug: 'hotbee-cyber-honey-oversized-tee',
    description: 'Signature HOTBEE drop featuring luxury 240 GSM pre-shrunk combed cotton with vibrant DTF cyber-honey print on the back and glowing minimalist chest emblem.',
    price: 1199,
    originalPrice: 1999,
    discountPercentage: 40,
    rating: 4.9,
    reviewsCount: 128,
    category: 'Oversized Tees',
    collection: 'Cyberpunk Honey Drop',
    images: [
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=900&auto=format&fit=crop&q=80'
    ],
    colors: [
      { name: 'Obsidian Black', hex: '#0a0c10' },
      { name: 'Amber Gold', hex: '#ff9d00' },
      { name: 'Vintage Acid Grey', hex: '#374151' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    inStock: true,
    isTrending: true,
    isNew: true,
    material: '240 GSM 100% Combed French Terry Cotton',
    printType: 'High-Density Qikink Premium DTF Print',
    shippingInfo: 'Dispatched within 24 Hours via Qikink Express'
  },
  {
    id: 'hb-002',
    qikink_id: 'QK-HD-350-BLK',
    title: 'HOTBEE Onyx Amber Fleece Hoodie',
    slug: 'hotbee-onyx-amber-fleece-hoodie',
    description: 'Ultra-warm 350 GSM cotton-fleece lined hoodie featuring double-layer hood with metal eyelets and gold embroidery. Designed for comfort & street durability.',
    price: 2299,
    originalPrice: 3499,
    discountPercentage: 34,
    rating: 4.9,
    reviewsCount: 94,
    category: 'Premium Hoodies',
    collection: 'Onyx Series',
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=900&auto=format&fit=crop&q=80'
    ],
    colors: [
      { name: 'Onyx Black', hex: '#111827' },
      { name: 'Honey Amber', hex: '#e67e00' }
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    inStock: true,
    isTrending: true,
    isNew: false,
    material: '350 GSM 80% Cotton / 20% Polyester Fleece',
    printType: 'Precision Puff + Screen Hybrid Print',
    shippingInfo: 'Express Air Shipping across India'
  },
  {
    id: 'hb-003',
    qikink_id: 'QK-TSH-ACD-01',
    title: 'Neon Bee Acid Wash Boxy Fit Tee',
    slug: 'neon-bee-acid-wash-boxy-fit-tee',
    description: 'Custom mineral acid wash finish giving each piece a 1-of-1 vintage aesthetic. Soft hand-feel with drop-shoulder silhouette.',
    price: 1399,
    originalPrice: 2199,
    discountPercentage: 36,
    rating: 4.8,
    reviewsCount: 67,
    category: 'Acid Wash Drop',
    collection: 'Vintage Acid Wash',
    images: [
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=900&auto=format&fit=crop&q=80'
    ],
    colors: [
      { name: 'Mineral Charcoal', hex: '#1f2937' },
      { name: 'Washed Olive', hex: '#374151' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    inStock: true,
    isTrending: false,
    isNew: true,
    material: '220 GSM Bio-washed Ring Spun Cotton',
    printType: 'Water-based Soft Breathable Print',
    shippingInfo: 'Ships directly from Qikink POD warehouse'
  },
  {
    id: 'hb-004',
    qikink_id: 'QK-MUG-GLS-01',
    title: 'HOTBEE Matte Gold Ceramic Coffee Mug (350ml)',
    slug: 'hotbee-matte-gold-ceramic-coffee-mug',
    description: 'Premium microwave-safe 350ml ceramic mug with luxury matte dark finish and metallic honey bee emblem. Perfect for daily coffee rituals.',
    price: 599,
    originalPrice: 999,
    discountPercentage: 40,
    rating: 5.0,
    reviewsCount: 42,
    category: 'Accessories & Mugs',
    collection: 'Lifestyle Essentials',
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=900&auto=format&fit=crop&q=80'
    ],
    colors: [
      { name: 'Matte Onyx', hex: '#0d0f14' }
    ],
    sizes: ['350 ML'],
    inStock: true,
    isTrending: true,
    isNew: false,
    material: 'High Fired Ceramic with Sublimation Print',
    printType: 'Fade-proof 300 DPI Thermal Sublimation',
    shippingInfo: 'Shock-proof bubble packed shipping'
  },
  {
    id: 'hb-005',
    qikink_id: 'QK-CAP-SMB-BLK',
    title: 'HOTBEE Gold Thread Embroidered Snapback',
    slug: 'hotbee-gold-thread-embroidered-snapback',
    description: 'Structured 6-panel snapback cap featuring 3D high-density gold thread embroidery of the iconic HOTBEE emblem.',
    price: 799,
    originalPrice: 1299,
    discountPercentage: 38,
    rating: 4.7,
    reviewsCount: 31,
    category: 'Accessories & Mugs',
    collection: 'Headwear Series',
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=900&auto=format&fit=crop&q=80'
    ],
    colors: [
      { name: 'Pitch Black', hex: '#000000' }
    ],
    sizes: ['Adjustable Free Size'],
    inStock: true,
    isTrending: false,
    isNew: true,
    material: 'Heavy Twill Cotton with Adjustable Snap',
    printType: '3D Gold Metallic Embroidery',
    shippingInfo: 'Dispatched in rigid protective box'
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'HOTBEE10',
    discountType: 'percentage',
    discountValue: 10,
    minOrderValue: 999,
    active: true,
    description: 'Get 10% OFF on orders above ₹999'
  },
  {
    code: 'WELCOME200',
    discountType: 'fixed',
    discountValue: 200,
    minOrderValue: 1499,
    active: true,
    description: 'Flat ₹200 OFF on your first purchase above ₹1,499'
  },
  {
    code: 'GOLDVIP',
    discountType: 'percentage',
    discountValue: 15,
    minOrderValue: 2499,
    active: true,
    description: 'VIP Special: 15% OFF on orders above ₹2,499'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    productId: 'hb-001',
    author: 'Vikram S.',
    rating: 5,
    date: '2 days ago',
    title: 'Mind-Blowing Quality & Fit!',
    comment: 'The 240 GSM fabric feel is incredible! Oversized fit is spot on, and the print quality from Qikink is ultra-sharp. The amber gold accents shine bright.',
    verifiedPurchase: true
  },
  {
    id: 'rev-2',
    productId: 'hb-001',
    author: 'Ananya R.',
    rating: 5,
    date: '1 week ago',
    title: 'Superb Glassmorphic Vibe & Fast Delivery',
    comment: 'Received order within 3 days. Packaging was super neat and the print hasn\'t faded at all after 3 washes. Will buy the hoodie next!',
    verifiedPurchase: true
  },
  {
    id: 'rev-3',
    productId: 'hb-002',
    author: 'Rohan K.',
    rating: 5,
    date: '2 weeks ago',
    title: 'Best Hoodie I Own',
    comment: 'Heavyweight fleece is insanely cozy. Perfect for winter nights and late night coding sessions.',
    verifiedPurchase: true
  }
];

export const SAMPLE_ORDERS: Order[] = [
  {
    id: 'HB-89421',
    trackingNumber: 'QK-IND-8942199',
    createdAt: '2026-08-10T14:32:00Z',
    customerName: 'Rahul Verma',
    customerEmail: 'rahul.v@example.com',
    customerPhone: '+91 98765 43210',
    shippingAddress: {
      fullName: 'Rahul Verma',
      phone: '+91 98765 43210',
      email: 'rahul.v@example.com',
      street: 'Flat 402, Honey Comb Heights, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038'
    },
    items: [
      {
        productId: 'hb-001',
        productTitle: 'HOTBEE Cyber Honey Heavyweight Oversized Tee',
        productImage: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=900&auto=format&fit=crop&q=80',
        selectedColor: 'Obsidian Black',
        selectedSize: 'L',
        quantity: 1,
        price: 1199
      }
    ],
    subtotal: 1199,
    discount: 119,
    shippingFee: 0,
    totalAmount: 1080,
    paymentMethod: 'Razorpay UPI (Paid)',
    paymentStatus: 'paid',
    razorpayPaymentId: 'pay_PZ948275019',
    qikinkOrderId: 'QK-ORD-90812',
    status: 'shipped',
    estimatedDelivery: '14 Aug 2026',
    courierName: 'Bluedart Express'
  }
];
