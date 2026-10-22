import type { PracticeItem } from "$lib/learning/types";
import {
  analogFace,
  appointmentChoiceWhy,
  appointmentPhrase,
  clockFaceDistractorWhy,
  englishTellingGloss,
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

/** What a clock-match card quotes and teaches for one time. */
export interface ClockMatchPhrase {
  bare: string;
  correction: string;
  english: string;
  why: string;
  wrongWhy: (miss: ClockFaceTime) => string;
}

function appointmentMatchPhrase(time: ClockFaceTime): ClockMatchPhrase {
  return {
    bare: appointmentBarePhrase(time),
    correction: appointmentPhrase(time),
    english: `${formatFaceDigital12(time)} — ${englishTimeMeaningPhrase(time)}.`,
    why: appointmentChoiceWhy(time),
    wrongWhy: (miss) => clockFaceDistractorWhy(time, miss),
  };
}

export function buildClockMatchForTime(
  kind: DaysDatesTimeKind,
  time: ClockFaceTime,
  rng: () => number,
  phrase: ClockMatchPhrase = appointmentMatchPhrase(time),
): PracticeItem["task"] {
  const face = analogFace(time);
  const misses = nearMissTimes(time, rng);

  const choices = shuffleArray(
    [
      { id: "correct", clock: face },
      ...misses.map((miss) => ({
        id: choiceIdForTime(miss),
        clock: analogFace(miss),
        whyWrong: phrase.wrongWhy(miss),
      })),
    ],
    rng,
  );

  return {
    id: `generated-${kind}`,
    type: "choice",
    practiceItemId: kind,
    prompt: skWhichClockShows(phrase.bare),
    promptLang: "sk",
    choiceStyle: "clock",
    choices,
    answerId: "correct",
    feedback: {
      correction: phrase.correction,
      english: phrase.english,
      why: phrase.why,
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
      english: englishTellingGloss(time),
      why: tellingChoiceWhy(time),
    },
  };
}
