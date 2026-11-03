'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutGrid,
  TrendingUp,
  Landmark,
  Sun,
  Moon,
  Settings,
  Bell,
  User,
  Plus,
  ChevronDown,
} from 'lucide-react';
import clsx from 'clsx';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  headerActions?: React.ReactNode;
  navItems?: NavItem[];
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: "Vue d'ensemble", icon: LayoutGrid },
  { id: 'trends', label: 'Tendances', icon: TrendingUp },
  { id: 'accounts', label: 'Comptes', icon: Landmark },
];

export function AppShell({
  children,
  title = "Vue d'ensemble",
  activeTab = 'dashboard',
  onTabChange,
  headerActions,
  navItems = DEFAULT_NAV_ITEMS,
}: AppShellProps) {
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currentDate, setCurrentDate] = useState('');

  const active = onTabChange ? activeTab : currentTab;

  const now = new Date();
  const dayStr = String(now.getDate()).padStart(2, '0');
  const monthStr = String(now.getMonth() + 1).padStart(2, '0');
  const yearStr = String(now.getFullYear()).slice(-2);

  useEffect(() => {
    const formatted = now.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    setCurrentDate(formatted.charAt(0).toUpperCase() + formatted.slice(1));

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

  return (
    <main className="h-screen w-screen overflow-hidden flex flex-row p-3.5 sm:p-4 lg:p-5 gap-3.5 sm:gap-4 lg:gap-5 box-border bg-background text-foreground min-h-screen transition-colors duration-300 font-sans select-none">
      {/* 1. DOCK LATÉRAL GAUCHE (w-12 / 48px fixe) */}
      <aside
        aria-label="Navigation latérale"
        className="w-12 shrink-0 flex flex-col justify-between items-center h-full select-none z-30"
      >
        {/* Haut : Logo + Onglets + Sélecteur de Banque / Modèle */}
        <div className="flex flex-col items-center w-full shrink-0">
          {/* Logo Krona (aligné au centre du PageHeader h-9) */}
          <div className="w-12 h-9 flex items-center justify-center shrink-0">
            <div className="w-6 h-6 rounded-md bg-foreground flex items-center justify-center text-background font-bold text-xs">
              K
            </div>
          </div>

          <div className="mt-2.5 flex flex-col items-center gap-2 w-full shrink-0">
            {/* Capsule de navigation principale */}
            <nav
              aria-label="Navigation principale"
              className="w-12 flex flex-col items-center bg-[#EBEBED] dark:bg-card/60 backdrop-blur-2xl backdrop-saturate-150 shadow-sm border border-border rounded-full p-1 gap-1.5 relative shrink-0"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.id;
                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    whileTap={{ scale: 0.94 }}
                    onClick={() => {
                      setCurrentTab(item.id);
                      onTabChange?.(item.id);
                    }}
                    className={clsx(
                      'relative w-10 h-10 rounded-full flex items-center justify-center outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-foreground/20 transition-all duration-200 ease-out',
                      isActive
                        ? 'text-black'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    )}
                    aria-label={item.label}
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
                      <Icon size={18} />
                    </span>
                  </motion.button>
                );
              })}
            </nav>

            {/* Pastille Banque / Établissement Active */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              className="w-12 h-12 rounded-full bg-[#EBEBED] dark:bg-card/60 backdrop-blur-2xl backdrop-saturate-150 border border-border flex items-center justify-center text-foreground hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer shadow-sm focus-visible:ring-2 focus-visible:ring-foreground/20"
              aria-label="Établissement actif"
            >
              <Landmark size={18} />
            </motion.button>
          </div>
        </div>

        {/* Bas : Date Verticale + Thème + Capsule Outils */}
        <div className="flex flex-col items-center gap-2 w-full shrink-0">
          {/* Date du jour numérique empilée */}
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

          <div className="w-5 h-[1px] bg-black/10 dark:bg-white/10 shrink-0 my-0.5" />

          {/* Bascule de thème clair/sombre */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={toggleTheme}
            className="w-12 h-12 rounded-full bg-[#EBEBED] dark:bg-card/60 backdrop-blur-2xl backdrop-saturate-150 border border-border flex items-center justify-center text-foreground hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-colors cursor-pointer shadow-sm focus-visible:ring-2 focus-visible:ring-foreground/20"
            aria-label="Basculer le thème"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </motion.button>

          {/* Capsule des outils système */}
          <div
            role="toolbar"
            className="w-12 flex flex-col items-center bg-[#EBEBED] dark:bg-card/60 backdrop-blur-2xl backdrop-saturate-150 shadow-sm border border-border rounded-full p-1 gap-1.5 relative shrink-0"
          >
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              className="relative w-10 h-10 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-white hover:bg-black/[0.08] dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="w-2 h-2 bg-red-500 rounded-full border border-background absolute top-2 right-2" />
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              className="w-10 h-10 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-white hover:bg-black/[0.08] dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Paramètres"
            >
              <Settings size={18} />
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              className="relative w-10 h-10 rounded-full flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-white hover:bg-black/[0.08] dark:hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Profil"
            >
              <User size={18} />
              <span className="w-2 h-2 rounded-full absolute -bottom-0.5 -right-0.5 bg-emerald-500 border border-background" />
            </motion.button>
          </div>
        </div>
      </aside>

      {/* 2. CANEVAS PRINCIPAL (flex-1 pleine hauteur) */}
      <div className="flex-1 min-w-0 h-full overflow-hidden flex flex-col">
        {/* En-tête de page unifié (h-9) */}
        <header className="flex items-center justify-between min-h-[36px] h-9 shrink-0 mb-3.5 w-full select-none">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground truncate font-sans leading-none">
              {title}
            </h1>
            {currentDate && (
              <span className="text-xs sm:text-sm font-medium text-muted-foreground select-none truncate leading-none font-sans">
                {currentDate}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {headerActions || (
              <>
                <div className="relative">
                  <select className="h-9 appearance-none bg-card border border-border text-foreground shadow-sm font-medium text-sm py-1.5 pl-4 pr-10 rounded-full outline-none hover:border-foreground/20 cursor-pointer font-sans">
                    <option>Période courante</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                  />
                </div>

                <button
                  type="button"
                  className="h-9 px-3.5 sm:px-4 rounded-full bg-foreground text-background font-medium text-xs sm:text-sm flex items-center gap-1.5 hover:opacity-90 active:scale-95 transition-all shadow-sm cursor-pointer font-sans shrink-0"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span>Action principale</span>
                </button>
              </>
            )}
          </div>
        </header>

        {/* Zone de contenu défilant ou grille viewport-fit */}
        <div className="flex-1 min-h-0 w-full overflow-y-auto no-scrollbar flex flex-col">
          {children}
        </div>
      </div>
    </main>
  );
}

