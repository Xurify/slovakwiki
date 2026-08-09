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

/** Catalog stubs for hub links, validation, and lesson practiceItemId — sessions materialize fresh tasks. */
export const daysDatesTimePracticeItems: PracticeItem[] = [
  {
    id: "everyday/day-meeting",
    source: daysDatesTimeSource,
    task: {
      id: "review-day-meeting",
      type: "build",
      practiceItemId: "everyday/day-meeting",
      prompt: "We are meeting on Tuesday.",
      tiles: ["v", "Stretneme", "utorok.", "sa", "utorok."],
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
  stubChoice("everyday/meeting-time", "review-meeting-time"),
  stubChoice("everyday/half-past-time", "review-half-past-time"),
  stubChoice("everyday/quarter-time", "review-quarter-time"),
  stubClockMatch("everyday/clock-half-past-match", "review-clock-half-past-match"),
  stubClockMatch("everyday/clock-quarter-past-match", "review-clock-quarter-past-match"),
  stubClockMatch("everyday/clock-quarter-to-match", "review-clock-quarter-to-match"),
  stubChoice("everyday/clock-quarter-past-ask", "review-clock-quarter-past-ask"),
  stubSelectAll("everyday/time-variants", "review-time-variants"),
  stubChoice("everyday/day-part-time", "review-day-part-time"),
  stubSelectAll("everyday/noon-midnight", "review-noon-midnight"),
  stubChoice("everyday/okolo-vs-exact", "review-okolo-vs-exact"),
  stubChoice("everyday/timetable-24h", "review-timetable-24h"),
  stubChoice("everyday/exact-minute", "review-exact-minute"),
  stubChoice("everyday/za-countdown", "review-za-countdown"),
];

export const daysDatesTimePracticeItemIds = daysDatesTimePracticeItems.map(
  (item) => item.id,
);

function stubChoice(id: string, taskId: string): PracticeItem {
  return {
    id,
    source: daysDatesTimeSource,
    task: {
      id: taskId,
      type: "choice",
      practiceItemId: id,
      prompt: "When is the meeting?",
      clock: { hour: 3, minute: 0 },
      choices: [
        { id: "a", label: "O tretej." },
        { id: "b", label: "O pol tretej." },
      ],
      answerId: "a",
      feedback: stubFeedback,
    },
    feedback: stubFeedback,
  };
}

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
        { id: "b", clock: { hour: 3, minute: 30 } },
      ],
      answerId: "a",
      feedback: stubFeedback,
    },
    feedback: stubFeedback,
  };
}

function stubSelectAll(id: string, taskId: string): PracticeItem {
  return {
    id,
    source: daysDatesTimeSource,
    task: {
      id: taskId,
      type: "selectAll",
      practiceItemId: id,
      prompt: "Mark every correct way to say this time.",
      clock: { hour: 2, minute: 30 },
      choices: [
        { id: "a", label: "Je pol tretej.", correct: true },
        { id: "b", label: "Je pol druhej.", correct: false },
      ],
      feedback: stubFeedback,
    },
    feedback: stubFeedback,
  };
}
