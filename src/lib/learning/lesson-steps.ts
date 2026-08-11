import { beatSceneLines } from "$lib/learning/lesson-beats";
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
      id: string;
      kind: "teach";
      scene: DialogueTurn[];
    }
  | {
      beat: LessonBeat;
      beatIndex: number;
      exercise: LessonExercise;
      exerciseIndex: number;
      id: string;
      kind: "check";
    };

/** Linear teach → check steps for the immersive player. */
export function lessonSteps(lesson: Lesson): LessonStep[] {
  const steps: LessonStep[] = [];

  for (const [beatIndex, beat] of lesson.beats.entries()) {
    const scene = beatSceneLines(beat, lesson.scene);
    const hasTeach = Boolean(
      scene.length || beat.teach.phrases?.length || beat.teach.note || beat.teach.visual,
    );

    if (hasTeach) {
      steps.push({
        beat,
        beatIndex,
        id: `${beat.id}:teach`,
        kind: "teach",
        scene,
      });
    }

    for (const [exerciseIndex, exercise] of beat.exercises.entries()) {
      steps.push({
        beat,
        beatIndex,
        exercise,
        exerciseIndex,
        id: exercise.id,
        kind: "check",
      });
    }
  }

  return steps;
}

export function lessonStepCount(lesson: Lesson): number {
  return lessonSteps(lesson).length;
}
