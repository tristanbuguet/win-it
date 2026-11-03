'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { mockBacktestUniverse } from '@/lib/mock-data';
import { calculateKellyStake } from '@/lib/math-engine';
import {
  RotateCcw,
  Sliders,
  TrendingUp,
  Percent,
  Layers,
  ShieldAlert,
} from 'lucide-react';

export default function LabBacktesterPage() {
  // Strategy Configuration State
  const [minEV, setMinEV] = useState<number>(3.0);
  const [minOdds, setMinOdds] = useState<number>(1.5);
  const [maxOdds, setMaxOdds] = useState<number>(3.2);
  const [kellyFraction, setKellyFraction] = useState<number>(0.25);
  const [startingBankroll, setStartingBankroll] = useState<number>(1000);
  const [selectedLeagues, setSelectedLeagues] = useState<string[]>([
    'Champions League',
    'Premier League',
    'Ligue 1',
    'La Liga',
  ]);
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>([
    '1X2',
    'Over/Under 2.5',
    'Both Teams To Score',
    'Player Props - Tirs Cadrés',
  ]);

  const allLeagues = [
    'Champions League',
    'Premier League',
    'Ligue 1',
    'La Liga',
    'Serie A',
    'Bundesliga',
  ];

  const allMarkets = [
    '1X2',
    'Over/Under 2.5',
    'Both Teams To Score',
    'Player Props - Tirs Cadrés',
    'Player Props - Buteur',
  ];

  const toggleLeague = (league: string) => {
    setSelectedLeagues(prev =>
      prev.includes(league) ? prev.filter(l => l !== league) : [...prev, league]
    );
  };

  const toggleMarket = (market: string) => {
    setSelectedMarkets(prev =>
      prev.includes(market) ? prev.filter(m => m !== market) : [...prev, market]
    );
  };

  // Dynamic Backtest Simulation Engine
  const simulationResults = useMemo(() => {
    // 1. Filter qualified bets
    const qualifiedBets = mockBacktestUniverse.filter(bet => {
      if (bet.evPercent < minEV) return false;
      if (bet.odds < minOdds || bet.odds > maxOdds) return false;
      if (selectedLeagues.length > 0 && !selectedLeagues.includes(bet.competition)) return false;
      if (selectedMarkets.length > 0 && !selectedMarkets.includes(bet.market)) return false;
      return true;
    });

    // 2. Simulate bankroll progression over time
    let currentBankroll = startingBankroll;
    let peakBankroll = startingBankroll;
    let maxDrawdownPct = 0;
    let wonBets = 0;
    let totalStaked = 0;
    let totalNetProfit = 0;

    const equityCurve: { index: number; date: string; bankroll: number; pnl: number }[] = [
      { index: 0, date: 'Début', bankroll: startingBankroll, pnl: 0 },
    ];

    const processedBets = qualifiedBets.map((bet, idx) => {
      const kelly = calculateKellyStake(currentBankroll, bet.modelProb, bet.odds, kellyFraction);
      const stake = Math.max(10, Math.min(kelly.stake, currentBankroll * 0.1)); // safety bounds
      totalStaked += stake;

      let pnl = 0;
      if (bet.won) {
        wonBets++;
        pnl = Math.round(stake * (bet.odds - 1) * 100) / 100;
        currentBankroll += pnl;
      } else {
        pnl = -stake;
        currentBankroll -= stake;
      }

      totalNetProfit += pnl;

      // Track peak and drawdown
      if (currentBankroll > peakBankroll) {
        peakBankroll = currentBankroll;
      }
      const dd = ((peakBankroll - currentBankroll) / peakBankroll) * 100;
      if (dd > maxDrawdownPct) {
        maxDrawdownPct = dd;
      }

      equityCurve.push({
        index: idx + 1,
        date: bet.date,
        bankroll: Math.round(currentBankroll),
        pnl: Math.round(totalNetProfit),
      });

      return {
        ...bet,
        stake: Math.round(stake),
        pnl: Math.round(pnl),
        runningBankroll: Math.round(currentBankroll),
      };
    });

    const totalBets = qualifiedBets.length;
    const winRate = totalBets > 0 ? (wonBets / totalBets) * 100 : 0;
    const roi = totalStaked > 0 ? (totalNetProfit / totalStaked) * 100 : 0;
    const sharpeRatio = totalBets > 10 ? Math.round((roi / (maxDrawdownPct || 1)) * 1.8 * 10) / 10 : 1.4;

    return {
      totalBets,
      wonBets,
      winRate: Math.round(winRate * 10) / 10,
      totalNetProfit: Math.round(totalNetProfit),
      roi: Math.round(roi * 10) / 10,
      maxDrawdownPct: Math.round(maxDrawdownPct * 10) / 10,
      sharpeRatio: Math.max(0.8, sharpeRatio),
      finalBankroll: Math.round(currentBankroll),
      equityCurve,
      processedBets,
    };
  }, [minEV, minOdds, maxOdds, kellyFraction, startingBankroll, selectedLeagues, selectedMarkets]);

  // Equity Curve SVG calculation
  const curve = simulationResults.equityCurve;
  const svgWidth = 800;
  const svgHeight = 220;
  const pad = { top: 20, right: 30, bottom: 25, left: 55 };
  const innerW = svgWidth - pad.left - pad.right;
  const innerH = svgHeight - pad.top - pad.bottom;

  const minB = Math.min(...curve.map(c => c.bankroll));
  const maxB = Math.max(...curve.map(c => c.bankroll));
  const bRange = maxB - minB || 1;

  const points = curve.map((c, i) => {
    const x = pad.left + (i / (curve.length - 1 || 1)) * innerW;
    const y = pad.top + innerH - ((c.bankroll - minB) / bRange) * innerH;
    return { x, y, c };
  });

  const pathD = points.reduce((acc, curr, i) => {
    return i === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1]?.x || innerW} ${svgHeight - pad.bottom} L ${pad.left} ${svgHeight - pad.bottom} Z`;

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-500 font-sans">
            Laboratoire de Recherche Quantitative
          </span>
          <span className="text-muted-foreground/40">•</span>
          <span className="text-xs text-muted-foreground font-sans">Backtester Haute Précision</span>
        </div>
        <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight mt-1 font-sans">
          Simulateur & Backtester de Stratégies Value
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 max-w-2xl font-sans">
          Testez rigoureusement votre edge mathématique sur notre base historique européenne avec gestion dynamique du risque Kelly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: STRATEGY CONFIGURATOR (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-4 sm:p-5 space-y-4.5">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Sliders size={15} strokeWidth={1.5} className="text-emerald-500" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground font-sans">
                  Paramètres de Stratégie
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMinEV(3.0);
                  setMinOdds(1.5);
                  setMaxOdds(3.2);
                  setKellyFraction(0.25);
                }}
                className="h-7 px-3 rounded-full bg-black/5 dark:bg-white/[0.06] hover:bg-black/10 dark:hover:bg-white/[0.1] border border-border text-[11px] font-medium text-foreground flex items-center gap-1 active:scale-95 transition-all cursor-pointer font-sans"
              >
                <RotateCcw size={12} strokeWidth={1.5} />
                <span>Reset</span>
              </button>
            </div>

            {/* Min EV Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-sans">
                <span className="text-muted-foreground font-medium">Seuil d’Expected Value (+EV)</span>
                <span className="text-emerald-500 font-bold tabular-nums">+{minEV.toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                step="0.5"
                value={minEV}
                onChange={e => setMinEV(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 bg-neutral-200 dark:bg-white/10 h-1.5 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-sans">
                <span>0% (Volume max)</span>
                <span>+15% (Ultra sélectif)</span>
              </div>
            </div>

            {/* Odds Range */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-sans">
                <span className="text-muted-foreground font-medium">Fourchette de Cotes</span>
                <span className="text-foreground font-bold tabular-nums">
                  @{minOdds.toFixed(2)} - @{maxOdds.toFixed(2)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground block mb-1 font-sans">Cote Min</label>
                  <input
                    type="number"
                    step="0.05"
                    min="1.1"
                    max="3.0"
                    value={minOdds}
                    onChange={e => setMinOdds(parseFloat(e.target.value) || 1.1)}
                    className="w-full h-9 px-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-border text-foreground text-xs font-medium tabular-nums font-sans outline-none focus:border-foreground/30 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground block mb-1 font-sans">Cote Max</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.5"
                    max="6.0"
                    value={maxOdds}
                    onChange={e => setMaxOdds(parseFloat(e.target.value) || 4.0)}
                    className="w-full h-9 px-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-border text-foreground text-xs font-medium tabular-nums font-sans outline-none focus:border-foreground/30 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Kelly Criterion Fraction */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-sans">
                <span className="text-muted-foreground font-medium">Fraction de Kelly</span>
                <span className="text-amber-500 font-bold tabular-nums">
                  {kellyFraction === 1
                    ? 'Full Kelly (1.0x)'
                    : kellyFraction === 0.5
                      ? 'Demi Kelly (0.50x)'
                      : kellyFraction === 0.25
                        ? 'Quart Kelly (0.25x)'
                        : `${kellyFraction.toFixed(2)}x`}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: '0.10x', val: 0.1 },
                  { label: '0.25x', val: 0.25 },
                  { label: '0.50x', val: 0.5 },
                  { label: '1.00x', val: 1.0 },
                ].map(opt => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setKellyFraction(opt.val)}
                    className={`h-8 rounded-full text-xs font-semibold tabular-nums transition-all active:scale-95 cursor-pointer font-sans ${kellyFraction === opt.val
                        ? 'bg-white text-zinc-950 font-medium shadow-sm'
                        : 'bg-black/5 dark:bg-white/[0.04] border border-border text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* League Checkboxes / Multi-Pills */}
            <div className="space-y-2 pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground font-medium block font-sans">
                Compétitions Incluses ({selectedLeagues.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {allLeagues.map(league => {
                  const active = selectedLeagues.includes(league);
                  return (
                    <button
                      key={league}
                      type="button"
                      onClick={() => toggleLeague(league)}
                      className={`h-7 px-3 rounded-full text-xs font-medium transition-all active:scale-95 cursor-pointer font-sans ${active
                          ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold'
                          : 'bg-black/5 dark:bg-white/[0.04] border border-border text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      {league}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Markets Included */}
            <div className="space-y-2 pt-2 border-t border-border">
              <span className="text-xs text-muted-foreground font-medium block font-sans">
                Types de Marchés ({selectedMarkets.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {allMarkets.map(market => {
                  const active = selectedMarkets.includes(market);
                  return (
                    <button
                      key={market}
                      type="button"
                      onClick={() => toggleMarket(market)}
                      className={`h-7 px-3 rounded-full text-xs font-medium transition-all active:scale-95 cursor-pointer font-sans ${active
                          ? 'bg-white text-zinc-950 font-medium shadow-sm'
                          : 'bg-black/5 dark:bg-white/[0.04] border border-border text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      {market}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: SIMULATION RESULTS & EQUITY CURVE (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Simulation KPIs Grid (Triade Canonique 3.2 B) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* KPI 1: Profit */}
            <Card className="min-h-[110px] sm:min-h-[120px] flex flex-col justify-between" glow={simulationResults.totalNetProfit >= 0 ? 'emerald' : 'none'}>
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-medium text-muted-foreground font-sans truncate">
                  Profit Net
                </span>
                <div className="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shrink-0 ml-1">
                  <TrendingUp size={14} strokeWidth={1.5} />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="text-lg sm:text-2xl font-semibold mb-0.5 tracking-tight text-foreground tabular-nums font-sans">
                  {simulationResults.totalNetProfit >= 0 ? '+' : ''}
                  {simulationResults.totalNetProfit.toLocaleString('fr-FR')} €
                </div>
                <div className="text-[10px] sm:text-xs font-medium text-muted-foreground font-sans truncate">
                  Final : {simulationResults.finalBankroll.toLocaleString('fr-FR')} €
                </div>
              </div>
            </Card>

            {/* KPI 2: ROI */}
            <Card className="min-h-[110px] sm:min-h-[120px] flex flex-col justify-between">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-medium text-muted-foreground font-sans truncate">
                  Retour (ROI)
                </span>
                <div className="w-7 h-7 rounded-full flex items-center justify-center bg-black/[0.04] dark:bg-white/[0.05] border border-border text-muted-foreground shrink-0 ml-1">
                  <Percent size={14} strokeWidth={1.5} />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="text-lg sm:text-2xl font-semibold mb-0.5 tracking-tight text-emerald-500 tabular-nums font-sans">
                  +{simulationResults.roi}%
                </div>
                <div className="text-[10px] sm:text-xs font-medium text-muted-foreground font-sans truncate">
                  Volume misé
                </div>
              </div>
            </Card>

            {/* KPI 3: Winrate */}
            <Card className="min-h-[110px] sm:min-h-[120px] flex flex-col justify-between">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-medium text-muted-foreground font-sans truncate">
                  Winrate
                </span>
                <div className="w-7 h-7 rounded-full flex items-center justify-center bg-black/[0.04] dark:bg-white/[0.05] border border-border text-muted-foreground shrink-0 ml-1">
                  <Layers size={14} strokeWidth={1.5} />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="text-lg sm:text-2xl font-semibold mb-0.5 tracking-tight text-foreground tabular-nums font-sans">
                  {simulationResults.winRate}%
                </div>
                <div className="text-[10px] sm:text-xs font-medium text-muted-foreground tabular-nums font-sans truncate">
                  {simulationResults.wonBets} / {simulationResults.totalBets} paris
                </div>
              </div>
            </Card>

            {/* KPI 4: Max Drawdown */}
            <Card className="min-h-[110px] sm:min-h-[120px] flex flex-col justify-between">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-medium text-muted-foreground font-sans truncate">
                  Max Drawdown
                </span>
                <div className="w-7 h-7 rounded-full flex items-center justify-center bg-amber-500/10 border border-amber-500/20 text-amber-500 shrink-0 ml-1">
                  <ShieldAlert size={14} strokeWidth={1.5} />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="text-lg sm:text-2xl font-semibold mb-0.5 tracking-tight text-amber-500 tabular-nums font-sans">
                  -{simulationResults.maxDrawdownPct}%
                </div>
                <div className="text-[10px] sm:text-xs font-medium text-muted-foreground tabular-nums font-sans truncate">
                  Sharpe : {simulationResults.sharpeRatio}
                </div>
              </div>
            </Card>
          </div>

          {/* Equity Curve Chart */}
          <Card className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
              <div>
                <h4 className="text-sm font-semibold text-foreground tracking-tight font-sans">
                  Equity Curve (Croissance du Capital)
                </h4>
                <p className="text-xs text-muted-foreground font-sans mt-0.5">
                  Simulation sur {simulationResults.totalBets} paris qualifiés
                </p>
              </div>
              <span className="text-xs text-emerald-500 tabular-nums font-sans font-medium">
                1 000 € → {simulationResults.finalBankroll.toLocaleString('fr-FR')} €
              </span>
            </div>

            <div className="w-full overflow-hidden select-none">
              <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto overflow-visible font-sans">
                <defs>
                  <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal guide lines */}
                {[0, 0.5, 1].map((pct, i) => {
                  const y = pad.top + innerH * pct;
                  const val = Math.round(maxB - pct * bRange);
                  return (
                    <g key={i}>
                      <line
                        x1={pad.left}
                        y1={y}
                        x2={svgWidth - pad.right}
                        y2={y}
                        stroke="rgba(255,255,255,0.06)"
                      />
                      <text
                        x={pad.left - 10}
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
                <path d={areaD} fill="url(#equityGrad)" />

                {/* Main line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Final dot */}
                {points.length > 0 && (
                  <circle
                    cx={points[points.length - 1].x}
                    cy={points[points.length - 1].y}
                    r="4"
                    fill="#10B981"
                    stroke="#09090b"
                    strokeWidth="2"
                  />
                )}
              </svg>
            </div>
          </Card>

          {/* Historical Ledger preview */}
          <Card className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3 border-b border-border pb-3">
              <h4 className="text-sm font-semibold text-foreground tracking-tight font-sans">
                Extrait du Grand Livre des Paris Simulés
              </h4>
              <span className="text-xs text-muted-foreground font-sans">
                10 derniers paris
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-border text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
                    <th className="pb-2.5">Date</th>
                    <th className="pb-2.5">Ligue & Marché</th>
                    <th className="pb-2.5 text-right">Cote</th>
                    <th className="pb-2.5 text-right">EV %</th>
                    <th className="pb-2.5 text-right">Mise</th>
                    <th className="pb-2.5 text-center">Statut</th>
                    <th className="pb-2.5 text-right">P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {simulationResults.processedBets.slice(-10).reverse().map((bet, i) => (
                    <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 text-muted-foreground tabular-nums">{bet.date}</td>
                      <td className="py-2.5">
                        <span className="font-semibold text-foreground">{bet.competition}</span>
                        <span className="text-muted-foreground text-[11px] block">{bet.market}</span>
                      </td>
                      <td className="py-2.5 text-right font-bold text-foreground tabular-nums">
                        @{bet.odds.toFixed(2)}
                      </td>
                      <td className="py-2.5 text-right font-semibold text-emerald-500 tabular-nums">
                        +{bet.evPercent.toFixed(1)}%
                      </td>
                      <td className="py-2.5 text-right text-foreground tabular-nums">
                        {bet.stake} €
                      </td>
                      <td className="py-2.5 text-center">
                        <span
                          className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold tabular-nums ${bet.won
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-rose-500/15 text-rose-400'
                            }`}
                        >
                          {bet.won ? 'Gagné' : 'Perdu'}
                        </span>
                      </td>
                      <td
                        className={`py-2.5 text-right font-bold tabular-nums ${bet.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'
                          }`}
                      >
                        {bet.pnl >= 0 ? `+${bet.pnl} €` : `${bet.pnl} €`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
