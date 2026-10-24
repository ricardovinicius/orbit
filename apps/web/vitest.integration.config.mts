import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["integration/**/*.test.ts"],
    testTimeout: 20000,
    hookTimeout: 20000,
  },
});
