import { describe, expect, it } from "vitest";

import { buildDictionaryIndexSidecar } from "./dictionary-browse";
import {
  buildLiveLinksFromIndex,
  dictionaryPathForLiveLink,
  liveLinkForLemma,
  resolveLiveLinkFromIndex,
} from "./dictionary-common-links";
import { words } from "./data";

describe("dictionary common links", () => {
  it("resolves POS-sibling lemmas to canonical dictionary paths", () => {
    const link = liveLinkForLemma("málo", words, "adverb");
    expect(link).toEqual({
      english: expect.any(String),
      slug: "malo",
      hash: "adverb",
    });
    expect(dictionaryPathForLiveLink(link!)).toBe("/dictionary/malo#adverb");
  });

  it("resolves index rows by lemma and frequency part of speech", () => {
    const map = buildLiveLinksFromIndex(buildDictionaryIndexSidecar());
    const link = resolveLiveLinkFromIndex("málo", "adverb", map);

    expect(link?.slug).toBe("malo");
    expect(link?.hash).toBe("adverb");
    expect(dictionaryPathForLiveLink(link!)).toBe("/dictionary/malo#adverb");
    expect(resolveLiveLinkFromIndex("malo-adv", "adverb", map)).toBeUndefined();
  });
});
