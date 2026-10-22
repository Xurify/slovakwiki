import path from "node:path";

import type { AudioConfig } from "../../src/lib/catalog/audio/core";
import type { AudioManifest, AudioTarget, ManifestEntry } from "./shared";

export type ClipIdentity = Pick<
  ManifestEntry,
  "characterId" | "kind" | "text" | "voiceId"
>;

/**
 * Text and voice for local clips the manifest does not list, from the line whose
 * `audioRelativePath` is the clip's key. `static/audio/` keeps clips across branch
 * switches, so a clip no line here produces is likely another branch's, and this
 * branch has no text to give it.
 */
export function identifyUnknownClips(
  objectKeys: string[],
  manifest: AudioManifest,
  targetsByKey: () => Map<string, AudioTarget>,
  baseConfig: AudioConfig,
): { identities: Map<string, ClipIdentity>; unmatched: string[] } {
  const identities = new Map<string, ClipIdentity>();
  const unmatched: string[] = [];
  let targets: Map<string, AudioTarget> | undefined;

  for (const objectKey of objectKeys) {
    if (manifest[path.basename(objectKey, ".mp3")]) continue;

    targets ??= targetsByKey();
    const target = targets.get(objectKey);
    if (!target) {
      unmatched.push(objectKey);
      continue;
    }

    identities.set(objectKey, {
      text: target.text,
      kind: target.kind,
      characterId: target.characterId,
      voiceId: (target.voiceConfig ?? baseConfig).voiceId,
    });
  }

  return { identities, unmatched };
}
