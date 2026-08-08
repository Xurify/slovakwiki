import { brotliCompressSync } from "node:zlib";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { buildWikiPageView } from "../../src/lib/content/dictionary-browse";
import { ROOT } from "../lib/paths";

const DIST = join(ROOT, "dist");
const MAX_BYTES = 100 * 1024;

const targets = [
  { label: "/dictionary", path: join(DIST, "dictionary", "index.html"), ssr: true },
  {
    label: "/dictionary/common/noun",
    path: join(DIST, "dictionary", "common", "noun", "index.html"),
  },
  { label: "/downloads", path: join(DIST, "downloads", "index.html") },
];

let failed = false;

for (const target of targets) {
  let html: Buffer;

  if (!existsSync(target.path)) {
    if ("ssr" in target && target.ssr) {
      const view = buildWikiPageView("all", "all", 1);
      html = Buffer.from(JSON.stringify(view));
      console.log(`${target.label}: SSR route (checking default browse island payload)`);
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
  const limitKb = (MAX_BYTES / 1024).toFixed(0);

  console.log(`${target.label}: ${kb} KB br (${html.byteLength.toLocaleString()} B raw)`);

  if (target.label === "/dictionary" && compressed.byteLength > MAX_BYTES) {
    console.error(
      `FAIL: ${target.label} exceeds ${limitKb} KB br (${kb} KB). Browse pages must stay SSR + link nav.`,
    );
    failed = true;
  }
}

if (failed) {
  process.exit(1);
}

console.log("CWV HTML size check passed.");
