import { writeFileSync } from "node:fs";
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
    // The hand stops short of it too: once reaching for it, once lifting it out.
    expect(rules(checkCues(chapter, lines, KITCHEN, FRAME))).toEqual([
      "error contact/miss",
      "error contact/miss",
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
    const errors = checkCues(chapter, lines, KITCHEN, FRAME).filter(
      ({ level }) => level === "error",
    );
    expect(errors).toEqual([]);
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

  it("flags a lean that brings two heads together, but not from a step further off", () => {
    const at = (spot: string) =>
      segment(
        "marek",
        [
          { do: "go", to: spot },
          { who: "anna", do: "go", to: "sink" },
        ],
        [{ who: "anna", do: "wash" }],
      );
    const close = at("board-back");
    const apart = at("board");
    expect(rules(checkCues(close.chapter, close.lines, KITCHEN, FRAME))).toEqual([
      "error space/heads",
    ]);
    expect(checkCues(apart.chapter, apart.lines, KITCHEN, FRAME)).toEqual([]);
  });

  it("flags a standing spot behind the end of the studio desk", () => {
    const studio = PLACES.studio.set!;
    const frame = stageFrame(["anna", "marek"], {}, "studio", [], 960, 480);
    const walk = segment("marek", [{ do: "go", to: "plant" }]);
    const behind = {
      ...studio,
      spots: { ...studio.spots, plant: { piece: "corner", dx: -70, facing: 1 as const } },
    };
    expect(checkCues(walk.chapter, walk.lines, studio, frame)).toEqual([]);
    expect(rules(checkCues(walk.chapter, walk.lines, behind, frame))).toContain(
      "error space/furniture",
    );
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

// For writers: SLUG=<slug> OUT=<file> bunx vitest run src/lib/stick-figure/episode-checks.test.ts
it.skipIf(!process.env.SLUG || !process.env.OUT)(
  "writes every finding for one episode, review flags included",
  () => {
    const episode = listeningEpisodes.find(({ slug }) => slug === process.env.SLUG);
    if (!episode) throw new Error(`No listed episode "${process.env.SLUG}"`);
    const rows = checkEpisode(episode).map(
      (finding) =>
        `- ${keyOf(episode.slug, finding)} [${finding.level}] ${finding.message}${finding.slovak ? ` ("${finding.slovak}")` : ""}`,
    );
    writeFileSync(process.env.OUT!, `${rows.join("\n")}\n`);
  },
);
