export type RoundRow = {
  id: number;
  season: number;
  round_number: number;
  cutoff_at: string;
  last_sync_at: string | null;
};

export type MatchRow = {
  id: number;
  round_id: number;
  api_match_id: number;
  utc_date: string;
  status: string;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  external_link: string | null;
};

export async function getRoundBySeasonNumber(
  db: D1Database,
  season: number,
  roundNumber: number
): Promise<RoundRow | null> {
  const result = await db
    .prepare(
      "SELECT id, season, round_number, cutoff_at, last_sync_at FROM rounds WHERE season = ? AND round_number = ?"
    )
    .bind(season, roundNumber)
    .first<RoundRow>();

  return result ?? null;
}

export async function upsertRound(
  db: D1Database,
  season: number,
  roundNumber: number,
  cutoffAt: string,
  lastSyncAt: string,
  nowIso: string
): Promise<RoundRow> {
  const result = await db
    .prepare(
      "INSERT INTO rounds (season, round_number, cutoff_at, last_sync_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?) " +
      "ON CONFLICT(season, round_number) DO UPDATE SET cutoff_at = excluded.cutoff_at, last_sync_at = excluded.last_sync_at, updated_at = excluded.updated_at " +
      "RETURNING id, season, round_number, cutoff_at, last_sync_at"
    )
    .bind(season, roundNumber, cutoffAt, lastSyncAt, nowIso, nowIso)
    .first<RoundRow>();

  if (!result) {
    throw new Error("Failed to upsert round");
  }

  return result;
}

export async function upsertMatch(db: D1Database, input: Omit<MatchRow, "id">, nowIso: string) {
  await db
    .prepare(
      "INSERT INTO matches (round_id, api_match_id, utc_date, status, home_team, away_team, home_score, away_score, external_link, created_at, updated_at) " +
      "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) " +
      "ON CONFLICT(api_match_id) DO UPDATE SET " +
      "round_id = excluded.round_id, utc_date = excluded.utc_date, status = excluded.status, home_team = excluded.home_team, " +
      "away_team = excluded.away_team, home_score = excluded.home_score, away_score = excluded.away_score, external_link = excluded.external_link, updated_at = excluded.updated_at"
    )
    .bind(
      input.round_id,
      input.api_match_id,
      input.utc_date,
      input.status,
      input.home_team,
      input.away_team,
      input.home_score,
      input.away_score,
      input.external_link,
      nowIso,
      nowIso
    )
    .run();
}

export async function getMatchesByRoundId(db: D1Database, roundId: number): Promise<MatchRow[]> {
  const result = await db
    .prepare(
      "SELECT id, round_id, api_match_id, utc_date, status, home_team, away_team, home_score, away_score, external_link FROM matches WHERE round_id = ? ORDER BY utc_date ASC"
    )
    .bind(roundId)
    .all<MatchRow>();

  return result.results ?? [];
}
