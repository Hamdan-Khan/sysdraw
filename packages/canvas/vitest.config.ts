import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    root: __dirname,
    test: {
      environment: "jsdom",
      include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
      setupFiles: ["src/tests/setup.ts"],
      coverage: {
        provider: "v8",
        include: ["src/**/*.{js,jsx,ts,tsx}"],
        exclude: [
          "src/tests/**",
          "src/components/ui/**",
          "src/**/types.ts",
          "src/index.ts",
        ],
        reporter: ["text", "json-summary", "json"],
        reportOnFailure: true,
      },
    },
  }),
);
