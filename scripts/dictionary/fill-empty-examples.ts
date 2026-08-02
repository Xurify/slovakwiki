/**
 * Fill remaining empty dictionary examples with safe curated templates,
 * and add imperfective/perfective pattern pairs.
 *
 * Usage: bun scripts/dictionary/fill-empty-examples.ts
 * Then: bun run examples:curate
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { words } from "../../src/lib/content/data";
import type { Example } from "../../src/lib/content/types";
import { ROOT } from "../lib/paths";

const CURATED_PATH = path.join(ROOT, "content", "dictionary", "curated-examples.json");

function firstGloss(english: string): string {
  return english.split(";")[0]!.trim();
}

function verbExample(slovak: string, english: string): Example {
  const bare = firstGloss(english)
    .replace(/^to\s+/i, "")
    .trim();
  const awkward =
    /contain|include|mean|weigh|equal|belong|consist|concern|regard|occur|exist|constitute|amount|depend|apply to|refer|comprise/i.test(
      bare,
    );

  if (awkward) {
    return {
      slovak: `Sloveso „${slovak}“ je bežné.`,
      english: `The verb “${slovak}” (${bare}) is common.`,
      note: "Curated",
    };
  }

  return {
    slovak: `Chcem ${slovak}.`,
    english: `I want to ${bare}.`,
    note: "Curated",
  };
}

function adjectiveExample(slovak: string, english: string): Example {
  const gloss = firstGloss(english);
  if (/á$/i.test(slovak)) {
    return {
      slovak: `Tá práca je ${slovak}.`,
      english: `That job is ${gloss}.`,
      note: "Curated",
    };
  }

  return {
    slovak: `Mám ${slovak} problém.`,
    english: `I have a ${gloss} problem.`,
    note: "Curated",
  };
}

function nounExample(slovak: string, english: string): Example {
  const gloss = firstGloss(english);
  const capital = slovak.charAt(0).toLocaleUpperCase("sk") + slovak.slice(1);
  return {
    slovak: `Toto je ${slovak}.`,
    english: `This is ${article(gloss)}${gloss}.`,
    note: "Curated",
  };
}

function article(gloss: string): string {
  if (/^(a|an|the)\s/i.test(gloss)) return "";
  return /^[aeiou]/i.test(gloss) ? "an " : "a ";
}

function nameExample(slovak: string): Example {
  const capital = slovak.charAt(0).toLocaleUpperCase("sk") + slovak.slice(1);
  return {
    slovak: `Volá sa ${capital}.`,
    english: `His/her name is ${capital}.`,
    note: "Curated",
  };
}

function placeExample(slovak: string): Example {
  const capital = slovak.charAt(0).toLocaleUpperCase("sk") + slovak.slice(1);
  return {
    slovak: `Navštívim ${capital}.`,
    english: `I'll visit ${capital}.`,
    note: "Curated",
  };
}

function exampleFor(word: {
  category: string;
  english: string;
  slovak: string;
}): Example {
  switch (word.category) {
    case "Verbs":
      return verbExample(word.slovak, word.english);
    case "Adjectives":
      return adjectiveExample(word.slovak, word.english);
    case "Names":
      return nameExample(word.slovak);
    case "Places":
      return placeExample(word.slovak);
    default:
      return nounExample(word.slovak, word.english);
  }
}

const aspectPatterns: Record<string, Example[]> = {
  robit: [
    {
      slovak: "Robím úlohu.",
      english: "I'm doing the homework.",
      note: "Curated",
      demonstrates: "robiť — ongoing / imperfective",
    },
    {
      slovak: "Urobím úlohu.",
      english: "I'll get the homework done.",
      note: "Curated",
      demonstrates: "urobiť — completed (see urobiť)",
    },
  ],
  urobit: [
    {
      slovak: "Urobím úlohu.",
      english: "I'll get the homework done.",
      note: "Curated",
      demonstrates: "urobiť — completed / perfective",
    },
    {
      slovak: "Robím úlohu.",
      english: "I'm doing the homework.",
      note: "Curated",
      demonstrates: "robiť — ongoing (see robiť)",
    },
  ],
  brat: [
    {
      slovak: "Beriem knihu.",
      english: "I'm taking a book.",
      note: "Curated",
      demonstrates: "brať — ongoing / imperfective",
    },
    {
      slovak: "Vezmem knihu.",
      english: "I'll take a book.",
      note: "Curated",
      demonstrates: "vziať — one completed take (see vziať)",
    },
  ],
  vziat: [
    {
      slovak: "Vezmem knihu.",
      english: "I'll take a book.",
      note: "Curated",
      demonstrates: "vziať — one completed take",
    },
    {
      slovak: "Beriem knihu.",
      english: "I'm taking a book.",
      note: "Curated",
      demonstrates: "brať — ongoing (see brať)",
    },
  ],
  pisat: [
    {
      slovak: "Píšem list.",
      english: "I'm writing a letter.",
      note: "Curated",
      demonstrates: "písať — ongoing / imperfective",
    },
    {
      slovak: "Napíšem list.",
      english: "I'll write a letter.",
      note: "Curated",
      demonstrates: "napísať — write to completion (see napísať)",
    },
  ],
  napisat: [
    {
      slovak: "Napíšem list.",
      english: "I'll write a letter.",
      note: "Curated",
      demonstrates: "napísať — write to completion",
    },
    {
      slovak: "Píšem list.",
      english: "I'm writing a letter.",
      note: "Curated",
      demonstrates: "písať — ongoing (see písať)",
    },
  ],
  citat: [
    {
      slovak: "Čítam knihu.",
      english: "I'm reading a book.",
      note: "Curated",
      demonstrates: "čítať — ongoing / imperfective",
    },
    {
      slovak: "Prečítam knihu.",
      english: "I'll read the book through.",
      note: "Curated",
      demonstrates: "prečítať — read through (see prečítať)",
    },
  ],
  precitat: [
    {
      slovak: "Prečítam knihu.",
      english: "I'll read the book through.",
      note: "Curated",
      demonstrates: "prečítať — read through",
    },
    {
      slovak: "Čítam knihu.",
      english: "I'm reading a book.",
      note: "Curated",
      demonstrates: "čítať — ongoing (see čítať)",
    },
  ],
  kupovat: [
    {
      slovak: "Kupujem knihu.",
      english: "I'm buying a book.",
      note: "Curated",
      demonstrates: "kupovať — ongoing / imperfective",
    },
    {
      slovak: "Kúpim knihu.",
      english: "I'll buy a book.",
      note: "Curated",
      demonstrates: "kúpiť — one purchase (see kúpiť)",
    },
  ],
  kupit: [
    {
      slovak: "Kúpim knihu.",
      english: "I'll buy a book.",
      note: "Curated",
      demonstrates: "kúpiť — one purchase",
    },
    {
      slovak: "Kupujem knihu.",
      english: "I'm buying a book.",
      note: "Curated",
      demonstrates: "kupovať — ongoing (see kupovať)",
    },
  ],
  jest: [
    {
      slovak: "Jem chlieb.",
      english: "I'm eating bread.",
      note: "Curated",
      demonstrates: "jesť — ongoing / imperfective",
    },
    {
      slovak: "Zjem chlieb.",
      english: "I'll eat the bread up.",
      note: "Curated",
      demonstrates: "zjesť — eat up (see zjesť)",
    },
  ],
  zjest: [
    {
      slovak: "Zjem chlieb.",
      english: "I'll eat the bread up.",
      note: "Curated",
      demonstrates: "zjesť — eat up",
    },
    {
      slovak: "Jem chlieb.",
      english: "I'm eating bread.",
      note: "Curated",
      demonstrates: "jesť — ongoing (see jesť)",
    },
  ],
  pit: [
    {
      slovak: "Pijem vodu.",
      english: "I'm drinking water.",
      note: "Curated",
      demonstrates: "piť — ongoing / imperfective",
    },
    {
      slovak: "Vypijem vodu.",
      english: "I'll drink the water up.",
      note: "Curated",
      demonstrates: "vypiť — drink up (see vypiť)",
    },
  ],
  vypit: [
    {
      slovak: "Vypijem vodu.",
      english: "I'll drink the water up.",
      note: "Curated",
      demonstrates: "vypiť — drink up",
    },
    {
      slovak: "Pijem vodu.",
      english: "I'm drinking water.",
      note: "Curated",
      demonstrates: "piť — ongoing (see piť)",
    },
  ],
};

const curated = JSON.parse(readFileSync(CURATED_PATH, "utf8")) as Record<
  string,
  Example[]
>;

Object.assign(curated, aspectPatterns);

const empty = words.filter((word) => word.kind === "word" && word.examples.length === 0);
let filled = 0;

for (const word of empty) {
  if (aspectPatterns[word.slug]) continue;
  curated[word.slug] = [exampleFor(word)];
  filled += 1;
}

writeFileSync(CURATED_PATH, `${JSON.stringify(curated, null, 2)}\n`);
console.log(`Aspect pattern pairs: ${Object.keys(aspectPatterns).length}`);
console.log(`Template-filled empty lemmas: ${filled}`);
console.log(`Total curated keys: ${Object.keys(curated).length}`);
