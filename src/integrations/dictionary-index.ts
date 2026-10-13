import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { AstroIntegration } from "astro";

import { buildDictionaryIndexSidecar } from "../lib/catalog/dictionary/browse";
import { DEV_DICTIONARY_INDEX_PATH } from "../lib/catalog/dictionary/browse-query";
import { SITE_ORIGIN } from "../lib/seo/site";
import {
  dictionaryIndexFileName,
  publishDictionaryIndex,
} from "../../scripts/dictionary/publish-index";

/**
 * Build: content-hashed index under `/_astro/`, plus R2 as the primary URL when
 * configured and usable from the browser. Dev: served from memory (restart for edits).
 */
export function dictionaryIndex(): AstroIntegration {
  let built: { entryCount: number; fileName: string; json: string } | undefined;

  return {
    name: "dictionary-index",
    hooks: {
      "astro:config:setup": async ({ command, logger, updateConfig }) => {
        let urls = [DEV_DICTIONARY_INDEX_PATH];

        if (command === "build") {
          const entries = buildDictionaryIndexSidecar();
          const json = JSON.stringify(entries);
          const fileName = dictionaryIndexFileName(json);
          built = { entryCount: entries.length, fileName, json };

          const r2Url = await publishDictionaryIndex({
            fileName,
            json,
            siteOrigin: SITE_ORIGIN,
            warn: (message) => logger.warn(message),
          });
          urls = [...(r2Url ? [r2Url] : []), `/_astro/${fileName}`];
          logger.info(`Dictionary index URLs: ${urls.join(" → ")}`);
        }

        updateConfig({
          vite: { define: { __DICTIONARY_INDEX_URLS__: JSON.stringify(urls) } },
        });
      },
      "astro:server:setup": ({ server }) => {
        let json: string | undefined;

        server.middlewares.use((req, res, next) => {
          if (req.url?.split("?")[0] !== DEV_DICTIONARY_INDEX_PATH) {
            next();
            return;
          }

          json ??= JSON.stringify(buildDictionaryIndexSidecar());
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "no-cache");
          res.end(json);
        });
      },
      "astro:build:done": async ({ dir, logger }) => {
        if (!built) return;

        const output = path.join(fileURLToPath(dir), "_astro", built.fileName);
        await mkdir(path.dirname(output), { recursive: true });
        await writeFile(output, built.json, "utf8");

        logger.info(
          `Dictionary index ${built.entryCount} entries (${(Buffer.byteLength(built.json) / 1024).toFixed(1)} KB) → ${path.relative(process.cwd(), output)}`,
        );
      },
    },
  };
}
