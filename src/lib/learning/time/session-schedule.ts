import type { PracticeItem } from "$lib/learning/types";
import { appointmentChoiceDistractors, nearMissTimes, shuffleArray } from "./clock";
import {
  appointmentTimeTiles,
  buildTilesForFrame,
  englishAppointmentPrompt,
  frameWhy,
  fullScheduleLine,
  pickNegotiateRound,
  pickRandomScheduleFrame,
  pickScheduleTime,
  pickScheduleTimeWithoutDayPart,
  preferredAppointmentAnswer,
  questionContextTurn,
  scheduleExercisePrompt,
  SCHEDULE_FRAMES,
  typedAcceptedAnswers,
} from "./frames";
import type { DaysDatesTimeKind } from "./session-kinds";

export function buildFrameTimeChoiceExercise(
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

export function buildFrameTimeBuildExercise(
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

export function buildFrameTimeTypedExercise(
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

export function buildFrameNegotiateExercise(
  kind: DaysDatesTimeKind,
  rng: () => number,
): PracticeItem["task"] {
  const round = pickNegotiateRound(rng);

  return {
    id: `generated-${kind}`,
    type: "typed",
    task: "complete",
    practiceItemId: kind,
    context: [round.context],
    prompt: round.prompt,
    promptLang: "en",
    inputLabel: "Your Slovak answer",
    answer: round.answer,
    acceptedAnswers: round.acceptedAnswers,
    feedback: {
      correction: round.answer,
      english: round.prompt,
      why: round.why,
    },
  };
}
