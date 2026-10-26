import type { MarkedPart } from "$lib/learning/marked-text";
import {
  CHUCKLE,
  EXCITED,
  HAPPY,
  PAUSE,
  SIGH,
  STOP,
  SURPRISED,
  YAWN,
  afterThinking,
  lineWriter,
} from "../dialogue";
import type { ListeningChapter, ListeningEpisode } from "../types";

const PREFIX = "podcast-imperative-";
const line = lineWriter(PREFIX);

/** An imperative, the episode's topic, lit in the transcript. Wrong forms said on purpose stay unlit. */
function mark(text: string): Exclude<MarkedPart, string> {
  return { role: "imperative", text };
}

const intro: ListeningChapter = {
  id: `${PREFIX}intro`,
  titleSk: "Úvod",
  title: "Hello from the studio",
  lines: [
    line(
      "anna-this-is-podcast",
      "Anna",
      ["Ahojte! Toto je podcast Slovak Wiki. Ja som Anna."],
      "Hi! This is the Slovak Wiki podcast. I'm Anna.",
    ),
    line("marek-i-am-marek", "Marek", ["A ja som Marek. Ahojte!"], "And I'm Marek. Hi!"),
    line(
      "anna-topic",
      "Anna",
      ["Dnes máme tému: ", mark("rob"), ", ", mark("robte"), ", ", mark("robme"), "."],
      "Today our topic is rob, robte, robme: do it!",
    ),
    line(
      "marek-still-early",
      "Marek",
      [YAWN, mark("Rob"), ", ", mark("robte"), STOP, PAUSE, "Anna, je ešte skoro ráno."],
      "Rob, robte… Anna, it's still early in the morning.",
    ),
    line(
      "anna-dont-sleep",
      "Anna",
      [mark("Nespi"), ", Marek! ", mark("Pi"), " kávu."],
      "Don't sleep, Marek! Drink your coffee.",
      // The coffee is Marek's, so Anna's hands stay empty.
      { props: [null, null] },
    ),
    line(
      "marek-drinking",
      "Marek",
      ["Dobre, dobre. Pijem."],
      "OK, OK. I'm drinking it.",
      {
        props: ["cup", "cup"],
      },
    ),
    line(
      "anna-water-plant",
      "Anna",
      ["A ešte jedna vec: ", mark("polej"), ", prosím, tú rastlinku. Je smädná."],
      "And one more thing: water that little plant, please. It's thirsty.",
    ),
    line(
      "marek-game-first",
      "Marek",
      ["Hneď. ", PAUSE, EXCITED, "Ale najprv hra!"],
      "Right away. But first, a game!",
    ),
  ],
  checks: [
    {
      id: `${PREFIX}check-topic`,
      prompt: "Aká je dnešná téma?",
      promptEnglish: "What is today's topic?",
      replayLineId: `${PREFIX}anna-topic`,
      choices: [
        { id: "imperative", label: "Rob, robte, robme." },
        {
          id: "coffee",
          label: "Káva.",
          whyWrong:
            "**Káva** is coffee. Anna tells Marek to drink it, but the topic is **rob, robte, robme**.",
        },
        {
          id: "plants",
          label: "Rastliny.",
          whyWrong:
            "**Rastliny** are plants. One needs water, but the topic is **rob, robte, robme**.",
        },
      ],
      answerId: "imperative",
      feedback: {
        english: "Today our topic is rob, robte, robme.",
        why: "Anna says: **Dnes máme tému: rob, robte, robme.**",
      },
    },
    {
      id: `${PREFIX}check-plant`,
      prompt: "Čo má Marek urobiť?",
      promptEnglish: "What should Marek do?",
      replayLineId: `${PREFIX}anna-water-plant`,
      choices: [
        { id: "water", label: "Poliať rastlinu." },
        {
          id: "sleep",
          label: "Spať.",
          whyWrong:
            "**Spať** means to sleep. Anna says the opposite: **nespi**, don't sleep.",
        },
        {
          id: "buy-coffee",
          label: "Kúpiť kávu.",
          whyWrong:
            "**Kúpiť kávu** means to buy coffee. Marek has one already: **pi kávu**, drink your coffee.",
        },
      ],
      answerId: "water",
      feedback: {
        english: "Water that little plant, please. It's thirsty.",
        why: "Anna says **polej, prosím, tú rastlinku**: water that little plant, please.",
      },
    },
  ],
};

const game: ListeningChapter = {
  id: `${PREFIX}game`,
  titleSk: "Hra so slovesami",
  title: "The verb game",
  lines: [
    line(
      "anna-game-rules",
      "Anna",
      ["Hra je jednoduchá. Ja poviem sloveso v tvare oni, ty z neho urobíš rozkaz."],
      "The game is simple. I'll say a verb in the oni (they) form, you turn it into a command.",
    ),
    line(
      "marek-guess-with-us",
      "Marek",
      ["Dobre. ", mark("Hádajte"), " s nami!"],
      "OK. Guess along with us!",
    ),
    line(
      "anna-first-verb",
      "Anna",
      ["Prvé sloveso: ", PAUSE, "čítajú."],
      "First verb: čítajú, they read.",
    ),
    line(
      "marek-citaj",
      "Marek",
      ["Čítajú… ", PAUSE, mark("čítaj"), "!"],
      "Čítajú… čítaj, read!",
    ),
    line(
      "anna-citaj-second-verb",
      "Anna",
      [
        "Správne! ",
        mark("Čítaj"),
        ", ",
        mark("čítajte"),
        ", ",
        mark("čítajme"),
        ". ",
        PAUSE,
        "Druhé: spia.",
      ],
      "Right! Čítaj, čítajte, čítajme. Second: spia, they sleep.",
    ),
    line(
      "marek-spaj",
      "Marek",
      ["Spia… ", PAUSE, "je to spaj?"],
      "Spia… is it spaj? (Wrong: built like čítaj.)",
    ),
    line(
      "anna-ends-in-i",
      "Anna",
      ["Nie, spaj nie. ", PAUSE, "Končí sa na i."],
      "No, not spaj. It ends in i.",
    ),
    line("marek-spi", "Marek", ["Na i… ", PAUSE, mark("spi"), "!"], "In i… spi, sleep!"),
    line(
      "anna-spi-right",
      "Anna",
      [
        "Výborne! ",
        mark("Spi"),
        ", ",
        mark("spite"),
        ", ",
        mark("spime"),
        ". ",
        PAUSE,
        "Tretie: idú.",
      ],
      "Excellent! Spi, spite, spime. Third: idú, they go.",
    ),
    line(
      "marek-idi",
      "Marek",
      ["Idú… ", PAUSE, "idi?"],
      "Idú… idi? (Wrong: ísť has its own form.)",
    ),
    line(
      "anna-own-form",
      "Anna",
      ["Nie! ", PAUSE, "Ísť má vlastný tvar: ", mark("choď"), "."],
      "No! Ísť has its own form: choď, go.",
    ),
    line(
      "marek-chod",
      "Marek",
      ["Aha", STOP, PAUSE, mark("choď"), ", ", mark("choďte"), ", ", mark("choďme"), "."],
      "Oh… choď, choďte, choďme.",
    ),
    line(
      "anna-last-verb",
      "Anna",
      ["Presne tak! ", PAUSE, "A posledné: platia."],
      "Exactly! And the last one: platia, they pay.",
    ),
    line(
      "marek-plat",
      "Marek",
      ["Platia… ", PAUSE, mark("plať"), "!"],
      "Platia… plať, pay!",
    ),
    line(
      "anna-good-today",
      "Anna",
      ["Super! ", PAUSE, "Marek, dnes si dobrý."],
      "Great! Marek, you're good today.",
    ),
    line(
      "marek-tonight-maria",
      "Marek",
      ["Ďakujem. ", PAUSE, "A dnes večer ideme k Márii, však?"],
      "Thanks. And tonight we're going to Mária's, right?",
    ),
    line(
      "anna-maria-soup",
      "Anna",
      ["Áno! Naučí nás variť svoju polievku."],
      "Yes! She's teaching us to cook her soup.",
    ),
    line(
      "marek-lets-cook",
      "Marek",
      [EXCITED, "Mňam. Tak večer ", mark("poďme"), " variť!"],
      "Yum. Then tonight, let's go cook!",
    ),
  ],
  checks: [
    {
      id: `${PREFIX}check-spi`,
      gap: "Výborne! ___, spite, spime.",
      prompt: "Ktoré slovo povedala Anna?",
      promptEnglish: "Which word did Anna say?",
      replayLineId: `${PREFIX}anna-spi-right`,
      choices: [
        { id: "spi", label: "spi" },
        {
          id: "spaj",
          label: "spaj",
          whyWrong:
            "**Spaj** is Marek's wrong guess, built like **čítaj**. Anna says it ends in i: **spi**.",
        },
        {
          id: "spis",
          label: "spíš",
          whyWrong: "**Spíš** means you sleep: it says what you do, it is not a command.",
        },
      ],
      answerId: "spi",
      feedback: {
        english: "Excellent! Spi, spite, spime.",
        why: "**Spia** leaves just **sp-**, which needs an i: **spi**, **spite**, **spime**.",
      },
    },
    {
      id: `${PREFIX}check-chod`,
      prompt: "Aký rozkaz je od slovesa ísť?",
      promptEnglish: "What is the command for ísť, to go?",
      replayLineId: `${PREFIX}anna-own-form`,
      choices: [
        { id: "chod", label: "Choď!" },
        {
          id: "idi",
          label: "Idi!",
          whyWrong:
            "**Idi** is Marek's wrong guess, built from **idú**. Anna says **nie**: ísť has its own form, **choď**.",
        },
        {
          id: "pod",
          label: "Poď!",
          whyWrong:
            "**Poď** means come here, and **poďme** let's go. Go somewhere is **choď**.",
        },
      ],
      answerId: "chod",
      feedback: {
        english: "Ísť has its own form: choď.",
        why: "**Ísť** has its own imperative: **choď**, **choďte**, **choďme**.",
      },
    },
  ],
};

const kitchen: ListeningChapter = {
  id: `${PREFIX}kitchen`,
  stage: "kitchen",
  titleSk: "U Márie",
  title: "Cooking at Mária's",
  lines: [
    line(
      "maria-water-boils",
      "Mária",
      ["Tak. ", PAUSE, "Voda vrie, zelenina je tu", STOP],
      "Right. The water's boiling, the vegetables are here…",
    ),
    line(
      "anna-good-evening",
      "Anna",
      ["Dobrý večer, pani Mária!"],
      "Good evening, Mária!",
    ),
    line(
      "maria-come-in",
      "Mária",
      ["Anna! ", mark("Poď"), " ďalej. ", PAUSE, "A kde je Marek?"],
      "Anna! Come in. And where's Marek?",
    ),
    line(
      "marek-here",
      "Marek",
      ["Dobrý večer! ", mark("Prepáčte"), ", už som tu."],
      "Good evening! Sorry, I'm here.",
    ),
    line(
      "maria-wash-hands",
      "Mária",
      ["Najprv si ", mark("umyte"), " ruky. ", PAUSE, "Umývadlo je tam."],
      "First wash your hands. The sink is over there.",
    ),
    line(
      "anna-what-to-do",
      "Anna",
      ["Hotovo. Čo máme robiť?"],
      "Done. What should we do?",
    ),
    line(
      "maria-chop-write",
      "Mária",
      [
        "Anna, ",
        mark("nakrájaj"),
        " mrkvu. ",
        PAUSE,
        "A Marek",
        STOP,
        PAUSE,
        mark("píš"),
        ".",
      ],
      "Anna, chop the carrots. And Marek… write.",
    ),
    line(
      "marek-me-write",
      "Marek",
      [SURPRISED, "Ja mám písať? A čo?"],
      "Me, write? Write what?",
    ),
    line(
      "maria-the-recipe",
      "Mária",
      [
        "Recept predsa! Nikde ho nemám napísaný. ",
        PAUSE,
        mark("Píš"),
        ": ",
        mark("daj"),
        " zeleninu do hrnca.",
      ],
      "The recipe, of course! I've never written it down. Write: put the vegetables in the pot.",
    ),
    line(
      "marek-writes",
      "Marek",
      [mark("Daj"), " zeleninu do hrnca. ", PAUSE, "Dobre."],
      "Put the vegetables in the pot. OK.",
      { props: ["card", "card"] },
    ),
    line(
      "maria-like-this",
      "Mária",
      ["Anna, nie tak. ", PAUSE, mark("Rob"), " to takto, na malé kúsky."],
      "Anna, not like that. Do it like this, in small pieces.",
    ),
    line(
      "anna-help-pot",
      "Anna",
      ["Aha. ", PAUSE, mark("Pomôžte"), " mi, prosím, s hrncom. Je ťažký."],
      "I see. Help me with the pot, please. It's heavy.",
    ),
    line(
      "maria-taste",
      "Mária",
      [
        "Ja ho vezmem. ",
        PAUSE,
        "Marek, ",
        mark("ochutnaj"),
        " polievku. Ale ",
        mark("buď"),
        " opatrný, je horúca!",
      ],
      "I'll take it. Marek, taste the soup. But be careful, it's hot!",
    ),
    line("marek-ow-hot", "Marek", [SURPRISED, "Au! ", PAUSE, "Horúca!"], "Ow! Hot!"),
    line(
      "anna-is-it-good",
      "Anna",
      [CHUCKLE, "No ", mark("povedz"), ", je dobrá?"],
      "Well, tell us, is it good?",
    ),
    line(
      "marek-call-lucia",
      "Marek",
      [
        HAPPY,
        "Výborná! ",
        PAUSE,
        "Anna, ",
        mark("zavolaj"),
        " Lucii. Toto musí ochutnať aj ona.",
      ],
      "Excellent! Anna, call Lucia. She has to taste this too.",
      { to: "Anna" },
    ),
  ],
  checks: [
    {
      id: `${PREFIX}check-recipe`,
      prompt: "Čo píše Marek?",
      promptEnglish: "What is Marek writing?",
      replayLineId: `${PREFIX}maria-the-recipe`,
      choices: [
        { id: "recipe", label: "Recept na polievku." },
        {
          id: "message",
          label: "Správu pre Luciu.",
          whyWrong:
            "**Správa pre Luciu** is a message for Lucia. Mária says **píš: daj zeleninu do hrnca**: he writes her recipe.",
        },
        {
          id: "test",
          label: "Test.",
          whyWrong:
            "There is no test. Mária has never written her recipe down, so Marek writes it: **recept predsa!**",
        },
      ],
      answerId: "recipe",
      feedback: {
        english: "The recipe, of course! I've never written it down.",
        why: "Mária says **recept predsa! Nikde ho nemám napísaný.**",
      },
    },
    {
      id: `${PREFIX}check-umyte`,
      gap: "Najprv si ___ ruky.",
      prompt: "Ktoré slovo povedala Mária?",
      promptEnglish: "Which word did Mária say?",
      replayLineId: `${PREFIX}maria-wash-hands`,
      choices: [
        { id: "umyte", label: "umyte" },
        {
          id: "umy",
          label: "umy",
          whyWrong:
            "**Umy** is for one person. Mária says it to Anna and Marek both: **umyte**.",
        },
        {
          id: "umyjeme",
          label: "umyjeme",
          whyWrong:
            "**Umyjeme** means we will wash: it says what we do, it is not a command.",
        },
      ],
      answerId: "umyte",
      feedback: {
        english: "First wash your hands.",
        why: "To two people, **-te**: **umy**, **umyte**.",
      },
    },
  ],
};

const table: ListeningChapter = {
  id: `${PREFIX}table`,
  stage: "kitchen",
  titleSk: "Pri stole",
  title: "Lucia calls",
  lines: [
    line(
      "marek-its-her",
      "Marek",
      [SURPRISED, "Počkaj, mne niekto volá. ", PAUSE, "To je ona! Haló? Ahoj, Lucia!"],
      "Wait, someone's calling me. It's her! Hello? Hi, Lucia!",
      { ring: "call" },
    ),
    line(
      "lucia-eat-without-me",
      "Lucia",
      ["Ahoj! Ste u Márie? ", PAUSE, "Ja prídem neskôr. ", mark("Jedzte"), " bezo mňa."],
      "Hi! Are you at Mária's? I'll come later. Eat without me.",
      { overPhone: true },
    ),
    line(
      "marek-come",
      "Marek",
      [EXCITED, "Nie, nie, ", mark("príď"), "! Mária uvarila polievku."],
      "No, no, come! Mária made soup.",
    ),
    line(
      "maria-let-her-come",
      "Mária",
      [mark("Nech"), " príde. Polievky je dosť."],
      "Let her come. There's plenty of soup.",
      { to: "Marek" },
    ),
    line(
      "lucia-half-hour",
      "Lucia",
      ["Dobre. ", PAUSE, "Tak o pol hodiny. Ahoj!"],
      "OK. In half an hour, then. Bye!",
      { overPhone: true },
    ),
    line(
      "marek-shes-coming",
      "Marek",
      ["Ahoj! ", PAUSE, HAPPY, "Príde o pol hodiny."],
      "Bye! She's coming in half an hour.",
    ),
    line(
      "maria-sit-down",
      "Mária",
      ["Výborne. ", mark("Sadnite"), " si, prosím."],
      "Wonderful. Sit down, please.",
    ),
    line(
      "anna-lets-wait",
      "Anna",
      ["Ďakujeme. ", PAUSE, "Ale ", mark("počkajme"), " na Luciu, nie?"],
      "Thank you. But let's wait for Lucia, shall we?",
      { to: "Mária" },
    ),
    line(
      "maria-then-wait",
      "Mária",
      [CHUCKLE, "Dobre, dobre. Tak ", mark("počkajme"), "."],
      "All right, all right. Then let's wait.",
    ),
  ],
  checks: [
    {
      id: `${PREFIX}check-jedzte`,
      gap: "Ja prídem neskôr. ___ bezo mňa.",
      prompt: "Ktoré slovo povedala Lucia?",
      promptEnglish: "Which word did Lucia say?",
      replayLineId: `${PREFIX}lucia-eat-without-me`,
      choices: [
        { id: "jedzte", label: "jedzte" },
        {
          id: "jedz",
          label: "jedz",
          whyWrong:
            "**Jedz** is for one person. Lucia means all of them at Mária's: **jedzte**.",
        },
        {
          id: "jedzme",
          label: "jedzme",
          whyWrong:
            "**Jedzme** means let's eat, and Lucia is not there. She says **jedzte**, eat.",
        },
      ],
      answerId: "jedzte",
      feedback: {
        english: "I'll come later. Eat without me.",
        why: "**Jesť** has its own imperative: **jedz**, **jedzte**, **jedzme**.",
      },
    },
    {
      id: `${PREFIX}check-why-wait`,
      prompt: "Prečo ešte nejedia?",
      promptEnglish: "Why aren't they eating yet?",
      replayLineId: `${PREFIX}anna-lets-wait`,
      choices: [
        { id: "lucia", label: "Čakajú na Luciu." },
        {
          id: "hot",
          label: "Polievka je horúca.",
          whyWrong:
            "It is hot, but that is not why. Anna says **počkajme na Luciu**: let's wait for Lucia.",
        },
        {
          id: "no-soup",
          label: "Polievky nie je dosť.",
          whyWrong:
            "Mária says the opposite: **polievky je dosť**, there's plenty of soup.",
        },
      ],
      answerId: "lucia",
      feedback: {
        english: "But let's wait for Lucia, shall we?",
        why: "Anna says **počkajme na Luciu**, and Mária agrees: **tak počkajme**.",
      },
    },
  ],
};

const quiz: ListeningChapter = {
  id: `${PREFIX}quiz`,
  titleSk: "Správne alebo nesprávne?",
  title: "Right or wrong? Anna takes the test",
  lines: [
    line(
      "anna-back-in-studio",
      "Anna",
      ["Je ráno a sme späť v štúdiu."],
      "It's morning and we're back in the studio.",
    ),
    line(
      "marek-right-or-wrong",
      "Marek",
      ["A teraz kvíz: správne alebo nesprávne? ", mark("Hádajte"), " s nami!"],
      "And now a quiz: right or wrong? Guess along with us!",
    ),
    line(
      "marek-first-sentence",
      "Marek",
      ["Prvá veta: ", PAUSE, "Nezatvor okno."],
      "First sentence: Nezatvor okno. (Wrong on purpose.)",
    ),
    afterThinking(
      line(
        "anna-nezatvaraj",
        "Anna",
        ["Nesprávne! ", PAUSE, "Správne je: ", mark("Nezatváraj"), " okno."],
        "Wrong! The right one is: Nezatváraj okno, don't close the window.",
      ),
    ),
    line(
      "marek-second-sentence",
      "Marek",
      ["Druhá veta: ", PAUSE, mark("Buďte"), " ticho, prosím."],
      "Second sentence: Be quiet, please.",
    ),
    afterThinking(
      line(
        "anna-budte-right",
        "Anna",
        ["Správne! ", PAUSE, mark("Buď"), ", ", mark("buďte"), ", ", mark("buďme"), "."],
        "Right! Buď, buďte, buďme.",
      ),
    ),
    line(
      "marek-last-sentence",
      "Marek",
      ["A posledná veta: ", PAUSE, "Povedaj mi to."],
      "And the last sentence: Povedaj mi to. (Wrong on purpose.)",
    ),
    afterThinking(
      line(
        "anna-povedz",
        "Anna",
        ["Nesprávne! ", PAUSE, "Povedať má vlastný tvar: ", mark("Povedz"), " mi to."],
        "Wrong! Povedať has its own form: Povedz mi to, tell me.",
      ),
    ),
    line("marek-excellent", "Marek", ["Výborne, Anna!"], "Excellent, Anna!"),
  ],
  checks: [
    {
      id: `${PREFIX}check-correct-sentence`,
      prompt: "Ktorá veta je podľa Anny správna?",
      promptEnglish: "Which sentence does Anna call correct?",
      choices: [
        { id: "quiet", label: "Buďte ticho, prosím." },
        {
          id: "window",
          label: "Nezatvor okno.",
          whyWrong:
            "Anna says **nesprávne**: a “don't” takes the imperfective, **nezatváraj okno**.",
        },
        {
          id: "tell",
          label: "Povedaj mi to.",
          whyWrong: "Anna says **nesprávne**: povedať has its own form, **povedz**.",
        },
      ],
      answerId: "quiet",
      feedback: {
        english: "Be quiet, please.",
        why: "Anna says **správne** after **buďte ticho, prosím**: **byť** gives **buď**, **buďte**.",
      },
    },
    {
      id: `${PREFIX}check-povedz`,
      gap: "___ mi to.",
      prompt: "Ako Anna opravila Mareka?",
      promptEnglish: "How did Anna correct Marek?",
      replayLineId: `${PREFIX}anna-povedz`,
      choices: [
        { id: "povedz", label: "Povedz" },
        {
          id: "povedaj",
          label: "Povedaj",
          whyWrong:
            "**Povedaj** is the wrong form Marek reads out. Povedať has its own imperative: **povedz**.",
        },
        {
          id: "povedzte",
          label: "Povedzte",
          whyWrong:
            "**Povedzte** is for vy. Anna corrects the sentence for one friend: **povedz mi to**.",
        },
      ],
      answerId: "povedz",
      feedback: {
        english: "Povedať has its own form: Povedz mi to.",
        why: "Anna says **povedať má vlastný tvar: povedz mi to**.",
      },
    },
  ],
};

const outro: ListeningChapter = {
  id: `${PREFIX}outro`,
  titleSk: "Záver",
  title: "That's all for today",
  lines: [
    line("marek-thats-all", "Marek", ["To je všetko na dnes."], "That's all for today."),
    line(
      "anna-thanks-write-to-us",
      "Anna",
      [
        "Ďakujeme, že počúvate. ",
        mark("Píšte"),
        " nám a ",
        mark("počúvajte"),
        " nás aj nabudúce.",
      ],
      "Thank you for listening. Write to us, and listen again next time.",
    ),
    line(
      "anna-and-the-plant",
      "Anna",
      [SIGH, "Marek? ", PAUSE, "A tá rastlinka?"],
      "Marek? And that little plant?",
      { to: "Marek" },
    ),
    line(
      "marek-sorry-plant",
      "Marek",
      [
        SURPRISED,
        "Rastlinka! Hneď. ",
        PAUSE,
        "Prepáč, rastlinka. ",
        PAUSE,
        "Tu máš vodu.",
      ],
      "The little plant! Right away. Sorry, little plant. Here's some water.",
      { props: ["cup", "cup", "cup"] },
    ),
    line(
      "anna-water-yours-too",
      "Anna",
      [
        CHUCKLE,
        "A vy, milí poslucháči, ",
        mark("nezabudnite"),
        ": ",
        mark("polejte"),
        " svoje kvety! ",
        PAUSE,
        mark("Majte"),
        " sa pekne!",
      ],
      "And you, dear listeners, don't forget: water your flowers! Take care!",
    ),
    line("marek-bye", "Marek", ["Ahojte!"], "Bye!"),
  ],
  checks: [
    {
      id: `${PREFIX}check-write-to-us`,
      gap: "___ nám a počúvajte nás aj nabudúce.",
      prompt: "Ktoré slovo povedala Anna poslucháčom?",
      promptEnglish: "Which word did Anna say to the listeners?",
      replayLineId: `${PREFIX}anna-thanks-write-to-us`,
      choices: [
        { id: "piste", label: "Píšte" },
        {
          id: "pis",
          label: "Píš",
          whyWrong:
            "**Píš** is for one friend. Anna talks to all the listeners: **píšte**.",
        },
        {
          id: "napiseme",
          label: "Napíšeme",
          whyWrong:
            "**Napíšeme** means we will write. Anna asks the listeners to write: **píšte**.",
        },
      ],
      answerId: "piste",
      feedback: {
        english: "Write to us, and listen again next time.",
        why: "To all the listeners, **-te**: **píšte**, **počúvajte**.",
      },
    },
    {
      id: `${PREFIX}check-plant-end`,
      prompt: "Čo robí Marek úplne na konci?",
      promptEnglish: "What does Marek do at the very end?",
      replayLineId: `${PREFIX}marek-sorry-plant`,
      choices: [
        { id: "waters", label: "Polieva rastlinku." },
        {
          id: "coffee",
          label: "Pije kávu.",
          whyWrong:
            "**Pije kávu** means he drinks coffee. That was the start of the show; at the end he says **tu máš vodu** to the plant.",
        },
        {
          id: "cooks",
          label: "Varí polievku.",
          whyWrong:
            "**Varí polievku** means he cooks soup. That was at Mária's; at the end he waters the plant: **tu máš vodu**.",
        },
      ],
      answerId: "waters",
      feedback: {
        english: "Sorry, little plant. Here's some water.",
        why: "Anna asked at the start: **polej tú rastlinku**. At the end Marek says **prepáč, rastlinka, tu máš vodu**.",
      },
    },
    {
      id: `${PREFIX}check-polejte`,
      gap: "A vy, milí poslucháči, nezabudnite: ___ svoje kvety!",
      prompt: "Ktoré slovo povedala Anna poslucháčom?",
      promptEnglish: "Which word did Anna say to the listeners?",
      replayLineId: `${PREFIX}anna-water-yours-too`,
      choices: [
        { id: "polejte", label: "polejte" },
        {
          id: "polej",
          label: "polej",
          whyWrong:
            "**Polej** is what Anna said to Marek at the start. To all the listeners it is **polejte**.",
        },
        {
          id: "polejme",
          label: "polejme",
          whyWrong:
            "**Polejme** means let's water. Anna asks the listeners to water their own: **polejte**.",
        },
      ],
      answerId: "polejte",
      feedback: {
        english: "Don't forget: water your flowers!",
        why: "The title's **polej** for one friend, **polejte** for all the listeners.",
      },
    },
  ],
};

export const imperativeEpisode: ListeningEpisode = {
  id: "listening/imperative",
  slug: "imperative",
  number: 5,
  level: "A1–A2",
  titleSk: "Polej tú rastlinu!",
  title: "Water that plant!",
  topic: "rob, robte, robme",
  promise:
    "Anna and Marek play a verb game, cook soup at Mária's, take Lucia's call and quiz each other, while the studio plant waits for water.",
  grammarSlug: "imperative",
  speakers: ["Anna", "Marek", "Mária", "Lucia"],
  vocabulary: [
    { slovak: "rastlinka", english: "little plant" },
    { slovak: "polievka", english: "soup" },
    { slovak: "recept", english: "recipe" },
    { slovak: "hrniec", english: "pot" },
    { slovak: "Poďme!", english: "Let's go!" },
    { slovak: "Nezabudnite!", english: "Don't forget!" },
  ],
  chapters: [intro, game, kitchen, table, quiz, outro],
};
