import type { ItemResponse, ProductionKind, ReadAloudItem } from "$lib/level-test/types";

/** An answer that still needs the server: speech-to-text, AI scoring, or both. */
export interface ProductionDraft {
  kind: ProductionKind;
  skill: "writing" | "speaking";
  prompt: string;
  response?: string;
  audio?: Blob;
  seconds?: number;
  imageUrl?: string;
  contentKey?: string[];
}

export interface StepResult {
  responses: ItemResponse[];
  production?: ProductionDraft[];
  readAloud?: { item: ReadAloudItem; audio: Blob };
}

export type StepDone = (result: StepResult) => void;
