import path from "node:path";
import { fileURLToPath } from "node:url";

import type { AstroIntegration } from "astro";

import { writeDictionaryExport } from "../../scripts/downloads/export";

/** Write dictionary-export.json after `astro build` for /downloads. */
export function dictionaryDownloads(): AstroIntegration {
  return {
    name: "dictionary-downloads",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const outDir = fileURLToPath(dir);
        const outputs = [
          path.join(outDir, "downloads", "dictionary-export.json"),
          path.join(process.cwd(), "static", "downloads", "dictionary-export.json"),
        ];

        const { bytes, wordCount } = await writeDictionaryExport(outputs);
        logger.info(
          `Dictionary export ${wordCount} words (${(bytes / 1024 / 1024).toFixed(2)} MB) → ${outputs.map((output) => path.relative(process.cwd(), output)).join(", ")}`,
        );
      },
    },
  };
}
