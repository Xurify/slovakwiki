import type { DialogueTurn } from "$lib/learning/types";
import { demonstrativesEpisode } from "./episodes/demonstratives";
import type { ListeningEpisode } from "./types";

export type {
  ListeningChapter,
  ListeningCheck,
  ListeningEpisode,
  ListeningHost,
} from "./types";

export const listeningEpisodes: ListeningEpisode[] = [demonstrativesEpisode];

export const episodeBySlug = new Map(
  listeningEpisodes.map((episode) => [episode.slug, episode]),
);

export function episodePath(episode: Pick<ListeningEpisode, "slug">): string {
  return `/listening/${episode.slug}`;
}

/** Every spoken line in chapter order. */
export function episodeLines(episode: ListeningEpisode): DialogueTurn[] {
  return episode.chapters.flatMap((chapter) => chapter.lines);
}

export function episodeCheckCount(episode: ListeningEpisode): number {
  return episode.chapters.reduce((sum, chapter) => sum + chapter.checks.length, 0);
}

/** Rough listening time: learner-paced speech runs near 90 words a minute. */
export function episodeMinutes(episode: ListeningEpisode): number {
  const words = episodeLines(episode).reduce(
    (sum, line) => sum + line.slovak.split(/\s+/).filter(Boolean).length,
    0,
  );
  return Math.max(1, Math.ceil(words / 90));
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

  for (const episode of listeningEpisodes) {
    claim(episode.id, episode.id);
    if (episodeBySlug.get(episode.slug) !== episode) {
      issues.push(`Duplicate slug: ${episode.slug}`);
    }

    const prefix = `podcast-${episode.slug}-`;
    const hosts = new Set(episode.hosts.map((host) => host.speaker));
    const spoken = new Set<string>();
    const lineIds = new Set(episodeLines(episode).map((line) => line.id));

    if (!episode.chapters.length) issues.push(`Missing chapters: ${episode.id}`);
    if (!episode.vocabulary.length) issues.push(`Missing vocabulary: ${episode.id}`);
    if (episodeCheckCount(episode) === 0) issues.push(`Missing checks: ${episode.id}`);

    for (const chapter of episode.chapters) {
      claim(chapter.id, episode.id);
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
        spoken.add(line.speaker);
        if (!hosts.has(line.speaker)) {
          issues.push(`Speaker ${line.speaker} in ${line.id} is not a listed host`);
        }
      }

      for (const check of chapter.checks) {
        claim(check.id, chapter.id);
        if (!check.id.startsWith(prefix)) {
          issues.push(`Check id ${check.id} must start with ${prefix}`);
        }
        if (!check.prompt.trim()) issues.push(`Check ${check.id} has no prompt`);
        if (check.promptSk !== undefined && !check.promptSk.includes("___")) {
          issues.push(`Check ${check.id} promptSk needs a ___ gap`);
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
        if (check.replayLineId && !lineIds.has(check.replayLineId)) {
          issues.push(`Check ${check.id} replays unknown line ${check.replayLineId}`);
        }
      }
    }

    for (const host of hosts) {
      if (!spoken.has(host)) issues.push(`Host ${host} never speaks in ${episode.id}`);
    }
  }

  return issues;
}
