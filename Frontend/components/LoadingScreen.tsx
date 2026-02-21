'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap';

interface LoadingScreenProps {
  onComplete?: () => void;
  minDuration?: number;
}

export function LoadingScreen({ onComplete, minDuration = 2200 }: LoadingScreenProps) {
  const [visible, setVisible] = useState(true);
  const logoRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const lettersRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!logoRef.current || !progressRef.current || !ref.current) return;
      gsap.fromTo(
        logoRef.current,
        { scale: 0.5, opacity: 0, rotationY: -180 },
        { scale: 1, opacity: 1, rotationY: 0, duration: 1, ease: 'back.out(1.2)' }
      );
      gsap.to(logoRef.current, {
        rotation: 360,
        duration: 3,
        repeat: -1,
        ease: 'none',
        delay: 0.5,
      });
      if (textRef.current) {
        gsap.fromTo(textRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.8 });
      }
      if (lettersRef.current) {
        const letters = lettersRef.current.querySelectorAll('span');
        gsap.fromTo(
          letters,
          { opacity: 0, y: 5 },
          { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, delay: 1 }
        );
      }
      gsap.fromTo(
        progressRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 1.5, delay: 0.5, ease: 'power2.inOut' }
      );
    });
    const timer = setTimeout(() => {
      if (!ref.current) return;
      gsap.to(ref.current, {
        opacity: 0,
        scale: 1.02,
        duration: 0.5,
        ease: 'power2.inOut',
        onComplete: () => {
          setVisible(false);
          onComplete?.();
        },
      });
    }, Math.max(minDuration, 0));
    return () => {
      clearTimeout(timer);
      ctx.revert();
    };
  }, [onComplete, minDuration]);

  if (!visible) return null;

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center gap-8 bg-navy-950"
    >
      <div
        ref={logoRef}
        className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-cyan-500/60 bg-cyan-500/20 text-4xl font-bold text-cyan-400 shadow-2xl shadow-cyan-500/25"
        style={{ transformOrigin: 'center' }}
      >
        CN
      </div>
      <p ref={textRef} className="font-display text-xl font-semibold text-slate-300">
        <span ref={lettersRef} className="inline-block">
          {'CredNova'.split('').map((c, i) => (
            <span key={i} className="inline-block">{c}</span>
          ))}
        </span>
      </p>
      <div className="h-1 w-48 overflow-hidden rounded-full bg-slate-800">
        <div
          ref={progressRef}
          className="h-full w-full origin-left rounded-full bg-cyan-500"
        />
      </div>
    </div>
  );
}
