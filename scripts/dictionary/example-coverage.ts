/**
 * Report Tatoeba example coverage for top-N frequency lemmas per POS.
 *
 * Usage:
 *   bun run examples:coverage
 *   bun run examples:coverage -- --top 200 --out tmp/top-200-example-coverage.json
 */

import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { words } from "../../src/lib/content/data";
import {
  FREQUENCY_POS_LABEL,
  type FrequencyPos,
} from "../../src/lib/content/frequency-types";
import { ROOT } from "../lib/paths";

function parseArgs(argv: string[]): { top: number; out: string } {
  let top = 200;
  let out = path.join(ROOT, "tmp", "top-200-example-coverage.json");

  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--top" && argv[index + 1]) {
      top = Number(argv[index + 1]);
      index += 1;
    }
    if (argv[index] === "--out" && argv[index + 1]) {
      out = path.resolve(argv[index + 1]!);
      index += 1;
    }
  }

  return { top, out };
}

async function main(): Promise<void> {
  const { top, out } = parseArgs(process.argv.slice(2));
  const positions: FrequencyPos[] = ["verb", "noun", "adjective"];

  const report: {
    generatedAt: string;
    top: number;
    byPos: Record<
      string,
      {
        withExamples: number;
        missing: number;
        coverage: number;
        missingLemmas: { rank: number; slovak: string; slug: string; english: string }[];
      }
    >;
  } = {
    generatedAt: new Date().toISOString(),
    top,
    byPos: {},
  };

  for (const pos of positions) {
    const ranked = words
      .filter((word) => word.frequency?.pos === pos && word.frequency.rank <= top)
      .toSorted((a, b) => (a.frequency?.rank ?? 0) - (b.frequency?.rank ?? 0));

    const missing = ranked.filter((word) => word.examples.length === 0);
    const withExamples = ranked.length - missing.length;

    report.byPos[pos] = {
      withExamples,
      missing: missing.length,
      coverage: ranked.length === 0 ? 0 : withExamples / ranked.length,
      missingLemmas: missing.map((word) => ({
        rank: word.frequency!.rank,
        slovak: word.slovak,
        slug: word.slug,
        english: word.english,
      })),
    };

    const pct = (report.byPos[pos].coverage * 100).toFixed(1);
    console.log(
      `${FREQUENCY_POS_LABEL[pos]} top ${top}: ${withExamples}/${ranked.length} with examples (${pct}%)`,
    );
  }

  await writeFile(out, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`→ ${path.relative(ROOT, out)}`);
}

const isDirectRun =
  Boolean(process.argv[1]) &&
  path.resolve(process.argv[1]!) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  await main();
}
