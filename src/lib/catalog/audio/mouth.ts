import path from "node:path";
import { fileURLToPath } from "node:url";

import { cachedJson } from "./cached-json";
import { loadRuntimeIndex } from "./manifest";

export interface MouthTrackEntry {
  /** `generatedAt` of the take the track was measured from. */
  g: string;
  /** Loudness, one digit 0–9 per 50 ms (see `$lib/stick-figure/mouth-track`). */
  m: string;
  /** Aligned vowel per frame, same length as `m`. */
  v?: string;
}

export type MouthTracks = Record<string, MouthTrackEntry>;

/** Same lookup order as the runtime index (see manifest.ts). */
const MOUTH_TRACK_PATHS = [
  path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../../../content/audio/mouth.json",
  ),
  path.join(process.cwd(), "content/audio/mouth.json"),
];

const readMouthTracks = cachedJson<MouthTracks>(MOUTH_TRACK_PATHS);

function loadMouthTracks(): MouthTracks {
  // Tracks are optional: without one the figure falls back to a text-timed flap.
  return readMouthTracks() ?? {};
}

/** Server-only: the clip's mouth track, unless it was measured from an older take. */
export function mouthTrackFor(hash: string): MouthTrackEntry | undefined {
  const entry = loadMouthTracks()[hash];
  if (!entry || entry.g !== loadRuntimeIndex()[hash]?.g) return undefined;
  return entry;
}
