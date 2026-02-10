export type Round = {
  id: number;
  season: number;
  roundNumber: number;
  cutoffAt: string;
};

export type Match = {
  id: number;
  utcDate: string;
  status: string;
  homeTeam: string;
  awayTeam: string;
  externalLink?: string | null;
  score?: {
    home: number | null;
    away: number | null;
  };
};

export type RankingEntry = {
  name: string;
  points: number;
};

export type RoundHistory = {
  id: number;
  season: number;
  round_number: number;
  cutoff_at: string;
};

export type RoundPrediction = {
  participantName: string;
  predHome: number;
  predAway: number;
  points: number;
  matchId: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  utcDate: string;
};
