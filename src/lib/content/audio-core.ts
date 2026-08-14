import { createHash } from "node:crypto";

import audioConfig from "../../../content/audio/config.json";

export type AudioKind = "example" | "lemma" | "lesson";

export interface AudioVoiceSettings {
  similarityBoost: number;
  speed: number;
  stability: number;
  style: number;
  useSpeakerBoost: boolean;
}

export type CharacterKind = "oneOff" | "recurring" | "system";

export interface AudioCharacter {
  /** One learner-facing sentence (gallery / future UI). */
  blurb: string;
  displayName: string;
  gender: "female" | "male" | "neutral";
  kind: CharacterKind;
  note?: string;
  /** Dialogue speaker labels that map to this character (e.g. "You" → alex). */
  speakers?: string[];
  voiceId: string;
  voiceName: string;
}

export interface AudioConfig {
  /** Lesson / story cast — each character has its own ElevenLabs voice. */
  characters?: Record<string, AudioCharacter>;
  /** Roster id whose voiceId/voiceName must match top-level dictionary defaults. */
  defaultCharacterId?: string;
  /** ISO 639-1 hint — used by Flash/Turbo/v3; ignored by multilingual_v2. */
  languageCode?: string;
  modelId: string;
  outputFormat: string;
  provider: string;
  /** Fallback TTS model when STT verify fails on the primary model. */
  rescueModelId?: string;
  /** @deprecated Prefer `characters`. Kept for older configs. */
  reservedVoices?: Record<string, { note?: string; voiceId: string; voiceName: string }>;
  voiceId: string;
  voiceName: string;
  voiceSettings: AudioVoiceSettings;
}

export const audioConfigData = audioConfig as AudioConfig;

/** Normalize Slovak text before hashing / TTS. */
export function normalizeAudioText(text: string): string {
  return text.normalize("NFC").trim().replace(/\s+/g, " ");
}

function hashMaterial(text: string, config: AudioConfig): string {
  const normalized = normalizeAudioText(text);
  const settings = config.voiceSettings;
  return [
    config.provider,
    config.voiceId,
    config.modelId,
    config.outputFormat,
    String(settings.stability),
    String(settings.similarityBoost),
    String(settings.style),
    String(settings.speed),
    String(settings.useSpeakerBoost),
    normalized,
  ].join("|");
}

/**
 * Deterministic content-addressed stem (20 hex chars).
 * Changing provider/voice/model/settings → new hash → regen.
 * Server-only (node:crypto) — Astro frontmatter / scripts, not client bundles.
 */
export function audioHash(text: string, config: AudioConfig = audioConfigData): string {
  return createHash("sha256")
    .update(hashMaterial(text, config), "utf8")
    .digest("hex")
    .slice(0, 20);
}

/** R2 folder in the shared bucket (`images/` is the sibling). Local disk stays `static/audio/{kind}/`. */
export const AUDIO_R2_PREFIX = "audio";

/** Disk / logical key: `{kind}/{hash}.mp3` (kind = how the clip is used). */
export function audioObjectKey(kind: AudioKind, hash: string): string {
  return `${kind}/${hash}.mp3`;
}

/** R2 object key: `audio/{kind}/{hash}.mp3`. Idempotent if already prefixed. */
export function toR2AudioKey(objectKey: string): string {
  const trimmed = objectKey.replace(/^\//, "");
  if (trimmed === AUDIO_R2_PREFIX || trimmed.startsWith(`${AUDIO_R2_PREFIX}/`)) {
    return trimmed;
  }
  return `${AUDIO_R2_PREFIX}/${trimmed}`;
}

export function audioRelativePath(
  text: string,
  kind: AudioKind,
  config: AudioConfig = audioConfigData,
): string {
  return audioObjectKey(kind, audioHash(text, config));
}

export function audioFileNameFromHash(hash: string): string {
  return `${hash}.mp3`;
}

function audioBaseUrl(): string | undefined {
  return import.meta.env.PUBLIC_AUDIO_BASE_URL?.replace(/\/$/, "");
}

export function resolveAudioSrcFromKey(objectKey: string): string {
  const base = audioBaseUrl();
  if (base) return `${base}/${toR2AudioKey(objectKey)}`;
  return `/audio/${objectKey}`;
}
