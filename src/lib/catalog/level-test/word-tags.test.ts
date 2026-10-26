import { describe, expect, it } from "vitest";

import { tagWord } from "./word-tags";

describe("tagWord", () => {
  it("finds the lemma of an inflected noun", () => {
    expect(tagWord("manželkou")).toMatchObject({ class: "noun", lemma: "manželka" });
  });

  it("keeps a headword over a form of another word", () => {
    expect(tagWord("potom").class).not.toBe("noun");
  });

  it("sends forms of byť to the byť page", () => {
    expect(tagWord("sme")).toMatchObject({ class: "verb", topic: "byt-present" });
  });

  it("knows a demonstrative's cases", () => {
    const tag = tagWord("tohto");
    expect(tag).toMatchObject({ class: "pronoun", topic: "demonstratives" });
    expect(tag.cases).toEqual(expect.arrayContaining(["genitive"]));
  });

  it("keeps function words to prepositions, conjunctions and particles", () => {
    expect(tagWord("na").class).toBe("functionWord");
    expect(tagWord("že").class).toBe("functionWord");
    expect(tagWord("ktorého").class).toBe("pronoun");
    expect(tagWord("každou").class).toBe("pronoun");
    expect(tagWord("každodenné").class).not.toBe("pronoun");
    expect(tagWord("štvrtej")).toMatchObject({
      class: "numeral",
      topic: "numbers-and-numerals",
    });
  });

  it("keeps prepositions, by and indefinite pronouns out of nouns and verbs", () => {
    expect(tagWord("Vďaka").class).toBe("functionWord");
    expect(tagWord("by").class).toBe("functionWord");
    expect(tagWord("málo").class).not.toBe("noun");
    for (const word of ["iní", "nikoho", "niekoho", "ničím", "ničoho", "nikomu"]) {
      expect(tagWord(word).class, word).toBe("pronoun");
    }
  });

  it("reads a form after sa as the reflexive verb", () => {
    expect(tagWord("zdravia", { previous: "sa" })).toMatchObject({
      class: "verb",
      lemma: "zdraviť",
    });
    expect(tagWord("zdravia").class).toBe("noun");
  });

  it("knows every form of tretí", () => {
    for (const word of ["tretí", "tretieho", "tretej", "tretiu", "treťom", "tretími"]) {
      expect(tagWord(word).class, word).toBe("numeral");
    }
  });

  it("tags comparatives, negated adjectives and participles as adjectives", () => {
    expect(tagWord("najväčším")).toMatchObject({ class: "adjective", lemma: "veľký" });
    expect(tagWord("vyššieho")).toMatchObject({ class: "adjective", lemma: "vysoký" });
    for (const word of ["unavené", "nepravdivé", "zrozumiteľné", "tlačený", "kariérny"]) {
      expect(tagWord(word).class, word).toBe("adjective");
    }
  });

  it("reads an -e form as the adjective only before what it agrees with", () => {
    const pairs = [
      ["nižšie", "úrody"],
      ["hlbšie", "názorové"],
      ["odolnejšie", "plodiny"],
      ["šetrnejšie", "spôsoby"],
      ["sociálne", "siete"],
    ];
    for (const [word = "", next] of pairs) {
      expect(tagWord(word, { next }).class, word).toBe("adjective");
    }
    expect(tagWord("nižšie").class).toBe("other");
    expect(tagWord("mimoriadne", { next: "pekný" }).class).toBe("other");
    expect(tagWord("stále", { next: "lepšie" }).class).toBe("other");
    expect(tagWord("lepšie", { next: "spať" }).class).toBe("other");
  });

  it("prefers the lemma an item was built from", () => {
    expect(tagWord("rade", { slug: "rad-n" })).toMatchObject({ lemma: "rad" });
    expect(tagWord("štúdia", { slug: "studium" })).toMatchObject({ lemma: "štúdium" });
    expect(tagWord("kritika", { slug: "kritik" })).toMatchObject({ lemma: "kritik" });
    expect(tagWord("rade", { slug: "kritik" })).toMatchObject({ lemma: "rada" });
  });
});
