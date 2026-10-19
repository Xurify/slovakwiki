/**
 * Demonstrative paradigm (ten, tento, tamten) + a small noun lexicon with
 * hand-checked case forms. Noun endings are listed, not derived — see the
 * possessives paradigm for why.
 */

import {
  CASES,
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
  forms: Record<GrammaticalCase, string>;
  id: string;
  person: boolean;
  /** Something you could ask the price of in a shop. */
  sold: boolean;
  slot: Slot;
}

function noun(
  id: string,
  slot: Slot,
  english: string,
  tags: { person?: boolean; sold?: boolean },
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
    person: tags.person ?? false,
    sold: tags.sold ?? false,
    forms: { nominative, genitive, dative, accusative, locative, instrumental },
  };
}

/**
 * People are gender-clear in English (man, girl) so agreement stays decidable.
 * Dievča and dieťa are neuter, deti and ženy take tie: both are traps on purpose.
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
  noun("dieta", "neuter", "child", { person: true }, [
    "dieťa",
    "dieťaťa",
    "dieťaťu",
    "dieťa",
    "dieťati",
    "dieťaťom",
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
  noun("ludia", "plural-personal", "people", { person: true }, [
    "ľudia",
    "ľudí",
    "ľuďom",
    "ľudí",
    "ľuďoch",
    "ľuďmi",
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
  noun("kluc", "masculine-inanimate", "key", {}, [
    "kľúč",
    "kľúča",
    "kľúču",
    "kľúč",
    "kľúči",
    "kľúčom",
  ]),
  noun("kufor", "masculine-inanimate", "suitcase", { sold: true }, [
    "kufor",
    "kufra",
    "kufru",
    "kufor",
    "kufri",
    "kufrom",
  ]),
  noun("telefon", "masculine-inanimate", "phone", { sold: true }, [
    "telefón",
    "telefónu",
    "telefónu",
    "telefón",
    "telefóne",
    "telefónom",
  ]),
  noun("dom", "masculine-inanimate", "house", { sold: true }, [
    "dom",
    "domu",
    "domu",
    "dom",
    "dome",
    "domom",
  ]),
  noun("taska", "feminine", "bag", { sold: true }, [
    "taška",
    "tašky",
    "taške",
    "tašku",
    "taške",
    "taškou",
  ]),
  noun("kniha", "feminine", "book", { sold: true }, [
    "kniha",
    "knihy",
    "knihe",
    "knihu",
    "knihe",
    "knihou",
  ]),
  noun("izba", "feminine", "room", {}, ["izba", "izby", "izbe", "izbu", "izbe", "izbou"]),
  noun("auto", "neuter", "car", { sold: true }, [
    "auto",
    "auta",
    "autu",
    "auto",
    "aute",
    "autom",
  ]),
  noun("pero", "neuter", "pen", { sold: true }, [
    "pero",
    "pera",
    "peru",
    "pero",
    "pere",
    "perom",
  ]),
  noun("kluce", "plural", "keys", {}, [
    "kľúče",
    "kľúčov",
    "kľúčom",
    "kľúče",
    "kľúčoch",
    "kľúčmi",
  ]),
  noun("knihy", "plural", "books", { sold: true }, [
    "knihy",
    "kníh",
    "knihám",
    "knihy",
    "knihách",
    "knihami",
  ]),
  noun("kufre", "plural", "suitcases", { sold: true }, [
    "kufre",
    "kufrov",
    "kufrom",
    "kufre",
    "kufroch",
    "kuframi",
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
  feminine: "feminine nouns like **žena** or **taška**",
  neuter: "neuter nouns like **auto** or **dievča**",
  "plural-personal": "masculine nouns for people in the plural, like **muži**",
  plural: "every other plural, like **ženy** or **kľúče**",
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
 * Case frames with Anna as the subject. `nouns` keeps each frame natural:
 * Anna helps people, not suitcases.
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
    because: "**Bez** (without) takes the genitive",
    nouns: (entry) => !entry.person && entry.id !== "dom" && entry.id !== "izba",
    slovak: (phrase) => `Anna nejde nikam bez ${phrase}.`,
    english: (phrase) => `Anna doesn't go anywhere without ${phrase}.`,
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
    because: "**Hľadať** (to look for) takes the accusative",
    nouns: () => true,
    slovak: (phrase) => `Anna hľadá ${phrase}.`,
    english: (phrase) => `Anna is looking for ${phrase}.`,
  },
  {
    grammaticalCase: "locative",
    because: "**O** (about) takes the locative",
    nouns: () => true,
    slovak: (phrase) => `Anna hovorí o ${phrase}.`,
    english: (phrase) => `Anna is talking about ${phrase}.`,
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
