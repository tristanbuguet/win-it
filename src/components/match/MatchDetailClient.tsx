'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MatchDetails } from '@/types';
import { Card } from '@/components/ui/Card';
import { EVBadge } from '@/components/ui/Badge';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { PoissonHeatmap } from '@/components/charts/PoissonHeatmap';
import { ProbabilityBar } from '@/components/charts/ProbabilityBar';
import {
  ShieldCheck,
  Clock,
  MapPin,
  ArrowLeft,
  BookmarkPlus,
  Check,
} from 'lucide-react';

interface MatchDetailClientProps {
  match: MatchDetails;
  allMatches: MatchDetails[];
}

type SegmentTab = 'poisson' | 'dynamics' | 'props' | 'lineups';

export function MatchDetailClient({ match, allMatches }: MatchDetailClientProps) {
  const [activeTab, setActiveTab] = useState<SegmentTab>('poisson');
  const [trackedProps, setTrackedProps] = useState<Record<string, boolean>>({});

  const toggleTrackProp = (propId: string) => {
    setTrackedProps(prev => ({
      ...prev,
      [propId]: !prev[propId],
    }));
  };

  const segments = [
    { id: 'poisson' as SegmentTab, label: 'Synthèse & Poisson' },
    { id: 'dynamics' as SegmentTab, label: 'Dynamique & H2H' },
    { id: 'props' as SegmentTab, label: `Props Joueurs (${match.keyProps.length})` },
    {
      id: 'lineups' as SegmentTab,
      label: `Absences & Impact (${match.missingPlayers.home.length + match.missingPlayers.away.length})`,
    },
  ];

  // Bookmaker best odds for 1X2
  const bestHome = Math.max(...match.bookmakerOdds.homeWin.map(o => o.odds));
  const bestDraw = Math.max(...match.bookmakerOdds.draw.map(o => o.odds));
  const bestAway = Math.max(...match.bookmakerOdds.awayWin.map(o => o.odds));

  // Consensus probabilities (approx 1/odds normalized)
  const rawSum = 1 / bestHome + 1 / bestDraw + 1 / bestAway;
  const bookmakerHomeProb = (1 / bestHome) / rawSum;
  const bookmakerDrawProb = (1 / bestDraw) / rawSum;
  const bookmakerAwayProb = (1 / bestAway) / rawSum;

  return (
    <div className="space-y-4">
      {/* Top Breadcrumb & Match Selector Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-sans"
        >
          <ArrowLeft size={14} strokeWidth={1.5} />
          <span>Retour au Dashboard</span>
        </Link>

        {/* Quick match switcher pills (Section 3.1 C Filter Chips) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 select-none">
          <span className="text-xs text-muted-foreground whitespace-nowrap font-sans">Changer de match :</span>
          {allMatches.map(m => (
            <Link
              key={m.id}
              href={`/match/${m.id}`}
              className={`h-7 sm:h-8 px-3 rounded-full text-xs font-medium transition-all whitespace-nowrap active:scale-95 cursor-pointer font-sans flex items-center ${m.id === match.id
                  ? 'bg-white text-zinc-950 font-medium shadow-sm'
                  : 'text-muted-foreground hover:text-foreground bg-transparent hover:bg-black/5 dark:hover:bg-white/[0.04] border border-border'
                }`}
            >
              {m.homeTeam.split(' ')[0]} - {m.awayTeam.split(' ')[0]}
            </Link>
          ))}
        </div>
      </div>

      {/* MATCH HERO HEADER (100% Opaque Card) */}
      <Card className="p-4 sm:p-6" glow="emerald">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Teams & Score / Time */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-sans">
                {match.competition}
              </span>
              <span className="text-muted-foreground/40">•</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1 tabular-nums font-sans">
                <Clock size={13} strokeWidth={1.5} />
                {new Date(match.kickoff).toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                (Mardi 3 nov.)
              </span>
              <span className="text-muted-foreground/40">•</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1 font-sans">
                <MapPin size={13} strokeWidth={1.5} />
                {match.venue}
              </span>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight font-sans">
                  {match.homeTeam}
                </h2>
                <div className="text-xs text-muted-foreground mt-0.5 tabular-nums font-sans">
                  xG Modèle : <span className="text-emerald-500 font-semibold">{match.homeExpectedGoals.toFixed(2)}</span>
                </div>
              </div>

              <span className="text-muted-foreground/40 text-2xl font-light">vs</span>

              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight font-sans">
                  {match.awayTeam}
                </h2>
                <div className="text-xs text-muted-foreground mt-0.5 tabular-nums font-sans">
                  xG Modèle : <span className="text-emerald-500 font-semibold">{match.awayExpectedGoals.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground font-sans">
              Arbitre : {match.referee}
            </p>
          </div>

          {/* Right: Algorithmic Confidence & Top EV badge */}
          <div className="flex flex-col sm:items-end justify-center gap-3 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
            <div className="text-left sm:text-right">
              <div className="flex items-center sm:justify-end gap-1.5 text-emerald-500 text-xs font-semibold uppercase tracking-wider font-sans">
                <ShieldCheck size={15} strokeWidth={1.5} />
                <span>Indice de Confiance Modèle</span>
              </div>
              <div className="text-3xl font-bold text-foreground tabular-nums font-sans mt-0.5">
                {match.algorithmicConfidence}
                <span className="text-sm font-normal text-muted-foreground">/100</span>
              </div>
              <span className="text-xs text-muted-foreground font-sans">
                Calibré sur 18,400 matchs européens
              </span>
            </div>

            {match.valueBets.length > 0 && (
              <div className="flex items-center gap-2 mt-1 font-sans">
                <span className="text-xs text-muted-foreground">Meilleure opportunité :</span>
                <EVBadge evPercent={match.valueBets[0].evPercent} size="md" />
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* APPLE-STYLE SEGMENTED CONTROL NAVIGATION */}
      <div className="flex justify-start sm:justify-center">
        <SegmentedControl
          options={segments}
          value={activeTab}
          onChange={tab => setActiveTab(tab)}
          layoutId="matchDetailTabPill"
          className="w-full sm:w-auto"
        />
      </div>

      {/* TAB CONTENT 1: SYNTHÈSE & POISSON */}
      {activeTab === 'poisson' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Poisson Heatmap (7 cols) */}
          <Card className="p-3.5 sm:p-5 lg:col-span-7">
            <PoissonHeatmap
              homeTeam={match.homeTeam}
              awayTeam={match.awayTeam}
              homeLambda={match.homeExpectedGoals}
              awayLambda={match.awayExpectedGoals}
            />
          </Card>

          {/* Right Column: Probabilities & Over/Under (5 cols) */}
          <div className="space-y-4 lg:col-span-5">
            {/* 1X2 Probabilities Comparison */}
            <Card className="p-3.5 sm:p-5">
              <h4 className="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-3 font-sans">
                Distribution 1X2 : Modèle vs Bookmakers
              </h4>

              <div className="space-y-3">
                <ProbabilityBar
                  label={`${match.homeTeam} (1)`}
                  modelProb={match.probabilities.homeWin}
                  bookmakerProb={bookmakerHomeProb}
                  bestOdds={bestHome}
                  evPercent={((match.probabilities.homeWin * bestHome) - 1) * 100}
                />
                <ProbabilityBar
                  label="Match Nul (X)"
                  modelProb={match.probabilities.draw}
                  bookmakerProb={bookmakerDrawProb}
                  bestOdds={bestDraw}
                  evPercent={((match.probabilities.draw * bestDraw) - 1) * 100}
                />
                <ProbabilityBar
                  label={`${match.awayTeam} (2)`}
                  modelProb={match.probabilities.awayWin}
                  bookmakerProb={bookmakerAwayProb}
                  bestOdds={bestAway}
                  evPercent={((match.probabilities.awayWin * bestAway) - 1) * 100}
                />
              </div>
            </Card>

            {/* Over/Under & BTTS Probabilities */}
            <Card className="p-3.5 sm:p-5">
              <h4 className="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-3 font-sans">
                Marchés Alternatifs & Buts
              </h4>

              <div className="space-y-3">
                <ProbabilityBar
                  label="Plus de 2.5 Buts"
                  modelProb={match.overUnder25.overProb}
                  bookmakerProb={1 / match.overUnder25.overBestOdds}
                  bestOdds={match.overUnder25.overBestOdds}
                  evPercent={match.overUnder25.overEV}
                />
                <ProbabilityBar
                  label="Les Deux Équipes Marquent"
                  modelProb={match.btts.yesProb}
                  bookmakerProb={1 / match.btts.yesBestOdds}
                  bestOdds={match.btts.yesBestOdds}
                  evPercent={match.btts.yesEV}
                />
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: DYNAMIQUE & TEMPORALITÉ (H2H) */}
      {activeTab === 'dynamics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Short-Term Form (5 matches) */}
          <Card className="p-4 sm:p-5 space-y-4">
            <div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-emerald-500 uppercase tracking-wider font-sans">
                Dynamique Récente (5 Derniers Matchs)
              </span>
              <h4 className="text-base font-semibold text-foreground tracking-tight mt-0.5 font-sans">
                Forme & Momentum Récent
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5 font-sans">
                Pondération temporelle exponentielle favorisant les 3 dernières semaines
              </p>
            </div>

            {/* Home Team Form */}
            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-border">
              <div className="flex items-center justify-between text-xs mb-2 font-sans">
                <span className="font-semibold text-foreground">{match.homeTeam}</span>
                <span className="text-muted-foreground tabular-nums">
                  xG Moyen : <strong className="text-emerald-500">{match.shortTermForm.homeXgAvg5}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {match.shortTermForm.home.map((f, i) => (
                  <div
                    key={i}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs tabular-nums ${f === 'V'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : f === 'N'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                  >
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Away Team Form */}
            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-border">
              <div className="flex items-center justify-between text-xs mb-2 font-sans">
                <span className="font-semibold text-foreground">{match.awayTeam}</span>
                <span className="text-muted-foreground tabular-nums">
                  xG Moyen : <strong className="text-emerald-500">{match.shortTermForm.awayXgAvg5}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {match.shortTermForm.away.map((f, i) => (
                  <div
                    key={i}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs tabular-nums ${f === 'V'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : f === 'N'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                  >
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Long-Term History (H2H) */}
          <Card className="p-4 sm:p-5 space-y-4">
            <div>
              <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider font-sans">
                Historique Long-Terme
              </span>
              <h4 className="text-base font-semibold text-foreground tracking-tight mt-0.5 font-sans">
                Confrontations Directes (H2H)
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5 font-sans">
                Bilan historique sur les {match.h2hHistory.totalMatches} dernières confrontations officielles
              </p>
            </div>

            {/* H2H Breakdown pills */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-border">
                <span className="text-[10px] text-muted-foreground uppercase block font-semibold font-sans">
                  Victoires {match.homeTeam.slice(0, 3)}
                </span>
                <span className="text-xl font-bold text-foreground tabular-nums font-sans">
                  {match.h2hHistory.homeWins}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-border">
                <span className="text-[10px] text-muted-foreground uppercase block font-semibold font-sans">
                  Nuls
                </span>
                <span className="text-xl font-bold text-foreground/80 tabular-nums font-sans">
                  {match.h2hHistory.draws}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-border">
                <span className="text-[10px] text-muted-foreground uppercase block font-semibold font-sans">
                  Victoires {match.awayTeam.slice(0, 3)}
                </span>
                <span className="text-xl font-bold text-foreground tabular-nums font-sans">
                  {match.h2hHistory.awayWins}
                </span>
              </div>
            </div>

            {/* Recent encounters list */}
            <div className="space-y-1.5 pt-2">
              <span className="text-xs text-muted-foreground font-medium font-sans">Dernières confrontations :</span>
              {match.h2hHistory.recentEncounters.map((enc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-white/[0.02] border border-border text-xs font-sans"
                >
                  <span className="text-muted-foreground tabular-nums">{enc.date}</span>
                  <span className="font-semibold text-foreground">
                    {match.homeTeam} {enc.homeScore} - {enc.awayScore} {match.awayTeam}
                  </span>
                  <span className="text-muted-foreground text-[11px]">
                    {enc.homeScore > enc.awayScore ? `Victoire ${match.homeTeam.slice(0, 3)}` : enc.homeScore === enc.awayScore ? 'Nul' : `Victoire ${match.awayTeam.slice(0, 3)}`}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB CONTENT 3: PROPS JOUEURS */}
      {activeTab === 'props' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-foreground tracking-tight font-sans">
                Props Joueurs Haute Précision
              </h3>
              <p className="text-xs text-muted-foreground font-sans">
                Tirs cadrés, probabilités de but et passes décisives avec calcul d’Expected Value
              </p>
            </div>
            <span className="text-xs font-medium text-emerald-500 tabular-nums font-sans">
              {match.keyProps.length} props disponibles
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {match.keyProps.map(prop => {
              const isTracked = trackedProps[prop.id];

              return (
                <Card
                  key={prop.id}
                  className="p-3.5 sm:p-4 xl:p-4.5 flex flex-col justify-between"
                  glow={prop.evPercent > 18 ? 'emerald' : 'none'}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-black/5 dark:bg-white/[0.05] border border-border text-muted-foreground font-sans">
                        {prop.team} • {prop.position}
                      </span>
                      <EVBadge evPercent={prop.evPercent} size="sm" />
                    </div>

                    <h4 className="text-base font-semibold text-foreground tracking-tight font-sans">
                      {prop.name}
                    </h4>
                    <div className="text-xs font-semibold text-emerald-500 mt-0.5 font-sans">
                      {prop.propType}
                    </div>

                    <p className="text-xs text-muted-foreground mt-2 bg-neutral-50 dark:bg-white/[0.03] p-2.5 rounded-xl border border-border font-sans">
                      {prop.recentFormStat}
                    </p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 my-3 text-center">
                      <div className="p-2 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-border">
                        <span className="text-[9px] text-muted-foreground uppercase block font-sans">Cote Book</span>
                        <span className="text-base font-bold text-foreground tabular-nums font-sans">
                          @{prop.bookmakerOdds.toFixed(2)}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-border">
                        <span className="text-[9px] text-muted-foreground uppercase block font-sans">Cote Juste</span>
                        <span className="text-base font-bold text-foreground/80 tabular-nums font-sans">
                          @{prop.fairOdds.toFixed(2)}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-border">
                        <span className="text-[9px] text-muted-foreground uppercase block font-sans">Tirs / 90m</span>
                        <span className="text-base font-bold text-emerald-500 tabular-nums font-sans">
                          {prop.avgShotsPer90}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleTrackProp(prop.id)}
                    className={`w-full h-9 rounded-full text-xs font-medium flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer font-sans ${isTracked
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-foreground text-background hover:opacity-90 shadow-sm'
                      }`}
                  >
                    {isTracked ? (
                      <>
                        <Check size={14} strokeWidth={2} />
                        <span>Prop Suivi</span>
                      </>
                    ) : (
                      <>
                        <BookmarkPlus size={14} strokeWidth={1.75} />
                        <span>Suivre ce Prop</span>
                      </>
                    )}
                  </button>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: LINEUPS & ABSENCES */}
      {activeTab === 'lineups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Home Absences */}
          <Card className="p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider font-sans">
                  Infirmerie & Suspensions
                </span>
                <h4 className="text-base font-semibold text-foreground tracking-tight mt-0.5 font-sans">
                  {match.homeTeam}
                </h4>
              </div>
              <span className="text-xs text-muted-foreground tabular-nums font-sans">
                {match.missingPlayers.home.length} absences
              </span>
            </div>

            {match.missingPlayers.home.length === 0 ? (
              <p className="text-xs text-emerald-500 italic font-sans">
                Effectif au complet, aucun joueur majeur absent.
              </p>
            ) : (
              <div className="space-y-2">
                {match.missingPlayers.home.map((player, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-border flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground font-sans">{player.name}</span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-black/5 dark:bg-white/[0.05] border border-border text-muted-foreground font-sans">
                          {player.role}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 font-sans">
                        Motif : {player.reason} ({player.status})
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-muted-foreground uppercase block font-sans">Impact</span>
                      <span className="text-xs font-bold text-rose-500 tabular-nums font-sans">
                        {player.impactXgDelta > 0 ? `+${player.impactXgDelta}` : player.impactXgDelta} xG
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Away Absences */}
          <Card className="p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] sm:text-[11px] font-semibold text-muted-foreground uppercase tracking-wider font-sans">
                  Infirmerie & Suspensions
                </span>
                <h4 className="text-base font-semibold text-foreground tracking-tight mt-0.5 font-sans">
                  {match.awayTeam}
                </h4>
              </div>
              <span className="text-xs text-muted-foreground tabular-nums font-sans">
                {match.missingPlayers.away.length} absences
              </span>
            </div>

            {match.missingPlayers.away.length === 0 ? (
              <p className="text-xs text-emerald-500 italic font-sans">
                Effectif au complet, aucun joueur majeur absent.
              </p>
            ) : (
              <div className="space-y-2">
                {match.missingPlayers.away.map((player, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-border flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-foreground font-sans">{player.name}</span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full bg-black/5 dark:bg-white/[0.05] border border-border text-muted-foreground font-sans">
                          {player.role}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 font-sans">
                        Motif : {player.reason} ({player.status})
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-muted-foreground uppercase block font-sans">Impact</span>
                      <span className="text-xs font-bold text-rose-500 tabular-nums font-sans">
                        {player.impactXgDelta > 0 ? `+${player.impactXgDelta}` : player.impactXgDelta} xG
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
