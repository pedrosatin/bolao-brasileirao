import { Env } from "./index";
import { jsonResponse, errorResponse } from "./http";
import { parsePredictionsPayload } from "./validation";
import {
  fetchScheduledMatches,
  fetchFinishedMatches,
  fetchCompetition,
  fetchMatchesByMatchday
} from "./footballData";
import { getNextTuesdayCutoffUtcIso, hasMatchStartedInBrasilia } from "./time";
import { calculatePoints } from "./scoring";
import {
  deletePredictionsByRoundAndName,
  getMatchesByRoundId,
  getRoundBySeasonNumber,
  getSubmissionTokenByRoundId,
  upsertMatch,
  upsertRound,
  upsertSubmissionToken
} from "./db";

const DEFAULT_LINK = "https://g1.globo.com/futebol/brasileirao-serie-a/";
const SCHEDULABLE_STATUSES = new Set(["SCHEDULED", "TIMED"]);

export async function getNextRound(
  _request: Request,
  env: Env,
  _ctx: ExecutionContext
): Promise<Response> {
  try {
    const now = new Date();
    const nowIso = now.toISOString();
    const competition = await fetchCompetition(env);
    const currentMatchday = competition.currentSeason?.currentMatchday;
    const cacheTtlMs = 6 * 24 * 60 * 60 * 1000;

    if (currentMatchday) {
      const seasonYear = resolveSeasonYear(competition.currentSeason?.startDate, []);
      const cachedRound = await getRoundBySeasonNumber(env.DB, seasonYear, currentMatchday);
      if (cachedRound?.last_sync_at) {
        const lastSync = new Date(cachedRound.last_sync_at).getTime();
        if (!Number.isNaN(lastSync) && now.getTime() - lastSync < cacheTtlMs) {
          const storedMatches = await getMatchesByRoundId(env.DB, cachedRound.id);
          if (storedMatches.length > 0) {
            return jsonResponse({
              round: {
                id: cachedRound.id,
                season: cachedRound.season,
                roundNumber: cachedRound.round_number,
                cutoffAt: cachedRound.cutoff_at
              },
              matches: storedMatches.map((match) => ({
                id: match.id,
                utcDate: match.utc_date,
                status: match.status,
                homeTeam: match.home_team,
                awayTeam: match.away_team,
                externalLink: match.external_link
              }))
            });
          }
        }
      }
    }

    const apiData = currentMatchday
      ? await fetchMatchesByMatchday(env, currentMatchday)
      : await fetchScheduledMatches(env);

    const apiMatches = apiData.matches;
    if (apiMatches.length === 0) {
      return errorResponse("No upcoming matches found", 404);
    }

    const futureMatches = apiMatches.filter((match) => new Date(match.utcDate) >= now);
    if (!currentMatchday && futureMatches.length === 0) {
      return errorResponse("No upcoming matches found", 404);
    }
    const matchdayNumber = currentMatchday
      ? currentMatchday
      : Math.min(
        ...futureMatches.map((match) => (match.matchday === null ? Infinity : match.matchday))
      );
    const matchdayMatches = currentMatchday
      ? apiMatches
      : futureMatches.filter((match) => match.matchday === matchdayNumber);
    const seasonYear = resolveSeasonYear(competition.currentSeason?.startDate, matchdayMatches);
    const cutoffAt = getNextTuesdayCutoffUtcIso(now);

    const round = await upsertRound(env.DB, seasonYear, matchdayNumber, cutoffAt, nowIso, nowIso);

    for (const match of matchdayMatches) {
      await upsertMatch(
        env.DB,
        {
          round_id: round.id,
          api_match_id: match.id,
          utc_date: match.utcDate,
          status: match.status,
          home_team: match.homeTeam.name,
          away_team: match.awayTeam.name,
          home_score: match.score.fullTime.home,
          away_score: match.score.fullTime.away,
          external_link: env.DEFAULT_EXTERNAL_LINK || DEFAULT_LINK
        },
        nowIso
      );
    }

    const storedMatches = await getMatchesByRoundId(env.DB, round.id);
    return jsonResponse({
      round: {
        id: round.id,
        season: round.season,
        roundNumber: round.round_number,
        cutoffAt: round.cutoff_at
      },
      matches: storedMatches.map((match) => ({
        id: match.id,
        utcDate: match.utc_date,
        status: match.status,
        homeTeam: match.home_team,
        awayTeam: match.away_team,
        externalLink: match.external_link
      }))
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("getNextRound error:", message);
    return errorResponse(`Failed to fetch next round: ${message}`, 500);
  }
}

function resolveSeasonYear(seasonStart: string | undefined, matches: { utcDate: string }[]): number {
  if (seasonStart) {
    const year = new Date(seasonStart).getFullYear();
    if (!Number.isNaN(year)) {
      return year;
    }
  }

  const firstMatchDate = matches[0]?.utcDate;
  if (firstMatchDate) {
    const year = new Date(firstMatchDate).getFullYear();
    if (!Number.isNaN(year)) {
      return year;
    }
  }

  return new Date().getFullYear();
}

export async function getRoundById(
  _request: Request,
  env: Env,
  _ctx: ExecutionContext,
  params: Record<string, string>
): Promise<Response> {
  const roundId = Number(params.id);
  if (Number.isNaN(roundId)) {
    return errorResponse("Invalid round id", 400);
  }

  const round = await env.DB
    .prepare("SELECT id, season, round_number, cutoff_at FROM rounds WHERE id = ?")
    .bind(roundId)
    .first<{ id: number; season: number; round_number: number; cutoff_at: string }>();

  if (!round) {
    return errorResponse("Round not found", 404);
  }

  const matches = await getMatchesByRoundId(env.DB, roundId);
  return jsonResponse({
    round: {
      id: round.id,
      season: round.season,
      roundNumber: round.round_number,
      cutoffAt: round.cutoff_at
    },
    matches: matches.map((match) => ({
      id: match.id,
      utcDate: match.utc_date,
      status: match.status,
      homeTeam: match.home_team,
      awayTeam: match.away_team,
      externalLink: match.external_link,
      score: {
        home: match.home_score,
        away: match.away_score
      }
    }))
  });
}

export async function getRoundHistory(
  request: Request,
  env: Env,
  _ctx: ExecutionContext
): Promise<Response> {
  const url = new URL(request.url);
  const includeActive = url.searchParams.get("includeActive") === "true";

  const query = includeActive
    ? "SELECT r.id, r.season, r.round_number, r.cutoff_at FROM rounds r ORDER BY r.season DESC, r.round_number DESC"
    : "SELECT r.id, r.season, r.round_number, r.cutoff_at " +
    "FROM rounds r " +
    "WHERE r.id IN (" +
    "  SELECT round_id FROM matches GROUP BY round_id HAVING SUM(CASE WHEN status != 'FINISHED' THEN 1 ELSE 0 END) = 0" +
    ") " +
    "ORDER BY r.season DESC, r.round_number DESC";

  const result = await env.DB
    .prepare(query)
    .all<{ id: number; season: number; round_number: number; cutoff_at: string }>();

  return jsonResponse({ rounds: result.results ?? [] });
}

export async function getRoundPredictions(
  _request: Request,
  env: Env,
  _ctx: ExecutionContext,
  params: Record<string, string>
): Promise<Response> {
  const roundId = Number(params.id);
  if (Number.isNaN(roundId)) {
    return errorResponse("Invalid round id", 400);
  }

  const result = await env.DB
    .prepare(
      "SELECT p.participant_name as participantName, p.pred_home_score as predHome, p.pred_away_score as predAway, p.points, " +
      "m.id as matchId, m.home_team as homeTeam, m.away_team as awayTeam, m.home_score as homeScore, m.away_score as awayScore, m.utc_date as utcDate " +
      "FROM predictions p " +
      "JOIN matches m ON m.id = p.match_id " +
      "WHERE p.round_id = ? " +
      "ORDER BY p.participant_name ASC, m.utc_date ASC"
    )
    .bind(roundId)
    .all<{
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
    }>();

  return jsonResponse({
    roundId,
    predictions: result.results ?? []
  });
}

export async function recalculateRoundScores(
  request: Request,
  env: Env,
  _ctx: ExecutionContext,
  params: Record<string, string>
): Promise<Response> {
  const originError = requireOriginAllowed(request, env);
  if (originError) {
    return originError;
  }

  const authError = requireAdmin(request, env);
  if (authError) {
    return authError;
  }

  const roundId = Number(params.id);
  if (Number.isNaN(roundId)) {
    return errorResponse("Invalid round id", 400);
  }

  const matches = await env.DB
    .prepare(
      "SELECT id, home_score, away_score FROM matches WHERE round_id = ? ORDER BY utc_date ASC"
    )
    .bind(roundId)
    .all<{ id: number; home_score: number | null; away_score: number | null }>();

  if ((matches.results ?? []).length === 0) {
    return errorResponse("Round not found", 404);
  }

  const finishedMatches = (matches.results ?? []).filter(
    (match) => match.home_score !== null && match.away_score !== null
  );

  if (finishedMatches.length === 0) {
    return errorResponse("No finished matches to recalculate", 400);
  }

  const nowIso = new Date().toISOString();

  for (const match of finishedMatches) {
    await env.DB
      .prepare(
        "UPDATE matches SET status = 'FINISHED', updated_at = ? WHERE id = ?"
      )
      .bind(nowIso, match.id)
      .run();

    const predictions = await env.DB
      .prepare(
        "SELECT id, pred_home_score, pred_away_score FROM predictions WHERE match_id = ?"
      )
      .bind(match.id)
      .all<{ id: number; pred_home_score: number; pred_away_score: number }>();

    for (const prediction of predictions.results ?? []) {
      const points = calculatePoints({
        predictedHome: prediction.pred_home_score,
        predictedAway: prediction.pred_away_score,
        actualHome: match.home_score as number,
        actualAway: match.away_score as number
      });

      await env.DB
        .prepare("UPDATE predictions SET points = ?, updated_at = ? WHERE id = ?")
        .bind(points, nowIso, prediction.id)
        .run();
    }
  }

  await env.DB
    .prepare("DELETE FROM scores WHERE round_id = ?")
    .bind(roundId)
    .run();

  await env.DB
    .prepare(
      "INSERT INTO scores (round_id, participant_name, points_total, created_at, updated_at) " +
      "SELECT round_id, participant_name, SUM(points) as points_total, ?, ? " +
      "FROM predictions WHERE round_id = ? GROUP BY participant_name"
    )
    .bind(nowIso, nowIso, roundId)
    .run();

  return jsonResponse({
    roundId,
    message: "Scores recalculated"
  });
}

export async function createPredictions(
  request: Request,
  env: Env,
  _ctx: ExecutionContext,
  body: unknown
): Promise<Response> {
  const originError = requireOriginAllowed(request, env);
  if (originError) {
    return originError;
  }

  const payload = parsePredictionsPayload(body);
  if (!payload) {
    return errorResponse("Invalid payload", 400);
  }

  const { participantName, predictions, submissionToken } = payload;
  let roundId = payload.roundId;

  if (!roundId) {
    const matchId = predictions[0].matchId;
    const matchRow = await env.DB
      .prepare("SELECT round_id FROM matches WHERE id = ?")
      .bind(matchId)
      .first<{ round_id: number }>();
    if (!matchRow) {
      return errorResponse("Match not found", 404);
    }
    roundId = matchRow.round_id;
  }

  const roundExists = await env.DB
    .prepare("SELECT 1 as found FROM rounds WHERE id = ?")
    .bind(roundId)
    .first<{ found: number }>();

  if (!roundExists) {
    return errorResponse("Round not found", 404);
  }

  if (!submissionToken || submissionToken.trim().length < 10) {
    // Allow empty token only in development
    if (env.ENVIRONMENT !== 'development') {
      return errorResponse("Submission token required", 401);
    }
  } else {
    const tokenRow = await getSubmissionTokenByRoundId(env.DB, roundId);
    if (!tokenRow) {
      return errorResponse("Submission token not configured for this round", 403);
    }

    const now = new Date();
    const expiresAt = new Date(tokenRow.expires_at);
    if (Number.isNaN(expiresAt.getTime()) || now > expiresAt) {
      return errorResponse("Submission token expired", 401);
    }

    const providedHash = await sha256Hex(submissionToken.trim());
    if (providedHash !== tokenRow.token_hash) {
      return errorResponse("Invalid submission token", 403);
    }
  }

  const existing = await env.DB
    .prepare("SELECT 1 FROM predictions WHERE round_id = ? AND participant_name = ? LIMIT 1")
    .bind(roundId, participantName)
    .first();

  if (existing) {
    return errorResponse("Name already used in this round", 409);
  }

  const matchIds = predictions.map((prediction) => prediction.matchId);
  if (matchIds.length === 0) {
    return errorResponse("No predictions provided", 400);
  }
  const placeholders = matchIds.map(() => "?").join(", ");
  const rows = await env.DB
    .prepare(
      `SELECT id, utc_date, status FROM matches WHERE round_id = ? AND id IN (${placeholders})`
    )
    .bind(roundId, ...matchIds)
    .all<{ id: number; utc_date: string; status: string }>();

  const fetchedMatches = rows.results ?? [];
  if (fetchedMatches.length !== matchIds.length) {
    return errorResponse("One or more matches are invalid for this round", 400);
  }

  const matchesById = new Map(fetchedMatches.map((match) => [match.id, match]));
  const nowUtc = new Date();

  for (const prediction of predictions) {
    const match = matchesById.get(prediction.matchId);
    if (!match) {
      return errorResponse("One or more matches are invalid for this round", 400);
    }

    const status = (match.status ?? "").toUpperCase();
    const statusLocked = !SCHEDULABLE_STATUSES.has(status);
    if (statusLocked || hasMatchStartedInBrasilia(match.utc_date, nowUtc)) {
      return errorResponse("One or more matches already started", 423);
    }
  }

  const nowIso = nowUtc.toISOString();
  const statements = predictions.map((prediction) =>
    env.DB
      .prepare(
        "INSERT INTO predictions (round_id, match_id, participant_name, pred_home_score, pred_away_score, points, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 0, ?, ?)"
      )
      .bind(roundId, prediction.matchId, participantName, prediction.home, prediction.away, nowIso, nowIso)
  );

  await env.DB.batch(statements);

  return jsonResponse({
    message: "Predictions saved",
    roundId,
    participantName
  }, 201);
}

function requireOriginAllowed(request: Request, env: Env): Response | null {
  const origin = request.headers.get("Origin");
  if (!origin) {
    return null;
  }

  const allowed = parseAllowedOrigins(env.CORS_ORIGINS);
  if (allowed.includes("*")) {
    return null;
  }

  if (!allowed.includes(origin)) {
    return errorResponse("Origin not allowed for this operation", 403);
  }

  return null;
}

function parseAllowedOrigins(value?: string): string[] {
  if (!value) {
    return ["*"];
  }

  const origins = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return origins.length > 0 ? origins : ["*"];
}

function requireAdmin(request: Request, env: Env): Response | null {
  const expected = (env.ADMIN_TOKEN ?? "").trim();
  if (!expected) {
    console.error("ADMIN_TOKEN is not configured");
    return errorResponse("Invalid request", 401);
  }

  const provided = (request.headers.get("X-Admin-Token") ?? "").trim();
  if (!provided || provided !== expected) {
    return errorResponse("Invalid request", 401);
  }

  return null;
}

function toHex(bytes: ArrayBuffer): string {
  const array = new Uint8Array(bytes);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256Hex(value: string): Promise<string> {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return toHex(digest);
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export async function generateSubmissionToken(
  request: Request,
  env: Env,
  _ctx: ExecutionContext,
  params: Record<string, string>
): Promise<Response> {
  const originError = requireOriginAllowed(request, env);
  if (originError) {
    return originError;
  }

  const authError = requireAdmin(request, env);
  if (authError) {
    return authError;
  }

  const roundId = Number(params.id);
  if (Number.isNaN(roundId)) {
    return errorResponse("Invalid round id", 400);
  }

  const round = await env.DB
    .prepare("SELECT cutoff_at FROM rounds WHERE id = ?")
    .bind(roundId)
    .first<{ cutoff_at: string }>();

  if (!round) {
    return errorResponse("Round not found", 404);
  }

  const tokenBytes = new Uint8Array(32);
  crypto.getRandomValues(tokenBytes);
  const token = base64UrlEncode(tokenBytes);
  const tokenHash = await sha256Hex(token);

  const nowIso = new Date().toISOString();
  const expiresAt = round.cutoff_at;

  await upsertSubmissionToken(
    env.DB,
    {
      roundId,
      tokenHash,
      expiresAt
    },
    nowIso
  );

  return jsonResponse(
    {
      roundId,
      submissionToken: token,
      expiresAt
    },
    201
  );
}

export async function adminDeletePredictionsByName(
  request: Request,
  env: Env,
  _ctx: ExecutionContext,
  params: Record<string, string>
): Promise<Response> {
  const originError = requireOriginAllowed(request, env);
  if (originError) {
    return originError;
  }

  const authError = requireAdmin(request, env);
  if (authError) {
    return authError;
  }

  const roundId = Number(params.id);
  if (Number.isNaN(roundId)) {
    return errorResponse("Invalid round id", 400);
  }

  const participantName = (params.name ?? "").trim();
  if (participantName.length < 2) {
    return errorResponse("Invalid participant name", 400);
  }

  const result = await deletePredictionsByRoundAndName(env.DB, roundId, participantName);
  return jsonResponse({
    roundId,
    participantName,
    ...result
  });
}

export async function adminSyncFinishedMatches(
  request: Request,
  env: Env,
  _ctx: ExecutionContext,
  _params: Record<string, string>
): Promise<Response> {
  const originError = requireOriginAllowed(request, env);
  if (originError) {
    return originError;
  }

  const authError = requireAdmin(request, env);
  if (authError) {
    return authError;
  }

  await syncFinishedMatchesAndScores(env);

  return jsonResponse({
    message: "Finished matches synced"
  });
}

export async function getRoundRanking(
  _request: Request,
  env: Env,
  _ctx: ExecutionContext,
  params: Record<string, string>
): Promise<Response> {
  const roundId = Number(params.id);
  if (Number.isNaN(roundId)) {
    return errorResponse("Invalid round id", 400);
  }

  const result = await env.DB
    .prepare(
      "SELECT participant_name as name, SUM(points) as points " +
      "FROM predictions WHERE round_id = ? " +
      "GROUP BY participant_name ORDER BY points DESC, name ASC"
    )
    .bind(roundId)
    .all<{ name: string; points: number }>();

  return jsonResponse({
    roundId,
    ranking: result.results ?? []
  });
}

export async function getGlobalRanking(
  _request: Request,
  env: Env,
  _ctx: ExecutionContext
): Promise<Response> {
  const result = await env.DB
    .prepare(
      "SELECT participant_name as name, SUM(points) as points " +
      "FROM predictions GROUP BY participant_name ORDER BY points DESC, name ASC"
    )
    .all<{ name: string; points: number }>();

  return jsonResponse({ ranking: result.results ?? [] });
}

export async function syncFinishedMatchesAndScores(env: Env): Promise<void> {
  const apiData = await fetchFinishedMatches(env);
  const nowIso = new Date().toISOString();

  for (const match of apiData.matches) {
    const stored = await env.DB
      .prepare(
        "SELECT id, round_id, home_score, away_score FROM matches WHERE api_match_id = ?"
      )
      .bind(match.id)
      .first<{ id: number; round_id: number; home_score: number | null; away_score: number | null }>();

    if (!stored) {
      continue;
    }

    const homeScore = match.score.fullTime.home;
    const awayScore = match.score.fullTime.away;

    await env.DB
      .prepare(
        "UPDATE matches SET status = ?, home_score = ?, away_score = ?, updated_at = ? WHERE id = ?"
      )
      .bind(match.status, homeScore, awayScore, nowIso, stored.id)
      .run();

    const predictions = await env.DB
      .prepare(
        "SELECT id, pred_home_score, pred_away_score FROM predictions WHERE match_id = ?"
      )
      .bind(stored.id)
      .all<{ id: number; pred_home_score: number; pred_away_score: number }>();

    for (const prediction of predictions.results ?? []) {
      if (homeScore === null || awayScore === null) {
        continue;
      }

      const points = calculatePoints({
        predictedHome: prediction.pred_home_score,
        predictedAway: prediction.pred_away_score,
        actualHome: homeScore,
        actualAway: awayScore
      });

      await env.DB
        .prepare("UPDATE predictions SET points = ?, updated_at = ? WHERE id = ?")
        .bind(points, nowIso, prediction.id)
        .run();
    }

    await env.DB
      .prepare(
        "DELETE FROM scores WHERE round_id = ?"
      )
      .bind(stored.round_id)
      .run();

    await env.DB
      .prepare(
        "INSERT INTO scores (round_id, participant_name, points_total, created_at, updated_at) " +
        "SELECT round_id, participant_name, SUM(points) as points_total, ?, ? " +
        "FROM predictions WHERE round_id = ? GROUP BY participant_name"
      )
      .bind(nowIso, nowIso, stored.round_id)
      .run();
  }
}
