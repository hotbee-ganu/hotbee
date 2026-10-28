'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  ShoppingBag, Heart, Search, Menu, X,
  ShieldCheck, Truck, Sparkles,
} from 'lucide-react';
import { useStore } from '@/lib/store';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { cart, wishlist, setIsCartOpen } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;

  // Navbar scroll elevation
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Auto-focus search input when modal opens
  useEffect(() => {
    if (showSearchModal) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [showSearchModal]);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop All', href: '/products' },
    { label: 'Oversized Tees', href: '/products?category=Oversized+Tees' },
    { label: 'Hoodies', href: '/products?category=Premium+Hoodies' },
    { label: 'Track Order', href: '/track-order' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <>
      {/* ── ANIMATED TICKER BANNER ─────────────────────── */}
      <div
        className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-hotbee-500 to-yellow-500 text-black font-bold text-[11px] py-2 select-none"
        aria-label="Promotional announcement"
      >
        {/* Shimmer sweep */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_3s_ease_infinite]" />
        <div className="ticker-track">
          {[...Array(2)].map((_, gi) => (
            <div key={gi} className="flex items-center gap-8 px-4">
              {[
                '⚡ FLAT ₹200 OFF — Use code WELCOME200',
                '🚚 Express Shipping Across India',
                '🔥 240 GSM Premium Combed Cotton',
                '✅ 30-Day Print Durability Guarantee',
                '🎯 Qikink DTF Automated Fulfillment',
                '💳 UPI · Cards · EMI — All Accepted',
              ].map((item, i) => (
                <span key={i} className="flex items-center gap-2 whitespace-nowrap font-extrabold tracking-wide">
                  {item}
                  <span className="text-black/30 mx-2">•</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN NAVBAR ─────────────────────────────────── */}
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-hotbee-darker/92 backdrop-blur-2xl border-b border-hotbee-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.7)]'
            : 'bg-hotbee-darker/70 backdrop-blur-xl border-b border-hotbee-500/10'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between gap-4">

          {/* ── LOGO ── */}
          <Link href="/" className="flex items-center gap-3 group shrink-0" aria-label="HOTBEE – Home">
            {/* Animated spinning ring border */}
            <div className="relative w-11 h-11 shrink-0">
              <div className="absolute inset-0 rounded-full bg-conic-gradient from-hotbee-500 via-amber-300 to-hotbee-500 animate-[spin-slow_3s_linear_infinite] opacity-90" />
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'conic-gradient(#ff9d00, #ffd000, #ffb800, #ff6600, #ff9d00)',
                  animation: 'spin-slow 3s linear infinite',
                  padding: '2px',
                }}
              >
                <div className="w-full h-full rounded-full bg-hotbee-darker overflow-hidden">
                  <Image
                    src="/logo-256.jpg"
                    alt="HOTBEE"
                    width={44}
                    height={44}
                    className="rounded-full object-cover w-full h-full"
                    priority
                  />
                </div>
              </div>
              {/* Glow */}
              <div className="absolute inset-0 rounded-full shadow-[0_0_18px_rgba(255,157,0,0.6)] pointer-events-none" />
            </div>

            <div className="flex flex-col leading-none">
              <span className="font-extrabold text-[22px] tracking-tight text-gradient-gold group-hover:text-shimmer transition-all">
                HOTBEE
              </span>
              <span className="text-[9px] uppercase tracking-[0.2em] text-amber-500/70 font-bold -mt-0.5">
                Luxury POD Streetwear
              </span>
            </div>
          </Link>

          {/* ── DESKTOP NAV ── */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) => {
              const [linkPath, linkQuery] = link.href.split('?');
              const linkCategory = new URLSearchParams(linkQuery).get('category');
              const isActive =
                pathname === linkPath &&
                (linkPath !== '/products' || (searchParams.get('category') || null) === linkCategory);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    isActive
                      ? 'text-hotbee-500 bg-hotbee-500/10'
                      : 'text-gray-300 hover:text-hotbee-500 hover:bg-hotbee-500/8'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-hotbee-500 to-amber-300 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ── ACTIONS ── */}
          <div className="flex items-center gap-2">

            {/* Search */}
            <button
              id="navbar-search-btn"
              onClick={() => setShowSearchModal(true)}
              className="p-2.5 rounded-full text-gray-300 hover:text-hotbee-500 hover:bg-hotbee-500/10 transition-all border border-transparent hover:border-hotbee-500/20"
              title="Search products"
              aria-label="Open product search"
            >
              <Search className="w-4.5 h-4.5" />
            </button>

            {/* Wishlist */}
            <Link
              href="/products"
              className="relative p-2.5 rounded-full text-gray-300 hover:text-hotbee-500 hover:bg-hotbee-500/10 transition-all border border-transparent hover:border-hotbee-500/20"
              title="Wishlist"
              aria-label={`Wishlist (${wishlistCount} items)`}
            >
              <Heart className="w-4.5 h-4.5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-hotbee-500 text-black font-extrabold text-[9px] w-4 h-4 rounded-full flex items-center justify-center animate-[scale-pop_0.3s_ease]">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart CTA */}
            <button
              id="navbar-cart-btn"
              onClick={() => setIsCartOpen(true)}
              className="glass-btn-primary px-4 py-2 rounded-full font-extrabold text-xs flex items-center gap-2 shadow-glow-gold hover:scale-105 active:scale-95 transition-all"
              aria-label={`Open cart (${cartCount} items)`}
            >
              <ShoppingBag className="w-4 h-4 text-black shrink-0" />
              <span className="hidden sm:inline text-black">Cart</span>
              {cartCount > 0 && (
                <span className="bg-black text-hotbee-500 font-extrabold text-[10px] px-1.5 py-0.5 rounded-full leading-none">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Admin */}
            <Link
              href="/admin/login"
              className="hidden lg:flex items-center p-2 rounded-full text-gray-400 hover:text-hotbee-500 transition-colors"
              title="Admin Dashboard Portal"
              aria-label="Admin Portal"
            >
              <ShieldCheck className="w-4.5 h-4.5 text-hotbee-500/70" />
            </Link>

            {/* Mobile menu toggle */}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 transition-all"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── MOBILE DRAWER ── */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-blur bg-hotbee-darker/97 border-t border-hotbee-500/15 px-5 py-6 space-y-1 animate-[fade-up_0.25s_ease]">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-200 hover:text-hotbee-500 py-3 px-3 rounded-xl hover:bg-hotbee-500/8 transition-all border-b border-hotbee-500/8"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 flex items-center gap-3">
              <Link
                href="/admin/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold text-hotbee-500 bg-hotbee-500/10 border border-hotbee-500/20"
              >
                <ShieldCheck className="w-4 h-4" /> Admin Portal
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── SEARCH MODAL ────────────────────────────────── */}
      {showSearchModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-lg flex items-start justify-center pt-20 px-4 animate-[fade-in_0.18s_ease]"
          onClick={(e) => { if (e.target === e.currentTarget) setShowSearchModal(false); }}
          role="dialog"
          aria-modal="true"
          aria-label="Product search"
        >
          <div className="glass-panel glass-blur max-w-xl w-full p-6 rounded-2xl shadow-glow-gold-lg animate-[scale-pop_0.25s_ease]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-hotbee-500" />
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-hotbee-500">
                  Search HOTBEE
                </h3>
              </div>
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <input
                ref={searchInputRef}
                id="product-search-input"
                type="text"
                placeholder="Search Oversized Tees, Hoodies, Drops…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
                    setShowSearchModal(false);
                  }
                  if (e.key === 'Escape') setShowSearchModal(false);
                }}
                className="w-full glass-input rounded-xl px-4 py-3.5 text-sm pr-12 font-medium"
              />
              <button
                onClick={() => {
                  window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
                  setShowSearchModal(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 glass-btn-primary p-2 rounded-lg"
                aria-label="Submit search"
              >
                <Search className="w-4 h-4 text-black" />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider self-center">Popular:</span>
              {['Cyber Honey', 'Onyx Hoodie', 'Acid Wash', 'Oversized Tee', 'DTF Print'].map((term) => (
                <Link
                  key={term}
                  href={`/products?search=${encodeURIComponent(term)}`}
                  onClick={() => setShowSearchModal(false)}
                  className="px-3 py-1 rounded-full text-[11px] font-bold text-gray-300 bg-hotbee-surface border border-hotbee-500/20 hover:border-hotbee-500/50 hover:text-hotbee-500 transition-all"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
