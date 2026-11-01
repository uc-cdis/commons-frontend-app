import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// unit tests for the app's own server code; @gen3/chat has its own suite
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: { include: ["src/**/*.test.ts"], environment: "node" },
});
