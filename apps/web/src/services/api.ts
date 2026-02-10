import { Match, RankingEntry, Round, RoundHistory, RoundPrediction } from "../types";

const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8787";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      "Content-Type": "application/json"
    },
    ...options
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(errorData.error || "Request failed");
  }

  return response.json() as Promise<T>;
}

export async function fetchNextRound(): Promise<{ round: Round; matches: Match[] }> {
  return request("/rounds/next");
}

export async function fetchRankings(roundId: number): Promise<{
  roundId: number;
  ranking: RankingEntry[];
}> {
  return request(`/rankings/round/${roundId}`);
}

export async function fetchGlobalRanking(): Promise<{ ranking: RankingEntry[] }> {
  return request("/rankings/global");
}

export async function fetchHistory(includeActive = false): Promise<{ rounds: RoundHistory[] }> {
  const query = includeActive ? "?includeActive=true" : "";
  return request(`/rounds/history${query}`);
}

export async function fetchRoundPredictions(roundId: number): Promise<{
  roundId: number;
  predictions: RoundPrediction[];
}> {
  return request(`/rounds/${roundId}/predictions`);
}

export async function submitPredictions(payload: {
  roundId: number;
  participantName: string;
  predictions: { matchId: number; home: number; away: number }[];
}): Promise<{ message: string }> {
  return request("/predictions", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}
