/**
 * Build slim dictionary export JSON for /downloads (client builder source).
 *
 * Usage:
 *   bun run downloads:export
 *
 * Writes `static/downloads/dictionary-export.json` (gitignored).
 * Also invoked from the Astro build hook for production.
 *
 * Shape (per word): slug, slovak (spelled lemma), english, category,
 * related (spelled lemmas), examples[{ slovak, english }].
 * No note / tatoebaId / demonstrates.
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { words } from "../../src/lib/content/data";
import {
  DEFAULT_ATTRIBUTION,
  type DictionaryExportFile,
  type ExportExample,
  type ExportWord,
} from "../../src/lib/content/downloads/types";
import { ROOT } from "../lib/paths";

export function buildDictionaryExport(
  generatedAt = new Date().toISOString(),
): DictionaryExportFile {
  const dictWords = words.filter((word) => word.kind === "word");
  const slovakBySlug = new Map(dictWords.map((word) => [word.slug, word.slovak]));

  const exportWords: ExportWord[] = dictWords.map((word) => {
    const examples: ExportExample[] = word.examples.map((example) => ({
      slovak: example.slovak,
      english: example.english,
    }));

    return {
      slug: word.slug,
      slovak: word.slovak,
      english: word.english,
      category: word.category,
      related: word.related.map((slug) => slovakBySlug.get(slug) ?? slug),
      examples,
    };
  });

  return {
    generatedAt,
    source: "slovak.wiki",
    attribution: DEFAULT_ATTRIBUTION,
    words: exportWords,
  };
}

export async function writeDictionaryExport(outputPaths: string[]): Promise<{
  bytes: number;
  wordCount: number;
}> {
  const payload = buildDictionaryExport();
  const body = `${JSON.stringify(payload, null, 2)}\n`;
  const bytes = Buffer.byteLength(body, "utf8");

  for (const outputPath of outputPaths) {
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, body, "utf8");
  }

  return { bytes, wordCount: payload.words.length };
}

const isDirectRun = process.argv[1]
  ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;

if (isDirectRun) {
  const out = path.join(ROOT, "static", "downloads", "dictionary-export.json");
  const { bytes, wordCount } = await writeDictionaryExport([out]);
  console.log(
    `Dictionary export: ${wordCount} words, ${(bytes / 1024 / 1024).toFixed(2)} MB → ${path.relative(ROOT, out)}`,
  );
}
