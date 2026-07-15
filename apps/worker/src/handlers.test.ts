import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getNextRound } from './handlers';
import * as db from './db';
import * as footballData from './footballData';

// Mock dependencies
vi.mock('./db');
vi.mock('./footballData');

describe('getNextRound', () => {
  const req = new Request('http://localhost');
  const env = { DB: {} as D1Database } as any;
  const ctx = {} as ExecutionContext;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-05-13T12:00:00.000Z')); // Monday
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('Valid DB cache returns immediately', async () => {
    // 5 days ago
    const lastSyncAt = new Date('2024-05-08T12:00:00.000Z').toISOString();
    // Future cutoff
    const cutoffAt = new Date('2024-05-14T20:00:00.000Z').toISOString();

    const mockRound = {
      id: 1,
      season: 2024,
      round_number: 5,
      cutoff_at: cutoffAt,
      last_sync_at: lastSyncAt,
    };

    const mockMatches = [
      {
        id: 101,
        utc_date: '2024-05-15T20:00:00Z',
        status: 'SCHEDULED',
        home_team: 'Team A',
        away_team: 'Team B',
        external_link: null
      }
    ];

    vi.mocked(db.getLatestRound).mockResolvedValue(mockRound);
    vi.mocked(db.getMatchesByRoundId).mockResolvedValue(mockMatches as any);

    const res = await getNextRound(req, env, ctx);
    expect(res.status).toBe(200);
    const data = await res.json() as any;

    expect(data).toEqual({
      round: {
        id: 1,
        season: 2024,
        roundNumber: 5,
        cutoffAt: cutoffAt
      },
      matches: [
        {
          id: 101,
          utcDate: '2024-05-15T20:00:00Z',
          status: 'SCHEDULED',
          homeTeam: 'Team A',
          awayTeam: 'Team B',
          externalLink: null
        }
      ]
    });

    expect(footballData.fetchCompetition).not.toHaveBeenCalled();
    expect(footballData.fetchScheduledMatches).not.toHaveBeenCalled();
  });

  it('Cutoff passed advances to next round', async () => {
    // 5 days ago
    const lastSyncAt = new Date('2024-05-08T12:00:00.000Z').toISOString();
    // Past cutoff
    const cutoffAt = new Date('2024-05-12T20:00:00.000Z').toISOString();

    const mockRound = {
      id: 1,
      season: 2024,
      round_number: 5,
      cutoff_at: cutoffAt,
      last_sync_at: lastSyncAt,
    };

    // First call returns matches for the old round
    vi.mocked(db.getLatestRound).mockResolvedValue(mockRound);
    vi.mocked(db.getMatchesByRoundId).mockImplementation((_db, roundId) => {
        if (roundId === 1) return Promise.resolve([{ id: 101 }] as any);
        if (roundId === 2) return Promise.resolve([{ id: 201 }] as any);
        return Promise.resolve([]);
    });

    // Mock API response for round_number + 1 (6)
    vi.mocked(footballData.fetchMatchesByMatchday).mockResolvedValue({
      matches: [
        {
          id: 201,
          utcDate: '2024-05-20T20:00:00Z',
          status: 'SCHEDULED',
          matchday: 6,
          homeTeam: { name: 'Team C' },
          awayTeam: { name: 'Team D' },
          score: { fullTime: { home: null, away: null } }
        }
      ]
    } as any);

    vi.mocked(db.upsertRound).mockResolvedValue({
      id: 2,
      season: 2024,
      round_number: 6,
      cutoff_at: '2024-05-14T20:00:00.000Z',
      last_sync_at: new Date('2024-05-13T12:00:00.000Z').toISOString()
    });

    vi.mocked(db.upsertMatch).mockResolvedValue();

    const res = await getNextRound(req, env, ctx);
    expect(res.status).toBe(200);
    const data = await res.json() as any;

    expect(footballData.fetchMatchesByMatchday).toHaveBeenCalledWith(env, 6);
    expect(db.upsertRound).toHaveBeenCalled();
    expect(db.upsertMatch).toHaveBeenCalled();

    expect(data).toHaveProperty('round');
    expect(data.round.roundNumber).toBe(6);
    expect(data.matches).toHaveLength(1);
  });

  it('No cache uses competition API', async () => {
    vi.mocked(db.getLatestRound).mockResolvedValue(null);

    vi.mocked(footballData.fetchCompetition).mockResolvedValue({
      currentSeason: {
        currentMatchday: 10,
        startDate: '2024-01-01'
      }
    } as any);

    vi.mocked(footballData.fetchMatchesByMatchday).mockResolvedValue({
      matches: [
        {
          id: 301,
          utcDate: '2024-05-20T20:00:00Z',
          status: 'SCHEDULED',
          matchday: 10,
          homeTeam: { name: 'Team E' },
          awayTeam: { name: 'Team F' },
          score: { fullTime: { home: null, away: null } }
        }
      ]
    } as any);

    vi.mocked(db.upsertRound).mockResolvedValue({
      id: 3,
      season: 2024,
      round_number: 10,
      cutoff_at: '2024-05-14T20:00:00.000Z',
      last_sync_at: new Date('2024-05-13T12:00:00.000Z').toISOString()
    });

    vi.mocked(db.getMatchesByRoundId).mockResolvedValue([
      { id: 301, utc_date: '2024-05-20T20:00:00Z', status: 'SCHEDULED', home_team: 'Team E', away_team: 'Team F', external_link: null } as any
    ]);

    const res = await getNextRound(req, env, ctx);
    expect(res.status).toBe(200);
    const data = await res.json() as any;

    expect(footballData.fetchCompetition).toHaveBeenCalled();
    expect(footballData.fetchMatchesByMatchday).toHaveBeenCalledWith(env, 10);
    expect(db.upsertRound).toHaveBeenCalled();

    expect(data.round.roundNumber).toBe(10);
    expect(data.matches).toHaveLength(1);
  });

  it('No current matchday scans scheduled matches', async () => {
    vi.mocked(db.getLatestRound).mockResolvedValue(null);

    vi.mocked(footballData.fetchCompetition).mockResolvedValue({
      currentSeason: {
        startDate: '2024-01-01'
        // no currentMatchday
      }
    } as any);

    vi.mocked(footballData.fetchScheduledMatches).mockResolvedValue({
      matches: [
        {
          id: 401,
          matchday: 15,
          utcDate: '2024-05-20T20:00:00Z',
          status: 'SCHEDULED',
          homeTeam: { name: 'Team G' },
          awayTeam: { name: 'Team H' },
          score: { fullTime: { home: null, away: null } }
        },
        {
          id: 402,
          matchday: 16,
          utcDate: '2024-05-27T20:00:00Z',
          status: 'SCHEDULED',
          homeTeam: { name: 'Team I' },
          awayTeam: { name: 'Team J' },
          score: { fullTime: { home: null, away: null } }
        }
      ]
    } as any);

    vi.mocked(db.upsertRound).mockResolvedValue({
      id: 4,
      season: 2024,
      round_number: 15,
      cutoff_at: '2024-05-14T20:00:00.000Z',
      last_sync_at: new Date('2024-05-13T12:00:00.000Z').toISOString()
    });

    vi.mocked(db.getMatchesByRoundId).mockResolvedValue([
      { id: 401, utc_date: '2024-05-20T20:00:00Z', status: 'SCHEDULED', home_team: 'Team G', away_team: 'Team H', external_link: null } as any
    ]);

    const res = await getNextRound(req, env, ctx);
    expect(res.status).toBe(200);
    const data = await res.json() as any;

    expect(footballData.fetchScheduledMatches).toHaveBeenCalled();
    expect(db.upsertRound).toHaveBeenCalledWith(
      expect.anything(),
      2024,
      15, // minimum matchday in future
      expect.any(String),
      expect.any(String),
      expect.any(String)
    );
    expect(data.round.roundNumber).toBe(15);
    expect(data.matches).toHaveLength(1); // Only matchday 15
    expect(data.matches[0].id).toBe(401);
  });

  it('Error handling', async () => {
    vi.mocked(db.getLatestRound).mockRejectedValue(new Error('Database explosion'));

    const res = await getNextRound(req, env, ctx);
    expect(res.status).toBe(500);

    const data = await res.json();
    expect(data).toEqual({
      error: 'Failed to fetch next round: Database explosion'
    });
  });
});
