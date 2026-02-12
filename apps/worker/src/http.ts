type CorsEnv = {
  CORS_ORIGINS?: string;
};

function parseAllowedOrigins(value?: string): string[] {
  if (!value) {
    return [];
  }

  const origins = value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return origins.length > 0 ? origins : [];
}

function resolveCorsOrigin(requestOrigin: string | null, env: CorsEnv): string | null {
  const allowed = parseAllowedOrigins(env.CORS_ORIGINS);
  if (allowed.includes("*")) {
    return "*";
  }

  if (!requestOrigin) {
    return null;
  }

  return allowed.includes(requestOrigin) ? requestOrigin : null;
}

export function withCors(request: Request, env: CorsEnv, response: Response): Response {
  const requestOrigin = request.headers.get("Origin");
  const allowOrigin = resolveCorsOrigin(requestOrigin, env);

  const newHeaders = new Headers(response.headers);
  newHeaders.set("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  newHeaders.set("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Admin-Token");
  newHeaders.set("Vary", "Origin");

  if (allowOrigin) {
    newHeaders.set("Access-Control-Allow-Origin", allowOrigin);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

export function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

export async function parseJsonBody(request: Request): Promise<unknown> {
  if (!request.body) {
    return null;
  }
  try {
    return await request.json();
  } catch {
    return null;
  }
}
