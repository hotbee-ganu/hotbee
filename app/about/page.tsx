import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, ShieldCheck, Zap, Heart } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="relative w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-hotbee-500 to-amber-300 shadow-glow-gold-lg mx-auto">
          <Image src="/logo-256.jpg" alt="HOTBEE Brand" width={80} height={80} className="rounded-full object-cover" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-hotbee-500">
          Our Brand Narrative
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">
          THE HOTBEE STORY
        </h1>
        <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-light">
          HOTBEE was born out of a desire to break away from fast-fashion compromises. We combine heavyweight 240 GSM combed cotton garments with automated Qikink print-on-demand technology to deliver luxury streetwear.
        </p>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-3xl border border-hotbee-500/20 space-y-3">
          <div className="p-3 rounded-full bg-hotbee-500/10 text-hotbee-500 border border-hotbee-500/20 w-fit">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-white">Zero Waste POD</h3>
          <p className="text-xs text-gray-300 leading-relaxed font-light">
            Every garment is printed on-demand only when an order is placed, eliminating deadstock and environmental waste.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-hotbee-500/20 space-y-3">
          <div className="p-3 rounded-full bg-hotbee-500/10 text-hotbee-500 border border-hotbee-500/20 w-fit">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-white">Heavyweight Fabrics</h3>
          <p className="text-xs text-gray-300 leading-relaxed font-light">
            We source 240 GSM 100% combed cotton and 350 GSM fleece so every piece feels substantial, durable, and luxurious.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-hotbee-500/20 space-y-3">
          <div className="p-3 rounded-full bg-hotbee-500/10 text-hotbee-500 border border-hotbee-500/20 w-fit">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-extrabold text-white">Amber Gold Vibe</h3>
          <p className="text-xs text-gray-300 leading-relaxed font-light">
            Inspired by precision, energy, and electric honey aesthetics, our graphics represent raw creativity.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl text-center space-y-4 border border-hotbee-500/30">
        <h2 className="text-2xl font-extrabold text-white">Ready to Upgrade Your Streetwear Wardrobe?</h2>
        <Link href="/products" className="glass-btn-primary inline-block px-8 py-3.5 rounded-full text-xs font-bold shadow-glow-gold">
          Explore HOTBEE Drops
        </Link>
      </div>

    </div>
  );
}
