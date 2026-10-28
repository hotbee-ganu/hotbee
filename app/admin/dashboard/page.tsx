'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  DollarSign, ShoppingCart, Zap, CheckCircle2,
  ArrowUpRight, Settings, Loader2, RefreshCw,
  Palette, TrendingUp, Package, AlertCircle,
  ExternalLink, Activity,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { AdminSidebar } from '@/components/AdminSidebar';
import { useAdminGuard } from '@/lib/useAdminGuard';
import { useIntegrationStatus } from '@/lib/useIntegrationStatus';
import { ORDER_STATUS_LABEL } from '@/lib/qikink';
import { Order } from '@/lib/types';

const STATUS_OPTIONS: Order['status'][] = [
  'placed', 'qikink_submitted', 'printing',
  'shipped', 'delivered', 'cancelled',
];

const STATUS_COLORS: Record<Order['status'], string> = {
  placed:           'bg-blue-500/20 text-blue-300',
  qikink_submitted: 'bg-amber-500/20 text-amber-300',
  printing:         'bg-hotbee-500/20 text-hotbee-500',
  shipped:          'bg-purple-500/20 text-purple-300',
  delivered:        'bg-green-500/20 text-green-400',
  cancelled:        'bg-red-500/20 text-red-400',
};

export default function AdminDashboardPage() {
  const { ready, checking } = useAdminGuard();
  const { orders, products, updateOrderStatus } = useStore();
  const { status, loading: statusLoading, allLive } = useIntegrationStatus(ready);

  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  const metrics = useMemo(() => {
    const totalRevenue = orders.reduce(
      (sum, o) => sum + (o.paymentStatus === 'paid' ? o.totalAmount : 0), 0
    );
    return {
      totalRevenue,
      totalOrders: orders.length,
      pendingOrders: orders.filter((o) =>
        ['placed', 'qikink_submitted', 'printing'].includes(o.status)
      ).length,
      deliveredOrders: orders.filter((o) => o.status === 'delivered').length,
    };
  }, [orders]);

  const runSync = async () => {
    setSyncing(true);
    setSyncMessage('');
    try {
      const res = await fetch('/api/orders/sync', { method: 'POST' });
      const data = await res.json();
      setSyncMessage(data?.message || data?.error || 'Sync finished.');
    } catch {
      setSyncMessage('Network error during sync.');
    } finally {
      setSyncing(false);
    }
  };

  if (checking || !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hotbee-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-hotbee-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold text-hotbee-500 uppercase tracking-widest">
            Verifying admin session…
          </p>
        </div>
      </div>
    );
  }

  const recentOrders = orders.slice(0, 8);

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-5rem)]">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 space-y-6 lg:space-y-8 min-w-0">

        {/* ── PAGE HEADER ───────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-hotbee-500">
              Command Center
            </span>
            <h1 className="text-xl sm:text-3xl font-extrabold text-white mt-0.5">Dashboard Overview</h1>
          </div>

          <Link
            href="/admin/settings"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-extrabold border transition-all hover:scale-105 ${
              statusLoading
                ? 'bg-gray-500/10 border-gray-500/28 text-gray-400'
                : allLive
                  ? 'bg-green-500/10 border-green-500/28 text-green-400'
                  : 'bg-amber-500/10 border-amber-500/28 text-amber-400 animate-pulse'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span className={`w-2 h-2 rounded-full ${statusLoading ? 'bg-gray-400' : allLive ? 'bg-green-400' : 'bg-amber-400'}`} />
            <span>
              {statusLoading ? 'Checking APIs…' : allLive ? 'All APIs Live' : 'Setup Needed'}
            </span>
            <Settings className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {/* ── STAT CARDS ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            {
              label: 'Total Revenue',
              value: `₹${metrics.totalRevenue.toLocaleString('en-IN')}`,
              sub: 'From verified paid orders',
              icon: DollarSign,
              color: 'text-hotbee-500',
              bg: 'from-hotbee-500/10 to-amber-500/5',
              border: 'border-hotbee-500/22',
            },
            {
              label: 'Total Orders',
              value: metrics.totalOrders.toString(),
              sub: 'Transactions logged',
              icon: ShoppingCart,
              color: 'text-amber-400',
              bg: 'from-amber-500/10 to-yellow-500/5',
              border: 'border-amber-500/20',
            },
            {
              label: 'In Print Queue',
              value: metrics.pendingOrders.toString(),
              sub: 'Active Qikink jobs',
              icon: Zap,
              color: 'text-blue-400',
              bg: 'from-blue-500/10 to-cyan-500/5',
              border: 'border-blue-500/20',
            },
            {
              label: 'Products Live',
              value: products.length.toString(),
              sub: 'In the catalogue',
              icon: Package,
              color: 'text-green-400',
              bg: 'from-green-500/10 to-emerald-500/5',
              border: 'border-green-500/20',
            },
          ].map(({ label, value, sub, icon: Icon, color, bg, border }) => (
            <div
              key={label}
              className={`glass-card card-shine p-4 sm:p-6 rounded-2xl border ${border} bg-gradient-to-br ${bg} space-y-2`}
            >
              <div className="flex justify-between items-center gap-2">
                <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-gray-400">
                  {label}
                </span>
                <div className={`p-2 rounded-lg bg-hotbee-darker/60 ${color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className={`text-lg sm:text-2xl font-extrabold ${color}`}>{value}</p>
              <p className="text-[10px] text-gray-500 font-light">{sub}</p>
            </div>
          ))}
        </div>

        {/* ── QIKINK SYNC PANEL ───────────────────────────────── */}
        <div className="glass-panel p-5 rounded-2xl border border-hotbee-500/25 relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-hotbee-500/6 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-hotbee-500 text-black shrink-0 shadow-glow-gold-sm">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-extrabold text-white text-sm">Qikink Fulfilment</h2>
                <p className="text-[11px] text-gray-400 leading-relaxed mt-0.5 max-w-md">
                  {status.qikink.message}{' '}
                  <span className="text-hotbee-500 font-semibold">
                    Keep ₹2,000+ in your Qikink wallet
                  </span>{' '}
                  so print jobs dispatch automatically.
                </p>
              </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                id="admin-sync-btn"
                onClick={runSync}
                disabled={syncing}
                className="glass-btn-primary px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 flex-1 sm:flex-none justify-center disabled:opacity-60 disabled:cursor-not-allowed shadow-glow-gold-sm"
              >
                {syncing ? (
                  <Loader2 className="w-3.5 h-3.5 text-black animate-spin" />
                ) : (
                  <RefreshCw className="w-3.5 h-3.5 text-black" />
                )}
                <span>{syncing ? 'Syncing…' : 'Sync Statuses'}</span>
              </button>
              <a
                href="https://board.qikink.com"
                target="_blank"
                rel="noreferrer"
                className="glass-btn-secondary px-4 py-2.5 rounded-xl text-xs font-extrabold shrink-0 flex items-center gap-1.5 justify-center"
              >
                Qikink <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {syncMessage && (
            <p role="status" className="text-[11px] text-hotbee-500 border-t border-hotbee-500/12 pt-3 mt-3 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              {syncMessage}
            </p>
          )}
        </div>

        {/* ── QUICK ACTIONS ──────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/admin/designs"
            className="glass-card card-shine p-4 rounded-2xl border border-hotbee-500/20 flex items-center gap-3 hover:border-hotbee-500/50 transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-hotbee-500/10 text-hotbee-500 border border-hotbee-500/25 shrink-0 group-hover:bg-hotbee-500/20 transition-colors">
              <Palette className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-extrabold text-white text-xs">Upload New Designs</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Drag & drop Qikink artwork → publish to store</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-hotbee-500 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>

          <Link
            href="/admin/orders"
            className="glass-card card-shine p-4 rounded-2xl border border-amber-500/20 flex items-center gap-3 hover:border-amber-500/45 transition-all group"
          >
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/22 shrink-0 group-hover:bg-amber-500/18 transition-colors">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-extrabold text-white text-xs">View All Orders</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Track fulfilment, update statuses, manage returns</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-amber-400 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {/* ── RECENT ORDERS ──────────────────────────────────── */}
        <section className="glass-panel p-4 sm:p-6 rounded-3xl border border-hotbee-500/18 space-y-4">
          <div className="flex justify-between items-center gap-3">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white">Recent Orders</h2>
              <p className="text-[10px] text-gray-500 mt-0.5">Last {recentOrders.length} transactions</p>
            </div>
            <Link href="/admin/orders" className="text-xs font-extrabold text-hotbee-500 hover:text-white transition-colors flex items-center gap-1">
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-gray-500">
              <ShoppingCart className="w-10 h-10 opacity-30" />
              <p className="text-xs">No orders yet. Share your store link to start selling!</p>
              <Link href="/" className="text-xs font-bold text-hotbee-500 hover:underline">
                View Storefront →
              </Link>
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="space-y-3 lg:hidden">
                {recentOrders.map((o) => (
                  <article
                    key={o.id}
                    className="p-3.5 rounded-2xl bg-hotbee-darker/60 border border-hotbee-500/12 space-y-3"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <p className="font-extrabold text-white text-xs">{o.id}</p>
                        <p className="text-[11px] text-gray-300 truncate">{o.customerName}</p>
                        <p className="text-[10px] text-gray-500">{o.customerPhone}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-extrabold text-white text-sm">
                          ₹{o.totalAmount.toLocaleString('en-IN')}
                        </p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold mt-1 ${
                          o.paymentStatus === 'paid'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}>
                          {o.paymentStatus.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${STATUS_COLORS[o.status]}`}>
                        {ORDER_STATUS_LABEL[o.status]}
                      </span>
                      <label className="flex-1">
                        <span className="sr-only">Status for order {o.id}</span>
                        <select
                          value={o.status}
                          onChange={(e) => updateOrderStatus(o.id, e.target.value as Order['status'])}
                          className="w-full bg-hotbee-darker text-[11px] text-white border border-hotbee-500/25 rounded-lg px-2 py-2 cursor-pointer"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </article>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-xs text-left text-gray-300">
                  <thead className="text-[11px] font-extrabold uppercase text-hotbee-500 border-b border-hotbee-500/18">
                    <tr>
                      {['Order ID', 'Customer', 'Items', 'Total', 'Payment', 'Fulfilment', 'Update Status'].map((h) => (
                        <th key={h} scope="col" className="py-3.5 px-3 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hotbee-500/8">
                    {recentOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-hotbee-500/4 transition-colors">
                        <td className="py-3.5 px-3 font-extrabold text-white">{o.id}</td>
                        <td className="py-3.5 px-3">
                          <div className="font-semibold text-white">{o.customerName}</div>
                          <div className="text-[10px] text-gray-500">{o.customerPhone}</div>
                        </td>
                        <td className="py-3.5 px-3 text-gray-300">{o.items.length}</td>
                        <td className="py-3.5 px-3 font-extrabold text-white">
                          ₹{o.totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            o.paymentStatus === 'paid'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {o.paymentStatus.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${STATUS_COLORS[o.status]}`}>
                            {ORDER_STATUS_LABEL[o.status]}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <label>
                            <span className="sr-only">Status for order {o.id}</span>
                            <select
                              value={o.status}
                              onChange={(e) => updateOrderStatus(o.id, e.target.value as Order['status'])}
                              className="bg-hotbee-darker text-[10px] text-white border border-hotbee-500/25 rounded-lg px-2.5 py-1.5 cursor-pointer hover:border-hotbee-500/50 transition-colors"
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>
                              ))}
                            </select>
                          </label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

      </main>
    </div>
  );
}
