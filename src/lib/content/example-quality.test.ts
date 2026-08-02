import { describe, expect, it } from "vitest";

import { isCleanExample } from "./example-quality";

describe("example quality", () => {
  it("allows ordinary learner sentences", () => {
    expect(isCleanExample("Kedy môžeš prísť?", "When can you come?")).toBe(true);
    expect(isCleanExample("Mám rád knihy.", "I like books.")).toBe(true);
    expect(isCleanExample("Pes má hustú srsť.", "The dog has thick fur.")).toBe(true);
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
});
