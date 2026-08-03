import { createHash } from "node:crypto";

import audioConfig from "../../../content/audio/config.json";

export type AudioKind = "example" | "lemma";

export interface AudioVoiceSettings {
  similarityBoost: number;
  speed: number;
  stability: number;
  style: number;
  useSpeakerBoost: boolean;
}

export interface AudioConfig {
  modelId: string;
  outputFormat: string;
  provider: string;
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

/** R2 / static key: `{kind}/{hash}.mp3` (kind = how the clip is used). */
export function audioObjectKey(kind: AudioKind, hash: string): string {
  return `${kind}/${hash}.mp3`;
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

/**
 * Public URL for a clip.
 * - With `PUBLIC_AUDIO_BASE_URL` → R2 / CDN (`…/lemma/{hash}.mp3`)
 * - Without → local Astro static `/audio/{kind}/{hash}.mp3`
 */
export function resolveAudioSrc(
  text: string,
  kind: AudioKind,
  config: AudioConfig = audioConfigData,
): string {
  return resolveAudioSrcFromKey(audioRelativePath(text, kind, config));
}

export function resolveAudioSrcFromKey(objectKey: string): string {
  const base = audioBaseUrl();
  if (base) return `${base}/${objectKey}`;
  return `/audio/${objectKey}`;
}
