import { describe, expect, it } from "vitest";

import { listeningEpisodes } from "$lib/catalog/listening";
import type { Cue } from "./acts";
import baseline from "./episode-checks.baseline.json";
import { checkCues, checkEpisode, type Finding } from "./episode-checks";
import { PLACES } from "./places";
import { stageFrame } from "./stage-frame";

/** A finding's key in the baseline: episode, segment, line and rule. */
function keyOf(slug: string, finding: Finding): string {
  return [slug, finding.chapter, finding.line ?? "", finding.rule].join(" ");
}

/**
 * Errors already on master when the checks came in, each with why it stands.
 * New errors fail; an entry whose error is fixed fails too, so the list only shrinks.
 */
const known: Record<string, string> = baseline;

describe("episodes against the failure classes", () => {
  const errors = listeningEpisodes.flatMap((episode) =>
    checkEpisode(episode)
      .filter((finding) => finding.level === "error")
      .map((finding) => ({ key: keyOf(episode.slug, finding), finding })),
  );

  it("has no new error a viewer would see", () => {
    const fresh = errors
      .filter(({ key }) => !(key in known))
      .map(
        ({ key, finding }) =>
          `${key}: ${finding.message}${finding.slovak ? ` ("${finding.slovak}")` : ""}`,
      );
    expect(fresh).toEqual([]);
  });

  it("keeps no baseline entry for an error that is fixed", () => {
    const found = new Set(errors.map(({ key }) => key));
    expect(Object.keys(known).filter((key) => !found.has(key))).toEqual([]);
  });
});

describe("cues against the set", () => {
  const KITCHEN = PLACES.kitchen.set!;
  const FRAME = stageFrame(["anna", "marek", "maria"], {}, "kitchen", [], 960, 480);
  /** A segment of lines said by `who`, each with its cues. */
  const segment = (who: "maria" | "marek", ...acts: Cue[][]) => ({
    chapter: {
      id: "kitchen",
      lines: acts.map((_, index) => ({ id: `line-${index}`, slovak: "…" })),
    } as never,
    lines: acts.map((act) => ({ characterId: who, act })),
  });
  const rules = (findings: Finding[]) =>
    findings.map(({ rule, level }) => `${level} ${rule}`);

  it("flags reaching into the crock at the stove end from the sink, as with Tu máš vodu", () => {
    const { chapter, lines } = segment("marek", [
      { do: "go", to: "sink" },
      { do: "take", what: "spoon" },
    ]);
    expect(rules(checkCues(chapter, lines, KITCHEN, FRAME))).toEqual([
      "error space/out-of-reach",
    ]);
  });

  it("lets someone reach what is by the spot they walked to", () => {
    const { chapter, lines } = segment(
      "marek",
      [
        { do: "go", to: "cook" },
        { do: "take", what: "spoon" },
      ],
      [
        { who: "maria", do: "go", to: "board-across" },
        { who: "maria", do: "take", what: "knife" },
      ],
    );
    expect(checkCues(chapter, lines, KITCHEN, FRAME)).toEqual([]);
  });

  it("flags stopping at someone's elbow, but not once they have moved off", () => {
    const { chapter, lines } = segment(
      "marek",
      [
        { who: "anna", do: "go", to: "board" },
        { do: "go", to: "board-back" },
      ],
      [
        { who: "anna", do: "go", to: "pot-left" },
        { do: "go", to: "board" },
      ],
    );
    expect(rules(checkCues(chapter, lines, KITCHEN, FRAME))).toEqual([
      "error space/crowded",
    ]);
  });

  it("flags a card from nowhere and a hand-over of what nobody holds", () => {
    const { chapter, lines } = segment(
      "marek",
      [{ do: "take", what: "card" }],
      [{ do: "give", what: "spoon", to: "anna" }],
    );
    expect(rules(checkCues(chapter, lines, KITCHEN, FRAME))).toEqual([
      "error props/impossible-cue",
      "error props/impossible-cue",
    ]);
  });
});
