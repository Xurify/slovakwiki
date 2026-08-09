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
  stubClockMatch("everyday/timetable-24h", "review-timetable-24h"),
  stubClockMatch("everyday/exact-minute", "review-exact-minute"),
  stubOddOneOut("everyday/za-countdown", "review-za-countdown"),
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
