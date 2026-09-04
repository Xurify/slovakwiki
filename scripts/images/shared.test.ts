import { describe, expect, it } from "vitest";

import {
  allowsCommonsAutoPromote,
  commonsTitleMatchesGloss,
  glossLooksConcrete,
  isRejectedCommonsTitle,
  nounCommonsQueries,
  type ImageTarget,
} from "./shared";

function target(
  partial: Partial<ImageTarget> & Pick<ImageTarget, "category" | "gloss">,
): ImageTarget {
  return {
    english: partial.english ?? partial.gloss,
    slovak: partial.slovak ?? "x",
    slug: partial.slug ?? "x",
    ...partial,
  };
}

describe("glossLooksConcrete", () => {
  it("accepts concrete heads", () => {
    expect(glossLooksConcrete("lunch")).toBe(true);
    expect(glossLooksConcrete("apple")).toBe(true);
    expect(glossLooksConcrete("train station")).toBe(true);
  });

  it("rejects abstract heads", () => {
    expect(glossLooksConcrete("absence")).toBe(false);
    expect(glossLooksConcrete("qualification")).toBe(false);
    expect(glossLooksConcrete("happiness")).toBe(false);
    expect(glossLooksConcrete("system")).toBe(false);
  });
});

describe("allowsCommonsAutoPromote", () => {
  it("blocks verbs, adjectives, and general nouns", () => {
    expect(
      allowsCommonsAutoPromote(
        target({ category: "Verbs", gloss: "to eat", english: "to eat" }),
      ),
    ).toBe(false);
    expect(
      allowsCommonsAutoPromote(target({ category: "Adjectives", gloss: "red" })),
    ).toBe(false);
    expect(allowsCommonsAutoPromote(target({ category: "Nouns", gloss: "bread" }))).toBe(
      false,
    );
  });

  it("allows Food / Places; blocks tiny Essentials glosses", () => {
    expect(
      allowsCommonsAutoPromote(
        target({ category: "Nouns", topics: ["Food"], gloss: "lunch" }),
      ),
    ).toBe(true);
    expect(
      allowsCommonsAutoPromote(target({ category: "Places", gloss: "Britain" })),
    ).toBe(true);
    expect(
      allowsCommonsAutoPromote(
        target({ category: "Phrases", topics: ["Essentials"], gloss: "yes" }),
      ),
    ).toBe(false);
  });
});

describe("nounCommonsQueries", () => {
  it("adds meal queries for Food", () => {
    expect(
      nounCommonsQueries(target({ category: "Nouns", topics: ["Food"], gloss: "lunch" })),
    ).toEqual(["lunch", "lunch food", "lunch meal", "lunch dish"]);
  });
});

describe("commons title filters", () => {
  it("matches gloss at start of filename", () => {
    expect(commonsTitleMatchesGloss("Lunch (27825792571).jpg", "lunch")).toBe(true);
    expect(commonsTitleMatchesGloss("Dinner plate.jpg", "lunch")).toBe(false);
    expect(commonsTitleMatchesGloss("The Graduate Title.png", "graduate")).toBe(false);
    expect(
      commonsTitleMatchesGloss("The Graduate Title.png", "graduate", {
        allowArticle: true,
      }),
    ).toBe(true);
    expect(commonsTitleMatchesGloss("Foo Absolute Bar.jpg", "absolute")).toBe(false);
  });

  it("rejects icons / flags / nsfw / entertainment titles", () => {
    expect(isRejectedCommonsTitle("File:Lunch icon.svg")).toBe(true);
    expect(isRejectedCommonsTitle("File:Flag_of_Slovakia.svg")).toBe(true);
    expect(isRejectedCommonsTitle("File:The Graduate Title.png")).toBe(true);
    expect(isRejectedCommonsTitle("File:Lunch meal.jpg")).toBe(false);
    expect(isRejectedCommonsTitle("File:Sans Guilt LB sample.png")).toBe(true);
    expect(isRejectedCommonsTitle("File:Read the fucking manual.png")).toBe(true);
  });
});
