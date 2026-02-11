import { Match, RankingEntry, Round, RoundHistory, RoundPrediction } from "../types";

function resolveApiBaseUrl(): string {
  const configured = (import.meta.env.VITE_API_BASE_URL ?? "").trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  if (import.meta.env.DEV) {
    return "http://localhost:8787";
  }

  throw new Error(
    "Missing VITE_API_BASE_URL. Configure it to your Worker URL (e.g. https://bolao-brasileirao-api.<subdomain>.workers.dev)."
  );
}

const baseUrl = resolveApiBaseUrl();

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
  submissionToken: string;
  predictions: { matchId: number; home: number; away: number }[];
}): Promise<{ message: string }> {
  return request("/predictions", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export async function adminGenerateSubmissionToken(
  roundId: number,
  adminToken: string
): Promise<{ roundId: number; submissionToken: string; expiresAt: string }> {
  return request(`/admin/rounds/${roundId}/submission-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Token": adminToken
    }
  });
}

export async function adminDeletePredictionsByName(
  roundId: number,
  participantName: string,
  adminToken: string
): Promise<{ roundId: number; participantName: string; deletedPredictions: number; deletedScoreRows: number }> {
  return request(`/admin/rounds/${roundId}/predictions/${encodeURIComponent(participantName)}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Token": adminToken
    }
  });
}

export async function adminRecalculateRound(
  roundId: number,
  adminToken: string
): Promise<{ roundId: number; message: string }> {
  return request(`/rounds/${roundId}/recalculate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Token": adminToken
    }
  });
}

export async function adminSyncFinishedMatches(adminToken: string): Promise<{ message: string }> {
  return request("/admin/sync-finished", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Token": adminToken
    }
  });
}
