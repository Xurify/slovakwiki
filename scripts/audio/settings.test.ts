import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import type { AudioConfig } from "../../src/lib/catalog/audio/core";
import { ROOT } from "../lib/paths";
import {
  type AudioManifest,
  buildAudioObjectMetadata,
  candidateConfigs,
  generationSettings,
  hashAudioText,
} from "./shared";

const AUDIO = path.join(ROOT, "content", "audio");
const config = JSON.parse(
  readFileSync(path.join(AUDIO, "config.json"), "utf8"),
) as AudioConfig;

describe("clip settings in the manifest", () => {
  it("reads the model and speed from the config that made the clip", () => {
    expect(generationSettings(config)).toEqual({
      modelId: config.modelId,
      speed: config.voiceSettings.speed,
    });
  });

  it("finds the speed a character's clip was made at, even when it differs from the global one", () => {
    const [own] = candidateConfigs(config, "marek").slice(1);
    const hash = hashAudioText("Ahoj.", own!);
    const match = candidateConfigs(config, "marek").find(
      (c) => hashAudioText("Ahoj.", c) === hash,
    );
    expect(generationSettings(match!).speed).toBe(own!.voiceSettings.speed);
  });

  it("reproduces the hash of every example clip in the manifest at the speed it records", () => {
    const manifest = JSON.parse(
      readFileSync(path.join(AUDIO, "manifest.json"), "utf8"),
    ) as AudioManifest;
    const examples = Object.entries(manifest)
      .filter(([, entry]) => entry.kind === "example" && entry.speed !== undefined)
      .slice(0, 300);
    expect(examples.length).toBeGreaterThan(0);
    for (const [hash, entry] of examples) {
      const asRecorded = {
        ...config,
        voiceSettings: { ...config.voiceSettings, speed: entry.speed! },
      };
      expect(hashAudioText(entry.text, asRecorded), entry.text).toBe(hash);
    }
  });
});

describe("R2 object metadata", () => {
  const base = {
    config,
    generatedAt: "2026-11-01T00:00:00.000Z",
    hash: "abc",
    kind: "example" as const,
    text: "Ahoj.",
  };

  it("carries the recorded speed", () => {
    expect(buildAudioObjectMetadata({ ...base, speed: 0.88 }).speed).toBe("0.88");
  });

  it("leaves speed out when the manifest does not know it", () => {
    expect(buildAudioObjectMetadata(base)).not.toHaveProperty("speed");
  });
});
