/**
 * Demonstrative paradigm (ten, tento, tamten) + a small noun lexicon with
 * hand-checked case forms. Noun endings are listed, not derived — see the
 * possessives paradigm for why.
 */

import {
  CASES,
  possessiveEnglish,
  type GrammaticalCase,
  type Slot,
} from "$lib/learning/possessives/paradigm";

export { CASES, capitalizeSlovak } from "$lib/learning/possessives/paradigm";
export type { GrammaticalCase, Slot } from "$lib/learning/possessives/paradigm";

/** ten = the / that (the everyday default), tento = this one here, tamten = that one over there. */
export type DemonstrativeSeries = "ten" | "tento" | "tamten";

const TEN: Record<Slot, Record<GrammaticalCase, string>> = {
  "masculine-animate": {
    nominative: "ten",
    genitive: "toho",
    dative: "tomu",
    accusative: "toho",
    locative: "tom",
    instrumental: "tým",
  },
  "masculine-inanimate": {
    nominative: "ten",
    genitive: "toho",
    dative: "tomu",
    accusative: "ten",
    locative: "tom",
    instrumental: "tým",
  },
  feminine: {
    nominative: "tá",
    genitive: "tej",
    dative: "tej",
    accusative: "tú",
    locative: "tej",
    instrumental: "tou",
  },
  neuter: {
    nominative: "to",
    genitive: "toho",
    dative: "tomu",
    accusative: "to",
    locative: "tom",
    instrumental: "tým",
  },
  "plural-personal": {
    nominative: "tí",
    genitive: "tých",
    dative: "tým",
    accusative: "tých",
    locative: "tých",
    instrumental: "tými",
  },
  plural: {
    nominative: "tie",
    genitive: "tých",
    dative: "tým",
    accusative: "tie",
    locative: "tých",
    instrumental: "tými",
  },
};

export function demonstrativeForm(
  series: DemonstrativeSeries,
  slot: Slot,
  grammaticalCase: GrammaticalCase,
): string {
  const base = TEN[slot][grammaticalCase];
  if (series === "tamten") return `tam${base}`;
  if (series === "ten") return base;
  // toho + -to drops the middle o: tohto. Czech keeps it (tohoto).
  return base === "toho" ? "tohto" : `${base}to`;
}

export const SERIES_ENGLISH: Record<
  DemonstrativeSeries,
  { plural: string; singular: string }
> = {
  ten: { singular: "that", plural: "those" },
  tento: { singular: "this", plural: "these" },
  tamten: { singular: "that", plural: "those" },
};

/** “that bag”, “these books”, “that bag over there”. */
export function demonstrativeEnglish(
  series: DemonstrativeSeries,
  entry: NounEntry,
): string {
  const english = SERIES_ENGLISH[series];
  const word = isPluralSlot(entry.slot) ? english.plural : english.singular;
  const phrase = `${word} ${entry.english}`;
  return series === "tamten" ? `${phrase} over there` : phrase;
}

export interface NounEntry {
  english: string;
  /** Something you order in the café scene (dať si). */
  food: boolean;
  forms: Record<GrammaticalCase, string>;
  id: string;
  person: boolean;
  /** Something you could ask the price of. */
  sold: boolean;
  slot: Slot;
}

function noun(
  id: string,
  slot: Slot,
  english: string,
  tags: { food?: boolean; person?: boolean; sold?: boolean },
  forms: [
    nominative: string,
    genitive: string,
    dative: string,
    accusative: string,
    locative: string,
    instrumental: string,
  ],
): NounEntry {
  const [nominative, genitive, dative, accusative, locative, instrumental] = forms;
  return {
    id,
    slot,
    english,
    food: tags.food ?? false,
    person: tags.person ?? false,
    sold: (tags.sold ?? false) || (tags.food ?? false),
    forms: { nominative, genitive, dative, accusative, locative, instrumental },
  };
}

/**
 * Only nouns the lesson's scene or key terms show, so practice never tests a word
 * the learner has not met (`vocabulary.test.ts` checks it). English glosses are
 * gender-clear (man, girl) so agreement stays decidable. Dievča is neuter, deti and
 * ženy take tie: both are traps on purpose.
 */
export const NOUNS: readonly NounEntry[] = [
  noun("muz", "masculine-animate", "man", { person: true }, [
    "muž",
    "muža",
    "mužovi",
    "muža",
    "mužovi",
    "mužom",
  ]),
  noun("chlapec", "masculine-animate", "boy", { person: true }, [
    "chlapec",
    "chlapca",
    "chlapcovi",
    "chlapca",
    "chlapcovi",
    "chlapcom",
  ]),
  noun("zena", "feminine", "woman", { person: true }, [
    "žena",
    "ženy",
    "žene",
    "ženu",
    "žene",
    "ženou",
  ]),
  noun("dievca", "neuter", "girl", { person: true }, [
    "dievča",
    "dievčaťa",
    "dievčaťu",
    "dievča",
    "dievčati",
    "dievčaťom",
  ]),
  noun("muzi", "plural-personal", "men", { person: true }, [
    "muži",
    "mužov",
    "mužom",
    "mužov",
    "mužoch",
    "mužmi",
  ]),
  noun("chlapci", "plural-personal", "boys", { person: true }, [
    "chlapci",
    "chlapcov",
    "chlapcom",
    "chlapcov",
    "chlapcoch",
    "chlapcami",
  ]),
  noun("kolegovia", "plural-personal", "colleagues", { person: true }, [
    "kolegovia",
    "kolegov",
    "kolegom",
    "kolegov",
    "kolegoch",
    "kolegami",
  ]),
  noun("zeny", "plural", "women", { person: true }, [
    "ženy",
    "žien",
    "ženám",
    "ženy",
    "ženách",
    "ženami",
  ]),
  noun("deti", "plural", "children", { person: true }, [
    "deti",
    "detí",
    "deťom",
    "deti",
    "deťoch",
    "deťmi",
  ]),
  noun("dom", "masculine-inanimate", "house", { sold: true }, [
    "dom",
    "domu",
    "domu",
    "dom",
    "dome",
    "domom",
  ]),
  noun("kolac", "masculine-inanimate", "cake", { food: true }, [
    "koláč",
    "koláča",
    "koláču",
    "koláč",
    "koláči",
    "koláčom",
  ]),
  noun("torta", "feminine", "layer cake", { food: true }, [
    "torta",
    "torty",
    "torte",
    "tortu",
    "torte",
    "tortou",
  ]),
  noun("fotka", "feminine", "photo", {}, [
    "fotka",
    "fotky",
    "fotke",
    "fotku",
    "fotke",
    "fotkou",
  ]),
  noun("kniha", "feminine", "book", { sold: true }, [
    "kniha",
    "knihy",
    "knihe",
    "knihu",
    "knihe",
    "knihou",
  ]),
  noun("fotky", "plural", "photos", {}, [
    "fotky",
    "fotiek",
    "fotkám",
    "fotky",
    "fotkách",
    "fotkami",
  ]),
  noun("knihy", "plural", "books", { sold: true }, [
    "knihy",
    "kníh",
    "knihám",
    "knihy",
    "knihách",
    "knihami",
  ]),
  noun("kolace", "plural", "cakes", { food: true }, [
    "koláče",
    "koláčov",
    "koláčom",
    "koláče",
    "koláčoch",
    "koláčmi",
  ]),
];

export function isPluralSlot(slot: Slot): boolean {
  return slot === "plural" || slot === "plural-personal";
}

export const SLOT_LABEL: Record<Slot, string> = {
  "masculine-animate": "masculine",
  "masculine-inanimate": "masculine",
  feminine: "feminine",
  neuter: "neuter",
  "plural-personal": "a masculine noun for people",
  plural: "plural",
};

/** Completes “**Tá** goes with …” in feedback. */
export const GOES_WITH: Record<Slot, string> = {
  "masculine-animate": "masculine nouns like **muž** or **dom**",
  "masculine-inanimate": "masculine nouns like **muž** or **dom**",
  feminine: "feminine nouns like **žena** or **torta**",
  neuter: "neuter nouns like **dievča**",
  "plural-personal": "masculine nouns for people in the plural, like **muži**",
  plural: "every other plural, like **ženy** or **fotky**",
};

export function demonstrativePhrase(
  series: DemonstrativeSeries,
  entry: NounEntry,
  grammaticalCase: GrammaticalCase,
): string {
  return `${demonstrativeForm(series, entry.slot, grammaticalCase)} ${entry.forms[grammaticalCase]}`;
}

/** Every case whose form matches `form` — “genitive or accusative”. */
export function casesOfForm(
  series: DemonstrativeSeries,
  slot: Slot,
  form: string,
): GrammaticalCase[] {
  return CASES.filter(
    (grammaticalCase) => demonstrativeForm(series, slot, grammaticalCase) === form,
  );
}

/**
 * Case frames built only from verbs and prepositions the lesson's scene uses.
 * `nouns` keeps each frame natural: Anna helps people, not cakes.
 */
export interface CaseFrame {
  /** Teaching reason, already marked for the UI. */
  because: string;
  english: (phrase: string) => string;
  grammaticalCase: GrammaticalCase;
  nouns: (entry: NounEntry) => boolean;
  slovak: (phrase: string) => string;
}

export const CASE_FRAMES: readonly CaseFrame[] = [
  {
    grammaticalCase: "genitive",
    because: "The owner after **dom** takes the genitive",
    nouns: (entry) => entry.person,
    slovak: (phrase) => `To je dom ${phrase}.`,
    english: (phrase) => `That's ${possessiveEnglish(phrase)} house.`,
  },
  {
    grammaticalCase: "dative",
    because: "**Pomáhať** (to help) takes the dative",
    nouns: (entry) => entry.person,
    slovak: (phrase) => `Anna pomáha ${phrase}.`,
    english: (phrase) => `Anna is helping ${phrase}.`,
  },
  {
    grammaticalCase: "accusative",
    because: "**Poznať** (to know someone) takes the accusative",
    nouns: (entry) => entry.person,
    slovak: (phrase) => `Anna pozná ${phrase}.`,
    english: (phrase) => `Anna knows ${phrase}.`,
  },
  {
    grammaticalCase: "accusative",
    because: "**Dať si** (to have, when ordering) takes the accusative",
    nouns: (entry) => entry.food,
    slovak: (phrase) => `Anna si dá ${phrase}.`,
    english: (phrase) => `Anna will have ${phrase}.`,
  },
  {
    grammaticalCase: "locative",
    because: "**Na** (in a photo) takes the locative",
    nouns: (entry) => entry.id === "fotka" || entry.id === "fotky",
    slovak: (phrase) => `Kto je na ${phrase}?`,
    english: (phrase) => `Who is in ${phrase}?`,
  },
  {
    grammaticalCase: "locative",
    because: "**V** (in) takes the locative",
    nouns: (entry) => entry.id === "dom",
    slovak: (phrase) => `Marek býva v ${phrase}.`,
    english: (phrase) => `Marek lives in ${phrase}.`,
  },
  {
    grammaticalCase: "instrumental",
    because: "**S** (with) takes the instrumental",
    nouns: (entry) => entry.person,
    slovak: (phrase) => `Anna ide do kina s ${phrase}.`,
    english: (phrase) => `Anna is going to the cinema with ${phrase}.`,
  },
];

export function caseFrame(grammaticalCase: GrammaticalCase): CaseFrame {
  const frame = CASE_FRAMES.find(
    (candidate) => candidate.grammaticalCase === grammaticalCase,
  );
  if (!frame) throw new Error(`Missing case frame: ${grammaticalCase}`);
  return frame;
}

/** One series, one case, five agreement columns — the order lesson tables use. */
export function paradigmRow(
  series: DemonstrativeSeries,
  grammaticalCase: GrammaticalCase,
): string[] {
  const animate = demonstrativeForm(series, "masculine-animate", grammaticalCase);
  const inanimate = demonstrativeForm(series, "masculine-inanimate", grammaticalCase);

  return [
    // Only the accusative splits people from things: toho muža, ten dom.
    animate === inanimate ? animate : `${animate} / ${inanimate}`,
    demonstrativeForm(series, "feminine", grammaticalCase),
    demonstrativeForm(series, "neuter", grammaticalCase),
    demonstrativeForm(series, "plural-personal", grammaticalCase),
    demonstrativeForm(series, "plural", grammaticalCase),
  ];
}
