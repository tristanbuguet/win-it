/**
 * High-Precision Mathematical Engine for Sports Analytics & Value Betting.
 * Built with strict mathematical rigor (Poisson bivariate, Kelly Criterion, EV, Overround).
 */

/**
 * Returns implied probability from decimal odds (e.g., 2.00 -> 0.50).
 */
export function impliedProbability(odds: number): number {
  if (odds <= 1) return 0;
  return 1 / odds;
}

/**
 * Returns fair odds from true model probability (e.g., 0.50 -> 2.00).
 */
export function fairOdds(prob: number): number {
  if (prob <= 0) return 999.0;
  if (prob >= 1) return 1.01;
  return Math.round((1 / prob) * 100) / 100;
}

/**
 * Expected Value (EV) in decimal:
 * Formula: EV = (P_model * Odds) - 1
 * e.g., Model 55% (0.55), Bookmaker Odds 2.10: (0.55 * 2.10) - 1 = +0.155 (+15.5%)
 */
export function calculateEV(modelProb: number, bookmakerOdds: number): number {
  if (modelProb <= 0 || bookmakerOdds <= 1) return -1;
  return (modelProb * bookmakerOdds) - 1;
}

/**
 * Returns semantic tier for given EV percentage.
 */
export function getEVTier(evPercent: number): {
  tier: 'high' | 'moderate' | 'neutral' | 'alert';
  color: string;
  badgeBg: string;
  label: string;
} {
  if (evPercent >= 5.0) {
    return {
      tier: 'high',
      color: '#10B981', // Emerald Green
      badgeBg: 'rgba(16, 185, 129, 0.12)',
      label: 'Forte Value',
    };
  }
  if (evPercent >= 1.0) {
    return {
      tier: 'moderate',
      color: '#F59E0B', // Amber
      badgeBg: 'rgba(245, 158, 11, 0.12)',
      label: 'Value Modérée',
    };
  }
  if (evPercent >= -1.0) {
    return {
      tier: 'neutral',
      color: '#71717A', // Slate Gray
      badgeBg: 'rgba(113, 113, 122, 0.12)',
      label: 'Neutre',
    };
  }
  return {
    tier: 'alert',
    color: '#F43F5E', // Vivid Pink/Red
    badgeBg: 'rgba(244, 63, 94, 0.12)',
    label: 'Cote Négative',
  };
}

/**
 * Calculates bookmaker margin (overround).
 * Sum of implied probabilities minus 1.
 */
export function calculateOverround(oddsList: number[]): number {
  const sum = oddsList.reduce((acc, odd) => acc + (odd > 1 ? 1 / odd : 0), 0);
  return Math.max(0, sum - 1);
}

/**
 * Removes overround to retrieve fair bookmaker consensus probabilities.
 */
export function removeOverround(oddsList: number[]): number[] {
  const rawProbs = oddsList.map(o => (o > 1 ? 1 / o : 0));
  const sum = rawProbs.reduce((acc, p) => acc + p, 0);
  if (sum === 0) return oddsList.map(() => 0);
  return rawProbs.map(p => p / sum);
}

/**
 * Fractional Kelly Criterion for bankroll risk management.
 * f* = (b * p - q) / b
 * where b = decimal odds - 1, p = model probability, q = 1 - p.
 * Multiplied by Kelly Fraction (Quarter Kelly = 0.25 recommended for sports betting).
 * Capped safely at maxCap (default 10% of total bankroll).
 */
export function calculateKellyStake(
  bankroll: number,
  modelProb: number,
  odds: number,
  fraction: number = 0.25,
  maxCapPercent: number = 10
): { stake: number; percent: number; rawKelly: number } {
  if (odds <= 1 || modelProb <= 0 || bankroll <= 0) {
    return { stake: 0, percent: 0, rawKelly: 0 };
  }

  const b = odds - 1;
  const p = modelProb;
  const q = 1 - p;

  const rawKelly = (b * p - q) / b;

  if (rawKelly <= 0) {
    return { stake: 0, percent: 0, rawKelly: 0 };
  }

  // Apply fractional multiplier and cap
  const fractionPercent = rawKelly * fraction * 100;
  const safePercent = Math.min(Math.max(0, fractionPercent), maxCapPercent);
  const stake = Math.round(((bankroll * safePercent) / 100) * 100) / 100;

  return {
    stake,
    percent: Math.round(safePercent * 100) / 100,
    rawKelly: Math.round(rawKelly * 1000) / 1000,
  };
}

/**
 * Mathematical factorial.
 */
export function factorial(n: number): number {
  if (n <= 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) {
    res *= i;
  }
  return res;
}

/**
 * Poisson distribution probability for k goals given expected goals lambda:
 * P(k; λ) = (λ^k * e^(-λ)) / k!
 */
export function poisson(k: number, lambda: number): number {
  if (lambda <= 0 || k < 0) return 0;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

/**
 * Generates an exact score probability matrix (from 0 to maxGoals for each team).
 */
export function generatePoissonMatrix(
  homeLambda: number,
  awayLambda: number,
  maxGoals: number = 5
): { matrix: number[][]; homeProbs: number[]; awayProbs: number[] } {
  const homeProbs: number[] = [];
  const awayProbs: number[] = [];

  for (let i = 0; i <= maxGoals; i++) {
    homeProbs.push(poisson(i, homeLambda));
    awayProbs.push(poisson(i, awayLambda));
  }

  const matrix: number[][] = [];
  for (let h = 0; h <= maxGoals; h++) {
    const row: number[] = [];
    for (let a = 0; a <= maxGoals; a++) {
      row.push(homeProbs[h] * awayProbs[a]);
    }
    matrix.push(row);
  }

  return { matrix, homeProbs, awayProbs };
}

export interface ScoreProbability {
  homeScore: number;
  awayScore: number;
  probability: number;
}

/**
 * Comprehensive Poisson Match Analysis:
 * Extracts 1X2, Over/Under 1.5, 2.5, 3.5, BTTS, and Top 5 Most Probable Scores.
 */
export function calculatePoissonOutcomes(homeLambda: number, awayLambda: number, maxGoals: number = 6) {
  const { matrix } = generatePoissonMatrix(homeLambda, awayLambda, maxGoals);

  let homeWin = 0;
  let draw = 0;
  let awayWin = 0;

  let over15 = 0;
  let over25 = 0;
  let over35 = 0;

  let bttsYes = 0;

  const scoreRankings: ScoreProbability[] = [];

  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      const p = matrix[h][a];

      // 1X2
      if (h > a) homeWin += p;
      else if (h === a) draw += p;
      else awayWin += p;

      // Over / Under
      const totalGoals = h + a;
      if (totalGoals > 1.5) over15 += p;
      if (totalGoals > 2.5) over25 += p;
      if (totalGoals > 3.5) over35 += p;

      // BTTS
      if (h > 0 && a > 0) bttsYes += p;

      scoreRankings.push({
        homeScore: h,
        awayScore: a,
        probability: p,
      });
    }
  }

  // Sort scores by descending probability
  scoreRankings.sort((a, b) => b.probability - a.probability);

  return {
    homeWin: Math.round(homeWin * 1000) / 1000,
    draw: Math.round(draw * 1000) / 1000,
    awayWin: Math.round(awayWin * 1000) / 1000,
    over15: Math.round(over15 * 1000) / 1000,
    under15: Math.round((1 - over15) * 1000) / 1000,
    over25: Math.round(over25 * 1000) / 1000,
    under25: Math.round((1 - over25) * 1000) / 1000,
    over35: Math.round(over35 * 1000) / 1000,
    under35: Math.round((1 - over35) * 1000) / 1000,
    bttsYes: Math.round(bttsYes * 1000) / 1000,
    bttsNo: Math.round((1 - bttsYes) * 1000) / 1000,
    topScores: scoreRankings.slice(0, 5),
    matrix,
  };
}

/**
 * Self-check assertion test for Ponytail verification rule.
 */
export function selfCheckMathEngine(): boolean {
  // Check implied prob
  if (Math.abs(impliedProbability(2.0) - 0.5) > 0.001) return false;
  // Check EV: 50% prob at 2.20 odds -> 10% EV
  if (Math.abs(calculateEV(0.5, 2.2) - 0.1) > 0.001) return false;
  // Check Kelly
  const kelly = calculateKellyStake(1000, 0.55, 2.1, 0.25);
  if (kelly.stake <= 0 || kelly.percent <= 0) return false;
  // Check Poisson outcomes
  const outcomes = calculatePoissonOutcomes(1.8, 1.2);
  const sum1X2 = outcomes.homeWin + outcomes.draw + outcomes.awayWin;
  if (Math.abs(sum1X2 - 1.0) > 0.05) return false; // sum of 1X2 should be close to 1
  return true;
}

