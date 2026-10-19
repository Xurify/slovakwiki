import { describe, expect, it } from "vitest";

import { drawWithNewSentence, insertRetryCard, CARDS_BEFORE_RETRY } from "./retry";

describe("insertRetryCard", () => {
  it("places the retry CARDS_BEFORE_RETRY cards after the miss", () => {
    const queue = ["a", "b", "c", "d", "e", "f"];
    const next = insertRetryCard(queue, 0, "a2");

    expect(next.indexOf("a2")).toBe(1 + CARDS_BEFORE_RETRY);
    expect(next).toHaveLength(queue.length + 1);
  });

  it("appends when the miss is near the end", () => {
    expect(insertRetryCard(["a", "b", "c"], 2, "c2")).toEqual(["a", "b", "c", "c2"]);
  });
});

describe("drawWithNewSentence", () => {
  it("skips draws that repeat the missed sentence", () => {
    const draws = ["same", "same", "new"];
    const pick = drawWithNewSentence(
      () => draws.shift()!,
      (item) => item,
      "same",
    );

    expect(pick).toBe("new");
  });

  it("gives up after a few tries rather than looping", () => {
    expect(
      drawWithNewSentence(
        () => "same",
        (item) => item,
        "same",
        3,
      ),
    ).toBe("same");
  });
});
