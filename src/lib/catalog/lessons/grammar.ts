import type { Lesson } from "$lib/learning/types";
import { withBytExercises, withMatExercises, withPresentTenseExercises } from "./beats";

export const grammarLessons: Lesson[] = [
  {
    id: "grammar/present-tense-i",
    track: "grammar",
    slug: "present-tense-i",
    title: "Present-tense endings",
    promise: "Use the six present-tense endings to say who is doing the action.",
    scene: [
      {
        id: "peter-reads",
        speaker: "Anna",
        slovak: "Peter číta knihu.",
        english: "Peter is reading a book.",
        audio: { transcript: "Peter číta knihu." },
      },
      {
        id: "ask-you",
        speaker: "Anna",
        slovak: "Čítaš knihu?",
        english: "Are you reading a book?",
        audio: { transcript: "Čítaš knihu?" },
      },
      {
        id: "you-read",
        speaker: "You",
        slovak: "Áno, čítam.",
        english: "Yes, I am reading.",
        audio: { transcript: "Áno, čítam." },
        sayChoices: {
          answerId: "i-read",
          choices: [
            { id: "i-read", label: "Áno, čítam." },
            {
              id: "he-reads",
              label: "Áno, číta.",
              whyWrong: "**Číta** ends in **-a** for he/she — not I.",
            },
            {
              id: "you-read",
              label: "Áno, čítaš.",
              whyWrong: "**Čítaš** ends in **-š** for informal you — not I.",
            },
          ],
        },
      },
    ],
    keyPhrases: [
      {
        slovak: "čítam",
        english: "I read",
        note: "ja · ending -m",
        audio: { transcript: "čítam" },
      },
      {
        slovak: "čítaš",
        english: "you read (informal)",
        note: "ty · ending -š",
        audio: { transcript: "čítaš" },
      },
      {
        slovak: "číta",
        english: "he/she reads",
        note: "on / ona · no extra ending",
        audio: { transcript: "číta" },
      },
      {
        slovak: "čítame",
        english: "we read",
        note: "my · ending -me",
        audio: { transcript: "čítame" },
      },
      {
        slovak: "čítate",
        english: "you read (plural / formal)",
        note: "vy · ending -te",
        audio: { transcript: "čítate" },
      },
      {
        slovak: "čítajú",
        english: "they read",
        note: "oni / ony · ending -jú",
        audio: { transcript: "čítajú" },
      },
    ],
    pattern: {
      title: "Six endings, one present tense",
      body: "Čítať shows the pattern: čítam, čítaš, číta, čítame, čítate, čítajú. Slovak often drops ja, ty, and my because the ending already says who acts. Vy covers both plural you and formal singular you.",
    },
    beats: withPresentTenseExercises(
      {
        id: "present-tense-choose",
        type: "choice",
        practiceItemId: "grammar/first-person-reading",
        prompt: "I am reading a book.",
        choices: [
          { id: "first-person", label: "Čítam knihu." },
          {
            id: "third-person",
            label: "Číta knihu.",
            whyWrong: "**Číta** ends in **-a** for he/she — not I.",
          },
          {
            id: "second-person",
            label: "Čítaš knihu.",
            whyWrong: "**Čítaš** ends in **-š** for informal you — not I.",
          },
        ],
        answerId: "first-person",
        feedback: {
          correction: "Čítam knihu.",
          english: "I am reading a book.",
          why: "The ending **-m** marks I. **Číta** is he/she; **čítaš** is informal you.",
        },
      },
      {
        id: "present-tense-repair",
        type: "typed",
        task: "repair",
        practiceItemId: "grammar/repair-first-person-reading",
        context: [
          {
            id: "lesson-reading-broken",
            speaker: "Sentence",
            slovak: "Ja číta knihu.",
            english: "I am reading a book.",
          },
        ],
        prompt: "Repair this sentence.",
        inputLabel: "Correct Slovak sentence",
        answer: "Čítam knihu.",
        acceptedAnswers: ["Ja čítam knihu."],
        feedback: {
          correction: "Čítam knihu.",
          english: "I am reading a book.",
          why: "**Číta** is he/she reads. Change it to **čítam** for I. **Ja** is possible for emphasis, but the verb ending already says who is acting.",
        },
      },
      {
        id: "present-tense-we-choose",
        type: "choice",
        practiceItemId: "grammar/today-reading",
        prompt: "Today we are reading a book.",
        choices: [
          { id: "we", label: "Dnes čítame knihu." },
          {
            id: "i",
            label: "Dnes čítam knihu.",
            whyWrong: "**Čítam** ends in **-m** for I — not we.",
          },
          {
            id: "they",
            label: "Dnes čítajú knihu.",
            whyWrong: "**Čítajú** ends in **-jú** for they — not we.",
          },
        ],
        answerId: "we",
        feedback: {
          correction: "Dnes čítame knihu.",
          english: "Today we are reading a book.",
          why: "**Čítame** ends in **-me** for we. **Čítam** is I; **čítajú** is they.",
        },
      },
      {
        id: "present-tense-personal",
        type: "personal",
        prompt:
          "Say one true present-tense sentence about yourself or about someone else.",
        example: "Dnes pracujem. / Peter číta noviny.",
      },
    ),
    referenceLinks: [{ href: "/grammar/present-tense", label: "Present tense" }],
  },
  {
    id: "grammar/byt-present",
    track: "grammar",
    slug: "byt-present",
    title: "Present forms of byť",
    promise: "Say who you are and where you are with som / ste / je.",
    scene: [
      {
        id: "byt-check-in-name",
        speaker: "Receptionist",
        slovak: "Dobrý deň. Ste Alex?",
        english: "Hello. Are you Alex?",
        audio: { transcript: "Dobrý deň. Ste Alex?" },
      },
      {
        id: "byt-check-in-answer",
        speaker: "You",
        slovak: "Áno, som Alex.",
        english: "Yes, I am Alex.",
        audio: { transcript: "Áno, som Alex." },
        sayChoices: {
          answerId: "i-am",
          answerIds: ["i-am", "i-am-short"],
          choices: [
            { id: "i-am", label: "Áno, som Alex." },
            { id: "i-am-short", label: "Som Alex." },
            {
              id: "you-are",
              label: "Áno, ste Alex.",
              whyWrong: "**Ste** means you are — not I.",
            },
          ],
        },
      },
      {
        id: "byt-check-in-location",
        speaker: "Receptionist",
        slovak: "Je to tu prvýkrát?",
        english: "Is this your first time here?",
        audio: { transcript: "Je to tu prvýkrát?" },
      },
      {
        id: "byt-check-in-group",
        speaker: "You",
        slovak: "Áno. Sme tu s priateľmi.",
        english: "Yes. We are here with friends.",
        audio: { transcript: "Áno. Sme tu s priateľmi." },
        sayChoices: {
          answerId: "we-here",
          choices: [
            { id: "we-here", label: "Áno. Sme tu s priateľmi." },
            {
              id: "i-here",
              label: "Áno. Som tu sám.",
              whyWrong: "She asked about **we** — use **sme**, not a solo **som**.",
            },
            {
              id: "first-time",
              label: "Nie, nie je.",
              whyWrong: "Answer that you are here with friends: **Sme tu s priateľmi.**",
            },
          ],
        },
      },
    ],
    keyPhrases: [
      {
        slovak: "Som …",
        english: "I am …",
        audio: { transcript: "Som." },
      },
      {
        slovak: "Ste …?",
        english: "Are you …? (formal / plural)",
        audio: { transcript: "Ste?" },
      },
      {
        slovak: "Je to …",
        english: "It is …",
        audio: { transcript: "Je to." },
      },
      {
        slovak: "Sme …",
        english: "We are …",
        audio: { transcript: "Sme." },
      },
    ],
    pattern: {
      title: "Present forms of byť",
      body: "Byť (to be) is irregular: som, si, je, sme, ste, sú. Use it for identity and location: Som Alex. Sme tu. Do not use byť for age: Slovak uses mať, as in Mám dvadsať rokov.",
    },
    beats: withBytExercises(
      {
        id: "byt-som",
        type: "choice",
        practiceItemId: "grammar/byt-som",
        prompt: "I am Alex.",
        choices: [
          { id: "i-am", label: "Som Alex." },
          {
            id: "you-are",
            label: "Ste Alex.",
            whyWrong: "**Ste** means you are — not I.",
          },
          {
            id: "we-are",
            label: "Sme Alex.",
            whyWrong: "**Sme** means we are — not I.",
          },
        ],
        answerId: "i-am",
        feedback: {
          correction: "Som Alex.",
          english: "I am Alex.",
          why: "**Som** is the first-person singular form of **byť**: I am.",
        },
      },
      {
        id: "byt-ste",
        type: "build",
        practiceItemId: "grammar/byt-ste",
        prompt: "Are you Alex?",
        tiles: ["Alex?", "Ste"],
        answer: ["Ste", "Alex?"],
        feedback: {
          correction: "Ste Alex?",
          english: "Are you Alex?",
          why: "**Ste** is used for formal singular you and plural you.",
        },
      },
      {
        id: "byt-je-location",
        type: "typed",
        task: "complete",
        practiceItemId: "grammar/byt-je-location",
        prompt: "The café is here.",
        inputLabel: "Your Slovak answer",
        answer: "Kaviareň je tu.",
        feedback: {
          correction: "Kaviareň je tu.",
          english: "The café is here.",
          why: "**Je** is the he/she/it form of **byť**. Use it to say where one thing is.",
        },
      },
      {
        id: "byt-personal",
        type: "personal",
        prompt: "Say who you are and where you are. Then make one sentence with sme.",
        example: "Som Alex. Som v kaviarni. Sme tu s priateľmi.",
      },
    ),
    referenceLinks: [
      { href: "/grammar/byt-present", label: "Byť" },
      { href: "/grammar/ty-vs-vy", label: "ty and vy" },
      { href: "/grammar/mat-present", label: "Mať" },
    ],
  },
  {
    id: "grammar/mat-present",
    track: "grammar",
    slug: "mat-present",
    title: "Present forms of mať",
    promise: "Say what you have, your age, and that you don’t have something.",
    scene: [
      {
        id: "mat-cafe-time",
        speaker: "Anna",
        slovak: "Máš čas na kávu?",
        english: "Do you have time for coffee?",
        audio: { transcript: "Máš čas na kávu?" },
      },
      {
        id: "mat-cafe-answer",
        speaker: "You",
        slovak: "Áno, mám čas.",
        english: "Yes, I have time.",
        audio: { transcript: "Áno, mám čas." },
        sayChoices: {
          answerId: "i-have",
          answerIds: ["i-have", "i-have-short"],
          choices: [
            { id: "i-have", label: "Áno, mám čas." },
            { id: "i-have-short", label: "Mám čas." },
            {
              id: "you-have",
              label: "Áno, máš čas.",
              whyWrong: "**Máš** means you have — not I.",
            },
          ],
        },
      },
      {
        id: "mat-cafe-age",
        speaker: "Anna",
        slovak: "Koľko máš rokov?",
        english: "How old are you?",
        audio: { transcript: "Koľko máš rokov?" },
      },
      {
        id: "mat-cafe-age-answer",
        speaker: "You",
        slovak: "Mám dvadsaťosem rokov.",
        english: "I am twenty-eight years old.",
        audio: { transcript: "Mám dvadsaťosem rokov." },
        sayChoices: {
          answerId: "age",
          choices: [
            { id: "age", label: "Mám dvadsaťosem rokov." },
            {
              id: "be-age",
              label: "Som dvadsaťosem.",
              whyWrong: "Age uses **mať**, not **byť**: **Mám … rokov.**",
            },
            {
              id: "you-age",
              label: "Máš dvadsaťosem rokov.",
              whyWrong: "**Máš** is you have — for yourself use **mám**.",
            },
          ],
        },
      },
      {
        id: "mat-cafe-possession",
        speaker: "You",
        slovak: "Nemám hotovosť, ale mám kartu.",
        english: "I do not have cash, but I have a card.",
        audio: { transcript: "Nemám hotovosť, ale mám kartu." },
        sayChoices: {
          answerId: "card",
          choices: [
            { id: "card", label: "Nemám hotovosť, ale mám kartu." },
            {
              id: "cash-only",
              label: "Mám hotovosť.",
              whyWrong: "You need the contrast: **nemám** cash, but **mám** a card.",
            },
            {
              id: "no-card",
              label: "Nemám kartu.",
              whyWrong: "Say you have a card: **mám kartu**, with **nemám hotovosť**.",
            },
          ],
        },
      },
    ],
    keyPhrases: [
      {
        slovak: "Mám …",
        english: "I have …",
        audio: { transcript: "Mám." },
      },
      {
        slovak: "Máš …?",
        english: "Do you have …? (informal)",
        audio: { transcript: "Máš?" },
      },
      {
        slovak: "Nemám …",
        english: "I do not have …",
        audio: { transcript: "Nemám." },
      },
      {
        slovak: "Mám … rokov.",
        english: "I am … years old.",
        audio: { transcript: "Mám rokov." },
      },
    ],
    pattern: {
      title: "Present forms of mať",
      body: "Mať (to have) is mám, máš, má, máme, máte, majú. Máš is informal singular you; máte is formal singular or plural you. Slovak says Mám dvadsať rokov for age, not Som dvadsať rokov. Add ne- to make a negative: mám → nemám.",
    },
    beats: withMatExercises(
      {
        id: "mat-mam",
        type: "choice",
        practiceItemId: "grammar/mat-mam",
        prompt: "I have time.",
        choices: [
          { id: "i-have", label: "Mám čas." },
          {
            id: "you-have",
            label: "Máš čas.",
            whyWrong: "**Máš** means you have — not I.",
          },
          {
            id: "i-am",
            label: "Som čas.",
            whyWrong:
              "**Som** is from **byť** (to be) — possession uses **mať**: **mám**.",
          },
        ],
        answerId: "i-have",
        feedback: {
          correction: "Mám čas.",
          english: "I have time.",
          why: "**Mám** is the first-person singular form of **mať**: I have.",
        },
      },
      {
        id: "mat-mas",
        type: "build",
        practiceItemId: "grammar/mat-mas",
        prompt: "Do you have a card?",
        tiles: ["kartu?", "Máš"],
        answer: ["Máš", "kartu?"],
        feedback: {
          correction: "Máš kartu?",
          english: "Do you have a card?",
          why: "**Máš** is used when speaking informally to one person.",
        },
      },
      {
        id: "mat-nemam",
        type: "typed",
        task: "complete",
        practiceItemId: "grammar/mat-nemam",
        prompt: "I do not have cash.",
        inputLabel: "Your Slovak answer",
        answer: "Nemám hotovosť.",
        feedback: {
          correction: "Nemám hotovosť.",
          english: "I do not have cash.",
          why: "Put **ne-** onto **mám** to make the negative form **nemám**.",
        },
      },
      {
        id: "mat-personal",
        type: "personal",
        prompt:
          "Say your age, then name one thing you have and one thing you do not have.",
        example: "Mám dvadsaťosem rokov. Mám kartu. Nemám hotovosť.",
      },
    ),
    referenceLinks: [
      { href: "/grammar/mat-present", label: "Mať" },
      { href: "/grammar/byt-present", label: "Byť" },
      { href: "/grammar/numbers-and-numerals", label: "Numbers and numerals" },
      { href: "/grammar/negation", label: "Negation" },
    ],
  },
];
