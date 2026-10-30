import { describe, expect, it } from "vitest";

import { damagePassage, ctestGaps } from "./ctest";
import { computeResult } from "./results";
import type { ItemResponse, ProductionRecord } from "./types";

function response(
  skill: ItemResponse["skill"],
  difficulty: number,
  score: number,
): ItemResponse {
  return {
    itemId: `${skill}-${difficulty}`,
    kind: "x",
    skill,
    difficulty,
    score,
    adaptive: true,
  };
}

function written(
  score: number,
  skill: "writing" | "speaking" = "writing",
): ProductionRecord {
  return {
    id: `p${score}`,
    kind: skill === "writing" ? "writePhoto" : "speakPhoto",
    skill,
    prompt: "",
    response: "text",
    status: "scored",
    result: {
      score,
      level: "B1",
      criteria: { content: score, coherence: score, grammar: score, lexis: score },
      feedback: "",
    },
  };
}

describe("computeResult", () => {
  it("leaves unmeasured skills empty and averages the rest", () => {
    const result = computeResult(
      [response("reading", 30, 1), response("listening", 30, 0)],
      [],
    );
    expect(result.skills.writing).toBeNull();
    expect(result.skills.speaking).toBeNull();
    expect(result.skills.reading?.score).toBeGreaterThan(
      result.skills.listening?.score ?? 100,
    );
    const mean =
      ((result.skills.reading?.score ?? 0) + (result.skills.listening?.score ?? 0)) / 2;
    expect(Math.abs((result.overall?.score ?? 0) - mean)).toBeLessThanOrEqual(1);
  });

  it("uses AI scores for writing and ignores failed ones", () => {
    const failed: ProductionRecord = { ...written(90), status: "failed" };
    const result = computeResult([], [written(40), written(60), failed]);
    expect(result.skills.writing?.score).toBe(50);
    expect(result.integrated.production?.score).toBe(50);
    expect(result.integrated.comprehension).toBeNull();
  });

  it("returns no overall score when nothing was measured", () => {
    expect(computeResult([], []).overall).toBeNull();
  });
});

describe("damagePassage", () => {
  const passage =
    "Volám sa Anna. Bývam v malom meste pri rieke. Každé ráno chodím do práce autobusom. Večer rada čítam knihy. Cez víkend idem k rodičom.";

  it("keeps the first and last sentences whole", () => {
    const parts = damagePassage(passage, () => 20);
    const first = parts[0];
    const last = parts.at(-1);
    expect(typeof first === "string" && first.startsWith("Volám sa Anna.")).toBe(true);
    expect(typeof last === "string" && last.endsWith("Cez víkend idem k rodičom.")).toBe(
      true,
    );
  });

  it("cuts the larger half of every other word and skips one-letter words", () => {
    const gaps = ctestGaps(damagePassage(passage, () => 20));
    expect(gaps.length).toBeGreaterThan(3);
    for (const gap of gaps) {
      const length = [...gap.prefix].length + [...gap.missing].length;
      expect([...gap.prefix].length).toBe(Math.floor(length / 2));
      expect(length).toBeGreaterThan(1);
    }
  });

  it("rebuilds the passage when the gaps are filled", () => {
    const parts = damagePassage(passage, () => 20);
    const rebuilt = parts
      .map((part) => (typeof part === "string" ? part : part.prefix + part.missing))
      .join("");
    expect(rebuilt).toBe(passage);
  });

  it("leaves a whole word between any two cuts", () => {
    const parts = damagePassage(passage, () => 20);
    for (let index = 1; index < parts.length; index++) {
      const previous = parts[index - 1];
      if (typeof parts[index] === "string") continue;
      expect(typeof previous).toBe("string");
      expect(/\p{L}{2,}/u.test(previous as string)).toBe(true);
    }
  });
});
