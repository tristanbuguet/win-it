'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { EVBadge } from '@/components/ui/Badge';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { VectorTrendChart } from '@/components/charts/VectorTrendChart';
import { OddsTrajectoryChart } from '@/components/charts/OddsTrajectoryChart';
import { TopValueCard } from '@/components/radar/TopValueCard';
import {
  mockTopValueBets,
  mockPerformanceTrajectory,
  mockIntradayTrajectory,
  mockDroppingOdds,
} from '@/lib/mock-data';
import {
  TrendingUp,
  Percent,
  Zap,
  TrendingDown,
  Layers,
  ArrowRight,
} from 'lucide-react';

export default function RadarPage() {
  const [chartTab, setChartTab] = useState<'performance' | 'intraday'>('performance');
  const [filterCompetition, setFilterCompetition] = useState<string>('Tous');
  const [trackedNotification, setTrackedNotification] = useState<string | null>(null);

  const filteredBets = mockTopValueBets.filter(bet => {
    if (filterCompetition === 'Tous') return true;
    return bet.competition === filterCompetition;
  });

  const handleTrackBet = (bet: any) => {
    setTrackedNotification(`Pari "${bet.selection}" ajouté à votre tracker`);
    setTimeout(() => setTrackedNotification(null), 3000);
  };

  const chartOptions = [
    { id: 'performance' as const, label: 'Performance 30 Jours' },
    { id: 'intraday' as const, label: 'Cotes Intraday (Chute PSG)' },
  ];

  return (
    <div className="space-y-4">
      {/* Real-time Notification Toast (Floating Glassmorphism) */}
      {trackedNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-card/95 backdrop-blur-2xl border border-border shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.08)] px-4 py-2.5 rounded-full text-xs font-semibold text-foreground flex items-center gap-2 font-sans animate-bounce">
          <Zap size={14} className="text-emerald-500 fill-emerald-500" />
          <span>{trackedNotification}</span>
        </div>
      )}

      {/* 1. TOP KPI CARDS (Grille 4 KPIs conforme VIEWPORT_LAYOUT.md 4.2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 shrink-0">
        {/* KPI 1 */}
        <Card className="min-h-[120px] sm:min-h-[126px] xl:min-h-[132px] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-1 sm:mb-2">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground font-sans truncate">
              Matchs Analysés
            </span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-black/[0.04] dark:bg-white/[0.05] border border-border text-muted-foreground shrink-0 ml-2">
              <Layers size={15} strokeWidth={1.5} />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-xl sm:text-2xl xl:text-3xl font-semibold mb-0.5 sm:mb-1 tracking-tight text-foreground tabular-nums font-sans">
              48
            </div>
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-medium w-full text-muted-foreground font-sans">
              <span className="text-emerald-500 font-semibold tabular-nums">100% Calibrés</span>
              <span className="truncate">Top 5 Ligues + C1</span>
            </div>
          </div>
        </Card>

        {/* KPI 2 */}
        <Card className="min-h-[120px] sm:min-h-[126px] xl:min-h-[132px] flex flex-col justify-between" glow="emerald">
          <div className="flex justify-between items-start mb-1 sm:mb-2">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground font-sans truncate">
              Opportunités +EV
            </span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shrink-0 ml-2">
              <Zap size={15} strokeWidth={1.5} />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-xl sm:text-2xl xl:text-3xl font-semibold mb-0.5 sm:mb-1 tracking-tight text-emerald-500 tabular-nums font-sans">
              9
            </div>
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-medium w-full text-muted-foreground font-sans">
              <span className="text-emerald-500 font-semibold tabular-nums">+18.2% EV Moy.</span>
              <span className="truncate">Anomalies actives</span>
            </div>
          </div>
        </Card>

        {/* KPI 3 */}
        <Card className="min-h-[120px] sm:min-h-[126px] xl:min-h-[132px] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-1 sm:mb-2">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground font-sans truncate">
              Winrate Modèle
            </span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-black/[0.04] dark:bg-white/[0.05] border border-border text-muted-foreground shrink-0 ml-2">
              <Percent size={15} strokeWidth={1.5} />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-xl sm:text-2xl xl:text-3xl font-semibold mb-0.5 sm:mb-1 tracking-tight text-foreground tabular-nums font-sans">
              65.8%
            </div>
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-medium w-full text-muted-foreground font-sans">
              <span className="text-emerald-500 font-semibold tabular-nums">+3.4% vs cible</span>
              <span className="truncate">140 derniers paris</span>
            </div>
          </div>
        </Card>

        {/* KPI 4 */}
        <Card className="min-h-[120px] sm:min-h-[126px] xl:min-h-[132px] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-1 sm:mb-2">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground font-sans truncate">
              Profit Simulé (30j)
            </span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shrink-0 ml-2">
              <TrendingUp size={15} strokeWidth={1.5} />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-xl sm:text-2xl xl:text-3xl font-semibold mb-0.5 sm:mb-1 tracking-tight text-foreground tabular-nums font-sans">
              +1 320,00 €
            </div>
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-medium w-full text-muted-foreground font-sans">
              <span className="text-emerald-500 font-semibold tabular-nums">+26.4% ROI</span>
              <span className="truncate">Kelly 0.25x</span>
            </div>
          </div>
        </Card>
      </div>

      {/* 2. TRAJECTORY & PERFORMANCE CHART SECTION (100% Opaque Card) */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold tracking-tight text-foreground font-sans">
                Trajectoire Analytique & Performance
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium font-sans">
                Alpha Modèle
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-sans mt-0.5">
              Courbe vectorielle haute précision basée sur les cotes de clôture Pinnacle
            </p>
          </div>

          <SegmentedControl
            options={chartOptions}
            value={chartTab}
            onChange={setChartTab}
            layoutId="chartTabPill"
          />
        </div>

        {chartTab === 'performance' ? (
          <VectorTrendChart data={mockPerformanceTrajectory} height={220} />
        ) : (
          <div>
            <div className="mb-2 text-xs text-muted-foreground font-sans">
              <span className="font-semibold text-foreground">PSG vs Manchester City</span> • Suivi en temps réel de la cote Pinnacle (chute de 2.65 à 2.45)
            </div>
            <OddsTrajectoryChart data={mockIntradayTrajectory} height={190} />
          </div>
        )}
      </Card>

      {/* 3. DROPPING ODDS RADAR TAPE */}
      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingDown size={16} strokeWidth={1.5} className="text-rose-500" />
            <h4 className="text-sm font-semibold tracking-tight text-foreground font-sans">
              Radar Dropping Odds • Décrochages Rapides de Marché
            </h4>
          </div>
          <span className="text-xs text-muted-foreground tabular-nums font-sans">
            Flux direct Pinnacle / Winamax
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {mockDroppingOdds.map(drop => (
            <div
              key={drop.id}
              className="p-3 rounded-2xl bg-neutral-50 dark:bg-white/[0.03] border border-border hover:bg-neutral-100 dark:hover:bg-white/[0.06] hover:border-foreground/20 active:scale-[0.98] transition-all flex items-center justify-between cursor-pointer"
            >
              <div>
                <span className="text-xs font-semibold text-foreground font-sans block truncate">
                  {drop.match}
                </span>
                <span className="text-[11px] text-muted-foreground font-sans">
                  {drop.selection} • <span className="text-foreground/80">{drop.bookmaker}</span>
                </span>
                <div className="text-[10px] text-muted-foreground font-sans mt-0.5">{drop.timeAgo}</div>
              </div>

              <div className="text-right shrink-0 ml-2">
                <div className="flex items-baseline gap-1 justify-end font-sans">
                  <span className="text-xs line-through text-muted-foreground tabular-nums">
                    @{drop.initialOdds.toFixed(2)}
                  </span>
                  <span className="text-sm font-bold text-foreground tabular-nums">
                    @{drop.currentOdds.toFixed(2)}
                  </span>
                </div>
                <span className="text-xs font-bold text-rose-500 tabular-nums font-sans inline-block mt-0.5">
                  {drop.dropPercent}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 4. TOP VALUE BETS SECTION */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-semibold tracking-tight text-foreground font-sans">
                Top Anomalies & Value Bets Détectées
              </h3>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 tabular-nums font-sans">
                {filteredBets.length} opportunités
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-sans mt-0.5">
              Sélections où la cote bookmaker surpasse nettement la probabilité mathématique du modèle
            </p>
          </div>

          {/* League Filter Chips (Section 3.1 C of DESIGN_SYSTEM.md) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {['Tous', 'Champions League', 'Ligue 1'].map(league => (
              <button
                key={league}
                type="button"
                onClick={() => setFilterCompetition(league)}
                className={`h-8 px-3.5 rounded-full text-xs font-medium transition-all shrink-0 active:scale-95 cursor-pointer font-sans ${filterCompetition === league
                    ? 'bg-white text-zinc-950 font-medium shadow-sm'
                    : 'text-muted-foreground hover:text-foreground bg-transparent hover:bg-black/5 dark:hover:bg-white/[0.04]'
                  }`}
              >
                {league}
              </button>
            ))}

            <Link
              href="/screener"
              className="ml-2 flex items-center gap-1 text-xs text-emerald-500 hover:text-emerald-400 font-medium transition-colors font-sans"
            >
              <span>Voir Screener</span>
              <ArrowRight size={13} strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        {/* Bento Grid of Value Bets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBets.map(bet => (
            <TopValueCard key={bet.id} bet={bet} onTrackBet={handleTrackBet} />
          ))}
        </div>
      </div>

      {/* 5. QUICK MATCH HUB ENTRY */}
      <Card className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-500 uppercase tracking-wider font-sans">
            Match du Jour à la Loupe
          </span>
          <h4 className="text-base font-semibold tracking-tight text-foreground font-sans mt-0.5">
            Paris Saint-Germain vs Manchester City • 21:00
          </h4>
          <p className="text-xs text-muted-foreground font-sans mt-1 max-w-2xl">
            xG attendus : 2.15 vs 1.65. Modèle de Poisson favorable à une rencontre à haute intensité. 3 Value bets identifiés sur les props Barcola & Haaland.
          </p>
        </div>

        <Link
          href="/match/psg-mci"
          className="h-9 px-4 rounded-full bg-foreground text-background font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer font-sans shrink-0 focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:outline-none"
        >
          <span>Explorer le Match Hub</span>
          <ArrowRight size={15} strokeWidth={1.75} />
        </Link>
      </Card>
    </div>
  );
}
