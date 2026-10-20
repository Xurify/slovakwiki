/**
 * Pronoun paradigms for search, from the hand-checked tables the lessons use, so forms
 * like tohto or mojej resolve to their lemma.
 */

import {
  CASES,
  demonstrativeForm,
  type DemonstrativeSeries,
  type GrammaticalCase,
  type Slot,
} from "$lib/learning/demonstratives/paradigm";
import {
  possessiveForm,
  type DeclinableOwnerId,
} from "$lib/learning/possessives/paradigm";
import { normalizeSearchText } from "./ui";

export type PronounColumn = "masculine" | "feminine" | "neuter" | "plural";

export interface PronounColumnDef {
  id: string;
  label: string;
  shortLabel: string;
}

export interface PronounTableRow {
  case: GrammaticalCase;
  /**
   * Gendered: one or two forms per cell (masculine animate / inanimate, plural personal / other).
   * Personal: every form, long first; an empty cell has no form in that case.
   */
  cells: Record<string, string[]>;
}

export interface PronounLemma {
  columns: readonly PronounColumnDef[];
  english: string;
  id: string;
  kind: "gendered" | "personal";
  lemma: string;
  note: string;
  related: string[];
  table: PronounTableRow[];
  /** Lesson id (`track/slug`) the topic links hang off. */
  topicId?: string;
}

export interface PronounFormMatch {
  case: GrammaticalCase;
  /** Personal pronouns: which column the form sits in. */
  column?: string;
  /** Gendered pronouns: the agreement slot. */
  slot?: Slot;
}

export interface PronounHit {
  matches: PronounFormMatch[];
  pronoun: PronounLemma;
}

const PRONOUN_COLUMNS: readonly PronounColumn[] = [
  "masculine",
  "feminine",
  "neuter",
  "plural",
];

const GENDERED_COLUMNS: readonly PronounColumnDef[] = [
  { id: "masculine", label: "Masculine", shortLabel: "Masc." },
  { id: "feminine", label: "Feminine", shortLabel: "Fem." },
  { id: "neuter", label: "Neuter", shortLabel: "Neut." },
  { id: "plural", label: "Plural", shortLabel: "Pl." },
];

const PERSONAL_COLUMNS: readonly PronounColumnDef[] = [
  { id: "forms", label: "Forms", shortLabel: "Forms" },
  {
    id: "after-preposition",
    label: "After a preposition",
    shortLabel: "After prep.",
  },
];

const COLUMN_SLOTS: Record<PronounColumn, readonly Slot[]> = {
  masculine: ["masculine-animate", "masculine-inanimate"],
  feminine: ["feminine"],
  neuter: ["neuter"],
  plural: ["plural-personal", "plural"],
};

type FormFor = (slot: Slot, grammaticalCase: GrammaticalCase) => string;

const formFnById = new Map<string, FormFor>();

const SLOTS: readonly Slot[] = Object.values(COLUMN_SLOTS).flat();

function buildTable(formFor: FormFor): PronounTableRow[] {
  return CASES.map((grammaticalCase) => {
    const cells = {} as Record<PronounColumn, string[]>;
    for (const column of PRONOUN_COLUMNS) {
      cells[column] = [
        ...new Set(COLUMN_SLOTS[column].map((slot) => formFor(slot, grammaticalCase))),
      ];
    }
    return { case: grammaticalCase, cells };
  });
}

function demonstrative(
  series: DemonstrativeSeries,
  english: string,
  note: string,
): PronounLemma {
  const formFor: FormFor = (slot, grammaticalCase) =>
    demonstrativeForm(series, slot, grammaticalCase);
  formFnById.set(series, formFor);
  return {
    id: series,
    kind: "gendered",
    columns: GENDERED_COLUMNS,
    lemma: series,
    english,
    note,
    related: (["ten", "tento", "tamten"] as const).filter((other) => other !== series),
    topicId: "grammar/demonstratives",
    table: buildTable(formFor),
  };
}

const POSSESSIVE_IDS: readonly DeclinableOwnerId[] = [
  "my",
  "your-ty",
  "our",
  "your-vy",
  "own",
];

function possessive(
  owner: DeclinableOwnerId,
  lemma: string,
  english: string,
  note: string,
): PronounLemma {
  const formFor: FormFor = (slot, grammaticalCase) =>
    possessiveForm(owner, slot, grammaticalCase);
  formFnById.set(owner, formFor);
  return {
    id: owner,
    kind: "gendered",
    columns: GENDERED_COLUMNS,
    lemma,
    english,
    note,
    related: POSSESSIVE_IDS.filter((other) => other !== owner),
    topicId: "grammar/possessives",
    table: buildTable(formFor),
  };
}

type PersonalRows = Record<
  GrammaticalCase,
  [forms: string[], afterPreposition: string[]]
>;

const PERSONAL_IDS = ["ja", "ty", "on", "ona", "my", "vy", "oni", "seba"] as const;

function personal(
  lemma: (typeof PERSONAL_IDS)[number],
  english: string,
  note: string,
  rows: PersonalRows,
): PronounLemma {
  return {
    id: `personal-${lemma}`,
    kind: "personal",
    columns: PERSONAL_COLUMNS,
    lemma,
    english,
    note,
    related: PERSONAL_IDS.filter((other) => other !== lemma).map(
      (other) => `personal-${other}`,
    ),
    table: CASES.map((grammaticalCase) => {
      const [forms, afterPreposition] = rows[grammaticalCase];
      return {
        case: grammaticalCase,
        cells: { forms, "after-preposition": afterPreposition },
      };
    }),
  };
}

const personalLemmas: readonly PronounLemma[] = [
  personal(
    "ja",
    "I",
    "Short forms (ma, mi) never start a sentence. After a preposition: pre mňa, so mnou.",
    {
      nominative: [["ja"], []],
      genitive: [["mňa", "ma"], ["mňa"]],
      dative: [["mne", "mi"], ["mne"]],
      accusative: [["mňa", "ma"], ["mňa"]],
      locative: [[], ["mne"]],
      instrumental: [["mnou"], ["mnou"]],
    },
  ),
  personal(
    "ty",
    "you (one person you call ty)",
    "Short forms (ťa, ti) sit second in the sentence: Vidím ťa. After a preposition: pre teba, s tebou.",
    {
      nominative: [["ty"], []],
      genitive: [["teba", "ťa"], ["teba"]],
      dative: [["tebe", "ti"], ["tebe"]],
      accusative: [["teba", "ťa"], ["teba"]],
      locative: [[], ["tebe"]],
      instrumental: [["tebou"], ["tebou"]],
    },
  ),
  personal(
    "on",
    "he; it (ono)",
    "After a preposition the forms start with n-: k nemu, s ním, o ňom.",
    {
      nominative: [["on", "ono"], []],
      genitive: [["jeho", "ho"], ["neho"]],
      dative: [["jemu", "mu"], ["nemu"]],
      accusative: [["jeho", "ho"], ["neho"]],
      locative: [[], ["ňom"]],
      instrumental: [["ním"], ["ním"]],
    },
  ),
  personal("ona", "she", "After a preposition: bez nej, na ňu, s ňou.", {
    nominative: [["ona"], []],
    genitive: [["jej"], ["nej"]],
    dative: [["jej"], ["nej"]],
    accusative: [["ju"], ["ňu"]],
    locative: [[], ["nej"]],
    instrumental: [["ňou"], ["ňou"]],
  }),
  personal("my", "we", "The same forms follow a preposition: pre nás, s nami.", {
    nominative: [["my"], []],
    genitive: [["nás"], ["nás"]],
    dative: [["nám"], ["nám"]],
    accusative: [["nás"], ["nás"]],
    locative: [[], ["nás"]],
    instrumental: [["nami"], ["nami"]],
  }),
  personal(
    "vy",
    "you (several people, or one person you call vy)",
    "The same forms follow a preposition: pre vás, s vami.",
    {
      nominative: [["vy"], []],
      genitive: [["vás"], ["vás"]],
      dative: [["vám"], ["vám"]],
      accusative: [["vás"], ["vás"]],
      locative: [[], ["vás"]],
      instrumental: [["vami"], ["vami"]],
    },
  ),
  personal(
    "oni",
    "they",
    "Oni for men or mixed groups, ony for women, children and things. After a preposition: pre nich, na ne, s nimi.",
    {
      nominative: [["oni", "ony"], []],
      genitive: [["ich"], ["nich"]],
      dative: [["im"], ["nim"]],
      accusative: [["ich"], ["nich", "ne"]],
      locative: [[], ["nich"]],
      instrumental: [["nimi"], ["nimi"]],
    },
  ),
  personal(
    "seba",
    "oneself (reflexive)",
    "Points back to the subject, in any person: Myslí len na seba. Vezmi si to so sebou.",
    {
      nominative: [[], []],
      genitive: [["seba", "sa"], ["seba"]],
      dative: [["sebe", "si"], ["sebe"]],
      accusative: [["seba", "sa"], ["seba"]],
      locative: [[], ["sebe"]],
      instrumental: [["sebou"], ["sebou"]],
    },
  ),
];

export const pronounLemmas: readonly PronounLemma[] = [
  ...personalLemmas,
  demonstrative(
    "ten",
    "that, the",
    "The everyday pointer. Slovak has no article, so it also means “the”.",
  ),
  demonstrative("tento", "this", "This one here, near the speaker."),
  demonstrative(
    "tamten",
    "that (over there)",
    "That one over there, away from the speaker.",
  ),
  possessive("my", "môj", "my", "Agrees with the thing owned, not with the owner."),
  possessive("your-ty", "tvoj", "your (ty)", "For one person you call ty."),
  possessive("our", "náš", "our", "Agrees with the thing owned, not with the owner."),
  possessive(
    "your-vy",
    "váš",
    "your (vy)",
    "For several people, or one person you call vy.",
  ),
  possessive(
    "own",
    "svoj",
    "one's own",
    "Used when the owner is the subject of the sentence.",
  ),
];

export function pronounById(id: string): PronounLemma | undefined {
  return pronounLemmas.find((pronoun) => pronoun.id === id);
}

/** Dictionary files some pronouns (tento, môj) as phrases; search labels them by what they are. */
export function wordCategoryLabel(slovak: string, category: string | undefined): string {
  return pronounLemmas.some((pronoun) => pronoun.lemma === slovak)
    ? "pronoun"
    : (category ?? "");
}

type FormIndex = Map<string, PronounHit[]>;

let formIndex: FormIndex | undefined;

function buildFormIndex(): FormIndex {
  const index: FormIndex = new Map();

  for (const pronoun of pronounLemmas) {
    const byForm = new Map<string, PronounFormMatch[]>();
    const add = (raw: string, match: PronounFormMatch): void => {
      const form = normalizeSearchText(raw);
      byForm.set(form, [...(byForm.get(form) ?? []), match]);
    };

    const formFor = formFnById.get(pronoun.id);
    if (formFor) {
      for (const grammaticalCase of CASES) {
        for (const slot of SLOTS) {
          add(formFor(slot, grammaticalCase), { case: grammaticalCase, slot });
        }
      }
    } else {
      for (const row of pronoun.table) {
        for (const [column, forms] of Object.entries(row.cells)) {
          for (const form of forms) add(form, { case: row.case, column });
        }
      }
    }

    for (const [form, matches] of byForm) {
      index.set(form, [...(index.get(form) ?? []), { pronoun, matches }]);
    }
  }

  return index;
}

export function findPronounForms(query: string): PronounHit[] {
  formIndex ??= buildFormIndex();
  return formIndex.get(normalizeSearchText(query)) ?? [];
}

export function pronounFormVocabulary(): Array<{ form: string; lemma: string }> {
  formIndex ??= buildFormIndex();
  const vocabulary: Array<{ form: string; lemma: string }> = [];
  for (const [form, hits] of formIndex) {
    for (const hit of hits) {
      vocabulary.push({ form, lemma: hit.pronoun.lemma });
    }
  }
  return vocabulary;
}

const SLOT_LABELS: Record<Slot, string> = {
  "masculine-animate": "masculine animate",
  "masculine-inanimate": "masculine inanimate",
  feminine: "feminine",
  neuter: "neuter",
  "plural-personal": "plural for men",
  plural: "other plural",
};

/**
 * “genitive (masculine, neuter) · accusative (masculine animate)”.
 * Animacy and personal plural only show when the other half of the cell differs.
 */
export function describePronounForm(matches: readonly PronounFormMatch[]): string {
  if (matches.every((match) => match.slot === undefined)) {
    return describePersonalForm(matches);
  }

  const byCase = new Map<GrammaticalCase, Slot[]>();
  for (const match of matches) {
    if (!match.slot) continue;
    byCase.set(match.case, [...(byCase.get(match.case) ?? []), match.slot]);
  }

  const groups = new Map<string, GrammaticalCase[]>();
  for (const grammaticalCase of CASES) {
    const slots = byCase.get(grammaticalCase);
    if (!slots) continue;
    const label = slotLabels(new Set(slots));
    groups.set(label, [...(groups.get(label) ?? []), grammaticalCase]);
  }

  return [...groups]
    .map(([label, cases]) => `${cases.join(", ")} (${label})`)
    .join(" · ");
}

function describePersonalForm(matches: readonly PronounFormMatch[]): string {
  const standalone = new Set<GrammaticalCase>();
  const afterPreposition = new Set<GrammaticalCase>();
  for (const match of matches) {
    (match.column === "forms" ? standalone : afterPreposition).add(match.case);
  }

  const standaloneCases = CASES.filter((grammaticalCase) =>
    standalone.has(grammaticalCase),
  );
  const afterPrepositionOnly = CASES.filter(
    (grammaticalCase) =>
      afterPreposition.has(grammaticalCase) && !standalone.has(grammaticalCase),
  );

  return [
    ...(standaloneCases.length > 0 ? [standaloneCases.join(", ")] : []),
    ...(afterPrepositionOnly.length > 0
      ? [`${afterPrepositionOnly.join(", ")} (after a preposition)`]
      : []),
  ].join(" · ");
}

function slotLabels(slots: ReadonlySet<Slot>): string {
  const labels: string[] = [];

  for (const column of PRONOUN_COLUMNS) {
    const columnSlots = COLUMN_SLOTS[column];
    const hit = columnSlots.filter((slot) => slots.has(slot));
    if (hit.length === 0) continue;
    if (hit.length === columnSlots.length) {
      labels.push(column);
    } else {
      labels.push(...hit.map((slot) => SLOT_LABELS[slot]));
    }
  }

  return labels.join(", ");
}
