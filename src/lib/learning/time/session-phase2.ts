import type { PracticeItem } from "$lib/learning/types";
import {
  analogFace,
  appointmentDayPartChoiceWhy,
  appointmentDayPartWrongWhy,
  appointmentDistractorWhy,
  appointmentPhrase,
  appointmentPhraseWithDayPart,
  aroundPhrase,
  dayPartDisambiguationPair,
  englishTimeGloss,
  isNoonTime,
  noonMidnightSelectAllChoices,
  oddOneOutChoicesFromDrafts,
  okoloChoiceWhy,
  okoloExactTrapWhy,
  oDurationAppointmentTrapWhy,
  oDurationHoursPhrase,
  oDurationHoursWhy,
  oDurationMinutesPhrase,
  oDurationMinutesWhy,
  randomFaceHour12,
  randomNoonOrMidnight,
  shuffleArray,
  type ClockFaceTime,
} from "./clock";
import { dayPartHint, okoloHint, oLocativeVsAccusativeHint } from "./hints";
import {
  enAroundPrompt,
  enDayPartEveningPrompt,
  enDayPartMorningPrompt,
  enExactAroundPrompt,
  enOddOneOutPrompt,
} from "./prompts";
import { pickTrapChoiceTask } from "./session-shared";
import type { DaysDatesTimeKind } from "./session-kinds";

export function buildDayPartExercise(
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

export function buildNoonMidnightExercise(
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

export function buildOkoloVsExactExercise(
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

export function buildODurationExercise(
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
