import { normalizeAudioText } from "./audio-core";

/** ElevenLabs voice defaults for Dictionary Neutral (GET /v1/voices/{id}/settings). */
export const ELEVENLABS_VOICE_DEFAULT_SETTINGS = {
  stability: 0.5,
  similarityBoost: 0.75,
  style: 0,
  speed: 1,
  useSpeakerBoost: true,
} as const;

/**
 * Bare homographs Flash may misread without a SK cue.
 * Display lemma unchanged; only TTS input changes.
 */
const SYNTH_TEXT_OVERRIDES: Record<string, string> = {
  a: "A.",
  do: "Do.",
  kam: "Kam",
  o: "O.",
  od: "Od.",
  s: "S.",
  so: "So.",
  v: "V",
  vas: "Váš.",
  nas: "Náš.",
  vy: "Vy.",
  ze: "Že?",
  zo: "Zo",
};

/** TTS line when it must differ from the displayed lemma (e.g. kam → Kam). */
export function dictionaryLemmaSynthText(slovak: string): string | undefined {
  const text = normalizeAudioText(slovak);
  if (!text || text.includes(" ")) return undefined;

  const folded = text.normalize("NFD").replace(/\p{M}/gu, "");
  const byLemma = SYNTH_TEXT_OVERRIDES[folded];
  if (byLemma) return byLemma;

  return undefined;
}
