/** Vercel functions reject request bodies over 4.5 MB; three minutes of Opus is far below. */
export const MAX_AUDIO_BYTES = 4_000_000;

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
