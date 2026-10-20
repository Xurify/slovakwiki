import { describe, expect, it } from "vitest";

import { buildDictionaryIndexSidecar } from "$lib/catalog/dictionary/browse";
import { buildSearchTopics } from "$lib/catalog/search/topics";

import { prepareEntry } from "./dictionary-lookup";
import { suggestSpelling } from "./did-you-mean";
import {
  buildSpellingCandidates,
  buildWordResults,
  groupTopicHits,
  markMatches,
  pickExample,
} from "./search-page-model";

const dictionary = buildDictionaryIndexSidecar().map(prepareEntry);
const candidates = buildSpellingCandidates(dictionary);

function bestLemma(query: string): string | undefined {
  const { best } = buildWordResults(query, dictionary);
  if (!best) return undefined;
  return best.type === "pronoun" ? best.pronoun.lemma : best.entry.slovak;
}

describe("search page: test queries", () => {
  it("tento → the pronoun card, with tentoraz and tentokrát as other words", () => {
    const { best, others } = buildWordResults("tento", dictionary);
    expect(best?.type).toBe("pronoun");
    expect(bestLemma("tento")).toBe("tento");
    expect(best?.formOf).toBeUndefined();

    const otherLemmas = others.map((other) =>
      other.type === "word" ? other.match.entry.slovak : other.pronoun.lemma,
    );
    expect(otherLemmas).toEqual(expect.arrayContaining(["tentoraz", "tentokrát"]));
    expect(otherLemmas).not.toContain("tento");
  });

  it("the pronoun card links the dictionary entry spelled the same", () => {
    const { best } = buildWordResults("tento", dictionary);
    expect(best?.entry?.slovak).toBe("tento");
  });

  it("tohto → form of tento: genitive and animate accusative", () => {
    const { best } = buildWordResults("tohto", dictionary);
    expect(best?.type).toBe("pronoun");
    if (best?.type !== "pronoun") return;
    expect(best.pronoun.lemma).toBe("tento");
    expect(best.formOf?.description).toBe(
      "genitive (masculine, neuter) · accusative (masculine animate)",
    );
  });

  it("groups cases that share genders", () => {
    const { best } = buildWordResults("mojej", dictionary);
    expect(best?.formOf).toEqual({
      form: "mojej",
      description: "genitive, dative, locative (feminine)",
    });
  });

  it("finds pronoun forms without diacritics", () => {
    expect(bestLemma("mojej")).toBe("môj");
    expect(bestLemma("tamtu")).toBe("tamten");
  });

  it("ahoj and dakujem → their dictionary words", () => {
    expect(bestLemma("ahoj")).toBe("ahoj");
    expect(bestLemma("dakujem")).toBe("ďakujem");
  });

  it("an inflected dictionary form names its lemma", () => {
    const { best } = buildWordResults("knihu", dictionary);
    expect(best?.type).toBe("word");
    if (best?.type !== "word") return;
    expect(best.entry.slovak).toBe("kniha");
    expect(best.formOf?.form).toBe("knihu");
  });

  it("this → the tento card, not repeated as another word", () => {
    const { best, others } = buildWordResults("this", dictionary);
    expect(best?.type).toBe("pronoun");
    expect(bestLemma("this")).toBe("tento");
    const tento = others.filter((other) =>
      other.type === "word"
        ? other.match.entry.slovak === "tento"
        : other.pronoun.lemma === "tento",
    );
    expect(tento).toHaveLength(0);
  });

  it("an English meaning names the Slovak word", () => {
    expect(bestLemma("house")).toBe("dom");
  });

  it("zeny → žena, without words that only contain zeny mid-word", () => {
    const { best, others } = buildWordResults("zeny", dictionary);
    expect(best?.entry?.slovak).toBe("žena");
    const lemmas = others.map((other) =>
      other.type === "word" ? other.match.entry.slovak : other.pronoun.lemma,
    );
    expect(lemmas).not.toContain("prirodzený");
    expect(lemmas).not.toContain("kožený");
  });

  it("personal pronoun forms name their lemma", () => {
    expect(bestLemma("mna")).toBe("ja");
    expect(bestLemma("tebe")).toBe("ty");
    expect(bestLemma("ho")).toBe("on");
    expect(bestLemma("ju")).toBe("ona");
    expect(bestLemma("ony")).toBe("oni");
    expect(bestLemma("sebou")).toBe("seba");
  });

  it("describes long, short and after-preposition personal forms", () => {
    const formDescription = (query: string): string | undefined => {
      const { best } = buildWordResults(query, dictionary);
      return best?.type === "pronoun" ? best.formOf?.description : undefined;
    };
    expect(formDescription("mňa")).toBe("genitive, accusative");
    expect(formDescription("mne")).toBe("dative · locative (after a preposition)");
    expect(formDescription("neho")).toBe("genitive, accusative (after a preposition)");
  });

  it("nás is a form of my, but náš keeps its own card", () => {
    expect(bestLemma("nas")).toBe("náš");
    const { others } = buildWordResults("nas", dictionary);
    expect(
      others.some((other) => other.type === "pronoun" && other.pronoun.lemma === "my"),
    ).toBe(true);
  });

  it("tohot → did you mean tohto", () => {
    expect(bestLemma("tohot")).toBeUndefined();
    expect(suggestSpelling("tohot", candidates)?.text).toBe("tohto");
  });

  it("missing diacritics never trigger a suggestion", () => {
    expect(suggestSpelling("dakujem", candidates)).toBeNull();
    expect(suggestSpelling("tohto", candidates)).toBeNull();
  });
});

describe("topic rows", () => {
  const topics = buildSearchTopics();

  it("collapses lesson, practice and grammar for demonstratives into one row", () => {
    const hit = (url: string, kind: string) => ({
      url,
      excerpt: "",
      weighted_locations: [],
      meta: { kind, title: url },
    });
    const rows = groupTopicHits(
      [
        hit("/grammar/demonstratives", "grammar"),
        hit("/practice/demonstratives", "practice"),
        hit("/lessons/grammar/demonstratives", "lesson"),
        hit("/grammar/cases/genitive", "case"),
      ],
      topics,
    );

    expect(rows).toHaveLength(2);
    expect(rows[0]?.links.map((link) => link.label)).toEqual([
      "Lesson",
      "Practice",
      "Grammar",
    ]);
    expect(rows[0]?.slovak).toBe("ukazovacie zámená");
    expect(rows[1]?.links).toEqual([
      { label: "Case", kind: "case", href: "/grammar/cases/genitive" },
    ]);
  });

  it("every pronoun topic exists", () => {
    const ids = new Set(topics.map((topic) => topic.id));
    expect(ids.has("grammar/demonstratives")).toBe(true);
    expect(ids.has("grammar/possessives")).toBe(true);
  });
});

describe("example matches", () => {
  it("marks the matched word, ignoring diacritics", () => {
    expect(markMatches("Kto je zodpovedný za tento problém?", "tento")).toEqual([
      { text: "Kto je zodpovedný za ", mark: false },
      { text: "tento", mark: true },
      { text: " problém?", mark: false },
    ]);
    expect(markMatches("Ďakujem pekne.", "dakujem")?.[0]).toEqual({
      text: "Ďakujem",
      mark: true,
    });
  });

  it("does not mark a word that only contains the query", () => {
    expect(markMatches("Tentoraz nie.", "tento")).toBeNull();
    expect(markMatches("Tentoraz nie.", "tento", { prefix: true })?.[0]).toEqual({
      text: "Tentoraz",
      mark: true,
    });
  });

  it("prefers a whole-word Slovak hit over a prefix hit", () => {
    const picked = pickExample(
      [
        { slovak: "Tentoraz áno.", english: "This time yes." },
        { slovak: "Tento liek pomáha.", english: "This medicine helps." },
      ],
      "tento",
    );
    expect(picked?.slovak.find((segment) => segment.mark)?.text).toBe("Tento");
  });
});
