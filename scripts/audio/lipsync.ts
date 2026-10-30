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
 *   bun scripts/audio/lipsync.ts -- --episode past-tense  # one podcast episode's lines
 *
 * Scribe's word times are kept in tmp/scribe-words.json, so a take is heard
 * once. Needs ELEVENLABS_API_KEY.
 */

import { existsSync } from "node:fs";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";

import {
  audioConfigData,
  normalizeAudioText,
  spokenText,
} from "../../src/lib/catalog/audio/core";
import { episodeBySlug, episodeLines } from "../../src/lib/catalog/listening";
import { alignSyllables } from "../../src/lib/stick-figure/syllable-align";
import { slovakSyllables } from "../../src/lib/stick-figure/syllables";
import { readJsonFile, writeFileAtomic } from "../lib/json-file";
import { ROOT } from "../lib/paths";
import { decodeMp3 } from "./decode-mp3";
import { AUDIO_DIR, loadManifest, mapPool } from "./shared";
import { transcribeAudio } from "./stt";

/** A syllable this far outside Scribe's word span still counts as on it. */
const SLACK_MS = 40;
const CACHE_PATH = path.join(ROOT, "tmp", "scribe-words.json");
const SCRIBE_CONCURRENCY = 4;

interface HeardWord {
  end: number;
  start: number;
  text: string;
}

const args = process.argv.slice(2).filter((arg) => arg !== "--");
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : undefined;
const tagsOnly = args.includes("--tags");
const slug = args.includes("--episode") ? args[args.indexOf("--episode") + 1] : undefined;
const episode = slug ? episodeBySlug.get(slug) : undefined;
if (slug && !episode) throw new Error(`no episode ${slug}`);
const episodeTexts = episode
  ? new Set(
      episodeLines(episode).map((line) =>
        normalizeAudioText(line.audio?.transcript ?? line.slovak),
      ),
    )
  : undefined;

const clipPath = (hash: string) => path.join(AUDIO_DIR, "lesson", `${hash}.mp3`);

const manifest = await loadManifest();
const cache = await readJsonFile<Record<string, HeardWord[]>>(CACHE_PATH, {});
await mkdir(path.dirname(CACHE_PATH), { recursive: true });

const clips = Object.entries(manifest).filter(([hash, entry]) => {
  if (entry.kind !== "lesson") return false;
  if (only && !entry.text.includes(only)) return false;
  if (tagsOnly && !entry.text.includes("[")) return false;
  if (episodeTexts && !episodeTexts.has(entry.text)) return false;
  // A bark has no words to land on; its mouth is the loudness alone.
  if (entry.characterId && audioConfigData.characters?.[entry.characterId]?.sounds)
    return false;
  return existsSync(clipPath(hash));
});

// A retake keeps the clip's hash, so the take's own time is part of the key.
const keyOf = (hash: string, generatedAt: string) => `${hash}@${generatedAt}`;

// Scribe takes about 2.5 s a clip, so a cold cache is heard several at a time.
const unheard = clips.filter(([hash, entry]) => !cache[keyOf(hash, entry.generatedAt)]);
// One write at a time: writeFileAtomic's temp file is named per process, not per call.
let saved = Promise.resolve();
await mapPool(unheard, SCRIBE_CONCURRENCY, async ([hash, entry]) => {
  const heard = await transcribeAudio(clipPath(hash));
  cache[keyOf(hash, entry.generatedAt)] = (heard.words ?? [])
    .filter((word) => /\p{L}/u.test(word.text))
    .map((word) => ({ end: word.end ?? 0, start: word.start ?? 0, text: word.text }));
  saved = saved.then(() => writeFileAtomic(CACHE_PATH, JSON.stringify(cache)));
  await saved;
});

let inWord = 0;
let total = 0;

for (const [hash, entry] of clips) {
  const file = clipPath(hash);
  const key = keyOf(hash, entry.generatedAt);

  const heard = cache[key];
  const written = spokenText(entry.text).match(/\p{L}+/gu) ?? [];
  if (heard.length !== written.length) {
    console.log(
      `skip  ${entry.text}  (Scribe heard ${heard.length} words, not ${written.length})`,
    );
    continue;
  }

  const owner = written.flatMap((word, index) => slovakSyllables(word).map(() => index));
  const { sampleRate, samples } = await decodeMp3(await readFile(file));
  const placed = alignSyllables(entry.text, samples, sampleRate);
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
