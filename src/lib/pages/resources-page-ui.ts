import type { LearningResource } from "$lib/content/resources";
import { resourceCostLabel } from "$lib/content/resources";

export { resourceCostLabel };

export const resourcesPanelClass =
  "overflow-hidden rounded-(--frame-radius) bg-surface ring-1 ring-inset ring-slate-200";

export const resourcesSidebarLinkClass =
  "flex items-baseline justify-between gap-3 py-1.5 font-serif text-sm text-slate-700 transition-colors hover:text-blue-800 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

export const resourcesMobileChipClass =
  "inline-flex items-center rounded-(--control-radius) border border-slate-300 bg-surface px-3 py-1.5 font-serif text-sm text-blue-800 transition-colors hover:border-blue-600 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

export const resourcesRowClass =
  "border-b border-slate-200 px-4 py-4 transition-colors last:border-b-0 hover:bg-blue-50/50 max-[600px]:px-3.5";

export const resourcesTitleLinkClass =
  "font-serif text-base font-semibold leading-snug text-blue-800 transition-colors hover:underline hover:underline-offset-2";

export const resourcesSubLinkClass =
  "text-sm text-blue-800 underline decoration-slate-300 underline-offset-2 transition-colors hover:decoration-blue-800";

export const resourcesTextRowClass =
  "border-b border-slate-200 px-4 py-4 transition-colors last:border-b-0 hover:bg-blue-50/50 max-[600px]:px-3.5";

export function resourceMetaLine(resource: LearningResource): string {
  const parts: string[] = [resourceCostLabel(resource.cost)];
  if (resource.level) parts.push(resource.level);
  return parts.join(" · ");
}
