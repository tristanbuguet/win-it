'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { EVBadge } from '@/components/ui/Badge';
import { mockMatches } from '@/lib/mock-data';
import {
  Search,
  ArrowUpDown,
  ArrowRight,
  ChevronDown,
} from 'lucide-react';

type SmartFilterId =
  | 'all'
  | 'ev_high'
  | 'over_25'
  | 'xg_high'
  | 'dropping_odds'
  | 'odds_2plus';

interface SmartPill {
  id: SmartFilterId;
  label: string;
  badge?: string;
}

const smartPills: SmartPill[] = [
  { id: 'all', label: 'Toutes les sélections' },
  { id: 'ev_high', label: 'Haute Value (+EV > 15%)', badge: 'Alpha' },
  { id: 'over_25', label: 'Over 2.5 > 60%', badge: 'Buts' },
  { id: 'xg_high', label: 'xG Cumulés > 3.5', badge: 'Spectacle' },
  { id: 'dropping_odds', label: 'Dropping Odds', badge: 'Smart Money' },
  { id: 'odds_2plus', label: 'Cote > 2.00', badge: 'Outsiders' },
];

export default function ScreenerPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<SmartFilterId>('all');
  const [sortBy, setSortBy] = useState<'ev' | 'odds' | 'confidence' | 'time'>('ev');
  const [selectedCompetition, setSelectedCompetition] = useState<string>('all');

  const filteredMatches = useMemo(() => {
    return mockMatches.filter(match => {
      // Search filter
      const matchesSearch =
        match.homeTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.awayTeam.toLowerCase().includes(searchQuery.toLowerCase()) ||
        match.competition.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Competition filter
      if (selectedCompetition !== 'all' && match.competition !== selectedCompetition) {
        return false;
      }

      // Smart pill filters
      if (activeFilter === 'ev_high') {
        return match.valueBets.some(vb => vb.evPercent >= 15);
      }
      if (activeFilter === 'over_25') {
        return match.overUnder25.overProb >= 0.58;
      }
      if (activeFilter === 'xg_high') {
        return match.homeExpectedGoals + match.awayExpectedGoals >= 3.5;
      }
      if (activeFilter === 'dropping_odds') {
        return match.id === 'psg-mci' || match.id === 'int-bar' || match.id === 'ars-rma';
      }
      if (activeFilter === 'odds_2plus') {
        return match.valueBets.some(vb => vb.bestOdds >= 2.0);
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'ev') {
        const maxEva = a.valueBets.length ? Math.max(...a.valueBets.map(v => v.evPercent)) : 0;
        const maxEvb = b.valueBets.length ? Math.max(...b.valueBets.map(v => v.evPercent)) : 0;
        return maxEvb - maxEva;
      }
      if (sortBy === 'confidence') {
        return b.algorithmicConfidence - a.algorithmicConfidence;
      }
      if (sortBy === 'odds') {
        const maxOddA = a.valueBets.length ? Math.max(...a.valueBets.map(v => v.bestOdds)) : 0;
        const maxOddB = b.valueBets.length ? Math.max(...b.valueBets.map(v => v.bestOdds)) : 0;
        return maxOddB - maxOddA;
      }
      if (sortBy === 'time') {
        return new Date(a.kickoff).getTime() - new Date(b.kickoff).getTime();
      }
      return 0;
    });
  }, [searchQuery, activeFilter, sortBy, selectedCompetition]);

  return (
    <div className="space-y-4">
      {/* Title & Description */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-500 font-sans">
            Scanner Multi-Critères
          </span>
          <span className="text-muted-foreground/40">•</span>
          <span className="text-xs text-muted-foreground font-sans">Pinnacle, Winamax, Betclic, Unibet</span>
        </div>
        <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight mt-1 font-sans">
          Screener Quantitatif de Matchs & Cotes
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 max-w-2xl font-sans">
          Filtrez en direct les anomalies de marché, probabilités Poisson et signaux xG à travers les compétitions européennes.
        </p>
      </div>

      {/* Instant Search Bar & Smart Pills (100% Opaque Card) */}
      <Card className="p-3.5 sm:p-4 space-y-3.5">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input (Section 3.3 A) */}
          <div className="relative flex-1 w-full">
            <Search size={14} strokeWidth={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Rechercher par équipe, compétition ou marché..."
              className="w-full h-9 pl-9 pr-8 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-foreground/30 focus-visible:ring-2 focus-visible:ring-foreground/10 transition-all font-sans"
            />
          </div>

          {/* Sort Selector (Section 3.3 C) */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1.5 font-sans">
              <ArrowUpDown size={13} strokeWidth={1.5} />
              Trier :
            </span>
            <div className="relative flex-1 sm:flex-initial">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="w-full sm:w-auto h-9 appearance-none bg-black/[0.03] dark:bg-white/[0.04] border border-border text-foreground text-xs font-medium pl-3.5 pr-8 rounded-xl outline-none hover:border-foreground/30 focus-visible:ring-2 focus-visible:ring-foreground/10 cursor-pointer font-sans"
              >
                <option value="ev" className="bg-card text-foreground">Plus Forte EV %</option>
                <option value="confidence" className="bg-card text-foreground">Confiance Modèle</option>
                <option value="odds" className="bg-card text-foreground">Cote Bookmaker</option>
                <option value="time" className="bg-card text-foreground">Heure de Match</option>
              </select>
              <ChevronDown size={13} strokeWidth={1.5} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Smart Pills Quick Toggles (Section 3.1 C Filter Chips) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none">
          {smartPills.map(pill => {
            const isActive = activeFilter === pill.id;
            return (
              <button
                key={pill.id}
                type="button"
                onClick={() => setActiveFilter(pill.id)}
                className={`h-8 px-3.5 rounded-full text-xs font-medium transition-all shrink-0 active:scale-95 cursor-pointer font-sans flex items-center gap-1.5 ${isActive
                    ? 'bg-white text-zinc-950 font-medium shadow-sm'
                    : 'text-muted-foreground hover:text-foreground bg-transparent hover:bg-black/5 dark:hover:bg-white/[0.04] border border-border'
                  }`}
              >
                <span>{pill.label}</span>
                {pill.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full tabular-nums font-sans ${isActive ? 'bg-zinc-900/15 text-zinc-950 font-bold' : 'bg-black/10 dark:bg-white/10 text-muted-foreground'
                      }`}
                  >
                    {pill.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Results Count & Match Islands List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1 font-sans">
          <span>{filteredMatches.length} matchs correspondent aux filtres</span>
          <span className="text-emerald-500 font-medium">Flux synchrone direct</span>
        </div>

        {filteredMatches.map(match => {
          const topBet = match.valueBets[0];
          const totalXg = (match.homeExpectedGoals + match.awayExpectedGoals).toFixed(2);
          const bestHomeOdd = Math.max(...match.bookmakerOdds.homeWin.map(o => o.odds));
          const bestDrawOdd = Math.max(...match.bookmakerOdds.draw.map(o => o.odds));
          const bestAwayOdd = Math.max(...match.bookmakerOdds.awayWin.map(o => o.odds));

          return (
            <Card
              key={match.id}
              className="p-3.5 sm:p-4 xl:p-4.5 hover:border-foreground/20 transition-all duration-150"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Match Info & Teams */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/[0.05] border border-border text-muted-foreground font-sans">
                      {match.competition}
                    </span>
                    <span className="text-muted-foreground/40">•</span>
                    <span className="text-xs text-muted-foreground tabular-nums font-sans">
                      {new Date(match.kickoff).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <span className="text-muted-foreground/40">•</span>
                    <span className="text-xs text-muted-foreground font-sans">{match.venue}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold text-foreground tracking-tight font-sans">
                      {match.homeTeam} <span className="text-muted-foreground font-normal">vs</span>{' '}
                      {match.awayTeam}
                    </h3>
                  </div>

                  {/* Form & xG stats line */}
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground font-sans">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-muted-foreground">Forme :</span>
                      <div className="flex gap-1">
                        {match.shortTermForm.home.map((f, i) => (
                          <span
                            key={i}
                            className={`w-4.5 h-4.5 rounded text-[10px] flex items-center justify-center font-bold tabular-nums ${f === 'V'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : f === 'N'
                                  ? 'bg-amber-500/15 text-amber-400'
                                  : 'bg-rose-500/15 text-rose-400'
                              }`}
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                      <span className="text-muted-foreground/40">vs</span>
                      <div className="flex gap-1">
                        {match.shortTermForm.away.map((f, i) => (
                          <span
                            key={i}
                            className={`w-4.5 h-4.5 rounded text-[10px] flex items-center justify-center font-bold tabular-nums ${f === 'V'
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : f === 'N'
                                  ? 'bg-amber-500/15 text-amber-400'
                                  : 'bg-rose-500/15 text-rose-400'
                              }`}
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-1.5 tabular-nums">
                      <span className="text-muted-foreground">xG attendus :</span>
                      <span className="text-foreground font-medium">
                        {match.homeExpectedGoals.toFixed(2)} - {match.awayExpectedGoals.toFixed(2)}
                      </span>
                      <span className="text-emerald-500 text-xs">({totalXg} tot.)</span>
                    </div>
                  </div>
                </div>

                {/* 1X2 Odds Pills */}
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-border text-center min-w-[65px]">
                    <span className="text-[10px] text-muted-foreground uppercase block font-semibold font-sans">1</span>
                    <span className="text-xs font-bold text-foreground tabular-nums font-sans">
                      @{bestHomeOdd.toFixed(2)}
                    </span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-border text-center min-w-[65px]">
                    <span className="text-[10px] text-muted-foreground uppercase block font-semibold font-sans">N</span>
                    <span className="text-xs font-bold text-foreground tabular-nums font-sans">
                      @{bestDrawOdd.toFixed(2)}
                    </span>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-border text-center min-w-[65px]">
                    <span className="text-[10px] text-muted-foreground uppercase block font-semibold font-sans">2</span>
                    <span className="text-xs font-bold text-foreground tabular-nums font-sans">
                      @{bestAwayOdd.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Value Bet Detected & Action (Pill button) */}
                <div className="flex items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-border">
                  {topBet ? (
                    <div className="text-left lg:text-right font-sans">
                      <EVBadge evPercent={topBet.evPercent} size="sm" />
                      <div className="text-xs text-foreground font-medium mt-1">
                        {topBet.selection} @{topBet.bestOdds.toFixed(2)}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs text-muted-foreground font-sans">Cote équilibrée</span>
                  )}

                  <Link
                    href={`/match/${match.id}`}
                    className="h-8 sm:h-9 px-3.5 rounded-full bg-foreground text-background font-medium text-xs flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer font-sans shrink-0"
                  >
                    <span>Analyser</span>
                    <ArrowRight size={13} strokeWidth={1.75} />
                  </Link>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
