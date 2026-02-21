'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from '@/lib/gsap';
import { GlassCard } from '@/components/ui/GlassCard';
import { NovaScoreMeter } from '@/components/dashboard/NovaScoreMeter';
import { AnimatedCounter } from '@/components/dashboard/AnimatedCounter';
import { AppHeader } from '@/components/AppHeader';

export default function MSMEDashboardPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const titleBlockRef = useRef<HTMLDivElement>(null);
  const chartBarsRef = useRef<HTMLDivElement>(null);
  const recListRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current || !mounted) return;
    const ctx = gsap.context(() => {
      if (titleBlockRef.current) {
        const title = titleBlockRef.current.querySelector('h1');
        const bar = titleBlockRef.current.querySelector('.accent-bar');
        if (title) gsap.fromTo(title, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.6, ease: 'power3.out' });
        if (bar) gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, duration: 0.5, delay: 0.3, transformOrigin: 'left', ease: 'power2.out' });
      }
      const cards = containerRef.current!.querySelectorAll('[data-dashboard-card]');
      gsap.fromTo(
        cards,
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.07, delay: 0.15, ease: 'power2.out' }
      );
      if (chartBarsRef.current) {
        const bars = chartBarsRef.current.querySelectorAll('[data-bar]');
        gsap.fromTo(bars, { scaleY: 0 }, { scaleY: 1, duration: 0.55, stagger: 0.05, delay: 0.7, ease: 'back.out(1.2)', transformOrigin: 'bottom' });
      }
      if (recListRef.current) {
        const items = recListRef.current.querySelectorAll('li');
        gsap.fromTo(items, { opacity: 0, x: 15 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.07, delay: 0.5, ease: 'power2.out' });
      }
    });
    return () => ctx.revert();
  }, [mounted]);

  return (
    <main className="min-h-screen bg-navy-950">
      <AppHeader title="MSME Portal" />

      <div ref={containerRef} className="mx-auto max-w-7xl px-6 py-10">
        <div ref={titleBlockRef} className="mb-10">
          <h1 className="font-display text-3xl font-bold text-slate-100 mb-2">
            Your Credit Intelligence
          </h1>
          <div className="accent-bar h-1 w-20 rounded-full bg-cyan-500" />
        </div>

        {/* Bento: NovaScore large + GST */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <GlassCard
            data-dashboard-card
            variant="strong"
            glow="cyan"
            className="p-8 lg:col-span-2 flex flex-col items-center justify-center min-h-[300px] hover:border-cyan-500/40 transition-colors duration-300"
          >
            <NovaScoreMeter score={720} />
            <p className="mt-4 text-cyan-400/90 text-sm font-medium">NovaScore (300–900)</p>
          </GlassCard>
          <GlassCard
            data-dashboard-card
            className="p-6 flex flex-col justify-center hover:border-teal-500/40 transition-all duration-300 hover:-translate-y-1"
          >
            <h3 className="text-sm font-medium text-slate-400 mb-2">GST Compliance</h3>
            <p className="text-4xl font-bold text-teal-400">
              <AnimatedCounter value={87} suffix="%" />
            </p>
            <p className="mt-2 text-xs text-slate-500">Last 12 months</p>
          </GlassCard>
        </div>

        {/* Stats row */}
        <div className="grid gap-5 sm:grid-cols-3 mb-10">
          <GlassCard
            data-dashboard-card
            className="p-6 hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/10"
          >
            <h3 className="text-sm font-medium text-slate-400 mb-2">UPI Analytics</h3>
            <p className="text-3xl font-bold text-cyan-400">
              <AnimatedCounter value={1247} />
            </p>
            <p className="text-slate-500 text-sm mt-1">Transactions (30d)</p>
          </GlassCard>
          <GlassCard
            data-dashboard-card
            className="p-6 hover:border-teal-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-teal-500/10"
          >
            <h3 className="text-sm font-medium text-slate-400 mb-2">Utility Reliability</h3>
            <p className="text-3xl font-bold text-teal-400">
              <AnimatedCounter value={92} suffix="%" />
            </p>
            <p className="text-slate-500 text-sm mt-1">On-time payments</p>
          </GlassCard>
          <GlassCard
            data-dashboard-card
            className="p-6 hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/10"
          >
            <h3 className="text-sm font-medium text-slate-400 mb-2">Cash Flow Trend</h3>
            <p className="text-3xl font-bold text-amber-400">
              <span className="text-teal-400">↑</span> 12%
            </p>
            <p className="text-slate-500 text-sm mt-1">MoM</p>
          </GlassCard>
        </div>

        {/* Cash flow block */}
        <div className="mb-10">
          <h2 className="font-display text-lg font-semibold text-slate-200 mb-2 flex items-center gap-2">
            <span className="h-0.5 w-8 rounded bg-cyan-500" />
            Cash Flow
          </h2>
          <GlassCard data-dashboard-card className="p-6 hover:border-cyan-500/30 transition-colors duration-300">
            <div className="h-64 rounded-xl bg-slate-800/40 flex items-center justify-center border border-slate-700/40">
              <div ref={chartBarsRef} className="flex items-end gap-2 h-48">
                {[40, 65, 45, 80, 60, 90, 75].map((h, i) => (
                  <div
                    key={i}
                    data-bar
                    className="w-8 sm:w-12 rounded-t bg-cyan-500 opacity-90"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500">Last 7 periods</p>
          </GlassCard>
        </div>

        {/* Recommendations */}
        <div>
          <h2 className="font-display text-lg font-semibold text-slate-200 mb-2 flex items-center gap-2">
            <span className="h-0.5 w-8 rounded bg-teal-500" />
            Bank Recommendations
          </h2>
          <GlassCard data-dashboard-card className="p-6 hover:border-teal-500/30 transition-colors duration-300">
            <ul ref={recListRef} className="space-y-3">
              {[
                { name: 'HDFC Bank', product: 'MSME Working Capital', fit: 'High', color: 'teal' },
                { name: 'ICICI Bank', product: 'Business Line of Credit', fit: 'High', color: 'cyan' },
                { name: 'Axis Bank', product: 'Collateral-free Loan', fit: 'Medium', color: 'amber' },
              ].map((rec, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded-xl border border-slate-700/50 bg-slate-800/30 px-4 py-3 hover:border-teal-500/40 hover:bg-slate-800/50 transition-all duration-300"
                >
                  <div>
                    <p className="font-medium text-slate-200">{rec.name}</p>
                    <p className="text-sm text-slate-500">{rec.product}</p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      rec.color === 'teal'
                        ? 'bg-teal-500/20 text-teal-400'
                        : rec.color === 'cyan'
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {rec.fit} fit
                  </span>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </div>
    </main>
  );
}
