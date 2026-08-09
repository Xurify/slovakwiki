import type { PracticeItem } from "$lib/learning/types";
import {
  analogFace,
  appointmentFrom24h,
  appointmentPhrase,
  appointmentPhraseWithDayPart,
  appointmentChoiceDistractors,
  appointmentDistractorWhy,
  aroundPhrase,
  dayPartDisambiguationPair,
  englishTimeGloss,
  exactMinuteTellingLabel,
  formatDigital,
  formatFaceDigital12,
  isNoonTime,
  nearMissTimes,
  noonMidnightAppointmentPhrases,
  noonMidnightSelectAllChoices,
  random24hQuarterTime,
  randomExactMinuteTime,
  randomFaceHour12,
  randomNoonOrMidnight,
  randomQuarterMinute,
  selectAllChoicesForTime,
  shuffleArray,
  clockFaceDistractorWhy,
  tellingDistractorWhy,
  tellingTimeLabel,
  zaCountdownPhrase,
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
  enMidnightPrompt,
  enNoonPrompt,
  enTimetablePrompt,
  enZaCountdownPrompt,
  SELECT_ALL_PROMPT,
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

function staticDayMeeting(): PracticeItem {
  const item = catalogItem("everyday/day-meeting");
  if (!item) throw new Error("Missing everyday/day-meeting catalog item");
  return item;
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
      ...distractors.map((d) => ({ id: d.id, label: d.label })),
    ],
    rng,
  );

  const english = englishTimeGloss(time);
  const bare = appointmentBarePhrase(time);
  const digital = formatFaceDigital12(time);
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
        : `**${bare}** is how you say **${digital}** for an appointment.`,
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
      why: `**${bare}** matches this face: **${formatFaceDigital12(time)}**.`,
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
      ...misses.map((miss) => ({
        id: choiceIdForTime(miss),
        label: tellingTimeLabel(miss),
        whyWrong: tellingDistractorWhy(time, miss),
      })),
    ],
    rng,
  );

  const toward = face.hour === 12 ? 1 : face.hour + 1;

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
      why: `One quarter toward **${toward}**: **${correctLabel.replace(/\.$/, "")}** matches **${formatFaceDigital12(time)}**.`,
    },
  };
}

function buildSelectAllExercise(
  kind: DaysDatesTimeKind,
  rng: () => number,
): PracticeItem["task"] {
  const hour = randomFaceHour12(rng);
  const time: ClockFaceTime = { hour, minute: 30 };
  const face = analogFace(time);
  const choiceDrafts = shuffleArray(selectAllChoicesForTime(time), rng);
  const correctLabels = choiceDrafts
    .filter((choice) => choice.correct)
    .map((choice) => choice.label);

  return {
    id: `generated-${kind}`,
    type: "selectAll",
    practiceItemId: kind,
    prompt: SELECT_ALL_PROMPT,
    clock: face,
    choices: choiceDrafts,
    hint: hodinaAgreementHint,
    feedback: {
      correction: correctLabels.join(" / "),
      english: englishTimeGloss(time),
      why: `Several forms name **${formatFaceDigital12(time)}** — e.g. **${correctLabels[0]?.replace(/\.$/, "") ?? "pol tretej"}** plus hour+minute and digital readings.`,
    },
  };
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

  const correctPhrase = appointmentPhraseWithDayPart(time, dayPart);
  const wrongPhrase = appointmentPhraseWithDayPart(time, wrongDayPart);
  const wrongHalf = appointmentPhraseWithDayPart(
    { hour: time.hour, minute: 30 },
    dayPart,
  );

  const choices = shuffleArray(
    [
      { id: "correct", label: correctPhrase },
      {
        id: "wrong-part",
        label: wrongPhrase,
        whyWrong: `**${wrongDayPart}** marks the wrong part of the day — use **${dayPart}**.`,
      },
      {
        id: "wrong-half",
        label: wrongHalf,
        whyWrong: `**${phraseForWhy(wrongHalf)}** is **${formatFaceDigital12({ hour: time.hour, minute: 30 })}** — not **${formatFaceDigital12(time)}**.`,
      },
    ],
    rng,
  );

  const prompt = useMorning ? enDayPartMorningPrompt(time) : enDayPartEveningPrompt(time);

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
      why: `Add **${dayPart}** when the face alone is ambiguous — **${phraseForWhy(correctPhrase)}**.`,
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
  const phrases = noonMidnightAppointmentPhrases(time);
  const choiceDrafts = shuffleArray(noonMidnightSelectAllChoices(time), rng);
  const prompt = isNoon ? enNoonPrompt() : enMidnightPrompt();

  return {
    id: `generated-${kind}`,
    type: "selectAll",
    practiceItemId: kind,
    prompt,
    clock: face,
    choices: choiceDrafts,
    feedback: {
      correction: phrases.join(" / "),
      english: isNoon ? "At noon." : "At midnight.",
      why: isNoon
        ? "**O poludní** is the usual form. **O dvanástej napoludnie** also works."
        : "**O polnoci** is the usual form. **O dvanástej v noci** also works.",
    },
  };
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

  const choices = shuffleArray(
    [
      {
        id: "correct",
        label: askAround ? aroundLabel : exactPhrase,
      },
      {
        id: "wrong",
        label: askAround ? exactPhrase : aroundLabel,
        whyWrong: askAround
          ? `**${phraseForWhy(exactPhrase)}** is exact — the prompt asks for approximate **okolo**.`
          : `**${phraseForWhy(aroundLabel)}** is approximate — the prompt asks for an exact **O …** time.`,
      },
      {
        id: "quarter",
        label: appointmentPhrase({ hour, minute: 15 }),
        whyWrong: `**${phraseForWhy(appointmentPhrase({ hour, minute: 15 }))}** is **${formatFaceDigital12({ hour, minute: 15 })}** — not **${formatFaceDigital12(time)}**.`,
      },
    ],
    rng,
  );

  const prompt = askAround ? enAroundPrompt(time) : enExactAroundPrompt(time);

  return {
    id: `generated-${kind}`,
    type: "choice",
    practiceItemId: kind,
    prompt,
    clock: face,
    choices,
    answerId: "correct",
    hint: okoloHint,
    feedback: {
      correction: askAround ? aroundLabel : exactPhrase,
      english: englishTimeGloss(time),
      why: askAround
        ? `**${phraseForWhy(aroundLabel)}** is approximate for **${formatFaceDigital12(time)}** — not exact **${phraseForWhy(exactPhrase)}**.`
        : `**${phraseForWhy(exactPhrase)}** is the exact appointment form for **${formatFaceDigital12(time)}**.`,
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
  const face = analogFace({ hour: time.hour, minute: 0 });
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
        whyWrong: `**${wrongMinute.replace(/^Sú |^Je |\.$/g, "")}** uses the wrong minute count — not **${face.hour}:${String(time.minute).padStart(2, "0")}**.`,
      },
      {
        id: "wrong-hour",
        label: wrongHour,
        whyWrong: `**${wrongHour.replace(/^Sú |^Je |\.$/g, "")}** names the wrong hour for this face.`,
      },
    ],
    rng,
  );

  return {
    id: `generated-${kind}`,
    type: "choice",
    practiceItemId: kind,
    prompt: enExactMinutePrompt(time),
    choices,
    answerId: "correct",
    hint: hodinaAgreementHint,
    feedback: {
      correction: correctLabel,
      english: `At ${face.hour}:${String(time.minute).padStart(2, "0")}.`,
      why: `Use hour agreement + **a** + minutes: **${correctLabel.replace(/\.$/, "")}**.`,
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

  const choices = shuffleArray(
    [
      { id: "correct", label: correctPhrase },
      {
        id: "half",
        label: appointmentPhrase({ hour: targetHour12 - 1, minute: 30 }),
        whyWrong: `**${phraseForWhy(appointmentPhrase({ hour: targetHour12 - 1, minute: 30 }))}** is an **O …** appointment time — not a **za …** countdown.`,
      },
      {
        id: "quarter",
        label: appointmentPhrase({ hour: targetHour12 - 1, minute: 45 }),
        whyWrong: `**${phraseForWhy(appointmentPhrase({ hour: targetHour12 - 1, minute: 45 }))}** is an **O …** appointment time — not a **za …** countdown.`,
      },
    ],
    rng,
  );

  return {
    id: `generated-${kind}`,
    type: "choice",
    practiceItemId: kind,
    prompt: enZaCountdownPrompt(targetHour12),
    choices,
    answerId: "correct",
    feedback: {
      correction: correctPhrase,
      english: targetHour12 === 10 ? "Five minutes to ten." : "Five minutes to twelve.",
      why: `**${correctPhrase.replace(/\.$/, "")}** counts down to the hour — different from an **O …** appointment time.`,
    },
  };
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
  if (kind === "everyday/day-meeting") return staticDayMeeting();

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
    return wrapTask(kind, buildSelectAllExercise(kind, rng));
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
