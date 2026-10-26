import { describe, expect, it } from "vitest";

import { listeningEpisodes } from "$lib/catalog/listening";
import type { Cue } from "./acts";
import baseline from "./episode-checks.baseline.json";
import { checkCues, checkEpisode, type Finding } from "./episode-checks";
import { PLACES } from "./places";

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
  const KITCHEN = PLACES.kitchen.set!.objects;
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

  it("flags reaching into the pot from across the room, as with Tu máš vodu", () => {
    const { chapter, lines } = segment("marek", [
      { do: "go", to: "counter" },
      { do: "take", what: "spoon" },
    ]);
    expect(rules(checkCues(chapter, lines, KITCHEN))).toEqual([
      "error space/out-of-reach",
    ]);
  });

  it("lets someone reach what is at the spot they walked to, or beside the cook there", () => {
    const { chapter, lines } = segment(
      "marek",
      [
        { do: "go", to: "stove" },
        { do: "take", what: "spoon" },
      ],
      [
        { who: "maria", do: "go", to: "stove" },
        { do: "go", to: "maria" },
        { do: "take", what: "lid" },
      ],
    );
    expect(checkCues(chapter, lines, KITCHEN)).toEqual([]);
  });

  it("asks about a guest reaching from their mark, and trusts the cook at her post", () => {
    const guest = segment("marek", [{ do: "take", what: "spoon" }]);
    const cook = segment("maria", [{ do: "take", what: "spoon" }]);
    expect(
      rules(checkCues(guest.chapter, guest.lines, KITCHEN, undefined, ["maria"])),
    ).toEqual(["review space/out-of-reach"]);
    expect(checkCues(cook.chapter, cook.lines, KITCHEN, undefined, ["maria"])).toEqual(
      [],
    );
  });

  it("flags a card from nowhere and a hand-over of what nobody holds", () => {
    const { chapter, lines } = segment(
      "marek",
      [{ do: "take", what: "card" }],
      [{ do: "give", what: "spoon", to: "anna" }],
    );
    expect(rules(checkCues(chapter, lines, KITCHEN))).toEqual([
      "error props/impossible-cue",
      "error props/impossible-cue",
    ]);
  });
});
