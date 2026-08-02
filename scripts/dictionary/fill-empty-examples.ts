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

type VerbFrame =
  | "stative"
  | "event"
  | "with_person"
  | "person_object"
  | "perception_si"
  | "perception"
  | "motion"
  | "activity"
  | "transitive";

/** Lemmas that usually need si in this citation form. */
const SI_PERCEPTION = new Set(["všimnúť", "nevšimnúť"]);

/** Lemmas that usually need sa in event/possibility frames. */
const SA_EVENT = new Set([
  "dariť",
  "vyskytovať",
  "vyskytnúť",
  "nepodariť",
  "pribudnúť",
  "snažiť",
]);

function classifyVerbFrame(slovak: string, bareGloss: string): VerbFrame {
  const gloss = bareGloss.toLowerCase();
  const lemma = slovak.toLocaleLowerCase("sk");

  if (
    /contain|include|mean|weigh|equal|belong|consist|concern|regard|exist|constitute|amount|depend|apply to|refer|comprise|represent|correspond|differ|resemble|lack|suffice|seem|be related|be based|be added/i.test(
      gloss,
    )
  ) {
    return "stative";
  }

  if (
    /occur|happen|take place|arise|emerge|appear|follow\b|go well|not to succeed/i.test(
      gloss,
    )
  ) {
    return "event";
  }

  if (
    /say goodbye|discuss|talk|negotiate|converse|chat|argue with|speak with/i.test(gloss)
  ) {
    return "with_person";
  }

  if (
    /invite|meet|visit|help|thank|love|hate|kiss|hug|marry|know\b|recognize/i.test(gloss)
  ) {
    return "person_object";
  }

  if (/notice|look|feel|smell|taste|watch|observe|listen|see\b/i.test(gloss)) {
    return SI_PERCEPTION.has(lemma) ? "perception_si" : "perception";
  }

  if (
    /go\b|come|walk|run|drive|fly|travel|arrive|leave|return|enter|exit|move|fall|rise|climb|swim|descend|overcome/i.test(
      gloss,
    )
  ) {
    return "motion";
  }

  if (
    /sleep|laugh|cry|smile|wait|work|play|rest|sit|stand|lie|live|die|dream|think|hope|fear/i.test(
      gloss,
    )
  ) {
    return "activity";
  }

  return "transitive";
}

function verbExample(slovak: string, english: string): Example {
  const bare = firstGloss(english)
    .replace(/^to\s+/i, "")
    .trim();
  const lemma = slovak.toLocaleLowerCase("sk");
  const frame = classifyVerbFrame(slovak, bare);

  switch (frame) {
    case "stative":
      return {
        slovak: `Také veci môžu ${slovak}.`,
        english: `Such things can ${bare}.`,
        note: "Curated",
      };
    case "event":
      if (SA_EVENT.has(lemma)) {
        return {
          slovak: `Môže sa to ${slovak}.`,
          english: `It can ${bare}.`,
          note: "Curated",
        };
      }
      return {
        slovak: `Môže to ${slovak}.`,
        english: `It can ${bare}.`,
        note: "Curated",
      };
    case "with_person":
      return {
        slovak: `Chcem s tebou ${slovak}.`,
        english: `I want to ${bare} with you.`,
        note: "Curated",
      };
    case "person_object":
      return {
        slovak: `Chcem ťa ${slovak}.`,
        english: `I want to ${bare} you.`,
        note: "Curated",
      };
    case "perception_si":
      return {
        slovak: `Chcem si to ${slovak}.`,
        english: `I want to ${bare} it.`,
        note: "Curated",
      };
    case "perception":
    case "transitive":
      return {
        slovak: `Chcem to ${slovak}.`,
        english: `I want to ${bare} it.`,
        note: "Curated",
      };
    case "motion":
    case "activity":
      return {
        slovak: `Chcem ${slovak}.`,
        english: `I want to ${bare}.`,
        note: "Curated",
      };
  }
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
    slovak: `Ten príklad je ${slovak}.`,
    english: `That example is ${gloss}.`,
    note: "Curated",
  };
}

/** Lemmas that are plural or plurale tantum — need "Toto sú", not "Toto je". */
const PLURAL_NOUNS = new Set([
  "ľudia",
  "deti",
  "peniaze",
  "dvere",
  "ústá",
  "ústa",
  "okuliare",
  "nožnice",
  "šaty",
  "vianoce",
  "prázdniny",
  "noviny",
  "dáta",
  "data",
]);

function isPluralNoun(slovak: string): boolean {
  const lower = slovak.toLocaleLowerCase("sk");
  if (PLURAL_NOUNS.has(lower)) return true;
  // Common plurale-tantum / plural lemma endings in the frequency list
  if (/^(peniaze|ľudia|deti)$/iu.test(lower)) return true;
  return false;
}

function nounExample(slovak: string, english: string): Example {
  const gloss = firstGloss(english);
  if (isPluralNoun(slovak)) {
    return {
      slovak: `Toto sú ${slovak}.`,
      english: `These are ${gloss}.`,
      note: "Curated",
    };
  }

  return {
    slovak: `Toto je ${slovak}.`,
    english: `This is ${article(gloss)}${gloss}.`,
    note: "Curated",
  };
}

function article(gloss: string): string {
  if (/^(a|an|the)\s/i.test(gloss)) return "";
  // Plural English glosses often end in s — skip article
  if (/\bs$/i.test(gloss) && !/ss$/i.test(gloss)) return "";
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
