'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShieldCheck, ArrowRight, Key, Loader2, Lock, Sparkles } from 'lucide-react';
import { useStore } from '@/lib/store';

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginAdmin, isAdminLoggedIn, adminChecked } = useStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isAdminLoggedIn) router.replace('/admin/dashboard');
  }, [isAdminLoggedIn, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);

    const result = await loginAdmin(pin);

    if (result.success) {
      router.replace('/admin/dashboard');
    } else {
      setError(result.message || 'Incorrect Access PIN. Please verify and try again.');
      setPin('');
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-hotbee-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative glass-panel card-shine p-8 sm:p-12 rounded-3xl max-w-md w-full border border-hotbee-500/30 shadow-glow-gold-lg space-y-7 text-center animate-fade-up">

        {/* Conic-gradient spinning logo emblem */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full animate-spin-slow opacity-80 blur-[2px]"
            style={{
              background: 'conic-gradient(from 0deg, #ff9d00, #fbbf24, #d97706, transparent 70%, #ff9d00)',
            }}
          />
          <div className="relative w-18 h-18 rounded-full p-1 bg-[#0a0d15] shadow-glow-gold">
            <Image
              src="/logo-256.jpg"
              alt="HOTBEE Admin"
              width={72}
              height={72}
              sizes="72px"
              className="rounded-full object-cover"
              priority
            />
          </div>
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-hotbee-500/10 border border-hotbee-500/30 text-[10px] font-extrabold uppercase tracking-widest text-hotbee-400 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-hotbee-500" />
            <span>Secure Admin Command</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            HQ Portal <span className="text-gradient-gold">Access</span>
          </h1>
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            Manage live orders, production syncing, designs & coupons
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-center justify-center gap-2 animate-scale-pop"
          >
            <Lock className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Key className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-hotbee-500/70" />
            <input
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              placeholder="Enter Admin Access PIN"
              aria-label="Admin access PIN"
              required
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full glass-input rounded-2xl pl-11 pr-4 py-3.5 text-sm text-center font-mono tracking-widest border-white/10 focus:border-hotbee-500/50 transition-colors"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={busy || !adminChecked}
            className="glass-btn-primary w-full py-3.5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-glow-gold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:hover:scale-100"
          >
            {busy ? (
              <>
                <Loader2 className="w-4 h-4 text-black animate-spin" />
                <span>Authorizing Session...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-black" />
                <span>Enter Command Center</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-white/5">
          <p className="text-[11px] text-gray-500 leading-relaxed">
            PIN authentication is cryptographically validated on the server via the{' '}
            <code className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-gray-300 font-mono text-[10px]">ADMIN_PIN</code> environment variable.
          </p>
        </div>
      </div>
    </div>
  );
}
