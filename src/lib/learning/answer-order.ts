import type {
  DialogueTurn,
  Lesson,
  LessonExercise,
  PracticeItem,
} from "$lib/learning/types";

/**
 * A fixed order for `items` from `seed`: the same on the server and in the
 * browser, and on every visit, so a retry is not a new puzzle.
 */
export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  let state = [...seed].reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 7);
  const random = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };

  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swap]] = [shuffled[swap]!, shuffled[index]!];
  }
  return shuffled;
}

// Authors write the right answer first; shown that way, pressing 1 passed 41
// of 45 lesson choices and every dialogue gate.
function mixExercise<T extends LessonExercise | PracticeItem["task"]>(exercise: T): T {
  if (exercise.type === "choice" || exercise.type === "selectAll") {
    return { ...exercise, choices: seededShuffle(exercise.choices, exercise.id) };
  }
  return exercise;
}

function mixTurn(turn: DialogueTurn): DialogueTurn {
  if (!turn.sayChoices) return turn;
  return {
    ...turn,
    sayChoices: {
      ...turn.sayChoices,
      choices: seededShuffle(turn.sayChoices.choices, turn.id),
    },
  };
}

export function mixLessonAnswers(lesson: Lesson): Lesson {
  return {
    ...lesson,
    scene: lesson.scene.map(mixTurn),
    beats: lesson.beats.map((beat) => ({
      ...beat,
      exercises: beat.exercises.map((exercise) => {
        const mixed = mixExercise(exercise);
        return "context" in mixed && mixed.context
          ? { ...mixed, context: mixed.context.map(mixTurn) }
          : mixed;
      }),
    })),
  };
}

export function mixPracticeAnswers(item: PracticeItem): PracticeItem {
  return { ...item, task: mixExercise(item.task) };
}
