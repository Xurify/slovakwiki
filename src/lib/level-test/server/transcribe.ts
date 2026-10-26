/**
 * The longest speaking task is three minutes. The recorder sets no bitrate, and
 * browsers default to as much as 128 kbit/s, so this is 200 s at that rate.
 */
export const MAX_AUDIO_BYTES = 3_200_000;

/** Three minutes and a little for the learner who stops late. */
export const MAX_AUDIO_SECONDS = 200;

const UPSTREAM_TIMEOUT_MS = 45_000;

/** What the recorder produces: WebM/Opus in Chrome and Firefox, MP4/AAC in Safari, Ogg as a fallback. */
const AUDIO_TYPES: ReadonlySet<string> = new Set([
  "audio/webm",
  "audio/ogg",
  "audio/mp4",
]);

export function isAllowedAudioType(type: string): boolean {
  return AUDIO_TYPES.has(type.split(";")[0]?.trim().toLowerCase() ?? "");
}

export interface Transcript {
  text: string;
  durationSeconds?: number;
}

/** ElevenLabs Scribe, the same speech-to-text the audio QA scripts use. */
export async function transcribeSlovak(
  audio: Blob,
  apiKey: string,
  fetchImpl: typeof fetch = fetch,
): Promise<Transcript> {
  const form = new FormData();
  form.append("file", audio, "answer");
  form.append("model_id", "scribe_v2");
  form.append("language_code", "sk");
  form.append("tag_audio_events", "false");

  const response = await fetchImpl("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: { "xi-api-key": apiKey },
    body: form,
    signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(`Speech-to-text failed (${response.status})`);
  }

  const body = (await response.json()) as {
    text?: unknown;
    words?: Array<{ end?: unknown }>;
  };
  if (typeof body.text !== "string") throw new Error("Speech-to-text returned no text");

  const ends = (body.words ?? [])
    .map((word) => word.end)
    .filter((end): end is number => typeof end === "number");
  return {
    text: body.text.trim(),
    durationSeconds: ends.length ? Math.max(...ends) : undefined,
  };
}
