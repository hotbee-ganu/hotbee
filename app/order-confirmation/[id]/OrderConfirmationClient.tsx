'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { CheckCircle2, Truck, Printer, ArrowRight, Zap } from 'lucide-react';
import { useStore } from '@/lib/store';
import { Realistic3DCard } from '@/components/Realistic3DCard';

export default function OrderConfirmationClient({ orderId }: { orderId: string }) {
  const { getOrder } = useStore();
  const order = getOrder(orderId);

  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff9d00', '#ffd000', '#ffffff', '#e67e00']
      });
    } catch (e) {}
  }, []);

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Order Details Found</h2>
        <p className="text-xs text-gray-400">Order ID #{orderId} is registered in the system.</p>
        <Link href="/track-order" className="glass-btn-primary inline-block px-6 py-2.5 rounded-full text-xs font-bold">
          Go to Track Order Page
        </Link>
      </div>
    );
  }

  // Only claim a print job exists when Qikink actually returned an order id.
  const synced = Boolean(order.qikinkOrderId) && order.status !== 'placed';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      
      {/* Celebration Header */}
      <Realistic3DCard maxTilt={5} scale={1.01}>
      <div className="glass-panel p-8 sm:p-12 rounded-3xl text-center space-y-4 border border-hotbee-500/30 shadow-glow-gold-lg bg-gradient-to-b from-hotbee-surface to-hotbee-darker">
        <div className="w-16 h-16 rounded-full bg-hotbee-500/20 border border-hotbee-500/40 text-hotbee-500 mx-auto flex items-center justify-center animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-hotbee-500">
          {order.paymentStatus === 'paid' ? 'Payment Received' : 'Order Placed'}
          {synced ? ' & Sent to Printing' : ''}
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          THANK YOU FOR YOUR ORDER!
        </h1>
        <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto font-light">
          We have sent order confirmation details to <b className="text-white">{order.customerEmail}</b>. Your order is queued for printing.
        </p>

        <div className="inline-flex items-center gap-4 bg-hotbee-darker px-6 py-3 rounded-2xl border border-hotbee-500/20 text-xs text-gray-200">
          <div>Order ID: <b className="text-hotbee-500">{order.id}</b></div>
          <span>•</span>
          <div>Tracking No: <b className="text-white">{order.trackingNumber}</b></div>
        </div>
      </div>
      </Realistic3DCard>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Shipping & Delivery Box */}
        <div className="glass-panel p-6 rounded-3xl border border-hotbee-500/20 space-y-3">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-hotbee-500" /> Shipping & Delivery Address
          </h3>
          <div className="text-xs text-gray-300 space-y-1">
            <p className="font-bold text-white">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.street}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
            <p>Phone: {order.shippingAddress.phone}</p>
          </div>
          <div className="pt-2 border-t border-hotbee-500/10 text-xs">
            <span className="text-gray-400">Estimated Delivery: </span>
            <b className="text-amber-400">{order.estimatedDelivery}</b>
          </div>
        </div>

        {/* Qikink POD Status Box */}
        <div className="glass-panel p-6 rounded-3xl border border-hotbee-500/20 space-y-3">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-hotbee-500" /> Automated Qikink Status
          </h3>
          <div className="text-xs text-gray-300 space-y-2">
            <div className={`flex items-center gap-2 font-bold ${synced ? 'text-hotbee-500' : 'text-amber-400'}`}>
              <CheckCircle2 className="w-4 h-4" />
              <span>{synced ? 'Sent to Qikink Printing Engine' : 'Waiting to be sent to printing'}</span>
            </div>
            <p className="text-gray-400">Payment Status: <b className="text-white uppercase">{order.paymentStatus}</b> ({order.paymentMethod})</p>
            <p className="text-gray-400">Qikink Reference ID: <b className="text-white">{order.qikinkOrderId || 'Pending'}</b></p>
          </div>
        </div>

      </div>

      {/* Ordered Items Table */}
      <div className="glass-panel p-6 rounded-3xl border border-hotbee-500/20 space-y-4">
        <h3 className="text-sm font-extrabold text-white">Items in this Order</h3>
        <div className="divide-y divide-hotbee-500/10">
          {order.items.map((item, i) => (
            <div key={i} className="py-3 flex items-center gap-4 text-xs">
              <div className="relative w-12 h-14 rounded-lg overflow-hidden bg-hotbee-darker shrink-0">
                <Image src={item.productImage} alt={item.productTitle} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-white">{item.productTitle}</h4>
                <p className="text-gray-400">Size: {item.selectedSize} | Color: {item.selectedColor} | Qty: {item.quantity}</p>
              </div>
              <span className="font-extrabold text-white">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
            </div>
          ))}
        </div>

        {/* Pricing Breakdown */}
        <div className="border-t border-hotbee-500/15 pt-4 text-xs text-gray-300 space-y-1 text-right">
          <p>Subtotal: <b>₹{order.subtotal.toLocaleString('en-IN')}</b></p>
          {order.discount > 0 && <p className="text-hotbee-500">Discount: <b>-₹{order.discount.toLocaleString('en-IN')}</b></p>}
          <p>Shipping: <b>{order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</b></p>
          <p className="text-sm font-extrabold text-white pt-2">Total Amount Paid: <span className="text-gradient-gold">₹{order.totalAmount.toLocaleString('en-IN')}</span></p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Link
          href={`/track-order?id=${order.id}`}
          className="glass-btn-primary px-8 py-3.5 rounded-full font-bold text-xs flex items-center gap-2 shadow-glow-gold hover:scale-105 transition-all w-full sm:w-auto justify-center"
        >
          <Truck className="w-4 h-4 text-black" />
          <span>Track Delivery Live</span>
          <ArrowRight className="w-4 h-4 text-black" />
        </Link>

        <button
          onClick={() => window.print()}
          className="glass-btn-secondary px-8 py-3.5 rounded-full font-bold text-xs flex items-center gap-2 hover:scale-105 transition-all w-full sm:w-auto justify-center"
        >
          <Printer className="w-4 h-4 text-hotbee-500" />
          <span>Print / Download PDF Invoice</span>
        </button>
      </div>

    </div>
  );
}
