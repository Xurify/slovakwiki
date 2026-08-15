import { describe, expect, it } from "vitest";

import { words } from "../dictionary/words";
import {
  findLiveWordForLemma,
  frequencyEntriesMissingFromDictionary,
  lemmaToSlug,
  normalizeLemma,
} from "./index";
import type { FrequencyEntry } from "./types";
import { formatReferencesMarkdown, referenceSources } from "../data-sources/catalog";
import {
  featuredResources,
  learningResources,
  resourceGroups,
  resourceIconUrl,
  resourcesByGroup,
} from "../resources/catalog";
import {
  isLikelyProperNoun,
  parseSnkCountLemmaDump,
  parseSnkLemmaTable,
  selectFrequencyHead,
} from "./snk";

describe("frequency helpers", () => {
  it("normalizes lemmas and builds slugs", () => {
    expect(normalizeLemma("Ďakujem")).toBe("dakujem");
    expect(lemmaToSlug("dobrý deň")).toBe("dobry-den");
    expect(lemmaToSlug("môcť")).toBe("moct");
  });

  it("matches live dictionary entries by lemma", () => {
    expect(findLiveWordForLemma("ahoj", words)?.slug).toBe("ahoj");
    expect(findLiveWordForLemma("ďakujem", words)?.slug).toBe("dakujem");
  });

  it("prefers matching part of speech when a lemma has multiple live entries", () => {
    expect(findLiveWordForLemma("domáci", words, "adjective")?.slug).toBe("domaci");
    expect(findLiveWordForLemma("domáci", words, "noun")?.slug).toBe("domaci-n");
    expect(findLiveWordForLemma("dospelý", words, "noun")?.slug).toBe("dospely");
    expect(findLiveWordForLemma("dospelý", words, "adjective")?.slug).toBe("dospely-a");
  });

  it("links frequency nouns/verbs to curated POS categories", () => {
    expect(findLiveWordForLemma("človek", words, "noun")?.slug).toBe("clovek");
    expect(findLiveWordForLemma("človek", words, "noun")?.category).toBe("Nouns");
    expect(findLiveWordForLemma("človek", words, "noun")?.topics).toContain("People");
    expect(findLiveWordForLemma("mesto", words, "noun")?.category).toBe("Places");
    expect(findLiveWordForLemma("hovoriť", words, "verb")?.slug).toBe("hovorit");
    expect(findLiveWordForLemma("hovoriť", words, "verb")?.category).toBe("Verbs");
    expect(findLiveWordForLemma("hovoriť", words, "verb")?.topics).toContain(
      "Conversation",
    );
  });

  it("does not link diacritic near-misses to the wrong word", () => {
    expect(findLiveWordForLemma("štát", words)?.slovak).not.toBe("stať");
    expect(findLiveWordForLemma("brat", words)?.slovak).not.toBe("brať");
    expect(findLiveWordForLemma("byt", words)?.slovak).not.toBe("byť");
  });

  it("lists frequency lemmas missing from the live dictionary", () => {
    const entries: FrequencyEntry[] = [
      {
        rank: 1,
        lemma: "byť",
        partOfSpeech: "verb",
        source: "test",
        sourceUrl: "https://example.com",
      },
      {
        rank: 2,
        lemma: "neexistujuceslovo",
        partOfSpeech: "verb",
        source: "test",
        sourceUrl: "https://example.com",
      },
    ];

    const missing = frequencyEntriesMissingFromDictionary(entries, words);
    expect(missing.map((entry) => entry.lemma)).toEqual(["neexistujuceslovo"]);
  });
});

describe("SNK frequency import", () => {
  it("parses lemma tables from SNK HTML", () => {
    const html = `
      <table>
        <tr><th>Nr.</th><th>Form</th><th>Count</th></tr>
        <tr><td>1</td><td>byť</td><td>100</td></tr>
        <tr><td>2</td><td>mať</td><td>50</td></tr>
      </table>
    `;

    const entries = parseSnkLemmaTable(html, "verb", "https://example.com/verbs");
    expect(entries).toEqual([
      {
        rank: 1,
        lemma: "byť",
        partOfSpeech: "verb",
        count: 100,
        source: "Slovak National Corpus (SNK)",
        sourceUrl: "https://example.com/verbs",
      },
      {
        rank: 2,
        lemma: "mať",
        partOfSpeech: "verb",
        count: 50,
        source: "Slovak National Corpus (SNK)",
        sourceUrl: "https://example.com/verbs",
      },
    ]);
  });

  it("skips single-letter junk lemmas", () => {
    const html = `
      <table>
        <tr><th>Nr.</th><th>Form</th><th>Count</th></tr>
        <tr><td>1</td><td>byť</td><td>100</td></tr>
        <tr><td>2</td><td>d</td><td>9</td></tr>
      </table>
    `;

    const entries = parseSnkLemmaTable(html, "noun", "https://example.com/nouns");
    expect(entries.map((entry) => entry.lemma)).toEqual(["byť"]);
  });

  it("parses and re-ranks count + lemma dumps", () => {
    const entries = parseSnkCountLemmaDump(
      "10 večera\n30 človek\n1 x\n20 dom\n",
      "noun",
      "https://example.com/nouns.bz2",
    );

    expect(entries.map((entry) => [entry.rank, entry.lemma, entry.count])).toEqual([
      [1, "človek", 30],
      [2, "dom", 20],
      [3, "večera", 10],
    ]);
  });

  it("filters likely proper nouns while keeping the allowlist", () => {
    expect(isLikelyProperNoun("Bratislava")).toBe(true);
    expect(isLikelyProperNoun("USA")).toBe(false);
    expect(isLikelyProperNoun("večera")).toBe(false);

    const entries = parseSnkCountLemmaDump(
      "30 Bratislava\n20 človek\n10 Peter\n",
      "noun",
      "https://example.com/nouns.bz2",
    );
    const head = selectFrequencyHead(entries, 2, { skipProperNouns: true });

    expect(head.map((entry) => [entry.rank, entry.lemma])).toEqual([
      [1, "Bratislava"],
      [2, "človek"],
    ]);
  });
});

describe("references", () => {
  it("documents Tatoeba, SNK, and JÚĽŠ links", () => {
    const markdown = formatReferencesMarkdown();
    expect(markdown).toContain("https://tatoeba.org/en/downloads");
    expect(markdown).toContain("https://downloads.tatoeba.org/exports/");
    expect(markdown).toContain("https://api.tatoeba.org/");
    expect(markdown).toContain("korpus.sk");
    expect(markdown).toContain("slovnik.juls.savba.sk");
    expect(referenceSources.some((source) => source.id === "tatoeba")).toBe(true);
  });
});

describe("resources", () => {
  it("keeps curated learning resources in known groups", () => {
    const groupIds = new Set(resourceGroups.map((group) => group.id));

    expect(learningResources.length).toBeGreaterThan(20);
    expect(featuredResources().length).toBeGreaterThan(3);

    for (const resource of learningResources) {
      expect(groupIds.has(resource.group)).toBe(true);
      expect(resource.href.startsWith("http")).toBe(true);
      expect(resource.name.trim().length).toBeGreaterThan(0);
      expect(resource.summary.trim().length).toBeGreaterThan(0);
      expect(resourceIconUrl(resource.id).startsWith("/icons/resources/")).toBe(true);
    }

    expect(resourceIconUrl("ling-slovak")).toBe("/icons/resources/ling-slovak.svg");
    expect(resourceIconUrl("yt-learn-slovak")).toBe("/icons/resources/youtube.png");
    expect(resourceIconUrl("slovake-grammar")).toBe("/icons/resources/slovake-eu.png");

    expect(resourcesByGroup("courses").some((r) => r.id === "slovake-eu")).toBe(true);
    expect(resourcesByGroup("grammar").some((r) => r.id === "omniglot-slovak")).toBe(
      true,
    );
    expect(resourcesByGroup("grammar").some((r) => r.id === "ucimesaslovencinu")).toBe(
      true,
    );
    expect(resourcesByGroup("adjacent").some((r) => r.id === "duolingo-czech")).toBe(
      true,
    );
  });
});
