import { describe, expect, it } from "vitest";

import {
  addDays,
  dayKey,
  daysBetween,
  dueFormIds,
  emptyReviewMemory,
  nextDueDay,
  readReviewMemory,
  recordAnswer,
  REVIEW_STORAGE_KEY,
  writeReviewMemory,
  type ReviewMemory,
} from "./review-memory";

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    removeItem: (key: string) => void values.delete(key),
    setItem: (key: string, value: string) => void values.set(key, value),
  };
}

describe("dayKey / addDays", () => {
  it("uses the local calendar date", () => {
    expect(dayKey(new Date(2026, 0, 5, 23, 30))).toBe("2026-01-05");
  });

  it("rolls over months and years", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
    expect(addDays("2026-12-25", 7)).toBe("2027-01-01");
  });

  it("counts whole days across a daylight-saving change", () => {
    expect(daysBetween("2026-03-28", "2026-03-30")).toBe(2);
    expect(daysBetween("2026-03-10", "2026-03-10")).toBe(0);
  });
});

describe("recordAnswer", () => {
  const today = "2026-03-10";

  it("schedules a missed form for tomorrow", () => {
    const memory = recordAnswer(emptyReviewMemory(), "ten-nom", "incorrect", today);
    expect(memory.forms["ten-nom"]).toEqual({
      seen: 1,
      missed: 1,
      step: 0,
      due: "2026-03-11",
    });
  });

  it("treats a revealed answer as a miss", () => {
    const memory = recordAnswer(emptyReviewMemory(), "ten-nom", "revealed", today);
    expect(memory.forms["ten-nom"]?.due).toBe("2026-03-11");
  });

  it("leaves a form that was never missed out of review", () => {
    const memory = recordAnswer(emptyReviewMemory(), "ten-nom", "correct", today);
    expect(memory.forms["ten-nom"]).toEqual({ seen: 1, missed: 0, step: 0 });
  });

  it("does not move a form along when it is right again before it is due", () => {
    const missed = recordAnswer(emptyReviewMemory(), "ten-nom", "incorrect", today);
    const again = recordAnswer(missed, "ten-nom", "correct", today);
    expect(again.forms["ten-nom"]).toMatchObject({ step: 0, due: "2026-03-11" });
  });

  it("widens the gap 1 → 3 → 7 → 21 days, then lets the form go", () => {
    let memory = recordAnswer(emptyReviewMemory(), "f", "incorrect", "2026-03-10");
    memory = recordAnswer(memory, "f", "correct", "2026-03-11");
    expect(memory.forms.f?.due).toBe("2026-03-14");
    memory = recordAnswer(memory, "f", "accents", "2026-03-14");
    expect(memory.forms.f?.due).toBe("2026-03-21");
    memory = recordAnswer(memory, "f", "correct", "2026-03-21");
    expect(memory.forms.f?.due).toBe("2026-04-11");
    memory = recordAnswer(memory, "f", "correct", "2026-04-11");
    expect(memory.forms.f?.due).toBeUndefined();
    expect(memory.forms.f?.seen).toBe(5);
  });

  it("starts over at one day after a miss in review", () => {
    let memory = recordAnswer(emptyReviewMemory(), "f", "incorrect", "2026-03-10");
    memory = recordAnswer(memory, "f", "correct", "2026-03-11");
    memory = recordAnswer(memory, "f", "incorrect", "2026-03-14");
    expect(memory.forms.f).toMatchObject({ missed: 2, step: 0, due: "2026-03-15" });
  });
});

describe("dueFormIds / nextDueDay", () => {
  const memory: ReviewMemory = {
    version: 1,
    forms: {
      later: { seen: 1, missed: 1, step: 0, due: "2026-03-12" },
      today: { seen: 1, missed: 1, step: 0, due: "2026-03-10" },
      overdue: { seen: 1, missed: 1, step: 1, due: "2026-03-01" },
      learned: { seen: 4, missed: 0, step: 0 },
    },
  };

  it("lists due forms, longest overdue first", () => {
    expect(dueFormIds(memory, "2026-03-10")).toEqual(["overdue", "today"]);
  });

  it("finds the soonest return", () => {
    expect(nextDueDay(memory)).toBe("2026-03-01");
    expect(nextDueDay(emptyReviewMemory())).toBeNull();
  });
});

describe("readReviewMemory / writeReviewMemory", () => {
  it("round-trips", () => {
    const storage = memoryStorage();
    const memory = recordAnswer(emptyReviewMemory(), "f", "incorrect", "2026-03-10");
    writeReviewMemory(storage, memory);
    expect(readReviewMemory(storage)).toEqual(memory);
  });

  it("drops malformed entries and unknown versions", () => {
    const storage = memoryStorage({
      [REVIEW_STORAGE_KEY]: JSON.stringify({
        version: 1,
        forms: {
          good: { seen: 1, missed: 1, step: 0, due: "2026-03-11" },
          bad: { seen: "x" },
          badDue: { seen: 1, missed: 0, step: 0, due: "soon" },
        },
      }),
    });
    expect(readReviewMemory(storage).forms).toEqual({
      good: { seen: 1, missed: 1, step: 0, due: "2026-03-11" },
      badDue: { seen: 1, missed: 0, step: 0 },
    });

    const future = memoryStorage({
      [REVIEW_STORAGE_KEY]: JSON.stringify({ version: 2, forms: {} }),
    });
    expect(readReviewMemory(future)).toEqual(emptyReviewMemory());
  });

  it("survives broken JSON", () => {
    const storage = memoryStorage({ [REVIEW_STORAGE_KEY]: "{" });
    expect(readReviewMemory(storage)).toEqual(emptyReviewMemory());
  });
});
