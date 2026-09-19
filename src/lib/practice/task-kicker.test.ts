import { describe, expect, it } from "vitest";

import { practiceTaskKicker } from "./task-kicker";

describe("practiceTaskKicker", () => {
  it("uses the task label the player will paint", () => {
    expect(
      practiceTaskKicker({
        type: "choice",
        id: "t",
        practiceItemId: "x",
        prompt: "Hello; good day.",
        choices: [{ id: "a", label: "Ahoj!" }],
        answerId: "a",
        feedback: { correction: "", english: "", why: "" },
      }),
    ).toBe("Choose the answer");

    expect(
      practiceTaskKicker({
        type: "choice",
        id: "t",
        practiceItemId: "x",
        prompt: "Koľko je hodín?",
        promptLang: "sk",
        clock: { hour: 3, minute: 0 },
        choices: [{ id: "a", label: "O tretej." }],
        answerId: "a",
        feedback: { correction: "", english: "", why: "" },
      }),
    ).toBe("");

    expect(practiceTaskKicker(undefined)).toBe("");
  });
});
