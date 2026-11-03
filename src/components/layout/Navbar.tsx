'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Radio,
  SlidersHorizontal,
  Flame,
  FlaskConical,
  Wallet,
  Activity,
  Sun,
  Moon,
  Settings,
  Bell,
  User,
} from 'lucide-react';
import clsx from 'clsx';

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'radar',
    label: 'Radar & Dashboard',
    href: '/',
    icon: Radio,
    badge: 'LIVE',
  },
  {
    id: 'screener',
    label: 'Screener Prédictif',
    href: '/screener',
    icon: SlidersHorizontal,
  },
  {
    id: 'match',
    label: 'Match Hub',
    href: '/match/psg-mci',
    icon: Flame,
    badge: 'Choc',
  },
  {
    id: 'lab',
    label: 'Lab & Backtest',
    href: '/lab',
    icon: FlaskConical,
  },
  {
    id: 'bankroll',
    label: 'Bankroll & Risque',
    href: '/bankroll',
    icon: Wallet,
  },
];

export function Navbar() {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    // Check initial document class
    if (document.documentElement.classList.contains('light')) {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (theme === 'dark') {
      document.documentElement.classList.add('light');
      setTheme('light');
    } else {
      document.documentElement.classList.remove('light');
      setTheme('dark');
    }
  };

  const isItemActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href) || (href.startsWith('/match') && pathname.startsWith('/match'));
  };

  // Stacked Date: JJ / MM / AA
  const now = new Date();
  const dayStr = String(now.getDate()).padStart(2, '0');
  const monthStr = String(now.getMonth() + 1).padStart(2, '0');
  const yearStr = String(now.getFullYear()).slice(-2);

  return (
    <>
      {/* 1. DOCK LATÉRAL GAUCHE BUREAU (w-12 / 48px fixe shrink-0 h-full) */}
      <aside
        aria-label="Navigation latérale"
        className="hidden md:flex w-12 shrink-0 flex-col justify-between items-center h-full select-none z-30"
      >
        {/* HAUT : Logo (h-9 aligné avec PageHeader) + Capsule Navigation + Pastille Active */}
        <div className="flex flex-col items-center w-full shrink-0">
          {/* Logo Krona (aligné au centre du PageHeader h-9) */}
          <Link
            href="/"
            aria-label="Krona Home"
            className="w-12 h-9 flex items-center justify-center shrink-0 group"
            title="KRONA // Terminal Bloomberg Sportif"
          >
            <div className="w-6 h-6 rounded-md bg-foreground flex items-center justify-center text-background font-bold text-xs group-hover:scale-105 active:scale-95 transition-transform shadow-sm">
              K
            </div>
          </Link>

          {/* Capsule de navigation principale */}
          <div className="mt-2.5 flex flex-col items-center gap-2 w-full shrink-0">
            <nav
              aria-label="Navigation principale"
              className="w-12 flex flex-col items-center bg-[#EBEBED] dark:bg-card/60 backdrop-blur-2xl backdrop-saturate-150 shadow-sm border border-border rounded-full p-1 gap-1.5 relative shrink-0"
            >
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = isItemActive(item.href);

                return (
                  <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    <Link
                      href={item.href}
                      aria-label={item.label}
                      className={clsx(
                        'relative w-10 h-10 rounded-full flex items-center justify-center outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-foreground/20 transition-all duration-200 ease-out z-10',
                        isActive
                          ? 'text-black'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/[0.06] dark:hover:bg-white/[0.08]'
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="canonical-sidebar-pill"
                          layout="position"
                          className="absolute inset-0 w-10 h-10 bg-white shadow-sm rounded-full"
                          style={{ borderRadius: 9999 }}
                          transition={{
                            type: 'spring',
                            stiffness: 480,
                            damping: 38,
                            mass: 0.8,
                          }}
                        />
                      )}
                      <span className="relative z-10 flex items-center justify-center w-full h-full">
                        <Icon size={18} strokeWidth={isActive ? 2 : 1.6} />
                      </span>
                    </Link>

                    {/* Tooltip on Hover */}
                    <AnimatePresence>
                      {hoveredItem === item.id && (
                        <motion.div
                          initial={{ opacity: 0, x: 8, scale: 0.95 }}
                          animate={{ opacity: 1, x: 12, scale: 1 }}
                          exit={{ opacity: 0, x: 8, scale: 0.95 }}
                          transition={{ duration: 0.12 }}
                          className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2.5 py-1 rounded-xl bg-card/95 backdrop-blur-2xl border border-border shadow-lg text-xs font-semibold text-foreground whitespace-nowrap z-50 pointer-events-none font-sans"
                        >
                          {item.label}
                          {item.badge && (
                            <span className="ml-1.5 text-[10px] px-1 py-0.2 rounded-full bg-emerald-500/10 text-emerald-500 tabular-nums font-semibold">
                              {item.badge}
                            </span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>

            {/* Pastille Établissement / Algorithme Actif (Bloc 2A) */}
            <motion.div whileTap={{ scale: 0.94 }}>
              <Link
                href="/match/psg-mci"
                aria-label="Algorithme & Marché Actif"
                title="Modèle Bivarié Poisson & Cotes Live"
                className="w-12 h-12 rounded-full bg-[#EBEBED] dark:bg-card/60 backdrop-blur-2xl backdrop-saturate-150 border border-border flex items-center justify-center text-emerald-500 hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer shadow-sm focus-visible:ring-2 focus-visible:ring-foreground/20"
              >
                <Activity size={18} strokeWidth={1.8} />
              </Link>
            </motion.div>
          </div>
        </div>

        {/* BAS : Date Verticale Empilée + Thème + Capsule Outils Système */}
        <div className="flex flex-col items-center gap-2 w-full shrink-0">
          {/* Date du jour numérique empilée (Bloc 2B) */}
          <div className="flex flex-col items-center justify-center select-none pointer-events-none text-center font-sans tracking-tight shrink-0 gap-1">
            <span className="text-[13px] font-semibold text-foreground tabular-nums leading-none">
              {dayStr}
            </span>
            <span className="text-[13px] font-semibold text-foreground tabular-nums leading-none">
              {monthStr}
            </span>
            <span className="text-[13px] font-semibold text-muted-foreground tabular-nums leading-none">
              {yearStr}
            </span>
          </div>

          {/* Séparateur fin */}
          <div className="w-5 h-[1px] bg-black/10 dark:bg-white/10 shrink-0 my-0.5" />

          {/* Bascule de thème autonome (Bloc 3A) */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={toggleTheme}
            className="w-12 h-12 rounded-full bg-[#EBEBED] dark:bg-card/60 backdrop-blur-2xl backdrop-saturate-150 border border-border flex items-center justify-center text-foreground hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer shadow-sm focus-visible:ring-2 focus-visible:ring-foreground/20"
            aria-label="Basculer le thème"
            title={theme === 'dark' ? 'Activer mode clair' : 'Activer mode sombre'}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>

          {/* Capsule des outils système (Bloc 3B) */}
          <div
            role="toolbar"
            className="w-12 flex flex-col items-center bg-[#EBEBED] dark:bg-card/60 backdrop-blur-2xl backdrop-saturate-150 shadow-sm border border-border rounded-full p-1 gap-1.5 relative shrink-0"
          >
            {/* Notifications */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              className="relative w-10 h-10 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/[0.08] dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Notifications d'anomalies"
              title="Alertes de marché directes"
            >
              <Bell size={18} />
              <span className="w-2 h-2 bg-rose-500 rounded-full border border-background absolute top-2 right-2" />
            </motion.button>

            {/* Paramètres */}
            <Link
              href="/lab"
              aria-label="Paramètres du modèle"
              title="Configuration du Lab Quant"
              className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/[0.08] dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Settings size={18} />
            </Link>

            {/* Profil */}
            <Link
              href="/bankroll"
              aria-label="Profil & Bankroll"
              title="Gestion de Bankroll"
              className="relative w-10 h-10 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-black/[0.08] dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <User size={18} />
              <span className="w-2 h-2 rounded-full absolute -bottom-0.5 -right-0.5 bg-emerald-500 border border-background" />
            </Link>
          </div>
        </div>
      </aside>

      {/* 2. DOCK MOBILE FLOTTANT (md:hidden) */}
      <nav
        aria-label="Navigation mobile"
        className="md:hidden fixed bottom-3 left-4 right-4 z-50 flex justify-center pointer-events-none"
      >
        <div className="flex items-center gap-1 p-1 bg-card/90 backdrop-blur-2xl backdrop-saturate-150 border border-border rounded-full shadow-2xl pointer-events-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = isItemActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.id}
                href={item.href}
                aria-label={item.label}
                className="relative w-11 h-11 rounded-full flex items-center justify-center active:scale-95 transition-all"
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-dock-pill"
                    className="absolute inset-0 rounded-full bg-white shadow-sm"
                    transition={{ type: 'spring', stiffness: 480, damping: 38, mass: 0.8 }}
                  />
                )}
                <span
                  className={clsx(
                    'relative z-10 transition-colors',
                    isActive ? 'text-zinc-950 font-bold' : 'text-muted-foreground'
                  )}
                >
                  <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
