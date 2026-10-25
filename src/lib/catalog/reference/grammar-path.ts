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
  Verbs:
    "Present, past, and future; imperfective and perfective aspect, motion, commands, would, and sa / si.",
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

export interface GrammarStep {
  group: GrammarGroup;
  /** 1-based, numbered as on the grammar index. */
  step: number;
  total: number;
}

/** Where a topic sits in its area's path. */
export function grammarStep(topic: GrammarTopic): GrammarStep {
  const topics = grammarTopicsInGroup(topic.pathGroup);
  return {
    group: topic.pathGroup,
    step: topics.findIndex((entry) => entry.slug === topic.slug) + 1,
    total: topics.length,
  };
}
