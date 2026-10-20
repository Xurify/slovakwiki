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
 * One pass through the adaptive formats. Counts follow the DET's per-test
 * ranges (Read and Select 15–18, Fill in the Blanks 6–9, Read and Complete 3–6,
 * Listen and Type 6–9) spread over three rounds; Listen and Select is the audio
 * yes/no format from the original DET paper.
 */
const ROUNDS: readonly (readonly AdaptiveFormat[])[] = [
  [
    ...Array<AdaptiveFormat>(6).fill("readSelect"),
    "fillBlank",
    "fillBlank",
    "listenSelect",
    "listenType",
    "listenType",
    "readComplete",
  ],
  [
    ...Array<AdaptiveFormat>(6).fill("readSelect"),
    "fillBlank",
    "fillBlank",
    "listenType",
    "listenType",
    "readComplete",
  ],
  [
    ...Array<AdaptiveFormat>(6).fill("readSelect"),
    "fillBlank",
    "fillBlank",
    "listenSelect",
    "listenType",
    "listenType",
    "readComplete",
  ],
];

/**
 * The first items climb through the scale before the estimate takes over, like
 * the DET's calibration phase (one item from each of the lower difficulty bins).
 */
export const CALIBRATION_TARGETS = [5, 20, 35, 50] as const;

export const QUICK_ROUNDS = 2;

export const SKILL_FOR_FORMAT: Record<AdaptiveFormat, Skill> = {
  readSelect: "reading",
  fillBlank: "reading",
  readComplete: "reading",
  listenSelect: "listening",
  listenType: "listening",
};

/** Two-way formats: a blind guess is right half the time. */
export const GUESS_FOR_FORMAT: Partial<Record<AdaptiveFormat, number>> = {
  readSelect: 0.5,
  listenSelect: 0.5,
};

export const SECTION_LABEL: Record<TestSection, string> = {
  adaptive: "Reading and listening",
  reading: "Interactive reading",
  listening: "Interactive listening",
  writing: "Writing",
  speaking: "Speaking",
};

/** Seconds per screen, from the DET 2026 scoring guide. */
export const TIME_LIMIT_SECONDS: Partial<Record<StepKind, number>> = {
  readSelect: 5,
  listenSelect: 90,
  fillBlank: 20,
  readComplete: 180,
  listenType: 60,
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
 * takers at the same level from seeing the same items, as the DET's bins do.
 */
export function pickNearest<T extends { id: string; difficulty: number }>(
  pool: readonly T[],
  target: number,
  used: ReadonlySet<string>,
  random: () => number,
  window = 4,
): T | undefined {
  const ranked = pool
    .filter((item) => !used.has(item.id))
    .sort((a, b) => Math.abs(a.difficulty - target) - Math.abs(b.difficulty - target))
    .slice(0, window);
  if (ranked.length === 0) return undefined;
  return ranked[Math.floor(random() * ranked.length)];
}

export function itemsOfFormat<F extends AdaptiveFormat>(
  items: readonly AdaptiveItem[],
  format: F,
): Extract<AdaptiveItem, { format: F }>[] {
  return items.filter(
    (item): item is Extract<AdaptiveItem, { format: F }> => item.format === format,
  );
}
