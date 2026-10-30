import { readFileSync } from "node:fs";
/**
 * Shared helpers for ElevenLabs generate / upload / status.
 */

import { createHash } from "node:crypto";
import { mkdir, readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { caseTopics, grammarEntries, words } from "../../src/lib/catalog/entries";
import { grammarExamples } from "../../src/lib/catalog/reference/grammar-pattern";
import {
  type AudioConfig,
  type AudioKind,
  type AudioVoiceSettings,
  audioObjectKey,
  normalizeAudioText,
  toR2AudioKey,
} from "../../src/lib/catalog/audio/core";
import {
  characterIdForSpeaker,
  type LessonCharacterId,
} from "../../src/lib/catalog/lessons/character-ids";
import {
  audioConfigForClip,
  getCharacter,
  keyPhraseCharacterId,
} from "../../src/lib/catalog/audio/characters";
import { VOICE_PREVIEW_LINES } from "../../src/lib/catalog/lessons/voice-preview-lines";
import { lessons } from "../../src/lib/catalog/lessons";
import { episodeLines, listeningEpisodes } from "../../src/lib/catalog/listening";
import { lessonExercises } from "../../src/lib/learning/beats";
import { RAIN_AND_TRAM, WEATHER_TODAY } from "../../src/lib/stick-figure/dev-scenes";
import { dayTurns } from "../../src/lib/stick-figure/scene-day";
import { findTurns } from "../../src/lib/stick-figure/scene-sources";
import { PLACES } from "../../src/lib/stick-figure/places";
import {
  exerciseAnswerTexts,
  exerciseOptionTexts,
} from "../../src/lib/catalog/lessons/audio";
import { readJsonFile, writeFileAtomic } from "../lib/json-file";
import { ROOT } from "../lib/paths";

export type { AudioKind };

export const AUDIO_DIR = path.join(ROOT, "static", "audio");
export const CONFIG_PATH = path.join(ROOT, "content", "audio", "config.json");
export const MANIFEST_PATH = path.join(ROOT, "content", "audio", "manifest.json");
export const RUNTIME_INDEX_PATH = path.join(
  ROOT,
  "content",
  "audio",
  "runtime-index.json",
);

/** Ship order: headwords first, then example lines, then lesson dialogue. */
export const AUDIO_KIND_ORDER: Record<AudioKind, number> = {
  lemma: 0,
  example: 1,
  lesson: 2,
};

export function compareAudioKind(a: AudioKind, b: AudioKind): number {
  return AUDIO_KIND_ORDER[a] - AUDIO_KIND_ORDER[b];
}

export function sortAudioTargetsByKind(targets: AudioTarget[]): AudioTarget[] {
  return [...targets].sort((a, b) => {
    const byKind = compareAudioKind(a.kind, b.kind);
    if (byKind !== 0) return byKind;
    return a.text.localeCompare(b.text, "sk");
  });
}

/** Prefer lemma/ → example/ → lesson/ for bulk upload/gen progress. */
export function sortObjectKeysByKind(keys: string[]): string[] {
  return [...keys].sort((a, b) => {
    const kindA = kindFromObjectKey(a);
    const kindB = kindFromObjectKey(b);
    const byKind = compareAudioKind(kindA, kindB);
    if (byKind !== 0) return byKind;
    return a.localeCompare(b);
  });
}

export function kindFromObjectKey(objectKey: string): AudioKind {
  const key = objectKey.replace(/^audio\//, "");
  if (key.startsWith("lesson/")) return "lesson";
  if (key.startsWith("example/")) return "example";
  return "lemma";
}

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

export interface RuntimeIndexEntry {
  k: AudioKind;
  g: string;
}

export type AudioRuntimeIndex = Record<string, RuntimeIndexEntry>;

export function sortManifestKeys<T extends Record<string, unknown>>(record: T): T {
  return Object.fromEntries(
    Object.entries(record).sort(([a], [b]) => a.localeCompare(b, "en")),
  ) as T;
}

export function buildRuntimeIndex(manifest: AudioManifest): AudioRuntimeIndex {
  const index: AudioRuntimeIndex = {};
  for (const [hash, entry] of Object.entries(manifest)) {
    index[hash] = { k: entry.kind, g: entry.generatedAt };
  }
  return index;
}

export interface AudioTarget {
  characterId?: LessonCharacterId;
  kind: AudioKind;
  text: string;
  /** Per-target voice override (lesson characters). */
  voiceConfig?: AudioConfig;
}

/** Same material as src/lib/catalog/audio.ts audioHash (keep in sync). */
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
  return readJsonFile<AudioManifest>(MANIFEST_PATH, {});
}

export async function saveManifest(manifest: AudioManifest): Promise<void> {
  const sorted = sortManifestKeys(manifest);
  await writeFileAtomic(MANIFEST_PATH, `${JSON.stringify(sorted)}\n`);
  const runtimeIndex = sortManifestKeys(buildRuntimeIndex(sorted));
  await writeFileAtomic(RUNTIME_INDEX_PATH, `${JSON.stringify(runtimeIndex)}\n`);
}

/**
 * Manifest only. The runtime index holds kind + generatedAt, so stamping
 * `uploadedAt` never changes it — and the dev server keeps it open, which
 * makes rewriting it on Windows fail with EUNKNOWN mid-upload.
 */
export async function saveManifestFile(manifest: AudioManifest): Promise<void> {
  await writeFileAtomic(MANIFEST_PATH, `${JSON.stringify(sortManifestKeys(manifest))}\n`);
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

/** Every example sentence a case page shows. */
function caseSentences(slugs?: Set<string>): string[] {
  return caseTopics
    .filter((topic) => !slugs || slugs.has(topic.slug))
    .flatMap((topic) => topic.examples.map((example) => example.slovak));
}

/** Every sentence a grammar page shows: table examples and contrast cards. */
function grammarSentences(slugs?: Set<string>): string[] {
  return grammarEntries
    .filter((topic) => !slugs || slugs.has(topic.slug))
    .flatMap((topic) => [
      ...grammarExamples(topic).map((example) => example.slovak),
      ...[...(topic.contrasts?.frames ?? []), ...(topic.contrasts?.more ?? [])].flatMap(
        (frame) => frame.choices.map((choice) => choice.slovak.text),
      ),
    ]);
}

/** Unique lemma + example Slovak strings from the dictionary, grammar pages, and case pages. */
export function collectDictionaryAudioTargets(options?: {
  lemmasOnly?: boolean;
  slugs?: Set<string>;
}): AudioTarget[] {
  const byText = new Map<string, AudioTarget>();

  for (const entry of words) {
    if (entry.kind !== "word") continue;
    if (options?.slugs && !options.slugs.has(entry.slug)) continue;

    const lemma = normalizeAudioText(entry.slovak);
    if (lemma) {
      const existing = byText.get(lemma);
      if (!existing || existing.kind === "example") {
        byText.set(lemma, {
          kind: "lemma",
          text: lemma,
        });
      }
    }

    if (options?.lemmasOnly) continue;

    // Mint audio for the whole store pool: the app plays every stored example, not only the four the detail page shows.
    for (const example of entry.examples) {
      const slovak = normalizeAudioText(example.slovak);
      if (!slovak || byText.has(slovak)) continue;
      byText.set(slovak, { kind: "example", text: slovak });
    }
  }

  // Things on the stick-figure stage are tapped for their word, and some
  // (torta, kávovar) have no dictionary entry to bring a clip with them.
  if (!options?.slugs) {
    for (const thing of Object.values(PLACES).flatMap((place) => place.things)) {
      const word = normalizeAudioText(thing.word);
      if (word && !byText.has(word)) byText.set(word, { kind: "lemma", text: word });
    }
  }

  if (!options?.lemmasOnly) {
    for (const sentence of [
      ...grammarSentences(options?.slugs),
      ...caseSentences(options?.slugs),
    ]) {
      const slovak = normalizeAudioText(sentence);
      if (!slovak || byText.has(slovak)) continue;
      byText.set(slovak, { kind: "example", text: slovak });
    }
  }

  return sortAudioTargetsByKind([...byText.values()]);
}

/**
 * Lesson scene + key-phrase lines and listening episodes, with per-character voices.
 * Note: lesson content may churn — clips are disposable regenerations.
 */
export function collectLessonAudioTargets(
  baseConfig: AudioConfig,
  fresh = false,
): AudioTarget[] {
  const byKey = new Map<string, AudioTarget>();
  const made = fresh ? {} : readRuntimeIndex();
  const has = (hash: string) => Object.hasOwn(made, hash);

  function addLine(text: string, characterId: LessonCharacterId): void {
    const normalized = normalizeAudioText(text);
    if (!normalized) return;

    const voiceConfig = audioConfigForClip(normalized, characterId, has, baseConfig);
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

    for (const exercise of lessonExercises(lesson)) {
      for (const text of [
        ...exerciseOptionTexts(exercise),
        ...exerciseAnswerTexts(exercise),
      ]) {
        addLine(text, keyPhraseCharacterId());
      }

      if (!("context" in exercise) || !exercise.context) continue;
      for (const line of exercise.context) {
        addLine(
          line.audio?.transcript ?? line.slovak,
          characterIdForSpeaker(line.speaker),
        );
      }
    }
  }

  for (const episode of listeningEpisodes) {
    for (const line of episodeLines(episode)) {
      addLine(line.audio?.transcript ?? line.slovak, characterIdForSpeaker(line.speaker));
    }

    for (const phrase of episode.vocabulary) {
      addLine(phrase.audio?.transcript ?? phrase.slovak, keyPhraseCharacterId());
    }
  }

  for (const turn of dayTurns()) {
    addLine(turn.slovak, characterIdForSpeaker(turn.speaker));
  }

  for (const turn of findTurns()) {
    addLine(turn.slovak, characterIdForSpeaker(turn.speaker));
  }

  for (const line of [...RAIN_AND_TRAM, ...WEATHER_TODAY]) {
    addLine(line.slovak, characterIdForSpeaker(line.speaker));
  }

  for (const [characterId, preview] of Object.entries(VOICE_PREVIEW_LINES)) {
    addLine(preview.sampleSlovak, characterId as LessonCharacterId);
  }

  return sortAudioTargetsByKind([...byKey.values()]);
}

/**
 * The clips made so far, by hash, so a character's clip made before its own
 * voice settings is still found under the settings it was made in.
 */
function readRuntimeIndex(): Record<string, unknown> {
  try {
    return JSON.parse(
      readFileSync(path.join(process.cwd(), "content/audio/runtime-index.json"), "utf8"),
    );
  } catch {
    return {};
  }
}

/** Dictionary and/or lesson targets (default: both). */
export function collectAudioTargets(
  options?: {
    /** Lesson clips in their characters' settings now, as for a forced re-take, not the settings an existing take was made in. */
    fresh?: boolean;
    lemmasOnly?: boolean;
    lessonsOnly?: boolean;
    slugs?: Set<string>;
  },
  baseConfig?: AudioConfig,
): AudioTarget[] {
  if (options?.lessonsOnly) {
    if (!baseConfig) throw new Error("collectAudioTargets(lessonsOnly) needs baseConfig");
    return collectLessonAudioTargets(baseConfig, options.fresh);
  }

  const dictionary = collectDictionaryAudioTargets({
    lemmasOnly: options?.lemmasOnly,
    slugs: options?.slugs,
  });
  if (options?.lemmasOnly || !baseConfig) return dictionary;

  return sortAudioTargetsByKind([
    ...dictionary,
    ...collectLessonAudioTargets(baseConfig, options?.fresh),
  ]);
}

/** Every dictionary and lesson target by its clip's `{kind}/{hash}.mp3` key. */
export function collectAudioTargetsByObjectKey(
  baseConfig: AudioConfig,
): Map<string, AudioTarget> {
  const byKey = new Map<string, AudioTarget>();
  for (const target of collectAudioTargets({}, baseConfig)) {
    const voiceConfig = target.voiceConfig ?? baseConfig;
    byKey.set(audioRelativePath(target.text, target.kind, voiceConfig), target);
  }
  return byKey;
}

/**
 * Live object keys for current config + content.
 * Anything else under static/audio/{kind}/ is an orphan (old model/settings hash).
 */
export function collectExpectedAudioObjectKeys(baseConfig: AudioConfig): Set<string> {
  return new Set(collectAudioTargetsByObjectKey(baseConfig).keys());
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

/**
 * Eleven v4 is concurrency group `standard_eleven_v4`, not the Flash 2× bucket.
 * Pro Flash was ~20; leave headroom under a standard cap unless overridden.
 */
export const DEFAULT_AUDIO_CONCURRENCY = 8;
/** R2 PUTs are lighter than TTS — higher default. */
export const DEFAULT_UPLOAD_CONCURRENCY = 128;

export function parseArgs(
  argv: string[],
  defaults?: { concurrency?: number },
): {
  concurrency: number;
  dryRun: boolean;
  examplesOnly: boolean;
  force: boolean;
  lemmasOnly: boolean;
  lessonsOnly: boolean;
  limit: number | undefined;
  missingOnly: boolean;
  model: string | undefined;
  offset: number;
  only: string | undefined;
  slugs: Set<string> | undefined;
  retries: number;
  sttModel: string;
  sttProvider: "elevenlabs" | "whisper" | "dual";
  verify: boolean;
  whisperModel: string;
} {
  let concurrency = defaults?.concurrency ?? DEFAULT_AUDIO_CONCURRENCY;
  let dryRun = false;
  let force = false;
  let lemmasOnly = false;
  let lessonsOnly = false;
  let examplesOnly = false;
  let missingOnly = false;
  let model: string | undefined;
  let limit: number | undefined;
  let offset = 0;
  let only: string | undefined;
  let slugs: Set<string> | undefined;
  let retries = 2;
  let sttProvider: "elevenlabs" | "whisper" | "dual" = "elevenlabs";
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
    else if (arg === "--model") {
      model = argv[i + 1];
      if (!model) throw new Error("--model requires an ElevenLabs model id");
      i += 1;
    } else if (arg === "--verify") verify = true;
    else if (arg === "--concurrency") {
      const value = Number(argv[i + 1]);
      if (!Number.isFinite(value) || value < 1) {
        throw new Error("--concurrency requires a positive number");
      }
      concurrency = Math.min(32, Math.floor(value));
      i += 1;
    } else if (arg === "--limit") {
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
    } else if (arg === "--slugs") {
      const raw = argv[i + 1];
      if (!raw) throw new Error("--slugs requires comma-separated dictionary slugs");
      slugs = new Set(
        raw
          .split(",")
          .map((slug) => slug.trim())
          .filter(Boolean),
      );
      if (slugs.size === 0) throw new Error("--slugs matched no slugs");
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
    concurrency,
    dryRun,
    examplesOnly,
    force,
    lemmasOnly,
    lessonsOnly,
    limit,
    missingOnly,
    model,
    offset,
    only,
    slugs,
    retries,
    sttModel,
    sttProvider,
    verify,
    whisperModel,
  };
}

/** Run `worker` over items with at most `concurrency` in flight. */
export async function mapPool<T>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<void>,
): Promise<void> {
  const limit = Math.max(1, Math.min(concurrency, items.length || 1));
  let next = 0;

  async function runWorker(): Promise<void> {
    while (true) {
      const index = next;
      next += 1;
      if (index >= items.length) return;
      await worker(items[index]!, index);
    }
  }

  await Promise.all(Array.from({ length: limit }, () => runWorker()));
}

/** Eleven v4 family ignores style and speaker boost. */
function isElevenV4(modelId: string): boolean {
  return modelId === "eleven_v4" || modelId === "eleven_v4_turbo";
}

export interface SynthesizeOptions {
  languageCode?: string;
  modelId?: string;
  omitVoiceSettings?: boolean;
  seed?: number;
  speed?: number;
  voiceSettings?: AudioVoiceSettings;
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
  };

  if (!options.omitVoiceSettings) {
    const settings = options.voiceSettings ?? config.voiceSettings;
    const voiceSettings: Record<string, unknown> = {
      stability: settings.stability,
      similarity_boost: settings.similarityBoost,
      speed: options.speed ?? settings.speed,
    };
    // GET /v1/models: eleven_v4 and eleven_v4_turbo set can_use_style and
    // can_use_speaker_boost to false. Speed still goes out (study pace).
    if (!isElevenV4(modelId)) {
      voiceSettings.style = settings.style;
      voiceSettings.use_speaker_boost = settings.useSpeakerBoost;
    }
    body.voice_settings = voiceSettings;
  }

  // language_code is ignored by multilingual_v2; used by v4 / flash / turbo / v3.
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

/** Where a sound character's line comes from: a prompt, and a recording that wins over it. */
export interface SoundSource {
  prompt: string;
  recording?: string;
}

/**
 * The sound behind a line of a character who makes sounds, not speech
 * (Dunčo's "Haf!"). Undefined for a voice; a sound character's line with no
 * prompt of its own is an authoring slip, so it throws.
 */
export function soundFor(target: AudioTarget): SoundSource | undefined {
  const character = target.characterId ? getCharacter(target.characterId) : undefined;
  if (!character?.sounds) return undefined;

  const prompt = character.sounds[target.text];
  if (!prompt) {
    throw new Error(
      `${target.characterId} has no sound for ${JSON.stringify(target.text)}; add it to "sounds" in config.json`,
    );
  }
  return { prompt, recording: character.recordings?.[target.text] };
}

/** The clip for a sound line: its recording when it has one, else generated from the prompt. */
export async function renderSound(
  sound: SoundSource,
  config: AudioConfig,
  apiKey: string,
): Promise<Uint8Array> {
  if (sound.recording)
    return new Uint8Array(await readFile(path.join(ROOT, sound.recording)));
  return synthesizeSound(sound.prompt, config, apiKey);
}

/** A sound effect from ElevenLabs' sound generation, in the config's output format. */
export async function synthesizeSound(
  prompt: string,
  config: AudioConfig,
  apiKey: string,
): Promise<Uint8Array> {
  const url = new URL("https://api.elevenlabs.io/v1/sound-generation");
  url.searchParams.set("output_format", config.outputFormat);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
      "xi-api-key": apiKey,
    },
    // A high prompt influence keeps the take to what the prompt asks: one
    // bark is one bark, not a dog barking on and off for five seconds.
    body: JSON.stringify({ text: prompt, prompt_influence: 0.7 }),
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(`ElevenLabs sound ${response.status}: ${bodyText.slice(0, 500)}`);
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

export { audioObjectKey, toR2AudioKey };
