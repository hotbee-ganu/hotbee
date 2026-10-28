'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Printer,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Search,
  Package,
  TrendingUp,
  Clock,
  CheckCircle2,
  Truck,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { AdminSidebar } from '@/components/AdminSidebar';
import { useAdminGuard } from '@/lib/useAdminGuard';
import { ORDER_STATUS_LABEL } from '@/lib/qikink';
import { Order } from '@/lib/types';

const STATUS_FILTERS: (Order['status'] | 'all')[] = [
  'all',
  'placed',
  'qikink_submitted',
  'printing',
  'shipped',
  'delivered',
  'cancelled',
];

const STATUS_OPTIONS: Order['status'][] = [
  'placed',
  'qikink_submitted',
  'printing',
  'shipped',
  'delivered',
  'cancelled',
];

const STATUS_BADGE_STYLE: Record<Order['status'], { bg: string; text: string; border: string }> = {
  placed: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  qikink_submitted: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  printing: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  shipped: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  delivered: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  cancelled: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const { ready, checking } = useAdminGuard();
  const { orders, updateOrderStatus } = useStore();

  const [filterStatus, setFilterStatus] = useState<Order['status'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');

  // Calculate order metrics
  const totalRevenue = useMemo(
    () => orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    [orders]
  );
  const inProduction = useMemo(
    () => orders.filter((o) => o.status === 'printing' || o.status === 'qikink_submitted').length,
    [orders]
  );
  const deliveredCount = useMemo(
    () => orders.filter((o) => o.status === 'delivered').length,
    [orders]
  );

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = filterStatus === 'all' || o.status === filterStatus;
      const matchQuery =
        !searchQuery ||
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerPhone.includes(searchQuery) ||
        (o.qikinkOrderId && o.qikinkOrderId.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchStatus && matchQuery;
    });
  }, [orders, filterStatus, searchQuery]);

  const runSync = async () => {
    setSyncing(true);
    setSyncMessage('');
    try {
      const res = await fetch('/api/orders/sync', { method: 'POST' });
      const data = await res.json();
      setSyncMessage(data?.message || data?.error || 'Sync completed successfully.');
    } catch {
      setSyncMessage('Network error during sync.');
    } finally {
      setSyncing(false);
    }
  };

  if (checking || !ready) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-hotbee-500 animate-spin" />
        <span className="text-xs text-gray-400 font-mono">Loading orders & fulfillment ledger...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-5rem)]">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 space-y-6 lg:space-y-8 max-w-7xl">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-hotbee-500/10 via-transparent to-transparent p-6 rounded-3xl border border-hotbee-500/20">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-hotbee-500/10 border border-hotbee-500/30 text-[10px] font-extrabold uppercase tracking-widest text-hotbee-400 mb-2">
              <Truck className="w-3 h-3 text-hotbee-500" /> Fulfillment Management
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
              <span>Customer Orders &</span>
              <span className="text-gradient-gold">POD Sync</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
              Real-time synchronization with Qikink automated print-on-demand fulfillment.
            </p>
          </div>

          <button
            onClick={runSync}
            disabled={syncing}
            className="glass-btn-primary px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-glow-gold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 w-full sm:w-auto justify-center shrink-0"
          >
            {syncing ? (
              <Loader2 className="w-4 h-4 text-black animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 text-black" />
            )}
            <span>{syncing ? 'Syncing Qikink...' : 'Sync from Qikink API'}</span>
          </button>
        </div>

        {syncMessage && (
          <div
            role="status"
            className="glass-panel p-4 rounded-2xl border border-hotbee-500/30 text-xs text-hotbee-400 flex items-center gap-2 animate-scale-pop"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{syncMessage}</span>
          </div>
        )}

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="glass-card card-shine p-4 rounded-2xl border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Total Orders</span>
              <Package className="w-3.5 h-3.5 text-hotbee-500" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">{orders.length}</p>
            <span className="text-[10px] text-gray-500">All-time received</span>
          </div>

          <div className="glass-card card-shine p-4 rounded-2xl border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Gross Volume</span>
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">
              ₹{totalRevenue.toLocaleString('en-IN')}
            </p>
            <span className="text-[10px] text-gray-500">Collected via Razorpay</span>
          </div>

          <div className="glass-card card-shine p-4 rounded-2xl border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">In Production</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">{inProduction}</p>
            <span className="text-[10px] text-gray-500">Printing or submitted</span>
          </div>

          <div className="glass-card card-shine p-4 rounded-2xl border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Delivered</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">{deliveredCount}</p>
            <span className="text-[10px] text-gray-500">Completed shipments</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Status filter pills */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {STATUS_FILTERS.map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                aria-pressed={filterStatus === st}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                  filterStatus === st
                    ? 'bg-hotbee-500 text-black shadow-glow-gold-sm font-extrabold'
                    : 'bg-white/5 text-gray-300 border border-white/10 hover:border-hotbee-500/30'
                }`}
              >
                {st === 'all' ? 'All Orders' : ORDER_STATUS_LABEL[st]}
              </button>
            ))}
          </div>

          {/* Search box */}
          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, name, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-input rounded-xl pl-9 pr-3 py-1.5 text-xs text-white border-white/10 focus:border-hotbee-500/50"
            />
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="glass-panel p-12 rounded-3xl text-center border border-white/10 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-gray-500">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-white">No matching orders found</p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              {filterStatus === 'all' && !searchQuery
                ? 'Incoming customer orders will appear here automatically upon checkout.'
                : 'No orders match your filter or search query. Try clearing filters.'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="space-y-3 lg:hidden">
              {filteredOrders.map((o) => {
                const badge = STATUS_BADGE_STYLE[o.status] || STATUS_BADGE_STYLE.placed;
                return (
                  <article
                    key={o.id}
                    className="glass-card card-shine rounded-2xl p-4 border border-white/10 space-y-3"
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div>
                        <p className="font-bold text-white text-sm font-mono">{o.id}</p>
                        <p className="text-[10px] text-gray-500">
                          {new Date(o.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <p className="font-extrabold text-white text-base">
                        ₹{o.totalAmount.toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="text-[11px] space-y-1 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                      <p className="font-semibold text-white">{o.customerName}</p>
                      <a href={`tel:${o.customerPhone}`} className="text-hotbee-400 block font-mono">
                        {o.customerPhone}
                      </a>
                      <p className="text-gray-400 text-[10px]">
                        {o.shippingAddress.street}, {o.shippingAddress.city}, {o.shippingAddress.state}{' '}
                        {o.shippingAddress.pincode}
                      </p>
                      <div className="pt-1 flex items-center gap-1 font-mono text-[10px]">
                        <span className="text-gray-500">Qikink:</span>
                        {o.qikinkOrderId ? (
                          <span className="text-hotbee-400">{o.qikinkOrderId}</span>
                        ) : (
                          <span className="text-amber-400">Awaiting Submission</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 items-center">
                      <label className="flex-1">
                        <span className="sr-only">Status for order {o.id}</span>
                        <select
                          value={o.status}
                          onChange={(e) => updateOrderStatus(o.id, e.target.value as Order['status'])}
                          className="w-full bg-[#0a0d15] text-[11px] font-bold text-hotbee-400 border border-white/10 rounded-xl px-3 py-2 cursor-pointer focus:border-hotbee-500/50"
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                              {ORDER_STATUS_LABEL[s]}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        onClick={() => router.push(`/order-confirmation/${o.id}`)}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:border-hotbee-500/40 transition-colors"
                        aria-label={`View invoice for ${o.id}`}
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-glow-gold-sm">
              <table className="w-full text-xs text-left text-gray-300">
                <thead className="text-[10px] font-extrabold uppercase text-hotbee-400 bg-white/[0.02] border-b border-white/10">
                  <tr>
                    <th scope="col" className="py-3.5 px-4">Order ID & Date</th>
                    <th scope="col" className="py-3.5 px-4">Customer Details</th>
                    <th scope="col" className="py-3.5 px-4">Shipping Destination</th>
                    <th scope="col" className="py-3.5 px-4">Total Amount</th>
                    <th scope="col" className="py-3.5 px-4">Qikink Reference</th>
                    <th scope="col" className="py-3.5 px-4">Fulfillment Status</th>
                    <th scope="col" className="py-3.5 px-4 text-right">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredOrders.map((o) => {
                    const badge = STATUS_BADGE_STYLE[o.status] || STATUS_BADGE_STYLE.placed;
                    return (
                      <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white font-mono">{o.id}</div>
                          <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                            {new Date(o.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{o.customerName}</div>
                          <a
                            href={`tel:${o.customerPhone}`}
                            className="text-[10px] text-hotbee-400 hover:underline font-mono"
                          >
                            {o.customerPhone}
                          </a>
                        </td>
                        <td className="py-3.5 px-4 max-w-[14rem] truncate text-[11px] text-gray-400">
                          {o.shippingAddress.city}, {o.shippingAddress.state} ({o.shippingAddress.pincode})
                        </td>
                        <td className="py-3.5 px-4 font-black text-white whitespace-nowrap">
                          ₹{o.totalAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-4 font-mono">
                          {o.qikinkOrderId ? (
                            <span className="text-hotbee-400 font-semibold">{o.qikinkOrderId}</span>
                          ) : (
                            <span
                              className="text-amber-400/80 inline-flex items-center gap-1 text-[11px]"
                              title="Awaiting automated sync with Qikink"
                            >
                              <AlertTriangle className="w-3 h-3 shrink-0" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <label>
                            <span className="sr-only">Status for order {o.id}</span>
                            <select
                              value={o.status}
                              onChange={(e) =>
                                updateOrderStatus(o.id, e.target.value as Order['status'])
                              }
                              className={`text-[10px] font-bold rounded-lg px-2.5 py-1 cursor-pointer border focus:outline-none transition-colors ${badge.bg} ${badge.text} ${badge.border}`}
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s} className="bg-[#0a0d15] text-white">
                                  {ORDER_STATUS_LABEL[s]}
                                </option>
                              ))}
                            </select>
                          </label>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => router.push(`/order-confirmation/${o.id}`)}
                            className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:border-hotbee-500/40 transition-colors"
                            aria-label={`View invoice for ${o.id}`}
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
