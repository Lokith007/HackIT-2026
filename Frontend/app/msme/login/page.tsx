'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from '@/lib/gsap';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type SocialKey = 'linkedin' | 'x' | 'insta';

const SOCIAL_CONFIG: Record<SocialKey, { label: string; placeholder: string; color: string }> = {
  linkedin: { label: 'LinkedIn', placeholder: 'Paste your LinkedIn profile URL', color: 'hover:border-[#0A66C2]/50 hover:bg-[#0A66C2]/10' },
  x: { label: 'X (Twitter)', placeholder: 'Paste your X (Twitter) profile URL', color: 'hover:border-slate-400/50 hover:bg-slate-500/10' },
  insta: { label: 'Instagram', placeholder: 'Paste your Instagram profile URL', color: 'hover:border-[#E4405F]/50 hover:bg-[#E4405F]/10' },
};

export default function MSMELoginPage() {
  const cardRef = useRef<HTMLDivElement>(null);
  const [aadhaar, setAadhaar] = useState('');
  const [otp, setOtp] = useState('');
  const [socialUrls, setSocialUrls] = useState<Record<SocialKey, string>>({ linkedin: '', x: '', insta: '' });
  const [socialPending, setSocialPending] = useState<Record<SocialKey, string>>({ linkedin: '', x: '', insta: '' });
  const [activeSocial, setActiveSocial] = useState<SocialKey | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !cardRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 30, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out' }
      );
      if (formRef.current) {
        const inputs = formRef.current.querySelectorAll('input');
        gsap.fromTo(inputs, { opacity: 0, x: -15 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, delay: 0.4, ease: 'power2.out' });
      }
    });
    return () => ctx.revert();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = '/msme/dashboard';
  };

  const handleSocialSubmit = (key: SocialKey) => {
    const url = socialPending[key].trim();
    if (!url) return;
    setSocialUrls((prev) => ({ ...prev, [key]: url }));
    setSocialPending((prev) => ({ ...prev, [key]: '' }));
    setActiveSocial(null);
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12 bg-navy-950">
      <div className="relative z-10 w-full max-w-md">
        <GlassCard ref={cardRef} variant="strong" className="p-8 sm:p-10 hover:border-cyan-500/40 transition-colors duration-300">
          <div className="mb-8 text-center">
            <Link href="/" className="font-display text-2xl font-bold brand-text">
              CredNova
            </Link>
            <p className="mt-2 text-slate-400 text-sm">MSME Portal</p>
          </div>
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Aadhaar / Business ID"
              placeholder="Enter 12-digit Aadhaar or Business ID"
              value={aadhaar}
              onChange={(e) => setAadhaar(e.target.value)}
              maxLength={12}
              type="text"
              required
            />
            <Input
              label="OTP"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              type="text"
              inputMode="numeric"
              required
            />

            {/* Social accounts (optional) */}
            <div className="space-y-3">
              <p className="text-xs font-medium text-slate-400">Link social accounts (optional)</p>
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setActiveSocial(activeSocial === 'linkedin' ? null : 'linkedin')}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border border-slate-600/60 bg-slate-800/40 transition-all ${SOCIAL_CONFIG.linkedin.color} ${socialUrls.linkedin ? 'ring-1 ring-cyan-500/50 border-cyan-500/40' : ''}`}
                  title="Add LinkedIn"
                  aria-label="Add LinkedIn profile"
                >
                  {socialUrls.linkedin ? (
                    <span className="text-cyan-400 text-lg" aria-hidden>✓</span>
                  ) : (
                    <svg className="h-6 w-6 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSocial(activeSocial === 'x' ? null : 'x')}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border border-slate-600/60 bg-slate-800/40 transition-all ${SOCIAL_CONFIG.x.color} ${socialUrls.x ? 'ring-1 ring-cyan-500/50 border-cyan-500/40' : ''}`}
                  title="Add X (Twitter)"
                  aria-label="Add X profile"
                >
                  {socialUrls.x ? (
                    <span className="text-cyan-400 text-lg" aria-hidden>✓</span>
                  ) : (
                    <svg className="h-5 w-5 text-slate-300" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSocial(activeSocial === 'insta' ? null : 'insta')}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border border-slate-600/60 bg-slate-800/40 transition-all ${SOCIAL_CONFIG.insta.color} ${socialUrls.insta ? 'ring-1 ring-cyan-500/50 border-cyan-500/40' : ''}`}
                  title="Add Instagram"
                  aria-label="Add Instagram profile"
                >
                  {socialUrls.insta ? (
                    <span className="text-cyan-400 text-lg" aria-hidden>✓</span>
                  ) : (
                    <svg className="h-6 w-6 text-[#E4405F]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.766 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.766-2.618 6.98-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.766-6.979-6.98C8.333.014 8.741 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  )}
                </button>
              </div>

              {activeSocial && (
                <div className="rounded-xl border border-slate-600/60 bg-slate-800/30 p-3 space-y-2">
                  <p className="text-xs text-slate-400">{SOCIAL_CONFIG[activeSocial].label} — paste URL and submit</p>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder={SOCIAL_CONFIG[activeSocial].placeholder}
                      value={socialPending[activeSocial]}
                      onChange={(e) => setSocialPending((prev) => ({ ...prev, [activeSocial]: e.target.value }))}
                      className="flex-1 min-w-0 rounded-lg border border-slate-600 bg-slate-800/50 px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSocialSubmit(activeSocial)}
                      disabled={!socialPending[activeSocial].trim()}
                      className="shrink-0 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-400 disabled:opacity-40 disabled:pointer-events-none"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              )}

              {((socialUrls.linkedin || socialUrls.x || socialUrls.insta)) && (
                <p className="text-xs text-slate-500">
                  Linked: {[socialUrls.linkedin && 'LinkedIn', socialUrls.x && 'X', socialUrls.insta && 'Instagram'].filter(Boolean).join(', ')}
                </p>
              )}
            </div>

            <Button type="submit" variant="primary" className="w-full">
              Secure Login
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-slate-500">
            OTP will be sent to your registered mobile. AES-256 secured.
          </p>
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
