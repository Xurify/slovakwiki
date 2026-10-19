import type { StorageLike } from "$lib/components/practice/practice-state";

export const REVIEW_STORAGE_KEY = "slovak.wiki.review.v1";

export const REVIEW_GAPS_IN_DAYS = [1, 3, 7, 21] as const;

export const MAX_CARDS_PER_REVIEW = 12;

export interface FormMemory {
  seen: number;
  missed: number;
  gapIndex: number;
  dueDay?: string;
}

export interface ReviewMemory {
  version: 1;
  forms: Record<string, FormMemory>;
}

export type ReviewGrade = "accents" | "correct" | "incorrect" | "revealed";

export function emptyReviewMemory(): ReviewMemory {
  return { version: 1, forms: {} };
}

export function localDayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function addDays(day: string, days: number): string {
  const [year, month, date] = day.split("-").map(Number);
  return localDayKey(new Date(year ?? 1970, (month ?? 1) - 1, (date ?? 1) + days));
}

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
  if (!isCount(form.seen) || !isCount(form.missed) || !isCount(form.gapIndex))
    return null;

  const memory: FormMemory = {
    seen: form.seen,
    missed: form.missed,
    gapIndex: form.gapIndex,
  };
  if (isDay(form.dueDay)) memory.dueDay = form.dueDay;
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

export function recordAnswer(
  memory: ReviewMemory,
  formId: string,
  grade: ReviewGrade,
  today: string,
): ReviewMemory {
  const before = memory.forms[formId] ?? { seen: 0, missed: 0, gapIndex: 0 };
  const form: FormMemory = { ...before, seen: before.seen + 1 };

  const missed = grade === "incorrect" || grade === "revealed";
  const wasDue = form.dueDay !== undefined && form.dueDay <= today;

  if (missed) {
    form.missed += 1;
    form.gapIndex = 0;
    form.dueDay = addDays(today, REVIEW_GAPS_IN_DAYS[0]);
  } else if (wasDue) {
    form.gapIndex += 1;
    const nextGap = REVIEW_GAPS_IN_DAYS[form.gapIndex];
    if (nextGap === undefined) delete form.dueDay;
    else form.dueDay = addDays(today, nextGap);
  }

  return { ...memory, forms: { ...memory.forms, [formId]: form } };
}

export function saveAnswerForReview(
  storage: StorageLike,
  formId: string,
  grade: ReviewGrade,
  now: Date = new Date(),
): void {
  const memory = readReviewMemory(storage);
  writeReviewMemory(storage, recordAnswer(memory, formId, grade, localDayKey(now)));
}

export function dueFormIdsOldestFirst(memory: ReviewMemory, today: string): string[] {
  return Object.entries(memory.forms)
    .filter(([, form]) => form.dueDay !== undefined && form.dueDay <= today)
    .sort(([, a], [, b]) => (a.dueDay ?? "").localeCompare(b.dueDay ?? ""))
    .map(([formId]) => formId);
}

export function nextDueDay(memory: ReviewMemory): string | null {
  let next: string | null = null;
  for (const form of Object.values(memory.forms)) {
    if (form.dueDay && (next === null || form.dueDay < next)) next = form.dueDay;
  }
  return next;
}
