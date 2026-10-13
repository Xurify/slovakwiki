import type { PracticeItem } from "$lib/learning/types";
import { shuffleArray } from "$lib/learning/time/clock";
import {
  buildAgreementExercise,
  buildBodyPartExercise,
  buildCaseChoiceExercise,
  buildCaseClozeExercise,
  buildFormalExercise,
  buildGenitiveBuildExercise,
  buildInstrumentalDativeExercise,
  buildJehoPrepositionExercise,
  buildNameAdjectiveExercise,
  buildPluralExercise,
  buildSvojChoiceExercise,
  buildSvojOddOneOutExercise,
  buildSvojRepairExercise,
  buildThirdPersonExercise,
  buildTypedExercise,
  buildWhoseExercise,
  type PossessiveTaskBuilder,
} from "./generators";

export const possessivesLessonId = "grammar/possessives";

const possessivesSource = {
  kind: "lesson" as const,
  label: "Possessives: môj, jeho, svoj",
  href: "/lessons/grammar/possessives",
};

const BUILDERS = {
  "grammar/possessive-agreement": buildAgreementExercise,
  "grammar/possessive-plural": buildPluralExercise,
  "grammar/possessive-formal": buildFormalExercise,
  "grammar/possessive-third-person": buildThirdPersonExercise,
  "grammar/possessive-jeho-preposition": buildJehoPrepositionExercise,
  "grammar/possessive-svoj-choice": buildSvojChoiceExercise,
  "grammar/possessive-svoj-repair": buildSvojRepairExercise,
  "grammar/possessive-svoj-odd-one-out": buildSvojOddOneOutExercise,
  "grammar/possessive-case-choice": buildCaseChoiceExercise,
  "grammar/possessive-case-cloze": buildCaseClozeExercise,
  "grammar/possessive-genitive-build": buildGenitiveBuildExercise,
  "grammar/possessive-typed": buildTypedExercise,
  "grammar/possessive-whose": buildWhoseExercise,
  "grammar/possessive-name-adjective": buildNameAdjectiveExercise,
  "grammar/possessive-ins-dat": buildInstrumentalDativeExercise,
  "grammar/possessive-body-si": buildBodyPartExercise,
} satisfies Record<string, PossessiveTaskBuilder>;

export type PossessiveKind = keyof typeof BUILDERS;

export const POSSESSIVE_KINDS = Object.keys(BUILDERS) as PossessiveKind[];

export function isPossessiveKind(id: string): id is PossessiveKind {
  return Object.hasOwn(BUILDERS, id);
}

/** mulberry32 — tiny deterministic PRNG so SSR and hydration paint the same session. */
export function seededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function materializePossessiveItem(
  kind: PossessiveKind,
  rng: () => number = Math.random,
): PracticeItem {
  const task = BUILDERS[kind](kind, rng);
  return { id: kind, source: possessivesSource, task, feedback: task.feedback };
}

/** Always opens on agreement so the SSR-painted first card survives the client reshuffle. */
const OPENER: PossessiveKind = "grammar/possessive-agreement";

const CORE: PossessiveKind[] = [
  "grammar/possessive-third-person",
  "grammar/possessive-svoj-choice",
  "grammar/possessive-case-choice",
  "grammar/possessive-case-cloze",
  "grammar/possessive-genitive-build",
  "grammar/possessive-typed",
];

const TRAPS: PossessiveKind[] = [
  "grammar/possessive-ins-dat",
  "grammar/possessive-jeho-preposition",
  "grammar/possessive-body-si",
];

function pickOne(kinds: PossessiveKind[], rng: () => number): PossessiveKind {
  return shuffleArray(kinds, rng)[0]!;
}

function selectPossessiveKinds(rng: () => number): PossessiveKind[] {
  const rest = [
    ...CORE,
    ...TRAPS,
    pickOne(
      ["grammar/possessive-svoj-repair", "grammar/possessive-svoj-odd-one-out"],
      rng,
    ),
    pickOne(["grammar/possessive-whose", "grammar/possessive-name-adjective"], rng),
    pickOne(["grammar/possessive-plural", "grammar/possessive-formal"], rng),
  ];
  return [OPENER, ...shuffleArray(rest, rng)];
}

export const POSSESSIVES_SESSION_SIZE = 13;

export function buildPossessivesSession(rng: () => number = Math.random): PracticeItem[] {
  return selectPossessiveKinds(rng).map((kind) => materializePossessiveItem(kind, rng));
}

/** Catalog stubs for hub links, validation, and lesson practiceItemId — sessions draw fresh tasks. */
export const possessivesPracticeItems: PracticeItem[] = POSSESSIVE_KINDS.map(
  (kind, index) => {
    const item = materializePossessiveItem(kind, seededRng(index + 1));
    return { ...item, task: { ...item.task, id: `review-${kind.split("/")[1]}` } };
  },
);

export const possessivesPracticeItemIds = possessivesPracticeItems.map((item) => item.id);
