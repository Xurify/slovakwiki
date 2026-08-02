import type { Lesson, LessonTrack, LessonTrackId } from "./learning-types";

export const lessonTracks: LessonTrack[] = [
  {
    id: "everyday",
    title: "Everyday Slovak",
    description: "Useful Slovak for meeting people and handling everyday situations.",
  },
  {
    id: "grammar",
    title: "Grammar",
    description: "Language patterns you can use in a real Slovak sentence.",
  },
  {
    id: "pronunciation",
    title: "Pronunciation",
    description: "Hear, read, and say the Slovak sounds that matter first.",
  },
];

export const lessons: Lesson[] = [
  {
    id: "everyday/meet-someone",
    track: "everyday",
    slug: "meet-someone",
    group: "Core tools",
    title: "Meet someone",
    promise: "Greet someone politely, introduce yourself, and say where you are from.",
    scene: [
      {
        id: "anna-greeting",
        speaker: "Anna",
        slovak: "Dobrý deň. Volám sa Anna.",
        english: "Hello. My name is Anna.",
        audio: { transcript: "Dobrý deň. Volám sa Anna." },
      },
      {
        id: "you-introduction",
        speaker: "You",
        slovak: "Dobrý deň. Volám sa Alex.",
        english: "Hello. My name is Alex.",
        audio: { transcript: "Dobrý deň. Volám sa Alex." },
      },
      {
        id: "anna-origin",
        speaker: "Anna",
        slovak: "Teší ma. Odkiaľ ste?",
        english: "Nice to meet you. Where are you from?",
        audio: { transcript: "Teší ma. Odkiaľ ste?" },
      },
      {
        id: "you-origin",
        speaker: "You",
        slovak: "Som z Kanady.",
        english: "I am from Canada.",
        audio: { transcript: "Som z Kanady." },
      },
      {
        id: "anna-slovak",
        speaker: "Anna",
        slovak: "Hovoríte po slovensky?",
        english: "Do you speak Slovak?",
        audio: { transcript: "Hovoríte po slovensky?" },
      },
      {
        id: "you-learning",
        speaker: "You",
        slovak: "Trochu. Ešte sa učím.",
        english: "A little. I am still learning.",
        audio: { transcript: "Trochu. Ešte sa učím." },
      },
    ],
    keyPhrases: [
      {
        slovak: "Dobrý deň.",
        english: "Hello; good day.",
        note: "A safe polite greeting for a new or public interaction.",
        audio: { transcript: "Dobrý deň." },
      },
      {
        slovak: "Volám sa …",
        english: "My name is …",
        audio: { transcript: "Volám sa." },
      },
      {
        slovak: "Som z …",
        english: "I am from …",
        audio: { transcript: "Som z." },
      },
      {
        slovak: "Ešte sa učím.",
        english: "I am still learning.",
        audio: { transcript: "Ešte sa učím." },
      },
    ],
    pattern: {
      title: "Polite first contact",
      body: "Start with Dobrý deň when you do not know the person. Ahoj is for friends, peers, and people already using informal Slovak with you.",
    },
    exercises: [
      {
        id: "meet-someone-greeting",
        type: "choice",
        practiceItemId: "everyday/formal-greeting",
        prompt: "You are meeting Anna, the organiser, for the first time. What do you say?",
        choices: [
          { id: "formal", label: "Dobrý deň. Volám sa Alex." },
          { id: "informal", label: "Ahoj!" },
          { id: "leaving", label: "Dovidenia." },
        ],
        answerId: "formal",
        feedback: {
          correction: "Dobrý deň. Volám sa Alex.",
          english: "Hello. My name is Alex.",
          why: "Dobrý deň is the safe polite opening. Ahoj is for an informal interaction; Dovidenia is for leaving.",
        },
      },
      {
        id: "meet-someone-name",
        type: "build",
        practiceItemId: "everyday/introduction",
        prompt: "Anna has introduced herself. Build your reply.",
        tiles: ["Alex.", "sa", "Dobrý deň.", "Volám"],
        answer: ["Dobrý deň.", "Volám", "sa", "Alex."],
        feedback: {
          correction: "Dobrý deň. Volám sa Alex.",
          english: "Hello. My name is Alex.",
          why: "Volám sa is the everyday way to introduce yourself. The little word sa belongs with volám.",
        },
      },
      {
        id: "meet-someone-origin",
        type: "typed",
        task: "complete",
        practiceItemId: "everyday/origin",
        context: [
          {
            id: "origin-question",
            speaker: "Anna",
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
          why: "Use Som z … for where you are from. The country follows z in its Slovak form: Kanada → Kanady.",
        },
      },
      {
        id: "meet-someone-personal",
        type: "personal",
        prompt: "Say the same answer with your own country. Then say it once without looking.",
        example: "Som z Kanady.",
      },
    ],
    referenceLinks: [
      { href: "/dictionary/dobry-den", label: "Dobrý deň" },
      { href: "/dictionary/ahoj", label: "Ahoj" },
      { href: "/dictionary/ucit-sa", label: "učiť sa" },
    ],
  },
  {
    id: "grammar/present-tense-i",
    track: "grammar",
    slug: "present-tense-i",
    title: "Say what you do now",
    promise: "Change a present-tense verb to say that you are doing the action.",
    scene: [
      {
        id: "peter-reads",
        speaker: "Anna",
        slovak: "Peter číta knihu.",
        english: "Peter is reading a book.",
        audio: { transcript: "Peter číta knihu." },
      },
      {
        id: "you-read",
        speaker: "You",
        slovak: "Čítam knihu.",
        english: "I am reading a book.",
        audio: { transcript: "Čítam knihu." },
      },
    ],
    keyPhrases: [
      {
        slovak: "číta",
        english: "he/she reads",
        note: "Use this when Peter, Anna, or another one person does the action.",
        audio: { transcript: "číta" },
      },
      {
        slovak: "čítam",
        english: "I read",
        note: "The ending -m tells the listener that you are the person doing it.",
        audio: { transcript: "čítam" },
      },
    ],
    pattern: {
      title: "The ending changes with the person",
      body: "Číta means he or she reads. Čítam means I read. Slovak often leaves out ja because -m already tells you who is acting.",
    },
    exercises: [
      {
        id: "present-tense-choose",
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
      {
        id: "present-tense-repair",
        type: "typed",
        task: "repair",
        practiceItemId: "grammar/repair-first-person-reading",
        prompt: "You mean “I am reading a book.” Repair this Slovak sentence: Ja číta knihu.",
        inputLabel: "Correct Slovak sentence",
        answer: "Čítam knihu.",
        acceptedAnswers: ["Ja čítam knihu."],
        feedback: {
          correction: "Čítam knihu.",
          english: "I am reading a book.",
          why: "Číta is he/she reads. Change it to čítam for I. Ja is possible for emphasis, but the verb ending already says who is acting.",
        },
      },
      {
        id: "present-tense-build",
        type: "build",
        practiceItemId: "grammar/today-reading",
        prompt: "Build a new sentence about what you are doing today.",
        tiles: ["knihu.", "Dnes", "čítam"],
        answer: ["Dnes", "čítam", "knihu."],
        feedback: {
          correction: "Dnes čítam knihu.",
          english: "Today I am reading a book.",
          why: "Dnes gives the time; čítam keeps the I ending. The subject pronoun is still unnecessary.",
        },
      },
      {
        id: "present-tense-personal",
        type: "personal",
        prompt: "Say one true present-tense sentence about yourself.",
        example: "Dnes pracujem.",
      },
    ],
    referenceLinks: [{ href: "/grammar/present-tense", label: "Present tense" }],
  },
  {
    id: "pronunciation/first-syllable-stress",
    track: "pronunciation",
    slug: "first-syllable-stress",
    title: "Find the first beat",
    promise: "Hear the regular first-syllable stress in common Slovak words.",
    scene: [
      {
        id: "anna-thanks",
        speaker: "Anna",
        slovak: "Ďakujem za pomoc.",
        english: "Thank you for the help.",
        audio: { transcript: "Ďakujem za pomoc." },
      },
      {
        id: "stress-mark",
        speaker: "Notice",
        slovak: "ĎA-ku-jem",
        english: "The first syllable takes the steady beat.",
        audio: { transcript: "ďakujem" },
      },
    ],
    keyPhrases: [
      {
        slovak: "ĎA-ku-jem",
        english: "thank you",
        note: "Stress the first syllable. Keep the other two lighter.",
        audio: { transcript: "ďakujem" },
      },
      {
        slovak: "BRA-ti-sla-va",
        english: "Bratislava",
        note: "The same first-syllable pattern.",
        audio: { transcript: "Bratislava" },
      },
    ],
    pattern: {
      title: "Stress is usually first",
      body: "In ordinary Slovak words, the first syllable carries the main beat. This is separate from vowel length: a long vowel is held longer, not automatically stressed.",
    },
    exercises: [
      {
        id: "stress-choose",
        type: "choice",
        practiceItemId: "pronunciation/dakujem-stress",
        prompt: "Which syllable is normally stressed in ďakujem?",
        choices: [
          { id: "first", label: "ďa — the first syllable" },
          { id: "middle", label: "ku — the middle syllable" },
          { id: "last", label: "jem — the last syllable" },
        ],
        answerId: "first",
        feedback: {
          correction: "ĎA-ku-jem",
          why: "Slovak normally puts the main stress on the first syllable of a word.",
        },
      },
      {
        id: "stress-build",
        type: "build",
        practiceItemId: "pronunciation/thanks-phrase",
        prompt: "Build the phrase Anna said.",
        tiles: ["pomoc.", "Ďakujem", "za"],
        answer: ["Ďakujem", "za", "pomoc."],
        feedback: {
          correction: "Ďakujem za pomoc.",
          english: "Thank you for the help.",
          why: "Keep the first beat on ĎA- in ďakujem, then say the rest of the phrase evenly.",
        },
      },
      {
        id: "stress-personal",
        type: "personal",
        prompt: "Listen, then say these aloud: ďakujem, Bratislava, prosím.",
      },
    ],
    referenceLinks: [
      { href: "/pronunciation/first-syllable-stress", label: "First-syllable stress" },
      { href: "/dictionary/dakujem", label: "ďakujem" },
    ],
  },
];

export const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));

export function lessonPath(lesson: Pick<Lesson, "slug" | "track">): string {
  return `/lessons/${lesson.track}/${lesson.slug}`;
}

export function lessonsForTrack(track: LessonTrackId): Lesson[] {
  return lessons.filter((lesson) => lesson.track === track);
}

export function validateLessons(): string[] {
  const issues: string[] = [];
  const ids = new Set<string>();

  for (const lesson of lessons) {
    if (ids.has(lesson.id)) issues.push(`Duplicate lesson: ${lesson.id}`);
    ids.add(lesson.id);

    if (!lesson.scene.length) issues.push(`Missing scene: ${lesson.id}`);
    if (!lesson.exercises.length) issues.push(`Missing exercises: ${lesson.id}`);
    if (lesson.exercises.filter((exercise) => exercise.type !== "personal").length < 2) {
      issues.push(`Too few graded exercises: ${lesson.id}`);
    }
  }

  return issues;
}
