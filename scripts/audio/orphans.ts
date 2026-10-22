export interface R2Object {
  key: string;
  /** ListObjectsV2 `LastModified`: when R2 stored this copy. */
  lastModified: string | undefined;
}

/** Branches here merge within a few days; a month covers the slow ones. */
export const DEFAULT_KEEP_DAYS = 30;

const DAY_MS = 86_400_000;

function decodeXml(value: string): string {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

/** Keys and upload times from one ListObjectsV2 page, plus the token for the next. */
export function parseListObjectsPage(xml: string): {
  nextToken: string;
  objects: R2Object[];
} {
  const objects: R2Object[] = [];

  for (const [, contents] of xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)) {
    const key = contents.match(/<Key>([^<]+)<\/Key>/)?.[1];
    if (!key) continue;
    objects.push({
      key: decodeXml(key),
      lastModified: contents.match(/<LastModified>([^<]+)<\/LastModified>/)?.[1],
    });
  }

  const truncated = xml.includes("<IsTruncated>true</IsTruncated>");
  const next = xml.match(/<NextContinuationToken>([^<]+)<\/NextContinuationToken>/);
  return { nextToken: truncated && next?.[1] ? decodeXml(next[1]) : "", objects };
}

function uploadedWithin(
  keepDays: number,
  lastModified: string | undefined,
  now: number,
): boolean {
  if (keepDays <= 0) return false;
  const uploadedAt = Date.parse(lastModified ?? "");
  // No upload time means no telling how old the copy is.
  return Number.isNaN(uploadedAt) || now - uploadedAt < keepDays * DAY_MS;
}

export interface PrunePlan {
  /** Local `{kind}/{hash}.mp3` keys to unlink. */
  local: string[];
  /** R2 keys to DELETE. */
  r2: string[];
  /** R2 orphans uploaded in the last `keepDays`, left in place. */
  recentOnR2: string[];
}

/**
 * Orphans are keys no line on this branch produces. On R2 that includes clips open
 * branches uploaded for lines this branch does not have yet, which would 404 once
 * those branches merge — so R2 orphans uploaded in the last `keepDays` stay.
 */
export function planPrune(options: {
  expected: Set<string>;
  keepDays: number;
  now: number;
  onDisk: string[];
  onR2: R2Object[];
}): PrunePlan {
  const { expected, keepDays, now } = options;
  const plan: PrunePlan = {
    local: options.onDisk.filter((key) => !expected.has(key)),
    r2: [],
    recentOnR2: [],
  };

  for (const { key, lastModified } of options.onR2) {
    if (expected.has(key.replace(/^audio\//, ""))) continue;
    if (uploadedWithin(keepDays, lastModified, now)) plan.recentOnR2.push(key);
    else plan.r2.push(key);
  }

  return plan;
}
