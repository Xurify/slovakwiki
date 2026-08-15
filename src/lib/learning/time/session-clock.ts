import type { PracticeItem } from "$lib/learning/types";
import {
  analogFace,
  appointmentChoiceWhy,
  appointmentPhrase,
  clockFaceDistractorWhy,
  englishTimeGloss,
  englishTimeMeaningPhrase,
  formatFaceDigital12,
  nearMissTimes,
  randomFaceHour12,
  shuffleArray,
  tellingChoiceWhy,
  tellingDistractorWhy,
  tellingTimeLabel,
  type ClockFaceTime,
} from "./clock";
import { registersHint } from "./hints";
import { skWhichClockShows } from "./prompts";
import { appointmentBarePhrase, choiceIdForTime } from "./session-shared";
import type { DaysDatesTimeKind } from "./session-kinds";

export function buildClockMatchForTime(
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

export function buildClockMatchExercise(
  kind: DaysDatesTimeKind,
  minute: 0 | 15 | 30 | 45,
  rng: () => number,
): PracticeItem["task"] {
  const hour = randomFaceHour12(rng);
  return buildClockMatchForTime(kind, { hour, minute }, rng);
}

export function buildTellingAskExercise(
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
