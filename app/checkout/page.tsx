'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Lock, CreditCard, ShoppingBag, Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Realistic3DCard } from '@/components/Realistic3DCard';
import { triggerRazorpayPayment } from '@/lib/razorpay';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, discountAmount, shippingFee, finalTotal, placeOrder, appliedCoupon } = useStore();

  const [address, setAddress] = useState({
    fullName: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto" />
        <h2 className="text-2xl font-extrabold text-white">Your cart is empty</h2>
        <p className="text-xs text-gray-400">Please add items to your cart before proceeding to checkout.</p>
        <Link href="/products" className="glass-btn-primary inline-block px-8 py-3 rounded-full text-xs font-bold">
          Explore HOTBEE Catalog
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!address.fullName || !address.phone || !address.email || !address.street || !address.city || !address.pincode) {
      setErrorMsg('Please fill in all required shipping address fields.');
      return;
    }

    setIsProcessing(true);

    const orderItems = cart.map((item) => ({
      productId: item.product.id,
      productTitle: item.product.title,
      productImage: item.product.images[0],
      selectedColor: item.selectedColor,
      selectedSize: item.selectedSize,
      quantity: item.quantity,
      price: item.product.price
    }));

    const baseDraft = {
      customerName: address.fullName,
      customerEmail: address.email,
      customerPhone: address.phone,
      shippingAddress: address,
      items: orderItems,
      subtotal,
      discount: discountAmount,
      shippingFee,
      totalAmount: finalTotal,
      estimatedDelivery: '3 to 5 Days',
      status: 'placed' as const
    };

    if (paymentMethod === 'razorpay') {
      await triggerRazorpayPayment(
        {
          amount: finalTotal,
          receipt: `hb-${Date.now()}`,
          customerName: address.fullName,
          customerEmail: address.email,
          customerPhone: address.phone,
          description: `HOTBEE Order Payment (${orderItems.length} items)`
        },
        async (payment) => {
          // The server re-checks the signature before any print job is created.
          const result = await placeOrder(
            {
              ...baseDraft,
              paymentMethod: payment.simulated
                ? `Razorpay Demo Mode (ID: ${payment.paymentId})`
                : `Razorpay UPI / Cards (ID: ${payment.paymentId})`,
              paymentStatus: 'paid',
              razorpayPaymentId: payment.paymentId
            },
            {
              razorpayOrderId: payment.razorpayOrderId,
              razorpayPaymentId: payment.paymentId,
              razorpaySignature: payment.signature
            }
          );

          setIsProcessing(false);
          router.push(`/order-confirmation/${result.order.id}`);
        },
        (error) => {
          setIsProcessing(false);
          setErrorMsg(error || 'Payment failed or cancelled.');
        }
      );
    } else {
      const result = await placeOrder({
        ...baseDraft,
        paymentMethod: 'Cash on Delivery',
        paymentStatus: 'pending'
      });

      setIsProcessing(false);
      router.push(`/order-confirmation/${result.order.id}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-hotbee-500 flex items-center justify-center gap-1.5">
          <Lock className="w-4 h-4" /> 256-Bit Encrypted Secure Checkout
        </span>
        <h1 className="text-3xl font-extrabold text-white">Complete Your Order</h1>
      </div>

      {errorMsg && (
        <div className="max-w-4xl mx-auto p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form: Address & Payment */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Shipping Address Panel */}
          <div className="glass-panel p-6 rounded-3xl border border-hotbee-500/20 space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-hotbee-500" /> 1. Shipping Address Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={address.fullName}
                  onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Mobile Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="+91 77951 83353"
                  value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="rahul@example.com (for order & Qikink tracking updates)"
                value={address.email}
                onChange={(e) => setAddress({ ...address, email: e.target.value })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">Flat / Building / Street Address *</label>
              <input
                type="text"
                required
                placeholder="House No., Street Name, Colony"
                value={address.street}
                onChange={(e) => setAddress({ ...address, street: e.target.value })}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-xs"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">Pincode *</label>
                <input
                  type="text"
                  required
                  placeholder="560038"
                  value={address.pincode}
                  onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                  className="w-full glass-input rounded-xl px-3 py-2.5 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">City *</label>
                <input
                  type="text"
                  required
                  placeholder="Bengaluru"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  className="w-full glass-input rounded-xl px-3 py-2.5 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-300 block mb-1">State *</label>
                <input
                  type="text"
                  required
                  placeholder="Karnataka"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  className="w-full glass-input rounded-xl px-3 py-2.5 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Panel */}
          <div className="glass-panel p-6 rounded-3xl border border-hotbee-500/20 space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-hotbee-500" /> 2. Select Payment Method
            </h3>

            <div className="space-y-3">
              <label
                onClick={() => setPaymentMethod('razorpay')}
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'razorpay'
                    ? 'border-hotbee-500 bg-hotbee-500/10 shadow-glow-gold'
                    : 'border-hotbee-500/20 bg-hotbee-darker'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    className="accent-hotbee-500"
                  />
                  <div>
                    <h4 className="font-bold text-white text-xs">Razorpay Online Gateway</h4>
                    <p className="text-[11px] text-gray-400">Instant UPI (GPay/PhonePe), Credit/Debit Cards, NetBanking</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-hotbee-500 bg-hotbee-500/20 px-2 py-0.5 rounded-full border border-hotbee-500/30">
                  Recommended
                </span>
              </label>

              <label
                onClick={() => setPaymentMethod('cod')}
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-hotbee-500 bg-hotbee-500/10 shadow-glow-gold'
                    : 'border-hotbee-500/20 bg-hotbee-darker'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="accent-hotbee-500"
                  />
                  <div>
                    <h4 className="font-bold text-white text-xs">Cash on Delivery (COD)</h4>
                    <p className="text-[11px] text-gray-400">Pay cash directly upon delivery by courier</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

        </div>

        {/* Right Summary Sidebar */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-hotbee-500/30 space-y-4 shadow-glow-gold-lg sticky top-28">
            <h3 className="text-base font-extrabold text-white border-b border-hotbee-500/15 pb-3">
              Order Summary ({cart.length} items)
            </h3>

            {/* Line Items */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <Realistic3DCard className="shrink-0" maxTilt={14} scale={1.08}>
                    <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-hotbee-darker">
                      <Image src={item.product.images[0]} alt={item.product.title} fill className="object-cover" />
                    </div>
                  </Realistic3DCard>
                  <div className="flex-1">
                    <h4 className="font-bold text-white line-clamp-1">{item.product.title}</h4>
                    <span className="text-[11px] text-gray-400">Qty: {item.quantity} | {item.selectedSize} | {item.selectedColor}</span>
                  </div>
                  <span className="font-bold text-white">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            {/* Numbers Breakdown */}
            <div className="space-y-2 text-xs border-t border-hotbee-500/15 pt-4 text-gray-300">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-white">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-hotbee-500">
                  <span>Coupon ({appliedCoupon.code})</span>
                  <span className="font-bold">-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-semibold text-white">
                  {shippingFee === 0 ? <span className="text-amber-400 font-bold">FREE</span> : `₹${shippingFee}`}
                </span>
              </div>

              <div className="flex justify-between pt-3 border-t border-hotbee-500/20 text-base font-extrabold text-white">
                <span>Total Amount Payable</span>
                <span className="text-xl text-gradient-gold">₹{finalTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Submit Order Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="glass-btn-primary w-full py-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-glow-gold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Processing Order & Syncing Qikink...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-black" />
                  <span>Pay ₹{finalTotal.toLocaleString('en-IN')} & Place Order</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-hotbee-500" />
              <span>Razorpay Verified • Qikink Factory Direct Dispatch</span>
            </div>

          </div>
        </div>

      </form>
    </div>
  );
}
