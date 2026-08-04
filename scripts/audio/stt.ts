/**
 * Speech-to-text for audio QA.
 * Default: ElevenLabs Scribe (same API key as TTS).
 * Optional fallback: local faster-whisper (`--stt whisper`).
 */

import { readFile } from "node:fs/promises";

import { transcribeWithWhisper } from "./whisper";

export type SttProvider = "elevenlabs" | "whisper";

export interface SttResult {
  language?: string;
  language_probability?: number;
  provider: SttProvider;
  text: string;
  /** Word-level logprobs when Scribe returns them (lower = worse). */
  words?: Array<{ end?: number; logprob?: number; start?: number; text: string }>;
}

export async function transcribeAudio(
  audioPath: string,
  options: {
    apiKey?: string;
    provider?: SttProvider;
    /** Scribe: scribe_v1 | scribe_v2. Whisper: tiny|base|small|medium|… */
    model?: string;
  } = {},
): Promise<SttResult> {
  const provider = options.provider ?? "elevenlabs";

  if (provider === "whisper") {
    const result = await transcribeWithWhisper(audioPath, {
      model: options.model ?? "small",
    });
    return {
      provider: "whisper",
      text: result.text,
      language: result.language,
      language_probability: result.language_probability,
    };
  }

  const apiKey = options.apiKey ?? process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error("ELEVENLABS_API_KEY missing (needed for Scribe STT)");
  }

  return transcribeWithElevenLabs(audioPath, apiKey, options.model ?? "scribe_v2");
}

async function transcribeWithElevenLabs(
  audioPath: string,
  apiKey: string,
  modelId: string,
): Promise<SttResult> {
  const bytes = await readFile(audioPath);
  const form = new FormData();
  form.append("file", new Blob([bytes], { type: "audio/mpeg" }), "clip.mp3");
  form.append("model_id", modelId);
  form.append("language_code", "sk");

  const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: { "xi-api-key": apiKey },
    body: form,
  });

  const bodyText = await response.text();
  if (!response.ok) {
    throw new Error(`ElevenLabs STT ${response.status}: ${bodyText.slice(0, 500)}`);
  }

  const parsed = JSON.parse(bodyText) as {
    language_code?: string;
    language_probability?: number;
    text?: string;
    words?: Array<{ end?: number; logprob?: number; start?: number; text: string }>;
  };

  if (typeof parsed.text !== "string") {
    throw new Error("ElevenLabs STT returned no text");
  }

  return {
    provider: "elevenlabs",
    text: parsed.text,
    language: parsed.language_code,
    language_probability: parsed.language_probability,
    words: parsed.words?.map((w) => ({
      text: w.text,
      start: w.start,
      end: w.end,
      logprob: w.logprob,
    })),
  };
}
