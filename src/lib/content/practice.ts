import type { LessonTrackId, PracticeItem } from "./learning-types";

export interface PracticeSet {
  id: string;
  itemIds: string[];
  lessonId: string;
  previewItemId?: string;
  sessionSize?: number;
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
      prompt: "I am from Canada.",
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
    id: "everyday/age-with-rokov",
    source: {
      kind: "lesson",
      label: "Numbers and personal details",
      href: "/lessons/everyday/numbers-and-personal-details",
    },
    task: {
      id: "review-age-with-rokov",
      type: "typed",
      task: "complete",
      practiceItemId: "everyday/age-with-rokov",
      context: [
        {
          id: "review-age-question",
          speaker: "Marta",
          slovak: "Koľko máte rokov?",
          english: "How old are you?",
        },
      ],
      prompt: "I am twenty years old.",
      inputLabel: "Your Slovak answer",
      answer: "Mám dvadsať rokov.",
      feedback: {
        correction: "Mám dvadsať rokov.",
        english: "I am twenty years old.",
        why: "Slovak says I have twenty years: mám + number + rokov.",
      },
    },
    feedback: {
      correction: "Mám dvadsať rokov.",
      english: "I am twenty years old.",
      why: "Slovak says I have twenty years: mám + number + rokov.",
    },
    newUse: "Say your own age with Mám … rokov.",
  },
  {
    id: "everyday/phone-number-digits",
    source: {
      kind: "lesson",
      label: "Numbers and personal details",
      href: "/lessons/everyday/numbers-and-personal-details",
    },
    task: {
      id: "review-phone-number-digits",
      type: "build",
      practiceItemId: "everyday/phone-number-digits",
      prompt: "Build the digits for the short number 0905.",
      tiles: ["päť.", "deväť", "nula", "nula", "deväť", "nula"],
      answer: ["nula", "deväť", "nula", "päť."],
      feedback: {
        correction: "Nula deväť nula päť.",
        english: "Zero nine zero five.",
        why: "Phone numbers are normally read digit by digit, not as one whole number.",
      },
    },
    feedback: {
      correction: "Nula deväť nula päť.",
      english: "Zero nine zero five.",
      why: "Phone numbers are normally read digit by digit, not as one whole number.",
    },
  },
  {
    id: "everyday/simple-price",
    source: {
      kind: "lesson",
      label: "Numbers and personal details",
      href: "/lessons/everyday/numbers-and-personal-details",
    },
    task: {
      id: "review-simple-price",
      type: "choice",
      practiceItemId: "everyday/simple-price",
      prompt: "A coffee costs five euros. Which reply answers Koľko to stojí?",
      choices: [
        { id: "price", label: "Stojí to päť eur." },
        { id: "age", label: "Mám päť rokov." },
        { id: "time", label: "O piatej." },
      ],
      answerId: "price",
      feedback: {
        correction: "Stojí to päť eur.",
        english: "It costs five euros.",
        why: "Koľko to stojí? asks the price. Use Stojí to + number + eur.",
      },
    },
    feedback: {
      correction: "Stojí to päť eur.",
      english: "It costs five euros.",
      why: "Koľko to stojí? asks the price. Use Stojí to + number + eur.",
    },
  },
  {
    id: "everyday/day-meeting",
    source: {
      kind: "lesson",
      label: "Days, dates, and time",
      href: "/lessons/everyday/days-dates-and-time",
    },
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
    source: {
      kind: "lesson",
      label: "Days, dates, and time",
      href: "/lessons/everyday/days-dates-and-time",
    },
    task: {
      id: "review-meeting-time",
      type: "choice",
      practiceItemId: "everyday/meeting-time",
      prompt: "When is the meeting? It is at three o’clock.",
      choices: [
        { id: "three", label: "O tretej.", clock: { hour: 3, minute: 0 } },
        {
          id: "half-three",
          label: "O pol tretej.",
          clock: { hour: 2, minute: 30 },
        },
        { id: "four", label: "O štvrtej.", clock: { hour: 4, minute: 0 } },
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
    source: {
      kind: "lesson",
      label: "Days, dates, and time",
      href: "/lessons/everyday/days-dates-and-time",
    },
    task: {
      id: "review-half-past-time",
      type: "choice",
      practiceItemId: "everyday/half-past-time",
      prompt: "Your train leaves at 2:30. Which time should you say?",
      choices: [
        {
          id: "half-past-two",
          label: "O pol tretej.",
          clock: { hour: 2, minute: 30 },
        },
        { id: "three", label: "O tretej.", clock: { hour: 3, minute: 0 } },
        {
          id: "half-past-three",
          label: "O pol štvrtej.",
          clock: { hour: 3, minute: 30 },
        },
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
    source: {
      kind: "lesson",
      label: "Days, dates, and time",
      href: "/lessons/everyday/days-dates-and-time",
    },
    task: {
      id: "review-quarter-time",
      type: "choice",
      practiceItemId: "everyday/quarter-time",
      prompt: "The film starts at 2:45. Which time should you say?",
      choices: [
        {
          id: "three-quarters",
          label: "O trištvrte na tri.",
          clock: { hour: 2, minute: 45 },
        },
        {
          id: "quarter",
          label: "O štvrť na tri.",
          clock: { hour: 2, minute: 15 },
        },
        {
          id: "half-past",
          label: "O pol tretej.",
          clock: { hour: 2, minute: 30 },
        },
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
    id: "everyday/negative-answer",
    source: {
      kind: "lesson",
      label: "Negation in conversation",
      href: "/lessons/everyday/negation-in-conversation",
    },
    task: {
      id: "review-negative-answer",
      type: "choice",
      practiceItemId: "everyday/negative-answer",
      prompt:
        "A shop assistant offers a bag, but you do not need one. Which polite answer fits?",
      choices: [
        { id: "no-thanks", label: "Nie, ďakujem." },
        { id: "yes-thanks", label: "Áno, ďakujem." },
        { id: "understand", label: "Rozumiem." },
      ],
      answerId: "no-thanks",
      feedback: {
        correction: "Nie, ďakujem.",
        english: "No, thank you.",
        why: "Nie gives a polite no. Add ďakujem to decline courteously.",
      },
    },
    feedback: {
      correction: "Nie, ďakujem.",
      english: "No, thank you.",
      why: "Nie gives a polite no. Add ďakujem to decline courteously.",
    },
  },
  {
    id: "everyday/not-understand",
    source: {
      kind: "lesson",
      label: "Negation in conversation",
      href: "/lessons/everyday/negation-in-conversation",
    },
    task: {
      id: "review-not-understand",
      type: "typed",
      task: "complete",
      practiceItemId: "everyday/not-understand",
      context: [
        {
          id: "review-not-understand-question",
          speaker: "Clerk",
          slovak: "Vyplňte tento formulár.",
          english: "Fill in this form.",
        },
      ],
      prompt: "I do not understand.",
      inputLabel: "Your Slovak answer",
      answer: "Nerozumiem.",
      feedback: {
        correction: "Nerozumiem.",
        english: "I do not understand.",
        why: "Negation attaches to the verb: rozumiem becomes nerozumiem.",
      },
    },
    feedback: {
      correction: "Nerozumiem.",
      english: "I do not understand.",
      why: "Negation attaches to the verb: rozumiem becomes nerozumiem.",
    },
    newUse: "Follow with Prosím, pomalšie. — “Please, more slowly.”",
  },
  {
    id: "everyday/negative-verb-placement",
    source: {
      kind: "lesson",
      label: "Negation in conversation",
      href: "/lessons/everyday/negation-in-conversation",
    },
    task: {
      id: "review-negative-verb-placement",
      type: "build",
      practiceItemId: "everyday/negative-verb-placement",
      prompt: "I do not have time.",
      tiles: ["čas.", "Nie", "Nemám", "čas."],
      answer: ["Nemám", "čas."],
      feedback: {
        correction: "Nemám čas.",
        english: "I do not have time.",
        why: "Nie attaches to the verb as a negative form: mám becomes nemám, not nie mám.",
      },
    },
    feedback: {
      correction: "Nemám čas.",
      english: "I do not have time.",
      why: "Nie attaches to the verb as a negative form: mám becomes nemám, not nie mám.",
    },
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
      prompt: "Which sentence means “I am reading a book”?",
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
    id: "grammar/cloze-first-person-working",
    source: {
      kind: "lesson",
      label: "Present-tense endings",
      href: "/lessons/grammar/present-tense-i",
    },
    task: {
      id: "review-cloze-first-person-working",
      type: "cloze",
      practiceItemId: "grammar/cloze-first-person-working",
      prompt: "Fill the gap so the sentence is about you.",
      frame: "Zajtra {} v Bratislave.",
      answer: "pracujem",
      gapEn: "I work / I am working",
      lemmaId: "pracovat",
      morphHint: "pracovať → pracujem",
      sentenceEn: "Tomorrow I am working in Bratislava.",
      hint: {
        chip: "1st person sg. · -m",
        grammarTopicId: "present-tense",
        note: "Present -m still marks I. Pracovať takes the stem pracuj- before the ending.",
        reveal: [
          "The verb is pracovať.",
          "First person singular takes -m.",
          "p r a c u j …",
        ],
      },
      feedback: {
        correction: "Zajtra pracujem v Bratislave.",
        english: "Tomorrow I am working in Bratislava.",
        why: "Pracujem is I work. Keep -m when you are the one working.",
      },
    },
    feedback: {
      correction: "Zajtra pracujem v Bratislave.",
      english: "Tomorrow I am working in Bratislava.",
      why: "Pracujem is I work. Keep -m when you are the one working.",
    },
  },
  {
    id: "grammar/cloze-second-person-working",
    source: {
      kind: "lesson",
      label: "Present-tense endings",
      href: "/lessons/grammar/present-tense-i",
    },
    task: {
      id: "review-cloze-second-person-working",
      type: "cloze",
      practiceItemId: "grammar/cloze-second-person-working",
      prompt: "Fill the gap for informal you.",
      frame: "Dnes {} v Bratislave.",
      answer: "pracuješ",
      gapEn: "you work / you are working",
      lemmaId: "pracovat",
      morphHint: "pracovať → pracuješ",
      sentenceEn: "Today you are working in Bratislava.",
      hint: {
        chip: "2nd person sg. · -š",
        grammarTopicId: "present-tense",
        note: "The -š ending marks informal singular you. Contrast with -m for I.",
        reveal: [
          "The verb is pracovať.",
          "Second person singular takes -š.",
          "p r a c u j e …",
        ],
      },
      feedback: {
        correction: "Dnes pracuješ v Bratislave.",
        english: "Today you are working in Bratislava.",
        why: "Pracuješ ends in -š for informal you. Pracujem would mean I work.",
      },
    },
    feedback: {
      correction: "Dnes pracuješ v Bratislave.",
      english: "Today you are working in Bratislava.",
      why: "Pracuješ ends in -š for informal you. Pracujem would mean I work.",
    },
  },
  {
    id: "grammar/choice-they-reading",
    source: {
      kind: "lesson",
      label: "Present-tense endings",
      href: "/lessons/grammar/present-tense-i",
    },
    task: {
      id: "review-choice-they-reading",
      type: "choice",
      practiceItemId: "grammar/choice-they-reading",
      prompt: "Which sentence means “They are reading a book”?",
      choices: [
        { id: "they", label: "Čítajú knihu." },
        { id: "we", label: "Čítame knihu." },
        { id: "he", label: "Číta knihu." },
      ],
      answerId: "they",
      feedback: {
        correction: "Čítajú knihu.",
        english: "They are reading a book.",
        why: "Čítajú ends in -jú for they. Čítame is we; číta is he/she.",
      },
    },
    feedback: {
      correction: "Čítajú knihu.",
      english: "They are reading a book.",
      why: "Čítajú ends in -jú for they. Čítame is we; číta is he/she.",
    },
  },
  {
    id: "grammar/choice-formal-speaking",
    source: {
      kind: "lesson",
      label: "Present-tense endings",
      href: "/lessons/grammar/present-tense-i",
    },
    task: {
      id: "review-choice-formal-speaking",
      type: "choice",
      practiceItemId: "grammar/choice-formal-speaking",
      prompt: "Which question fits?",
      choices: [
        { id: "formal", label: "Hovoríte po slovensky?" },
        { id: "informal", label: "Hovoríš po slovensky?" },
        { id: "i", label: "Hovorím po slovensky?" },
      ],
      answerId: "formal",
      feedback: {
        correction: "Hovoríte po slovensky?",
        english: "Do you speak Slovak?",
        why: "Hovoríte (-te) is polite or plural. Hovoríš is informal singular.",
      },
    },
    feedback: {
      correction: "Hovoríte po slovensky?",
      english: "Do you speak Slovak?",
      why: "Hovoríte (-te) is polite or plural. Hovoríš is informal singular.",
    },
  },
  {
    id: "grammar/repair-second-person-speaking",
    source: {
      kind: "lesson",
      label: "Present-tense endings",
      href: "/lessons/grammar/present-tense-i",
    },
    task: {
      id: "review-repair-second-person-speaking",
      type: "typed",
      task: "repair",
      practiceItemId: "grammar/repair-second-person-speaking",
      context: [
        {
          id: "review-second-person-speaking-broken",
          speaker: "Sentence",
          slovak: "Ty hovorím po slovensky.",
          english: "You speak Slovak.",
        },
      ],
      prompt: "Repair this sentence.",
      inputLabel: "Correct Slovak sentence",
      answer: "Hovoríš po slovensky.",
      acceptedAnswers: ["Ty hovoríš po slovensky."],
      feedback: {
        correction: "Hovoríš po slovensky.",
        english: "You speak Slovak.",
        why: "Hovorím means I speak. Use hovoríš when speaking to one person informally.",
      },
    },
    feedback: {
      correction: "Hovoríš po slovensky.",
      english: "You speak Slovak.",
      why: "Hovorím means I speak. Use hovoríš when speaking to one person informally.",
    },
  },
  {
    id: "grammar/build-we-reading",
    source: {
      kind: "lesson",
      label: "Present-tense endings",
      href: "/lessons/grammar/present-tense-i",
    },
    task: {
      id: "review-build-we-reading",
      type: "build",
      practiceItemId: "grammar/build-we-reading",
      prompt: "Today we are reading a book.",
      tiles: ["knihu.", "Dnes", "čítame", "čítam"],
      answer: ["Dnes", "čítame", "knihu."],
      feedback: {
        correction: "Dnes čítame knihu.",
        english: "Today we are reading a book.",
        why: "Čítame ends in -me for we. Čítam would mean I am reading.",
      },
    },
    feedback: {
      correction: "Dnes čítame knihu.",
      english: "Today we are reading a book.",
      why: "Čítame ends in -me for we. Čítam would mean I am reading.",
    },
  },
  {
    id: "grammar/byt-som",
    source: {
      kind: "lesson",
      label: "Present forms of byť",
      href: "/lessons/grammar/byt-present",
    },
    task: {
      id: "review-byt-som",
      type: "typed",
      task: "complete",
      practiceItemId: "grammar/byt-som",
      context: [
        {
          id: "review-byt-som-introduction",
          speaker: "Marta",
          slovak: "Ahoj! Ako sa voláš?",
          english: "Hi! What is your name?",
        },
      ],
      prompt: "I am Alex.",
      inputLabel: "Your Slovak answer",
      answer: "Som Alex.",
      feedback: {
        correction: "Som Alex.",
        english: "I am Alex.",
        why: "Som is the first-person singular present form of byť, “to be.”",
      },
    },
    feedback: {
      correction: "Som Alex.",
      english: "I am Alex.",
      why: "Som is the first-person singular present form of byť, “to be.”",
    },
    newUse: "Now say: Som študent / Som študentka.",
  },
  {
    id: "grammar/byt-ste",
    source: {
      kind: "lesson",
      label: "Present forms of byť",
      href: "/lessons/grammar/byt-present",
    },
    task: {
      id: "review-byt-ste",
      type: "typed",
      task: "complete",
      practiceItemId: "grammar/byt-ste",
      context: [
        {
          id: "review-byt-ste-call",
          speaker: "Colleague",
          slovak: "Som pri vchode.",
          english: "I am by the entrance.",
        },
      ],
      prompt: "Where are you?",
      inputLabel: "Your Slovak question",
      answer: "Kde ste?",
      feedback: {
        correction: "Kde ste?",
        english: "Where are you?",
        why: "Ste is the present form of byť for formal singular you or plural you.",
      },
    },
    feedback: {
      correction: "Kde ste?",
      english: "Where are you?",
      why: "Ste is the present form of byť for formal singular you or plural you.",
    },
  },
  {
    id: "grammar/byt-je-location",
    source: {
      kind: "lesson",
      label: "Present forms of byť",
      href: "/lessons/grammar/byt-present",
    },
    task: {
      id: "review-byt-je-location",
      type: "typed",
      task: "complete",
      practiceItemId: "grammar/byt-je-location",
      context: [
        {
          id: "review-byt-je-location-question",
          speaker: "Marta",
          slovak: "Kde je Peter?",
          english: "Where is Peter?",
        },
      ],
      prompt: "He is in Bratislava.",
      inputLabel: "Your Slovak answer",
      answer: "Je v Bratislave.",
      feedback: {
        correction: "Je v Bratislave.",
        english: "He/She is in Bratislava.",
        why: "Je is he/she/it is. After v for location, Bratislava changes to v Bratislave.",
      },
    },
    feedback: {
      correction: "Je v Bratislave.",
      english: "He/She is in Bratislava.",
      why: "Je is he/she/it is. After v for location, Bratislava changes to v Bratislave.",
    },
    newUse: "Ask: Kde je Peter?",
  },
  {
    id: "grammar/mat-mam",
    source: {
      kind: "lesson",
      label: "Present forms of mať",
      href: "/lessons/grammar/mat-present",
    },
    task: {
      id: "review-mat-mam",
      type: "typed",
      task: "complete",
      practiceItemId: "grammar/mat-mam",
      context: [
        {
          id: "review-mat-mam-question",
          speaker: "Marta",
          slovak: "Máš teraz chvíľu?",
          english: "Do you have a moment now?",
        },
      ],
      prompt: "I have time.",
      inputLabel: "Your Slovak answer",
      answer: "Mám čas.",
      feedback: {
        correction: "Mám čas.",
        english: "I have time.",
        why: "Mám is the first-person singular present form of mať, “to have.”",
      },
    },
    feedback: {
      correction: "Mám čas.",
      english: "I have time.",
      why: "Mám is the first-person singular present form of mať, “to have.”",
    },
  },
  {
    id: "grammar/mat-mas",
    source: {
      kind: "lesson",
      label: "Present forms of mať",
      href: "/lessons/grammar/mat-present",
    },
    task: {
      id: "review-mat-mas",
      type: "typed",
      task: "complete",
      practiceItemId: "grammar/mat-mas",
      context: [
        {
          id: "review-mat-mas-train",
          speaker: "Conductor",
          slovak: "Prosím, lístok.",
          english: "Ticket, please.",
        },
      ],
      prompt: "Do you have a ticket?",
      inputLabel: "Your Slovak question",
      answer: "Máš lístok?",
      feedback: {
        correction: "Máš lístok?",
        english: "Do you have a ticket?",
        why: "Máš is the present form of mať for one person you address informally.",
      },
    },
    feedback: {
      correction: "Máš lístok?",
      english: "Do you have a ticket?",
      why: "Máš is the present form of mať for one person you address informally.",
    },
  },
  {
    id: "grammar/mat-nemam",
    source: {
      kind: "lesson",
      label: "Present forms of mať",
      href: "/lessons/grammar/mat-present",
    },
    task: {
      id: "review-mat-nemam",
      type: "typed",
      task: "complete",
      practiceItemId: "grammar/mat-nemam",
      context: [
        {
          id: "review-mat-nemam-invitation",
          speaker: "Marta",
          slovak: "Poďme na kávu.",
          english: "Let’s go for coffee.",
        },
      ],
      prompt: "I don’t have time.",
      inputLabel: "Your Slovak answer",
      answer: "Nemám čas.",
      feedback: {
        correction: "Nemám čas.",
        english: "I don’t have time.",
        why: "Negation attaches to the verb: mám becomes nemám, not nie mám.",
      },
    },
    feedback: {
      correction: "Nemám čas.",
      english: "I don’t have time.",
      why: "Negation attaches to the verb: mám becomes nemám, not nie mám.",
    },
    newUse: "Add: Prepáč, nemám čas.",
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
          speaker: "Someone",
          slovak: "Pomôžem vám.",
          english: "I will help you.",
        },
      ],
      prompt: "Thank you for the help.",
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
      prompt: "Which reply means “Nice to meet you too”?",
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
      prompt: "Where are you from?",
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
      prompt: "I speak a little Slovak.",
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
    summary: "Say your age, read phone digits, and ask or answer a simple price.",
    track: "everyday",
    itemIds: [
      "everyday/age-with-rokov",
      "everyday/phone-number-digits",
      "everyday/simple-price",
    ],
  },
  {
    id: "days-dates-and-time",
    lessonId: "everyday/days-dates-and-time",
    title: "Days, dates, and time",
    summary: "Arrange a meeting day and say whole-hour, half-hour, and quarter times.",
    track: "everyday",
    itemIds: [
      "everyday/day-meeting",
      "everyday/meeting-time",
      "everyday/half-past-time",
      "everyday/quarter-time",
    ],
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

export function practiceSetForItem(itemId: string): PracticeSet | undefined {
  return practiceSets.find((set) => set.itemIds.includes(itemId));
}

/** Drill one exercise inside its topic set — not a separate reference route. */
export function practiceItemHref(itemId: string): string | undefined {
  const set = practiceSetForItem(itemId);
  if (!set) return undefined;
  return `/practice/${set.id}?at=${encodeURIComponent(itemId)}`;
}

export function samplePracticeItemIds(
  itemIds: readonly string[],
  sessionSize?: number,
): string[] {
  const pool = [...itemIds];

  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    const current = pool[index]!;
    pool[index] = pool[swapIndex]!;
    pool[swapIndex] = current;
  }

  if (sessionSize === undefined || sessionSize >= pool.length) return pool;
  return pool.slice(0, Math.max(0, sessionSize));
}

export function practiceSessionCount(set: PracticeSet): number {
  if (set.sessionSize === undefined) return set.itemIds.length;
  return Math.min(set.sessionSize, set.itemIds.length);
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

    if (!practiceSetForItem(item.id)) {
      issues.push(`Practice item not in any set: ${item.id}`);
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

    if (set.previewItemId && !set.itemIds.includes(set.previewItemId)) {
      issues.push(`previewItemId not in set: ${set.id}/${set.previewItemId}`);
    }

    if (set.sessionSize !== undefined) {
      if (!Number.isInteger(set.sessionSize) || set.sessionSize < 1) {
        issues.push(`Invalid sessionSize: ${set.id}`);
      } else if (set.sessionSize > set.itemIds.length) {
        issues.push(
          `sessionSize ${set.sessionSize} exceeds pool ${set.itemIds.length}: ${set.id}`,
        );
      }
    }
  }

  return issues;
}
