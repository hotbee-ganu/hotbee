'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  ArrowRight, Sparkles, ShieldCheck, Zap, Star,
  Flame, CheckCircle, Truck, ShoppingBag, RotateCcw,
  TrendingUp, Users, Package, Award,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { ProductCard } from '@/components/ProductCard';
import { INITIAL_CATEGORIES } from '@/lib/mockData';

const ThreeProductStage = dynamic(() => import('@/components/ThreeProductStage'), {
  ssr: false,
  loading: () => (
    <div className="relative aspect-[4/5] rounded-3xl overflow-hidden glass-panel border border-hotbee-500/30 flex flex-col items-center justify-center p-6 text-center space-y-3">
      <div className="w-10 h-10 border-2 border-hotbee-500 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-bold text-hotbee-500 tracking-wider uppercase">Loading 3D Stage…</span>
    </div>
  ),
});

/* ── Animated Counter ─────────────────────────────── */
function AnimatedCounter({ target, suffix = '', prefix = '' }: { target: number; suffix?: string; prefix?: string }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1600;
          const steps = 60;
          const increment = target / steps;
          let step = 0;
          const timer = setInterval(() => {
            step++;
            setCurrent(Math.min(Math.round(increment * step), target));
            if (step >= steps) clearInterval(timer);
          }, duration / steps);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{current.toLocaleString('en-IN')}{suffix}
    </span>
  );
}

/* ── Stats data ───────────────────────────────────── */
const STATS = [
  { icon: Users,     value: 4800,  suffix: '+', label: 'Happy Customers' },
  { icon: Package,   value: 12000, suffix: '+', label: 'Orders Fulfilled' },
  { icon: Star,      value: 4.9,   suffix: '★', label: 'Average Rating',  isDecimal: true },
  { icon: TrendingUp,value: 98,    suffix: '%', label: 'Satisfaction Rate' },
];

export default function HomePage() {
  const { products, reviews } = useStore();
  const trendingProducts = products.filter((p) => p.isTrending || p.isNew).slice(0, 4);

  return (
    <div className="pb-20">

      {/* ══════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════ */}
      <section className="relative pt-10 pb-28 overflow-hidden">
        {/* Multi-layer background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-radial from-hotbee-500/18 via-amber-500/6 to-transparent rounded-full blur-3xl" />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-radial from-amber-600/10 to-transparent rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-gradient-radial from-hotbee-500/8 to-transparent rounded-full blur-2xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

            {/* ── LEFT: HERO TEXT ── */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">

              {/* Badge */}
              <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 rounded-full bg-hotbee-surface border border-hotbee-500/35 text-hotbee-500 text-xs font-extrabold uppercase tracking-widest backdrop-blur-md shadow-glow-gold-sm">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                <span>Next-Gen Print-on-Demand Streetwear</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-hotbee-500 animate-ping" />
              </div>

              {/* H1 */}
              <h1 className="hero-h1 text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.05]">
                FEEL THE{' '}
                <span className="text-shimmer block sm:inline">STREETWEAR</span>{' '}
                <span className="text-gradient-gold">REVOLUTION.</span>
              </h1>

              {/* Description */}
              <p className="hero-desc text-sm sm:text-base text-gray-300 max-w-xl leading-relaxed font-light mx-auto lg:mx-0">
                Heavyweight <strong className="text-white font-semibold">240 GSM combed cotton</strong> oversized tees,
                fleece-lined hoodies, and metallic embroidered accessories crafted for ultra-durability
                and supreme comfort. Printed on-demand, shipped express across India.
              </p>

              {/* Feature Pills */}
              <div className="hero-pills flex flex-wrap justify-center lg:justify-start gap-3 text-xs font-semibold text-gray-300 pt-1">
                {[
                  { icon: CheckCircle, text: '100% Combed Cotton' },
                  { icon: Zap,         text: 'Qikink DTF Print' },
                  { icon: Truck,       text: 'Express All-India' },
                  { icon: Award,       text: '30+ Wash Durability' },
                ].map(({ icon: Icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-hotbee-darker/60 border border-hotbee-500/18 hover:border-hotbee-500/40 transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5 text-hotbee-500" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              {/* CTAs */}
              <div className="hero-ctas flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  id="hero-shop-cta"
                  href="/products"
                  className="glass-btn-primary px-8 py-4 rounded-full font-extrabold text-sm flex items-center gap-3 shadow-glow-gold hover:scale-105 transition-all w-full sm:w-auto justify-center"
                >
                  <ShoppingBag className="w-5 h-5 text-black" />
                  <span>Explore Collection</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </Link>

                <Link
                  id="hero-track-cta"
                  href="/track-order"
                  className="glass-btn-secondary px-8 py-4 rounded-full font-bold text-sm flex items-center gap-2 hover:scale-105 transition-all w-full sm:w-auto justify-center"
                >
                  <Truck className="w-4 h-4 text-hotbee-500" />
                  <span>Track Your Order</span>
                </Link>
              </div>

              {/* Trust signals */}
              <div className="hero-trust flex items-center gap-4 justify-center lg:justify-start pt-2">
                <div className="flex -space-x-2">
                  {[
                    'https://images.unsplash.com/photo-1529665253569-6d01c0eaf7b6?w=80&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&fit=crop&q=80',
                    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&auto=format&fit=crop&q=80',
                  ].map((src, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-hotbee-darker overflow-hidden relative"
                    >
                      <Image src={src} alt="Customer" fill className="object-cover" sizes="32px" />
                    </div>
                  ))}
                </div>
                <div className="text-xs">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="font-extrabold text-white ml-1">4.9</span>
                  </div>
                  <p className="text-gray-400 font-light">
                    Loved by <span className="text-white font-semibold">4,800+</span> buyers across India
                  </p>
                </div>
              </div>
            </div>

            {/* ── RIGHT: 3D STAGE ── */}
            <div className="lg:col-span-5 hero-stage relative space-y-3">
              <ThreeProductStage
                imageUrl={products[0]?.images[0] || '/logo-256.jpg'}
                secondaryImageUrl={products[0]?.images[1] || products[0]?.images[0]}
                title={products[0]?.title || 'HOTBEE Cyber Honey Tee'}
                price={products[0]?.price || 1199}
                category={products[0]?.category || 'Oversized Streetwear'}
              />

              {/* Floating spec card */}
              <div className="glass-panel p-3 sm:p-4 rounded-2xl border border-hotbee-500/22 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-hotbee-500 block truncate">
                    Real 3D Interactive Model • Drag to Spin
                  </span>
                  <p className="text-xs font-bold text-white truncate mt-0.5">
                    {products[0]?.title || 'HOTBEE Cyber Honey Tee'}
                  </p>
                </div>
                <Link
                  id="hero-stage-order-btn"
                  href={`/products/${products[0]?.id || 'hb-001'}`}
                  className="glass-btn-primary px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shrink-0 shadow-glow-gold hover:scale-105 active:scale-95 transition-all"
                >
                  <span>Order Now</span>
                  <ArrowRight className="w-3.5 h-3.5 text-black" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          LIVE STATS BAR
      ══════════════════════════════════════════════ */}
      <section className="defer-paint max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STATS.map(({ icon: Icon, value, suffix, label, isDecimal }) => (
            <div
              key={label}
              className="glass-card card-shine p-5 rounded-2xl text-center border border-hotbee-500/18 group"
            >
              <div className="w-10 h-10 rounded-xl bg-hotbee-500/10 border border-hotbee-500/20 flex items-center justify-center mx-auto mb-3 group-hover:bg-hotbee-500/20 transition-colors">
                <Icon className="w-5 h-5 text-hotbee-500" />
              </div>
              <div className="text-2xl font-extrabold text-white mb-1 stat-number">
                {isDecimal ? (
                  <span>{value}{suffix}</span>
                ) : (
                  <AnimatedCounter target={value as number} suffix={suffix} />
                )}
              </div>
              <p className="text-[11px] text-gray-400 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CATEGORIES GRID
      ══════════════════════════════════════════════ */}
      <section className="defer-paint max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="flex justify-between items-end mb-10">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-hotbee-500">
              Curated Drops
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Shop by Category
            </h2>
            <div className="divider-gold mt-2 w-24" />
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-hotbee-500 hover:text-white transition-colors flex items-center gap-1 glass-btn-secondary px-4 py-2 rounded-full"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {INITIAL_CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group glass-card card-shine rounded-2xl overflow-hidden relative aspect-[4/5] block border border-hotbee-500/18 hover:border-hotbee-500/55 transition-all duration-300 scan-line"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                loading="lazy"
                className="object-cover group-hover:scale-108 transition-transform duration-700 opacity-65 group-hover:opacity-88"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-hotbee-darker via-black/35 to-transparent" />
              {/* Glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-hotbee-500/10 to-transparent" />

              <div className="absolute bottom-5 left-5 right-5 space-y-1.5">
                <span className="text-[10px] uppercase tracking-widest font-extrabold text-black bg-hotbee-500 px-2.5 py-0.5 rounded-full inline-block">
                  {cat.itemCount} Items
                </span>
                <h3 className="text-lg font-extrabold text-white group-hover:text-hotbee-500 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-300 line-clamp-1 font-light opacity-0 group-hover:opacity-100 transition-opacity">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          TRENDING PRODUCTS
      ══════════════════════════════════════════════ */}
      <section className="defer-paint max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="flex justify-between items-end mb-10">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-hotbee-500 flex items-center gap-1.5">
              <Flame className="w-4 h-4 animate-pulse" /> Trending Now
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Top Streetwear Additions
            </h2>
            <div className="divider-gold mt-2 w-24" />
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-hotbee-500 hover:text-white transition-colors flex items-center gap-1 glass-btn-secondary px-4 py-2 rounded-full"
          >
            See All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {trendingProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 2} />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          QIKINK POD AUTOMATION BANNER
      ══════════════════════════════════════════════ */}
      <section className="defer-paint max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="glass-panel p-8 sm:p-14 rounded-3xl border border-hotbee-500/28 relative overflow-hidden">
          {/* Background layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-hotbee-darker via-[#0f1118] to-hotbee-surface" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-hotbee-500/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
            <div className="space-y-5">
              <span className="text-xs font-extrabold uppercase tracking-widest text-hotbee-500 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Powered by Qikink Print-on-Demand
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
                AUTOMATED{' '}
                <span className="text-gradient-fire">FULFILLMENT.</span>
                <br />ZERO COMPROMISE ON QUALITY.
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed font-light max-w-md">
                Every HOTBEE piece is printed on-demand using state-of-the-art DTF printing from Qikink.
                We use 100% bio-washed combed cotton to ensure zero shrinkage and ultra-vibrant colors that last wash after wash.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { stat: '24H', label: 'Factory print & dispatch' },
                  { stat: '30+', label: 'Tested wash durability' },
                  { stat: '99%', label: 'Order accuracy rate' },
                  { stat: '0%', label: 'Inventory risk' },
                ].map(({ stat, label }) => (
                  <div key={label} className="p-4 rounded-xl bg-hotbee-darker/80 border border-hotbee-500/18 hover:border-hotbee-500/40 transition-colors">
                    <div className="text-xl font-extrabold text-hotbee-500">{stat}</div>
                    <p className="text-xs text-gray-400 mt-0.5 font-light">{label}</p>
                  </div>
                ))}
              </div>

              <Link
                href="/products"
                className="glass-btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-full font-extrabold text-sm shadow-glow-gold hover:scale-105 transition-all"
              >
                <ShoppingBag className="w-4 h-4 text-black" />
                <span>Shop the Collection</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </Link>
            </div>

            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-hotbee-500/20">
              <Image
                src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=900&auto=format&fit=crop&q=80"
                alt="Qikink POD print quality"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                loading="lazy"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              {/* Floating stat badges */}
              <div className="absolute top-4 left-4">
                <div className="glass-panel glass-blur px-3 py-2 rounded-xl border border-hotbee-500/30 float-badge">
                  <div className="text-xs font-extrabold text-hotbee-500">⚡ Live Sync</div>
                  <div className="text-[10px] text-gray-300">Orders auto-pushed to Qikink</div>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="glass-panel glass-blur px-4 py-3 rounded-xl border border-hotbee-500/25 flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-white">100% Automated Order Sync</div>
                    <div className="text-[10px] text-gray-400">Direct courier shipping with real-time tracking</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CUSTOMER REVIEWS
      ══════════════════════════════════════════════ */}
      <section className="defer-paint max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-hotbee-500">
            Real Buyer Feedback
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            Loved by Streetwear Enthusiasts Across India
          </h2>
          <div className="divider-gold mt-4 w-40 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {reviews.map((rev) => (
            <div key={rev.id} className="glass-card card-shine p-6 rounded-2xl space-y-4 border border-hotbee-500/14 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-[10px] text-gray-500">{rev.date}</span>
              </div>

              <h4 className="font-bold text-white text-sm group-hover:text-hotbee-500 transition-colors">{rev.title}</h4>
              <p className="text-xs text-gray-300 leading-relaxed font-light">
                &ldquo;{rev.comment}&rdquo;
              </p>

              <div className="pt-3 border-t border-hotbee-500/10 flex items-center justify-between text-xs">
                <span className="font-bold text-white">{rev.author}</span>
                {rev.verifiedPurchase && (
                  <span className="text-[10px] text-green-400 flex items-center gap-1 font-semibold">
                    <ShieldCheck className="w-3 h-3" /> Verified Buyer
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          WHY HOTBEE — FEATURES GRID
      ══════════════════════════════════════════════ */}
      <section className="defer-paint max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="text-center mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-hotbee-500">
            The HOTBEE Difference
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            Why Thousands Choose Us
          </h2>
          <div className="divider-gold mt-4 w-40 mx-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: Package,
              title: 'Premium 240 GSM Fabric',
              desc: 'Heavyweight combed cotton that doesn\'t shrink, pill, or fade. Bio-washed for perfect softness.',
              color: 'from-amber-500/10 to-orange-500/5',
            },
            {
              icon: Zap,
              title: 'DTF Print Technology',
              desc: 'Direct-to-film printing ensures photographic-quality designs that outlast 30+ wash cycles.',
              color: 'from-yellow-500/10 to-amber-500/5',
            },
            {
              icon: Truck,
              title: 'Express All-India Delivery',
              desc: 'Orders dispatched within 24 hours. Real-time tracking via AWB throughout the journey.',
              color: 'from-hotbee-500/10 to-amber-500/5',
            },
            {
              icon: ShieldCheck,
              title: 'Razorpay Secure Checkout',
              desc: 'Pay via UPI, Debit/Credit Cards, Net Banking, Wallets, or EMI — all 100% secure.',
              color: 'from-green-500/10 to-emerald-500/5',
            },
            {
              icon: RotateCcw,
              title: 'Quality Guarantee',
              desc: 'Not satisfied with print quality? We\'ll make it right. No questions asked on print defects.',
              color: 'from-blue-500/10 to-cyan-500/5',
            },
            {
              icon: Award,
              title: 'Exclusive Limited Drops',
              desc: 'Join the HOTBEE VIP Club for early access to limited acid-wash drops and secret codes.',
              color: 'from-purple-500/10 to-indigo-500/5',
            },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className={`glass-card card-shine p-6 rounded-2xl border border-hotbee-500/14 group bg-gradient-to-br ${color} relative overflow-hidden`}>
              <div className="w-12 h-12 rounded-2xl bg-hotbee-darker/80 border border-hotbee-500/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-hotbee-500/50 transition-all">
                <Icon className="w-6 h-6 text-hotbee-500" />
              </div>
              <h3 className="font-extrabold text-white text-sm mb-2 group-hover:text-hotbee-500 transition-colors">{title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed font-light">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          NEWSLETTER BANNER
      ══════════════════════════════════════════════ */}
      <section className="defer-paint max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 sm:p-14 rounded-3xl border border-hotbee-500/28 text-center space-y-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-hotbee-surface via-hotbee-darker to-[#040507]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-hotbee-500/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-hotbee-500/10 text-hotbee-500 border border-hotbee-500/30 mx-auto flex items-center justify-center glow-pulse">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                JOIN THE <span className="text-shimmer">HOTBEE VIP</span> CLUB
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto font-light mt-3 leading-relaxed">
                Subscribe for early access to limited acid-wash drops, secret discount codes,
                and streetwear restock alerts. <strong className="text-white">No spam, only drops.</strong>
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert('🐝 Welcome to the HOTBEE VIP Club! Exclusive drops incoming.');
              }}
              className="max-w-md mx-auto flex gap-2"
            >
              <input
                id="newsletter-email"
                type="email"
                placeholder="Enter your email address…"
                required
                className="glass-input rounded-full px-5 py-3.5 text-xs flex-1 font-medium"
              />
              <button
                type="submit"
                id="newsletter-subscribe-btn"
                className="glass-btn-primary px-6 py-3.5 rounded-full text-xs font-extrabold shrink-0 shadow-glow-gold"
              >
                Subscribe
              </button>
            </form>

            <p className="text-[10px] text-gray-500">
              By subscribing, you agree to receive marketing emails from HOTBEE. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
