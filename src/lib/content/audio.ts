import {
  audioConfigData,
  audioHash,
  audioObjectKey,
  resolveAudioSrcFromKey,
  type AudioConfig,
  type AudioKind,
} from "./audio-core";
import { audioClipCacheBust } from "./audio-manifest";

/**
 * Public URL for a clip.
 * - With `PUBLIC_AUDIO_BASE_URL` → R2 / CDN (`…/audio/{kind}/{hash}.mp3`)
 * - Without → local Astro static `/audio/{kind}/{hash}.mp3`
 *
 * Appends `?v=` from runtime index `generatedAt` so overwrite-in-place regenerations
 * bust browser/CDN caches that key on the immutable hash path.
 */
export function resolveAudioSrc(
  text: string,
  kind: AudioKind,
  config: AudioConfig = audioConfigData,
): string {
  const hash = audioHash(text, config);
  const url = resolveAudioSrcFromKey(audioObjectKey(kind, hash));
  const bust = audioClipCacheBust(hash);
  return bust ? `${url}?v=${bust}` : url;
}
