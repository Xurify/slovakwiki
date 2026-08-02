/**
 * Report generated practice frames, ranked by learner visibility.
 *
 * Usage:
 *   bun run examples:audit
 *   bun run examples:audit -- --limit 300 --report tmp/generated-example-audit.tsv
 */

import { writeFile } from "node:fs/promises";
import path from "node:path";

import { words } from "../../src/lib/content/data";
import { ROOT } from "../lib/paths";

type AuditRow = {
  category: string;
  english: string;
  rank: number | null;
  slovak: string;
  slug: string;
  suggestedAction: string;
};

function option(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function suggestedAction(row: AuditRow): string {
  if (row.category === "Verbs") return "Review valency, reflexive particle, and aspect.";
  if (row.category === "Nouns")
    return "Review noun frame and English article/countability.";
  if (row.category === "Adjectives") return "Review host noun and agreement.";
  if (row.category === "Places") return "Review place statement.";
  return "Review wording.";
}

const limit = Number(option("--limit") ?? "300");
const report = option("--report");

if (!Number.isSafeInteger(limit) || limit < 1) {
  throw new Error("--limit must be a positive integer.");
}

const rows: AuditRow[] = words
  .filter(
    (word) =>
      word.kind === "word" &&
      word.examples.length > 0 &&
      word.examples.every((example) => example.isPracticeFrame),
  )
  .map((word) => {
    const example = word.examples[0]!;
    const row: AuditRow = {
      category: word.category,
      english: example.english,
      rank: word.frequency?.rank ?? null,
      slovak: example.slovak,
      slug: word.slug,
      suggestedAction: "",
    };
    row.suggestedAction = suggestedAction(row);
    return row;
  })
  .sort((first, second) => {
    const firstRank = first.rank ?? Number.MAX_SAFE_INTEGER;
    const secondRank = second.rank ?? Number.MAX_SAFE_INTEGER;
    return firstRank - secondRank || first.slug.localeCompare(second.slug, "sk");
  });

const prioritised = rows.slice(0, limit);
const byCategory = new Map<string, number>();
for (const row of rows) {
  byCategory.set(row.category, (byCategory.get(row.category) ?? 0) + 1);
}

console.log(`Generated practice frames: ${rows.length}`);
for (const [category, count] of byCategory) {
  console.log(`${category}: ${count}`);
}
console.log(`Review queue (${prioritised.length}):`);
if (!report) {
  for (const row of prioritised) {
    const rank = row.rank ? `#${row.rank}` : "curated";
    console.log(`${rank}\t${row.slug}\t${row.slovak}\t${row.english}`);
  }
}

if (report) {
  const output = path.resolve(ROOT, report);
  const header = "rank\tslug\tcategory\tslovak\tenglish\tsuggestedAction";
  const lines = prioritised.map((row) =>
    [row.rank ?? "", row.slug, row.category, row.slovak, row.english, row.suggestedAction]
      .map((cell) => String(cell).replace(/\t|\r?\n/g, " "))
      .join("\t"),
  );
  await writeFile(output, `${header}\n${lines.join("\n")}\n`, "utf8");
  console.log(`Report: ${path.relative(ROOT, output)}`);
}
