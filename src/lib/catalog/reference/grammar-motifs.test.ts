import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { grammarEntries } from "./grammar";
import { grammarMotifId } from "./grammar-motifs";

describe("grammarMotifId", () => {
  it("points every grammar topic at a motif file that exists", () => {
    for (const topic of grammarEntries) {
      const file = path.join(
        process.cwd(),
        "static/lessons/motifs",
        `${grammarMotifId(topic.slug)}.png`,
      );
      expect(existsSync(file), `${topic.slug} → ${file}`).toBe(true);
    }
  });

  it("falls back to the book for topics without their own art", () => {
    expect(grammarMotifId("aspect")).toBe("default");
    expect(grammarMotifId("telling-time")).toBe("time");
  });
});
