import { describe, expect, it } from "vitest";

import {
  mergeSearchResults,
  scoreDictionaryEntry,
  type DictionaryIndexEntry,
} from "./dictionary-lookup";
import type { PagefindResultData } from "./pagefind-client";

function result(url: string, title: string): PagefindResultData {
  return {
    url,
    excerpt: "",
    meta: { title, kind: "word" },
  };
}

function entry(
  slug: string,
  slovak: string,
  english: string,
  forms: string[] = [],
): DictionaryIndexEntry {
  return {
    slug,
    slovak,
    english,
    category: "Phrases",
    ...(forms.length ? { forms } : {}),
  };
}

describe("dictionary lookup scoring", () => {
  it("ranks exact lemma matches highest", () => {
    const ahoj = entry("ahoj", "ahoj", "hello; hi; bye");
    expect(scoreDictionaryEntry(ahoj, "ahoj")).toBe(5);
  });

  it("does not match english gloss substrings like someone for som", () => {
    const napadnut = entry("napadnut", "napadnúť", "to attack (to someone)");
    expect(scoreDictionaryEntry(napadnut, "som")).toBe(0);
  });

  it("does not match slovak lemma substrings for short queries", () => {
    const pisomny = entry("pisomny", "písomný", "written");
    expect(scoreDictionaryEntry(pisomny, "som")).toBe(0);
  });

  it("matches conjugated forms when present on the index entry", () => {
    const byt = entry("byt", "byť", "to be", ["som", "si", "je", "sme", "ste", "sú"]);
    expect(scoreDictionaryEntry(byt, "som")).toBe(5);
  });

  it("matches english gloss tokens without substring bleed", () => {
    const hello = entry("ahoj", "ahoj", "hello; hi; bye");
    expect(scoreDictionaryEntry(hello, "hello")).toBe(3);
    expect(scoreDictionaryEntry(hello, "hell")).toBe(0);
    expect(scoreDictionaryEntry(hello, "hi")).toBe(3);
  });
});

describe("dictionary lookup merge", () => {
  it("prefers dictionary hits ahead of Pagefind fuzzy matches", () => {
    const dictionary = [result("/dictionary/ahoj", "ahoj")];
    const pagefind = [
      result("/dictionary/dakujem", "ďakujem"),
      result("/grammar/cases/nominative", "Nominative"),
    ];

    expect(mergeSearchResults(dictionary, pagefind)).toEqual([
      result("/dictionary/ahoj", "ahoj"),
      result("/dictionary/dakujem", "ďakujem"),
      result("/grammar/cases/nominative", "Nominative"),
    ]);
  });

  it("dedupes by url", () => {
    const hit = result("/dictionary/ahoj", "ahoj");
    expect(mergeSearchResults([hit], [hit])).toEqual([hit]);
  });

  it("keeps noun and adverb sense hashes as distinct urls", () => {
    const noun = result("/dictionary/malo#noun", "málo");
    const adverb = result("/dictionary/malo#adverb", "málo");
    expect(mergeSearchResults([noun], [adverb])).toEqual([noun, adverb]);
  });
});
