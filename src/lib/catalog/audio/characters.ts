import { audioConfigData, type AudioCharacter, type AudioConfig } from "./core";
import type { LessonCharacterId } from "../lessons/character-ids";

export type CharacterGender = "female" | "male" | "neutral";

const characters = audioConfigData.characters ?? {};

/** Character roster from `content/audio/config.json`. */
export function listCharacters(): Array<AudioCharacter & { id: LessonCharacterId }> {
  return Object.entries(characters).map(([id, character]) => ({
    id: id as LessonCharacterId,
    ...character,
  }));
}

export function getCharacter(id: LessonCharacterId): AudioCharacter | undefined {
  return characters[id];
}

/** Key phrases — instructional guide voice (not dictionary). */
export function keyPhraseCharacterId(): LessonCharacterId {
  return "guide";
}

/** Build a full AudioConfig with this character's voice (hash + TTS). */
export function audioConfigForCharacter(
  characterId: LessonCharacterId,
  base: AudioConfig = audioConfigData,
): AudioConfig {
  const character = characters[characterId];
  if (!character) return base;

  return {
    ...base,
    voiceId: character.voiceId,
    voiceName: character.voiceName,
  };
}
