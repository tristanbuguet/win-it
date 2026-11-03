'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface SegmentOption<T extends string> {
  id: T;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  layoutId?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = '',
  layoutId = 'activeTabPill',
}: SegmentedControlProps<T>) {
  return (
    <nav
      className={`inline-flex items-center rounded-full bg-muted/60 p-1 border border-border relative shadow-inner overflow-x-auto max-w-full ${className}`}
      role="tablist"
    >
      {options.map(option => {
        const isActive = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.id)}
            className="relative flex items-center justify-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all active:scale-[0.97] cursor-pointer select-none font-sans whitespace-nowrap"
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                transition={{ type: 'spring', bounce: 0.12, duration: 0.35 }}
                className="absolute inset-0 rounded-full bg-white shadow-sm"
              />
            )}
            <span
              className={`relative z-10 flex items-center gap-1.5 transition-colors duration-150 ${
                isActive ? 'text-zinc-950 font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {option.icon && <span className="w-3.5 h-3.5">{option.icon}</span>}
              <span>{option.label}</span>
              {option.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums font-sans ${
                    isActive
                      ? 'bg-zinc-900/15 text-zinc-900 font-bold'
                      : 'bg-black/10 dark:bg-white/10 text-muted-foreground'
                  }`}
                >
                  {option.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
