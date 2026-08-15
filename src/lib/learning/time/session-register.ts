import type { PracticeItem } from "$lib/learning/types";
import {
  analogFace,
  appointmentDistractorWhy,
  appointmentPhrase,
  englishTimeGloss,
  englishTimeMeaningPhrase,
  nearMissTimes,
  oddOneOutChoicesFromDrafts,
  randomFaceHour12,
  randomQuarterMinute,
  selectAllChoicesForTime,
  shuffleArray,
  tellingDistractorWhy,
  tellingTimeLabel,
  type ClockFaceTime,
} from "./clock";
import { hodinaAgreementHint, registersHint } from "./hints";
import { enOddOneOutPrompt } from "./prompts";
import { phraseForWhy, pickTrapChoiceTask } from "./session-shared";
import type { DaysDatesTimeKind } from "./session-kinds";

export function buildRegisterContrastExercise(
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

export function buildTimeVariantsOddOneOutExercise(
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
