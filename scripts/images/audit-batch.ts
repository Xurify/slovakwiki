/**
 * Stage the next unreviewed live ok images for visual audit.
 *
 * Usage:
 *   bun scripts/images/audit-batch.ts -- --limit 24
 *
 * Copies thumbs to scripts/images/_audit-batch/ (readable).
 * State: content/images/visual-audit.json
 */

import { copyFile, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { ROOT } from "../lib/paths";
import { collectImageTargets, loadManifest, localImagePath, parseArgs } from "./shared";

export const AUDIT_PATH = path.join(ROOT, "content", "images", "visual-audit.json");
export const AUDIT_BATCH_DIR = path.join(ROOT, "scripts", "images", "_audit-batch");

export type AuditVerdict = "keep" | "empty" | "replace";

export interface AuditDecision {
  commonsFile?: string;
  reason: string;
  reviewedAt: string;
  verdict: AuditVerdict;
}

export interface VisualAuditFile {
  decisions: Record<string, AuditDecision>;
  pending: string[];
  updatedAt: string;
}

export async function loadAudit(): Promise<VisualAuditFile> {
  try {
    return JSON.parse(await readFile(AUDIT_PATH, "utf8")) as VisualAuditFile;
  } catch {
    return { decisions: {}, pending: [], updatedAt: new Date().toISOString() };
  }
}

export async function saveAudit(audit: VisualAuditFile): Promise<void> {
  audit.updatedAt = new Date().toISOString();
  await writeFile(AUDIT_PATH, `${JSON.stringify(audit, null, 2)}\n`, "utf8");
}

export async function listOkTargets(): Promise<
  Array<{ english: string; file: string; slug: string; slovak: string }>
> {
  const manifest = await loadManifest();
  const out: Array<{ english: string; file: string; slug: string; slovak: string }> = [];
  for (const target of collectImageTargets()) {
    const entry = manifest[target.slug];
    if (entry?.status !== "ok" || !entry.file) continue;
    out.push({
      english: target.english,
      file: entry.file,
      slug: target.slug,
      slovak: target.slovak,
    });
  }
  return out;
}

async function main(): Promise<void> {
  const { limit } = parseArgs(process.argv.slice(2));
  const batchSize = limit ?? 24;
  const audit = await loadAudit();
  const oks = await listOkTargets();
  const unreviewed = oks.filter((row) => !audit.decisions[row.slug]);

  await rm(AUDIT_BATCH_DIR, { recursive: true, force: true });
  await mkdir(AUDIT_BATCH_DIR, { recursive: true });

  const batch = unreviewed.slice(0, batchSize);
  audit.pending = batch.map((row) => row.slug);

  const index: Array<{
    english: string;
    file: string;
    slug: string;
    slovak: string;
    staged: string;
  }> = [];

  for (let i = 0; i < batch.length; i += 1) {
    const row = batch[i]!;
    const ext = path.extname(row.file) || ".jpg";
    const staged = `${String(i).padStart(2, "0")}--${row.slug}${ext}`;
    await copyFile(localImagePath(row.file), path.join(AUDIT_BATCH_DIR, staged));
    index.push({ ...row, staged });
    console.log(`${staged}  ${row.slovak} = ${row.english}`);
  }

  await writeFile(
    path.join(AUDIT_BATCH_DIR, "index.json"),
    `${JSON.stringify(index, null, 2)}\n`,
    "utf8",
  );
  await saveAudit(audit);

  const reviewed = Object.keys(audit.decisions).length;
  console.log(
    `Staged ${batch.length}. reviewed=${reviewed} remaining=${unreviewed.length - batch.length} ok=${oks.length}`,
  );
}

if (process.argv[1]?.endsWith("audit-batch.ts")) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
