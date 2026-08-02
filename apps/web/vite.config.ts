import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    server: {
      port: 3000,
    },
    resolve: {
      tsconfigPaths: true,
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    plugins: [
      tailwindcss(),
      cloudflare({ viteEnvironment: { name: "ssr" } }),
      tanstackStart({
        prerender: {
          enabled: true,
          crawlLinks: true,
        },
        sitemap: {
          enabled: true,
          host: env.VITE_SITE_URL || "http://localhost:3000",
        },
      }),
      react(),
      visualizer({ filename: "output/stats.html", gzipSize: true }),
    ],
  };
});
