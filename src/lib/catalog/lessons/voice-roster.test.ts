import { describe, expect, it } from "vitest";

import { audioHash } from "$lib/catalog/audio/core";
import {
  audioConfigForCharacter,
  audioConfigForClip,
} from "$lib/catalog/audio/characters";
import { hasAudioClip } from "$lib/catalog/audio/manifest";
import { LESSON_CHARACTER_IDS } from "$lib/catalog/lessons/character-ids";
import { getVoiceRoster, VOICE_PREVIEW_LINES } from "$lib/catalog/lessons/voice-roster";

describe("voice roster samples", () => {
  it("hashes each sample with that character's voice, not the dictionary default", () => {
    const roster = getVoiceRoster();

    for (const characterId of LESSON_CHARACTER_IDS) {
      const entry = roster.find((row) => row.id === characterId);
      const preview = VOICE_PREVIEW_LINES[characterId];
      expect(entry).toBeDefined();
      expect(preview).toBeDefined();
      if (!entry || !preview) continue;

      const characterHash = audioHash(
        preview.sampleSlovak,
        audioConfigForClip(preview.sampleSlovak, characterId, hasAudioClip),
      );
      const dictionaryHash = audioHash(preview.sampleSlovak);

      expect(entry.audioHash).toBe(characterHash);
      if (characterId !== "narrator") {
        expect(entry.audioHash).not.toBe(dictionaryHash);
      }
    }
  });
});

describe("a character's own voice settings", () => {
  const settings = audioConfigForCharacter("marek").voiceSettings;
  const earlier = {
    ...audioConfigForCharacter("marek"),
    voiceSettings: audioConfigForCharacter("anna").voiceSettings,
  };

  it("make new clips in them", () => {
    expect(settings.stability).toBe(0.85);
    expect(audioConfigForClip("Nová veta.", "marek", () => false).voiceSettings).toEqual(
      settings,
    );
  });

  it("keep finding a clip made before them", () => {
    const made = new Set([audioHash("Stará veta.", earlier)]);
    expect(audioConfigForClip("Stará veta.", "marek", (hash) => made.has(hash))).toEqual(
      earlier,
    );
  });
});
