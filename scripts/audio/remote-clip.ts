/** What R2 reports for an object: HEAD `content-length` + `x-amz-meta-generated-at`. */
export interface RemoteClip {
  bytes: number;
  generatedAt: string | null;
}

/** The local take: file size on disk + manifest `generatedAt` (absent without an entry). */
export interface LocalClip {
  bytes: number;
  generatedAt: string | undefined;
}

export type RemoteClipState = "missing" | "same" | "remote-newer" | "local-newer";

/**
 * Decide whether R2 already holds this take.
 *
 * Every PUT stamps `generated-at` metadata, so compare takes by that. Size alone
 * cannot tell them apart: CBR MP3 sizes snap to whole frames, and a retake of the
 * same text (same hash) often matches the old byte count exactly. Objects or
 * entries without a timestamp fall back to size.
 */
export function compareRemoteClip(
  local: LocalClip,
  remote: RemoteClip | undefined,
): RemoteClipState {
  if (!remote) return "missing";

  if (local.generatedAt && remote.generatedAt) {
    if (remote.generatedAt === local.generatedAt) return "same";
    return remote.generatedAt > local.generatedAt ? "remote-newer" : "local-newer";
  }

  return remote.bytes === local.bytes ? "same" : "local-newer";
}
