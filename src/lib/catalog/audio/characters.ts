import {
  audioConfigData,
  audioHash,
  type AudioCharacter,
  type AudioConfig,
} from "./core";
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
    voiceSettings: { ...base.voiceSettings, ...character.voiceSettings },
  };
}

/**
 * The voice a clip of `text` was made in: this character's settings, or the
 * shared ones it had before its own were set, when only that older take
 * exists (`has`). A clip not made yet gets the character's settings.
 */
export function audioConfigForClip(
  text: string,
  characterId: LessonCharacterId,
  has: (hash: string) => boolean,
  base: AudioConfig = audioConfigData,
): AudioConfig {
  const config = audioConfigForCharacter(characterId, base);
  if (!characters[characterId]?.voiceSettings || has(audioHash(text, config)))
    return config;

  const earlier = { ...config, voiceSettings: base.voiceSettings };
  return has(audioHash(text, earlier)) ? earlier : config;
}
