import path from "node:path";
import { fileURLToPath } from "node:url";

import type { AstroIntegration } from "astro";

import { writeDictionaryIndex } from "../../scripts/dictionary/export-index";

/** Write dictionary/index.json after build for cross-filter fallback. */
export function dictionaryIndex(): AstroIntegration {
  return {
    name: "dictionary-index",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const outDir = fileURLToPath(dir);
        const outputs = [
          path.join(outDir, "dictionary", "index.json"),
          path.join(process.cwd(), "static", "dictionary", "index.json"),
        ];

        const { bytes, entryCount } = await writeDictionaryIndex(outputs);

        logger.info(
          `Dictionary index ${entryCount} entries (${(bytes / 1024).toFixed(1)} KB) → static/dictionary/index.json`,
        );
      },
    },
  };
}
