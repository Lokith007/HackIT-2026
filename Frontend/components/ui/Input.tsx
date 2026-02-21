'use client';

import { forwardRef, useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', leftIcon, rightIcon, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-slate-400">
            {label}
          </label>
        )}
        <div
          className={`
            flex items-center gap-3 rounded-xl border bg-slate-900/50 px-4 py-3
            transition-all duration-300
            ${focused ? 'border-cyan-500 ring-2 ring-cyan-500/25' : 'border-slate-600/50'}
            ${error ? 'border-red-500' : ''}
          `}
        >
          {leftIcon && <span className="text-slate-500">{leftIcon}</span>}
          <input
            ref={ref}
            className={`flex-1 min-w-0 bg-transparent text-slate-100 placeholder:text-slate-500 focus:outline-none ${className}`}
            onFocus={(e) => {
              setFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />
          {rightIcon && <span className="text-slate-500">{rightIcon}</span>}
        </div>
        {error && <p className="mt-1.5 text-sm text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
