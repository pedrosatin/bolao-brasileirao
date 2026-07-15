import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchCompetition } from "./footballData";
import { Env } from "./index";

describe("fetchCompetition", () => {
  const mockEnv: Env = {
    FOOTBALL_DATA_BASE_URL: "https://api.test.com",
    FOOTBALL_DATA_COMPETITION_ID: "9999",
    FOOTBALL_DATA_TOKEN: "test-token",
    DB: {} as any,
    CORS_ORIGINS: "*",
    CRON_SECRET: "secret",
  };

  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should return parsed JSON on a successful response", async () => {
    const mockData = { id: 9999, code: "TEST" };
    vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify(mockData), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    }));

    const result = await fetchCompetition(mockEnv);
    expect(result).toEqual(mockData);

    expect(fetch).toHaveBeenCalledWith("https://api.test.com/competitions/9999", {
      headers: { "X-Auth-Token": "test-token" }
    });
  });

  it("should throw an error with details when response is not ok", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response("Forbidden access", {
      status: 403
    }));

    await expect(fetchCompetition(mockEnv)).rejects.toThrow(
      "Football-Data API error: 403 - Forbidden access"
    );
  });

  it("should throw an error without details when response is not ok and body is empty", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, {
      status: 500
    }));

    await expect(fetchCompetition(mockEnv)).rejects.toThrow(
      "Football-Data API error: 500"
    );
  });
});
