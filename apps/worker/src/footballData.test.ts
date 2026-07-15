import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  fetchCompetition,
  fetchScheduledMatches,
  fetchFinishedMatches,
  fetchMatchesByMatchday,
} from "./footballData";
import { Env } from "./index";

describe("footballData", () => {
  const env = {
    FOOTBALL_DATA_TOKEN: "test-token",
    FOOTBALL_DATA_BASE_URL: "https://api.football-data.org/v4",
    FOOTBALL_DATA_COMPETITION_ID: "2013",
  } as Env;

  const mockResponse = (body: any, init?: ResponseInit) => {
    return Promise.resolve(new Response(JSON.stringify(body), init));
  };

  const mockErrorResponse = (bodyText: string, status: number) => {
    return Promise.resolve(
      new Response(bodyText, {
        status,
        statusText: "Error",
      })
    );
  };

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  describe("fetchCompetition", () => {
    it("should fetch competition successfully", async () => {
      const mockData = { id: 2013, code: "BSA" };
      vi.mocked(fetch).mockResolvedValueOnce(await mockResponse(mockData));

      const result = await fetchCompetition(env);

      expect(fetch).toHaveBeenCalledWith(
        "https://api.football-data.org/v4/competitions/2013",
        {
          headers: { "X-Auth-Token": "test-token" },
        }
      );
      expect(result).toEqual(mockData);
    });

    it("should throw an error on non-ok API response", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        await mockErrorResponse("Invalid token", 401)
      );

      await expect(fetchCompetition(env)).rejects.toThrowError(
        "Football-Data API error: 401 - Invalid token"
      );
    });
  });

  describe("fetchScheduledMatches", () => {
    it("should fetch scheduled matches successfully", async () => {
      const mockData = { matches: [{ id: 1, status: "SCHEDULED" }] };
      vi.mocked(fetch).mockResolvedValueOnce(await mockResponse(mockData));

      const result = await fetchScheduledMatches(env);

      expect(fetch).toHaveBeenCalledWith(
        "https://api.football-data.org/v4/competitions/2013/matches",
        {
          headers: { "X-Auth-Token": "test-token" },
        }
      );
      expect(result).toEqual(mockData);
    });

    it("should throw an error on non-ok API response", async () => {
      vi.mocked(fetch).mockResolvedValueOnce(
        await mockErrorResponse("Rate limit exceeded", 429)
      );

      await expect(fetchScheduledMatches(env)).rejects.toThrowError(
        "Football-Data API error: 429 - Rate limit exceeded"
      );
    });
  });

  describe("fetchFinishedMatches", () => {
    it("should fetch finished matches successfully", async () => {
      const mockData = { matches: [{ id: 2, status: "FINISHED" }] };
      vi.mocked(fetch).mockResolvedValueOnce(await mockResponse(mockData));

      const result = await fetchFinishedMatches(env);

      expect(fetch).toHaveBeenCalledWith(
        "https://api.football-data.org/v4/competitions/2013/matches?status=FINISHED",
        {
          headers: { "X-Auth-Token": "test-token" },
        }
      );
      expect(result).toEqual(mockData);
    });
  });

  describe("fetchMatchesByMatchday", () => {
    it("should fetch matches by matchday successfully", async () => {
      const mockData = { matches: [{ id: 3, matchday: 10 }] };
      vi.mocked(fetch).mockResolvedValueOnce(await mockResponse(mockData));

      const result = await fetchMatchesByMatchday(env, 10);

      expect(fetch).toHaveBeenCalledWith(
        "https://api.football-data.org/v4/competitions/2013/matches?matchday=10",
        {
          headers: { "X-Auth-Token": "test-token" },
        }
      );
      expect(result).toEqual(mockData);
    });
  });

});
