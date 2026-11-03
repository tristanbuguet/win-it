'use client';

import React, { useState } from 'react';

interface TrendPoint {
  day: string;
  bankroll: number;
  pnl: number;
  winRate: number;
}

interface VectorTrendChartProps {
  data: TrendPoint[];
  height?: number;
}

export function VectorTrendChart({ data, height = 220 }: VectorTrendChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) return null;

  const width = 800;
  const padding = { top: 20, right: 30, bottom: 30, left: 55 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const minVal = Math.min(...data.map(d => d.bankroll));
  const maxVal = Math.max(...data.map(d => d.bankroll));
  const range = maxVal - minVal || 1;

  // Add 10% breathing room to min and max
  const yMin = Math.floor(minVal - range * 0.1);
  const yMax = Math.ceil(maxVal + range * 0.1);
  const yRange = yMax - yMin;

  const points = data.map((d, index) => {
    const x = padding.left + (index / (data.length - 1)) * innerWidth;
    const y = padding.top + innerHeight - ((d.bankroll - yMin) / yRange) * innerHeight;
    return { x, y, data: d };
  });

  // Build SVG path
  const pathD = points.reduce((acc, curr, i) => {
    if (i === 0) return `M ${curr.x} ${curr.y}`;
    const prev = points[i - 1];
    const cp1x = prev.x + (curr.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (curr.x - prev.x) / 2;
    const cp2y = curr.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }, '');

  // Area under curve
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`;

  const activePoint = hoverIndex !== null ? points[hoverIndex] : points[points.length - 1];

  return (
    <div className="relative w-full font-sans">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-sans">Bankroll Simulée</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-bold tracking-tight text-foreground tabular-nums font-sans">
              {activePoint.data.bankroll.toLocaleString('fr-FR')} €
            </span>
            <span
              className={`text-xs font-semibold tabular-nums font-sans ${
                activePoint.data.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'
              }`}
            >
              {activePoint.data.pnl >= 0 ? '+' : ''}
              {activePoint.data.pnl.toLocaleString('fr-FR')} € (
              {((activePoint.data.pnl / 5000) * 100).toFixed(1)}%)
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-muted-foreground font-sans">Date</span>
          <p className="text-sm font-medium text-foreground tabular-nums font-sans">{activePoint.data.day}</p>
        </div>
      </div>

      {/* SVG Chart */}
      <div className="w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible font-sans"
          onMouseLeave={() => setHoverIndex(null)}
        >
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = padding.top + innerHeight * pct;
            const val = Math.round(yMax - pct * yRange);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 10}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10px] fill-zinc-500 tabular-nums font-sans"
                >
                  {val} €
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          <path d={areaD} fill="url(#trendGradient)" />

          {/* Main Stroke */}
          <path
            d={pathD}
            fill="none"
            stroke="#10B981"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
          />

          {/* Interactive Crosshair & Points */}
          {points.map((p, i) => (
            <g
              key={i}
              className="cursor-pointer"
              onMouseEnter={() => setHoverIndex(i)}
            >
              {/* Invisible touch area */}
              <rect
                x={p.x - innerWidth / points.length / 2}
                y={padding.top}
                width={innerWidth / points.length}
                height={innerHeight}
                fill="transparent"
              />

              {hoverIndex === i && (
                <>
                  <line
                    x1={p.x}
                    y1={padding.top}
                    x2={p.x}
                    y2={height - padding.bottom}
                    stroke="rgba(255,255,255,0.25)"
                    strokeDasharray="2 2"
                  />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="4.5"
                    fill="#10B981"
                    stroke="#09090b"
                    strokeWidth="2"
                  />
                </>
              )}
            </g>
          ))}

          {/* Bottom Day Labels */}
          {points.map((p, i) => {
            if (i % 2 !== 0 && i !== points.length - 1) return null;
            return (
              <text
                key={i}
                x={p.x}
                y={height - 8}
                textAnchor="middle"
                className="text-[10px] fill-zinc-500 tabular-nums font-sans"
              >
                {p.data.day}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
