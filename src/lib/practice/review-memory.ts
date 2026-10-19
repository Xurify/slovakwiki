import type { StorageLike } from "$lib/components/practice/practice-state";

export const REVIEW_STORAGE_KEY = "slovak.wiki.review.v1";

/**
 * Days until a missed form comes back, one step per correct review in a row. The
 * gaps roughly double, which is where recall gets hard enough to strengthen memory
 * without being forgotten outright.
 */
export const REVIEW_STEPS_DAYS = [1, 3, 7, 21] as const;

/** One review session; more than this at once turns review into a chore. */
export const REVIEW_SESSION_SIZE = 12;

export interface FormMemory {
  seen: number;
  missed: number;
  /** Index into REVIEW_STEPS_DAYS for the current gap. */
  step: number;
  /** Local `YYYY-MM-DD`. Unset until the form is missed, and again once learned. */
  due?: string;
}

export interface ReviewMemory {
  version: 1;
  forms: Record<string, FormMemory>;
}

export type ReviewGrade = "accents" | "correct" | "incorrect" | "revealed";

export function emptyReviewMemory(): ReviewMemory {
  return { version: 1, forms: {} };
}

/** Local calendar date, so "tomorrow" turns over at the learner's midnight. */
export function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function addDays(day: string, days: number): string {
  const [year, month, date] = day.split("-").map(Number);
  return dayKey(new Date(year ?? 1970, (month ?? 1) - 1, (date ?? 1) + days));
}

/** Whole calendar days from `from` to `to`, both `YYYY-MM-DD`. */
export function daysBetween(from: string, to: string): number {
  const utc = (day: string): number => {
    const [year, month, date] = day.split("-").map(Number);
    return Date.UTC(year ?? 1970, (month ?? 1) - 1, date ?? 1);
  };
  return Math.round((utc(to) - utc(from)) / 86_400_000);
}

function isCount(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

function isDay(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/u.test(value);
}

function asFormMemory(value: unknown): FormMemory | null {
  if (!value || typeof value !== "object") return null;
  const form = value as Record<string, unknown>;
  if (!isCount(form.seen) || !isCount(form.missed) || !isCount(form.step)) return null;

  const memory: FormMemory = { seen: form.seen, missed: form.missed, step: form.step };
  if (isDay(form.due)) memory.due = form.due;
  return memory;
}

export function readReviewMemory(storage: StorageLike): ReviewMemory {
  let raw: string | null;
  try {
    raw = storage.getItem(REVIEW_STORAGE_KEY);
  } catch {
    return emptyReviewMemory();
  }
  if (!raw) return emptyReviewMemory();

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return emptyReviewMemory();

    const state = parsed as Record<string, unknown>;
    if (state.version !== 1 || !state.forms || typeof state.forms !== "object") {
      return emptyReviewMemory();
    }

    const forms: Record<string, FormMemory> = {};
    for (const [formId, value] of Object.entries(state.forms)) {
      const form = asFormMemory(value);
      if (form) forms[formId] = form;
    }
    return { version: 1, forms };
  } catch {
    return emptyReviewMemory();
  }
}

export function writeReviewMemory(storage: StorageLike, memory: ReviewMemory): void {
  try {
    storage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(memory));
  } catch {
    // Ignore quota / private-mode failures.
  }
}

/**
 * A miss schedules the form for tomorrow. A right answer only moves it along when it
 * was due: getting it right again in the same session proves little.
 */
export function recordAnswer(
  memory: ReviewMemory,
  formId: string,
  grade: ReviewGrade,
  today: string,
): ReviewMemory {
  const before = memory.forms[formId] ?? { seen: 0, missed: 0, step: 0 };
  const form: FormMemory = { ...before, seen: before.seen + 1 };

  if (grade === "incorrect" || grade === "revealed") {
    form.missed += 1;
    form.step = 0;
    form.due = addDays(today, REVIEW_STEPS_DAYS[0]);
  } else if (form.due && form.due <= today) {
    form.step += 1;
    const gap = REVIEW_STEPS_DAYS[form.step];
    if (gap === undefined) delete form.due;
    else form.due = addDays(today, gap);
  }

  return { ...memory, forms: { ...memory.forms, [formId]: form } };
}

/** One answer from a live session, stored straight away so a closed tab loses nothing. */
export function rememberAnswer(
  storage: StorageLike,
  formId: string,
  grade: ReviewGrade,
  now: Date = new Date(),
): void {
  const memory = readReviewMemory(storage);
  writeReviewMemory(storage, recordAnswer(memory, formId, grade, dayKey(now)));
}

/** Forms due today or earlier, longest overdue first. */
export function dueFormIds(memory: ReviewMemory, today: string): string[] {
  return Object.entries(memory.forms)
    .filter(([, form]) => form.due !== undefined && form.due <= today)
    .sort(([, a], [, b]) => (a.due ?? "").localeCompare(b.due ?? ""))
    .map(([formId]) => formId);
}

/** The soonest day something comes back, if anything is waiting. */
export function nextDueDay(memory: ReviewMemory): string | null {
  let next: string | null = null;
  for (const form of Object.values(memory.forms)) {
    if (form.due && (next === null || form.due < next)) next = form.due;
  }
  return next;
}
