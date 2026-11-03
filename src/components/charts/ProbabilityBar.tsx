import React from 'react';

interface ProbabilityBarProps {
  label: string;
  modelProb: number;       // e.g. 0.58
  bookmakerProb: number;  // e.g. 0.48
  bestOdds?: number;      // e.g. 2.10
  evPercent?: number;     // e.g. 21.8
}

export function ProbabilityBar({
  label,
  modelProb,
  bookmakerProb,
  bestOdds,
  evPercent,
}: ProbabilityBarProps) {
  const modelPct = Math.round(modelProb * 100);
  const bookmakerPct = Math.round(bookmakerProb * 100);
  const diffPct = modelPct - bookmakerPct;

  return (
    <div className="space-y-1.5 py-1.5 font-sans">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">{label}</span>
          {bestOdds && (
            <span className="px-2 py-0.2 rounded-full text-[10px] bg-black/5 dark:bg-white/[0.06] border border-border text-muted-foreground tabular-nums">
              Cote : @{bestOdds.toFixed(2)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 tabular-nums text-xs">
          <span className="text-emerald-500 font-semibold">
            Modèle : {modelPct}%
          </span>
          <span className="text-muted-foreground">
            Book : {bookmakerPct}%
          </span>
          {evPercent !== undefined && (
            <span
              className={`font-semibold text-xs ${
                evPercent > 0 ? 'text-emerald-500' : 'text-muted-foreground'
              }`}
            >
              {evPercent > 0 ? `+${evPercent.toFixed(1)}% EV` : `${evPercent.toFixed(1)}% EV`}
            </span>
          )}
        </div>
      </div>

      {/* Progress Bars */}
      <div className="relative h-2 w-full bg-black/10 dark:bg-white/[0.06] rounded-full overflow-hidden">
        {/* Bookmaker implied probability background */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-neutral-300 dark:bg-white/20 rounded-full"
          style={{ width: `${Math.min(100, bookmakerPct)}%` }}
        />
        {/* Model probability bar overlay with gradient */}
        <div
          className={`absolute top-0 bottom-0 left-0 rounded-full transition-all duration-300 ${
            diffPct > 0 ? 'bg-emerald-500' : 'bg-neutral-400 dark:bg-neutral-500'
          }`}
          style={{ width: `${Math.min(100, modelPct)}%` }}
        />
      </div>

      {diffPct > 0 && (
        <div className="flex justify-end">
          <span className="text-[10px] text-emerald-500 font-medium tabular-nums">
            Edge : +{diffPct}% vs Consensus
          </span>
        </div>
      )}
    </div>
  );
}
