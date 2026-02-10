import { Env } from "./index";
import { syncFinishedMatchesAndScores } from "./handlers";

// Scheduled job to refresh finished matches and update points.
export async function handleScheduled(
  _event: ScheduledEvent,
  env: Env,
  ctx: ExecutionContext
): Promise<void> {
  ctx.waitUntil(syncFinishedMatchesAndScores(env));
}
