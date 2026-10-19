/**
 * Pronoun lemmas for search, built from the hand-checked paradigms the lessons use.
 * The dictionary has no pronoun entries yet, so search answers forms like tohto or
 * mojej from here.
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

export interface PronounTableRow {
  case: GrammaticalCase;
  /** One or two forms per cell: masculine animate / inanimate, plural personal / other. */
  cells: Record<PronounColumn, string[]>;
}

export interface PronounLemma {
  english: string;
  id: string;
  lemma: string;
  note: string;
  /** Lemma ids of the same family, shown as related words. */
  related: string[];
  table: PronounTableRow[];
  /** Lesson id (`track/slug`) the topic links hang off. */
  topicId: string;
}

export interface PronounFormMatch {
  case: GrammaticalCase;
  slot: Slot;
}

export interface PronounHit {
  matches: PronounFormMatch[];
  pronoun: PronounLemma;
}

export const PRONOUN_COLUMNS: readonly PronounColumn[] = [
  "masculine",
  "feminine",
  "neuter",
  "plural",
];

const COLUMN_SLOTS: Record<PronounColumn, readonly Slot[]> = {
  masculine: ["masculine-animate", "masculine-inanimate"],
  feminine: ["feminine"],
  neuter: ["neuter"],
  plural: ["plural-personal", "plural"],
};

type FormFor = (slot: Slot, grammaticalCase: GrammaticalCase) => string;

const formFns = new Map<string, FormFor>();

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
  formFns.set(series, formFor);
  return {
    id: series,
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
  formFns.set(owner, formFor);
  return {
    id: owner,
    lemma,
    english,
    note,
    related: POSSESSIVE_IDS.filter((other) => other !== owner),
    topicId: "grammar/possessives",
    table: buildTable(formFor),
  };
}

export const pronounLemmas: readonly PronounLemma[] = [
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

type FormIndex = Map<string, PronounHit[]>;

let formIndex: FormIndex | undefined;

function buildFormIndex(): FormIndex {
  const index: FormIndex = new Map();

  for (const pronoun of pronounLemmas) {
    const formFor = formFns.get(pronoun.id)!;
    const byForm = new Map<string, PronounFormMatch[]>();

    for (const grammaticalCase of CASES) {
      for (const slot of SLOTS) {
        const form = normalizeSearchText(formFor(slot, grammaticalCase));
        byForm.set(form, [...(byForm.get(form) ?? []), { case: grammaticalCase, slot }]);
      }
    }

    for (const [form, matches] of byForm) {
      index.set(form, [...(index.get(form) ?? []), { pronoun, matches }]);
    }
  }

  return index;
}

/** Every pronoun whose paradigm contains `query` (diacritics optional). */
export function findPronounForms(query: string): PronounHit[] {
  formIndex ??= buildFormIndex();
  return formIndex.get(normalizeSearchText(query)) ?? [];
}

/** All normalized pronoun forms, for spelling suggestions. */
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
  const byCase = new Map<GrammaticalCase, Slot[]>();
  for (const match of matches) {
    byCase.set(match.case, [...(byCase.get(match.case) ?? []), match.slot]);
  }

  // Cases that share the same genders read as one group: “genitive, dative (feminine)”.
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
