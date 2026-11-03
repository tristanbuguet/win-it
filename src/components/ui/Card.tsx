import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  interactive?: boolean;
  glow?: 'emerald' | 'amber' | 'none';
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function Card({
  children,
  className = '',
  noPadding = false,
  interactive = false,
  glow = 'none',
  onClick,
  ...props
}: CardProps) {
  const glowStyle = {
    emerald: 'shadow-[0_0_24px_-8px_rgba(16,185,129,0.18)]',
    amber: 'shadow-[0_0_24px_-8px_rgba(245,158,11,0.18)]',
    none: 'shadow-sm',
  }[glow];

  return (
    <div
      onClick={onClick}
      className={twMerge(
        clsx(
          'bg-card border border-border rounded-2xl flex flex-col overflow-hidden',
          glowStyle,
          noPadding ? '' : 'p-3.5 sm:p-4 xl:p-4.5',
          interactive &&
            'transition-all duration-150 hover:border-foreground/20 active:scale-[0.995] cursor-pointer',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  badge,
  action,
  className = '',
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={twMerge(clsx('flex items-start justify-between gap-3 p-3.5 sm:p-4 border-b border-border', className))}>
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold tracking-tight text-foreground font-sans">{title}</h3>
          {badge}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground font-sans mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={twMerge(clsx('p-3.5 sm:p-4', className))}>{children}</div>;
}
