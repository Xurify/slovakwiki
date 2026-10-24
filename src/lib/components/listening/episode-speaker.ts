import {
  characterIdForSpeaker,
  listedCharacters,
} from "$lib/catalog/lessons/character-ids";
import { dialogueSpeakerLabel } from "$lib/components/practice/dialogue-speaker";

/**
 * The name over an episode line. A scene card has no one on stage saying it,
 * so it is named after the roster voice that reads it: the narrator.
 */
export function episodeSpeakerName(speaker: string): string {
  if (dialogueSpeakerLabel(speaker) !== null) return speaker;

  const id = characterIdForSpeaker(speaker);
  return (
    listedCharacters().find((character) => character.id === id)?.displayName ?? speaker
  );
}
