import type { PracticeSessionContext } from "$lib/catalog/practice/hub";
import type { AnswerGrade } from "$lib/components/practice/practice-state";

/** "Everyday Slovak · Set 1 of 5" under the session title. */
export function sessionSubtitle(context?: PracticeSessionContext): string | undefined {
  if (!context) return undefined;
  if (context.step < 1) return context.trackTitle;
  return `${context.trackTitle} · Set ${context.step} of ${context.stepCount}`;
}

/** Shared by `PracticePlayer` and the clock Q1 pre-paint replica (`ClockQ1Boot` + `apply-clock-q1`). */
export const sessionKickerClass =
  "m-0 mb-3 font-sans text-[0.64rem] font-bold tracking-[0.14em] text-slate-500 uppercase";

export const sessionPromptClass =
  "m-0 font-serif text-[clamp(1.2rem,2.8vw,1.5rem)] font-semibold leading-snug text-pretty text-slate-900";

export const sessionRevealClass =
  "border-0 bg-transparent py-1 text-left text-sm font-semibold text-slate-600 underline decoration-slate-300 underline-offset-[3px] transition-colors hover:text-blue-800 hover:decoration-blue-600";

export const sessionTypedInputClass =
  "min-h-[3.25rem] w-full rounded-(--control-radius) border px-4 py-3 font-serif text-xl outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

export const sessionTypedInputIdleClass =
  "border-slate-300 bg-control text-slate-900 disabled:opacity-60";

export const sessionClozeInputClass =
  "min-w-[7ch] border-0 border-b-2 px-2 py-1 text-center font-serif text-xl outline-none focus:ring-2 focus:ring-blue-100";

export const sessionClozeInputIdleClass = "border-blue-600 bg-blue-50";

export const sessionCharKeyClass =
  "min-w-9 rounded-(--control-radius) border border-slate-200 bg-slate-50 px-2 py-1.5 font-serif text-sm text-slate-600 hover:border-blue-600 hover:bg-blue-50 disabled:opacity-40";

export type AnsweredInputTone = "accents" | "correct" | "incorrect" | null;

export function answeredInputTone(
  submitted: boolean,
  grade: AnswerGrade | null,
  revealed: boolean,
): AnsweredInputTone {
  if (!submitted || revealed || grade === null) return null;
  return grade;
}

/** Border + tint for a typed / cloze input once the answer is checked; `idle` otherwise. */
export function answeredInputClass(tone: AnsweredInputTone, idle: string): string {
  if (tone === "correct") return "border-emerald-600 bg-emerald-50 text-emerald-800";
  if (tone === "accents") return "border-blue-600 bg-blue-50 text-blue-800";
  if (tone === "incorrect") return "border-rose-600 bg-rose-50 text-rose-800";
  return idle;
}
