import { audioConfigData, type AudioConfig, type AudioCharacter } from "./audio-core";

export type CharacterGender = "female" | "male" | "neutral";

export type LessonCharacterId =
  | "alex"
  | "anna"
  | "guide"
  | "lucia"
  | "marek"
  | "maria"
  | "narrator"
  | "receptionist"
  | "waiter";

const characters = audioConfigData.characters ?? {};

const speakerToCharacterId = new Map<string, LessonCharacterId>();

for (const [id, character] of Object.entries(characters)) {
  for (const speaker of character.speakers ?? []) {
    speakerToCharacterId.set(speaker, id as LessonCharacterId);
  }
}

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

/**
 * Map a dialogue speaker label (Anna, You, …) to a roster character.
 * Unknown speakers fall back to narrator so generate never drops a line.
 */
export function characterIdForSpeaker(speaker: string): LessonCharacterId {
  return speakerToCharacterId.get(speaker) ?? "narrator";
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
