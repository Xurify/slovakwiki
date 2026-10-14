import { dataColumnHeadClass, dataRowClass } from "$lib/components/ui/data-list-ui";

/**
 * rank · word · meaning · corpus count. On phones the meaning drops under the
 * word and the count hides. Shared by the SSR page and the client list so
 * appended rows match the first hundred exactly.
 */
export const commonListTrack =
  "gap-x-4 gap-y-0.5 grid-cols-[2.5rem_minmax(0,1fr)] sm:grid-cols-[2.5rem_minmax(0,14rem)_minmax(0,1fr)_6.5rem]";

export const commonRowClass = `${dataRowClass} ${commonListTrack}`;

export const commonColumnHeadClass = `${dataColumnHeadClass} ${commonListTrack}`;
