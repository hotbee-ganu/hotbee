'use client';

import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Loader2,
  RefreshCw,
  FileCode,
  ShieldCheck,
  PackageCheck,
  ExternalLink,
  Send,
  Database,
  Printer,
  CreditCard,
  Mail,
  Zap,
} from 'lucide-react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { useAdminGuard } from '@/lib/useAdminGuard';
import { ServiceStatus, useIntegrationStatus } from '@/lib/useIntegrationStatus';

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  Supabase: <Database className="w-5 h-5 text-emerald-400" />,
  'Qikink POD': <Printer className="w-5 h-5 text-amber-400" />,
  Razorpay: <CreditCard className="w-5 h-5 text-blue-400" />,
  'Resend Email': <Mail className="w-5 h-5 text-purple-400" />,
};

const ServiceCard: React.FC<{
  name: string;
  service: ServiceStatus;
  hint: string;
  loading: boolean;
}> = ({ name, service, hint, loading }) => {
  const isSandbox = service.mode === 'sandbox' || service.mode === 'test';
  const isConnected = service.connected;

  return (
    <div className="glass-card card-shine p-5 sm:p-6 rounded-3xl border border-white/10 hover:border-hotbee-500/30 transition-all space-y-4 relative overflow-hidden group">
      {/* Ambient background glow depending on status */}
      <div
        className={`absolute -right-8 -top-8 w-28 h-28 rounded-full blur-2xl pointer-events-none transition-opacity ${
          loading
            ? 'bg-gray-500/10'
            : isConnected && !isSandbox
              ? 'bg-emerald-500/15'
              : isConnected
                ? 'bg-amber-500/15'
                : 'bg-red-500/15'
        }`}
      />

      <div className="flex justify-between items-start gap-2 relative">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            {SERVICE_ICONS[name] || <Zap className="w-4 h-4 text-hotbee-500" />}
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-300 block">
              {name}
            </span>
            <span className="text-[10px] text-gray-500">Integration</span>
          </div>
        </div>

        {loading ? (
          <Loader2 className="w-4 h-4 text-gray-400 animate-spin shrink-0 mt-1" />
        ) : isConnected && !isSandbox ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
        ) : isConnected ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            {service.mode}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-red-500/15 text-red-400 border border-red-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Disconnected
          </span>
        )}
      </div>

      <div className="relative">
        <h3 className="font-extrabold text-white text-base">
          {loading
            ? 'Checking Status...'
            : isConnected
              ? isSandbox
                ? `Active in ${service.mode?.toUpperCase()} Mode`
                : 'Connected & Operational'
              : 'Action Required'}
        </h3>
        <p className="text-xs text-gray-400 leading-relaxed mt-1">
          {loading ? hint : service.message}
        </p>
      </div>

      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500">
        <span>{hint}</span>
      </div>
    </div>
  );
};

export default function AdminSettingsPage() {
  const { ready, checking } = useAdminGuard();
  const { status, loading, error, refresh } = useIntegrationStatus(ready);

  const [qikinkData, setQikinkData] = React.useState<{
    count: number;
    orders: any[];
    readyForLive: boolean;
    sandbox: boolean;
  } | null>(null);
  const [qikinkLoading, setQikinkLoading] = React.useState(false);
  const [qikinkPlacing, setQikinkPlacing] = React.useState(false);
  const [qikinkMsg, setQikinkMsg] = React.useState<string | null>(null);

  const fetchQikinkStatus = React.useCallback(async () => {
    try {
      setQikinkLoading(true);
      const res = await fetch('/api/admin/qikink-test');
      if (res.ok) {
        const data = await res.json();
        setQikinkData(data);
      }
    } catch {
      // ignore
    } finally {
      setQikinkLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (ready) {
      fetchQikinkStatus();
    }
  }, [ready, fetchQikinkStatus]);

  const handlePlaceTestOrder = async () => {
    try {
      setQikinkPlacing(true);
      setQikinkMsg(null);
      const res = await fetch('/api/admin/qikink-test', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setQikinkMsg(`Test order placed successfully! (ID: ${data.orderId})`);
        fetchQikinkStatus();
      } else {
        setQikinkMsg(data.error || 'Failed to place test order.');
      }
    } catch (err: any) {
      setQikinkMsg(err.message || 'Error triggering test order.');
    } finally {
      setQikinkPlacing(false);
    }
  };

  if (checking || !ready) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-hotbee-500 animate-spin" />
        <span className="text-xs text-gray-400 font-mono">Authenticating HQ session...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-5rem)]">
      <AdminSidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-10 space-y-6 lg:space-y-8 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-hotbee-500/10 via-transparent to-transparent p-6 rounded-3xl border border-hotbee-500/20">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-hotbee-500/10 border border-hotbee-500/30 text-[10px] font-extrabold uppercase tracking-widest text-hotbee-400 mb-2">
              <Zap className="w-3 h-3 text-hotbee-500" /> System Diagnostics
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Platform & <span className="text-gradient-gold">Integrations</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
              Real-time health verification for Supabase DB, Qikink POD fulfillment, Razorpay payments, and transactional mail.
            </p>
          </div>

          <button
            onClick={() => {
              refresh();
              fetchQikinkStatus();
            }}
            disabled={loading || qikinkLoading}
            className="glass-btn-secondary px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 hover:border-hotbee-500/50 shadow-glow-gold-sm transition-all disabled:opacity-60 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading || qikinkLoading ? 'animate-spin text-hotbee-500' : ''}`} />
            <span>Re-verify Integrations</span>
          </button>
        </div>

        {error && (
          <div role="alert" className="glass-panel p-4 rounded-2xl border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 4 Integration Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
          <ServiceCard
            name="Supabase"
            service={status.supabase}
            hint="Catalog, designs & DB storage"
            loading={loading}
          />
          <ServiceCard
            name="Qikink POD"
            service={status.qikink}
            hint="Automated print & ship dropship"
            loading={loading}
          />
          <ServiceCard
            name="Razorpay"
            service={status.razorpay}
            hint="UPI & Card payment gateway"
            loading={loading}
          />
          <ServiceCard
            name="Resend Email"
            service={status.resend}
            hint="Transactional customer receipts"
            loading={loading}
          />
        </div>

        {/* Qikink Sandbox Live Approval Verification Box */}
        <section className="glass-panel card-shine p-6 sm:p-8 rounded-3xl border border-hotbee-500/30 space-y-6 relative overflow-hidden">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-hotbee-500/10 border border-hotbee-500/20 flex items-center justify-center">
                  <PackageCheck className="w-5 h-5 text-hotbee-500" />
                </div>
                <h2 className="text-base font-extrabold text-white">Qikink Sandbox Test Verification</h2>
                {qikinkData && (
                  <span
                    className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full ${
                      qikinkData.count >= 3
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-glow-gold-sm'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {qikinkData.count >= 3
                      ? `Requirement Met (${qikinkData.count}/3 Orders)`
                      : `${qikinkData.count}/3 Test Orders Placed`}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2 max-w-2xl leading-relaxed">
                Qikink requires at least 3 test orders placed via Sandbox API before approving Live API credentials for real production printing.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handlePlaceTestOrder}
                disabled={qikinkPlacing}
                className="glass-btn-primary flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-glow-gold disabled:opacity-50 transition-transform active:scale-95"
              >
                {qikinkPlacing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5 text-black" />
                )}
                <span>{qikinkPlacing ? 'Placing Order...' : 'Place Sandbox Test Order'}</span>
              </button>

              <a
                href="https://board.qikink.com"
                target="_blank"
                rel="noreferrer"
                className="glass-btn-secondary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 hover:border-hotbee-500/40 transition-colors"
              >
                <span>Qikink Dashboard</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {qikinkMsg && (
            <div
              className={`p-3.5 rounded-2xl text-xs flex items-center gap-2 ${
                qikinkMsg.includes('success')
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                  : 'bg-red-500/10 text-red-300 border border-red-500/30'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{qikinkMsg}</span>
            </div>
          )}

          {/* Progress bar visual */}
          {qikinkData && (
            <div className="space-y-2 bg-black/30 p-4 rounded-2xl border border-white/5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-300">Sandbox Test Progress</span>
                <span className="font-mono text-hotbee-400 font-extrabold">
                  {Math.min(qikinkData.count, 3)} / 3 Completed ({Math.min(100, Math.round((qikinkData.count / 3) * 100))}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-hotbee-500 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, (qikinkData.count / 3) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {qikinkData && qikinkData.count >= 3 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-emerald-900/30 border border-emerald-500/40 flex items-start gap-3 shadow-glow-gold-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-emerald-200">
                  Ready to request Live API credentials!
                </p>
                <p className="text-emerald-300/80 leading-relaxed">
                  You have fulfilled <strong>{qikinkData.count} test orders</strong> on the Sandbox API. You can now visit{' '}
                  <a
                    href="https://board.qikink.com"
                    target="_blank"
                    rel="noreferrer"
                    className="underline text-emerald-200 font-bold hover:text-white"
                  >
                    board.qikink.com
                  </a>{' '}
                  and click the orange <strong>&quot;Request Live API Credentials&quot;</strong> button!
                </p>
              </div>
            </div>
          )}

          {qikinkData?.orders && qikinkData.orders.length > 0 && (
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-[11px] text-left text-gray-300">
                <thead className="text-[10px] font-extrabold uppercase text-hotbee-500 border-b border-hotbee-500/20">
                  <tr>
                    <th scope="col" className="py-2.5 pr-4">Order Ref</th>
                    <th scope="col" className="py-2.5 pr-4">Qikink ID</th>
                    <th scope="col" className="py-2.5 pr-4">Status</th>
                    <th scope="col" className="py-2.5 pr-4">Tracking / Courier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  {qikinkData.orders.map((ord: any, idx: number) => (
                    <tr key={idx} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 pr-4 text-white font-bold">{ord.orderNumber || '-'}</td>
                      <td className="py-2.5 pr-4 text-hotbee-400">{ord.qikinkOrderId || '-'}</td>
                      <td className="py-2.5 pr-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                          {ord.status || 'Received'}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-gray-400 font-sans">{ord.courierName || 'Courier arranged on dispatch'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Environment reference */}
        <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <FileCode className="w-4 h-4 text-hotbee-500" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Environment Configuration Directory</h2>
              <p className="text-xs text-gray-400 leading-relaxed mt-0.5">
                Set these in <strong className="text-gray-200">Netlify &rarr; Site settings &rarr; Environment variables</strong> (or in <code className="text-hotbee-400">.env.local</code> locally).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/5 bg-black/20">
            <table className="w-full text-[11px] text-left text-gray-300">
              <thead className="text-[10px] font-extrabold uppercase text-hotbee-500 bg-white/[0.02] border-b border-white/10">
                <tr>
                  <th scope="col" className="py-3 px-4">Variable</th>
                  <th scope="col" className="py-3 px-4">Role & Functionality</th>
                  <th scope="col" className="py-3 px-4">Security Tier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {[
                  ['ADMIN_PIN', 'The admin access PIN for HQ login.', 'Server Secret'],
                  ['ADMIN_SESSION_SECRET', 'Signs admin authentication session cookies.', 'Server Secret'],
                  ['NEXT_PUBLIC_SUPABASE_URL', 'Supabase cluster URL.', 'Public Safe'],
                  ['NEXT_PUBLIC_SUPABASE_ANON_KEY', 'Supabase public anon access token.', 'Public Safe'],
                  ['SUPABASE_SERVICE_ROLE_KEY', 'High-privilege server key for orders & storage writes.', 'Critical Secret'],
                  ['QIKINK_API_KEY', 'Qikink ClientId credentials.', 'Server Secret'],
                  ['QIKINK_API_SECRET', 'Qikink client secret.', 'Critical Secret'],
                  ['QIKINK_BASE_URL', 'https://api.qikink.com/api for live production.', 'Configuration'],
                  ['RAZORPAY_KEY_ID', 'Razorpay Key ID (rzp_live_ or rzp_test_).', 'Public Safe'],
                  ['RAZORPAY_SECRET', 'Razorpay HMAC secret for signature verification.', 'Critical Secret'],
                  ['RESEND_API_KEY', 'API token for transactional order confirmation emails.', 'Server Secret'],
                ].map(([key, description, tier]) => (
                  <tr key={key} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-4 text-hotbee-400 font-bold whitespace-nowrap">{key}</td>
                    <td className="py-2.5 px-4 font-sans text-gray-400">{description}</td>
                    <td className="py-2.5 px-4 font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-extrabold ${
                        tier === 'Critical Secret'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                          : tier === 'Server Secret'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : tier === 'Public Safe'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-white/5 text-gray-400 border border-white/10'
                      }`}>
                        {tier}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Before going live checklist */}
        <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-amber-500/30 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Production Launch Checklist</h2>
              <p className="text-xs text-gray-400 mt-0.5">Ensure all operational guardrails are satisfied before customer traffic.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-gray-300">
            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-hotbee-500/20 text-hotbee-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
              <div>
                <p className="font-bold text-white">Admin Credentials</p>
                <p className="text-gray-400 mt-0.5">Change <code className="text-hotbee-400">ADMIN_PIN</code> from default and set a random 32-character <code className="text-hotbee-400">ADMIN_SESSION_SECRET</code>.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-hotbee-500/20 text-hotbee-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
              <div>
                <p className="font-bold text-white">Qikink Live Production Keys</p>
                <p className="text-gray-400 mt-0.5">Swap sandbox credentials for live keys and set <code className="text-hotbee-400">QIKINK_BASE_URL</code> to <code className="text-hotbee-400">https://api.qikink.com/api</code>.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-hotbee-500/20 text-hotbee-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</span>
              <div>
                <p className="font-bold text-white">Razorpay Live Keys</p>
                <p className="text-gray-400 mt-0.5">Replace test keys with <code className="text-hotbee-400">rzp_live_</code> credentials to collect real customer UPI/card payments.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-hotbee-500/20 text-hotbee-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">4</span>
              <div>
                <p className="font-bold text-white">Supabase Schema & Storage</p>
                <p className="text-gray-400 mt-0.5">Execute <code className="text-hotbee-400">supabase/setup.sql</code> in your Supabase SQL editor to initialize tables and storage buckets.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
