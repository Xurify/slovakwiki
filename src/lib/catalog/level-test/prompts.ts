import type { SpeakingPrompt, WritingPrompt } from "$lib/level-test/types";

/**
 * Production task prompts. They address the learner with `vy` throughout and
 * avoid gendered forms (`rád`, past tense) so one wording fits everyone.
 */

/** Dictionary photos that show a scene with something to describe. */
export const photoSlugs = [
  "trh",
  "kaviaren",
  "rodina",
  "kuchyna",
  "namestie",
  "koncert",
  "ucitel",
  "dieta",
  "plaz",
  "dedina",
  "kniznica",
  "restauracia",
  "park",
  "vlak",
] as const;

export const interactiveWritingPrompts: WritingPrompt[] = [
  {
    id: "volny-cas",
    slovak: "Opíšte miesto, kde najradšej trávite voľný čas. Prečo sa vám tam páči?",
    english:
      "Describe the place where you most like to spend your free time. Why do you like it there?",
    followUp: {
      slovak: "Ako často tam chodíte a s kým?",
      english: "How often do you go there, and who with?",
    },
  },
  {
    id: "jedlo",
    slovak: "Napíšte o jedle, ktoré máte najradšej. Kedy a s kým ho jete?",
    english: "Write about your favourite food. When and with whom do you eat it?",
    followUp: {
      slovak: "Viete si ho pripraviť? Ako?",
      english: "Can you make it yourself? How?",
    },
  },
  {
    id: "mesto-dedina",
    slovak: "Je lepšie bývať v meste, alebo na dedine? Napíšte svoj názor.",
    english: "Is it better to live in a town or in the countryside? Give your opinion.",
    followUp: {
      slovak: "Čo by ste na mieste, kde bývate, zmenili?",
      english: "What would you change about the place where you live?",
    },
  },
];

export const writingSamplePrompts: WritingPrompt[] = [
  {
    id: "dolezity-clovek",
    slovak: "Napíšte o človeku, ktorý je pre vás dôležitý. Kto to je a prečo?",
    english: "Write about a person who is important to you. Who are they, and why?",
  },
  {
    id: "preco-slovencina",
    slovak: "Prečo sa učíte slovenčinu? Čo vás na nej baví a čo je pre vás ťažké?",
    english:
      "Why are you learning Slovak? What do you enjoy about it, and what do you find hard?",
  },
  {
    id: "idealny-vikend",
    slovak: "Opíšte svoj ideálny víkend. Čo by ste robili a s kým?",
    english: "Describe your ideal weekend. What would you do, and who with?",
  },
];

export const readThenSpeakPrompts: SpeakingPrompt[] = [
  {
    id: "moje-mesto",
    slovak: "Porozprávajte nám o meste alebo dedine, kde bývate.",
    english: "Tell us about the town or village where you live.",
    points: [
      { slovak: "Kde sa nachádza?", english: "Where is it?" },
      { slovak: "Čo sa tam dá robiť?", english: "What can you do there?" },
      {
        slovak: "Čo sa vám tam páči a čo nie?",
        english: "What do you like there, and what not?",
      },
    ],
  },
  {
    id: "kniha-film",
    slovak: "Porozprávajte nám o svojej obľúbenej knihe alebo o svojom obľúbenom filme.",
    english: "Tell us about your favourite book or film.",
    points: [
      { slovak: "O čom je?", english: "What is it about?" },
      { slovak: "Prečo sa vám páči?", english: "Why do you like it?" },
      { slovak: "Komu by ste to odporučili?", english: "Who would you recommend it to?" },
    ],
  },
];

export const speakingSamplePrompts: SpeakingPrompt[] = [
  {
    id: "jazyk-online",
    slovak: "Aké sú výhody a nevýhody učenia sa jazyka online? Povedzte svoj názor.",
    english:
      "What are the pros and cons of learning a language online? Give your opinion.",
  },
  {
    id: "cesta",
    slovak: "Porozprávajte nám o ceste, na ktorú dodnes s radosťou spomínate.",
    english: "Talk about a trip you still like to remember.",
  },
];
