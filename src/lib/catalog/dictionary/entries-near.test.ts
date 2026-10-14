import { describe, expect, it } from "vitest";

import { words } from "../entries";
import { entriesNear } from "./entries-near";

function nearFor(slug: string) {
  const word = words.find((entry) => entry.slug === slug);
  if (!word) throw new Error(`No entry ${slug}`);
  return entriesNear(word, words);
}

describe("entriesNear", () => {
  it("puts the entry in the middle of its alphabetical neighbours", () => {
    const rows = nearFor("priatel");

    expect(rows).toHaveLength(7);
    expect(rows[3]?.slovak).toBe("priateľ");
    expect(rows[3]?.current).toBe(true);
  });

  it("orders neighbours with Slovak collation", () => {
    const rows = nearFor("priatel").map((row) => row.slovak);
    const sorted = [...rows].sort(new Intl.Collator("sk").compare);

    expect(rows).toEqual(sorted);
  });

  it("lists each lemma once", () => {
    const rows = nearFor("byt").map((row) => row.slovak);

    expect(new Set(rows).size).toBe(rows.length);
  });
});
