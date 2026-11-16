/**
 * Highlight Alignment Critic & Auditor ($token-minimization)
 *
 * Audits text highlight timing against ground-truth audio speech timestamps
 * (from Scribe STT word alignments).
 *
 * Usage:
 *   bun scripts/audio/highlight-critic.ts
 *   bun scripts/audio/highlight-critic.ts --episode possessives
 *   bun scripts/audio/highlight-critic.ts --only "poslucháčov"
 *   bun scripts/audio/highlight-critic.ts --tolerance 200
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { normalizeAudioText } from "../../src/lib/catalog/audio/core";
import { episodeBySlug, episodeLines } from "../../src/lib/catalog/listening";
import { planLine, type LineSpan } from "../../src/lib/stick-figure/line-plan";
import { readJsonFile, writeFileAtomic } from "../lib/json-file";
import { ROOT } from "../lib/paths";
import { AUDIO_DIR, loadManifest } from "./shared";
import { transcribeAudio } from "./stt";

interface HeardWord {
  end: number;
  start: number;
  text: string;
}

interface AuditWord {
  driftEndMs: number;
  driftStartMs: number;
  heardEndMs: number;
  heardStartMs: number;
  passed: boolean;
  plannedEndMs: number;
  plannedStartMs: number;
  text: string;
}

interface AuditLineResult {
  avgDriftMs: number;
  diagnosis?: string;
  hash?: string;
  lineIndex: number;
  maxDriftMs: number;
  passed: boolean;
  passRate: number;
  said?: string;
  slovak: string;
  speaker?: string;
  words: AuditWord[];
}

const args = process.argv.slice(2).filter((arg) => arg !== "--");
const only = args.includes("--only") ? args[args.indexOf("--only") + 1] : undefined;
const slug = args.includes("--episode") ? args[args.indexOf("--episode") + 1] : undefined;
const toleranceArg = args.includes("--tolerance")
  ? Number(args[args.indexOf("--tolerance") + 1])
  : 250;
const TOLERANCE_MS = Number.isFinite(toleranceArg) ? toleranceArg : 250;

const CACHE_PATH = path.join(ROOT, "tmp", "scribe-words.json");
const AUDIO_BASE_URL = "https://audio.slovak.wiki/audio/lesson";

async function ensureClip(hash: string): Promise<string> {
  const filePath = path.join(AUDIO_DIR, "lesson", `${hash}.mp3`);
  if (existsSync(filePath)) return filePath;

  await mkdir(path.dirname(filePath), { recursive: true });
  const url = `${AUDIO_BASE_URL}/${hash}.mp3`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch audio ${url}: ${res.status}`);
  const arrayBuffer = await res.arrayBuffer();
  await writeFile(filePath, Buffer.from(arrayBuffer));
  return filePath;
}

function normalizeWord(raw: string): string {
  return raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}]+/gu, "");
}

import { decodeMp3 } from "./decode-mp3";
import { decodeMouthTrack } from "../../src/lib/stick-figure/mouth-track";
import { voiceFrom } from "../../src/lib/stick-figure/take";

async function auditLine(
  slovak: string,
  said: string | undefined,
  hash: string,
  cache: Record<string, HeardWord[]>,
  speaker?: string,
  lineIndex = 0,
): Promise<AuditLineResult | undefined> {
  const clip = await ensureClip(hash);
  let heard = cache[hash];
  if (!heard) {
    try {
      const transcription = await transcribeAudio(clip);
      heard = (transcription.words ?? []).map((w) => ({
        end: w.end ?? 0,
        start: w.start ?? 0,
        text: w.text,
      }));
      cache[hash] = heard;
      await writeFileAtomic(CACHE_PATH, JSON.stringify(cache, null, 2));
    } catch (err) {
      console.warn(`[WARN] Could not transcribe ${hash}: ${(err as Error).message}`);
      return undefined;
    }
  }

  const slovakWords = slovak.match(/\p{L}+/gu) ?? [];
  if (slovakWords.length === 0) return undefined;

  // Extract loudness track from clip
  let track: number[] | undefined;
  try {
    const bytes = await readFile(clip);
    const pcm = await decodeMp3(new Uint8Array(bytes));
    const voice = voiceFrom(pcm.samples, pcm.sampleRate);
    if (voice?.mouth) {
      track = decodeMouthTrack(voice.mouth);
    }
  } catch (err) {
    // Fall back to untracked estimation
  }

  // Compute planned timestamps using line-plan
  const plan = planLine(slovak, { said, track });
  const plannedWords = plan.words ?? [];

  // Filter and match heard words
  const cleanHeard = heard.filter((h) => normalizeWord(h.text).length > 0);

  const words: AuditWord[] = [];
  let heardIdx = 0;

  for (let i = 0; i < slovakWords.length; i++) {
    const wordText = slovakWords[i];
    const norm = normalizeWord(wordText);
    const planned = plannedWords[i] ?? { start: 0, end: 0 };

    // Find best match in heard words around current position
    let bestMatchIdx = -1;
    for (let j = heardIdx; j < Math.min(cleanHeard.length, heardIdx + 4); j++) {
      if (normalizeWord(cleanHeard[j].text) === norm) {
        bestMatchIdx = j;
        break;
      }
    }

    if (bestMatchIdx === -1 && heardIdx < cleanHeard.length) {
      // Fuzzy alignment fallback
      bestMatchIdx = heardIdx;
    }

    let hStart = 0;
    let hEnd = 0;
    if (bestMatchIdx >= 0 && bestMatchIdx < cleanHeard.length) {
      hStart = Math.round(cleanHeard[bestMatchIdx].start * 1000);
      hEnd = Math.round(cleanHeard[bestMatchIdx].end * 1000);
      heardIdx = bestMatchIdx + 1;
    }

    const driftStartMs = planned.start - hStart;
    const driftEndMs = planned.end - hEnd;
    const passed =
      Math.abs(driftStartMs) <= TOLERANCE_MS &&
      Math.abs(driftEndMs) <= TOLERANCE_MS * 1.5;

    words.push({
      driftEndMs,
      driftStartMs,
      heardEndMs: hEnd,
      heardStartMs: hStart,
      passed,
      plannedEndMs: planned.end,
      plannedStartMs: planned.start,
      text: wordText,
    });
  }

  const passedCount = words.filter((w) => w.passed).length;
  const passRate = words.length > 0 ? passedCount / words.length : 1;
  const maxDriftMs = Math.max(...words.map((w) => Math.abs(w.driftStartMs)));
  const avgDriftMs = Math.round(
    words.reduce((sum, w) => sum + Math.abs(w.driftStartMs), 0) / (words.length || 1),
  );

  let diagnosis: string | undefined;
  if (words.length > 0 && Math.abs(words[0].driftStartMs) > 400) {
    if (said && /^\[(chuckles|sighs|yawns)/i.test(said)) {
      diagnosis = `Leading vocalization offset in transcript: ${said.slice(0, 15)}`;
    } else {
      diagnosis = `Initial word start delay: voice starts at ${words[0].heardStartMs}ms, planned at ${words[0].plannedStartMs}ms`;
    }
  }

  return {
    avgDriftMs,
    diagnosis,
    hash,
    lineIndex,
    maxDriftMs,
    passRate,
    passed: passRate >= 0.8 && maxDriftMs <= TOLERANCE_MS * 2,
    said,
    slovak,
    speaker,
    words,
  };
}

async function main() {
  console.log(`\n🔍 Highlight Alignment Critic ($token-minimization)`);
  console.log(`Tolerance: ±${TOLERANCE_MS}ms\n`);

  const manifest = await loadManifest();
  const cache = await readJsonFile<Record<string, HeardWord[]>>(CACHE_PATH, {});
  await mkdir(path.dirname(CACHE_PATH), { recursive: true });

  const episodesToAudit = slug
    ? [episodeBySlug.get(slug)].filter(Boolean)
    : Array.from(episodeBySlug.values());

  if (slug && episodesToAudit.length === 0) {
    console.error(`Episode "${slug}" not found.`);
    process.exit(1);
  }

  let totalLines = 0;
  let passedLines = 0;
  let totalWords = 0;
  let passedWords = 0;

  for (const ep of episodesToAudit) {
    if (!ep) continue;
    console.log(`\n========================================`);
    console.log(`Episode: ${ep.title} (${ep.slug})`);
    console.log(`========================================`);

    const lines = episodeLines(ep);

    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];
      const slovak = line.slovak;
      const said = line.audio?.transcript;

      if (only && !slovak.includes(only) && !(said && said.includes(only))) {
        continue;
      }

      // Find matching manifest clip
      const normText = normalizeAudioText(said ?? slovak);
      const manifestEntry = Object.entries(manifest).find(
        ([_, entry]) => entry.kind === "lesson" && entry.text === normText,
      );

      if (!manifestEntry) {
        continue;
      }

      const [hash] = manifestEntry;
      const result = await auditLine(slovak, said, hash, cache, line.speaker, idx);
      if (!result) continue;

      totalLines++;
      totalWords += result.words.length;
      passedWords += result.words.filter((w) => w.passed).length;

      const statusIcon = result.passed ? "✓ PASS" : "✗ DRIFT";
      const statusColor = result.passed ? "\x1b[32m" : "\x1b[31m";
      const reset = "\x1b[0m";

      console.log(
        `${statusColor}[${statusIcon}]${reset} L${idx + 1} [${result.speaker ?? "host"}]: "${slovak.slice(0, 50)}${slovak.length > 50 ? "..." : ""}"`,
      );
      console.log(
        `       Aligned: ${Math.round(result.passRate * 100)}% | Avg Drift: ${result.avgDriftMs}ms | Max Drift: ${result.maxDriftMs}ms`,
      );

      if (!result.passed || result.maxDriftMs > 300) {
        if (result.diagnosis) {
          console.log(`       ⚠️  Diagnosis: ${result.diagnosis}`);
        }
        for (const w of result.words) {
          const wStatus = w.passed ? "\x1b[32m✓\x1b[0m" : "\x1b[33mΔ\x1b[0m";
          const sign = w.driftStartMs > 0 ? "+" : "";
          console.log(
            `         ${wStatus} ${w.text.padEnd(14)} planned: ${w.plannedStartMs}-${w.plannedEndMs}ms | heard: ${w.heardStartMs}-${w.heardEndMs}ms (${sign}${w.driftStartMs}ms)`,
          );
        }
      }

      if (result.passed) {
        passedLines++;
      }
    }
  }

  console.log(`\n----------------------------------------`);
  console.log(`Audit Summary:`);
  console.log(
    `  Lines:  ${passedLines}/${totalLines} (${Math.round((passedLines / (totalLines || 1)) * 100)}%)`,
  );
  console.log(
    `  Words:  ${passedWords}/${totalWords} (${Math.round((passedWords / (totalWords || 1)) * 100)}%)`,
  );
  console.log(`----------------------------------------\n`);

  if (totalLines > 0 && passedLines / totalLines < 0.8) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Critic error:", err);
  process.exit(1);
});
