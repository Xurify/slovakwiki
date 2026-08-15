import type { PracticeItem } from "$lib/learning/types";
import {
  appointmentChoiceDistractors,
  appointmentPhrase,
  nearMissTimes,
  shuffleArray,
} from "./clock";
import {
  appointmentTimeTiles,
  buildTilesForFrame,
  englishAppointmentPrompt,
  englishNegotiatePrompt,
  frameWhy,
  fullScheduleLine,
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
