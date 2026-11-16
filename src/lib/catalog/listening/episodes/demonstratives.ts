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
      "anna-recording-at-market",
      "Anna",
      ["Dobre, dobre. ", PAUSE, "Dnes nahrávame na trhu. Poďme!"],
      "OK, OK. Today we're recording at the market. Let's go!",
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
            "**Jedlo** is food. Strawberries turn up at the market, but the topic is **ten, tá, to**.",
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

const MARKET_ACTS: Record<string, Cue[]> = {
  "marek-how-much-this-cheese": [{ do: "point", to: "syr#near", on: "tento" }],
  "lucia-this-cheese-five": [{ do: "point", to: "syr#near", on: "Tento" }],
  "marek-and-that-cheese": [{ do: "point", to: "syr#far", on: "tamten" }],
  "lucia-that-one-cheaper": [{ do: "point", to: "syr#far", on: "Tamten" }],
  // Lucia fetches one from the far end of her counter and brings it to his end to hand over.
  "marek-ill-take-that-one": [
    { who: "lucia", do: "go", to: "counter-far", on: "start" },
    { do: "point", to: "syr#far", on: "tamten" },
    { who: "lucia", do: "take", what: "cheese", on: "tamten" },
    { who: "lucia", do: "go", to: "counter-near", on: "end" },
  ],
  "anna-want-these-strawberries": [
    { who: "lucia", do: "give", what: "cheese", to: "marek", on: "start" },
    { do: "point", to: "jahody#near", on: "tieto" },
  ],
  "lucia-strawberries-from": [
    { do: "point", to: "jahody#near", on: "Tieto" },
    { do: "point", to: "jahody#far", on: "Tamtie" },
  ],
  "anna-those-please": [{ do: "point", to: "jahody#far", on: "tamtie" }],
  // Marek is at the stall, between them: the basket comes to Anna through his hands.
  "lucia-here-you-are": [
    { do: "take", what: "basket", on: "before" },
    { do: "give", what: "basket", to: "marek", on: "páči" },
  ],
  "marek-anna-always-slovak": [
    { do: "give", what: "basket", to: "anna", on: "start" },
    { do: "point", to: "jahody#far", on: "slovenské" },
  ],
};

const market: ListeningChapter = {
  id: `${PREFIX}market`,
  stage: "market",
  // Marek buys first, so he stands at the counter, across from Lucia.
  cast: ["Anna", "Marek", "Lucia"],
  titleSk: "Na trhu",
  title: "At the market: this one or that one?",
  setup: {
    objects: [
      { id: "basket", kind: "basket", start: { where: { on: "counter", dx: -12 } } },
      // The front one of tamten's pile at the counter's far end (StickSet draws the pile).
      { id: "cheese", kind: "cheese", start: { where: { on: "counter", dx: 38 } } },
    ],
    spots: { lucia: "behind-counter", marek: "stall", anna: "aside" },
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
      line(
        "anna-how-much-altogether",
        "Anna",
        ["Koľko to bude spolu?"],
        "How much is that altogether?",
        { to: "Lucia" },
      ),
      line("lucia-eight-euros", "Lucia", ["Osem eur, prosím."], "Eight euros, please."),
      line(
        "anna-thanks-goodbye",
        "Anna",
        ["Ďakujeme, dovidenia!"],
        "Thank you, goodbye!",
      ),
      line("lucia-goodbye", "Lucia", ["Dovidenia!"], "Goodbye!"),
      // His car waits at Anna's, which is why his key is wanted there.
      line(
        "marek-to-yours-car",
        "Marek",
        ["Tak poďme k tebe. ", PAUSE, "Moje auto stojí pred tvojím domom."],
        "Let's go to yours, then. My car is parked in front of your building.",
        { to: "Anna" },
      ),
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
  // The key is in the bag by the window; Marek takes her to mean the one by them.
  "anna-in-that-bag": [{ do: "point", to: "taska#far", on: "tej" }],
  "marek-in-this-one": [{ do: "point", to: "taska#near", on: "tejto" }],
  "anna-in-that-one-window": [
    // He sets off on tamtej, so the key is in his hand by the time she has named the window.
    { who: "marek", do: "go", to: "window-bag", on: "tamtej" },
    { do: "point", to: "taska#far", on: "tamtej" },
    { do: "point", to: "okno", on: "okne" },
  ],
  // At the bag by the window he finds the key before he says so; from there he sees the man outside.
  "marek-got-it-who-is-man": [
    { do: "take", what: "keys", on: "before" },
    { do: "raise", what: "keys", on: "ho" },
    { do: "point", to: "muz", on: "muž" },
  ],
  // She joins him at the window to look out at Mr Novák with him.
  "anna-neighbour-you-know-him": [
    { who: "anna", do: "go", to: "marek", on: "start" },
    { do: "point", to: "muz", on: "muža" },
  ],
  "marek-who-is-that-woman": [{ do: "point", to: "zena", on: "žena" }],
  "anna-dont-lose-this-key": [{ do: "point", to: "keys", on: "kľúč" }],
  "marek-back-to-studio": [{ do: "pocket", what: "keys", on: "späť" }],
};

const home: ListeningChapter = {
  id: `${PREFIX}home`,
  stage: "home",
  titleSk: "Doma",
  title: "The lost car key",
  setup: {
    objects: [
      { id: "window-bag", kind: "stash", start: { where: { on: "window-bag", dx: 0 } } },
      { id: "keys", kind: "keys", start: { where: { in: "window-bag" } } },
    ],
    // Marek nearer the bag by the door, so he asks "v tejto?" of the one by him; neither stands in front of it.
    spots: { anna: "rug-right", marek: "rug-mid" },
  },
  lines: staged(
    PREFIX,
    [
      line(
        "anna-now-at-home",
        "Anna",
        ["A teraz sme u mňa doma."],
        "And now we're at my place.",
      ),
      line(
        "marek-where-is-key",
        "Marek",
        ["Anna, kde je ", mark("ten"), " malý kľúč? ", PAUSE, "Nikde ho nevidím."],
        "Anna, where is that small key? I can't see it anywhere.",
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
        ["To je môj sused, pán Novák. ", PAUSE, "Veď ", mark("toho"), " muža poznáš!"],
        "That's my neighbour, Mr Novák. Come on, you know that man!",
      ),
      line(
        "marek-who-is-that-woman",
        "Marek",
        ["Jasné, pán Novák! ", PAUSE, "A kto je ", mark("tá"), " žena pri ňom?"],
        "Of course, Mr Novák! And who is that woman next to him?",
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
        [
          "Aha, ",
          mark("tú"),
          " ženu poznám z obchodu. ",
          PAUSE,
          mark("Tí"),
          " ľudia sú naozaj milí.",
        ],
        "Oh, I know that woman from the shop. Those people are really nice.",
      ),
      line(
        "anna-dont-lose-this-key",
        "Anna",
        ["Áno. A ", mark("tento"), " kľúč už nestrácaj!"],
        "Yes. And don't lose this key again!",
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
      gap: "Veď ___ muža poznáš!",
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
        english: "Come on, you know that man!",
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

const quiz: ListeningChapter = {
  id: `${PREFIX}quiz`,
  titleSk: "Pomôžte Marekovi",
  title: "Your game: help Marek pick the word",
  lines: staged(
    PREFIX,
    [
      line(
        "anna-now-test-for-you",
        "Anna",
        [
          "Tak, sme späť v štúdiu. ",
          PAUSE,
          "A teraz malá skúška pre teba, Marek: ",
          PAUSE,
          mark("ten"),
          ", ",
          mark("tá"),
          ", ",
          mark("to"),
          ".",
        ],
        "So, we're back in the studio. And now a little test for you, Marek: ten, tá, to.",
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
            " patrí k slovám muži, chlapci, ľudia.",
          ],
          "Right! Tie deti. Tí belongs to words like muži, chlapci, ľudia.",
        ),
        { ask: `${PREFIX}marek-tie-or-ti`, picks: ["tie", NO_PICK] },
      ),
      onPath(line("marek-yay", "Marek", ["Juchú!"], "Yay!", { gestures: ["cheer"] }), {
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
            " patrí k slovám muži, chlapci, ľudia. ",
            PAUSE,
            "Ale ",
            mark("tie"),
            " deti.",
          ],
          "Wrong! Tí belongs to words like muži, chlapci, ľudia. But tie deti.",
          { gestures: ["shake"] },
        ),
        { ask: `${PREFIX}marek-tie-or-ti`, picks: ["ti"] },
      ),
      onPath(
        line(
          "anna-dont-listen-to-them",
          "Anna",
          [CHUCKLE, "Ale Marek. ", PAUSE, "Nepočúvaj ich tak veľmi."],
          "Oh, Marek. Don't listen to them so much.",
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
            mark("toho"),
            " muža, alebo ",
            mark("ten"),
            " muž?",
          ],
          "And the last sentence: I know… toho muža, or ten muž?",
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
            { id: "toho", label: "Poznám toho muža", english: "I know that man" },
            { id: "ten", label: "Poznám ten muž", english: "I know that man" },
          ],
          answerId: "toho",
          judge: "Anna",
        },
      ),
      onPath(
        line(
          "marek-toho-muza",
          "Marek",
          [
            mark("Toho"),
            " muža, hovoríte? ",
            PAUSE,
            "Dobre: poznám ",
            mark("toho"),
            " muža.",
          ],
          "Toho muža, you say? OK: I know that man.",
        ),
        { ask: `${PREFIX}marek-so-helpers`, picks: ["toho"] },
      ),
      onPath(
        line(
          "marek-ten-muz",
          "Marek",
          ["Ten muž, hovoríte? ", PAUSE, "Dobre: poznám ten muž."],
          "Ten muž, you say? OK: I know that man. (Wrong form: it should be toho muža.)",
        ),
        { ask: `${PREFIX}marek-so-helpers`, picks: ["ten"] },
      ),
      onPath(
        line(
          "marek-silence-toho",
          "Marek",
          ["Ticho? ", PAUSE, "Dobre. Poznám ", mark("toho"), " muža."],
          "Silence? OK. I know that man.",
        ),
        { ask: `${PREFIX}marek-so-helpers`, picks: [NO_PICK] },
      ),
      onPath(
        line(
          "anna-toho-right",
          "Anna",
          ["Správne! ", PAUSE, "Poznám koho? ", mark("Toho"), " muža."],
          "Right! I know whom? Toho muža.",
        ),
        { ask: `${PREFIX}marek-so-helpers`, picks: ["toho", NO_PICK] },
      ),
      onPath(
        line(
          "anna-toho-not-ten",
          "Anna",
          [
            "Skoro, ale nie celkom. ",
            PAUSE,
            mark("Ten"),
            " muž stojí vonku. Ale poznám ",
            mark("toho"),
            " muža.",
          ],
          "Close, but not quite. Ten muž is standing outside. But poznám toho muža.",
          { gestures: ["shake"] },
        ),
        { ask: `${PREFIX}marek-so-helpers`, picks: ["ten"] },
      ),
      onPath(
        line(
          "marek-like-mr-novak",
          "Marek",
          ["Aha. ", PAUSE, "Ako pán Novák: ", mark("toho"), " muža poznám."],
          "Oh. Like Mr Novák: toho muža poznám.",
        ),
        { ask: `${PREFIX}marek-so-helpers`, picks: ["ten"] },
      ),
      onPath(
        line(
          "marek-phew-hard",
          "Marek",
          ["Uf. ", PAUSE, "To bolo ale ťažké."],
          "Phew. That really was hard.",
        ),
        { ask: `${PREFIX}marek-so-helpers`, picks: ["toho", NO_PICK] },
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
          [CHUCKLE, "No nič. ", PAUSE, "Aj tak ďakujem, pomocníci."],
          "Oh well. Thanks anyway, helpers.",
        ],
      ),
      ...ending(
        { score: [0] },
        [
          "anna-none-of-three",
          [CHUCKLE, "Nula z troch! ", PAUSE, "Marek, dnes ťa pomocníci nezachránili."],
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
    { "anna-now-test-for-you": [{ do: "nod", on: "skúška" }] },
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
        why: "Anna says **tí** goes with words like **muži, chlapci, ľudia**; children take **tie**.",
      },
    },
    {
      id: `${PREFIX}check-to-dievca`,
      gap: "___ dievča",
      prompt: "Ktoré slovo ide k slovu dievča?",
      promptEnglish: "Which word goes with dievča?",
      replayLineId: `${PREFIX}anna-first-word`,
      choices: [
        { id: "to", label: "to" },
        {
          id: "ta",
          label: "tá",
          whyWrong:
            "**Tá** is feminine, as in **tá žena**. **Dievča** means a girl, but the word is neuter.",
        },
        {
          id: "ten",
          label: "ten",
          whyWrong: "**Ten** is masculine, as in **ten muž**.",
        },
      ],
      answerId: "to",
      feedback: {
        english: "That girl.",
        why: "Anna says **dievča je stredného rodu**: it is neuter, so **to dievča**.",
      },
    },
  ],
};

const OUTRO_ACTS: Record<string, Cue[]> = {
  "marek-where-is-that-key": [{ do: "shrug", on: "Kde" }],
  "anna-in-your-pocket": [{ do: "facepalm", on: "Marek" }],
  // He put it in his pocket at home, on "späť".
  // The keys are up in his hand while he says "v tomto vrecku", not after it.
  "marek-in-this-pocket": [
    { do: "pat", on: "start" },
    { do: "take", what: "keys", on: "Aha" },
    { do: "raise", what: "keys", on: "tomto" },
  ],
};

const outro: ListeningChapter = {
  id: `${PREFIX}outro`,
  titleSk: "Záver",
  title: "That's all for today",
  setup: {
    objects: [{ id: "keys", kind: "keys", start: { where: { pocket: "marek" } } }],
  },
  lines: staged(
    PREFIX,
    [
      line(
        "marek-thats-all",
        "Marek",
        ["Tak, ", mark("to"), " je na dnes všetko."],
        "So, that's all for today.",
      ),
      line(
        "anna-thanks-for-listening",
        "Anna",
        ["Ďakujeme, že počúvate."],
        "Thank you for listening.",
      ),
      line("marek-take-care", "Marek", ["Majte sa pekne!"], "Take care!"),
      line("anna-bye", "Anna", ["Ahojte!"], "Bye!"),
      {
        ...line(
          "marek-where-is-that-key",
          "Marek",
          ["Anna? ", PAUSE, "Kde je ", mark("ten"), " kľúč?"],
          "Anna? Where is that key?",
        ),
        wait: 1000,
      },
      line(
        "anna-in-your-pocket",
        "Anna",
        [SIGH, "Marek! ", PAUSE, "Je v tvojom vrecku."],
        "Marek! It's in your pocket.",
      ),
      line(
        "marek-in-this-pocket",
        "Marek",
        [CHUCKLE, "Aha. ", PAUSE, "V ", mark("tomto"), " vrecku."],
        "Oh. In this pocket.",
      ),
      line(
        "anna-now-really-bye",
        "Anna",
        [CHUCKLE, "Tak. ", PAUSE, "A teraz už naozaj ahojte!"],
        "Right. And now really, bye!",
      ),
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
      id: `${PREFIX}check-key-in-pocket`,
      prompt: "Kde je kľúč úplne na konci?",
      promptEnglish: "Where is the key at the very end?",
      replayLineId: `${PREFIX}anna-in-your-pocket`,
      choices: [
        { id: "pocket", label: "V Marekovom vrecku." },
        {
          id: "bag",
          label: "V taške pri okne.",
          whyWrong:
            "**V taške pri okne** was at home. Marek put the key in his pocket there, and Anna says **je v tvojom vrecku**.",
        },
        {
          id: "desk",
          label: "Na stole.",
          whyWrong:
            "**Na stole** means on the desk. Anna says **je v tvojom vrecku**, in your pocket.",
        },
      ],
      answerId: "pocket",
      feedback: {
        english: "Marek! It's in your pocket.",
        why: "Anna says **je v tvojom vrecku**, and Marek finds it: **v tomto vrecku**.",
      },
    },
  ],
};

export const demonstrativesEpisode: ListeningEpisode = {
  id: "listening/demonstratives",
  cover: { segment: "Doma", atMs: 21000 },
  slug: "demonstratives",
  number: 1,
  level: "A1–A2",
  titleSk: "Kde je ten kľúč?",
  title: "Where is that key?",
  topic: "Demonstratives",
  promise:
    "Anna and Marek shop at the market and lose the car key at home. Back in the studio, Marek needs your help with the little words.",
  grammarSlug: "demonstratives",
  lessonId: "grammar/demonstratives",
  practiceSetId: "demonstratives",
  speakers: ["Anna", "Marek", "Lucia"],
  vocabulary: [
    { slovak: "kľúč", english: "key" },
    { slovak: "syr", english: "cheese" },
    { slovak: "jahody", english: "strawberries" },
  ],
  chapters: [intro, market, home, quiz, outro],
};
