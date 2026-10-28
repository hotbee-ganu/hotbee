'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Product, CartItem, Coupon, Order, Review } from './types';
import { INITIAL_PRODUCTS, INITIAL_COUPONS, INITIAL_REVIEWS, SAMPLE_ORDERS } from './mockData';
import { SITE } from './siteConfig';

export interface PlaceOrderResult {
  order: Order;
  qikink: { success: boolean; mode: string; message: string };
}

interface StoreContextType {
  products: Product[];
  productsLoading: boolean;
  catalogSource: 'supabase' | 'local';
  cart: CartItem[];
  wishlist: string[];
  appliedCoupon: Coupon | null;
  orders: Order[];
  reviews: Review[];
  isCartOpen: boolean;
  isAdminLoggedIn: boolean;
  adminChecked: boolean;

  // Cart
  addToCart: (product: Product, selectedColor: string, selectedSize: string, quantity?: number) => void;
  removeFromCart: (productId: string, color: string, size: string) => void;
  updateQuantity: (productId: string, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
  setIsCartOpen: (open: boolean) => void;

  // Coupons
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;

  // Wishlist
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  // Orders
  createOrder: (newOrder: Omit<Order, 'id' | 'createdAt' | 'trackingNumber'>) => Order;
  placeOrder: (
    draft: Omit<Order, 'id' | 'createdAt' | 'trackingNumber'>,
    payment?: { razorpayOrderId?: string; razorpayPaymentId?: string; razorpaySignature?: string }
  ) => Promise<PlaceOrderResult>;
  getOrder: (orderId: string) => Order | undefined;
  updateOrderStatus: (
    orderId: string,
    status: Order['status'],
    trackingNumber?: string,
    courierName?: string
  ) => void;

  // Reviews
  addReview: (review: Omit<Review, 'id' | 'date'>) => void;

  // Admin
  refreshProducts: () => Promise<void>;
  addProduct: (product: Product) => Promise<{ success: boolean; message?: string }>;
  updateProduct: (product: Product) => Promise<{ success: boolean; message?: string }>;
  deleteProduct: (productId: string) => Promise<{ success: boolean; message?: string }>;
  loginAdmin: (pin: string) => Promise<{ success: boolean; message?: string }>;
  logoutAdmin: () => Promise<void>;

  // Totals
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  finalTotal: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [productsLoading, setProductsLoading] = useState(true);
  const [catalogSource, setCatalogSource] = useState<'supabase' | 'local'>('local');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [orders, setOrders] = useState<Order[]>(SAMPLE_ORDERS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);

  const hydrated = useRef(false);

  // --- Hydrate local state once ---
  useEffect(() => {
    setCart(readJson<CartItem[]>('hotbee_cart', []));
    setWishlist(readJson<string[]>('hotbee_wishlist', []));
    const savedOrders = readJson<Order[] | null>('hotbee_orders', null);
    if (savedOrders?.length) setOrders(savedOrders);
    hydrated.current = true;
  }, []);

  // --- Confirm the admin session with the server (a localStorage flag is not enough) ---
  useEffect(() => {
    let cancelled = false;
    fetch('/api/admin/session')
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setIsAdminLoggedIn(Boolean(d?.authenticated));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setAdminChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // --- Load the live catalogue from Supabase & merge local custom products ---
  const refreshProducts = useCallback(async () => {
    try {
      const localCustom = readJson<Product[]>('hotbee_custom_products', []);
      const res = await fetch('/api/products', { cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data?.products) && data.products.length > 0) {
        const mergedMap = new Map<string, Product>();
        data.products.forEach((p: Product) => mergedMap.set(p.id, p));
        localCustom.forEach((p: Product) => {
          if (!mergedMap.has(p.id)) mergedMap.set(p.id, p);
        });
        setProducts(Array.from(mergedMap.values()));
        setCatalogSource('supabase');
      } else {
        const mergedMap = new Map<string, Product>();
        INITIAL_PRODUCTS.forEach((p) => mergedMap.set(p.id, p));
        localCustom.forEach((p) => mergedMap.set(p.id, p));
        setProducts(Array.from(mergedMap.values()));
        setCatalogSource('local');
      }
    } catch {
      const localCustom = readJson<Product[]>('hotbee_custom_products', []);
      const mergedMap = new Map<string, Product>();
      INITIAL_PRODUCTS.forEach((p) => mergedMap.set(p.id, p));
      localCustom.forEach((p) => mergedMap.set(p.id, p));
      setProducts(Array.from(mergedMap.values()));
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshProducts();
  }, [refreshProducts]);

  // --- Persist (skipped until hydration to avoid clobbering saved state) ---
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem('hotbee_cart', JSON.stringify(cart));
    } catch {}
  }, [cart]);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem('hotbee_wishlist', JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem('hotbee_orders', JSON.stringify(orders));
    } catch {}
  }, [orders]);

  // --- Cart ---
  const addToCart = useCallback(
    (product: Product, selectedColor: string, selectedSize: string, quantity = 1) => {
      setCart((prev) => {
        const index = prev.findIndex(
          (item) =>
            item.product.id === product.id &&
            item.selectedColor === selectedColor &&
            item.selectedSize === selectedSize
        );

        if (index > -1) {
          const updated = [...prev];
          updated[index] = { ...updated[index], quantity: updated[index].quantity + quantity };
          return updated;
        }
        return [...prev, { product, selectedColor, selectedSize, quantity }];
      });
      setIsCartOpen(true);
    },
    []
  );

  const removeFromCart = useCallback((productId: string, color: string, size: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(item.product.id === productId && item.selectedColor === color && item.selectedSize === size)
      )
    );
  }, []);

  const updateQuantity = useCallback(
    (productId: string, color: string, size: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId, color, size);
        return;
      }
      setCart((prev) =>
        prev.map((item) =>
          item.product.id === productId && item.selectedColor === color && item.selectedSize === size
            ? { ...item, quantity }
            : item
        )
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedCoupon(null);
  }, []);

  // --- Totals ---
  const subtotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    [cart]
  );

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    const raw =
      appliedCoupon.discountType === 'percentage'
        ? Math.round((subtotal * appliedCoupon.discountValue) / 100)
        : appliedCoupon.discountValue;
    return Math.min(raw, subtotal);
  }, [appliedCoupon, subtotal]);

  const shippingFee = useMemo(
    () => (subtotal >= SITE.freeShippingThreshold || subtotal === 0 ? 0 : SITE.shippingFee),
    [subtotal]
  );

  const finalTotal = useMemo(
    () => Math.max(0, subtotal - discountAmount + shippingFee),
    [subtotal, discountAmount, shippingFee]
  );

  // --- Coupons (uses a ref so the callback identity stays stable) ---
  const subtotalRef = useRef(subtotal);
  subtotalRef.current = subtotal;

  const applyCoupon = useCallback((code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const found = INITIAL_COUPONS.find((c) => c.code === cleanCode && c.active);

    if (!found) return { success: false, message: 'Invalid coupon code.' };

    if (subtotalRef.current < found.minOrderValue) {
      return {
        success: false,
        message: `Minimum order value of ₹${found.minOrderValue} is required for this coupon.`,
      };
    }

    setAppliedCoupon(found);
    return { success: true, message: `Coupon ${found.code} applied successfully!` };
  }, []);

  const removeCoupon = useCallback(() => setAppliedCoupon(null), []);

  // --- Wishlist ---
  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  }, []);

  const isInWishlist = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

  // --- Orders ---
  const buildOrder = useCallback((draft: Omit<Order, 'id' | 'createdAt' | 'trackingNumber'>): Order => {
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    return {
      ...draft,
      id: `HB-${randomNum}`,
      trackingNumber: `QK-IND-${randomNum}X`,
      createdAt: new Date().toISOString(),
    };
  }, []);

  const createOrder = useCallback(
    (draft: Omit<Order, 'id' | 'createdAt' | 'trackingNumber'>): Order => {
      const newOrder = buildOrder(draft);
      setOrders((prev) => [newOrder, ...prev]);
      clearCart();
      return newOrder;
    },
    [buildOrder, clearCart]
  );

  /**
   * Records the order and asks the server to verify payment and push the print
   * job to Qikink. The order is kept locally either way so the customer always
   * lands on a confirmation page.
   */
  const placeOrder = useCallback(
    async (
      draft: Omit<Order, 'id' | 'createdAt' | 'trackingNumber'>,
      payment?: { razorpayOrderId?: string; razorpayPaymentId?: string; razorpaySignature?: string }
    ): Promise<PlaceOrderResult> => {
      const localOrder = buildOrder(draft);

      let result: PlaceOrderResult = {
        order: localOrder,
        qikink: { success: false, mode: 'offline', message: 'Could not reach the fulfilment server.' },
      };

      try {
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order: localOrder, ...payment }),
        });
        const data = await res.json();

        if (res.ok && data?.order) {
          result = { order: data.order as Order, qikink: data.qikink };
        } else if (data?.error) {
          result = { order: localOrder, qikink: { success: false, mode: 'error', message: data.error } };
        }
      } catch {
        // Fall through with the offline result.
      }

      setOrders((prev) => [result.order, ...prev]);
      clearCart();
      return result;
    },
    [buildOrder, clearCart]
  );

  const getOrder = useCallback(
    (orderId: string) => {
      const query = orderId.trim().toUpperCase();
      return orders.find(
        (o) =>
          o.id.toUpperCase() === query ||
          o.trackingNumber.toUpperCase() === query ||
          o.customerPhone.includes(query)
      );
    },
    [orders]
  );

  const updateOrderStatus = useCallback(
    (orderId: string, status: Order['status'], trackingNumber?: string, courierName?: string) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status,
                ...(trackingNumber ? { trackingNumber } : {}),
                ...(courierName ? { courierName } : {}),
              }
            : o
        )
      );
    },
    []
  );

  const addReview = useCallback((draft: Omit<Review, 'id' | 'date'>) => {
    setReviews((prev) => [{ ...draft, id: `rev-${Date.now()}`, date: 'Just now' }, ...prev]);
  }, []);

  // --- Admin product CRUD (persisted through API + localStorage backup) ---
  const saveProduct = useCallback(async (product: Product) => {
    // 1. Immediately update local state & localStorage backup
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      const updated = exists ? prev.map((p) => (p.id === product.id ? product : p)) : [product, ...prev];
      try {
        const localCustom = readJson<Product[]>('hotbee_custom_products', []);
        const cExists = localCustom.some((p) => p.id === product.id);
        const nextCustom = cExists
          ? localCustom.map((p) => (p.id === product.id ? product : p))
          : [product, ...localCustom];
        localStorage.setItem('hotbee_custom_products', JSON.stringify(nextCustom));
      } catch {}
      return updated;
    });

    // 2. Persist to Supabase API
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      const data = await res.json();
      if (res.ok && data?.product) {
        const saved: Product = data.product;
        setProducts((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      }
      return { success: true };
    } catch {
      return { success: true };
    }
  }, []);

  const deleteProduct = useCallback(async (productId: string) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== productId);
      try {
        const localCustom = readJson<Product[]>('hotbee_custom_products', []);
        const nextCustom = localCustom.filter((p) => p.id !== productId);
        localStorage.setItem('hotbee_custom_products', JSON.stringify(nextCustom));
      } catch {}
      return updated;
    });

    try {
      await fetch(`/api/products?id=${encodeURIComponent(productId)}`, { method: 'DELETE' });
    } catch {}
    return { success: true };
  }, []);

  // --- Admin session ---
  const loginAdmin = useCallback(async (pin: string) => {
    try {
      const res = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) return { success: false, message: data?.error || 'Incorrect Access PIN.' };

      setIsAdminLoggedIn(true);
      return { success: true };
    } catch {
      return { success: false, message: 'Network error. Please try again.' };
    }
  }, []);

  const logoutAdmin = useCallback(async () => {
    try {
      await fetch('/api/admin/session', { method: 'DELETE' });
    } catch {}
    setIsAdminLoggedIn(false);
  }, []);

  const value = useMemo<StoreContextType>(
    () => ({
      products,
      productsLoading,
      catalogSource,
      cart,
      wishlist,
      appliedCoupon,
      orders,
      reviews,
      isCartOpen,
      isAdminLoggedIn,
      adminChecked,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      setIsCartOpen,
      applyCoupon,
      removeCoupon,
      toggleWishlist,
      isInWishlist,
      createOrder,
      placeOrder,
      getOrder,
      updateOrderStatus,
      addReview,
      refreshProducts,
      addProduct: saveProduct,
      updateProduct: saveProduct,
      deleteProduct,
      loginAdmin,
      logoutAdmin,
      subtotal,
      discountAmount,
      shippingFee,
      finalTotal,
    }),
    [
      products,
      productsLoading,
      catalogSource,
      cart,
      wishlist,
      appliedCoupon,
      orders,
      reviews,
      isCartOpen,
      isAdminLoggedIn,
      adminChecked,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      applyCoupon,
      removeCoupon,
      toggleWishlist,
      isInWishlist,
      createOrder,
      placeOrder,
      getOrder,
      updateOrderStatus,
      addReview,
      refreshProducts,
      saveProduct,
      deleteProduct,
      loginAdmin,
      logoutAdmin,
      subtotal,
      discountAmount,
      shippingFee,
      finalTotal,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
