'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tag,
  Settings,
  LogOut,
  Store,
  ShieldCheck,
  Palette,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { useStore } from '@/lib/store';

const NAV_ITEMS = [
  { label: 'Overview',        short: 'Overview',  href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Designs',         short: 'Designs',   href: '/admin/designs',   icon: Palette },
  { label: 'Products',        short: 'Products',  href: '/admin/products',  icon: Package },
  { label: 'Orders & Qikink', short: 'Orders',    href: '/admin/orders',    icon: ShoppingCart },
  { label: 'Coupons & Promos',short: 'Coupons',   href: '/admin/coupons',   icon: Tag },
  { label: 'API Settings',    short: 'Settings',  href: '/admin/settings',  icon: Settings },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { logoutAdmin } = useStore();

  const handleLogout = async () => {
    await logoutAdmin();
    router.replace('/admin/login');
  };

  return (
    <>
      {/* ── MOBILE: horizontal pill tab bar ─────────────────── */}
      <nav
        aria-label="Admin sections"
        className="md:hidden sticky top-0 z-30 bg-hotbee-darker/97 backdrop-blur-xl border-b border-hotbee-500/20"
      >
        <div className="flex gap-2 overflow-x-auto px-3 py-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-extrabold transition-all ${
                  isActive
                    ? 'bg-hotbee-500 text-black shadow-glow-gold-sm'
                    : 'bg-hotbee-surface/60 text-gray-300 border border-hotbee-500/20 hover:border-hotbee-500/40 hover:text-hotbee-500'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-hotbee-500'}`} />
                <span>{item.short}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-extrabold bg-red-500/10 text-red-400 border border-red-500/22 hover:bg-red-500/18 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </nav>

      {/* ── DESKTOP: full sidebar ────────────────────────────── */}
      <aside className="hidden md:flex w-60 lg:w-64 flex-col justify-between shrink-0 min-h-[calc(100vh-5rem)] border-r border-hotbee-500/14 bg-gradient-to-b from-[#0a0d15] to-[#060709]">

        {/* Top section */}
        <div className="space-y-6 p-5">

          {/* Brand header */}
          <div className="flex items-center gap-3 pb-5 border-b border-hotbee-500/14">
            <div
              className="relative w-10 h-10 rounded-full shrink-0 p-[2px]"
              style={{ background: 'conic-gradient(#ff9d00, #ffd000, #ffb800, #ff6600, #ff9d00)' }}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-hotbee-darker">
                <Image
                  src="/logo-256.jpg"
                  alt="HOTBEE Admin"
                  width={40}
                  height={40}
                  sizes="40px"
                  className="rounded-full object-cover w-full h-full"
                />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-sm text-gradient-gold block leading-tight">HOTBEE ADMIN</span>
              <span className="text-[10px] text-hotbee-500 font-bold flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3" /> Command Center
              </span>
            </div>
          </div>

          {/* Live status indicator */}
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-hotbee-500/8 border border-hotbee-500/18">
            <span className="w-2 h-2 rounded-full bg-hotbee-500 animate-pulse shrink-0" />
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-hotbee-500">
              <Zap className="w-3 h-3" />
              <span>Qikink Production Live</span>
            </div>
          </div>

          {/* Nav items */}
          <nav aria-label="Admin navigation" className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all group ${
                    isActive
                      ? 'glass-btn-primary shadow-glow-gold-sm text-black'
                      : 'text-gray-300 hover:text-white hover:bg-hotbee-500/8'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-black' : 'text-hotbee-500'}`} />
                  <span className="flex-1">{item.label}</span>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-black/60 shrink-0" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom section */}
        <div className="p-5 border-t border-hotbee-500/10 space-y-1">
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/4 transition-all"
          >
            <Store className="w-4 h-4 text-hotbee-500 shrink-0" />
            Back to storefront
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 w-full transition-all"
          >
            <LogOut className="w-4 h-4 shrink-0" /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};
