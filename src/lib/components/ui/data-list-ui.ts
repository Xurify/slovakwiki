/**
 * One look for every browsable or ranked list: the lessons FormTable card.
 * A subtle header strip holds the range label and controls, uppercase column
 * labels sit under it, rows are hairline-divided with a hover tint, and
 * paging lives in a subtle footer strip. Each list adds its own grid tracks
 * (and gap) to both the column head and the rows so they line up.
 */

export const dataPanelClass =
  "overflow-hidden rounded-(--frame-radius) bg-surface shadow-(--shadow-border)";

export const dataPanelHeadClass =
  "flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-slate-200 bg-subtle px-4 py-2.5 sm:px-5";

export const dataPanelFootClass =
  "flex flex-wrap items-center justify-center gap-1.5 border-t border-slate-200 bg-subtle px-4 py-4 sm:px-5";

/** Column labels; hidden on phones, where rows stack their cells. */
export const dataColumnHeadClass =
  "hidden border-b border-slate-200 bg-subtle/60 px-4 py-2 text-[0.64rem] font-bold tracking-[0.14em] text-slate-500 uppercase sm:grid sm:px-5";

/** A row that is not itself a link. */
export const dataStaticRowClass =
  "grid items-baseline border-b border-slate-200/70 px-4 py-2.5 last:border-b-0 sm:px-5";

/** A row that is a link: hover tint, and `group` so the word can underline. */
export const dataRowClass = `group ${dataStaticRowClass} no-underline transition-colors hover:bg-blue-50/50`;

export const dataRangeClass = "m-0 text-sm text-slate-600";

export const dataWordClass =
  "font-serif text-base leading-snug text-blue-800 group-hover:underline";

export const dataGlossClass = "text-sm leading-snug text-slate-600";

export const dataMetaClass = "text-xs tabular-nums text-slate-500";

export const dataEmptyClass = "px-4 py-14 text-center sm:px-5";
