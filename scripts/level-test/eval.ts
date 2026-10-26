/**
 * Scorer eval for the level test: which model scores Slovak answers best.
 * See scripts/level-test/eval/README.md.
 *
 *   bun scripts/level-test/eval.ts -- check [--snk]
 *   bun scripts/level-test/eval.ts -- review [--model <openrouter slug>]
 *   bun scripts/level-test/eval.ts -- run --models a,b [--repeats 3] [--split test] [--concurrency 4] [--only id,id]
 *   bun scripts/level-test/eval.ts -- report [--split test] [--models a,b]
 */
import { appendFile, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { buildLevelTestBank } from "../../src/lib/catalog/level-test/bank";
import { listeningSets } from "../../src/lib/catalog/level-test/listening";
import {
  ScoringBusyError,
  ScoringRefusedError,
  scoreProduction,
  type ScorerUsage,
} from "../../src/lib/level-test/server/score";
import { ROOT } from "../lib/paths";
import { loadSnkFormCounts } from "./snk-forms";
import { ADVERSARIAL } from "./eval/adversarial";
import { EVAL_BASES } from "./eval/bases";
import { buildCases } from "./eval/build";
import { renderReport, summarize } from "./eval/metrics";
import type { EvalCase, EvalResult, PhotoRef } from "./eval/types";

const OUT_DIR = path.join(ROOT, "tmp", "level-test-eval");
const RESULTS_DIR = path.join(OUT_DIR, "results");
const REVIEWS_DIR = path.join(ROOT, "content", "level-test", "eval-reviews");
const REVIEW_PROMPT = path.join(
  ROOT,
  "scripts",
  "level-test",
  "eval",
  "review-prompt.md",
);
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

/** Real words the SNK form lists loaded by `snk-forms.ts` leave out. */
const SNK_MISSING = new Set(["by"]);

/**
 * SNK has web text typed without accents, so an accent error is still found there.
 * Below this share of the right form's count it is a typo, not another word.
 */
const TYPO_SHARE = 0.02;

function parseArgs(argv: string[]) {
  const args = argv.filter((arg) => arg !== "--");
  const command = args.find((arg) => !arg.startsWith("--")) ?? "check";
  const flags = new Map<string, string>();
  for (let index = 0; index < args.length; index++) {
    const arg = args[index]!;
    if (!arg.startsWith("--")) continue;
    const next = args[index + 1];
    if (next !== undefined && !next.startsWith("--")) {
      flags.set(arg.slice(2), next);
      index++;
    } else {
      flags.set(arg.slice(2), "true");
    }
  }
  const list = (name: string) =>
    (flags.get(name) ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
  return { command, flags, list };
}

function photoRefs(): Map<string, PhotoRef> {
  return new Map(
    buildLevelTestBank().photos.map((photo) => [
      photo.id,
      { src: photo.src, alt: photo.alt },
    ]),
  );
}

function fileFor(model: string): string {
  return path.join(RESULTS_DIR, `${model.replace(/[^a-z0-9.-]+/giu, "_")}.jsonl`);
}

async function readResults(file: string): Promise<EvalResult[]> {
  try {
    const text = await readFile(file, "utf8");
    return text
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as EvalResult);
  } catch {
    return [];
  }
}

function inSplit(split: string) {
  return (entry: EvalCase) => split === "all" || entry.split === split;
}

async function check(cases: EvalCase[], withSnk: boolean): Promise<void> {
  const tally = new Map<string, number>();
  for (const entry of cases) {
    const key = `${entry.split} · ${entry.variant}`;
    tally.set(key, (tally.get(key) ?? 0) + 1);
  }
  console.log(
    `${cases.length} cases from ${EVAL_BASES.length} answers and ${ADVERSARIAL.length} rule cases`,
  );
  for (const [key, count] of [...tally].sort()) console.log(`  ${key}: ${count}`);

  if (withSnk) {
    const forms = await loadSnkFormCounts();
    for (const base of EVAL_BASES) {
      const words = `${base.response} ${base.followUp ?? ""}`
        .split(/[^\p{L}]+/u)
        .filter(Boolean)
        .map((word) => word.toLocaleLowerCase("sk"));
      const unknown = [...new Set(words)].filter(
        (word) => !forms.has(word) && !SNK_MISSING.has(word),
      );
      if (unknown.length) console.log(`${base.id}: not in SNK: ${unknown.join(", ")}`);
      for (const mutation of base.mutations) {
        if (mutation.topic !== "accents") continue;
        const wrong = forms.get(mutation.to.toLocaleLowerCase("sk")) ?? 0;
        const right = forms.get(mutation.from.toLocaleLowerCase("sk")) ?? 0;
        if (right > 0 && wrong / right > TYPO_SHARE) {
          console.log(
            `${base.id}: "${mutation.to}" is ${Math.round((wrong / right) * 100)}% as common as "${mutation.from}"; it may be a real word`,
          );
        }
      }
    }
  }

  let files: string[] = [];
  try {
    files = (await readdir(REVIEWS_DIR)).filter((file) => file.endsWith(".json"));
  } catch {
    return;
  }
  for (const file of files) {
    const review = JSON.parse(await readFile(path.join(REVIEWS_DIR, file), "utf8")) as {
      bases?: {
        id: string;
        cleanCorrect?: boolean;
        problems?: { quote: string; problem: string; fix: string }[];
        levelFits?: boolean;
        suggestedLevel?: string | null;
        photoProblems?: string[];
        summaryProblems?: string[];
        mutations?: {
          index: number;
          definitelyWrong?: boolean;
          topicCorrect?: boolean;
          betterTopic?: string | null;
          note?: string;
        }[];
      }[];
      rules?: { id: string; fair?: boolean; note?: string }[];
    };
    console.log(`\nReview ${file}:`);
    for (const base of review.bases ?? []) {
      for (const problem of base.problems ?? []) {
        console.log(
          `  ${base.id}: "${problem.quote}" — ${problem.problem} → ${problem.fix}`,
        );
      }
      if (base.levelFits === false)
        console.log(`  ${base.id}: level → ${base.suggestedLevel ?? "?"}`);
      for (const note of [
        ...(base.photoProblems ?? []),
        ...(base.summaryProblems ?? []),
      ]) {
        console.log(`  ${base.id}: ${note}`);
      }
      for (const mutation of base.mutations ?? []) {
        if (mutation.definitelyWrong === false || mutation.topicCorrect === false) {
          const source = EVAL_BASES.find((entry) => entry.id === base.id)?.mutations[
            mutation.index
          ];
          console.log(
            `  ${base.id} #${mutation.index} ${source ? `"${source.from}" → "${source.to}"` : ""}: ${mutation.definitelyWrong === false ? "may be correct" : `topic → ${mutation.betterTopic ?? "?"}`}${mutation.note ? ` (${mutation.note})` : ""}`,
          );
        }
      }
    }
    for (const rule of review.rules ?? []) {
      if (rule.fair === false) console.log(`  ${rule.id}: unfair — ${rule.note ?? ""}`);
    }
  }
}

async function review(cases: EvalCase[], model: string | undefined): Promise<void> {
  const photos = photoRefs();
  const data = {
    bases: EVAL_BASES.map((base) => {
      const clean = cases.find((entry) => entry.id === `${base.id}/clean`)!;
      const set = base.listening
        ? listeningSets.find((entry) => entry.id === base.listening)
        : undefined;
      return {
        id: base.id,
        kind: base.kind,
        targetLevel: base.targetLevel,
        prompt: clean.request.prompt,
        ...(base.photo
          ? {
              photo: {
                caption: photos.get(base.photo)?.alt,
                url: photos.get(base.photo)?.src,
              },
            }
          : {}),
        ...(set ? { scenario: set.scenario.text, summaryPoints: set.summaryKey } : {}),
        answer: clean.request.response,
        mutations: base.mutations.map((mutation, index) => ({ index, ...mutation })),
      };
    }),
    rules: cases
      .filter((entry) => entry.variant === "adversarial")
      .map((entry) => ({
        id: entry.id,
        kind: entry.request.kind,
        prompt: entry.request.prompt,
        answer: entry.request.response,
        description: ADVERSARIAL.find((input) => input.id === entry.id)?.why,
        expected: entry.expect,
      })),
  };
  const prompt = `${await readFile(REVIEW_PROMPT, "utf8")}\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n`;
  await mkdir(OUT_DIR, { recursive: true });
  const promptFile = path.join(OUT_DIR, "review-prompt.md");
  await writeFile(promptFile, prompt);
  console.log(
    `Review prompt → ${path.relative(ROOT, promptFile)} (${prompt.length.toLocaleString("en")} characters)`,
  );
  if (!model) return;

  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENROUTER_API_KEY missing (set it in .env)");
  console.log(`Sending to ${model}…`);
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      max_tokens: 64_000,
      reasoning: { effort: "high" },
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!response.ok)
    throw new Error(`Review failed (${response.status}): ${await response.text()}`);
  const body = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = body.choices?.[0]?.message?.content ?? "";
  await mkdir(REVIEWS_DIR, { recursive: true });
  const name = model.replace(/[^a-z0-9.-]+/giu, "_");
  const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  try {
    JSON.parse(json);
    const file = path.join(REVIEWS_DIR, `${name}.json`);
    await writeFile(file, `${JSON.stringify(JSON.parse(json), null, 2)}\n`);
    console.log(
      `Review → ${path.relative(ROOT, file)}. Run \`check\` to list what it flagged.`,
    );
  } catch {
    const file = path.join(OUT_DIR, `review-${name}.txt`);
    await writeFile(file, text);
    console.log(`The reply was not JSON; saved as ${path.relative(ROOT, file)}`);
  }
}

async function scoreWithRetry(
  entry: EvalCase,
  model: string,
  apiKey: string,
): Promise<Omit<EvalResult, "caseId" | "model" | "repeat">> {
  let usage: ScorerUsage | undefined;
  for (let attempt = 0; ; attempt++) {
    const started = Date.now();
    try {
      const score = await scoreProduction(
        { apiKey, model, onUsage: (value) => (usage = value) },
        entry.request,
      );
      return { ms: Date.now() - started, score, ...usageFields(usage) };
    } catch (error) {
      const ms = Date.now() - started;
      if (error instanceof ScoringBusyError && attempt < 4) {
        await new Promise((resolve) => setTimeout(resolve, 2 ** (attempt + 1) * 1000));
        continue;
      }
      if (error instanceof ScoringRefusedError)
        return { ms, refused: true, ...usageFields(usage) };
      return {
        ms,
        error: error instanceof Error ? error.message : String(error),
        ...usageFields(usage),
      };
    }
  }
}

function usageFields(usage: ScorerUsage | undefined) {
  return usage
    ? {
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        ...(usage.cost !== undefined ? { cost: usage.cost } : {}),
      }
    : {};
}

async function run(
  cases: EvalCase[],
  models: string[],
  repeats: number,
  concurrency: number,
): Promise<void> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENROUTER_API_KEY missing (set it in .env)");
  if (models.length === 0)
    throw new Error("Pass --models with one or more OpenRouter slugs");
  await mkdir(RESULTS_DIR, { recursive: true });

  for (const model of models) {
    const file = fileFor(model);
    const done = new Set(
      (await readResults(file))
        .filter((result) => result.score || result.refused)
        .map((result) => `${result.caseId}#${result.repeat}`),
    );
    const jobs = cases.flatMap((entry) =>
      Array.from({ length: repeats }, (_, repeat) => ({ entry, repeat })).filter(
        ({ entry: item, repeat }) => !done.has(`${item.id}#${repeat}`),
      ),
    );
    console.log(`${model}: ${jobs.length} calls to make (${done.size} already saved)`);

    let finished = 0;
    const worker = async () => {
      for (let job = jobs.shift(); job; job = jobs.shift()) {
        const outcome = await scoreWithRetry(job.entry, model, apiKey);
        const result: EvalResult = {
          caseId: job.entry.id,
          model,
          repeat: job.repeat,
          ...outcome,
        };
        await appendFile(file, `${JSON.stringify(result)}\n`);
        finished++;
        if (outcome.error)
          console.log(`  ${job.entry.id} #${job.repeat}: ${outcome.error}`);
        if (finished % 20 === 0) console.log(`  ${finished} done`);
      }
    };
    await Promise.all(Array.from({ length: concurrency }, worker));
  }
}

async function report(cases: EvalCase[], models: string[], split: string): Promise<void> {
  let files: string[] = [];
  try {
    files = (await readdir(RESULTS_DIR)).filter((file) => file.endsWith(".jsonl"));
  } catch {
    // No results yet; the report says so.
  }
  const results = (
    await Promise.all(files.map((file) => readResults(path.join(RESULTS_DIR, file))))
  )
    .flat()
    .filter((result) => models.length === 0 || models.includes(result.model));
  const text = renderReport(summarize(cases, results), split);
  await mkdir(OUT_DIR, { recursive: true });
  const file = path.join(OUT_DIR, "report.md");
  await writeFile(file, text);
  console.log(text);
  console.log(`Report → ${path.relative(ROOT, file)}`);
}

async function main(): Promise<void> {
  const { command, flags, list } = parseArgs(process.argv.slice(2));
  const split = flags.get("split") ?? "test";
  const only = new Set(list("only"));
  const all = buildCases(EVAL_BASES, ADVERSARIAL, photoRefs());
  const cases = all
    .filter(inSplit(split))
    .filter((entry) => only.size === 0 || only.has(entry.group) || only.has(entry.id));

  switch (command) {
    case "check":
      return check(all, flags.has("snk"));
    case "review":
      return review(all, flags.get("model"));
    case "run":
      return run(
        cases,
        list("models"),
        Number(flags.get("repeats") ?? 3),
        Number(flags.get("concurrency") ?? 4),
      );
    case "report":
      return report(cases, list("models"), split);
    default:
      throw new Error(`Unknown command "${command}". Use check, review, run or report.`);
  }
}

await main();
