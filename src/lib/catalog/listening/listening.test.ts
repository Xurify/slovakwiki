import { describe, expect, it } from "vitest";

import { spokenText } from "../audio/core";
import { sceneAudioSrcs, sceneMouthTracks } from "../lessons/audio";
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
import { dialogueSpeakerLabel } from "$lib/components/practice/dialogue-speaker";

describe("listening episodes", () => {
  it("validate", () => {
    expect(validateListeningEpisodes()).toEqual([]);
  });

  it("link to pages that exist", () => {
    const grammarSlugs = new Set(grammarEntries.map((entry) => entry.slug));

    for (const episode of listeningEpisodes) {
      if (episode.grammarSlug) {
        expect(grammarSlugs.has(episode.grammarSlug), episode.grammarSlug).toBe(true);
        expect(episodeForGrammarSlug(episode.grammarSlug)).toBe(episode);
      }
      if (episode.lessonId) expect(lessonById.has(episode.lessonId)).toBe(true);
      if (episode.practiceSetId) {
        expect(practiceSetById.has(episode.practiceSetId)).toBe(true);
      }
      expect(episodePath(episode)).toBe(`/listening/${episode.slug}`);
    }
  });

  it("gives every speaker a voice of their own; only a scene card goes to the narrator", () => {
    const listed = new Set(listedAudioSpeakers().map((row) => row.speaker));

    for (const line of listeningEpisodes.flatMap(episodeLines)) {
      expect(listed.has(line.speaker), `speaker ${line.speaker}`).toBe(true);
      // A scene card ("Scene") is nobody's line, so the narrator reads it; a person's never is.
      if (dialogueSpeakerLabel(line.speaker) !== null) {
        expect(characterIdForSpeaker(line.speaker), line.id).not.toBe("narrator");
      }
    }
  });

  it("says each line as it is written, its pauses and stops aside", () => {
    const words = (text: string) => (text.match(/\p{L}+/gu) ?? []).join(" ");
    for (const line of listeningEpisodes.flatMap(episodeLines)) {
      if (!line.audio) continue;
      expect(words(spokenText(line.audio.transcript)), line.id).toBe(words(line.slovak));
    }
  });

  it("never directs a line slowly, or pauses at the edge of a clip", () => {
    for (const line of listeningEpisodes.flatMap(episodeLines)) {
      const said = line.audio?.transcript;
      if (!said) continue;
      // A slowed line came out as a whisper; a pause at a clip's edge makes next to none.
      expect(said, line.id).not.toMatch(/\[slowly\]/i);
      expect(said, line.id).not.toMatch(/^\s*\[pause\]|\[pause\]\s*$/i);
    }
  });

  it("has a clip and a current mouth track for every line, so the stage can say it", () => {
    for (const episode of listeningEpisodes) {
      for (const chapter of episode.chapters) {
        const srcs = sceneAudioSrcs(chapter.lines);
        const tracks = sceneMouthTracks(chapter.lines);
        for (const line of chapter.lines) {
          expect(srcs[line.id], `${line.id}: no clip; run generate.ts`).toBeDefined();
          expect(
            tracks[line.id]?.v,
            `${line.id}: no vowel track; run mouth.ts`,
          ).toBeDefined();
        }
      }
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

  it("asks the listener to play along only once they have heard the forms, and answers every ask", () => {
    for (const episode of listeningEpisodes) {
      episode.chapters.forEach((chapter, index) => {
        chapter.lines.forEach((line, at) => {
          if (!line.ask) return;
          expect(index, `${line.id} asks in an opening segment`).toBeGreaterThan(1);
          expect(
            line.ask.choices.map((choice) => choice.id),
            line.id,
          ).toContain(line.ask.answerId);
          expect(
            chapter.lines[at + 1],
            `${line.id} has nobody to answer it`,
          ).toBeDefined();
        });
      });
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
