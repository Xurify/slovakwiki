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
  staged,
} from "../dialogue";
import type { ListeningChapter, ListeningEpisode } from "../types";
import type { Cue } from "$lib/stick-figure/acts";

const PREFIX = "podcast-imperative-";
const line = lineWriter(PREFIX);

/** An imperative, the episode's topic, lit in the transcript. Wrong forms said on purpose stay unlit. */
function mark(text: string): Exclude<MarkedPart, string> {
  return { role: "imperative", text };
}

/**
 * The studio, early: Marek half asleep over his coffee, the plant by the wall
 * gone yellow, the handheld recorder on the desk for tonight.
 */
const INTRO_ACTS: Record<string, Cue[]> = {
  // With the yawn the voice opens on.
  "marek-still-early": [{ do: "yawn", on: "start" }],
  "anna-dont-sleep": [
    { do: "point", to: "cup-marek", on: "kávu" },
    { do: "wag", on: "nezaspi" },
  ],
  "marek-drinking": [
    { do: "take", what: "cup-marek", on: "dobre" },
    { do: "taste", what: "cup-marek", on: "pijem" },
    { do: "put", what: "cup-marek", to: "desk", dx: 20, on: "after" },
  ],
  "marek-yellow-plant": [
    { do: "point", to: "plant", on: "rastlinku" },
    { who: "anna", do: "look", to: "plant", on: "rastlinku" },
  ],
  "anna-on-you": [{ do: "point", to: "marek", on: "ty" }],
  "marek-on-me": [{ do: "shrug", on: "jasné" }],
  // Marek already pointed at the plant; "hneď" asks for the can right by it.
  "anna-water-plant": [{ do: "point", to: "can", on: "polej" }],
  "marek-after-recording": [{ do: "nod", on: "polejem" }],
  "anna-tonight-maria": [{ do: "laugh", on: "start" }],
  "anna-lucia-late": [{ do: "shrug", on: "meškať" }],
  "marek-take-mic": [
    // Up as soon as it is in hand: held low at the desk it stood on his mug.
    { do: "take", what: "recorder", on: "zoberieme" },
    { do: "raise", what: "recorder" },
    { do: "pocket", what: "recorder", on: "after" },
  ],
};

const intro: ListeningChapter = {
  id: `${PREFIX}intro`,
  titleSk: "Úvod",
  title: "Hello from the studio",
  setup: {
    objects: [
      {
        id: "cup-anna",
        kind: "cup",
        start: { where: { on: "desk", dx: -25 }, fill: "coffee" },
      },
      {
        id: "cup-marek",
        kind: "cup",
        start: { where: { on: "desk", dx: 20 }, fill: "coffee" },
      },
      // In front of Marek, clear of his mic's clamp and his mug.
      { id: "recorder", kind: "mic", start: { where: { on: "desk", dx: 31 } } },
    ],
    state: { plant: { wilt: 1 } },
  },
  lines: staged(
    PREFIX,
    [
      line(
        "anna-this-is-podcast",
        "Anna",
        ["Ahojte, ", mark("vitajte"), " v podcaste Slovak Wiki! Ja som Anna."],
        "Hi, welcome to the Slovak Wiki podcast! I'm Anna.",
      ),
      line(
        "marek-still-early",
        "Marek",
        [
          YAWN,
          "A ja som Marek. ",
          PAUSE,
          mark("Prepáčte"),
          ", ešte spím. Je strašne skoro.",
        ],
        "And I'm Marek. Sorry, I'm still asleep. It's terribly early.",
      ),
      line(
        "anna-dont-sleep",
        "Anna",
        [CHUCKLE, "Tak ", mark("pi"), " tú kávu, Marek. A ", mark("nezaspi"), "!"],
        "Then drink that coffee, Marek. And don't fall asleep!",
      ),
      line(
        "marek-drinking",
        "Marek",
        ["Dobre, dobre. Pijem."],
        "OK, OK. I'm drinking it.",
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
        ["Lebo ju nikto nepolieva. ", PAUSE, "Marek, tento týždeň si na rade ty."],
        "Because nobody waters it. Marek, this week it's your turn.",
        { to: "Marek" },
      ),
      line(
        "marek-on-me",
        "Marek",
        [SURPRISED, "Ja? ", PAUSE, "Aha", STOP, "no jasné."],
        "Me? Oh… right, sure.",
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
        [CHUCKLE, "Uvidíme. ", PAUSE, "Inak, dnes večer ideme k pani Márii."],
        "We'll see. By the way, tonight we're going to Mária's.",
      ),
      line(
        "marek-maria-soup",
        "Marek",
        [
          EXCITED,
          "Jaj, hej! Ukáže nám, ako robí tú svoju polievku. ",
          PAUSE,
          "A príde aj Lucia, nie?",
        ],
        "Oh yes! She's showing us how she makes that soup of hers. And Lucia's coming too, right?",
      ),
      line(
        "anna-lucia-late",
        "Anna",
        ["Príde. ", PAUSE, "Ale asi zase bude meškať."],
        "She is. But she'll probably be late again.",
      ),
      line(
        "marek-take-mic",
        "Marek",
        [
          "A Mária v kuchyni stále len rozkazuje. ",
          PAUSE,
          "Zoberieme so sebou mikrofón, tak ",
          mark("počúvajte"),
          "!",
        ],
        "And in the kitchen Mária does nothing but give orders. We'll take a microphone along, so listen!",
      ),
    ],
    INTRO_ACTS,
  ),
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
          id: "soup",
          label: "O polievke.",
          whyWrong:
            "**O polievke** means about soup. They cook one tonight, but the episode is about commands: **samé rozkazy**.",
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

/** The next morning: the recorder is back on the desk, at its far end, out of the way of the mugs. */
const GAME_ACTS: Record<string, Cue[]> = {
  "marek-slept": [{ do: "thumbs", on: "vyspal" }],
};

const game: ListeningChapter = {
  id: `${PREFIX}game`,
  titleSk: "Hra so slovesami",
  title: "The verb game",
  setup: { state: { recorder: { where: { on: "desk", dx: -70 } } } },
  lines: staged(
    PREFIX,
    [
      line(
        "anna-back-in-studio",
        "Anna",
        ["Je ráno a sme späť v štúdiu."],
        "It's morning and we're back in the studio.",
      ),
      line(
        "marek-game-now",
        "Marek",
        [
          "Včera sme u Márie počuli veľa rozkazov. ",
          PAUSE,
          "A Lucia vravela, že o pol hodiny",
          STOP,
          "a prišla až o hodinu a pol!",
        ],
        "Yesterday at Mária's we heard lots of commands. And Lucia said half an hour… and only came an hour and a half later!",
      ),
      line(
        "anna-game-rules",
        "Anna",
        [
          CHUCKLE,
          "Ako vždy. ",
          PAUSE,
          "No nič, zahráme sa. ",
          PAUSE,
          "Ja poviem sloveso v tvare oni, ty z neho urobíš rozkaz.",
        ],
        "As always. Anyway, let's play. I'll say a verb in the oni (they) form, you turn it into a command.",
      ),
      line(
        "marek-guess-with-us",
        "Marek",
        ["Dobre. ", mark("Hrajte"), " s nami!"],
        "OK. Play along with us!",
      ),
      line(
        "anna-first-verb",
        "Anna",
        [
          "Napríklad: robia",
          STOP,
          mark("rob"),
          ". ",
          PAUSE,
          "Prvé sloveso: ",
          PAUSE,
          "čítajú.",
        ],
        "For example: robia (they do)… rob, do. First verb: čítajú, they read.",
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
        ["Nie, to nie je spaj. ", PAUSE, "Končí sa na i."],
        "No, not spaj. It ends in i.",
      ),
      line(
        "marek-spi",
        "Marek",
        ["Na i… ", PAUSE, mark("spi"), "!"],
        "In i… spi, sleep!",
      ),
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
        [
          "Aha",
          STOP,
          PAUSE,
          mark("choď"),
          ", ",
          mark("choďte"),
          ", ",
          mark("choďme"),
          ".",
        ],
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
        [
          "Super! ",
          PAUSE,
          "Pozor, na konci je mäkké ť: ",
          mark("plať"),
          ". ",
          PAUSE,
          "Marek, dnes ti to ide!",
        ],
        "Great! Careful, there's a soft ť at the end: plať. Marek, you're on a roll today!",
      ),
      line(
        "marek-slept",
        "Marek",
        ["Lebo som sa vyspal!"],
        "Because I got a good night's sleep!",
      ),
    ],
    GAME_ACTS,
  ),
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
      prompt: "Aký je rozkaz od slovesa ísť?",
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
          id: "ides",
          label: "Ideš!",
          whyWrong: "**Ideš** means you go: it says what you do, it is not a command.",
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

/**
 * Mária's kitchen. Anna and Marek come in at the door, wash at the sink and
 * work at the counter while Mária runs the stove: Anna peels and chops, Marek
 * hauls the big pot from the cupboard to the sink and the stove and salts too
 * much. An hour passes in the dark; then the tasting.
 */
const KITCHEN_ACTS: Record<string, Cue[]> = {
  // Mária checks what she has out: the carrot on the board, the salt by her.
  "maria-counting-veg": [
    { do: "point", to: "carrot", on: "mrkva" },
    { do: "take", what: "salt", on: "soľ" },
    { do: "put", what: "salt", to: "salt-place" },
    { who: "anna", do: "knock", on: "after" },
    { do: "look", to: "door", on: "after" },
  ],
  "anna-good-evening": [
    { do: "enter", to: "inside", on: "before" },
    { who: "maria", do: "wipe", on: "before" },
  ],
  "maria-come-in": [
    { do: "beckon", to: "anna", on: "poď" },
    { who: "anna", do: "go", to: "middle", on: "ďalej" },
    { who: "anna", do: "look", to: "door", on: "kde" },
    { do: "look", to: "door", on: "marek" },
  ],
  "marek-parking": [
    { do: "enter", to: "inside", on: "before" },
    { who: "anna", do: "look", to: "marek", on: "dobrý" },
    { do: "pocket", what: "keys", on: "parkoval" },
  ],
  // The recorder goes on the counter's end, to catch the cooking and stay for supper; then Marek waits his turn at the sink.
  // Anna goes when told to wash, and walks ahead of Marek, so nobody walks through anybody.
  "maria-wash-hands": [
    { do: "beckon", to: "marek", on: "poďte" },
    { who: "anna", do: "go", to: "sink", on: "umyte" },
    { who: "anna", do: "wash" },
    { who: "marek", do: "go", to: "counter-end", on: "ruky" },
    { do: "point", to: "basin", on: "tam" },
    { do: "camera", to: "counter", zoom: 1.3, on: "tam" },
    { who: "marek", do: "take", what: "recorder" },
    { who: "marek", do: "put", what: "recorder", to: "counter", dx: -50 },
  ],
  // Drying her hands as she offers to help.
  "anna-help-with": [
    { do: "go", to: "by-towel", on: "start" },
    { do: "dry", to: "towel" },
  ],
  // Marek takes his turn at the sink as soon as Anna is at the board, and is dry and at the cupboard by "Tento?".
  "maria-peel-take-pot": [
    { who: "anna", do: "go", to: "board", on: "ošúp" },
    { who: "anna", do: "take", what: "knife" },
    { who: "anna", do: "peel", what: "carrot" },
    { do: "point", to: "carrot", on: "mrkvu" },
    { who: "marek", do: "go", to: "sink", on: "mrkvu" },
    { who: "marek", do: "wash" },
    { who: "marek", do: "go", to: "by-towel" },
    { who: "marek", do: "dry", to: "towel" },
    { who: "marek", do: "go", to: "cupboard" },
    { do: "point", to: "pot", on: "hrniec" },
  ],
  "marek-heavy-pot": [
    { do: "point", to: "pot", on: "tento" },
    { do: "take", what: "pot", on: "no" },
    { who: "anna", do: "chop", what: "carrot", on: "start" },
  ],
  // The pot stands in the sink to fill, so the water is seen going in. Mária lights her burner once the pot is on it, and Marek steps back out of the cooks' way.
  "maria-fill-pot": [
    { do: "nod", on: "hej" },
    { who: "marek", do: "put", what: "pot", to: "basin", on: "nalej" },
    { who: "marek", do: "fill", what: "pot" },
    { who: "marek", do: "take", what: "pot" },
    { who: "marek", do: "go", to: "hob-near" },
    { who: "marek", do: "put", what: "pot", to: "hob" },
    { do: "switch", what: "stove", to: "on" },
    { who: "marek", do: "go", to: "aside" },
  ],
  // She shows the cut, not points at the carrot she stands over.
  "anna-like-this": [
    { do: "chop", what: "carrot", on: "takto" },
    { who: "maria", do: "look", to: "carrot", on: "takto" },
  ],
  // Anna steps back to make room at the board, and comes back to it.
  "maria-smaller-pieces": [
    { do: "wag", on: "nie" },
    { do: "go", to: "board-across" },
    { who: "anna", do: "go", to: "board-back", on: "kúsky" },
    { do: "take", what: "knife", on: "pozri" },
    { do: "chop", what: "carrot", to: "small" },
    { do: "give", what: "knife", to: "anna" },
    { do: "go", to: "cook" },
    { who: "anna", do: "go", to: "board" },
  ],
  // Anna tips the carrots in from the stove's side, then Marek comes over for the salt.
  "maria-salt": [
    { who: "anna", do: "put", what: "knife", to: "knife-place", on: "hoď" },
    { who: "anna", do: "take", what: "board" },
    { who: "anna", do: "go", to: "pot-left" },
    { who: "anna", do: "pour", what: "board", to: "pot" },
    { who: "anna", do: "go", to: "board" },
    { who: "anna", do: "put", what: "board", to: "board-place" },
    { do: "take", what: "salt", on: "soľ" },
    // Not on his name: Anna is still at the pot then.
    { who: "marek", do: "go", to: "pot-left", on: "soľ" },
    { do: "give", what: "salt", to: "marek" },
  ],
  "marek-a-little": [{ do: "shake", what: "salt", to: "pot", on: "start" }],
  "maria-not-a-little": [
    { do: "take", what: "salt", on: "marek" },
    { do: "wag", on: "nesyp" },
    { who: "anna", do: "laugh", on: "preboha" },
    { who: "marek", do: "shrug", on: "toľko" },
    { do: "put", what: "salt", to: "salt-place", on: "after" },
    { who: "marek", do: "go", to: "aside", on: "after" },
  ],
  "anna-top-up": [
    { do: "go", to: "pot-left", on: "nevadí" },
    { do: "take", what: "jug" },
    { do: "pour", what: "jug", to: "pot", on: "dolejeme" },
  ],
  "maria-cook-an-hour": [
    { who: "anna", do: "put", what: "jug", to: "jug-place", on: "start" },
    { who: "anna", do: "go", to: "board" },
    { do: "look", to: "hodiny", on: "hodinku" },
    { do: "skip", minutes: 60, on: "after" },
    { do: "camera", to: "wide", on: "dark" },
    { who: "marek", do: "go", to: "chat", on: "dark" },
    { who: "anna", do: "go", to: "middle", on: "dark" },
  ],
  "anna-smells-good": [{ do: "sniff", on: "start" }],
  "maria-soup-ready": [
    { do: "take", what: "spoon", on: "polievka" },
    { do: "dip", what: "spoon", to: "pot" },
    // Called over, and held out to him once he is there.
    { who: "marek", do: "go", to: "pot-left", on: "marek" },
    { do: "offer", what: "spoon", to: "marek", on: "ochutnaj" },
    { do: "camera", to: "marek", zoom: 1.6, on: "ochutnaj" },
    // Over to watch the tasting, a step back from him so she can lean in.
    { who: "anna", do: "go", to: "board-back", on: "ochutnaj" },
  ],
  "marek-burns": [
    { do: "take", what: "spoon", on: "before" },
    { do: "taste", what: "spoon" },
    { do: "burn", on: "start" },
    { who: "anna", do: "look", to: "marek", on: "start" },
    { who: "maria", do: "wag", on: "páli" },
  ],
  "anna-is-it-good": [
    { do: "camera", to: "counter", zoom: 1.3, on: "start" },
    { do: "lean", to: "marek", on: "start" },
    { who: "marek", do: "dip", what: "spoon", to: "pot", on: "start" },
    { who: "marek", do: "blow", what: "spoon" },
  ],
  // The spoon goes back to the cook, who hangs it on the rail.
  "marek-bit-salty": [
    { do: "taste", what: "spoon", on: "before" },
    { do: "thumbs", on: "výborná" },
    // The salt, paid off.
    { who: "anna", do: "laugh", on: "slaná" },
    { who: "maria", do: "facepalm", on: "slaná" },
    { do: "nod", on: "ale" },
    { do: "give", what: "spoon", to: "maria", on: "after" },
    { who: "maria", do: "put", what: "spoon", to: "rail", dx: 5 },
  ],
};

const kitchen: ListeningChapter = {
  id: `${PREFIX}kitchen`,
  stage: "kitchen",
  titleSk: "U Márie",
  title: "Cooking at Mária's",
  setup: {
    objects: [
      { id: "keys", kind: "keys", start: { where: { hand: "marek", side: "lead" } } },
      { id: "phone", kind: "phone", start: { where: { pocket: "marek" } } },
      { id: "recorder", kind: "mic", start: { where: { pocket: "marek" } } },
    ],
    spots: { maria: "cook" },
  },
  lines: staged(
    PREFIX,
    [
      line(
        "maria-counting-veg",
        "Mária",
        ["Tak", STOP, "mrkva, soľ", STOP],
        "Right… carrots, salt…",
      ),
      line(
        "anna-good-evening",
        "Anna",
        ["Dobrý večer, pani Mária!"],
        "Good evening, Mrs. Mária!",
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
          " ruky, tam pri dreze.",
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
        ["Hej, ten. ", mark("Nalej"), " do neho vodu a ", mark("daj"), " ho na sporák."],
        "Yes, that one. Pour water into it and put it on the stove.",
        { to: "Marek" },
      ),
      line("anna-like-this", "Anna", ["Pani Mária, takto?"], "Mrs. Mária, like this?", {
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
        [
          "Anna, ",
          mark("hoď"),
          " mrkvu do hrnca. ",
          PAUSE,
          "A Marek, ",
          mark("daj"),
          " tam soľ. ",
          PAUSE,
          "Ale len trošku!",
        ],
        "Anna, throw the carrots in the pot. And Marek, put the salt in. But just a little!",
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
        [SIGH, "Marek! ", PAUSE, "Preboha, ", mark("nesyp"), " toľko!"],
        "Marek! Good grief, don't pour so much!",
      ),
      line(
        "anna-top-up",
        "Anna",
        [CHUCKLE, "Nevadí. ", PAUSE, "Dolejeme vodu."],
        "Never mind. We'll top it up with water.",
      ),
      line(
        "maria-cook-an-hour",
        "Mária",
        ["Tak. ", PAUSE, "A teraz to necháme hodinku variť."],
        "Right. And now we'll let it cook for an hour.",
      ),
      line("anna-smells-good", "Anna", ["Mmm, to vonia!"], "Mmm, that smells good!"),
      line(
        "maria-soup-ready",
        "Mária",
        [
          "Hodinka ubehla. Polievka je hotová. ",
          PAUSE,
          "Marek, ",
          mark("ochutnaj"),
          ". ",
          PAUSE,
          "Pozor, je horúca!",
        ],
        "The hour has gone by. The soup is ready. Marek, taste it. Careful, it's hot!",
      ),
      line(
        "marek-burns",
        "Marek",
        [SURPRISED, "Au! ", PAUSE, "To páli!"],
        "Ow! That burns!",
      ),
      line(
        "anna-is-it-good",
        "Anna",
        [CHUCKLE, "No ", mark("povedz"), ", je dobrá?"],
        "Well, tell us, is it good?",
        { to: "Marek" },
      ),
      line(
        "marek-bit-salty",
        "Marek",
        [HAPPY, "Výborná! ", PAUSE, "Trochu slaná", STOP, "ale výborná."],
        "Excellent! A bit salty… but excellent.",
      ),
    ],
    KITCHEN_ACTS,
  ),
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
      id: `${PREFIX}check-nesyp`,
      gap: "Marek! Preboha, ___ toľko!",
      prompt: "Ktoré slovo povedala Mária?",
      promptEnglish: "Which word did Mária say?",
      replayLineId: `${PREFIX}maria-not-a-little`,
      choices: [
        { id: "nesyp", label: "nesyp" },
        {
          id: "syp",
          label: "syp",
          whyWrong:
            "**Syp** means pour, the opposite of what Mária wants. She stops him: **nesyp**, don't pour.",
        },
        {
          id: "nesypes",
          label: "nesypeš",
          whyWrong:
            "**Nesypeš** means you don't pour: it says what he does, it is not a command.",
        },
      ],
      answerId: "nesyp",
      feedback: {
        english: "Marek! Good grief, don't pour so much!",
        why: "A “don't” is **ne-** in front of the command: **syp**, **nesyp**.",
      },
    },
    {
      id: `${PREFIX}check-umyte`,
      gap: "Najprv si ___ ruky, tam pri dreze.",
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

/**
 * At the table, laid for four: Lucia's chair stays empty. The stove is still
 * on under the soup; they decide to wait for her, so nobody eats yet.
 */
const TABLE_ACTS: Record<string, Cue[]> = {
  "maria-sit-down": [
    { do: "beckon", to: "table", on: "sadnite" },
    { who: "anna", do: "sit", to: "seat-l", on: "si" },
    { who: "marek", do: "sit", to: "seat-br", on: "si" },
    { do: "sit", to: "seat-r", on: "a" },
    { do: "look", to: "seat-bl", on: "nikde" },
    { do: "look", to: "hodiny", on: "veď" },
  ],
  "anna-late-again": [
    { do: "shrug", on: "start" },
    { do: "take", what: "spoon-l", on: "after" },
  ],
  // He reaches for it while it rings, and the others look over at once.
  "marek-its-her": [
    { do: "take", what: "phone", on: "before" },
    { who: "anna", do: "look", to: "marek", on: "before" },
    { who: "maria", do: "look", to: "marek", on: "before" },
    { do: "call", what: "phone", on: "ahoj" },
  ],
  "lucia-eat-without-me": [{ who: "maria", do: "lean", to: "marek", on: "start" }],
  "marek-come": [{ do: "beckon", on: "príď" }],
  "maria-let-her-come": [{ do: "point", to: "pot", on: "polievky" }],
  "lucia-half-hour": [{ who: "marek", do: "nod", on: "start" }],
  "marek-shes-coming": [
    { do: "hangup", what: "phone", on: "čau" },
    { do: "put", what: "phone", to: "phone", on: "príde" },
  ],
  "anna-we-will-wait": [{ do: "put", what: "spoon-l", to: "bowl-l", on: "start" }],
  "maria-then-wait": [
    { do: "nod", on: "no" },
    { who: "marek", do: "look", to: "bowl-br", on: "polievku" },
    { do: "stand", on: "polievku" },
    { do: "go", to: "cook" },
    { do: "switch", what: "stove", to: "off" },
    // Hungry, he checks how long half an hour is; the game picks up from there.
    { who: "marek", do: "look", to: "hodiny", on: "after" },
    { who: "anna", do: "laugh", on: "after" },
  ],
};

const table: ListeningChapter = {
  id: `${PREFIX}table`,
  stage: "kitchen",
  titleSk: "Pri stole",
  title: "Lucia calls",
  lines: staged(
    PREFIX,
    [
      line(
        "maria-sit-down",
        "Mária",
        [
          mark("Sadnite"),
          " si. ",
          PAUSE,
          "A Lucia stále nikde? ",
          PAUSE,
          "Veď mala prísť.",
        ],
        "Sit down. And still no Lucia? She was supposed to come.",
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
          ", ešte som v práci. Asi neprídem. ",
          PAUSE,
          mark("Nečakajte"),
          " na mňa, pokojne ",
          mark("jedzte"),
          ".",
        ],
        "Hi! Sorry, I'm still at work. I probably won't make it. Don't wait for me, go ahead and eat.",
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
        ["Tak ", mark("počkajme"), " na ňu."],
        "Then let's wait for her.",
        { to: "Mária" },
      ),
      line(
        "maria-then-wait",
        "Mária",
        [CHUCKLE, "No dobre, počkáme. ", PAUSE, "Polievku potom zohrejem."],
        "Well, all right, we'll wait. I'll warm the soup up later.",
      ),
    ],
    TABLE_ACTS,
  ),
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
            "It was hot, but that is not why. Anna says **tak počkajme na ňu**: then let's wait for her.",
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
        english: "Then let's wait for her.",
        why: "Lucia is coming in half an hour, and Anna says **tak počkajme na ňu**. Mária agrees: **počkáme**.",
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
      ["A teraz ty, Anna: ", PAUSE, "správne alebo nesprávne?"],
      "And now it's your turn, Anna: right or wrong?",
    ),
    line(
      "marek-first-sentence",
      "Marek",
      ["Prvá veta: ", PAUSE, "Píšajte nám."],
      "First sentence: Píšajte nám. (Wrong on purpose.)",
    ),
    afterThinking(
      line(
        "anna-piste",
        "Anna",
        [
          "Nesprávne! ",
          PAUSE,
          "Píšu",
          STOP,
          mark("píš"),
          ". ",
          PAUSE,
          "Správne je: ",
          mark("Píšte"),
          " nám.",
        ],
        "Wrong! Píšu (they write)… píš. The right one is: Píšte nám, write to us.",
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
      ["A posledná veta: ", PAUSE, "Hovoraj pomalšie."],
      "And the last sentence: Hovoraj pomalšie. (Wrong on purpose.)",
    ),
    afterThinking(
      line(
        "anna-hovor",
        "Anna",
        [
          "Nesprávne! ",
          PAUSE,
          "Hovoria",
          STOP,
          mark("hovor"),
          ". ",
          PAUSE,
          "Správne je: ",
          mark("Hovor"),
          " pomalšie, prosím.",
        ],
        "Wrong! Hovoria (they speak)… hovor. The right one is: Hovor pomalšie, prosím, speak more slowly, please.",
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
          id: "write",
          label: "Píšajte nám.",
          whyWrong:
            "Anna says **nesprávne**: from **píšu** comes **píš**, so to everyone it is **píšte nám**.",
        },
        {
          id: "slowly",
          label: "Hovoraj pomalšie.",
          whyWrong:
            "Anna says **nesprávne**: from **hovoria** comes **hovor**, so **hovor pomalšie**.",
        },
      ],
      answerId: "quiet",
      feedback: {
        english: "Be quiet, please.",
        why: "Anna says **správne** after **buďte ticho, prosím**: **byť** gives **buď**, **buďte**.",
      },
    },
    {
      id: `${PREFIX}check-hovor`,
      gap: "___ pomalšie, prosím.",
      prompt: "Ako to Anna povedala správne?",
      promptEnglish: "How did Anna say it correctly?",
      replayLineId: `${PREFIX}anna-hovor`,
      choices: [
        { id: "hovor", label: "Hovor" },
        {
          id: "hovoraj",
          label: "Hovoraj",
          whyWrong:
            "**Hovoraj** is the wrong form Marek reads out, built like **čítaj**. From **hovoria** comes **hovor**.",
        },
        {
          id: "hovori",
          label: "Hovori",
          whyWrong:
            "**Hovori** is not a command. Drop the ending of **hovoria** and nothing more: **hovor**.",
        },
      ],
      answerId: "hovor",
      feedback: {
        english: "Speak more slowly, please.",
        why: "Anna says **hovoria… hovor**: drop the ending, and **hovor pomalšie, prosím**.",
      },
    },
  ],
};

/** The goodbye, and at last the plant gets its water: Marek leaves the desk for it. */
const OUTRO_ACTS: Record<string, Cue[]> = {
  "anna-and-the-plant": [
    { do: "point", to: "plant", on: "rastlinka" },
    { do: "fold", on: "včera" },
  ],
  "marek-right-away": [
    { do: "take", what: "headphones", on: "jaj" },
    // In front of him, past his mug.
    { do: "put", what: "headphones", to: "desk", dx: 34 },
    { do: "stand", on: "už" },
    { do: "go", to: "plant" },
  ],
  "marek-sorry-plant": [
    { do: "take", what: "can", on: "start" },
    { do: "pour", what: "can", to: "plant", on: "tu" },
    { do: "wag", on: "nezaspi" },
    // Done with it, the can goes straight back where it lives.
    { do: "put", what: "can", to: "corner", dx: -15 },
  ],
  "anna-water-yours-too": [
    { do: "laugh", on: "marek" },
    { who: "marek", do: "look", to: "anna", on: "marek" },
    { do: "point", to: "marek", on: "sebe" },
    { who: "marek", do: "shrug", on: "rastlinke" },
    { who: "marek", do: "sit", to: "desk-right" },
  ],
  // They wave together once; then the yawn from the start of the show, and Anna laughs at it.
  "marek-bye": [
    { do: "wave", on: "start" },
    { who: "anna", do: "wave", on: "start" },
    { do: "yawn", on: "after" },
    { who: "anna", do: "laugh", on: "after" },
  ],
};

const outro: ListeningChapter = {
  id: `${PREFIX}outro`,
  titleSk: "Záver",
  title: "That's all for today",
  setup: {
    objects: [
      {
        id: "headphones",
        kind: "headphones",
        start: { where: { wear: "marek" }, of: "marek" },
      },
    ],
  },
  lines: staged(
    PREFIX,
    [
      line(
        "marek-thats-all",
        "Marek",
        ["To je na dnes všetko."],
        "That's all for today.",
      ),
      line(
        "anna-thanks-write-to-us",
        "Anna",
        [
          "Ďakujeme, že ste nás počúvali. ",
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
        [
          SIGH,
          "Marek? ",
          PAUSE,
          "A tá rastlinka? ",
          PAUSE,
          "Včera si sľúbil: hneď po nahrávaní.",
        ],
        "Marek? And that little plant? Yesterday you promised: right after the recording.",
        { to: "Marek" },
      ),
      line(
        "marek-right-away",
        "Marek",
        [SURPRISED, "Jaj, rastlinka! ", PAUSE, "Už idem!"],
        "Oh no, the little plant! I'm coming!",
      ),
      line(
        "marek-sorry-plant",
        "Marek",
        [
          "Prepáč, rastlinka. ",
          PAUSE,
          "Tu máš vodu. ",
          PAUSE,
          "A ",
          mark("nezaspi"),
          "!",
        ],
        "Sorry, little plant. Here's some water. And don't fall asleep!",
      ),
      line(
        "anna-water-yours-too",
        "Anna",
        [
          CHUCKLE,
          "Marek, to ",
          mark("povedz"),
          " sebe, nie rastlinke! ",
          PAUSE,
          "A vy, milí poslucháči, ",
          mark("nezabudnite"),
          ": ",
          mark("polejte"),
          " si rastlinky! ",
          PAUSE,
          mark("Majte"),
          " sa pekne!",
        ],
        "Marek, tell that to yourself, not the plant! And you, dear listeners, don't forget: water your plants! Take care!",
      ),
      line("marek-bye", "Marek", ["Ahojte!"], "Bye!"),
    ],
    OUTRO_ACTS,
  ),
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
        why: "Anna said at the start: **tak ju hneď polej**. Marek promised to do it right after the recording, but only the next day says **prepáč, rastlinka, tu máš vodu**.",
      },
    },
    {
      id: `${PREFIX}check-polejte`,
      gap: "A vy, milí poslucháči, nezabudnite: ___ si rastlinky!",
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
        english: "Don't forget: water your plants!",
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
  titleSk: "Polej tú rastlinku!",
  title: "Water that little plant!",
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
