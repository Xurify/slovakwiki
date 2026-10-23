import { audioHash } from "$lib/catalog/audio/core";
import { hasAudioClip } from "$lib/catalog/audio/manifest";
import { resolveDictionaryAudioSrc } from "$lib/catalog/audio/resolve-server";
import { dictionaryPathForLemmaId } from "$lib/catalog/dictionary/lemma-href";
import { words } from "$lib/catalog/entries";
import {
  storySettingForLesson,
  type LessonSceneArtId,
} from "$lib/lesson-story/story-settings";
import { PLACES } from "./places";
import type { StageSetting } from "./stage-setting";

/**
 * Lessons whose story setting does not fit their dialogue: the waiter offering
 * coffee and a menu is in a café, the receptionist checking Alex in is at the
 * front desk. Both are set "home" in story-settings.ts.
 */
const STAGE_SETTINGS: Record<string, LessonSceneArtId> = {
  "everyday/negation-in-conversation": "cafe",
  "grammar/byt-present": "registration",
};

export function stageSettingFor(lessonId: string): LessonSceneArtId {
  return STAGE_SETTINGS[lessonId] ?? storySettingForLesson(lessonId).art;
}

/** Podcast chapters that leave the studio. */
const CHAPTER_SETTINGS: Record<string, StageSetting> = {
  "podcast-demonstratives-home": "home",
  "podcast-demonstratives-market": "market",
};

export function chapterSettingFor(chapterId: string): StageSetting {
  return CHAPTER_SETTINGS[chapterId] ?? "studio";
}

/**
 * The dictionary page and lemma clip for each scene thing's word, where the
 * dictionary has it. Server only: clip URLs differ between dev and prod.
 */
export function sceneThingWords(): Record<string, { href?: string; src?: string }> {
  const found: Record<string, { href?: string; src?: string }> = {};

  for (const thing of Object.values(PLACES).flatMap((place) => place.things)) {
    if (thing.word in found) continue;

    const entry = words.find((word) => word.slovak === thing.word && word.gender);
    found[thing.word] = {
      href: entry ? dictionaryPathForLemmaId(entry.slug) : undefined,
      src: hasAudioClip(audioHash(thing.word))
        ? resolveDictionaryAudioSrc(thing.word, "lemma")
        : undefined,
    };
  }

  return found;
}
