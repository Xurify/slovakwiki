import { grammarEntries } from "./grammar";
import type { GrammarTopic } from "../types";

export type GrammarGroup = GrammarTopic["pathGroup"];

export const grammarGroups: readonly GrammarGroup[] = [
  "Nouns",
  "Verbs",
  "Sentence building",
  "Numbers",
];

export const grammarGroupPurpose: Record<GrammarGroup, string> = {
  Nouns: "Gender and cases — how nouns change in a sentence.",
  Verbs: "Present forms, byť / mať, and aspect pairs.",
  "Sentence building": "Word order, formality, negation, and questions.",
  Numbers: "Counting, quantity agreement, and clock time.",
};

export const grammarGroupAnchor: Record<GrammarGroup, string> = {
  Nouns: "group-nouns",
  Verbs: "group-verbs",
  "Sentence building": "group-sentence-building",
  Numbers: "group-numbers",
};

export function grammarTopicsInGroup(group: GrammarGroup): GrammarTopic[] {
  return grammarEntries
    .filter((topic) => topic.pathGroup === group)
    .toSorted((first, second) => first.order - second.order);
}

/** Every topic in index order: area by area, then by `order` inside the area. */
export const grammarReadingOrder: readonly GrammarTopic[] =
  grammarGroups.flatMap(grammarTopicsInGroup);

export interface GrammarNeighbors {
  previous?: GrammarTopic;
  next?: GrammarTopic;
}

export function grammarNeighbors(slug: string): GrammarNeighbors {
  const index = grammarReadingOrder.findIndex((topic) => topic.slug === slug);
  if (index === -1) return {};

  return {
    previous: grammarReadingOrder[index - 1],
    next: grammarReadingOrder[index + 1],
  };
}
