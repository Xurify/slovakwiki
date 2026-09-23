import { describe, expect, it } from "vitest";
import { caseTopics } from "./cases";
import { grammarEntries } from "./grammar";
import {
  caseNeighbors,
  grammarGroupAnchor,
  grammarGroups,
  grammarNeighbors,
  grammarTopicPosition,
  grammarTopicsInGroup,
} from "./grammar-path";

function topic(slug: string) {
  const entry = grammarEntries.find((candidate) => candidate.slug === slug);
  if (!entry) throw new Error(`missing grammar topic ${slug}`);
  return entry;
}

describe("grammar path", () => {
  it("covers every topic exactly once across the groups", () => {
    const slugs = grammarGroups.flatMap((group) =>
      grammarTopicsInGroup(group).map((entry) => entry.slug),
    );
    expect(slugs.sort()).toEqual(grammarEntries.map((entry) => entry.slug).sort());
  });

  it("orders topics inside a group and reports their position", () => {
    expect(grammarTopicsInGroup("Verbs").map((entry) => entry.slug)).toEqual([
      "present-tense",
      "byt-present",
      "mat-present",
      "aspect",
    ]);
    expect(grammarTopicPosition(topic("byt-present"))).toEqual({ step: 2, total: 4 });
  });

  it("follows nextSlug forwards and backwards", () => {
    const neighbors = grammarNeighbors(topic("present-tense"));
    expect(neighbors.previous?.href).toBe("/grammar/cases-overview");
    expect(neighbors.next).toEqual({
      href: "/grammar/byt-present",
      slovak: "byť",
      title: "To be (present)",
    });
    expect(grammarNeighbors(topic("grammatical-gender")).previous).toBeNull();
  });

  it("builds stable group anchors", () => {
    expect(grammarGroupAnchor("Sentence building")).toBe("group-sentence-building");
  });
});

describe("caseNeighbors", () => {
  it("walks the six cases in order", () => {
    const first = caseTopics[0]!;
    const last = caseTopics[caseTopics.length - 1]!;
    expect(caseNeighbors(first).previous).toBeNull();
    expect(caseNeighbors(first).next?.href).toBe(`/grammar/cases/${caseTopics[1]!.slug}`);
    expect(caseNeighbors(last).next).toBeNull();
  });
});
