import { hasAudioClip } from "../audio/manifest";
import { audioHash } from "../audio/core";
import { resolveAudioSrc } from "../audio";
import { characterIdForSpeaker, type LessonCharacterId } from "./character-ids";
import { audioConfigForCharacter, keyPhraseCharacterId } from "../audio/characters";
import { lessonExercises } from "$lib/learning/beats";
import type {
  DialogueTurn,
  KeyPhrase,
  Lesson,
  LessonExercise,
} from "$lib/learning/types";

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

export function exerciseOptionTexts(exercise: LessonExercise): string[] {
  if (exercise.type !== "choice" && exercise.type !== "selectAll") return [];
  return exercise.choices.flatMap((choice) => (choice.label ? [choice.label] : []));
}

/** The sentence a build or typed check speaks once answered (the correction). */
export function exerciseAnswerTexts(exercise: LessonExercise): string[] {
  if (exercise.type !== "build" && exercise.type !== "typed") return [];
  return exercise.feedback.correction ? [exercise.feedback.correction] : [];
}

/** Option labels and build/typed answers → public URL (guide voice), keyed by text. */
export function exerciseOptionAudioSrcs(lesson: Lesson): Record<string, string> {
  const srcs: Record<string, string> = {};
  const characterId = keyPhraseCharacterId();

  for (const exercise of lessonExercises(lesson)) {
    for (const text of [
      ...exerciseOptionTexts(exercise),
      ...exerciseAnswerTexts(exercise),
    ]) {
      const src = resolveCharacterAudioSrc(text, characterId);
      if (src) srcs[text] = src;
    }
  }

  return srcs;
}

/** All resolvable audio for a lesson (scene + key phrases + exercise contexts and options). */
export function lessonAudioSrcs(lesson: Lesson): {
  keyPhrases: Record<string, string>;
  options: Record<string, string>;
  scene: Record<string, string>;
} {
  const scene = { ...sceneAudioSrcs(lesson.scene) };

  for (const exercise of lessonExercises(lesson)) {
    if (!("context" in exercise) || !exercise.context) continue;
    Object.assign(scene, sceneAudioSrcs(exercise.context));
  }

  return {
    scene,
    keyPhrases: keyPhraseAudioSrcs(lesson.keyPhrases),
    options: exerciseOptionAudioSrcs(lesson),
  };
}
