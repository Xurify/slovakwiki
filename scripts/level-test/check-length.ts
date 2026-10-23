/**
 * Listens to every Short or Long clip with speech-to-text and records whether
 * it heard the word exactly, vowel length included. A voice that says "mala"
 * for "malá" would make the task unfair, so build-bank.ts drops that pair.
 *
 *   bun scripts/level-test/check-length.ts
 *
 * Loop until it reports no new unclear clips:
 *   build-bank → audio/generate.ts --level-test-only --missing-only → check-length
 */

import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  audioHash,
  audioObjectKey,
  toR2AudioKey,
} from "../../src/lib/catalog/audio/core";
import { transcribeAudio } from "../audio/stt";
import { readJsonFile, writeFileAtomic } from "../lib/json-file";
import { ROOT } from "../lib/paths";

import { LENGTH_CHECK_PATH, loadLengthChecks } from "./spoken-check";

interface Items {
  listenLength?: { word: string }[];
}

/** Dictionary clips may live only on R2; fetch those into the local audio folder. */
async function localClip(word: string): Promise<string> {
  const hash = audioHash(word);
  const local = path.join(ROOT, "static", "audio", "lemma", `${hash}.mp3`);
  try {
    await access(local);
    return local;
  } catch {
    const baseUrl = process.env.PUBLIC_AUDIO_BASE_URL?.replace(/\/$/u, "");
    if (!baseUrl)
      throw new Error(`no local clip for ${word} and PUBLIC_AUDIO_BASE_URL is unset`);
    const response = await fetch(
      `${baseUrl}/${toR2AudioKey(audioObjectKey("lemma", hash))}`,
    );
    if (!response.ok) throw new Error(`${response.status} for the ${word} clip`);
    await mkdir(path.dirname(local), { recursive: true });
    await writeFile(local, Buffer.from(await response.arrayBuffer()));
    return local;
  }
}

async function main(): Promise<void> {
  const items = await readJsonFile<Items>(
    path.join(ROOT, "content", "level-test", "items.json"),
    {},
  );
  const checks = await loadLengthChecks();
  const queue = (items.listenLength ?? [])
    .map((item) => item.word)
    .filter((word) => !checks[word]);
  const pending = queue.length;

  await Promise.all(
    Array.from({ length: 6 }, async () => {
      for (let word = queue.shift(); word; word = queue.shift()) {
        const result = await transcribeAudio(await localClip(word), {
          provider: "elevenlabs",
        });
        const heard = result.text
          .normalize("NFC")
          .toLocaleLowerCase("sk")
          .replace(/[^\p{L}\s]/gu, "")
          .trim()
          .replace(/\s+/gu, " ");
        checks[word] = { heard, clear: heard === word };
      }
    }),
  );

  const unclear = Object.entries(checks)
    .filter(([, check]) => !check.clear)
    .map(([word, check]) => `${word} → ${check.heard}`);
  const sorted = Object.fromEntries(
    Object.entries(checks).sort(([a], [b]) => a.localeCompare(b, "sk")),
  );
  await writeFileAtomic(LENGTH_CHECK_PATH, `${JSON.stringify(sorted, null, 1)}\n`);

  console.log(`Transcribed ${pending}; heard unclearly: ${unclear.length}`);
  for (const line of unclear.sort()) console.log(`  ${line}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
