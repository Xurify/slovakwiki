import { describe, expect, it } from "vitest";

import { audioHash } from "$lib/catalog/audio/core";
import { audioConfigForCharacter } from "$lib/catalog/audio/characters";
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
        audioConfigForCharacter(characterId),
      );
      const dictionaryHash = audioHash(preview.sampleSlovak);

      expect(entry.audioHash).toBe(characterHash);
      if (characterId !== "narrator") {
        expect(entry.audioHash).not.toBe(dictionaryHash);
      }
    }
  });
});
