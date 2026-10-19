import { describe, expect, it } from "vitest";

import type { PracticeTask } from "$lib/learning/types";
import { seededRng } from "$lib/learning/possessives/session";
import {
  DEMONSTRATIVE_KINDS,
  DEMONSTRATIVES_SESSION_SIZE,
  buildDemonstrativesSession,
  demonstrativesPracticeItems,
  isDemonstrativeKind,
  materializeDemonstrativeItem,
} from "./session";

const SEEDS = Array.from({ length: 200 }, (_, index) => index + 1);

function everyTask(): Array<{ kind: string; task: PracticeTask }> {
  return DEMONSTRATIVE_KINDS.flatMap((kind) =>
    SEEDS.map((seed) => ({
      kind,
      task: materializeDemonstrativeItem(kind, seededRng(seed)).task,
    })),
  );
}

function slovakLines(task: PracticeTask): string[] {
  const lines = [task.feedback.correction ?? ""];
  if (task.type === "choice")
    lines.push(...task.choices.map((choice) => choice.label ?? ""));
  if (task.type === "build") lines.push(task.answer.join(" "));
  if (task.type === "typed") lines.push(task.answer, ...(task.acceptedAnswers ?? []));
  return lines;
}

describe("learning/demonstratives/session", () => {
  it("builds a session that opens on agreement and never repeats a kind", () => {
    const session = buildDemonstrativesSession(seededRng(7));

    expect(session).toHaveLength(DEMONSTRATIVES_SESSION_SIZE);
    expect(session[0]?.id).toBe("grammar/demonstrative-agreement");
    expect(new Set(session.map((item) => item.id)).size).toBe(
      DEMONSTRATIVES_SESSION_SIZE,
    );
  });

  it("repeats a seeded session exactly, so SSR and hydration agree", () => {
    expect(buildDemonstrativesSession(seededRng(1))).toEqual(
      buildDemonstrativesSession(seededRng(1)),
    );
  });

  it("publishes one catalog stub per kind", () => {
    expect(demonstrativesPracticeItems.map((item) => item.id)).toEqual(
      DEMONSTRATIVE_KINDS,
    );
    for (const item of demonstrativesPracticeItems) {
      expect(isDemonstrativeKind(item.id)).toBe(true);
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
        expect(new Set(task.tiles).size, `${kind} duplicate tiles`).toBe(
          task.tiles.length,
        );
      }

      if (task.type === "typed") {
        expect(task.acceptedAnswers ?? []).not.toContain(task.answer);
      }
    }
  });

  it("gives every find-the-mistake card one fixable word, or none at all", () => {
    let clean = 0;

    for (const { kind, task } of everyTask()) {
      if (task.type !== "spot") continue;

      if (task.wrongIndex === null) {
        clean += 1;
        expect(task.words.join(" "), kind).toBe(task.feedback.correction);
        continue;
      }

      const fixed = [...task.words];
      fixed[task.wrongIndex] = task.answer;
      expect(fixed.join(" "), kind).toBe(task.feedback.correction);
      expect(task.words[task.wrongIndex], kind).not.toBe(task.answer);
    }

    expect(clean).toBeGreaterThan(0);
  });

  it("never writes the Czech forms it warns about, or a doubled preposition", () => {
    for (const { kind, task } of everyTask()) {
      if (task.type === "typed" && task.task === "repair") continue;

      for (const line of slovakLines(task)) {
        expect(line, kind).not.toMatch(/\b(tohoto|tyto|tato|tito)\b/iu);
        expect(line, kind).not.toMatch(/\bso t/u);
        expect(line, kind).not.toMatch(/\b(s|so|o|u|v|bez) (s|so|o|u|v|bez) /u);
      }
    }
  });

  it("asks where things are only with ten, never “Where is this key?”", () => {
    for (const { kind, task } of everyTask()) {
      for (const line of slovakLines(task)) {
        expect(line, kind).not.toMatch(/^Kde (je|sú) (tento|táto|toto|títo|tieto) /u);
      }
    }
  });
});
