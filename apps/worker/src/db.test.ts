import { describe, it, expect, vi, beforeEach } from "vitest";
import { upsertMatch } from "./db";

// Use an explicit unknown to D1Database cast to satisfy TypeScript
type D1DatabaseMock = any;

describe("upsertMatch", () => {
  let mockRun: any;
  let mockBind: any;
  let mockPrepare: any;
  let mockDb: D1DatabaseMock;

  beforeEach(() => {
    mockRun = vi.fn().mockResolvedValue({ success: true });
    mockBind = vi.fn().mockReturnValue({ run: mockRun });
    mockPrepare = vi.fn().mockReturnValue({ bind: mockBind });
    mockDb = { prepare: mockPrepare } as D1DatabaseMock;
  });

  it("should execute the correct query with bound parameters", async () => {
    const input = {
      round_id: 1,
      api_match_id: 100,
      utc_date: "2023-01-01T12:00:00Z",
      status: "FINISHED",
      home_team: "Team A",
      away_team: "Team B",
      home_score: 2,
      away_score: 1,
      external_link: "https://example.com"
    };
    const nowIso = "2023-01-02T12:00:00Z";

    await upsertMatch(mockDb, input, nowIso);

    expect(mockPrepare).toHaveBeenCalledTimes(1);
    expect(mockPrepare.mock.calls[0][0]).toContain("INSERT INTO matches");
    expect(mockPrepare.mock.calls[0][0]).toContain("ON CONFLICT(api_match_id) DO UPDATE");

    expect(mockBind).toHaveBeenCalledTimes(1);
    expect(mockBind).toHaveBeenCalledWith(
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
    );

    expect(mockRun).toHaveBeenCalledTimes(1);
  });

  it("should propagate errors if the database operation fails", async () => {
    mockRun.mockRejectedValue(new Error("Database error"));

    const input = {
      round_id: 1,
      api_match_id: 100,
      utc_date: "2023-01-01T12:00:00Z",
      status: "FINISHED",
      home_team: "Team A",
      away_team: "Team B",
      home_score: 2,
      away_score: 1,
      external_link: "https://example.com"
    };

    await expect(upsertMatch(mockDb, input, "2023-01-02T12:00:00Z")).rejects.toThrow("Database error");
  });
});
