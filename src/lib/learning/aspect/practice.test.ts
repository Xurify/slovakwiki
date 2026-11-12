import { describe, expect, it } from "vitest";

import { aspectItems } from "$lib/catalog/level-test/aspect";
import type { ChoiceExercise } from "$lib/learning/types";

import aspectPairs from "../../../../content/dictionary/aspect-pairs.json";
import { aspectLesson } from "./lesson";
import { aspectChoiceExercise, aspectItem, aspectPracticeItems } from "./practice";

function slug(form: string): string {
  return form.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

const pairByVerb = new Map<string, [string, string]>();
for (const [imperfective, perfective] of aspectPairs) {
  pairByVerb.set(imperfective!, [imperfective!, perfective!]);
  pairByVerb.set(perfective!, [imperfective!, perfective!]);
}

const mapped = aspectItems.map((item) => ({
  item,
  task: aspectChoiceExercise(item, `test-${item.id}`),
}));

describe("aspect choice cards", () => {
  it("explain only the wrong pick", () => {
    for (const { item, task } of mapped) {
      const explained = task.choices.filter((choice) => choice.whyWrong);
      expect(
        explained.map((choice) => choice.id),
        item.id,
      ).toEqual(
        task.choices.filter((choice) => choice.id !== task.answerId).map((c) => c.id),
      );
    }
  });

  it("bold the Slovak in every why line", () => {
    for (const { item, task } of mapped) {
      expect(task.feedback.why, item.id).toMatch(/\*\*[^*]+\*\*/);
    }
  });

  it("keep the correction the sentence with the answer", () => {
    for (const { item, task } of mapped) {
      const answer = task.choices.find((choice) => choice.id === task.answerId)!;
      expect(answer.label, item.id).toBe(task.feedback.correction);
      expect(answer.label, item.id).toContain(item.options[item.answer]);
    }
  });

  it("put the imperfective first, as the dictionary's aspect pairs do", () => {
    let checked = 0;
    for (const { item, task } of mapped) {
      expect(
        task.choices.map((choice) => choice.id),
        item.id,
      ).toEqual(["imperfective", "perfective"]);
      const [first, second] = item.options.map(slug);
      const pair = pairByVerb.get(first!) ?? pairByVerb.get(second!);
      if (!pair) continue;
      expect([first, second], item.id).toEqual(pair);
      checked += 1;
    }
    expect(checked).toBeGreaterThanOrEqual(5);
  });

  it("drill only the A1 and A2 items, minus the ones left out", () => {
    expect(aspectPracticeItems.length).toBeGreaterThan(20);
    expect(aspectPracticeItems.map((item) => item.id)).not.toContain(
      "grammar/aspect-este-raz-zopakovat",
    );
    for (const item of aspectPracticeItems) {
      const source = aspectItem(item.id.replace("grammar/aspect-", "cv-"));
      expect(["A1", "A2"]).toContain(source.level);
    }
  });

  it("point every lesson exercise at a card in the set", () => {
    const ids = new Set(aspectPracticeItems.map((item) => item.id));
    for (const beat of aspectLesson.beats) {
      for (const exercise of beat.exercises) {
        if (exercise.type === "personal") continue;
        expect(ids.has((exercise as ChoiceExercise).practiceItemId), exercise.id).toBe(
          true,
        );
      }
    }
  });
});
