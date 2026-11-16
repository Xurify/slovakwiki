import type { MarkedPart } from "$lib/learning/marked-text";
import {
  CHUCKLE,
  EXCITED,
  HAPPY,
  NO_PICK,
  PAUSE,
  SIGH,
  STOP,
  SURPRISED,
  lineWriter,
  listenerPicks,
  onPath,
  staged,
  type Part,
} from "../dialogue";
import type { DialogueTurn, ListenerPath } from "$lib/learning/types";
import type { Cue } from "$lib/stick-figure/acts";
import type { StickPictureId } from "$lib/stick-figure/pictures";
import type { ListeningChapter, ListeningEpisode } from "../types";

const PREFIX = "podcast-telling-time-";
const line = lineWriter(PREFIX);

/** A clock phrase, the episode's topic, lit in the transcript. */
function mark(text: string): Exclude<MarkedPart, string> {
  return { role: "time", text };
}

/** A breath before the next ask or the score, so the joke before it can land. */
const BEAT_MS = 1200;

/** One ending of the listener's game, on one path through their picks: a breath, then its lines. */
function ending(
  when: ListenerPath,
  ...lines: [id: string, speaker: string, parts: Part[], english: string][]
): DialogueTurn[] {
  return lines.map(([id, speaker, parts, english], i) => {
    const turn = onPath(line(id, speaker, parts, english), when);
    return i === 0 ? { ...turn, wait: BEAT_MS } : turn;
  });
}

/**
 * Marek comes in late through the studio door, his hello as it opens, and
 * takes the seat by the door: in this episode Anna sits at the far end, so
 * he never squeezes past behind her chair and through her mic.
 */
const INTRO_ACTS: Record<string, Cue[]> = {
  "marek-right-on-time": [
    { do: "enter", to: "inside", on: "start" },
    { do: "sit", to: "desk-left" },
    { who: "anna", do: "look", to: "marek", on: "start" },
  ],
  // He puts his headphones on while she asks, so nobody waits in silence for him.
  "anna-what-time": [
    { who: "marek", do: "take", what: "marek-headphones", on: "start" },
    { who: "marek", do: "put", what: "marek-headphones", to: "marek" },
  ],
  // The recorder she takes is the one she sets on the café table: today's show is recorded out there.
  "anna-yes-for-you-tram": [
    { do: "take", what: "recorder", on: "nahrávame" },
    { do: "stand", on: "poďme" },
    { who: "marek", do: "stand", on: "poďme" },
  ],
};

const intro: ListeningChapter = {
  id: `${PREFIX}intro`,
  titleSk: "Úvod",
  title: "Marek is late",
  // His headphones wait on the desk at his place until he comes in.
  setup: {
    spots: { anna: "desk-right" },
    objects: [
      {
        id: "marek-headphones",
        kind: "headphones",
        start: { where: { on: "desk", dx: -38 }, of: "marek" },
      },
      { id: "recorder", kind: "mic", start: { where: { on: "desk", dx: 38 } } },
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
      // He heard pol desiatej for the start, so he believes he is on time.
      line(
        "marek-right-on-time",
        "Marek",
        ["Ahojte! ", PAUSE, "Dobré ráno, Anna. Som tu včas!"],
        "Hi! Morning, Anna. I'm right on time!",
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
        ["Je", STOP, PAUSE, "deväť tridsať."],
        "It's… nine thirty.",
      ),
      line(
        "anna-recording-half-past-eight",
        "Anna",
        [
          "Áno, je deväť tridsať, ",
          mark("pol desiatej"),
          ". ",
          PAUSE,
          "A naša nahrávka je ",
          mark("o pol deviatej"),
          "! ",
          PAUSE,
          "Meškáš celú hodinu.",
        ],
        "Yes, it's nine thirty, half past nine. And our recording is at half past eight! You're a whole hour late.",
      ),
      line(
        "marek-heard-half-past-nine",
        "Marek",
        [mark("Pol deviatej"), "? ", PAUSE, "Ja som počul ", mark("pol desiatej"), "!"],
        "Half past eight? I heard half past nine!",
      ),
      line(
        "anna-half-past-nine-is-now",
        "Anna",
        [
          "Nie, Marek. ",
          mark("Pol deviatej"),
          " je osem tridsať. ",
          PAUSE,
          mark("Pol desiatej"),
          " je teraz. ",
          PAUSE,
          "A to je dnešná téma: ",
          mark("koľko je hodín"),
          ".",
        ],
        "No, Marek. Half past eight is eight thirty. Half past nine is now. And that's today's topic: what time it is.",
      ),
      line(
        "marek-good-topic-for-me",
        "Marek",
        ["Dobrá téma. ", PAUSE, "Pre mňa."],
        "Good topic. For me.",
      ),
      line(
        "anna-yes-for-you-tram",
        "Anna",
        [
          "Áno, pre teba. ",
          PAUSE,
          "Dnes nahrávame v meste. Naša električka ide ",
          mark("o desiatej"),
          ", tak poďme!",
        ],
        "Yes, for you. Today we're recording in town. Our tram goes at ten, so let's go!",
      ),
    ],
    INTRO_ACTS,
  ),
  checks: [
    {
      id: `${PREFIX}check-time-marek-arrives`,
      prompt: "Koľko je hodín, keď príde Marek?",
      promptEnglish: "What time is it when Marek arrives?",
      replayLineId: `${PREFIX}anna-recording-half-past-eight`,
      choices: [
        { id: "nine-thirty", label: "Pol desiatej, deväť tridsať." },
        {
          id: "eight-thirty",
          label: "Pol deviatej, osem tridsať.",
          whyWrong:
            "**Pol deviatej** is when the recording starts. Anna says **je pol desiatej**.",
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
        english: "Yes, it's nine thirty, half past nine.",
        why: "Marek says **deväť tridsať** and Anna names it **pol desiatej**: the hour ahead, ten.",
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
    {
      id: `${PREFIX}check-tram-when`,
      prompt: "Kedy ide ich električka?",
      promptEnglish: "When does their tram go?",
      replayLineId: `${PREFIX}anna-yes-for-you-tram`,
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
          whyWrong: "**O druhej** is at two. Anna says **o desiatej**, at ten.",
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

/** Anna holds out a clock on her phone, set to each time she says: 2:15 and 2:45 are not on the wall, which shows one o'clock. */
function showClock(picture: StickPictureId, on: string, who?: "anna"): Cue[] {
  return [
    {
      ...(who ? { who } : {}),
      do: "show",
      what: "anna-phone",
      to: "marek",
      picture,
      on,
      keep: true,
    },
  ];
}

const CLOCK_ACTS: Record<string, Cue[]> = {
  "anna-back-one-oclock": [{ do: "look", to: "hodiny", on: "jedna" }],
  "anna-two-oclock": [
    { do: "take", what: "anna-phone", on: "start" },
    ...showClock("clock-2-00", "sú"),
  ],
  "marek-two-zero-zero": showClock("clock-2-00", "start", "anna"),
  "anna-quarter-past-two": showClock("clock-2-15", "štvrť"),
  "marek-three-fifteen": showClock("clock-2-15", "start", "anna"),
  "anna-two-fifteen": showClock("clock-2-15", "start"),
  "marek-half-past-two": [
    ...showClock("clock-2-15", "start", "anna"),
    ...showClock("clock-2-30", "pol", "anna"),
  ],
  "anna-quarter-to-three": showClock("clock-2-45", "trištvrte"),
  "marek-two-forty-five": showClock("clock-2-45", "start", "anna"),
  "anna-five-oclock": showClock("clock-5-00", "päť"),
  "marek-why-je-and-su": showClock("clock-5-00", "start", "anna"),
  "anna-one-two-five": [{ do: "pocket", what: "anna-phone", on: "start" }],
};

const clockLesson: ListeningChapter = {
  id: `${PREFIX}clock-lesson`,
  titleSk: "Hodiny pre Mareka",
  title: "The clock, once more for Marek",
  // Back from town, they have their headphones on, and a mug each from the kitchen at their places.
  setup: {
    objects: [
      {
        id: "anna-mug",
        kind: "cup",
        start: { where: { on: "desk", dx: 29 }, turned: true },
      },
      {
        id: "marek-mug",
        kind: "cup",
        start: { where: { on: "desk", dx: -30 } },
      },
      { id: "anna-phone", kind: "phone", start: { where: { pocket: "anna" } } },
    ],
    spots: { anna: "desk-right", marek: "desk-left" },
    state: { "marek-headphones": { where: { wear: "marek" } } },
  },
  lines: staged(
    PREFIX,
    [
      line(
        "anna-back-one-oclock",
        "Anna",
        [
          "Sme späť v štúdiu a ",
          mark("je jedna hodina"),
          ". ",
          PAUSE,
          "Marek, ešte raz si prejdeme hodiny.",
        ],
        "We're back in the studio and it's one o'clock. Marek, let's go over the clock once more.",
      ),
      line(
        "marek-why-me",
        "Marek",
        ["Znova hodiny? ", PAUSE, "Prečo práve ja?"],
        "The clock again? Why me of all people?",
      ),
      line("anna-thats-why", "Anna", [CHUCKLE, "Práve preto."], "That's exactly why."),
      line(
        "anna-game-rules",
        "Anna",
        ["Ja poviem čas slovami a ty povieš čísla."],
        "I'll say the time in words and you'll say the numbers.",
      ),
      line("marek-ok", "Marek", ["Dobre."], "OK."),
      line(
        "anna-two-oclock",
        "Anna",
        ["Najprv: ", mark("sú dve hodiny"), "."],
        "First: it's two o'clock.",
      ),
      line(
        "marek-two-zero-zero",
        "Marek",
        ["Ľahké. Štrnásť nula nula."],
        "Easy. Fourteen hundred.",
      ),
      line(
        "anna-quarter-past-two",
        "Anna",
        ["Správne. Ďalej: ", mark("je štvrť na tri"), "."],
        "Right. Next: it's quarter past two.",
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
          "Pozeráme sa dopredu, na tretiu hodinu.",
        ],
        "No! Quarter past two is two fifteen. We look ahead, to the third hour.",
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
        ["Výborne! A posledná: ", mark("je päť hodín"), "."],
        "Excellent! And the last one: it's five o'clock.",
      ),
      line(
        "marek-why-je-and-su",
        "Marek",
        [
          "Sedemnásť nula nula. ",
          PAUSE,
          "Prečo ",
          mark("je päť hodín"),
          ", ale ",
          mark("sú dve hodiny"),
          "?",
        ],
        "Seventeen hundred. Why is it je päť hodín, but sú dve hodiny?",
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
        "anna-we-will-see",
        "Anna",
        ["Super. ", PAUSE, "Uvidíme, či to naozaj vieš."],
        "Great. We'll see if you really know it.",
      ),
    ],
    CLOCK_ACTS,
  ),
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
  ],
};

/** Marek looks up at the street clock to read it; the quarter of an hour they wait passes in the dark. */
const TRAM_ACTS: Record<string, Cue[]> = {
  "marek-quarter-to-ten": [{ do: "look", to: "hodiny", on: "start" }],
  "anna-yes-at-eleven": [{ do: "skip", minutes: 15, on: "after" }],
  "marek-tram-coming": [
    { do: "look", to: "električka", on: "start" },
    { who: "anna", do: "look", to: "električka", on: "ide" },
  ],
  // Up to the doors as she says it, Marek first, as he is nearer: set off after the line, she was still on the platform when the segment cut.
  "anna-exactly-ten": [
    { who: "marek", do: "leave", to: "door", on: "nastúpme" },
    { do: "leave", to: "door-back", on: "nastúpme" },
  ],
};

const tramStop: ListeningChapter = {
  id: `${PREFIX}tram-stop`,
  stage: "street",
  titleSk: "Na zastávke",
  title: "At the tram stop: at ten, in fifteen minutes",
  setup: {
    spots: { anna: "wait-l", marek: "wait-r" },
    objects: [
      { id: "recorder", kind: "mic", start: { where: { hand: "anna", side: "lead" } } },
    ],
  },
  lines: staged(
    PREFIX,
    [
      line(
        "marek-now-at-stop",
        "Marek",
        ["Uf, stihli sme to. ", PAUSE, "Sme na zastávke."],
        "Phew, we made it. We're at the stop.",
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
        "So the tram will come in fifteen minutes.",
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
        "marek-cafe-at-eleven",
        "Marek",
        ["Aha. ", PAUSE, "A v kaviarni máme byť ", mark("o jedenástej"), ", však?"],
        "I see. And we're due at the café at eleven, right?",
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
    TRAM_ACTS,
  ),
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
      prompt: "Kedy majú byť v kaviarni?",
      promptEnglish: "When are they due at the café?",
      replayLineId: `${PREFIX}marek-cafe-at-eleven`,
      choices: [
        { id: "eleven", label: "O jedenástej." },
        {
          id: "ten",
          label: "O desiatej.",
          whyWrong: "**O desiatej** is when the tram goes. The café is **o jedenástej**.",
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
        english: "And we're due at the café at eleven, right?",
        why: "**O jedenástej**: **o** + the hour's ordinal form, as in **o tretej**, **o desiatej**.",
      },
    },
  ],
};

/**
 * They come in off the street, Anna first, and sit at the window table: she
 * goes on round to the far chair and he takes the near one, so nobody walks
 * behind someone seated. The waiter sees them from the bar and comes over as
 * they sit down.
 */
const CAFE_ACTS: Record<string, Cue[]> = {
  "anna-now-in-cafe": [
    // In before she speaks, so the line is said on her way to the table, not ahead of a long walk.
    { do: "enter", to: "inside", on: "before" },
    { do: "sit", to: "chair-r", on: "start" },
    { do: "put", what: "recorder", to: "table", dx: 16 },
    { who: "marek", do: "enter", to: "inside", on: "start" },
    { who: "waiter", do: "go", to: "by-table", on: "sadnime" },
  ],
  "waiter-what-will-you-have": [{ who: "marek", do: "sit", to: "chair-l", on: "start" }],
  // He fetches the coffees from the back as he says so, so nobody waits for him to go.
  "waiter-right-away": [
    { do: "go", to: "back", on: "start" },
    { do: "take", what: "marek-cup" },
    { do: "take", what: "anna-cup" },
  ],
  "marek-at-three-around-two": [{ who: "waiter", do: "go", to: "by-table", on: "start" }],
  // Both go into the hands of Anna, beside him: the table's chairs keep him from its top. Marek's she sets down across the table, in front of him.
  "waiter-here-two-coffees": [
    { do: "give", what: "anna-cup", to: "anna", on: "páči" },
    { do: "give", what: "marek-cup", to: "anna", on: "kávy" },
    { who: "anna", do: "put", what: "marek-cup", to: "table", dx: 2 },
  ],
  "anna-when-do-you-close": [{ do: "nod", on: "ďakujeme" }],
  // Done serving, he goes back behind the bar.
  "waiter-close-at-six": [
    { who: "marek", do: "look", to: "waiter", on: "start" },
    { do: "go", to: "back", on: "after" },
  ],
  "marek-seven-hours-i-know": [
    { do: "take", what: "marek-cup", on: "start" },
    { do: "taste", what: "marek-cup", on: "máme" },
  ],
};

const cafe: ListeningChapter = {
  id: `${PREFIX}cafe`,
  stage: "cafe",
  titleSk: "V kaviarni",
  title: "At the café: at three, or in three hours?",
  setup: {
    spots: { waiter: "back" },
    objects: [
      { id: "recorder", kind: "mic", start: { where: { hand: "anna", side: "lead" } } },
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
        ["Tu je naša kaviareň. ", PAUSE, "Sadnime si."],
        "Here's our café. Let's sit down.",
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
        "marek-so-in-three-hours",
        "Marek",
        [mark("O tretej"), "? ", PAUSE, "Tak to je ", mark("o tri hodiny"), ", nie?"],
        "At three? So that's in three hours, right? (Wrong on purpose.)",
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
          " je čas na hodinách: pätnásť nula nula.",
        ],
        "No, Marek. Not in three hours. At three. At three is a time on the clock: fifteen hundred.",
      ),
      line(
        "marek-at-three-around-two",
        "Marek",
        [
          "Aha! ",
          mark("O tretej"),
          " je čas. ",
          PAUSE,
          "A ",
          mark("o tri hodiny"),
          " je, ako dlho: ",
          PAUSE,
          "to je okolo druhej.",
        ],
        "Oh! At three is a time. And in three hours is how long: that's around two.",
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
        ["Ďakujeme. ", PAUSE, "Je tu príjemne. Kedy zatvárate?"],
        "Thank you. It's nice here. When do you close?",
        { to: "Waiter" },
      ),
      line(
        "waiter-close-at-six",
        "Waiter",
        ["Dnes zatvárame ", mark("o šiestej"), " večer."],
        "Today we close at six in the evening.",
      ),
      line(
        "marek-seven-hours-i-know",
        "Marek",
        [
          mark("O šiestej"),
          STOP,
          PAUSE,
          "to je ",
          mark("o sedem hodín"),
          ". ",
          PAUSE,
          "Vidíš, toto viem! Máme čas.",
        ],
        "At six… that's in seven hours. See, this I know! We have time.",
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
        { id: "at-three", label: "O tretej, pätnásť nula nula." },
        {
          id: "in-three-hours",
          label: "O tri hodiny.",
          whyWrong:
            "**O tri hodiny** means in three hours from now. Anna says **nie o tri hodiny**.",
        },
        {
          id: "at-two",
          label: "O druhej.",
          whyWrong:
            "**O druhej** is at two: three hours from now, **o tri hodiny**. Anna says **o tretej**.",
        },
      ],
      answerId: "at-three",
      feedback: {
        english: "At three is a time on the clock: fifteen hundred.",
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

const ASK_SU = `${PREFIX}marek-which-su`;
const ASK_POL = `${PREFIX}marek-which-pol`;
const ASK_O = `${PREFIX}marek-which-o`;

/**
 * Back in the studio, Anna sets Marek a test on the day's times and the
 * listeners pick the words for him. Every choice of an ask has the same
 * English, so the card does not answer for the listener.
 */
// A point at his mug, so the stage does not put a cup in his hand for "kávu".
const HELP_ACTS: Record<string, Cue[]> = {
  "marek-made-the-coffee": [{ do: "point", to: "marek-mug", on: "kávu" }],
};

const help: ListeningChapter = {
  id: `${PREFIX}help`,
  titleSk: "Pomôžte Marekovi",
  title: "Your game: help Marek say the time",
  lines: staged(
    PREFIX,
    [
      line(
        "anna-test-for-you",
        "Anna",
        ["Ešte máme chvíľu čas. ", PAUSE, "Marek, malá skúška pre teba."],
        "We still have a little time. Marek, a little test for you.",
      ),
      line(
        "marek-numbers-not-words",
        "Marek",
        [
          SURPRISED,
          "Skúška? ",
          PAUSE,
          "Ojoj",
          STOP,
          PAUSE,
          "čísla mi idú, ale slová nie.",
        ],
        "A test? Uh-oh… numbers I can do, but not the words.",
      ),
      line(
        "anna-listeners-pick",
        "Anna",
        ["Ja viem. ", PAUSE, "Preto ti pomôžu poslucháči: oni vyberú a ty to povieš."],
        "I know. That's why the listeners will help you: they pick and you say it.",
      ),
      line(
        "marek-help-me",
        "Marek",
        [EXCITED, "Milí poslucháči, pomôžte mi!"],
        "Dear listeners, help me!",
      ),
      // The forms in the question stay unlit, or the transcript would give the answer away.
      {
        ...line(
          "anna-first-guest",
          "Anna",
          [
            "Prvá otázka: ",
            PAUSE,
            "hosť príde o tretej. Čo mu povieš, keď vojde? ",
            PAUSE,
            "Sú tri hodiny, alebo je tri hodiny?",
          ],
          "First question: the guest comes at three. What will you say to him when he comes in? Sú tri hodiny, or je tri hodiny?",
        ),
        wait: BEAT_MS,
      },
      listenerPicks(
        line(
          "marek-which-su",
          "Marek",
          [
            "Pätnásť nula nula, to viem. ",
            PAUSE,
            "Ale slovami? ",
            PAUSE,
            "Pomocníci, čo poviete?",
          ],
          "Fifteen hundred, that I know. But in words? Helpers, what do you say?",
        ),
        {
          prompt: "Čo má Marek povedať?",
          choices: [
            { id: "su", label: "Sú tri hodiny", english: "It's three o'clock" },
            {
              id: "je",
              label: "Je tri hodiny",
              english: "It's three o'clock",
              whyWrong:
                "**Je** goes with one o'clock and with five or more. Two, three and four take **sú**: **sú tri hodiny**.",
            },
          ],
          answerId: "su",
          judge: "Anna",
        },
      ),
      onPath(
        line(
          "marek-su-you-say",
          "Marek",
          [
            mark("Sú tri hodiny"),
            ", hovoríte? ",
            PAUSE,
            "Dobre: ",
            mark("sú tri hodiny"),
            ", ste tu presne včas!",
          ],
          "Sú tri hodiny, you say? OK: it's three o'clock, you're right on time!",
        ),
        { ask: ASK_SU, picks: ["su"] },
      ),
      onPath(
        line(
          "marek-je-you-say",
          "Marek",
          [
            "Je tri hodiny, hovoríte? ",
            PAUSE,
            "Dobre: je tri hodiny, ste tu presne včas!",
          ],
          "Je tri hodiny, you say? OK: it's three o'clock, you're right on time! (Wrong on purpose.)",
        ),
        { ask: ASK_SU, picks: ["je"] },
      ),
      {
        ...onPath(
          line(
            "marek-su-myself",
            "Marek",
            [
              "Tak si vyberiem sám: ",
              PAUSE,
              mark("sú tri hodiny"),
              ", ste tu presne včas!",
            ],
            "Then I'll pick myself: it's three o'clock, you're right on time!",
          ),
          { ask: ASK_SU, picks: [NO_PICK] },
        ),
        wait: BEAT_MS,
      },
      onPath(
        line(
          "anna-su-right",
          "Anna",
          [
            "Správne! ",
            PAUSE,
            "Pri dvoch, troch a štyroch hodinách hovoríme ",
            mark("sú"),
            ": ",
            mark("sú tri hodiny"),
            ".",
          ],
          "Right! With two, three and four o'clock we say sú: sú tri hodiny.",
        ),
        { ask: ASK_SU, picks: ["su", NO_PICK] },
      ),
      onPath(
        line(
          "marek-guest-on-time",
          "Marek",
          ["A hosť je tu včas. ", PAUSE, "Nie ako ja ráno."],
          "And the guest is on time. Not like me this morning.",
        ),
        { ask: ASK_SU, picks: ["su", NO_PICK] },
      ),
      onPath(
        line("anna-you-said-it", "Anna", [CHUCKLE, "To si povedal ty."], "You said it."),
        { ask: ASK_SU, picks: ["su", NO_PICK] },
      ),
      onPath(
        line(
          "anna-su-wrong",
          "Anna",
          [
            "Nesprávne! ",
            PAUSE,
            "Pri dvoch, troch a štyroch hodinách hovoríme ",
            mark("sú"),
            ". ",
            PAUSE,
            mark("Sú tri hodiny"),
            ".",
          ],
          "Wrong! With two, three and four o'clock we say sú. Sú tri hodiny.",
        ),
        { ask: ASK_SU, picks: ["je"] },
      ),
      onPath(
        line(
          "marek-guest-not-here",
          "Marek",
          ["Jaj. ", PAUSE, "Dobre, že hosť tu ešte nie je."],
          "Oops. Good thing the guest isn't here yet.",
        ),
        { ask: ASK_SU, picks: ["je"] },
      ),
      onPath(line("anna-lucky", "Anna", [CHUCKLE, "Máš šťastie."], "You're lucky."), {
        ask: ASK_SU,
        picks: ["je"],
      }),
      {
        ...line(
          "anna-second-cafe",
          "Anna",
          ["Ideme ďalej. ", PAUSE, "Druhá otázka: kedy sme odišli z kaviarne?"],
          "Moving on. Second question: when did we leave the café?",
        ),
        wait: BEAT_MS,
      },
      listenerPicks(
        line(
          "marek-which-pol",
          "Marek",
          [
            "Dvanásť tridsať, to si pamätám. ",
            PAUSE,
            "Ale ako sa to povie? ",
            PAUSE,
            "O pol jednej, alebo o pol dvanástej?",
          ],
          "Twelve thirty, that I remember. But how do you say it? O pol jednej, or o pol dvanástej?",
        ),
        {
          prompt: "Čo má Marek povedať?",
          choices: [
            { id: "jednej", label: "O pol jednej", english: "When they left the café" },
            {
              id: "dvanastej",
              label: "O pol dvanástej",
              english: "When they left the café",
              whyWrong:
                "**Pol dvanástej** is halfway to twelve: 11:30. Twelve thirty is halfway to one, **o pol jednej**.",
            },
          ],
          answerId: "jednej",
          judge: "Anna",
        },
      ),
      onPath(
        line(
          "marek-jednej-you-say",
          "Marek",
          [
            mark("O pol jednej"),
            ", hovoríte? ",
            PAUSE,
            "Dobre: z kaviarne sme odišli ",
            mark("o pol jednej"),
            ".",
          ],
          "O pol jednej, you say? OK: we left the café at half past twelve.",
        ),
        { ask: ASK_POL, picks: ["jednej"] },
      ),
      onPath(
        line(
          "marek-dvanastej-you-say",
          "Marek",
          [
            "O pol dvanástej, hovoríte? ",
            PAUSE,
            "Dobre: z kaviarne sme odišli o pol dvanástej.",
          ],
          "O pol dvanástej, you say? OK: we left the café at half past eleven. (Wrong on purpose.)",
        ),
        { ask: ASK_POL, picks: ["dvanastej"] },
      ),
      {
        ...onPath(
          line(
            "marek-jednej-myself",
            "Marek",
            [
              "Tak si spomeniem sám: ",
              PAUSE,
              "z kaviarne sme odišli ",
              mark("o pol jednej"),
              ".",
            ],
            "Then I'll remember it myself: we left the café at half past twelve.",
          ),
          { ask: ASK_POL, picks: [NO_PICK] },
        ),
        wait: BEAT_MS,
      },
      onPath(
        line(
          "anna-jednej-right",
          "Anna",
          ["Správne! ", PAUSE, "Pozeráme sa dopredu: ", mark("pol jednej"), "."],
          "Right! We look ahead: half past twelve.",
        ),
        { ask: ASK_POL, picks: ["jednej", NO_PICK] },
      ),
      onPath(
        line(
          "marek-made-the-coffee",
          "Marek",
          ["Hlavne, že sme stihli kávu."],
          "The main thing is we made it in time for coffee.",
        ),
        { ask: ASK_POL, picks: ["jednej", NO_PICK] },
      ),
      onPath(
        line(
          "anna-jednej-wrong",
          "Anna",
          [
            "Nesprávne! ",
            PAUSE,
            mark("Pol dvanástej"),
            " je jedenásť tridsať. ",
            PAUSE,
            "Vtedy sme ešte pili kávu.",
          ],
          "Wrong! Pol dvanástej is eleven thirty. We were still drinking coffee then.",
        ),
        { ask: ASK_POL, picks: ["dvanastej"] },
      ),
      onPath(
        line(
          "marek-wanted-another",
          "Marek",
          ["Pravda. ", PAUSE, "A ja som chcel ešte jednu."],
          "True. And I wanted another one.",
        ),
        { ask: ASK_POL, picks: ["dvanastej"] },
      ),
      {
        ...line(
          "anna-last-tram",
          "Anna",
          ["A posledná otázka: ", PAUSE, "kedy nám ráno išla električka?"],
          "And the last question: when did our tram go this morning?",
        ),
        wait: BEAT_MS,
      },
      listenerPicks(
        line(
          "marek-which-o",
          "Marek",
          [
            "Desať nula nula. ",
            PAUSE,
            "Ale slovami",
            STOP,
            PAUSE,
            "o desiatej, alebo o desať hodín?",
          ],
          "Ten o'clock, 10:00. But in words… o desiatej, or o desať hodín?",
        ),
        {
          prompt: "Čo má Marek povedať?",
          choices: [
            { id: "desiatej", label: "O desiatej", english: "When the tram went" },
            {
              id: "desat",
              label: "O desať hodín",
              english: "When the tram went",
              whyWrong:
                "**O desať hodín** means in ten hours, how long from now. A time on the clock is **o desiatej**.",
            },
          ],
          answerId: "desiatej",
          judge: "Anna",
        },
      ),
      onPath(
        line(
          "marek-desiatej-you-say",
          "Marek",
          [
            mark("O desiatej"),
            ", hovoríte? ",
            PAUSE,
            "Jasné: električka išla ",
            mark("o desiatej"),
            ".",
          ],
          "O desiatej, you say? Sure: the tram went at ten.",
        ),
        { ask: ASK_O, picks: ["desiatej"] },
      ),
      onPath(
        line(
          "marek-desat-you-say",
          "Marek",
          ["O desať hodín, hovoríte? ", PAUSE, "Jasné: električka išla o desať hodín."],
          "O desať hodín, you say? Sure: the tram went in ten hours. (Wrong on purpose.)",
        ),
        { ask: ASK_O, picks: ["desat"] },
      ),
      {
        ...onPath(
          line(
            "marek-desiatej-guess",
            "Marek",
            ["Tak si tipnem: ", PAUSE, "električka išla ", mark("o desiatej"), "."],
            "Then I'll take a guess: the tram went at ten.",
          ),
          { ask: ASK_O, picks: [NO_PICK] },
        ),
        wait: BEAT_MS,
      },
      onPath(
        line(
          "anna-desiatej-right",
          "Anna",
          ["Správne! ", PAUSE, mark("O desiatej"), " je čas na hodinách."],
          "Right! At ten is a time on the clock.",
        ),
        { ask: ASK_O, picks: ["desiatej", NO_PICK] },
      ),
      onPath(
        line(
          "marek-on-time-with-you",
          "Marek",
          ["Na zastávke som bol včas. ", PAUSE, "Lebo som išiel s tebou."],
          "I was on time at the tram stop. Because I went with you.",
        ),
        { ask: ASK_O, picks: ["desiatej", NO_PICK] },
      ),
      onPath(
        line(
          "anna-desiatej-wrong",
          "Anna",
          [
            "Nesprávne! ",
            PAUSE,
            mark("O desať hodín"),
            " je, ako dlho. ",
            PAUSE,
            "To by sme na zastávke stáli do večera!",
          ],
          "Wrong! In ten hours is how long. We'd have been standing at the stop till evening!",
        ),
        { ask: ASK_O, picks: ["desat"] },
      ),
      onPath(
        line(
          "marek-rather-at-ten",
          "Marek",
          ["Do večera? ", PAUSE, "Tak to radšej ", mark("o desiatej"), "."],
          "Till evening? Then I'd rather at ten.",
        ),
        { ask: ASK_O, picks: ["desat"] },
      ),
      ...ending(
        { score: [3] },
        [
          "anna-three-of-three",
          "Anna",
          [HAPPY, "Tri z troch! ", PAUSE, "Marek, s pomocníkmi ti to ide."],
          "Three out of three! Marek, with helpers you're doing fine.",
        ],
        [
          "marek-take-them-along",
          "Marek",
          ["Tak ich budem brať všade so sebou."],
          "Then I'll take them everywhere with me.",
        ],
      ),
      ...ending(
        { score: [2] },
        [
          "anna-two-of-three",
          "Anna",
          ["Dve z troch. ", PAUSE, "Skoro výborne."],
          "Two out of three. Almost excellent.",
        ],
        [
          "marek-almost-on-time",
          "Marek",
          [CHUCKLE, "Skoro výborne, skoro včas. ", PAUSE, "To som celý ja."],
          "Almost excellent, almost on time. That's me all over.",
        ],
      ),
      ...ending(
        { score: [1] },
        [
          "anna-one-of-three",
          "Anna",
          ["Jedna z troch. ", PAUSE, "Tvoji pomocníci asi tiež meškali."],
          "One out of three. Your helpers were probably late too.",
        ],
        [
          "marek-they-heard-it-too",
          "Marek",
          [CHUCKLE, "Asi aj oni počuli ", mark("pol desiatej"), "."],
          "They probably heard half past nine too.",
        ],
      ),
      ...ending(
        { score: [0] },
        [
          "anna-none-of-three",
          "Anna",
          ["Nula z troch! ", PAUSE, "Marek, tvoji pomocníci sú presne ako ty."],
          "Zero out of three! Marek, your helpers are just like you.",
        ],
        [
          "marek-great-people",
          "Marek",
          [HAPPY, "Tak to sú skvelí ľudia!"],
          "Then they're great people!",
        ],
      ),
      ...ending(
        { unaided: true },
        [
          "anna-nobody-helped",
          "Anna",
          [HAPPY, "Všetky tri správne. ", PAUSE, "A nikto ti nepomohol!"],
          "All three right. And nobody helped you!",
        ],
        [
          "marek-words-too",
          "Marek",
          ["Vidíš? ", PAUSE, "Aj slová mi idú."],
          "See? Words work for me too.",
        ],
      ),
    ],
    HELP_ACTS,
  ),
  checks: [
    {
      id: `${PREFIX}check-su-tri`,
      gap: "___ tri hodiny, ste tu presne včas!",
      prompt: "Ako to má Marek povedať?",
      promptEnglish: "How should Marek say it?",
      choices: [
        { id: "su", label: "Sú" },
        {
          id: "je",
          label: "Je",
          whyWrong:
            "**Je** goes with one hour and with five or more: **je jedna hodina**, **je päť hodín**. Three takes **sú**.",
        },
        {
          id: "budu",
          label: "Budú",
          whyWrong:
            "**Budú tri hodiny** means it will be three. Marek says it as the guest comes in, so it is three now: **sú**.",
        },
      ],
      answerId: "su",
      feedback: {
        english: "It's three o'clock, you're right on time!",
        why: "Two, three and four take **sú** and **hodiny**: **sú tri hodiny**.",
      },
    },
    {
      id: `${PREFIX}check-left-cafe`,
      prompt: "Kedy odišli z kaviarne?",
      promptEnglish: "When did they leave the café?",
      choices: [
        { id: "pol-jednej", label: "O pol jednej." },
        {
          id: "pol-dvanastej",
          label: "O pol dvanástej.",
          whyWrong:
            "**O pol dvanástej** is at eleven thirty, when they were still drinking coffee.",
        },
        {
          id: "jednej",
          label: "O jednej.",
          whyWrong:
            "**O jednej** is at one, when they are back in the studio. They left half an hour before.",
        },
      ],
      answerId: "pol-jednej",
      feedback: {
        english: "We left the café at half past twelve.",
        why: "Twelve thirty is **pol jednej**: **pol** looks ahead to the next hour, one.",
      },
    },
    {
      id: `${PREFIX}check-o-desat-hodin`,
      prompt: "Čo znamená „o desať hodín“?",
      promptEnglish: "What does “o desať hodín” mean?",
      choices: [
        { id: "in-ten-hours", label: "Desať hodín odteraz." },
        {
          id: "at-ten",
          label: "Presne o desiatej.",
          whyWrong:
            "**Presne o desiatej** is at ten on the clock. That is **o desiatej**, the right answer for the tram.",
        },
        {
          id: "ten-minutes",
          label: "Desať minút odteraz.",
          whyWrong: "**Desať minút** is ten minutes. **Hodín** are hours.",
        },
      ],
      answerId: "in-ten-hours",
      feedback: {
        english: "In ten hours is how long.",
        why: "**O** + a number of hours says how long from now: **o desať hodín**. A time on the clock is **o desiatej**.",
      },
    },
  ],
};

/** He lifts his empty mug at the thought of one more coffee, Anna wags a hand at him, then they wave goodbye together. */
const OUTRO_ACTS: Record<string, Cue[]> = {
  "marek-one-more-coffee": [
    { do: "take", what: "marek-mug", on: "stihnem" },
    { do: "raise", what: "marek-mug", on: "kávu" },
    { do: "put", what: "marek-mug", to: "desk", dx: -30, on: "after" },
  ],
  "anna-just-one": [{ do: "wag", to: "marek", on: "jednu" }],
  "anna-thanks-bye": [{ do: "wave", on: "ahojte" }],
  "marek-bye": [{ do: "wave", on: "ahojte" }],
};

const outro: ListeningChapter = {
  id: `${PREFIX}outro`,
  titleSk: "Záver",
  title: "An hour and three quarters, Marek",
  lines: staged(
    PREFIX,
    [
      line(
        "marek-thats-all-what-time",
        "Marek",
        ["To je na dnes všetko. ", PAUSE, "Anna, ", mark("koľko je hodín"), "?"],
        "That's all for today. Anna, what time is it?",
      ),
      line(
        "anna-quarter-past-one",
        "Anna",
        ["Je ", mark("štvrť na dve"), ". Prečo?"],
        "It's quarter past one. Why?",
      ),
      line(
        "marek-guest-in-three-hours",
        "Marek",
        [
          "Hosť príde ",
          mark("o tretej"),
          ". ",
          PAUSE,
          "To je ",
          mark("o tri hodiny"),
          "!",
        ],
        "The guest is coming at three. That's in three hours! (Wrong on purpose.)",
      ),
      line(
        "anna-hour-and-three-quarters",
        "Anna",
        [SIGH, mark("O hodinu a trištvrte"), ", Marek."],
        "In an hour and three quarters, Marek.",
      ),
      {
        ...line(
          "marek-one-more-coffee",
          "Marek",
          [mark("Hodinu a trištvrte"), "? ", PAUSE, "Tak to stihnem ešte jednu kávu!"],
          "An hour and three quarters? Then I've got time for one more coffee!",
        ),
        wait: BEAT_MS,
      },
      line(
        "anna-just-one",
        "Anna",
        [CHUCKLE, "Jednu, Marek. ", PAUSE, "A ", mark("o tretej"), " si tu."],
        "One, Marek. And at three you're here.",
      ),
      line(
        "marek-at-three-now-i-know",
        "Marek",
        [
          CHUCKLE,
          mark("O tretej"),
          ". Nie ",
          mark("o tri hodiny"),
          ". ",
          PAUSE,
          "Už to viem.",
        ],
        "At three. Not in three hours. Now I know it.",
      ),
      line(
        "anna-thanks-bye",
        "Anna",
        ["Ďakujeme, že počúvate. ", PAUSE, "Ahojte!"],
        "Thank you for listening. Bye!",
      ),
      line("marek-bye", "Marek", ["Ahojte!"], "Bye!"),
    ],
    OUTRO_ACTS,
  ),
  checks: [
    {
      id: `${PREFIX}check-time-at-end`,
      prompt: "Koľko je hodín na konci?",
      promptEnglish: "What time is it at the end?",
      replayLineId: `${PREFIX}anna-quarter-past-one`,
      choices: [
        { id: "quarter-past-one", label: "Štvrť na dve." },
        {
          id: "quarter-to-two",
          label: "Trištvrte na dve.",
          whyWrong:
            "**Trištvrte na dve** is quarter to two, 1:45. Anna says **štvrť na dve**, 1:15.",
        },
        {
          id: "three",
          label: "Tri hodiny.",
          whyWrong:
            "**Tri hodiny** is when the guest comes, **o tretej**. Now it is quarter past one.",
        },
      ],
      answerId: "quarter-past-one",
      feedback: {
        english: "It's quarter past one.",
        why: "**Štvrť na dve** is a quarter of the way to two: 1:15.",
      },
    },
    {
      id: `${PREFIX}check-guest-in-how-long`,
      prompt: "O koľko príde hosť?",
      promptEnglish: "How long until the guest comes?",
      replayLineId: `${PREFIX}anna-hour-and-three-quarters`,
      choices: [
        { id: "hour-three-quarters", label: "O hodinu a trištvrte." },
        {
          id: "three-hours",
          label: "O tri hodiny.",
          whyWrong:
            "**O tri hodiny** is Marek's sum. From quarter past one to three is an hour and three quarters, so Anna sighs.",
        },
        {
          id: "at-two",
          label: "O druhej.",
          whyWrong:
            "**O druhej** is at two, a time on the clock. The question asks how long from now.",
        },
      ],
      answerId: "hour-three-quarters",
      feedback: {
        english: "In an hour and three quarters, Marek.",
        why: "**O hodinu a trištvrte**: **o** + how long says how long from now. **O tretej** is the time on the clock.",
      },
    },
  ],
};

export const tellingTimeEpisode: ListeningEpisode = {
  id: "listening/telling-time",
  cover: { segment: "Na zastávke", atMs: 38500 },
  slug: "telling-time",
  number: 3,
  level: "A1–A2",
  titleSk: "Koľko je hodín?",
  title: "What time is it?",
  topic: "Telling time",
  promise:
    "Marek is late, then there's a tram at ten, a café that closes at six and a guest who comes at three. Back in the studio, Anna goes over the clock with him once more, and then it's your turn.",
  grammarSlug: "telling-time",
  lessonId: "everyday/days-dates-and-time",
  practiceSetId: "days-dates-and-time",
  speakers: ["Anna", "Marek", "Waiter"],
  vocabulary: [
    { slovak: "Koľko je hodín?", english: "What time is it?" },
    { slovak: "štvrť na tri", english: "quarter past two" },
    { slovak: "pol tretej", english: "half past two" },
    { slovak: "trištvrte na tri", english: "quarter to three" },
    { slovak: "o tretej", english: "at three" },
    { slovak: "o tri hodiny", english: "in three hours" },
  ],
  chapters: [intro, tramStop, cafe, clockLesson, help, outro],
};
