import { describe, expect, it } from "vitest";

import { gestureForLine } from "./line-gesture";
import { directScene } from "./scene-direction";
import {
  foldLine,
  lineSentences,
  matchesWord,
  mentions,
  opens,
  opensWith,
  wordSentences,
} from "./slovak-text";

describe("Slovak text", () => {
  it("folds a line to plain words", () => {
    expect(foldLine("Ďakujem, Anna! Dobrú noc…")).toBe("dakujem anna dobru noc");
    expect(foldLine("…")).toBe("");
  });

  it("splits a line into sentences and knows each word's", () => {
    expect(lineSentences("Ahoj! Ako sa máš? Dobre.")).toEqual([
      "Ahoj!",
      "Ako sa máš?",
      "Dobre.",
    ]);
    expect(wordSentences("Ahoj! Ako sa máš?")).toEqual([0, 1, 1, 1]);
  });

  it("matches phrases on whole words only", () => {
    expect(opens("dobry den anna", "dobry den")).toBe(true);
    expect(opens("dobryden", "dobry")).toBe(false);
    expect(opensWith("Ahoj, Marek!", ["ahoj"])).toBe(true);
    expect(opensWith("Ahojte!", ["ahoj"])).toBe(false);
    expect(mentions("Ja si dám čaj.", ["si dam"])).toBe(true);
    expect(mentions("Kaviareň je tu.", ["kav"])).toBe(false);
  });

  it("matches a word whole or by its stem", () => {
    expect(matchesWord("kavu", { words: ["kava", "kavu"] })).toBe(true);
    expect(matchesWord("kaviaren", { words: ["kava", "kavu"] })).toBe(false);
    expect(matchesWord("jablko", { stems: ["jablk"] })).toBe(true);
  });
});

describe("one list of hellos and goodbyes", () => {
  it("waves at every hello and goodbye", () => {
    for (const line of ["Nazdar!", "Ahojte!", "Zbohom.", "Dobrú noc."]) {
      expect([line, gestureForLine(line)]).toEqual([line, "wave"]);
    }
  });

  it("walks on whoever opens with any hello", () => {
    const { stagings } = directScene(
      [
        { characterId: "anna", slovak: "Kde je Marek?" },
        { characterId: "marek", slovak: "Ahojte!" },
      ],
      "plaza",
    );
    expect(stagings[0].enter?.characterId).toBe("marek");
  });
});
