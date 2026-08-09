import { hasAudioClip } from "./audio-manifest";
import { audioHash, resolveAudioSrc } from "./audio";
import {
  audioConfigForCharacter,
  characterIdForSpeaker,
  keyPhraseCharacterId,
  type LessonCharacterId,
} from "./characters";
import type { DialogueTurn, KeyPhrase, Lesson } from "./learning-types";

function resolveCharacterAudioSrc(
  text: string,
  characterId: LessonCharacterId,
): string | undefined {
  const config = audioConfigForCharacter(characterId);
  const hash = audioHash(text, config);
  if (!hasAudioClip(hash)) return undefined;
  return resolveAudioSrc(text, "lesson", config);
}

/** Scene line id → public URL when the character clip exists in the manifest. */
export function sceneAudioSrcs(scene: DialogueTurn[]): Record<string, string> {
  const srcs: Record<string, string> = {};

  for (const line of scene) {
    const text = line.audio?.transcript ?? line.slovak;
    const src = resolveCharacterAudioSrc(text, characterIdForSpeaker(line.speaker));
    if (src) srcs[line.id] = src;
  }

  return srcs;
}

/** Key-phrase slovak → public URL (guide voice). */
export function keyPhraseAudioSrcs(phrases: KeyPhrase[]): Record<string, string> {
  const srcs: Record<string, string> = {};
  const characterId = keyPhraseCharacterId();

  for (const phrase of phrases) {
    const text = phrase.audio?.transcript ?? phrase.slovak;
    const src = resolveCharacterAudioSrc(text, characterId);
    if (src) srcs[phrase.slovak] = src;
  }

  return srcs;
}

/** All resolvable audio for a lesson (scene + key phrases + exercise contexts). */
export function lessonAudioSrcs(lesson: Lesson): {
  keyPhrases: Record<string, string>;
  scene: Record<string, string>;
} {
  const scene = { ...sceneAudioSrcs(lesson.scene) };

  for (const exercise of lesson.exercises) {
    if (!("context" in exercise) || !exercise.context) continue;
    Object.assign(scene, sceneAudioSrcs(exercise.context));
  }

  return {
    scene,
    keyPhrases: keyPhraseAudioSrcs(lesson.keyPhrases),
  };
}
