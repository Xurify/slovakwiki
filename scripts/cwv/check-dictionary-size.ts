import { brotliCompressSync } from "node:zlib";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

import { ROOT } from "../lib/paths";

/** Prefer Vercel adapter output, then Astro client copy, then legacy `dist/`. */
const STATIC_ROOTS = [
  join(ROOT, ".vercel", "output", "static"),
  join(ROOT, "dist", "client"),
  join(ROOT, "dist"),
];

const RENDER_ENTRY = join(
  ROOT,
  ".vercel",
  "output",
  "functions",
  "_render.func",
  "dist",
  "server",
  "entry.mjs",
);

const DICTIONARY_BROWSE_MAX_BYTES = 100 * 1024;
const WARN_BYTES = 80 * 1024;

type Target = {
  label: string;
  /** Path under the static root, e.g. `index.html` or `grammar/telling-time/index.html`. */
  rel: string;
  gate?: "dictionary-browse";
  /** Route is `prerender = false` — fetch real HTML from the Vercel render function. */
  ssr?: boolean;
};

const targets: Target[] = [
  { label: "/", rel: "index.html" },
  {
    label: "/dictionary",
    rel: "dictionary/index.html",
    gate: "dictionary-browse",
    ssr: true,
  },
  { label: "/dictionary/common/noun", rel: "dictionary/common/noun/index.html" },
  { label: "/dictionary/common/verb", rel: "dictionary/common/verb/index.html" },
  {
    label: "/dictionary/common/adjective",
    rel: "dictionary/common/adjective/index.html",
  },
  {
    label: "/dictionary/common/adverb",
    rel: "dictionary/common/adverb/index.html",
  },
  { label: "/grammar/telling-time", rel: "grammar/telling-time/index.html" },
  {
    label: "/lessons/everyday/days-dates-and-time",
    rel: "lessons/everyday/days-dates-and-time/index.html",
  },
  { label: "/resources", rel: "resources/index.html" },
  { label: "/downloads", rel: "downloads/index.html" },
  {
    label: "/practice/present-tense-i",
    rel: "practice/present-tense-i/index.html",
  },
];

function resolveStaticHtml(rel: string): string | null {
  for (const root of STATIC_ROOTS) {
    const path = join(root, rel);
    if (existsSync(path)) return path;
  }
  return null;
}

type RenderApp = {
  fetch: (request: Request) => Promise<Response>;
};

let renderApp: RenderApp | null | undefined;

async function getRenderApp(): Promise<RenderApp> {
  if (renderApp !== undefined) {
    if (!renderApp) {
      throw new Error(`Missing Vercel render entry at ${RENDER_ENTRY}`);
    }
    return renderApp;
  }

  if (!existsSync(RENDER_ENTRY)) {
    renderApp = null;
    throw new Error(
      `Missing Vercel render entry at ${RENDER_ENTRY}. Run \`bun run build\` first.`,
    );
  }

  const mod = (await import(pathToFileURL(RENDER_ENTRY).href)) as {
    default: RenderApp;
  };
  renderApp = mod.default;
  return renderApp;
}

async function fetchSsrHtml(pathname: string): Promise<Buffer> {
  const app = await getRenderApp();
  const response = await app.fetch(new Request(`http://localhost${pathname}`));

  if (!response.ok) {
    throw new Error(`SSR ${pathname} returned HTTP ${response.status}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

let failed = false;
const warnings: string[] = [];

const staticRootUsed = STATIC_ROOTS.find((root) => existsSync(root));
if (!staticRootUsed) {
  console.error(
    "FAIL: no build output found. Expected one of:\n" +
      STATIC_ROOTS.map((root) => `  - ${root}`).join("\n") +
      "\nRun `bun run build` first.",
  );
  process.exit(1);
}

console.log(`CWV HTML check (static root: ${staticRootUsed})`);

for (const target of targets) {
  let html: Buffer;
  let source: string;

  try {
    if (target.ssr) {
      html = await fetchSsrHtml(target.label);
      source = "ssr";
    } else {
      const path = resolveStaticHtml(target.rel);
      if (!path) {
        console.error(`FAIL: missing build output for ${target.label} (${target.rel})`);
        failed = true;
        continue;
      }
      html = readFileSync(path);
      const normalized = path.replaceAll("\\", "/");
      source = normalized.includes("/.vercel/output/static/")
        ? "vercel"
        : normalized.includes("/dist/client/")
          ? "dist/client"
          : "dist";
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`FAIL: ${target.label}: ${message}`);
    failed = true;
    continue;
  }

  const compressed = brotliCompressSync(html);
  const kb = (compressed.byteLength / 1024).toFixed(1);

  console.log(
    `${target.label}: ${kb} KB br (${html.byteLength.toLocaleString()} B raw, ${source})`,
  );

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
