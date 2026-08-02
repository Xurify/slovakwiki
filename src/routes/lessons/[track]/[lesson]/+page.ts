import { error } from "@sveltejs/kit";

import { lessons } from "$lib/content/lessons";
import type { LessonTrackId } from "$lib/content/learning-types";

export function entries(): Array<{ lesson: string; track: LessonTrackId }> {
  return lessons.map((lesson) => ({ lesson: lesson.slug, track: lesson.track }));
}

export function load({ params }) {
  const lesson = lessons.find(
    (item) => item.track === params.track && item.slug === params.lesson,
  );
  if (!lesson) error(404, "Lesson not found");

  return { lesson };
}
