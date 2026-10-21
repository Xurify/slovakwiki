const LOCAL_AUDIO_PATH = /^\/audio\/(lemma|example|lesson)\/([0-9a-f]{20})\.mp3$/;

/**
 * `{kind}/{hash}.mp3` for a dev `/audio/…` request, or null when the path
 * is not a content-addressed clip (query string ignored).
 */
export function localAudioObjectKey(url: string | undefined): string | null {
  if (!url) return null;

  const pathname = url.split("?")[0] ?? "";
  const match = LOCAL_AUDIO_PATH.exec(pathname);
  if (!match?.[1] || !match[2]) return null;

  return `${match[1]}/${match[2]}.mp3`;
}
