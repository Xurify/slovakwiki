import svelte from "@astrojs/svelte";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

import { audioDevFallback } from "./src/integrations/audio-dev-fallback";
import { dictionaryDownloads } from "./src/integrations/dictionary-downloads";
import { dictionaryIndex } from "./src/integrations/dictionary-index";
import { frequencyStatic } from "./src/integrations/frequency-static";
import { groupedSitemap } from "./src/integrations/grouped-sitemap";
import { onDemandRoutes } from "./src/integrations/on-demand-routes";
import { pagefindSearch } from "./src/integrations/pagefind-search";
import { SITE_ORIGIN } from "./src/lib/seo/site";

// Every retained Vercel deployment counts toward Deployment Storage, and the ~7k
// prerendered dictionary pages are ~285 MB of each one. Previews render them on
// request instead; production still prerenders everything.
const renderDictionaryOnDemand = process.env.VERCEL_ENV === "preview";

export default defineConfig({
  adapter: vercel({
    // On-demand dictionary pages read the audio index from disk at request time.
    includeFiles: renderDictionaryOnDemand ? ["content/audio/runtime-index.json"] : [],
  }),
  site: SITE_ORIGIN,
  experimental: {
    incrementalBuild: true,
  },
  integrations: [
    svelte(),
    audioDevFallback(),
    groupedSitemap(),
    pagefindSearch(),
    dictionaryDownloads(),
    dictionaryIndex(),
    frequencyStatic(),
    onDemandRoutes(renderDictionaryOnDemand ? ["src/pages/dictionary/[slug].astro"] : []),
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
