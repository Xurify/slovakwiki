import type { MarkedPart } from "$lib/learning/marked-text";
import { CHUCKLE, PAUSE, SIGH, STOP, afterThinking, lineWriter } from "../dialogue";
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
      [mark("Rob"), ", ", mark("robte"), STOP, PAUSE, "Anna, je ešte skoro ráno."],
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
      ["A ešte jedna vec: ", mark("polej"), ", prosím, tú rastlinu. Je smädná."],
      "And one more thing: water that plant, please. It's thirsty.",
    ),
    line(
      "marek-game-first",
      "Marek",
      ["Hneď. ", PAUSE, "Ale najprv hra!"],
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
        english: "Water that plant, please. It's thirsty.",
        why: "Anna says **polej, prosím, tú rastlinu**: water that plant, please.",
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
      ["Hra je jednoduchá. Ja poviem sloveso, ty povieš rozkaz."],
      "The game is simple. I say a verb, you say the command.",
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
      ["Nie! ", PAUSE, "Ísť má vlastný tvar."],
      "No! Ísť has its own form.",
    ),
    line(
      "marek-chod",
      "Marek",
      ["Vlastný tvar… ", PAUSE, mark("choď"), "!"],
      "Its own form… choď, go!",
    ),
    line(
      "anna-chod-last-verb",
      "Anna",
      [
        "Presne tak! ",
        mark("Choď"),
        ", ",
        mark("choďte"),
        ", ",
        mark("choďme"),
        ". ",
        PAUSE,
        "A posledné: platia.",
      ],
      "Exactly! Choď, choďte, choďme. And the last one: platia, they pay.",
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
      "marek-lets-go-school",
      "Marek",
      ["Ďakujem. A teraz ", mark("poďme"), " do školy! Mária tam dnes učí."],
      "Thanks. And now let's go to the school! Mária is teaching there today.",
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
      replayLineId: `${PREFIX}marek-chod`,
      choices: [
        { id: "chod", label: "Choď!" },
        {
          id: "idi",
          label: "Idi!",
          whyWrong:
            "**Idi** is Marek's wrong guess, built from **idú**. Anna says **nie**: ísť has its own form.",
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
        english: "Its own form… choď!",
        why: "**Ísť** has its own imperative: **choď**, **choďte**, **choďme**.",
      },
    },
  ],
};

const classroom: ListeningChapter = {
  id: `${PREFIX}classroom`,
  stage: "classroom",
  titleSk: "V triede",
  title: "In class with Mária",
  lines: [
    line(
      "anna-now-at-school",
      "Anna",
      ["Teraz sme v škole. Dobrý deň, pani Mária!"],
      "Now we're at the school. Hello, Mária!",
    ),
    line(
      "maria-come-in",
      "Mária",
      ["Dobrý deň! ", mark("Poďte"), " ďalej. ", mark("Sadnite"), " si, prosím."],
      "Hello! Come in. Sit down, please.",
    ),
    line(
      "marek-you-teach",
      "Marek",
      ["Pani Mária, vy dnes učíte?"],
      "Mária, are you teaching today?",
    ),
    line(
      "maria-teacher-ill",
      "Mária",
      ["Áno. Učiteľka je chorá, tak učím ja. ", PAUSE, "A vy ste dnes moji študenti."],
      "Yes. The teacher is ill, so I'm teaching. And today you are my students.",
    ),
    line(
      "maria-open-books",
      "Mária",
      [
        mark("Otvorte"),
        " knihy. ",
        PAUSE,
        "Marek, ",
        mark("čítajte"),
        " nahlas prvú vetu.",
      ],
      "Open your books. Marek, read the first sentence aloud.",
      { props: ["book", "book"] },
    ),
    line(
      "marek-drink-water",
      "Marek",
      ["Prvá veta: ", PAUSE, mark("Pite"), " veľa vody."],
      "The first sentence: Drink a lot of water.",
      { props: ["book"] },
    ),
    line(
      "marek-remembers-plant",
      "Marek",
      ["Veľa vody… ", PAUSE, "Ach, naša kvetina v štúdiu!"],
      "A lot of water… oh, our plant in the studio!",
      { to: "Anna" },
    ),
    line(
      "maria-write",
      "Mária",
      [
        "Teraz ",
        mark("píšte"),
        ", prosím. ",
        PAUSE,
        mark("Napíšte"),
        " tri vety do zošita, ale ",
        mark("nepíšte"),
        " do knihy.",
      ],
      "Now write, please. Write three sentences in your notebook, but don't write in the book.",
    ),
    line(
      "marek-help-spelling",
      "Marek",
      [
        "Pani Mária, ",
        mark("pomôžte"),
        " mi, prosím. ",
        PAUSE,
        "Spi sa píše s i alebo s y?",
      ],
      "Mária, help me, please. Is spi written with i or y?",
    ),
    line(
      "maria-dont-sleep-in-class",
      "Mária",
      [
        "S mäkkým i. ",
        mark("Spi"),
        ", ",
        mark("spite"),
        ". ",
        PAUSE,
        CHUCKLE,
        "Ale v triede ",
        mark("nespite"),
        ", Marek!",
      ],
      "With a soft i. Spi, spite. But don't sleep in class, Marek!",
    ),
    line("marek-sorry", "Marek", [mark("Prepáčte"), "!"], "Sorry!"),
    line(
      "maria-dont-forget-test",
      "Mária",
      [
        "Nakoniec: ",
        PAUSE,
        mark("nezabudnite"),
        ", v piatok je test. ",
        mark("Príďte"),
        " načas!",
      ],
      "And finally: don't forget, there's a test on Friday. Come on time!",
    ),
    line(
      "anna-we-wont-forget",
      "Anna",
      ["Nezabudneme. Ďakujeme, pani Mária!"],
      "We won't forget. Thank you, Mária!",
    ),
    line(
      "marek-lets-go-home",
      "Marek",
      ["Dovidenia! ", PAUSE, "Anna, ", mark("poďme"), " domov. Mám hlad."],
      "Goodbye! Anna, let's go home. I'm hungry.",
    ),
  ],
  checks: [
    {
      id: `${PREFIX}check-why-maria`,
      prompt: "Prečo dnes učí Mária?",
      promptEnglish: "Why is Mária teaching today?",
      replayLineId: `${PREFIX}maria-teacher-ill`,
      choices: [
        { id: "ill", label: "Učiteľka je chorá." },
        {
          id: "new",
          label: "Mária je nová učiteľka.",
          whyWrong:
            "**Mária je nová učiteľka** means Mária is the new teacher. She says **učiteľka je chorá**: the teacher is ill.",
        },
        {
          id: "hosts",
          label: "Anna a Marek sú učitelia.",
          whyWrong:
            "**Anna a Marek sú učitelia** means Anna and Marek are teachers. Mária says **vy ste dnes moji študenti**: you are my students.",
        },
      ],
      answerId: "ill",
      feedback: {
        english: "The teacher is ill, so I'm teaching.",
        why: "Mária says **učiteľka je chorá, tak učím ja**.",
      },
    },
    {
      id: `${PREFIX}check-citajte`,
      gap: "Marek, ___ nahlas prvú vetu.",
      prompt: "Ktoré slovo povedala Mária?",
      promptEnglish: "Which word did Mária say?",
      replayLineId: `${PREFIX}maria-open-books`,
      choices: [
        { id: "citajte", label: "čítajte" },
        {
          id: "citaj",
          label: "čítaj",
          whyWrong:
            "**Čítaj** is for a friend you call ty. Mária says vy to Marek: **čítajte**.",
        },
        {
          id: "citame",
          label: "čítame",
          whyWrong: "**Čítame** means we read: it says what we do, it is not a command.",
        },
      ],
      answerId: "citajte",
      feedback: {
        english: "Marek, read the first sentence aloud.",
        why: "**-te** is for vy, one person formally or several: **čítajte**.",
      },
    },
    {
      id: `${PREFIX}check-test`,
      prompt: "Kedy je test?",
      promptEnglish: "When is the test?",
      replayLineId: `${PREFIX}maria-dont-forget-test`,
      choices: [
        { id: "friday", label: "V piatok." },
        {
          id: "tomorrow",
          label: "Zajtra.",
          whyWrong: "**Zajtra** means tomorrow. Mária says **v piatok**, on Friday.",
        },
        {
          id: "today",
          label: "Dnes.",
          whyWrong:
            "**Dnes** means today. Today they read and write; the test is **v piatok**.",
        },
      ],
      answerId: "friday",
      feedback: {
        english: "Don't forget, there's a test on Friday.",
        why: "Mária says **nezabudnite, v piatok je test**.",
      },
    },
  ],
};

const home: ListeningChapter = {
  id: `${PREFIX}home`,
  stage: "home",
  titleSk: "Doma",
  title: "Dinner at home",
  lines: [
    line(
      "anna-now-at-home",
      "Anna",
      ["A teraz sme doma. Marek, ", mark("pomôž"), " mi s večerou."],
      "And now we're at home. Marek, help me with dinner.",
    ),
    line("marek-what-to-do", "Marek", ["Dobre. Čo mám robiť?"], "OK. What should I do?"),
    line(
      "anna-salad-window",
      "Anna",
      [mark("Urob"), " šalát. ", PAUSE, "A ", mark("zatvor"), " okno, prosím. Je zima."],
      "Make a salad. And close the window, please. It's cold.",
    ),
    line("marek-im-warm", "Marek", ["Zima? ", PAUSE, "Mne je teplo."], "Cold? I'm warm."),
    line(
      "anna-then-dont",
      "Anna",
      [
        "Tak ho ",
        mark("nezatváraj"),
        ". ",
        PAUSE,
        "A ",
        mark("zavolaj"),
        " Lucii. ",
        mark("Nech"),
        " príde na večeru.",
      ],
      "Then don't close it. And call Lucia. Let her come to dinner.",
    ),
    line(
      "marek-lucia-writes",
      "Marek",
      ["Lucia práve píše: ", PAUSE, "Prídem neskôr. ", mark("Jedzte"), " bezo mňa."],
      "Lucia is texting right now: I'll come later. Eat without me.",
      { props: ["phone", "phone"] },
    ),
    line(
      "anna-lets-eat",
      "Anna",
      ["Tak ", mark("jedzme"), "! Dobrú chuť."],
      "Let's eat, then! Enjoy your meal.",
    ),
    line(
      "marek-studio-tomorrow",
      "Marek",
      ["Aj tebe. ", PAUSE, "A zajtra ráno ", mark("poďme"), " skoro do štúdia."],
      "You too. And tomorrow morning let's go to the studio early.",
    ),
  ],
  checks: [
    {
      id: `${PREFIX}check-window`,
      prompt: "Zatvorí Marek okno?",
      promptEnglish: "Does Marek close the window?",
      replayLineId: `${PREFIX}anna-then-dont`,
      choices: [
        { id: "no-warm", label: "Nie, Marekovi je teplo." },
        {
          id: "yes-cold",
          label: "Áno, je zima.",
          whyWrong:
            "**Áno, je zima** means yes, it's cold. Anna says so first, but Marek is warm, and she says **tak ho nezatváraj**.",
        },
        {
          id: "closed",
          label: "Nie, okno je zatvorené.",
          whyWrong:
            "**Okno je zatvorené** means the window is closed. It is open: Anna asks him to close it, then says **nezatváraj ho**.",
        },
      ],
      answerId: "no-warm",
      feedback: {
        english: "Then don't close it.",
        why: "Anna says **tak ho nezatváraj**. A “don't” takes the imperfective: **zatvor**, but **nezatváraj**.",
      },
    },
    {
      id: `${PREFIX}check-jedzte`,
      gap: "Prídem neskôr. ___ bezo mňa.",
      prompt: "Ktoré slovo prečítal Marek?",
      promptEnglish: "Which word did Marek read out?",
      replayLineId: `${PREFIX}marek-lucia-writes`,
      choices: [
        { id: "jedzte", label: "jedzte" },
        {
          id: "jedz",
          label: "jedz",
          whyWrong:
            "**Jedz** is for one person. Lucia writes to both of them: **jedzte**.",
        },
        {
          id: "jedzme",
          label: "jedzme",
          whyWrong:
            "**Jedzme** means let's eat, and Lucia is not there yet. She writes **jedzte**, eat.",
        },
      ],
      answerId: "jedzte",
      feedback: {
        english: "I'll come later. Eat without me.",
        why: "**Jesť** has its own imperative: **jedz**, **jedzte**, **jedzme**.",
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
      "marek-take-care",
      "Marek",
      [mark("Majte"), " sa pekne! Ahojte!"],
      "Take care! Bye!",
    ),
    line(
      "anna-and-the-plant",
      "Anna",
      [SIGH, "Marek? ", PAUSE, "A tá rastlina?"],
      "Marek? And that plant?",
    ),
    line(
      "marek-drink-plant",
      "Marek",
      ["Rastlina! ", PAUSE, "Nech sa páči, rastlinka. ", mark("Pi"), "!"],
      "The plant! Here you go, little plant. Drink!",
    ),
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
      replayLineId: `${PREFIX}marek-drink-plant`,
      choices: [
        { id: "waters", label: "Polieva rastlinu." },
        {
          id: "coffee",
          label: "Pije kávu.",
          whyWrong:
            "**Pije kávu** means he drinks coffee. That was the start of the show; at the end he says **pi!** to the plant.",
        },
        {
          id: "sleeps",
          label: "Spí.",
          whyWrong:
            "**Spí** means he is asleep. At the end he says **nech sa páči, rastlinka, pi!**",
        },
      ],
      answerId: "waters",
      feedback: {
        english: "Here you go, little plant. Drink!",
        why: "Anna asked at the start: **polej tú rastlinu**. At the end Marek says **pi!** to it.",
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
    "Anna and Marek play a verb game, sit in on Mária's class, make dinner and quiz each other, while the studio plant waits for water.",
  grammarSlug: "imperative",
  speakers: ["Anna", "Marek", "Mária"],
  vocabulary: [
    { slovak: "rastlina", english: "plant" },
    { slovak: "okno", english: "window" },
    { slovak: "kniha", english: "book" },
    { slovak: "šalát", english: "salad" },
    { slovak: "Poďme!", english: "Let's go!" },
    { slovak: "Nezabudnite!", english: "Don't forget!" },
  ],
  chapters: [intro, game, classroom, home, quiz, outro],
};
