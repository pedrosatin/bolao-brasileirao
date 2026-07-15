import { describe, it, expect, vi } from "vitest";
import { getRoundHistory } from "./handlers";
import { Env } from "./index";

function createMockEnv(dbResults: any[] = []): Env {
  const allMock = vi.fn().mockResolvedValue({ results: dbResults });
  const prepareMock = vi.fn().mockReturnValue({ all: allMock });

  return {
    DB: {
      prepare: prepareMock,
    } as unknown as D1Database,
  } as Env;
}

describe("getRoundHistory", () => {
  it("should fetch active and inactive rounds when includeActive=true", async () => {
    const mockRounds = [
      { id: 1, season: 2024, round_number: 1, cutoff_at: "2024-01-01" },
      { id: 2, season: 2024, round_number: 2, cutoff_at: "2024-01-08" }
    ];
    const env = createMockEnv(mockRounds);
    const req = new Request("http://localhost/api/rounds?includeActive=true");

    const response = await getRoundHistory(req, env, {} as ExecutionContext);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ rounds: mockRounds });

    expect(env.DB.prepare).toHaveBeenCalledWith(
      "SELECT r.id, r.season, r.round_number, r.cutoff_at FROM rounds r ORDER BY r.season DESC, r.round_number DESC"
    );
  });

  it("should fetch only completed rounds when includeActive is missing or false", async () => {
    const mockRounds = [
      { id: 1, season: 2024, round_number: 1, cutoff_at: "2024-01-01" }
    ];
    const env = createMockEnv(mockRounds);
    const req = new Request("http://localhost/api/rounds");

    const response = await getRoundHistory(req, env, {} as ExecutionContext);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ rounds: mockRounds });

    const expectedQuery = "SELECT r.id, r.season, r.round_number, r.cutoff_at " +
    "FROM rounds r " +
    "WHERE r.id IN (" +
    "  SELECT round_id FROM matches GROUP BY round_id HAVING SUM(CASE WHEN status != 'FINISHED' THEN 1 ELSE 0 END) = 0" +
    ") " +
    "ORDER BY r.season DESC, r.round_number DESC";

    expect(env.DB.prepare).toHaveBeenCalledWith(expectedQuery);
  });

  it("should handle null results gracefully", async () => {
    const allMock = vi.fn().mockResolvedValue({ results: null });
    const prepareMock = vi.fn().mockReturnValue({ all: allMock });
    const env = { DB: { prepare: prepareMock } as unknown as D1Database } as Env;

    const req = new Request("http://localhost/api/rounds");

    const response = await getRoundHistory(req, env, {} as ExecutionContext);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ rounds: [] });
  });
});
