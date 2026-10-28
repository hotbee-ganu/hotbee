'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, Tag, ArrowRight, ShoppingBag, Sparkles, CheckCircle } from 'lucide-react';
import { useStore } from '@/lib/store';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    appliedCoupon,
    subtotal,
    discountAmount,
    shippingFee,
    finalTotal
  } = useStore();

  const [couponCode, setCouponCode] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success?: boolean; message?: string }>({});

  if (!isCartOpen) return null;

  const freeShippingThreshold = 999;
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountNeededForFreeShipping = freeShippingThreshold - subtotal;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    const result = applyCoupon(couponCode);
    setCouponFeedback(result);
    if (result.success) {
      setCouponCode('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-hotbee-darker/95 backdrop-blur-2xl border-l border-hotbee-500/20 text-gray-100 flex flex-col shadow-glow-gold-lg">
          
          {/* Header */}
          <div className="p-6 border-b border-hotbee-500/15 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-hotbee-500" />
              <h2 className="text-lg font-extrabold uppercase tracking-wide text-gradient-gold">
                Your Cart ({cart.reduce((a, b) => a + b.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-hotbee-500/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Free Shipping Progress Indicator */}
          <div className="bg-hotbee-surface/60 px-6 py-3 border-b border-hotbee-500/10">
            {amountNeededForFreeShipping > 0 ? (
              <p className="text-xs text-gray-300">
                Add <span className="font-bold text-hotbee-500">₹{amountNeededForFreeShipping}</span> more to unlock <span className="text-amber-400 font-bold">FREE Express Delivery!</span>
              </p>
            ) : (
              <p className="text-xs text-amber-400 font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-hotbee-500" /> 🎉 You unlocked FREE Express Delivery!
              </p>
            )}
            <div className="w-full bg-gray-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-hotbee-500 to-yellow-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto" />
                <h3 className="text-base font-bold text-gray-300">Your cart is empty</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Explore our luxury print-on-demand streetwear collection and add your favorite apparel!
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="glass-btn-primary px-6 py-2.5 rounded-full text-xs font-bold"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div
                  key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}-${idx}`}
                  className="glass-panel p-3 rounded-xl flex gap-3 relative group"
                >
                  <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-hotbee-darker shrink-0">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start pr-6">
                        <h4 className="text-xs font-bold text-gray-100 line-clamp-1">
                          {item.product.title}
                        </h4>
                      </div>
                      <div className="flex gap-2 text-[11px] text-gray-400 mt-1">
                        <span>Color: <b className="text-gray-200">{item.selectedColor}</b></span>
                        <span>•</span>
                        <span>Size: <b className="text-gray-200">{item.selectedSize}</b></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2 bg-hotbee-darker rounded-lg p-1 border border-hotbee-500/10">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.selectedColor, item.selectedSize, item.quantity - 1)}
                          className="p-1 text-gray-400 hover:text-white"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold px-2">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.selectedColor, item.selectedSize, item.quantity + 1)}
                          className="p-1 text-gray-400 hover:text-white"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-sm font-extrabold text-white">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id, item.selectedColor, item.selectedSize)}
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-400 p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Coupon & Order Summary Footer */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-hotbee-500/15 bg-hotbee-darker space-y-4">
              
              {/* Coupon Form */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-hotbee-500/10 border border-hotbee-500/30 text-xs">
                  <div className="flex items-center gap-2 text-hotbee-500 font-bold">
                    <CheckCircle className="w-4 h-4" />
                    <span>Applied: {appliedCoupon.code}</span>
                    <span className="text-gray-400 font-normal">({appliedCoupon.description})</span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-gray-400 hover:text-red-400 text-[10px] uppercase font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. HOTBEE10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="w-full glass-input rounded-xl pl-9 pr-3 py-2 text-xs uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    className="glass-btn-secondary px-4 py-2 rounded-xl text-xs font-bold"
                  >
                    Apply
                  </button>
                </form>
              )}

              {couponFeedback.message && !appliedCoupon && (
                <p className={`text-[11px] ${couponFeedback.success ? 'text-green-400' : 'text-red-400'}`}>
                  {couponFeedback.message}
                </p>
              )}

              {/* Summary Numbers */}
              <div className="space-y-2 text-xs text-gray-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-hotbee-500">
                    <span>Discount</span>
                    <span className="font-bold">-₹{discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="font-semibold text-white">
                    {shippingFee === 0 ? <span className="text-amber-400 font-bold">FREE</span> : `₹${shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-hotbee-500/15 text-sm font-extrabold text-white">
                  <span>Total Amount</span>
                  <span className="text-base text-gradient-gold">₹{finalTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="glass-btn-primary w-full py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-glow-gold hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
