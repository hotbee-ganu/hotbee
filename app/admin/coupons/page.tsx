'use client';

import React, { useState } from 'react';
import { Tag, Plus, CheckCircle2, X, Loader2, Sparkles, Percent, Scissors, Copy, Check } from 'lucide-react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { useAdminGuard } from '@/lib/useAdminGuard';
import { INITIAL_COUPONS } from '@/lib/mockData';
import { Coupon } from '@/lib/types';

export default function AdminCouponsPage() {
  const { ready, checking } = useAdminGuard();
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [showModal, setShowModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [newCode, setNewCode] = useState({
    code: '',
    discountType: 'percentage' as const,
    discountValue: 10,
    minOrderValue: 999,
    description: '',
  });

  if (checking || !ready) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-hotbee-500 animate-spin" />
        <span className="text-xs text-gray-400 font-mono">Loading promotion coupons...</span>
      </div>
    );
  }

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.code) return;
    const added: Coupon = {
      code: newCode.code.trim().toUpperCase(),
      discountType: newCode.discountType,
      discountValue: Number(newCode.discountValue),
      minOrderValue: Number(newCode.minOrderValue),
      active: true,
      description:
        newCode.description ||
        `${newCode.discountValue}${newCode.discountType === 'percentage' ? '%' : '₹'} OFF`,
    };
    setCoupons([added, ...coupons]);
    setNewCode({
      code: '',
      discountType: 'percentage',
      discountValue: 10,
      minOrderValue: 999,
      description: '',
    });
    setShowModal(false);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const toggleCouponStatus = (code: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.code === code ? { ...c, active: !c.active } : c))
    );
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-5rem)]">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 space-y-6 lg:space-y-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-hotbee-500/10 via-transparent to-transparent p-6 rounded-3xl border border-hotbee-500/20">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-hotbee-500/10 border border-hotbee-500/30 text-[10px] font-extrabold uppercase tracking-widest text-hotbee-400 mb-2">
              <Tag className="w-3 h-3 text-hotbee-500" /> Promotional Campaigns
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>Discount &</span> <span className="text-gradient-gold">Coupon Codes</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
              Create marketing incentives, seasonal festival discounts, and first-order vouchers.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="glass-btn-primary px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-glow-gold hover:scale-[1.02] active:scale-[0.98] transition-all shrink-0"
          >
            <Plus className="w-4 h-4 text-black stroke-[3]" />
            <span>Create Promo Coupon</span>
          </button>
        </div>

        {/* Coupons List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {coupons.map((c) => (
            <div
              key={c.code}
              className="glass-card card-shine rounded-3xl border border-white/10 hover:border-hotbee-500/40 transition-all p-5 space-y-4 relative overflow-hidden group shadow-glow-gold-sm"
            >
              {/* Top Row: Code + Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-hotbee-500/10 border border-hotbee-500/20 flex items-center justify-center text-hotbee-500">
                    <Scissors className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-mono font-extrabold text-base text-white tracking-wider block">
                      {c.code}
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => toggleCouponStatus(c.code)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase transition-all ${
                    c.active
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/5 text-gray-400 border border-white/10'
                  }`}
                  title="Click to toggle status"
                >
                  {c.active ? 'Active' : 'Disabled'}
                </button>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-300 leading-relaxed font-light">
                {c.description || 'Promotional coupon applicable on eligible cart checkout.'}
              </p>

              {/* Bottom Voucher Strip */}
              <div className="pt-3 border-t border-dashed border-white/10 flex items-center justify-between text-xs text-gray-400">
                <span className="text-[11px]">
                  Min. Cart: <strong className="text-white font-mono">₹{c.minOrderValue}</strong>
                </span>

                <button
                  onClick={() => copyToClipboard(c.code)}
                  className="inline-flex items-center gap-1 text-[11px] text-hotbee-400 hover:text-white transition-colors"
                  title="Copy code"
                >
                  {copiedCode === c.code ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-up">
            <div className="glass-panel max-w-md w-full p-6 sm:p-8 rounded-3xl relative border border-hotbee-500/30 space-y-5 shadow-glow-gold-lg">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-hotbee-500/10 border border-hotbee-500/20 flex items-center justify-center text-hotbee-500">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Create Promotional Coupon</h3>
                  <p className="text-xs text-gray-400">Add an active discount code for customer checkout</p>
                </div>
              </div>

              <form onSubmit={handleAddCoupon} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-gray-300 block mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HOTBEE25, DIWALI10"
                    value={newCode.code}
                    onChange={(e) => setNewCode({ ...newCode, code: e.target.value })}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs uppercase font-mono tracking-wider border-white/10 focus:border-hotbee-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-300 block mb-1">Discount Type</label>
                    <select
                      value={newCode.discountType}
                      onChange={(e) =>
                        setNewCode({ ...newCode, discountType: e.target.value as any })
                      }
                      className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs bg-[#0a0d15] text-white border-white/10"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-gray-300 block mb-1">Discount Value *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newCode.discountValue}
                      onChange={(e) =>
                        setNewCode({ ...newCode, discountValue: Number(e.target.value) })
                      }
                      className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs border-white/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-gray-300 block mb-1">Minimum Order Value (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={newCode.minOrderValue}
                    onChange={(e) =>
                      setNewCode({ ...newCode, minOrderValue: Number(e.target.value) })
                    }
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs border-white/10"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-300 block mb-1">Description (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Special 10% discount on all streetwear hoodies"
                    value={newCode.description}
                    onChange={(e) => setNewCode({ ...newCode, description: e.target.value })}
                    className="w-full glass-input rounded-xl px-3.5 py-2.5 text-xs border-white/10"
                  />
                </div>

                <button
                  type="submit"
                  className="glass-btn-primary w-full py-3.5 rounded-2xl font-extrabold text-xs shadow-glow-gold hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-black" />
                  <span>Save & Activate Coupon</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
