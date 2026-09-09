import {
  IMAGE_SOURCE_IDS,
  sourceLabel,
  type ImageSourcePreviewRow,
} from "./image-source-preview";

export const IMAGE_JUDGE_PICK_IDS = ["live", ...IMAGE_SOURCE_IDS] as const;
export type ImageJudgePickId = (typeof IMAGE_JUDGE_PICK_IDS)[number];

export const IMAGE_JUDGE_SYSTEM = `You pick ONE dictionary illustration for a Slovak learner.

The learner sees the Slovak lemma. The picture must make that sense obvious.

Simplicity first:
- One subject, tight crop. No crowd, traffic, picnic, garden, landscape-with-tiny-subject, collage.
- Prefer the simplest picture that is still the right thing.
- Slovak referent beats English lookalike (koláč = koláčky, not US layer cake, not a band named Cake).
- Reject logos, icons, maps, screenshots, text flyers, concerts, posters, flags, NSFW, gore.
- Live catalog is a candidate too (pick "live").
- Filename is a hint only. Trust what you see.
- If nothing is both simple and correct, pick none. Empty beats a busy or wrong picture.

Reply JSON only:
{"pick":"live"|"sk"|"en"|"commons"|"openverse"|"none","confidence":"high"|"low","reason":"one short sentence"}`;

export interface ImageSourceAiPick {
  confidence: "high" | "low";
  fileTitle?: string;
  model: string;
  reason: string;
  sourceId?: ImageJudgePickId;
}

export interface ImageSourceJudgeEntry extends ImageSourceAiPick {
  fingerprints: Partial<Record<ImageJudgePickId, string>>;
}

export interface ImageSourceJudgeFile {
  judgedAt: string;
  model: string;
  picks: Record<string, ImageSourceJudgeEntry>;
}

export function hitFingerprints(
  hits: ImageSourcePreviewRow["hits"],
): Partial<Record<ImageJudgePickId, string>> {
  const out: Partial<Record<ImageJudgePickId, string>> = {};
  for (const id of IMAGE_SOURCE_IDS) {
    const title = hits[id]?.fileTitle;
    if (title) out[id] = title;
  }
  return out;
}

export function rowFingerprints(
  row: ImageSourcePreviewRow,
): Partial<Record<ImageJudgePickId, string>> {
  const out = hitFingerprints(row.hits);
  if (row.liveSrc) out.live = row.liveSrc;
  return out;
}

export function fingerprintsMatch(
  current: Partial<Record<ImageJudgePickId, string>>,
  saved: Partial<Record<ImageJudgePickId, string>>,
): boolean {
  for (const id of IMAGE_JUDGE_PICK_IDS) {
    if ((current[id] ?? "") !== (saved[id] ?? "")) return false;
  }
  return true;
}

export function judgePickLabel(id: ImageJudgePickId): string {
  if (id === "live") return "Live";
  return sourceLabel(id);
}

export function parseJudgeJson(raw: string): {
  confidence: "high" | "low";
  pick: ImageJudgePickId | "none";
  reason: string;
} {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced?.[1]?.trim() ?? trimmed;
  const parsed: unknown = JSON.parse(body);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Judge reply is not an object");
  }
  const record = parsed as Record<string, unknown>;
  const pickRaw = typeof record.pick === "string" ? record.pick.trim().toLowerCase() : "";
  const pick =
    pickRaw === "none" || (IMAGE_JUDGE_PICK_IDS as readonly string[]).includes(pickRaw)
      ? (pickRaw as ImageJudgePickId | "none")
      : undefined;
  if (!pick) throw new Error(`Judge pick invalid: ${pickRaw}`);

  const confidence = record.confidence === "low" ? "low" : "high";
  const reason =
    typeof record.reason === "string" && record.reason.trim()
      ? record.reason.trim().slice(0, 240)
      : "No reason";
  return { confidence, pick, reason };
}

export function attachAiPicks(
  rows: ImageSourcePreviewRow[],
  judge: ImageSourceJudgeFile | undefined,
): ImageSourcePreviewRow[] {
  if (!judge) return rows;
  return rows.map((row) => {
    const entry = judge.picks[row.slug];
    if (!entry) return row;
    if (!fingerprintsMatch(rowFingerprints(row), entry.fingerprints)) return row;
    const { fingerprints: _fingerprints, ...aiPick } = entry;
    return { ...row, aiPick };
  });
}
