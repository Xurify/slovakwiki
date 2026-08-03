import type { LessonTrackId, PracticeItem } from "./learning-types";

export interface PracticeSet {
  id: string;
  itemIds: string[];
  lessonId: string;
  /** Short set-specific blurb; falls back to the linked lesson promise. */
  summary?: string;
  title: string;
  track: LessonTrackId;
}

export const practiceItems: PracticeItem[] = [
  {
    id: "everyday/formal-greeting",
    source: {
      kind: "lesson",
      label: "Greetings and introductions",
      href: "/lessons/everyday/meet-someone",
    },
    task: {
      id: "review-formal-greeting",
      type: "choice",
      practiceItemId: "everyday/formal-greeting",
      prompt:
        "You arrive at a clinic and meet the receptionist for the first time. Which greeting fits?",
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
      label: "Greetings and introductions",
      href: "/lessons/everyday/meet-someone",
    },
    task: {
      id: "review-introduction",
      type: "build",
      practiceItemId: "everyday/introduction",
      prompt:
        "A colleague says Volám sa Marta. Build your reply: “Hello. My name is Alex.”",
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
      label: "Greetings and introductions",
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
      label: "Present-tense endings",
      href: "/lessons/grammar/present-tense-i",
    },
    task: {
      id: "review-first-person-reading",
      type: "choice",
      practiceItemId: "grammar/first-person-reading",
      prompt: "You are describing yourself. Which sentence means “I am reading a book”?",
      choices: [
        { id: "first-person", label: "Čítam knihu." },
        { id: "third-person", label: "Číta knihu." },
        { id: "second-person", label: "Čítaš knihu." },
      ],
      answerId: "first-person",
      feedback: {
        correction: "Čítam knihu.",
        english: "I am reading a book.",
        why: "The ending -m marks I. Číta is he/she; čítaš is informal you.",
      },
    },
    feedback: {
      correction: "Čítam knihu.",
      english: "I am reading a book.",
      why: "The ending -m marks I. Číta is he/she; čítaš is informal you.",
    },
    newUse: "Try a new first-person sentence: Dnes pracujem.",
  },
  {
    id: "grammar/repair-first-person-reading",
    source: {
      kind: "lesson",
      label: "Present-tense endings",
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
          speaker: "Sentence",
          slovak: "Ja číta noviny.",
          english: "I am reading a newspaper.",
        },
      ],
      prompt: "Repair this sentence.",
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
      label: "Present-tense endings",
      href: "/lessons/grammar/present-tense-i",
    },
    task: {
      id: "review-today-reading",
      type: "choice",
      practiceItemId: "grammar/today-reading",
      prompt: "Which sentence means “Today we are reading a book”?",
      choices: [
        { id: "we", label: "Dnes čítame knihu." },
        { id: "i", label: "Dnes čítam knihu." },
        { id: "they", label: "Dnes čítajú knihu." },
      ],
      answerId: "we",
      feedback: {
        correction: "Dnes čítame knihu.",
        english: "Today we are reading a book.",
        why: "Čítame ends in -me for we. Čítam is I; čítajú is they.",
      },
    },
    feedback: {
      correction: "Dnes čítame knihu.",
      english: "Today we are reading a book.",
      why: "Čítame ends in -me for we. Čítam is I; čítajú is they.",
    },
  },
  {
    id: "grammar/cloze-first-person-reading",
    source: {
      kind: "lesson",
      label: "Present-tense endings",
      href: "/lessons/grammar/present-tense-i",
    },
    task: {
      id: "review-cloze-first-person-reading",
      type: "cloze",
      practiceItemId: "grammar/cloze-first-person-reading",
      prompt: "Fill the gap so the sentence is about you.",
      frame: "Dnes {} knihu.",
      answer: "čítam",
      gapEn: "I read / I am reading",
      lemmaId: "citat",
      morphHint: "čítať → čítam",
      sentenceEn: "Today I am reading a book.",
      hint: {
        chip: "1st person sg. · -m",
        grammarTopicId: "present-tense",
        note: "The -m ending marks I. Slovak often drops ja because the ending already says who acts.",
        reveal: ["The verb is čítať.", "First person singular takes -m.", "č í t a …"],
      },
      feedback: {
        correction: "Dnes čítam knihu.",
        english: "Today I am reading a book.",
        why: "Čítam ends in -m for I. The blank needs the first-person form, not číta.",
      },
    },
    feedback: {
      correction: "Dnes čítam knihu.",
      english: "Today I am reading a book.",
      why: "Čítam ends in -m for I. The blank needs the first-person form, not číta.",
    },
  },
  {
    id: "grammar/cloze-second-person-speaking",
    source: {
      kind: "lesson",
      label: "Present-tense endings",
      href: "/lessons/grammar/present-tense-i",
    },
    task: {
      id: "review-cloze-second-person-speaking",
      type: "cloze",
      practiceItemId: "grammar/cloze-second-person-speaking",
      prompt: "Ask someone informally if they speak Slovak — fill the gap.",
      frame: "{} po slovensky?",
      answer: "hovoríš",
      gapEn: "you speak",
      lemmaId: "hovorit",
      morphHint: "hovoriť → hovoríš",
      sentenceEn: "Do you speak Slovak?",
      hint: {
        chip: "2nd person sg. · -š",
        grammarTopicId: "present-tense",
        note: "The -š ending marks you (singular, informal). Contrast with -m for I.",
        reveal: [
          "The verb is hovoriť.",
          "Second person singular takes -š.",
          "h o v o r í …",
        ],
      },
      feedback: {
        correction: "Hovoríš po slovensky?",
        english: "Do you speak Slovak?",
        why: "Hovoríš ends in -š for informal you. Hovorím would mean I speak.",
      },
    },
    feedback: {
      correction: "Hovoríš po slovensky?",
      english: "Do you speak Slovak?",
      why: "Hovoríš ends in -š for informal you. Hovorím would mean I speak.",
    },
  },
  {
    id: "grammar/cloze-third-person-reading",
    source: {
      kind: "lesson",
      label: "Present-tense endings",
      href: "/lessons/grammar/present-tense-i",
    },
    task: {
      id: "review-cloze-third-person-reading",
      type: "cloze",
      practiceItemId: "grammar/cloze-third-person-reading",
      prompt: "Fill the gap for Peter.",
      frame: "Peter {} knihu.",
      answer: "číta",
      gapEn: "he reads / he is reading",
      lemmaId: "citat",
      morphHint: "čítať → číta",
      sentenceEn: "Peter is reading a book.",
      hint: {
        chip: "3rd person sg. · stem",
        grammarTopicId: "present-tense",
        note: "Third person singular uses the present stem with no -m or -š. Peter, Anna, or on/ona take this form.",
        reveal: ["The verb is čítať.", "Third person singular has no -m/-š.", "č í t a"],
      },
      feedback: {
        correction: "Peter číta knihu.",
        english: "Peter is reading a book.",
        why: "Číta is he/she reads. Čítam would mean I am reading.",
      },
    },
    feedback: {
      correction: "Peter číta knihu.",
      english: "Peter is reading a book.",
      why: "Číta is he/she reads. Čítam would mean I am reading.",
    },
  },
  {
    id: "grammar/cloze-we-reading",
    source: {
      kind: "lesson",
      label: "Present-tense endings",
      href: "/lessons/grammar/present-tense-i",
    },
    task: {
      id: "review-cloze-we-reading",
      type: "cloze",
      practiceItemId: "grammar/cloze-we-reading",
      prompt: "Fill the gap so the sentence is about us.",
      frame: "Dnes {} knihu.",
      answer: "čítame",
      gapEn: "we read / we are reading",
      lemmaId: "citat",
      morphHint: "čítať → čítame",
      sentenceEn: "Today we are reading a book.",
      hint: {
        chip: "1st person pl. · -me",
        grammarTopicId: "present-tense",
        note: "The -me ending marks we. Contrast with -m for I and -jú for they.",
        reveal: ["The verb is čítať.", "First person plural takes -me.", "č í t a …"],
      },
      feedback: {
        correction: "Dnes čítame knihu.",
        english: "Today we are reading a book.",
        why: "Čítame ends in -me for we. Čítam is I; čítajú is they.",
      },
    },
    feedback: {
      correction: "Dnes čítame knihu.",
      english: "Today we are reading a book.",
      why: "Čítame ends in -me for we. Čítam is I; čítajú is they.",
    },
  },
  {
    id: "grammar/cloze-formal-speaking",
    source: {
      kind: "lesson",
      label: "Present-tense endings",
      href: "/lessons/grammar/present-tense-i",
    },
    task: {
      id: "review-cloze-formal-speaking",
      type: "cloze",
      practiceItemId: "grammar/cloze-formal-speaking",
      prompt: "Ask politely if someone speaks Slovak — fill the gap.",
      frame: "{} po slovensky?",
      answer: "hovoríte",
      gapEn: "you speak (formal / plural)",
      lemmaId: "hovorit",
      morphHint: "hovoriť → hovoríte",
      sentenceEn: "Do you speak Slovak?",
      hint: {
        chip: "2nd person pl. · -te",
        grammarTopicId: "present-tense",
        note: "The -te ending marks vy — plural you, or formal singular you. Hovoríš is informal singular.",
        reveal: [
          "The verb is hovoriť.",
          "Second person plural / formal takes -te.",
          "h o v o r í …",
        ],
      },
      feedback: {
        correction: "Hovoríte po slovensky?",
        english: "Do you speak Slovak?",
        why: "Hovoríte ends in -te for polite or plural you. Hovoríš is informal singular.",
      },
    },
    feedback: {
      correction: "Hovoríte po slovensky?",
      english: "Do you speak Slovak?",
      why: "Hovoríte ends in -te for polite or plural you. Hovoríš is informal singular.",
    },
  },
  {
    id: "grammar/cloze-they-reading",
    source: {
      kind: "lesson",
      label: "Present-tense endings",
      href: "/lessons/grammar/present-tense-i",
    },
    task: {
      id: "review-cloze-they-reading",
      type: "cloze",
      practiceItemId: "grammar/cloze-they-reading",
      prompt: "Fill the gap for more than one person.",
      frame: "Oni {} knihu.",
      answer: "čítajú",
      gapEn: "they read / they are reading",
      lemmaId: "citat",
      morphHint: "čítať → čítajú",
      sentenceEn: "They are reading a book.",
      hint: {
        chip: "3rd person pl. · -jú",
        grammarTopicId: "present-tense",
        note: "The -jú ending marks they. Contrast with číta for one other person.",
        reveal: ["The verb is čítať.", "Third person plural takes -jú.", "č í t a …"],
      },
      feedback: {
        correction: "Oni čítajú knihu.",
        english: "They are reading a book.",
        why: "Čítajú ends in -jú for they. Číta is one other person reading.",
      },
    },
    feedback: {
      correction: "Oni čítajú knihu.",
      english: "They are reading a book.",
      why: "Čítajú ends in -jú for they. Číta is one other person reading.",
    },
  },
  {
    id: "pronunciation/dakujem-stress",
    source: {
      kind: "lesson",
      label: "First-syllable stress",
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
      label: "First-syllable stress",
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
  {
    id: "everyday/nice-to-meet-you",
    source: {
      kind: "lesson",
      label: "Greetings and introductions",
      href: "/lessons/everyday/meet-someone",
    },
    task: {
      id: "review-nice-to-meet-you",
      type: "choice",
      practiceItemId: "everyday/nice-to-meet-you",
      prompt: "Someone says Teší ma. Which reply means “Nice to meet you too”?",
      choices: [
        { id: "too", label: "Aj mňa teší." },
        { id: "thanks", label: "Ďakujem za pomoc." },
        { id: "goodbye", label: "Dovidenia." },
      ],
      answerId: "too",
      feedback: {
        correction: "Aj mňa teší.",
        english: "Nice to meet you too.",
        why: "Aj means too or also. Aj mňa teší returns the same polite sentiment.",
      },
    },
    feedback: {
      correction: "Aj mňa teší.",
      english: "Nice to meet you too.",
      why: "Aj means too or also. Aj mňa teší returns the same polite sentiment.",
    },
  },
  {
    id: "everyday/ask-origin",
    source: {
      kind: "lesson",
      label: "Greetings and introductions",
      href: "/lessons/everyday/meet-someone",
    },
    task: {
      id: "review-ask-origin",
      type: "build",
      practiceItemId: "everyday/ask-origin",
      prompt: "Build the polite question: “Where are you from?”",
      tiles: ["ste?", "Odkiaľ", "Som", "z"],
      answer: ["Odkiaľ", "ste?"],
      feedback: {
        correction: "Odkiaľ ste?",
        english: "Where are you from?",
        why: "Odkiaľ asks from where. Ste keeps the question polite or addresses more than one person.",
      },
    },
    feedback: {
      correction: "Odkiaľ ste?",
      english: "Where are you from?",
      why: "Odkiaľ asks from where. Ste keeps the question polite or addresses more than one person.",
    },
  },
  {
    id: "everyday/speak-a-little",
    source: {
      kind: "lesson",
      label: "Greetings and introductions",
      href: "/lessons/everyday/meet-someone",
    },
    task: {
      id: "review-speak-a-little",
      type: "typed",
      task: "complete",
      practiceItemId: "everyday/speak-a-little",
      context: [
        {
          id: "review-speak-a-little-question",
          speaker: "Anna",
          slovak: "Hovoríte po slovensky?",
          english: "Do you speak Slovak?",
        },
      ],
      prompt: "Write: “I speak a little Slovak.”",
      inputLabel: "Your Slovak answer",
      answer: "Hovorím trochu po slovensky.",
      acceptedAnswers: ["Trochu hovorím po slovensky."],
      feedback: {
        correction: "Hovorím trochu po slovensky.",
        english: "I speak a little Slovak.",
        why: "Hovorím is I speak. Po slovensky names the language used.",
      },
    },
    feedback: {
      correction: "Hovorím trochu po slovensky.",
      english: "I speak a little Slovak.",
      why: "Hovorím is I speak. Po slovensky names the language used.",
    },
  },
  {
    id: "pronunciation/bratislava-stress",
    source: {
      kind: "lesson",
      label: "First-syllable stress",
      href: "/lessons/pronunciation/first-syllable-stress",
    },
    task: {
      id: "review-bratislava-stress",
      type: "choice",
      practiceItemId: "pronunciation/bratislava-stress",
      prompt: "Where is the main stress in Bratislava?",
      choices: [
        { id: "first", label: "BRA-ti-sla-va" },
        { id: "middle", label: "bra-TI-sla-va" },
        { id: "later", label: "bra-ti-SLA-va" },
      ],
      answerId: "first",
      feedback: {
        correction: "BRA-ti-sla-va",
        why: "Standard Slovak normally places the main stress on the first syllable.",
      },
    },
    feedback: {
      correction: "BRA-ti-sla-va",
      why: "Standard Slovak normally places the main stress on the first syllable.",
    },
  },
  {
    id: "pronunciation/pomozem-stress",
    source: {
      kind: "lesson",
      label: "First-syllable stress",
      href: "/lessons/pronunciation/first-syllable-stress",
    },
    task: {
      id: "review-pomozem-stress",
      type: "choice",
      practiceItemId: "pronunciation/pomozem-stress",
      prompt: "Which version keeps the regular Slovak stress in pomôžem?",
      choices: [
        { id: "first", label: "PO-mô-žem" },
        { id: "middle", label: "po-MÔ-žem" },
        { id: "last", label: "po-mô-ŽEM" },
      ],
      answerId: "first",
      feedback: {
        correction: "PO-mô-žem",
        why: "Stress the first syllable. The long ô remains long, but vowel length does not move the stress.",
      },
    },
    feedback: {
      correction: "PO-mô-žem",
      why: "Stress the first syllable. The long ô remains long, but vowel length does not move the stress.",
    },
  },
];

export const practiceItemById = new Map(practiceItems.map((item) => [item.id, item]));

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
    summary: "Fill the six person endings on everyday verbs like čítať and hovoriť.",
    track: "grammar",
    itemIds: [
      "grammar/cloze-first-person-reading",
      "grammar/cloze-second-person-speaking",
      "grammar/cloze-third-person-reading",
      "grammar/cloze-we-reading",
      "grammar/cloze-formal-speaking",
      "grammar/cloze-they-reading",
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
];

export const practiceSetById = new Map(practiceSets.map((set) => [set.id, set]));

export const practiceSetByLessonId = new Map<string, PracticeSet>();
for (const set of practiceSets) {
  if (!practiceSetByLessonId.has(set.lessonId)) {
    practiceSetByLessonId.set(set.lessonId, set);
  }
}

export function practiceSetForLesson(lessonId: string): PracticeSet | undefined {
  return practiceSetByLessonId.get(lessonId);
}

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

    if (item.task.type === "cloze") {
      if (item.task.frame.split("{}").length !== 2) {
        issues.push(`Cloze frame needs exactly one {}: ${item.id}`);
      }
      if (!item.task.answer.trim()) {
        issues.push(`Cloze answer missing: ${item.id}`);
      }
      if (!item.task.gapEn.trim()) {
        issues.push(`Cloze gap gloss missing: ${item.id}`);
      }
      if (!item.task.hint.chip.trim() || !item.task.hint.note.trim()) {
        issues.push(`Cloze hint incomplete: ${item.id}`);
      }
    }
  }

  for (const set of practiceSets) {
    for (const itemId of set.itemIds) {
      if (!practiceItemById.has(itemId))
        issues.push(`Unknown practice item: ${set.id}/${itemId}`);
    }
  }

  return issues;
}
