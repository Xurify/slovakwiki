import { describe, expect, it } from "vitest";

import { words } from "../entries";
import { frequencyListFor } from "../frequency/load";
import { frequencyNeighbors } from "./frequency-neighbors";

function neighborsFor(slug: string) {
  const word = words.find((entry) => entry.slug === slug);
  if (!word?.frequency) throw new Error(`No frequency for ${slug}`);

  return frequencyNeighbors(
    word.frequency,
    frequencyListFor(word.frequency.partOfSpeech),
    words,
  );
}

describe("frequencyNeighbors", () => {
  it("centres the entry between the lemmas ranked around it", () => {
    const rows = neighborsFor("priatel");

    expect(rows.map((row) => row.rank)).toEqual([228, 229, 230, 231, 232]);
    expect(rows.find((row) => row.current)?.lemma).toBe("priateľ");
  });

  it("keeps five rows at the top of a list", () => {
    const rows = neighborsFor("rok");

    expect(rows.map((row) => row.rank)).toEqual([1, 2, 3, 4, 5]);
    expect(rows[0]?.current).toBe(true);
  });

  it("links only lemmas that have a dictionary entry", () => {
    for (const row of neighborsFor("priatel")) {
      if (row.href) expect(row.href).toMatch(/^\/dictionary\//);
    }
  });
});
