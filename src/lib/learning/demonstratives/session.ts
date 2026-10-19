import type { PracticeItem } from "$lib/learning/types";
import { seededRng } from "$lib/learning/possessives/session";
import { shuffleArray } from "$lib/learning/time/clock";
import {
  buildAgreementExercise,
  buildAnimateAccusativeExercise,
  buildCaseChoiceExercise,
  buildCaseClozeExercise,
  buildPluralExercise,
  buildRepairExercise,
  buildRoleOddOneOutExercise,
  buildSpotExercise,
  buildTentoTamtenExercise,
  buildThisNotThatExercise,
  buildToJeExercise,
  buildTymTymiExercise,
  buildTypedExercise,
  type DemonstrativeTaskBuilder,
} from "./generators";

export const demonstrativesLessonId = "grammar/demonstratives";

const demonstrativesSource = {
  kind: "lesson" as const,
  label: "Demonstratives: ten, tento, tamten",
  href: "/lessons/grammar/demonstratives",
};

const BUILDERS = {
  "grammar/demonstrative-agreement": buildAgreementExercise,
  "grammar/demonstrative-plural": buildPluralExercise,
  "grammar/demonstrative-to-je": buildToJeExercise,
  "grammar/demonstrative-tento-tamten": buildTentoTamtenExercise,
  "grammar/demonstrative-this-not-that": buildThisNotThatExercise,
  "grammar/demonstrative-case-choice": buildCaseChoiceExercise,
  "grammar/demonstrative-case-cloze": buildCaseClozeExercise,
  "grammar/demonstrative-animate-accusative": buildAnimateAccusativeExercise,
  "grammar/demonstrative-tym-tymi": buildTymTymiExercise,
  "grammar/demonstrative-role-odd-one-out": buildRoleOddOneOutExercise,
  "grammar/demonstrative-typed": buildTypedExercise,
  "grammar/demonstrative-repair": buildRepairExercise,
  "grammar/demonstrative-spot": buildSpotExercise,
} satisfies Record<string, DemonstrativeTaskBuilder>;

export type DemonstrativeKind = keyof typeof BUILDERS;

export const DEMONSTRATIVE_KINDS = Object.keys(BUILDERS) as DemonstrativeKind[];

export function isDemonstrativeKind(id: string): id is DemonstrativeKind {
  return Object.hasOwn(BUILDERS, id);
}

export function materializeDemonstrativeItem(
  kind: DemonstrativeKind,
  rng: () => number = Math.random,
): PracticeItem {
  const task = BUILDERS[kind](kind, rng);
  return { id: kind, source: demonstrativesSource, task, feedback: task.feedback };
}

/** Always opens on agreement so the SSR-painted first card survives the client reshuffle. */
const OPENER: DemonstrativeKind = "grammar/demonstrative-agreement";

export const DEMONSTRATIVES_SESSION_SIZE = DEMONSTRATIVE_KINDS.length;

export function buildDemonstrativesSession(
  rng: () => number = Math.random,
): PracticeItem[] {
  const rest = DEMONSTRATIVE_KINDS.filter((kind) => kind !== OPENER);
  return [OPENER, ...shuffleArray(rest, rng)].map((kind) =>
    materializeDemonstrativeItem(kind, rng),
  );
}

/** Catalog stubs for hub links, validation, and lesson practiceItemId — sessions draw fresh tasks. */
export const demonstrativesPracticeItems: PracticeItem[] = DEMONSTRATIVE_KINDS.map(
  (kind, index) => {
    const item = materializeDemonstrativeItem(kind, seededRng(index + 1));
    return { ...item, task: { ...item.task, id: `review-${kind.split("/")[1]}` } };
  },
);

export const demonstrativesPracticeItemIds = demonstrativesPracticeItems.map(
  (item) => item.id,
);
