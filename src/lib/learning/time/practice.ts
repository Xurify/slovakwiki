import type { PracticeItem } from "$lib/learning/types";

const daysDatesTimeSource = {
  kind: "lesson" as const,
  label: "Days, dates, and time",
  href: "/lessons/everyday/days-dates-and-time",
};

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
        why: "Use v + the day of the week for an appointment day: v utorok.",
      },
    },
    feedback: {
      correction: "Stretneme sa v utorok.",
      english: "We are meeting on Tuesday.",
      why: "Use v + the day of the week for an appointment day: v utorok.",
    },
  },
  {
    id: "everyday/meeting-time",
    source: daysDatesTimeSource,
    task: {
      id: "review-meeting-time",
      type: "choice",
      practiceItemId: "everyday/meeting-time",
      prompt: "When is the meeting? It is at three o’clock.",
      clock: { hour: 3, minute: 0 },
      choices: [
        { id: "three", label: "O tretej." },
        { id: "half-three", label: "O pol tretej." },
        { id: "four", label: "O štvrtej." },
      ],
      answerId: "three",
      feedback: {
        correction: "O tretej.",
        english: "At three o’clock.",
        why: "Use o + the ordinal time form to say when: o tretej.",
      },
    },
    feedback: {
      correction: "O tretej.",
      english: "At three o’clock.",
      why: "Use o + the ordinal time form to say when: o tretej.",
    },
  },
  {
    id: "everyday/half-past-time",
    source: daysDatesTimeSource,
    task: {
      id: "review-half-past-time",
      type: "choice",
      practiceItemId: "everyday/half-past-time",
      prompt: "Your train leaves at 2:30. Which time should you say?",
      clock: { hour: 2, minute: 30 },
      choices: [
        { id: "half-past-two", label: "O pol tretej." },
        { id: "three", label: "O tretej." },
        { id: "half-past-three", label: "O pol štvrtej." },
      ],
      answerId: "half-past-two",
      feedback: {
        correction: "O pol tretej.",
        english: "At half past two.",
        why: "Slovak counts the half-hour toward the next hour: pol tretej is 2:30.",
      },
    },
    feedback: {
      correction: "O pol tretej.",
      english: "At half past two.",
      why: "Slovak counts the half-hour toward the next hour: pol tretej is 2:30.",
    },
  },
  {
    id: "everyday/quarter-time",
    source: daysDatesTimeSource,
    task: {
      id: "review-quarter-time",
      type: "choice",
      practiceItemId: "everyday/quarter-time",
      prompt: "The film starts at 2:45. Which time should you say?",
      clock: { hour: 2, minute: 45 },
      choices: [
        { id: "three-quarters", label: "O trištvrte na tri." },
        { id: "quarter", label: "O štvrť na tri." },
        { id: "half-past", label: "O pol tretej." },
      ],
      answerId: "three-quarters",
      feedback: {
        correction: "O trištvrte na tri.",
        english: "At quarter to three.",
        why: "Trištvrte na tri is three-quarters toward three, so it means 2:45.",
      },
    },
    feedback: {
      correction: "O trištvrte na tri.",
      english: "At quarter to three.",
      why: "Trištvrte na tri is three-quarters toward three, so it means 2:45.",
    },
  },
  {
    id: "everyday/clock-half-past-match",
    source: daysDatesTimeSource,
    task: {
      id: "review-clock-half-past-match",
      type: "choice",
      practiceItemId: "everyday/clock-half-past-match",
      prompt: "Ktorý čas je o pol tretej?",
      promptLang: "sk",
      choiceStyle: "clock",
      choices: [
        { id: "half-past-two", clock: { hour: 2, minute: 30 } },
        { id: "half-past-three", clock: { hour: 3, minute: 30 } },
        { id: "quarter-to-three", clock: { hour: 2, minute: 45 } },
      ],
      answerId: "half-past-two",
      feedback: {
        correction: "O pol tretej.",
        english: "At half past two.",
        why: "Pol tretej counts toward three, so the face shows 2:30.",
      },
    },
    feedback: {
      correction: "O pol tretej.",
      english: "At half past two.",
      why: "Pol tretej counts toward three, so the face shows 2:30.",
    },
  },
  {
    id: "everyday/clock-quarter-past-match",
    source: daysDatesTimeSource,
    task: {
      id: "review-clock-quarter-past-match",
      type: "choice",
      practiceItemId: "everyday/clock-quarter-past-match",
      prompt: "Ktorý čas je o štvrť na tri?",
      promptLang: "sk",
      choiceStyle: "clock",
      choices: [
        { id: "quarter-past-two", clock: { hour: 2, minute: 15 } },
        { id: "quarter-to-three", clock: { hour: 2, minute: 45 } },
        { id: "half-past-two", clock: { hour: 2, minute: 30 } },
      ],
      answerId: "quarter-past-two",
      feedback: {
        correction: "O štvrť na tri.",
        english: "At quarter past two.",
        why: "Štvrť na tri is one quarter toward three, so the face shows 2:15.",
      },
    },
    feedback: {
      correction: "O štvrť na tri.",
      english: "At quarter past two.",
      why: "Štvrť na tri is one quarter toward three, so the face shows 2:15.",
    },
  },
  {
    id: "everyday/clock-quarter-to-match",
    source: daysDatesTimeSource,
    task: {
      id: "review-clock-quarter-to-match",
      type: "choice",
      practiceItemId: "everyday/clock-quarter-to-match",
      prompt: "Ktorý čas je o trištvrte na tri?",
      promptLang: "sk",
      choiceStyle: "clock",
      choices: [
        { id: "quarter-to-three", clock: { hour: 2, minute: 45 } },
        { id: "quarter-past-two", clock: { hour: 2, minute: 15 } },
        { id: "three-oclock", clock: { hour: 3, minute: 0 } },
      ],
      answerId: "quarter-to-three",
      feedback: {
        correction: "O trištvrte na tri.",
        english: "At quarter to three.",
        why: "Trištvrte na tri is three-quarters toward three, so the face shows 2:45.",
      },
    },
    feedback: {
      correction: "O trištvrte na tri.",
      english: "At quarter to three.",
      why: "Trištvrte na tri is three-quarters toward three, so the face shows 2:45.",
    },
  },
];

export const daysDatesTimePracticeItemIds = daysDatesTimePracticeItems.map(
  (item) => item.id,
);
