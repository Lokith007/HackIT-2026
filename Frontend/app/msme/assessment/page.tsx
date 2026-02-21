'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { gsap } from '@/lib/gsap';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';

const ASSESSMENT_QUESTIONS = [
  {
    id: 'q1',
    question: 'What is the primary business activity or product/service of your MSME? (Describe in one line)',
    placeholder: 'e.g. Manufacturing of auto parts',
  },
  {
    id: 'q2',
    question: 'In which year was your business/enterprise registered or started?',
    placeholder: 'e.g. 2019',
  },
  {
    id: 'q3',
    question: 'What is your approximate monthly turnover (in ₹)? Give a range if exact is not possible.',
    placeholder: 'e.g. 2 to 3 lakh',
  },
  {
    id: 'q4',
    question: 'How many people does your enterprise employ (including yourself)?',
    placeholder: 'e.g. 5',
  },
  {
    id: 'q5',
    question: 'Which city and state is your business primarily located in?',
    placeholder: 'e.g. Chennai, Tamil Nadu',
  },
];

export default function MSMEAssessmentPage() {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [answers, setAnswers] = useState<Record<string, string>>(
    ASSESSMENT_QUESTIONS.reduce((acc, q) => ({ ...acc, [q.id]: '' }), {})
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !cardRef.current || !mounted) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(cardRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
    });
    return () => ctx.revert();
  }, [mounted]);

  const handleChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  };

  const blockPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
  };

  const allAnswered = ASSESSMENT_QUESTIONS.every((q) => answers[q.id].trim().length > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allAnswered) return;
    router.push('/msme/dashboard');
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12 bg-navy-950">
      <div className="relative z-10 w-full max-w-2xl">
        <GlassCard ref={cardRef} variant="strong" className="p-8 sm:p-10 hover:border-cyan-500/40 transition-colors duration-300">
          <div className="mb-6 text-center">
            <Link href="/" className="font-display text-2xl font-bold brand-text">
              CredNova
            </Link>
            <p className="mt-2 text-slate-400 text-sm">MSME Portal</p>
            <h1 className="mt-4 font-display text-xl font-semibold text-slate-100">
              Verification assessment
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Please answer the following. Type your answers (paste is disabled to verify authenticity).
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {ASSESSMENT_QUESTIONS.map((q, index) => (
              <div key={q.id} className="space-y-2">
                <label htmlFor={q.id} className="block text-sm font-medium text-slate-300">
                  {index + 1}. {q.question}
                </label>
                <input
                  id={q.id}
                  type="text"
                  value={answers[q.id]}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                  onPaste={blockPaste}
                  onCut={blockPaste}
                  placeholder={q.placeholder}
                  className="w-full rounded-xl border border-slate-600/60 bg-slate-800/50 px-4 py-3 text-slate-200 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                  autoComplete="off"
                  required
                />
              </div>
            ))}

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                variant="primary"
                className="w-full sm:flex-1"
                disabled={!allAnswered}
              >
                Complete & go to dashboard
              </Button>
              <Link
                href="/msme/login"
                className="w-full sm:flex-1 rounded-xl border border-slate-600 px-4 py-3 text-center text-sm font-medium text-slate-300 hover:bg-slate-800/50 transition-colors"
              >
                Back to login
              </Link>
            </div>
          </form>
        </GlassCard>
        <p className="mt-6 text-center">
          <Link href="/" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors duration-300">
            ← Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
