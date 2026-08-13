import { audioClipCacheBust } from "./audio-manifest";
import { audioHash, audioObjectKey, type AudioKind } from "./audio-core";
import { resolveAudioSrc } from "./audio";

function cacheBustUrl(url: string, hash: string): string {
  const bust = audioClipCacheBust(hash);
  return bust ? `${url}?v=${bust}` : url;
}

/**
 * Dictionary page audio URLs (build-time / SSR only).
 *
 * - **Dev:** always `/audio/…` — never CDN, even when `PUBLIC_AUDIO_BASE_URL` is in `.env`.
 *   Matches gitignored `static/audio/` + Vite `publicDir`.
 * - **Prod:** always CDN via `resolveAudioSrc` — local disk is not on Vercel.
 *   After regen: `bun scripts/audio/upload.ts`.
 */
export function resolveDictionaryAudioSrc(text: string, kind: AudioKind): string {
  if (!import.meta.env.DEV) {
    return resolveAudioSrc(text, kind);
  }

  const hash = audioHash(text);
  const objectKey = audioObjectKey(kind, hash);
  return cacheBustUrl(`/audio/${objectKey}`, hash);
}
