import { estimateAbility } from "./estimate";
import { GUESS_FOR_FORMAT, SKILL_FOR_FORMAT, pickNearest } from "./plan";
import {
  pickAdaptiveItem,
  pickClosestSet,
  pickListenSelect,
  pickReadSelect,
} from "./select";
import type {
  AdaptiveFormat,
  AdaptiveItem,
  FillBlankItem,
  InteractiveListeningSet,
  InteractiveReadingSet,
  ItemResponse,
  LevelTestBank,
  ListenSelectItem,
  ListenTypeItem,
  PhotoPrompt,
  PlanStep,
  PlannedTask,
  ReadAloudItem,
  ReadCompleteItem,
  ReadSelectItem,
  SpeakingPrompt,
  StudyArea,
  WordTag,
  WritingPrompt,
} from "./types";

export type StepContent =
  | { kind: "readSelect"; item: ReadSelectItem }
  | { kind: "listenSelect"; items: ListenSelectItem[] }
  | { kind: "fillBlank"; item: FillBlankItem }
  | { kind: "readComplete"; item: ReadCompleteItem }
  | { kind: "listenType"; item: ListenTypeItem }
  | { kind: "interactiveReading"; set: InteractiveReadingSet }
  | { kind: "interactiveListening"; set: InteractiveListeningSet }
  | { kind: "writePhoto"; photo: PhotoPrompt }
  | { kind: "interactiveWriting"; prompt: WritingPrompt }
  | { kind: "writingSample"; prompt: WritingPrompt }
  | { kind: "readAloud"; item: ReadAloudItem }
  | { kind: "speakPhoto"; photo: PhotoPrompt }
  | { kind: "readThenSpeak"; prompt: SpeakingPrompt }
  | { kind: "speakingSample"; prompt: SpeakingPrompt }
  | { kind: "planned"; tasks: PlannedTask[] };

export interface Picker {
  used: Set<string>;
  /** Real words minus pseudowords shown so far in Read and Select. */
  balance: number;
  random: () => number;
}

function pickUnused<T extends { id: string }>(
  pool: readonly T[],
  picker: Picker,
): T | undefined {
  const fresh = pool.filter((entry) => !picker.used.has(entry.id));
  return fresh[Math.floor(picker.random() * fresh.length)];
}

function take<T extends { id: string }>(
  entry: T | undefined,
  picker: Picker,
): T | undefined {
  if (entry) picker.used.add(entry.id);
  return entry;
}

/**
 * Turn a planned step into concrete content at the learner's current level.
 * Returns null when the bank has nothing for it (e.g. Listen and Select before
 * its pseudoword clips are generated) so the runner can skip the step.
 */
export function resolveStep(
  bank: LevelTestBank,
  step: PlanStep,
  theta: number,
  picker: Picker,
): StepContent | null {
  const target = step.calibration ?? theta;

  switch (step.kind) {
    case "readSelect": {
      const item = take(
        pickReadSelect(bank.adaptive, target, picker.used, picker.balance, picker.random),
        picker,
      );
      if (!item) return null;
      picker.balance += item.real ? 1 : -1;
      return { kind: "readSelect", item };
    }
    case "listenSelect": {
      const items = pickListenSelect(bank.adaptive, target, picker.used, picker.random);
      if (items.length < 2) return null;
      for (const item of items) picker.used.add(item.id);
      return { kind: "listenSelect", items };
    }
    case "fillBlank":
    case "readComplete":
    case "listenType": {
      const item = take(
        pickAdaptiveItem(bank.adaptive, step.kind, target, picker.used, picker.random),
        picker,
      );
      if (!item) return null;
      return { kind: step.kind, item } as StepContent;
    }
    case "interactiveReading": {
      const set = pickClosestSet(bank.interactiveReading, target);
      return set ? { kind: "interactiveReading", set } : null;
    }
    case "interactiveListening": {
      const set = pickClosestSet(bank.interactiveListening, target);
      return set ? { kind: "interactiveListening", set } : null;
    }
    case "writePhoto":
    case "speakPhoto": {
      const photo = take(pickUnused(bank.photos, picker), picker);
      return photo ? { kind: step.kind, photo } : null;
    }
    case "interactiveWriting": {
      const prompt = take(pickUnused(bank.interactiveWriting, picker), picker);
      return prompt ? { kind: "interactiveWriting", prompt } : null;
    }
    case "writingSample": {
      const prompt = take(pickUnused(bank.writingSamples, picker), picker);
      return prompt ? { kind: "writingSample", prompt } : null;
    }
    case "readAloud": {
      const item = take(
        pickNearest(bank.readAloud, target, picker.used, picker.random),
        picker,
      );
      return item ? { kind: "readAloud", item } : null;
    }
    case "readThenSpeak": {
      const prompt = take(pickUnused(bank.readThenSpeak, picker), picker);
      return prompt ? { kind: "readThenSpeak", prompt } : null;
    }
    case "speakingSample": {
      const prompt = take(pickUnused(bank.speakingSamples, picker), picker);
      return prompt ? { kind: "speakingSample", prompt } : null;
    }
    case "planned":
      return { kind: "planned", tasks: step.planned ?? [] };
  }
}

/** The adaptive target: one ability across everything read or heard so far. */
export function currentTheta(responses: readonly ItemResponse[]): number {
  return estimateAbility(
    responses.filter(
      (response) => response.skill === "reading" || response.skill === "listening",
    ),
  ).theta;
}

/** A typed answer: kept so the results can show it and check its accents. */
export interface TypedAnswer {
  expected: string;
  given: string;
  tag?: WordTag;
}

export function areaForTag(tag: WordTag | undefined): StudyArea {
  switch (tag?.class) {
    case "noun":
      return "nouns";
    case "verb":
      return "verbs";
    case "adjective":
      return "adjectives";
    case "functionWord":
      return "functionWords";
    default:
      return "vocabulary";
  }
}

function evidence(item: AdaptiveItem, typed?: TypedAnswer): Partial<ItemResponse> {
  switch (item.format) {
    case "readSelect":
    case "listenSelect":
      return {
        area: "vocabulary",
        word: {
          text: item.word,
          real: item.real,
          slug: item.slug,
          english: item.english,
        },
      };
    case "listenType":
      return { area: "listening", ...typed };
    default:
      return { area: areaForTag(typed?.tag), ...typed };
  }
}

export function adaptiveResponse(
  item: AdaptiveItem,
  score: number,
  difficulty: number = item.difficulty,
  suffix = "",
  typed?: TypedAnswer,
): ItemResponse {
  const format: AdaptiveFormat = item.format;
  return {
    itemId: `${item.id}${suffix}`,
    kind: format,
    skill: SKILL_FOR_FORMAT[format],
    difficulty,
    score,
    guess: GUESS_FOR_FORMAT[format],
    adaptive: true,
    ...evidence(item, typed),
  };
}

/** Responses from the interactive sections and Read Aloud, which also feed the estimate. */
export function taskResponse(
  itemId: string,
  kind: string,
  skill: ItemResponse["skill"],
  difficulty: number,
  score: number,
  guess?: number,
): ItemResponse {
  const area: StudyArea | undefined =
    skill === "reading" || skill === "listening" ? skill : undefined;
  return { itemId, kind, skill, difficulty, score, guess, adaptive: false, area };
}
