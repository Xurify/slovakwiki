import type { LessonTrackId } from "$lib/learning/types";
import {
  DEMONSTRATIVES_SESSION_SIZE,
  demonstrativesPracticeItemIds,
} from "$lib/learning/demonstratives/session";
import {
  POSSESSIVES_SESSION_SIZE,
  possessivesPracticeItemIds,
} from "$lib/learning/possessives/session";
import { daysDatesTimePracticeItemIds } from "$lib/learning/time/practice-catalog";

export interface PracticeSet {
  id: string;
  itemIds: string[];
  lessonId: string;
  previewItemId?: string;
  sessionSize?: number;
  sessionKind?: "days-dates-time" | "possessives" | "demonstratives";
  summary?: string;
  title: string;
  track: LessonTrackId;
}

export const practiceSets: PracticeSet[] = [
  {
    id: "meet-someone",
    lessonId: "everyday/meet-someone",
    title: "Greetings and introductions",
    summary: "Greet someone politely, introduce yourself, and say where you are from.",
    track: "everyday",
    itemIds: ["everyday/formal-greeting", "everyday/introduction", "everyday/origin"],
  },
  {
    id: "meeting-questions",
    lessonId: "everyday/meet-someone",
    title: "Questions when meeting someone",
    summary:
      "Return a greeting, ask where someone is from, and say how much Slovak you speak.",
    track: "everyday",
    itemIds: [
      "everyday/nice-to-meet-you",
      "everyday/ask-origin",
      "everyday/speak-a-little",
    ],
  },
  {
    id: "present-tense-i",
    lessonId: "grammar/present-tense-i",
    title: "Present-tense endings",
    summary:
      "Seven random drills from a pool covering all six person endings on verbs like čítať, hovoriť, and pracovať.",
    track: "grammar",
    previewItemId: "grammar/cloze-formal-speaking",
    sessionSize: 7,
    itemIds: [
      "grammar/cloze-first-person-reading",
      "grammar/cloze-second-person-speaking",
      "grammar/cloze-third-person-reading",
      "grammar/cloze-we-reading",
      "grammar/cloze-formal-speaking",
      "grammar/cloze-they-reading",
      "grammar/cloze-first-person-working",
      "grammar/cloze-second-person-working",
      "grammar/first-person-reading",
      "grammar/today-reading",
      "grammar/choice-they-reading",
      "grammar/choice-formal-speaking",
      "grammar/repair-first-person-reading",
      "grammar/repair-second-person-speaking",
      "grammar/build-we-reading",
    ],
  },
  {
    id: "first-syllable-stress",
    lessonId: "pronunciation/first-syllable-stress",
    title: "First-syllable stress",
    summary: "Find the first-syllable beat in everyday words.",
    track: "pronunciation",
    itemIds: ["pronunciation/dakujem-stress", "pronunciation/bratislava-stress"],
  },
  {
    id: "stress-in-phrases",
    lessonId: "pronunciation/first-syllable-stress",
    title: "Stress in useful phrases",
    summary: "Keep the first beat steady when thanking someone or offering help.",
    track: "pronunciation",
    itemIds: ["pronunciation/thanks-phrase", "pronunciation/pomozem-stress"],
  },
  {
    id: "numbers-and-personal-details",
    lessonId: "everyday/numbers-and-personal-details",
    title: "Numbers and personal details",
    summary: "Say your age, read phone digits, and ask how much is it.",
    track: "everyday",
    itemIds: [
      "everyday/age-with-rokov",
      "everyday/phone-number-digits",
      "everyday/how-much-does-it-cost",
    ],
  },
  {
    id: "days-dates-and-time",
    lessonId: "everyday/days-dates-and-time",
    title: "Days, dates, and time",
    summary:
      "Arrange a meeting day and practice clock times — day-parts, noon, 24h, and fresh faces each session.",
    track: "everyday",
    sessionKind: "days-dates-time",
    sessionSize: 13,
    itemIds: [...daysDatesTimePracticeItemIds],
  },
  {
    id: "negation-in-conversation",
    lessonId: "everyday/negation-in-conversation",
    title: "Negation in conversation",
    summary: "Decline politely and use negative verb forms in everyday replies.",
    track: "everyday",
    itemIds: [
      "everyday/negative-answer",
      "everyday/not-understand",
      "everyday/negative-verb-placement",
    ],
  },
  {
    id: "byt-present",
    lessonId: "grammar/byt-present",
    title: "Present forms of byť",
    summary:
      "Introduce yourself, address someone formally, and place a person in Bratislava.",
    track: "grammar",
    itemIds: ["grammar/byt-som", "grammar/byt-ste", "grammar/byt-je-location"],
  },
  {
    id: "mat-present",
    lessonId: "grammar/mat-present",
    title: "Present forms of mať",
    summary: "Say what you have, ask a friend about a ticket, and negate mať naturally.",
    track: "grammar",
    itemIds: ["grammar/mat-mam", "grammar/mat-mas", "grammar/mat-nemam"],
  },
  {
    id: "possessives",
    lessonId: "grammar/possessives",
    title: "Possessives: môj, jeho, svoj",
    summary:
      "Fresh drills every session — agreement, svoj vs. jeho, all six cases, čí, Petrov / Annina, and the naším / našim trap.",
    track: "grammar",
    sessionKind: "possessives",
    sessionSize: POSSESSIVES_SESSION_SIZE,
    itemIds: [...possessivesPracticeItemIds],
  },
  {
    id: "demonstratives",
    lessonId: "grammar/demonstratives",
    title: "Demonstratives: ten, tento, tamten",
    summary:
      "Fresh drills every session — ten / tá / to, tí vs. tie, to je, tento vs. tamten, all six cases, toho vs. ten, and the tým / tými trap.",
    track: "grammar",
    sessionKind: "demonstratives",
    sessionSize: DEMONSTRATIVES_SESSION_SIZE,
    itemIds: [...demonstrativesPracticeItemIds],
  },
];
