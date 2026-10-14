import { eyebrowMutedClass, panelClass } from "$lib/components/ui/system-ui";

/**
 * One card for every table and ranked list: a neutral panel, a grey header
 * row, uppercase column labels, ruled rows, and a plain footer row.
 */
export const dataPanelClass = `${panelClass} overflow-hidden`;

export const dataPanelHeadClass =
  "flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-slate-200 bg-subtle px-4 py-2.5 sm:px-5";

/** Range on the left, pager on the right: same rule as the header, no tint. */
export const dataPanelFootClass =
  "flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-slate-200 px-4 py-3 sm:px-5";

/** Full-width "Show more" row that reads as part of the list. */
export const dataMoreRowClass =
  "flex w-full cursor-pointer items-center justify-center gap-1.5 border-0 border-t border-slate-200 bg-transparent px-4 py-3 text-sm font-semibold text-blue-800 transition-colors duration-150 hover:bg-blue-50/50 sm:px-5";

export const dataColumnHeadClass = `${eyebrowMutedClass} hidden border-b border-slate-200 bg-subtle/60 px-4 py-2 sm:grid sm:px-5`;

export const dataStaticRowClass =
  "grid items-baseline border-b border-slate-200/70 px-4 py-2.5 last:border-b-0 sm:px-5";

export const dataRowClass = `group ${dataStaticRowClass} no-underline transition-colors hover:bg-blue-50/50`;

export const dataRangeClass = "m-0 text-sm text-slate-600";

export const dataWordClass =
  "font-serif text-base leading-snug text-blue-800 group-hover:underline";

export const dataGlossClass = "text-sm leading-snug text-slate-600";

export const dataMetaClass = "text-xs tabular-nums text-slate-500";

export const dataEmptyClass = "px-4 py-14 text-center sm:px-5";
