import type { LessonSceneArtId } from "$lib/lesson-story/story-settings";

/**
 * Where a stick-figure scene plays: a lesson story's place, the podcast's
 * studio, the street with the tram stop, or a kitchen, which no lesson has yet.
 */
export type StageSetting = LessonSceneArtId | "kitchen" | "street" | "studio";
