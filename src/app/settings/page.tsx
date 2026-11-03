'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import {
  Sliders,
  ShieldCheck,
  Bell,
  Database,
  SlidersHorizontal,
  Check,
  RotateCcw,
  Save,
  ArrowLeft,
  Zap,
} from 'lucide-react';

export default function SettingsPage() {
  // Model Parameters State
  const [minEvThreshold, setMinEvThreshold] = useState<number>(5.0);
  const [defaultKellyFraction, setDefaultKellyFraction] = useState<number>(0.25);
  const [poissonModel, setPoissonModel] = useState<'bivariate' | 'dixon_coles'>('bivariate');
  const [xgDecayFactor, setXgDecayFactor] = useState<number>(0.85);

  // Bookmakers Toggles
  const [bookmakers, setBookmakers] = useState({
    pinnacle: true,
    winamax: true,
    betclic: true,
    unibet: true,
  });

  // Notifications & Alerts
  const [notifyHighEv, setNotifyHighEv] = useState(true);
  const [notifyDroppingOdds, setNotifyDroppingOdds] = useState(true);
  const [dropThreshold, setDropThreshold] = useState<number>(7.0);

  // Display & Odds Format
  const [oddsFormat, setOddsFormat] = useState<'decimal' | 'american' | 'fractional'>('decimal');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = () => {
    showToast('Configuration enregistrée avec succès dans le cache local');
  };

  const handleReset = () => {
    setMinEvThreshold(5.0);
    setDefaultKellyFraction(0.25);
    setPoissonModel('bivariate');
    setXgDecayFactor(0.85);
    setBookmakers({ pinnacle: true, winamax: true, betclic: true, unibet: true });
    setNotifyHighEv(true);
    setNotifyDroppingOdds(true);
    setDropThreshold(7.0);
    setOddsFormat('decimal');
    showToast('Paramètres réinitialisés aux valeurs canoniques');
  };

  return (
    <div className="space-y-4">
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-card/95 backdrop-blur-2xl border border-border shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.08)] px-4 py-2.5 rounded-full text-xs font-semibold text-foreground flex items-center gap-2 font-sans animate-bounce">
          <Zap size={14} className="text-emerald-500 fill-emerald-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors font-sans"
            >
              <ArrowLeft size={13} strokeWidth={1.5} />
              <span>Dashboard</span>
            </Link>
            <span className="text-muted-foreground/40">•</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-500 font-sans">
              Configuration Système
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight mt-1 font-sans">
            Réglages & Paramètres du Modèle Quantitatif
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 max-w-2xl font-sans">
            Ajustez les seuils de sensibilité des anomalies de marché, les sources de cotes actives et les options de calcul Kelly.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="h-9 px-3.5 rounded-full bg-black/5 dark:bg-white/[0.06] hover:bg-black/10 dark:hover:bg-white/[0.1] border border-border text-xs font-medium text-foreground flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer font-sans"
          >
            <RotateCcw size={14} strokeWidth={1.75} />
            <span>Réinitialiser</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-9 px-4 rounded-full bg-foreground text-background font-medium text-xs sm:text-sm flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer font-sans shrink-0 focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:outline-none"
          >
            <Save size={15} strokeWidth={2} />
            <span>Enregistrer</span>
          </button>
        </div>
      </div>

      {/* Bento Grid Settings Islands */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 1. Algorithme & Modélisation Mathématique */}
        <Card className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Sliders size={16} strokeWidth={1.75} className="text-emerald-500" />
            <h3 className="text-sm font-semibold tracking-tight text-foreground font-sans">
              Modélisation & Algorithme Prédictif
            </h3>
          </div>

          {/* Model Engine Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground block font-sans">
              Moteur Mathématique des Probabilités
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPoissonModel('bivariate')}
                className={`p-3 rounded-xl border text-left transition-all active:scale-[0.98] cursor-pointer font-sans ${
                  poissonModel === 'bivariate'
                    ? 'bg-neutral-100 dark:bg-white/[0.08] border-foreground/30 shadow-sm'
                    : 'bg-black/[0.02] dark:bg-white/[0.02] border-border text-muted-foreground'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-foreground">Bivarié Poisson</span>
                  {poissonModel === 'bivariate' && <Check size={14} className="text-emerald-500" />}
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Corrélation faible entre buts à domicile et à l’extérieur (Recommandé).
                </p>
              </button>

              <button
                type="button"
                onClick={() => setPoissonModel('dixon_coles')}
                className={`p-3 rounded-xl border text-left transition-all active:scale-[0.98] cursor-pointer font-sans ${
                  poissonModel === 'dixon_coles'
                    ? 'bg-neutral-100 dark:bg-white/[0.08] border-foreground/30 shadow-sm'
                    : 'bg-black/[0.02] dark:bg-white/[0.02] border-border text-muted-foreground'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-foreground">Dixon-Coles</span>
                  {poissonModel === 'dixon_coles' && <Check size={14} className="text-emerald-500" />}
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Ajustement fin sur les scores nuls (0-0, 1-1) et sous-estimation.
                </p>
              </button>
            </div>
          </div>

          {/* EV Threshold Slider */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-muted-foreground font-medium">Seuil Minimal d’Expected Value (+EV)</span>
              <span className="text-emerald-500 font-bold tabular-nums">+{minEvThreshold.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="0.5"
              value={minEvThreshold}
              onChange={e => setMinEvThreshold(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 bg-neutral-200 dark:bg-white/10 h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-sans">
              <span>+1.0% (Large)</span>
              <span>+15.0% (Opportunités d’élite)</span>
            </div>
          </div>

          {/* Kelly Fraction Selector */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-muted-foreground font-medium">Fraction de Risque Kelly par Défaut</span>
              <span className="text-amber-500 font-bold tabular-nums">{defaultKellyFraction}x</span>
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
                  onClick={() => setDefaultKellyFraction(opt.val)}
                  className={`h-8 rounded-full text-xs font-semibold tabular-nums transition-all active:scale-95 cursor-pointer font-sans ${
                    defaultKellyFraction === opt.val
                      ? 'bg-white text-zinc-950 font-medium shadow-sm'
                      : 'bg-black/5 dark:bg-white/[0.04] border border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* xG Temporal Decay */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex justify-between text-xs font-sans">
              <span className="text-muted-foreground font-medium">Pondération Décroissance xG (Half-life)</span>
              <span className="text-foreground font-bold tabular-nums">{(xgDecayFactor * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.0"
              step="0.05"
              value={xgDecayFactor}
              onChange={e => setXgDecayFactor(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 bg-neutral-200 dark:bg-white/10 h-1.5 rounded-lg cursor-pointer"
            />
            <p className="text-[11px] text-muted-foreground font-sans">
              Pondère davantage les performances des 3 dernières semaines par rapport aux matchs plus anciens.
            </p>
          </div>
        </Card>

        {/* 2. Bookmakers Actifs & Intégrations */}
        <Card className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <ShieldCheck size={16} strokeWidth={1.75} className="text-emerald-500" />
            <h3 className="text-sm font-semibold tracking-tight text-foreground font-sans">
              Bookmakers Actifs & Flux de Cotes
            </h3>
          </div>

          <p className="text-xs text-muted-foreground font-sans">
            Sélectionnez les opérateurs pris en compte dans le calcul de la meilleure cote et du consensus de marché.
          </p>

          <div className="space-y-2.5">
            {[
              { id: 'pinnacle' as const, name: 'Pinnacle Sports', role: 'Sharp / Benchmark de référence', margin: '2.1%' },
              { id: 'winamax' as const, name: 'Winamax', role: 'Bookmaker Récréatif FR', margin: '5.4%' },
              { id: 'betclic' as const, name: 'Betclic', role: 'Bookmaker Récréatif FR', margin: '5.8%' },
              { id: 'unibet' as const, name: 'Unibet', role: 'Bookmaker Récréatif FR / Props', margin: '5.6%' },
            ].map(bm => {
              const active = bookmakers[bm.id];
              return (
                <div
                  key={bm.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-border"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground font-sans">{bm.name}</span>
                      <span className="text-[10px] px-2 py-0.2 rounded-full bg-black/5 dark:bg-white/[0.05] border border-border text-muted-foreground font-sans">
                        Marge ~{bm.margin}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground font-sans block mt-0.5">{bm.role}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setBookmakers(prev => ({ ...prev, [bm.id]: !prev[bm.id] }))}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer active:scale-95 ${
                      active ? 'bg-emerald-500' : 'bg-black/20 dark:bg-white/20'
                    }`}
                    aria-label={`Activer ${bm.name}`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                        active ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Odds Format Selector */}
          <div className="space-y-2 pt-2 border-t border-border">
            <span className="text-xs font-medium text-muted-foreground block font-sans">
              Format d’Affichage des Cotes
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'decimal' as const, label: 'Décimal (@2.10)' },
                { id: 'american' as const, label: 'Américain (+110)' },
                { id: 'fractional' as const, label: 'Fractionnaire (11/10)' },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setOddsFormat(opt.id)}
                  className={`h-8 rounded-full text-xs font-medium transition-all active:scale-95 cursor-pointer font-sans ${
                    oddsFormat === opt.id
                      ? 'bg-white text-zinc-950 font-medium shadow-sm'
                      : 'bg-black/5 dark:bg-white/[0.04] border border-border text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* 3. Alertes & Détecteurs en Temps Réel */}
        <Card className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Bell size={16} strokeWidth={1.75} className="text-emerald-500" />
            <h3 className="text-sm font-semibold tracking-tight text-foreground font-sans">
              Système d’Alerte & Surveillance Live
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-border">
              <div>
                <span className="text-xs font-semibold text-foreground font-sans block">
                  Alertes Dropping Odds Rapides
                </span>
                <span className="text-[11px] text-muted-foreground font-sans">
                  Notifier lors d’une chute brutale de cote avant clôture
                </span>
              </div>
              <button
                type="button"
                onClick={() => setNotifyDroppingOdds(!notifyDroppingOdds)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer active:scale-95 ${
                  notifyDroppingOdds ? 'bg-emerald-500' : 'bg-black/20 dark:bg-white/20'
                }`}
                aria-label="Basculer alertes dropping odds"
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                    notifyDroppingOdds ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {notifyDroppingOdds && (
              <div className="space-y-2 px-1">
                <div className="flex justify-between text-xs font-sans">
                  <span className="text-muted-foreground">Chute minimale pour alerte</span>
                  <span className="text-rose-500 font-bold tabular-nums">-{dropThreshold.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="15"
                  step="0.5"
                  value={dropThreshold}
                  onChange={e => setDropThreshold(parseFloat(e.target.value))}
                  className="w-full accent-rose-500 bg-neutral-200 dark:bg-white/10 h-1.5 rounded-lg cursor-pointer"
                />
              </div>
            )}

            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-border">
              <div>
                <span className="text-xs font-semibold text-foreground font-sans block">
                  Alerte Haute Expected Value (+EV {'>'} 15%)
                </span>
                <span className="text-[11px] text-muted-foreground font-sans">
                  Afficher une notification toast immédiate sur le terminal
                </span>
              </div>
              <button
                type="button"
                onClick={() => setNotifyHighEv(!notifyHighEv)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer active:scale-95 ${
                  notifyHighEv ? 'bg-emerald-500' : 'bg-black/20 dark:bg-white/20'
                }`}
                aria-label="Basculer alertes haute EV"
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                    notifyHighEv ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </Card>

        {/* 4. Données, Cache & Maintenance */}
        <Card className="p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Database size={16} strokeWidth={1.75} className="text-emerald-500" />
            <h3 className="text-sm font-semibold tracking-tight text-foreground font-sans">
              Données, Cache & Maintenance
            </h3>
          </div>

          <p className="text-xs text-muted-foreground font-sans">
            Gérez les instantanés locaux de votre portefeuille de simulation et videz les mémoires tampons de cotes.
          </p>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-border">
              <div>
                <span className="text-xs font-semibold text-foreground font-sans block">Cache des Cotes Live</span>
                <span className="text-[11px] text-muted-foreground font-sans">Dernière synchronisation : Il y a 3 minutes</span>
              </div>
              <button
                type="button"
                onClick={() => showToast('Cache des cotes vidé. Rechargement du flux synchrone.')}
                className="h-8 px-3 rounded-full bg-black/5 dark:bg-white/[0.06] hover:bg-black/10 dark:hover:bg-white/[0.1] border border-border text-xs font-medium text-foreground transition-all active:scale-95 cursor-pointer font-sans"
              >
                Vider le cache
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-white/[0.03] border border-border">
              <div>
                <span className="text-xs font-semibold text-foreground font-sans block">Export du Grand Livre</span>
                <span className="text-[11px] text-muted-foreground font-sans">Télécharger l’historique des paris suivis (JSON/CSV)</span>
              </div>
              <button
                type="button"
                onClick={() => showToast('Export du grand livre généré')}
                className="h-8 px-3 rounded-full bg-black/5 dark:bg-white/[0.06] hover:bg-black/10 dark:hover:bg-white/[0.1] border border-border text-xs font-medium text-foreground transition-all active:scale-95 cursor-pointer font-sans"
              >
                Exporter (.json)
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
