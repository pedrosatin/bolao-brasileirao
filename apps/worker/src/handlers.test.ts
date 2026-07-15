import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getNextRound } from "./handlers";
import { Env } from "./index";

describe("getNextRound", () => {
  let consoleErrorSpy: any;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("should return a 500 error response if a database error occurs", async () => {
    const mockDbError = new Error("Database connection failed");

    const mockDB = {
      prepare: vi.fn().mockImplementation(() => {
        throw mockDbError;
      })
    } as any;

    const env = {
      DB: mockDB
    } as Env;

    const req = new Request("http://localhost/");
    const ctx = {} as ExecutionContext;

    const response = await getNextRound(req, env, ctx);

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({
      error: "Failed to fetch next round: Database connection failed"
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith("getNextRound error:", "Database connection failed");
  });

  it("should return a 500 error response if an unknown error occurs", async () => {
    const mockDB = {
      prepare: vi.fn().mockImplementation(() => {
        throw "String error";
      })
    } as any;

    const env = {
      DB: mockDB
    } as Env;

    const req = new Request("http://localhost/");
    const ctx = {} as ExecutionContext;

    const response = await getNextRound(req, env, ctx);

    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toEqual({
      error: "Failed to fetch next round: Unknown error"
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith("getNextRound error:", "Unknown error");
  });
});
