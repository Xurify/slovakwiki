import type { APIRoute } from "astro";
import { getSecret } from "astro:env/server";

import { allowRequest, isSameOrigin, json } from "$lib/level-test/server/guard";
import {
  isAllowedAudioType,
  MAX_AUDIO_BYTES,
  MAX_AUDIO_SECONDS,
  transcribeSlovak,
} from "$lib/level-test/server/transcribe";

export const prerender = false;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const apiKey = getSecret("ELEVENLABS_API_KEY");
  if (!apiKey) return json({ error: "Speech-to-text is not switched on" }, 503);
  if (!isSameOrigin(request)) return json({ error: "Forbidden" }, 403);
  if (!allowRequest(`transcribe:${clientAddress}`)) {
    return json({ error: "Too many requests" }, 429);
  }

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_AUDIO_BYTES) return json({ error: "Recording too long" }, 413);

  const form = await request.formData().catch(() => null);
  const audio = form?.get("audio");
  if (
    !(audio instanceof Blob) ||
    audio.size === 0 ||
    audio.size > MAX_AUDIO_BYTES ||
    !isAllowedAudioType(audio.type)
  ) {
    return json({ error: "Bad request" }, 400);
  }

  try {
    const transcript = await transcribeSlovak(audio, apiKey);
    if ((transcript.durationSeconds ?? 0) > MAX_AUDIO_SECONDS) {
      return json({ error: "Recording too long" }, 413);
    }
    return json(transcript);
  } catch (error) {
    console.error("level-test transcription failed", error);
    return json({ error: "Transcription failed" }, 502);
  }
};
