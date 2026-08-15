import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { formatReferencesMarkdown } from "./catalog";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const DATA_SOURCES = path.join(ROOT, "docs", "data-sources.md");

describe("docs/data-sources.md", () => {
  it("matches formatReferencesMarkdown()", () => {
    const onDisk = readFileSync(DATA_SOURCES, "utf8");
    const expected = formatReferencesMarkdown();

    expect(
      onDisk,
      "docs/data-sources.md is out of sync with src/lib/catalog/data-sources/catalog.ts — run: bun scripts/docs/write-data-sources.ts",
    ).toBe(expected);
  });
});
