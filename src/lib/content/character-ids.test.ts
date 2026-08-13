import { describe, expect, it } from "vitest";

import {
  characterIdForSpeaker,
  LESSON_CHARACTER_IDS,
  listedAudioSpeakers,
  listedCharacters,
} from "$lib/content/character-ids";
import { storyCastForId, storyCastForSpeaker } from "$lib/lessons/story-cast";

describe("character ids from audio config", () => {
  it("maps every listed speaker to its roster id", () => {
    const rows = listedAudioSpeakers();
    expect(rows.length).toBeGreaterThan(0);

    for (const { speaker, id } of rows) {
      expect(characterIdForSpeaker(speaker)).toBe(id);
      expect(storyCastForSpeaker(speaker).id).toBe(id);
    }
  });

  it("lists every roster id with a portrait style", () => {
    const ids = listedCharacters().map((character) => character.id);
    expect(ids).toEqual([...LESSON_CHARACTER_IDS]);

    for (const id of LESSON_CHARACTER_IDS) {
      expect(storyCastForId(id).id).toBe(id);
    }
  });

  it("falls unknown speakers back to narrator", () => {
    expect(characterIdForSpeaker("Marta")).toBe("narrator");
    expect(storyCastForSpeaker("Marta").id).toBe("narrator");
    expect(storyCastForSpeaker("You").id).toBe("alex");
    expect(storyCastForSpeaker("You").side).toBe("you");
  });
});
