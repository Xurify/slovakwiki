import { beatSceneLines } from "$lib/learning/beats";
import type {
  DialogueTurn,
  Lesson,
  LessonBeat,
  LessonExercise,
} from "$lib/learning/types";

export type LessonStep =
  | {
      beat: LessonBeat;
      beatIndex: number;
      chapter: number;
      id: string;
      /** The beat's lines played on the stage. */
      kind: "scene";
      lines: DialogueTurn[];
    }
  | {
      beat: LessonBeat;
      beatIndex: number;
      chapter: number;
      id: string;
      kind: "teach";
      /** The beat's lines, listed on the page when there is no stage to play them. */
      scene: DialogueTurn[];
    }
  | {
      beat: LessonBeat;
      beatIndex: number;
      chapter: number;
      exercise: LessonExercise;
      exerciseIndex: number;
      id: string;
      kind: "check";
    }
  | {
      chapter: number;
      id: string;
      /** The whole scene once more, with the learner saying Alex's lines. */
      kind: "finale";
    };

/** A run of steps under one title, shown as one piece of the progress bar. */
export interface LessonChapter {
  /** Index of its first step. */
  start: number;
  /** Steps in it. */
  length: number;
  title: string;
}

/** The title of the last chapter, where the learner plays the whole scene. */
export const FINALE_TITLE = "The whole scene";

/**
 * A lesson as chapters, one per beat: its lines on the stage, what to take
 * from them, then its checks. A staged lesson ends with the whole scene,
 * the learner saying Alex's lines. Without a stage (`staged` false) the
 * lines sit in the teach step instead.
 */
export function lessonSteps(lesson: Lesson, staged = false): LessonStep[] {
  const steps: LessonStep[] = [];

  for (const [beatIndex, beat] of lesson.beats.entries()) {
    const lines = beatSceneLines(beat, lesson.scene);
    const chapter = beatIndex;

    if (staged && lines.length) {
      steps.push({
        beat,
        beatIndex,
        chapter,
        id: `${beat.id}:scene`,
        kind: "scene",
        lines,
      });
    }

    const notes = Boolean(
      beat.teach.phrases?.length || beat.teach.note || beat.teach.visual,
    );
    if (notes || (!staged && lines.length)) {
      steps.push({
        beat,
        beatIndex,
        chapter,
        id: `${beat.id}:teach`,
        kind: "teach",
        scene: staged ? [] : lines,
      });
    }

    for (const [exerciseIndex, exercise] of beat.exercises.entries()) {
      steps.push({
        beat,
        beatIndex,
        chapter,
        exercise,
        exerciseIndex,
        id: exercise.id,
        kind: "check",
      });
    }
  }

  if (staged && lesson.scene.some((line) => line.sayChoices)) {
    steps.push({
      chapter: lesson.beats.length,
      id: `${lesson.id}:finale`,
      kind: "finale",
    });
  }

  return steps;
}

export function lessonChapters(
  lesson: Lesson,
  steps: readonly LessonStep[],
): LessonChapter[] {
  const chapters: LessonChapter[] = [];
  for (const [index, step] of steps.entries()) {
    const current = chapters[step.chapter];
    if (current) {
      current.length += 1;
      continue;
    }
    chapters[step.chapter] = {
      length: 1,
      start: index,
      title:
        step.kind === "finale" ? FINALE_TITLE : (lesson.beats[step.chapter]?.title ?? ""),
    };
  }
  return chapters.filter(Boolean);
}
