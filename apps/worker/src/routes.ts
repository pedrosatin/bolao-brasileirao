import { Env } from "./index";
import { jsonResponse, errorResponse, withCors, parseJsonBody } from "./http";
import {
  getNextRound,
  getRoundById,
  getRoundHistory,
  getRoundPredictions,
  recalculateRoundScores,
  createPredictions,
  generateSubmissionToken,
  adminDeletePredictionsByName,
  adminSyncFinishedMatches,
  getRoundRanking,
  getGlobalRanking
} from "./handlers";

type Handler = (
  request: Request,
  env: Env,
  ctx: ExecutionContext,
  params: Record<string, string>
) => Promise<Response>;

type Route = {
  method: string;
  pattern: URLPattern;
  handler: Handler;
};

const routes: Route[] = [
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/" }),
    handler: async () =>
      jsonResponse({
        name: "bolao-brasileirao-api",
        status: "ok",
        endpoints: [
          "/rounds/next",
          "/rounds/history",
          "/rounds/:id",
          "/predictions",
          "/rankings/round/:id",
          "/rankings/global"
        ]
      })
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/health" }),
    handler: async () => jsonResponse({ status: "ok" })
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/rounds/next" }),
    handler: (request, env, ctx) => getNextRound(request, env, ctx)
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/rounds/history" }),
    handler: (request, env, ctx) => getRoundHistory(request, env, ctx)
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/rounds/:id" }),
    handler: (request, env, ctx, params) => getRoundById(request, env, ctx, params)
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/rounds/:id/predictions" }),
    handler: (request, env, ctx, params) =>
      getRoundPredictions(request, env, ctx, params)
  },
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/rounds/:id/recalculate" }),
    handler: (request, env, ctx, params) =>
      recalculateRoundScores(request, env, ctx, params)
  },
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/predictions" }),
    handler: async (request, env, ctx) => {
      const body = await parseJsonBody(request);
      return createPredictions(request, env, ctx, body);
    }
  },
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/admin/rounds/:id/submission-token" }),
    handler: (request, env, ctx, params) => generateSubmissionToken(request, env, ctx, params)
  },
  {
    method: "DELETE",
    pattern: new URLPattern({ pathname: "/admin/rounds/:id/predictions/:name" }),
    handler: (request, env, ctx, params) =>
      adminDeletePredictionsByName(request, env, ctx, params)
  },
  {
    method: "POST",
    pattern: new URLPattern({ pathname: "/admin/sync-finished" }),
    handler: (request, env, ctx, params) => adminSyncFinishedMatches(request, env, ctx, params)
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/rankings/round/:id" }),
    handler: (request, env, ctx, params) => getRoundRanking(request, env, ctx, params)
  },
  {
    method: "GET",
    pattern: new URLPattern({ pathname: "/rankings/global" }),
    handler: (request, env, ctx) => getGlobalRanking(request, env, ctx)
  }
];

export async function handleRequest(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const url = new URL(request.url);

  if (request.method === "OPTIONS") {
    const requestOrigin = request.headers.get("Origin");
    const preflight = withCors(request, env, new Response(null, { status: 204 }));
    const allowOrigin = preflight.headers.get("Access-Control-Allow-Origin");

    if (requestOrigin && !allowOrigin) {
      return withCors(request, env, errorResponse("CORS origin not allowed", 403));
    }

    return preflight;
  }

  for (const route of routes) {
    if (route.method !== request.method) {
      continue;
    }

    const match = route.pattern.exec({ pathname: url.pathname });
    if (!match) {
      continue;
    }

    const params = match.pathname.groups ?? {};
    const response = await route.handler(request, env, ctx, params);
    return withCors(request, env, response);
  }

  return withCors(request, env, errorResponse("Not Found", 404));
}

export { jsonResponse };
