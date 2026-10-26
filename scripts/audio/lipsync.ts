/**
 * How well the mouth follows the voice. For each lesson clip, Scribe's word
 * times are set against the syllables `alignSyllables` places on the clip,
 * and the score is the share of syllables that land inside their own word.
 * The podcast's pause lines scored 63% while the aligner was fed the line
 * without its tags and 86% on the clip text; clips with no pause score
 * about 91%. A clip well under that has a mouth on the wrong words.
 *
 * Usage:
 *   bun scripts/audio/lipsync.ts                      # every lesson clip on disk
 *   bun scripts/audio/lipsync.ts -- --only "Je to"    # clips whose text contains it
 *   bun scripts/audio/lipsync.ts -- --tags            # clips with a direction in their text
 *
 * Scribe's word times are kept in tmp/scribe-words.json, so a clip is heard
 * once. Needs ELEVENLABS_API_KEY and ffmpeg.
 */

import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";

import { audioConfigData, spokenText } from "../../src/lib/catalog/audio/core";
import { alignSyllables } from "../../src/lib/stick-figure/syllable-align";
import { slovakSyllables } from "../../src/lib/stick-figure/syllables";
import { readJsonFile, writeFileAtomic } from "../lib/json-file";
import { ROOT } from "../lib/paths";
import { decodePcm } from "./mouth-tracks";
import { AUDIO_DIR, loadManifest } from "./shared";
import { transcribeAudio } from "./stt";

const SAMPLE_RATE = 16_000;
/** A syllable this far outside Scribe's word span still counts as on it. */
const SLACK_MS = 40;
const CACHE_PATH = path.join(ROOT, "tmp", "scribe-words.json");

interface HeardWord {
  end: number;
  start: number;
  text: string;
}

const args = process.argv.slice(2).filter((arg) => arg !== "--");
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : undefined;
const tagsOnly = args.includes("--tags");

const manifest = await loadManifest();
const cache = await readJsonFile<Record<string, HeardWord[]>>(CACHE_PATH, {});
await mkdir(path.dirname(CACHE_PATH), { recursive: true });

let inWord = 0;
let total = 0;

for (const [hash, entry] of Object.entries(manifest)) {
  if (entry.kind !== "lesson") continue;
  if (only && !entry.text.includes(only)) continue;
  if (tagsOnly && !entry.text.includes("[")) continue;
  // A bark has no words to land on; its mouth is the loudness alone.
  if (entry.characterId && audioConfigData.characters?.[entry.characterId]?.sounds)
    continue;
  const file = path.join(AUDIO_DIR, "lesson", `${hash}.mp3`);
  if (!existsSync(file)) continue;

  if (!cache[hash]) {
    const heard = await transcribeAudio(file);
    cache[hash] = (heard.words ?? [])
      .filter((word) => /\p{L}/u.test(word.text))
      .map((word) => ({ end: word.end ?? 0, start: word.start ?? 0, text: word.text }));
    await writeFileAtomic(CACHE_PATH, JSON.stringify(cache));
  }

  const heard = cache[hash];
  const written = spokenText(entry.text).match(/\p{L}+/gu) ?? [];
  if (heard.length !== written.length) {
    console.log(
      `skip  ${entry.text}  (Scribe heard ${heard.length} words, not ${written.length})`,
    );
    continue;
  }

  const owner = written.flatMap((word, index) => slovakSyllables(word).map(() => index));
  const placed = alignSyllables(entry.text, await decodePcm(file), SAMPLE_RATE);
  const onWord = placed.filter((syllable, index) => {
    const word = heard[owner[index]];
    return (
      word !== undefined &&
      syllable.at >= word.start * 1000 - SLACK_MS &&
      syllable.at <= word.end * 1000 + SLACK_MS
    );
  }).length;

  inWord += onWord;
  total += owner.length;
  console.log(
    `${String(onWord).padStart(2)}/${String(owner.length).padEnd(2)} ${entry.text}`,
  );
}

if (total === 0) {
  console.log("No clips matched.");
} else {
  console.log(
    `\nSyllables on their word: ${((100 * inWord) / total).toFixed(1)}% of ${total}`,
  );
}
