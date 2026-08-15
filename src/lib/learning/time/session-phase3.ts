import type { PracticeItem } from "$lib/learning/types";
import {
  analogFace,
  appointmentPhrase,
  exactMinuteChoiceWhy,
  exactMinuteTellingLabel,
  exactMinuteWrongWhy,
  oddOneOutFromOptions,
  random24hQuarterTime,
  randomExactMinuteTime,
  shuffleArray,
  zaCountdownClockFace,
  zaCountdownPhrase,
  type QuarterMinute,
} from "./clock";
import { hodinaAgreementHint } from "./hints";
import {
  enOddOneOutPrompt,
  enZaCountdownMeaningPhrase,
  skWhichClockShows,
} from "./prompts";
import { buildClockMatchForTime } from "./session-clock";
import { phraseForWhy, pickTrapChoiceTask } from "./session-shared";
import type { DaysDatesTimeKind } from "./session-kinds";

export function buildTimetableExercise(
  kind: DaysDatesTimeKind,
  rng: () => number,
): PracticeItem["task"] {
  const time = random24hQuarterTime(rng);
  return buildClockMatchForTime(kind, time, rng);
}

export function buildExactMinuteExercise(
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

export function buildZaCountdownExercise(
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
