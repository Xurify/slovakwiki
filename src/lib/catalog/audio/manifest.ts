import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import type { AudioKind } from "./core";

export interface RuntimeIndexEntry {
  /** Clip kind (`lemma` / `example` / `lesson`). */
  k: AudioKind;
  /** ISO `generatedAt` timestamp for cache-busting. */
  g: string;
}

export type AudioRuntimeIndex = Record<string, RuntimeIndexEntry>;

/**
 * Source-relative first — avoids `process.cwd()` races under Vite SSR in dev.
 * Production builds bundle this module into `…/server/.prerender/chunks/`, where
 * the relative path points outside the repo, so the project root is the fallback.
 */
const RUNTIME_INDEX_PATHS = [
  path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../../../content/audio/runtime-index.json",
  ),
  path.join(process.cwd(), "content/audio/runtime-index.json"),
];

let cache: AudioRuntimeIndex | undefined;

/** Server-only: load the slim runtime index (hash → kind + generatedAt). */
export function loadRuntimeIndex(): AudioRuntimeIndex {
  if (cache) return cache;

  for (const candidate of RUNTIME_INDEX_PATHS) {
    try {
      cache = JSON.parse(readFileSync(candidate, "utf8")) as AudioRuntimeIndex;
      return cache;
    } catch {
      continue;
    }
  }

  // An empty index silently strips every lesson, grammar, and cloze clip from a build.
  if (import.meta.env.PROD) {
    throw new Error(
      `Audio runtime index not found at ${RUNTIME_INDEX_PATHS.join(" or ")}`,
    );
  }

  // Do not cache failures — a transient Vite SSR / HMR race would otherwise
  // pin an empty index for the whole dev server lifetime (no lesson MP3s →
  // silent autoplay + browser TTS on Listen).
  return {};
}

export function hasAudioClip(hash: string): boolean {
  return Object.hasOwn(loadRuntimeIndex(), hash);
}

export function audioClipKind(hash: string): AudioKind | undefined {
  return loadRuntimeIndex()[hash]?.k;
}

/** Last 10 digits of `generatedAt` for `?v=` cache busting. */
export function audioClipCacheBust(hash: string): string | undefined {
  const generatedAt = loadRuntimeIndex()[hash]?.g;
  if (!generatedAt) return undefined;
  const bust = generatedAt.replaceAll(/\D/g, "").slice(-10);
  return bust || undefined;
}
