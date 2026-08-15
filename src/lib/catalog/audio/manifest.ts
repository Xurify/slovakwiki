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

/** Repo-relative from this file — avoids `process.cwd()` races under Vite SSR. */
const RUNTIME_INDEX_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../../content/audio/runtime-index.json",
);

let cache: AudioRuntimeIndex | undefined;

/** Server-only: load the slim runtime index (hash → kind + generatedAt). */
export function loadRuntimeIndex(): AudioRuntimeIndex {
  if (cache) return cache;

  try {
    const raw = readFileSync(RUNTIME_INDEX_PATH, "utf8");
    cache = JSON.parse(raw) as AudioRuntimeIndex;
    return cache;
  } catch {
    // Do not cache failures — a transient Vite SSR / HMR race would otherwise
    // pin an empty index for the whole dev server lifetime (no lesson MP3s →
    // silent autoplay + browser TTS on Listen).
    return {};
  }
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
