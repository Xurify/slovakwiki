/**
 * Measure mouth tracks for lesson clips → content/audio/mouth.json.
 * `generate.ts` already does this after it writes lesson clips; run this to
 * backfill, after pulling new takes, or with `--force` after changing the
 * track format.
 *
 * Usage:
 *   bun scripts/audio/mouth.ts               # new, retaken, or incomplete clips
 *   bun scripts/audio/mouth.ts -- --force    # every lesson clip
 *
 * Reads static/audio/lesson/{hash}.mp3, else PUBLIC_AUDIO_BASE_URL. Needs ffmpeg.
 */

import { formatMouthTrackReport, updateMouthTracks } from "./mouth-tracks";
import { parseArgs } from "./shared";

const { concurrency, force } = parseArgs(process.argv.slice(2));
const report = await updateMouthTracks({ concurrency, force });

console.log(formatMouthTrackReport(report));
if (report.failed > 0) process.exitCode = 1;
