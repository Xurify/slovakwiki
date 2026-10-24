import { describe, expect, it } from "vitest";

import { spokenText } from "../audio/core";
import { grammarEntries } from "../entries";
import { characterIdForSpeaker, listedAudioSpeakers } from "../lessons/character-ids";
import { lessonById } from "../lessons";
import { practiceSetById } from "../practice";
import {
  episodeCheckCount,
  episodeForGrammarSlug,
  episodeLines,
  episodeMinutes,
  episodePath,
  listeningEpisodes,
  validateListeningEpisodes,
} from "./index";

describe("listening episodes", () => {
  it("validate", () => {
    expect(validateListeningEpisodes()).toEqual([]);
  });

  it("link to pages that exist", () => {
    const grammarSlugs = new Set(grammarEntries.map((entry) => entry.slug));

    for (const episode of listeningEpisodes) {
      expect(grammarSlugs.has(episode.grammarSlug), episode.grammarSlug).toBe(true);
      if (episode.lessonId) expect(lessonById.has(episode.lessonId)).toBe(true);
      if (episode.practiceSetId) {
        expect(practiceSetById.has(episode.practiceSetId)).toBe(true);
      }
      expect(episodeForGrammarSlug(episode.grammarSlug)).toBe(episode);
      expect(episodePath(episode)).toBe(`/listening/${episode.slug}`);
    }
  });

  it("gives every speaker a voice of their own, never the narrator fallback", () => {
    const listed = new Set(listedAudioSpeakers().map((row) => row.speaker));

    for (const line of listeningEpisodes.flatMap(episodeLines)) {
      expect(listed.has(line.speaker), `speaker ${line.speaker}`).toBe(true);
      expect(characterIdForSpeaker(line.speaker)).not.toBe("narrator");
    }
  });

  it("says each line as it is written, its pauses aside", () => {
    for (const line of listeningEpisodes.flatMap(episodeLines)) {
      if (!line.audio) continue;
      expect(spokenText(line.audio.transcript), line.id).toBe(line.slovak);
    }
  });

  it("keeps marks inside the spoken line", () => {
    for (const line of listeningEpisodes.flatMap(episodeLines)) {
      for (const mark of line.marks ?? []) {
        expect(mark.start).toBeGreaterThanOrEqual(0);
        expect(mark.end).toBeLessThanOrEqual(line.slovak.length);
        expect(mark.start).toBeLessThan(mark.end);
      }
    }
  });

  it("is a short A1 listen with a handful of checks", () => {
    const [episode] = listeningEpisodes;
    expect(episode).toBeDefined();
    if (!episode) return;

    expect(episodeMinutes(episode)).toBeGreaterThanOrEqual(1);
    expect(episodeMinutes(episode)).toBeLessThanOrEqual(6);
    expect(episodeCheckCount(episode)).toBeGreaterThanOrEqual(5);
  });
});
