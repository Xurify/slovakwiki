/** Client-safe speaker → roster id (JSON only — no node:crypto). */

import audioConfig from "../../../../content/audio/config.json";

export const LESSON_CHARACTER_IDS = [
  "alex",
  "anna",
  "guide",
  "lucia",
  "marek",
  "maria",
  "narrator",
  "receptionist",
  "waiter",
] as const;

export type LessonCharacterId = (typeof LESSON_CHARACTER_IDS)[number];

function isLessonCharacterId(id: string): id is LessonCharacterId {
  return (LESSON_CHARACTER_IDS as readonly string[]).includes(id);
}

const speakerToCharacterId = new Map<string, LessonCharacterId>();

for (const [id, character] of Object.entries(audioConfig.characters ?? {})) {
  if (!isLessonCharacterId(id)) continue;

  for (const speaker of character.speakers ?? []) {
    speakerToCharacterId.set(speaker, id);
  }
}

/**
 * Map a dialogue speaker label (Anna, You, …) to a roster character.
 * Unknown speakers fall back to narrator so generate never drops a line.
 */
export function characterIdForSpeaker(speaker: string): LessonCharacterId {
  return speakerToCharacterId.get(speaker) ?? "narrator";
}

export function isLearnerSpeaker(speaker: string): boolean {
  return speaker === "You";
}

export type CharacterKind = "oneOff" | "recurring" | "system";

export interface ListedCharacter {
  blurb: string;
  displayName: string;
  id: LessonCharacterId;
  kind: CharacterKind;
  speakers: string[];
}

function isCharacterKind(value: unknown): value is CharacterKind {
  return value === "oneOff" || value === "recurring" || value === "system";
}

/** Full roster with display names (gallery / audits). */
export function listedCharacters(): ListedCharacter[] {
  const characters = audioConfig.characters ?? {};

  return LESSON_CHARACTER_IDS.map((id) => {
    const character = characters[id];

    return {
      id,
      displayName: character?.displayName ?? id,
      kind: isCharacterKind(character?.kind) ? character.kind : "recurring",
      blurb: character?.blurb ?? "",
      speakers: character?.speakers ?? [],
    };
  });
}

/** Audio-config speaker labels paired with roster ids (tests / audits). */
export function listedAudioSpeakers(): Array<{ id: LessonCharacterId; speaker: string }> {
  const rows: Array<{ id: LessonCharacterId; speaker: string }> = [];

  for (const [id, character] of Object.entries(audioConfig.characters ?? {})) {
    if (!isLessonCharacterId(id)) continue;

    for (const speaker of character.speakers ?? []) {
      rows.push({ id, speaker });
    }
  }

  return rows;
}
