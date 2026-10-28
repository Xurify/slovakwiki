import { fileURLToPath, URL } from "node:url";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Compiles .svelte files, so a test can render a component with svelte/server.
  plugins: [svelte()],
  test: {
    include: ["src/**/*.test.ts", "scripts/**/*.test.ts"],
    // Most of a run is importing the catalog and dictionary content again in every file
    // (import 115 s vs tests 12 s); sharing modules per worker cut the suite from 55 s to 20 s.
    isolate: false,
  },
  resolve: {
    alias: {
      $lib: fileURLToPath(new URL("./src/lib", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
