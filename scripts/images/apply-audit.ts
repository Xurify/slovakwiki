/**
 * Apply visual-audit decisions: empty → reject, replace → commonsFile + fetch.
 *
 * Usage:
 *   bun scripts/images/apply-audit.ts
 *   bun scripts/images/apply-audit.ts -- --dry-run
 */

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { ROOT } from "../lib/paths";
import { loadAudit, saveAudit, type AuditDecision } from "./audit-batch";
import {
  loadManifest,
  loadOverrides,
  missingEntry,
  parseArgs,
  rejectedEntry,
  saveManifest,
  saveOverrides,
} from "./shared";

function run(script: string, args: string[]): void {
  const result = spawnSync("bun", [script, "--", ...args], {
    cwd: ROOT,
    stdio: "inherit",
  });
  if (result.status !== 0) {
    throw new Error(`${script} failed (${result.status ?? "spawn"})`);
  }
}

async function main(): Promise<void> {
  const { dryRun } = parseArgs(process.argv.slice(2));
  const audit = await loadAudit();
  const pending = Object.entries(audit.decisions).filter(
    ([, decision]) => decision.verdict !== "keep",
  );

  const empties = pending
    .filter(([, decision]) => decision.verdict === "empty")
    .map(([slug]) => slug);
  const replaces = pending.filter(
    ([, decision]) => decision.verdict === "replace" && decision.commonsFile,
  );

  console.log(`empty=${empties.length} replace=${replaces.length}`);
  if (dryRun) {
    for (const slug of empties) console.log(`  empty ${slug}`);
    for (const [slug, decision] of replaces) {
      console.log(`  replace ${slug} ← ${decision.commonsFile}`);
    }
    return;
  }

  const now = new Date().toISOString();
  const overrides = await loadOverrides();
  const manifest = await loadManifest();

  if (empties.length > 0) {
    for (const slug of empties) {
      const next = { ...overrides[slug], reject: true as const };
      delete next.commonsFile;
      overrides[slug] = next;
      manifest[slug] = rejectedEntry(now);
    }
  }

  const dirtyReplaces: string[] = [];
  for (const [slug, decision] of replaces) {
    const already =
      overrides[slug]?.commonsFile === decision.commonsFile &&
      manifest[slug]?.status === "ok" &&
      manifest[slug]?.commonsFile === decision.commonsFile;
    if (already) continue;
    overrides[slug] = { commonsFile: decision.commonsFile };
    manifest[slug] = missingEntry(now);
    dirtyReplaces.push(slug);
  }

  await saveOverrides(overrides);
  await saveManifest(manifest);

  if (dirtyReplaces.length > 0) {
    const slugs = dirtyReplaces.join(",");
    run("scripts/images/fetch.ts", ["--only", slugs, "--force"]);
    run("scripts/images/upload.ts", ["--only", slugs, "--force"]);
  }

  await saveAudit(audit);
  console.log("Applied audit decisions.");
}

const invoked = process.argv[1] === fileURLToPath(import.meta.url);
if (invoked) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}

export function decision(
  verdict: AuditDecision["verdict"],
  reason: string,
  commonsFile?: string,
): AuditDecision {
  return {
    commonsFile,
    reason,
    reviewedAt: new Date().toISOString(),
    verdict,
  };
}
