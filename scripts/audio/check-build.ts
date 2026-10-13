/**
 * Post-build guard: built lesson pages must reference lesson clips.
 *
 * Lesson audio is resolved at build time from content/audio/runtime-index.json.
 * When that index fails to load, or every hash drifts after a voice/model change,
 * the build still passes and silently ships lessons with browser TTS only.
 *
 * Usage (after `bun run build`):
 *   bun scripts/audio/check-build.ts
 */

import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { ROOT } from "../lib/paths";

/** Prefer Vercel adapter output, then Astro client copy, then legacy `dist/`. */
const STATIC_ROOTS = [
  path.join(ROOT, ".vercel", "output", "static"),
  path.join(ROOT, "dist", "client"),
  path.join(ROOT, "dist"),
];

const LESSON_CLIP = /\/audio\/lesson\/[0-9a-f]{20}\.mp3/g;

async function lessonPages(lessonsDir: string): Promise<string[]> {
  const pages: string[] = [];

  for (const track of await readdir(lessonsDir, { withFileTypes: true })) {
    if (!track.isDirectory()) continue;

    const trackDir = path.join(lessonsDir, track.name);
    for (const lesson of await readdir(trackDir, { withFileTypes: true })) {
      const page = path.join(trackDir, lesson.name, "index.html");
      if (lesson.isDirectory() && existsSync(page)) pages.push(page);
    }
  }

  return pages.sort();
}

async function main(): Promise<void> {
  const staticRoot = STATIC_ROOTS.find((root) => existsSync(path.join(root, "lessons")));
  if (!staticRoot) {
    throw new Error("No built lessons found — run `bun run build` first.");
  }

  const pages = await lessonPages(path.join(staticRoot, "lessons"));
  let total = 0;

  for (const page of pages) {
    const html = await readFile(page, "utf8");
    const clips = new Set(html.match(LESSON_CLIP)).size;
    total += clips;
    console.log(`${path.relative(staticRoot, page)}: ${clips} lesson clips`);
  }

  if (pages.length === 0 || total === 0) {
    throw new Error(
      `Built lessons reference no lesson audio (${pages.length} pages). ` +
        "Check content/audio/runtime-index.json loads at build and matches content/audio/config.json.",
    );
  }

  console.log(`Lesson audio check passed: ${total} clips across ${pages.length} pages.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
