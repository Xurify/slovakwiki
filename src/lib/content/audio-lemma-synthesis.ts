import { normalizeAudioText } from "./audio";

/** ElevenLabs voice defaults for Dictionary Neutral (GET /v1/voices/{id}/settings). */
export const ELEVENLABS_VOICE_DEFAULT_SETTINGS = {
  stability: 0.5,
  similarityBoost: 0.75,
  style: 0,
  speed: 1,
  useSpeakerBoost: true,
} as const;

/** Matches web Speech Synthesis for short SK; v2 reads bare `kam` as English "Come". */
export const QUESTION_LEMMA_TTS_MODEL_ID = "eleven_flash_v2_5";

/**
 * Bare ASCII homographs that multilingual/Flash misread without a SK cue.
 * Keep display lemma unchanged; only TTS input changes.
 */
const SYNTH_TEXT_OVERRIDES: Record<string, string> = {
  kam: "Kam",
};

export interface DictionaryLemmaSynthOptions {
  languageCode: "sk";
  modelId: typeof QUESTION_LEMMA_TTS_MODEL_ID;
  /** Let ElevenLabs apply stored voice settings (same as web UI). */
  omitVoiceSettings: true;
  synthText: string;
}

/**
 * Short question lemmas: Flash v2.5 + SK + voice defaults (benchmarked vs web UI).
 * Audio hash/path still uses the displayed lemma + default config model.
 */
export function dictionaryLemmaSynthOptions(
  slovak: string,
  topics?: string[],
): DictionaryLemmaSynthOptions | undefined {
  const text = normalizeAudioText(slovak);
  if (!text || text.includes(" ")) return undefined;
  if (!topics?.includes("Questions")) return undefined;
  if (text.length > 12) return undefined;

  const folded = text.normalize("NFD").replace(/\p{M}/gu, "");
  const synthText = SYNTH_TEXT_OVERRIDES[folded] ?? text;

  return {
    modelId: QUESTION_LEMMA_TTS_MODEL_ID,
    languageCode: "sk",
    omitVoiceSettings: true,
    synthText,
  };
}
