/**
 * Listens to every voiced Listen and Select pseudoword with speech-to-text and
 * records which ones are heard as real Slovak ("predievča" is heard as
 * "pre dievča"). build-bank.ts keeps those out of Listen and Select.
 *
 *   bun scripts/level-test/check-spoken.ts
 *
 * Loop until it reports no new rejects:
 *   build-bank → audio/generate.ts --level-test-only --missing-only → check-spoken
 */

import path from "node:path";

import { audioHash } from "../../src/lib/catalog/audio/core";
import { foldDiacritics } from "../../src/lib/level-test/grade";
import { transcribeAudio } from "../audio/stt";
import { readJsonFile, writeFileAtomic } from "../lib/json-file";
import { ROOT } from "../lib/paths";

import { loadSnkFormCounts } from "./snk-forms";
import { SPOKEN_CHECK_PATH, loadSpokenChecks } from "./spoken-check";

/** A heard word must be this common to count as real; rarer hits are mostly typos. */
const MIN_FORM_COUNT = 20;

/** Splitting the clip into real words ("pre dievča") also counts as heard as real. */
function isHeardAsReal(word: string, heard: string, forms: ReadonlyMap<string, number>) {
  const tokens = heard.split(" ").filter(Boolean);
  if (tokens.length === 0) return false;
  if (!tokens.every((token) => (forms.get(token) ?? 0) >= MIN_FORM_COUNT)) return false;
  return tokens.length > 1 || foldDiacritics(tokens[0] ?? "") !== foldDiacritics(word);
}

interface Items {
  listenSelect: { word: string; real: boolean }[];
}

async function main(): Promise<void> {
  const items = await readJsonFile<Items>(
    path.join(ROOT, "content", "level-test", "items.json"),
    { listenSelect: [] },
  );
  const checks = await loadSpokenChecks();
  const pending = items.listenSelect
    .filter((item) => !item.real && !checks[item.word])
    .map((item) => item.word);

  const forms = await loadSnkFormCounts();
  const queue = [...pending];

  await Promise.all(
    Array.from({ length: 6 }, async () => {
      for (let word = queue.shift(); word; word = queue.shift()) {
        const clip = path.join(
          ROOT,
          "static",
          "audio",
          "lemma",
          `${audioHash(word)}.mp3`,
        );
        const result = await transcribeAudio(clip, { provider: "elevenlabs" });
        const heard = result.text
          .toLocaleLowerCase("sk")
          .replace(/[^\p{L}\s]/gu, "")
          .trim()
          .replace(/\s+/gu, " ");
        checks[word] = { heard, heardAsReal: false };
      }
    }),
  );

  const rejects: string[] = [];
  for (const [word, check] of Object.entries(checks)) {
    check.heardAsReal = isHeardAsReal(word, check.heard, forms);
    if (check.heardAsReal) rejects.push(`${word} → ${check.heard}`);
  }

  const sorted = Object.fromEntries(
    Object.entries(checks).sort(([a], [b]) => a.localeCompare(b, "sk")),
  );
  await writeFileAtomic(SPOKEN_CHECK_PATH, `${JSON.stringify(sorted, null, 1)}\n`);

  console.log(`Transcribed ${pending.length}; heard as real Slovak: ${rejects.length}`);
  for (const line of rejects.sort()) console.log(`  ${line}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
