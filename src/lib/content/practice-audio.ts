import { audioClipKind, hasAudioClip } from "./audio-manifest";
import { audioHash, type AudioKind } from "./audio-core";
import { resolveAudioSrc } from "./audio";
import type { PracticeItem } from "./learning-types";

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
    if (!hasAudioClip(hash)) continue;

    const storedKind = audioClipKind(hash);
    const kind: AudioKind = storedKind === "lemma" ? "lemma" : "example";
    srcs[item.task.id] = resolveAudioSrc(spoken, kind);
  }

  return srcs;
}
