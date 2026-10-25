import { describe, expect, it } from "vitest";

import config from "../../content/audio/config.json";
import type { AudioConfig } from "../../src/lib/catalog/audio/core";
import { hasAudioClip } from "../../src/lib/catalog/audio/manifest";
import { mouthTrackFor } from "../../src/lib/catalog/audio/mouth";
import { collectAudioTargets, hashAudioText, type AudioTarget } from "./shared";

const baseConfig = config as AudioConfig;

/** The same list generate.ts works through, so a line it would make is a line it has made. */
const targets = collectAudioTargets({}, baseConfig);

const hashOf = (target: AudioTarget) =>
  hashAudioText(target.text, target.voiceConfig ?? baseConfig);

const label = (target: AudioTarget) =>
  `${target.characterId ?? target.kind}: ${target.text}`;

describe("audio clips", () => {
  it("has a clip for every spoken text; run generate.ts -- --missing-only", () => {
    expect(targets.length).toBeGreaterThan(0);
    expect(targets.filter((target) => !hasAudioClip(hashOf(target))).map(label)).toEqual(
      [],
    );
  });

  it("has a vowel track for every lesson, podcast and scene clip; run mouth.ts", () => {
    const voiced = targets.filter((target) => target.kind === "lesson");
    expect(voiced.length).toBeGreaterThan(0);
    expect(
      voiced.filter((target) => !mouthTrackFor(hashOf(target))?.v).map(label),
    ).toEqual([]);
  });
});
