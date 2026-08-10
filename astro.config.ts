import svelte from "@astrojs/svelte";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

import { dictionaryDownloads } from "./src/integrations/dictionary-downloads";
import { dictionaryIndex } from "./src/integrations/dictionary-index";
import { frequencyStatic } from "./src/integrations/frequency-static";
import { groupedSitemap } from "./src/integrations/grouped-sitemap";
import { pagefindSearch } from "./src/integrations/pagefind-search";
import { SITE_ORIGIN } from "./src/lib/seo/site";

export default defineConfig({
  adapter: vercel(),
  site: SITE_ORIGIN,
  experimental: {
    incrementalBuild: true,
  },
  integrations: [
    svelte(),
    groupedSitemap(),
    pagefindSearch(),
    dictionaryDownloads(),
    dictionaryIndex(),
    frequencyStatic(),
  ],
  publicDir: "./static",
  vite: {
    plugins: [tailwindcss()],
    server: {
      watch: {
        ignored: [
          "**/.vercel/**",
          "**/dist/**",
          "**/static/audio/**",
          "**/static/images/**",
          "**/static/pagefind/**",
          "**/static/downloads/**",
          "**/tmp/**",
          "**/content/audio/manifest.json",
          "**/content/audio/runtime-index.json",
        ],
      },
    },
  },
});
