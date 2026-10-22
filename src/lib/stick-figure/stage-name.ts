import {
  characterIdForSpeaker,
  isLearnerSpeaker,
  listedCharacters,
} from "$lib/catalog/lessons/character-ids";

/**
 * The name to put over a line on stage. Lessons label the learner's turns
 * "You", but on stage those lines belong to a figure with a name.
 */
export function stageName(speaker: string): string {
  if (!isLearnerSpeaker(speaker)) return speaker;

  const id = characterIdForSpeaker(speaker);
  return (
    listedCharacters().find((character) => character.id === id)?.displayName ?? speaker
  );
}
