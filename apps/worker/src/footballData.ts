import { Env } from "./index";

export type FootballMatch = {
  id: number;
  utcDate: string;
  status: string;
  matchday: number | null;
  homeTeam: { name: string };
  awayTeam: { name: string };
  score: {
    fullTime: { home: number | null; away: number | null };
  };
};

export type FootballMatchesResponse = {
  competition: { code: string };
  season: { startDate: string; endDate: string; currentMatchday?: number };
  matches: FootballMatch[];
};

export type FootballCompetitionResponse = {
  id: number;
  code: string;
  currentSeason?: {
    startDate: string;
    endDate: string;
    currentMatchday?: number;
  };
};

function getBaseUrl(env: Env): string {
  return env.FOOTBALL_DATA_BASE_URL || "https://api.football-data.org/v4";
}

function getCompetitionId(env: Env): string {
  return env.FOOTBALL_DATA_COMPETITION_ID || "2013";
}

async function fetchFromApi(env: Env, path: string): Promise<FootballMatchesResponse> {
  const url = `${getBaseUrl(env)}${path}`;
  const response = await fetch(url, {
    headers: {
      "X-Auth-Token": env.FOOTBALL_DATA_TOKEN
    }
  });

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    const detail = bodyText ? ` - ${bodyText}` : "";
    throw new Error(`Football-Data API error: ${response.status}${detail}`);
  }

  return (await response.json()) as FootballMatchesResponse;
}

export async function fetchCompetition(env: Env): Promise<FootballCompetitionResponse> {
  const url = `${getBaseUrl(env)}/competitions/${getCompetitionId(env)}`;
  const response = await fetch(url, {
    headers: {
      "X-Auth-Token": env.FOOTBALL_DATA_TOKEN
    }
  });

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    const detail = bodyText ? ` - ${bodyText}` : "";
    throw new Error(`Football-Data API error: ${response.status}${detail}`);
  }

  return (await response.json()) as FootballCompetitionResponse;
}

export async function fetchScheduledMatches(env: Env): Promise<FootballMatchesResponse> {
  return fetchFromApi(env, `/competitions/${getCompetitionId(env)}/matches`);
}

export async function fetchFinishedMatches(env: Env): Promise<FootballMatchesResponse> {
  return fetchFromApi(env, `/competitions/${getCompetitionId(env)}/matches?status=FINISHED`);
}

export async function fetchMatchesByMatchday(
  env: Env,
  matchday: number
): Promise<FootballMatchesResponse> {
  return fetchFromApi(
    env,
    `/competitions/${getCompetitionId(env)}/matches?matchday=${matchday}`
  );
}
