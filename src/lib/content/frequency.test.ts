import { describe, expect, it } from "vitest";

import { words } from "./data";
import {
  findLiveWordForLemma,
  frequencyEntriesMissingFromDictionary,
  lemmaToSlug,
  normalizeLemma,
} from "./frequency";
import type { FrequencyEntry } from "./frequency-types";
import { formatReferencesMarkdown, referenceSources } from "./references";
import { parseSnkLemmaTable } from "./snk-frequency";

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

  it("does not link diacritic near-misses to the wrong word", () => {
    expect(findLiveWordForLemma("štát", words)?.slovak).not.toBe("stať");
    expect(findLiveWordForLemma("brat", words)?.slovak).not.toBe("brať");
    expect(findLiveWordForLemma("byt", words)?.slovak).not.toBe("byť");
  });

  it("lists frequency lemmas missing from the live dictionary", () => {
    const entries: FrequencyEntry[] = [
      {
        rank: 1,
        lemma: "ahoj",
        pos: "verb",
        source: "test",
        sourceUrl: "https://example.com",
      },
      {
        rank: 2,
        lemma: "neexistujuceslovo",
        pos: "verb",
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
        pos: "verb",
        count: 100,
        source: "Slovak National Corpus (SNK)",
        sourceUrl: "https://example.com/verbs",
      },
      {
        rank: 2,
        lemma: "mať",
        pos: "verb",
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
