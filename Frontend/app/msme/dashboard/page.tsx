'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';
import { GlassCard } from '@/components/ui/GlassCard';
import { NovaScoreMeter } from '@/components/dashboard/NovaScoreMeter';
import { AnimatedCounter } from '@/components/dashboard/AnimatedCounter';
import { AppHeader } from '@/components/AppHeader';
import { Chatbot } from '@/components/msme/Chatbot';

type LoanScheme = {
  id: string;
  name: string;
  type: string;
  scheme: string;
  shortDesc: string;
  fit: 'High' | 'Medium' | 'Low';
  color: 'teal' | 'cyan' | 'amber';
  details: {
    eligibility: string[];
    interestRate: string;
    tenure: string;
    maxAmount: string;
    documents: string[];
    description: string;
  };
};

const LOAN_SCHEMES: LoanScheme[] = [
  {
    id: 'working-capital',
    name: 'Working Capital Loan',
    type: 'Working Capital',
    scheme: 'CGTMSE-backed',
    shortDesc: 'For day-to-day operations, inventory and receivables.',
    fit: 'High',
    color: 'teal',
    details: {
      eligibility: ['Registered MSME (Udyam)', 'Minimum 2 years in business', 'Turnover as per scheme limits'],
      interestRate: '10.5%–18% p.a. (based on credit profile)',
      tenure: 'Up to 10 years (revolving for OD)',
      maxAmount: 'Up to ₹2 Cr (CGTMSE cover up to ₹2 Cr without collateral)',
      documents: ['Udyam certificate', 'GST registration', 'Bank statements (12 months)', 'IT returns', 'Projected cash flow'],
      description: 'Working capital loans help you manage daily operations—raw material, wages, rent, and short-term expenses. Overdraft (OD) and cash credit (CC) are common variants. CGTMSE-backed loans reduce collateral requirements for eligible MSMEs.',
    },
  },
  {
    id: 'term-loan',
    name: 'Term Loan (Equipment & Machinery)',
    type: 'Term Loan',
    scheme: 'MSME 59 Minutes / PSB Loans',
    shortDesc: 'For purchasing machinery, equipment or expansion.',
    fit: 'High',
    color: 'cyan',
    details: {
      eligibility: ['Udyam registered', 'Viable project and repayment capacity', 'No default in last 12 months'],
      interestRate: '9%–15% p.a.',
      tenure: '1–7 years (depending on asset life)',
      maxAmount: 'Up to ₹5 Cr (scheme limits apply)',
      documents: ['Quotation for machinery/equipment', 'Udyam certificate', 'Financial statements', 'Property papers if mortgage'],
      description: 'Term loans are used for buying fixed assets like machinery, vehicles, or plant setup. Repayment is in fixed EMIs. Government schemes like 59-minute portal offer faster in-principle approval for eligible MSMEs.',
    },
  },
  {
    id: 'mudra',
    name: 'MUDRA Loan',
    type: 'Government Scheme',
    scheme: 'Pradhan Mantri MUDRA Yojana',
    shortDesc: 'Shishu / Kishore / Tarun categories for micro units.',
    fit: 'Medium',
    color: 'amber',
    details: {
      eligibility: ['Non-farm micro/small enterprise', 'Shishu: up to ₹50,000 | Kishore: ₹50,000–₹5 Lakh | Tarun: ₹5–10 Lakh'],
      interestRate: 'As per bank (typically 10%–16% p.a.)',
      tenure: 'Up to 5–7 years',
      maxAmount: 'Shishu: ₹50,000 | Kishore: ₹5 Lakh | Tarun: ₹10 Lakh',
      documents: ['Identity/address proof', 'Business proof', 'Bank statements', 'Project report for higher amounts'],
      description: 'MUDRA provides loans to non-corporate, non-farm small/micro enterprises. Three categories—Shishu, Kishore, Tarun—define loan size. No collateral for smaller amounts; helps first-time entrepreneurs and tiny businesses.',
    },
  },
  {
    id: 'standup-india',
    name: 'Stand-Up India',
    type: 'Government Scheme',
    scheme: 'Stand-Up India (SC/ST/Women)',
    shortDesc: 'For entrepreneurs from SC, ST or women (greenfield).',
    fit: 'Medium',
    color: 'teal',
    details: {
      eligibility: ['SC/ST or woman entrepreneur', 'Greenfield project (first venture in manufacturing/services/trading)'],
      interestRate: 'As per bank (margin money benefit)',
      tenure: 'Up to 7 years (with moratorium)',
      maxAmount: '₹10 Lakh–₹1 Cr',
      documents: ['Caste/gender proof', 'Project report', 'Identity, address, business proof'],
      description: 'Stand-Up India promotes entrepreneurship among SC, ST and women. Loan is for greenfield projects in manufacturing, services or trading. Composite loan (term + working capital) with relaxed margin and concessional terms.',
    },
  },
  {
    id: 'invoice-financing',
    name: 'Invoice Financing (Factoring)',
    type: 'Trade Finance',
    scheme: 'TReDS / Bank factoring',
    shortDesc: 'Get advance against unpaid invoices from buyers.',
    fit: 'High',
    color: 'cyan',
    details: {
      eligibility: ['B2B sales with credit period', 'Invoices from credible buyers', 'No major disputes'],
      interestRate: 'Typically 12%–20% p.a. (discount rate)',
      tenure: 'Until invoice due date (30–120 days)',
      maxAmount: 'As per invoice value and buyer limit',
      documents: ['Invoice copies', 'Delivery proof', 'Buyer acceptance (if required)', 'MSME registration'],
      description: 'Invoice financing lets you get an advance against unpaid bills. TReDS is an RBI-approved platform for discounting MSME invoices. You receive funds quickly and the buyer pays the financier on due date.',
    },
  },
];

export default function MSMEDashboardPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [detailScheme, setDetailScheme] = useState<LoanScheme | null>(null);

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

        {/* Loans & Schemes */}
        <div>
          <h2 className="font-display text-lg font-semibold text-slate-200 mb-2 flex items-center gap-2">
            <span className="h-0.5 w-8 rounded bg-teal-500" />
            Loans & Schemes for You
          </h2>
          <GlassCard data-dashboard-card className="p-6 hover:border-teal-500/30 transition-colors duration-300">
            <ul ref={recListRef} className="space-y-3">
              {LOAN_SCHEMES.map((scheme) => (
                <li
                  key={scheme.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-700/50 bg-slate-800/30 px-4 py-3 hover:border-teal-500/40 hover:bg-slate-800/50 transition-all duration-300"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-200">{scheme.name}</p>
                    <p className="text-sm text-slate-500">{scheme.type} · {scheme.scheme}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{scheme.shortDesc}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        scheme.color === 'teal'
                          ? 'bg-teal-500/20 text-teal-400'
                          : scheme.color === 'cyan'
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {scheme.fit} fit
                    </span>
                    <button
                      type="button"
                      onClick={() => setDetailScheme(scheme)}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/40 transition-colors"
                    >
                      View details
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </GlassCard>
        </div>
      </div>

      {/* Detail modal */}
      {detailScheme && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setDetailScheme(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="scheme-detail-title"
        >
          <div
            className="glass-strong w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-700/50 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-700/50 px-6 py-4 bg-navy-950/95 backdrop-blur">
              <h3 id="scheme-detail-title" className="font-display text-lg font-semibold text-slate-100">
                {detailScheme.name}
              </h3>
              <button
                type="button"
                onClick={() => setDetailScheme(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-700/50 hover:text-slate-200"
                aria-label="Close"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <p className="text-sm text-slate-300">{detailScheme.details.description}</p>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Eligibility</h4>
                <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                  {detailScheme.details.eligibility.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Interest rate</h4>
                  <p className="text-sm text-slate-200">{detailScheme.details.interestRate}</p>
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Tenure</h4>
                  <p className="text-sm text-slate-200">{detailScheme.details.tenure}</p>
                </div>
                <div className="sm:col-span-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Max amount</h4>
                  <p className="text-sm text-slate-200">{detailScheme.details.maxAmount}</p>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Documents</h4>
                <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                  {detailScheme.details.documents.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <Chatbot />
    </main>
  );
}
