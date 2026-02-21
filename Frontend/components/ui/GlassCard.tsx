'use client';

import { forwardRef } from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'strong';
  glow?: 'none' | 'cyan' | 'teal' | 'emerald' | 'electric';
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className = '', variant = 'default', glow = 'none', children, ...props }, ref) => {
    const base = 'rounded-2xl border transition-all duration-300 hover:transition-all duration-300';
    const variantClass = variant === 'strong' ? 'glass-strong' : 'glass';
    const glowClass =
      glow === 'cyan' || glow === 'electric'
        ? 'glow-cyan'
        : glow === 'teal' || glow === 'emerald'
        ? 'glow-teal'
        : '';
    return (
      <div
        ref={ref}
        className={`${base} ${variantClass} ${glowClass} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
