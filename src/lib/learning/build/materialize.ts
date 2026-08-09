import type { PracticeItem } from "$lib/learning/types";
import { shuffleArray } from "$lib/learning/time/clock";

import { buildTemplateForItem } from "./registry";
import type { BuildMaterializedTask } from "./types";

export function buildTileBank(
  answer: readonly string[],
  distractors: readonly string[],
  rng: () => number,
): string[] {
  return shuffleArray([...answer, ...distractors], rng);
}

export function materializeBuildTask(
  itemId: string,
  _taskId: string,
  rng: () => number = Math.random,
): BuildMaterializedTask | null {
  const template = buildTemplateForItem(itemId);
  if (!template) return null;
  return template.materialize(rng);
}

export function materializeBuildItem(
  catalogItem: PracticeItem,
  rng: () => number = Math.random,
): PracticeItem {
  const materialized = materializeBuildTask(
    catalogItem.id,
    catalogItem.task.id,
    rng,
  );
  if (!materialized) return catalogItem;

  return {
    ...catalogItem,
    task: {
      ...catalogItem.task,
      id: `generated-${catalogItem.id}`,
      type: "build",
      practiceItemId: catalogItem.id,
      prompt: materialized.prompt,
      tiles: materialized.tiles,
      answer: materialized.answer,
      feedback: materialized.feedback,
    },
    feedback: materialized.feedback,
  };
}

export function maybeMaterializeBuildItem(
  item: PracticeItem,
  rng: () => number = Math.random,
): PracticeItem {
  if (item.task.type !== "build") return item;
  if (!buildTemplateForItem(item.id)) return item;
  return materializeBuildItem(item, rng);
}
