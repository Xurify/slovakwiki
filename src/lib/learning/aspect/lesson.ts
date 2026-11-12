import { markedText } from "$lib/learning/marked-text";
import type { Lesson, LessonExercise } from "$lib/learning/types";
import {
  aspectBeatShells,
  withAspectExercises,
  aspectLineIds,
} from "$lib/catalog/lessons/beats";
import {
  aspectChoiceExercise,
  aspectItem,
  aspectLessonId,
  aspectPracticeItemId,
} from "./practice";

const cookingLine = markedText([{ role: "contrast", text: "Varím" }, " polievku."]);

const sundayLine = markedText([
  "Ty každú nedeľu ",
  { role: "contrast", text: "varíš" },
  " polievku!",
]);

const eatLine = markedText([
  "Mám hlad. Kedy ",
  { role: "contrast", text: "budeme jesť" },
  "?",
]);

const halfHourLine = markedText([
  "Polievku ",
  { role: "contrast", text: "uvarím" },
  " za pol hodiny.",
]);

const breadLine = markedText([
  "Fajn. Medzitým ",
  { role: "contrast", text: "kúpim" },
  " chlieb. ",
  { role: "contrast", text: "Vezmem" },
  " si tvoj dáždnik, dobre?",
]);

const rainLine = markedText([
  "Jasné. Vonku ",
  { role: "contrast", text: "začalo pršať" },
  ".",
]);

const potLine = markedText([
  "Keď sa ",
  { role: "contrast", text: "vrátim" },
  ", ",
  { role: "contrast", text: "zjem" },
  " celý hrniec!",
]);

const practiceId = (id: string) => aspectPracticeItemId(aspectItem(id));

/** Graded exercises in beat order: 3 · 3 · 3 · 3 · 2. */
export const aspectGradedExercises: LessonExercise[] = [
  aspectChoiceExercise(aspectItem("cv-co-robi-pije"), "aspect-peter-drinking-coffee"),
  {
    id: "aspect-cooking-odd-one-out",
    type: "choice",
    practiceItemId: practiceId("cv-prave-varim"),
    choiceMode: "pickTrap",
    prompt: "Which sentence does not mean “I'm cooking soup”?",
    choices: [
      {
        id: "plain",
        label: "Varím polievku.",
        fits: true,
        whyWrong: "**Varím polievku** fits: **varím** is imperfective, going on now.",
      },
      {
        id: "prave",
        label: "Práve varím polievku.",
        fits: true,
        whyWrong: "**Práve varím polievku** fits: **práve** just adds *right now*.",
      },
      {
        id: "perfective",
        label: "Uvarím polievku.",
        whyWrong: "**Uvarím polievku** means “I will cook the soup”: one result, later.",
      },
    ],
    answerId: "perfective",
    feedback: {
      correction: "Uvarím polievku.",
      english: "I will cook the soup.",
      why: "**Uvarím** is perfective, so it cannot mean *now*: it is the soup done, later. Cooking right now is **varím**.",
    },
  },
  aspectChoiceExercise(aspectItem("cv-konecne-opravili"), "aspect-washing-machine"),

  {
    id: "aspect-call-peter",
    type: "build",
    practiceItemId: practiceId("cv-ked-pridem"),
    prompt: "Tomorrow I'll call Peter.",
    tiles: ["Petrovi.", "budem", "zavolám", "Zajtra", "zavolať"],
    answer: ["Zajtra", "zavolám", "Petrovi."],
    mistakes: [
      {
        wrong: "budem",
        whyWrong:
          "**Budem** never goes with a perfective verb. **Zavolám** already means “I will call”.",
      },
      {
        wrong: "zavolať",
        whyWrong: "**Zavolať** is the infinitive. The future of one call is **zavolám**.",
      },
    ],
    feedback: {
      correction: "Zajtra zavolám Petrovi.",
      english: "Tomorrow I'll call Peter.",
      why: "One call, later: the perfective present **zavolám** is the future. No **budem**.",
    },
  },
  aspectChoiceExercise(aspectItem("cv-budem-upratovat"), "aspect-cleaning-all-day"),
  aspectChoiceExercise(aspectItem("cv-ked-pridem"), "aspect-when-i-get-home"),

  {
    id: "aspect-which-perfective",
    type: "selectAll",
    practiceItemId: practiceId("cv-taska-pomoct"),
    prompt: "Which verbs are perfective?",
    choices: [
      { id: "zjest", label: "zjesť", correct: true },
      {
        id: "kupovat",
        label: "kupovať",
        correct: false,
        whyWrong: "**Kupovať** is imperfective. Its perfective partner is **kúpiť**.",
      },
      { id: "vziat", label: "vziať", correct: true },
      {
        id: "brat",
        label: "brať",
        correct: false,
        whyWrong: "**Brať** is imperfective. Its perfective partner is **vziať**.",
      },
      { id: "kupit", label: "kúpiť", correct: true },
    ],
    feedback: {
      correction: "zjesť, vziať, kúpiť",
      english: "to eat up, to take, to buy",
      why: "A prefix (**zjesť**), a shorter suffix (**kúpiť**) or a different verb (**vziať**) makes the perfective.",
    },
  },
  {
    id: "aspect-bought-phone",
    type: "choice",
    practiceItemId: practiceId("cv-za-vikend-precital"),
    prompt: "Yesterday I bought a new phone.",
    choices: [
      { id: "perfective", label: "Včera som kúpil nový telefón." },
      {
        id: "imperfective",
        label: "Včera som kupoval nový telefón.",
        whyWrong:
          "**Kupoval som** is the process: I was buying, or shopping for, one. It does not say I got it.",
      },
    ],
    answerId: "perfective",
    feedback: {
      correction: "Včera som kúpil nový telefón.",
      english: "Yesterday I bought a new phone.",
      why: "One purchase, done: perfective **kúpiť**, from the pair **kupovať / kúpiť**.",
    },
  },
  aspectChoiceExercise(aspectItem("cv-taska-pomoct"), "aspect-heavy-bag"),

  aspectChoiceExercise(aspectItem("cv-zacal-sa-ucit"), "aspect-started-learning"),
  aspectChoiceExercise(aspectItem("cv-prestal-jest"), "aspect-stopped-eating-meat"),
  {
    id: "aspect-started-cleaning-repair",
    type: "typed",
    task: "repair",
    practiceItemId: practiceId("cv-zacali-tancovat"),
    context: [
      {
        id: "aspect-broken-zacali-upratat",
        speaker: "Sentence",
        slovak: "Začali sme upratať byt.",
        english: "We started cleaning the flat.",
      },
    ],
    prompt: "Repair this sentence.",
    inputLabel: "Correct Slovak sentence",
    answer: "Začali sme upratovať byt.",
    mistakes: [
      {
        wrong: "upratať",
        whyWrong:
          "**Upratať** is perfective. After **začať**, use the imperfective: **upratovať**.",
      },
    ],
    feedback: {
      correction: "Začali sme upratovať byt.",
      english: "We started cleaning the flat.",
      why: "**Začať** is followed by an imperfective infinitive: **začali sme upratovať**.",
    },
  },

  {
    id: "aspect-budem-repair",
    type: "typed",
    task: "repair",
    practiceItemId: practiceId("cv-budem-upratovat"),
    context: [
      {
        id: "aspect-broken-budem-napisat",
        speaker: "Sentence",
        slovak: "Zajtra budem napísať e-mail.",
        english: "Tomorrow I'll write the email.",
      },
    ],
    prompt: "Repair this sentence.",
    inputLabel: "Correct Slovak sentence",
    answer: "Zajtra napíšem e-mail.",
    acceptedAnswers: ["Zajtra budem písať e-mail."],
    mistakes: [
      {
        wrong: "budem napísať",
        whyWrong: "**Budem** never goes with a perfective verb like **napísať**.",
      },
    ],
    feedback: {
      correction: "Zajtra napíšem e-mail.",
      english: "Tomorrow I'll write the email.",
      why: "**Napíšem** already means “I will write”, so drop **budem**. **Budem písať** works too, but it says how you will spend the time, not that the email gets done.",
    },
  },
  {
    id: "aspect-finished-book",
    type: "choice",
    practiceItemId: practiceId("cv-za-vikend-precital"),
    prompt: "Have you finished that book?",
    choices: [
      {
        id: "imperfective",
        label: "Čítal si tú knihu?",
        whyWrong: "**Čítal si** asks whether you read it at all, even a page.",
      },
      { id: "perfective", label: "Prečítal si tú knihu?" },
    ],
    answerId: "perfective",
    feedback: {
      correction: "Prečítal si tú knihu?",
      english: "Have you finished that book?",
      why: "To the end, all of it: perfective **prečítať**.",
    },
  },
];

export const aspectPersonalExercise: LessonExercise = {
  id: "aspect-personal",
  type: "personal",
  prompt:
    "Say what you are doing right now, what you do every week, and one thing you will get done tomorrow.",
  example: "Teraz čítam. Každý týždeň varím polievku. Zajtra napíšem e-mail.",
};

export const aspectLesson: Lesson = {
  id: aspectLessonId,
  track: "grammar",
  slug: "aspect",
  title: "Aspect: imperfective and perfective",
  promise:
    "Choose the imperfective for a process or a habit and the perfective for one finished result, now, in the past and in the future.",
  scene: [
    {
      id: aspectLineIds.annaWhatAreYouDoing,
      speaker: "Anna",
      slovak: "Ahoj! Čo robíš?",
      english: "Hi! What are you doing?",
      audio: { transcript: "Ahoj! Čo robíš?" },
    },
    {
      id: aspectLineIds.youCookingSoup,
      speaker: "You",
      slovak: cookingLine.text,
      marks: cookingLine.marks,
      english: "I'm cooking soup.",
      audio: { transcript: cookingLine.text },
      sayChoices: {
        answerId: "imperfective",
        choices: [
          { id: "imperfective", label: "Varím polievku." },
          {
            id: "perfective",
            label: "Uvarím polievku.",
            whyWrong:
              "**Uvarím** is perfective, so it means “I will cook it”. Cooking right now is **varím**.",
          },
        ],
      },
    },
    {
      id: aspectLineIds.annaSoupEverySunday,
      speaker: "Anna",
      slovak: sundayLine.text,
      marks: sundayLine.marks,
      english: "You cook soup every Sunday!",
      audio: { transcript: sundayLine.text },
    },
    {
      id: aspectLineIds.annaWhenWillWeEat,
      speaker: "Anna",
      slovak: eatLine.text,
      marks: eatLine.marks,
      english: "I'm hungry. When are we eating?",
      audio: { transcript: eatLine.text },
    },
    {
      id: aspectLineIds.youSoupInHalfAnHour,
      speaker: "You",
      slovak: halfHourLine.text,
      marks: halfHourLine.marks,
      english: "I'll have the soup cooked in half an hour.",
      audio: { transcript: halfHourLine.text },
      sayChoices: {
        answerId: "perfective",
        choices: [
          { id: "perfective", label: "Polievku uvarím za pol hodiny." },
          {
            id: "budem",
            label: "Polievku budem uvariť za pol hodiny.",
            whyWrong:
              "**Budem** never goes with a perfective verb. **Uvarím** already means the future.",
          },
        ],
      },
    },
    {
      id: aspectLineIds.annaBreadAndUmbrella,
      speaker: "Anna",
      slovak: breadLine.text,
      marks: breadLine.marks,
      english: "Great. Meanwhile I'll buy some bread. I'll take your umbrella, OK?",
      audio: { transcript: breadLine.text },
    },
    {
      id: aspectLineIds.youStartedRaining,
      speaker: "You",
      slovak: rainLine.text,
      marks: rainLine.marks,
      english: "Sure. It's started raining outside.",
      audio: { transcript: rainLine.text },
      sayChoices: {
        answerId: "imperfective",
        choices: [
          { id: "imperfective", label: "Jasné. Vonku začalo pršať." },
          {
            id: "perfective",
            label: "Jasné. Vonku začalo zapršať.",
            whyWrong:
              "**Zapršať** is perfective. After **začať**, the imperfective: **začalo pršať**.",
          },
        ],
      },
    },
    {
      id: aspectLineIds.annaWholePot,
      speaker: "Anna",
      slovak: potLine.text,
      marks: potLine.marks,
      english: "When I get back, I'll eat the whole pot!",
      audio: { transcript: potLine.text },
    },
  ],
  keyPhrases: aspectBeatShells.flatMap((beat) => beat.teach.phrases ?? []),
  pattern: {
    title: "Process or result",
    body: "Most verbs come in pairs. The **imperfective** is a process, a habit, or how long something went on: *varím*, *každú nedeľu varím*, *celý deň som varil*. The **perfective** is one finished result: *uvaril som polievku*. Its present form means the future: *uvarím*, I will cook, with no **budem**. After **začať** and **prestať**, the imperfective: *Začalo pršať.*",
  },
  beats: withAspectExercises(
    aspectBeatShells,
    aspectGradedExercises,
    aspectPersonalExercise,
  ),
  referenceLinks: [
    { href: "/grammar/aspect", label: "Aspect" },
    { href: "/grammar/future-tense", label: "Future tense" },
    { href: "/grammar/past-tense", label: "Past tense" },
    { href: "/grammar/motion-verbs", label: "Motion verbs" },
  ],
};
