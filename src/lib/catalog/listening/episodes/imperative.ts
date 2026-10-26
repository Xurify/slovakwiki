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
      ["Ahojte, ", mark("vitajte"), " v podcaste Slovak Wiki! Ja som Anna."],
      "Hi, welcome to the Slovak Wiki podcast! I'm Anna.",
    ),
    line(
      "marek-still-early",
      "Marek",
      [YAWN, "A ja som Marek. ", PAUSE, mark("Prepáčte"), ", je ešte strašne skoro."],
      "And I'm Marek. Sorry, it's still terribly early.",
    ),
    line(
      "anna-dont-sleep",
      "Anna",
      [CHUCKLE, "Tak ", mark("pi"), " tú kávu, Marek. A ", mark("nezaspi"), "!"],
      "Then drink that coffee, Marek. And don't fall asleep!",
      // The coffee is Marek's, so Anna's hands stay empty.
      { props: [null, null] },
    ),
    line(
      "marek-drinking",
      "Marek",
      ["Dobre, dobre. Pijem."],
      "OK, OK. I'm drinking it.",
      {
        props: ["cup"],
      },
    ),
    line(
      "anna-topic",
      "Anna",
      [
        "Počuli ste? ",
        mark("Pi"),
        ", ",
        mark("nezaspi"),
        STOP,
        "Samé rozkazy. ",
        PAUSE,
        "A práve o tom je dnešná epizóda.",
      ],
      "Did you hear? Drink, don't fall asleep… Nothing but commands. And that's exactly what today's episode is about.",
    ),
    line(
      "marek-yellow-plant",
      "Marek",
      [
        "Hm",
        STOP,
        "Rozkazy. ",
        PAUSE,
        "Tak ja mám jeden pre teba: ",
        mark("pozri sa"),
        " na našu rastlinku. Je celá žltá!",
      ],
      "Hm… Commands. Then I've got one for you: look at our little plant. It's all yellow!",
      { to: "Anna" },
    ),
    line(
      "anna-on-you",
      "Anna",
      ["Lebo ju nikto nepolieva. ", PAUSE, "Marek, tento týždeň je to na tebe."],
      "Because nobody waters it. Marek, this week that's on you.",
      { to: "Marek" },
    ),
    line(
      "marek-on-me",
      "Marek",
      [SURPRISED, "Na mne? ", PAUSE, "Aha", STOP, "no jasné."],
      "On me? Oh… right, sure.",
    ),
    line(
      "anna-water-plant",
      "Anna",
      ["Tak ju hneď ", mark("polej"), ", chudinku."],
      "Then water it right away, the poor thing.",
    ),
    line(
      "marek-after-recording",
      "Marek",
      ["Polejem, polejem. ", PAUSE, "Hneď po nahrávaní, sľubujem!"],
      "I will, I will. Right after the recording, I promise!",
    ),
    line(
      "anna-tonight-maria",
      "Anna",
      [CHUCKLE, "Uvidíme. ", PAUSE, "Inak, dnes večer ideme k Márii."],
      "We'll see. By the way, tonight we're going to Mária's.",
    ),
    line(
      "marek-maria-soup",
      "Marek",
      [EXCITED, "Jaj, hej! Ukáže nám, ako robí tú svoju polievku. ", PAUSE, "Mňam."],
      "Oh yes! She's showing us how she makes that soup of hers. Yum.",
    ),
    line(
      "anna-lots-of-orders",
      "Anna",
      ["Mária v kuchyni stále len rozkazuje. ", PAUSE, "Tak ", mark("počúvajte"), "!"],
      "In the kitchen Mária does nothing but give orders. So listen!",
    ),
  ],
  checks: [
    {
      id: `${PREFIX}check-topic`,
      prompt: "O čom je dnešná epizóda?",
      promptEnglish: "What is today's episode about?",
      replayLineId: `${PREFIX}anna-topic`,
      choices: [
        { id: "imperative", label: "O rozkazoch." },
        {
          id: "coffee",
          label: "O káve.",
          whyWrong:
            "**O káve** means about coffee. Anna tells Marek to drink it, then says the episode is about commands: **samé rozkazy**.",
        },
        {
          id: "plants",
          label: "O rastlinách.",
          whyWrong:
            "**O rastlinách** means about plants. One needs water, but the episode is about commands: **samé rozkazy**.",
        },
      ],
      answerId: "imperative",
      feedback: {
        english:
          "Nothing but commands. And that's exactly what today's episode is about.",
        why: "Anna says **samé rozkazy… a práve o tom je dnešná epizóda**.",
      },
    },
    {
      id: `${PREFIX}check-plant`,
      prompt: "Prečo je rastlinka žltá?",
      promptEnglish: "Why is the little plant yellow?",
      replayLineId: `${PREFIX}anna-on-you`,
      choices: [
        { id: "no-water", label: "Nikto ju nepolieva." },
        {
          id: "old",
          label: "Je stará.",
          whyWrong:
            "**Je stará** means it's old. Anna gives another reason: **nikto ju nepolieva**.",
        },
        {
          id: "every-day",
          label: "Marek ju polieva každý deň.",
          whyWrong:
            "Marek is surprised it's his job, so he doesn't water it. Anna says **nikto ju nepolieva**: nobody waters it.",
        },
      ],
      answerId: "no-water",
      feedback: {
        english: "Because nobody waters it.",
        why: "Anna says **lebo ju nikto nepolieva**: because nobody waters it.",
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
      "anna-back-in-studio",
      "Anna",
      ["Je ráno a sme späť v štúdiu."],
      "It's morning and we're back in the studio.",
    ),
    line(
      "marek-game-now",
      "Marek",
      [EXCITED, "Včera u Márie sme počuli veľa rozkazov. ", PAUSE, "Tak teraz hra!"],
      "Yesterday at Mária's we heard lots of commands. So now, a game!",
    ),
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
      "maria-counting-veg",
      "Mária",
      ["Tak", STOP, "mrkva, zemiaky, cibuľa", STOP],
      "Right… carrots, potatoes, onion…",
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
      "marek-parking",
      "Marek",
      ["Dobrý večer! ", mark("Prepáčte"), ", ešte som parkoval."],
      "Good evening! Sorry, I was still parking.",
    ),
    line(
      "maria-wash-hands",
      "Mária",
      [
        "No, ",
        mark("poďte"),
        ", ",
        mark("poďte"),
        ". ",
        PAUSE,
        "Najprv si ",
        mark("umyte"),
        " ruky, tamto pri dreze.",
      ],
      "Come on, come on. First wash your hands, over there at the sink.",
    ),
    line(
      "anna-help-with",
      "Anna",
      ["Tak. ", PAUSE, "S čím vám pomôžeme?"],
      "Right. What can we help you with?",
      { to: "Mária" },
    ),
    line(
      "maria-peel-take-pot",
      "Mária",
      [
        "Anna, ",
        mark("ošúp"),
        " a ",
        mark("nakrájaj"),
        " mrkvu. ",
        PAUSE,
        "A ty, Marek, ",
        mark("zober"),
        " ten veľký hrniec.",
      ],
      "Anna, peel and chop the carrots. And you, Marek, take that big pot.",
    ),
    line(
      "marek-heavy-pot",
      "Marek",
      ["Tento? ", PAUSE, "No ten je ale ťažký!"],
      "This one? Wow, it's heavy!",
    ),
    line(
      "maria-fill-pot",
      "Mária",
      ["Hej, ten. ", mark("Napusti"), " doň vodu a ", mark("daj"), " ho na sporák."],
      "Yes, that one. Fill it with water and put it on the stove.",
      { to: "Marek" },
    ),
    line("anna-like-this", "Anna", ["Pani Mária, takto?"], "Mária, like this?", {
      to: "Mária",
    }),
    line(
      "maria-smaller-pieces",
      "Mária",
      ["Nie, nie, menšie kúsky. ", PAUSE, mark("Pozri sa"), ", takto."],
      "No, no, smaller pieces. Look, like this.",
      { to: "Anna" },
    ),
    line(
      "maria-salt",
      "Mária",
      ["Marek, ", mark("daj"), " tam soľ. ", PAUSE, "Ale len trošku!"],
      "Marek, put the salt in. But just a little!",
      { to: "Marek" },
    ),
    line(
      "marek-a-little",
      "Marek",
      ["Trošku", STOP, PAUSE, "takto?"],
      "A little… like this?",
    ),
    line(
      "maria-not-a-little",
      "Mária",
      [SIGH, "Marek! ", PAUSE, "Preboha, to nie je trošku!"],
      "Marek! Good grief, that's not a little!",
    ),
    line(
      "anna-top-up",
      "Anna",
      [CHUCKLE, "Nevadí. ", PAUSE, "Dolejeme vodu."],
      "Never mind. We'll top it up with water.",
    ),
    line(
      "maria-soup-ready",
      "Mária",
      [
        "Tak, polievka je hotová. ",
        PAUSE,
        "Marek, ",
        mark("ochutnaj"),
        ". ",
        PAUSE,
        "Pozor, je horúca!",
      ],
      "Right, the soup's ready. Marek, taste it. Careful, it's hot!",
      {
        act: [
          { do: "go", to: "stove", on: "before" },
          { do: "take", what: "lid", on: "polievka" },
          { do: "take", what: "spoon", on: "hotová" },
          { who: "marek", do: "go", to: "maria", on: "Marek" },
          { do: "dip", what: "spoon", to: "pot" },
          { do: "offer", what: "spoon", to: "marek", on: "Pozor" },
          { who: "marek", do: "camera", to: "marek", zoom: 1.7, on: "horúca" },
        ],
      },
    ),
    line(
      "marek-burns",
      "Marek",
      [SURPRISED, "Au! ", PAUSE, "To páli!"],
      "Ow! That burns!",
      {
        act: [
          { do: "take", what: "spoon", on: "before" },
          { do: "taste", what: "spoon" },
          { do: "burn", on: "Au" },
        ],
      },
    ),
    line(
      "anna-is-it-good",
      "Anna",
      [CHUCKLE, "No ", mark("povedz"), ", je dobrá?"],
      "Well, tell us, is it good?",
      {
        to: "Marek",
        act: [
          { do: "camera", to: "wide", on: "start" },
          { who: "maria", do: "put", what: "lid", to: "pot", on: "start" },
          { who: "marek", do: "blow", what: "spoon", on: "povedz" },
        ],
      },
    ),
    line(
      "marek-bit-salty",
      "Marek",
      [HAPPY, "Výborná! ", PAUSE, "Trochu slaná", STOP, "ale výborná."],
      "Excellent! A bit salty… but excellent.",
    ),
  ],
  checks: [
    {
      id: `${PREFIX}check-soup`,
      prompt: "Aká je polievka?",
      promptEnglish: "What is the soup like?",
      replayLineId: `${PREFIX}marek-bit-salty`,
      choices: [
        { id: "salty", label: "Výborná, ale trochu slaná." },
        {
          id: "cold",
          label: "Studená.",
          whyWrong:
            "**Studená** means cold. It is the opposite: Mária says **pozor, je horúca**.",
        },
        {
          id: "no-salt",
          label: "Bez soli.",
          whyWrong:
            "**Bez soli** means without salt. Marek put in far too much, so it is **trochu slaná**.",
        },
      ],
      answerId: "salty",
      feedback: {
        english: "Excellent! A bit salty… but excellent.",
        why: "Marek put in too much salt, so it is **trochu slaná… ale výborná**.",
      },
    },
    {
      id: `${PREFIX}check-umyte`,
      gap: "Najprv si ___ ruky, tamto pri dreze.",
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
        english: "First wash your hands, over there at the sink.",
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
      "maria-sit-down",
      "Mária",
      [
        "Tak, ",
        mark("sadnite"),
        " si. ",
        PAUSE,
        "A Lucia stále nikde? ",
        PAUSE,
        "Veď mala prísť.",
      ],
      "Right, sit down. And still no Lucia? She was supposed to come.",
    ),
    line("anna-late-again", "Anna", ["Asi zase mešká."], "Probably late again."),
    line(
      "marek-its-her",
      "Marek",
      [
        mark("Počkajte"),
        ", zvoní mi telefón",
        STOP,
        "To je ona! ",
        PAUSE,
        "Ahoj, Lucia!",
      ],
      "Wait, my phone's ringing… It's her! Hi, Lucia!",
      { ring: "call" },
    ),
    line(
      "lucia-eat-without-me",
      "Lucia",
      [
        "Ahoj! ",
        mark("Prepáčte"),
        ", ešte som v práci. ",
        PAUSE,
        mark("Nečakajte"),
        " na mňa, pokojne ",
        mark("jedzte"),
        ".",
      ],
      "Hi! Sorry, I'm still at work. Don't wait for me, go ahead and eat.",
      { overPhone: true },
    ),
    line(
      "marek-come",
      "Marek",
      [EXCITED, "Nie, nie, ", mark("príď"), "! Polievka je výborná."],
      "No, no, come! The soup is excellent.",
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
      ["Dobre, tak som tam o pol hodiny. ", PAUSE, "Čau!"],
      "OK, then I'll be there in half an hour. Bye!",
      { overPhone: true },
    ),
    line(
      "marek-shes-coming",
      "Marek",
      ["Čau! ", PAUSE, HAPPY, "Príde o pol hodiny."],
      "Bye! She's coming in half an hour.",
    ),
    line(
      "anna-we-will-wait",
      "Anna",
      ["Tak na ňu počkáme, nie?"],
      "Then we'll wait for her, right?",
      { to: "Mária" },
    ),
    line(
      "maria-then-wait",
      "Mária",
      [CHUCKLE, "No dobre, počkáme. ", PAUSE, "Polievku potom zohrejem."],
      "Well, all right, we'll wait. I'll warm the soup up later.",
    ),
  ],
  checks: [
    {
      id: `${PREFIX}check-jedzte`,
      gap: "Nečakajte na mňa, pokojne ___.",
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
        english: "Don't wait for me, go ahead and eat.",
        why: "**Jesť** has its own imperative: **jedz**, **jedzte**, **jedzme**.",
      },
    },
    {
      id: `${PREFIX}check-why-wait`,
      prompt: "Prečo ešte nejedia?",
      promptEnglish: "Why aren't they eating yet?",
      replayLineId: `${PREFIX}anna-we-will-wait`,
      choices: [
        { id: "lucia", label: "Čakajú na Luciu." },
        {
          id: "hot",
          label: "Polievka je horúca.",
          whyWrong:
            "It was hot, but that is not why. Anna says **tak na ňu počkáme**: then we'll wait for her.",
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
        english: "Then we'll wait for her, right?",
        why: "Lucia is coming in half an hour, and Anna says **tak na ňu počkáme**. Mária agrees: **počkáme**.",
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
      "marek-right-or-wrong",
      "Marek",
      ["Ďakujem. ", PAUSE, "A teraz ty, Anna: správne alebo nesprávne?"],
      "Thanks. And now it's your turn, Anna: right or wrong?",
    ),
    line(
      "marek-first-sentence",
      "Marek",
      ["Prvá veta: ", PAUSE, "Nezatvor dvere."],
      "First sentence: Nezatvor dvere. (Wrong on purpose.)",
    ),
    afterThinking(
      line(
        "anna-nezatvaraj",
        "Anna",
        ["Nesprávne! ", PAUSE, "Správne je: ", mark("Nezatváraj"), " dvere."],
        "Wrong! The right one is: Nezatváraj dvere, don't close the door.",
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
          id: "door",
          label: "Nezatvor dvere.",
          whyWrong:
            "Anna says **nesprávne**: a “don't” takes the imperfective, **nezatváraj dvere**.",
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
      "marek-right-away",
      "Marek",
      [SURPRISED, "Rastlinka! ", PAUSE, "Hneď!"],
      "The little plant! Right away!",
    ),
    line(
      "marek-sorry-plant",
      "Marek",
      ["Prepáč, rastlinka. ", PAUSE, "Tu máš vodu."],
      "Sorry, little plant. Here's some water.",
      // He pours from the watering can by the plant, not from his coffee cup.
      { props: [null, null] },
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
        why: "Anna said at the start: **tak ju hneď polej**. Marek promised to do it after the recording, but only now says **prepáč, rastlinka, tu máš vodu**.",
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
    "Anna and Marek cook soup at Mária's and take Lucia's call, then play a verb game and quiz each other the next morning, while the studio plant waits for water.",
  grammarSlug: "imperative",
  speakers: ["Anna", "Marek", "Mária", "Lucia"],
  vocabulary: [
    { slovak: "rastlinka", english: "little plant" },
    { slovak: "polievka", english: "soup" },
    { slovak: "soľ", english: "salt" },
    { slovak: "hrniec", english: "pot" },
    { slovak: "Choď!", english: "Go!" },
    { slovak: "Nezabudnite!", english: "Don't forget!" },
  ],
  chapters: [intro, kitchen, table, game, quiz, outro],
};
