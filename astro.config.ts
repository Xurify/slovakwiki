import svelte from "@astrojs/svelte";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

import { pagefindSearch } from "./src/integrations/pagefind-search";

export default defineConfig({
  adapter: vercel(),
  integrations: [svelte(), pagefindSearch()],
  publicDir: "./static",
  vite: {
    plugins: [tailwindcss()],
  },
});
