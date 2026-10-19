import { describe, expect, it } from "vitest";

import { freshVariant, insertRetry, RETRY_GAP } from "./retry";

describe("insertRetry", () => {
  it("places the second try RETRY_GAP cards after the miss", () => {
    const queue = ["a", "b", "c", "d", "e", "f"];
    const next = insertRetry(queue, 0, "a2");

    expect(next.indexOf("a2")).toBe(1 + RETRY_GAP);
    expect(next).toHaveLength(queue.length + 1);
  });

  it("appends when the miss is near the end", () => {
    expect(insertRetry(["a", "b", "c"], 2, "c2")).toEqual(["a", "b", "c", "c2"]);
  });
});

describe("freshVariant", () => {
  it("skips draws that repeat the missed sentence", () => {
    const draws = ["same", "same", "new"];
    const pick = freshVariant(
      () => draws.shift()!,
      (item) => item,
      "same",
    );

    expect(pick).toBe("new");
  });

  it("gives up after a few tries rather than looping", () => {
    expect(
      freshVariant(
        () => "same",
        (item) => item,
        "same",
        3,
      ),
    ).toBe("same");
  });
});
