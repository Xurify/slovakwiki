import { describe, expect, it } from "vitest";

import { caseTopics } from "../../src/lib/catalog/entries";
import { normalizeAudioText } from "../../src/lib/catalog/audio/core";
import { collectDictionaryAudioTargets } from "./shared";

describe("case page audio", () => {
  it("collects every sentence shown on a case page", () => {
    const texts = new Set(collectDictionaryAudioTargets().map((target) => target.text));
    const missing = caseTopics.flatMap((topic) =>
      topic.examples
        .map((example) => normalizeAudioText(example.slovak))
        .filter((slovak) => slovak && !texts.has(slovak)),
    );

    expect(missing).toEqual([]);
  });
});
