import { describe, expect, it } from "vitest";

import {
  PAUSE,
  SIGH,
  STOP,
  THINK_MS,
  afterThinking,
  guess,
  lineWriter,
} from "./dialogue";

const line = lineWriter("test-");
const mark = (text: string) => ({ role: "demonstrative", text }) as const;

describe("dialogue lines", () => {
  it("reads as written and needs no clip text of its own", () => {
    const turn = line("key", "Anna", ["To je ", mark("ten"), " kľúč."], "It's that key.");

    expect(turn.id).toBe("test-key");
    expect(turn.slovak).toBe("To je ten kľúč.");
    expect(turn.marks).toEqual([{ role: "demonstrative", start: 6, end: 9 }]);
    expect(turn.audio).toBeUndefined();
  });

  it("keeps a direction out of the text and in the clip", () => {
    const turn = line("sigh", "Anna", [SIGH, "Marek!"], "Marek!");

    expect(turn.slovak).toBe("Marek!");
    expect(turn.audio?.transcript).toBe("[sighs] Marek!");
  });

  it("trails off in the text and stops in the clip", () => {
    const turn = line(
      "clue",
      "Marek",
      ["Je to žlté", STOP, PAUSE, "a je to ťažké."],
      "…",
    );

    expect(turn.slovak).toBe("Je to žlté… a je to ťažké.");
    expect(turn.audio?.transcript).toBe("Je to žlté. [pause] a je to ťažké.");
  });

  it("carries the stage's props and addressee, and the listener's time to think", () => {
    const turn = afterThinking(
      line("verdict", "Anna", ["Správne!"], "Right!", { props: guess(1), to: "Marek" }),
    );

    expect(turn.props).toEqual([null]);
    expect(turn.to).toBe("Marek");
    expect(turn.wait).toBe(THINK_MS);
  });
});
