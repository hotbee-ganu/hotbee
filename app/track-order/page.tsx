'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Search, Truck, CheckCircle2, ExternalLink, Zap, AlertCircle } from 'lucide-react';
import { useStore } from '@/lib/store';
import { generateQikinkTimeline } from '@/lib/qikink';
import { Order } from '@/lib/types';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || '';

  const { getOrder } = useStore();
  const [queryId, setQueryId] = useState(initialId);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialId) {
      const found = getOrder(initialId);
      if (found) {
        setActiveOrder(found);
      }
      setSearched(true);
    }
  }, [initialId, getOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryId) return;
    const found = getOrder(queryId);
    setActiveOrder(found || null);
    setSearched(true);
  };

  const timelineSteps = activeOrder ? generateQikinkTimeline(activeOrder) : [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <span className="text-xs font-bold uppercase tracking-widest text-hotbee-500 flex items-center justify-center gap-1.5">
          <Truck className="w-4 h-4" /> Live Courier & Qikink Tracking
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          Track Your HOTBEE Order
        </h1>
        <p className="text-xs sm:text-sm text-gray-300 font-light">
          Enter your <b>Order ID</b> (e.g. HB-89421) or registered <b>Mobile Number</b> to check real-time factory printing & delivery status.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="glass-panel p-6 rounded-3xl border border-hotbee-500/30 max-w-2xl mx-auto shadow-glow-gold">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="e.g. HB-89421 or 7795183353"
              value={queryId}
              onChange={(e) => setQueryId(e.target.value)}
              className="w-full glass-input rounded-2xl pl-11 pr-4 py-3 text-xs uppercase"
            />
          </div>
          <button
            type="submit"
            className="glass-btn-primary px-8 py-3 rounded-2xl text-xs font-extrabold shrink-0"
          >
            Track Status
          </button>
        </form>
        <div className="flex justify-between items-center text-[10px] text-gray-400 mt-2 px-1">
          <span>Demo Order ID: <b className="text-hotbee-500 cursor-pointer" onClick={() => { setQueryId('HB-89421'); setActiveOrder(getOrder('HB-89421') || null); setSearched(true); }}>HB-89421</b></span>
          <span>Automatic Qikink Status Sync</span>
        </div>
      </div>

      {/* Tracking Results */}
      {searched && !activeOrder && (
        <div className="glass-panel p-8 rounded-3xl text-center space-y-3 border border-red-500/20 max-w-md mx-auto">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Order Not Found</h3>
          <p className="text-xs text-gray-400">No order matches ID &ldquo;{queryId}&rdquo;. Please verify your order confirmation email or phone number.</p>
        </div>
      )}

      {activeOrder && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Order Brief Box */}
          <div className="glass-panel p-6 rounded-3xl border border-hotbee-500/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-hotbee-500">
                Order Summary
              </span>
              <h3 className="text-lg font-extrabold text-white">
                Order #{activeOrder.id}
              </h3>
              <p className="text-xs text-gray-400">
                Customer: <b>{activeOrder.customerName}</b> ({activeOrder.customerEmail})
              </p>
            </div>

            <div className="sm:text-right">
              <span className="inline-block bg-hotbee-500/20 text-hotbee-500 border border-hotbee-500/30 text-xs font-extrabold uppercase px-3 py-1 rounded-full">
                Status: {activeOrder.status.replace('_', ' ')}
              </span>
              <p className="text-xs text-gray-300 mt-1">
                Est. Delivery: <b className="text-amber-400">{activeOrder.estimatedDelivery}</b>
              </p>
            </div>
          </div>

          {/* Timeline Visualizer */}
          <div className="glass-panel p-8 rounded-3xl border border-hotbee-500/30 space-y-8">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-hotbee-500" /> Fulfillment Timeline
            </h3>

            <div className="relative pl-6 border-l-2 border-hotbee-500/20 space-y-8">
              {timelineSteps.map((step, idx) => (
                <div key={idx} className="relative flex items-start gap-4">
                  <div
                    className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      step.completed
                        ? 'bg-hotbee-500 text-black shadow-glow-gold'
                        : 'bg-hotbee-darker border border-hotbee-500/30 text-gray-500'
                    }`}
                  >
                    {step.completed ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>

                  <div className="space-y-1">
                    <h4 className={`text-xs font-bold ${step.completed ? 'text-white' : 'text-gray-500'}`}>
                      {step.label}
                    </h4>
                    {step.date && (
                      <span className="text-[10px] text-hotbee-500 font-semibold block">
                        {step.date}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {activeOrder.courierName && (
              <div className="pt-4 border-t border-hotbee-500/15 flex items-center justify-between text-xs">
                <span>Courier Partner: <b className="text-white">{activeOrder.courierName}</b></span>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); alert(`Tracking reference ${activeOrder.trackingNumber} via ${activeOrder.courierName}`); }}
                  className="text-hotbee-500 font-bold flex items-center gap-1 hover:underline"
                >
                  Courier Tracking Link <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Items Summary */}
          <div className="glass-panel p-6 rounded-3xl border border-hotbee-500/20 space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">Items in Package</h4>
            <div className="divide-y divide-hotbee-500/10">
              {activeOrder.items.map((item, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-12 rounded-lg overflow-hidden bg-hotbee-darker shrink-0">
                      <Image src={item.productImage} alt={item.productTitle} fill className="object-cover" />
                    </div>
                    <div>
                      <h5 className="font-bold text-white">{item.productTitle}</h5>
                      <span className="text-[10px] text-gray-400">Qty: {item.quantity} | {item.selectedSize} | {item.selectedColor}</span>
                    </div>
                  </div>
                  <span className="font-extrabold text-white">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-hotbee-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-gray-400">Loading Order Tracker...</p>
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
