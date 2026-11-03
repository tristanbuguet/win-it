export type Competition =
  | 'Champions League'
  | 'Premier League'
  | 'Ligue 1'
  | 'La Liga'
  | 'Serie A'
  | 'Bundesliga';

export type BetMarket =
  | '1X2'
  | 'Over/Under 2.5'
  | 'Over/Under 1.5'
  | 'Over/Under 3.5'
  | 'Both Teams To Score'
  | 'Player Props - Tirs Cadrés'
  | 'Player Props - Buteur';

export type BookmakerName = 'Pinnacle' | 'Betclic' | 'Winamax' | 'Unibet';

export interface BookmakerOdd {
  bookmaker: BookmakerName;
  odds: number;
  url?: string;
}

export interface ValueBetOpportunity {
  id: string;
  matchId: string;
  matchTitle: string;
  competition: Competition;
  kickoff: string;
  market: string;
  selection: string;
  modelProb: number;      // e.g. 0.58 (58%)
  fairOdds: number;       // 1 / modelProb (e.g. 1.72)
  bestOdds: number;       // e.g. 2.10
  bestBookmaker: BookmakerName;
  evPercent: number;      // e.g. +21.8% -> ((modelProb * bestOdds) - 1) * 100
  kellyStakePercent: number; // e.g. 3.8%
  confidenceScore: number;   // 1 to 100
  isDroppingOdds?: boolean;
  marketConsensusOdds: number;
}

export interface PlayerProp {
  id: string;
  name: string;
  team: string;
  position: 'Attaquant' | 'Milieu' | 'Défenseur';
  photoUrl?: string;
  propType: 'Buteur' | 'Tirs Cadrés > 1.5' | 'Passeur Déterminant' | 'Tirs Totaux > 2.5';
  modelProb: number;
  fairOdds: number;
  bookmakerOdds: number;
  evPercent: number;
  recentFormStat: string; // e.g. "4 buts sur les 5 derniers matchs"
  avgShotsPer90: number;
  xgPer90: number;
}

export interface MissingPlayer {
  name: string;
  role: string;
  reason: 'Blessure ischios' | 'Suspension' | 'Genou' | 'Maladie' | 'Incertain';
  impactXgDelta: number; // e.g. -0.42 xG
  status: 'Absent confirmé' | 'Incertain (25%)' | 'De retour';
}

export interface MatchDetails {
  id: string;
  competition: Competition;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  kickoff: string; // ISO string
  venue: string;
  referee: string;
  status: 'À venir' | 'En direct' | 'Terminé';

  // Statistical Lambdas for Poisson distribution
  homeExpectedGoals: number; // e.g. 1.95
  awayExpectedGoals: number; // e.g. 1.10

  // 1X2 Probabilities & Odds
  probabilities: {
    homeWin: number;
    draw: number;
    awayWin: number;
  };
  bookmakerOdds: {
    homeWin: BookmakerOdd[];
    draw: BookmakerOdd[];
    awayWin: BookmakerOdd[];
  };

  // Additional Markets
  overUnder25: {
    overProb: number;
    underProb: number;
    overBestOdds: number;
    underBestOdds: number;
    overEV: number;
  };

  btts: {
    yesProb: number;
    noProb: number;
    yesBestOdds: number;
    noBestOdds: number;
    yesEV: number;
  };

  // Algorithmic Confidence & Value Bets on this match
  algorithmicConfidence: number; // 0 - 100
  valueBets: ValueBetOpportunity[];

  // Form & Historical Metrics
  shortTermForm: {
    home: ('V' | 'N' | 'D')[];
    away: ('V' | 'N' | 'D')[];
    homeXgAvg5: number;
    awayXgAvg5: number;
  };
  h2hHistory: {
    totalMatches: number;
    homeWins: number;
    draws: number;
    awayWins: number;
    recentEncounters: {
      date: string;
      homeScore: number;
      awayScore: number;
    }[];
  };

  // Players
  keyProps: PlayerProp[];
  missingPlayers: {
    home: MissingPlayer[];
    away: MissingPlayer[];
  };
}

export interface BacktestFilter {
  minEV: number;               // e.g. 3 (%)
  minOdds: number;             // e.g. 1.50
  maxOdds: number;             // e.g. 3.50
  competitions: Competition[];
  markets: string[];
  kellyFraction: number;       // e.g. 0.25 (Quarter Kelly)
  startingBankroll: number;    // e.g. 1000 €
}

export interface BacktestResult {
  totalBets: number;
  winningBets: number;
  winRate: number;              // %
  totalProfit: number;          // €
  roi: number;                  // %
  maxDrawdown: number;          // %
  sharpeRatio: number;
  equityCurve: { date: string; bankroll: number; profit: number }[];
}

export interface BankrollBet {
  id: string;
  date: string;
  matchTitle: string;
  selection: string;
  odds: number;
  stake: number;
  modelProb: number;
  evPercent: number;
  status: 'Gagné' | 'Perdu' | 'En cours';
  pnl?: number;
  bookmaker: BookmakerName;
}

