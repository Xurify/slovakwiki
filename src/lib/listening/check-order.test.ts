import { describe, expect, it } from "vitest";

import { listeningEpisodes } from "$lib/catalog/listening";

import { checkChoiceOrder } from "./check-order";

const checks = listeningEpisodes.flatMap((episode) =>
  episode.chapters.flatMap((chapter) => chapter.checks),
);

describe("checkChoiceOrder", () => {
  it("keeps every choice and the same order for the same id", () => {
    const choices = ["a", "b", "c", "d"];
    const once = checkChoiceOrder("check-x", choices);
    expect([...once].sort()).toEqual(choices);
    expect(checkChoiceOrder("check-x", choices)).toEqual(once);
    expect(choices).toEqual(["a", "b", "c", "d"]);
  });

  it("puts the answer in every position over the episodes, and never first in all of one", () => {
    const at = (check: (typeof checks)[number]) =>
      checkChoiceOrder(check.id, check.choices).findIndex(
        (choice) => choice.id === check.answerId,
      );
    const positions = new Set(checks.map(at));
    expect(positions.has(0) && positions.has(1) && positions.has(2)).toBe(true);
    const first = checks.filter((check) => at(check) === 0).length;
    expect(first / checks.length).toBeLessThan(0.5);

    for (const episode of listeningEpisodes) {
      const own = episode.chapters.flatMap((chapter) => chapter.checks);
      if (own.length < 3) continue;
      expect(
        own.some((check) => at(check) !== 0),
        episode.slug,
      ).toBe(true);
    }
  });
});
