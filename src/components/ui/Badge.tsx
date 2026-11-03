import React from 'react';

interface EVBadgeProps {
  evPercent: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function EVBadge({ evPercent, size = 'md', showLabel = false }: EVBadgeProps) {
  let color = '#71717A';
  let bg = 'rgba(113, 113, 122, 0.10)';
  let border = 'rgba(113, 113, 122, 0.25)';
  let label = 'Neutre';

  if (evPercent >= 5.0) {
    color = '#10B981'; // Emerald
    bg = 'rgba(16, 185, 129, 0.10)';
    border = 'rgba(16, 185, 129, 0.25)';
    label = 'Haute Value';
  } else if (evPercent >= 1.0) {
    color = '#F59E0B'; // Amber
    bg = 'rgba(245, 158, 11, 0.10)';
    border = 'rgba(245, 158, 11, 0.25)';
    label = 'Value Modérée';
  } else if (evPercent < -1.0) {
    color = '#F43F5E'; // Rose
    bg = 'rgba(244, 63, 94, 0.10)';
    border = 'rgba(244, 63, 94, 0.25)';
    label = 'Alerte';
  }

  const sizeClasses = {
    sm: 'text-[10px] sm:text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5 font-semibold',
  }[size];

  const formattedEV = evPercent > 0 ? `+${evPercent.toFixed(1)}%` : `${evPercent.toFixed(1)}%`;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium tabular-nums font-sans ${sizeClasses}`}
      style={{
        color,
        backgroundColor: bg,
        border: `1px solid ${border}`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      <span>{formattedEV} EV</span>
      {showLabel && <span className="opacity-75 text-[10px]">({label})</span>}
    </span>
  );
}

export function StatusBadge({ status }: { status: 'Gagné' | 'Perdu' | 'En cours' | 'À venir' }) {
  const configs = {
    Gagné: {
      color: '#10B981',
      bg: 'rgba(16, 185, 129, 0.10)',
      border: 'rgba(16, 185, 129, 0.25)',
    },
    Perdu: {
      color: '#F43F5E',
      bg: 'rgba(244, 63, 94, 0.10)',
      border: 'rgba(244, 63, 94, 0.25)',
    },
    'En cours': {
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.10)',
      border: 'rgba(245, 158, 11, 0.25)',
    },
    'À venir': {
      color: '#71717A',
      bg: 'rgba(113, 113, 122, 0.10)',
      border: 'rgba(113, 113, 122, 0.25)',
    },
  }[status];

  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium tabular-nums font-sans"
      style={{
        color: configs.color,
        backgroundColor: configs.bg,
        border: `1px solid ${configs.border}`,
      }}
    >
      {status}
    </span>
  );
}
