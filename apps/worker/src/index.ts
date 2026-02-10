import { handleRequest } from "./routes";
import { handleScheduled } from "./scheduler";

export interface Env {
  DB: D1Database;
  FOOTBALL_DATA_TOKEN: string;
  FOOTBALL_DATA_BASE_URL?: string;
  FOOTBALL_DATA_COMPETITION_ID?: string;
  DEFAULT_EXTERNAL_LINK?: string;
  CORS_ORIGINS?: string;
}

export default {
  fetch: (request: Request, env: Env, ctx: ExecutionContext) => {
    return handleRequest(request, env, ctx);
  },
  scheduled: (event: ScheduledEvent, env: Env, ctx: ExecutionContext) => {
    return handleScheduled(event, env, ctx);
  }
};
