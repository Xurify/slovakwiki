import type { PracticeItem } from "$lib/learning/types";
import { materializeBuildItem } from "$lib/learning/exercises/materialize-build";
import {
  analogFace,
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
  formatFaceDigital12,
  exactMinuteChoiceWhy,
  exactMinuteTellingLabel,
  exactMinuteWrongWhy,
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
  oDurationAppointmentTrapWhy,
  oDurationHoursPhrase,
  oDurationHoursWhy,
  oDurationMinutesPhrase,
  oDurationMinutesWhy,
  zaCountdownPhrase,
  zaCountdownClockFace,
  type ClockFaceTime,
  type QuarterMinute,
} from "./clock";
import {
  dayPartHint,
  hodinaAgreementHint,
  okoloHint,
  oLocativeVsAccusativeHint,
  registersHint,
} from "./hints";
import {
  enAroundPrompt,
  enDayPartEveningPrompt,
  enDayPartMorningPrompt,
  enExactAroundPrompt,
  enOddOneOutPrompt,
  enZaCountdownMeaningPhrase,
  skWhichClockShows,
} from "./prompts";
import {
  buildTilesForFrame,
  englishAppointmentPrompt,
  englishNegotiatePrompt,
  appointmentTimeTiles,
  frameWhy,
  negotiateAnswer,
  negotiateContextTurn,
  negotiateProposalTurn,
  negotiateWhy,
  NEGOTIATE_DAYS,
  pickNegotiateTimes,
  pickRandomScheduleFrame,
  pickScheduleTime,
  pickScheduleTimeWithoutDayPart,
  preferredAppointmentAnswer,
  questionContextTurn,
  scheduleExercisePrompt,
  SCHEDULE_FRAMES,
  fullScheduleLine,
  typedAcceptedAnswers,
} from "./frames";
import { daysDatesTimePracticeItems } from "./practice-catalog";

import {
  CLOCK_MATCH_KINDS,
  CORE_QUARTER_KINDS,
  FRAMED_KINDS,
  PHASE2_KINDS,
  PHASE3_KINDS,
  type DaysDatesTimeKind,
} from "./session-kinds";

export type { DaysDatesTimeKind } from "./session-kinds";

function catalogItem(kind: DaysDatesTimeKind): PracticeItem | undefined {
  return daysDatesTimePracticeItems.find((item) => item.id === kind);
}

function dayMeetingItem(rng: () => number): PracticeItem {
  const catalog = catalogItem("everyday/day-meeting");
  if (!catalog) throw new Error("Missing everyday/day-meeting catalog item");
  return materializeBuildItem(catalog, rng);
}

function choiceIdForTime(time: ClockFaceTime): string {
  const face = analogFace(time);
  return `face-${face.hour}-${face.minute}`;
}

function appointmentBarePhrase(time: ClockFaceTime): string {
  const phrase = appointmentPhrase(time).replace(/\.$/, "");
  // Quarters quote without leading O („pol tretej“); on the hour keep o („o tretej“).
  if (time.minute === 0) return phrase.replace(/^O /, "o ");
  return phrase.replace(/^O /, "");
}

function phraseForWhy(phrase: string): string {
  return phrase.replace(/\.$/, "");
}

function pickTrapChoiceTask(
  task: Omit<Extract<PracticeItem["task"], { type: "choice" }>, "type" | "choiceMode">,
): Extract<PracticeItem["task"], { type: "choice" }> {
  return { type: "choice", choiceMode: "pickTrap", ...task };
}

function buildClockMatchForTime(
  kind: DaysDatesTimeKind,
  time: ClockFaceTime,
  rng: () => number,
  barePhrase = appointmentBarePhrase(time),
): PracticeItem["task"] {
  const face = analogFace(time);
  const correctPhrase = appointmentPhrase(time);
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
    prompt: skWhichClockShows(barePhrase),
    promptLang: "sk",
    choiceStyle: "clock",
    choices,
    answerId: "correct",
    feedback: {
      correction: correctPhrase,
      english: `${formatFaceDigital12(time)} — ${englishTimeMeaningPhrase(time)}.`,
      why: appointmentChoiceWhy(time),
    },
  };
}

function buildClockMatchExercise(
  kind: DaysDatesTimeKind,
  minute: 0 | 15 | 30 | 45,
  rng: () => number,
): PracticeItem["task"] {
  const hour = randomFaceHour12(rng);
  return buildClockMatchForTime(kind, { hour, minute }, rng);
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
    hint: registersHint,
    feedback: {
      correction: correctLabel,
      english: englishTimeGloss(time),
      why: tellingChoiceWhy(time),
    },
  };
}

function buildRegisterContrastExercise(
  kind: DaysDatesTimeKind,
  rng: () => number,
): PracticeItem["task"] {
  const hour = randomFaceHour12(rng);
  const minute = randomQuarterMinute(rng);
  const time: ClockFaceTime = { hour, minute };
  const face = analogFace(time);
  const askAppointment = rng() < 0.5;
  const tellingLabel = tellingTimeLabel(time);
  const appointmentLabel = appointmentPhrase(time);
  const miss = nearMissTimes(time, rng)[0]!;
  const wrongRegisterLabel = askAppointment ? tellingLabel : appointmentLabel;
  const wrongTimeLabel = askAppointment
    ? appointmentPhrase(miss)
    : tellingTimeLabel(miss);

  const prompt = askAppointment
    ? "Ktorá odpoveď patrí k otázke „O koľkej?“?"
    : "Ktorá odpoveď patrí k otázke „Koľko je hodín?“?";
  const answerId = "correct";
  const correction = askAppointment ? appointmentLabel : tellingLabel;

  const choices = shuffleArray(
    [
      { id: "correct", label: correction },
      {
        id: "wrong-register",
        label: wrongRegisterLabel,
        whyWrong: askAppointment
          ? `**${phraseForWhy(tellingLabel)}** answers **Koľko je hodín?** — **O koľkej?** needs **O …**.`
          : `**${phraseForWhy(appointmentLabel)}** answers **O koľkej?** — **Koľko je hodín?** needs **Je/Sú …**.`,
      },
      {
        id: "wrong-time",
        label: wrongTimeLabel,
        whyWrong: askAppointment
          ? appointmentDistractorWhy(time, miss)
          : tellingDistractorWhy(time, miss),
      },
    ],
    rng,
  );

  return {
    id: `generated-${kind}`,
    type: "choice",
    practiceItemId: kind,
    prompt,
    promptLang: "sk",
    clock: face,
    choices,
    answerId,
    hint: registersHint,
    feedback: {
      correction,
      english: englishTimeGloss(time),
      why: askAppointment
        ? `**O koľkej?** asks when something happens → answer with **O …**: **${phraseForWhy(appointmentLabel)}**.`
        : `**Koľko je hodín?** asks what time it is → answer with **Je/Sú …**: **${phraseForWhy(tellingLabel)}**.`,
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
    promptLang: "sk",
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
    promptLang: "sk",
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
  return buildClockMatchForTime(kind, time, rng);
}

function buildExactMinuteExercise(
  kind: DaysDatesTimeKind,
  rng: () => number,
): PracticeItem["task"] {
  const time = randomExactMinuteTime(rng);
  const face = analogFace({ hour: time.hour, minute: time.minute as QuarterMinute });
  const correctLabel = exactMinuteTellingLabel(time);
  const bare = correctLabel.replace(/^Sú |^Je /, "").replace(/\.$/, "");
  const wrongMinuteTime = {
    hour: time.hour,
    minute: (time.minute === 10 ? 5 : 10) as QuarterMinute,
  };
  const wrongHourTime = {
    hour: time.hour === 12 ? 11 : time.hour + 1,
    minute: time.minute as QuarterMinute,
  };

  const choices = shuffleArray(
    [
      { id: "correct", clock: face },
      {
        id: "wrong-minute",
        clock: analogFace(wrongMinuteTime),
        whyWrong: exactMinuteWrongWhy(
          "minute",
          exactMinuteTellingLabel(wrongMinuteTime),
          time,
        ),
      },
      {
        id: "wrong-hour",
        clock: analogFace(wrongHourTime),
        whyWrong: exactMinuteWrongWhy(
          "hour",
          exactMinuteTellingLabel(wrongHourTime),
          time,
        ),
      },
    ],
    rng,
  );

  return {
    id: `generated-${kind}`,
    type: "choice",
    practiceItemId: kind,
    prompt: skWhichClockShows(bare),
    promptLang: "sk",
    choiceStyle: "clock",
    choices,
    answerId: "correct",
    hint: hodinaAgreementHint,
    feedback: {
      correction: correctLabel,
      english: `${face.hour}:${String(time.minute).padStart(2, "0")}.`,
      why: exactMinuteChoiceWhy(time),
    },
  };
}

function buildODurationExercise(
  kind: DaysDatesTimeKind,
  rng: () => number,
): PracticeItem["task"] {
  const useHours = rng() < 0.55;

  if (useHours) {
    const hourCount = rng() < 0.5 ? 2 : 4;
    const correctPhrase = oDurationHoursPhrase(hourCount);
    const trapPhrase = appointmentPhrase({ hour: hourCount, minute: 0 });
    const wrongCount = hourCount === 2 ? 3 : 2;
    const wrongPhrase = oDurationHoursPhrase(wrongCount);
    const english = hourCount === 2 ? "In two hours." : "In four hours.";

    return {
      id: `generated-${kind}`,
      type: "choice",
      practiceItemId: kind,
      prompt: english,
      choices: shuffleArray(
        [
          { id: "correct", label: correctPhrase },
          {
            id: "trap-locative",
            label: trapPhrase,
            whyWrong: oDurationAppointmentTrapWhy(correctPhrase, trapPhrase),
          },
          {
            id: "wrong-count",
            label: wrongPhrase,
            whyWrong: `**${wrongPhrase.replace(/\.$/, "")}** is the wrong duration — the prompt asks for *${english.replace(/\.$/, "").toLowerCase()}*.`,
          },
        ],
        rng,
      ),
      answerId: "correct",
      hint: oLocativeVsAccusativeHint,
      feedback: {
        correction: correctPhrase,
        english: english.replace(/\.$/, ""),
        why: oDurationHoursWhy(hourCount),
      },
    };
  }

  const minuteCount = rng() < 0.5 ? 2 : 5;
  const correctPhrase = oDurationMinutesPhrase(minuteCount);
  const trapHour12 = minuteCount === 2 ? 2 : 5;
  const trapPhrase = appointmentPhrase({ hour: trapHour12, minute: 0 });
  const wrongCount = minuteCount === 2 ? 5 : 2;
  const wrongPhrase = oDurationMinutesPhrase(wrongCount);
  const english = minuteCount === 2 ? "In two minutes." : "In five minutes.";

  return {
    id: `generated-${kind}`,
    type: "choice",
    practiceItemId: kind,
    prompt: english,
    choices: shuffleArray(
      [
        { id: "correct", label: correctPhrase },
        {
          id: "trap-locative",
          label: trapPhrase,
          whyWrong: oDurationAppointmentTrapWhy(correctPhrase, trapPhrase),
        },
        {
          id: "wrong-count",
          label: wrongPhrase,
          whyWrong: `**${wrongPhrase.replace(/\.$/, "")}** is the wrong duration — the prompt asks for *${english.replace(/\.$/, "").toLowerCase()}*.`,
        },
      ],
      rng,
    ),
    answerId: "correct",
    hint: oLocativeVsAccusativeHint,
    feedback: {
      correction: correctPhrase,
      english: english.replace(/\.$/, ""),
      why: oDurationMinutesWhy(minuteCount),
    },
  };
}

function buildFrameTimeChoiceExercise(
  kind: DaysDatesTimeKind,
  rng: () => number,
): PracticeItem["task"] {
  const frame = pickRandomScheduleFrame(rng);
  const { time, dayPart } = pickScheduleTime(rng);
  const { promptSk, prompt } = scheduleExercisePrompt(frame, time, dayPart);
  const correctPhrase = preferredAppointmentAnswer(time, dayPart);
  const misses = nearMissTimes(time, rng);
  const distractors = appointmentChoiceDistractors(time, misses);

  const choices = shuffleArray(
    [
      { id: "correct", label: correctPhrase },
      ...distractors.map((distractor) => ({
        id: distractor.id,
        label: distractor.label,
        whyWrong: distractor.whyWrong,
      })),
    ],
    rng,
  );

  return {
    id: `generated-${kind}`,
    type: "choice",
    practiceItemId: kind,
    promptSk,
    prompt,
    promptLang: "en",
    choices,
    answerId: "correct",
    feedback: {
      correction: correctPhrase,
      english: prompt,
      why: frameWhy(frame, time, dayPart),
    },
  };
}

function buildFrameTimeBuildExercise(
  kind: DaysDatesTimeKind,
  rng: () => number,
): PracticeItem["task"] {
  const frame = pickRandomScheduleFrame(rng);
  const time = pickScheduleTimeWithoutDayPart(rng);
  const { promptSk, prompt } = scheduleExercisePrompt(frame, time);
  const wrongFrame =
    SCHEDULE_FRAMES.find((candidate) => candidate.id !== frame.id) ?? SCHEDULE_FRAMES[0]!;
  const wrongVerb =
    wrongFrame.skPrefixTokens[wrongFrame.skPrefixTokens.length - 1] ?? "začína";
  const misses = nearMissTimes(time, rng);
  const wrongTimeTile = appointmentTimeTiles(misses[0]!).slice(-1)[0]!;
  const timeTiles = appointmentTimeTiles(time);
  const distractors = [wrongVerb, wrongTimeTile].filter(
    (tile) => !frame.skPrefixTokens.includes(tile) && !timeTiles.includes(tile),
  );
  const { tiles, answer } = buildTilesForFrame(frame, time, rng, distractors);
  const correction = fullScheduleLine(frame, time);

  return {
    id: `generated-${kind}`,
    type: "build",
    practiceItemId: kind,
    promptSk,
    prompt,
    promptLang: "en",
    tiles,
    answer,
    feedback: {
      correction,
      english: prompt,
      why: frameWhy(frame, time),
    },
  };
}

function buildFrameTimeTypedExercise(
  kind: DaysDatesTimeKind,
  rng: () => number,
): PracticeItem["task"] {
  const frame = pickRandomScheduleFrame(rng);
  const { time, dayPart } = pickScheduleTime(rng);
  const answer = preferredAppointmentAnswer(time, dayPart);
  const accepted = typedAcceptedAnswers(frame, time, dayPart).filter(
    (candidate) => candidate !== answer,
  );

  return {
    id: `generated-${kind}`,
    type: "typed",
    task: "complete",
    practiceItemId: kind,
    context: [questionContextTurn(frame)],
    prompt: englishAppointmentPrompt(time, dayPart),
    promptLang: "en",
    inputLabel: "Your Slovak answer",
    answer,
    acceptedAnswers: accepted,
    feedback: {
      correction: answer,
      english: englishAppointmentPrompt(time, dayPart),
      why: frameWhy(frame, time, dayPart),
    },
  };
}

function buildFrameNegotiateExercise(
  kind: DaysDatesTimeKind,
  rng: () => number,
): PracticeItem["task"] {
  const dayIndex = Math.floor(rng() * NEGOTIATE_DAYS.length);
  const day = NEGOTIATE_DAYS[dayIndex] ?? NEGOTIATE_DAYS[0]!;
  const { proposed, better } = pickNegotiateTimes(rng);
  const answer = negotiateAnswer(better);
  const bareTime = appointmentPhrase(better);
  const prompt = englishNegotiatePrompt(better);

  return {
    id: `generated-${kind}`,
    type: "typed",
    task: "complete",
    practiceItemId: kind,
    context: [negotiateContextTurn(day), negotiateProposalTurn(proposed)],
    prompt,
    promptLang: "en",
    inputLabel: "Your Slovak answer",
    answer,
    acceptedAnswers: bareTime !== answer ? [bareTime] : [],
    feedback: {
      correction: answer,
      english: prompt,
      why: negotiateWhy(better),
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
    return wrapTask(kind, buildClockMatchExercise(kind, 0, rng));
  }
  if (kind === "everyday/half-past-time") {
    return wrapTask(kind, buildClockMatchExercise(kind, 30, rng));
  }
  if (kind === "everyday/quarter-time") {
    const minute = rng() < 0.5 ? 15 : 45;
    return wrapTask(kind, buildClockMatchExercise(kind, minute, rng));
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
  if (kind === "everyday/time-register") {
    return wrapTask(kind, buildRegisterContrastExercise(kind, rng));
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
  if (kind === "everyday/o-duration") {
    return wrapTask(kind, buildODurationExercise(kind, rng));
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
  if (kind === "everyday/frame-time-choice") {
    return wrapTask(kind, buildFrameTimeChoiceExercise(kind, rng));
  }
  if (kind === "everyday/frame-time-build") {
    return wrapTask(kind, buildFrameTimeBuildExercise(kind, rng));
  }
  if (kind === "everyday/frame-time-typed") {
    return wrapTask(kind, buildFrameTimeTypedExercise(kind, rng));
  }
  if (kind === "everyday/frame-negotiate") {
    return wrapTask(kind, buildFrameNegotiateExercise(kind, rng));
  }

  throw new Error(`Unknown days-dates-time kind: ${kind}`);
}

export function buildDaysDatesTimeSession(
  rng: () => number = Math.random,
): PracticeItem[] {
  const items: PracticeItem[] = [
    materializeDaysDatesTimeItem("everyday/day-meeting", rng),
  ];

  const framedCount = rng() < 0.5 ? 2 : 3;
  const framedPicks = shuffleArray(FRAMED_KINDS, rng).slice(0, framedCount);
  for (const kind of framedPicks) {
    items.push(materializeDaysDatesTimeItem(kind, rng));
  }

  for (const kind of CORE_QUARTER_KINDS) {
    items.push(materializeDaysDatesTimeItem(kind, rng));
  }

  items.push(materializeDaysDatesTimeItem("everyday/clock-quarter-past-ask", rng));
  items.push(materializeDaysDatesTimeItem("everyday/time-register", rng));
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
  ...FRAMED_KINDS,
  ...CORE_QUARTER_KINDS,
  ...CLOCK_MATCH_KINDS,
  "everyday/clock-quarter-past-ask",
  "everyday/time-register",
  "everyday/time-variants",
  ...PHASE2_KINDS,
  ...PHASE3_KINDS,
];

export function isDaysDatesTimeKind(id: string): id is DaysDatesTimeKind {
  return (ALL_KINDS as string[]).includes(id);
}
