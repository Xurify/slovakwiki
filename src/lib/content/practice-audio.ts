import audioManifest from "../../../content/audio/manifest.json";
import { audioHash, resolveAudioSrc, type AudioKind } from "./audio";
import type { PracticeItem } from "./learning-types";

type ManifestEntry = {
  kind?: string;
  text?: string;
};

const manifest = audioManifest as Record<string, ManifestEntry>;

/**
 * Server-only: map cloze task ids → public audio URLs when the spoken
 * frame already exists in the audio manifest. Skip missing hashes so
 * the player does not render dead AudioButtons.
 */
export function clozeAudioSrcs(items: PracticeItem[]): Record<string, string> {
  const srcs: Record<string, string> = {};

  for (const item of items) {
    if (item.task.type !== "cloze") continue;

    const spoken = item.task.frame.replace("{}", item.task.answer);
    const hash = audioHash(spoken);
    const entry = manifest[hash];
    if (!entry) continue;

    const kind: AudioKind = entry.kind === "lemma" ? "lemma" : "example";
    srcs[item.task.id] = resolveAudioSrc(spoken, kind);
  }

  return srcs;
}
