import { markedText, type MarkedPart } from "$lib/learning/marked-text";
import type { DialogueTurn } from "$lib/learning/types";
import type { ListeningChapter, ListeningEpisode } from "../types";

const PREFIX = "podcast-demonstratives-";

/** A beat of silence in the clip, where the speaker thinks or lets a clue sink in; not shown in the text. */
const PAUSE = { tag: "pause" } as const;
/** First in a line: said slowly, as Marek gives a clue for Anna to guess from. */
const SLOWLY = { tag: "slowly" } as const;

type Part = string | { demonstrative: string } | typeof PAUSE | typeof SLOWLY;

function line(
  id: string,
  speaker: string,
  parts: Part[],
  english: string,
  /** What the speaker holds per sentence on `/dev/scenes`, where the words would pick wrong. */
  props?: DialogueTurn["props"],
  /** Who it is said to, when that is not who it replies to. */
  to?: string,
): DialogueTurn {
  const marked = markedText(
    parts.flatMap((part): MarkedPart[] =>
      typeof part === "string"
        ? [part]
        : "tag" in part
          ? []
          : [{ role: "demonstrative", text: part.demonstrative }],
    ),
  );
  // Eleven v4 takes [pause] inside a line; at its start or end it makes next to no silence.
  const said = parts
    .map((part) =>
      typeof part === "string"
        ? part
        : "tag" in part
          ? `[${part.tag}] `
          : part.demonstrative,
    )
    .join("");

  return {
    id: `${PREFIX}${id}`,
    speaker,
    slovak: marked.text,
    marks: marked.marks,
    english,
    ...(said !== marked.text ? { audio: { transcript: said } } : {}),
    ...(props ? { props } : {}),
    ...(to ? { to } : {}),
  };
}

/** Anna only guesses: the thing is still in Marek's bag, so none of her `sentences` brings it out. */
function guess(sentences: number): null[] {
  return Array.from({ length: sentences }, () => null);
}

const intro: ListeningChapter = {
  id: `${PREFIX}intro`,
  titleSk: "Úvod",
  title: "Hello from the studio",
  lines: [
    line(
      "anna-this-is-podcast",
      "Anna",
      ["Ahojte! ", { demonstrative: "Toto" }, " je podcast Slovak Wiki. Ja som Anna."],
      "Hi! This is the Slovak Wiki podcast. I'm Anna.",
    ),
    line("marek-i-am-marek", "Marek", ["A ja som Marek. Ahojte!"], "And I'm Marek. Hi!"),
    line(
      "anna-small-topic",
      "Anna",
      [
        "Dnes máme malú tému: ",
        { demonstrative: "ten" },
        ", ",
        { demonstrative: "tá" },
        ", ",
        { demonstrative: "to" },
        ".",
      ],
      "Today we have a small topic: ten, tá, to.",
    ),
    line(
      "marek-not-small",
      "Marek",
      ["Malú? ", PAUSE, { demonstrative: "To" }, " nie je malá téma, Anna!"],
      "Small? That's not a small topic, Anna!",
    ),
    line(
      "anna-lets-go",
      "Anna",
      ["Dobre, dobre. Ideme na ", { demonstrative: "to" }, "!"],
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

const bag: ListeningChapter = {
  id: `${PREFIX}bag`,
  titleSk: "Čo je to?",
  title: "The bag game",
  lines: [
    line(
      "marek-bag-three-things",
      "Marek",
      ["Anna, mám tu tašku. V taške sú tri veci."],
      "Anna, I have a bag here. There are three things in the bag.",
    ),
    line(
      "anna-what-is-it",
      "Anna",
      ["Dobre. Čo je ", { demonstrative: "to" }, "?"],
      "OK. What is it?",
    ),
    line(
      "marek-small-opens-doors",
      "Marek",
      [
        SLOWLY,
        "Prvá vec. ",
        PAUSE,
        "Je ",
        { demonstrative: "to" },
        " malé… ",
        PAUSE,
        "a otvára dvere.",
      ],
      "First thing. It's small… and it opens doors.",
    ),
    line(
      "anna-its-a-key",
      "Anna",
      ["Hm… ", PAUSE, { demonstrative: "to" }, " je kľúč!"],
      "Hmm… it's a key!",
      guess(2),
    ),
    line(
      "marek-car-key",
      "Marek",
      ["Áno! ", { demonstrative: "Ten" }, " kľúč je od auta."],
      "Yes! That key is for the car.",
    ),
    line(
      "anna-what-is-this",
      "Anna",
      ["A čo je ", { demonstrative: "toto" }, "?"],
      "And what is this?",
    ),
    line(
      "marek-heavy-pages",
      "Marek",
      [
        SLOWLY,
        "Je ",
        { demonstrative: "to" },
        " žlté… ",
        PAUSE,
        "je ",
        { demonstrative: "to" },
        " ťažké… ",
        PAUSE,
        "a vnútri sú strany.",
      ],
      "It's yellow… it's heavy… and there are pages inside.",
      ["bag"],
    ),
    line(
      "anna-its-a-book",
      "Anna",
      ["Žlté a ťažké… ", PAUSE, "je ", { demonstrative: "to" }, " kniha?"],
      "Yellow and heavy… is it a book?",
      guess(2),
    ),
    line(
      "marek-dictionary",
      "Marek",
      ["Áno, ", { demonstrative: "tá" }, " žltá kniha je slovník."],
      "Yes, that yellow book is a dictionary.",
    ),
    line(
      "anna-third-thing",
      "Anna",
      [
        { demonstrative: "Tá" },
        " kniha je veľká! A ",
        { demonstrative: "tá" },
        " tretia vec?",
      ],
      "That book is big! And that third thing?",
    ),
    line(
      "marek-green-sweet",
      "Marek",
      [
        SLOWLY,
        "Je ",
        { demonstrative: "to" },
        " zelené… ",
        PAUSE,
        "a je ",
        { demonstrative: "to" },
        " sladké.",
      ],
      "It's green… and it's sweet.",
      ["bag"],
    ),
    line(
      "anna-apple",
      "Anna",
      ["Zelené a sladké… ", PAUSE, "jablko! ", { demonstrative: "To" }, " je jablko."],
      "Green and sweet… an apple! It's an apple.",
      guess(3),
    ),
    line(
      "marek-apple-for-you",
      "Marek",
      ["Presne. A ", { demonstrative: "to" }, " jablko je pre teba."],
      "Exactly. And that apple is for you.",
    ),
    line(
      "anna-podcast-has-food",
      "Anna",
      ["Ďakujem! ", { demonstrative: "Tento" }, " podcast má aj jedlo."],
      "Thanks! This podcast even has food.",
    ),
    line(
      "marek-lets-go-to-market",
      "Marek",
      ["A teraz poďme na trh!"],
      "And now let's go to the market!",
    ),
  ],
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
            "**Kniha** is a book, the second thing: yellow, heavy, with pages inside.",
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

const market: ListeningChapter = {
  id: `${PREFIX}market`,
  stage: "market",
  titleSk: "Na trhu",
  title: "At the market: this one or that one?",
  lines: [
    line(
      "anna-now-at-market",
      "Anna",
      ["Teraz sme na trhu. Marek, čo kupuješ?"],
      "Now we're at the market. Marek, what are you buying?",
    ),
    line(
      "marek-how-much-this-cheese",
      "Marek",
      ["Syr. ", PAUSE, "Dobrý deň! Koľko stojí ", { demonstrative: "tento" }, " syr?"],
      "Cheese. Hello! How much is this cheese?",
      undefined,
      // The one word answers Anna; the greeting and the question are for Lucia at her stall.
      "Lucia",
    ),
    line(
      "lucia-this-cheese-five",
      "Lucia",
      [{ demonstrative: "Tento" }, " syr stojí päť eur."],
      "This cheese costs five euros.",
    ),
    line(
      "marek-and-that-cheese",
      "Marek",
      ["Aha. ", PAUSE, "A ", { demonstrative: "tamten" }, " syr?"],
      "I see. And that cheese over there?",
    ),
    line(
      "lucia-that-one-cheaper",
      "Lucia",
      [{ demonstrative: "Tamten" }, " je lacnejší. Stojí tri eurá."],
      "That one over there is cheaper. It costs three euros.",
    ),
    line(
      "marek-ill-take-that-one",
      "Marek",
      ["Dobre, ", PAUSE, "dám si ", { demonstrative: "tamten" }, "."],
      "OK, I'll take that one over there.",
    ),
    line(
      "anna-want-these-strawberries",
      "Anna",
      ["A ja chcem ", { demonstrative: "tieto" }, " jahody."],
      "And I want these strawberries.",
    ),
    line(
      "lucia-strawberries-from",
      "Lucia",
      [
        { demonstrative: "Tieto" },
        " jahody sú z Rakúska. ",
        { demonstrative: "Tamtie" },
        " sú zo Slovenska.",
      ],
      "These strawberries are from Austria. Those over there are from Slovakia.",
    ),
    line(
      "anna-those-please",
      "Anna",
      ["Tak ", { demonstrative: "tamtie" }, ", prosím."],
      "Those over there, then, please.",
    ),
    line("lucia-here-you-are", "Lucia", ["Nech sa páči."], "Here you are.", ["basket"]),
    line(
      "marek-anna-always-slovak",
      "Marek",
      ["Anna vždy kupuje slovenské jahody."],
      "Anna always buys Slovak strawberries.",
    ),
    line("anna-lets-go-home", "Anna", ["Dobre. Poďme domov!"], "OK. Let's go home!"),
  ],
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

const home: ListeningChapter = {
  id: `${PREFIX}home`,
  stage: "home",
  titleSk: "Doma",
  title: "The lost car key",
  lines: [
    line("anna-now-at-home", "Anna", ["A teraz sme doma."], "And now we're at home."),
    line(
      "marek-where-is-key",
      "Marek",
      ["Anna, kde je ", { demonstrative: "ten" }, " malý kľúč?"],
      "Anna, where is that small key?",
      [null],
    ),
    line(
      "anna-car-or-flat",
      "Anna",
      [
        "Ktorý? ",
        { demonstrative: "Ten" },
        " od auta alebo ",
        { demonstrative: "ten" },
        " od bytu?",
      ],
      "Which one? The car one or the flat one?",
    ),
    line(
      "marek-the-car-one",
      "Marek",
      [{ demonstrative: "Ten" }, " od auta."],
      "The car one.",
      [null],
    ),
    line(
      "anna-in-that-bag",
      "Anna",
      ["Je v ", { demonstrative: "tej" }, " taške."],
      "It's in that bag.",
    ),
    line(
      "marek-in-this-one",
      "Marek",
      ["V ", { demonstrative: "tejto" }, "?"],
      "In this one?",
    ),
    line(
      "anna-in-that-one-window",
      "Anna",
      [
        "Nie, v ",
        { demonstrative: "tamtej" },
        ". Pri ",
        { demonstrative: "tom" },
        " okne.",
      ],
      "No, in that one over there. By that window.",
    ),
    line(
      "marek-got-it-who-is-man",
      "Marek",
      ["Aha, mám ho. ", PAUSE, "A kto je ", { demonstrative: "ten" }, " muž vonku?"],
      "Got it. And who is that man outside?",
      ["keys"],
    ),
    line(
      "anna-neighbour-you-know-him",
      "Anna",
      [
        { demonstrative: "To" },
        " je náš sused, pán Novák. ",
        { demonstrative: "Toho" },
        " muža poznáš.",
      ],
      "That's our neighbour, Mr Novák. You know that man.",
    ),
    line(
      "marek-with-that-woman",
      "Marek",
      ["Áno! Ide s ", { demonstrative: "tou" }, " ženou z obchodu."],
      "Yes! He's walking with that woman from the shop.",
    ),
    line(
      "anna-his-sister",
      "Anna",
      [{ demonstrative: "To" }, " je jeho sestra."],
      "That's his sister.",
    ),
    line(
      "marek-those-people-nice",
      "Marek",
      [{ demonstrative: "Tí" }, " ľudia sú milí."],
      "Those people are nice.",
    ),
    line(
      "anna-dont-lose-these-keys",
      "Anna",
      ["Áno. A ", { demonstrative: "tieto" }, " kľúče už nestrácaj!"],
      "Yes. And don't lose these keys again!",
      [null, null],
    ),
    line(
      "marek-back-to-studio",
      "Marek",
      ["Nebudem. Poďme späť do štúdia!"],
      "I won't. Let's go back to the studio!",
    ),
  ],
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

const quiz: ListeningChapter = {
  id: `${PREFIX}quiz`,
  titleSk: "Správne alebo nesprávne?",
  title: "Right or wrong? Marek takes the test",
  lines: [
    line(
      "anna-right-or-wrong",
      "Anna",
      ["A teraz hra: správne alebo nesprávne?"],
      "And now a game: right or wrong?",
    ),
    line(
      "marek-first-sentence",
      "Marek",
      ["Dobre. Prvá veta: ", PAUSE, { demonstrative: "Tá" }, " dievča je moja sestra."],
      "OK. First sentence: Tá dievča je moja sestra. (Wrong on purpose.)",
    ),
    line(
      "anna-dievca-neuter",
      "Anna",
      [
        "Nesprávne! ",
        PAUSE,
        "Dievča je stredný rod: ",
        { demonstrative: "to" },
        " dievča.",
      ],
      "Wrong! Dievča is neuter: to dievča.",
    ),
    line(
      "marek-second-sentence",
      "Marek",
      ["Druhá veta: ", PAUSE, { demonstrative: "Tie" }, " deti sa hrajú vonku."],
      "Second sentence: Those children are playing outside.",
    ),
    line(
      "anna-tie-deti-right",
      "Anna",
      [
        "Správne! ",
        PAUSE,
        { demonstrative: "Tie" },
        " deti, ",
        { demonstrative: "tie" },
        " ženy. ",
        { demonstrative: "Tí" },
        " muži, ",
        { demonstrative: "tí" },
        " chlapci.",
      ],
      "Right! Tie deti, tie ženy. Tí muži, tí chlapci.",
    ),
    line(
      "marek-third-sentence",
      "Marek",
      ["Tretia veta: ", PAUSE, "Poznáš ", { demonstrative: "tohoto" }, " muža?"],
      "Third sentence: Poznáš tohoto muža? (The Czech form, on purpose.)",
    ),
    line(
      "anna-tohto-not-tohoto",
      "Anna",
      [
        "Pozor! ",
        PAUSE,
        "Tohoto je po česky. Po slovensky je ",
        { demonstrative: "tohto" },
        ".",
      ],
      "Careful! Tohoto is Czech. In Slovak it's tohto.",
    ),
    line(
      "marek-tohto-now-i-know",
      "Marek",
      [
        { demonstrative: "Tohto" },
        ", ",
        { demonstrative: "tohto" },
        ", ",
        { demonstrative: "tohto" },
        ". ",
        PAUSE,
        "Už viem.",
      ],
      "Tohto, tohto, tohto. Now I know.",
    ),
    line("anna-excellent", "Anna", ["Výborne, Marek!"], "Excellent, Marek!"),
  ],
  checks: [
    {
      id: `${PREFIX}check-correct-sentence`,
      prompt: "Ktorá veta je podľa Anny správna?",
      promptEnglish: "Which sentence does Anna call correct?",
      choices: [
        { id: "children", label: "Tie deti sa hrajú vonku." },
        {
          id: "girl",
          label: "Tá dievča je moja sestra.",
          whyWrong: "Anna says **nesprávne**: **dievča** is neuter, so **to dievča**.",
        },
        {
          id: "man",
          label: "Poznáš tohoto muža?",
          whyWrong:
            "Anna says **pozor**: **tohoto** is Czech, the Slovak form is **tohto**.",
        },
      ],
      answerId: "children",
      feedback: {
        english: "Those children are playing outside.",
        why: "Anna says **správne** after **tie deti sa hrajú vonku**: children take **tie**.",
      },
    },
    {
      id: `${PREFIX}check-tohto`,
      gap: "Poznáš ___ muža?",
      prompt: "Ako Anna opravila Mareka?",
      promptEnglish: "How did Anna correct Marek?",
      replayLineId: `${PREFIX}anna-tohto-not-tohoto`,
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
        english: "In Slovak it's tohto.",
        why: "Anna says **po slovensky je tohto**.",
      },
    },
  ],
};

const outro: ListeningChapter = {
  id: `${PREFIX}outro`,
  titleSk: "Záver",
  title: "That's all for today",
  lines: [
    line(
      "marek-thats-all",
      "Marek",
      [{ demonstrative: "To" }, " je všetko na dnes."],
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
      ["Anna? ", PAUSE, "Kde sú ", { demonstrative: "tie" }, " kľúče?"],
      "Anna? Where are those keys?",
      [null, null],
    ),
    line("anna-marek", "Anna", ["Marek!"], "Marek!"),
  ],
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
    "Anna and Marek play a guessing game, shop at the market, lose the car key and quiz each other.",
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
