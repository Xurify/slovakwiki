import type { Lesson, LessonExercise } from "$lib/learning/types";
import { hodinaAgreementHint, okoloHint, registersHint } from "./hints";

export const daysDatesTimeLessonId = "everyday/days-dates-and-time";

export const daysDatesTimeVisual: NonNullable<Lesson["visual"]> = {
  type: "clock-grid",
  title: "Match the face to the phrase",
  items: [
    {
      time: { hour: 3, minute: 0 },
      slovak: "O tretej.",
      english: "At three o’clock.",
    },
    {
      time: { hour: 2, minute: 30 },
      slovak: "O pol tretej.",
      english: "At half past two.",
    },
    {
      time: { hour: 2, minute: 15 },
      slovak: "O štvrť na tri.",
      english: "At quarter past two.",
    },
    {
      time: { hour: 2, minute: 45 },
      slovak: "O trištvrte na tri.",
      english: "At quarter to three.",
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
    prompt: "At three o'clock.",
    clock: { hour: 3, minute: 0 },
    choices: [
      { id: "three", label: "O tretej." },
      {
        id: "four",
        label: "O štvrtej.",
        whyWrong: "**O štvrtej** is **4:00** — not **3:00**.",
      },
      {
        id: "half-past",
        label: "O pol tretej.",
        whyWrong: "**O pol tretej** is **2:30** — not **3:00**.",
      },
    ],
    answerId: "three",
    feedback: {
      correction: "O tretej.",
      english: "At three o’clock.",
      why: "Use **o** + the time for an appointment: **o tretej**.",
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
      english: "At half past two.",
      why: "**Pol tretej** is halfway to three, so it means **2:30**.",
    },
  },
  {
    id: "days-quarter-time",
    type: "choice",
    practiceItemId: "everyday/quarter-time",
    prompt: "At quarter to three.",
    clock: { hour: 2, minute: 45 },
    choices: [
      { id: "three-quarters", label: "O trištvrte na tri." },
      {
        id: "quarter",
        label: "O štvrť na tri.",
        whyWrong:
          "**O štvrť na tri** is **2:15** — quarter *past* two, not quarter *to* three.",
      },
      {
        id: "half-past",
        label: "O pol tretej.",
        whyWrong: "**O pol tretej** is **2:30** — not **2:45**.",
      },
    ],
    answerId: "three-quarters",
    feedback: {
      correction: "O trištvrte na tri.",
      english: "At quarter to three.",
      why: "**Trištvrte na tri** is three-quarters toward three, so it means **2:45**.",
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
        whyWrong: "This face shows **3:30** — you need **2:30**.",
      },
      {
        id: "quarter-to-three",
        clock: { hour: 2, minute: 45 },
        whyWrong: "This face shows **2:45** — you need **2:30**.",
      },
    ],
    answerId: "half-past-two",
    feedback: {
      correction: "O pol tretej.",
      english: "At half past two.",
      why: "**Pol tretej** counts toward three, so the face shows **2:30**.",
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
        whyWrong: "This face shows **2:45** — you need **2:15**.",
      },
      {
        id: "half-past-two",
        clock: { hour: 2, minute: 30 },
        whyWrong: "This face shows **2:30** — you need **2:15**.",
      },
    ],
    answerId: "quarter-past-two",
    feedback: {
      correction: "O štvrť na tri.",
      english: "At quarter past two.",
      why: "**Štvrť na tri** is one quarter toward three, so the face shows **2:15**.",
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
        whyWrong: "This face shows **2:15** — you need **2:45**.",
      },
      {
        id: "three-oclock",
        clock: { hour: 3, minute: 0 },
        whyWrong: "This face shows **3:00** — you need **2:45**.",
      },
    ],
    answerId: "quarter-to-three",
    feedback: {
      correction: "O trištvrte na tri.",
      english: "At quarter to three.",
      why: "**Trištvrte na tri** is three-quarters toward three, so the face shows **2:45**.",
    },
  },
  {
    id: "days-clock-quarter-past-ask",
    type: "choice",
    practiceItemId: "everyday/clock-quarter-past-ask",
    prompt: "Koľko je hodín?",
    promptLang: "sk",
    clock: { hour: 2, minute: 15 },
    hint: registersHint,
    choices: [
      { id: "quarter-past-two", label: "Je štvrť na tri." },
      {
        id: "quarter-to-three",
        label: "Je trištvrte na tri.",
        whyWrong: "**Trištvrte na tri** matches **2:45**, not **2:15**.",
      },
      {
        id: "half-past-two",
        label: "Je pol tretej.",
        whyWrong: "**Pol tretej** matches **2:30**, not **2:15**.",
      },
    ],
    answerId: "quarter-past-two",
    feedback: {
      correction: "Je štvrť na tri.",
      english: "It's quarter past two.",
      why: "**Štvrť na tri** is one quarter toward three, so the face shows **2:15**.",
    },
  },
  {
    id: "days-time-variants",
    type: "selectAll",
    practiceItemId: "everyday/time-variants",
    prompt: "Mark every correct way to say this time.",
    clock: { hour: 2, minute: 30 },
    choices: [
      { id: "pol-tretej", label: "Je pol tretej.", correct: true },
      {
        id: "pol-druhej",
        label: "Je pol druhej.",
        correct: false,
        whyWrong: "**Pol druhej** counts toward two — that's **1:30**, not **2:30**.",
      },
      { id: "hodiny-minuty", label: "Sú dve hodiny a tridsať minút.", correct: true },
      { id: "digital", label: "Dve tridsať.", correct: true },
    ],
    hint: hodinaAgreementHint,
    feedback: {
      correction: "Je pol tretej. / Sú dve hodiny a tridsať minút. / Dve tridsať.",
      english: "At half past two.",
      why: "Several forms name the same time. With **2–4** hours use **Sú** + **hodiny**.",
    },
  },
  {
    id: "days-okolo-vs-exact",
    type: "choice",
    practiceItemId: "everyday/okolo-vs-exact",
    prompt: "Around three o'clock. Which Slovak line fits?",
    clock: { hour: 3, minute: 0 },
    choices: [
      { id: "around", label: "Okolo tretej." },
      {
        id: "exact",
        label: "O tretej.",
        whyWrong: "**O tretej** is exact — the prompt asks for approximate **okolo**.",
      },
      {
        id: "quarter",
        label: "O štvrť na štyri.",
        whyWrong: "**O štvrť na štyri** is **3:15** — not around three o'clock.",
      },
    ],
    answerId: "around",
    hint: okoloHint,
    feedback: {
      correction: "Okolo tretej.",
      english: "Around three o'clock.",
      why: "**Okolo tretej** is approximate. **O tretej** would mean exactly at three.",
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
      english: "At three o’clock.",
      audio: { transcript: "O tretej." },
    },
    {
      slovak: "O pol tretej.",
      english: "At half past two.",
      note: "Literally, halfway to three.",
      audio: { transcript: "O pol tretej." },
    },
    {
      slovak: "Koľko je hodín?",
      english: "What time is it?",
      audio: { transcript: "Koľko je hodín?" },
    },
    {
      slovak: "O koľkej?",
      english: "At what time?",
      audio: { transcript: "O koľkej?" },
    },
    {
      slovak: "Je poludnie.",
      english: "It is noon.",
      audio: { transcript: "Je poludnie." },
    },
    {
      slovak: "Okolo tretej.",
      english: "Around three o'clock.",
      audio: { transcript: "Okolo tretej." },
    },
  ],
  pattern: {
    title: "Days, telling time, and appointments",
    body: "Use **v** + a day for when something happens: *Stretneme sa v utorok.* **Koľko je hodín?** asks what time it is → answer with **Je/Sú …**. **O koľkej?** or **Kedy?** ask when something happens → answer with **O …** for an appointment: *O tretej.* **O pol tretej** means 2:30, halfway to three. Quarters look ahead: *O štvrť na tri* is 2:15, *O trištvrte na tri* is 2:45. Add a day-part when the face is ambiguous: *O štvrť na sedem ráno* vs *večer*. **Okolo tretej** is approximate; **O tretej** is exact. At noon: **Je poludnie** / **O poludní** (or **O dvanástej napoludnie**). At midnight: **Je polnoc** / **O polnoci** (or **O dvanástej v noci**). Bare **O dvanástej** alone is ambiguous. For 1:00, **O jednej** is usual; **O prvej** is also heard.",
  },
  visual: daysDatesTimeVisual,
  exercises: [...daysDatesTimeGradedExercises, daysDatesTimePersonalExercise],
  referenceLinks: [
    { href: "/grammar/telling-time", label: "Telling time" },
    { href: "/grammar/numbers-and-numerals", label: "Numbers and numerals" },
    { href: "/grammar/questions", label: "Questions" },
  ],
};
