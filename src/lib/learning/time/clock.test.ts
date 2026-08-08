import { describe, expect, it } from "vitest";

import {
  answersForTime,
  faceHour12,
  preferredAnswerForTime,
  randomDrillTime,
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
});
