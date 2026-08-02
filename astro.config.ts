import svelte from "@astrojs/svelte";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  adapter: vercel(),
  integrations: [svelte()],
  publicDir: "./static",
  vite: {
    plugins: [tailwindcss()],
  },
});
