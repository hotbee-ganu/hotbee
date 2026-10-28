import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck, Truck, RotateCcw, Zap,
  Instagram, Mail, Phone, MapPin, MessageCircle,
  ArrowRight, Sparkles,
} from 'lucide-react';
import { SITE, mailHref, telHref } from '@/lib/siteConfig';

export const Footer: React.FC = () => {
  return (
    <footer className="relative overflow-hidden text-gray-400 text-sm" aria-label="Site footer">
      {/* Ambient glow layers */}
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-hotbee-500/4 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-amber-500/3 rounded-full blur-2xl pointer-events-none" />

      {/* ── TRUST STRIP ─────────────────────────────────────────── */}
      <div className="border-b border-hotbee-500/10 bg-gradient-to-r from-hotbee-darker via-[#0d1018] to-hotbee-darker relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: Zap,
              title: '24H Qikink POD Sync',
              desc: 'Automated printing & packing',
            },
            {
              icon: Truck,
              title: 'Express All-India Delivery',
              desc: 'Air shipping with real-time tracking',
            },
            {
              icon: ShieldCheck,
              title: 'Razorpay Secure Checkout',
              desc: 'UPI, Cards, Netbanking & EMI',
            },
            {
              icon: RotateCcw,
              title: 'Quality Guarantee',
              desc: '100% Cotton Bio-Washed Fabric',
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="flex items-center gap-4 p-4 glass-panel card-shine rounded-xl group border border-hotbee-500/14 hover:border-hotbee-500/35 transition-all"
            >
              <div className="p-3 rounded-xl bg-hotbee-500/10 text-hotbee-500 border border-hotbee-500/20 group-hover:bg-hotbee-500/18 transition-colors shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs">{title}</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN FOOTER ─────────────────────────────────────────── */}
      <div className="border-b border-hotbee-500/8 bg-gradient-to-b from-[#0a0d15] to-[#040507] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-5 gap-10">

          {/* Brand Block */}
          <div className="md:col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-3 group" aria-label="HOTBEE - Home">
              <div className="relative w-11 h-11 rounded-full p-[2px] shrink-0"
                style={{ background: 'conic-gradient(#ff9d00, #ffd000, #ffb800, #ff6600, #ff9d00)' }}>
                <div className="w-full h-full rounded-full overflow-hidden bg-hotbee-darker">
                  <Image
                    src="/logo-256.jpg"
                    alt="HOTBEE"
                    width={44}
                    height={44}
                    className="rounded-full object-cover w-full h-full"
                  />
                </div>
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-gradient-gold block group-hover:text-shimmer transition-all">
                  HOTBEE
                </span>
                <span className="text-[9px] uppercase tracking-widest text-amber-500/60 font-bold">
                  Luxury POD Streetwear
                </span>
              </div>
            </Link>

            <p className="text-xs text-gray-400 leading-relaxed pr-4 max-w-xs">
              HOTBEE is a luxury print-on-demand streetwear brand delivering heavyweight combed cotton
              oversized tees, fleece hoodies, and premium drop-shoulder aesthetic apparel — powered by
              Qikink automated print technology.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-2.5">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="HOTBEE on Instagram"
                className="p-2.5 rounded-xl bg-hotbee-surface border border-hotbee-500/18 text-gray-300 hover:text-hotbee-500 hover:border-hotbee-500/40 hover:scale-110 transition-all"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={mailHref}
                aria-label="Email HOTBEE support"
                className="p-2.5 rounded-xl bg-hotbee-surface border border-hotbee-500/18 text-gray-300 hover:text-hotbee-500 hover:border-hotbee-500/40 hover:scale-110 transition-all"
              >
                <Mail className="w-4 h-4" />
              </a>
              <a
                href={SITE.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Chat on WhatsApp"
                className="p-2.5 rounded-xl bg-green-500/10 border border-green-500/25 text-green-400 hover:bg-green-500/20 hover:scale-110 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>

            {/* CTA */}
            <Link
              href="/products"
              className="glass-btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-extrabold shadow-glow-gold hover:scale-105 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>Shop Collection</span>
              <ArrowRight className="w-3.5 h-3.5 text-black" />
            </Link>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-extrabold text-white text-[11px] uppercase tracking-widest mb-5 text-hotbee-500">
              Navigation
            </h4>
            <ul className="space-y-3 text-xs">
              {[
                ['/', 'Home Page'],
                ['/products', 'Shop Catalog'],
                ['/products?category=Oversized+Tees', 'Oversized Tees'],
                ['/products?category=Premium+Hoodies', 'Fleece Hoodies'],
                ['/track-order', 'Track Order Status'],
                ['/about', 'About HOTBEE'],
                ['/contact', 'Contact Us'],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="hover:text-hotbee-500 transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-hotbee-500/30 group-hover:bg-hotbee-500 transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-extrabold text-white text-[11px] uppercase tracking-widest mb-5 text-hotbee-500">
              Policies & Legal
            </h4>
            <ul className="space-y-3 text-xs">
              {[
                ['/policies#privacy',  'Privacy Policy'],
                ['/policies#terms',    'Terms of Service'],
                ['/policies#refund',   'Refund & Return Policy'],
                ['/policies#shipping', 'Shipping & Fulfillment'],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="hover:text-hotbee-500 transition-colors flex items-center gap-1.5 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-hotbee-500/30 group-hover:bg-hotbee-500 transition-colors" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-extrabold text-white text-[11px] uppercase tracking-widest mb-5 text-hotbee-500">
              Contact Support
            </h4>
            <ul className="space-y-4 text-xs">
              <li>
                <a href={mailHref} className="flex items-start gap-2.5 hover:text-hotbee-500 transition-colors group">
                  <Mail className="w-4 h-4 text-hotbee-500 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span className="break-all">{SITE.supportEmail}</span>
                </a>
              </li>
              <li>
                <a href={telHref} className="flex items-center gap-2.5 hover:text-hotbee-500 transition-colors group">
                  <Phone className="w-4 h-4 text-hotbee-500 shrink-0 group-hover:scale-110 transition-transform" />
                  <span>{SITE.supportPhoneDisplay}</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-hotbee-500 shrink-0 mt-0.5" />
                <span>HOTBEE HQ, Indiranagar, Bengaluru, KA 560038</span>
              </li>
            </ul>

            <a
              href={SITE.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-full bg-green-500/10 border border-green-500/25 text-green-400 text-xs font-bold hover:bg-green-500/20 hover:scale-105 transition-all"
              aria-label="WhatsApp HOTBEE Support"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp Support
            </a>
          </div>
        </div>
      </div>

      {/* ── COPYRIGHT BAR ───────────────────────────────────────── */}
      <div className="bg-[#030406] relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-500">
          <p>© 2026 HOTBEE Commerce Platform V1.0. All Rights Reserved.</p>
          <div className="flex items-center gap-3 text-gray-500">
            <span className="px-2 py-0.5 rounded bg-hotbee-500/10 text-hotbee-500/70 font-semibold text-[10px] uppercase tracking-wider">
              Next.js
            </span>
            <span className="text-gray-600">+</span>
            <span className="px-2 py-0.5 rounded bg-hotbee-500/10 text-hotbee-500/70 font-semibold text-[10px] uppercase tracking-wider">
              Qikink
            </span>
            <span className="text-gray-600">+</span>
            <span className="px-2 py-0.5 rounded bg-hotbee-500/10 text-hotbee-500/70 font-semibold text-[10px] uppercase tracking-wider">
              Razorpay
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
