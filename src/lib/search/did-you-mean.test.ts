import { describe, expect, it } from "vitest";

import { editDistance, suggestSpelling, type SpellingCandidate } from "./did-you-mean";

function candidate(text: string, frequencyRank?: number): SpellingCandidate {
  return {
    text,
    normalized: text.normalize("NFD").replace(/\p{Diacritic}/gu, ""),
    ...(frequencyRank !== undefined ? { frequencyRank } : {}),
  };
}

describe("editDistance", () => {
  it("counts an adjacent swap as one edit", () => {
    expect(editDistance("tohot", "tohto", 2)).toBe(1);
    expect(editDistance("kniha", "knhia", 2)).toBe(1);
  });

  it("stops past the limit", () => {
    expect(editDistance("abcdef", "uvwxyz", 1)).toBe(2);
    expect(editDistance("a", "abcd", 1)).toBe(2);
  });
});

describe("suggestSpelling", () => {
  const words = [candidate("tohto", 50), candidate("toho", 40), candidate("kniha", 300)];

  it("prefers a same-length fix, then the more common word", () => {
    expect(suggestSpelling("tohot", words)?.text).toBe("tohto");
    expect(suggestSpelling("knhia", words)?.text).toBe("kniha");
  });

  it("returns null for known words, short queries and phrases", () => {
    expect(suggestSpelling("toho", words)).toBeNull();
    expect(suggestSpelling("to", words)).toBeNull();
    expect(suggestSpelling("tohot kniha", words)).toBeNull();
  });
});
