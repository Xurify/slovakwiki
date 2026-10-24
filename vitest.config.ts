import { fileURLToPath, URL } from "node:url";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Compiles .svelte files, so a test can render a component with svelte/server.
  plugins: [svelte()],
  test: {
    include: ["src/**/*.test.ts", "scripts/**/*.test.ts"],
  },
  resolve: {
    alias: {
      $lib: fileURLToPath(new URL("./src/lib", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
