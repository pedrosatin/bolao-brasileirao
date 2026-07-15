import { describe, it, expect } from "vitest";
import { withCors, parseJsonBody } from "./http";

describe("parseJsonBody", () => {
  it("should return null if request has no body", async () => {
    const req = new Request("http://localhost", { method: "GET" });
    const result = await parseJsonBody(req);
    expect(result).toBeNull();
  });

  it("should return parsed JSON if body is valid", async () => {
    const data = { key: "value" };
    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" }
    });
    const result = await parseJsonBody(req);
    expect(result).toEqual(data);
  });

  it("should return null if body is invalid JSON", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      body: "{ invalid_json: ",
      headers: { "Content-Type": "application/json" }
    });
    const result = await parseJsonBody(req);
    expect(result).toBeNull();
  });
});

describe("withCors", () => {
  it("should echo the Origin header when CORS_ORIGINS is *", () => {
    const req = new Request("http://localhost", { headers: { Origin: "https://example.com" } });
    const res = new Response("ok");
    const corsRes = withCors(req, { CORS_ORIGINS: "*" }, res);

    expect(corsRes.headers.get("Access-Control-Allow-Origin")).toBe("https://example.com");
  });

  it("should return * when CORS_ORIGINS is * and no Origin is provided", () => {
    const req = new Request("http://localhost");
    const res = new Response("ok");
    const corsRes = withCors(req, { CORS_ORIGINS: "*" }, res);

    expect(corsRes.headers.get("Access-Control-Allow-Origin")).toBe("*");
  });

  it("should return the exact origin when it is in the allowed list", () => {
    const req = new Request("http://localhost", { headers: { Origin: "https://example.com" } });
    const res = new Response("ok");
    const corsRes = withCors(req, { CORS_ORIGINS: "https://example.com,https://other.com" }, res);

    expect(corsRes.headers.get("Access-Control-Allow-Origin")).toBe("https://example.com");
  });

  it("should not return Access-Control-Allow-Origin if the origin is not allowed", () => {
    const req = new Request("http://localhost", { headers: { Origin: "https://malicious.com" } });
    const res = new Response("ok");
    const corsRes = withCors(req, { CORS_ORIGINS: "https://example.com,https://other.com" }, res);

    expect(corsRes.headers.has("Access-Control-Allow-Origin")).toBe(false);
  });
});
