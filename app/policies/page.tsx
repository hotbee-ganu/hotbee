'use client';

import React, { useState } from 'react';
import { Shield, Truck, RotateCcw, FileText } from 'lucide-react';

export default function PoliciesPage() {
  const [tab, setTab] = useState<'privacy' | 'terms' | 'refund' | 'shipping'>('privacy');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center max-w-lg mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-hotbee-500">Legal & Terms</span>
        <h1 className="text-3xl font-extrabold text-white">HOTBEE Platform Policies</h1>
      </div>

      <div className="flex border-b border-hotbee-500/20 gap-4 overflow-x-auto pb-2">
        <button
          onClick={() => setTab('privacy')}
          className={`px-4 py-2 text-xs font-bold rounded-full transition-all shrink-0 ${
            tab === 'privacy' ? 'glass-btn-primary shadow-glow-gold' : 'glass-btn-secondary text-gray-300'
          }`}
        >
          Privacy Policy
        </button>
        <button
          onClick={() => setTab('terms')}
          className={`px-4 py-2 text-xs font-bold rounded-full transition-all shrink-0 ${
            tab === 'terms' ? 'glass-btn-primary shadow-glow-gold' : 'glass-btn-secondary text-gray-300'
          }`}
        >
          Terms of Service
        </button>
        <button
          onClick={() => setTab('refund')}
          className={`px-4 py-2 text-xs font-bold rounded-full transition-all shrink-0 ${
            tab === 'refund' ? 'glass-btn-primary shadow-glow-gold' : 'glass-btn-secondary text-gray-300'
          }`}
        >
          Refund & Returns
        </button>
        <button
          onClick={() => setTab('shipping')}
          className={`px-4 py-2 text-xs font-bold rounded-full transition-all shrink-0 ${
            tab === 'shipping' ? 'glass-btn-primary shadow-glow-gold' : 'glass-btn-secondary text-gray-300'
          }`}
        >
          Shipping & POD
        </button>
      </div>

      <div className="glass-panel p-8 rounded-3xl border border-hotbee-500/20 text-xs text-gray-300 space-y-4 leading-relaxed">
        {tab === 'privacy' && (
          <div className="space-y-3">
            <h3 className="text-base font-extrabold text-white">Privacy Policy</h3>
            <p>At HOTBEE, accessible from hotbee.in, protecting your privacy is our top priority. We collect only necessary operational details (Name, Shipping Address, Phone Number, Email) required to fulfill your print-on-demand orders via Qikink and process secure payments through Razorpay.</p>
            <p>We do not sell, rent, or lease your personal data to third parties. All payment credentials are encrypted by Razorpay&apos;s PCI-DSS compliant infrastructure.</p>
          </div>
        )}

        {tab === 'terms' && (
          <div className="space-y-3">
            <h3 className="text-base font-extrabold text-white">Terms of Service</h3>
            <p>By placing an order on HOTBEE, you agree to these Terms. All apparel graphics, logo designs, and content are protected trademarks of HOTBEE Commerce Platform.</p>
            <p>Order cancellations are accepted within 2 hours of placement before automated Qikink factory printing begins.</p>
          </div>
        )}

        {tab === 'refund' && (
          <div className="space-y-3">
            <h3 className="text-base font-extrabold text-white">Refund & Return Policy</h3>
            <p>Since HOTBEE items are custom printed on-demand, returns are accepted in the case of manufacturing defects, sizing errors, or print damage.</p>
            <p>If you receive a defective item, please notify us within 7 days at hotbee@gmail.com with an unboxing video or photo for an immediate free replacement.</p>
          </div>
        )}

        {tab === 'shipping' && (
          <div className="space-y-3">
            <h3 className="text-base font-extrabold text-white">Shipping & POD Policy</h3>
            <p>Orders are dispatched directly from the Qikink Print-on-Demand factory within 24 to 48 hours of order placement.</p>
            <p>Standard delivery across Metro cities takes 2–4 business days. All orders over ₹999 qualify for FREE Express Shipping.</p>
          </div>
        )}
      </div>
    </div>
  );
}
