import { describe, expect, it } from "vitest";

import {
  isAcceptableCorpusExample,
  isCleanExample,
  isDamagedExampleTemplate,
  isWeakFillTemplate,
  isWellFormedExample,
} from "./example-quality";

describe("example quality", () => {
  it("allows ordinary learner sentences", () => {
    expect(isCleanExample("Kedy môžeš prísť?", "When can you come?")).toBe(true);
    expect(isCleanExample("Mám rád knihy.", "I like books.")).toBe(true);
    expect(isCleanExample("Pes má hustú srsť.", "The dog has thick fur.")).toBe(true);
    expect(isCleanExample("Toto je inštitúcia.", "This is an institution.")).toBe(true);
    expect(isCleanExample("Mám úsporný režim.", "I have an economical regime.")).toBe(
      true,
    );
    expect(isCleanExample("To je sporný bod.", "That is a disputed point.")).toBe(true);
  });

  it("blocks crude and sexual sentences", () => {
    expect(isCleanExample("I ženy chcú mať sex.", "Women want to have sex too.")).toBe(
      false,
    );
    expect(isCleanExample("Celú noc jebali.", "They fucked all night long.")).toBe(false);
    expect(
      isCleanExample(
        "Ja som príliš starý na tieto sračky.",
        "I'm too old for that shit.",
      ),
    ).toBe(false);
    expect(
      isCleanExample(
        "To nie je umenie. To je vagína so zubami.",
        "That is not art. That is a vagina with teeth.",
      ),
    ).toBe(false);
    expect(
      isCleanExample(
        "Kvôli bezpečnosti našich detí, nenavštevujte porno stránky.",
        "For the safety of our children, please do not enter porn sites.",
      ),
    ).toBe(false);
  });

  it("rejects malformed and glossary-like pairs", () => {
    expect(isWellFormedExample("krátke", "short")).toBe(false);
    expect(isWellFormedExample("Slovo (imperfective).", "Word (imperfective).")).toBe(
      false,
    );
    expect(isWellFormedExample("A | B.", "A | B.")).toBe(false);
    expect(isWellFormedExample("Rovnaký text.", "Rovnaký text.")).toBe(false);
    expect(isWellFormedExample("Kedy môžeš prísť?", "When can you come?")).toBe(true);
  });

  it("requires both safety and structure for corpus acceptance", () => {
    expect(isAcceptableCorpusExample("Kedy môžeš prísť?", "When can you come?")).toBe(
      true,
    );
    expect(
      isAcceptableCorpusExample("Celú noc jebali.", "They fucked all night long."),
    ).toBe(false);
    expect(isAcceptableCorpusExample("krátke", "short")).toBe(false);
  });

  it("flags damaged fill-template residue", () => {
    expect(isDamagedExampleTemplate("Hľadám medaila.", "medaila")).toBe(true);
    expect(isDamagedExampleTemplate("Hľadám výskumný byt.")).toBe(true);
    expect(isDamagedExampleTemplate("Potrebujeme netradičný plán.")).toBe(true);
    expect(isDamagedExampleTemplate("To je oravský podnik.")).toBe(true);
    expect(isDamagedExampleTemplate("Toto je kariéra.", "kariéra")).toBe(true);
    expect(isDamagedExampleTemplate("Začínam dodať.")).toBe(true);

    // Legitimate look-for sentence for the verb hľadať.
    expect(isDamagedExampleTemplate("Hľadám knihu.", "hľadať")).toBe(false);
    expect(
      isDamagedExampleTemplate("Tento chrám je pre miestnych obyvateľov posvätný."),
    ).toBe(false);
    expect(isDamagedExampleTemplate("Vyhral zlatú medailu.", "medaila")).toBe(false);
    expect(isDamagedExampleTemplate("Toto je bežný problém.", "bežný")).toBe(false);
    expect(isDamagedExampleTemplate("Chcem ospravedlňovať.", "ospravedlňovať")).toBe(
      true,
    );
    expect(isDamagedExampleTemplate("Je ťažké neuvedomovať.", "neuvedomovať")).toBe(true);
    expect(isDamagedExampleTemplate("Chcem označiť správnu odpoveď.", "označiť")).toBe(
      false,
    );
  });

  it("flags fake-curated verb infinitive fills without a practice-frame gate", () => {
    expect(
      isWeakFillTemplate(
        {
          slovak: "Chcem ospravedlňovať.",
          english: "I want to apologize.",
        },
        "ospravedlňovať",
      ),
    ).toBe(true);
    expect(
      isWeakFillTemplate({
        slovak: "Chcem označiť správnu odpoveď.",
        english: "I want to mark the correct answer.",
      }),
    ).toBe(false);
    expect(
      isWeakFillTemplate({
        slovak: "Ospravedlňujem sa za meškanie.",
        english: "I apologize for being late.",
      }),
    ).toBe(false);
    expect(
      isWeakFillTemplate({
        slovak: "Prečo sa ospravedlňuješ?",
        english: "Why do you apologize?",
      }),
    ).toBe(true);
    expect(
      isWeakFillTemplate({
        slovak: "Ospravedlňuješ sa mi za každú maličkosť.",
        english: "You apologize to me for every little thing.",
      }),
    ).toBe(false);
  });
});
