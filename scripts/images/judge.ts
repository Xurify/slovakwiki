/**
 * Vision-rank preview candidates. Does not write the live manifest.
 *
 * Usage:
 *   bun scripts/images/judge.ts
 *   bun scripts/images/judge.ts -- --only kolac,kava
 *   bun scripts/images/judge.ts -- --force
 *
 * Cursor-only (no API key):
 *   bun scripts/images/judge.ts -- --agent
 *   Agent looks at scripts/images/judge-thumbs/, fills picks.json, re-run --agent.
 *
 * OpenAI: OPENAI_API_KEY (+ optional IMAGE_JUDGE_MODEL / IMAGE_JUDGE_BASE_URL).
 * Reads tmp/image-source-preview.json, writes tmp/image-source-judge.json.
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  IMAGE_JUDGE_SYSTEM,
  attachAiPicks,
  parseJudgeJson,
  rowFingerprints,
  type ImageJudgePickId,
  type ImageSourceJudgeEntry,
  type ImageSourceJudgeFile,
} from "../../src/lib/catalog/dictionary/image-judge";
import {
  IMAGE_SOURCE_IDS,
  type ImageSourcePreviewFile,
  type ImageSourcePreviewRow,
} from "../../src/lib/catalog/dictionary/image-source-preview";
import { ROOT } from "../lib/paths";
import { USER_AGENT, parseArgs } from "./shared";

const PREVIEW_PATH = path.join(ROOT, "tmp", "image-source-preview.json");
const JUDGE_PATH = path.join(ROOT, "tmp", "image-source-judge.json");
const AGENT_DIR = path.join(ROOT, "scripts", "images", "judge-thumbs");
const AGENT_PICKS_PATH = path.join(AGENT_DIR, "picks.json");
const AGENT_MODEL = "cursor-agent";

const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_BASE = "https://api.openai.com/v1";
const MAX_BYTES = 1_800_000;

function parseJudgeArgv(argv: string[]): {
  agent: boolean;
  dryRun: boolean;
  force: boolean;
  limit: number | undefined;
  only: string | undefined;
} {
  const agent = argv.includes("--agent");
  const rest = parseArgs(argv.filter((arg) => arg !== "--agent"));
  return { agent, ...rest };
}

function judgeEnv(): { apiKey: string; baseUrl: string; model: string } {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY missing. Use bun scripts/images/judge.ts -- --agent");
  }
  return {
    apiKey,
    baseUrl: (process.env.IMAGE_JUDGE_BASE_URL?.trim() || DEFAULT_BASE).replace(
      /\/$/,
      "",
    ),
    model: process.env.IMAGE_JUDGE_MODEL?.trim() || DEFAULT_MODEL,
  };
}

async function loadPreview(): Promise<ImageSourcePreviewFile> {
  try {
    return JSON.parse(await readFile(PREVIEW_PATH, "utf8")) as ImageSourcePreviewFile;
  } catch {
    throw new Error(
      "No preview snapshot. Run bun scripts/images/preview-sources.ts first.",
    );
  }
}

async function loadJudge(): Promise<ImageSourceJudgeFile | undefined> {
  try {
    return JSON.parse(await readFile(JUDGE_PATH, "utf8")) as ImageSourceJudgeFile;
  } catch {
    return undefined;
  }
}

function extForMime(mime: string): string {
  if (mime.includes("png")) return ".png";
  if (mime.includes("webp")) return ".webp";
  if (mime.includes("gif")) return ".gif";
  return ".jpg";
}

async function fetchThumb(url: string): Promise<{ bytes: Buffer; mime: string }> {
  const response = await fetch(url, {
    headers: { Accept: "image/*", "User-Agent": USER_AGENT },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) {
    throw new Error(`thumb ${response.status}`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.byteLength > MAX_BYTES) {
    throw new Error(`thumb too large (${bytes.byteLength})`);
  }
  const mime = (response.headers.get("content-type") ?? "image/jpeg").split(";")[0]!;
  const safeMime = mime.startsWith("image/") ? mime : "image/jpeg";
  return { bytes, mime: safeMime };
}

async function fetchThumbDataUrl(url: string): Promise<string> {
  const { bytes, mime } = await fetchThumb(url);
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

type ChatContent =
  { text: string; type: "text" } | { image_url: { url: string }; type: "image_url" };

async function callJudge(
  env: { apiKey: string; baseUrl: string; model: string },
  content: ChatContent[],
): Promise<string> {
  const response = await fetch(`${env.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: env.model,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: IMAGE_JUDGE_SYSTEM },
        { role: "user", content },
      ],
    }),
    signal: AbortSignal.timeout(45_000),
  });
  const raw = await response.text();
  if (!response.ok) {
    throw new Error(`judge API ${response.status}: ${raw.slice(0, 240)}`);
  }
  const data = JSON.parse(raw) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("judge API empty content");
  return text;
}

function userPrompt(row: ImageSourcePreviewRow, present: ImageJudgePickId[]): string {
  const labels = present
    .map((id) => `${id}: ${pickFileTitle(row, id) ?? "?"}`)
    .join("; ");
  return [
    `Slovak lemma: ${row.slovak}`,
    `English gloss: ${row.english}`,
    `Part of speech: ${row.category}`,
    `Available sources: ${present.join(", ")}`,
    `Filenames: ${labels}`,
    "Images follow in that source order. Pick the best learner illustration, or none.",
  ].join("\n");
}

function shouldSkip(
  row: ImageSourcePreviewRow,
  existing: ImageSourceJudgeFile | undefined,
  force: boolean,
): boolean {
  if (force) return false;
  const entry = existing?.picks[row.slug];
  if (!entry) return false;
  return attachAiPicks([row], existing)[0]?.aiPick !== undefined;
}

function presentPicks(row: ImageSourcePreviewRow): ImageJudgePickId[] {
  const present: ImageJudgePickId[] = IMAGE_SOURCE_IDS.filter(
    (id) => row.hits[id]?.thumbUrl,
  );
  if (row.liveSrc) present.push("live");
  return present;
}

function pickFileTitle(
  row: ImageSourcePreviewRow,
  sourceId: ImageJudgePickId | undefined,
): string | undefined {
  if (!sourceId) return undefined;
  if (sourceId === "live") return row.liveSrc?.split("/").pop();
  return row.hits[sourceId]?.fileTitle;
}

async function judgeRow(
  env: { apiKey: string; baseUrl: string; model: string },
  row: ImageSourcePreviewRow,
): Promise<ImageSourceJudgeEntry> {
  const present = presentPicks(row);
  const fingerprints = rowFingerprints(row);
  if (present.length === 0) {
    return {
      confidence: "high",
      fingerprints,
      model: env.model,
      reason: "No candidate thumbs",
    };
  }

  const content: ChatContent[] = [{ type: "text", text: userPrompt(row, present) }];
  for (const id of present) {
    const url = id === "live" ? row.liveSrc : row.hits[id]?.thumbUrl;
    const title = pickFileTitle(row, id);
    if (!url) continue;
    const dataUrl = await fetchThumbDataUrl(url);
    content.push({
      type: "text",
      text: `Source ${id} — ${title ?? "?"}`,
    });
    content.push({ type: "image_url", image_url: { url: dataUrl } });
  }

  const parsed = parseJudgeJson(await callJudge(env, content));
  if (parsed.pick !== "none" && !present.includes(parsed.pick)) {
    return {
      confidence: "low",
      fingerprints,
      model: env.model,
      reason: `Model picked missing source ${parsed.pick}; treat as none`,
    };
  }

  const sourceId = parsed.pick === "none" ? undefined : parsed.pick;
  return {
    confidence: parsed.confidence,
    fileTitle: pickFileTitle(row, sourceId),
    fingerprints,
    model: env.model,
    reason: parsed.reason,
    sourceId,
  };
}

async function stageOne(slug: string, id: string, url: string): Promise<void> {
  try {
    const { bytes, mime } = await fetchThumb(url);
    const file = path.join(AGENT_DIR, `${slug}--${id}${extForMime(mime)}`);
    await writeFile(file, bytes);
    console.log(`staged ${path.relative(ROOT, file)}`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.log(`${slug} ${id}: ${message}`);
  }
}

async function stageAgentThumbs(rows: ImageSourcePreviewRow[]): Promise<void> {
  await mkdir(AGENT_DIR, { recursive: true });
  for (const row of rows) {
    if (row.liveSrc) await stageOne(row.slug, "live", row.liveSrc);
    for (const id of IMAGE_SOURCE_IDS) {
      const hit = row.hits[id];
      if (!hit?.thumbUrl) continue;
      await stageOne(row.slug, id, hit.thumbUrl);
    }
  }
}

async function loadAgentPicks(): Promise<Record<string, unknown> | undefined> {
  try {
    return JSON.parse(await readFile(AGENT_PICKS_PATH, "utf8")) as Record<
      string,
      unknown
    >;
  } catch {
    return undefined;
  }
}

function applyAgentPicks(
  rows: ImageSourcePreviewRow[],
  rawPicks: Record<string, unknown>,
): Record<string, ImageSourceJudgeEntry> {
  const out: Record<string, ImageSourceJudgeEntry> = {};
  for (const row of rows) {
    const raw = rawPicks[row.slug];
    if (raw === undefined) continue;
    const parsed = parseJudgeJson(JSON.stringify(raw));
    const present = presentPicks(row);
    const fingerprints = rowFingerprints(row);
    if (parsed.pick !== "none" && !present.includes(parsed.pick)) {
      out[row.slug] = {
        confidence: "low",
        fingerprints,
        model: AGENT_MODEL,
        reason: `Agent picked missing source ${parsed.pick}; treat as none`,
      };
      continue;
    }
    const sourceId = parsed.pick === "none" ? undefined : parsed.pick;
    out[row.slug] = {
      confidence: parsed.confidence,
      fileTitle: pickFileTitle(row, sourceId),
      fingerprints,
      model: AGENT_MODEL,
      reason: parsed.reason,
      sourceId,
    };
  }
  return out;
}

async function writeAgentTemplate(rows: ImageSourcePreviewRow[]): Promise<void> {
  const template: Record<string, { pick: string; confidence: string; reason: string }> =
    {};
  for (const row of rows) {
    template[row.slug] = {
      pick: "none",
      confidence: "low",
      reason: `${row.slovak} / ${row.english} — fill after looking at ${row.slug}--*`,
    };
  }
  await writeFile(AGENT_PICKS_PATH, `${JSON.stringify(template, null, 2)}\n`, "utf8");
  console.log(`Wrote ${path.relative(ROOT, AGENT_PICKS_PATH)} (template)`);
}

async function runAgent(rows: ImageSourcePreviewRow[], dryRun: boolean): Promise<void> {
  await stageAgentThumbs(rows);
  const rawPicks = await loadAgentPicks();
  const filled =
    rawPicks &&
    rows.every((row) => {
      const entry = rawPicks[row.slug];
      if (!entry || typeof entry !== "object") return false;
      const reason = (entry as { reason?: unknown }).reason;
      return typeof reason === "string" && !reason.includes("fill after looking");
    });

  if (!rawPicks || !filled) {
    if (!rawPicks) await writeAgentTemplate(rows);
    console.log(
      "Look at scripts/images/judge-thumbs/{slug}--{sk|en|commons|openverse}.* then edit picks.json and re-run --agent.",
    );
    return;
  }

  const applied = applyAgentPicks(rows, rawPicks);
  const existing = await loadJudge();
  const picks = { ...(existing?.picks ?? {}), ...applied };
  if (dryRun) {
    for (const [slug, entry] of Object.entries(applied)) {
      console.log(`${slug}: ${entry.sourceId ?? "none"} — ${entry.reason}`);
    }
    console.log("Dry run. Wrote nothing.");
    return;
  }
  const file: ImageSourceJudgeFile = {
    judgedAt: new Date().toISOString(),
    model: AGENT_MODEL,
    picks,
  };
  await mkdir(path.dirname(JUDGE_PATH), { recursive: true });
  await writeFile(JUDGE_PATH, `${JSON.stringify(file, null, 2)}\n`, "utf8");
  for (const [slug, entry] of Object.entries(applied)) {
    console.log(`${slug}: ${entry.sourceId ?? "none"} — ${entry.reason}`);
  }
  console.log(`Wrote ${path.relative(ROOT, JUDGE_PATH)}`);
  console.log("Open /dev/images/compare");
}

async function main(): Promise<void> {
  const { agent, dryRun, force, limit, only } = parseJudgeArgv(process.argv.slice(2));
  const preview = await loadPreview();
  const existing = await loadJudge();
  const want = only
    ? new Set(
        only
          .split(",")
          .map((slug) => slug.trim())
          .filter(Boolean),
      )
    : undefined;

  let rows = preview.rows;
  if (want) rows = rows.filter((row) => want.has(row.slug));
  if (limit) rows = rows.slice(0, limit);

  if (agent || !process.env.OPENAI_API_KEY?.trim()) {
    await runAgent(rows, dryRun);
    return;
  }

  const env = judgeEnv();
  const picks: Record<string, ImageSourceJudgeEntry> = { ...(existing?.picks ?? {}) };
  let judged = 0;

  for (const row of rows) {
    if (shouldSkip(row, existing, force)) {
      console.log(`${row.slug}: skip (already judged)`);
      continue;
    }
    const entry = await judgeRow(env, row);
    picks[row.slug] = entry;
    judged += 1;
    const label = entry.sourceId ?? "none";
    console.log(`${row.slug}: ${label} (${entry.confidence}) — ${entry.reason}`);
    if (dryRun) delete picks[row.slug];
  }

  if (dryRun) {
    console.log(`Dry run. Judged ${judged}, wrote nothing.`);
    return;
  }

  const file: ImageSourceJudgeFile = {
    judgedAt: new Date().toISOString(),
    model: env.model,
    picks,
  };
  await writeFile(JUDGE_PATH, `${JSON.stringify(file, null, 2)}\n`, "utf8");
  console.log(`Wrote ${path.relative(ROOT, JUDGE_PATH)} (${judged} new)`);
  console.log("Open /dev/images/compare");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
