import { markedText } from "$lib/learning/marked-text";
import type { Lesson, LessonExercise } from "$lib/learning/types";
import {
  possessivesBeatShells,
  withPossessivesExercises,
} from "$lib/catalog/lessons/beats";
import { possessivesLessonId } from "./session";

const brotherLine = markedText([
  "Toto je ",
  { role: "possessive", text: "môj" },
  " brat Tom.",
]);

const letterLine = markedText([
  { role: "owner", text: "Tom" },
  " píše list ",
  { role: "possessive", text: "svojmu" },
  " najlepšiemu priateľovi.",
]);

const whereLine = markedText([
  "Kde býva ",
  { role: "possessive", text: "jeho" },
  " priateľ?",
]);

const momLine = markedText([
  "Nikomu. Ale každý týždeň volám ",
  { role: "possessive", text: "svojej" },
  " mame.",
]);

const keysLine = markedText([
  "Mimochodom, čie sú tie kľúče? ",
  { role: "possessive", text: "Tvoje" },
  "?",
]);

const mineLine = markedText([
  "Áno, ",
  { role: "possessive", text: "moje" },
  "! Ďakujem.",
]);

/** Graded exercises in beat order: 3 · 3 · 3 · 3 · 2 · 2. */
export const possessivesGradedExercises: LessonExercise[] = [
  {
    id: "possessive-agreement",
    type: "choice",
    practiceItemId: "grammar/possessive-agreement",
    prompt: "This is my sister.",
    choices: [
      { id: "feminine", label: "To je moja sestra." },
      {
        id: "masculine",
        label: "To je môj sestra.",
        whyWrong: "**Môj** goes with masculine nouns like **brat**.",
      },
      {
        id: "neuter",
        label: "To je moje sestra.",
        whyWrong: "**Moje** goes with neuter nouns like **auto**.",
      },
    ],
    answerId: "feminine",
    feedback: {
      correction: "To je moja sestra.",
      english: "This is my sister.",
      why: "The possessive takes the gender of the thing owned. **Sestra** is feminine: **moja sestra**.",
    },
  },
  {
    id: "possessive-formal",
    type: "build",
    practiceItemId: "grammar/possessive-formal",
    prompt: "Is this your suitcase? (formal)",
    tiles: ["kufor?", "váš", "to", "tvoj", "Je", "vaša"],
    answer: ["Je", "to", "váš", "kufor?"],
    feedback: {
      correction: "Je to váš kufor?",
      english: "Is this your suitcase?",
      why: "**Váš** is formal or plural you. **Kufor** is masculine: **váš kufor**.",
    },
  },
  {
    id: "possessive-plural",
    type: "choice",
    practiceItemId: "grammar/possessive-plural",
    prompt: "These are my friends.",
    choices: [
      { id: "people", label: "To sú moji priatelia." },
      {
        id: "things",
        label: "To sú moje priatelia.",
        whyWrong: "**Moje** is for every other plural: **moje sestry**, **moje kľúče**.",
      },
      {
        id: "singular",
        label: "To sú môj priatelia.",
        whyWrong: "**Môj** is singular — for one thing or person.",
      },
    ],
    answerId: "people",
    feedback: {
      correction: "To sú moji priatelia.",
      english: "These are my friends.",
      why: "Masculine nouns for people take **-i** in the plural: **moji priatelia**.",
    },
  },
  {
    id: "possessive-svoj-letter",
    type: "choice",
    practiceItemId: "grammar/possessive-svoj-choice",
    prompt: "Tom is writing a letter to his own best friend.",
    choices: [
      { id: "own", label: "Tom píše list svojmu najlepšiemu priateľovi." },
      {
        id: "his",
        label: "Tom píše list jeho najlepšiemu priateľovi.",
        whyWrong: "**Jeho** would make it another man's best friend.",
      },
      {
        id: "nominative",
        label: "Tom píše list svoj najlepší priateľ.",
        whyWrong:
          "**Svoj najlepší priateľ** is the dictionary form — **písať list** + to whom needs the dative.",
      },
    ],
    answerId: "own",
    feedback: {
      correction: "Tom píše list svojmu najlepšiemu priateľovi.",
      english: "Tom is writing a letter to his own best friend.",
      why: "When the owner is the subject, use **svoj** in the noun's case: **svojmu najlepšiemu priateľovi**.",
    },
  },
  {
    id: "possessive-svoj-repair",
    type: "typed",
    task: "repair",
    practiceItemId: "grammar/possessive-svoj-repair",
    context: [
      {
        id: "lesson-svoj-broken",
        speaker: "Sentence",
        slovak: "Anna hľadá jej kľúče.",
        english: "Anna is looking for her own keys.",
      },
    ],
    prompt: "Repair this sentence.",
    inputLabel: "Correct Slovak sentence",
    answer: "Anna hľadá svoje kľúče.",
    acceptedAnswers: ["Anna hľadá kľúče."],
    feedback: {
      correction: "Anna hľadá svoje kľúče.",
      english: "Anna is looking for her own keys.",
      why: "**Jej kľúče** would be another woman's keys. Anna is the subject, so use **svoje**: **svoje kľúče**.",
    },
  },
  {
    id: "possessive-svoj-odd-one-out",
    type: "choice",
    practiceItemId: "grammar/possessive-svoj-odd-one-out",
    choiceMode: "pickTrap",
    prompt: "Which sentence does not mean “Tom is calling his own mother”?",
    choices: [
      {
        id: "own",
        label: "Tom volá svojej mame.",
        fits: true,
        whyWrong: "**Tom volá svojej mame** fits — **svoj** points back to Tom.",
      },
      {
        id: "bare",
        label: "Tom volá mame.",
        fits: true,
        whyWrong:
          "**Tom volá mame** fits — Slovak often drops the possessive when the owner is obvious.",
      },
      {
        id: "his",
        label: "Tom volá jeho mame.",
        whyWrong: "**Jeho mame** would be another man's mother.",
      },
    ],
    answerId: "his",
    feedback: {
      correction: "Tom volá jeho mame.",
      english: "Tom is calling his own mother.",
      why: "With Tom as the subject, **jeho** means another man's mother. Tom's own takes **svoj**: **svojej mame**.",
    },
  },
  {
    id: "possessive-her-brother",
    type: "choice",
    practiceItemId: "grammar/possessive-third-person",
    prompt: "Her brother is a teacher.",
    choices: [
      { id: "her", label: "Jej brat je učiteľ." },
      {
        id: "his",
        label: "Jeho brat je učiteľ.",
        whyWrong: "**Jeho** means “his”.",
      },
      {
        id: "own",
        label: "Svoj brat je učiteľ.",
        whyWrong: "**Svoj** never sits in the subject — it points back to one.",
      },
    ],
    answerId: "her",
    feedback: {
      correction: "Jej brat je učiteľ.",
      english: "Her brother is a teacher.",
      why: "**Jej** means her and never changes: **jej brat**, **jej bratovi**, **s jej bratom**.",
    },
  },
  {
    id: "possessive-jeho-preposition",
    type: "choice",
    practiceItemId: "grammar/possessive-jeho-preposition",
    prompt: "Anna is going to the cinema with his brother.",
    choices: [
      { id: "his", label: "Anna ide do kina s jeho bratom." },
      {
        id: "pronoun",
        label: "Anna ide do kina s ním bratom.",
        whyWrong:
          "**S ním** means *with him* on its own — it cannot stand before a noun.",
      },
      {
        id: "own",
        label: "Anna ide do kina so svojím bratom.",
        whyWrong: "**So svojím bratom** would mean Anna's own brother.",
      },
    ],
    answerId: "his",
    feedback: {
      correction: "Anna ide do kina s jeho bratom.",
      english: "Anna is going to the cinema with his brother.",
      why: "After a preposition, **jeho** stays **jeho**: **s jeho bratom**.",
    },
  },
  {
    id: "possessive-their-car",
    type: "typed",
    task: "complete",
    practiceItemId: "grammar/possessive-typed",
    prompt: "Their car is red.",
    inputLabel: "Your Slovak answer",
    answer: "Ich auto je červené.",
    feedback: {
      correction: "Ich auto je červené.",
      english: "Their car is red.",
      why: "**Ich** never changes. The adjective still agrees with **auto**: **červené**.",
    },
  },
  {
    id: "possessive-dative",
    type: "choice",
    practiceItemId: "grammar/possessive-case-choice",
    prompt: "Anna is writing a letter to my brother.",
    choices: [
      { id: "dative", label: "Anna píše list môjmu bratovi." },
      {
        id: "genitive",
        label: "Anna píše list môjho bratovi.",
        whyWrong: "**Môjho** is genitive or accusative.",
      },
      {
        id: "nominative",
        label: "Anna píše list môj brat.",
        whyWrong: "**Môj brat** is the dictionary form.",
      },
    ],
    answerId: "dative",
    feedback: {
      correction: "Anna píše list môjmu bratovi.",
      english: "Anna is writing a letter to my brother.",
      why: "**Písať list** + to whom takes the dative, and the possessive follows its noun: **môjmu bratovi**.",
    },
  },
  {
    id: "possessive-instrumental",
    type: "typed",
    task: "complete",
    practiceItemId: "grammar/possessive-case-cloze",
    prompt: "I'm going to the cinema with my sister.",
    inputLabel: "Your Slovak answer",
    answer: "Idem do kina so svojou sestrou.",
    acceptedAnswers: ["Idem do kina s mojou sestrou."],
    feedback: {
      correction: "Idem do kina so svojou sestrou.",
      english: "I'm going to the cinema with my sister.",
      why: "**S** + instrumental: **sestrou**, and the possessive matches — **svojou** or **mojou**. With I as the owner, both work. Note **so** before **svojou**.",
    },
  },
  {
    id: "possessive-genitive",
    type: "build",
    practiceItemId: "grammar/possessive-genitive-build",
    prompt: "This is my brother's car.",
    tiles: ["auto", "brata.", "To", "môjho", "je", "môj", "brat."],
    answer: ["To", "je", "auto", "môjho", "brata."],
    feedback: {
      correction: "To je auto môjho brata.",
      english: "This is my brother's car.",
      why: "The owner comes after the thing, in the genitive — possessive included: **auto môjho brata**.",
    },
  },
  {
    id: "possessive-whose",
    type: "choice",
    practiceItemId: "grammar/possessive-whose",
    prompt: "Whose bag is this?",
    choices: [
      { id: "feminine", label: "Čia je to taška?" },
      {
        id: "masculine",
        label: "Čí je to taška?",
        whyWrong: "**Čí** goes with masculine nouns.",
      },
      {
        id: "neuter",
        label: "Čie je to taška?",
        whyWrong: "**Čie** goes with neuter or plural nouns.",
      },
    ],
    answerId: "feminine",
    feedback: {
      correction: "Čia je to taška?",
      english: "Whose bag is this?",
      why: "**Čí** agrees with the thing, like **môj**: **Čia je to taška**.",
    },
  },
  {
    id: "possessive-peters-car",
    type: "choice",
    practiceItemId: "grammar/possessive-name-adjective",
    prompt: "This is Peter's car.",
    choices: [
      { id: "neuter", label: "To je Petrovo auto." },
      {
        id: "masculine",
        label: "To je Petrov auto.",
        whyWrong: "**Petrov** goes with masculine nouns.",
      },
      {
        id: "feminine",
        label: "To je Petrova auto.",
        whyWrong: "**Petrova** goes with feminine nouns.",
      },
    ],
    answerId: "neuter",
    feedback: {
      correction: "To je Petrovo auto.",
      english: "This is Peter's car.",
      why: "One named owner becomes an adjective that agrees with the thing: **Petrovo auto**.",
    },
  },
  {
    id: "possessive-dative-plural",
    type: "choice",
    practiceItemId: "grammar/possessive-ins-dat",
    prompt: "Anna is writing a letter to our parents.",
    choices: [
      { id: "dative-plural", label: "Anna píše list našim rodičom." },
      {
        id: "instrumental",
        label: "Anna píše list naším rodičom.",
        whyWrong:
          "**Naším** with a long **í** is instrumental singular: **s naším bratom**.",
      },
      {
        id: "genitive",
        label: "Anna píše list našich rodičom.",
        whyWrong: "**Našich** is genitive or locative.",
      },
    ],
    answerId: "dative-plural",
    feedback: {
      correction: "Anna píše list našim rodičom.",
      english: "Anna is writing a letter to our parents.",
      why: "Dative plural has a short **-im**: **našim rodičom**.",
    },
  },
  {
    id: "possessive-broke-arm",
    type: "choice",
    practiceItemId: "grammar/possessive-body-si",
    prompt: "He broke his arm.",
    choices: [
      { id: "si", label: "Zlomil si ruku." },
      {
        id: "his",
        label: "Zlomil jeho ruku.",
        whyWrong: "**Jeho ruku** is another man's arm — he'd have broken someone else's!",
      },
      {
        id: "own",
        label: "Zlomil svoju ruku.",
        whyWrong: "Slovak does not add **svoju** to a body part.",
      },
    ],
    answerId: "si",
    feedback: {
      correction: "Zlomil si ruku.",
      english: "He broke his arm.",
      why: "**Si** says he broke his own arm: **Zlomil si ruku**.",
    },
  },
];

export const possessivesPersonalExercise: LessonExercise = {
  id: "possessive-personal",
  type: "personal",
  prompt:
    "Introduce someone in your family, say who they call or write to, and name one thing that is yours.",
  example: "Toto je moja sestra. Volá svojej kamarátke. Toto je môj telefón.",
};

export const possessivesLesson: Lesson = {
  id: possessivesLessonId,
  track: "grammar",
  slug: "possessives",
  title: "Possessives: môj, jeho, svoj",
  promise:
    "Say whose something is — and make môj, jeho, and svoj fit the noun and its case.",
  scene: [
    {
      id: "anna-brother",
      speaker: "Anna",
      slovak: brotherLine.text,
      marks: brotherLine.marks,
      english: "This is my brother Tom.",
      audio: { transcript: brotherLine.text },
    },
    {
      id: "anna-letter",
      speaker: "Anna",
      slovak: letterLine.text,
      marks: letterLine.marks,
      english: "Tom is writing a letter to his best friend.",
      audio: { transcript: letterLine.text },
    },
    {
      id: "you-where",
      speaker: "You",
      slovak: whereLine.text,
      marks: whereLine.marks,
      english: "Where does his friend live?",
      audio: { transcript: whereLine.text },
      sayChoices: {
        answerId: "his",
        choices: [
          { id: "his", label: "Kde býva jeho priateľ?" },
          {
            id: "own",
            label: "Kde býva svoj priateľ?",
            whyWrong:
              "**Svoj** never sits in the subject. Tom's friend is the subject here, so use **jeho**.",
          },
          {
            id: "her",
            label: "Kde býva jej priateľ?",
            whyWrong: "**Jej** means her. Tom is a he: **jeho priateľ**.",
          },
        ],
      },
    },
    {
      id: "anna-canada",
      speaker: "Anna",
      slovak: "V Kanade. Píšu si listy už desať rokov.",
      english: "In Canada. They've been writing to each other for ten years.",
      audio: { transcript: "V Kanade. Píšu si listy už desať rokov." },
    },
    {
      id: "anna-you",
      speaker: "Anna",
      slovak: "A ty? Komu píšeš?",
      english: "And you? Who do you write to?",
      audio: { transcript: "A ty? Komu píšeš?" },
    },
    {
      id: "you-mom",
      speaker: "You",
      slovak: momLine.text,
      marks: momLine.marks,
      english: "No one. But I call my mom every week.",
      audio: { transcript: momLine.text },
      sayChoices: {
        answerId: "own",
        answerIds: ["own", "mine"],
        choices: [
          { id: "own", label: "Nikomu. Ale každý týždeň volám svojej mame." },
          { id: "mine", label: "Nikomu. Ale každý týždeň volám mojej mame." },
          {
            id: "her",
            label: "Nikomu. Ale každý týždeň volám jej mame.",
            whyWrong:
              "**Jej mame** is her mom — someone else's. For your own, use **svojej** or **mojej**.",
          },
          {
            id: "masculine",
            label: "Nikomu. Ale každý týždeň volám svojmu mame.",
            whyWrong: "**Svojmu** is masculine. **Mama** is feminine: **svojej mame**.",
          },
        ],
      },
    },
    {
      id: "anna-keys",
      speaker: "Anna",
      slovak: keysLine.text,
      marks: keysLine.marks,
      english: "By the way, whose keys are those? Yours?",
      audio: { transcript: keysLine.text },
    },
    {
      id: "you-mine",
      speaker: "You",
      slovak: mineLine.text,
      marks: mineLine.marks,
      english: "Yes, mine! Thanks.",
      audio: { transcript: mineLine.text },
      sayChoices: {
        answerId: "mine",
        choices: [
          { id: "mine", label: "Áno, moje! Ďakujem." },
          {
            id: "singular",
            label: "Áno, môj! Ďakujem.",
            whyWrong:
              "**Kľúče** is plural, so “mine” is **moje**. **Môj** is for one masculine thing.",
          },
          {
            id: "yours",
            label: "Áno, tvoje! Ďakujem.",
            whyWrong: "**Tvoje** means yours — Anna's. Say **moje** for mine.",
          },
        ],
      },
    },
  ],
  keyPhrases: [
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
    {
      slovak: "moji priatelia",
      english: "my friends",
      note: "Masculine nouns for people take -i. Every other plural takes -e: moje sestry, moje kľúče.",
      audio: { transcript: "moji priatelia" },
    },
    {
      slovak: "Je to váš kufor?",
      english: "Is this your suitcase? (formal)",
      note: "Váš for vy, tvoj for ty.",
      audio: { transcript: "Je to váš kufor?" },
    },
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
  pattern: {
    title: "Whose is it?",
    body: "**Môj, tvoj, náš, váš** agree with the thing owned: *môj brat, moja sestra, moje auto*. **Jeho, jej, ich** never change. When the owner is the subject, use **svoj**: *Tom píše list svojmu najlepšiemu priateľovi.* Possessives take their noun's case: *môjmu bratovi, s mojou sestrou*.",
  },
  beats: withPossessivesExercises(
    possessivesBeatShells,
    possessivesGradedExercises,
    possessivesPersonalExercise,
  ),
  referenceLinks: [
    { href: "/grammar/grammatical-gender", label: "Grammatical gender" },
    { href: "/grammar/cases-overview", label: "Cases overview" },
    { href: "/grammar/cases/dative", label: "Dative" },
    { href: "/grammar/ty-vs-vy", label: "ty and vy" },
  ],
};
