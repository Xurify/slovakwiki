import path from "node:path";
import { fileURLToPath } from "node:url";

import type { AstroIntegration } from "astro";

import { writeSearchIndex } from "../../scripts/build-search-index";

/** Build a Pagefind index from content modules after `astro build`. */
export function pagefindSearch(): AstroIntegration {
  return {
    name: "pagefind-search",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const outDir = fileURLToPath(dir);
        const outputs = [
          path.join(outDir, "pagefind"),
          path.join(process.cwd(), "static", "pagefind"),
        ];

        const count = await writeSearchIndex(outputs);
        logger.info(
          `Pagefind indexed ${count} documents → ${outputs.map((output) => path.relative(process.cwd(), output)).join(", ")}`,
        );
      },
    },
  };
}
