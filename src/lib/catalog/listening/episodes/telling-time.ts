import type { MarkedPart } from "$lib/learning/marked-text";
import {
  CHUCKLE,
  PAUSE,
  SIGH,
  STOP,
  afterThinking,
  lineWriter,
  rightOrWrong,
  staged,
} from "../dialogue";
import type { Cue } from "$lib/stick-figure/acts";
import type { ListeningChapter, ListeningEpisode } from "../types";

const PREFIX = "podcast-telling-time-";
const line = lineWriter(PREFIX);

/** A clock phrase, the episode's topic, lit in the transcript. */
function mark(text: string): Exclude<MarkedPart, string> {
  return { role: "time", text };
}

/** Marek comes in late through the studio door, takes his place and sits down. */
const INTRO_ACTS: Record<string, Cue[]> = {
  "marek-sorry-late": [
    { do: "enter", to: "inside", on: "before" },
    { do: "sit", to: "desk-right", on: "start" },
  ],
};

const intro: ListeningChapter = {
  id: `${PREFIX}intro`,
  titleSk: "Úvod",
  title: "Marek is late",
  // His headphones wait on the desk at his place until he comes in.
  setup: {
    objects: [
      {
        id: "marek-headphones",
        kind: "headphones",
        start: { where: { on: "desk", dx: 38 }, of: "marek" },
      },
    ],
  },
  lines: staged(
    PREFIX,
    [
      line(
        "anna-this-is-podcast",
        "Anna",
        [
          "Ahojte! Tu je podcast Slovak Wiki. Ja som Anna. ",
          PAUSE,
          "A Marek",
          STOP,
          PAUSE,
          "tu nie je.",
        ],
        "Hi! This is the Slovak Wiki podcast. I'm Anna. And Marek… isn't here.",
      ),
      line(
        "marek-sorry-late",
        "Marek",
        ["Ahojte! Prepáč, Anna, meškám."],
        "Hi! Sorry, Anna, I'm late.",
      ),
      line(
        "anna-what-time",
        "Anna",
        ["Marek! ", mark("Koľko je hodín"), "?"],
        "Marek! What time is it?",
      ),
      line(
        "marek-half-past-nine",
        "Marek",
        ["Je", STOP, PAUSE, mark("pol desiatej"), "."],
        "It's… half past nine.",
      ),
      line(
        "anna-recording-half-past-eight",
        "Anna",
        [
          "Áno, je ",
          mark("pol desiatej"),
          ". ",
          PAUSE,
          "A naša nahrávka je ",
          mark("o pol deviatej"),
          "!",
        ],
        "Yes, it's half past nine. And our recording is at half past eight!",
      ),
      line(
        "marek-thought-nine-thirty",
        "Marek",
        [mark("Pol deviatej"), STOP, PAUSE, "Ja som myslel, že to je deväť tridsať."],
        "Half past eight… I thought that was nine thirty.",
      ),
      line(
        "anna-eight-thirty-topic",
        "Anna",
        [
          "Nie, Marek. ",
          mark("Pol deviatej"),
          " je osem tridsať. ",
          PAUSE,
          "A to je dnešná téma: ",
          mark("koľko je hodín"),
          ".",
        ],
        "No, Marek. Half past eight is eight thirty. And that's today's topic: what time it is.",
      ),
      line(
        "marek-good-topic-for-me",
        "Marek",
        ["Dobrá téma. ", PAUSE, "Pre mňa."],
        "Good topic. For me.",
      ),
      line(
        "anna-yes-for-you",
        "Anna",
        ["Áno, pre teba. Ideme na to!"],
        "Yes, for you. Let's get to it!",
      ),
    ],
    INTRO_ACTS,
  ),
  checks: [
    {
      id: `${PREFIX}check-time-marek-arrives`,
      prompt: "Koľko je hodín, keď príde Marek?",
      promptEnglish: "What time is it when Marek arrives?",
      replayLineId: `${PREFIX}marek-half-past-nine`,
      choices: [
        { id: "nine-thirty", label: "Pol desiatej, deväť tridsať." },
        {
          id: "eight-thirty",
          label: "Pol deviatej, osem tridsať.",
          whyWrong:
            "**Pol deviatej** is when the recording starts. Marek says **je pol desiatej**.",
        },
        {
          id: "ten",
          label: "Desať hodín.",
          whyWrong:
            "**Desať hodín** is ten o'clock. **Pol desiatej** is on the way to ten: nine thirty.",
        },
      ],
      answerId: "nine-thirty",
      feedback: {
        english: "It's… half past nine.",
        why: "**Pol desiatej** names the hour ahead, ten, and means half past nine.",
      },
    },
    {
      id: `${PREFIX}check-recording-when`,
      prompt: "Kedy je nahrávka?",
      promptEnglish: "When is the recording?",
      replayLineId: `${PREFIX}anna-recording-half-past-eight`,
      choices: [
        { id: "half-past-eight", label: "O pol deviatej." },
        {
          id: "half-past-nine",
          label: "O pol desiatej.",
          whyWrong: "**O pol desiatej** is at half past nine, when Marek comes in.",
        },
        {
          id: "nine",
          label: "O deviatej.",
          whyWrong: "**O deviatej** is at nine. Anna says **o pol deviatej**.",
        },
      ],
      answerId: "half-past-eight",
      feedback: {
        english: "And our recording is at half past eight!",
        why: "Anna says **o pol deviatej**: **o** + the time, so **o pol** for a half hour.",
      },
    },
  ],
};

const clockGame: ListeningChapter = {
  id: `${PREFIX}clock-game`,
  titleSk: "Hra s hodinami",
  title: "The clock game",
  lines: [
    line(
      "anna-game-rules",
      "Anna",
      ["Malá hra. ", PAUSE, "Ja poviem čas po slovensky a ty povieš čísla."],
      "A small game. I'll say the time in Slovak and you'll say the numbers.",
    ),
    line("marek-ok", "Marek", ["Dobre."], "OK."),
    line(
      "anna-two-oclock",
      "Anna",
      ["Prvý čas: ", mark("sú dve hodiny"), "."],
      "First time: it's two o'clock.",
    ),
    line(
      "marek-two-zero-zero",
      "Marek",
      ["Ľahké. Dve nula nula."],
      "Easy. Two zero zero.",
    ),
    line(
      "anna-quarter-past-two",
      "Anna",
      ["Správne. Druhý čas: ", mark("je štvrť na tri"), "."],
      "Right. Second time: it's quarter past two.",
    ),
    line(
      "marek-three-fifteen",
      "Marek",
      [mark("Štvrť na tri"), STOP, PAUSE, "tri pätnásť?"],
      "Quarter past two… three fifteen? (Wrong on purpose.)",
    ),
    line(
      "anna-two-fifteen",
      "Anna",
      [
        "Nie! ",
        mark("Štvrť na tri"),
        " je dve pätnásť. ",
        PAUSE,
        "Slovenčina sa pozerá dopredu, na tretiu hodinu.",
      ],
      "No! Quarter past two is two fifteen. Slovak looks ahead, to the third hour.",
    ),
    line(
      "marek-half-past-two",
      "Marek",
      [
        "Aha. ",
        mark("Štvrť na tri"),
        ", dve pätnásť. ",
        PAUSE,
        "A ",
        mark("pol tretej"),
        " je dve tridsať!",
      ],
      "I see. Quarter past two, two fifteen. And half past two is two thirty!",
    ),
    line(
      "anna-quarter-to-three",
      "Anna",
      ["Presne tak! A ", mark("trištvrte na tri"), "?"],
      "Exactly! And quarter to three?",
    ),
    line(
      "marek-two-forty-five",
      "Marek",
      ["Hm… ", PAUSE, "dve štyridsaťpäť!"],
      "Hmm… two forty-five!",
    ),
    line(
      "anna-five-oclock",
      "Anna",
      ["Výborne! Tretí čas: ", mark("je päť hodín"), "."],
      "Excellent! Third time: it's five o'clock.",
    ),
    line(
      "marek-why-je-and-su",
      "Marek",
      [
        "Päť nula nula. ",
        PAUSE,
        "Prečo ",
        mark("je päť hodín"),
        ", ale ",
        mark("sú dve hodiny"),
        "?",
      ],
      "Five zero zero. Why is it je päť hodín, but sú dve hodiny?",
    ),
    line(
      "anna-one-two-five",
      "Anna",
      [
        mark("Jedna hodina"),
        ", ",
        mark("dve hodiny"),
        ", ",
        mark("päť hodín"),
        ". ",
        PAUSE,
        "Je jedna, sú dve, tri, štyri, a je päť.",
      ],
      "One hour, two hours, five hours. Je for one, sú for two, three, four, and je again for five.",
    ),
    line(
      "marek-now-i-know",
      "Marek",
      [
        mark("Je jedna hodina"),
        ". ",
        mark("Sú dve hodiny"),
        ". ",
        mark("Je päť hodín"),
        ". ",
        PAUSE,
        "Už viem.",
      ],
      "Je jedna hodina. Sú dve hodiny. Je päť hodín. Now I know.",
    ),
    line(
      "anna-lets-go-to-stop",
      "Anna",
      [
        "Super. A teraz poďme von, na zastávku. ",
        PAUSE,
        "Naša električka ide ",
        mark("o desiatej"),
        ".",
      ],
      "Great. And now let's go out, to the tram stop. Our tram goes at ten.",
    ),
  ],
  checks: [
    {
      id: `${PREFIX}check-quarter-past-two`,
      prompt: "Koľko je štvrť na tri?",
      promptEnglish: "What time is štvrť na tri?",
      replayLineId: `${PREFIX}anna-two-fifteen`,
      choices: [
        { id: "two-fifteen", label: "Dve pätnásť." },
        {
          id: "three-fifteen",
          label: "Tri pätnásť.",
          whyWrong:
            "**Tri pätnásť** is Marek's guess, and Anna says **nie**. The hour named is the one ahead.",
        },
        {
          id: "two-forty-five",
          label: "Dve štyridsaťpäť.",
          whyWrong:
            "**Dve štyridsaťpäť** is **trištvrte na tri**, three quarters of the way to three.",
        },
      ],
      answerId: "two-fifteen",
      feedback: {
        english: "Quarter past two is two fifteen.",
        why: "**Štvrť na tri** is a quarter of the way to three: 02:15.",
      },
    },
    {
      id: `${PREFIX}check-su-form`,
      gap: "___ dve hodiny.",
      prompt: "Ktoré slovo povedala Anna?",
      promptEnglish: "Which word did Anna say?",
      replayLineId: `${PREFIX}anna-two-oclock`,
      choices: [
        { id: "su", label: "Sú" },
        {
          id: "je",
          label: "Je",
          whyWrong:
            "**Je** goes with one hour and with five or more: **je jedna hodina**, **je päť hodín**.",
        },
        {
          id: "ma",
          label: "Má",
          whyWrong: "**Má** means has. Clock time uses **byť**: **je** or **sú**.",
        },
      ],
      answerId: "su",
      feedback: {
        english: "It's two o'clock.",
        why: "Two, three and four take **sú** and **hodiny**: **sú dve hodiny**.",
      },
    },
    {
      id: `${PREFIX}check-tram-when`,
      prompt: "Kedy ide ich električka?",
      promptEnglish: "When does their tram go?",
      replayLineId: `${PREFIX}anna-lets-go-to-stop`,
      choices: [
        { id: "ten", label: "O desiatej." },
        {
          id: "nine",
          label: "O deviatej.",
          whyWrong: "**O deviatej** is at nine. Anna says **o desiatej**, at ten.",
        },
        {
          id: "two",
          label: "O druhej.",
          whyWrong: "**O druhej** is at two. Two o'clock was only a time in the game.",
        },
      ],
      answerId: "ten",
      feedback: {
        english: "Our tram goes at ten.",
        why: "Anna says **o desiatej**: **o** + the hour for a time on the clock.",
      },
    },
  ],
};

const tramStop: ListeningChapter = {
  id: `${PREFIX}tram-stop`,
  stage: "street",
  titleSk: "Na zastávke",
  title: "At the tram stop: at ten, in fifteen minutes",
  lines: [
    line(
      "marek-now-at-stop",
      "Marek",
      ["Teraz sme na ulici, na zastávke."],
      "Now we're on the street, at the tram stop.",
    ),
    line(
      "anna-what-time-marek",
      "Anna",
      [mark("Koľko je hodín"), ", Marek?"],
      "What time is it, Marek?",
    ),
    line(
      "marek-quarter-to-ten",
      "Marek",
      ["Je ", mark("trištvrte na desať"), "."],
      "It's quarter to ten.",
    ),
    line(
      "anna-wait-fifteen",
      "Anna",
      [
        "Dobre. Električka ide ",
        mark("o desiatej"),
        ". ",
        PAUSE,
        "Čakáme pätnásť minút.",
      ],
      "OK. The tram goes at ten. We wait fifteen minutes.",
    ),
    line(
      "marek-in-fifteen-minutes",
      "Marek",
      ["Takže električka príde ", mark("o pätnásť minút"), "."],
      "So the tram comes in fifteen minutes.",
    ),
    line(
      "anna-time-vs-how-long",
      "Anna",
      [
        "Áno. ",
        mark("O desiatej"),
        ", to je čas na hodinách. ",
        PAUSE,
        mark("O pätnásť minút"),
        ", to je, ako dlho čakáme.",
      ],
      "Yes. At ten, that's the time on the clock. In fifteen minutes, that's how long we wait.",
    ),
    line(
      "marek-table-at-eleven",
      "Marek",
      ["Aha. ", PAUSE, "A stôl v kaviarni máme ", mark("o jedenástej"), ", áno?"],
      "I see. And we have the table at the café at eleven, right?",
    ),
    line(
      "anna-yes-at-eleven",
      "Anna",
      ["Áno, ", mark("o jedenástej"), "."],
      "Yes, at eleven.",
    ),
    line(
      "marek-tram-coming",
      "Marek",
      ["Pozri, už ide električka!"],
      "Look, the tram is coming!",
    ),
    line(
      "anna-exactly-ten",
      "Anna",
      ["Je presne ", mark("desať hodín"), ". ", PAUSE, "Nastúpme!"],
      "It's exactly ten o'clock. Let's get on!",
    ),
  ],
  checks: [
    {
      id: `${PREFIX}check-how-long-wait`,
      prompt: "Ako dlho čakajú na električku?",
      promptEnglish: "How long do they wait for the tram?",
      replayLineId: `${PREFIX}anna-wait-fifteen`,
      choices: [
        { id: "fifteen", label: "Pätnásť minút." },
        {
          id: "five",
          label: "Päť minút.",
          whyWrong: "**Päť minút** is five minutes. Anna says **pätnásť minút**.",
        },
        {
          id: "hour",
          label: "Hodinu.",
          whyWrong:
            "**Hodinu** is an hour. It is quarter to ten and the tram goes at ten.",
        },
      ],
      answerId: "fifteen",
      feedback: {
        english: "We wait fifteen minutes.",
        why: "From **trištvrte na desať** to **desať hodín** is **pätnásť minút**: five and more take **minút**.",
      },
    },
    {
      id: `${PREFIX}check-o-forms`,
      prompt: "Čo znamená „o pätnásť minút“?",
      promptEnglish: "What does “o pätnásť minút” mean?",
      replayLineId: `${PREFIX}anna-time-vs-how-long`,
      choices: [
        { id: "how-long", label: "Ako dlho čakáme." },
        {
          id: "clock",
          label: "Čas na hodinách.",
          whyWrong:
            "**Čas na hodinách** is a time on the clock, like **o desiatej**. Anna says that is the other one.",
        },
        {
          id: "late",
          label: "Električka mešká.",
          whyWrong:
            "**Električka mešká** means the tram is late. Nobody says that; it comes exactly at ten.",
        },
      ],
      answerId: "how-long",
      feedback: {
        english: "In fifteen minutes, that's how long we wait.",
        why: "**O** + a number of minutes or hours says how long from now: **o pätnásť minút**. **O desiatej** is the clock.",
      },
    },
    {
      id: `${PREFIX}check-cafe-table`,
      prompt: "Kedy majú stôl v kaviarni?",
      promptEnglish: "When do they have the table at the café?",
      replayLineId: `${PREFIX}marek-table-at-eleven`,
      choices: [
        { id: "eleven", label: "O jedenástej." },
        {
          id: "ten",
          label: "O desiatej.",
          whyWrong:
            "**O desiatej** is when the tram goes. The table is **o jedenástej**.",
        },
        {
          id: "twelve",
          label: "O dvanástej.",
          whyWrong:
            "**O dvanástej** is at twelve. Marek says **o jedenástej** and Anna agrees.",
        },
      ],
      answerId: "eleven",
      feedback: {
        english: "And we have the table at the café at eleven, right?",
        why: "**O jedenástej**: **o** + the hour's ordinal form, as in **o tretej**, **o desiatej**.",
      },
    },
  ],
};

const CAFE_ACTS: Record<string, Cue[]> = {
  // He fetches the coffees from the back, past the stage's edge, while they talk.
  "waiter-right-away": [
    { do: "go", to: "back", on: "end" },
    { do: "take", what: "anna-cup" },
    { do: "take", what: "marek-cup" },
  ],
  "marek-at-three-around-two": [{ who: "waiter", do: "go", to: "waiter", on: "start" }],
  // Both to Marek, beside him: Anna is past Marek, out of his reach.
  "waiter-here-two-coffees": [
    { do: "give", what: "marek-cup", to: "marek", on: "páči" },
    { do: "give", what: "anna-cup", to: "marek", on: "kávy" },
  ],
  "anna-when-do-you-close": [
    { who: "marek", do: "give", what: "anna-cup", to: "anna", on: "start" },
    { do: "nod", on: "ďakujeme" },
  ],
};

const cafe: ListeningChapter = {
  id: `${PREFIX}cafe`,
  stage: "cafe",
  titleSk: "V kaviarni",
  title: "At the café: at three, or in three hours?",
  setup: {
    objects: [
      {
        id: "anna-cup",
        kind: "cup",
        start: { where: { on: "back", dx: -6 }, fill: "coffee" },
      },
      {
        id: "marek-cup",
        kind: "cup",
        start: { where: { on: "back", dx: 6 }, fill: "coffee" },
      },
    ],
  },
  lines: staged(
    PREFIX,
    [
      line(
        "anna-now-in-cafe",
        "Anna",
        ["Teraz sme v kaviarni."],
        "Now we're at the café.",
      ),
      line(
        "waiter-what-will-you-have",
        "Waiter",
        ["Dobrý deň! Čo si dáte?"],
        "Good day! What will you have?",
      ),
      line(
        "marek-two-coffees",
        "Marek",
        ["Dobrý deň. Dáme si dve kávy, prosím."],
        "Good day. We'll have two coffees, please.",
        { to: "Waiter" },
      ),
      line("waiter-right-away", "Waiter", ["Hneď to bude."], "Coming right up."),
      line(
        "anna-what-time-cafe",
        "Anna",
        ["Marek, ", mark("koľko je hodín"), "?"],
        "Marek, what time is it?",
      ),
      line(
        "marek-eleven-oh-five",
        "Marek",
        ["Je ", mark("jedenásť hodín a päť minút"), "."],
        "It's five past eleven.",
      ),
      line(
        "anna-guest-at-three",
        "Anna",
        ["Dobre. ", mark("O tretej"), " máme v štúdiu hosťa."],
        "Good. At three we have a guest in the studio.",
      ),
      line(
        "marek-in-three-hours",
        "Marek",
        [mark("O tri hodiny"), "? ", PAUSE, "To je o druhej!"],
        "In three hours? That's at two! (He misheard, on purpose.)",
      ),
      line(
        "anna-not-in-three-hours",
        "Anna",
        [
          "Nie, Marek. Nie ",
          mark("o tri hodiny"),
          ". ",
          mark("O tretej"),
          ". ",
          PAUSE,
          mark("O tretej"),
          " je čas na hodinách: tri nula nula.",
        ],
        "No, Marek. Not in three hours. At three. At three is a time on the clock: three zero zero.",
      ),
      line(
        "marek-at-three-around-two",
        "Marek",
        [
          "Aha! ",
          mark("O tretej"),
          ", tri hodiny. ",
          PAUSE,
          "A ",
          mark("o tri hodiny"),
          " je okolo druhej.",
        ],
        "Oh! At three, three o'clock. And in three hours is around two.",
      ),
      line(
        "waiter-here-two-coffees",
        "Waiter",
        ["Nech sa páči, dve kávy."],
        "Here you are, two coffees.",
      ),
      line(
        "anna-when-do-you-close",
        "Anna",
        ["Ďakujeme. ", PAUSE, "Kedy zatvárate?"],
        "Thank you. When do you close?",
        { to: "Waiter" },
      ),
      line(
        "waiter-close-at-six",
        "Waiter",
        ["Dnes zatvárame ", mark("o šiestej"), " večer."],
        "Today we close at six in the evening.",
      ),
      line(
        "marek-seven-hours-time",
        "Marek",
        [mark("O šiestej"), STOP, PAUSE, "to je ", mark("o sedem hodín"), ". Máme čas!"],
        "At six… that's in seven hours. We have time!",
      ),
      line(
        "anna-back-at-half-past-twelve",
        "Anna",
        [
          "Máme čas na kávu, nie na sedem hodín. ",
          PAUSE,
          mark("O pol jednej"),
          " ideme späť.",
        ],
        "We have time for a coffee, not for seven hours. At half past twelve we go back.",
      ),
      line(
        "marek-twelve-thirty",
        "Marek",
        [mark("Pol jednej"), STOP, PAUSE, "dvanásť tridsať. Dobre."],
        "Half past twelve… twelve thirty. OK.",
      ),
    ],
    CAFE_ACTS,
  ),
  checks: [
    {
      id: `${PREFIX}check-guest-when`,
      prompt: "Kedy majú v štúdiu hosťa?",
      promptEnglish: "When do they have a guest in the studio?",
      replayLineId: `${PREFIX}anna-not-in-three-hours`,
      choices: [
        { id: "at-three", label: "O tretej, tri nula nula." },
        {
          id: "in-three-hours",
          label: "O tri hodiny.",
          whyWrong:
            "**O tri hodiny** means in three hours from now. Anna says **nie o tri hodiny**.",
        },
        {
          id: "at-two",
          label: "O druhej.",
          whyWrong: "**O druhej** is at two, Marek's wrong sum. Anna says **o tretej**.",
        },
      ],
      answerId: "at-three",
      feedback: {
        english: "At three is a time on the clock: three zero zero.",
        why: "**O tretej** is a point on the clock; **o tri hodiny** is a span from now.",
      },
    },
    {
      id: `${PREFIX}check-close-form`,
      gap: "Dnes zatvárame ___ večer.",
      prompt: "Čo povedal čašník?",
      promptEnglish: "What did the waiter say?",
      replayLineId: `${PREFIX}waiter-close-at-six`,
      choices: [
        { id: "o-siestej", label: "o šiestej" },
        {
          id: "o-sest-hodin",
          label: "o šesť hodín",
          whyWrong:
            "**O šesť hodín** means in six hours. The café closes at a set time: **o šiestej**.",
        },
        {
          id: "sest-hodin",
          label: "šesť hodín",
          whyWrong:
            "**Šesť hodín** on its own is six o'clock, or six hours. A time for an action takes **o**: **o šiestej**.",
        },
      ],
      answerId: "o-siestej",
      feedback: {
        english: "Today we close at six in the evening.",
        why: "**O šiestej**: **o** + the ordinal for at six. **Večer** says it is the evening six.",
      },
    },
    {
      id: `${PREFIX}check-half-past-twelve`,
      prompt: "Koľko je pol jednej?",
      promptEnglish: "What time is pol jednej?",
      replayLineId: `${PREFIX}marek-twelve-thirty`,
      choices: [
        { id: "twelve-thirty", label: "Dvanásť tridsať." },
        {
          id: "one-thirty",
          label: "Jedna tridsať.",
          whyWrong: "**Jedna tridsať** would be **pol druhej**: half of the way to two.",
        },
        {
          id: "twelve",
          label: "Dvanásť hodín.",
          whyWrong:
            "**Dvanásť hodín** is twelve o'clock, noon. **Pol jednej** is half an hour later.",
        },
      ],
      answerId: "twelve-thirty",
      feedback: {
        english: "Half past twelve… twelve thirty.",
        why: "**Pol jednej** is halfway to one: 12:30. **Jednej** because **hodina** is feminine.",
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
      "anna-back-one-oclock",
      "Anna",
      [
        "Sme späť v štúdiu a ",
        mark("je jedna hodina"),
        ". ",
        PAUSE,
        "Teraz malá skúška z hodín pre Mareka.",
      ],
      "We're back in the studio and it's one o'clock. Now a little test on telling time for Marek.",
    ),
    line(
      "anna-the-rules",
      "Anna",
      ["Marek povie vetu a vy hádajte: je správna, alebo nesprávna?"],
      "Marek says a sentence and you guess: is it right, or wrong?",
    ),
    line(
      "marek-why-me",
      "Marek",
      ["Z hodín? ", PAUSE, "Prečo práve ja?"],
      "Telling time? Why me of all people?",
    ),
    line("anna-thats-why", "Anna", [CHUCKLE, "Práve preto."], "That's exactly why."),
    rightOrWrong(
      line(
        "marek-third-sentence",
        "Marek",
        ["Dobre… ", PAUSE, "Stretneme sa ", mark("o tretej"), "."],
        "OK… We'll meet at three.",
      ),
      "right",
    ),
    afterThinking(
      line(
        "anna-o-tretej-right",
        "Anna",
        [
          "Správne! ",
          PAUSE,
          mark("O tretej"),
          ", ",
          mark("o štvrtej"),
          ", ",
          mark("o piatej"),
          ": čas na hodinách.",
        ],
        "Right! At three, at four, at five: a time on the clock.",
      ),
    ),
    line(
      "marek-see-i-know",
      "Marek",
      ["Hurá! ", PAUSE, "Vidíš, viem to."],
      "Hooray! See, I know it.",
    ),
    line(
      "anna-so-next",
      "Anna",
      ["Dobre. ", PAUSE, "Tak ďalšia."],
      "OK. So, the next one.",
    ),
    rightOrWrong(
      line(
        "marek-first-sentence",
        "Marek",
        ["Hm… ", PAUSE, mark("Sú päť hodín"), "."],
        "Hmm… Sú päť hodín.",
      ),
      "wrong",
    ),
    afterThinking(
      line(
        "anna-je-pat-hodin",
        "Anna",
        [
          "Nesprávne! ",
          PAUSE,
          "Päť a viac: ",
          mark("je päť hodín"),
          ", ",
          mark("je desať hodín"),
          ".",
        ],
        "Wrong! Five and more: je päť hodín, je desať hodín.",
      ),
    ),
    line(
      "marek-of-course-five",
      "Marek",
      ["No jasné, ", mark("je päť hodín"), "."],
      "Of course, je päť hodín.",
    ),
    line(
      "anna-try-again",
      "Anna",
      ["Nič sa nestalo. ", PAUSE, "Skús ešte."],
      "No harm done. Try again.",
    ),
    rightOrWrong(
      line(
        "marek-second-sentence",
        "Marek",
        ["Tak… ", PAUSE, mark("Pol tretej"), " je tri tridsať."],
        "So… Pol tretej is three thirty.",
      ),
      "wrong",
    ),
    afterThinking(
      line(
        "anna-pol-tretej-two-thirty",
        "Anna",
        [
          "Nesprávne! ",
          PAUSE,
          mark("Pol tretej"),
          " je dve tridsať. Pozeráme sa na tretiu hodinu.",
        ],
        "Wrong! Pol tretej is two thirty. We look toward the third hour.",
      ),
    ),
    line(
      "marek-wrong-again",
      "Marek",
      [SIGH, "Zase nesprávne? ", PAUSE, "Dve tridsať… dobre."],
      "Wrong again? Two thirty… OK.",
    ),
    line("anna-last-one", "Anna", ["Ešte jedna, posledná."], "One more, the last one."),
    rightOrWrong(
      line(
        "marek-last-sentence",
        "Marek",
        ["Hm… ", PAUSE, "Zavolám ti ", mark("o dve hodiny"), "."],
        "Hmm… I'll call you in two hours.",
      ),
      "right",
    ),
    afterThinking(
      line(
        "anna-o-dve-hodiny-right",
        "Anna",
        [
          "Správne! ",
          PAUSE,
          mark("O dve hodiny"),
          ": nie čas, ale ako dlho. ",
          PAUSE,
          "Teraz je jedna, zavolám ti ",
          mark("o dve hodiny"),
          ", ",
          mark("o tretej"),
          ".",
        ],
        "Right! In two hours: not a time, but how long. Now it's one, I'll call you in two hours, at three.",
      ),
    ),
    line(
      "marek-two-and-two",
      "Marek",
      ["Dve správne, dve nesprávne. ", PAUSE, "Ujde to."],
      "Two right, two wrong. Not bad.",
    ),
    line(
      "anna-and-you",
      "Anna",
      [CHUCKLE, "Ujde to, Marek. ", PAUSE, "A vy? Koľko ste mali správne?"],
      "Not bad, Marek. And you? How many did you get right?",
    ),
    afterThinking(
      line(
        "marek-hope-fewer",
        "Marek",
        [CHUCKLE, "Dúfam, že menej ako ja."],
        "I hope fewer than me.",
      ),
    ),
  ],
  checks: [
    {
      id: `${PREFIX}check-wrong-sentence`,
      prompt: "Ktorá veta je podľa Anny nesprávna?",
      promptEnglish: "Which sentence does Anna call wrong?",
      choices: [
        { id: "su-pat", label: "Sú päť hodín." },
        {
          id: "o-tretej",
          label: "Stretneme sa o tretej.",
          whyWrong: "Anna says **správne**: **o tretej** is a time on the clock.",
        },
        {
          id: "o-dve",
          label: "Zavolám ti o dve hodiny.",
          whyWrong: "Anna says **správne**: **o dve hodiny** says how long from now.",
        },
      ],
      answerId: "su-pat",
      feedback: {
        english: "Five and more: je päť hodín, je desať hodín.",
        why: "From five up the verb is **je** and the noun is **hodín**: **je päť hodín**.",
      },
    },
    {
      id: `${PREFIX}check-pol-tretej`,
      prompt: "Koľko je pol tretej?",
      promptEnglish: "What time is pol tretej?",
      replayLineId: `${PREFIX}anna-pol-tretej-two-thirty`,
      choices: [
        { id: "two-thirty", label: "Dve tridsať." },
        {
          id: "three-thirty",
          label: "Tri tridsať.",
          whyWrong:
            "**Tri tridsať** is Marek's sentence, and Anna says **nesprávne**. That would be **pol štvrtej**.",
        },
        {
          id: "three",
          label: "Tri hodiny.",
          whyWrong:
            "**Tri hodiny** is three o'clock. **Pol tretej** is half an hour before it.",
        },
      ],
      answerId: "two-thirty",
      feedback: {
        english: "Pol tretej is two thirty.",
        why: "**Pol** names the hour ahead: **pol tretej** is halfway to three, 02:30.",
      },
    },
  ],
};

const outro: ListeningChapter = {
  id: `${PREFIX}outro`,
  titleSk: "Záver",
  title: "In two hours, Marek",
  lines: [
    line("marek-thats-all", "Marek", ["To je všetko na dnes."], "That's all for today."),
    line(
      "anna-thanks-for-listening",
      "Anna",
      ["Ďakujeme, že počúvate. Majte sa pekne!"],
      "Thank you for listening. Take care!",
    ),
    line(
      "marek-bye-what-time",
      "Marek",
      ["Ahojte! ", PAUSE, "Anna, ", mark("koľko je hodín"), "?"],
      "Bye! Anna, what time is it?",
    ),
    line(
      "anna-exactly-one",
      "Anna",
      ["Je presne ", mark("jedna hodina"), ". Prečo?"],
      "It's exactly one o'clock. Why?",
    ),
    line(
      "marek-guest-in-three-hours",
      "Marek",
      ["Hosť príde ", mark("o tretej"), ". ", PAUSE, "To je ", mark("o tri hodiny"), "!"],
      "The guest comes at three. That's in three hours! (Wrong on purpose.)",
    ),
    line(
      "anna-in-two-hours-marek",
      "Anna",
      [SIGH, mark("O dve hodiny"), ", Marek."],
      "In two hours, Marek.",
    ),
  ],
  checks: [
    {
      id: `${PREFIX}check-time-at-end`,
      prompt: "Koľko je hodín na konci?",
      promptEnglish: "What time is it at the end?",
      replayLineId: `${PREFIX}anna-exactly-one`,
      choices: [
        { id: "one", label: "Jedna hodina." },
        {
          id: "two",
          label: "Dve hodiny.",
          whyWrong:
            "**Dve hodiny** is two o'clock. Anna says **je presne jedna hodina**.",
        },
        {
          id: "three",
          label: "Tri hodiny.",
          whyWrong:
            "**Tri hodiny** is when the guest comes, **o tretej**. Now it is one.",
        },
      ],
      answerId: "one",
      feedback: {
        english: "It's exactly one o'clock.",
        why: "One takes **je** and **hodina**: **je jedna hodina**.",
      },
    },
    {
      id: `${PREFIX}check-guest-in-how-long`,
      prompt: "O koľko hodín príde hosť?",
      promptEnglish: "In how many hours does the guest come?",
      replayLineId: `${PREFIX}anna-in-two-hours-marek`,
      choices: [
        { id: "two-hours", label: "O dve hodiny." },
        {
          id: "three-hours",
          label: "O tri hodiny.",
          whyWrong:
            "**O tri hodiny** is Marek's sum. From one to three is two hours, so Anna sighs: **o dve hodiny**.",
        },
        {
          id: "at-two",
          label: "O druhej.",
          whyWrong:
            "**O druhej** is at two, a time on the clock. The question asks how long from now.",
        },
      ],
      answerId: "two-hours",
      feedback: {
        english: "In two hours, Marek.",
        why: "**O dve hodiny**: **o** + **dve hodiny** says how long from now, and two takes **hodiny**.",
      },
    },
  ],
};

export const tellingTimeEpisode: ListeningEpisode = {
  id: "listening/telling-time",
  slug: "telling-time",
  number: 3,
  level: "A1–A2",
  titleSk: "Koľko je hodín?",
  title: "What time is it?",
  topic: "koľko je hodín",
  promise:
    "Marek is late, so Anna puts him through a clock game, a tram at ten, a café that closes at six and a guest who comes at three.",
  grammarSlug: "telling-time",
  lessonId: "everyday/days-dates-and-time",
  practiceSetId: "days-dates-and-time",
  speakers: ["Anna", "Marek", "Waiter"],
  vocabulary: [
    { slovak: "Koľko je hodín?", english: "What time is it?" },
    { slovak: "pol tretej", english: "half past two" },
    { slovak: "štvrť na tri", english: "quarter past two" },
    { slovak: "električka", english: "tram" },
    { slovak: "kaviareň", english: "café" },
    { slovak: "meškať", english: "to be late" },
  ],
  chapters: [intro, clockGame, tramStop, cafe, quiz, outro],
};
