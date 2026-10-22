import { markedText, type MarkedPart } from "$lib/learning/marked-text";
import type { DialogueTurn } from "$lib/learning/types";
import type { ListeningChapter, ListeningEpisode } from "../types";

const PREFIX = "podcast-demonstratives-";

type Part = string | { demonstrative: string };

function line(
  id: string,
  speaker: string,
  parts: Part[],
  english: string,
  /** What the speaker holds per sentence on `/dev/scenes`, where the words would pick wrong. */
  props?: DialogueTurn["props"],
): DialogueTurn {
  const marked = markedText(
    parts.map((part): MarkedPart =>
      typeof part === "string"
        ? part
        : { role: "demonstrative", text: part.demonstrative },
    ),
  );

  return {
    id: `${PREFIX}${id}`,
    speaker,
    slovak: marked.text,
    marks: marked.marks,
    english,
    ...(props ? { props } : {}),
  };
}

/** Anna only guesses: the thing is still in Marek's bag. */
const GUESS = [null, null];

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
      ["Malú? ", { demonstrative: "To" }, " nie je malá téma, Anna!"],
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
      prompt: "What is today's topic?",
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
      ["Je ", { demonstrative: "to" }, " malé. Otvára dvere."],
      "It's small. It opens doors.",
    ),
    line(
      "anna-its-a-key",
      "Anna",
      [{ demonstrative: "To" }, " je kľúč!"],
      "It's a key!",
      GUESS,
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
      [{ demonstrative: "To" }, " je ťažké. Má veľa strán."],
      "It's heavy. It has many pages.",
      ["bag"],
    ),
    line(
      "anna-its-a-book",
      "Anna",
      [
        { demonstrative: "To" },
        " je kniha! ",
        { demonstrative: "Tá" },
        " kniha je veľká.",
      ],
      "It's a book! That book is big.",
      GUESS,
    ),
    line(
      "marek-dictionary",
      "Marek",
      ["Áno, ", { demonstrative: "tá" }, " kniha je slovník."],
      "Yes, that book is a dictionary.",
    ),
    line(
      "anna-third-thing",
      "Anna",
      ["A ", { demonstrative: "tá" }, " tretia vec?"],
      "And that third thing?",
    ),
    line(
      "marek-green-sweet",
      "Marek",
      [{ demonstrative: "To" }, " je zelené a je ", { demonstrative: "to" }, " sladké."],
      "It's green and it's sweet.",
      ["bag"],
    ),
    line(
      "anna-apple",
      "Anna",
      ["Jablko! ", { demonstrative: "To" }, " je jablko."],
      "An apple! It's an apple.",
      GUESS,
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
  ],
  checks: [
    {
      id: `${PREFIX}check-first-thing`,
      prompt: "What is the first thing in Marek's bag?",
      replayLineId: `${PREFIX}marek-small-opens-doors`,
      choices: [
        { id: "key", label: "Kľúč." },
        {
          id: "book",
          label: "Kniha.",
          whyWrong: "**Kniha** is the second thing: heavy, with many pages.",
        },
        {
          id: "apple",
          label: "Jablko.",
          whyWrong: "**Jablko** is the third thing: green and sweet.",
        },
      ],
      answerId: "key",
      feedback: {
        english: "It's small. It opens doors.",
        why: "Marek says **otvára dvere**, it opens doors, so Anna guesses **kľúč**.",
      },
    },
    {
      id: `${PREFIX}check-key-form`,
      promptSk: "___ kľúč je od auta.",
      prompt: "Which word did Marek say?",
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
      prompt: "Who is the apple for?",
      replayLineId: `${PREFIX}marek-apple-for-you`,
      choices: [
        { id: "anna", label: "Pre Annu." },
        {
          id: "marek",
          label: "Pre Mareka.",
          whyWrong:
            "Marek is giving it away: **pre teba** means for you, and he is talking to Anna.",
        },
        {
          id: "listeners",
          label: "Pre poslucháčov.",
          whyWrong: "Nice idea, but Marek says **pre teba**, for you, to Anna.",
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
      ["Syr. Dobrý deň! Koľko stojí ", { demonstrative: "tento" }, " syr?"],
      "Cheese. Hello! How much is this cheese?",
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
      ["Aha. A ", { demonstrative: "tamten" }, " syr?"],
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
      ["Dobre, dám si ", { demonstrative: "tamten" }, "."],
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
  ],
  checks: [
    {
      id: `${PREFIX}check-which-cheese`,
      prompt: "Which cheese does Marek take?",
      replayLineId: `${PREFIX}marek-ill-take-that-one`,
      choices: [
        { id: "far", label: "Tamten. Stojí tri eurá." },
        {
          id: "near",
          label: "Tento. Stojí päť eur.",
          whyWrong:
            "**Tento syr** is the one in front of him, the five-euro one. He picks the cheaper one.",
        },
        {
          id: "none",
          label: "Žiadny.",
          whyWrong: "**Žiadny** means none, but Marek says **dám si tamten**.",
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
      promptSk: "A ja chcem ___ jahody.",
      prompt: "Which word did Anna say?",
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
      prompt: "Where are the strawberries Anna buys from?",
      replayLineId: `${PREFIX}lucia-strawberries-from`,
      choices: [
        { id: "slovakia", label: "Zo Slovenska." },
        {
          id: "austria",
          label: "Z Rakúska.",
          whyWrong:
            "**Tieto**, the ones in front, are from Austria. Anna asks for **tamtie**.",
        },
        {
          id: "czechia",
          label: "Z Česka.",
          whyWrong: "Lucia names **Rakúsko** and **Slovensko**, not Czechia.",
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
      "anna-this-or-that",
      "Anna",
      [
        "Ktorý? ",
        { demonstrative: "Tento" },
        " alebo ",
        { demonstrative: "tamten" },
        "?",
      ],
      "Which one? This one or that one over there?",
    ),
    line(
      "marek-that-one-car",
      "Marek",
      [{ demonstrative: "Tamten" }, ". ", { demonstrative: "Ten" }, " od auta."],
      "That one over there. The car key.",
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
      ["Aha, mám ho. A kto je ", { demonstrative: "ten" }, " muž vonku?"],
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
  ],
  checks: [
    {
      id: `${PREFIX}check-where-key`,
      prompt: "Where is the key?",
      replayLineId: `${PREFIX}anna-in-that-one-window`,
      choices: [
        { id: "far-bag", label: "V tamtej taške, pri okne." },
        {
          id: "this-bag",
          label: "V tejto taške.",
          whyWrong: "Marek asks **v tejto?** and Anna says **nie**.",
        },
        {
          id: "car",
          label: "V aute.",
          whyWrong: "It is the key **od auta**, the car key, but it is in a bag.",
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
      promptSk: "___ muža poznáš.",
      prompt: "Which form did Anna say?",
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
      prompt: "Who is the woman with the neighbour?",
      replayLineId: `${PREFIX}anna-his-sister`,
      choices: [
        { id: "sister", label: "Jeho sestra." },
        {
          id: "wife",
          label: "Jeho žena.",
          whyWrong: "Anna says **sestra**, sister, not **žena**.",
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
      ["Dobre. Prvá veta: ", { demonstrative: "Tá" }, " dievča je moja sestra."],
      "OK. First sentence: Tá dievča je moja sestra. (Wrong on purpose.)",
    ),
    line(
      "anna-dievca-neuter",
      "Anna",
      ["Nesprávne! Dievča je stredný rod: ", { demonstrative: "to" }, " dievča."],
      "Wrong! Dievča is neuter: to dievča.",
    ),
    line(
      "marek-second-sentence",
      "Marek",
      ["Druhá veta: ", { demonstrative: "Tie" }, " deti sa hrajú vonku."],
      "Second sentence: Those children are playing outside.",
    ),
    line(
      "anna-tie-deti-right",
      "Anna",
      [
        "Správne! ",
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
      ["Tretia veta: Poznáš ", { demonstrative: "tohoto" }, " muža?"],
      "Third sentence: Poznáš tohoto muža? (The Czech form, on purpose.)",
    ),
    line(
      "anna-tohto-not-tohoto",
      "Anna",
      ["Pozor! Tohoto je po česky. Po slovensky je ", { demonstrative: "tohto" }, "."],
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
        ". Už viem.",
      ],
      "Tohto, tohto, tohto. Now I know.",
    ),
    line("anna-excellent", "Anna", ["Výborne, Marek!"], "Excellent, Marek!"),
  ],
  checks: [
    {
      id: `${PREFIX}check-correct-sentence`,
      prompt: "Which sentence did Anna call correct?",
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
      promptSk: "Poznáš ___ muža?",
      prompt: "How does Anna correct Marek?",
      replayLineId: `${PREFIX}anna-tohto-not-tohoto`,
      choices: [
        { id: "tohto", label: "tohto" },
        {
          id: "tohoto",
          label: "tohoto",
          whyWrong: "That is the Czech form. Slovak drops the middle o: **tohto**.",
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
      ["Anna? Kde sú ", { demonstrative: "tie" }, " kľúče?"],
      "Anna? Where are those keys?",
      [null, null],
    ),
    line("anna-marek", "Anna", ["Marek!"], "Marek!"),
  ],
  checks: [
    {
      id: `${PREFIX}check-goodbye`,
      prompt: "How does Anna say goodbye?",
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
      prompt: "What is Marek looking for at the very end?",
      replayLineId: `${PREFIX}marek-where-are-those-keys`,
      choices: [
        { id: "keys", label: "Kľúče." },
        {
          id: "apple",
          label: "Jablko.",
          whyWrong: "The apple was in the bag game. Now Marek asks **kde sú tie kľúče?**",
        },
        {
          id: "bag",
          label: "Tašku.",
          whyWrong:
            "The keys were in a bag at home. Now Marek asks **kde sú tie kľúče?**",
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
