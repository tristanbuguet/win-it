import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/layout/Navbar';
import { Header } from '@/components/layout/Header';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'BOOKMAKER // Terminal Bloomberg Sportif & Expected Value',
  description: 'SaaS d’analyse prédictive et de détection de Value Bets football haute précision.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={spaceGrotesk.variable}>
      <body className="bg-background text-foreground selection:bg-emerald-500/20 selection:text-emerald-300">
        <main className="h-screen w-screen overflow-hidden flex flex-row p-3.5 sm:p-4 lg:p-5 gap-3.5 sm:gap-4 lg:gap-5 box-border bg-background text-foreground min-h-screen transition-colors duration-300 font-sans">
          {/* 1. DOCK LATÉRAL GAUCHE (w-12 / 48px fixe) */}
          <Navbar />

          {/* 2. CANEVAS PRINCIPAL (flex-1 pleine hauteur) */}
          <div className="flex-1 min-w-0 h-full overflow-hidden flex flex-col">
            {/* En-tête de page unifié (h-9 shrink-0 mb-3.5 w-full) */}
            <Header />

            {/* Zone de contenu défilant ou grille viewport-fit (anti-double scroll) */}
            <div className="flex-1 min-h-0 w-full overflow-y-auto no-scrollbar flex flex-col pb-16 md:pb-0">
              {children}
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
