import {
  characterIdForSpeaker,
  listedCharacters,
  type LessonCharacterId,
} from "$lib/catalog/lessons/character-ids";
import { dialogueSpeakerLabel } from "$lib/components/practice/dialogue-speaker";
import { STICK_GESTURE_IDS, type StickGestureId } from "./gestures";
import { gestureForLine } from "./line-gesture";
import { lineSentences } from "./line-plan";

export interface ScriptLine {
  characterId: LessonCharacterId;
  /** Present when a `[gesture]` tag overrides a sentence. */
  gestures?: StickGestureId[];
  id: string;
  slovak: string;
  speaker: string;
}

export interface ScriptProblem {
  /** 1-based line in the script. */
  line: number;
  message: string;
}

const LEADING_TAG = /^\[([^\]]*)\]\s*/;
const TAG = /\[[^\]]*\]/;
const ANY_TAG = /\[[^\]]*\]\s*/g;

function isGesture(value: string): value is StickGestureId {
  return (STICK_GESTURE_IDS as readonly string[]).includes(value);
}

/**
 * Read a draft dialogue, one `Speaker: line` per row, before it has audio.
 * A `[gesture]` tag at the start of a sentence overrides the gesture picked
 * from its text: `You: Nie, ďakujem. [point] Tam je pošta.`
 */
export function parseScript(text: string): {
  lines: ScriptLine[];
  problems: ScriptProblem[];
} {
  const castSpeakers = new Set(
    listedCharacters().flatMap((character) => character.speakers),
  );
  const lines: ScriptLine[] = [];
  const problems: ScriptProblem[] = [];

  text.split("\n").forEach((row, index) => {
    const line = index + 1;
    if (!row.trim()) return;

    const match = /^([^:]+):(.*)$/.exec(row);
    if (!match) {
      problems.push({ line, message: "Write it as Speaker: line" });
      return;
    }

    const speaker = match[1].trim();
    const body = match[2].trim();
    const system = dialogueSpeakerLabel(speaker) === null;
    if (!system && !castSpeakers.has(speaker)) {
      problems.push({
        line,
        message: `${speaker} is not in the cast, so the narrator speaks`,
      });
    }

    const overrides: Array<StickGestureId | undefined> = [];
    for (const sentence of lineSentences(body)) {
      const tag = LEADING_TAG.exec(sentence)?.[1];
      const rest = sentence.replace(LEADING_TAG, "");

      if (tag !== undefined && !isGesture(tag)) {
        problems.push({ line, message: `[${tag}] is not a gesture` });
      }
      if (TAG.test(rest)) {
        problems.push({ line, message: "Put a [gesture] at the start of its sentence" });
      }

      if (!/\p{L}/u.test(rest.replace(ANY_TAG, ""))) {
        problems.push({ line, message: "A [gesture] needs a sentence after it" });
        continue;
      }
      overrides.push(tag !== undefined && isGesture(tag) ? tag : undefined);
    }

    const slovak = body.replace(ANY_TAG, "").replace(/\s+/g, " ").trim();
    if (!/\p{L}/u.test(slovak)) {
      problems.push({ line, message: `${speaker} has no line` });
      return;
    }

    const sentences = lineSentences(slovak);
    const last = overrides.findLastIndex((gesture) => gesture !== undefined);
    const gestures =
      last === -1
        ? undefined
        : sentences
            .slice(0, last + 1)
            .map((sentence, i) => overrides[i] ?? gestureForLine(sentence));

    lines.push({
      characterId: characterIdForSpeaker(speaker),
      gestures,
      id: `script-${line}`,
      slovak,
      speaker,
    });
  });

  return { lines, problems };
}

/** The draft as a lesson `scene` array to paste into `src/lib/catalog/lessons/`. */
export function sceneSnippet(lines: ScriptLine[]): string {
  const turns = lines.map((line, index) => {
    const fields = [
      `id: ${JSON.stringify(`new-scene-${index + 1}`)}`,
      `speaker: ${JSON.stringify(line.speaker)}`,
      `slovak: ${JSON.stringify(line.slovak)}`,
      `english: ""`,
    ];
    if (line.gestures) fields.push(`gestures: ${JSON.stringify(line.gestures)}`);
    return `  {\n${fields.map((field) => `    ${field},`).join("\n")}\n  },`;
  });

  return [
    "// Ids must start with the lesson slug; fill in english.",
    "scene: [",
    ...turns,
    "],",
  ].join("\n");
}
