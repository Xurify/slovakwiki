import { describe, expect, it } from "vitest";
import { lessons } from "$lib/catalog/lessons";
import { practiceItems } from "$lib/catalog/practice";
import { seededShuffle } from "./answer-order";

function firstIsRight(choices: Array<{ id: string }>, right: string[]): boolean {
  return right.includes(choices[0]!.id);
}

describe("answer order", () => {
  it("is the same for the same seed", () => {
    const items = ["a", "b", "c", "d"];
    expect(seededShuffle(items, "x")).toEqual(seededShuffle(items, "x"));
    expect([...seededShuffle(items, "x")].sort()).toEqual(items);
  });

  it("does not put the right answer first in most lesson and practice choices", () => {
    const tasks = [
      ...lessons.flatMap((lesson) => lesson.beats.flatMap((beat) => beat.exercises)),
      ...practiceItems.map((item) => item.task),
    ].filter((task) => task.type === "choice" && task.choiceMode !== "pickTrap");
    const first = tasks.filter(
      (task) => task.type === "choice" && firstIsRight(task.choices, [task.answerId]),
    );
    expect(tasks.length).toBeGreaterThan(50);
    expect(first.length / tasks.length).toBeLessThan(0.5);
  });

  it("does not put the right reply first in most dialogue gates", () => {
    const gates = lessons.flatMap((lesson) =>
      lesson.scene.flatMap((turn) => (turn.sayChoices ? [turn.sayChoices] : [])),
    );
    const first = gates.filter((gate) =>
      firstIsRight(
        gate.choices,
        gate.answerIds ?? (gate.answerId ? [gate.answerId] : []),
      ),
    );
    expect(gates.length).toBeGreaterThan(20);
    expect(first.length / gates.length).toBeLessThan(0.5);
  });
});
