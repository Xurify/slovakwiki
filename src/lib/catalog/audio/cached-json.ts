import { readFileSync, statSync } from "node:fs";

/**
 * Reads the first readable file of `paths` once and keeps it. In dev the file is
 * read again when it changes: a server outlives `scripts/audio/generate.ts`, and
 * a stale index leaves a clip made after the server started without a src, so
 * Listen plays that line in silence until the server is restarted.
 */
export function cachedJson<T>(paths: string[]): () => T | undefined {
  let cache: { value: T; path: string; mtimeMs: number } | undefined;

  return () => {
    if (cache && !(import.meta.env.DEV && modified(cache.path) !== cache.mtimeMs)) {
      return cache.value;
    }

    for (const candidate of paths) {
      try {
        const mtimeMs = modified(candidate);
        const value = JSON.parse(readFileSync(candidate, "utf8")) as T;
        cache = { value, path: candidate, mtimeMs };
        return value;
      } catch {
        continue;
      }
    }

    return undefined;
  };
}

function modified(file: string): number {
  try {
    return statSync(file).mtimeMs;
  } catch {
    return 0;
  }
}
