import { describe, expect, it } from "vitest";

import { buildDictionaryIndexSidecar } from "./browse";
import {
  buildLiveLinksFromIndex,
  dictionaryPathForLiveLink,
  liveLinkForLemma,
  resolveLiveLinkFromIndex,
} from "./live-links";
import { words } from "../dictionary/words";

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

  it("resolves particles and conjunctions including shared adverb/phrase lemmas", () => {
    const map = buildLiveLinksFromIndex(buildDictionaryIndexSidecar());

    expect(liveLinkForLemma("a", words, "conjunction")?.slug).toBe("a");
    expect(liveLinkForLemma("aj", words, "particle")?.slug).toBe("aj");
    expect(liveLinkForLemma("už", words, "particle")?.slug).toBe("uz");
    expect(liveLinkForLemma("áno", words, "particle")?.slug).toBe("ano");

    expect(resolveLiveLinkFromIndex("a", "conjunction", map)?.slug).toBe("a");
    expect(resolveLiveLinkFromIndex("aj", "particle", map)?.slug).toBe("aj");
    expect(resolveLiveLinkFromIndex("už", "particle", map)?.slug).toBe("uz");
    expect(resolveLiveLinkFromIndex("ako", "conjunction", map)?.slug).toBe("ako");
  });
});
