import type { BuildExercise, ExerciseFeedback } from "$lib/learning/types";

export interface BuildMaterializedTask {
  prompt: string;
  answer: string[];
  tiles: string[];
  feedback: ExerciseFeedback;
}

export interface BuildTemplate {
  id: string;
  materialize: (rng: () => number) => BuildMaterializedTask;
}

export type MaterializedBuildExercise = Omit<
  BuildExercise,
  "type" | "id" | "practiceItemId"
>;
