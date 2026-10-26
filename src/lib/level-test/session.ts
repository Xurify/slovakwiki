import { areaForTag } from "./areas";
import { estimateAbility } from "./estimate";
import { GUESS_FOR_FORMAT, SKILL_FOR_FORMAT, itemsOfFormat, pickNearest } from "./plan";
import { CEFR_ANCHOR, type CefrLevel } from "./scale";
import {
  pickAdaptiveItem,
  pickClosestSet,
  pickFillBlank,
  pickListenLength,
  pickListenSelect,
  pickReadSelect,
  pickSentences,
} from "./select";
import type {
  AdaptiveFormat,
  AdaptiveItem,
  ChooseVerbItem,
  FillBlankItem,
  InteractiveListeningSet,
  InteractiveReadingSet,
  ItemResponse,
  LevelTestBank,
  ListenLengthItem,
  ListenSelectItem,
  ListenTypeItem,
  PhotoPrompt,
  PlaceCliticItem,
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
  | { kind: "listenLength"; items: ListenLengthItem[] }
  | { kind: "fillBlank"; item: FillBlankItem }
  | { kind: "readComplete"; item: ReadCompleteItem }
  | { kind: "listenType"; item: ListenTypeItem }
  | { kind: "chooseVerb"; items: ChooseVerbItem[] }
  | { kind: "placeClitic"; items: PlaceCliticItem[] }
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
  /** Items from earlier runs on this device: picked last, so a retake differs. */
  seen: ReadonlySet<string>;
  /** Answers so far per study area, so Fill in the Blanks can fill the thin ones. */
  coverage: Map<StudyArea, number>;
}

function pickUnused<T extends { id: string }>(
  pool: readonly T[],
  picker: Picker,
): T | undefined {
  const fresh = pool.filter((entry) => !picker.used.has(entry.id));
  const unseen = fresh.filter((entry) => !picker.seen.has(entry.id));
  const choices = unseen.length ? unseen : fresh;
  return choices[Math.floor(picker.random() * choices.length)];
}

/** A prompt far above the learner gets no answer worth scoring; one far below says little about them. */
function pickByLevel<T extends { id: string; level: CefrLevel }>(
  pool: readonly T[],
  target: number,
  picker: Picker,
): T | undefined {
  const fresh = pool.filter((entry) => !picker.used.has(entry.id));
  const distance = (entry: T) => Math.abs(CEFR_ANCHOR[entry.level] - target);
  const nearest = Math.min(...fresh.map(distance));
  return pickUnused(
    fresh.filter((entry) => distance(entry) === nearest),
    picker,
  );
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
        pickReadSelect(
          bank.adaptive,
          target,
          picker.used,
          picker.balance,
          picker.random,
          picker.seen,
        ),
        picker,
      );
      if (!item) return null;
      picker.balance += item.real ? 1 : -1;
      return { kind: "readSelect", item };
    }
    case "listenSelect": {
      const items = pickListenSelect(
        bank.adaptive,
        target,
        picker.used,
        picker.random,
        picker.seen,
      );
      if (items.length < 2) return null;
      for (const item of items) picker.used.add(item.id);
      return { kind: "listenSelect", items };
    }
    case "listenLength": {
      const items = pickListenLength(
        bank.adaptive,
        target,
        picker.used,
        picker.random,
        picker.seen,
      );
      if (items.length < 2) return null;
      for (const item of items) picker.used.add(item.id);
      return { kind: "listenLength", items };
    }
    case "chooseVerb": {
      const items = pickSentences(
        itemsOfFormat(bank.adaptive, "chooseVerb"),
        target,
        picker.used,
        picker.random,
        picker.seen,
      );
      if (!items.length) return null;
      for (const item of items) picker.used.add(item.id);
      return { kind: "chooseVerb", items };
    }
    case "placeClitic": {
      const items = pickSentences(
        itemsOfFormat(bank.adaptive, "placeClitic"),
        target,
        picker.used,
        picker.random,
        picker.seen,
      );
      if (!items.length) return null;
      for (const item of items) picker.used.add(item.id);
      return { kind: "placeClitic", items };
    }
    case "fillBlank": {
      const item = take(
        pickFillBlank(
          bank.adaptive,
          target,
          picker.used,
          picker.coverage,
          picker.random,
          picker.seen,
        ),
        picker,
      );
      return item ? { kind: "fillBlank", item } : null;
    }
    case "readComplete":
    case "listenType": {
      const item = take(
        pickAdaptiveItem(
          bank.adaptive,
          step.kind,
          target,
          picker.used,
          picker.random,
          picker.seen,
        ),
        picker,
      );
      if (!item) return null;
      return { kind: step.kind, item } as StepContent;
    }
    case "interactiveReading": {
      const set = take(
        pickClosestSet(bank.interactiveReading, target, picker.random, picker.seen),
        picker,
      );
      return set ? { kind: "interactiveReading", set } : null;
    }
    case "interactiveListening": {
      const set = take(
        pickClosestSet(bank.interactiveListening, target, picker.random, picker.seen),
        picker,
      );
      return set ? { kind: "interactiveListening", set } : null;
    }
    case "writePhoto":
    case "speakPhoto": {
      const photo = take(pickUnused(bank.photos, picker), picker);
      return photo ? { kind: step.kind, photo } : null;
    }
    case "interactiveWriting": {
      const prompt = take(pickByLevel(bank.interactiveWriting, target, picker), picker);
      return prompt ? { kind: "interactiveWriting", prompt } : null;
    }
    case "writingSample": {
      const prompt = take(pickByLevel(bank.writingSamples, target, picker), picker);
      return prompt ? { kind: "writingSample", prompt } : null;
    }
    case "readAloud": {
      const item = take(
        pickNearest(bank.readAloud, target, picker.used, picker.random, 4, picker.seen),
        picker,
      );
      return item ? { kind: "readAloud", item } : null;
    }
    case "readThenSpeak": {
      const prompt = take(pickByLevel(bank.readThenSpeak, target, picker), picker);
      return prompt ? { kind: "readThenSpeak", prompt } : null;
    }
    case "speakingSample": {
      const prompt = take(pickByLevel(bank.speakingSamples, target, picker), picker);
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
    case "listenLength":
      return { area: "vowelLength" };
    case "chooseVerb":
      return { area: "aspect" };
    case "placeClitic":
      return { area: "wordOrder" };
    case "listenType":
      return { ...typed, ...(item.wordTags ? { wordTags: item.wordTags } : {}) };
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
  return { itemId, kind, skill, difficulty, score, guess, adaptive: false };
}
