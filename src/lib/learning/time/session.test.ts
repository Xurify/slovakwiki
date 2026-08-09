import { describe, expect, it } from "vitest";

import { gradeSelectAll, choiceFeedbackWhy } from "$lib/learning/exercises/select-all";
import {
  appointmentPhrase,
  formatFaceDigital12,
  selectAllChoicesForTime,
} from "$lib/learning/time/clock";
import {
  buildDaysDatesTimeSession,
  isDaysDatesTimeKind,
  materializeDaysDatesTimeItem,
} from "$lib/learning/time/session";

describe("learning/time/session", () => {
  it("materializes appointment phrase for 12↔1 wrap", () => {
    expect(appointmentPhrase({ hour: 12, minute: 30 })).toBe("O pol jednej.");
    expect(appointmentPhrase({ hour: 1, minute: 0 })).toBe("O jednej.");
    expect(appointmentPhrase({ hour: 12, minute: 15 })).toBe("O štvrť na jednu.");
  });

  it("builds a full session with odd-one-out and phase 2/3 items", () => {
    const session = buildDaysDatesTimeSession(() => 0.42);
    expect(session.length).toBeGreaterThanOrEqual(10);
    expect(session.length).toBeLessThanOrEqual(12);
    expect(session.some((item) => item.task.type === "selectAll")).toBe(false);
    const phase2Ids = [
      "everyday/day-part-time",
      "everyday/noon-midnight",
      "everyday/okolo-vs-exact",
    ];
    expect(session.some((item) => phase2Ids.includes(item.id))).toBe(true);

    const choiceItems = session.filter((item) => item.task.type === "choice");
    for (const item of choiceItems) {
      if (item.task.type !== "choice") continue;
      const task = item.task;
      if (task.prompt.startsWith("Which phrase does not mean")) {
        expect(task.choiceMode).toBe("pickTrap");
        expect(task.choices.length).toBeGreaterThanOrEqual(3);
        expect(task.choices.some((choice) => choice.fits === true)).toBe(true);
        expect(task.choices.some((choice) => choice.fits !== true)).toBe(true);
        continue;
      }
      if (task.prompt === "Koľko je hodín?") {
        expect(task.choiceMode).toBeUndefined();
        expect(task.answerId).toBe("correct");
        continue;
      }
      expect(task.choices.length).toBe(3);
      if (task.choiceMode === "pickTrap") continue;
      expect(task.choices.some((choice) => choice.id === task.answerId)).toBe(true);
    }
  });

  it("materializes focused kind with fresh time", () => {
    const first = materializeDaysDatesTimeItem("everyday/half-past-time", () => 0.1);
    const second = materializeDaysDatesTimeItem("everyday/half-past-time", () => 0.9);
    expect(first.task.type).toBe("choice");
    if (first.task.type === "choice" && second.task.type === "choice") {
      expect(first.task.clock).toBeDefined();
      expect(second.task.clock).toBeDefined();
    }
  });

  it("materializes dynamic day-meeting build tasks", () => {
    const first = materializeDaysDatesTimeItem("everyday/day-meeting", () => 0);
    const second = materializeDaysDatesTimeItem("everyday/day-meeting", () => 0.85);

    expect(first.task.type).toBe("build");
    if (first.task.type === "build" && second.task.type === "build") {
      expect(first.task.answer[0]).toBe("Stretneme");
      expect(first.task.tiles.length).toBeGreaterThan(first.task.answer.length);
      expect(first.task.id).toMatch(/^generated-/);
    }
  });

  it("recognizes procedural kinds", () => {
    expect(isDaysDatesTimeKind("everyday/time-variants")).toBe(true);
    expect(isDaysDatesTimeKind("everyday/formal-greeting")).toBe(false);
  });

  it("grades select-all with exact set match", () => {
    const choices = selectAllChoicesForTime({ hour: 2, minute: 30 as const });
    const correctIds = new Set(choices.filter((c) => c.correct).map((c) => c.id));
    expect(gradeSelectAll(correctIds, choices)).toBe(true);
    expect(gradeSelectAll(new Set([choices[0]!.id]), choices)).toBe(false);
  });

  it("uses spoken English in appointment prompts and digital labels in feedback", () => {
    const time = { hour: 2, minute: 30 as const };
    expect(formatFaceDigital12(time)).toBe("2:30");

    let call = 0;
    const rng = () => {
      const values = [0, 0];
      return values[call++] ?? 0;
    };
    const item = materializeDaysDatesTimeItem("everyday/half-past-time", rng);
    if (item.task.type === "choice") {
      expect(item.task.prompt).toBe("At half past 1.");
      expect(item.task.feedback?.why).toMatch(/1:30/);
    }
  });

  it("materializes exact minute as pick-the-correct phrase", () => {
    const item = materializeDaysDatesTimeItem("everyday/exact-minute", () => 0.2);
    expect(item.task.type).toBe("choice");
    if (item.task.type === "choice") {
      expect(item.task.prompt).not.toMatch(/Which phrase does not mean/);
      expect(item.task.clock).toBeDefined();
      expect(item.task.answerId).toBe("correct");
      expect(
        item.task.choices.find((c) => c.id === "wrong-minute")?.whyWrong,
      ).toBeTruthy();
    }
  });

  it("materializes noon/midnight as odd-one-out with wrong lexical as trap", () => {
    const noon = materializeDaysDatesTimeItem("everyday/noon-midnight", () => 0);
    expect(noon.task.type).toBe("choice");
    if (noon.task.type === "choice") {
      expect(noon.task.prompt).toBe("Which phrase does not mean noon?");
      expect(noon.task.answerId).toBe("wrong-lexical");
      expect(noon.task.choices.find((c) => c.id === "wrong-lexical")?.label).toBe(
        "O polnoci",
      );
    }
  });

  it("materializes time variants as odd-one-out", () => {
    const item = materializeDaysDatesTimeItem("everyday/time-variants", () => 0.5);
    expect(item.task.type).toBe("choice");
    if (item.task.type === "choice") {
      expect(item.task.prompt).toMatch(/Which phrase does not mean half past/);
      expect(item.task.answerId).toMatch(
        /pol-wrong-hour|quarter-wrong|triquarter-wrong|half-wrong/,
      );
    }
  });

  it("materializes day-part as pick-the-correct phrase, not odd-one-out", () => {
    const item = materializeDaysDatesTimeItem("everyday/day-part-time", () => 0.1);
    expect(item.task.type).toBe("choice");
    if (item.task.type === "choice") {
      expect(item.task.prompt).toMatch(/in the (morning|evening)\.$/);
      expect(item.task.choiceMode).toBeUndefined();
      expect(item.task.answerId).toBe("correct");
      expect(item.task.choices.find((c) => c.id === "correct")?.label).toMatch(
        /ráno|večer/,
      );
      expect(item.task.choices.find((c) => c.id === "wrong-part")?.whyWrong).toMatch(
        /marks (evening|morning)/,
      );
    }
  });

  it("keeps whyWrong on appointment choice distractors for miss feedback", () => {
    const item = materializeDaysDatesTimeItem("everyday/quarter-time", () => 0.2);
    expect(item.task.type).toBe("choice");
    if (item.task.type !== "choice") return;

    const task = item.task;
    const wrong = task.choices.find(
      (choice) => choice.id !== task.answerId && choice.id.startsWith("miss-"),
    );
    expect(wrong?.whyWrong).toMatch(/means quarter/);

    const baseWhy = task.feedback?.why ?? "";
    expect(baseWhy).toMatch(/means quarter|means half past|halfway toward/);
    expect(
      choiceFeedbackWhy(baseWhy, wrong?.id ?? null, task.choices, task.answerId),
    ).toMatch(wrong?.whyWrong ?? "");
  });

  it("uses appointment why on clock-match items", () => {
    const item = materializeDaysDatesTimeItem(
      "everyday/clock-half-past-match",
      () => 0.2,
    );
    expect(item.task.type).toBe("choice");
    if (item.task.type === "choice") {
      expect(item.task.feedback?.why).toMatch(/\*\*O pol /);
      expect(item.task.feedback?.why).not.toMatch(/^Je /);
    }
  });

  it("keeps full O phrases in okolo and timetable feedback why", () => {
    let call = 0;
    const rng = () => {
      const values = [0.1, 0.1, 0.1];
      return values[call++] ?? 0.1;
    };
    const okolo = materializeDaysDatesTimeItem("everyday/okolo-vs-exact", rng);
    expect(okolo.task.type).toBe("choice");
    if (okolo.task.type === "choice") {
      expect(okolo.task.prompt).not.toMatch(/Which phrase does not mean/);
      expect(okolo.task.answerId).toMatch(/around|exact/);
      expect(okolo.task.feedback?.why).toMatch(/\*\*okolo\*\*|\*\*O /);
    }

    const timetable = materializeDaysDatesTimeItem("everyday/timetable-24h", () => 0.2);
    expect(timetable.task.type).toBe("choice");
    if (timetable.task.type === "choice") {
      expect(timetable.task.feedback?.why).toMatch(/\*\*O /);
    }
  });
});
