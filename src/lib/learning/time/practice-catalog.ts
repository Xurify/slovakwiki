import type { PracticeItem } from "$lib/learning/types";

const daysDatesTimeSource = {
  kind: "lesson" as const,
  label: "Days, dates, and time",
  href: "/lessons/everyday/days-dates-and-time",
};

const stubFeedback = {
  correction: "O tretej.",
  english: "At three o’clock.",
  why: "Session time varies — use **o** + the ordinal form (e.g. **o tretej**).",
};

/** Catalog stub for hub links, validation, and lesson practiceItemId — sessions materialize fresh tasks. */
export const daysDatesTimePracticeItems: PracticeItem[] = [
  {
    id: "everyday/day-meeting",
    source: daysDatesTimeSource,
    task: {
      id: "review-day-meeting",
      type: "build",
      practiceItemId: "everyday/day-meeting",
      prompt: "We are meeting on Tuesday.",
      tiles: ["v", "Stretneme", "utorok.", "sa"],
      answer: ["Stretneme", "sa", "v", "utorok."],
      feedback: {
        correction: "Stretneme sa v utorok.",
        english: "We are meeting on Tuesday.",
        why: "Use **v** + the day of the week for an appointment day: **v utorok**.",
      },
    },
    feedback: {
      correction: "Stretneme sa v utorok.",
      english: "We are meeting on Tuesday.",
      why: "Use **v** + the day of the week for an appointment day: **v utorok**.",
    },
  },
  stubClockMatch("everyday/meeting-time", "review-meeting-time"),
  stubClockMatch("everyday/half-past-time", "review-half-past-time"),
  stubClockMatch("everyday/quarter-time", "review-quarter-time"),
  stubClockMatch("everyday/clock-half-past-match", "review-clock-half-past-match"),
  stubClockMatch("everyday/clock-quarter-past-match", "review-clock-quarter-past-match"),
  stubClockMatch("everyday/clock-quarter-to-match", "review-clock-quarter-to-match"),
  stubTellingAsk("everyday/clock-quarter-past-ask", "review-clock-quarter-past-ask"),
  stubRegisterContrast("everyday/time-register", "review-time-register"),
  stubOddOneOut("everyday/time-variants", "review-time-variants"),
  stubPhraseChoice("everyday/day-part-time", "review-day-part-time"),
  stubOddOneOut("everyday/noon-midnight", "review-noon-midnight"),
  stubPhraseChoice("everyday/okolo-vs-exact", "review-okolo-vs-exact"),
  stubDurationContrast("everyday/o-duration", "review-o-duration"),
  stubClockMatch("everyday/timetable-24h", "review-timetable-24h"),
  stubClockMatch("everyday/exact-minute", "review-exact-minute"),
  stubOddOneOut("everyday/za-countdown", "review-za-countdown"),
  stubFrameChoice("everyday/frame-time-choice", "review-frame-time-choice"),
  stubFrameBuild("everyday/frame-time-build", "review-frame-time-build"),
  stubFrameTyped("everyday/frame-time-typed", "review-frame-time-typed"),
  stubFrameTyped("everyday/frame-negotiate", "review-frame-negotiate"),
];

export const daysDatesTimePracticeItemIds = daysDatesTimePracticeItems.map(
  (item) => item.id,
);

function stubClockMatch(id: string, taskId: string): PracticeItem {
  return {
    id,
    source: daysDatesTimeSource,
    task: {
      id: taskId,
      type: "choice",
      practiceItemId: id,
      prompt: "Ktoré hodiny ukazujú „pol tretej“?",
      promptLang: "sk",
      choiceStyle: "clock",
      choices: [
        { id: "a", clock: { hour: 2, minute: 30 } },
        {
          id: "b",
          clock: { hour: 3, minute: 30 },
          whyWrong: "This face shows half past three — not half past two.",
        },
      ],
      answerId: "a",
      feedback: stubFeedback,
    },
    feedback: stubFeedback,
  };
}

function stubTellingAsk(id: string, taskId: string): PracticeItem {
  return {
    id,
    source: daysDatesTimeSource,
    task: {
      id: taskId,
      type: "choice",
      practiceItemId: id,
      prompt: "Koľko je hodín?",
      promptLang: "sk",
      clock: { hour: 2, minute: 15 },
      choices: [
        { id: "a", label: "Je štvrť na tri." },
        {
          id: "b",
          label: "Je pol tretej.",
          whyWrong: "**Pol tretej** means half past two — not quarter past.",
        },
      ],
      answerId: "a",
      feedback: stubFeedback,
    },
    feedback: stubFeedback,
  };
}

function stubPhraseChoice(id: string, taskId: string): PracticeItem {
  return {
    id,
    source: daysDatesTimeSource,
    task: {
      id: taskId,
      type: "choice",
      practiceItemId: id,
      prompt: "Ktorý výraz znamená „3 o'clock in the morning“?",
      promptLang: "sk",
      clock: { hour: 3, minute: 0 },
      choices: [
        { id: "a", label: "O tretej ráno." },
        {
          id: "b",
          label: "O tretej večer.",
          whyWrong: "**Večer** marks evening — this prompt asks for morning.",
        },
      ],
      answerId: "a",
      feedback: stubFeedback,
    },
    feedback: stubFeedback,
  };
}

function stubRegisterContrast(id: string, taskId: string): PracticeItem {
  return {
    id,
    source: daysDatesTimeSource,
    task: {
      id: taskId,
      type: "choice",
      practiceItemId: id,
      prompt: "Ktorá odpoveď patrí k otázke „O koľkej?“?",
      promptLang: "sk",
      clock: { hour: 2, minute: 30 },
      choices: [
        { id: "a", label: "O pol tretej." },
        {
          id: "b",
          label: "Je pol tretej.",
          whyWrong:
            "**Je pol tretej** answers **Koľko je hodín?** — **O koľkej?** needs **O …**.",
        },
      ],
      answerId: "a",
      feedback: stubFeedback,
    },
    feedback: stubFeedback,
  };
}

function stubDurationContrast(id: string, taskId: string): PracticeItem {
  return {
    id,
    source: daysDatesTimeSource,
    task: {
      id: taskId,
      type: "choice",
      practiceItemId: id,
      prompt: "In two hours.",
      choices: [
        { id: "a", label: "O dve hodiny." },
        {
          id: "b",
          label: "O druhej.",
          whyWrong:
            "**O druhej** is **o** + locative — a clock appointment time, not a duration like **O dve hodiny**.",
        },
      ],
      answerId: "a",
      feedback: {
        correction: "O dve hodiny.",
        english: "In two hours.",
        why: "**O dve hodiny** means *in two hours* — **o** + accusative counts a **duration** forward from now, not a clock position.",
      },
    },
    feedback: {
      correction: "O dve hodiny.",
      english: "In two hours.",
      why: "**O dve hodiny** means *in two hours* — **o** + accusative counts a **duration** forward from now, not a clock position.",
    },
  };
}

function stubOddOneOut(id: string, taskId: string): PracticeItem {
  return {
    id,
    source: daysDatesTimeSource,
    task: {
      id: taskId,
      type: "choice",
      choiceMode: "pickTrap",
      practiceItemId: id,
      prompt: "Which phrase does not mean half past two?",
      clock: { hour: 2, minute: 30 },
      choices: [
        {
          id: "a",
          label: "Je pol tretej.",
          fits: true,
          whyWrong: "**Pol tretej** means half past two.",
        },
        {
          id: "b",
          label: "Je pol druhej.",
          whyWrong: "**Pol druhej** means half past one — not half past two.",
        },
      ],
      answerId: "b",
      feedback: stubFeedback,
    },
    feedback: stubFeedback,
  };
}

function stubFrameChoice(id: string, taskId: string): PracticeItem {
  return {
    id,
    source: daysDatesTimeSource,
    task: {
      id: taskId,
      type: "choice",
      practiceItemId: id,
      promptSk: "Film začína…",
      prompt: "The film starts at eight o'clock.",
      promptLang: "en",
      choices: [
        { id: "a", label: "O ôsmej." },
        {
          id: "b",
          label: "O ôsmej ráno.",
          whyWrong:
            "The prompt does not ask for morning — bare **O ôsmej** is enough here.",
        },
      ],
      answerId: "a",
      feedback: {
        correction: "O ôsmej.",
        english: "The film starts at eight o'clock.",
        why: "**O ôsmej** means eight o'clock. **Film** means film. **Začína** means starts.",
      },
    },
    feedback: {
      correction: "O ôsmej.",
      english: "The film starts at eight o'clock.",
      why: "**O ôsmej** means eight o'clock. **Film** means film. **Začína** means starts.",
    },
  };
}

function stubFrameBuild(id: string, taskId: string): PracticeItem {
  return {
    id,
    source: daysDatesTimeSource,
    task: {
      id: taskId,
      type: "build",
      practiceItemId: id,
      promptSk: "Obedujeme…",
      prompt: "We have lunch at twelve o'clock.",
      promptLang: "en",
      tiles: ["Obedujeme", "o", "dvanástej.", "začína"],
      answer: ["Obedujeme", "o", "dvanástej."],
      feedback: {
        correction: "Obedujeme o dvanástej.",
        english: "We have lunch at twelve o'clock.",
        why: "**O dvanástej** means twelve o'clock. **Obedujeme** means we have lunch.",
      },
    },
    feedback: {
      correction: "Obedujeme o dvanástej.",
      english: "We have lunch at twelve o'clock.",
      why: "**O dvanástej** means twelve o'clock. **Obedujeme** means we have lunch.",
    },
  };
}

function stubFrameTyped(id: string, taskId: string): PracticeItem {
  const isNegotiate = id.endsWith("negotiate");
  return {
    id,
    source: daysDatesTimeSource,
    task: {
      id: taskId,
      type: "typed",
      task: "complete",
      practiceItemId: id,
      context: isNegotiate
        ? [
            {
              id: "negotiate-utorok",
              speaker: "Anna",
              slovak: "Stretneme sa v utorok?",
              english: "Shall we meet on Tuesday?",
            },
            {
              id: "negotiate-proposal",
              speaker: "You",
              slovak: "Áno. O tretej?",
              english: "Yes. At three o'clock?",
            },
          ]
        : [
            {
              id: "frame-film-question",
              speaker: "Scene",
              slovak: "O koľkej začína film?",
              english: "When does the film start?",
            },
          ],
      prompt: isNegotiate ? "Better at half past two." : "At eight o'clock.",
      promptLang: "en",
      inputLabel: "Your Slovak answer",
      answer: isNegotiate ? "Lepšie o pol tretej." : "O ôsmej.",
      acceptedAnswers: isNegotiate ? ["O pol tretej."] : ["Film začína o ôsmej."],
      feedback: {
        correction: isNegotiate ? "Lepšie o pol tretej." : "O ôsmej.",
        english: isNegotiate ? "Better at half past two." : "At eight o'clock.",
        why: isNegotiate
          ? "**Lepšie** counters with a better time — **Lepšie o pol tretej** means *Better at half past two*."
          : "**O ôsmej** means eight o'clock. **Film** means film. **Začína** means starts.",
      },
    },
    feedback: {
      correction: isNegotiate ? "Lepšie o pol tretej." : "O ôsmej.",
      english: isNegotiate ? "Better at half past two." : "At eight o'clock.",
      why: isNegotiate
        ? "**Lepšie** counters with a better time — **Lepšie o pol tretej** means *Better at half past two*."
        : "**O ôsmej** means eight o'clock. **Film** means film. **Začína** means starts.",
    },
  };
}
