import { describe, expect, it } from "vitest";

import { gradeSelectAll, selectAllFeedbackWhy } from "$lib/learning/exercises/select-all";
import {
  noonMidnightSelectAllChoices,
  selectAllChoicesForTime,
} from "$lib/learning/time/clock";

describe("select-all", () => {
  it("grades select-all with exact set match", () => {
    const choices = [
      { id: "a", label: "A.", correct: true },
      { id: "b", label: "B.", correct: true },
      { id: "c", label: "C.", correct: false },
    ];
    expect(gradeSelectAll(new Set(["a", "b"]), choices)).toBe(true);
    expect(gradeSelectAll(new Set(["a"]), choices)).toBe(false);
    expect(gradeSelectAll(new Set(["a", "c"]), choices)).toBe(false);
  });

  it("appends whyWrong for incorrect picks on midnight select-all", () => {
    const choices = noonMidnightSelectAllChoices({ hour: 0, minute: 0 });
    const baseWhy = "**O polnoci** is the usual form. **O dvanástej v noci** also works.";
    const wrongLexical = choices.find((choice) => choice.id === "wrong-lexical");

    expect(wrongLexical?.whyWrong).toMatch(/noon, not midnight/);

    const why = selectAllFeedbackWhy(
      baseWhy,
      new Set(["lexical", "tagged", "wrong-lexical"]),
      choices,
    );

    expect(why).toContain(baseWhy);
    expect(why).toContain("**O poludní** means noon, not midnight.");
    expect(why).not.toContain("ambiguous");
  });

  it("leaves base why unchanged when only correct options are selected", () => {
    const choices = noonMidnightSelectAllChoices({ hour: 12, minute: 0 });
    const baseWhy = "**O poludní** is the usual form.";

    expect(selectAllFeedbackWhy(baseWhy, new Set(["lexical", "tagged"]), choices)).toBe(
      baseWhy,
    );
  });

  it("appends whyWrong for pol druhej trap on half-past select-all", () => {
    const choices = selectAllChoicesForTime({ hour: 2, minute: 30 });
    const trap = choices.find((choice) => choice.id === "pol-wrong-hour");
    const baseWhy = "Several forms name **2:30**.";

    expect(trap?.whyWrong).toMatch(/1:30/);

    const why = selectAllFeedbackWhy(baseWhy, new Set(["pol-wrong-hour"]), choices);

    expect(why).toContain(baseWhy);
    expect(why).toContain("**1:30**");
  });
});
