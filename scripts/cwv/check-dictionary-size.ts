import { brotliCompressSync } from "node:zlib";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { buildWikiPageView } from "../../src/lib/content/dictionary-browse";
import { ROOT } from "../lib/paths";

const DIST = join(ROOT, "dist");
const DICTIONARY_BROWSE_MAX_BYTES = 100 * 1024;
const WARN_BYTES = 80 * 1024;

type Target = {
  label: string;
  path: string;
  gate?: "dictionary-browse";
  ssrFallback?: boolean;
};

const targets: Target[] = [
  { label: "/", path: join(DIST, "index.html") },
  {
    label: "/dictionary",
    path: join(DIST, "dictionary", "index.html"),
    gate: "dictionary-browse",
    ssrFallback: true,
  },
  {
    label: "/dictionary/common/noun",
    path: join(DIST, "dictionary", "common", "noun", "index.html"),
  },
  {
    label: "/dictionary/common/verb",
    path: join(DIST, "dictionary", "common", "verb", "index.html"),
  },
  {
    label: "/dictionary/common/adjective",
    path: join(DIST, "dictionary", "common", "adjective", "index.html"),
  },
  {
    label: "/dictionary/common/adverb",
    path: join(DIST, "dictionary", "common", "adverb", "index.html"),
  },
  {
    label: "/grammar/telling-time",
    path: join(DIST, "grammar", "telling-time", "index.html"),
  },
  {
    label: "/lessons/everyday/days-dates-and-time",
    path: join(DIST, "lessons", "everyday", "days-dates-and-time", "index.html"),
  },
  { label: "/resources", path: join(DIST, "resources", "index.html") },
  { label: "/downloads", path: join(DIST, "downloads", "index.html") },
  {
    label: "/practice/present-tense-i",
    path: join(DIST, "practice", "present-tense-i", "index.html"),
  },
];

let failed = false;
const warnings: string[] = [];

for (const target of targets) {
  let html: Buffer;

  if (!existsSync(target.path)) {
    if (target.ssrFallback) {
      const view = buildWikiPageView("all", "all", 1);
      html = Buffer.from(JSON.stringify(view));
      console.log(`${target.label}: SSR fallback (missing ${target.path})`);
    } else {
      console.error(`FAIL: missing build output at ${target.path}`);
      failed = true;
      continue;
    }
  } else {
    html = readFileSync(target.path);
  }

  const compressed = brotliCompressSync(html);
  const kb = (compressed.byteLength / 1024).toFixed(1);

  console.log(`${target.label}: ${kb} KB br (${html.byteLength.toLocaleString()} B raw)`);

  if (
    target.gate === "dictionary-browse" &&
    compressed.byteLength > DICTIONARY_BROWSE_MAX_BYTES
  ) {
    console.error(
      `FAIL: ${target.label} exceeds ${DICTIONARY_BROWSE_MAX_BYTES / 1024} KB br (${kb} KB). Browse pages must stay SSR + link nav.`,
    );
    failed = true;
  }

  if (compressed.byteLength >= WARN_BYTES) {
    warnings.push(`${target.label} (${kb} KB br)`);
  }
}

if (warnings.length > 0) {
  console.warn(
    `Warning: ${warnings.length} route(s) >= ${WARN_BYTES / 1024} KB br: ${warnings.join(", ")}`,
  );
}

if (failed) {
  process.exit(1);
}

console.log("CWV HTML size check passed.");
