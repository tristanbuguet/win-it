'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { EVBadge } from '@/components/ui/Badge';
import { CloseButton } from '@/components/ui/CloseButton';
import { mockMatches } from '@/lib/mock-data';
import {
  Search,
  ArrowUpDown,
  ArrowRight,
  ChevronDown,
  SlidersHorizontal,
  RotateCcw,
  Check,
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

  // Advanced Filters Drawer State
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [minCustomEV, setMinCustomEV] = useState<number>(0);
  const [minXG, setMinXG] = useState<number>(0);
  const [selectedBookmaker, setSelectedBookmaker] = useState<string>('all');

  const hasActiveAdvancedFilters = minCustomEV > 0 || minXG > 0 || selectedBookmaker !== 'all';

  const resetAdvancedFilters = () => {
    setMinCustomEV(0);
    setMinXG(0);
    setSelectedBookmaker('all');
  };

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

      // Advanced filters
      if (minCustomEV > 0) {
        const hasEv = match.valueBets.some(vb => vb.evPercent >= minCustomEV);
        if (!hasEv) return false;
      }

      if (minXG > 0) {
        if (match.homeExpectedGoals + match.awayExpectedGoals < minXG) {
          return false;
        }
      }

      if (selectedBookmaker !== 'all') {
        const hasBook = match.valueBets.some(vb => vb.bestBookmaker === selectedBookmaker);
        if (!hasBook) return false;
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
  }, [searchQuery, activeFilter, sortBy, selectedCompetition, minCustomEV, minXG, selectedBookmaker]);

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

          {/* Controls Cluster: Advanced Filters Drawer Trigger + Sort Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Advanced Filters Drawer Button */}
            <button
              type="button"
              onClick={() => setIsAdvancedOpen(true)}
              className={`h-9 px-3 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer font-sans shrink-0 ${
                hasActiveAdvancedFilters
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-semibold'
                  : 'bg-black/[0.03] dark:bg-white/[0.04] border-border text-foreground hover:border-foreground/30'
              }`}
              title="Ouvrir les filtres avancés"
            >
              <SlidersHorizontal size={14} strokeWidth={1.75} />
              <span>Filtres</span>
              {hasActiveAdvancedFilters && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>

            {/* Sort Selector (Section 3.3 C) */}
            <div className="flex items-center gap-1.5 flex-1 sm:flex-initial">
              <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:flex items-center gap-1 font-sans">
                <ArrowUpDown size={13} strokeWidth={1.5} />
                Trier :
              </span>
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="w-full sm:w-auto h-9 appearance-none bg-black/[0.03] dark:bg-white/[0.04] border border-border text-foreground text-xs font-medium pl-3 pr-8 rounded-xl outline-none hover:border-foreground/30 focus-visible:ring-2 focus-visible:ring-foreground/10 cursor-pointer font-sans"
                >
                  <option value="ev" className="bg-card text-foreground">Plus Forte EV %</option>
                  <option value="confidence" className="bg-card text-foreground">Confiance Modèle</option>
                  <option value="odds" className="bg-card text-foreground">Cote Bookmaker</option>
                  <option value="time" className="bg-card text-foreground">Heure de Match</option>
                </select>
                <ChevronDown size={13} strokeWidth={1.5} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
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

      {/* ADVANCED FILTERS MODAL / BOTTOM SHEET */}
      <AnimatePresence>
        {isAdvancedOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Scrim Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdvancedOpen(false)}
              className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-md"
            />

            {/* Modal Window */}
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className="relative w-full max-w-lg bg-card/95 backdrop-blur-2xl border border-border shadow-2xl rounded-3xl p-5 sm:p-6 z-10 font-sans flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={16} className="text-emerald-500" />
                  <h3 className="text-base font-semibold text-foreground tracking-tight font-sans">
                    Filtres Quantitatifs Avancés
                  </h3>
                </div>
                <CloseButton onClick={() => setIsAdvancedOpen(false)} />
              </div>

              <div className="space-y-4">
                {/* 1. Min EV Threshold */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-sans">
                    <span className="text-muted-foreground font-medium">Seuil Minimum d’Expected Value</span>
                    <span className="text-emerald-500 font-bold tabular-nums">
                      {minCustomEV > 0 ? `+${minCustomEV}%` : 'Tous'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={minCustomEV}
                    onChange={e => setMinCustomEV(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 bg-neutral-200 dark:bg-white/10 h-1.5 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground font-sans">
                    <span>0% (Sans minimum)</span>
                    <span>+20% (Ultra-Alpha)</span>
                  </div>
                </div>

                {/* 2. Min xG Threshold */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex justify-between text-xs font-sans">
                    <span className="text-muted-foreground font-medium">xG Cumulés Minimum</span>
                    <span className="text-foreground font-bold tabular-nums">
                      {minXG > 0 ? `${minXG.toFixed(1)} xG` : 'Tous'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="4.5"
                    step="0.5"
                    value={minXG}
                    onChange={e => setMinXG(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 bg-neutral-200 dark:bg-white/10 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>

                {/* 3. Bookmaker Selector */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <span className="text-xs font-medium text-muted-foreground block font-sans">
                    Opérateur avec Meilleure Cote
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    {[
                      { id: 'all', label: 'Tous les bookmakers' },
                      { id: 'Pinnacle', label: 'Pinnacle' },
                      { id: 'Winamax', label: 'Winamax' },
                      { id: 'Betclic', label: 'Betclic' },
                      { id: 'Unibet', label: 'Unibet' },
                    ].map(bm => (
                      <button
                        key={bm.id}
                        type="button"
                        onClick={() => setSelectedBookmaker(bm.id)}
                        className={`h-8 rounded-full text-xs font-medium transition-all active:scale-95 cursor-pointer font-sans ${
                          selectedBookmaker === bm.id
                            ? 'bg-white text-zinc-950 font-medium shadow-sm'
                            : 'bg-black/5 dark:bg-white/[0.04] border border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {bm.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-border mt-5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={resetAdvancedFilters}
                  className="h-9 px-3.5 rounded-full bg-black/5 dark:bg-white/[0.06] hover:bg-black/10 dark:hover:bg-white/[0.1] border border-border text-xs font-medium text-foreground flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer font-sans"
                >
                  <RotateCcw size={13} strokeWidth={1.5} />
                  <span>Réinitialiser</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAdvancedOpen(false)}
                  className="h-9 px-4 rounded-full bg-foreground text-background font-medium text-xs sm:text-sm flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer font-sans shrink-0 focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:outline-none"
                >
                  <Check size={14} strokeWidth={2} />
                  <span>Appliquer les filtres</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                    <Link
                      href={`/match/${match.id}`}
                      className="group/title inline-block"
                      title={`Analyser ${match.homeTeam} vs ${match.awayTeam}`}
                    >
                      <h3 className="text-base font-semibold text-foreground tracking-tight font-sans group-hover/title:text-emerald-400 transition-colors">
                        {match.homeTeam} <span className="text-muted-foreground font-normal">vs</span>{' '}
                        {match.awayTeam}
                      </h3>
                    </Link>
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
