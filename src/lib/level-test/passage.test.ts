import { describe, expect, it } from "vitest";

import { spanOfSubstring, tokenizePassage } from "./passage";

describe("tokenizePassage", () => {
  it("keeps every character so the passage can be rebuilt", () => {
    const text = "Anna mala, pretože pršalo. Áno!";
    expect(
      tokenizePassage(text)
        .map((token) => token.text)
        .join(""),
    ).toBe(text);
  });
});

describe("spanOfSubstring", () => {
  const text = "Celé leto pomáhala susedom v záhrade a venčila ich psa.";
  const tokens = tokenizePassage(text);

  it("covers exactly the words of the answer", () => {
    const span = spanOfSubstring(tokens, text, "susedom v záhrade");
    expect(span).not.toBeNull();
    const words = tokens
      .slice(span?.start, (span?.end ?? 0) + 1)
      .map((token) => token.text);
    expect(words.join("")).toBe("susedom v záhrade");
  });

  it("returns null when the answer is not in the text", () => {
    expect(spanOfSubstring(tokens, text, "v meste")).toBeNull();
  });
});
