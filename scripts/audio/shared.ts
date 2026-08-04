/**
 * Shared helpers for ElevenLabs generate / upload / status.
 */

import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { words } from "../../src/lib/content/data";
import { EXAMPLE_DISPLAY_LIMIT } from "../../src/lib/content/example-limits";
import {
  type AudioConfig,
  type AudioKind,
  audioObjectKey,
  normalizeAudioText,
} from "../../src/lib/content/audio";
import {
  audioConfigForCharacter,
  characterIdForSpeaker,
  keyPhraseCharacterId,
  type LessonCharacterId,
} from "../../src/lib/content/characters";
import { lessons } from "../../src/lib/content/lessons";
import { ROOT } from "../lib/paths";

export type { AudioKind };

export const AUDIO_DIR = path.join(ROOT, "static", "audio");
export const CONFIG_PATH = path.join(ROOT, "content", "audio", "config.json");
export const MANIFEST_PATH = path.join(ROOT, "content", "audio", "manifest.json");

export interface ManifestEntry {
  bytes: number;
  characterId?: string;
  generatedAt: string;
  kind: AudioKind;
  text: string;
  uploadedAt?: string;
  voiceId?: string;
}

export type AudioManifest = Record<string, ManifestEntry>;

export interface AudioTarget {
  characterId?: LessonCharacterId;
  kind: AudioKind;
  text: string;
  /** Per-target voice override (lesson characters). */
  voiceConfig?: AudioConfig;
}

/** Same material as src/lib/content/audio.ts audioHash (keep in sync). */
export function hashAudioText(text: string, config: AudioConfig): string {
  const normalized = normalizeAudioText(text);
  const settings = config.voiceSettings;
  const material = [
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

  return createHash("sha256").update(material, "utf8").digest("hex").slice(0, 20);
}

export function audioRelativePath(
  text: string,
  kind: AudioKind,
  config: AudioConfig,
): string {
  return audioObjectKey(kind, hashAudioText(text, config));
}

export async function loadConfig(): Promise<AudioConfig> {
  return JSON.parse(await readFile(CONFIG_PATH, "utf8")) as AudioConfig;
}

export async function loadManifest(): Promise<AudioManifest> {
  try {
    return JSON.parse(await readFile(MANIFEST_PATH, "utf8")) as AudioManifest;
  } catch {
    return {};
  }
}

export async function saveManifest(manifest: AudioManifest): Promise<void> {
  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

export async function ensureAudioDir(kind?: AudioKind): Promise<void> {
  if (kind) {
    await mkdir(path.join(AUDIO_DIR, kind), { recursive: true });
    return;
  }
  await mkdir(path.join(AUDIO_DIR, "lemma"), { recursive: true });
  await mkdir(path.join(AUDIO_DIR, "example"), { recursive: true });
  await mkdir(path.join(AUDIO_DIR, "lesson"), { recursive: true });
}

function targetKey(target: AudioTarget, baseConfig: AudioConfig): string {
  const config = target.voiceConfig ?? baseConfig;
  return `${target.kind}|${config.voiceId}|${normalizeAudioText(target.text)}`;
}

/** Unique lemma + example Slovak strings from the live dictionary merge. */
export function collectDictionaryAudioTargets(options?: {
  lemmasOnly?: boolean;
}): AudioTarget[] {
  const byText = new Map<string, AudioTarget>();

  for (const entry of words) {
    if (entry.kind !== "word") continue;

    const lemma = normalizeAudioText(entry.slovak);
    if (lemma) {
      const existing = byText.get(lemma);
      if (!existing || existing.kind === "example") {
        byText.set(lemma, { kind: "lemma", text: lemma });
      }
    }

    if (options?.lemmasOnly) continue;

    // Only mint audio for examples the detail page shows (store pool may be larger).
    for (const example of entry.examples.slice(0, EXAMPLE_DISPLAY_LIMIT)) {
      const slovak = normalizeAudioText(example.slovak);
      if (!slovak || byText.has(slovak)) continue;
      byText.set(slovak, { kind: "example", text: slovak });
    }
  }

  return [...byText.values()].sort((a, b) => a.text.localeCompare(b.text, "sk"));
}

/**
 * Lesson scene + key-phrase lines with per-character voices.
 * Note: lesson content may churn — clips are disposable regenerations.
 */
export function collectLessonAudioTargets(baseConfig: AudioConfig): AudioTarget[] {
  const byKey = new Map<string, AudioTarget>();

  function addLine(text: string, characterId: LessonCharacterId): void {
    const normalized = normalizeAudioText(text);
    if (!normalized) return;

    const voiceConfig = audioConfigForCharacter(characterId, baseConfig);
    const target: AudioTarget = {
      kind: "lesson",
      text: normalized,
      characterId,
      voiceConfig,
    };
    byKey.set(targetKey(target, baseConfig), target);
  }

  for (const lesson of lessons) {
    for (const line of lesson.scene) {
      addLine(line.audio?.transcript ?? line.slovak, characterIdForSpeaker(line.speaker));
    }

    for (const phrase of lesson.keyPhrases) {
      addLine(phrase.audio?.transcript ?? phrase.slovak, keyPhraseCharacterId());
    }

    for (const exercise of lesson.exercises) {
      if (!("context" in exercise) || !exercise.context) continue;
      for (const line of exercise.context) {
        addLine(
          line.audio?.transcript ?? line.slovak,
          characterIdForSpeaker(line.speaker),
        );
      }
    }
  }

  return [...byKey.values()].sort((a, b) => a.text.localeCompare(b.text, "sk"));
}

/** Dictionary and/or lesson targets (default: both). */
export function collectAudioTargets(
  options?: {
    lemmasOnly?: boolean;
    lessonsOnly?: boolean;
  },
  baseConfig?: AudioConfig,
): AudioTarget[] {
  if (options?.lessonsOnly) {
    if (!baseConfig) throw new Error("collectAudioTargets(lessonsOnly) needs baseConfig");
    return collectLessonAudioTargets(baseConfig);
  }

  const dictionary = collectDictionaryAudioTargets({ lemmasOnly: options?.lemmasOnly });
  if (options?.lemmasOnly || !baseConfig) return dictionary;

  return [...dictionary, ...collectLessonAudioTargets(baseConfig)];
}

/** Lemma texts — examples that match a lemma resolve to `lemma/` path. */
export function collectLemmaTextSet(): Set<string> {
  const lemmas = new Set<string>();
  for (const entry of words) {
    if (entry.kind !== "word") continue;
    const lemma = normalizeAudioText(entry.slovak);
    if (lemma) lemmas.add(lemma);
  }
  return lemmas;
}

export function parseArgs(argv: string[]): {
  dryRun: boolean;
  examplesOnly: boolean;
  force: boolean;
  lemmasOnly: boolean;
  lessonsOnly: boolean;
  limit: number | undefined;
  missingOnly: boolean;
  offset: number;
  only: string | undefined;
  retries: number;
  sttModel: string;
  sttProvider: "elevenlabs" | "whisper" | "dual";
  verify: boolean;
  whisperModel: string;
} {
  let dryRun = false;
  let force = false;
  let lemmasOnly = false;
  let lessonsOnly = false;
  let examplesOnly = false;
  let missingOnly = false;
  let limit: number | undefined;
  let offset = 0;
  let only: string | undefined;
  let retries = 2;
  let sttProvider: "elevenlabs" | "whisper" | "dual" = "dual";
  let sttModel = "scribe_v2";
  let whisperModel = "small";
  let verify = false;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") dryRun = true;
    else if (arg === "--force") force = true;
    else if (arg === "--lemmas-only") lemmasOnly = true;
    else if (arg === "--lessons-only") lessonsOnly = true;
    else if (arg === "--examples-only") examplesOnly = true;
    else if (arg === "--missing-only") missingOnly = true;
    else if (arg === "--verify") verify = true;
    else if (arg === "--limit") {
      const value = Number(argv[i + 1]);
      if (!Number.isFinite(value) || value < 1) {
        throw new Error("--limit requires a positive number");
      }
      limit = Math.floor(value);
      i += 1;
    } else if (arg === "--offset") {
      const value = Number(argv[i + 1]);
      if (!Number.isFinite(value) || value < 0) {
        throw new Error("--offset requires a non-negative number");
      }
      offset = Math.floor(value);
      i += 1;
    } else if (arg === "--retries") {
      const value = Number(argv[i + 1]);
      if (!Number.isFinite(value) || value < 0) {
        throw new Error("--retries requires a non-negative number");
      }
      retries = Math.floor(value);
      i += 1;
    } else if (arg === "--only") {
      only = argv[i + 1];
      if (!only) throw new Error("--only requires a substring of the Slovak text");
      i += 1;
    } else if (arg === "--stt") {
      const value = argv[i + 1];
      if (value !== "elevenlabs" && value !== "whisper" && value !== "dual") {
        throw new Error('--stt must be "dual", "elevenlabs", or "whisper"');
      }
      sttProvider = value;
      if (sttProvider === "whisper" && sttModel.startsWith("scribe_")) {
        sttModel = "small";
      }
      if (
        (sttProvider === "elevenlabs" || sttProvider === "dual") &&
        !sttModel.startsWith("scribe_")
      ) {
        sttModel = "scribe_v2";
      }
      i += 1;
    } else if (arg === "--stt-model") {
      sttModel = argv[i + 1] ?? "";
      if (!sttModel) throw new Error("--stt-model requires a model id");
      i += 1;
    } else if (arg === "--whisper-model") {
      whisperModel = argv[i + 1] ?? "";
      if (!whisperModel) throw new Error("--whisper-model requires a name (e.g. small)");
      i += 1;
    }
  }

  if (lemmasOnly && lessonsOnly) {
    throw new Error("Use either --lemmas-only or --lessons-only, not both");
  }
  if (examplesOnly && (lemmasOnly || lessonsOnly)) {
    throw new Error("--examples-only cannot combine with --lemmas-only/--lessons-only");
  }

  return {
    dryRun,
    examplesOnly,
    force,
    lemmasOnly,
    lessonsOnly,
    limit,
    missingOnly,
    offset,
    only,
    retries,
    sttModel,
    sttProvider,
    verify,
    whisperModel,
  };
}

export interface SynthesizeOptions {
  languageCode?: string;
  modelId?: string;
  seed?: number;
}

export async function synthesizeElevenLabs(
  text: string,
  config: AudioConfig,
  apiKey: string,
  options: SynthesizeOptions = {},
): Promise<Uint8Array> {
  const url = new URL(`https://api.elevenlabs.io/v1/text-to-speech/${config.voiceId}`);
  url.searchParams.set("output_format", config.outputFormat);

  const modelId = options.modelId ?? config.modelId;
  const languageCode = options.languageCode ?? config.languageCode;

  const body: Record<string, unknown> = {
    text: normalizeAudioText(text),
    model_id: modelId,
    voice_settings: {
      stability: config.voiceSettings.stability,
      similarity_boost: config.voiceSettings.similarityBoost,
      style: config.voiceSettings.style,
      speed: config.voiceSettings.speed,
      use_speaker_boost: config.voiceSettings.useSpeakerBoost,
    },
  };

  // language_code is ignored by multilingual_v2; useful for eleven_v3 / flash.
  if (languageCode && modelId !== "eleven_multilingual_v2") {
    body.language_code = languageCode;
  }

  if (options.seed !== undefined) {
    body.seed = options.seed;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(`ElevenLabs ${response.status}: ${bodyText.slice(0, 500)}`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Hash keys are content-addressed → safe to cache forever at the edge. */
export const AUDIO_CACHE_CONTROL = "public, max-age=31536000, immutable";

/** S3/R2 user-metadata budget (~2 KiB). Leave headroom for AWS overhead. */
const AUDIO_METADATA_BUDGET_BYTES = 1800;

function metadataPayloadBytes(meta: Record<string, string>): number {
  let total = 0;
  for (const [key, value] of Object.entries(meta)) {
    total += key.length + value.length;
  }
  return total;
}

/**
 * Custom object metadata for R2 console / orphan cleanup.
 * `text` is URL-encoded (x-amz-meta values should stay US-ASCII; Slovak needs encoding).
 * Omits `text` when the payload would exceed the metadata budget.
 */
export function buildAudioObjectMetadata(options: {
  config: AudioConfig;
  generatedAt: string;
  hash: string;
  kind: AudioKind;
  text: string;
}): Record<string, string> {
  const base: Record<string, string> = {
    kind: options.kind,
    hash: options.hash,
    provider: options.config.provider,
    "voice-id": options.config.voiceId,
    "model-id": options.config.modelId,
    "output-format": options.config.outputFormat,
    "generated-at": options.generatedAt,
  };

  if (!options.text) return base;

  const withText = {
    ...base,
    text: encodeURIComponent(options.text),
  };

  if (metadataPayloadBytes(withText) <= AUDIO_METADATA_BUDGET_BYTES) {
    return withText;
  }

  return base;
}

/** List `{kind}/{hash}.mp3` keys under static/audio (skips voice-design etc.). */
export async function listAudioObjectKeys(): Promise<string[]> {
  const keys: string[] = [];
  const kinds: AudioKind[] = ["lemma", "example", "lesson"];

  for (const kind of kinds) {
    const dir = path.join(AUDIO_DIR, kind);
    let names: string[] = [];
    try {
      names = await readdir(dir);
    } catch {
      continue;
    }
    for (const name of names) {
      if (!name.endsWith(".mp3")) continue;
      keys.push(`${kind}/${name}`);
    }
  }

  keys.sort();
  return keys;
}

export { audioObjectKey };
