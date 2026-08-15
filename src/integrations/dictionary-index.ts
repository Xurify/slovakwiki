import path from "node:path";
import { fileURLToPath } from "node:url";

import type { AstroIntegration } from "astro";

import { DICTIONARY_BROWSE_INDEX_REL } from "../lib/catalog/dictionary/browse-query";
import { writeDictionaryIndex } from "../../scripts/dictionary/export-index";

/** Write dictionary-browse.json after build for cross-filter fallback. */
export function dictionaryIndex(): AstroIntegration {
  return {
    name: "dictionary-index",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const outDir = fileURLToPath(dir);
        const outputs = [
          path.join(outDir, DICTIONARY_BROWSE_INDEX_REL),
          path.join(process.cwd(), "static", DICTIONARY_BROWSE_INDEX_REL),
        ];

        const { bytes, entryCount } = await writeDictionaryIndex(outputs);

        logger.info(
          `Dictionary index ${entryCount} entries (${(bytes / 1024).toFixed(1)} KB) → static/${DICTIONARY_BROWSE_INDEX_REL}`,
        );
      },
    },
  };
}
