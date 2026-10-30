import { CEFR_LEVELS } from "../../../src/lib/level-test/scale";
import {
  AI_ISSUE_TOPICS,
  type AiIssue,
  type AiIssueTopic,
} from "../../../src/lib/level-test/types";
import { MAX_LISTED_ISSUES } from "./build";
import { findAll, hasCzech, quotePieces } from "./text";
import type { EvalCase, EvalResult, EvalSource, PlacedMutation } from "./types";

/** Pass marks, fixed before any model is run. Change them only with a reason in the commit. */
export const THRESHOLDS = {
  validReplies: 0.98,
  falseCorrections: 0.02,
  recall: 0.8,
  /** Aspect and clitic order are the hardest to see, so they get a lower bar. */
  topicRecall: { aspect: 0.7, wordOrder: 0.7, default: 0.8 },
  topicAccuracy: 0.8,
  fixRate: 0.9,
  czechCorrections: 0,
  usageRecall: 0.8,
  monotonicViolations: 0.05,
  levelExact: 0.6,
  levelAdjacent: 0.95,
  scoreSd: 4,
  rulePass: 1,
  wrongPhotoPass: 1,
  anchorPass: 1,
  transcriptShift: 5,
} as const;

/** Grammar more than this many points higher with more errors counts as out of order. */
const MONOTONIC_SLACK = 1;

export interface Check {
  name: string;
  value: number | null;
  pass: boolean | null;
  target: string;
  /** Measured against levels the answers were written at, not a human rating. */
  indicative?: boolean;
}

interface Ratio {
  hit: number;
  total: number;
}

const ratio = ({ hit, total }: Ratio) => (total === 0 ? null : hit / total);

export interface ModelSummary {
  model: string;
  calls: number;
  replies: number;
  refused: number;
  failed: number;
  checks: Check[];
  topicRecall: Record<AiIssueTopic, Ratio>;
  bySource: Partial<
    Record<EvalSource, { falseCorrections: number | null; recall: number | null }>
  >;
  /** Cases whose expectation failed at least once, with what came back. */
  misses: { caseId: string; detail: string }[];
  promptTokens: number;
  completionTokens: number;
  cost: number;
  meanMs: number;
}

/** Which placed error an issue points at: its quote has to overlap the error in the answer. */
export function matchIssue(
  response: string,
  issue: AiIssue,
  errors: readonly PlacedMutation[],
): PlacedMutation | null {
  for (const piece of quotePieces(issue.wrote)) {
    for (const start of findAll(response, piece)) {
      const end = start + piece.length;
      const hit = errors.find((error) => start < error.end && error.start < end);
      if (hit) return hit;
    }
  }
  return null;
}

/** Whether the correction puts back what the error replaced. */
export function fixesError(correct: string, error: PlacedMutation): boolean {
  const fix = correct.toLocaleLowerCase("sk").trim();
  const original = error.from.toLocaleLowerCase("sk");
  if (!fix) return false;
  if (fix.includes(original)) return true;
  return (
    fix.length >= 3 &&
    original.includes(fix) &&
    !error.to.toLocaleLowerCase("sk").includes(fix)
  );
}

function boldParts(feedback: string): string[] {
  return [...feedback.matchAll(/\*\*(.+?)\*\*/gu)].map((match) => match[1] ?? "");
}

function mean(values: number[]): number | null {
  return values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : null;
}

function sd(values: number[]): number {
  const average = mean(values) ?? 0;
  return Math.sqrt(mean(values.map((value) => (value - average) ** 2)) ?? 0);
}

function levelIndex(level: string): number {
  return CEFR_LEVELS.indexOf(level as (typeof CEFR_LEVELS)[number]);
}

function expectationMiss(entry: EvalCase, result: EvalResult): string | null {
  const score = result.score;
  if (!score) return null;
  const { maxScore, minScore, maxContent } = entry.expect;
  if (maxScore !== undefined && score.score > maxScore)
    return `score ${score.score} > ${maxScore}`;
  if (minScore !== undefined && score.score < minScore)
    return `score ${score.score} < ${minScore}`;
  if (maxContent !== undefined && score.criteria.content > maxContent) {
    return `content ${score.criteria.content} > ${maxContent}`;
  }
  return null;
}

function check(
  name: string,
  value: number | null,
  target: number,
  direction: "min" | "max",
  indicative = false,
): Check {
  const pass =
    value === null ? null : direction === "min" ? value >= target : value <= target;
  return {
    name,
    value,
    pass,
    target: `${direction === "min" ? "≥" : "≤"} ${target}`,
    ...(indicative ? { indicative } : {}),
  };
}

export function summarize(
  cases: readonly EvalCase[],
  results: readonly EvalResult[],
): ModelSummary[] {
  const byId = new Map(cases.map((entry) => [entry.id, entry]));
  const models = [...new Set(results.map((result) => result.model))].sort();

  return models.map((model) => {
    const mine = results.filter(
      (result) => result.model === model && byId.has(result.caseId),
    );
    const replies = mine.filter((result) => result.score);

    const falseCorrections: Ratio = { hit: 0, total: 0 };
    const recall: Ratio = { hit: 0, total: 0 };
    const topicAccuracy: Ratio = { hit: 0, total: 0 };
    const fixRate: Ratio = { hit: 0, total: 0 };
    const unmatched: Ratio = { hit: 0, total: 0 };
    const usageRecall: Ratio = { hit: 0, total: 0 };
    const levelExact: Ratio = { hit: 0, total: 0 };
    const levelAdjacent: Ratio = { hit: 0, total: 0 };
    const rules: Ratio = { hit: 0, total: 0 };
    const wrongPhoto: Ratio = { hit: 0, total: 0 };
    const anchors: Ratio = { hit: 0, total: 0 };
    const topicRecall = Object.fromEntries(
      AI_ISSUE_TOPICS.map((topic) => [topic, { hit: 0, total: 0 }]),
    ) as Record<AiIssueTopic, Ratio>;
    const sourceRatios = new Map<
      EvalSource,
      { falseCorrections: Ratio; recall: Ratio }
    >();
    let czech = 0;
    const misses: ModelSummary["misses"] = [];

    for (const result of replies) {
      const entry = byId.get(result.caseId)!;
      const score = result.score!;
      const issues = score.issues ?? [];
      const perSource = sourceRatios.get(entry.source) ?? {
        falseCorrections: { hit: 0, total: 0 },
        recall: { hit: 0, total: 0 },
      };
      sourceRatios.set(entry.source, perSource);

      const corrections = [
        ...issues.map((issue) => issue.correct),
        ...boldParts(score.feedback),
      ];
      czech += corrections.filter(hasCzech).length;

      if (entry.expect.noIssues) {
        falseCorrections.total++;
        perSource.falseCorrections.total++;
        if (issues.length > 0) {
          falseCorrections.hit++;
          perSource.falseCorrections.hit++;
          misses.push({
            caseId: entry.id,
            detail: `false correction: ${issues.map((issue) => `"${issue.wrote}" → "${issue.correct}"`).join("; ")}`,
          });
        }
      }

      if (entry.errors.length > 0) {
        const found = new Set<PlacedMutation>();
        for (const issue of issues) {
          unmatched.total++;
          const error = matchIssue(entry.request.response, issue, entry.errors);
          if (!error) {
            unmatched.hit++;
            continue;
          }
          if (found.has(error)) continue;
          found.add(error);
          topicAccuracy.total++;
          if (issue.topic === error.topic || error.alsoTopics?.includes(issue.topic)) {
            topicAccuracy.hit++;
          }
          fixRate.total++;
          if (fixesError(issue.correct, error)) fixRate.hit++;
        }
        const listable = Math.min(entry.errors.length, MAX_LISTED_ISSUES);
        recall.total += listable;
        recall.hit += Math.min(found.size, listable);
        perSource.recall.total += listable;
        perSource.recall.hit += Math.min(found.size, listable);
        if (entry.errors.length <= MAX_LISTED_ISSUES) {
          for (const error of entry.errors) {
            topicRecall[error.topic].total++;
            if (found.has(error)) topicRecall[error.topic].hit++;
          }
        }

        const injected = new Map<AiIssueTopic, number>();
        for (const error of entry.errors)
          injected.set(error.topic, (injected.get(error.topic) ?? 0) + 1);
        for (const [topic, count] of injected) {
          usageRecall.total += count;
          usageRecall.hit += Math.min(score.usage?.[topic]?.wrong ?? 0, count);
        }
      }

      if (entry.variant === "clean" && entry.targetLevel) {
        const distance = Math.abs(
          levelIndex(score.level) - levelIndex(entry.targetLevel),
        );
        levelExact.total++;
        levelAdjacent.total++;
        if (distance === 0) levelExact.hit++;
        if (distance <= 1) levelAdjacent.hit++;
      }

      const miss = expectationMiss(entry, result);
      const bucket =
        entry.variant === "adversarial"
          ? rules
          : entry.variant === "wrongPhoto"
            ? wrongPhoto
            : anchors;
      const { maxScore, minScore, maxContent } = entry.expect;
      if (maxScore !== undefined || minScore !== undefined || maxContent !== undefined) {
        bucket.total++;
        if (miss) misses.push({ caseId: entry.id, detail: miss });
        else bucket.hit++;
      }
    }

    const scoresByCase = new Map<string, number[]>();
    const grammarByCase = new Map<string, number[]>();
    for (const result of replies) {
      scoresByCase.set(result.caseId, [
        ...(scoresByCase.get(result.caseId) ?? []),
        result.score!.score,
      ]);
      grammarByCase.set(result.caseId, [
        ...(grammarByCase.get(result.caseId) ?? []),
        result.score!.criteria.grammar,
      ]);
    }
    const levelsByCase = new Map<string, Set<string>>();
    for (const result of replies) {
      const levels = levelsByCase.get(result.caseId) ?? new Set<string>();
      levels.add(result.score!.level);
      levelsByCase.set(result.caseId, levels);
    }
    const repeated = [...scoresByCase.entries()].filter(
      ([, scores]) => scores.length > 1,
    );
    const scoreSd = repeated.length
      ? mean(repeated.map(([, scores]) => sd(scores)))
      : null;

    const monotonic: Ratio = { hit: 0, total: 0 };
    const shifts: number[] = [];
    for (const group of new Set(cases.map((entry) => entry.group))) {
      const ladder = cases
        .filter(
          (entry) =>
            entry.group === group &&
            (entry.variant === "clean" || entry.variant === "errors"),
        )
        .map((entry) => ({
          errors: entry.errors.length,
          grammar: mean(grammarByCase.get(entry.id) ?? []),
        }))
        .filter(
          (rung): rung is { errors: number; grammar: number } => rung.grammar !== null,
        )
        .sort((a, b) => a.errors - b.errors);
      for (let index = 1; index < ladder.length; index++) {
        monotonic.total++;
        if (ladder[index]!.grammar > ladder[index - 1]!.grammar + MONOTONIC_SLACK)
          monotonic.hit++;
      }
      const clean = mean(scoresByCase.get(`${group}/clean`) ?? []);
      const transcript = mean(scoresByCase.get(`${group}/asr`) ?? []);
      if (clean !== null && transcript !== null)
        shifts.push(Math.abs(clean - transcript));
    }

    const topicChecks = AI_ISSUE_TOPICS.filter(
      (topic) => topicRecall[topic].total > 0,
    ).map((topic) =>
      check(
        `Recall: ${topic}`,
        ratio(topicRecall[topic]),
        topic === "aspect" || topic === "wordOrder"
          ? THRESHOLDS.topicRecall[topic]
          : THRESHOLDS.topicRecall.default,
        "min",
      ),
    );

    const checks: Check[] = [
      check(
        "Usable replies",
        mine.length ? replies.length / mine.length : null,
        THRESHOLDS.validReplies,
        "min",
      ),
      check(
        "False corrections (clean answers with any issue)",
        ratio(falseCorrections),
        THRESHOLDS.falseCorrections,
        "max",
      ),
      check("Recall of known errors", ratio(recall), THRESHOLDS.recall, "min"),
      ...topicChecks,
      check(
        "Right topic on found errors",
        ratio(topicAccuracy),
        THRESHOLDS.topicAccuracy,
        "min",
      ),
      check(
        "Correction restores the original",
        ratio(fixRate),
        THRESHOLDS.fixRate,
        "min",
      ),
      check("Czech in corrections (count)", czech, THRESHOLDS.czechCorrections, "max"),
      check(
        "Usage counts catch known errors",
        ratio(usageRecall),
        THRESHOLDS.usageRecall,
        "min",
      ),
      check(
        "More errors, higher grammar (share)",
        ratio(monotonic),
        THRESHOLDS.monotonicViolations,
        "max",
      ),
      check(
        "Rule cases (Czech, copy, injection…)",
        ratio(rules),
        THRESHOLDS.rulePass,
        "min",
      ),
      check("Wrong photo noticed", ratio(wrongPhoto), THRESHOLDS.wrongPhotoPass, "min"),
      check("C1 answers score high", ratio(anchors), THRESHOLDS.anchorPass, "min"),
      check("Score SD over repeats", scoreSd, THRESHOLDS.scoreSd, "max"),
      check(
        "Transcript vs clean shift (points)",
        mean(shifts),
        THRESHOLDS.transcriptShift,
        "max",
      ),
      check("Level as written", ratio(levelExact), THRESHOLDS.levelExact, "min", true),
      check(
        "Level as written ±1",
        ratio(levelAdjacent),
        THRESHOLDS.levelAdjacent,
        "min",
        true,
      ),
      {
        name: "Issues pointing at no known error (share, review)",
        value: ratio(unmatched),
        pass: null,
        target: "info",
      },
    ];

    const flips = [...levelsByCase.values()].filter((levels) => levels.size > 1).length;
    if (repeated.length) {
      checks.push({
        name: "Cases whose level changed between repeats",
        value: flips / repeated.length,
        pass: null,
        target: "info",
      });
    }

    return {
      model,
      calls: mine.length,
      replies: replies.length,
      refused: mine.filter((result) => result.refused).length,
      failed: mine.filter((result) => !result.score && !result.refused).length,
      checks,
      topicRecall,
      bySource: Object.fromEntries(
        [...sourceRatios].map(([source, value]) => [
          source,
          {
            falseCorrections: ratio(value.falseCorrections),
            recall: ratio(value.recall),
          },
        ]),
      ),
      misses,
      promptTokens: mine.reduce((sum, result) => sum + (result.promptTokens ?? 0), 0),
      completionTokens: mine.reduce(
        (sum, result) => sum + (result.completionTokens ?? 0),
        0,
      ),
      cost: mine.reduce((sum, result) => sum + (result.cost ?? 0), 0),
      meanMs: mean(mine.map((result) => result.ms)) ?? 0,
    };
  });
}

function formatValue(check: Check): string {
  if (check.value === null) return "–";
  const value = Number.isInteger(check.value)
    ? String(check.value)
    : check.value.toFixed(2);
  if (check.pass === null) return value;
  return `${check.pass ? "✓" : "✗"} ${value}`;
}

/** The report as Markdown: one column per model, one row per check. */
export function renderReport(summaries: readonly ModelSummary[], split: string): string {
  if (summaries.length === 0) return "No results yet. Run `eval.ts run` first.\n";
  const lines: string[] = [];
  lines.push(`# Level-test scorer eval (${split} split)`, "");
  lines.push(
    "Rows marked *indicative* compare with the level each answer was written at, not with a human rating.",
    "",
  );

  const header = ["Check", "Target", ...summaries.map((summary) => summary.model)];
  lines.push(`| ${header.join(" | ")} |`, `| ${header.map(() => "---").join(" | ")} |`);
  const first = summaries[0]!;
  first.checks.forEach((row, index) => {
    const name = row.indicative ? `${row.name} *(indicative)*` : row.name;
    const cells = summaries.map((summary) => {
      const cell =
        summary.checks.find((candidate) => candidate.name === row.name) ??
        summary.checks[index];
      return cell ? formatValue(cell) : "–";
    });
    lines.push(`| ${name} | ${row.target} | ${cells.join(" | ")} |`);
  });
  lines.push("");

  lines.push("## Calls and cost", "");
  lines.push(
    "| Model | Calls | Replies | Refused | Failed | Prompt tokens | Completion tokens | Cost (USD) | Mean time |",
  );
  lines.push("| --- | --- | --- | --- | --- | --- | --- | --- | --- |");
  for (const summary of summaries) {
    lines.push(
      `| ${summary.model} | ${summary.calls} | ${summary.replies} | ${summary.refused} | ${summary.failed} | ${summary.promptTokens} | ${summary.completionTokens} | ${summary.cost ? summary.cost.toFixed(2) : "–"} | ${(summary.meanMs / 1000).toFixed(1)} s |`,
    );
  }
  lines.push("");

  lines.push("## By author of the answers", "");
  lines.push(
    "A model that does much better on one author's answers than another's points at bias in the set.",
    "",
  );
  lines.push(
    "| Model | Author | False corrections | Recall |",
    "| --- | --- | --- | --- |",
  );
  for (const summary of summaries) {
    for (const [source, value] of Object.entries(summary.bySource)) {
      const fmt = (number: number | null) => (number === null ? "–" : number.toFixed(2));
      lines.push(
        `| ${summary.model} | ${source} | ${fmt(value.falseCorrections)} | ${fmt(value.recall)} |`,
      );
    }
  }
  lines.push("");

  lines.push("## Misses", "");
  for (const summary of summaries) {
    lines.push(`### ${summary.model}`, "");
    if (summary.misses.length === 0) lines.push("None.");
    for (const miss of summary.misses.slice(0, 60))
      lines.push(`- \`${miss.caseId}\`: ${miss.detail}`);
    if (summary.misses.length > 60)
      lines.push(`- …and ${summary.misses.length - 60} more`);
    lines.push("");
  }
  return lines.join("\n");
}
