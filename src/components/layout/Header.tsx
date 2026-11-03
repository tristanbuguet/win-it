'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, ChevronDown, RotateCcw } from 'lucide-react';

export function Header() {
  const pathname = usePathname();
  const [selectedLeague, setSelectedLeague] = useState<string>('Toutes les compétitions');
  const [currentDateText, setCurrentDateText] = useState('');

  useEffect(() => {
    const now = new Date();
    const formatted = now.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    // Capitalize first letter
    setCurrentDateText(formatted.charAt(0).toUpperCase() + formatted.slice(1));
  }, []);

  // Dynamic Page Title
  const getPageTitle = () => {
    if (pathname === '/') return "Vue d'ensemble";
    if (pathname.startsWith('/screener')) return 'Screener Prédictif';
    if (pathname.startsWith('/match')) return 'Match Hub & Poisson';
    if (pathname.startsWith('/lab')) return 'Lab Quant & Backtest';
    if (pathname.startsWith('/bankroll')) return 'Bankroll & Risque Kelly';
    return "Vue d'ensemble";
  };

  const leagues = [
    'Toutes les compétitions',
    'Champions League',
    'Premier League',
    'Ligue 1',
    'La Liga',
    'Serie A',
  ];

  return (
    <header className="flex items-center justify-between min-h-[36px] h-9 shrink-0 mb-3.5 w-full select-none">
      {/* CÔTÉ GAUCHE : Titre H1 & Date textuelle */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground truncate font-sans leading-none">
          {getPageTitle()}
        </h1>
        {currentDateText && (
          <span className="text-xs sm:text-sm font-medium text-muted-foreground select-none truncate leading-none font-sans">
            {currentDateText}
          </span>
        )}
      </div>

      {/* CÔTÉ DROIT : Actions contextuelles */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* 1. Bouton Reset / Actualiser optionnel */}
        <button
          type="button"
          onClick={() => setSelectedLeague('Toutes les compétitions')}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-card border border-border text-foreground shadow-sm hover:text-emerald-500 transition-all cursor-pointer active:scale-95"
          title="Réinitialiser les filtres"
          aria-label="Réinitialiser"
        >
          <RotateCcw size={15} strokeWidth={1.75} />
        </button>

        {/* 2. Sélecteur de compétition en gélule */}
        <div className="relative hidden sm:block">
          <select
            value={selectedLeague}
            onChange={(e) => setSelectedLeague(e.target.value)}
            className="h-9 appearance-none bg-card border border-border text-foreground shadow-sm font-medium text-xs sm:text-sm py-1.5 pl-4 pr-9 rounded-full outline-none hover:border-foreground/20 cursor-pointer font-sans"
            aria-label="Filtrer par compétition"
          >
            {leagues.map((l) => (
              <option key={l} value={l} className="bg-card text-foreground">
                {l}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
        </div>

        {/* 3. Bouton primaire d'action gélule */}
        <Link
          href="/bankroll"
          className="h-9 px-3.5 sm:px-4 rounded-full bg-foreground text-background font-medium text-xs sm:text-sm flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer font-sans shrink-0 focus-visible:ring-2 focus-visible:ring-foreground/20 focus-visible:outline-none"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>Nouveau Pari</span>
        </Link>
      </div>
    </header>
  );
}
