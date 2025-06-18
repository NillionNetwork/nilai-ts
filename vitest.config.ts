import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config({ path: ".env.test" });

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    testTimeout: 0,
    setupFiles: ["dotenv/config"],
    env: {
      DEBUG: "@nillion*",
    },
    include: ["src/**/*.{test,spec}.{js,ts}", "tests/**/*.{test,spec}.{js,ts}"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/coverage/**",
      "**/.{idea,git,cache,output,temp}/**",
    ],
    coverage: {
      provider: "v8", // or 'istanbul'
      reporter: ["text", "json-summary", "json", "html"],
      reportOnFailure: true,
      include: ["src/**/*.{js,ts}"],
      exclude: [
        "src/**/*.d.ts",
        "src/**/*.test.{js,ts}",
        "src/**/*.spec.{js,ts}",
        "**/node_modules/**",
        "**/dist/**",
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
});
