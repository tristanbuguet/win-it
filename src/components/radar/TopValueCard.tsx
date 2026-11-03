'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ValueBetOpportunity } from '@/types';
import { Card } from '@/components/ui/Card';
import { EVBadge } from '@/components/ui/Badge';
import {
  ExternalLink,
  BookmarkPlus,
  Check,
} from 'lucide-react';

interface TopValueCardProps {
  bet: ValueBetOpportunity;
  onTrackBet?: (bet: ValueBetOpportunity) => void;
}

export function TopValueCard({ bet, onTrackBet }: TopValueCardProps) {
  const [tracked, setTracked] = useState(false);

  const handleTrack = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setTracked(true);
    if (onTrackBet) onTrackBet(bet);
    setTimeout(() => setTracked(false), 2500);
  };

  const modelPct = Math.round(bet.modelProb * 100);

  return (
    <Card
      className="p-3.5 sm:p-4 xl:p-4.5 flex flex-col justify-between group"
      glow={bet.evPercent >= 15 ? 'emerald' : 'none'}
    >
      <div>
        {/* Header line: Competition, time and EV badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/[0.05] border border-border text-muted-foreground font-sans">
              {bet.competition}
            </span>
            <span className="text-xs text-muted-foreground tabular-nums font-sans">
              {new Date(bet.kickoff).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <EVBadge evPercent={bet.evPercent} size="sm" />
        </div>

        {/* Match title and market selection */}
        <Link href={`/match/${bet.matchId}`} className="block group-hover:text-emerald-400 transition-colors">
          <h4 className="text-base font-semibold text-foreground tracking-tight line-clamp-1 font-sans">
            {bet.matchTitle}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-sans">
              {bet.selection}
            </span>
            <span className="text-xs text-muted-foreground font-medium font-sans">({bet.market})</span>
          </div>
        </Link>

        {/* Odds & Model Comparison Grid */}
        <div className="grid grid-cols-3 gap-2 my-3.5 p-3 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-border">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-sans">
              Cote Book
            </span>
            <div className="flex items-baseline gap-1 mt-0.5 font-sans">
              <span className="text-base sm:text-lg font-bold text-foreground tabular-nums">
                @{bet.bestOdds.toFixed(2)}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {bet.bestBookmaker}
              </span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-sans">
              Cote Juste
            </span>
            <div className="flex items-baseline gap-1 mt-0.5 font-sans">
              <span className="text-base sm:text-lg font-bold text-foreground/80 tabular-nums">
                @{bet.fairOdds.toFixed(2)}
              </span>
              <span className="text-[10px] text-emerald-500 tabular-nums">
                ({modelPct}%)
              </span>
            </div>
          </div>

          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-sans">
              Mise Kelly
            </span>
            <div className="flex items-baseline gap-1 mt-0.5 font-sans">
              <span className="text-base sm:text-lg font-bold text-amber-500 tabular-nums">
                {bet.kellyStakePercent}%
              </span>
              <span className="text-[9px] text-muted-foreground">cap.</span>
            </div>
          </div>
        </div>

        {/* Market Consensus and Model Edge bar */}
        <div className="space-y-1 mb-4">
          <div className="flex justify-between text-xs text-muted-foreground tabular-nums font-sans">
            <span>Consensus : @{bet.marketConsensusOdds.toFixed(2)}</span>
            <span className="text-emerald-500 font-medium">
              Confiance : {bet.confidenceScore}/100
            </span>
          </div>
          <div className="w-full bg-black/10 dark:bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${bet.confidenceScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card Action Buttons (Section 3.1 Pill Buttons) */}
      <div className="flex items-center gap-2 pt-3 border-t border-border">
        <Link
          href={`/match/${bet.matchId}`}
          className="flex-1 h-9 px-3 rounded-full bg-black/5 dark:bg-white/[0.06] hover:bg-black/10 dark:hover:bg-white/[0.1] border border-border text-xs font-medium text-foreground flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer font-sans"
        >
          <span>Détails Poisson</span>
          <ExternalLink size={13} strokeWidth={1.5} className="text-muted-foreground" />
        </Link>

        <button
          type="button"
          onClick={handleTrack}
          className={`h-9 px-3.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer font-sans shrink-0 ${
            tracked
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'bg-foreground text-background hover:opacity-90 shadow-sm'
          }`}
          title="Ajouter au tracker de paris"
        >
          {tracked ? (
            <>
              <Check size={14} strokeWidth={2} />
              <span>Suivi</span>
            </>
          ) : (
            <>
              <BookmarkPlus size={14} strokeWidth={1.75} />
              <span>Suivre</span>
            </>
          )}
        </button>
      </div>
    </Card>
  );
}
