import type {
  FormTableHeading,
  FormTableVisual,
  LessonBeat,
  LessonExercise,
} from "$lib/learning/types";
import {
  CASES,
  paradigmRow,
  type GrammaticalCase,
  type OwnerId,
} from "$lib/learning/possessives/paradigm";

export const possessivesLineIds = {
  annaComeIn: "possessives-anna-come-in",
  youNiceFlat: "possessives-you-nice-flat",
  annaMyBrother: "possessives-anna-my-brother-tom",
  annaTomWritesLetter: "possessives-anna-tom-writes-letter",
  youWhereFriendLives: "possessives-you-where-friend-lives",
  annaInCanada: "possessives-anna-in-canada",
  annaWhoDoYouWrite: "possessives-anna-who-do-you-write",
  youCallMom: "possessives-you-call-mom",
  annaWhoseKeys: "possessives-anna-whose-keys",
  youMine: "possessives-you-mine",
} as const;

const SINGULAR: FormTableHeading = { english: "Singular", slovak: "jednotné číslo" };
const PLURAL: FormTableHeading = { english: "Plural", slovak: "množné číslo" };

/** Same order as `paradigmRow`: three singular genders, then the two plural groups. */
const CATEGORIES: FormTableHeading[] = [
  { english: "Masculine", slovak: "mužský rod", example: "brat" },
  { english: "Feminine", slovak: "ženský rod", example: "sestra" },
  { english: "Neuter", slovak: "stredný rod", example: "auto" },
  { english: "Masculine personal", slovak: "mužský rod životný", example: "bratia" },
  {
    english: "Masculine inanimate, feminine, neuter",
    slovak: "mužský neživotný, ženský, stredný rod",
    example: "kľúče, sestry, autá",
  },
];

const SINGULAR_CATEGORIES = [0, 1, 2];
const PLURAL_CATEGORIES = [3, 4];

function ownerTable(
  title: string,
  owners: Array<{ english: string; owner: OwnerId }>,
  note?: string,
): FormTableVisual {
  const forms = owners.map(({ owner }) => paradigmRow(owner, "nominative"));
  const rowsFor = (categories: number[]) =>
    categories.map((category) => ({
      heading: CATEGORIES[category]!,
      cells: forms.map((row) => row[category]!),
    }));

  return {
    type: "form-table",
    title,
    columns: owners.map(({ english }) => ({ english })),
    sections: [
      { heading: SINGULAR, rows: rowsFor(SINGULAR_CATEGORIES) },
      { heading: PLURAL, rows: rowsFor(PLURAL_CATEGORIES) },
    ],
    note,
  };
}

const agreementTable = ownerTable(
  "The ending follows the thing owned",
  [
    { owner: "my", english: "my" },
    { owner: "your-ty", english: "your (ty)" },
    { owner: "our", english: "our" },
    { owner: "your-vy", english: "your (vy)" },
  ],
  "Masculine personal means a masculine noun for people. The noun decides, not who is in the group: **moji** bratia, **naši** rodičia, **naši** študenti. Every other plural takes **\u2011e**, animals included: **moje** psy, **moje** sestry, **moje** kľúče.",
);

const fixedOwnerTable = ownerTable("**Jeho**, **jej**, **ich** never change", [
  { owner: "his", english: "his" },
  { owner: "her", english: "her" },
  { owner: "their", english: "their" },
]);

const CASE_HEADINGS: Record<GrammaticalCase, FormTableHeading> = {
  nominative: { english: "Nominative", slovak: "nominatív", example: "To je …" },
  genitive: { english: "Genitive", slovak: "genitív", example: "u …" },
  dative: { english: "Dative", slovak: "datív", example: "píšem …" },
  accusative: { english: "Accusative", slovak: "akuzatív", example: "hľadám …" },
  locative: { english: "Locative", slovak: "lokál", example: "o …" },
  instrumental: { english: "Instrumental", slovak: "inštrumentál", example: "s …" },
};

function caseTable(title: string, categories: number[], note?: string): FormTableVisual {
  return {
    type: "form-table",
    title,
    columns: categories.map((category) => CATEGORIES[category]!),
    sections: [
      {
        rows: CASES.map((grammaticalCase) => {
          const forms = paradigmRow("my", grammaticalCase);
          return {
            heading: CASE_HEADINGS[grammaticalCase],
            cells: categories.map((category) => forms[category]!),
          };
        }),
      },
    ],
    note,
  };
}

const caseTables = [
  caseTable(
    "**Môj** through the cases · singular",
    SINGULAR_CATEGORIES,
    "Masculine accusative splits: people take **môjho** (môjho brata), things keep **môj** (môj kľúč).",
  ),
  caseTable(
    "**Môj** through the cases · plural",
    PLURAL_CATEGORIES,
    "**Tvoj**, **svoj**, **náš**, and **váš** take the same endings.",
  ),
];

export const possessivesBeatShells: Omit<LessonBeat, "exercises">[] = [
  {
    id: "possessives-my-your-our",
    title: "My, your, our",
    teach: {
      sceneLineIds: [
        possessivesLineIds.annaComeIn,
        possessivesLineIds.youNiceFlat,
        possessivesLineIds.annaMyBrother,
      ],
      phrases: [
        {
          slovak: "môj brat",
          english: "my brother",
          note: "Masculine: **môj** · **tvoj** · **náš** · **váš**",
          audio: { transcript: "môj brat" },
        },
        {
          slovak: "moja sestra",
          english: "my sister",
          note: "Feminine: **moja** · **tvoja** · **naša** · **vaša**",
          audio: { transcript: "moja sestra" },
        },
        {
          slovak: "moje auto",
          english: "my car",
          note: "Neuter: **moje** · **tvoje** · **naše** · **vaše**",
          audio: { transcript: "moje auto" },
        },
      ],
      note: "**Môj**, **tvoj**, **náš**, and **váš** take the gender of the thing owned, not of the owner. Anna is a woman, but it is **tvoj** byt and **môj** brat — byt and brat are masculine.",
      visual: agreementTable,
    },
  },
  {
    id: "possessives-svoj",
    title: "His own: svoj",
    teach: {
      sceneLineIds: [
        possessivesLineIds.annaTomWritesLetter,
        possessivesLineIds.youWhereFriendLives,
        possessivesLineIds.annaInCanada,
      ],
      phrases: [
        {
          slovak: "Tom volá svojej mame.",
          english: "Tom is calling his (own) mother.",
          note: "**svoj** = the subject's own",
          audio: { transcript: "Tom volá svojej mame." },
        },
        {
          slovak: "Tom volá jeho mame.",
          english: "Tom is calling his mother — another man's.",
          note: "**jeho** = someone else's",
          audio: { transcript: "Tom volá jeho mame." },
        },
      ],
      note: "When the owner is the subject, use **svoj**. It ends like môj and takes the case of its noun: **svojmu** priateľovi, **svojej** mame. Svoj never sits in the subject itself — that is why you ask Kde býva **jeho** priateľ?",
    },
  },
  {
    id: "possessives-his-her-their",
    title: "His, her, their",
    teach: {
      phrases: [
        {
          slovak: "jej brat",
          english: "her brother",
          note: "**Jeho**, **jej**, **ich** follow the owner — he, she, they.",
          audio: { transcript: "jej brat" },
        },
        {
          slovak: "s jeho bratom",
          english: "with his brother",
          note: "Not s ním bratom — **jeho** stays jeho after a preposition.",
          audio: { transcript: "s jeho bratom" },
        },
      ],
      visual: fixedOwnerTable,
    },
  },
  {
    id: "possessives-cases",
    title: "In every case",
    teach: {
      sceneLineIds: [possessivesLineIds.annaWhoDoYouWrite, possessivesLineIds.youCallMom],
      phrases: [
        {
          slovak: "Anna píše list mojej sestre.",
          english: "Anna is writing a letter to my sister.",
          note: "Dative (to whom): **môjmu** · **mojej** · **mojim**",
          audio: { transcript: "Anna píše list mojej sestre." },
        },
        {
          slovak: "Anna ide do kina s mojou sestrou.",
          english: "Anna is going to the cinema with my sister.",
          note: "Instrumental (with): **mojím** · **mojou** · **mojimi**",
          audio: { transcript: "Anna ide do kina s mojou sestrou." },
        },
        {
          slovak: "auto môjho brata",
          english: "my brother's car",
          note: "Genitive: the owner comes after the thing.",
          audio: { transcript: "auto môjho brata" },
        },
      ],
      visual: caseTables,
    },
  },
  {
    id: "possessives-whose",
    title: "Whose is it?",
    teach: {
      sceneLineIds: [possessivesLineIds.annaWhoseKeys, possessivesLineIds.youMine],
      phrases: [
        {
          slovak: "Čí je to kľúč?",
          english: "Whose key is this?",
          note: "**čí** · **čia** · **čie** agree like môj.",
          audio: { transcript: "Čí je to kľúč?" },
        },
        {
          slovak: "Petrovo auto",
          english: "Peter's car",
          note: "One named owner becomes an adjective: **Petrov**, **Annina**, **Petrovo**.",
          audio: { transcript: "Petrovo auto" },
        },
      ],
      note: "With a longer owner, use the genitive instead: auto **môjho** brata.",
    },
  },
  {
    id: "possessives-traps",
    title: "Small traps",
    teach: {
      phrases: [
        {
          slovak: "s naším bratom",
          english: "with our brother",
          note: "Instrumental singular: long **-ím**.",
          audio: { transcript: "s naším bratom" },
        },
        {
          slovak: "našim rodičom",
          english: "to our parents",
          note: "Dative plural: short **-im**.",
          audio: { transcript: "našim rodičom" },
        },
        {
          slovak: "Umývam si ruky.",
          english: "I'm washing my hands.",
          note: "Your own body takes **si**, not môj.",
          audio: { transcript: "Umývam si ruky." },
        },
      ],
    },
  },
  {
    id: "possessives-your-turn",
    title: "Your turn",
    teach: {},
  },
];

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
