/**
 * Shared helpers for ElevenLabs generate / upload / status.
 */

import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { words } from "../../src/lib/content/data";
import {
  type AudioConfig,
  type AudioKind,
  audioObjectKey,
  normalizeAudioText,
} from "../../src/lib/content/audio";
import { ROOT } from "../lib/paths";

export const AUDIO_DIR = path.join(ROOT, "static", "audio");
export const CONFIG_PATH = path.join(ROOT, "content", "audio", "config.json");
export const MANIFEST_PATH = path.join(ROOT, "content", "audio", "manifest.json");

export interface ManifestEntry {
  bytes: number;
  generatedAt: string;
  kind: AudioKind;
  text: string;
  uploadedAt?: string;
}

export type AudioManifest = Record<string, ManifestEntry>;

export interface AudioTarget {
  kind: AudioKind;
  text: string;
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

export function audioRelativePath(text: string, kind: AudioKind, config: AudioConfig): string {
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
}

/** Unique lemma + example Slovak strings from the live dictionary merge. */
export function collectAudioTargets(options?: {
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

    for (const example of entry.examples) {
      const slovak = normalizeAudioText(example.slovak);
      if (!slovak || byText.has(slovak)) continue;
      byText.set(slovak, { kind: "example", text: slovak });
    }
  }

  return [...byText.values()].sort((a, b) => a.text.localeCompare(b.text, "sk"));
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
  force: boolean;
  lemmasOnly: boolean;
  limit: number | undefined;
} {
  let dryRun = false;
  let force = false;
  let lemmasOnly = false;
  let limit: number | undefined;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") dryRun = true;
    else if (arg === "--force") force = true;
    else if (arg === "--lemmas-only") lemmasOnly = true;
    else if (arg === "--limit") {
      const value = Number(argv[i + 1]);
      if (!Number.isFinite(value) || value < 1) {
        throw new Error("--limit requires a positive number");
      }
      limit = Math.floor(value);
      i += 1;
    }
  }

  return { dryRun, force, lemmasOnly, limit };
}

export async function synthesizeElevenLabs(
  text: string,
  config: AudioConfig,
  apiKey: string,
): Promise<Uint8Array> {
  const url = new URL(
    `https://api.elevenlabs.io/v1/text-to-speech/${config.voiceId}`,
  );
  url.searchParams.set("output_format", config.outputFormat);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
      "xi-api-key": apiKey,
    },
    body: JSON.stringify({
      text: normalizeAudioText(text),
      model_id: config.modelId,
      voice_settings: {
        stability: config.voiceSettings.stability,
        similarity_boost: config.voiceSettings.similarityBoost,
        style: config.voiceSettings.style,
        speed: config.voiceSettings.speed,
        use_speaker_boost: config.voiceSettings.useSpeakerBoost,
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`ElevenLabs ${response.status}: ${body.slice(0, 500)}`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** List `{kind}/{hash}.mp3` keys under static/audio (skips voice-design etc.). */
export async function listAudioObjectKeys(): Promise<string[]> {
  const keys: string[] = [];
  const kinds: AudioKind[] = ["lemma", "example"];

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
