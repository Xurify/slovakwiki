import type { MarkedPart } from "$lib/learning/marked-text";
import type { DialogueTurn, ListenerPath } from "$lib/learning/types";
import {
  CHUCKLE,
  PAUSE,
  SIGH,
  STOP,
  NO_PICK,
  lineWriter,
  listenerPicks,
  onPath,
  staged,
  type Part,
} from "../dialogue";
import type { Cue } from "$lib/stick-figure/acts";
import type { ListeningChapter, ListeningEpisode } from "../types";

const PREFIX = "podcast-demonstratives-";
const line = lineWriter(PREFIX);

/** A breath before the next word in the game, so the joke before it can land. */
const BEAT_MS = 1200;

/** Anna's score and Marek's answer to it, on one path through the listener's picks. */
function ending(
  when: ListenerPath,
  [annaId, annaParts, annaEnglish]: [string, Part[], string],
  [marekId, marekParts, marekEnglish]: [string, Part[], string],
): DialogueTurn[] {
  return [
    { ...onPath(line(annaId, "Anna", annaParts, annaEnglish), when), wait: BEAT_MS },
    onPath(line(marekId, "Marek", marekParts, marekEnglish), when),
  ];
}

/** A demonstrative, the episode's topic, lit in the transcript. */
function mark(text: string): Exclude<MarkedPart, string> {
  return { role: "demonstrative", text };
}

const intro: ListeningChapter = {
  id: `${PREFIX}intro`,
  titleSk: "Úvod",
  title: "Hello from the studio",
  lines: [
    line(
      "anna-this-is-podcast",
      "Anna",
      ["Ahojte! ", mark("Toto"), " je podcast Slovak Wiki. Ja som Anna."],
      "Hi! This is the Slovak Wiki podcast. I'm Anna.",
    ),
    line("marek-i-am-marek", "Marek", ["A ja som Marek. Ahojte!"], "And I'm Marek. Hi!"),
    line(
      "anna-small-topic",
      "Anna",
      ["Dnes máme malú tému: ", mark("ten"), ", ", mark("tá"), ", ", mark("to"), "."],
      "Today we have a small topic: ten, tá, to.",
    ),
    line(
      "marek-not-small",
      "Marek",
      ["Malú? ", PAUSE, mark("To"), " nie je malá téma, Anna!"],
      "Small? That's not a small topic, Anna!",
    ),
    line(
      "anna-lets-go",
      "Anna",
      ["Dobre, dobre. Ideme na ", mark("to"), "!"],
      "OK, OK. Let's get to it!",
    ),
  ],
  checks: [
    {
      id: `${PREFIX}check-topic`,
      prompt: "Aká je dnešná téma?",
      promptEnglish: "What is today's topic?",
      replayLineId: `${PREFIX}anna-small-topic`,
      choices: [
        { id: "demonstratives", label: "Ten, tá, to." },
        {
          id: "numbers",
          label: "Čísla.",
          whyWrong: "**Čísla** are numbers. Anna names **ten, tá, to**.",
        },
        {
          id: "food",
          label: "Jedlo.",
          whyWrong:
            "**Jedlo** is food. An apple turns up later, but the topic is **ten, tá, to**.",
        },
      ],
      answerId: "demonstratives",
      feedback: {
        english: "Today we have a small topic: ten, tá, to.",
        why: "Anna says: **Dnes máme malú tému: ten, tá, to.**",
      },
    },
  ],
};

const BAG_ACTS: Record<string, Cue[]> = {
  "marek-bag-three-things": [{ do: "point", to: "bag", on: "tašku" }],
  "marek-small-opens-doors": [
    { do: "take", what: "key", on: "malé" },
    { do: "raise", what: "key", on: "dvere" },
  ],
  "anna-its-a-key": [{ do: "point", to: "key", on: "kľúč" }],
  "marek-car-key": [
    { do: "nod", on: "správne" },
    { do: "put", what: "key", to: "bag", on: "auta" },
  ],
  "marek-heavy-paper": [
    { do: "take", what: "book", on: "žlté" },
    { do: "raise", what: "book", on: "papier" },
  ],
  "anna-is-it-a-book": [{ do: "point", to: "book", on: "kniha" }],
  "marek-dictionary": [
    { do: "nod", on: "presne" },
    { do: "put", what: "book", to: "bag", on: "slovník" },
  ],
  "marek-green-sweet": [
    { do: "take", what: "apple", on: "zelené" },
    { do: "raise", what: "apple", on: "sladké" },
  ],
  "marek-not-a-pear": [
    { do: "shrug", on: "nie" },
    { do: "raise", what: "apple", on: "okrúhle" },
  ],
  "anna-apple": [{ do: "point", to: "apple", on: "jablko" }],
  "marek-apple-for-you": [
    { do: "raise", what: "apple", on: "výborne" },
    { do: "put", what: "apple", to: "desk", dx: 31, on: "jablko" },
    { do: "slide", what: "apple", to: "desk", dx: -20, on: "teba" },
  ],
  "anna-hungry": [
    { do: "take", what: "apple", on: "ďakujem" },
    { do: "taste", what: "apple", on: "hlad" },
    { do: "put", what: "apple", to: "desk", dx: -26, on: "after" },
  ],
};

const bag: ListeningChapter = {
  id: `${PREFIX}bag`,
  titleSk: "Čo je to?",
  title: "The bag game",
  setup: {
    objects: [
      { id: "bag", kind: "bag", start: { where: { on: "desk", dx: 8 } } },
      { id: "key", kind: "keys", start: { where: { in: "bag" } } },
      { id: "book", kind: "book", start: { where: { in: "bag" } } },
      { id: "apple", kind: "apple", start: { where: { in: "bag" } } },
    ],
  },
  lines: staged(
    PREFIX,
    [
      line(
        "marek-bag-three-things",
        "Marek",
        ["Anna, mám tu tašku. V taške sú tri veci."],
        "Anna, I have a bag here. There are three things in the bag.",
      ),
      line(
        "anna-what-is-it",
        "Anna",
        ["Dobre. Čo je ", mark("to"), "?"],
        "OK. What is it?",
      ),
      line(
        "marek-small-opens-doors",
        "Marek",
        ["Prvá vec. ", PAUSE, "Je ", mark("to"), " malé", STOP, PAUSE, "a otvára dvere."],
        "First thing. It's small… and it opens doors.",
      ),
      line(
        "anna-its-a-key",
        "Anna",
        ["Hm… ", PAUSE, mark("to"), " je kľúč!"],
        "Hmm… it's a key!",
      ),
      line(
        "marek-car-key",
        "Marek",
        ["Správne! ", mark("Ten"), " kľúč je od auta."],
        "Right! That key is for the car.",
      ),
      line(
        "anna-second-thing",
        "Anna",
        ["Super! A druhá vec?"],
        "Great! And the second thing?",
      ),
      line(
        "marek-heavy-paper",
        "Marek",
        [
          "Je ",
          mark("to"),
          " žlté",
          STOP,
          PAUSE,
          "je ",
          mark("to"),
          " ťažké",
          STOP,
          PAUSE,
          "a vnútri je papier.",
        ],
        "It's yellow… it's heavy… and there's paper inside.",
      ),
      line(
        "anna-is-it-a-box",
        "Anna",
        ["Žlté a ťažké… ", PAUSE, "je ", mark("to"), " krabica?"],
        "Yellow and heavy… is it a box?",
      ),
      line(
        "marek-not-a-box",
        "Marek",
        [
          "Nie, nie je ",
          mark("to"),
          " krabica. ",
          PAUSE,
          "Je ",
          mark("to"),
          " z papiera.",
        ],
        "No, it's not a box. It's made of paper.",
      ),
      line(
        "anna-is-it-a-book",
        "Anna",
        ["Z papiera… ", PAUSE, "je ", mark("to"), " kniha?"],
        "Made of paper… is it a book?",
      ),
      line(
        "marek-dictionary",
        "Marek",
        ["Presne tak! ", mark("Tá"), " žltá kniha je slovník."],
        "Exactly! That yellow book is a dictionary.",
      ),
      line(
        "anna-third-thing",
        "Anna",
        [mark("Tá"), " kniha je veľká! A ", mark("tá"), " tretia vec?"],
        "That book is big! And that third thing?",
      ),
      line(
        "marek-green-sweet",
        "Marek",
        ["Je ", mark("to"), " zelené", STOP, PAUSE, "a je ", mark("to"), " sladké."],
        "It's green… and it's sweet.",
      ),
      line(
        "anna-a-pear",
        "Anna",
        ["Zelené a sladké… ", PAUSE, "hruška?"],
        "Green and sweet… a pear?",
      ),
      line(
        "marek-not-a-pear",
        "Marek",
        ["Nie, hruška nie. ", PAUSE, "Je ", mark("to"), " okrúhle."],
        "No, not a pear. It's round.",
      ),
      line(
        "anna-apple",
        "Anna",
        ["Okrúhle a sladké… ", PAUSE, "jablko! ", mark("To"), " je jablko."],
        "Round and sweet… an apple! It's an apple.",
      ),
      line(
        "marek-apple-for-you",
        "Marek",
        ["Výborne! A ", mark("to"), " jablko je pre teba."],
        "Excellent! And that apple is for you.",
      ),
      line("anna-hungry", "Anna", ["Ďakujem! Mám hlad."], "Thanks! I'm hungry."),
      line(
        "marek-lets-go-to-market",
        "Marek",
        ["A teraz poďme na trh!"],
        "And now let's go to the market!",
      ),
    ],
    BAG_ACTS,
  ),
  checks: [
    {
      id: `${PREFIX}check-first-thing`,
      prompt: "Čo je prvá vec v Marekovej taške?",
      promptEnglish: "What is the first thing in Marek's bag?",
      replayLineId: `${PREFIX}marek-small-opens-doors`,
      choices: [
        { id: "key", label: "Kľúč." },
        {
          id: "book",
          label: "Kniha.",
          whyWrong:
            "**Kniha** is a book, the second thing: yellow, heavy, with paper inside.",
        },
        {
          id: "apple",
          label: "Jablko.",
          whyWrong: "**Jablko** is an apple, the third thing: green and sweet.",
        },
      ],
      answerId: "key",
      feedback: {
        english: "It's small… and it opens doors.",
        why: "Marek says **otvára dvere**, it opens doors, so Anna guesses **kľúč**.",
      },
    },
    {
      id: `${PREFIX}check-key-form`,
      gap: "___ kľúč je od auta.",
      prompt: "Ktoré slovo povedal Marek?",
      promptEnglish: "Which word did Marek say?",
      replayLineId: `${PREFIX}marek-car-key`,
      choices: [
        { id: "ten", label: "ten" },
        {
          id: "ta",
          label: "tá",
          whyWrong: "**Tá** goes with feminine nouns like **kniha**.",
        },
        {
          id: "to",
          label: "to",
          whyWrong: "**To** goes with neuter nouns like **jablko**.",
        },
      ],
      answerId: "ten",
      feedback: {
        english: "That key is for the car.",
        why: "**Kľúč** is masculine, so **ten kľúč**.",
      },
    },
    {
      id: `${PREFIX}check-apple-for`,
      prompt: "Pre koho je jablko?",
      promptEnglish: "Who is the apple for?",
      replayLineId: `${PREFIX}marek-apple-for-you`,
      choices: [
        { id: "anna", label: "Pre Annu." },
        {
          id: "marek",
          label: "Pre Mareka.",
          whyWrong:
            "**Pre Mareka** means for Marek, but he is giving it away: **pre teba**, for you, to Anna.",
        },
        {
          id: "listeners",
          label: "Pre poslucháčov.",
          whyWrong:
            "**Pre poslucháčov** means for the listeners. Marek says **pre teba**, for you, to Anna.",
        },
      ],
      answerId: "anna",
      feedback: {
        english: "And that apple is for you.",
        why: "Marek says **to jablko je pre teba**, and he is talking to Anna.",
      },
    },
  ],
};

const MARKET_ACTS: Record<string, Cue[]> = {
  // Marek has his cheese and stands back; Anna steps up to the stall.
  "anna-want-these-strawberries": [
    { who: "marek", do: "go", to: "aside", on: "start" },
    { do: "go", to: "stall" },
  ],
  "lucia-here-you-are": [{ do: "give", what: "basket", to: "anna", on: "páči" }],
  "anna-lets-go-home": [{ do: "wave", on: "poďme" }],
};

const market: ListeningChapter = {
  id: `${PREFIX}market`,
  stage: "market",
  titleSk: "Na trhu",
  title: "At the market: this one or that one?",
  setup: {
    objects: [
      { id: "basket", kind: "basket", start: { where: { hand: "lucia", side: "lead" } } },
    ],
  },
  lines: staged(
    PREFIX,
    [
      line(
        "anna-now-at-market",
        "Anna",
        ["Teraz sme na trhu. Marek, čo kupuješ?"],
        "Now we're at the market. Marek, what are you buying?",
      ),
      line(
        "marek-how-much-this-cheese",
        "Marek",
        ["Syr. ", PAUSE, "Dobrý deň! Koľko stojí ", mark("tento"), " syr?"],
        "Cheese. Hello! How much is this cheese?",
        // The one word answers Anna; the greeting and the question are for Lucia at her stall.
        { to: "Lucia" },
      ),
      line(
        "lucia-this-cheese-five",
        "Lucia",
        [mark("Tento"), " syr stojí päť eur."],
        "This cheese costs five euros.",
      ),
      line(
        "marek-and-that-cheese",
        "Marek",
        ["Aha. ", PAUSE, "A ", mark("tamten"), " syr?"],
        "I see. And that cheese over there?",
      ),
      line(
        "lucia-that-one-cheaper",
        "Lucia",
        [mark("Tamten"), " je lacnejší. Stojí tri eurá."],
        "That one over there is cheaper. It costs three euros.",
      ),
      line(
        "marek-ill-take-that-one",
        "Marek",
        ["Dobre, ", PAUSE, "dám si ", mark("tamten"), "."],
        "OK, I'll take that one over there.",
      ),
      line(
        "anna-want-these-strawberries",
        "Anna",
        ["A ja chcem ", mark("tieto"), " jahody."],
        "And I want these strawberries.",
      ),
      line(
        "lucia-strawberries-from",
        "Lucia",
        [mark("Tieto"), " jahody sú z Rakúska. ", mark("Tamtie"), " sú zo Slovenska."],
        "These strawberries are from Austria. Those over there are from Slovakia.",
      ),
      line(
        "anna-those-please",
        "Anna",
        ["Tak ", mark("tamtie"), ", prosím."],
        "Those over there, then, please.",
      ),
      line("lucia-here-you-are", "Lucia", ["Nech sa páči."], "Here you are.", {
        props: ["basket"],
      }),
      line(
        "marek-anna-always-slovak",
        "Marek",
        ["Anna vždy kupuje slovenské jahody."],
        "Anna always buys Slovak strawberries.",
      ),
      line("anna-lets-go-home", "Anna", ["Dobre. Poďme domov!"], "OK. Let's go home!"),
    ],
    MARKET_ACTS,
  ),
  checks: [
    {
      id: `${PREFIX}check-which-cheese`,
      prompt: "Ktorý syr si Marek kúpi?",
      promptEnglish: "Which cheese does Marek buy?",
      replayLineId: `${PREFIX}marek-ill-take-that-one`,
      choices: [
        { id: "far", label: "Ten lacnejší, za tri eurá." },
        {
          id: "near",
          label: "Ten drahší, za päť eur.",
          whyWrong:
            "**Ten drahší** means the dearer one: **tento syr**, the five-euro one in front of him. He takes **tamten**, the cheaper one.",
        },
        {
          id: "none",
          label: "Žiadny.",
          whyWrong:
            "**Žiadny** means none, but Marek says **dám si tamten**, I'll take that one.",
        },
      ],
      answerId: "far",
      feedback: {
        english: "OK, I'll take that one over there.",
        why: "Lucia says **tamten je lacnejší**, so Marek says **dám si tamten**.",
      },
    },
    {
      id: `${PREFIX}check-strawberries-form`,
      gap: "A ja chcem ___ jahody.",
      prompt: "Ktoré slovo povedala Anna?",
      promptEnglish: "Which word did Anna say?",
      replayLineId: `${PREFIX}anna-want-these-strawberries`,
      choices: [
        { id: "tieto", label: "tieto" },
        {
          id: "tento",
          label: "tento",
          whyWrong: "**Tento** is masculine singular: **tento syr**.",
        },
        {
          id: "tato",
          label: "táto",
          whyWrong: "**Táto** is feminine singular: **táto jahoda**, one strawberry.",
        },
      ],
      answerId: "tieto",
      feedback: {
        english: "And I want these strawberries.",
        why: "**Jahody** is plural, so **tieto jahody**.",
      },
    },
    {
      id: `${PREFIX}check-strawberries-from`,
      prompt: "Odkiaľ sú jahody, ktoré kupuje Anna?",
      promptEnglish: "Where are the strawberries Anna buys from?",
      replayLineId: `${PREFIX}lucia-strawberries-from`,
      choices: [
        { id: "slovakia", label: "Zo Slovenska." },
        {
          id: "austria",
          label: "Z Rakúska.",
          whyWrong:
            "**Z Rakúska** means from Austria: **tieto**, the ones in front. Anna asks for **tamtie**.",
        },
        {
          id: "czechia",
          label: "Z Česka.",
          whyWrong:
            "**Z Česka** means from Czechia. Lucia names only **Rakúsko** and **Slovensko**.",
        },
      ],
      answerId: "slovakia",
      feedback: {
        english:
          "These strawberries are from Austria. Those over there are from Slovakia.",
        why: "Lucia says **tamtie sú zo Slovenska**, and Anna picks **tamtie**.",
      },
    },
  ],
};

const HOME_ACTS: Record<string, Cue[]> = {
  "marek-got-it-who-is-man": [
    { do: "take", what: "keys", on: "mám" },
    { do: "raise", what: "keys", on: "ho" },
  ],
  "anna-dont-lose-these-keys": [{ do: "point", to: "keys", on: "kľúče" }],
  "marek-back-to-studio": [{ do: "pocket", what: "keys", on: "späť" }],
};

const home: ListeningChapter = {
  id: `${PREFIX}home`,
  stage: "home",
  titleSk: "Doma",
  title: "The lost car key",
  setup: {
    objects: [{ id: "keys", kind: "keys", start: { where: { pocket: "marek" } } }],
  },
  lines: staged(
    PREFIX,
    [
      line("anna-now-at-home", "Anna", ["A teraz sme doma."], "And now we're at home."),
      line(
        "marek-where-is-key",
        "Marek",
        ["Anna, kde je ", mark("ten"), " malý kľúč?"],
        "Anna, where is that small key?",
      ),
      line(
        "anna-car-or-flat",
        "Anna",
        ["Ktorý? ", mark("Ten"), " od auta alebo ", mark("ten"), " od bytu?"],
        "Which one? The one for the car or the one for the apartment?",
      ),
      line(
        "marek-the-car-one",
        "Marek",
        [mark("Ten"), " od auta."],
        "The one for the car.",
      ),
      line(
        "anna-in-that-bag",
        "Anna",
        ["Je v ", mark("tej"), " taške."],
        "It's in that bag.",
      ),
      line("marek-in-this-one", "Marek", ["V ", mark("tejto"), "?"], "In this one?"),
      line(
        "anna-in-that-one-window",
        "Anna",
        ["Nie, v ", mark("tamtej"), ". Pri ", mark("tom"), " okne."],
        "No, in that one over there. By that window.",
      ),
      line(
        "marek-got-it-who-is-man",
        "Marek",
        ["Aha, mám ho. ", PAUSE, "A kto je ", mark("ten"), " muž vonku?"],
        "Got it. And who is that man outside?",
      ),
      line(
        "anna-neighbour-you-know-him",
        "Anna",
        [mark("To"), " je náš sused, pán Novák. ", mark("Toho"), " muža poznáš."],
        "That's our neighbour, Mr Novák. You know that man.",
      ),
      line(
        "marek-with-that-woman",
        "Marek",
        ["Áno! Ide s ", mark("tou"), " ženou z obchodu."],
        "Yes! He's walking with that woman from the shop.",
      ),
      line(
        "anna-his-sister",
        "Anna",
        [mark("To"), " je jeho sestra."],
        "That's his sister.",
      ),
      line(
        "marek-those-people-nice",
        "Marek",
        [mark("Tí"), " ľudia sú milí."],
        "Those people are nice.",
      ),
      line(
        "anna-dont-lose-these-keys",
        "Anna",
        ["Áno. A ", mark("tieto"), " kľúče už nestrácaj!"],
        "Yes. And don't lose these keys again!",
      ),
      line(
        "marek-back-to-studio",
        "Marek",
        ["Nebudem. Poďme späť do štúdia!"],
        "I won't. Let's go back to the studio!",
      ),
    ],
    HOME_ACTS,
  ),
  checks: [
    {
      id: `${PREFIX}check-where-key`,
      prompt: "Kde je kľúč?",
      promptEnglish: "Where is the key?",
      replayLineId: `${PREFIX}anna-in-that-one-window`,
      choices: [
        { id: "far-bag", label: "V tamtej taške, pri okne." },
        {
          id: "this-bag",
          label: "V tejto taške.",
          whyWrong:
            "**V tejto taške** means in this bag. Marek asks **v tejto?** and Anna says **nie**.",
        },
        {
          id: "car",
          label: "V aute.",
          whyWrong:
            "**V aute** means in the car. It is the car key, **kľúč od auta**, but it is in a bag.",
        },
      ],
      answerId: "far-bag",
      feedback: {
        english: "No, in that one over there. By that window.",
        why: "Anna says **v tamtej**, in that bag over there, **pri tom okne**.",
      },
    },
    {
      id: `${PREFIX}check-toho`,
      gap: "___ muža poznáš.",
      prompt: "Ktorý tvar povedala Anna?",
      promptEnglish: "Which form did Anna say?",
      replayLineId: `${PREFIX}anna-neighbour-you-know-him`,
      choices: [
        { id: "toho", label: "toho" },
        {
          id: "ten",
          label: "ten",
          whyWrong:
            "**Ten** is the nominative. After **poznať** a man takes the accusative.",
        },
        { id: "tomu", label: "tomu", whyWrong: "**Tomu** is the dative: to that man." },
      ],
      answerId: "toho",
      feedback: {
        english: "You know that man.",
        why: "**Poznať** takes the accusative, and a man changes: **toho muža**.",
      },
    },
    {
      id: `${PREFIX}check-who-is-woman`,
      prompt: "Kto je tá žena so susedom?",
      promptEnglish: "Who is the woman with the neighbour?",
      replayLineId: `${PREFIX}anna-his-sister`,
      choices: [
        { id: "sister", label: "Jeho sestra." },
        {
          id: "wife",
          label: "Jeho žena.",
          whyWrong:
            "**Jeho žena** means his wife. Anna says **jeho sestra**, his sister.",
        },
        {
          id: "neighbour",
          label: "Suseda.",
          whyWrong: "**Suseda** is a female neighbour. Anna says **jeho sestra**.",
        },
      ],
      answerId: "sister",
      feedback: {
        english: "That's his sister.",
        why: "Anna says **to je jeho sestra**: **to** stays **to**, whoever it points at.",
      },
    },
  ],
};

const QUIZ_ACTS: Record<string, Cue[]> = {
  "marek-key-is-here": [
    { do: "take", what: "keys", on: "kľúč" },
    { do: "raise", what: "keys", on: "tu" },
  ],
  "anna-dont-lose-it": [{ do: "point", to: "keys", on: "nestrať" }],
  "marek-i-wont": [{ do: "pocket", what: "keys", on: "nestratím" }],
};

const quiz: ListeningChapter = {
  id: `${PREFIX}quiz`,
  titleSk: "Pomôžte Marekovi",
  title: "Help Marek: you pick the word",
  setup: {
    objects: [{ id: "keys", kind: "keys", start: { where: { pocket: "marek" } } }],
  },
  lines: staged(
    PREFIX,
    [
      line(
        "anna-back-in-studio",
        "Anna",
        ["Tak, sme späť v štúdiu."],
        "So, we're back in the studio.",
      ),
      line(
        "marek-key-is-here",
        "Marek",
        ["Áno. A ", mark("ten"), " kľúč mám tu."],
        "Yes. And I have that key here.",
      ),
      line(
        "anna-dont-lose-it",
        "Anna",
        [CHUCKLE, "Tak ho už nestrať!"],
        "Then don't lose it again!",
      ),
      line("marek-i-wont", "Marek", ["Nestratím, sľubujem."], "I won't, I promise."),
      line(
        "anna-test-for-marek",
        "Anna",
        [
          "No, kľúč máš. ",
          PAUSE,
          "A teraz malá skúška pre Mareka: ",
          mark("ten"),
          ", ",
          mark("tá"),
          ", ",
          mark("to"),
          ".",
        ],
        "Well, you have the key. And now a little test for Marek: ten, tá, to.",
      ),
      line(
        "marek-never-get-these",
        "Marek",
        ["Ojoj. ", PAUSE, "Tieto slovíčka mi nikdy nejdú do hlavy."],
        "Uh-oh. These little words never stick in my head.",
      ),
      line(
        "marek-you-help-me",
        "Marek",
        ["Viete čo? ", PAUSE, "Pomôžte mi vy!"],
        "You know what? You help me!",
      ),
      line(
        "anna-you-choose",
        "Anna",
        [CHUCKLE, "Dobre. ", PAUSE, "Vy vyberiete, Marek povie."],
        "OK. You choose, Marek says it.",
      ),
      line(
        "anna-first-word",
        "Anna",
        [
          "Prvé slovo: dievča. ",
          PAUSE,
          mark("Tá"),
          " dievča, alebo ",
          mark("to"),
          " dievča?",
        ],
        "First word: dievča, a girl. Tá dievča, or to dievča?",
      ),
      listenerPicks(
        line(
          "marek-what-do-you-think",
          "Marek",
          ["Hm", STOP, PAUSE, "Čo myslíte?"],
          "Hmm… What do you think?",
        ),
        {
          prompt: "Čo má Marek povedať?",
          choices: [
            { id: "ta", label: "Tá dievča", english: "that girl" },
            { id: "to", label: "To dievča", english: "that girl" },
          ],
          answerId: "to",
          judge: "Anna",
        },
      ),
      onPath(
        line(
          "marek-to-dievca",
          "Marek",
          [mark("To"), " dievča, hovoríte? ", PAUSE, "Dobre, verím vám."],
          "To dievča, you say? OK, I trust you.",
        ),
        { ask: `${PREFIX}marek-what-do-you-think`, picks: ["to"] },
      ),
      onPath(
        line(
          "marek-ta-dievca",
          "Marek",
          [mark("Tá"), " dievča, hovoríte? ", PAUSE, "Dobre, verím vám."],
          "Tá dievča, you say? OK, I trust you.",
        ),
        { ask: `${PREFIX}marek-what-do-you-think`, picks: ["ta"] },
      ),
      onPath(
        line(
          "marek-nobody-to-dievca",
          "Marek",
          ["Nikto nič? ", PAUSE, "Tak si vyberiem sám. ", PAUSE, mark("To"), " dievča."],
          "Nobody? Then I'll pick myself. To dievča.",
        ),
        { ask: `${PREFIX}marek-what-do-you-think`, picks: [NO_PICK] },
      ),
      onPath(
        line(
          "anna-dievca-right",
          "Anna",
          ["Správne! ", PAUSE, "Dievča je stredného rodu."],
          "Right! Dievča is neuter.",
        ),
        { ask: `${PREFIX}marek-what-do-you-think`, picks: ["to", NO_PICK] },
      ),
      onPath(line("marek-i-knew-it", "Marek", ["Vedel som to!"], "I knew it!"), {
        ask: `${PREFIX}marek-what-do-you-think`,
        picks: ["to"],
      }),
      onPath(
        line(
          "anna-you-asked-them",
          "Anna",
          [CHUCKLE, "Ty? Veď si sa ich pýtal."],
          "You? You asked them!",
        ),
        { ask: `${PREFIX}marek-what-do-you-think`, picks: ["to"] },
      ),
      onPath(
        line(
          "marek-know-it-myself",
          "Marek",
          [CHUCKLE, "Vidíte? Viem to aj sám."],
          "See? I know it by myself too.",
        ),
        { ask: `${PREFIX}marek-what-do-you-think`, picks: [NO_PICK] },
      ),
      onPath(
        line(
          "anna-dievca-wrong",
          "Anna",
          ["Nesprávne! ", PAUSE, "Dievča je stredného rodu: ", mark("to"), " dievča."],
          "Wrong! Dievča is neuter: to dievča.",
          { gestures: ["shake"] },
        ),
        { ask: `${PREFIX}marek-what-do-you-think`, picks: ["ta"] },
      ),
      onPath(
        line(
          "anna-who-told-you",
          "Anna",
          [CHUCKLE, "Marek, kto ti to poradil?"],
          "Marek, who told you that?",
        ),
        { ask: `${PREFIX}marek-what-do-you-think`, picks: ["ta"] },
      ),
      onPath(line("marek-they-did", "Marek", ["Oni!"], "They did!"), {
        ask: `${PREFIX}marek-what-do-you-think`,
        picks: ["ta"],
      }),
      {
        ...line(
          "anna-second-word",
          "Anna",
          [
            "No dobre. ",
            PAUSE,
            "Druhé slovo: deti. ",
            PAUSE,
            mark("Tie"),
            " deti, alebo ",
            mark("tí"),
            " deti?",
          ],
          "Alright. Second word: deti, children. Tie deti, or tí deti?",
        ),
        wait: BEAT_MS,
      },
      listenerPicks(
        line(
          "marek-tie-or-ti",
          "Marek",
          [
            mark("Tie"),
            " deti",
            STOP,
            PAUSE,
            "alebo ",
            mark("tí"),
            " deti? ",
            PAUSE,
            "Pomôžte mi!",
          ],
          "Tie deti… or tí deti? Help me!",
        ),
        {
          prompt: "Čo má Marek povedať?",
          choices: [
            { id: "tie", label: "Tie deti", english: "those children" },
            { id: "ti", label: "Tí deti", english: "those children" },
          ],
          answerId: "tie",
          judge: "Anna",
        },
      ),
      onPath(
        line(
          "marek-tie-deti",
          "Marek",
          [mark("Tie"), " deti, hovoríte? ", PAUSE, "Dobre, tak ", mark("tie"), " deti."],
          "Tie deti, you say? OK, tie deti then.",
        ),
        { ask: `${PREFIX}marek-tie-or-ti`, picks: ["tie"] },
      ),
      onPath(
        line(
          "marek-ti-deti",
          "Marek",
          [mark("Tí"), " deti, hovoríte? ", PAUSE, "Dobre, tak ", mark("tí"), " deti."],
          "Tí deti, you say? OK, tí deti then.",
        ),
        { ask: `${PREFIX}marek-tie-or-ti`, picks: ["ti"] },
      ),
      onPath(
        line(
          "marek-nothing-again",
          "Marek",
          ["Nikto? ", PAUSE, "Tak ", mark("tie"), " deti."],
          "Nobody? Then tie deti.",
        ),
        { ask: `${PREFIX}marek-tie-or-ti`, picks: [NO_PICK] },
      ),
      onPath(
        line(
          "anna-tie-right",
          "Anna",
          [
            "Správne! ",
            PAUSE,
            mark("Tie"),
            " deti. ",
            PAUSE,
            mark("Tí"),
            " je pre mužov a chlapcov.",
          ],
          "Right! Tie deti. Tí is for men and boys.",
        ),
        { ask: `${PREFIX}marek-tie-or-ti`, picks: ["tie", NO_PICK] },
      ),
      onPath(line("marek-yay", "Marek", ["Juchú!"], "Yay!"), {
        ask: `${PREFIX}marek-tie-or-ti`,
        picks: ["tie", NO_PICK],
      }),
      onPath(
        line(
          "anna-tie-wrong",
          "Anna",
          [
            "Nesprávne! ",
            PAUSE,
            mark("Tí"),
            " je pre mužov a chlapcov. ",
            PAUSE,
            "Ale ",
            mark("tie"),
            " deti.",
          ],
          "Wrong! Tí is for men and boys. But tie deti.",
          { gestures: ["shake"] },
        ),
        { ask: `${PREFIX}marek-tie-or-ti`, picks: ["ti"] },
      ),
      onPath(
        line(
          "anna-dont-listen-to-them",
          "Anna",
          [CHUCKLE, "Marek, nepočúvaj ich tak veľmi."],
          "Marek, don't listen to them so much.",
        ),
        { ask: `${PREFIX}marek-tie-or-ti`, picks: ["ti"] },
      ),
      onPath(
        line(
          "marek-my-helpers",
          "Marek",
          ["Ale veď sú to moji pomocníci!"],
          "But they're my helpers!",
        ),
        { ask: `${PREFIX}marek-tie-or-ti`, picks: ["ti"] },
      ),
      {
        ...line(
          "anna-last-sentence",
          "Anna",
          [
            "A posledná veta: poznám",
            STOP,
            PAUSE,
            mark("tohto"),
            " muža, alebo ",
            mark("tohoto"),
            " muža?",
          ],
          "And the last sentence: I know… tohto muža, or tohoto muža?",
        ),
        wait: BEAT_MS,
      },
      listenerPicks(
        line(
          "marek-so-helpers",
          "Marek",
          ["Ojoj, to je ťažké. ", PAUSE, "Tak čo, pomocníci?"],
          "Uh-oh, that's hard. So what, helpers?",
        ),
        {
          prompt: "Čo má Marek povedať?",
          choices: [
            { id: "tohto", label: "Poznám tohto muža", english: "I know this man" },
            { id: "tohoto", label: "Poznám tohoto muža", english: "I know this man" },
          ],
          answerId: "tohto",
          judge: "Anna",
        },
      ),
      onPath(
        line(
          "marek-tohto-muza",
          "Marek",
          [
            mark("Tohto"),
            " muža, hovoríte? ",
            PAUSE,
            "Dobre: poznám ",
            mark("tohto"),
            " muža.",
          ],
          "Tohto muža, you say? OK: I know this man.",
        ),
        { ask: `${PREFIX}marek-so-helpers`, picks: ["tohto"] },
      ),
      onPath(
        line(
          "marek-tohoto-muza",
          "Marek",
          [
            mark("Tohoto"),
            " muža, hovoríte? ",
            PAUSE,
            "Dobre: poznám ",
            mark("tohoto"),
            " muža.",
          ],
          "Tohoto muža, you say? OK: I know this man.",
        ),
        { ask: `${PREFIX}marek-so-helpers`, picks: ["tohoto"] },
      ),
      onPath(
        line(
          "marek-silence-tohto",
          "Marek",
          ["Ticho? ", PAUSE, "Dobre. Poznám ", mark("tohto"), " muža."],
          "Silence? OK. I know this man.",
        ),
        { ask: `${PREFIX}marek-so-helpers`, picks: [NO_PICK] },
      ),
      onPath(
        line(
          "anna-tohto-right",
          "Anna",
          ["Správne! ", PAUSE, mark("Tohto"), ". Tohoto je po česky."],
          "Right! Tohto. Tohoto is Czech.",
        ),
        { ask: `${PREFIX}marek-so-helpers`, picks: ["tohto", NO_PICK] },
      ),
      onPath(
        line(
          "anna-tohto-not-tohoto",
          "Anna",
          [
            "Skoro, ale nie celkom. ",
            PAUSE,
            "Tohoto je po česky. Po slovensky hovoríme ",
            mark("tohto"),
            ".",
          ],
          "Close, but not quite. Tohoto is Czech. In Slovak we say tohto.",
          { gestures: ["shake"] },
        ),
        { ask: `${PREFIX}marek-so-helpers`, picks: ["tohoto"] },
      ),
      onPath(
        line(
          "marek-that-czech",
          "Marek",
          ["Aha. ", PAUSE, "Tá čeština!"],
          "Oh. That Czech!",
        ),
        { ask: `${PREFIX}marek-so-helpers`, picks: ["tohoto"] },
      ),
      onPath(
        line(
          "marek-phew-hard",
          "Marek",
          ["Uf. ", PAUSE, "To bolo ťažké."],
          "Phew. That was hard.",
        ),
        { ask: `${PREFIX}marek-so-helpers`, picks: ["tohto", NO_PICK] },
      ),
      ...ending(
        { score: [3] },
        [
          "anna-three-of-three",
          ["Tri z troch! ", PAUSE, "Marek, to bol dobrý tím."],
          "Three out of three! Marek, that was a good team.",
        ],
        ["marek-thanks-helpers", ["Ďakujem, pomocníci!"], "Thank you, helpers!"],
      ),
      ...ending(
        { score: [2] },
        [
          "anna-two-of-three",
          ["Dve z troch. ", PAUSE, "Jeden pomocník asi nedával pozor."],
          "Two out of three. One helper probably wasn't paying attention.",
        ],
        [
          "marek-thanks-that-one-too",
          [CHUCKLE, "Ďakujem aj tomu, čo nedával pozor."],
          "Thanks to the one who wasn't paying attention too.",
        ],
      ),
      ...ending(
        { score: [1] },
        [
          "anna-one-of-three",
          ["Jedna z troch. ", PAUSE, "Hm", STOP, PAUSE, "Marek, nabudúce sa spýtaj mňa."],
          "One out of three. Hmm… Marek, next time ask me.",
        ],
        [
          "marek-thanks-anyway",
          [CHUCKLE, "Aj tak ďakujem, pomocníci."],
          "Thanks anyway, helpers.",
        ],
      ),
      ...ending(
        { score: [0] },
        [
          "anna-none-of-three",
          ["Nula z troch! ", PAUSE, CHUCKLE, "Marek, dnes ťa pomocníci nezachránili."],
          "Zero out of three! Marek, the helpers didn't save you today.",
        ],
        ["marek-on-purpose", ["Oni to urobili naschvál!"], "They did it on purpose!"],
      ),
      ...ending(
        { unaided: true },
        [
          "anna-all-by-yourself",
          ["Tri z troch. ", PAUSE, "A úplne sám!"],
          "Three out of three. And all by yourself!",
        ],
        [
          "marek-no-helpers-needed",
          [CHUCKLE, "Vidíš? Pomocníkov nepotrebujem."],
          "See? I don't need helpers.",
        ],
      ),
    ],
    QUIZ_ACTS,
  ),
  checks: [
    {
      id: `${PREFIX}check-tie-deti`,
      gap: "___ deti",
      prompt: "Ktoré slovo ide k slovu deti?",
      promptEnglish: "Which word goes with deti?",
      choices: [
        { id: "tie", label: "tie" },
        {
          id: "ti",
          label: "tí",
          whyWrong:
            "Anna says **tí** is for men and boys: **tí muži**. Children take **tie**.",
        },
        {
          id: "to",
          label: "to",
          whyWrong:
            "**To** is for one neuter thing, like **to dievča**. **Deti** is plural.",
        },
      ],
      answerId: "tie",
      feedback: {
        english: "Those children.",
        why: "Anna says **tí je pre mužov a chlapcov**, so children take **tie**.",
      },
    },
    {
      id: `${PREFIX}check-tohto`,
      gap: "Poznám ___ muža.",
      prompt: "Ako sa to povie po slovensky?",
      promptEnglish: "How do you say it in Slovak?",
      replayLineId: `${PREFIX}anna-tohto-right`,
      choices: [
        { id: "tohto", label: "tohto" },
        {
          id: "tohoto",
          label: "tohoto",
          whyWrong: "**Tohoto** is the Czech form. Slovak drops the middle o: **tohto**.",
        },
        {
          id: "tato",
          label: "táto",
          whyWrong: "**Táto** is feminine; **muž** is masculine.",
        },
      ],
      answerId: "tohto",
      feedback: {
        english: "I know this man.",
        why: "Anna says **tohoto je po česky**: in Slovak it is **tohto**.",
      },
    },
  ],
};

const OUTRO_ACTS: Record<string, Cue[]> = {
  "marek-where-are-those-keys": [{ do: "shrug", on: "kde" }],
  "anna-marek": [{ do: "facepalm", on: "marek" }],
};

const outro: ListeningChapter = {
  id: `${PREFIX}outro`,
  titleSk: "Záver",
  title: "That's all for today",
  lines: staged(
    PREFIX,
    [
      line(
        "marek-thats-all",
        "Marek",
        [mark("To"), " je všetko na dnes."],
        "That's all for today.",
      ),
      line(
        "anna-thanks-for-listening",
        "Anna",
        ["Ďakujeme, že počúvate."],
        "Thank you for listening.",
      ),
      line("marek-take-care", "Marek", ["Majte sa pekne!"], "Take care!"),
      line("anna-bye", "Anna", ["Ahojte!"], "Bye!"),
      line(
        "marek-where-are-those-keys",
        "Marek",
        ["Anna? ", PAUSE, "Kde sú ", mark("tie"), " kľúče?"],
        "Anna? Where are those keys?",
      ),
      line("anna-marek", "Anna", [SIGH, "Marek!"], "Marek!"),
    ],
    OUTRO_ACTS,
  ),
  checks: [
    {
      id: `${PREFIX}check-goodbye`,
      prompt: "Ako sa Anna lúči?",
      promptEnglish: "How does Anna say goodbye?",
      replayLineId: `${PREFIX}anna-bye`,
      choices: [
        { id: "ahojte", label: "Ahojte!" },
        {
          id: "good-night",
          label: "Dobrú noc!",
          whyWrong: "**Dobrú noc** is good night, for bedtime.",
        },
        {
          id: "good-day",
          label: "Dobrý deň!",
          whyWrong: "**Dobrý deň** is the formal hello, not a goodbye.",
        },
      ],
      answerId: "ahojte",
      feedback: {
        english: "Bye!",
        why: "**Ahojte** is the friendly bye to more than one person: all the listeners.",
      },
    },
    {
      id: `${PREFIX}check-lost-again`,
      prompt: "Čo hľadá Marek úplne na konci?",
      promptEnglish: "What is Marek looking for at the very end?",
      replayLineId: `${PREFIX}marek-where-are-those-keys`,
      choices: [
        { id: "keys", label: "Kľúče." },
        {
          id: "apple",
          label: "Jablko.",
          whyWrong:
            "**Jablko** is an apple, from the bag game. Now Marek asks **kde sú tie kľúče?**",
        },
        {
          id: "bag",
          label: "Tašku.",
          whyWrong:
            "**Tašku** is a bag. The keys were in one at home; now Marek asks **kde sú tie kľúče?**",
        },
      ],
      answerId: "keys",
      feedback: {
        english: "Anna? Where are those keys?",
        why: "**Kľúče** are things, so **tie kľúče**. Only masculine nouns for people take **tí**: **tí muži**.",
      },
    },
  ],
};

export const demonstrativesEpisode: ListeningEpisode = {
  id: "listening/demonstratives",
  slug: "demonstratives",
  number: 1,
  level: "A1–A2",
  titleSk: "Kde je ten kľúč?",
  title: "Where is that key?",
  topic: "ten, tá, to",
  promise:
    "Anna and Marek play a guessing game, shop at the market and lose the car key. At the end, Marek needs your help.",
  grammarSlug: "demonstratives",
  lessonId: "grammar/demonstratives",
  practiceSetId: "demonstratives",
  speakers: ["Anna", "Marek", "Lucia"],
  vocabulary: [
    { slovak: "kľúč", english: "key" },
    { slovak: "kniha", english: "book" },
    { slovak: "jablko", english: "apple" },
    { slovak: "syr", english: "cheese" },
    { slovak: "jahody", english: "strawberries" },
    { slovak: "Čo je to?", english: "What is it?" },
  ],
  chapters: [intro, bag, market, home, quiz, outro],
};
