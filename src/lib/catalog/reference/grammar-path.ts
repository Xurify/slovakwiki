import { sentenceCase } from "../search/ui";
import type { CaseTopic, GrammarTopic } from "../types";
import { caseTopics } from "./cases";
import { grammarEntries } from "./grammar";

export type GrammarGroup = GrammarTopic["pathGroup"];

/** Reading order: follows the `nextSlug` chain from gender through questions, then numbers. */
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

export function grammarGroupAnchor(group: GrammarGroup): string {
  return `group-${group.toLowerCase().replace(/\s+/g, "-")}`;
}

export function grammarTopicsInGroup(group: GrammarGroup): GrammarTopic[] {
  return grammarEntries
    .filter((topic) => topic.pathGroup === group)
    .sort((a, b) => a.order - b.order);
}

export type GrammarTopicLink = {
  href: string;
  slovak: string;
  title: string;
};

function topicLink(topic: GrammarTopic): GrammarTopicLink {
  return {
    href: `/grammar/${topic.slug}`,
    slovak: topic.slovak,
    title: sentenceCase(topic.english),
  };
}

export function grammarTopicPosition(topic: GrammarTopic): {
  step: number;
  total: number;
} {
  const inGroup = grammarTopicsInGroup(topic.pathGroup);
  return {
    step: inGroup.findIndex((entry) => entry.slug === topic.slug) + 1,
    total: inGroup.length,
  };
}

export type ReferenceNeighbors = {
  next: GrammarTopicLink | null;
  previous: GrammarTopicLink | null;
};

export function grammarNeighbors(topic: GrammarTopic): ReferenceNeighbors {
  const next = topic.nextSlug
    ? grammarEntries.find((entry) => entry.slug === topic.nextSlug)
    : undefined;
  const previous = grammarEntries.find((entry) => entry.nextSlug === topic.slug);

  return {
    next: next ? topicLink(next) : null,
    previous: previous ? topicLink(previous) : null,
  };
}

function caseLink(topic: CaseTopic): GrammarTopicLink {
  return {
    href: `/grammar/cases/${topic.slug}`,
    slovak: topic.question,
    title: topic.name,
  };
}

export function caseNeighbors(topic: CaseTopic): ReferenceNeighbors {
  const index = caseTopics.findIndex((entry) => entry.slug === topic.slug);
  const next = index >= 0 ? caseTopics[index + 1] : undefined;
  const previous = index > 0 ? caseTopics[index - 1] : undefined;

  return {
    next: next ? caseLink(next) : null,
    previous: previous ? caseLink(previous) : null,
  };
}
