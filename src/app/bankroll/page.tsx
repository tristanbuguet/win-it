'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { EVBadge, StatusBadge } from '@/components/ui/Badge';
import { CloseButton } from '@/components/ui/CloseButton';
import { mockBankrollBets } from '@/lib/mock-data';
import { calculateKellyStake, calculateEV } from '@/lib/math-engine';
import { BankrollBet } from '@/types';
import {
  Wallet,
  Calculator,
  Plus,
  Check,
  X,
  TrendingUp,
  Percent,
  Clock,
  ChevronDown,
} from 'lucide-react';

export default function BankrollPage() {
  const [bets, setBets] = useState<BankrollBet[]>(mockBankrollBets);
  const [statusFilter, setStatusFilter] = useState<'Tous' | 'En cours' | 'Gagné' | 'Perdu'>('Tous');

  // Kelly Calculator interactive inputs
  const [calcBankroll, setCalcBankroll] = useState<number>(6320);
  const [calcProb, setCalcProb] = useState<number>(55); // in percent (55%)
  const [calcOdds, setCalcOdds] = useState<number>(2.10);
  const [calcFraction, setCalcFraction] = useState<number>(0.25);

  // New bet modal toggle
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMatch, setNewMatch] = useState('');
  const [newSelection, setNewSelection] = useState('');
  const [newOdds, setNewOdds] = useState('2.00');
  const [newStake, setNewStake] = useState('100');
  const [newBookmaker, setNewBookmaker] = useState<'Pinnacle' | 'Winamax' | 'Betclic' | 'Unibet'>('Pinnacle');

  // Calculate Kelly for the calculator widget
  const kellyResult = calculateKellyStake(
    calcBankroll,
    calcProb / 100,
    calcOdds,
    calcFraction
  );
  const evResult = calculateEV(calcProb / 100, calcOdds) * 100;

  // Aggregate stats from bets list
  const activeBets = bets.filter(b => b.status === 'En cours');
  const closedBets = bets.filter(b => b.status !== 'En cours');
  const wonBets = bets.filter(b => b.status === 'Gagné');

  const committedCapital = activeBets.reduce((acc, b) => acc + b.stake, 0);
  const totalProfit = closedBets.reduce((acc, b) => acc + (b.pnl || 0), 0);
  const totalStakedClosed = closedBets.reduce((acc, b) => acc + b.stake, 0);
  const currentROI = totalStakedClosed > 0 ? (totalProfit / totalStakedClosed) * 100 : 0;
  const winRate = closedBets.length > 0 ? (wonBets.length / closedBets.length) * 100 : 0;

  const currentTotalBankroll = 5000 + totalProfit;

  // Handler to update bet status (Gagné / Perdu)
  const handleUpdateStatus = (betId: string, newStatus: 'Gagné' | 'Perdu') => {
    setBets(prev =>
      prev.map(bet => {
        if (bet.id === betId) {
          const pnl = newStatus === 'Gagné' ? Math.round(bet.stake * (bet.odds - 1)) : -bet.stake;
          return { ...bet, status: newStatus, pnl };
        }
        return bet;
      })
    );
  };

  // Handler to add custom bet
  const handleAddBet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMatch || !newSelection) return;

    const oddsNum = parseFloat(newOdds) || 2.0;
    const stakeNum = parseFloat(newStake) || 50;
    const estimatedProb = 1 / oddsNum + 0.05; // slightly positive EV
    const ev = ((estimatedProb * oddsNum) - 1) * 100;

    const newBetItem: BankrollBet = {
      id: `custom-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      matchTitle: newMatch,
      selection: newSelection,
      odds: oddsNum,
      stake: stakeNum,
      modelProb: estimatedProb,
      evPercent: Math.round(ev * 10) / 10,
      status: 'En cours',
      bookmaker: newBookmaker,
    };

    setBets([newBetItem, ...bets]);
    setNewMatch('');
    setNewSelection('');
    setShowAddForm(false);
  };

  const filteredBets = bets.filter(b => {
    if (statusFilter === 'Tous') return true;
    return b.status === statusFilter;
  });

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-500 font-sans">
              Gestion de Capital & Risque
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span className="text-xs text-muted-foreground font-sans">Critère de Kelly Fractionné</span>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight mt-1 font-sans">
            Tableau de Bord Bankroll & Tracker
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 max-w-2xl font-sans">
            Suivi temps réel de votre portefeuille de paris, dimensionnement optimal des mises et gestion rigoureuse de la variance.
          </p>
        </div>

        {/* Primary Action Pill (Section 3.1 A) */}
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="h-9 px-4 rounded-full bg-foreground text-background font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer font-sans shrink-0 focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:outline-none"
        >
          <Plus size={15} strokeWidth={1.75} />
          <span>Ajouter un Pari</span>
        </button>
      </div>

      {/* FLOATING GLASSMORPHISM MODAL (Section 3.5 & 1.2 B of DESIGN_SYSTEM.md) */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Scrim Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddForm(false)}
              className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-md"
            />

            {/* Modal Dialog Window */}
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className="relative w-full max-w-lg bg-card/95 backdrop-blur-2xl border border-border shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.08)] rounded-3xl p-5 sm:p-6 z-10 font-sans flex flex-col"
            >
              <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                <div>
                  <h3 className="text-base font-semibold text-foreground tracking-tight font-sans">
                    Nouveau Pari Manuel
                  </h3>
                  <p className="text-xs text-muted-foreground font-sans mt-0.5">
                    Ajouter une opération à suivre dans votre grand livre
                  </p>
                </div>
                <CloseButton onClick={() => setShowAddForm(false)} />
              </div>

              <form onSubmit={handleAddBet} className="space-y-3.5">
                <div>
                  <label className="text-xs text-muted-foreground font-medium block mb-1 font-sans">
                    Affiche du Match
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Real Madrid vs Milan"
                    value={newMatch}
                    onChange={e => setNewMatch(e.target.value)}
                    required
                    className="w-full h-9 px-3.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-foreground/30 focus-visible:ring-2 focus-visible:ring-foreground/10 transition-all font-sans"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground font-medium block mb-1 font-sans">
                    Sélection / Marché
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Kylian Mbappé Buteur"
                    value={newSelection}
                    onChange={e => setNewSelection(e.target.value)}
                    required
                    className="w-full h-9 px-3.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-border text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-foreground/30 focus-visible:ring-2 focus-visible:ring-foreground/10 transition-all font-sans"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="text-xs text-muted-foreground font-medium block mb-1 font-sans">
                      Cote
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="1.01"
                      value={newOdds}
                      onChange={e => setNewOdds(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-border text-foreground text-sm font-medium tabular-nums font-sans outline-none focus:border-foreground/30 transition-all text-right"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground font-medium block mb-1 font-sans">
                      Mise (€)
                    </label>
                    <input
                      type="number"
                      step="5"
                      min="1"
                      value={newStake}
                      onChange={e => setNewStake(e.target.value)}
                      className="w-full h-9 px-3 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-border text-foreground text-sm font-medium tabular-nums font-sans outline-none focus:border-foreground/30 transition-all text-right"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground font-medium block mb-1 font-sans">
                      Bookmaker
                    </label>
                    <div className="relative">
                      <select
                        value={newBookmaker}
                        onChange={e => setNewBookmaker(e.target.value as any)}
                        className="w-full h-9 appearance-none bg-black/[0.03] dark:bg-white/[0.04] border border-border text-foreground text-xs font-medium pl-3 pr-7 rounded-xl outline-none font-sans cursor-pointer"
                      >
                        <option value="Pinnacle" className="bg-card text-foreground">Pinnacle</option>
                        <option value="Winamax" className="bg-card text-foreground">Winamax</option>
                        <option value="Betclic" className="bg-card text-foreground">Betclic</option>
                        <option value="Unibet" className="bg-card text-foreground">Unibet</option>
                      </select>
                      <ChevronDown size={13} strokeWidth={1.5} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border mt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="h-9 px-4 rounded-full bg-black/5 dark:bg-white/[0.06] hover:bg-black/10 dark:hover:bg-white/[0.1] border border-border text-xs sm:text-sm font-medium text-foreground flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer font-sans"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="h-9 px-4 rounded-full bg-foreground text-background font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer font-sans shrink-0 focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:outline-none"
                  >
                    <span>Enregistrer</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FINANCIAL KPIs ISLANDS (Grille 4 KPIs conforme VIEWPORT_LAYOUT.md 4.2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 shrink-0">
        {/* KPI 1: Total Bankroll */}
        <Card className="min-h-[120px] sm:min-h-[126px] xl:min-h-[132px] flex flex-col justify-between" glow="emerald">
          <div className="flex justify-between items-start mb-1 sm:mb-2">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground font-sans truncate">
              Bankroll Totale
            </span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shrink-0 ml-2">
              <Wallet size={15} strokeWidth={1.5} />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-xl sm:text-2xl xl:text-3xl font-semibold mb-0.5 sm:mb-1 tracking-tight text-foreground tabular-nums font-sans">
              {currentTotalBankroll.toLocaleString('fr-FR')} €
            </div>
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-medium w-full text-muted-foreground font-sans">
              <span className="text-emerald-500 font-semibold tabular-nums">
                +{((totalProfit / 5000) * 100).toFixed(1)}%
              </span>
              <span className="truncate">Départ : 5 000 €</span>
            </div>
          </div>
        </Card>

        {/* KPI 2: Committed Capital */}
        <Card className="min-h-[120px] sm:min-h-[126px] xl:min-h-[132px] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-1 sm:mb-2">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground font-sans truncate">
              Capital Engagé
            </span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-amber-500/10 border border-amber-500/20 text-amber-500 shrink-0 ml-2">
              <Clock size={15} strokeWidth={1.5} />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-xl sm:text-2xl xl:text-3xl font-semibold mb-0.5 sm:mb-1 tracking-tight text-amber-500 tabular-nums font-sans">
              {committedCapital} €
            </div>
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-medium w-full text-muted-foreground font-sans">
              <span className="tabular-nums">
                {((committedCapital / currentTotalBankroll) * 100).toFixed(1)}% du capital
              </span>
              <span className="truncate">{activeBets.length} paris actifs</span>
            </div>
          </div>
        </Card>

        {/* KPI 3: Profit & Loss */}
        <Card className="min-h-[120px] sm:min-h-[126px] xl:min-h-[132px] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-1 sm:mb-2">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground font-sans truncate">
              Profit Net Clôturé
            </span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shrink-0 ml-2">
              <TrendingUp size={15} strokeWidth={1.5} />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-xl sm:text-2xl xl:text-3xl font-semibold mb-0.5 sm:mb-1 tracking-tight text-emerald-500 tabular-nums font-sans">
              +{totalProfit.toLocaleString('fr-FR')} €
            </div>
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-medium w-full text-muted-foreground font-sans">
              <span className="text-emerald-500 font-semibold tabular-nums">+{currentROI.toFixed(1)}% ROI</span>
              <span className="truncate">Paris terminés</span>
            </div>
          </div>
        </Card>

        {/* KPI 4: Winrate */}
        <Card className="min-h-[120px] sm:min-h-[126px] xl:min-h-[132px] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-1 sm:mb-2">
            <span className="text-xs sm:text-sm font-medium text-muted-foreground font-sans truncate">
              Taux de Réussite
            </span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-black/[0.04] dark:bg-white/[0.05] border border-border text-muted-foreground shrink-0 ml-2">
              <Percent size={15} strokeWidth={1.5} />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="text-xl sm:text-2xl xl:text-3xl font-semibold mb-0.5 sm:mb-1 tracking-tight text-foreground tabular-nums font-sans">
              {winRate.toFixed(1)}%
            </div>
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-medium w-full text-muted-foreground font-sans">
              <span className="tabular-nums">{wonBets.length} / {closedBets.length} gagnés</span>
              <span className="truncate">Variance saine</span>
            </div>
          </div>
        </Card>
      </div>

      {/* INTERACTIVE KELLY CRITERION CALCULATOR */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Calculator size={15} strokeWidth={1.5} className="text-emerald-500" />
              <h3 className="text-sm font-semibold tracking-tight text-foreground font-sans">
                Calculateur Intégré du Critère de Kelly
              </h3>
            </div>
            <p className="text-xs text-muted-foreground font-sans mt-0.5">
              Dimensionnement mathématique optimal de la mise en fonction de l’espérance et de la variance
            </p>
          </div>

          <span className="text-xs text-emerald-500 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 font-sans self-start sm:self-auto">
            Formule : f* = (bp - q) / b
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Input 1: Bankroll */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground block font-medium font-sans">Bankroll Disponible (€)</label>
            <input
              type="number"
              step="100"
              value={calcBankroll}
              onChange={e => setCalcBankroll(parseFloat(e.target.value) || 1000)}
              className="w-full h-9 px-3.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-border text-foreground text-sm font-semibold tabular-nums font-sans outline-none focus:border-foreground/30 transition-all text-right"
            />
          </div>

          {/* Input 2: Model Prob */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground block font-medium font-sans">Probabilité Modèle (%)</label>
            <input
              type="number"
              step="1"
              min="1"
              max="99"
              value={calcProb}
              onChange={e => setCalcProb(parseFloat(e.target.value) || 50)}
              className="w-full h-9 px-3.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-border text-foreground text-sm font-semibold tabular-nums font-sans outline-none focus:border-foreground/30 transition-all text-right"
            />
          </div>

          {/* Input 3: Bookmaker Odds */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground block font-medium font-sans">Cote Bookmaker (@)</label>
            <input
              type="number"
              step="0.05"
              min="1.05"
              value={calcOdds}
              onChange={e => setCalcOdds(parseFloat(e.target.value) || 2.0)}
              className="w-full h-9 px-3.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.04] border border-border text-foreground text-sm font-semibold tabular-nums font-sans outline-none focus:border-foreground/30 transition-all text-right"
            />
          </div>

          {/* Input 4: Kelly Fraction Selector */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground block font-medium font-sans">
              Fraction de Risque Kelly
            </label>
            <div className="relative">
              <select
                value={calcFraction}
                onChange={e => setCalcFraction(parseFloat(e.target.value))}
                className="w-full h-9 appearance-none bg-black/[0.03] dark:bg-white/[0.04] border border-border text-foreground text-xs font-medium pl-3.5 pr-8 rounded-xl outline-none hover:border-foreground/30 cursor-pointer font-sans"
              >
                <option value={0.1} className="bg-card text-foreground">1/10 Kelly (Ultra Prudent)</option>
                <option value={0.25} className="bg-card text-foreground">1/4 Kelly (Recommandé Pro)</option>
                <option value={0.5} className="bg-card text-foreground">1/2 Kelly (Modéré)</option>
                <option value={1.0} className="bg-card text-foreground">Plein Kelly (Agressif)</option>
              </select>
              <ChevronDown size={13} strokeWidth={1.5} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Kelly Live Calculation Results Bar */}
        <div className="mt-4 p-3.5 rounded-2xl bg-neutral-50 dark:bg-white/[0.03] border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans">
          <div className="flex items-center gap-6 flex-wrap">
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-medium">
                Mise Conseillée
              </span>
              <div className="text-lg sm:text-xl font-bold text-emerald-500 tabular-nums">
                {kellyResult.stake} €{' '}
                <span className="text-xs font-medium text-muted-foreground">
                  ({kellyResult.percent}% de la bankroll)
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-medium">
                Expected Value (EV)
              </span>
              <div
                className={`text-lg sm:text-xl font-bold tabular-nums ${evResult > 0 ? 'text-emerald-500' : 'text-rose-500'
                  }`}
              >
                {evResult > 0 ? `+${evResult.toFixed(1)}%` : `${evResult.toFixed(1)}%`}
              </div>
            </div>

            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block font-medium">
                Cote Juste Modèle
              </span>
              <div className="text-base sm:text-lg font-bold text-foreground/80 tabular-nums">
                @{(100 / calcProb).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Risque :</span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold tabular-nums font-sans ${kellyResult.percent <= 2.5
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : kellyResult.percent <= 5.0
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                }`}
            >
              {kellyResult.percent <= 2.5 ? 'Sécurisé' : kellyResult.percent <= 5.0 ? 'Modéré' : 'Élevé'}
            </span>
          </div>
        </div>
      </Card>

      {/* TRACKED BETS LEDGER */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-border pb-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-tight font-sans">
              Grand Livre des Paris Suivis
            </h3>
            <p className="text-xs text-muted-foreground font-sans mt-0.5">
              Historique complet et suivi en cours avec validation des gains
            </p>
          </div>

          {/* Status filter chips (Section 3.1 C) */}
          <div className="flex items-center gap-1 overflow-x-auto select-none">
            {(['Tous', 'En cours', 'Gagné', 'Perdu'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`h-7 sm:h-8 px-3 rounded-full text-xs font-medium transition-all active:scale-95 cursor-pointer font-sans ${statusFilter === tab
                    ? 'bg-white text-zinc-950 font-medium shadow-sm'
                    : 'text-muted-foreground hover:text-foreground bg-transparent hover:bg-black/5 dark:hover:bg-white/[0.04]'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Bets Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-[10px] font-semibold uppercase tracking-wider">
                <th className="pb-2.5">Date</th>
                <th className="pb-2.5">Match & Sélection</th>
                <th className="pb-2.5 text-right">Cote</th>
                <th className="pb-2.5 text-right">EV %</th>
                <th className="pb-2.5 text-right">Mise</th>
                <th className="pb-2.5 text-center">Bookmaker</th>
                <th className="pb-2.5 text-center">Statut</th>
                <th className="pb-2.5 text-right">P&L</th>
                <th className="pb-2.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredBets.map(bet => (
                <tr key={bet.id} className="hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 text-muted-foreground tabular-nums whitespace-nowrap">
                    {bet.date}
                  </td>
                  <td className="py-2.5">
                    <span className="font-semibold text-foreground block">{bet.matchTitle}</span>
                    <span className="text-emerald-500 font-medium text-[11px]">
                      {bet.selection}
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-bold text-foreground tabular-nums">
                    @{bet.odds.toFixed(2)}
                  </td>
                  <td className="py-2.5 text-right font-semibold text-emerald-500 tabular-nums">
                    +{bet.evPercent.toFixed(1)}%
                  </td>
                  <td className="py-2.5 text-right font-medium text-foreground tabular-nums">
                    {bet.stake} €
                  </td>
                  <td className="py-2.5 text-center">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/[0.05] border border-border text-muted-foreground">
                      {bet.bookmaker}
                    </span>
                  </td>
                  <td className="py-2.5 text-center">
                    <StatusBadge status={bet.status} />
                  </td>
                  <td
                    className={`py-2.5 text-right font-bold tabular-nums whitespace-nowrap ${bet.pnl !== undefined
                        ? bet.pnl >= 0
                          ? 'text-emerald-500'
                          : 'text-rose-500'
                        : 'text-muted-foreground'
                      }`}
                  >
                    {bet.pnl !== undefined
                      ? bet.pnl >= 0
                        ? `+${bet.pnl} €`
                        : `${bet.pnl} €`
                      : '—'}
                  </td>
                  <td className="py-2.5 text-center">
                    {bet.status === 'En cours' ? (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(bet.id, 'Gagné')}
                          className="w-7 h-7 rounded-full flex items-center justify-center bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/30 active:scale-95 transition-all cursor-pointer"
                          title="Marquer comme Gagné"
                        >
                          <Check size={13} strokeWidth={2.2} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(bet.id, 'Perdu')}
                          className="w-7 h-7 rounded-full flex items-center justify-center bg-rose-500/15 text-rose-400 hover:bg-rose-500/30 active:scale-95 transition-all cursor-pointer"
                          title="Marquer comme Perdu"
                        >
                          <X size={13} strokeWidth={2.2} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground/60 font-sans">Clôturé</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
