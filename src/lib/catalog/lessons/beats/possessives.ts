import type { FormTableVisual, LessonBeat, LessonExercise } from "$lib/learning/types";
import {
  agreementRow,
  caseCell,
  CASES,
  possessiveForm,
  type GrammaticalCase,
} from "$lib/learning/possessives/paradigm";

const OWNED_COLUMNS = ["brat", "sestra", "auto", "kľúče"];

const agreementTable: FormTableVisual = {
  type: "form-table",
  title: "The ending follows the thing owned",
  columns: OWNED_COLUMNS,
  columnsLang: "sk",
  rows: [
    { label: "my", cells: agreementRow("my") },
    { label: "your (ty)", cells: agreementRow("your-ty") },
    { label: "our", cells: agreementRow("our") },
    { label: "your (vy)", cells: agreementRow("your-vy") },
  ],
  note: "People in the plural take -i instead: moji priatelia, naši rodičia.",
};

const fixedOwnerTable: FormTableVisual = {
  type: "form-table",
  title: "Jeho, jej, ich never change",
  columns: OWNED_COLUMNS,
  columnsLang: "sk",
  rows: [
    { label: "his", cells: agreementRow("his") },
    { label: "her", cells: agreementRow("her") },
    { label: "their", cells: agreementRow("their") },
  ],
};

const CASE_ROW_LABEL: Record<GrammaticalCase, string> = {
  nominative: "Nominative · To je …",
  genitive: "Genitive · u …",
  dative: "Dative · píšem …",
  accusative: "Accusative · hľadám …",
  locative: "Locative · o …",
  instrumental: "Instrumental · s …",
};

const caseTable: FormTableVisual = {
  type: "form-table",
  title: "Môj through the cases",
  columns: ["Masculine", "Feminine", "Neuter", "Plural"],
  rows: CASES.map((grammaticalCase) => ({
    label: CASE_ROW_LABEL[grammaticalCase],
    cells: [
      caseCell("my", "masculine", grammaticalCase),
      possessiveForm("my", "feminine", grammaticalCase),
      possessiveForm("my", "neuter", grammaticalCase),
      caseCell("my", "plural", grammaticalCase),
    ],
  })),
  note: "Where a cell has two forms, people come first: môjho brata, but môj kľúč. Tvoj, svoj, náš, and váš take the same endings.",
};

export const possessivesBeatShells: Omit<LessonBeat, "exercises">[] = [
  {
    id: "agreement",
    title: "My, your, our",
    teach: {
      sceneLineIds: ["anna-brother"],
      phrases: [
        {
          slovak: "môj brat",
          english: "my brother",
          note: "Masculine: môj · tvoj · náš · váš",
          audio: { transcript: "môj brat" },
        },
        {
          slovak: "moja sestra",
          english: "my sister",
          note: "Feminine: moja · tvoja · naša · vaša",
          audio: { transcript: "moja sestra" },
        },
        {
          slovak: "moje auto",
          english: "my car",
          note: "Neuter: moje · tvoje · naše · vaše",
          audio: { transcript: "moje auto" },
        },
      ],
      note: "Môj, tvoj, náš, and váš take the gender of the thing owned, not of the owner. Anna says môj brat because brat is masculine.",
      visual: agreementTable,
    },
  },
  {
    id: "svoj",
    title: "His own: svoj",
    teach: {
      sceneLineIds: ["anna-letter", "you-where", "anna-canada"],
      phrases: [
        {
          slovak: "Tom volá svojej mame.",
          english: "Tom is calling his (own) mother.",
          note: "svoj = the subject's own",
          audio: { transcript: "Tom volá svojej mame." },
        },
        {
          slovak: "Tom volá jeho mame.",
          english: "Tom is calling his mother — another man's.",
          note: "jeho = someone else's",
          audio: { transcript: "Tom volá jeho mame." },
        },
      ],
      note: "When the owner is the subject, use svoj. It takes the case of its noun: svojmu priateľovi, svojej mame. Svoj never sits in the subject itself — that is why you ask Kde býva jeho priateľ?",
    },
  },
  {
    id: "his-her-their",
    title: "His, her, their",
    teach: {
      phrases: [
        {
          slovak: "jej brat",
          english: "her brother",
          note: "Jeho, jej, ich follow the owner — he, she, they.",
          audio: { transcript: "jej brat" },
        },
        {
          slovak: "s jeho bratom",
          english: "with his brother",
          note: "Not s ním bratom — jeho stays jeho after a preposition.",
          audio: { transcript: "s jeho bratom" },
        },
      ],
      visual: fixedOwnerTable,
    },
  },
  {
    id: "cases",
    title: "In every case",
    teach: {
      sceneLineIds: ["anna-you", "you-mom"],
      phrases: [
        {
          slovak: "Anna píše list mojej sestre.",
          english: "Anna is writing a letter to my sister.",
          note: "Dative (to whom): môjmu · mojej · mojim",
          audio: { transcript: "Anna píše list mojej sestre." },
        },
        {
          slovak: "Anna ide do kina s mojou sestrou.",
          english: "Anna is going to the cinema with my sister.",
          note: "Instrumental (with): mojím · mojou · mojimi",
          audio: { transcript: "Anna ide do kina s mojou sestrou." },
        },
        {
          slovak: "auto môjho brata",
          english: "my brother's car",
          note: "Genitive: the owner comes after the thing.",
          audio: { transcript: "auto môjho brata" },
        },
      ],
      visual: caseTable,
    },
  },
  {
    id: "whose",
    title: "Whose is it?",
    teach: {
      sceneLineIds: ["anna-keys", "you-mine"],
      phrases: [
        {
          slovak: "Čí je to kľúč?",
          english: "Whose key is this?",
          note: "čí · čia · čie agree like môj.",
          audio: { transcript: "Čí je to kľúč?" },
        },
        {
          slovak: "Petrovo auto",
          english: "Peter's car",
          note: "One named owner becomes an adjective: Petrov, Annina, Petrovo.",
          audio: { transcript: "Petrovo auto" },
        },
      ],
      note: "With a longer owner, use the genitive instead: auto môjho brata.",
    },
  },
  {
    id: "traps",
    title: "Small traps",
    teach: {
      phrases: [
        {
          slovak: "s naším bratom",
          english: "with our brother",
          note: "Instrumental singular: long -ím.",
          audio: { transcript: "s naším bratom" },
        },
        {
          slovak: "našim rodičom",
          english: "to our parents",
          note: "Dative plural: short -im.",
          audio: { transcript: "našim rodičom" },
        },
        {
          slovak: "Umývam si ruky.",
          english: "I'm washing my hands.",
          note: "Your own body takes si, not môj.",
          audio: { transcript: "Umývam si ruky." },
        },
      ],
    },
  },
  {
    id: "your-turn",
    title: "Your turn",
    teach: {},
  },
];

/** Graded exercises fill beats 3-3-3-3-2-2; the personal wrap-up closes the lesson. */
export function withPossessivesExercises(
  shells: Omit<LessonBeat, "exercises">[],
  graded: LessonExercise[],
  personal: LessonExercise,
): LessonBeat[] {
  const sizes = [3, 3, 3, 3, 2, 2];
  let cursor = 0;

  const beats = sizes.map((size, index) => {
    const exercises = graded.slice(cursor, cursor + size);
    cursor += size;
    return { ...shells[index]!, exercises };
  });

  return [...beats, { ...shells[sizes.length]!, exercises: [personal] }];
}
