import { describe, expect, it } from "vitest";

import {
  arrangeVerbExamples,
  exampleFormBucket,
  exampleShowsConjugatedLemma,
  orderVerbExamples,
} from "./verb-examples";

describe("verb example conjugation", () => {
  it("detects inflected forms, not citation infinitive after a modal", () => {
    expect(
      exampleShowsConjugatedLemma("Ospravedlňujem sa za meškanie.", "ospravedlňovať"),
    ).toBe(true);
    expect(
      exampleShowsConjugatedLemma("Nemusíš sa ospravedlňovať.", "ospravedlňovať"),
    ).toBe(false);
    expect(exampleShowsConjugatedLemma("Chcem označiť správnu odpoveď.", "označiť")).toBe(
      false,
    );
    expect(exampleShowsConjugatedLemma("Knihu vraciam do knižnice.", "vracať")).toBe(
      true,
    );
    expect(exampleShowsConjugatedLemma("Učím sa nové slová.", "učiť sa")).toBe(true);
    expect(exampleShowsConjugatedLemma("Budem sa učiť.", "učiť sa")).toBe(false);
    expect(
      exampleShowsConjugatedLemma(
        "Ráno som sa ocitol na neznámom nástupišti.",
        "ocitnúť",
      ),
    ).toBe(true);
  });

  it("orders conjugated rows before infinitive citation uses", () => {
    const ordered = orderVerbExamples(
      [
        {
          slovak: "Nemusíš sa ospravedlňovať.",
          english: "You don't have to apologize.",
          note: "Tatoeba",
        },
        {
          slovak: "Ospravedlňujem sa za neskorú odpoveď.",
          english: "I'm sorry for the late response.",
          note: "Tatoeba",
        },
      ],
      "ospravedlňovať",
    );
    expect(ordered[0]?.slovak).toBe("Ospravedlňujem sa za neskorú odpoveď.");
  });

  it("lets a real infinitive into the display slice when conjugation is monotone", () => {
    const ordered = orderVerbExamples(
      [
        {
          slovak: "Ospravedlňujem sa za neskorú odpoveď.",
          english: "I'm sorry for the late response.",
          note: "Tatoeba",
        },
        {
          slovak: "Ospravedlňujem sa za meškanie.",
          english: "Sorry for being late.",
          note: "Tatoeba",
        },
        {
          slovak: "Ešte raz sa veľmi ospravedlňujem.",
          english: "Again, a thousand apologies.",
          note: "Tatoeba",
        },
        {
          slovak: "Nemusíš sa ospravedlňovať.",
          english: "You don't have to apologize.",
          note: "Tatoeba",
        },
      ],
      "ospravedlňovať",
    );
    expect(ordered.slice(0, 4).map((example) => example.slovak)).toEqual([
      "Ospravedlňujem sa za neskorú odpoveď.",
      "Ospravedlňujem sa za meškanie.",
      "Nemusíš sa ospravedlňovať.",
      "Ešte raz sa veľmi ospravedlňujem.",
    ]);
  });

  it("does not mint conjugation-stamp fillers", () => {
    const arranged = arrangeVerbExamples(
      [
        {
          slovak: "Ospravedlňujem sa za neskorú odpoveď.",
          english: "I'm sorry for the late response.",
          note: "Tatoeba",
        },
        {
          slovak: "Nemusíš sa ospravedlňovať.",
          english: "You don't have to apologize.",
          note: "Tatoeba",
        },
        {
          slovak: "Prečo sa ospravedlňuješ?",
          english: "Why do you apologize?",
          note: "Curated",
        },
      ],
      "ospravedlňovať",
      "to apologize (sa)",
      "ospravedlnovat",
    );
    expect(
      arranged.some((example) => example.slovak === "Prečo sa ospravedlňuješ?"),
    ).toBe(false);
    expect(arranged[0]?.slovak).toBe("Ospravedlňujem sa za neskorú odpoveď.");
  });

  it("spreads distinct corpus forms when the pool already has them", () => {
    const ordered = orderVerbExamples(
      [
        {
          slovak: "Ospravedlňujem sa za meškanie.",
          english: "Sorry for being late.",
          note: "Tatoeba",
        },
        {
          slovak: "Ospravedlňuješ sa mi za každú maličkosť.",
          english: "You apologize to me for every little thing.",
          note: "Curated",
        },
        {
          slovak: "Kolega sa ospravedlňuje za včerajšiu scénu.",
          english: "A colleague is apologizing for yesterday's scene.",
          note: "Curated",
        },
      ],
      "ospravedlňovať",
    );
    const buckets = ordered.map((example) =>
      exampleFormBucket(example.slovak, "ospravedlňovať"),
    );
    expect(new Set(buckets).size).toBe(3);
  });

  it("keeps a pinned first sentence and drops object-valency stubs", () => {
    const arranged = arrangeVerbExamples(
      [
        {
          slovak: "Môžem sa ocitnúť v ťažkej situácii.",
          english: "I can find myself in a difficult situation.",
          note: "Curated",
        },
        {
          slovak: "Ocitnem to.",
          english: "I find myself it.",
          note: "Curated",
        },
        {
          slovak: "Ráno som sa ocitol na neznámom nástupišti.",
          english: "In the morning I found myself on an unfamiliar platform.",
          note: "Curated",
        },
      ],
      "ocitnúť",
      "to find oneself",
      "ocitnut",
    );
    expect(arranged[0]?.slovak).toBe("Môžem sa ocitnúť v ťažkej situácii.");
    expect(arranged.some((example) => example.slovak === "Ocitnem to.")).toBe(false);
    expect(arranged[1]?.slovak).toBe("Ráno som sa ocitol na neznámom nástupišti.");
  });
});
