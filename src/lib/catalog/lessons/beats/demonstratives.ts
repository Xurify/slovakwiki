import type {
  FormTableHeading,
  FormTableVisual,
  LessonBeat,
  LessonExercise,
} from "$lib/learning/types";
import {
  CASES,
  paradigmRow,
  type DemonstrativeSeries,
  type GrammaticalCase,
} from "$lib/learning/demonstratives/paradigm";

export const demonstrativesLineIds = {
  annaSummerPhotos: "demonstratives-anna-summer-photos",
  youWhoIsThatMan: "demonstratives-you-who-is-that-man",
  annaMyBrother: "demonstratives-anna-my-brother-tom",
  youWhoIsThatWoman: "demonstratives-you-who-is-that-woman",
  annaHisWifeEva: "demonstratives-anna-his-wife-eva",
  youWhoAreThoseMen: "demonstratives-you-who-are-those-men",
  annaHisColleagues: "demonstratives-anna-his-colleagues",
  youKnowThatMan: "demonstratives-you-know-that-man",
  annaThatsMarek: "demonstratives-anna-thats-marek",
  annaManHelpsUs: "demonstratives-anna-man-helps-us",
  annaCinemaWithColleagues: "demonstratives-anna-cinema-with-colleagues",
  waiterTakesOrder: "demonstratives-waiter-takes-order",
  youHowMuchCake: "demonstratives-you-how-much-cake",
  waiterThreeEuros: "demonstratives-waiter-three-euros",
  youThisCake: "demonstratives-you-this-cake",
  annaThatCake: "demonstratives-anna-that-cake",
  waiterConfirmsOrder: "demonstratives-waiter-confirms-order",
} as const;

const SINGULAR: FormTableHeading = { english: "Singular", slovak: "jednotné číslo" };
const PLURAL: FormTableHeading = { english: "Plural", slovak: "množné číslo" };

/** Same order as `paradigmRow`: three singular genders, then the two plural groups. */
const CATEGORIES: FormTableHeading[] = [
  { english: "Masculine", slovak: "mužský rod", example: "muž, dom" },
  { english: "Feminine", slovak: "ženský rod", example: "žena" },
  { english: "Neuter", slovak: "stredný rod", example: "auto, dievča" },
  {
    english: "Masculine personal",
    slovak: "mužský rod životný (osoby)",
    example: "muži",
  },
  {
    english: "Every other plural",
    slovak: "ostatné podstatné mená",
    example: "ženy, deti, kľúče",
  },
];

const SINGULAR_CATEGORIES = [0, 1, 2];
const PLURAL_CATEGORIES = [3, 4];

const SERIES_COLUMNS: Array<{ heading: FormTableHeading; series: DemonstrativeSeries }> =
  [
    { series: "ten", heading: { english: "the / that", slovak: "ten" } },
    { series: "tento", heading: { english: "this", slovak: "tento" } },
    { series: "tamten", heading: { english: "that over there", slovak: "tamten" } },
  ];

function seriesTable(): FormTableVisual {
  const forms = SERIES_COLUMNS.map(({ series }) => paradigmRow(series, "nominative"));
  const rowsFor = (categories: number[]) =>
    categories.map((category) => ({
      heading: CATEGORIES[category]!,
      cells: forms.map((row) => row[category]!),
    }));

  return {
    type: "form-table",
    title: "**Ten**, **tento**, **tamten**",
    columns: SERIES_COLUMNS.map(({ heading }) => heading),
    sections: [
      { heading: SINGULAR, rows: rowsFor(SINGULAR_CATEGORIES) },
      { heading: PLURAL, rows: rowsFor(PLURAL_CATEGORIES) },
    ],
    note: "**Tento** adds **-to** to ten. **Tamten** puts **tam-** in front. Both decline exactly like **ten**.",
  };
}

function genderFromEndingTable(): FormTableVisual {
  return {
    type: "form-table",
    title: "Look at the ending",
    columns: [{ english: "the / that", slovak: "ten · tá · to" }],
    sections: [
      {
        rows: [
          {
            heading: {
              english: "Ends in a consonant",
              slovak: "mužský rod",
              example: "kufor, dom",
            },
            cells: ["ten"],
          },
          {
            heading: {
              english: "Ends in -a",
              slovak: "ženský rod",
              example: "taška, kniha",
            },
            cells: ["tá"],
          },
          {
            heading: {
              english: "Ends in -o, -e, -ie",
              slovak: "stredný rod",
              example: "auto, pero, námestie",
            },
            cells: ["to"],
          },
        ],
      },
    ],
    note: "**Kolega** (colleague) ends in -a, but it is actually masculine: **ten kolega**. **Dievča** (girl) and **dieťa** (child) are neuter: **to dievča**. Some nouns ending in a consonant are feminine: **tá noc** (night), **tá vec** (thing), **tá radosť** (joy).",
  };
}

const CASE_HEADINGS: Record<GrammaticalCase, FormTableHeading> = {
  nominative: { english: "Nominative", slovak: "nominatív", example: "Kde je …?" },
  genitive: { english: "Genitive", slovak: "genitív", example: "bez …" },
  dative: { english: "Dative", slovak: "datív", example: "pomáham …" },
  accusative: { english: "Accusative", slovak: "akuzatív", example: "hľadám …" },
  locative: { english: "Locative", slovak: "lokál", example: "o …" },
  instrumental: { english: "Instrumental", slovak: "inštrumentál", example: "s …" },
};

const PLURAL_CASE_HEADINGS: Record<GrammaticalCase, FormTableHeading> = {
  ...CASE_HEADINGS,
  nominative: { ...CASE_HEADINGS.nominative, example: "Kde sú …?" },
};

function caseTable(
  series: DemonstrativeSeries,
  title: string,
  categories: number[],
  note?: string,
): FormTableVisual {
  const headings = categories.every((category) => PLURAL_CATEGORIES.includes(category))
    ? PLURAL_CASE_HEADINGS
    : CASE_HEADINGS;

  return {
    type: "form-table",
    title,
    columns: categories.map((category) => CATEGORIES[category]!),
    sections: [
      {
        rows: CASES.map((grammaticalCase) => {
          const forms = paradigmRow(series, grammaticalCase);
          return {
            heading: headings[grammaticalCase],
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
    "ten",
    "**Ten** through the cases · singular",
    SINGULAR_CATEGORIES,
    "Masculine accusative splits: people and animals take **toho** (toho muža, toho psa), things keep **ten** (ten dom).",
  ),
  caseTable(
    "ten",
    "**Ten** through the cases · plural",
    PLURAL_CATEGORIES,
    "**Tamten** adds **tam-** to every form: **tamtoho**, **tamtú**, **tamtých**.",
  ),
  caseTable(
    "tento",
    "**Tento** through the cases · singular",
    SINGULAR_CATEGORIES,
    "**Tento** adds **-to** to every form of ten, and toho becomes **tohto**. Plural: **títo / tieto**, **týchto**, **týmto**, **týchto / tieto**, **týchto**, **týmito**.",
  ),
];

export const demonstrativesBeatShells: Omit<LessonBeat, "exercises">[] = [
  {
    id: "demonstratives-ten-ta-to",
    title: "Ten, tá, to",
    teach: {
      sceneLineIds: [
        demonstrativesLineIds.annaSummerPhotos,
        demonstrativesLineIds.youWhoIsThatMan,
        demonstrativesLineIds.annaMyBrother,
        demonstrativesLineIds.youWhoIsThatWoman,
      ],
      phrases: [
        {
          slovak: "ten muž",
          english: "that man",
          note: "Masculine: **ten**",
          audio: { transcript: "ten muž" },
        },
        {
          slovak: "tá žena",
          english: "that woman",
          note: "Feminine: **tá**",
          audio: { transcript: "tá žena" },
        },
        {
          slovak: "to dievča",
          english: "that girl",
          note: "Neuter: **to**. Dievča is a neuter noun.",
          audio: { transcript: "to dievča" },
        },
      ],
      note: "**Ten**, **tá**, **to** take the gender of the noun after them, and the noun's ending usually shows it. Slovak has no word for “the”, so **ten** often does that job too: Kto je ten muž? can mean “Who is that man?” or “Who is the man?”.",
      visual: genderFromEndingTable(),
    },
  },
  {
    id: "demonstratives-to-je",
    title: "To je …, to sú …",
    teach: {
      sceneLineIds: [demonstrativesLineIds.annaHisWifeEva],
      phrases: [
        {
          slovak: "To je môj brat.",
          english: "That's my brother.",
          note: "**To** doesn't change, even when it points at a man.",
          audio: { transcript: "To je môj brat." },
        },
        {
          slovak: "To sú fotky z leta.",
          english: "These are photos from the summer.",
          note: "Plural: only the verb changes, to **sú**.",
          audio: { transcript: "To sú fotky z leta." },
        },
        {
          slovak: "Čo je to?",
          english: "What is that?",
          note: "**To** on its own works in questions too.",
          audio: { transcript: "Čo je to?" },
        },
      ],
      note: "On its own, **to** means *this*, *that*, or *it*. In **to je** and **to sú** it stays **to**, whatever comes after it: To je môj brat. To je jeho žena. To sú fotky. Only the verb changes: **je** for one, **sú** for more. When a noun comes right after it, use the form that matches the noun: **tá** žena.",
    },
  },
  {
    id: "demonstratives-plural",
    title: "Plural: tí and tie",
    teach: {
      sceneLineIds: [
        demonstrativesLineIds.youWhoAreThoseMen,
        demonstrativesLineIds.annaHisColleagues,
      ],
      phrases: [
        {
          slovak: "tí muži",
          english: "those men",
          note: "Masculine nouns for people: **tí** · **títo** · **tamtí**",
          audio: { transcript: "tí muži" },
        },
        {
          slovak: "tie ženy",
          english: "those women",
          note: "Every other plural: **tie** · **tieto** · **tamtie**",
          audio: { transcript: "tie ženy" },
        },
        {
          slovak: "tie deti",
          english: "those children",
          note: "Deti are people, but deti is not a masculine noun: **tie**.",
          audio: { transcript: "tie deti" },
        },
      ],
      note: "Only masculine nouns for people take **tí**: tí muži, tí chlapci, tí ľudia. Everything else takes **tie**: women, children, things. Anna said tie deti, but you ask about tí muži.",
    },
  },
  {
    id: "demonstratives-cases",
    title: "In every case",
    teach: {
      sceneLineIds: [
        demonstrativesLineIds.youKnowThatMan,
        demonstrativesLineIds.annaThatsMarek,
        demonstrativesLineIds.annaManHelpsUs,
        demonstrativesLineIds.annaCinemaWithColleagues,
      ],
      phrases: [
        {
          slovak: "Poznám toho muža.",
          english: "I know that man.",
          note: "Accusative, people and animals: **toho** — the noun changes too.",
          audio: { transcript: "Poznám toho muža." },
        },
        {
          slovak: "Vidím ten dom.",
          english: "I see that house.",
          note: "Accusative, things: **ten** doesn't change.",
          audio: { transcript: "Vidím ten dom." },
        },
        {
          slovak: "tomu mužovi",
          english: "to that man",
          note: "Dative: **tomu** · **tej** · **tým**",
          audio: { transcript: "tomu mužovi" },
        },
        {
          slovak: "v tom dome",
          english: "in that house",
          note: "Locative: **tom** · **tej** · **tých**",
          audio: { transcript: "v tom dome" },
        },
        {
          slovak: "s tou ženou",
          english: "with that woman",
          note: "Instrumental: **tým** · **tou** · **tými**",
          audio: { transcript: "s tou ženou" },
        },
      ],
      note: "**Ten** takes the case of its noun. Poznať needs the accusative, so you say **toho** muža. **V** (in) takes the locative, so Anna says v **tom** dome. Pomáhať needs the dative: **tomu** mužovi.",
      visual: caseTables,
    },
  },
  {
    id: "demonstratives-tento-tamten",
    title: "This one, that one",
    teach: {
      sceneLineIds: [
        demonstrativesLineIds.waiterTakesOrder,
        demonstrativesLineIds.youHowMuchCake,
        demonstrativesLineIds.waiterThreeEuros,
        demonstrativesLineIds.youThisCake,
        demonstrativesLineIds.annaThatCake,
        demonstrativesLineIds.waiterConfirmsOrder,
      ],
      phrases: [
        {
          slovak: "tento koláč",
          english: "this cake",
          note: "**tento** = this one here",
          audio: { transcript: "tento koláč" },
        },
        {
          slovak: "tamtá torta",
          english: "that layer cake over there",
          note: "**tamten** = that one over there",
          audio: { transcript: "tamtá torta" },
        },
        {
          slovak: "ten koláč",
          english: "the / that cake",
          note: "**ten** = the everyday choice",
          audio: { transcript: "ten koláč" },
        },
      ],
      note: "You point at the cake in front of you: **tento**. Anna points at one further away: **tamtú**. When nothing needs pointing out, plain **ten** is the natural choice.",
      visual: seriesTable(),
    },
  },
  {
    id: "demonstratives-traps",
    title: "Small traps",
    teach: {
      phrases: [
        {
          slovak: "Poznáš tohto muža?",
          english: "Do you know this man?",
          note: "**Tohto** — not tohoto, which is Czech.",
          audio: { transcript: "Poznáš tohto muža?" },
        },
        {
          slovak: "Koľko stoja tieto knihy?",
          english: "How much are these books?",
          note: "**Tieto** — not tyto, which is Czech.",
          audio: { transcript: "Koľko stoja tieto knihy?" },
        },
        {
          slovak: "s tými chlapcami",
          english: "with those boys",
          note: "Instrumental plural: **tými**. **Tým** is masculine or neuter instrumental singular (s tým chlapcom) or dative plural (tým deťom).",
          audio: { transcript: "s tými chlapcami" },
        },
      ],
    },
  },
  {
    id: "demonstratives-your-turn",
    title: "Your turn",
    teach: {},
  },
];

export function withDemonstrativesExercises(
  shells: Omit<LessonBeat, "exercises">[],
  graded: LessonExercise[],
  personal: LessonExercise,
): LessonBeat[] {
  const sizes = [3, 2, 3, 3, 3, 2];
  let cursor = 0;

  const beats = sizes.map((size, index) => {
    const exercises = graded.slice(cursor, cursor + size);
    cursor += size;
    return { ...shells[index]!, exercises };
  });

  return [...beats, { ...shells[sizes.length]!, exercises: [personal] }];
}
