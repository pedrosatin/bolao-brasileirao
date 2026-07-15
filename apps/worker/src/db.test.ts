import { describe, it, expect } from "vitest";
import { upsertRound } from "./db";

describe("upsertRound", () => {
  it("should successfully upsert a round and return the result", async () => {
    const mockRound = {
      id: 1,
      season: 2024,
      round_number: 5,
      cutoff_at: "2024-05-10T12:00:00Z",
      last_sync_at: "2024-05-09T12:00:00Z",
    };

    let boundParams: any[] = [];
    let preparedQuery = "";

    const mockDb = {
      prepare: (query: string) => {
        preparedQuery = query;
        return {
          bind: (...args: any[]) => {
            boundParams = args;
            return {
              first: async () => mockRound,
            };
          },
        };
      },
    } as any;

    const result = await upsertRound(
      mockDb,
      2024,
      5,
      "2024-05-10T12:00:00Z",
      "2024-05-09T12:00:00Z",
      "2024-05-09T12:05:00Z"
    );

    expect(result).toEqual(mockRound);
    expect(preparedQuery).toContain("INSERT INTO rounds");
    expect(boundParams).toEqual([
      2024,
      5,
      "2024-05-10T12:00:00Z",
      "2024-05-09T12:00:00Z",
      "2024-05-09T12:05:00Z",
      "2024-05-09T12:05:00Z",
    ]);
  });

  it("should throw an error if the database returns null", async () => {
    const mockDb = {
      prepare: () => ({
        bind: () => ({
          first: async () => null,
        }),
      }),
    } as any;

    await expect(
      upsertRound(
        mockDb,
        2024,
        5,
        "2024-05-10T12:00:00Z",
        "2024-05-09T12:00:00Z",
        "2024-05-09T12:05:00Z"
      )
    ).rejects.toThrow("Failed to upsert round");
  });
});
