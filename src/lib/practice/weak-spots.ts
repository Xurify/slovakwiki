import { daysBetween, type ReviewMemory } from "./review-memory";

export interface PracticeRule {
  formId: string;
  label: string;
  practiceHref: string;
}

export interface WeakSpot extends PracticeRule {
  seen: number;
  missed: number;
  daysUntilReview: number | null;
}

function missRate(spot: WeakSpot): number {
  return spot.missed / spot.seen;
}

export function weakSpotsWorstFirst(
  memory: ReviewMemory,
  rules: readonly PracticeRule[],
  today: string,
): WeakSpot[] {
  const practised = rules.flatMap((rule) => {
    const form = memory.forms[rule.formId];
    if (!form || form.seen === 0) return [];

    const daysUntilReview =
      form.dueDay === undefined ? null : Math.max(0, daysBetween(today, form.dueDay));
    return [{ ...rule, seen: form.seen, missed: form.missed, daysUntilReview }];
  });

  return practised.sort(
    (a, b) => missRate(b) - missRate(a) || b.missed - a.missed || b.seen - a.seen,
  );
}
