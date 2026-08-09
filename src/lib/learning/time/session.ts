import type { PracticeItem } from "$lib/learning/types";
import { materializeBuildItem } from "$lib/learning/build";
import {
  analogFace,
  appointmentFrom24h,
  appointmentPhrase,
  appointmentPhraseWithDayPart,
  appointmentChoiceDistractors,
  appointmentChoiceWhy,
  appointmentDayPartChoiceWhy,
  appointmentDayPartWrongWhy,
  appointmentDistractorWhy,
  aroundPhrase,
  dayPartDisambiguationPair,
  englishTimeGloss,
  englishTimeMeaningPhrase,
  exactMinuteChoiceWhy,
  exactMinuteTellingLabel,
  exactMinuteWrongWhy,
  formatDigital,
  formatFaceDigital12,
  isNoonTime,
  nearMissTimes,
  noonMidnightSelectAllChoices,
  oddOneOutChoicesFromDrafts,
  oddOneOutFromOptions,
  okoloChoiceWhy,
  okoloExactTrapWhy,
  random24hQuarterTime,
  randomExactMinuteTime,
  randomFaceHour12,
  randomNoonOrMidnight,
  randomQuarterMinute,
  selectAllChoicesForTime,
  shuffleArray,
  clockFaceDistractorWhy,
  tellingChoiceWhy,
  tellingDistractorWhy,
  tellingTimeLabel,
  zaCountdownPhrase,
  zaCountdownClockFace,
  type ClockFaceTime,
} from "./clock";
import { dayPartHint, hodinaAgreementHint, okoloHint } from "./hints";
import {
  enAppointmentPrompt,
  enAroundPrompt,
  enDayPartEveningPrompt,
  enDayPartMorningPrompt,
  enExactAroundPrompt,
  enExactMinutePrompt,
  enOddOneOutPrompt,
  enTimetablePrompt,
  enZaCountdownMeaningPhrase,
} from "./prompts";
import { daysDatesTimePracticeItems } from "./practice-catalog";

export type DaysDatesTimeKind =
  | "everyday/day-meeting"
  | "everyday/meeting-time"
  | "everyday/half-past-time"
  | "everyday/quarter-time"
  | "everyday/clock-half-past-match"
  | "everyday/clock-quarter-past-match"
  | "everyday/clock-quarter-to-match"
  | "everyday/clock-quarter-past-ask"
  | "everyday/time-variants"
  | "everyday/day-part-time"
  | "everyday/noon-midnight"
  | "everyday/okolo-vs-exact"
  | "everyday/timetable-24h"
  | "everyday/exact-minute"
  | "everyday/za-countdown";

const CORE_QUARTER_KINDS: DaysDatesTimeKind[] = [
  "everyday/meeting-time",
  "everyday/half-past-time",
  "everyday/quarter-time",
];

const CLOCK_MATCH_KINDS: DaysDatesTimeKind[] = [
  "everyday/clock-half-past-match",
  "everyday/clock-quarter-past-match",
  "everyday/clock-quarter-to-match",
];

const PHASE2_KINDS: DaysDatesTimeKind[] = [
  "everyday/day-part-time",
  "everyday/noon-midnight",
  "everyday/okolo-vs-exact",
];

const PHASE3_KINDS: DaysDatesTimeKind[] = [
  "everyday/timetable-24h",
  "everyday/exact-minute",
  "everyday/za-countdown",
];

function catalogItem(kind: DaysDatesTimeKind): PracticeItem | undefined {
  return daysDatesTimePracticeItems.find((item) => item.id === kind);
}

function dayMeetingItem(rng: () => number): PracticeItem {
  const catalog = catalogItem("everyday/day-meeting");
  if (!catalog) throw new Error("Missing everyday/day-meeting catalog item");
  return materializeBuildItem(catalog, rng);
}

function pickTime(
  minuteConstraint: QuarterMinuteConstraint,
  rng: () => number,
): ClockFaceTime {
  const hour = randomFaceHour12(rng);
  let minute = randomQuarterMinute(rng);

  if (minuteConstraint === ":00") minute = 0;
  else if (minuteConstraint === ":30") minute = 30;
  else if (minuteConstraint === ":15") minute = 15;
  else if (minuteConstraint === ":45") minute = 45;
  else if (minuteConstraint === ":15-or-45") {
    minute = rng() < 0.5 ? 15 : 45;
  }

  return { hour, minute };
}

type QuarterMinuteConstraint = ":00" | ":15" | ":30" | ":45" | ":15-or-45";

function choiceIdForTime(time: ClockFaceTime): string {
  const face = analogFace(time);
  return `face-${face.hour}-${face.minute}`;
}

function appointmentBarePhrase(time: ClockFaceTime): string {
  return appointmentPhrase(time).replace(/^O /, "").replace(/\.$/, "");
}

function phraseForWhy(phrase: string): string {
  return phrase.replace(/\.$/, "");
}

function pickTrapChoiceTask(
  task: Omit<Extract<PracticeItem["task"], { type: "choice" }>, "type" | "choiceMode">,
): Extract<PracticeItem["task"], { type: "choice" }> {
  return { type: "choice", choiceMode: "pickTrap", ...task };
}

function buildChoiceExercise(
  kind: DaysDatesTimeKind,
  time: ClockFaceTime,
  rng: () => number,
  promptOverride?: string,
): PracticeItem["task"] {
  const face = analogFace(time);
  const correctPhrase = appointmentPhrase(time);
  const misses = nearMissTimes(time, rng);
  const distractors = appointmentChoiceDistractors(time, misses);
  const choices = shuffleArray(
    [
      { id: "correct", label: correctPhrase },
      ...distractors.map((d) => ({
        id: d.id,
        label: d.label,
        ...(d.whyWrong ? { whyWrong: d.whyWrong } : {}),
      })),
    ],
    rng,
  );

  const english = englishTimeGloss(time);
  const isOneOnTheHour = face.hour === 1 && time.minute === 0;

  return {
    id: `generated-${kind}`,
    type: "choice",
    practiceItemId: kind,
    prompt: promptOverride ?? enAppointmentPrompt(time),
    clock: face,
    choices,
    answerId: "correct",
    feedback: {
      correction: correctPhrase,
      english,
      why: isOneOnTheHour
        ? `**O jednej** is the usual appointment form for **1:00** — **O prvej** is also heard.`
        : appointmentChoiceWhy(time),
    },
  };
}

function buildClockMatchExercise(
  kind: DaysDatesTimeKind,
  minute: 15 | 30 | 45,
  rng: () => number,
): PracticeItem["task"] {
  const hour = randomFaceHour12(rng);
  const time: ClockFaceTime = { hour, minute };
  const face = analogFace(time);
  const correctPhrase = appointmentPhrase(time);
  const bare = appointmentBarePhrase(time);
  const misses = nearMissTimes(time, rng);

  const choices = shuffleArray(
    [
      { id: "correct", clock: face },
      ...misses.map((miss) => ({
        id: choiceIdForTime(miss),
        clock: analogFace(miss),
        whyWrong: clockFaceDistractorWhy(time, miss),
      })),
    ],
    rng,
  );

  return {
    id: `generated-${kind}`,
    type: "choice",
    practiceItemId: kind,
    prompt: `Ktoré hodiny ukazujú „${bare}“?`,
    promptLang: "sk",
    choiceStyle: "clock",
    choices,
    answerId: "correct",
    feedback: {
      correction: correctPhrase,
      english: englishTimeGloss(time),
      why: tellingChoiceWhy(time),
    },
  };
}

function buildTellingAskExercise(
  kind: DaysDatesTimeKind,
  rng: () => number,
): PracticeItem["task"] {
  const hour = randomFaceHour12(rng);
  const time: ClockFaceTime = { hour, minute: 15 };
  const face = analogFace(time);
  const correctLabel = tellingTimeLabel(time);
  const misses = nearMissTimes(time, rng);

  const choices = shuffleArray(
    [
      { id: "correct", label: correctLabel },
      {
        id: choiceIdForTime(misses[0]!),
        label: tellingTimeLabel(misses[0]!),
        whyWrong: tellingDistractorWhy(time, misses[0]!),
      },
      {
        id: choiceIdForTime(misses[1]!),
        label: tellingTimeLabel(misses[1]!),
        whyWrong: tellingDistractorWhy(time, misses[1]!),
      },
    ],
    rng,
  );

  return {
    id: `generated-${kind}`,
    type: "choice",
    practiceItemId: kind,
    prompt: "Koľko je hodín?",
    promptLang: "sk",
    clock: face,
    choices,
    answerId: "correct",
    feedback: {
      correction: correctLabel,
      english: englishTimeGloss(time),
      why: tellingChoiceWhy(time),
    },
  };
}

function buildTimeVariantsOddOneOutExercise(
  kind: DaysDatesTimeKind,
  rng: () => number,
): PracticeItem["task"] {
  const hour = randomFaceHour12(rng);
  const time: ClockFaceTime = { hour, minute: 30 };
  const face = analogFace(time);
  const drafts = selectAllChoicesForTime(time);
  const meaningPhrase = englishTimeMeaningPhrase(time);
  const { choices, answerId, trapWhy } = oddOneOutChoicesFromDrafts(
    drafts,
    meaningPhrase,
  );
  const trap = drafts.find((draft) => draft.id === answerId);

  return pickTrapChoiceTask({
    id: `generated-${kind}`,
    practiceItemId: kind,
    prompt: enOddOneOutPrompt(meaningPhrase),
    clock: face,
    choices: shuffleArray(choices, rng),
    answerId,
    hint: hodinaAgreementHint,
    feedback: {
      correction: trap?.label ?? "",
      english: englishTimeGloss(time),
      why: trapWhy,
    },
  });
}

function buildDayPartExercise(
  kind: DaysDatesTimeKind,
  rng: () => number,
): PracticeItem["task"] {
  const pair = dayPartDisambiguationPair();
  const useMorning = rng() < 0.5;
  const time = useMorning ? pair.morning : pair.evening;
  const dayPart = useMorning ? pair.dayPartMorning : pair.dayPartEvening;
  const wrongDayPart = useMorning ? pair.dayPartEvening : pair.dayPartMorning;
  const face = analogFace(time);
  const prevHour12 = face.hour === 1 ? 12 : face.hour - 1;
  const wrongHourTime: ClockFaceTime = { hour: prevHour12, minute: time.minute };

  const correctPhrase = appointmentPhraseWithDayPart(time, dayPart);
  const prompt = useMorning ? enDayPartMorningPrompt(time) : enDayPartEveningPrompt(time);

  const choices = shuffleArray(
    [
      { id: "correct", label: correctPhrase },
      {
        id: "wrong-part",
        label: appointmentPhraseWithDayPart(time, wrongDayPart),
        whyWrong: appointmentDayPartWrongWhy(dayPart, wrongDayPart),
      },
      {
        id: "wrong-hour",
        label: appointmentPhraseWithDayPart(wrongHourTime, dayPart),
        whyWrong: appointmentDistractorWhy(time, wrongHourTime),
      },
    ],
    rng,
  );

  return {
    id: `generated-${kind}`,
    type: "choice",
    practiceItemId: kind,
    prompt,
    clock: face,
    choices,
    answerId: "correct",
    hint: dayPartHint,
    feedback: {
      correction: correctPhrase,
      english: englishTimeGloss(time),
      why: appointmentDayPartChoiceWhy(time, dayPart),
    },
  };
}

function buildNoonMidnightExercise(
  kind: DaysDatesTimeKind,
  rng: () => number,
): PracticeItem["task"] {
  const time = randomNoonOrMidnight(rng);
  const face = analogFace(time);
  const isNoon = isNoonTime(time);
  const meaningPhrase = isNoon ? "noon" : "midnight";
  const drafts = noonMidnightSelectAllChoices(time);
  const { choices, answerId, trapWhy } = oddOneOutChoicesFromDrafts(
    drafts,
    meaningPhrase,
  );
  const trap = drafts.find((draft) => draft.id === answerId);

  return pickTrapChoiceTask({
    id: `generated-${kind}`,
    practiceItemId: kind,
    prompt: enOddOneOutPrompt(meaningPhrase),
    clock: face,
    choices: shuffleArray(choices, rng),
    answerId,
    feedback: {
      correction: trap?.label ?? "",
      english: isNoon ? "At noon." : "At midnight.",
      why: trapWhy,
    },
  });
}

function buildOkoloVsExactExercise(
  kind: DaysDatesTimeKind,
  rng: () => number,
): PracticeItem["task"] {
  const hour = randomFaceHour12(rng);
  const time: ClockFaceTime = { hour, minute: 0 };
  const face = analogFace(time);
  const askAround = rng() < 0.5;

  const exactPhrase = appointmentPhrase(time);
  const aroundLabel = aroundPhrase(time);
  const quarterPhrase = appointmentPhrase({ hour, minute: 15 });
  const prompt = askAround ? enAroundPrompt(time) : enExactAroundPrompt(time);
  const answerId = askAround ? "around" : "exact";
  const correction = askAround ? aroundLabel : exactPhrase;

  const choices = shuffleArray(
    [
      {
        id: "around",
        label: aroundLabel,
        ...(answerId !== "around"
          ? { whyWrong: okoloExactTrapWhy("around", aroundLabel, time) }
          : {}),
      },
      {
        id: "exact",
        label: exactPhrase,
        ...(answerId !== "exact"
          ? { whyWrong: okoloExactTrapWhy("exact", exactPhrase, time) }
          : {}),
      },
      {
        id: "quarter",
        label: quarterPhrase,
        whyWrong: appointmentDistractorWhy(time, { hour, minute: 15 }),
      },
    ],
    rng,
  );

  return {
    id: `generated-${kind}`,
    type: "choice",
    practiceItemId: kind,
    prompt,
    clock: face,
    choices,
    answerId,
    hint: okoloHint,
    feedback: {
      correction,
      english: englishTimeGloss(time),
      why: okoloChoiceWhy(time, askAround ? "around" : "exact"),
    },
  };
}

function buildTimetableExercise(
  kind: DaysDatesTimeKind,
  rng: () => number,
): PracticeItem["task"] {
  const time = random24hQuarterTime(rng);
  const face = analogFace(time);
  const correctPhrase = appointmentFrom24h(time) ?? appointmentPhrase(time);
  const misses = nearMissTimes(time, rng);

  const choices = shuffleArray(
    [
      { id: "correct", label: correctPhrase },
      ...misses.map((miss) => ({
        id: choiceIdForTime(miss),
        label: appointmentPhrase(miss),
        whyWrong: appointmentDistractorWhy(time, miss),
      })),
    ],
    rng,
  );

  return {
    id: `generated-${kind}`,
    type: "choice",
    practiceItemId: kind,
    prompt: enTimetablePrompt(time),
    clock: face,
    choices,
    answerId: "correct",
    feedback: {
      correction: correctPhrase,
      english: englishTimeGloss(time),
      why: `On timetables read **${formatDigital(time)}** as **${phraseForWhy(correctPhrase)}**.`,
    },
  };
}

function buildExactMinuteExercise(
  kind: DaysDatesTimeKind,
  rng: () => number,
): PracticeItem["task"] {
  const time = randomExactMinuteTime(rng);
  const face = analogFace({ hour: time.hour, minute: time.minute });
  const correctLabel = exactMinuteTellingLabel(time);
  const wrongMinute = exactMinuteTellingLabel({
    hour: time.hour,
    minute: time.minute === 10 ? 5 : 10,
  });
  const wrongHour = exactMinuteTellingLabel({
    hour: time.hour === 12 ? 11 : time.hour + 1,
    minute: time.minute,
  });

  const choices = shuffleArray(
    [
      { id: "correct", label: correctLabel },
      {
        id: "wrong-minute",
        label: wrongMinute,
        whyWrong: exactMinuteWrongWhy("minute", wrongMinute, time),
      },
      {
        id: "wrong-hour",
        label: wrongHour,
        whyWrong: exactMinuteWrongWhy("hour", wrongHour, time),
      },
    ],
    rng,
  );

  return {
    id: `generated-${kind}`,
    type: "choice",
    practiceItemId: kind,
    prompt: enExactMinutePrompt(time),
    clock: face,
    choices,
    answerId: "correct",
    hint: hodinaAgreementHint,
    feedback: {
      correction: correctLabel,
      english: `At ${face.hour}:${String(time.minute).padStart(2, "0")}.`,
      why: exactMinuteChoiceWhy(time),
    },
  };
}

function buildZaCountdownExercise(
  kind: DaysDatesTimeKind,
  rng: () => number,
): PracticeItem["task"] {
  const targetHour12 = rng() < 0.5 ? 10 : 12;
  const minutesBefore = 5;
  const correctPhrase = zaCountdownPhrase(minutesBefore, targetHour12);
  const meaningPhrase = enZaCountdownMeaningPhrase(targetHour12);
  const halfPhrase = appointmentPhrase({ hour: targetHour12 - 1, minute: 30 });
  const quarterPhrase = appointmentPhrase({ hour: targetHour12 - 1, minute: 45 });
  const primaryTrapId = rng() < 0.5 ? "half" : "quarter";
  const face = zaCountdownClockFace(minutesBefore, targetHour12);

  const { choices, trapWhy } = oddOneOutFromOptions(
    [
      { id: "correct", label: correctPhrase, fits: true },
      {
        id: primaryTrapId,
        label: primaryTrapId === "half" ? halfPhrase : quarterPhrase,
        whyWrong: `**${phraseForWhy(primaryTrapId === "half" ? halfPhrase : quarterPhrase)}** is an **O …** appointment time — not a **za …** countdown.`,
      },
    ],
    primaryTrapId,
    meaningPhrase,
  );
  const primaryTrap = choices.find((choice) => choice.id === primaryTrapId);

  return pickTrapChoiceTask({
    id: `generated-${kind}`,
    practiceItemId: kind,
    prompt: enOddOneOutPrompt(meaningPhrase),
    clock: face,
    choices: shuffleArray(choices, rng),
    answerId: primaryTrapId,
    feedback: {
      correction: primaryTrap?.label ?? "",
      english: targetHour12 === 10 ? "Five minutes to ten." : "Five minutes to twelve.",
      why: trapWhy,
    },
  });
}

function wrapTask(kind: DaysDatesTimeKind, task: PracticeItem["task"]): PracticeItem {
  const catalog = catalogItem(kind);
  if (!catalog) throw new Error(`Missing catalog item: ${kind}`);

  return {
    id: kind,
    source: catalog.source,
    task,
    feedback: task.feedback,
  };
}

export function materializeDaysDatesTimeItem(
  kind: DaysDatesTimeKind,
  rng: () => number = Math.random,
): PracticeItem {
  if (kind === "everyday/day-meeting") return dayMeetingItem(rng);

  if (kind === "everyday/meeting-time") {
    return wrapTask(kind, buildChoiceExercise(kind, pickTime(":00", rng), rng));
  }
  if (kind === "everyday/half-past-time") {
    return wrapTask(kind, buildChoiceExercise(kind, pickTime(":30", rng), rng));
  }
  if (kind === "everyday/quarter-time") {
    return wrapTask(kind, buildChoiceExercise(kind, pickTime(":15-or-45", rng), rng));
  }
  if (kind === "everyday/clock-half-past-match") {
    return wrapTask(kind, buildClockMatchExercise(kind, 30, rng));
  }
  if (kind === "everyday/clock-quarter-past-match") {
    return wrapTask(kind, buildClockMatchExercise(kind, 15, rng));
  }
  if (kind === "everyday/clock-quarter-to-match") {
    return wrapTask(kind, buildClockMatchExercise(kind, 45, rng));
  }
  if (kind === "everyday/clock-quarter-past-ask") {
    return wrapTask(kind, buildTellingAskExercise(kind, rng));
  }
  if (kind === "everyday/time-variants") {
    return wrapTask(kind, buildTimeVariantsOddOneOutExercise(kind, rng));
  }
  if (kind === "everyday/day-part-time") {
    return wrapTask(kind, buildDayPartExercise(kind, rng));
  }
  if (kind === "everyday/noon-midnight") {
    return wrapTask(kind, buildNoonMidnightExercise(kind, rng));
  }
  if (kind === "everyday/okolo-vs-exact") {
    return wrapTask(kind, buildOkoloVsExactExercise(kind, rng));
  }
  if (kind === "everyday/timetable-24h") {
    return wrapTask(kind, buildTimetableExercise(kind, rng));
  }
  if (kind === "everyday/exact-minute") {
    return wrapTask(kind, buildExactMinuteExercise(kind, rng));
  }
  if (kind === "everyday/za-countdown") {
    return wrapTask(kind, buildZaCountdownExercise(kind, rng));
  }

  throw new Error(`Unknown days-dates-time kind: ${kind}`);
}

export function buildDaysDatesTimeSession(
  rng: () => number = Math.random,
): PracticeItem[] {
  const items: PracticeItem[] = [
    materializeDaysDatesTimeItem("everyday/day-meeting", rng),
  ];

  for (const kind of CORE_QUARTER_KINDS) {
    items.push(materializeDaysDatesTimeItem(kind, rng));
  }

  const matchPick = shuffleArray(CLOCK_MATCH_KINDS, rng)[0]!;
  items.push(materializeDaysDatesTimeItem(matchPick, rng));

  items.push(materializeDaysDatesTimeItem("everyday/clock-quarter-past-ask", rng));
  items.push(materializeDaysDatesTimeItem("everyday/time-variants", rng));

  const phase2 = shuffleArray(PHASE2_KINDS, rng);
  items.push(materializeDaysDatesTimeItem(phase2[0]!, rng));
  if (rng() < 0.55) {
    items.push(materializeDaysDatesTimeItem(phase2[1]!, rng));
  }

  const phase3Pick = shuffleArray(
    ["everyday/timetable-24h", "everyday/exact-minute"] as DaysDatesTimeKind[],
    rng,
  )[0]!;
  items.push(materializeDaysDatesTimeItem(phase3Pick, rng));

  if (rng() < 0.4) {
    items.push(materializeDaysDatesTimeItem("everyday/za-countdown", rng));
  }

  return shuffleArray(items, rng);
}

const ALL_KINDS: DaysDatesTimeKind[] = [
  "everyday/day-meeting",
  ...CORE_QUARTER_KINDS,
  ...CLOCK_MATCH_KINDS,
  "everyday/clock-quarter-past-ask",
  "everyday/time-variants",
  ...PHASE2_KINDS,
  ...PHASE3_KINDS,
];

export function isDaysDatesTimeKind(id: string): id is DaysDatesTimeKind {
  return (ALL_KINDS as string[]).includes(id);
}
