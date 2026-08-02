import type { LessonTrackId, PracticeItem } from "./learning-types";

export interface PracticeSet {
  id: string;
  itemIds: string[];
  lessonId: string;
  title: string;
  track: LessonTrackId;
}

export const practiceItems: PracticeItem[] = [
  {
    id: "everyday/formal-greeting",
    source: {
      kind: "lesson",
      label: "Meet someone",
      href: "/lessons/everyday/meet-someone",
    },
    task: {
      id: "review-formal-greeting",
      type: "choice",
      practiceItemId: "everyday/formal-greeting",
      prompt: "You arrive at a clinic and meet the receptionist for the first time. Which greeting fits?",
      choices: [
        { id: "formal", label: "Dobrý deň." },
        { id: "informal", label: "Ahoj!" },
        { id: "leaving", label: "Dovidenia." },
      ],
      answerId: "formal",
      feedback: {
        correction: "Dobrý deň.",
        english: "Hello; good day.",
        why: "This is a new, polite interaction. Use Dobrý deň; Ahoj is informal.",
      },
    },
    feedback: {
      correction: "Dobrý deň.",
      english: "Hello; good day.",
      why: "This is a new, polite interaction. Use Dobrý deň; Ahoj is informal.",
    },
  },
  {
    id: "everyday/introduction",
    source: {
      kind: "lesson",
      label: "Meet someone",
      href: "/lessons/everyday/meet-someone",
    },
    task: {
      id: "review-introduction",
      type: "build",
      practiceItemId: "everyday/introduction",
      prompt: "A colleague says Volám sa Marta. Build your reply: “Hello. My name is Alex.”",
      tiles: ["Alex.", "sa", "Dobrý deň.", "Volám"],
      answer: ["Dobrý deň.", "Volám", "sa", "Alex."],
      feedback: {
        correction: "Dobrý deň. Volám sa Alex.",
        english: "Hello. My name is Alex.",
        why: "Volám sa is the natural everyday introduction. Sa belongs with volám.",
      },
    },
    feedback: {
      correction: "Dobrý deň. Volám sa Alex.",
      english: "Hello. My name is Alex.",
      why: "Volám sa is the natural everyday introduction. Sa belongs with volám.",
    },
  },
  {
    id: "everyday/origin",
    source: {
      kind: "lesson",
      label: "Meet someone",
      href: "/lessons/everyday/meet-someone",
    },
    task: {
      id: "review-origin",
      type: "typed",
      task: "complete",
      practiceItemId: "everyday/origin",
      context: [
        {
          id: "review-origin-question",
          speaker: "Marta",
          slovak: "Odkiaľ ste?",
          english: "Where are you from?",
        },
      ],
      prompt: "Write: “I am from Canada.”",
      inputLabel: "Your Slovak answer",
      answer: "Som z Kanady.",
      feedback: {
        correction: "Som z Kanady.",
        english: "I am from Canada.",
        why: "Use Som z … for your origin. The country takes its Slovak form after z.",
      },
    },
    feedback: {
      correction: "Som z Kanady.",
      english: "I am from Canada.",
      why: "Use Som z … for your origin. The country takes its Slovak form after z.",
    },
    newUse: "Now answer once with your own country.",
  },
  {
    id: "grammar/first-person-reading",
    source: {
      kind: "lesson",
      label: "Say what you do now",
      href: "/lessons/grammar/present-tense-i",
    },
    task: {
      id: "review-first-person-reading",
      type: "typed",
      task: "repair",
      practiceItemId: "grammar/first-person-reading",
      prompt: "You mean “I am reading a book.” Repair: Ja číta knihu.",
      inputLabel: "Correct Slovak sentence",
      answer: "Čítam knihu.",
      acceptedAnswers: ["Ja čítam knihu."],
      feedback: {
        correction: "Čítam knihu.",
        english: "I am reading a book.",
        why: "Číta is he/she reads. Čítam is I read. The -m ending identifies you.",
      },
    },
    feedback: {
      correction: "Čítam knihu.",
      english: "I am reading a book.",
      why: "Číta is he/she reads. Čítam is I read. The -m ending identifies you.",
    },
    newUse: "Try a new first-person sentence: Dnes pracujem.",
  },
  {
    id: "grammar/repair-first-person-reading",
    source: {
      kind: "lesson",
      label: "Say what you do now",
      href: "/lessons/grammar/present-tense-i",
    },
    task: {
      id: "review-repair-first-person-reading",
      type: "typed",
      task: "repair",
      practiceItemId: "grammar/repair-first-person-reading",
      context: [
        {
          id: "review-reading-caption",
          speaker: "Caption",
          slovak: "Ja číta noviny.",
          english: "I am reading a newspaper.",
        },
      ],
      prompt: "The caption is about you. Repair the Slovak sentence.",
      inputLabel: "Correct Slovak sentence",
      answer: "Čítam noviny.",
      acceptedAnswers: ["Ja čítam noviny."],
      feedback: {
        correction: "Čítam noviny.",
        english: "I am reading a newspaper.",
        why: "Číta describes one other person. Change the ending to -m when you are the reader.",
      },
    },
    feedback: {
      correction: "Čítam noviny.",
      english: "I am reading a newspaper.",
      why: "Číta describes one other person. Change the ending to -m when you are the reader.",
    },
  },
  {
    id: "grammar/today-reading",
    source: {
      kind: "lesson",
      label: "Say what you do now",
      href: "/lessons/grammar/present-tense-i",
    },
    task: {
      id: "review-today-reading",
      type: "choice",
      practiceItemId: "grammar/today-reading",
      prompt: "You are writing a note about yourself: “Today I am reading a book.” Which Slovak sentence says that?",
      choices: [
        { id: "you", label: "Dnes čítam knihu." },
        { id: "other-person", label: "Dnes číta knihu." },
        { id: "plural", label: "Dnes čítame knihu." },
      ],
      answerId: "you",
      feedback: {
        correction: "Dnes čítam knihu.",
        english: "Today I am reading a book.",
        why: "Čítam ends in -m for I. Číta means he or she is reading; čítame means we are reading.",
      },
    },
    feedback: {
      correction: "Dnes čítam knihu.",
      english: "Today I am reading a book.",
      why: "Čítam ends in -m for I. Číta means he or she is reading; čítame means we are reading.",
    },
  },
  {
    id: "pronunciation/dakujem-stress",
    source: {
      kind: "lesson",
      label: "Find the first beat",
      href: "/lessons/pronunciation/first-syllable-stress",
    },
    task: {
      id: "review-dakujem-stress",
      type: "choice",
      practiceItemId: "pronunciation/dakujem-stress",
      prompt: "Where is the main beat in ďakujem?",
      choices: [
        { id: "first", label: "ĎA-ku-jem" },
        { id: "middle", label: "ďa-KU-jem" },
        { id: "last", label: "ďa-ku-JEM" },
      ],
      answerId: "first",
      feedback: {
        correction: "ĎA-ku-jem",
        why: "Slovak normally stresses the first syllable. Say it once aloud after checking.",
      },
    },
    feedback: {
      correction: "ĎA-ku-jem",
      why: "Slovak normally stresses the first syllable. Say it once aloud after checking.",
    },
  },
  {
    id: "pronunciation/thanks-phrase",
    source: {
      kind: "lesson",
      label: "Find the first beat",
      href: "/lessons/pronunciation/first-syllable-stress",
    },
    task: {
      id: "review-thanks-phrase",
      type: "typed",
      task: "complete",
      practiceItemId: "pronunciation/thanks-phrase",
      context: [
        {
          id: "review-thanks-help",
          speaker: "A passer-by",
          slovak: "Pomôžem vám.",
          english: "I will help you.",
        },
      ],
      prompt: "The passer-by has helped you. Write: “Thank you for the help.”",
      inputLabel: "Your Slovak answer",
      answer: "Ďakujem za pomoc.",
      feedback: {
        correction: "Ďakujem za pomoc.",
        english: "Thank you for the help.",
        why: "Ďakujem is stressed on its first syllable. Say ĎA-ku-jem, then keep the rest of the phrase even.",
      },
    },
    feedback: {
      correction: "Ďakujem za pomoc.",
      english: "Thank you for the help.",
      why: "Ďakujem is stressed on its first syllable. Say ĎA-ku-jem, then keep the rest of the phrase even.",
    },
  },
];

export const practiceItemById = new Map(practiceItems.map((item) => [item.id, item]));

export const practiceSets: PracticeSet[] = [
  {
    id: "meet-someone",
    lessonId: "everyday/meet-someone",
    title: "Meet someone",
    track: "everyday",
    itemIds: ["everyday/formal-greeting", "everyday/introduction", "everyday/origin"],
  },
  {
    id: "present-tense-i",
    lessonId: "grammar/present-tense-i",
    title: "Say what you do now",
    track: "grammar",
    itemIds: [
      "grammar/first-person-reading",
      "grammar/repair-first-person-reading",
      "grammar/today-reading",
    ],
  },
  {
    id: "first-syllable-stress",
    lessonId: "pronunciation/first-syllable-stress",
    title: "Find the first beat",
    track: "pronunciation",
    itemIds: ["pronunciation/dakujem-stress", "pronunciation/thanks-phrase"],
  },
];

export const practiceSetById = new Map(practiceSets.map((set) => [set.id, set]));

export function validatePracticeItems(): string[] {
  const issues: string[] = [];
  const ids = new Set<string>();

  for (const item of practiceItems) {
    if (ids.has(item.id)) issues.push(`Duplicate practice item: ${item.id}`);
    ids.add(item.id);

    if (!item.feedback.correction || !item.feedback.why) {
      issues.push(`Incomplete feedback: ${item.id}`);
    }

    if (item.task.practiceItemId !== item.id) {
      issues.push(`Mismatched practice task: ${item.id}`);
    }
  }

  for (const set of practiceSets) {
    for (const itemId of set.itemIds) {
      if (!practiceItemById.has(itemId)) issues.push(`Unknown practice item: ${set.id}/${itemId}`);
    }
  }

  return issues;
}
