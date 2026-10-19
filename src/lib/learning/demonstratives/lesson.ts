import { markedText } from "$lib/learning/marked-text";
import type { Lesson, LessonExercise } from "$lib/learning/types";
import {
  demonstrativesBeatShells,
  withDemonstrativesExercises,
  demonstrativesLineIds,
} from "$lib/catalog/lessons/beats";
import { demonstrativesLessonId } from "./session";

const photosLine = markedText([
  "Pozri, ",
  { role: "demonstrative", text: "to" },
  " sú fotky z leta.",
]);

const manLine = markedText(["Kto je ", { role: "demonstrative", text: "ten" }, " muž?"]);

const brotherLine = markedText([
  { role: "demonstrative", text: "To" },
  " je môj brat Tom.",
]);

const womanLine = markedText([
  "A kto je ",
  { role: "demonstrative", text: "tá" },
  " žena?",
]);

const wifeLine = markedText([
  { role: "demonstrative", text: "To" },
  " je jeho žena Eva. A ",
  { role: "demonstrative", text: "tie" },
  " deti sú ich.",
]);

const menLine = markedText([
  "A kto sú ",
  { role: "demonstrative", text: "tí" },
  " muži vzadu?",
]);

const colleaguesLine = markedText([
  { role: "demonstrative", text: "To" },
  " sú jeho kolegovia z práce.",
]);

const knowLine = markedText([
  "A ",
  { role: "demonstrative", text: "toho" },
  " muža poznám! Je to Marek?",
]);

const marekLine = markedText([
  "Áno, to je Marek. Býva v ",
  { role: "demonstrative", text: "tom" },
  " dome vedľa nás.",
]);

const helpsLine = markedText([
  { role: "demonstrative", text: "Ten" },
  " muž nám často pomáha.",
]);

const cinemaLine = markedText([
  "Dnes večer ide s ",
  { role: "demonstrative", text: "tými" },
  " kolegami do kina.",
]);

const priceLine = markedText([
  "Koľko stojí ",
  { role: "demonstrative", text: "tento" },
  " koláč?",
]);

const cakeLine = markedText([
  "Dobre, dám si ",
  { role: "demonstrative", text: "tento" },
  " koláč.",
]);

const tortaLine = markedText([
  "A ja si dám ",
  { role: "demonstrative", text: "tamtú" },
  " tortu.",
]);

/** Graded exercises in beat order: 3 · 2 · 3 · 3 · 3 · 2. */
export const demonstrativesGradedExercises: LessonExercise[] = [
  {
    id: "demonstrative-where-bag",
    type: "choice",
    practiceItemId: "grammar/demonstrative-agreement",
    prompt: "Where is that bag?",
    choices: [
      { id: "feminine", label: "Kde je tá taška?" },
      {
        id: "masculine",
        label: "Kde je ten taška?",
        whyWrong: "**Ten** goes with masculine nouns like **muž** or **dom**.",
      },
      {
        id: "neuter",
        label: "Kde je to taška?",
        whyWrong: "**To** goes with neuter nouns like **auto** or **dievča**.",
      },
    ],
    answerId: "feminine",
    feedback: {
      correction: "Kde je tá taška?",
      english: "Where is that bag?",
      why: "**Taška** is feminine, so: **tá taška**.",
    },
  },
  {
    id: "demonstrative-girl",
    type: "choice",
    practiceItemId: "grammar/demonstrative-agreement",
    prompt: "Who is that girl?",
    choices: [
      { id: "neuter", label: "Kto je to dievča?" },
      {
        id: "feminine",
        label: "Kto je tá dievča?",
        whyWrong:
          "**Tá** goes with feminine nouns. **Dievča** means a girl, but the noun is neuter.",
      },
      {
        id: "masculine",
        label: "Kto je ten dievča?",
        whyWrong: "**Ten** goes with masculine nouns like **muž** or **dom**.",
      },
    ],
    answerId: "neuter",
    feedback: {
      correction: "Kto je to dievča?",
      english: "Who is that girl?",
      why: "**Dievča** means a girl, but the noun is neuter: **to dievča**.",
    },
  },
  {
    id: "demonstrative-where-car",
    type: "typed",
    task: "complete",
    practiceItemId: "grammar/demonstrative-agreement",
    prompt: "Where is that car?",
    inputLabel: "Your Slovak answer",
    answer: "Kde je to auto?",
    acceptedAnswers: ["Kde je tamto auto?"],
    mistakes: [
      {
        wrong: "ten",
        whyWrong: "**Ten** goes with masculine nouns. **Auto** is neuter: **to auto**.",
      },
      {
        wrong: "tá",
        whyWrong: "**Tá** goes with feminine nouns. **Auto** is neuter: **to auto**.",
      },
    ],
    feedback: {
      correction: "Kde je to auto?",
      english: "Where is that car?",
      why: "**Auto** is neuter, so: **to auto**.",
    },
  },
  {
    id: "demonstrative-sister",
    type: "choice",
    practiceItemId: "grammar/demonstrative-to-je",
    prompt: "This is my sister.",
    choices: [
      { id: "to", label: "To je moja sestra." },
      {
        id: "ta",
        label: "Tá je moja sestra.",
        whyWrong:
          "**Tá** on its own singles out one woman from a group (“that one is my sister”). To say who someone is, use **to**.",
      },
      {
        id: "plural",
        label: "To sú moja sestra.",
        whyWrong: "**Sú** is plural. One sister takes **je**.",
      },
    ],
    answerId: "to",
    feedback: {
      correction: "To je moja sestra.",
      english: "This is my sister.",
      why: "On its own, **to** never changes, whoever it points at: **To je moja sestra**.",
    },
  },
  {
    id: "demonstrative-parents-odd-one-out",
    type: "choice",
    practiceItemId: "grammar/demonstrative-to-je",
    choiceMode: "pickTrap",
    prompt: "Which sentence does not mean “These are my parents”?",
    choices: [
      {
        id: "to",
        label: "To sú moji rodičia.",
        fits: true,
        whyWrong:
          "**To sú moji rodičia** fits — **to** on its own never changes; only the verb is plural.",
      },
      {
        id: "toto",
        label: "Toto sú moji rodičia.",
        fits: true,
        whyWrong:
          "**Toto sú moji rodičia** fits — **toto** just adds *here*: “These here are my parents.”",
      },
      {
        id: "ti",
        label: "Tí rodičia sú moji.",
        whyWrong:
          "**Tí rodičia sú moji** means “Those parents are mine.” **Tí** comes before a noun, so it means *those* parents.",
      },
    ],
    answerId: "ti",
    feedback: {
      correction: "Tí rodičia sú moji.",
      english: "Those parents are mine.",
      why: "**Tí** before a noun points at those parents: “Those parents are mine.” **To** on its own says who they are: **To sú moji rodičia**.",
    },
  },
  {
    id: "demonstrative-people",
    type: "choice",
    practiceItemId: "grammar/demonstrative-plural",
    prompt: "Who are those people?",
    choices: [
      { id: "personal", label: "Kto sú tí ľudia?" },
      {
        id: "other-plural",
        label: "Kto sú tie ľudia?",
        whyWrong:
          "**Tie** is for every other plural. **Ľudia** is a masculine noun for people: **tí ľudia**.",
      },
      {
        id: "singular",
        label: "Kto je ten ľudia?",
        whyWrong: "**Ten** and **je** are singular. **Ľudia** is plural.",
      },
    ],
    answerId: "personal",
    feedback: {
      correction: "Kto sú tí ľudia?",
      english: "Who are those people?",
      why: "Masculine nouns for people take **tí** in the plural: **tí ľudia**.",
    },
  },
  {
    id: "demonstrative-children",
    type: "choice",
    practiceItemId: "grammar/demonstrative-plural",
    prompt: "Those children are playing outside.",
    choices: [
      { id: "tie", label: "Tie deti sa hrajú vonku." },
      {
        id: "ti",
        label: "Tí deti sa hrajú vonku.",
        whyWrong:
          "**Tí** is only for masculine nouns for people. **Deti** takes **tie**.",
      },
      {
        id: "to",
        label: "To deti sa hrajú vonku.",
        whyWrong: "**To** is singular, as in **to dieťa**. The plural is **tie deti**.",
      },
    ],
    answerId: "tie",
    feedback: {
      correction: "Tie deti sa hrajú vonku.",
      english: "Those children are playing outside.",
      why: "**Deti** are people, but only masculine nouns for people take **tí**: **tie deti**.",
    },
  },
  {
    id: "demonstrative-keys-repair",
    type: "typed",
    task: "repair",
    practiceItemId: "grammar/demonstrative-repair",
    context: [
      {
        id: "demonstratives-broken-ti-kluce",
        speaker: "Sentence",
        slovak: "Tí kľúče sú moje.",
        english: "Those keys are mine.",
      },
    ],
    prompt: "Repair this sentence.",
    inputLabel: "Correct Slovak sentence",
    answer: "Tie kľúče sú moje.",
    mistakes: [
      {
        wrong: "tí",
        whyWrong:
          "**Tí** is only for masculine nouns for people. **Kľúče** takes **tie**.",
      },
    ],
    feedback: {
      correction: "Tie kľúče sú moje.",
      english: "Those keys are mine.",
      why: "**Kľúče** are things, and every plural except masculine nouns for people takes **tie**: **tie kľúče**.",
    },
  },
  {
    id: "demonstrative-help-boy",
    type: "choice",
    practiceItemId: "grammar/demonstrative-case-choice",
    prompt: "Anna is helping that boy.",
    choices: [
      { id: "dative", label: "Anna pomáha tomu chlapcovi." },
      {
        id: "genitive",
        label: "Anna pomáha toho chlapcovi.",
        whyWrong: "**Toho** is the genitive or accusative form.",
      },
      {
        id: "nominative",
        label: "Anna pomáha ten chlapec.",
        whyWrong: "**Ten chlapec** is the subject form. **Pomáhať** takes the dative.",
      },
    ],
    answerId: "dative",
    feedback: {
      correction: "Anna pomáha tomu chlapcovi.",
      english: "Anna is helping that boy.",
      why: "**Pomáhať** (to help) takes the dative, and the demonstrative takes the same case: **tomu chlapcovi**.",
    },
  },
  {
    id: "demonstrative-cinema-woman",
    type: "typed",
    task: "complete",
    practiceItemId: "grammar/demonstrative-case-cloze",
    prompt: "I'm going to the cinema with that woman.",
    inputLabel: "Your Slovak answer",
    answer: "Idem do kina s tou ženou.",
    acceptedAnswers: ["Idem do kina s tamtou ženou."],
    mistakes: [
      {
        wrong: "tú",
        whyWrong:
          "**Tú** is the accusative. **S** (with) takes the instrumental: **tou**.",
      },
      {
        wrong: "tá",
        whyWrong:
          "**Tá** is the subject form. **S** (with) takes the instrumental: **s tou ženou**.",
      },
      {
        wrong: "tej",
        whyWrong:
          "**Tej** is the genitive, dative, or locative. **S** (with) takes the instrumental: **tou**.",
      },
      {
        wrong: "žena",
        whyWrong:
          "**Žena** is the dictionary form. After **s**, the noun takes the instrumental too: **ženou**.",
      },
      {
        wrong: "so tou",
        whyWrong:
          "**So** comes only before s, z, š, or ž. Before **tou** it stays **s**.",
      },
    ],
    feedback: {
      correction: "Idem do kina s tou ženou.",
      english: "I'm going to the cinema with that woman.",
      why: "**S** (with) takes the instrumental, and the demonstrative matches: **s tou ženou**.",
    },
  },
  {
    id: "demonstrative-see-house",
    type: "choice",
    practiceItemId: "grammar/demonstrative-animate-accusative",
    prompt: "Do you see that house?",
    choices: [
      { id: "thing", label: "Vidíš ten dom?" },
      {
        id: "person",
        label: "Vidíš toho dom?",
        whyWrong:
          "**Toho** is for people in the accusative (**toho muža**). **Dom** is a thing, so it keeps **ten**.",
      },
      {
        id: "genitive",
        label: "Vidíš toho domu?",
        whyWrong: "**Toho domu** is the genitive. **Vidieť** takes the accusative.",
      },
    ],
    answerId: "thing",
    feedback: {
      correction: "Vidíš ten dom?",
      english: "Do you see that house?",
      why: "Masculine things keep the basic form in the accusative: **ten dom**.",
    },
  },
  {
    id: "demonstrative-that-cake",
    type: "choice",
    practiceItemId: "grammar/demonstrative-tento-tamten",
    prompt: "I'll have that cake over there.",
    choices: [
      { id: "far", label: "Dám si tamten koláč." },
      {
        id: "near",
        label: "Dám si tento koláč.",
        whyWrong: "**Tento** is this one, near you.",
      },
      {
        id: "feminine",
        label: "Dám si tamtú koláč.",
        whyWrong: "**Tamtú** goes with feminine nouns: **tamtú tortu**.",
      },
    ],
    answerId: "far",
    feedback: {
      correction: "Dám si tamten koláč.",
      english: "I'll have that cake over there.",
      why: "**Tamten** points at the one over there, and it agrees with **koláč**: **tamten koláč**.",
    },
  },
  {
    id: "demonstrative-bag-not-that",
    type: "build",
    practiceItemId: "grammar/demonstrative-this-not-that",
    prompt: "I want this bag, not that one.",
    tiles: ["tašku,", "Chcem", "tamtú.", "táto", "nie", "túto", "tamtá."],
    answer: ["Chcem", "túto", "tašku,", "nie", "tamtú."],
    mistakes: [
      {
        wrong: "táto",
        whyWrong:
          "**Táto** is the subject form. **Chcieť** takes the accusative: **túto tašku**.",
      },
      {
        wrong: "tamtá",
        whyWrong: "**Tamtá** is the subject form. After **chcem**, use **tamtú**.",
      },
    ],
    feedback: {
      correction: "Chcem túto tašku, nie tamtú.",
      english: "I want this bag, not that one.",
      why: "**Tento** points at the one near you, **tamten** at the one over there. **Chcieť** takes the accusative: **túto tašku**, **nie tamtú**.",
    },
  },
  {
    id: "demonstrative-book-price",
    type: "typed",
    task: "complete",
    practiceItemId: "grammar/demonstrative-typed",
    prompt: "How much is this book?",
    inputLabel: "Your Slovak answer",
    answer: "Koľko stojí táto kniha?",
    acceptedAnswers: ["Koľko stojí tá kniha?"],
    mistakes: [
      {
        wrong: "tento",
        whyWrong:
          "**Tento** goes with masculine nouns. **Kniha** is feminine: **táto kniha**.",
      },
      {
        wrong: "toto",
        whyWrong:
          "**Toto** goes with neuter nouns. **Kniha** is feminine: **táto kniha**.",
      },
      { wrong: "stoja", whyWrong: "**Stoja** is plural. One book: **stojí**." },
    ],
    feedback: {
      correction: "Koľko stojí táto kniha?",
      english: "How much is this book?",
      why: "**Kniha** is feminine, so **tento** becomes **táto**: **táto kniha**.",
    },
  },
  {
    id: "demonstrative-cinema-boys",
    type: "choice",
    practiceItemId: "grammar/demonstrative-tym-tymi",
    prompt: "Anna is going to the cinema with those boys.",
    choices: [
      { id: "plural", label: "Anna ide do kina s tými chlapcami." },
      {
        id: "singular",
        label: "Anna ide do kina s tým chlapcami.",
        whyWrong:
          "**Tým** is instrumental singular (**s tým chlapcom**) or dative plural (**tým deťom**).",
      },
      {
        id: "genitive",
        label: "Anna ide do kina s tých chlapcami.",
        whyWrong: "**Tých** is the genitive, accusative, or locative plural.",
      },
    ],
    answerId: "plural",
    feedback: {
      correction: "Anna ide do kina s tými chlapcami.",
      english: "Anna is going to the cinema with those boys.",
      why: "Instrumental plural ends in **-mi**, on the demonstrative too: **s tými chlapcami**.",
    },
  },
  {
    id: "demonstrative-tohto-repair",
    type: "typed",
    task: "repair",
    practiceItemId: "grammar/demonstrative-repair",
    context: [
      {
        id: "demonstratives-broken-tohoto",
        speaker: "Sentence",
        slovak: "Poznáš tohoto muža?",
        english: "Do you know this man?",
      },
    ],
    prompt: "Repair this sentence.",
    inputLabel: "Correct Slovak sentence",
    answer: "Poznáš tohto muža?",
    acceptedAnswers: ["Poznáš toho muža?"],
    mistakes: [
      {
        wrong: "tohoto",
        whyWrong: "**Tohoto** is Czech. Slovak drops the middle **o**: **tohto**.",
      },
    ],
    feedback: {
      correction: "Poznáš tohto muža?",
      english: "Do you know this man?",
      why: "**Tento** adds **-to** to **toho** and drops one **o**: **tohto muža**.",
    },
  },
];

export const demonstrativesPersonalExercise: LessonExercise = {
  id: "demonstrative-personal",
  type: "personal",
  prompt:
    "Point at three things or people around you — one masculine, one feminine, and one plural — and say one sentence about each.",
  example: "Tento stôl je starý. Tá žena je moja kolegyňa. Tieto knihy sú moje.",
};

export const demonstrativesLesson: Lesson = {
  id: demonstrativesLessonId,
  track: "grammar",
  slug: "demonstratives",
  title: "Demonstratives: ten, tento, tamten",
  promise:
    "Point at people and things — and make ten, tento, and tamten fit the noun and its case.",
  scene: [
    {
      id: demonstrativesLineIds.annaSummerPhotos,
      speaker: "Anna",
      slovak: photosLine.text,
      marks: photosLine.marks,
      english: "Look, these are photos from the summer.",
      audio: { transcript: photosLine.text },
    },
    {
      id: demonstrativesLineIds.youWhoIsThatMan,
      speaker: "You",
      slovak: manLine.text,
      marks: manLine.marks,
      english: "Who is that man?",
      audio: { transcript: manLine.text },
      sayChoices: {
        answerId: "masculine",
        choices: [
          { id: "masculine", label: "Kto je ten muž?" },
          {
            id: "feminine",
            label: "Kto je tá muž?",
            whyWrong:
              "**Tá** goes with feminine nouns like **žena**. **Muž** is masculine: **ten muž**.",
          },
          {
            id: "neuter",
            label: "Kto je to muž?",
            whyWrong:
              "Before a noun, **to** is for neuter nouns like **dievča**. **Muž** is masculine: **ten muž**.",
          },
        ],
      },
    },
    {
      id: demonstrativesLineIds.annaMyBrother,
      speaker: "Anna",
      slovak: brotherLine.text,
      marks: brotherLine.marks,
      english: "That's my brother Tom.",
      audio: { transcript: brotherLine.text },
    },
    {
      id: demonstrativesLineIds.youWhoIsThatWoman,
      speaker: "You",
      slovak: womanLine.text,
      marks: womanLine.marks,
      english: "And who is that woman?",
      audio: { transcript: womanLine.text },
      sayChoices: {
        answerId: "feminine",
        choices: [
          { id: "feminine", label: "A kto je tá žena?" },
          {
            id: "masculine",
            label: "A kto je ten žena?",
            whyWrong:
              "**Ten** goes with masculine nouns like **muž**. **Žena** is feminine: **tá žena**.",
          },
          {
            id: "accusative",
            label: "A kto je tú žena?",
            whyWrong:
              "**Tú** is the accusative, as in **Poznám tú ženu**. After **je**, use the basic form: **tá žena**.",
          },
        ],
      },
    },
    {
      id: demonstrativesLineIds.annaHisWifeEva,
      speaker: "Anna",
      slovak: wifeLine.text,
      marks: wifeLine.marks,
      english: "That's his wife Eva. And those children are theirs.",
      audio: { transcript: wifeLine.text },
    },
    {
      id: demonstrativesLineIds.youWhoAreThoseMen,
      speaker: "You",
      slovak: menLine.text,
      marks: menLine.marks,
      english: "And who are those men at the back?",
      audio: { transcript: menLine.text },
      sayChoices: {
        answerId: "personal",
        choices: [
          { id: "personal", label: "A kto sú tí muži vzadu?" },
          {
            id: "other-plural",
            label: "A kto sú tie muži vzadu?",
            whyWrong:
              "**Tie** is for every other plural, like **tie deti**. **Muži** is a masculine noun for people: **tí muži**.",
          },
          {
            id: "singular",
            label: "A kto je ten muži vzadu?",
            whyWrong:
              "**Ten** and **je** are singular. **Muži** is plural: **tí muži**, **sú**.",
          },
        ],
      },
    },
    {
      id: demonstrativesLineIds.annaHisColleagues,
      speaker: "Anna",
      slovak: colleaguesLine.text,
      marks: colleaguesLine.marks,
      english: "Those are his colleagues from work.",
      audio: { transcript: colleaguesLine.text },
    },
    {
      id: demonstrativesLineIds.youKnowThatMan,
      speaker: "You",
      slovak: knowLine.text,
      marks: knowLine.marks,
      english: "And I know that man! Is that Marek?",
      audio: { transcript: knowLine.text },
      sayChoices: {
        answerId: "accusative",
        choices: [
          { id: "accusative", label: "A toho muža poznám! Je to Marek?" },
          {
            id: "nominative",
            label: "A ten muž poznám! Je to Marek?",
            whyWrong:
              "**Ten muž** is the subject form. **Poznať** takes the accusative, and masculine nouns for people change: **toho muža**.",
          },
          {
            id: "half",
            label: "A ten muža poznám! Je to Marek?",
            whyWrong:
              "**Muža** is accusative, so **ten** has to change with it: **toho muža**.",
          },
        ],
      },
    },
    {
      id: demonstrativesLineIds.annaThatsMarek,
      speaker: "Anna",
      slovak: marekLine.text,
      marks: marekLine.marks,
      english: "Yes, that's Marek. He lives in that house next to us.",
      audio: { transcript: marekLine.text },
    },
    {
      id: demonstrativesLineIds.annaManHelpsUs,
      speaker: "Anna",
      slovak: helpsLine.text,
      marks: helpsLine.marks,
      english: "That man often helps us.",
      audio: { transcript: helpsLine.text },
    },
    {
      id: demonstrativesLineIds.annaCinemaWithColleagues,
      speaker: "Anna",
      slovak: cinemaLine.text,
      marks: cinemaLine.marks,
      english: "Tonight he's going to the cinema with those colleagues.",
      audio: { transcript: cinemaLine.text },
    },
    {
      id: demonstrativesLineIds.waiterTakesOrder,
      speaker: "Waiter",
      slovak: "Dobrý deň. Čo si dáte?",
      english: "Hello. What would you like?",
      audio: { transcript: "Dobrý deň. Čo si dáte?" },
    },
    {
      id: demonstrativesLineIds.youHowMuchCake,
      speaker: "You",
      slovak: priceLine.text,
      marks: priceLine.marks,
      english: "How much is this cake?",
      audio: { transcript: priceLine.text },
      sayChoices: {
        answerId: "masculine",
        choices: [
          { id: "masculine", label: "Koľko stojí tento koláč?" },
          {
            id: "feminine",
            label: "Koľko stojí táto koláč?",
            whyWrong:
              "**Táto** goes with feminine nouns like **torta**. **Koláč** is masculine: **tento koláč**.",
          },
          {
            id: "neuter",
            label: "Koľko stojí toto koláč?",
            whyWrong:
              "**Toto** goes with neuter nouns like **dievča**. **Koláč** is masculine: **tento koláč**.",
          },
        ],
      },
    },
    {
      id: demonstrativesLineIds.waiterThreeEuros,
      speaker: "Waiter",
      slovak: "Tri eurá.",
      english: "Three euros.",
      audio: { transcript: "Tri eurá." },
    },
    {
      id: demonstrativesLineIds.youThisCake,
      speaker: "You",
      slovak: cakeLine.text,
      marks: cakeLine.marks,
      english: "OK, I'll have this cake.",
      audio: { transcript: cakeLine.text },
      sayChoices: {
        answerId: "masculine",
        choices: [
          { id: "masculine", label: "Dobre, dám si tento koláč." },
          {
            id: "feminine",
            label: "Dobre, dám si túto koláč.",
            whyWrong:
              "**Túto** goes with feminine nouns, like **tortu**. **Koláč** is masculine: **tento koláč**.",
          },
          {
            id: "person",
            label: "Dobre, dám si tohto koláč.",
            whyWrong:
              "**Tohto** is for people in the accusative (**tohto muža**). A thing keeps the basic form: **tento koláč**.",
          },
        ],
      },
    },
    {
      id: demonstrativesLineIds.annaThatCake,
      speaker: "Anna",
      slovak: tortaLine.text,
      marks: tortaLine.marks,
      english: "And I'll have that layer cake over there.",
      audio: { transcript: tortaLine.text },
    },
  ],
  keyPhrases: demonstrativesBeatShells.flatMap((beat) => beat.teach.phrases ?? []),
  pattern: {
    title: "This, that, the",
    body: "**Ten, tá, to** agree with the noun: *ten muž, tá žena, to dievča*. Add **-to** for this one here (*tento koláč*) and **tam-** for that one over there (*tamtá torta*). In the plural, only masculine nouns for people take **tí**; everything else takes **tie**. On its own, **to** never changes: *To je môj brat. To sú fotky z leta.* In other cases, ten takes the case of its noun: *Poznám toho muža. Býva v tom dome.*",
  },
  beats: withDemonstrativesExercises(
    demonstrativesBeatShells,
    demonstrativesGradedExercises,
    demonstrativesPersonalExercise,
  ),
  referenceLinks: [
    { href: "/grammar/demonstratives", label: "Demonstratives" },
    { href: "/grammar/grammatical-gender", label: "Grammatical gender" },
    { href: "/grammar/cases-overview", label: "Cases overview" },
    { href: "/grammar/cases/accusative", label: "Accusative" },
  ],
};
