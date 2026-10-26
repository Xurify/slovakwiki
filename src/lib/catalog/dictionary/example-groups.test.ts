import { describe, expect, it } from "vitest";

import examplePatterns from "../../../../content/dictionary/example-patterns.json";
import words from "../../../../content/dictionary/words.json";
import type { Example } from "../types";
import { groupExamplesByPattern } from "./example-groups";

function grouped(
  examples: Example[],
  slovak: string,
  slug = "test",
): Record<string, string[]> {
  const items = examples.map((example, index) => ({ example, index }));
  return Object.fromEntries(
    groupExamplesByPattern(items, { slug, slovak, category: "Verbs" }).map((group) => [
      group.label,
      group.items.map((item) => item.example.slovak),
    ]),
  );
}

describe("groupExamplesByPattern", () => {
  it("puts unlabeled sentences under the pattern they show, never under Other", () => {
    const groups = grouped(
      [
        {
          slovak: "Dostanem knihu.",
          english: "I'll get a book.",
          demonstrates: "dostať — receive / get",
        },
        {
          slovak: "Dostanem sa do mesta.",
          english: "I'll get to town.",
          demonstrates: "dostať sa — get to / manage to arrive",
        },
        { slovak: "Dostal to, čo chcel.", english: "He got what he wanted." },
        {
          slovak: "Boli sme sklamaní, keď sme sa dopočuli, že Tom nemohol dostať víza.",
          english: "We were disappointed to hear that Tom couldn't get a visa.",
        },
        {
          slovak: "Viete, ako sa tam môžem dostať?",
          english: "Do you know how I can get there?",
        },
      ],
      "dostať",
    );

    expect(groups).toEqual({
      "dostať — receive / get": [
        "Dostanem knihu.",
        "Dostal to, čo chcel.",
        "Boli sme sklamaní, keď sme sa dopočuli, že Tom nemohol dostať víza.",
      ],
      "dostať sa — get to / manage to arrive": [
        "Dostanem sa do mesta.",
        "Viete, ako sa tam môžem dostať?",
      ],
    });
  });

  it("drops a pattern whose preposition or mať is missing", () => {
    const byt = grouped(
      [
        {
          slovak: "Som v Bratislave.",
          english: "I am in Bratislava.",
          demonstrates: "byť + location — where",
        },
        {
          slovak: "Som z Bratislavy.",
          english: "I am from Bratislava.",
          demonstrates: "byť + z — origin",
        },
        {
          slovak: "Som učiteľ.",
          english: "I am a teacher.",
          demonstrates: "byť + noun — identity / role",
        },
        {
          slovak: "Keď vyrastiem, chcem byť kráľom.",
          english: "When I grow up, I want to be king.",
        },
      ],
      "byť",
    );
    expect(byt["byť + noun — identity / role"]).toContain(
      "Keď vyrastiem, chcem byť kráľom.",
    );

    const rad = grouped(
      [
        {
          slovak: "Mám rád knihy.",
          english: "I like books.",
          demonstrates: "mať + rád + noun — liking",
        },
        {
          slovak: "Rád čítam knihy.",
          english: "I like reading books.",
          demonstrates: "rád + verb — like doing",
        },
        { slovak: "Nikdy som nemal rád biológiu.", english: "I never liked biology." },
        {
          slovak: "Pedro má motorku a rád na nej jazdí.",
          english: "Pedro has a motorcycle and loves to ride it.",
        },
      ],
      "rád",
    );
    expect(rad["mať + rád + noun — liking"]).toContain("Nikdy som nemal rád biológiu.");
    expect(rad["rád + verb — like doing"]).toContain(
      "Pedro má motorku a rád na nej jazdí.",
    );
  });

  it("splits by the English gloss when the Slovak looks the same", () => {
    const groups = grouped(
      [
        {
          slovak: "Stojím tu.",
          english: "I'm standing here.",
          demonstrates: "stáť — stand",
        },
        {
          slovak: "To stojí päť eur.",
          english: "That costs five euros.",
          demonstrates: "stáť — cost",
        },
        { slovak: "Toto bude stáť 30 eur.", english: "This will cost €30." },
        {
          slovak: "Tom sa sťažoval, že musí stáť v rade.",
          english: "Tom complained about having to stand in line.",
        },
      ],
      "stáť",
    );
    expect(groups["stáť — cost"]).toContain("Toto bude stáť 30 eur.");
    expect(groups["stáť — stand"]).toContain("Tom sa sťažoval, že musí stáť v rade.");
  });

  it("keeps contrast patterns for the other verb only", () => {
    const groups = grouped(
      [
        {
          slovak: "Idem do školy.",
          english: "I'm going to school.",
          demonstrates: "ísť — now / one trip",
        },
        {
          slovak: "Chodím do školy.",
          english: "I go to school.",
          demonstrates: "chodiť — habit (see chodiť)",
        },
        { slovak: "Chcem ísť domov.", english: "I want to go home." },
      ],
      "ísť",
    );
    expect(groups["chodiť — habit (see chodiť)"]).toEqual(["Chodím do školy."]);
    expect(groups["ísť — now / one trip"]).toContain("Chcem ísť domov.");
  });

  it("places hand-filed sentences, under a meaning of their own when needed", () => {
    const groups = grouped(
      [
        {
          slovak: "Kladie veľa otázok.",
          english: "He asks a lot of questions.",
          demonstrates: "to ask (questions)",
        },
        {
          slovak: "Kládol drevené dosky na záhradný plot.",
          english: "He was laying wooden boards on the garden fence.",
          demonstrates: "to lay",
        },
        {
          slovak: "Kladie taniere na stôl pred večerou.",
          english: "She is putting plates on the table before dinner.",
        },
      ],
      "klásť",
      "klast",
    );
    expect(groups["to lay"]).toContain("Kladie taniere na stôl pred večerou.");

    const dojst = grouped(
      [
        {
          slovak: "Dôjdeme tam pešo za dvadsať minút.",
          english: "We'll get there on foot in twenty minutes.",
          demonstrates: "to arrive",
        },
        {
          slovak: "Mlieko došlo skôr, než sme čakali.",
          english: "The milk ran out sooner than we expected.",
        },
      ],
      "dôjsť",
      "dojst",
    );
    expect(dojst["to run out"]).toEqual(["Mlieko došlo skôr, než sme čakali."]);
  });
});

describe("group order", () => {
  const examples: Example[] = [
    {
      slovak: "Kladie veľa otázok.",
      english: "He asks a lot of questions.",
      demonstrates: "to ask (questions)",
    },
    {
      slovak: "Kládol drevené dosky na záhradný plot.",
      english: "He was laying wooden boards on the garden fence.",
      demonstrates: "to lay",
    },
  ];
  const items = examples.map((example, index) => ({ example, index }));
  const labels = (english: string) =>
    groupExamplesByPattern(items, { slug: "klast", slovak: "klásť", english }).map(
      (group) => group.label,
    );

  it("follows the meanings list", () => {
    expect(labels("to lay; to put; to ask (questions)")).toEqual([
      "to lay",
      "to ask (questions)",
    ]);
  });

  it("keeps the curated order when a group names no meaning", () => {
    expect(labels("to lay; to put")).toEqual(["to ask (questions)", "to lay"]);
  });
});

describe("example-patterns.json", () => {
  it("names only sentences its entry has", () => {
    const sentencesBySlug = new Map(
      (words as { slug: string; examples: Example[] }[]).map((word) => [
        word.slug,
        new Set(word.examples.map((example) => example.slovak)),
      ]),
    );
    const missing = Object.entries(examplePatterns).flatMap(([slug, labels]) =>
      Object.values(labels)
        .flat()
        .filter((sentence) => !sentencesBySlug.get(slug)?.has(sentence))
        .map((sentence) => `${slug}: ${sentence}`),
    );
    expect(missing).toEqual([]);
  });
});
