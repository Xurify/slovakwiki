import type {
  AdaptiveFormat,
  AdaptiveItem,
  PlanStep,
  PlannedTask,
  ScoringCapabilities,
  Skill,
  StepKind,
  TestMode,
  TestSection,
} from "./types";

/**
 * One pass through the adaptive formats. Item counts in the quick test (two
 * rounds) and the full test (three): Read and Select 12 or 18, Fill in the
 * Blanks 6 or 9, Read and Complete 2 or 3, Listen and Type 4 or 6. Listen and
 * Select is the audio yes/no format. Three formats are this test's own, for what Slovak has and English does not: vowel length
 * that changes meaning (Short or Long: mala, malá), verbal aspect (Choose the
 * Verb: písal, napísal) and clitics fixed in second position (Where Does It Go:
 * Včera som sa…).
 */
const ROUNDS: readonly (readonly AdaptiveFormat[])[] = [
  [
    ...Array<AdaptiveFormat>(6).fill("readSelect"),
    "listenLength",
    "fillBlank",
    "fillBlank",
    "fillBlank",
    "chooseVerb",
    "placeClitic",
    "listenSelect",
    "listenType",
    "listenType",
    "readComplete",
  ],
  [
    ...Array<AdaptiveFormat>(6).fill("readSelect"),
    "listenLength",
    "fillBlank",
    "fillBlank",
    "fillBlank",
    "chooseVerb",
    "placeClitic",
    "listenType",
    "listenType",
    "readComplete",
  ],
  [
    ...Array<AdaptiveFormat>(6).fill("readSelect"),
    "listenLength",
    "fillBlank",
    "fillBlank",
    "fillBlank",
    "chooseVerb",
    "placeClitic",
    "listenSelect",
    "listenType",
    "listenType",
    "readComplete",
  ],
];

/**
 * The first items climb through the scale before the estimate takes over,
 * acting as a calibration phase (one item from each of the lower difficulty bins).
 */
export const CALIBRATION_TARGETS = [5, 20, 35, 50] as const;

export const QUICK_ROUNDS = 2;

export const SKILL_FOR_FORMAT: Record<AdaptiveFormat, Skill> = {
  readSelect: "reading",
  fillBlank: "reading",
  readComplete: "reading",
  listenSelect: "listening",
  listenLength: "listening",
  listenType: "listening",
  chooseVerb: "reading",
  placeClitic: "reading",
};

/**
 * Chance of a blind guess being right. Where Does It Go offers a gap between
 * every word, but the ends and the gap after the verb are rarely tempting, so
 * a guess lands about one time in four.
 */
export const GUESS_FOR_FORMAT: Partial<Record<AdaptiveFormat, number>> = {
  readSelect: 0.5,
  listenSelect: 0.5,
  listenLength: 0.5,
  chooseVerb: 0.5,
  placeClitic: 0.25,
};

export const SECTION_LABEL: Record<TestSection, string> = {
  adaptive: "Reading and listening",
  reading: "Interactive reading",
  listening: "Interactive listening",
  writing: "Writing",
  speaking: "Speaking",
};

/**
 * Seconds per screen, adjusted for typing tasks: Slovak accents cost extra
 * keystrokes and most takers here are A1–B1 (timed on the longest passage).
 */
export const TIME_LIMIT_SECONDS: Partial<Record<StepKind, number>> = {
  readSelect: 5,
  listenSelect: 90,
  listenLength: 60,
  fillBlank: 30,
  readComplete: 240,
  listenType: 90,
  chooseVerb: 45,
  placeClitic: 60,
  interactiveReading: 420,
  interactiveListening: 390,
  writePhoto: 60,
  interactiveWriting: 300,
  writingSample: 300,
  readAloud: 30,
  speakPhoto: 90,
  readThenSpeak: 90,
  speakingSample: 180,
};

export const SUMMARY_TIME_SECONDS = 75;
export const INTERACTIVE_WRITING_FOLLOW_UP_SECONDS = 180;
export const PREPARE_SECONDS: Partial<Record<StepKind, number>> = {
  speakPhoto: 20,
  readThenSpeak: 20,
  speakingSample: 30,
  writingSample: 30,
  interactiveWriting: 30,
};

export interface PlanOptions {
  mode: TestMode;
  capabilities: ScoringCapabilities;
  /** False when the learner has no microphone or opts out. */
  speaking: boolean;
}

function adaptiveSteps(rounds: number): PlanStep[] {
  const steps: PlanStep[] = [];
  for (const round of ROUNDS.slice(0, rounds)) {
    for (const format of round) steps.push({ kind: format, section: "adaptive" });
  }

  CALIBRATION_TARGETS.forEach((target, index) => {
    const step = steps[index];
    if (step) step.calibration = target;
  });

  return steps;
}

function writingSteps(capabilities: ScoringCapabilities): PlanStep[] {
  if (!capabilities.scoring) {
    return [
      {
        kind: "planned",
        section: "writing",
        planned: ["writePhoto", "interactiveWriting", "writingSample"],
      },
    ];
  }

  return [
    { kind: "writePhoto", section: "writing" },
    { kind: "writePhoto", section: "writing" },
    { kind: "writePhoto", section: "writing" },
    { kind: "interactiveWriting", section: "writing" },
    { kind: "writingSample", section: "writing" },
  ];
}

function speakingSteps(capabilities: ScoringCapabilities, speaking: boolean): PlanStep[] {
  const everything: PlannedTask[] = [
    "readAloud",
    "speakPhoto",
    "readThenSpeak",
    "interactiveSpeaking",
    "speakingSample",
  ];
  if (!speaking || !capabilities.transcription) {
    return [{ kind: "planned", section: "speaking", planned: everything }];
  }

  const readAloud: PlanStep[] = [
    { kind: "readAloud", section: "speaking" },
    { kind: "readAloud", section: "speaking" },
    { kind: "readAloud", section: "speaking" },
  ];

  if (!capabilities.scoring) {
    return [
      ...readAloud,
      {
        kind: "planned",
        section: "speaking",
        planned: ["speakPhoto", "readThenSpeak", "interactiveSpeaking", "speakingSample"],
      },
    ];
  }

  return [
    ...readAloud,
    { kind: "speakPhoto", section: "speaking" },
    { kind: "readThenSpeak", section: "speaking" },
    { kind: "planned", section: "speaking", planned: ["interactiveSpeaking"] },
    { kind: "speakingSample", section: "speaking" },
  ];
}

export function buildPlan({ mode, capabilities, speaking }: PlanOptions): PlanStep[] {
  if (mode === "quick") return adaptiveSteps(QUICK_ROUNDS);

  return [
    ...adaptiveSteps(ROUNDS.length),
    { kind: "interactiveReading", section: "reading" },
    { kind: "interactiveListening", section: "listening" },
    ...writingSteps(capabilities),
    ...speakingSteps(capabilities, speaking),
  ];
}

/** Rough minutes for the intro screen: time limits, not typical pace. */
export function planMinutes(plan: readonly PlanStep[]): number {
  const seconds = plan.reduce((total, step) => {
    const limit = TIME_LIMIT_SECONDS[step.kind] ?? 0;
    const prepare = PREPARE_SECONDS[step.kind] ?? 0;
    const extra =
      step.kind === "interactiveListening"
        ? SUMMARY_TIME_SECONDS
        : step.kind === "interactiveWriting"
          ? INTERACTIVE_WRITING_FOLLOW_UP_SECONDS
          : 0;
    return total + limit + prepare + extra;
  }, 0);
  return Math.round(seconds / 60);
}

/** Seeded PRNG (mulberry32) so a session can be replayed in tests. */
export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Pick one of the few unused candidates nearest the target difficulty. Choosing
 * at random among the nearest (not always the single nearest) keeps two test
 * takers at the same level from seeing the same items.
 */
/**
 * How much farther from the target (scale points, about 0.8 logit) an item a
 * learner has not seen before may sit and still be preferred over a seen one.
 */
export const SEEN_SLACK = 8;

/**
 * One of the `window` unused items closest to the target ("randomesque"), so
 * two learners at the same level rarely see the same sequence. Items in
 * `avoid` (seen in an earlier run) are skipped while an unseen one is close.
 */
export function pickNearest<T extends { id: string; difficulty: number }>(
  pool: readonly T[],
  target: number,
  used: ReadonlySet<string>,
  random: () => number,
  window = 4,
  avoid?: ReadonlySet<string>,
): T | undefined {
  const distance = (item: T): number => Math.abs(item.difficulty - target);
  const ranked = pool
    .filter((item) => !used.has(item.id))
    .sort((a, b) => distance(a) - distance(b));
  const nearest = ranked[0];
  if (!nearest) return undefined;
  const limit = distance(nearest) + SEEN_SLACK;
  const unseen = avoid
    ? ranked.filter((item) => !avoid.has(item.id) && distance(item) <= limit)
    : [];
  const choices = (unseen.length ? unseen : ranked).slice(0, window);
  return choices[Math.floor(random() * choices.length)];
}

export function itemsOfFormat<F extends AdaptiveFormat>(
  items: readonly AdaptiveItem[],
  format: F,
): Extract<AdaptiveItem, { format: F }>[] {
  return items.filter(
    (item): item is Extract<AdaptiveItem, { format: F }> => item.format === format,
  );
}
