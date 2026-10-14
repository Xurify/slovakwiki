import type { LearningResource } from "$lib/catalog/resources/catalog";
import { resourceCostLabel } from "$lib/catalog/resources/catalog";
import { panelClass, panelHoverClass, tagClass } from "$lib/components/ui/system-ui";

export { resourceCostLabel };

export const resourcesPanelClass = `${panelClass} overflow-hidden`;

export const resourcesFeaturedGridClass =
  "grid grid-cols-1 gap-4 min-[700px]:grid-cols-2";

export const resourcesFeaturedCardClass = `${panelClass} ${panelHoverClass} flex h-full flex-col p-5 max-[600px]:p-4`;

export const resourcesFeaturedMetaPillClass = tagClass;

export const resourcesFeaturedLinkChipClass =
  "inline-flex items-center rounded-(--control-radius) border border-slate-200 bg-paper px-2.5 py-1 text-xs text-blue-800 transition-colors hover:border-blue-600 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

/** Featured cards keep a scannable footer; the full link set stays on the category row. */
export const RESOURCE_FEATURED_LINK_LIMIT = 3;

export const resourcesSidebarLinkClass =
  "flex items-baseline justify-between gap-3 py-1.5 font-serif text-sm text-slate-700 transition-colors hover:text-blue-800 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

export const resourcesMobileChipClass =
  "inline-flex items-center rounded-(--control-radius) border border-slate-300 bg-surface px-3 py-1.5 font-serif text-sm text-blue-800 transition-colors hover:border-blue-600 hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

export const resourcesRowClass =
  "border-b border-slate-200 px-5 py-4.5 transition-colors last:border-b-0 hover:bg-blue-50/50 max-[600px]:px-3.5 max-[600px]:py-4";

export const resourcesTitleLinkClass =
  "font-serif text-base font-semibold leading-snug text-blue-800 transition-colors hover:underline hover:underline-offset-2";

/** Caveats read as an aside, not as a second summary paragraph. */
export const resourcesNoteClass =
  "m-0 mt-2.5 border-l-2 border-slate-200 pl-3 text-xs leading-relaxed text-slate-500";

export const resourcesAnnotatedLinkLabelClass =
  "text-sm font-medium text-blue-800 underline decoration-slate-300 underline-offset-2 transition-colors hover:decoration-blue-800";

export const resourcesSubLinkClass =
  "text-sm text-blue-800 underline decoration-slate-300 underline-offset-2 transition-colors hover:decoration-blue-800";

export const resourcesTextRowClass =
  "border-b border-slate-200 px-4 py-4 transition-colors last:border-b-0 hover:bg-blue-50/50 max-[600px]:px-3.5";

export function resourceMetaLine(resource: LearningResource): string {
  const parts: string[] = [resourceCostLabel(resource.cost)];
  if (resource.level) parts.push(resource.level);
  return parts.join(" · ");
}
