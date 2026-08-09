import { describe, expect, it } from "vitest";

import {
  appointmentChoiceDistractors,
  appointmentChoiceWhy,
  appointmentDistractorWhy,
  appointmentFrom24h,
  appointmentPhrase,
  aroundPhrase,
  answersForTime,
  clockFaceDistractorWhy,
  exactMinuteTellingLabel,
  faceHour12,
  nearMissTimes,
  noonMidnightAppointmentPhrases,
  noonMidnightSelectAllChoices,
  oddOneOutChoicesFromDrafts,
  preferredAnswerForTime,
  randomDrillTime,
  selectAllChoicesForTime,
  selectAllTrapWhy,
  tellingDistractorWhy,
  zaCountdownPhrase,
} from "./clock";
import { answersMatch } from "$lib/client/practice-state";

describe("learning/time/clock", () => {
  it("maps 24h hours onto a 12-face clock", () => {
    expect(faceHour12(0)).toBe(12);
    expect(faceHour12(12)).toBe(12);
    expect(faceHour12(14)).toBe(2);
    expect(faceHour12(23)).toBe(11);
  });

  it("accepts full-hour agreement patterns", () => {
    expect(preferredAnswerForTime({ hour: 1, minute: 0 })).toBe("Je jedna hodina");
    expect(
      answersMatch(
        "jedna hodina",
        "Je jedna hodina",
        answersForTime({ hour: 1, minute: 0 }),
      ),
    ).toBe(true);

    const three = answersForTime({ hour: 3, minute: 0 });
    expect(three[0]).toBe("Sú tri hodiny");
    expect(answersMatch("tri hodiny", three[0]!, three)).toBe(true);

    const five = answersForTime({ hour: 5, minute: 0 });
    expect(five[0]).toBe("Je päť hodín");
  });

  it("accepts looking-ahead quarters and halves", () => {
    const quarter = answersForTime({ hour: 2, minute: 15 });
    expect(quarter[0]).toBe("Je štvrť na tri");
    expect(answersMatch("štvrť na tri", quarter[0]!, quarter)).toBe(true);

    const half = answersForTime({ hour: 2, minute: 30 });
    expect(half[0]).toBe("Je pol tretej");
    expect(answersMatch("pol tretej", half[0]!, half)).toBe(true);

    const threeQuarters = answersForTime({ hour: 2, minute: 45 });
    expect(threeQuarters[0]).toBe("Je trištvrte na tri");
  });

  it("uses jednu after twelve for quarter past", () => {
    const answers = answersForTime({ hour: 12, minute: 15 });
    expect(answers[0]).toBe("Je štvrť na jednu");
  });

  it("accepts formal minute readings alongside colloquial forms", () => {
    const half = answersForTime({ hour: 2, minute: 30 });
    expect(answersMatch("Sú dve hodiny a tridsať minút", half[0]!, half)).toBe(true);

    const fourteen = answersForTime({ hour: 14, minute: 0 });
    expect(answersMatch("Je štrnásť hodín", fourteen[0]!, fourteen)).toBe(true);
    expect(answersMatch("Sú dve hodiny", fourteen[0]!, fourteen)).toBe(true);
  });

  it("accepts bare digital readings", () => {
    const half = answersForTime({ hour: 14, minute: 30 });
    expect(answersMatch("štrnásť tridsať", half[0]!, half)).toBe(true);
    expect(answersMatch("dve tridsať", half[0]!, half)).toBe(true);
  });

  it("returns deterministic random faces from a stub rng", () => {
    let i = 0;
    const values = [0.1, 0.5, 0.9, 0.2];
    const time = randomDrillTime(() => values[i++] ?? 0);
    expect(time.hour).toBeGreaterThanOrEqual(1);
    expect(time.hour).toBeLessThanOrEqual(23);
    expect([0, 15, 30, 45]).toContain(time.minute);
  });

  it("builds appointment phrases with 12↔1 wrap", () => {
    expect(appointmentPhrase({ hour: 12, minute: 30 })).toBe("O pol jednej.");
    expect(appointmentPhrase({ hour: 1, minute: 0 })).toBe("O jednej.");
    expect(appointmentPhrase({ hour: 12, minute: 15 })).toBe("O štvrť na jednu.");
    expect(appointmentPhrase({ hour: 2, minute: 30 })).toBe("O pol tretej.");
  });

  it("builds around phrases and za countdown", () => {
    expect(aroundPhrase({ hour: 3, minute: 0 })).toBe("Okolo tretej.");
    expect(zaCountdownPhrase(5, 10)).toBe("Za päť minút desať.");
  });

  it("maps 24h timetable times to appointment phrases", () => {
    expect(appointmentFrom24h({ hour: 14, minute: 30 })).toBe("O pol tretej.");
    expect(appointmentFrom24h({ hour: 9, minute: 10 })).toBeNull();
  });

  it("builds exact minute telling labels", () => {
    expect(exactMinuteTellingLabel({ hour: 3, minute: 10 })).toBe(
      "Sú tri hodiny a desať minút.",
    );
  });

  it("treats bare O dvanástej as ambiguous for noon/midnight", () => {
    expect(noonMidnightAppointmentPhrases({ hour: 12, minute: 0 })).toEqual([
      "O poludní.",
      "O dvanástej napoludnie.",
    ]);
    expect(noonMidnightAppointmentPhrases({ hour: 0, minute: 0 })).toEqual([
      "O polnoci.",
      "O dvanástej v noci.",
    ]);

    const noonChoices = noonMidnightSelectAllChoices({ hour: 12, minute: 0 });
    expect(noonChoices.find((c) => c.id === "bare-twelve")?.correct).toBe(false);
    expect(noonChoices.filter((c) => c.correct).map((c) => c.label)).toEqual([
      "O poludní",
      "O dvanástej napoludnie",
    ]);
  });

  it("builds odd-one-out choices with wrong lexical as the trap", () => {
    const drafts = noonMidnightSelectAllChoices({ hour: 12, minute: 0 });
    const { answerId, choices } = oddOneOutChoicesFromDrafts(drafts, "noon");

    expect(answerId).toBe("wrong-lexical");
    expect(choices.find((c) => c.id === "bare-twelve")).toBeUndefined();
    expect(choices.find((c) => c.id === "wrong-lexical")?.whyWrong).toMatch(/midnight/);
    expect(choices.find((c) => c.id === "lexical")?.whyWrong).toMatch(/means noon/);
  });

  it("formats select-all choice labels without periods and with sentence capitals", () => {
    const choices = selectAllChoicesForTime({ hour: 3, minute: 30 });
    expect(choices.find((c) => c.id === "digital")?.label).toBe("Tri tridsať");
    expect(choices.find((c) => c.id === "telling-primary")?.label).toBe("Je pol štvrtej");
    expect(choices.every((c) => !c.label.endsWith("."))).toBe(true);
  });

  it("builds rule-first appointment feedback", () => {
    expect(appointmentChoiceWhy({ hour: 6, minute: 45 })).toMatch(
      /means quarter to 7.*three quarters.*\*\*7\*\*.*\*\*6:45\*\*/,
    );
    expect(appointmentChoiceWhy({ hour: 2, minute: 15 })).toMatch(
      /means quarter past 2.*one quarter.*\*\*3\*\*/,
    );
    expect(appointmentChoiceWhy({ hour: 2, minute: 30 })).toMatch(
      /means half past 2.*halfway toward \*\*3\*\*/,
    );
  });

  it("explains appointment distractors with the toward-hour rule", () => {
    const correct = { hour: 6, minute: 45 as const };
    const wrong = { hour: 5, minute: 45 as const };
    expect(appointmentDistractorWhy(correct, wrong)).toBe(
      "**O trištvrte na šesť** means quarter to 6 (**5:45**). For quarter to 7, name **sedem** after **na** — the hand is near **6**, but Slovak looks ahead.",
    );
    expect(tellingDistractorWhy(correct, wrong)).toMatch(/means quarter to 6/);
    expect(clockFaceDistractorWhy(correct, wrong)).toMatch(
      /You need quarter to 7.*name \*\*sedem\*\* after \*\*na\*\*/,
    );
  });

  it("builds select-all trap why with toward-hour wording", () => {
    const trap = selectAllTrapWhy({ hour: 2, minute: 45 }, "Je trištvrte na dve");
    expect(trap).toMatch(/three quarters toward/);
    expect(trap).toMatch(/not \*\*2:45\*\*/);
  });

  it("uses O prvej as appointment choice distractor when it is not the answer", () => {
    const threeOClock = { hour: 3, minute: 0 as const };
    const distractors = appointmentChoiceDistractors(
      threeOClock,
      nearMissTimes(threeOClock, () => 0),
    );
    expect(distractors.some((d) => d.label === "O prvej.")).toBe(true);

    const oneOClock = { hour: 1, minute: 0 as const };
    const oneDistractors = appointmentChoiceDistractors(
      oneOClock,
      nearMissTimes(oneOClock, () => 0),
    );
    expect(oneDistractors.some((d) => d.label === "O prvej.")).toBe(true);
    expect(appointmentPhrase(oneOClock)).toBe("O jednej.");
  });
});
