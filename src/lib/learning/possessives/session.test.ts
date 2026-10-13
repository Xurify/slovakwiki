import { describe, expect, it } from "vitest";

import type { PracticeTask } from "$lib/learning/types";
import {
  POSSESSIVE_KINDS,
  POSSESSIVES_SESSION_SIZE,
  buildPossessivesSession,
  isPossessiveKind,
  materializePossessiveItem,
  possessivesPracticeItems,
  seededRng,
} from "./session";

const SEEDS = Array.from({ length: 200 }, (_, index) => index + 1);

function everyTask(): Array<{ kind: string; task: PracticeTask }> {
  return POSSESSIVE_KINDS.flatMap((kind) =>
    SEEDS.map((seed) => ({
      kind,
      task: materializePossessiveItem(kind, seededRng(seed)).task,
    })),
  );
}

describe("learning/possessives/session", () => {
  it("builds a 13-item session that opens on agreement and never repeats a kind", () => {
    const session = buildPossessivesSession(seededRng(7));

    expect(session).toHaveLength(POSSESSIVES_SESSION_SIZE);
    expect(session[0]?.id).toBe("grammar/possessive-agreement");
    expect(new Set(session.map((item) => item.id)).size).toBe(POSSESSIVES_SESSION_SIZE);
  });

  it("repeats a seeded session exactly, so SSR and hydration agree", () => {
    const first = buildPossessivesSession(seededRng(1));
    const second = buildPossessivesSession(seededRng(1));

    expect(second).toEqual(first);
  });

  it("publishes one catalog stub per kind", () => {
    expect(possessivesPracticeItems.map((item) => item.id)).toEqual(POSSESSIVE_KINDS);
    for (const item of possessivesPracticeItems) {
      expect(isPossessiveKind(item.id)).toBe(true);
      expect(item.task.practiceItemId).toBe(item.id);
    }
  });

  it("keeps every generated choice answerable and every distractor explained", () => {
    for (const { kind, task } of everyTask()) {
      if (task.type !== "choice") continue;

      const labels = task.choices.map((choice) => choice.label);
      expect(new Set(labels).size, `${kind} duplicate labels: ${labels}`).toBe(
        labels.length,
      );
      expect(task.choices.some((choice) => choice.id === task.answerId)).toBe(true);

      for (const choice of task.choices) {
        if (choice.id === task.answerId) continue;
        expect(choice.whyWrong, `${kind} ${choice.id}`).toBeTruthy();
      }
    }
  });

  it("keeps cloze, build, and typed tasks well formed", () => {
    for (const { kind, task } of everyTask()) {
      expect(task.feedback.why, kind).toContain("**");

      if (task.type === "cloze") {
        expect(task.frame.split("{}"), `${kind}: ${task.frame}`).toHaveLength(2);
        expect(task.frame.replace("{}", task.answer)).toBe(task.feedback.correction);
      }

      if (task.type === "build") {
        const bank = [...task.tiles];
        for (const tile of task.answer) {
          const index = bank.indexOf(tile);
          expect(index, `${kind} missing tile ${tile}`).toBeGreaterThanOrEqual(0);
          bank.splice(index, 1);
        }
        expect(task.answer.join(" ")).toBe(task.feedback.correction);
      }

      if (task.type === "typed") {
        expect(task.acceptedAnswers ?? []).not.toContain(task.answer);
      }
    }
  });

  it("writes so before svoj and never doubles a preposition", () => {
    for (const { kind, task } of everyTask()) {
      const lines =
        task.type === "choice"
          ? task.choices.map((choice) => choice.label ?? "")
          : [task.feedback.correction ?? ""];

      for (const line of lines) {
        expect(line, kind).not.toMatch(/\bs svoj/);
        expect(line, kind).not.toMatch(/\b(s|so|o|u) (s|so|o|u) /);
      }
    }
  });
});
