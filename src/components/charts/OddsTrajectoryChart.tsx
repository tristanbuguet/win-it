'use client';

import React from 'react';

interface OddsPoint {
  time: string;
  marketOdds: number;
  modelFairOdds: number;
}

interface OddsTrajectoryChartProps {
  data: OddsPoint[];
  height?: number;
}

export function OddsTrajectoryChart({ data, height = 180 }: OddsTrajectoryChartProps) {
  if (!data || data.length === 0) return null;

  const width = 600;
  const padding = { top: 20, right: 30, bottom: 25, left: 45 };

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const allOdds = data.flatMap(d => [d.marketOdds, d.modelFairOdds]);
  const minVal = Math.min(...allOdds) - 0.1;
  const maxVal = Math.max(...allOdds) + 0.1;
  const range = maxVal - minVal || 1;

  const getX = (i: number) => padding.left + (i / (data.length - 1)) * innerWidth;
  const getY = (val: number) => padding.top + innerHeight - ((val - minVal) / range) * innerHeight;

  // Market odds path (dropping red/pink curve)
  const marketPath = data.reduce((acc, d, i) => {
    const x = getX(i);
    const y = getY(d.marketOdds);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  // Model fair odds path (emerald dashed benchmark)
  const fairPath = data.reduce((acc, d, i) => {
    const x = getX(i);
    const y = getY(d.modelFairOdds);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  return (
    <div className="w-full font-sans">
      <div className="flex items-center justify-between mb-2 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-rose-500 rounded-full" />
            <span className="text-foreground font-medium">Cote Marché (Dropping -7.5%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-emerald-500 rounded-full border-dashed" />
            <span className="text-muted-foreground">Cote Juste Modèle (2.03)</span>
          </div>
        </div>
        <span className="text-muted-foreground text-[11px] tabular-nums">24h à Kickoff</span>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none font-sans">
        {/* Horizontal reference lines */}
        {[0, 0.5, 1].map((pct, i) => {
          const y = padding.top + innerHeight * pct;
          const val = (maxVal - pct * range).toFixed(2);
          return (
            <g key={i}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="rgba(255,255,255,0.06)"
              />
              <text
                x={padding.left - 8}
                y={y + 3}
                textAnchor="end"
                className="text-[10px] fill-zinc-500 tabular-nums font-sans"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Model Fair Line (Dashed Green) */}
        <path
          d={fairPath}
          fill="none"
          stroke="#10B981"
          strokeWidth="1.8"
          strokeDasharray="4 4"
        />

        {/* Market Odds Line (Rose / Dropping) */}
        <path
          d={marketPath}
          fill="none"
          stroke="#F43F5E"
          strokeWidth="2.4"
          strokeLinecap="round"
        />

        {/* Dots on market odds */}
        {data.map((d, i) => {
          const x = getX(i);
          const y = getY(d.marketOdds);
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="3.5" fill="#F43F5E" stroke="#09090b" strokeWidth="1.5" />
              <text
                x={x}
                y={height - 6}
                textAnchor="middle"
                className="text-[9px] fill-zinc-500 tabular-nums font-sans"
              >
                {d.time}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
