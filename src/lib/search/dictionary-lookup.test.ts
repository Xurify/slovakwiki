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
    weighted_locations: [],
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

  it("matches multi-word english gloss phrases", () => {
    const dakujem = entry("dakujem", "ďakujem", "thank you; thanks");
    expect(scoreDictionaryEntry(dakujem, "thank you")).toBe(3);
    expect(scoreDictionaryEntry(dakujem, "thanks")).toBe(3);
    expect(scoreDictionaryEntry(dakujem, "thank")).toBe(3);

    const hovorit = entry("hovorit", "hovoriť", "to speak; to talk");
    expect(scoreDictionaryEntry(hovorit, "to speak")).toBe(3);
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

  it("drops pagefind hits whose title does not contain the query", () => {
    const dictionary = [result("/dictionary/kava", "káva")];
    const pagefind = [
      result("/dictionary/kava", "káva"),
      result("/dictionary/alebo", "alebo"),
      result("/dictionary/minuta", "minúta"),
    ];

    expect(mergeSearchResults(dictionary, pagefind, 8, "kava")).toEqual([
      result("/dictionary/kava", "káva"),
    ]);
  });

  it("keeps noun and adverb sense hashes as distinct urls", () => {
    const noun = result("/dictionary/malo#noun", "málo");
    const adverb = result("/dictionary/malo#adverb", "málo");
    expect(mergeSearchResults([noun], [adverb])).toEqual([noun, adverb]);
  });

  it("surfaces grammar topic hits ahead of English-gloss or prefix dictionary hits", () => {
    const aspektWord: PagefindResultData = {
      url: "/dictionary/aspekt",
      excerpt: "",
      weighted_locations: [],
      meta: { title: "aspekt", summary: "aspect", kind: "word" },
    };
    const aspectGrammar: PagefindResultData = {
      url: "/grammar/aspect",
      excerpt: "",
      weighted_locations: [{ weight: 6 }],
      meta: {
        title: "Aspect: imperfective and perfective",
        summary:
          "Most Slovak verbs come in imperfective and perfective pairs — marking whether an action is ongoing and repeated, or a single completed result.",
        kind: "grammar",
      },
    };

    expect(mergeSearchResults([aspektWord], [aspectGrammar], 8, "aspect")).toEqual([
      aspectGrammar,
      aspektWord,
    ]);
    expect(mergeSearchResults([], [aspectGrammar], 8, "imperfective")).toEqual([
      aspectGrammar,
    ]);
    expect(mergeSearchResults([], [aspectGrammar], 8, "perfective")).toEqual([
      aspectGrammar,
    ]);
    expect(
      mergeSearchResults(
        [result("/dictionary/vidiet", "vidieť")],
        [aspectGrammar],
        8,
        "vid",
      ),
    ).toEqual([aspectGrammar, result("/dictionary/vidiet", "vidieť")]);
  });
});
