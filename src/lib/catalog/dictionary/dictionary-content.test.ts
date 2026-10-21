import { describe, expect, it } from "vitest";

import { words } from "$lib/catalog/entries";
import { FREQUENCY_PUBLISH_BLOCKLIST } from "$lib/catalog/frequency/blocklist";

import rejectedTatoeba from "../../../../content/dictionary/tatoeba-rejected.json";
import { exampleContainsLemma } from "./example-lemma-match";
import reviewedLemmaMatches from "./tatoeba-lemma-exceptions.json";

/** Frames like “… to.” filled with sixty verbs gave Chujem to. and Sadám to. */
const SHORT_FRAME_LIMIT = 12;

function shortFrame(slovak: string): string | undefined {
  const tokens = slovak.trim().split(/\s+/u);
  if (tokens.length < 2 || tokens.length > 3) return undefined;
  return ["…", ...tokens.slice(1)].join(" ");
}

describe("dictionary examples", () => {
  it("keeps only Tatoeba sentences that contain their headword", () => {
    // Sentences a person checked whose inflected form the matcher cannot derive.
    const reviewed = new Set<string>(reviewedLemmaMatches);
    const problems = words.flatMap((word) =>
      word.examples
        .filter((example) => example.note === "Tatoeba" && !example.demonstrates)
        .filter(
          (example) => !exampleContainsLemma(example.slovak, word.slovak, word.category),
        )
        .map((example) => `${word.slug}#${example.tatoebaId ?? example.slovak}`)
        .filter((key) => !reviewed.has(key)),
    );
    expect(problems).toEqual([]);
  });

  it("keeps rejected Tatoeba sentences out", () => {
    const rejected = new Set(Object.keys(rejectedTatoeba).map(Number));
    const problems = words.flatMap((word) =>
      word.examples
        .filter((example) => example.tatoebaId && rejected.has(example.tatoebaId))
        .map((example) => `${word.slug}: ${example.slovak}`),
    );
    expect(problems).toEqual([]);
  });

  it("leaves blocklisted lemmas out of the dictionary", () => {
    const listed = words
      .map((word) => word.slovak)
      .filter((lemma) => FREQUENCY_PUBLISH_BLOCKLIST.has(lemma.toLocaleLowerCase("sk")));
    expect(listed).toEqual([]);
  });

  it("does not fill one short frame with many headwords", () => {
    const slugsByFrame = new Map<string, Set<string>>();
    for (const word of words) {
      for (const example of word.examples) {
        if (example.note === "Tatoeba") continue;
        const frame = shortFrame(example.slovak);
        if (!frame) continue;
        const slugs = slugsByFrame.get(frame) ?? new Set<string>();
        slugs.add(word.slug);
        slugsByFrame.set(frame, slugs);
      }
    }

    const stamped = [...slugsByFrame]
      .filter(([, slugs]) => slugs.size >= SHORT_FRAME_LIMIT)
      .map(([frame, slugs]) => `${frame} (${slugs.size} headwords)`);
    expect(stamped).toEqual([]);
  });
});
