// @vitest-environment node
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { appOrigin } from "./server-config";

vi.mock("server-only", () => ({}));
beforeEach(() => {
  for (const name of [
    "APP_URL",
    "VERCEL_ENV",
    "VERCEL_URL",
    "VERCEL_PROJECT_PRODUCTION_URL",
  ])
    vi.stubEnv(name, undefined);
});
afterEach(() => vi.unstubAllEnvs());

it("uses localhost by default and APP_URL for local or Docker ports", () => {
  expect(appOrigin()).toBe("http://localhost:3000");
  vi.stubEnv("APP_URL", "http://localhost:3115/");
  expect(appOrigin()).toBe("http://localhost:3115");
});
it("uses the preview URL instead of inherited APP_URL or production variables", () => {
  vi.stubEnv("VERCEL_ENV", "preview");
  vi.stubEnv("VERCEL_URL", "orbit-preview-team.vercel.app");
  vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "orbit.example");
  vi.stubEnv("APP_URL", "https://other.example");
  expect(appOrigin()).toBe("https://orbit-preview-team.vercel.app");
});
it("uses the production domain on Vercel production", () => {
  vi.stubEnv("VERCEL_ENV", "production");
  vi.stubEnv("VERCEL_URL", "orbit-deployment-team.vercel.app");
  vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "orbit.example");
  expect(appOrigin()).toBe("https://orbit.example");
});
it("falls back to the deployment URL when no production domain is supplied", () => {
  vi.stubEnv("VERCEL_ENV", "production");
  vi.stubEnv("VERCEL_URL", "orbit-deployment-team.vercel.app");
  expect(appOrigin()).toBe("https://orbit-deployment-team.vercel.app");
});
it("fails closed when Vercel production has no deployment URL", () => {
  vi.stubEnv("VERCEL_ENV", "production");
  expect(() => appOrigin()).toThrow("Vercel production URL is missing");
});
it.each([
  "https://user:pass@orbit.example",
  "https://orbit.example/path",
  "https://orbit.example?next=evil",
  "javascript:alert(1)",
])("rejects invalid explicit origin %s", (url) => {
  vi.stubEnv("APP_URL", url);
  expect(() => appOrigin()).toThrow();
});
it.each([
  "https://orbit.vercel.app",
  "orbit.vercel.app/path",
  "orbit.vercel.app?next=evil",
  "user@orbit.vercel.app",
  "orbit.vercel.app:443",
])("rejects malformed Vercel hostname %s", (host) => {
  vi.stubEnv("VERCEL_URL", host);
  expect(() => appOrigin()).toThrow();
});
