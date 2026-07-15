import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleScheduled } from "./scheduler";
import * as handlers from "./handlers";
import { Env } from "./index";

vi.mock("./handlers", () => ({
  syncFinishedMatchesAndScores: vi.fn(),
}));

describe("handleScheduled", () => {
  let env: Env;
  let ctx: ExecutionContext;
  let event: ScheduledEvent;

  beforeEach(() => {
    env = {} as Env;
    ctx = {
      waitUntil: vi.fn(),
      passThroughOnException: vi.fn(),
    } as unknown as ExecutionContext;
    event = {
      cron: "* * * * *",
      type: "scheduled",
      scheduledTime: 1234567890,
    } as ScheduledEvent;
    vi.clearAllMocks();
  });

  it("should call syncFinishedMatchesAndScores and pass it to ctx.waitUntil", async () => {
    const mockPromise = Promise.resolve();
    vi.mocked(handlers.syncFinishedMatchesAndScores).mockReturnValue(mockPromise);

    await handleScheduled(event, env, ctx);

    expect(handlers.syncFinishedMatchesAndScores).toHaveBeenCalledWith(env);
    expect(ctx.waitUntil).toHaveBeenCalledWith(mockPromise);
  });
});
