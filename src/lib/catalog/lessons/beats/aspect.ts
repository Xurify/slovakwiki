import type {
  FormTableHeading,
  FormTableVisual,
  LessonBeat,
  LessonExercise,
} from "$lib/learning/types";

export const aspectLineIds = {
  annaWhatAreYouDoing: "aspect-anna-what-are-you-doing",
  youCookingSoup: "aspect-you-cooking-soup",
  annaSoupEverySunday: "aspect-anna-soup-every-sunday",
  annaWhenWillWeEat: "aspect-anna-when-will-we-eat",
  youSoupInHalfAnHour: "aspect-you-soup-in-half-an-hour",
  annaBreadAndUmbrella: "aspect-anna-bread-and-umbrella",
  youStartedRaining: "aspect-you-started-raining",
  annaWholePot: "aspect-anna-whole-pot",
} as const;

const IMPERFECTIVE: FormTableHeading = {
  english: "Imperfective",
  slovak: "nedokonavý vid",
};
const PERFECTIVE: FormTableHeading = { english: "Perfective", slovak: "dokonavý vid" };

function pairTable(): FormTableVisual {
  const row = (english: string, imperfective: string, perfective: string) => ({
    heading: { english },
    cells: [imperfective, perfective],
  });

  return {
    type: "form-table",
    title: "Three ways to make a pair",
    columns: [IMPERFECTIVE, PERFECTIVE],
    sections: [
      {
        heading: { english: "A prefix", slovak: "predpona" },
        rows: [
          row("eat", "jesť", "zjesť"),
          row("cook", "variť", "uvariť"),
          row("write", "písať", "napísať"),
          row("read", "čítať", "prečítať"),
          row("do", "robiť", "urobiť"),
        ],
      },
      {
        heading: { english: "A different suffix", slovak: "prípona" },
        rows: [
          row("buy", "kupovať", "kúpiť"),
          row("give", "dávať", "dať"),
          row("help", "pomáhať", "pomôcť"),
          row("open", "otvárať", "otvoriť"),
        ],
      },
      {
        heading: { english: "A different verb" },
        rows: [row("take", "brať", "vziať"), row("say, tell", "hovoriť", "povedať")],
      },
    ],
    note: "Each verb has its own prefix: **na**písať, **pre**čítať, **u**variť, **z**jesť. Learn the pair, not a rule.",
  };
}

function futureTable(): FormTableVisual {
  return {
    type: "form-table",
    title: "Now and later",
    columns: [
      { english: "Now", slovak: "prítomný čas" },
      { english: "Later", slovak: "budúci čas" },
    ],
    sections: [
      {
        rows: [
          {
            heading: { ...IMPERFECTIVE, example: "variť" },
            cells: ["varím", "budem variť"],
          },
          { heading: { ...PERFECTIVE, example: "uvariť" }, cells: ["—", "uvarím"] },
        ],
      },
    ],
    note: "A perfective verb has no “now”: **uvarím** is always the future.",
  };
}

export const aspectBeatShells: Omit<LessonBeat, "exercises">[] = [
  {
    id: "aspect-process-or-result",
    title: "Process or result",
    teach: {
      sceneLineIds: [
        aspectLineIds.annaWhatAreYouDoing,
        aspectLineIds.youCookingSoup,
        aspectLineIds.annaSoupEverySunday,
      ],
      phrases: [
        {
          slovak: "Varím polievku.",
          english: "I'm cooking soup.",
          note: "Imperfective: going on right now.",
          audio: { transcript: "Varím polievku." },
        },
        {
          slovak: "Každú nedeľu varím polievku.",
          english: "I cook soup every Sunday.",
          note: "Imperfective: a habit.",
          audio: { transcript: "Každú nedeľu varím polievku." },
        },
        {
          slovak: "Anna uvarila polievku.",
          english: "Anna has cooked the soup.",
          note: "Perfective: done, and the soup is ready.",
          audio: { transcript: "Anna uvarila polievku." },
        },
      ],
      note: "Most Slovak verbs come in pairs. The **imperfective** (**nedokonavý vid**) is the action going on, again and again, or for a while. The **perfective** (**dokonavý vid**) is one action done, with its result. English tense does not decide it. Ask: the process, or the result?",
    },
  },
  {
    id: "aspect-future",
    title: "Perfective present means later",
    teach: {
      sceneLineIds: [aspectLineIds.annaWhenWillWeEat, aspectLineIds.youSoupInHalfAnHour],
      phrases: [
        {
          slovak: "Budeme jesť.",
          english: "We will eat.",
          note: "Imperfective future: **budem** + infinitive.",
          audio: { transcript: "Budeme jesť." },
        },
        {
          slovak: "Uvarím polievku.",
          english: "I will cook the soup.",
          note: "Perfective: the present form already means later.",
          audio: { transcript: "Uvarím polievku." },
        },
        {
          slovak: "Zajtra ti zavolám.",
          english: "I'll call you tomorrow.",
          note: "One call, later: **zavolám**.",
          audio: { transcript: "Zajtra ti zavolám." },
        },
      ],
      note: "Perfective verbs have no present meaning. Their present forms are the future: **uvarím** is “I will cook”, **kúpim** is “I will buy”. The imperfective future is **budem** + infinitive, as in **budeme jesť**. **Budem** never goes with a perfective verb.",
      visual: futureTable(),
    },
  },
  {
    id: "aspect-pairs",
    title: "Three ways to make a pair",
    teach: {
      sceneLineIds: [aspectLineIds.annaBreadAndUmbrella],
      phrases: [
        {
          slovak: "jesť · zjesť",
          english: "to eat · to eat up",
          note: "A prefix: **z-** makes the perfective.",
          audio: { transcript: "jesť, zjesť" },
        },
        {
          slovak: "kupovať · kúpiť",
          english: "to buy",
          note: "A different suffix: the longer verb is the imperfective.",
          audio: { transcript: "kupovať, kúpiť" },
        },
        {
          slovak: "brať · vziať",
          english: "to take",
          note: "Two different verbs. **Vezmem** is “I will take”.",
          audio: { transcript: "brať, vziať" },
        },
      ],
      note: "Anna says **kúpim** and **vezmem**: one loaf, one umbrella, both later. Most pairs add a prefix. Some change the suffix, and a few are two different verbs.",
      visual: pairTable(),
    },
  },
  {
    id: "aspect-start-stop",
    title: "Začať and prestať",
    teach: {
      sceneLineIds: [aspectLineIds.youStartedRaining, aspectLineIds.annaWholePot],
      phrases: [
        {
          slovak: "Začalo pršať.",
          english: "It has started raining.",
          note: "**Začať** + imperfective **pršať**.",
          audio: { transcript: "Začalo pršať." },
        },
        {
          slovak: "Prestalo pršať.",
          english: "It has stopped raining.",
          note: "**Prestať** + imperfective, too.",
          audio: { transcript: "Prestalo pršať." },
        },
        {
          slovak: "Začal som sa učiť slovenčinu.",
          english: "I started learning Slovak.",
          note: "**Učiť sa**, not naučiť sa. A woman says **začala som**.",
          audio: { transcript: "Začal som sa učiť slovenčinu." },
        },
      ],
      note: "**Začať**, **prestať** and **skončiť** say when an activity starts or stops, so the activity after them is always imperfective: **začať písať**, **prestať jesť**.",
    },
  },
  {
    id: "aspect-traps",
    title: "Small traps",
    teach: {
      phrases: [
        {
          slovak: "Zajtra napíšem e-mail.",
          english: "Tomorrow I'll write the email.",
          note: "No **budem** before **napíšem**.",
          audio: { transcript: "Zajtra napíšem e-mail." },
        },
        {
          slovak: "Čítal si tú knihu?",
          english: "Have you read that book?",
          note: "Imperfective: at all, even a page.",
          audio: { transcript: "Čítal si tú knihu?" },
        },
        {
          slovak: "Prečítal si tú knihu?",
          english: "Have you finished that book?",
          note: "Perfective: all of it, to the end.",
          audio: { transcript: "Prečítal si tú knihu?" },
        },
      ],
    },
  },
  {
    id: "aspect-your-turn",
    title: "Your turn",
    teach: {},
  },
];

export function withAspectExercises(
  shells: Omit<LessonBeat, "exercises">[],
  graded: LessonExercise[],
  personal: LessonExercise,
): LessonBeat[] {
  const sizes = [3, 3, 3, 3, 2];
  let cursor = 0;

  const beats = sizes.map((size, index) => {
    const exercises = graded.slice(cursor, cursor + size);
    cursor += size;
    return { ...shells[index]!, exercises };
  });

  return [...beats, { ...shells[sizes.length]!, exercises: [personal] }];
}
