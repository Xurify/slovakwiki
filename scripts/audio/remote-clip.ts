export interface RemoteClip {
  bytes: number;
  generatedAt: string | null;
}

export interface LocalClip {
  bytes: number;
  generatedAt: string | undefined;
}

export type RemoteClipState = "missing" | "same" | "remote-newer" | "local-newer";

/**
 * Compare takes by the `generated-at` metadata every PUT stamps, not by size: CBR MP3
 * sizes snap to whole frames, so a retake often matches the old byte count exactly.
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
