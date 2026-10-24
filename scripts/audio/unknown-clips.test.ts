import { describe, expect, it, vi } from "vitest";

import type { AudioConfig } from "../../src/lib/catalog/audio/core";
import type { AudioManifest, AudioTarget } from "./shared";
import { identifyUnknownClips } from "./unknown-clips";

const dictionaryVoice: AudioConfig = {
  modelId: "eleven_v4",
  outputFormat: "mp3_44100_128",
  provider: "elevenlabs",
  voiceId: "dictionary-voice",
  voiceName: "Dictionary",
  voiceSettings: {
    similarityBoost: 0.75,
    speed: 1,
    stability: 0.5,
    style: 0,
    useSpeakerBoost: true,
  },
};

const greetingKey = "lesson/3f6c0e1d9a2b4c5d6e7f.mp3";
const tortaKey = "lemma/8a9b0c1d2e3f40516273.mp3";
const otherBranchKey = "lesson/5e4d3c2b1a0f9e8d7c6b.mp3";

const greeting: AudioTarget = {
  characterId: "anna",
  kind: "lesson",
  text: "Dobrý večer.",
  voiceConfig: { ...dictionaryVoice, voiceId: "anna-voice", voiceName: "Anna" },
};
const torta: AudioTarget = { kind: "lemma", text: "torta" };

function targetsByKey(): Map<string, AudioTarget> {
  return new Map([
    [greetingKey, greeting],
    [tortaKey, torta],
  ]);
}

describe("identifyUnknownClips", () => {
  it("gives a clip the manifest lacks the text, speaker and voice of its line", () => {
    const { identities, unmatched } = identifyUnknownClips(
      [greetingKey],
      {},
      targetsByKey,
      dictionaryVoice,
    );

    expect(identities.get(greetingKey)).toEqual({
      characterId: "anna",
      kind: "lesson",
      text: "Dobrý večer.",
      voiceId: "anna-voice",
    });
    expect(unmatched).toEqual([]);
  });

  it("gives a dictionary clip the dictionary voice", () => {
    const { identities } = identifyUnknownClips(
      [tortaKey],
      {},
      targetsByKey,
      dictionaryVoice,
    );

    expect(identities.get(tortaKey)).toEqual({
      kind: "lemma",
      text: "torta",
      voiceId: "dictionary-voice",
    });
  });

  it("leaves out a clip no line on this branch produces instead of giving it no text", () => {
    const { identities, unmatched } = identifyUnknownClips(
      [greetingKey, otherBranchKey],
      {},
      targetsByKey,
      dictionaryVoice,
    );

    expect([...identities.keys()]).toEqual([greetingKey]);
    expect(unmatched).toEqual([otherBranchKey]);
  });

  it("does not collect targets when the manifest lists every clip", () => {
    const manifest: AudioManifest = {
      "3f6c0e1d9a2b4c5d6e7f": {
        bytes: 23031,
        characterId: "anna",
        generatedAt: "2026-10-20T19:24:47.295Z",
        kind: "lesson",
        text: "Dobrý večer.",
        voiceId: "anna-voice",
      },
    };
    const collect = vi.fn(targetsByKey);

    const { identities, unmatched } = identifyUnknownClips(
      [greetingKey],
      manifest,
      collect,
      dictionaryVoice,
    );

    expect(identities.size).toBe(0);
    expect(unmatched).toEqual([]);
    expect(collect).not.toHaveBeenCalled();
  });
});
