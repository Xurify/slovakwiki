import { describe, expect, it } from "vitest";

import audioConfig from "../../../content/audio/config.json";
import {
  characterIdForSpeaker,
  LESSON_CHARACTER_IDS,
  listedAudioSpeakers,
  listedCharacters,
} from "$lib/content/character-ids";
import { lessons } from "$lib/content/lessons";
import { practiceItems } from "$lib/content/practice";
import { lessonExercises } from "$lib/learning/lesson-beats";
import type { DialogueTurn, LessonExercise } from "$lib/learning/types";
import { storyCastForId, storyCastForSpeaker } from "$lib/lessons/story-cast";

const CHARACTER_KINDS = new Set(["oneOff", "recurring", "system"]);

function speakersFromTurns(turns: DialogueTurn[] | undefined, found: Set<string>): void {
  for (const turn of turns ?? []) {
    found.add(turn.speaker);
  }
}

function speakersFromExercises(
  exercises: LessonExercise[] | undefined,
  found: Set<string>,
): void {
  for (const exercise of exercises ?? []) {
    if ("context" in exercise) {
      speakersFromTurns(exercise.context, found);
    }
  }
}

function collectContentSpeakers(): string[] {
  const found = new Set<string>();

  for (const lesson of lessons) {
    speakersFromTurns(lesson.scene, found);
    speakersFromExercises(lessonExercises(lesson), found);
  }

  for (const item of practiceItems) {
    speakersFromTurns(item.task.context, found);
  }

  return [...found].sort();
}

describe("character ids from audio config", () => {
  it("maps every listed speaker to its roster id", () => {
    const rows = listedAudioSpeakers();
    expect(rows.length).toBeGreaterThan(0);

    for (const { speaker, id } of rows) {
      expect(characterIdForSpeaker(speaker)).toBe(id);
      expect(storyCastForSpeaker(speaker).id).toBe(id);
    }
  });

  it("lists every roster id with a portrait style, kind, and blurb", () => {
    const roster = listedCharacters();
    expect(roster.map((character) => character.id)).toEqual([...LESSON_CHARACTER_IDS]);

    for (const character of roster) {
      expect(storyCastForId(character.id).id).toBe(character.id);
      expect(CHARACTER_KINDS.has(character.kind)).toBe(true);
      expect(character.blurb.length).toBeGreaterThan(8);
    }
  });

  it("keeps dictionary defaults aligned with defaultCharacterId", () => {
    expect(audioConfig.defaultCharacterId).toBe("narrator");

    const host = audioConfig.characters.narrator;
    expect(host).toBeDefined();
    expect(audioConfig.voiceId).toBe(host.voiceId);
    expect(audioConfig.voiceName).toBe(host.voiceName);
    expect(host.gender).toBe("female");
  });

  it("gives lucia and marek their own voices", () => {
    const { anna, alex, lucia, marek } = audioConfig.characters;
    expect(lucia.voiceId).not.toBe(anna.voiceId);
    expect(marek.voiceId).not.toBe(alex.voiceId);
  });

  it("does not reuse a speaker label across characters", () => {
    const seen = new Map<string, string>();

    for (const { id, speaker } of listedAudioSpeakers()) {
      const previous = seen.get(speaker);
      expect(previous, `speaker "${speaker}" on ${id} and ${previous}`).toBeUndefined();
      seen.set(speaker, id);
    }
  });

  it("maps every lesson and practice speaker without the unknown fallback", () => {
    const bySpeaker = new Map(
      listedAudioSpeakers().map((row) => [row.speaker, row.id] as const),
    );

    for (const speaker of collectContentSpeakers()) {
      expect(bySpeaker.has(speaker), `unmapped speaker "${speaker}"`).toBe(true);
      expect(characterIdForSpeaker(speaker)).toBe(bySpeaker.get(speaker));
    }
  });

  it("falls unknown speakers back to narrator", () => {
    expect(characterIdForSpeaker("UnknownPerson")).toBe("narrator");
    expect(storyCastForSpeaker("UnknownPerson").id).toBe("narrator");
    expect(storyCastForSpeaker("You").id).toBe("alex");
    expect(storyCastForSpeaker("You").side).toBe("you");
  });
});
