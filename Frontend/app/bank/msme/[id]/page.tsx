'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { gsap } from '@/lib/gsap';
import { GlassCard } from '@/components/ui/GlassCard';
import { NovaScoreMeter } from '@/components/dashboard/NovaScoreMeter';

const MOCK_MSME: Record<string, { name: string; score: number; risk: string; industry: string; location: string; turnover: string }> = {
  'MSME-001': { name: 'ABC Traders', score: 745, risk: 'Low', industry: 'Retail', location: 'Mumbai', turnover: '50L-1Cr' },
  'MSME-002': { name: 'XYZ Manufacturing', score: 612, risk: 'Medium', industry: 'Manufacturing', location: 'Pune', turnover: '1Cr-5Cr' },
  'MSME-003': { name: 'Tech Solutions Pvt', score: 820, risk: 'Low', industry: 'IT', location: 'Bangalore', turnover: '5Cr-10Cr' },
  'MSME-004': { name: 'Green Agro', score: 558, risk: 'Medium', industry: 'Agriculture', location: 'Nagpur', turnover: '25L-50L' },
  'MSME-005': { name: 'Metro Foods', score: 690, risk: 'Low', industry: 'F&B', location: 'Delhi', turnover: '1Cr-5Cr' },
};

const SHAP_FACTORS = [
  { name: 'GST compliance', impact: 0.28, direction: 'positive' },
  { name: 'Cash flow consistency', impact: 0.22, direction: 'positive' },
  { name: 'UPI transaction volume', impact: 0.18, direction: 'positive' },
  { name: 'Utility payment history', impact: 0.12, direction: 'positive' },
  { name: 'Industry risk', impact: -0.08, direction: 'negative' },
];

export default function BankMSMEDetailPage() {
  const params = useParams();
  const id = (params?.id as string) || '';
  const msme = MOCK_MSME[id] || MOCK_MSME['MSME-001'];
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current) return;
    const ctx = gsap.context(() => {
      const cards = containerRef.current!.querySelectorAll('[data-detail-card]');
      gsap.fromTo(
        cards,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
      );
      const trendBars = containerRef.current!.querySelectorAll('[data-trend-bar]');
      gsap.fromTo(trendBars, { scaleY: 0 }, { scaleY: 1, duration: 0.5, stagger: 0.04, delay: 0.4, ease: 'power2.out', transformOrigin: 'bottom' });
      const shapBars = containerRef.current!.querySelectorAll('[data-shap-bar]');
      gsap.fromTo(shapBars, { scaleX: 0 }, { scaleX: 1, duration: 0.5, stagger: 0.06, delay: 0.3, ease: 'power2.out', transformOrigin: 'left' });
    });
    return () => ctx.revert();
  }, []);

  return (
    <main className="min-h-screen bg-navy-950">
      <header className="glass-strong sticky top-0 z-30 border-b border-slate-700/50 px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="font-display text-xl font-bold text-cyan-500 hover:text-cyan-400 transition-colors duration-300">
            CredNova
          </Link>
          <Link
            href="/bank/dashboard"
            className="text-sm text-slate-400 hover:text-cyan-400 transition-colors duration-300"
          >
            ← Back to portfolio
          </Link>
        </div>
      </header>

      <div ref={containerRef} className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-100">{msme.name}</h1>
            <p className="text-slate-500 text-sm">{id}</p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-400">Industry</span>
            <span className="text-slate-200">{msme.industry}</span>
            <span className="text-slate-400">Location</span>
            <span className="text-slate-200">{msme.location}</span>
            <span className="text-slate-400">Turnover</span>
            <span className="text-slate-200">{msme.turnover}</span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <GlassCard data-detail-card variant="strong" glow="teal" className="p-6 flex flex-col items-center">
            <NovaScoreMeter score={msme.score} />
            <p className="mt-4 text-slate-400 text-sm">NovaScore</p>
            <span
              className={`mt-2 rounded-full px-3 py-1 text-xs font-medium ${
                msme.risk === 'Low'
                  ? 'bg-teal-500/20 text-teal-400'
                  : msme.risk === 'Medium'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {msme.risk} risk
            </span>
          </GlassCard>

          <GlassCard data-detail-card className="p-6 lg:col-span-2">
            <h3 className="font-display text-lg font-semibold text-slate-200 mb-4">
              SHAP Explanation (Score Drivers)
            </h3>
            <div className="space-y-3">
              {SHAP_FACTORS.map((f, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="w-40 text-sm text-slate-400 shrink-0">{f.name}</span>
                  <div className="flex-1 h-3 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      data-shap-bar
                      className={`h-full rounded-full ${
                        f.direction === 'positive' ? 'bg-teal-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.abs(f.impact) * 100}%` }}
                    />
                  </div>
                  <span
                    className={`w-12 text-right text-sm font-medium ${
                      f.direction === 'positive' ? 'text-teal-400' : 'text-amber-400'
                    }`}
                  >
                    {(f.impact * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <GlassCard data-detail-card className="p-6">
            <h3 className="font-display text-lg font-semibold text-slate-200 mb-4">
              Cash Flow Trends
            </h3>
            <div className="h-48 flex items-end gap-2">
              {[35, 50, 45, 65, 55, 70, 68, 75, 72, 80].map((h, i) => (
                <div
                  key={i}
                  data-trend-bar
                  className="flex-1 rounded-t bg-cyan-500 opacity-80 min-w-0"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">Last 10 months (indexed)</p>
          </GlassCard>

          <GlassCard data-detail-card className="p-6">
            <h3 className="font-display text-lg font-semibold text-slate-200 mb-4">
              Credit Behavior Insights
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-slate-300">
                <span className="text-teal-400">✓</span> GST filings on time (last 12 months)
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <span className="text-teal-400">✓</span> No bounced UPI transactions
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <span className="text-teal-400">✓</span> Utility payments within 30 days
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <span className="text-cyan-400">•</span> Bank statement coverage: 6+ months
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <span className="text-cyan-400">•</span> Revenue trend: Stable MoM
              </li>
            </ul>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
