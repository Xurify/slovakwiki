import { existsSync } from "node:fs";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { AstroIntegration } from "astro";

import { buildSitemapGroups } from "$lib/seo/sitemap-urls";
import { SITE_ORIGIN } from "$lib/seo/site";
import { renderSitemapIndex, renderUrlset } from "$lib/seo/sitemap-xml";

function staticOutputDirs(outDir: string): string[] {
  const client = path.join(outDir, "client");
  return existsSync(client) ? [client] : [outDir];
}

/** Write grouped sitemap XML files after `astro build`. */
export function groupedSitemap(): AstroIntegration {
  return {
    name: "grouped-sitemap",
    hooks: {
      "astro:build:done": async ({ dir, logger }) => {
        const groups = buildSitemapGroups();
        const indexXml = renderSitemapIndex(
          groups.map((group) => `${SITE_ORIGIN}/${group.filename}`),
        );
        const totalUrls = groups.reduce((sum, group) => sum + group.urls.length, 0);
        const outDir = fileURLToPath(dir);

        for (const outputDir of staticOutputDirs(outDir)) {
          await mkdir(outputDir, { recursive: true });

          for (const group of groups) {
            await writeFile(
              path.join(outputDir, group.filename),
              renderUrlset(group.urls),
              "utf8",
            );
          }

          await writeFile(path.join(outputDir, "sitemap-index.xml"), indexXml, "utf8");

          for (const legacy of ["sitemap-0.xml", "sitemap-1.xml"]) {
            const legacyPath = path.join(outputDir, legacy);
            if (existsSync(legacyPath)) {
              await unlink(legacyPath);
            }
          }
        }

        const summary = groups
          .map((group) => `${group.label} ${group.urls.length}`)
          .join(", ");

        logger.info(
          `Sitemaps ${totalUrls} URLs (${summary}) → dist/client/sitemap-index.xml`,
        );
      },
    },
  };
}
