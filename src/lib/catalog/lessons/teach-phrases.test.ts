import { describe, expect, it } from "vitest";
import { lessons } from "$lib/catalog/lessons";

describe("teach phrases", () => {
  // Only key phrases get clips, so a teach phrase missing from them has no play button.
  it("are all key phrases of their lesson", () => {
    const missing = lessons.flatMap((lesson) => {
      const keys = new Set(lesson.keyPhrases.map((phrase) => phrase.slovak));
      return lesson.beats.flatMap((beat) =>
        (beat.teach.phrases ?? [])
          .filter((phrase) => !keys.has(phrase.slovak))
          .map((phrase) => `${lesson.id}: ${phrase.slovak}`),
      );
    });
    expect(missing).toEqual([]);
  });
});
