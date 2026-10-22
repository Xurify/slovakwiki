import type { DialogueTurn, KeyPhrase } from "$lib/learning/types";

export interface ListeningCheck {
  answerId: string;
  choices: Array<{
    id: string;
    label: string;
    whyWrong?: string;
  }>;
  feedback: {
    english?: string;
    why: string;
  };
  id: string;
  prompt: string;
  promptSk?: string;
  replayLineId?: string;
}

export interface ListeningChapter {
  checks: ListeningCheck[];
  id: string;
  lines: DialogueTurn[];
  title: string;
  titleSk: string;
}

export interface EpisodeNextSteps {
  grammarHref: string;
  lessonHref?: string;
  practiceHref?: string;
}

export interface ListeningEpisode {
  chapters: ListeningChapter[];
  grammarSlug: string;
  speakers: string[];
  id: string;
  lessonId?: string;
  level: string;
  number: number;
  practiceSetId?: string;
  promise: string;
  slug: string;
  title: string;
  titleSk: string;
  topic: string;
  vocabulary: KeyPhrase[];
}
