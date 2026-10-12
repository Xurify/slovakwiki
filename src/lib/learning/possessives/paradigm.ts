/**
 * Possessive pronoun paradigm + a small noun lexicon with hand-checked case forms.
 *
 * Noun endings are listed, not derived: Slovak declension has too many stem
 * alternations (kufor → kufra, dieťa → dieťaťa) to generate safely.
 */

export type GrammaticalCase =
  "nominative" | "genitive" | "dative" | "accusative" | "locative" | "instrumental";

/**
 * Agreement target. Singular splits masculine by animacy (accusative môjho brata /
 * môj kľúč); plural splits masculine-personal (moji priatelia) from the rest (moje kľúče).
 */
export type Slot =
  | "masculine-animate"
  | "masculine-inanimate"
  | "feminine"
  | "neuter"
  | "plural-personal"
  | "plural";

export type DeclinableOwnerId = "my" | "your-ty" | "our" | "your-vy" | "own";
export type FixedOwnerId = "his" | "her" | "their";
export type OwnerId = DeclinableOwnerId | FixedOwnerId;

/** Owners a learner can name with a plain English possessive (excludes reflexive svoj). */
export type NamedOwnerId = Exclude<OwnerId, "own">;
export type DeclinableNamedOwnerId = Exclude<DeclinableOwnerId, "own">;

export const CASES: readonly GrammaticalCase[] = [
  "nominative",
  "genitive",
  "dative",
  "accusative",
  "locative",
  "instrumental",
];

const STEMS: Record<DeclinableOwnerId, { long: string; short: string }> = {
  my: { long: "môj", short: "moj" },
  "your-ty": { long: "tvoj", short: "tvoj" },
  our: { long: "náš", short: "naš" },
  "your-vy": { long: "váš", short: "vaš" },
  own: { long: "svoj", short: "svoj" },
};

const FIXED: Record<FixedOwnerId, string> = {
  his: "jeho",
  her: "jej",
  their: "ich",
};

export const DECLINABLE_NAMED_OWNERS: readonly DeclinableNamedOwnerId[] = [
  "my",
  "your-ty",
  "our",
  "your-vy",
];

export const FIXED_OWNERS: readonly FixedOwnerId[] = ["his", "her", "their"];

/** English possessive; ty/vy tagged because English “your” hides the choice. */
export const OWNER_ENGLISH: Record<NamedOwnerId, string> = {
  my: "my",
  "your-ty": "your (ty)",
  our: "our",
  "your-vy": "your (vy)",
  his: "his",
  her: "her",
  their: "their",
};

export function isFixedOwner(owner: OwnerId): owner is FixedOwnerId {
  return owner === "his" || owner === "her" || owner === "their";
}

/** Dictionary form for an owner: môj, tvoj, náš, váš, svoj, jeho, jej, ich. */
export function ownerLemma(owner: OwnerId): string {
  return isFixedOwner(owner) ? FIXED[owner] : STEMS[owner].long;
}

export function possessiveForm(
  owner: OwnerId,
  slot: Slot,
  grammaticalCase: GrammaticalCase,
): string {
  if (isFixedOwner(owner)) return FIXED[owner];

  const { long, short } = STEMS[owner];

  switch (slot) {
    case "masculine-animate":
    case "masculine-inanimate":
    case "neuter": {
      const neuter = slot === "neuter";
      const forms: Record<GrammaticalCase, string> = {
        nominative: neuter ? `${short}e` : long,
        genitive: `${long}ho`,
        dative: `${long}mu`,
        accusative:
          slot === "masculine-animate" ? `${long}ho` : neuter ? `${short}e` : long,
        locative: `${short}om`,
        instrumental: `${short}ím`,
      };
      return forms[grammaticalCase];
    }
    case "feminine": {
      const endings: Record<GrammaticalCase, string> = {
        nominative: "a",
        genitive: "ej",
        dative: "ej",
        accusative: "u",
        locative: "ej",
        instrumental: "ou",
      };
      return `${short}${endings[grammaticalCase]}`;
    }
    case "plural-personal":
    case "plural": {
      const personal = slot === "plural-personal";
      const endings: Record<GrammaticalCase, string> = {
        nominative: personal ? "i" : "e",
        genitive: "ich",
        dative: "im",
        accusative: personal ? "ich" : "e",
        locative: "ich",
        instrumental: "imi",
      };
      return `${short}${endings[grammaticalCase]}`;
    }
  }
}

/** Whose? — čí / čia / čie agree like môj. Nominative only. */
export function whoseForm(slot: Slot): string {
  if (slot === "feminine") return "čia";
  if (slot === "neuter" || slot === "plural") return "čie";
  return "čí";
}

/** Personal pronoun after a preposition (s ním, o ňom) — the trap for possessive jeho. */
export function prepositionalPronoun(
  owner: FixedOwnerId,
  grammaticalCase: "instrumental" | "locative",
): string {
  const forms: Record<FixedOwnerId, Record<"instrumental" | "locative", string>> = {
    his: { instrumental: "ním", locative: "ňom" },
    her: { instrumental: "ňou", locative: "nej" },
    their: { instrumental: "nimi", locative: "nich" },
  };
  return forms[owner][grammaticalCase];
}

/** `s` → `so` before s/z/š/ž (so svojím bratom, so sestrou). */
export function withPreposition(preposition: "s" | "o" | "u", word: string): string {
  if (preposition === "s" && /^[szšž]/iu.test(word)) return `so ${word}`;
  return `${preposition} ${word}`;
}

export interface NounEntry {
  english: string;
  forms: Record<GrammaticalCase, string>;
  id: string;
  person: boolean;
  slot: Slot;
}

function noun(
  id: string,
  slot: Slot,
  person: boolean,
  english: string,
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
    person,
    english,
    forms: { nominative, genitive, dative, accusative, locative, instrumental },
  };
}

/** English glosses avoid gender-ambiguous people (friend, neighbor) — agreement must be decidable. */
export const NOUNS: readonly NounEntry[] = [
  noun("brat", "masculine-animate", true, "brother", [
    "brat",
    "brata",
    "bratovi",
    "brata",
    "bratovi",
    "bratom",
  ]),
  noun("otec", "masculine-animate", true, "father", [
    "otec",
    "otca",
    "otcovi",
    "otca",
    "otcovi",
    "otcom",
  ]),
  noun("syn", "masculine-animate", true, "son", [
    "syn",
    "syna",
    "synovi",
    "syna",
    "synovi",
    "synom",
  ]),
  noun("dedko", "masculine-animate", true, "grandfather", [
    "dedko",
    "dedka",
    "dedkovi",
    "dedka",
    "dedkovi",
    "dedkom",
  ]),
  noun("sestra", "feminine", true, "sister", [
    "sestra",
    "sestry",
    "sestre",
    "sestru",
    "sestre",
    "sestrou",
  ]),
  noun("mama", "feminine", true, "mother", [
    "mama",
    "mamy",
    "mame",
    "mamu",
    "mame",
    "mamou",
  ]),
  noun("dcera", "feminine", true, "daughter", [
    "dcéra",
    "dcéry",
    "dcére",
    "dcéru",
    "dcére",
    "dcérou",
  ]),
  noun("babka", "feminine", true, "grandmother", [
    "babka",
    "babky",
    "babke",
    "babku",
    "babke",
    "babkou",
  ]),
  noun("dieta", "neuter", true, "child", [
    "dieťa",
    "dieťaťa",
    "dieťaťu",
    "dieťa",
    "dieťati",
    "dieťaťom",
  ]),
  noun("rodicia", "plural-personal", true, "parents", [
    "rodičia",
    "rodičov",
    "rodičom",
    "rodičov",
    "rodičoch",
    "rodičmi",
  ]),
  noun("priatelia", "plural-personal", true, "friends", [
    "priatelia",
    "priateľov",
    "priateľom",
    "priateľov",
    "priateľoch",
    "priateľmi",
  ]),
  noun("kluc", "masculine-inanimate", false, "key", [
    "kľúč",
    "kľúča",
    "kľúču",
    "kľúč",
    "kľúči",
    "kľúčom",
  ]),
  noun("telefon", "masculine-inanimate", false, "phone", [
    "telefón",
    "telefónu",
    "telefónu",
    "telefón",
    "telefóne",
    "telefónom",
  ]),
  noun("kufor", "masculine-inanimate", false, "suitcase", [
    "kufor",
    "kufra",
    "kufru",
    "kufor",
    "kufri",
    "kufrom",
  ]),
  noun("byt", "masculine-inanimate", false, "apartment", [
    "byt",
    "bytu",
    "bytu",
    "byt",
    "byte",
    "bytom",
  ]),
  noun("taska", "feminine", false, "bag", [
    "taška",
    "tašky",
    "taške",
    "tašku",
    "taške",
    "taškou",
  ]),
  noun("kniha", "feminine", false, "book", [
    "kniha",
    "knihy",
    "knihe",
    "knihu",
    "knihe",
    "knihou",
  ]),
  noun("izba", "feminine", false, "room", [
    "izba",
    "izby",
    "izbe",
    "izbu",
    "izbe",
    "izbou",
  ]),
  noun("auto", "neuter", false, "car", ["auto", "auta", "autu", "auto", "aute", "autom"]),
  noun("pero", "neuter", false, "pen", ["pero", "pera", "peru", "pero", "pere", "perom"]),
  noun("kluce", "plural", false, "keys", [
    "kľúče",
    "kľúčov",
    "kľúčom",
    "kľúče",
    "kľúčoch",
    "kľúčmi",
  ]),
  noun("knihy", "plural", false, "books", [
    "knihy",
    "kníh",
    "knihám",
    "knihy",
    "knihách",
    "knihami",
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
  "plural-personal": "masculine plural (people)",
  plural: "plural",
};

/** “my brother” style English noun phrase. */
export function ownedEnglish(ownerEnglish: string, entry: NounEntry): string {
  return `${ownerEnglish} ${entry.english}`;
}

/** Slovak noun phrase in one case: môjho brata, jeho sestrou. */
export function ownedSlovak(
  owner: OwnerId,
  entry: NounEntry,
  grammaticalCase: GrammaticalCase,
): string {
  return `${possessiveForm(owner, entry.slot, grammaticalCase)} ${entry.forms[grammaticalCase]}`;
}

/**
 * Case frames with a third-person subject (Anna). With my/your/our as the owner,
 * the subject never owns the noun — so môj/tvoj/náš/váš is the only right answer.
 */
export interface CaseFrame {
  /** Teaching reason, already marked for the UI. */
  because: string;
  english: (owned: string) => string;
  grammaticalCase: GrammaticalCase;
  /** People-only frames (u mamy, píše list bratovi). */
  people: boolean;
  slovak: (owned: string, plural: boolean) => string;
}

export const CASE_FRAMES: readonly CaseFrame[] = [
  {
    grammaticalCase: "nominative",
    people: false,
    because: "After **To je** / **To sú**, use the basic nominative form",
    slovak: (owned, plural) => `${plural ? "To sú" : "To je"} ${owned}.`,
    english: (owned) => `This is ${owned}.`,
  },
  {
    grammaticalCase: "accusative",
    people: false,
    because: "**Hľadať** takes the accusative",
    slovak: (owned) => `Anna hľadá ${owned}.`,
    english: (owned) => `Anna is looking for ${owned}.`,
  },
  {
    grammaticalCase: "genitive",
    people: true,
    because: "**U** (at someone's place) takes the genitive",
    slovak: (owned) => `Anna býva u ${owned}.`,
    english: (owned) => `Anna is staying at ${possessiveEnglish(owned)} place.`,
  },
  {
    grammaticalCase: "dative",
    people: true,
    because: "**Písať list** + to whom takes the dative",
    slovak: (owned) => `Anna píše list ${owned}.`,
    english: (owned) => `Anna is writing a letter to ${owned}.`,
  },
  {
    grammaticalCase: "locative",
    people: false,
    because: "**O** (about) takes the locative",
    slovak: (owned) => `Anna hovorí o ${owned}.`,
    english: (owned) => `Anna is talking about ${owned}.`,
  },
  {
    grammaticalCase: "instrumental",
    people: true,
    because: "**S** (with) takes the instrumental",
    slovak: (owned) => `Anna ide do kina ${withPreposition("s", owned)}.`,
    english: (owned) => `Anna is going to the cinema with ${owned}.`,
  },
];

export function caseFrame(grammaticalCase: GrammaticalCase): CaseFrame {
  const frame = CASE_FRAMES.find(
    (candidate) => candidate.grammaticalCase === grammaticalCase,
  );
  if (!frame) throw new Error(`Missing case frame: ${grammaticalCase}`);
  return frame;
}

/** “my brother” → “my brother's”; “our parents” → “our parents'”. */
export function possessiveEnglish(phrase: string): string {
  return phrase.endsWith("s") ? `${phrase}'` : `${phrase}'s`;
}

/** Fix English “This is” for plural owned nouns. */
export function pluralizeThisIs(english: string, plural: boolean): string {
  return plural ? english.replace(/^This is /, "These are ") : english;
}

/**
 * Named people turned into possessive adjectives (Petrov, Annina).
 * Nominative only — oblique forms (v Petrovom aute) are out of scope for drills.
 */
export interface NameOwner {
  english: string;
  id: string;
  /** Masculine nominative: Petrov / Annin. Other forms add -a, -o, -e. */
  stem: string;
}

export const NAME_OWNERS: readonly NameOwner[] = [
  { id: "peter", english: "Peter's", stem: "Petrov" },
  { id: "marek", english: "Marek's", stem: "Marekov" },
  { id: "tom", english: "Tom's", stem: "Tomov" },
  { id: "anna", english: "Anna's", stem: "Annin" },
  { id: "maria", english: "Mária's", stem: "Máriin" },
  { id: "otec", english: "Dad's", stem: "otcov" },
  { id: "mama", english: "Mom's", stem: "mamin" },
];

export type NameOwnerSlot = Exclude<Slot, "masculine-animate" | "plural-personal">;

/** Petrov brat, Petrova sestra, Petrovo auto, Petrove kľúče. No personal plural (Petrovi = to Peter). */
export function nameOwnerForm(owner: NameOwner, slot: NameOwnerSlot): string {
  if (slot === "feminine") return `${owner.stem}a`;
  if (slot === "neuter") return `${owner.stem}o`;
  if (slot === "plural") return `${owner.stem}e`;
  return owner.stem;
}

/** Capitalize a sentence-initial Slovak word without touching the rest. */
export function capitalizeSlovak(text: string): string {
  return text.charAt(0).toLocaleUpperCase("sk-SK") + text.slice(1);
}

/** Paradigm row for lesson tables: one owner across masculine / feminine / neuter / plural. */
export function agreementRow(owner: OwnerId): string[] {
  return [
    possessiveForm(owner, "masculine-inanimate", "nominative"),
    possessiveForm(owner, "feminine", "nominative"),
    possessiveForm(owner, "neuter", "nominative"),
    possessiveForm(owner, "plural", "nominative"),
  ];
}

/** Paradigm cell where people and things differ: “môjho / môj”. */
export function caseCell(
  owner: DeclinableOwnerId,
  column: "masculine" | "plural",
  grammaticalCase: GrammaticalCase,
): string {
  const people = possessiveForm(
    owner,
    column === "masculine" ? "masculine-animate" : "plural-personal",
    grammaticalCase,
  );
  const things = possessiveForm(
    owner,
    column === "masculine" ? "masculine-inanimate" : "plural",
    grammaticalCase,
  );
  return people === things ? people : `${people} / ${things}`;
}
