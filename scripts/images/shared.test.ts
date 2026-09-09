import { describe, expect, it } from "vitest";

import {
  allowsCommonsAutoPromote,
  allowsWikiPageimage,
  commonsFileLooksCartoon,
  commonsTitleMatchesGloss,
  fileMatchesOnly,
  glossLooksConcrete,
  existingImageNeedsUpgrade,
  isBusySceneTitle,
  isEditorialCartoonTitle,
  isRejectedCommonsTitle,
  pageimageAcceptable,
  nounCommonsQueries,
  pickTitledCommonsHit,
  prefersCartoonCommons,
  slugMatchesOnly,
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

describe("allowsWikiPageimage", () => {
  it("blocks abstract / general nouns (chyba-like)", () => {
    expect(allowsWikiPageimage(target({ category: "Nouns", gloss: "mistake" }))).toBe(
      false,
    );
    expect(
      allowsWikiPageimage(
        target({ category: "Verbs", gloss: "to do", english: "to do" }),
      ),
    ).toBe(false);
  });

  it("allows concrete learner themes", () => {
    expect(
      allowsWikiPageimage(
        target({ category: "Nouns", topics: ["Food"], gloss: "lunch" }),
      ),
    ).toBe(true);
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
    ).toEqual(["lunch", "lunch food", "lunch meal", "lunch dish", "lunch cartoon"]);
    expect(
      nounCommonsQueries(
        target({ category: "Nouns", topics: ["People"], gloss: "teacher" }),
      ),
    ).toEqual(["teacher", "teacher cartoon", "teacher person", "teacher people"]);
  });
});

describe("commons title filters", () => {
  it("matches gloss at start of filename", () => {
    expect(commonsTitleMatchesGloss("Lunch (27825792571).jpg", "lunch")).toBe(true);
    expect(commonsTitleMatchesGloss("Dinner plate.jpg", "lunch")).toBe(false);
    expect(commonsTitleMatchesGloss("Cake slice.jpg", "cake")).toBe(true);
    expect(commonsTitleMatchesGloss("CakeCleveland.jpg", "cake")).toBe(false);
    expect(commonsTitleMatchesGloss("Cake_Cleveland.jpg", "cake")).toBe(false);
    expect(commonsTitleMatchesGloss("Analyst cartoon.svg", "analyst")).toBe(true);
    expect(commonsTitleMatchesGloss("The Graduate Title.png", "graduate")).toBe(false);
    expect(
      commonsTitleMatchesGloss("The Graduate Title.png", "graduate", {
        allowArticle: true,
      }),
    ).toBe(false);
    expect(commonsTitleMatchesGloss("Foo Absolute Bar.jpg", "absolute")).toBe(false);
  });

  it("rejects busy scenes; keeps a single-subject car", () => {
    expect(isBusySceneTitle("20150516Stau_ACDC_Hockenheim2.jpg")).toBe(true);
    expect(isBusySceneTitle("Traditional_picnic_party.jpg")).toBe(true);
    expect(isBusySceneTitle("Good_Food_Display_-_NCI_Visuals_Online.jpg")).toBe(true);
    expect(isBusySceneTitle("2005_Toyota_Corolla_1.4_T3.jpg")).toBe(false);
    expect(isBusySceneTitle("Roasted_coffee_beans.jpg")).toBe(false);
    expect(isBusySceneTitle("Koláčky.jpg")).toBe(false);
  });

  it("rejects house pageimages that are palaces / gardens", () => {
    expect(pageimageAcceptable("Katsura_Imperial_Villa_in_Spring.jpg", "house")).toBe(
      false,
    );
    expect(pageimageAcceptable("Small house front.jpg", "house")).toBe(true);
  });

  it("rejects icons / flags / nsfw / entertainment titles", () => {
    expect(isRejectedCommonsTitle("File:Lunch icon.svg")).toBe(true);
    expect(
      isRejectedCommonsTitle("File:Confident Cartoon Businessman Presenting A Graph.svg"),
    ).toBe(false);
    expect(isRejectedCommonsTitle("File:Flag_of_Slovakia.svg")).toBe(true);
    expect(isRejectedCommonsTitle("File:The Graduate Title.png")).toBe(true);
    expect(isRejectedCommonsTitle("File:Lunch meal.jpg")).toBe(false);
    expect(isRejectedCommonsTitle("File:Sans Guilt LB sample.png")).toBe(true);
    expect(isRejectedCommonsTitle("File:Read the fucking manual.png")).toBe(true);
    expect(isRejectedCommonsTitle("File:Cartoon Cat Running.gif")).toBe(true);
    expect(isRejectedCommonsTitle("File:Europe in 1923.jpg")).toBe(true);
    expect(
      isRejectedCommonsTitle(
        "File:Europe_orthographic_Caucasus_Urals_boundary_(with_borders).svg",
      ),
    ).toBe(true);
  });

  it("rejects editorial / political cartoons, keeps learner clipart", () => {
    expect(
      isEditorialCartoonTitle("The political cartoon for the year 1775 LCCN97514880.jpg"),
    ).toBe(true);
    expect(isEditorialCartoonTitle("Trusts Are the Original Sin cartoon 1899.png")).toBe(
      true,
    );
    expect(isEditorialCartoonTitle("Leonardo - St. Anne cartoon.jpg")).toBe(true);
    expect(isRejectedCommonsTitle("File:Anti Hitler Egpytian cartoon 2.png")).toBe(true);
    expect(commonsFileLooksCartoon("Cake-cartoon.jpg")).toBe(true);
    expect(commonsFileLooksCartoon("Analyst cartoon.svg")).toBe(true);
    expect(commonsFileLooksCartoon("Trusts Are the Original Sin cartoon 1899.png")).toBe(
      false,
    );
  });

  it("prefers photos for food, cartoons for people", () => {
    expect(
      prefersCartoonCommons(
        target({ category: "Nouns", topics: ["Food"], gloss: "cake" }),
      ),
    ).toBe(false);
    expect(
      prefersCartoonCommons(
        target({ category: "Nouns", topics: ["People"], gloss: "teacher" }),
      ),
    ).toBe(true);
    const hits = [{ fileTitle: "Cake-cartoon.jpg" }, { fileTitle: "Cake slice.jpg" }];
    expect(
      pickTitledCommonsHit(hits, "cake", { allowArticle: false, preferCartoon: false })
        ?.fileTitle,
    ).toBe("Cake slice.jpg");
    expect(
      pickTitledCommonsHit(hits, "cake", { allowArticle: false, preferCartoon: true })
        ?.fileTitle,
    ).toBe("Cake-cartoon.jpg");
  });

  it("upgrades adjectives / verbs / bad filenames; keeps themed noun photos", () => {
    expect(
      existingImageNeedsUpgrade(
        "Red flag.jpg",
        "red",
        target({ category: "Adjectives", gloss: "red" }),
      ),
    ).toBe(true);
    expect(
      existingImageNeedsUpgrade(
        "To run.jpg",
        "run",
        target({ category: "Verbs", gloss: "to run", english: "to run" }),
      ),
    ).toBe(true);
    expect(
      existingImageNeedsUpgrade(
        "Roasted_coffee_beans.jpg",
        "coffee",
        target({ category: "Nouns", topics: ["Food"], gloss: "coffee" }),
      ),
    ).toBe(false);
    expect(existingImageNeedsUpgrade("Europe in 1923.jpg", "europe")).toBe(true);
  });

  it("matches --only by exact slug, not substring", () => {
    expect(slugMatchesOnly("auto", "auto")).toBe(true);
    expect(slugMatchesOnly("autobus", "auto")).toBe(false);
    expect(slugMatchesOnly("rim", "rim")).toBe(true);
    expect(slugMatchesOnly("diskriminacia", "rim")).toBe(false);
    expect(slugMatchesOnly("kava", "kolac,kava")).toBe(true);
    expect(fileMatchesOnly("auto.jpg", "auto", "auto")).toBe(true);
    expect(fileMatchesOnly("autobus.jpg", "autobus", "auto")).toBe(false);
    expect(fileMatchesOnly("rimsky.jpg", "rimsky", "rim")).toBe(false);
    expect(fileMatchesOnly("analytik.png", "analytik", "analytik")).toBe(true);
  });
});
