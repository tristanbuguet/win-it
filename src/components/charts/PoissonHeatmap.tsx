'use client';

import React, { useState } from 'react';
import { generatePoissonMatrix, fairOdds } from '@/lib/math-engine';

interface PoissonHeatmapProps {
  homeTeam: string;
  awayTeam: string;
  homeLambda: number;
  awayLambda: number;
}

export function PoissonHeatmap({
  homeTeam,
  awayTeam,
  homeLambda,
  awayLambda,
}: PoissonHeatmapProps) {
  const [selectedScore, setSelectedScore] = useState<{ h: number; a: number } | null>(null);

  const maxGoals = 5;
  const { matrix } = generatePoissonMatrix(homeLambda, awayLambda, maxGoals);

  // Find max probability to normalize colors
  let maxP = 0;
  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      if (matrix[h][a] > maxP) maxP = matrix[h][a];
    }
  }

  return (
    <div className="w-full font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <div>
          <h4 className="text-xs uppercase font-semibold text-muted-foreground tracking-wider font-sans">
            Matrice Bivariée des Scores Exacts (Modèle de Poisson)
          </h4>
          <p className="text-xs text-muted-foreground/80 mt-0.5 tabular-nums font-sans">
            λ Attendu : {homeTeam} ({homeLambda.toFixed(2)}) • {awayTeam} ({awayLambda.toFixed(2)})
          </p>
        </div>

        {selectedScore ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-xs tabular-nums text-emerald-400 font-sans">
            Score {homeTeam} {selectedScore.h} - {selectedScore.a} {awayTeam} :{' '}
            <span className="font-bold">
              {(matrix[selectedScore.h][selectedScore.a] * 100).toFixed(1)}%
            </span>{' '}
            (Cote Juste : @{fairOdds(matrix[selectedScore.h][selectedScore.a])})
          </div>
        ) : (
          <div className="text-xs text-muted-foreground/60 italic font-sans">
            Survolez ou cliquez sur une case pour inspecter
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[420px]">
          {/* Header row with Away team goals */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs text-muted-foreground mb-1 font-sans">
            <div className="flex items-center justify-center font-semibold text-muted-foreground/60 text-[10px] uppercase">
              {homeTeam.slice(0, 3)} \ {awayTeam.slice(0, 3)}
            </div>
            {[0, 1, 2, 3, 4, 5].map(a => (
              <div key={a} className="font-semibold text-foreground py-1">
                {a} {awayTeam.slice(0, 3)}
              </div>
            ))}
          </div>

          {/* Matrix Rows */}
          {[0, 1, 2, 3, 4, 5].map(h => (
            <div key={h} className="grid grid-cols-7 gap-1.5 mb-1.5">
              <div className="flex items-center justify-center font-semibold text-xs text-foreground bg-neutral-50 dark:bg-white/[0.04] rounded-xl border border-border">
                {h} {homeTeam.slice(0, 3)}
              </div>

              {[0, 1, 2, 3, 4, 5].map(a => {
                const prob = matrix[h][a];
                const pct = (prob * 100).toFixed(1);
                const intensity = Math.min(1, prob / (maxP || 1));
                const isSelected = selectedScore?.h === h && selectedScore?.a === a;
                const isTopScore = prob > 0.085; // highly likely score

                return (
                  <button
                    key={`${h}-${a}`}
                    type="button"
                    onClick={() => setSelectedScore({ h, a })}
                    onMouseEnter={() => setSelectedScore({ h, a })}
                    className={`h-11 rounded-xl flex flex-col items-center justify-center transition-all duration-100 border text-center relative active:scale-95 cursor-pointer font-sans ${
                      isSelected
                        ? 'border-emerald-500 scale-[1.03] z-10 shadow-lg shadow-emerald-500/20'
                        : 'border-border hover:border-foreground/30'
                    }`}
                    style={{
                      backgroundColor: `rgba(16, 185, 129, ${Math.max(0.04, intensity * 0.38)})`,
                    }}
                  >
                    <span className="text-[10px] font-bold tabular-nums text-foreground">
                      {h} - {a}
                    </span>
                    <span
                      className={`text-[10px] tabular-nums font-semibold ${
                        isTopScore ? 'text-emerald-400 font-bold' : 'text-muted-foreground'
                      }`}
                    >
                      {pct}%
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
