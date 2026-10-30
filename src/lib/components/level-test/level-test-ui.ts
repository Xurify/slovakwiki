/** Class bundles shared by the level-test task screens. */

export const SK_CHARS = [
  "á",
  "ä",
  "č",
  "ď",
  "é",
  "í",
  "ĺ",
  "ľ",
  "ň",
  "ó",
  "ô",
  "ŕ",
  "š",
  "ť",
  "ú",
  "ý",
  "ž",
] as const;

export const taskHeadingClass =
  "m-0 mt-4 text-center font-sans text-lg font-semibold leading-snug text-balance text-slate-900";

export const taskReadingClass =
  "m-0 font-serif text-xl leading-10 text-pretty text-slate-900";

export const textAreaClass =
  "min-h-36 w-full resize-y rounded-(--control-radius) border border-slate-300 bg-control px-4 py-3 font-serif text-lg leading-relaxed text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:opacity-60";

export const textInputClass =
  "min-h-11 rounded-(--control-radius) border border-slate-300 bg-control px-3 py-2 font-serif text-lg text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

/** A choice row: one radio-like option among a few sentences. */
export function optionRowClass(selected: boolean, font = "font-serif text-lg"): string {
  return [
    `flex w-full cursor-pointer items-start gap-3 rounded-(--control-radius) border px-4 py-3 text-left leading-snug transition-[background-color,border-color,box-shadow] duration-150 ease-out ${font}`,
    selected
      ? "border-blue-600 bg-blue-50 text-slate-900 shadow-[0_0_0_1px_var(--accent)]"
      : "border-slate-300 bg-control text-slate-900 hover:border-blue-600 hover:bg-control-hover",
  ].join(" ");
}

/** A radio mark: an outlined ring, with a small dot inside when chosen. */
export function optionDotClass(selected: boolean): string {
  return [
    "mt-1 size-4 shrink-0 rounded-full border-2 transition-[background-color,border-color] duration-150 ease-out",
    selected
      ? "border-blue-600 bg-blue-600 shadow-[inset_0_0_0_3px_var(--surface)]"
      : "border-slate-400 bg-surface",
  ].join(" ");
}

export const plannedTagClass =
  "inline-flex items-center rounded-full border border-dashed border-slate-400 px-2.5 py-px text-xs font-semibold text-slate-600";

export function wordCount(text: string): number {
  return text.split(/\s+/u).filter(Boolean).length;
}

/**
 * Types a character into whichever text field has focus, the same way a
 * keystroke would, so `bind:value` and `maxlength` handlers see it.
 */
export function typeIntoFocused(char: string): void {
  const field = document.activeElement;
  if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement))
    return;
  if (field.disabled || field.readOnly) return;
  const start = field.selectionStart ?? field.value.length;
  const end = field.selectionEnd ?? start;
  field.setRangeText(char, start, end, "end");
  field.dispatchEvent(new Event("input", { bubbles: true }));
}

/**
 * Blurring the focused field ends an IME composition and commits its text,
 * which the letter boxes only take in on compositionend.
 */
export function commitTyping(): void {
  const field = document.activeElement;
  if (field instanceof HTMLElement) field.blur();
}
