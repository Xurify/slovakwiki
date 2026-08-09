import { readFileSync } from "node:fs";
import path from "node:path";

import type { AudioKind } from "./audio-core";

export interface RuntimeIndexEntry {
  /** Clip kind (`lemma` / `example` / `lesson`). */
  k: AudioKind;
  /** ISO `generatedAt` timestamp for cache-busting. */
  g: string;
}

export type AudioRuntimeIndex = Record<string, RuntimeIndexEntry>;

const RUNTIME_INDEX_PATH = path.join(
  process.cwd(),
  "content",
  "audio",
  "runtime-index.json",
);

let cache: AudioRuntimeIndex | undefined;

/** Server-only: load the slim runtime index (hash → kind + generatedAt). */
export function loadRuntimeIndex(): AudioRuntimeIndex {
  if (!cache) {
    try {
      const raw = readFileSync(RUNTIME_INDEX_PATH, "utf8");
      cache = JSON.parse(raw) as AudioRuntimeIndex;
    } catch {
      cache = {};
    }
  }
  return cache;
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
