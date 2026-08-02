/**
 * Regenerate docs/data-sources.md from src/lib/content/references.ts
 */

import { writeFile } from "node:fs/promises";
import path from "node:path";

import { formatReferencesMarkdown } from "../../src/lib/content/references";
import { ROOT } from "../lib/paths";

const OUT = path.join(ROOT, "docs", "data-sources.md");

await writeFile(OUT, formatReferencesMarkdown(), "utf8");
console.log(`Wrote ${path.relative(ROOT, OUT)}`);
