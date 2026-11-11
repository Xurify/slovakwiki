import { describe, expect, it } from "vitest";

import { buildDictionaryIndexSidecar } from "$lib/catalog/dictionary/browse";

import {
  buildWordLinkIndex,
  resolveWordLink,
  wordLinkQuery,
  type WordLinkEntry,
} from "./word-link";

const entries: WordLinkEntry[] = [
  { slug: "malo", slovak: "málo", hash: "adverb", forms: [] },
  { slug: "malo-n", slovak: "málo", hrefSlug: "malo", hash: "noun", forms: ["mála"] },
  { slug: "mat", slovak: "mať", forms: ["mám", "malo", "mala"] },
  { slug: "vina", slovak: "vina", forms: ["viny", "vine"] },
  { slug: "vino", slovak: "víno", forms: ["vína", "víne"] },
  { slug: "krasne", slovak: "krásne", forms: [] },
  { slug: "krasny", slovak: "krásny", forms: ["krásne", "krásna"] },
  { slug: "zase", slovak: "zase", forms: [] },
  { slug: "zas", slovak: "zas", hrefSlug: "zase", forms: [] },
  { slug: "dobry-den", slovak: "dobrý deň", forms: [] },
  { slug: "stat", slovak: "stať", forms: ["stal"] },
  { slug: "stat-n", slovak: "štát", forms: ["štátu"] },
];

const index = buildWordLinkIndex(entries);
const go = (query: string) => resolveWordLink(query, index);

describe("word links", () => {
  it("opens the page of the headword as spelled", () => {
    expect(go("víno")).toBe("/dictionary/vino");
    expect(go("Víno")).toBe("/dictionary/vino");
    expect(go("dobrý deň")).toBe("/dictionary/dobry-den");
    expect(go("dobrý_deň")).toBe("/dictionary/dobry-den");
  });

  it("opens the shared page, without a section, when senses share one", () => {
    expect(go("málo")).toBe("/dictionary/malo");
  });

  it("prefers the headword to a form with the same spelling", () => {
    // krásne is the adverb's headword and a form of krásny.
    expect(go("krásne")).toBe("/dictionary/krasne");
  });

  it("finds a headword from its form", () => {
    expect(go("vína")).toBe("/dictionary/vino");
    expect(go("malo")).toBe("/dictionary/mat");
  });

  it("sends a variant spelling to the page that lists it", () => {
    expect(go("zas")).toBe("/dictionary/zase");
  });

  it("finds a word typed without diacritics when only one fits", () => {
    expect(go("vino")).toBe("/dictionary/vino");
    expect(go("krasny")).toBe("/dictionary/krasny");
    // A headword still comes before a form: krasne is the adverb, not krásny.
    expect(go("krasne")).toBe("/dictionary/krasne");
  });

  it("searches when the letters fit more than one page", () => {
    // stat is stať and štát without their diacritics.
    expect(go("stat")).toBe("/search?q=stat");
    expect(go("stať")).toBe("/dictionary/stat");
  });

  it("searches for what it cannot find, and opens the dictionary for nothing", () => {
    expect(go("bathtub")).toBe("/search?q=bathtub");
    expect(go("  ")).toBe("/dictionary");
  });

  it("reads underscores and runs of spaces as one space", () => {
    expect(wordLinkQuery("  dobrý__deň ")).toBe("dobrý deň");
  });

  it("resolves real dictionary words", () => {
    const live = buildWordLinkIndex(buildDictionaryIndexSidecar());
    expect(resolveWordLink("vina", live)).toBe("/dictionary/vina");
    expect(resolveWordLink("vína", live)).toBe("/dictionary/vino");
    expect(resolveWordLink("ďakujem", live)).toBe("/dictionary/dakujem");
    expect(resolveWordLink("dakujem", live)).toBe("/dictionary/dakujem");
  });
});
