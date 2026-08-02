import { error } from "@sveltejs/kit";

import { lessonTracks, lessonsForTrack } from "$lib/content/lessons";
import type { LessonTrackId } from "$lib/content/learning-types";

export function entries(): Array<{ track: LessonTrackId }> {
  return lessonTracks.map((track) => ({ track: track.id }));
}

export function load({ params }) {
  const track = lessonTracks.find((item) => item.id === params.track);
  if (!track) error(404, "Lesson track not found");

  return { track, lessons: lessonsForTrack(track.id) };
}
