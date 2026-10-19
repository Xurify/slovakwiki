/**
 * Answer options in lessons and practice: flat rows and tiles with a 1px
 * border, the same hover as every other control, and tone only once graded.
 * The clock Q1 pre-paint replica (`apply-clock-q1.ts`) paints these exact
 * strings, so the SSR boot and the hydrated island match pixel for pixel.
 */
const optionMotion =
  "transition-[border-color,background-color,box-shadow,color] duration-150 ease-out disabled:cursor-default";

// Graded rows leave these out: Tailwind sorts same-property utilities by name, so bg-surface would beat bg-emerald-50.
const optionNeutral = "border-slate-300 bg-surface text-slate-900";

const optionShell = `cursor-pointer border ${optionNeutral} ${optionMotion}`;
const optionGradedShell = `border ${optionMotion}`;

const rowShape =
  "flex min-h-13 w-full items-center gap-3 rounded-(--control-radius) px-4 py-3 text-left font-serif text-base";
const clockShape =
  "relative grid min-h-14 w-full justify-items-center gap-2 rounded-(--frame-radius) px-3 py-4 text-center font-serif text-sm font-semibold";

/** Full-width answer row (choice, select-all). */
export const optionRowClass = `${optionShell} ${rowShape}`;

/** Clock-face choice: a square tile with the face above its label. */
export const optionClockClass = `${optionShell} ${clockShape}`;

/** Word tile in the build-a-sentence bank and tray. */
export const optionTileClass = `${optionShell} inline-flex min-h-10 items-center rounded-(--control-radius) px-3.5 py-1.5 font-serif text-base`;

/** Hover and the pressed (selected) state, before grading. */
export const optionIdleClass =
  "enabled:hover:border-slate-400 enabled:hover:bg-subtle aria-pressed:border-blue-600 aria-pressed:bg-blue-50 aria-pressed:text-blue-900 aria-pressed:shadow-[inset_0_0_0_1px_var(--accent)]";

/** Tiles invite a tap: blue on hover instead of grey. */
export const optionTileIdleClass =
  "touch-none select-none enabled:hover:border-blue-600 enabled:hover:bg-blue-50";

export const choiceRowIdleClass = `${optionRowClass} ${optionIdleClass}`;
export const choiceClockIdleClass = `${optionClockClass} ${optionIdleClass}`;
export const buildTileIdleClass = `${optionTileClass} ${optionTileIdleClass}`;

export type OptionGradeState = "right" | "wrong" | "missed" | "rest";

/** Tone after grading: the row carries it, nothing around it does. */
function optionToneClass(state: OptionGradeState): string {
  if (state === "right") {
    return "border-emerald-600 bg-emerald-50 text-slate-900 shadow-[inset_0_0_0_1px_var(--color-emerald-600)]";
  }
  if (state === "wrong") {
    return "border-rose-600 bg-rose-50 text-slate-900 shadow-[inset_0_0_0_1px_var(--color-rose-600)]";
  }
  if (state === "missed") {
    return "border-dashed border-slate-400 bg-paper text-slate-900";
  }
  return "border-slate-200 bg-surface text-slate-500";
}

export function optionGradedClass(
  state: OptionGradeState,
  shape: "row" | "clock" = "row",
): string {
  return `${optionGradedShell} ${shape === "clock" ? clockShape : rowShape} ${optionToneClass(state)}`;
}

/** Small keycap: the number that selects this option from the keyboard. */
export const optionKeyClass =
  "inline-grid min-w-5 shrink-0 place-items-center rounded-[4px] border border-slate-300 bg-surface px-1 py-px font-sans text-[0.68rem] font-semibold leading-4 text-slate-500 shadow-[0_1px_0_0_var(--line-strong)]";
