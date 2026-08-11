import type {
  DialogueTurn,
  Lesson,
  LessonBeat,
  LessonBeatTeach,
  LessonExercise,
} from "./types";

/** Flat list of every exercise in beat order (completion, audio, tests). */
export function lessonExercises(lesson: Lesson): LessonExercise[] {
  return lesson.beats.flatMap((beat) => beat.exercises);
}

export function beatCount(lesson: Lesson): number {
  return lesson.beats.length;
}

export function exerciseCount(lesson: Lesson): number {
  return lessonExercises(lesson).length;
}

/** Scene line ids highlighted for the active beat (teach + all prior beats). */
export function highlightedSceneLineIds(
  lesson: Lesson,
  activeBeatIndex: number,
): Set<string> {
  const ids = new Set<string>();

  for (let index = 0; index <= activeBeatIndex; index += 1) {
    const beat = lesson.beats[index];
    if (!beat) continue;
    for (const lineId of beat.teach.sceneLineIds ?? []) {
      ids.add(lineId);
    }
  }

  return ids;
}

export function sceneLineById(
  scene: DialogueTurn[],
  lineId: string,
): DialogueTurn | undefined {
  return scene.find((line) => line.id === lineId);
}

export function beatSceneLines(beat: LessonBeat, scene: DialogueTurn[]): DialogueTurn[] {
  return teachSceneLines(beat.teach, scene);
}

export function teachSceneLines(
  teach: LessonBeatTeach,
  scene: DialogueTurn[],
): DialogueTurn[] {
  const ids = teach.sceneLineIds ?? [];
  if (!ids.length) return [];

  return ids
    .map((id) => sceneLineById(scene, id))
    .filter((line): line is DialogueTurn => line !== undefined);
}

export type BeatStatus = "current" | "done" | "todo";

export function beatStatus(
  beatIndex: number,
  activeBeatIndex: number,
  completedBeatIndexes: ReadonlySet<number>,
): BeatStatus {
  if (completedBeatIndexes.has(beatIndex)) return "done";
  if (beatIndex === activeBeatIndex) return "current";
  return "todo";
}
