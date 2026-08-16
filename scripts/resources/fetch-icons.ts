/**
 * Fetch favicons for /resources entries into static/icons/resources/.
 * Lookup-shared brands (zoznam, narecie) write to static/icons/lookups/ instead.
 * Run after adding or changing learningResources hrefs: bun scripts/resources/fetch-icons.ts
 */

import { copyFile, mkdir, writeFile } from "node:fs/promises";

import {
  learningResources,
  lookupSharedResourceIds,
} from "../../src/lib/catalog/resources/catalog";

const outDir = "static/icons/resources";
const lookupsDir = "static/icons/lookups";

/** Direct favicon URLs when Google's proxy returns junk or 404. */
const iconSourceOverrides: Partial<Record<string, string>> = {
  "e-slovak": "https://www.e-slovak.sk/theme/image.php/lambda/theme/1784017558/favicon",
  "mondly-slovak": "https://app.mondly.com/favicon.ico",
  "memrise-slovak": "https://www.memrise.com/favicon.ico",
  "simply-put-slovak": "https://www.google.com/s2/favicons?domain=atspace.com&sz=128",
  "learn101-slovak": "https://learn101.org/images/logo2.png",
  zoznam: "https://cdn.magazines.zoznam.sk/zoznam/img/favicon/apple-touch-icon.png",
  narecie: "https://narecie.sk/images/favicon.png",
};

const youtubeResourceIds = new Set([
  "learn-slovak-stories-podcast",
  "yt-slovakforu",
  "yt-learn-slovak-stories",
  "yt-slovak-girl-tami",
  "yt-linguarte",
  "yt-learn-slovak",
  "yt-memories-adrift",
]);

await mkdir(outDir, { recursive: true });
await mkdir(lookupsDir, { recursive: true });

let ok = 0;
let failed = 0;

for (const resource of learningResources) {
  if (youtubeResourceIds.has(resource.id)) {
    continue;
  }

  const sharedLookup = lookupSharedResourceIds.has(resource.id);
  const outPath = sharedLookup
    ? `${lookupsDir}/${resource.id}.png`
    : `${outDir}/${resource.id}.png`;
  const overrideUrl = iconSourceOverrides[resource.id];

  try {
    const bytes = overrideUrl
      ? await fetchIconBytes(overrideUrl)
      : await fetchIconBytes(
          `https://www.google.com/s2/favicons?domain=${encodeURIComponent(new URL(resource.href).hostname)}&sz=128`,
        );

    if (!bytes) {
      const fallbackDomain = fallbackDomainFor(
        resource.id,
        new URL(resource.href).hostname,
      );
      if (!fallbackDomain) {
        console.warn(`skip ${resource.id}: no icon`);
        failed += 1;
        continue;
      }

      const fallbackBytes = await fetchIconBytes(
        `https://www.google.com/s2/favicons?domain=${encodeURIComponent(fallbackDomain)}&sz=128`,
      );
      if (!fallbackBytes) {
        console.warn(`skip ${resource.id}: fallback failed (${fallbackDomain})`);
        failed += 1;
        continue;
      }

      await writeFile(outPath, fallbackBytes);
      console.log(`ok ${resource.id} (${fallbackDomain}, fallback)`);
      ok += 1;
      continue;
    }

    await writeFile(outPath, bytes);
    console.log(`ok ${resource.id}${sharedLookup ? " (lookups)" : ""}`);
    ok += 1;
  } catch (error) {
    console.warn(
      `skip ${resource.id}: ${error instanceof Error ? error.message : error}`,
    );
    failed += 1;
  }
}

const youtubeBytes = await fetchIconBytes(
  "https://www.youtube.com/s/desktop/014dbbed/img/favicon_32x32.png",
);
if (youtubeBytes) {
  await writeFile(`${outDir}/youtube.png`, youtubeBytes);
  console.log("ok youtube.png (shared)");
} else {
  console.warn("skip youtube.png");
  failed += 1;
}

const slovakeEuPath = `${outDir}/slovake-eu.png`;
const slovakeGrammarPath = `${outDir}/slovake-grammar.png`;
try {
  await copyFile(slovakeEuPath, slovakeGrammarPath);
  console.log("ok slovake-grammar.png (copy of slovake-eu)");
} catch {
  console.warn("skip slovake-grammar copy");
}

console.log(`done: ${ok} saved, ${failed} failed`);

if (failed > 0) {
  process.exitCode = 1;
}

async function fetchIconBytes(url: string): Promise<Buffer | null> {
  const response = await fetch(url);
  if (!response.ok) {
    return null;
  }

  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.byteLength < 32) {
    return null;
  }

  return bytes;
}

function fallbackDomainFor(resourceId: string, domain: string): string | undefined {
  if (resourceId === "mondly-slovak" && domain === "www.mondly.com") {
    return "app.mondly.com";
  }
  if (resourceId === "memrise-slovak" && domain === "community-courses.memrise.com") {
    return "memrise.com";
  }
  if (resourceId === "simply-put-slovak" && domain === "simplyput.atspace.com") {
    return "atspace.com";
  }
  return undefined;
}
