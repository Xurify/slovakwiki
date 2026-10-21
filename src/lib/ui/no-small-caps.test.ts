import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const SRC = fileURLToPath(new URL("../..", import.meta.url));

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    if (entry.name.endsWith(".generated.ts") || entry.name.endsWith(".test.ts"))
      return [];
    return /\.(svelte|astro|ts)$/.test(entry.name) ? [path] : [];
  });
}

describe("labels", () => {
  // AGENTS.md "Avoid the generated look": uppercase on its own is fine for
  // acronyms like JSON; uppercase plus letter-spacing is the small-caps label.
  it("never pairs uppercase with wide tracking", () => {
    const offenders: string[] = [];

    for (const file of sourceFiles(SRC)) {
      const strings =
        readFileSync(file, "utf8").match(/"[^"\n]*"|'[^'\n]*'|`[^`]*`/g) ?? [];
      for (const value of strings) {
        if (
          /\buppercase\b/.test(value) &&
          /\btracking-(?:wide|wider|widest|\[)/.test(value)
        ) {
          offenders.push(`${relative(SRC, file)}: ${value.slice(0, 80)}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
