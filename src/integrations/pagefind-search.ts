import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { AstroIntegration } from "astro";

import { writeSearchIndex } from "../../scripts/search/build-search-index";

function pagefindContentType(filePath: string): string {
  if (filePath.endsWith(".js")) {
    return "application/javascript";
  }

  if (filePath.endsWith(".json")) {
    return "application/json";
  }

  if (filePath.endsWith(".css")) {
    return "text/css";
  }

  return "application/octet-stream";
}

/** Build a Pagefind index from content modules after `astro build`. */
export function pagefindSearch(): AstroIntegration {
  return {
    name: "pagefind-search",
    hooks: {
      "astro:server:setup": ({ server }) => {
        const pagefindDir = path.join(process.cwd(), "static", "pagefind");

        server.middlewares.use((req, res, next) => {
          const urlPath = req.url?.split("?")[0];
          if (!urlPath?.startsWith("/pagefind/")) {
            next();
            return;
          }

          const relative = decodeURIComponent(urlPath.slice("/pagefind/".length));
          if (!relative || relative.includes("..")) {
            next();
            return;
          }

          const filePath = path.join(pagefindDir, relative);

          void stat(filePath)
            .then((info) => {
              if (!info.isFile()) {
                next();
                return;
              }

              res.statusCode = 200;
              res.setHeader("Content-Type", pagefindContentType(filePath));
              res.setHeader("Cache-Control", "no-cache");
              createReadStream(filePath).pipe(res);
            })
            .catch(() => {
              if (existsSync(filePath)) {
                next();
                return;
              }

              next();
            });
        });
      },
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
