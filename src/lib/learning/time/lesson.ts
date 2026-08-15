import type { Lesson, LessonExercise } from "$lib/learning/types";
import {
  daysDatesTimeBeatShells,
  withDaysDatesTimeExercises,
} from "$lib/catalog/lessons/beats";
import {
  appointmentChoiceWhy,
  appointmentDistractorWhy,
  clockFaceDistractorWhy,
  englishTimeMeaningPhrase,
  oddOneOutFitWhy,
  oDurationAppointmentTrapWhy,
  oDurationHoursWhy,
  oDurationMinutesWhy,
  tellingChoiceWhy,
  tellingDistractorWhy,
  okoloChoiceWhy,
  okoloExactTrapWhy,
} from "./clock";
import {
  hodinaAgreementHint,
  okoloHint,
  oLocativeVsAccusativeHint,
  registersHint,
} from "./hints";
import { enAroundPrompt } from "./prompts";

type QuarterTime = { hour: number; minute: 0 | 15 | 30 | 45 };

const t = (hour: number, minute: 0 | 15 | 30 | 45): QuarterTime => ({ hour, minute });

export const daysDatesTimeLessonId = "everyday/days-dates-and-time";

export const daysDatesTimeVisual: NonNullable<Lesson["visual"]> = {
  type: "clock-grid",
  title: "Same face, two questions",
  items: [
    {
      time: { hour: 3, minute: 0 },
      slovak: "Sú tri hodiny.",
      english: "O koľkej? → O tretej.",
    },
    {
      time: { hour: 2, minute: 30 },
      slovak: "Je pol tretej.",
      english: "O koľkej? → O pol tretej.",
      note: "Halfway toward three.",
    },
    {
      time: { hour: 2, minute: 15 },
      slovak: "Je štvrť na tri.",
      english: "O koľkej? → O štvrť na tri.",
      note: "Toward three — 2:15.",
    },
    {
      time: { hour: 2, minute: 45 },
      slovak: "Je trištvrte na tri.",
      english: "O koľkej? → O trištvrte na tri.",
      note: "Three-quarters toward three — 2:45.",
    },
  ],
};

/** Graded exercises: typed, build, choice (text + clock), before the personal wrap-up. */
export const daysDatesTimeGradedExercises: LessonExercise[] = [
  {
    id: "days-meeting-day",
    type: "typed",
    task: "complete",
    practiceItemId: "everyday/day-meeting",
    prompt: "We will meet on Tuesday.",
    inputLabel: "Your Slovak answer",
    answer: "Stretneme sa v utorok.",
    feedback: {
      correction: "Stretneme sa v utorok.",
      english: "We will meet on Tuesday.",
      why: "Use **v** before the day when arranging a meeting.",
    },
  },
  {
    id: "days-meeting-time",
    type: "choice",
    practiceItemId: "everyday/meeting-time",
    prompt: "Ktoré hodiny ukazujú „o tretej“?",
    promptLang: "sk",
    choiceStyle: "clock",
    choices: [
      { id: "three", clock: { hour: 3, minute: 0 } },
      {
        id: "four",
        clock: { hour: 4, minute: 0 },
        whyWrong: clockFaceDistractorWhy(t(3, 0), t(4, 0)),
      },
      {
        id: "half-past",
        clock: { hour: 2, minute: 30 },
        whyWrong: clockFaceDistractorWhy(t(3, 0), t(2, 30)),
      },
    ],
    answerId: "three",
    feedback: {
      correction: "O tretej.",
      english: "3:00 — three o’clock.",
      why: appointmentChoiceWhy(t(3, 0)),
    },
  },
  {
    id: "days-half-past",
    type: "build",
    practiceItemId: "everyday/half-past-time",
    prompt: "At two thirty.",
    tiles: ["tretej.", "O", "pol"],
    answer: ["O", "pol", "tretej."],
    feedback: {
      correction: "O pol tretej.",
      english: "2:30 — half past two.",
      why: appointmentChoiceWhy(t(2, 30)),
    },
  },
  {
    id: "days-quarter-time",
    type: "choice",
    practiceItemId: "everyday/quarter-time",
    prompt: "Ktoré hodiny ukazujú „trištvrte na tri“?",
    promptLang: "sk",
    choiceStyle: "clock",
    choices: [
      { id: "three-quarters", clock: { hour: 2, minute: 45 } },
      {
        id: "quarter",
        clock: { hour: 2, minute: 15 },
        whyWrong: clockFaceDistractorWhy(t(2, 45), t(2, 15)),
      },
      {
        id: "half-past",
        clock: { hour: 2, minute: 30 },
        whyWrong: clockFaceDistractorWhy(t(2, 45), t(2, 30)),
      },
    ],
    answerId: "three-quarters",
    feedback: {
      correction: "O trištvrte na tri.",
      english: "2:45 — quarter to three.",
      why: appointmentChoiceWhy(t(2, 45)),
    },
  },
  {
    id: "days-clock-half-past",
    type: "choice",
    practiceItemId: "everyday/clock-half-past-match",
    prompt: "Ktoré hodiny ukazujú „pol tretej“?",
    promptLang: "sk",
    choiceStyle: "clock",
    choices: [
      { id: "half-past-two", clock: { hour: 2, minute: 30 } },
      {
        id: "half-past-three",
        clock: { hour: 3, minute: 30 },
        whyWrong: clockFaceDistractorWhy(t(2, 30), t(3, 30)),
      },
      {
        id: "quarter-to-three",
        clock: { hour: 2, minute: 45 },
        whyWrong: clockFaceDistractorWhy(t(2, 30), t(2, 45)),
      },
    ],
    answerId: "half-past-two",
    feedback: {
      correction: "O pol tretej.",
      english: "2:30 — half past two.",
      why: appointmentChoiceWhy(t(2, 30)),
    },
  },
  {
    id: "days-clock-quarter-past",
    type: "choice",
    practiceItemId: "everyday/clock-quarter-past-match",
    prompt: "Ktoré hodiny ukazujú „štvrť na tri“?",
    promptLang: "sk",
    choiceStyle: "clock",
    choices: [
      { id: "quarter-past-two", clock: { hour: 2, minute: 15 } },
      {
        id: "quarter-to-three",
        clock: { hour: 2, minute: 45 },
        whyWrong: clockFaceDistractorWhy(t(2, 15), t(2, 45)),
      },
      {
        id: "half-past-two",
        clock: { hour: 2, minute: 30 },
        whyWrong: clockFaceDistractorWhy(t(2, 15), t(2, 30)),
      },
    ],
    answerId: "quarter-past-two",
    feedback: {
      correction: "O štvrť na tri.",
      english: "2:15 — quarter past two.",
      why: appointmentChoiceWhy(t(2, 15)),
    },
  },
  {
    id: "days-clock-quarter-to",
    type: "choice",
    practiceItemId: "everyday/clock-quarter-to-match",
    prompt: "Ktoré hodiny ukazujú „trištvrte na tri“?",
    promptLang: "sk",
    choiceStyle: "clock",
    choices: [
      { id: "quarter-to-three", clock: { hour: 2, minute: 45 } },
      {
        id: "quarter-past-two",
        clock: { hour: 2, minute: 15 },
        whyWrong: clockFaceDistractorWhy(t(2, 45), t(2, 15)),
      },
      {
        id: "three-oclock",
        clock: { hour: 3, minute: 0 },
        whyWrong: clockFaceDistractorWhy(t(2, 45), t(3, 0)),
      },
    ],
    answerId: "quarter-to-three",
    feedback: {
      correction: "O trištvrte na tri.",
      english: "2:45 — quarter to three.",
      why: appointmentChoiceWhy(t(2, 45)),
    },
  },
  {
    id: "days-clock-quarter-past-ask",
    type: "choice",
    practiceItemId: "everyday/clock-quarter-past-ask",
    prompt: "Koľko je hodín?",
    promptLang: "sk",
    clock: { hour: 2, minute: 15 },
    choices: [
      { id: "correct", label: "Je štvrť na tri." },
      {
        id: "quarter-to-three",
        label: "Je trištvrte na tri.",
        whyWrong: tellingDistractorWhy(t(2, 15), t(2, 45)),
      },
      {
        id: "half-past-two",
        label: "Je pol tretej.",
        whyWrong: tellingDistractorWhy(t(2, 15), t(2, 30)),
      },
    ],
    answerId: "correct",
    hint: registersHint,
    feedback: {
      correction: "Je štvrť na tri.",
      english: "It's quarter past two.",
      why: tellingChoiceWhy(t(2, 15)),
    },
  },
  {
    id: "days-time-register",
    type: "choice",
    practiceItemId: "everyday/time-register",
    prompt: "Ktorá odpoveď patrí k otázke „O koľkej?“?",
    promptLang: "sk",
    clock: { hour: 2, minute: 30 },
    choices: [
      { id: "appointment", label: "O pol tretej." },
      {
        id: "telling",
        label: "Je pol tretej.",
        whyWrong:
          "**Je pol tretej** answers **Koľko je hodín?** — **O koľkej?** needs **O …**.",
      },
      {
        id: "wrong-time",
        label: "O pol štvrtej.",
        whyWrong: appointmentDistractorWhy(t(2, 30), t(3, 30)),
      },
    ],
    answerId: "appointment",
    hint: registersHint,
    feedback: {
      correction: "O pol tretej.",
      english: "2:30 — half past two.",
      why: "**O koľkej?** asks when something happens → answer with **O …**: **O pol tretej**.",
    },
  },
  {
    id: "days-o-duration-hours",
    type: "build",
    practiceItemId: "everyday/o-duration",
    prompt: "In two hours.",
    tiles: ["hodiny.", "O", "dve"],
    answer: ["O", "dve", "hodiny."],
    feedback: {
      correction: "O dve hodiny.",
      english: "In two hours.",
      why: oDurationHoursWhy(2),
    },
  },
  {
    id: "days-o-duration-contrast",
    type: "choice",
    practiceItemId: "everyday/o-duration",
    prompt: "In five minutes.",
    choices: [
      { id: "duration", label: "O päť minút." },
      {
        id: "appointment",
        label: "O piatej.",
        whyWrong: oDurationAppointmentTrapWhy("O päť minút.", "O piatej."),
      },
      {
        id: "wrong-count",
        label: "O dve minúty.",
        whyWrong:
          "**O dve minúty** means *in two minutes* — the prompt asks for *in five minutes*.",
      },
    ],
    answerId: "duration",
    hint: oLocativeVsAccusativeHint,
    feedback: {
      correction: "O päť minút.",
      english: "In five minutes.",
      why: oDurationMinutesWhy(5),
    },
  },
  {
    id: "days-time-variants",
    type: "choice",
    practiceItemId: "everyday/time-variants",
    prompt: "Which phrase does not mean half past two?",
    clock: { hour: 2, minute: 30 },
    choiceMode: "pickTrap",
    choices: [
      {
        id: "pol-tretej",
        label: "Je pol tretej.",
        fits: true,
        whyWrong: oddOneOutFitWhy("Je pol tretej.", englishTimeMeaningPhrase(t(2, 30))),
      },
      {
        id: "pol-druhej",
        label: "Je pol druhej.",
        whyWrong: tellingDistractorWhy(t(2, 30), t(1, 30)),
      },
      {
        id: "hodiny-minuty",
        label: "Sú dve hodiny a tridsať minút.",
        fits: true,
        whyWrong: oddOneOutFitWhy(
          "Sú dve hodiny a tridsať minút.",
          englishTimeMeaningPhrase(t(2, 30)),
        ),
      },
      {
        id: "digital",
        label: "Dve tridsať.",
        fits: true,
        whyWrong: oddOneOutFitWhy("Dve tridsať.", englishTimeMeaningPhrase(t(2, 30))),
      },
    ],
    answerId: "pol-druhej",
    hint: hodinaAgreementHint,
    feedback: {
      correction: "Je pol druhej.",
      english: "2:30 — half past two.",
      why: tellingDistractorWhy(t(2, 30), t(1, 30)),
    },
  },
  {
    id: "days-okolo-vs-exact",
    type: "choice",
    practiceItemId: "everyday/okolo-vs-exact",
    prompt: enAroundPrompt(t(3, 0)),
    promptLang: "sk",
    clock: { hour: 3, minute: 0 },
    choices: [
      { id: "around", label: "Okolo tretej." },
      {
        id: "exact",
        label: "O tretej.",
        whyWrong: okoloExactTrapWhy("exact", "O tretej.", t(3, 0)),
      },
      {
        id: "quarter",
        label: "O štvrť na štyri.",
        whyWrong: appointmentDistractorWhy(t(3, 0), t(3, 15)),
      },
    ],
    answerId: "around",
    hint: okoloHint,
    feedback: {
      correction: "Okolo tretej.",
      english: "Around three o'clock.",
      why: okoloChoiceWhy(t(3, 0), "around"),
    },
  },
];

export const daysDatesTimePersonalExercise: LessonExercise = {
  id: "days-personal",
  type: "personal",
  prompt: "Arrange a real or imagined meeting: choose a day and a time.",
  example: "Stretneme sa v piatok o tretej.",
};

export const daysDatesTimeLesson: Lesson = {
  id: daysDatesTimeLessonId,
  track: "everyday",
  slug: "days-dates-and-time",
  group: "Core tools",
  title: "Days, dates, and time",
  promise: "Arrange a meeting with a day and a clock time.",
  scene: [
    {
      id: "meeting-today",
      speaker: "Anna",
      slovak: "Dnes je pondelok.",
      english: "Today is Monday.",
      audio: { transcript: "Dnes je pondelok." },
    },
    {
      id: "meeting-suggestion",
      speaker: "Anna",
      slovak: "Stretneme sa v utorok?",
      english: "Shall we meet on Tuesday?",
      audio: { transcript: "Stretneme sa v utorok?" },
    },
    {
      id: "meeting-time",
      speaker: "You",
      slovak: "Áno. O tretej?",
      english: "Yes. At three?",
      audio: { transcript: "Áno. O tretej?" },
      sayChoices: {
        answerId: "at-three",
        choices: [
          { id: "at-three", label: "Áno. O tretej?" },
          {
            id: "at-two",
            label: "Áno. O druhej?",
            whyWrong:
              "**O druhej** is at two — the reply here is **o tretej** (at three).",
          },
          {
            id: "duration",
            label: "Áno. O tri hodiny.",
            whyWrong:
              "**O tri hodiny** means in three hours — for clock time use locative **o tretej**.",
          },
        ],
      },
    },
    {
      id: "meeting-half-past",
      speaker: "Anna",
      slovak: "Lepšie o pol tretej.",
      english: "Better at half past two.",
      audio: { transcript: "Lepšie o pol tretej." },
    },
  ],
  keyPhrases: [
    {
      slovak: "Dnes je pondelok.",
      english: "Today is Monday.",
      audio: { transcript: "Dnes je pondelok." },
    },
    {
      slovak: "Stretneme sa v utorok.",
      english: "We will meet on Tuesday.",
      audio: { transcript: "Stretneme sa v utorok." },
    },
    {
      slovak: "O tretej.",
      english: "3:00 — three o’clock.",
      audio: { transcript: "O tretej." },
    },
    {
      slovak: "O pol tretej.",
      english: "2:30 — half past two.",
      note: "Literally, halfway to three.",
      audio: { transcript: "O pol tretej." },
    },
    {
      slovak: "O štvrť na tri.",
      english: "2:15 — quarter past two.",
      note: "Quarters name the hour ahead, like pol tretej.",
      audio: { transcript: "O štvrť na tri." },
    },
    {
      slovak: "Film začína o ôsmej.",
      english: "The film starts at eight o'clock.",
      audio: { transcript: "Film začína o ôsmej." },
    },
    {
      slovak: "Obedujeme o dvanástej.",
      english: "We have lunch at twelve o'clock.",
      audio: { transcript: "Obedujeme o dvanástej." },
    },
    {
      slovak: "Vlak odchádza o tretej.",
      english: "The train leaves at three o'clock.",
      audio: { transcript: "Vlak odchádza o tretej." },
    },
    {
      slovak: "O jednej.",
      english: "1:00 — one o'clock.",
      note: "1:00 is O jednej — not ordinal O prvej.",
      audio: { transcript: "O jednej." },
    },
    {
      slovak: "Koľko je hodín?",
      english: "What time is it?",
      audio: { transcript: "Koľko je hodín?" },
    },
    {
      slovak: "O koľkej?",
      english: "At what time?",
      note: "Kedy? works the same way — answer with O …",
      audio: { transcript: "O koľkej?" },
    },
    {
      slovak: "Je poludnie.",
      english: "It is noon.",
      note: "Midnight: Je polnoc. Appointments: O poludní or O polnoci.",
      audio: { transcript: "Je poludnie." },
    },
    {
      slovak: "O štvrť na sedem večer.",
      english: "At quarter past six in the evening.",
      note: "Add ráno, večer, or v noci when AM/PM matters.",
      audio: { transcript: "O štvrť na sedem večer." },
    },
    {
      slovak: "Okolo tretej.",
      english: "Around three o'clock.",
      note: "Approximate. O tretej is exact.",
      audio: { transcript: "Okolo tretej." },
    },
    {
      slovak: "O dve hodiny.",
      english: "In two hours.",
      note: "Duration from now — o + accusative. Compare O tretej (at three, locative).",
      audio: { transcript: "O dve hodiny." },
    },
    {
      slovak: "O päť minút.",
      english: "In five minutes.",
      note: "Same pattern for minutes: o + accusative counts forward.",
      audio: { transcript: "O päť minút." },
    },
  ],
  pattern: {
    title: "Days, telling time, and appointments",
    body: "**Koľko je hodín?** → **Je/Sú …**. **O koľkej?** or **Kedy?** → **O tretej** (locative). **In X hours/minutes** → **O dve hodiny** / **O päť minút** (accusative). Use **v** + day: *v utorok*.",
  },
  visual: daysDatesTimeVisual,
  beats: withDaysDatesTimeExercises(
    daysDatesTimeBeatShells,
    [...daysDatesTimeGradedExercises, daysDatesTimePersonalExercise],
    daysDatesTimeVisual,
  ),
  referenceLinks: [
    { href: "/grammar/telling-time", label: "Telling time" },
    { href: "/grammar/numbers-and-numerals", label: "Numbers and numerals" },
    { href: "/grammar/questions", label: "Questions" },
  ],
};
