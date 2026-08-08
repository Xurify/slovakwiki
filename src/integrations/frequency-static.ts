import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { AstroIntegration } from "astro";

const FREQUENCY_FILES = [
  "verbs.json",
  "nouns.json",
  "adjectives.json",
  "adverbs.json",
] as const;

/** Copy committed frequency lists into static/ for client fetch on common-word pages. */
export function frequencyStatic(): AstroIntegration {
  return {
    name: "frequency-static",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const sourceDir = path.join(process.cwd(), "content", "frequency");
        const distDir = fileURLToPath(dir);
        const targets = [
          path.join(process.cwd(), "static", "frequency"),
          path.join(distDir, "frequency"),
        ];

        for (const target of targets) {
          await mkdir(target, { recursive: true });

          for (const file of FREQUENCY_FILES) {
            await copyFile(path.join(sourceDir, file), path.join(target, file));
          }
        }

        logger.info(
          `Frequency lists (${FREQUENCY_FILES.join(", ")}) → static/frequency/`,
        );
      },
    },
  };
}
