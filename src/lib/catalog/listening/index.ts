import type { DialogueTurn } from "$lib/learning/types";
import { demonstrativesEpisode } from "./episodes/demonstratives";
import { pastTenseEpisode } from "./episodes/past-tense";
import { possessivesEpisode } from "./episodes/possessives";
import { tellingTimeEpisode } from "./episodes/telling-time";
import { whatBobikSaysEpisode } from "./episodes/what-bobik-says";
import type { ListeningChapter, ListeningEpisode } from "./types";

export type { ListeningChapter, ListeningCheck, ListeningEpisode } from "./types";

export const listeningEpisodes: ListeningEpisode[] = [
  demonstrativesEpisode,
  possessivesEpisode,
  tellingTimeEpisode,
  pastTenseEpisode,
  whatBobikSaysEpisode,
];

export const episodeBySlug = new Map(
  listeningEpisodes.map((episode) => [episode.slug, episode]),
);

export function episodePath(episode: Pick<ListeningEpisode, "slug">): string {
  return `/listening/${episode.slug}`;
}

export function episodeLines(episode: ListeningEpisode): DialogueTurn[] {
  return episode.chapters.flatMap((chapter) => chapter.lines);
}

export function episodeCheckCount(episode: ListeningEpisode): number {
  return episode.chapters.reduce((sum, chapter) => sum + chapter.checks.length, 0);
}

const WORDS_PER_MINUTE = 90;

export function episodeMinutes(episode: ListeningEpisode): number {
  const words = episodeLines(episode).reduce(
    (sum, line) => sum + line.slovak.split(/\s+/).filter(Boolean).length,
    0,
  );
  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
}

export function episodeForGrammarSlug(slug: string): ListeningEpisode | undefined {
  return listeningEpisodes.find((episode) => episode.grammarSlug === slug);
}

export function validateListeningEpisodes(): string[] {
  const issues: string[] = [];
  const ids = new Set<string>();

  function claim(id: string, where: string): void {
    if (ids.has(id)) issues.push(`Duplicate id ${id} in ${where}`);
    ids.add(id);
  }

  function checkChapter(
    chapter: ListeningChapter,
    prefix: string,
    onSpeaker: (speaker: string, lineId: string) => void,
  ): void {
    const chapterLineIds = new Set(chapter.lines.map((line) => line.id));
    claim(chapter.id, chapter.id);
    if (!chapter.id.startsWith(prefix)) {
      issues.push(`Chapter id ${chapter.id} must start with ${prefix}`);
    }
    if (!chapter.lines.length) issues.push(`Empty chapter ${chapter.id}`);

    for (const line of chapter.lines) {
      claim(line.id, chapter.id);
      if (!line.id.startsWith(prefix)) {
        issues.push(`Line id ${line.id} must start with ${prefix}`);
      }
      if (!line.english.trim()) issues.push(`Line ${line.id} has no English`);
      onSpeaker(line.speaker, line.id);
    }

    for (const check of chapter.checks) {
      claim(check.id, chapter.id);
      if (!check.id.startsWith(prefix)) {
        issues.push(`Check id ${check.id} must start with ${prefix}`);
      }
      if (!check.prompt.trim()) issues.push(`Check ${check.id} has no prompt`);
      if (!check.promptEnglish.trim()) issues.push(`Check ${check.id} has no English`);
      if (check.gap !== undefined && !check.gap.includes("___")) {
        issues.push(`Check ${check.id} gap needs a ___`);
      }
      if (!check.choices.some((choice) => choice.id === check.answerId)) {
        issues.push(`Check ${check.id} answerId is not a choice`);
      }
      if (check.choices.length < 2) issues.push(`Check ${check.id} needs choices`);
      for (const choice of check.choices) {
        if (choice.id !== check.answerId && !choice.whyWrong?.trim()) {
          issues.push(`Check ${check.id} choice ${choice.id} needs whyWrong`);
        }
      }
      if (!check.feedback.why.includes("**")) {
        issues.push(`Check ${check.id} why needs a **bold** term`);
      }
      if (check.replayLineId && !chapterLineIds.has(check.replayLineId)) {
        issues.push(`Check ${check.id} replays unknown line ${check.replayLineId}`);
      }
    }
  }

  for (const episode of listeningEpisodes) {
    claim(episode.id, episode.id);
    if (episodeBySlug.get(episode.slug) !== episode) {
      issues.push(`Duplicate slug: ${episode.slug}`);
    }

    const prefix = `podcast-${episode.slug}-`;
    const hosts = new Set(episode.speakers);
    const spoken = new Set<string>();

    if (!episode.chapters.length) issues.push(`Missing chapters: ${episode.id}`);
    if (!episode.vocabulary.length) issues.push(`Missing vocabulary: ${episode.id}`);
    if (episodeCheckCount(episode) === 0) issues.push(`Missing checks: ${episode.id}`);

    for (const chapter of episode.chapters) {
      checkChapter(chapter, prefix, (speaker, lineId) => {
        spoken.add(speaker);
        if (!hosts.has(speaker)) {
          issues.push(`Speaker ${speaker} in ${lineId} is not in speakers`);
        }
      });
    }

    for (const host of hosts) {
      if (!spoken.has(host)) issues.push(`Speaker ${host} never speaks in ${episode.id}`);
    }
  }

  return issues;
}
