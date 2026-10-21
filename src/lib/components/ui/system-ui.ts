/**
 * The small set of class bundles every page shares. Components own their
 * layout; these keep the recurring atoms (labels, panels, chips, icon
 * buttons, "more" links) identical wherever they appear.
 */

export const eyebrowClass = "m-0 font-sans text-sm leading-snug font-semibold";

export const eyebrowMutedClass = `${eyebrowClass} text-slate-500`;

/** The card: one radius, one hairline ring, no second border. */
export const panelClass = "rounded-(--frame-radius) bg-surface shadow-(--shadow-border)";

/** A panel that is also a link or a button. */
export const panelHoverClass =
  "transition-[background-color,box-shadow] duration-150 ease-out hover:shadow-(--shadow-border-hover)";

/** Ghost icon button: theme, sound, settings, close. Pair with a size and tone. */
export const iconButtonClass =
  "inline-grid shrink-0 cursor-pointer place-items-center rounded-(--control-radius) border-0 bg-transparent transition-colors duration-150 ease-out";

export const iconButtonToneClass = "text-slate-500 hover:bg-subtle hover:text-slate-900";

const chipBase =
  "inline-flex cursor-pointer items-center justify-center rounded-full border text-xs font-semibold no-underline transition-[color,background-color,border-color,box-shadow] duration-150 ease-out";

const chipIdle =
  "border-slate-300 bg-surface text-slate-600 shadow-(--shadow-border) hover:border-slate-400 hover:bg-subtle hover:text-slate-900";

const chipActive = "border-blue-600 bg-blue-600 text-paper shadow-none";

/** Filter chip (topic, part of speech). */
export function chipClass(active: boolean): string {
  return `${chipBase} px-3 py-1.5 ${active ? chipActive : chipIdle}`;
}

/** Square-ish chip for single letters. */
export function letterChipClass(active: boolean): string {
  return `${chipBase} h-8 min-w-8 px-2 ${active ? chipActive : chipIdle}`;
}

/** Static tag: a cost, a level, a kind. Never interactive. */
export const tagClass =
  "inline-flex items-center rounded-full bg-subtle px-2.5 py-0.5 text-xs font-semibold text-slate-600";

/** "View track →" style link at the end of a section. Wrap the arrow in `group`. */
export const moreLinkClass =
  "group inline-flex items-center gap-1.5 text-sm font-bold text-blue-800 no-underline hover:underline";

/** The 3px focus halo on text fields. */
export const fieldFocusClass =
  "transition-[box-shadow,border-color] duration-150 ease-out focus-within:border-blue-600 focus-within:shadow-[0_0_0_3px_var(--accent-soft)]";
