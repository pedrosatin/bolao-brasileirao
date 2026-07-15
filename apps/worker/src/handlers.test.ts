import { describe, it, expect, vi } from "vitest";
import { getRoundById } from "./handlers";
import { Env } from "./index";

describe("getRoundById", () => {
  const mockRequest = new Request("http://localhost");
  const mockCtx = {} as ExecutionContext;

  it("returns 400 if round id is invalid", async () => {
    const env = { DB: {} as D1Database } as Env;
    const res = await getRoundById(mockRequest, env, mockCtx, { id: "invalid" });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data).toEqual({ error: "Invalid round id" });
  });

  it("returns 404 if round is not found", async () => {
    const mockDb = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null)
        })
      })
    } as unknown as D1Database;
    const env = { DB: mockDb } as Env;

    const res = await getRoundById(mockRequest, env, mockCtx, { id: "1" });
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data).toEqual({ error: "Round not found" });
  });

  it("returns round and matches if found", async () => {
    const roundData = { id: 1, season: 2024, round_number: 5, cutoff_at: "2024-05-10T12:00:00Z" };
    const matchesData = [
      {
        id: 101,
        round_id: 1,
        api_match_id: 2001,
        utc_date: "2024-05-12T16:00:00Z",
        status: "FINISHED",
        home_team: "Team A",
        away_team: "Team B",
        home_score: 2,
        away_score: 1,
        external_link: "https://example.com"
      }
    ];

    const mockDb = {
      prepare: vi.fn((query: string) => {
        const isRounds = query.includes("rounds");
        const isMatches = query.includes("matches");
        return {
          bind: vi.fn().mockReturnValue({
            first: vi.fn().mockResolvedValue(isRounds ? roundData : null),
            all: vi.fn().mockResolvedValue(isMatches ? { results: matchesData } : { results: [] })
          })
        };
      })
    } as unknown as D1Database;

    const env = { DB: mockDb } as Env;
    const res = await getRoundById(mockRequest, env, mockCtx, { id: "1" });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toEqual({
      round: {
        id: 1,
        season: 2024,
        roundNumber: 5,
        cutoffAt: "2024-05-10T12:00:00Z"
      },
      matches: [
        {
          id: 101,
          utcDate: "2024-05-12T16:00:00Z",
          status: "FINISHED",
          homeTeam: "Team A",
          awayTeam: "Team B",
          externalLink: "https://example.com",
          score: {
            home: 2,
            away: 1
          }
        }
      ]
    });
  });
});
