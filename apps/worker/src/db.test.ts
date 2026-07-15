import { describe, it, expect, vi } from 'vitest';
import {
  getLatestRound,
  getRoundBySeasonNumber,
  upsertRound,
  upsertMatch,
  getMatchesByRoundId,
  upsertSubmissionToken,
  getSubmissionTokenByRoundId,
  deletePredictionsByRoundAndName
} from './db';
import type { D1Database } from '@cloudflare/workers-types';

function createMockDb(overrides: { first?: any; all?: any; run?: any } = {}) {
  const statementMock = {
    bind: vi.fn().mockReturnThis(),
    first: vi.fn().mockResolvedValue(overrides.first !== undefined ? overrides.first : null),
    all: vi.fn().mockResolvedValue(overrides.all !== undefined ? overrides.all : { results: [] }),
    run: vi.fn().mockResolvedValue(overrides.run !== undefined ? overrides.run : { success: true, meta: { changes: 0 } }),
  };

  const dbMock = {
    prepare: vi.fn().mockReturnValue(statementMock),
  };

  return { db: dbMock as unknown as D1Database, statementMock };
}

describe('db.ts', () => {
  describe('getLatestRound', () => {
    it('returns the latest round when found', async () => {
      const mockRow = { id: 1, season: 2023, round_number: 1, cutoff_at: '2023-01-01', last_sync_at: null };
      const { db, statementMock } = createMockDb({ first: mockRow });

      const result = await getLatestRound(db);

      expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining("SELECT id, season, round_number, cutoff_at, last_sync_at FROM rounds ORDER BY season DESC, round_number DESC LIMIT 1"));
      expect(statementMock.first).toHaveBeenCalled();
      expect(result).toEqual(mockRow);
    });

    it('returns null when no round is found', async () => {
      const { db } = createMockDb({ first: null });
      const result = await getLatestRound(db);
      expect(result).toBeNull();
    });
  });

  describe('getRoundBySeasonNumber', () => {
    it('returns the round when found', async () => {
      const mockRow = { id: 1, season: 2023, round_number: 1, cutoff_at: '2023-01-01', last_sync_at: null };
      const { db, statementMock } = createMockDb({ first: mockRow });

      const result = await getRoundBySeasonNumber(db, 2023, 1);

      expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining("SELECT id, season, round_number, cutoff_at, last_sync_at FROM rounds WHERE season = ? AND round_number = ?"));
      expect(statementMock.bind).toHaveBeenCalledWith(2023, 1);
      expect(statementMock.first).toHaveBeenCalled();
      expect(result).toEqual(mockRow);
    });

    it('returns null when no round is found', async () => {
      const { db } = createMockDb({ first: null });
      const result = await getRoundBySeasonNumber(db, 2023, 1);
      expect(result).toBeNull();
    });
  });

  describe('upsertRound', () => {
    it('returns the upserted round', async () => {
      const mockRow = { id: 1, season: 2023, round_number: 1, cutoff_at: '2023-01-01', last_sync_at: null };
      const { db, statementMock } = createMockDb({ first: mockRow });

      const result = await upsertRound(db, 2023, 1, '2023-01-01', '2023-01-02', '2023-01-03');

      expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO rounds"));
      expect(statementMock.bind).toHaveBeenCalledWith(2023, 1, '2023-01-01', '2023-01-02', '2023-01-03', '2023-01-03');
      expect(statementMock.first).toHaveBeenCalled();
      expect(result).toEqual(mockRow);
    });

    it('throws an error if no result is returned', async () => {
      const { db } = createMockDb({ first: null });

      await expect(upsertRound(db, 2023, 1, '2023-01-01', '2023-01-02', '2023-01-03'))
        .rejects.toThrow("Failed to upsert round");
    });
  });

  describe('upsertMatch', () => {
    it('runs the upsert query with bound parameters', async () => {
      const { db, statementMock } = createMockDb();

      const input = {
        round_id: 1,
        api_match_id: 123,
        utc_date: '2023-01-01',
        status: 'FINISHED',
        home_team: 'Team A',
        away_team: 'Team B',
        home_score: 2,
        away_score: 1,
        external_link: 'link'
      };

      await upsertMatch(db, input, 'now');

      expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO matches"));
      expect(statementMock.bind).toHaveBeenCalledWith(
        1, 123, '2023-01-01', 'FINISHED', 'Team A', 'Team B', 2, 1, 'link', 'now', 'now'
      );
      expect(statementMock.run).toHaveBeenCalled();
    });
  });

  describe('getMatchesByRoundId', () => {
    it('returns an array of matches', async () => {
      const mockMatches = [{ id: 1, home_team: 'A' }, { id: 2, home_team: 'B' }];
      const { db, statementMock } = createMockDb({ all: { results: mockMatches } });

      const result = await getMatchesByRoundId(db, 1);

      expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining("SELECT id, round_id, api_match_id"));
      expect(statementMock.bind).toHaveBeenCalledWith(1);
      expect(statementMock.all).toHaveBeenCalled();
      expect(result).toEqual(mockMatches);
    });

    it('returns empty array when results is undefined', async () => {
      const { db } = createMockDb({ all: { results: undefined } });
      const result = await getMatchesByRoundId(db, 1);
      expect(result).toEqual([]);
    });
  });

  describe('upsertSubmissionToken', () => {
    it('runs the upsert query with bound parameters', async () => {
      const { db, statementMock } = createMockDb();

      await upsertSubmissionToken(db, { roundId: 1, tokenHash: 'hash', expiresAt: 'expires' }, 'now');

      expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO submission_tokens"));
      expect(statementMock.bind).toHaveBeenCalledWith(1, 'hash', 'expires', 'now', 'now');
      expect(statementMock.run).toHaveBeenCalled();
    });
  });

  describe('getSubmissionTokenByRoundId', () => {
    it('returns the token when found', async () => {
      const mockRow = { round_id: 1, token_hash: 'hash', expires_at: 'expires' };
      const { db, statementMock } = createMockDb({ first: mockRow });

      const result = await getSubmissionTokenByRoundId(db, 1);

      expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining("SELECT round_id, token_hash, expires_at FROM submission_tokens WHERE round_id = ?"));
      expect(statementMock.bind).toHaveBeenCalledWith(1);
      expect(statementMock.first).toHaveBeenCalled();
      expect(result).toEqual(mockRow);
    });

    it('returns null when no token is found', async () => {
      const { db } = createMockDb({ first: null });
      const result = await getSubmissionTokenByRoundId(db, 1);
      expect(result).toBeNull();
    });
  });

  describe('deletePredictionsByRoundAndName', () => {
    it('returns the number of deleted rows', async () => {
      const runMock = vi.fn()
        .mockResolvedValueOnce({ meta: { changes: 3 } }) // deletePredictionsResult
        .mockResolvedValueOnce({ meta: { changes: 1 } }); // deleteScoreResult

      const statementMock = {
        bind: vi.fn().mockReturnThis(),
        run: runMock
      };

      const dbMock = {
        prepare: vi.fn().mockReturnValue(statementMock)
      };

      const result = await deletePredictionsByRoundAndName(dbMock as unknown as D1Database, 1, 'John Doe');

      expect(dbMock.prepare).toHaveBeenCalledWith("DELETE FROM predictions WHERE round_id = ? AND participant_name = ?");
      expect(dbMock.prepare).toHaveBeenCalledWith("DELETE FROM scores WHERE round_id = ? AND participant_name = ?");
      expect(statementMock.bind).toHaveBeenNthCalledWith(1, 1, 'John Doe');
      expect(statementMock.bind).toHaveBeenNthCalledWith(2, 1, 'John Doe');
      expect(runMock).toHaveBeenCalledTimes(2);

      expect(result).toEqual({ deletedPredictions: 3, deletedScoreRows: 1 });
    });

    it('returns 0 when changes is undefined', async () => {
      const runMock = vi.fn().mockResolvedValue({ meta: {} });
      const statementMock = { bind: vi.fn().mockReturnThis(), run: runMock };
      const dbMock = { prepare: vi.fn().mockReturnValue(statementMock) };

      const result = await deletePredictionsByRoundAndName(dbMock as unknown as D1Database, 1, 'John Doe');

      expect(result).toEqual({ deletedPredictions: 0, deletedScoreRows: 0 });
    });
  });
});
