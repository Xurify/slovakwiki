import path from "node:path";

import { ROOT } from "../lib/paths";

export interface FoucBootTarget {
  /** Short id used in logs / CLI filter (`lessons`). */
  id: string;
  /** Browser entry that runs pre-paint (no Astro/Svelte). */
  entry: string;
  /** Generated module path (committed). */
  out: string;
  /** Exported const name inside the generated module. */
  exportName: string;
}

/** Register every blocking FOUC boot here. `bun run fouc:boot` rebuilds them. */
export const FOUC_BOOTS: FoucBootTarget[] = [
  {
    id: "lessons",
    entry: path.join(ROOT, "src/lib/lesson-progress/boot-entry.ts"),
    out: path.join(ROOT, "src/lib/lesson-progress/boot-script.generated.ts"),
    exportName: "LESSONS_BOOT_SCRIPT",
  },
];

export function resolveFoucBoots(filter?: string): FoucBootTarget[] {
  if (!filter) return FOUC_BOOTS;
  const matched = FOUC_BOOTS.filter((boot) => boot.id === filter);
  if (matched.length === 0) {
    const known = FOUC_BOOTS.map((boot) => boot.id).join(", ");
    throw new Error(`Unknown FOUC boot "${filter}". Known: ${known || "(none)"}`);
  }
  return matched;
}
