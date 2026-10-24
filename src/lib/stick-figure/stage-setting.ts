import type { LessonSceneArtId } from "$lib/lesson-story/story-settings";

/**
 * Where a stick-figure scene plays: a lesson story's place, the podcast's
 * studio, or the street with the tram stop that no lesson has yet.
 */
export type StageSetting = LessonSceneArtId | "street" | "studio";
