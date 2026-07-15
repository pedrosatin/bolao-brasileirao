import { describe, it, expect } from "vitest";
import { withCors } from "./http";

describe("withCors", () => {
  it("should return * when CORS_ORIGINS is *", () => {
    const req = new Request("http://localhost", { headers: { Origin: "https://example.com" } });
    const res = new Response("ok");
    const corsRes = withCors(req, { CORS_ORIGINS: "*" }, res);

    expect(corsRes.headers.get("Access-Control-Allow-Origin")).toBe("*");
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
