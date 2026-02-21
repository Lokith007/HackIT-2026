'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from '@/lib/gsap';

interface AppHeaderProps {
  title?: string;
  showLogout?: boolean;
}

export function AppHeader({ title, showLogout = true }: AppHeaderProps) {
  const ref = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLAnchorElement>(null);
  const midRef = useRef<HTMLSpanElement>(null);
  const endRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(ref.current, { y: -60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
      if (logoRef.current) gsap.fromTo(logoRef.current, { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, delay: 0.1, ease: 'power2.out' });
      if (midRef.current) gsap.fromTo(midRef.current, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, delay: 0.2, ease: 'power2.out' });
      if (endRef.current) gsap.fromTo(endRef.current, { x: 20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, delay: 0.15, ease: 'power2.out' });
    });
    return () => ctx.revert();
  }, []);

  return (
    <header
      ref={ref}
      className="glass-strong sticky top-0 z-30 border-b border-slate-700/50 px-6 py-4"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link
          ref={logoRef}
          href="/"
          className="font-display text-xl font-bold text-cyan-500 hover:text-cyan-400 transition-colors duration-300"
        >
          CredNova
        </Link>
        {title && (
          <span ref={midRef} className="text-sm font-medium text-slate-400">
            {title}
          </span>
        )}
        {showLogout && (
          <Link
            ref={endRef}
            href="/"
            className="text-sm text-slate-400 hover:text-cyan-400 transition-colors duration-300"
          >
            Logout
          </Link>
        )}
      </div>
    </header>
  );
}
