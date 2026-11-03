import { MatchDetails, ValueBetOpportunity, BankrollBet } from '@/types';
import { calculatePoissonOutcomes } from './math-engine';

// Helper to pre-compute match details with Poisson matrix
function buildMatch(
  id: string,
  competition: any,
  homeTeam: string,
  awayTeam: string,
  kickoff: string,
  venue: string,
  referee: string,
  homeXg: number,
  awayXg: number,
  homeOdds: { pin: number; bet: number; win: number; uni: number },
  drawOdds: { pin: number; bet: number; win: number; uni: number },
  awayOdds: { pin: number; bet: number; win: number; uni: number },
  confidence: number,
  shortHome: ('V' | 'N' | 'D')[],
  shortAway: ('V' | 'N' | 'D')[],
  h2h: { total: number; hWins: number; d: number; aWins: number; recent: any[] },
  props: any[],
  missing: { home: any[]; away: any[] }
): MatchDetails {
  const poisson = calculatePoissonOutcomes(homeXg, awayXg);

  const valueBets: ValueBetOpportunity[] = [];

  // Home EV
  const bestHomeOdd = Math.max(homeOdds.pin, homeOdds.bet, homeOdds.win, homeOdds.uni);
  const homeEV = ((poisson.homeWin * bestHomeOdd) - 1) * 100;
  if (homeEV > 3) {
    valueBets.push({
      id: `${id}-v-home`,
      matchId: id,
      matchTitle: `${homeTeam} vs ${awayTeam}`,
      competition,
      kickoff,
      market: '1X2',
      selection: `${homeTeam} Victoire`,
      modelProb: poisson.homeWin,
      fairOdds: Math.round((1 / poisson.homeWin) * 100) / 100,
      bestOdds: bestHomeOdd,
      bestBookmaker: homeOdds.pin === bestHomeOdd ? 'Pinnacle' : homeOdds.win === bestHomeOdd ? 'Winamax' : 'Betclic',
      evPercent: Math.round(homeEV * 10) / 10,
      kellyStakePercent: Math.round(Math.min(homeEV * 0.25, 4.5) * 10) / 10,
      confidenceScore: confidence,
      marketConsensusOdds: Math.round(((homeOdds.bet + homeOdds.win) / 2) * 100) / 100,
    });
  }

  // Over 2.5 EV
  const overOdds = 1.92;
  const overEV = ((poisson.over25 * overOdds) - 1) * 100;
  if (overEV > 4) {
    valueBets.push({
      id: `${id}-v-over25`,
      matchId: id,
      matchTitle: `${homeTeam} vs ${awayTeam}`,
      competition,
      kickoff,
      market: 'Over/Under 2.5',
      selection: 'Plus de 2.5 Buts',
      modelProb: poisson.over25,
      fairOdds: Math.round((1 / poisson.over25) * 100) / 100,
      bestOdds: overOdds,
      bestBookmaker: 'Pinnacle',
      evPercent: Math.round(overEV * 10) / 10,
      kellyStakePercent: Math.round(Math.min(overEV * 0.25, 4.0) * 10) / 10,
      confidenceScore: confidence + 2,
      marketConsensusOdds: 1.85,
    });
  }

  // Away EV check
  const bestAwayOdd = Math.max(awayOdds.pin, awayOdds.bet, awayOdds.win, awayOdds.uni);
  const awayEV = ((poisson.awayWin * bestAwayOdd) - 1) * 100;
  if (awayEV > 3) {
    valueBets.push({
      id: `${id}-v-away`,
      matchId: id,
      matchTitle: `${homeTeam} vs ${awayTeam}`,
      competition,
      kickoff,
      market: '1X2',
      selection: `${awayTeam} Victoire`,
      modelProb: poisson.awayWin,
      fairOdds: Math.round((1 / poisson.awayWin) * 100) / 100,
      bestOdds: bestAwayOdd,
      bestBookmaker: awayOdds.pin === bestAwayOdd ? 'Pinnacle' : 'Winamax',
      evPercent: Math.round(awayEV * 10) / 10,
      kellyStakePercent: Math.round(Math.min(awayEV * 0.22, 3.8) * 10) / 10,
      confidenceScore: confidence - 3,
      marketConsensusOdds: Math.round(((awayOdds.bet + awayOdds.win) / 2) * 100) / 100,
    });
  }

  return {
    id,
    competition,
    homeTeam,
    awayTeam,
    kickoff,
    venue,
    referee,
    status: 'À venir',
    homeExpectedGoals: homeXg,
    awayExpectedGoals: awayXg,
    probabilities: {
      homeWin: poisson.homeWin,
      draw: poisson.draw,
      awayWin: poisson.awayWin,
    },
    bookmakerOdds: {
      homeWin: [
        { bookmaker: 'Pinnacle', odds: homeOdds.pin },
        { bookmaker: 'Betclic', odds: homeOdds.bet },
        { bookmaker: 'Winamax', odds: homeOdds.win },
        { bookmaker: 'Unibet', odds: homeOdds.uni },
      ],
      draw: [
        { bookmaker: 'Pinnacle', odds: drawOdds.pin },
        { bookmaker: 'Betclic', odds: drawOdds.bet },
        { bookmaker: 'Winamax', odds: drawOdds.win },
        { bookmaker: 'Unibet', odds: drawOdds.uni },
      ],
      awayWin: [
        { bookmaker: 'Pinnacle', odds: awayOdds.pin },
        { bookmaker: 'Betclic', odds: awayOdds.bet },
        { bookmaker: 'Winamax', odds: awayOdds.win },
        { bookmaker: 'Unibet', odds: awayOdds.uni },
      ],
    },
    overUnder25: {
      overProb: poisson.over25,
      underProb: poisson.under25,
      overBestOdds: 1.92,
      underBestOdds: 1.98,
      overEV: Math.round(overEV * 10) / 10,
    },
    btts: {
      yesProb: poisson.bttsYes,
      noProb: poisson.bttsNo,
      yesBestOdds: 1.84,
      noBestOdds: 2.05,
      yesEV: Math.round(((poisson.bttsYes * 1.84) - 1) * 1000) / 10,
    },
    algorithmicConfidence: confidence,
    valueBets,
    shortTermForm: {
      home: shortHome,
      away: shortAway,
      homeXgAvg5: Math.round((homeXg + 0.15) * 100) / 100,
      awayXgAvg5: Math.round((awayXg - 0.08) * 100) / 100,
    },
    h2hHistory: {
      totalMatches: h2h.total,
      homeWins: h2h.hWins,
      draws: h2h.d,
      awayWins: h2h.aWins,
      recentEncounters: h2h.recent,
    },
    keyProps: props,
    missingPlayers: missing,
  };
}

export const mockMatches: MatchDetails[] = [
  buildMatch(
    'psg-mci',
    'Champions League',
    'Paris Saint-Germain',
    'Manchester City',
    '2026-11-03T21:00:00Z',
    'Parc des Princes, Paris',
    'Szymon Marciniak (POL)',
    2.15,
    1.65,
    { pin: 2.45, bet: 2.35, win: 2.40, uni: 2.30 },
    { pin: 3.65, bet: 3.55, win: 3.60, uni: 3.50 },
    { pin: 2.95, bet: 2.85, win: 2.90, uni: 2.80 },
    92,
    ['V', 'V', 'N', 'V', 'V'],
    ['V', 'N', 'D', 'V', 'V'],
    {
      total: 8,
      hWins: 3,
      d: 2,
      aWins: 3,
      recent: [
        { date: '11/2025', homeScore: 2, awayScore: 1 },
        { date: '04/2025', homeScore: 1, awayScore: 1 },
        { date: '10/2024', homeScore: 2, awayScore: 0 },
      ],
    },
    [
      {
        id: 'prop-barcola-1',
        name: 'Bradley Barcola',
        team: 'PSG',
        position: 'Attaquant',
        propType: 'Tirs Cadrés > 1.5',
        modelProb: 0.49,
        fairOdds: 2.04,
        bookmakerOdds: 2.45,
        evPercent: 20.1,
        recentFormStat: 'Cadré 2+ tirs sur 4 des 5 derniers matchs',
        avgShotsPer90: 3.2,
        xgPer90: 0.58,
      },
      {
        id: 'prop-haaland-1',
        name: 'Erling Haaland',
        team: 'Man City',
        position: 'Attaquant',
        propType: 'Buteur',
        modelProb: 0.56,
        fairOdds: 1.78,
        bookmakerOdds: 2.10,
        evPercent: 17.6,
        recentFormStat: '6 buts sur les 4 dernières rencontres',
        avgShotsPer90: 4.1,
        xgPer90: 0.94,
      },
      {
        id: 'prop-dembele-1',
        name: 'Ousmane Dembélé',
        team: 'PSG',
        position: 'Attaquant',
        propType: 'Passeur Déterminant',
        modelProb: 0.38,
        fairOdds: 2.63,
        bookmakerOdds: 3.20,
        evPercent: 21.6,
        recentFormStat: '5 passes décisives en Ligue 1 + C1',
        avgShotsPer90: 2.4,
        xgPer90: 0.32,
      },
    ],
    {
      home: [
        {
          name: 'Nuno Mendes',
          role: 'Latéral Gauche',
          reason: 'Blessure ischios',
          impactXgDelta: -0.18,
          status: 'Incertain (25%)',
        },
      ],
      away: [
        {
          name: 'Rodri',
          role: 'Milieu Défensif',
          reason: 'Suspension',
          impactXgDelta: -0.42,
          status: 'Absent confirmé',
        },
        {
          name: 'Kevin De Bruyne',
          role: 'Meneur de jeu',
          reason: 'Genou',
          impactXgDelta: -0.31,
          status: 'Absent confirmé',
        },
      ],
    }
  ),

  buildMatch(
    'ars-rma',
    'Champions League',
    'Arsenal FC',
    'Real Madrid',
    '2026-11-03T21:00:00Z',
    'Emirates Stadium, Londres',
    'Clément Turpin (FRA)',
    1.80,
    1.75,
    { pin: 2.30, bet: 2.25, win: 2.28, uni: 2.20 },
    { pin: 3.50, bet: 3.40, win: 3.45, uni: 3.35 },
    { pin: 3.10, bet: 3.00, win: 3.05, uni: 2.95 },
    89,
    ['V', 'V', 'D', 'V', 'N'],
    ['V', 'V', 'V', 'N', 'V'],
    {
      total: 5,
      hWins: 1,
      d: 2,
      aWins: 2,
      recent: [
        { date: '03/2024', homeScore: 1, awayScore: 2 },
        { date: '07/2023', homeScore: 2, awayScore: 2 },
      ],
    },
    [
      {
        id: 'prop-mbappe-1',
        name: 'Kylian Mbappé',
        team: 'Real Madrid',
        position: 'Attaquant',
        propType: 'Buteur',
        modelProb: 0.52,
        fairOdds: 1.92,
        bookmakerOdds: 2.30,
        evPercent: 19.6,
        recentFormStat: '5 buts en 4 matchs de Ligue des Champions',
        avgShotsPer90: 4.4,
        xgPer90: 0.88,
      },
      {
        id: 'prop-saka-1',
        name: 'Bukayo Saka',
        team: 'Arsenal',
        position: 'Attaquant',
        propType: 'Tirs Cadrés > 1.5',
        modelProb: 0.48,
        fairOdds: 2.08,
        bookmakerOdds: 2.40,
        evPercent: 15.2,
        recentFormStat: 'Leader xG + tirs cadrés pour Arsenal',
        avgShotsPer90: 3.1,
        xgPer90: 0.54,
      },
    ],
    {
      home: [
        {
          name: 'Martin Ødegaard',
          role: 'Capitaine / Milieu créatif',
          reason: 'Blessure genou',
          impactXgDelta: -0.44,
          status: 'Absent confirmé',
        },
      ],
      away: [
        {
          name: 'David Alaba',
          role: 'Défenseur Central',
          reason: 'Genou',
          impactXgDelta: -0.12,
          status: 'Absent confirmé',
        },
      ],
    }
  ),

  buildMatch(
    'om-ol',
    'Ligue 1',
    'Olympique de Marseille',
    'Olympique Lyonnais',
    '2026-11-03T20:45:00Z',
    'Orange Vélodrome, Marseille',
    'François Letexier (FRA)',
    2.10,
    1.30,
    { pin: 1.98, bet: 1.95, win: 2.00, uni: 1.92 },
    { pin: 3.75, bet: 3.65, win: 3.70, uni: 3.60 },
    { pin: 3.90, bet: 3.75, win: 3.85, uni: 3.70 },
    91,
    ['V', 'V', 'V', 'D', 'V'],
    ['N', 'D', 'V', 'D', 'V'],
    {
      total: 38,
      hWins: 14,
      d: 11,
      aWins: 13,
      recent: [
        { date: '02/2026', homeScore: 3, awayScore: 1 },
        { date: '09/2025', homeScore: 2, awayScore: 3 },
        { date: '01/2025', homeScore: 1, awayScore: 0 },
      ],
    },
    [
      {
        id: 'prop-greenwood-1',
        name: 'Mason Greenwood',
        team: 'Marseille',
        position: 'Attaquant',
        propType: 'Buteur',
        modelProb: 0.49,
        fairOdds: 2.04,
        bookmakerOdds: 2.40,
        evPercent: 17.6,
        recentFormStat: '7 buts cette saison en Ligue 1',
        avgShotsPer90: 3.8,
        xgPer90: 0.65,
      },
    ],
    {
      home: [
        {
          name: 'Valentin Rongier',
          role: 'Milieu de terrain',
          reason: 'Maladie',
          impactXgDelta: -0.09,
          status: 'Incertain (25%)',
        },
      ],
      away: [
        {
          name: 'Corentin Tolisso',
          role: 'Capitaine / Milieu',
          reason: 'Suspension',
          impactXgDelta: -0.24,
          status: 'Absent confirmé',
        },
      ],
    }
  ),

  buildMatch(
    'bay-liv',
    'Champions League',
    'Bayern Munich',
    'Liverpool FC',
    '2026-11-03T21:00:00Z',
    'Allianz Arena, Munich',
    'Felix Zwayer (GER)',
    2.25,
    1.75,
    { pin: 2.20, bet: 2.15, win: 2.18, uni: 2.10 },
    { pin: 3.85, bet: 3.75, win: 3.80, uni: 3.70 },
    { pin: 3.05, bet: 2.95, win: 3.00, uni: 2.90 },
    94,
    ['V', 'V', 'V', 'V', 'N'],
    ['V', 'V', 'N', 'V', 'D'],
    {
      total: 6,
      hWins: 2,
      d: 2,
      aWins: 2,
      recent: [
        { date: '08/2023', homeScore: 4, awayScore: 3 },
        { date: '03/2019', homeScore: 1, awayScore: 3 },
      ],
    },
    [
      {
        id: 'prop-kane-1',
        name: 'Harry Kane',
        team: 'Bayern',
        position: 'Attaquant',
        propType: 'Buteur',
        modelProb: 0.58,
        fairOdds: 1.72,
        bookmakerOdds: 2.05,
        evPercent: 18.9,
        recentFormStat: '8 buts sur les 6 derniers matchs',
        avgShotsPer90: 4.2,
        xgPer90: 0.96,
      },
      {
        id: 'prop-salah-1',
        name: 'Mohamed Salah',
        team: 'Liverpool',
        position: 'Attaquant',
        propType: 'Buteur',
        modelProb: 0.46,
        fairOdds: 2.17,
        bookmakerOdds: 2.55,
        evPercent: 17.3,
        recentFormStat: '4 buts et 3 assists récents',
        avgShotsPer90: 3.5,
        xgPer90: 0.72,
      },
    ],
    {
      home: [],
      away: [
        {
          name: 'Alisson Becker',
          role: 'Gardien titulaire',
          reason: 'Blessure ischios',
          impactXgDelta: -0.35, // Increases xG conceded
          status: 'Absent confirmé',
        },
      ],
    }
  ),

  buildMatch(
    'int-bar',
    'Champions League',
    'Inter Milan',
    'FC Barcelone',
    '2026-11-03T18:45:00Z',
    'San Siro, Milan',
    'Daniele Orsato (ITA)',
    1.45,
    1.95,
    { pin: 3.10, bet: 2.95, win: 3.05, uni: 2.90 },
    { pin: 3.60, bet: 3.50, win: 3.55, uni: 3.45 },
    { pin: 2.35, bet: 2.25, win: 2.30, uni: 2.25 },
    87,
    ['V', 'D', 'V', 'N', 'V'],
    ['V', 'V', 'V', 'V', 'V'],
    {
      total: 10,
      hWins: 2,
      d: 4,
      aWins: 4,
      recent: [
        { date: '10/2022', homeScore: 1, awayScore: 0 },
        { date: '10/2022', homeScore: 3, awayScore: 3 },
      ],
    },
    [
      {
        id: 'prop-yamal-1',
        name: 'Lamine Yamal',
        team: 'Barcelone',
        position: 'Attaquant',
        propType: 'Tirs Cadrés > 1.5',
        modelProb: 0.47,
        fairOdds: 2.13,
        bookmakerOdds: 2.65,
        evPercent: 24.5,
        recentFormStat: 'Top volume de frappes et dribbles en Europe',
        avgShotsPer90: 3.6,
        xgPer90: 0.61,
      },
    ],
    {
      home: [
        {
          name: 'Hakan Çalhanoğlu',
          role: 'Maître à jouer',
          reason: 'Blessure ischios',
          impactXgDelta: -0.28,
          status: 'Incertain (25%)',
        },
      ],
      away: [],
    }
  ),

  buildMatch(
    'atm-juv',
    'Champions League',
    'Atlético Madrid',
    'Juventus',
    '2026-11-03T21:00:00Z',
    'Cívitas Metropolitano, Madrid',
    'Michael Oliver (ENG)',
    1.35,
    0.95,
    { pin: 1.88, bet: 1.85, win: 1.86, uni: 1.82 },
    { pin: 3.35, bet: 3.30, win: 3.30, uni: 3.25 },
    { pin: 4.60, bet: 4.40, win: 4.50, uni: 4.30 },
    86,
    ['V', 'N', 'V', 'V', 'D'],
    ['N', 'V', 'N', 'D', 'V'],
    {
      total: 7,
      hWins: 3,
      d: 2,
      aWins: 2,
      recent: [
        { date: '11/2019', homeScore: 0, awayScore: 1 },
        { date: '09/2019', homeScore: 2, awayScore: 2 },
      ],
    },
    [],
    {
      home: [],
      away: [
        {
          name: 'Bremer',
          role: 'Pilier défense',
          reason: 'Genou',
          impactXgDelta: -0.33,
          status: 'Absent confirmé',
        },
      ],
    }
  ),
];

// Extract all top value bets across matches
export const mockTopValueBets: ValueBetOpportunity[] = mockMatches.flatMap(m => m.valueBets);

// Dropping Odds Radar Ticker
export interface DroppingOddAlert {
  id: string;
  match: string;
  selection: string;
  bookmaker: string;
  initialOdds: number;
  currentOdds: number;
  dropPercent: number; // e.g. -14.2%
  timeAgo: string;
}

export const mockDroppingOdds: DroppingOddAlert[] = [
  {
    id: 'drop-1',
    match: 'PSG vs Man City',
    selection: 'PSG Victoire',
    bookmaker: 'Pinnacle',
    initialOdds: 2.65,
    currentOdds: 2.45,
    dropPercent: -7.5,
    timeAgo: 'Il y a 14 min',
  },
  {
    id: 'drop-2',
    match: 'Inter Milan vs FC Barcelone',
    selection: 'Barcelone Victoire',
    bookmaker: 'Winamax',
    initialOdds: 2.55,
    currentOdds: 2.30,
    dropPercent: -9.8,
    timeAgo: 'Il y a 27 min',
  },
  {
    id: 'drop-3',
    match: 'Arsenal vs Real Madrid',
    selection: 'Plus de 2.5 Buts',
    bookmaker: 'Betclic',
    initialOdds: 2.05,
    currentOdds: 1.85,
    dropPercent: -9.7,
    timeAgo: 'Il y a 42 min',
  },
  {
    id: 'drop-4',
    match: 'Bayern Munich vs Liverpool',
    selection: 'Les 2 Marquent & Over 2.5',
    bookmaker: 'Pinnacle',
    initialOdds: 1.95,
    currentOdds: 1.82,
    dropPercent: -6.7,
    timeAgo: 'Il y a 1h',
  },
];

// 30-day cumulative simulated performance trajectory
export const mockPerformanceTrajectory = [
  { day: '04 Oct', bankroll: 5000, pnl: 0, winRate: 58.0 },
  { day: '08 Oct', bankroll: 5180, pnl: 180, winRate: 61.2 },
  { day: '12 Oct', bankroll: 5120, pnl: 120, winRate: 57.8 },
  { day: '16 Oct', bankroll: 5390, pnl: 390, winRate: 62.5 },
  { day: '20 Oct', bankroll: 5640, pnl: 640, winRate: 64.0 },
  { day: '24 Oct', bankroll: 5580, pnl: 580, winRate: 61.8 },
  { day: '28 Oct', bankroll: 5890, pnl: 890, winRate: 63.4 },
  { day: '01 Nov', bankroll: 6150, pnl: 1150, winRate: 65.1 },
  { day: '03 Nov', bankroll: 6320, pnl: 1320, winRate: 65.8 },
];

// Intraday Odds Trajectory for PSG vs Man City (24h before match)
export const mockIntradayTrajectory = [
  { time: '-24h', marketOdds: 2.65, modelFairOdds: 2.05 },
  { time: '-18h', marketOdds: 2.60, modelFairOdds: 2.05 },
  { time: '-12h', marketOdds: 2.55, modelFairOdds: 2.04 },
  { time: '-8h', marketOdds: 2.50, modelFairOdds: 2.04 },
  { time: '-4h', marketOdds: 2.47, modelFairOdds: 2.03 },
  { time: '-2h', marketOdds: 2.45, modelFairOdds: 2.03 },
  { time: 'Direct', marketOdds: 2.45, modelFairOdds: 2.03 },
];

// Bankroll Tracker mock data
export const mockBankrollBets: BankrollBet[] = [
  {
    id: 'bb-1',
    date: '2026-11-03',
    matchTitle: 'Paris Saint-Germain vs Man City',
    selection: 'PSG Victoire',
    odds: 2.45,
    stake: 125,
    modelProb: 0.492,
    evPercent: 20.5,
    status: 'En cours',
    bookmaker: 'Pinnacle',
  },
  {
    id: 'bb-2',
    date: '2026-11-03',
    matchTitle: 'Bayern vs Liverpool',
    selection: 'Harry Kane Buteur',
    odds: 2.05,
    stake: 90,
    modelProb: 0.58,
    evPercent: 18.9,
    status: 'En cours',
    bookmaker: 'Winamax',
  },
  {
    id: 'bb-3',
    date: '2026-11-01',
    matchTitle: 'Real Madrid vs Valencia',
    selection: 'Real Madrid -1.5 AH',
    odds: 1.95,
    stake: 120,
    modelProb: 0.61,
    evPercent: 18.9,
    status: 'Gagné',
    pnl: 114,
    bookmaker: 'Pinnacle',
  },
  {
    id: 'bb-4',
    date: '2026-10-31',
    matchTitle: 'Tottenham vs Chelsea',
    selection: 'Plus de 2.5 Buts',
    odds: 1.85,
    stake: 100,
    modelProb: 0.64,
    evPercent: 18.4,
    status: 'Gagné',
    pnl: 85,
    bookmaker: 'Betclic',
  },
  {
    id: 'bb-5',
    date: '2026-10-29',
    matchTitle: 'Monaco vs Lille',
    selection: 'Lille Victoire',
    odds: 2.80,
    stake: 60,
    modelProb: 0.42,
    evPercent: 17.6,
    status: 'Perdu',
    pnl: -60,
    bookmaker: 'Winamax',
  },
  {
    id: 'bb-6',
    date: '2026-10-27',
    matchTitle: 'Barcelone vs Séville',
    selection: 'Lamine Yamal Tirs Cadrés > 1.5',
    odds: 2.50,
    stake: 80,
    modelProb: 0.48,
    evPercent: 20.0,
    status: 'Gagné',
    pnl: 120,
    bookmaker: 'Unibet',
  },
];

// Rich Backtester Historical Dataset (simulated 180 bets over 5 months)
export function generateBacktestUniverse() {
  const competitions = ['Champions League', 'Premier League', 'Ligue 1', 'La Liga', 'Serie A', 'Bundesliga'];
  const markets = ['1X2', 'Over/Under 2.5', 'Both Teams To Score', 'Player Props - Tirs Cadrés', 'Player Props - Buteur'];

  const universe = [];
  const baseDate = new Date('2026-06-01');

  for (let i = 0; i < 220; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + Math.floor(i * 0.7));

    const comp = competitions[i % competitions.length];
    const market = markets[i % markets.length];
    const ev = Math.round((Math.sin(i * 1.7) * 7 + 6.5) * 10) / 10; // EV between -0.5% and 13.5%
    const odds = Math.round((1.65 + (i % 7) * 0.28) * 100) / 100; // Odds between 1.65 and 3.33
    const modelProb = (1 + ev / 100) / odds;

    // Deterministic simulation based on model edge
    const pseudoRandom = Math.abs(Math.sin(i * 3.1415 + 0.42));
    const won = pseudoRandom < modelProb;

    universe.push({
      id: `bt-${i}`,
      date: d.toISOString().split('T')[0],
      competition: comp,
      market,
      evPercent: ev,
      odds,
      modelProb: Math.round(modelProb * 1000) / 1000,
      won,
    });
  }

  return universe;
}

export const mockBacktestUniverse = generateBacktestUniverse();

