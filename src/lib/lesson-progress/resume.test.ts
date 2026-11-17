import { describe, expect, it } from "vitest";
import { clearLessonResume, readLessonResume, writeLessonResume } from "./resume";

function memory() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    removeItem: (key: string) => void data.delete(key),
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}

describe("lesson resume", () => {
  const steps = ["a", "b", "c", "d"];

  it("comes back to the step left", () => {
    const storage = memory();
    writeLessonResume(storage, "grammar/x", { answers: {}, at: 2, stepIds: steps });
    expect(readLessonResume(storage, "grammar/x", steps)?.at).toBe(2);
  });

  it("starts fresh once the lesson's steps changed", () => {
    const storage = memory();
    writeLessonResume(storage, "grammar/x", { answers: {}, at: 2, stepIds: steps });
    expect(readLessonResume(storage, "grammar/x", ["a", "b", "e", "d"])).toBeNull();
  });

  it("forgets a lesson once cleared, and keeps the others", () => {
    const storage = memory();
    writeLessonResume(storage, "grammar/x", { answers: {}, at: 2, stepIds: steps });
    writeLessonResume(storage, "grammar/y", { answers: {}, at: 1, stepIds: steps });
    clearLessonResume(storage, "grammar/x");
    expect(readLessonResume(storage, "grammar/x", steps)).toBeNull();
    expect(readLessonResume(storage, "grammar/y", steps)?.at).toBe(1);
  });

  it("ignores what it cannot read", () => {
    const storage = memory();
    storage.setItem("slovak.wiki.lesson-resume.v1", "{not json");
    expect(readLessonResume(storage, "grammar/x", steps)).toBeNull();
  });
});
