import items from "../../../../content/level-test/items.json";
import type { AudioKind } from "../audio/core";
import type { LessonCharacterId } from "../lessons/character-ids";

import { LISTENING_NARRATOR, listeningSets } from "./listening";

/** Every clip the level test plays, for the audio generator and the bank. */
export interface LevelTestClip {
  text: string;
  kind: AudioKind;
  characterId?: LessonCharacterId;
}

export function levelTestClips(): LevelTestClip[] {
  const clips: LevelTestClip[] = items.listenSelect.map((item) => ({
    text: item.word,
    kind: "lemma",
  }));

  // Dictionary examples, but listed here too: once an example is rewritten, the
  // dictionary drops its clip while Listen and Type still plays it.
  for (const item of items.listenType) clips.push({ text: item.text, kind: "example" });

  for (const set of listeningSets) {
    clips.push({
      text: set.scenario.text,
      kind: "lesson",
      characterId: LISTENING_NARRATOR,
    });
    for (const turn of set.turns) {
      clips.push({ text: turn.line.text, kind: "lesson", characterId: set.partner });
    }
  }

  return clips;
}
