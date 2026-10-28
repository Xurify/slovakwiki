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
  NO_PICK,
  lineWriter,
  listenerPicks,
  onPath,
  staged,
  type Part,
} from "../dialogue";
import type { DialogueTurn, ListenerPath } from "$lib/learning/types";
import type { ListeningChapter, ListeningEpisode } from "../types";
import type { Cue } from "$lib/stick-figure/acts";

const PREFIX = "podcast-imperative-";
const line = lineWriter(PREFIX);

/** An imperative, the episode's topic, lit in the transcript. Wrong forms said on purpose stay unlit. */
function mark(text: string): Exclude<MarkedPart, string> {
  return { role: "imperative", text };
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
    { do: "put", what: "cup-marek", to: "desk", dx: 17, on: "after" },
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
      // Its handle away from Marek, as he holds it to drink.
      {
        id: "cup-marek",
        kind: "cup",
        start: { where: { on: "desk", dx: 17 }, fill: "coffee", turned: true },
      },
      // In front of Marek, clear of his mic's clamp and his mug.
      { id: "recorder", kind: "mic", start: { where: { on: "desk", dx: 33 } } },
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
    { do: "look", to: "salt", on: "soľ" },
    { do: "take", what: "salt", on: "soľ" },
    { do: "put", what: "salt", to: "salt-place" },
    { who: "anna", do: "knock", on: "after" },
    { do: "look", to: "door", on: "after" },
  ],
  // Mária turns from the stove to the door as it opens, and nods the greeting back.
  "anna-good-evening": [
    { do: "enter", to: "inside", on: "before" },
    { who: "maria", do: "wipe", on: "before" },
    { who: "maria", do: "look", to: "door", on: "before" },
    { who: "maria", do: "nod", on: "večer" },
  ],
  "maria-come-in": [
    { do: "beckon", to: "anna", on: "poď" },
    { who: "anna", do: "go", to: "middle", on: "ďalej" },
    { who: "anna", do: "look", to: "door", on: "kde" },
    { do: "look", to: "door", on: "marek" },
  ],
  // Both in the room turn to the door as it opens; Anna, who has just been greeted herself, waves him in.
  "marek-parking": [
    { do: "enter", to: "inside", on: "before" },
    { who: "anna", do: "look", to: "marek", on: "before" },
    { who: "maria", do: "look", to: "door", on: "before" },
    { do: "nod", on: "dobrý" },
    { who: "maria", do: "nod", on: "dobrý" },
    { who: "anna", do: "wave", on: "večer" },
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
  // Marek takes his turn at the sink as soon as Anna is at the board, and is at the cupboard by "Tento?".
  "maria-peel-take-pot": [
    { who: "anna", do: "go", to: "board", on: "ošúp" },
    { who: "anna", do: "take", what: "knife" },
    { who: "anna", do: "peel", what: "carrot" },
    { do: "point", to: "carrot", on: "mrkvu" },
    { who: "marek", do: "go", to: "sink", on: "mrkvu" },
    // He shakes his hands dry over the sink: the towel is past Anna at the board, and going to it and back he walked through her twice.
    { who: "marek", do: "wash" },
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
  // Anna steps back to make room at the board, and comes back to it. The
  // knife goes down by the board rather than hand to hand: handed across, it
  // read as a handshake, blade first.
  "maria-smaller-pieces": [
    { do: "wag", on: "nie" },
    { do: "go", to: "board-across" },
    { who: "anna", do: "go", to: "board-back", on: "kúsky" },
    { do: "take", what: "knife", on: "pozri" },
    { do: "chop", what: "carrot", to: "small" },
    { do: "put", what: "knife", to: "knife-place" },
    { do: "go", to: "cook" },
    { who: "anna", do: "go", to: "board" },
  ],
  // Anna tips the carrots in from the stove's side, then Marek comes over for the salt, and she steps back to give him room.
  "maria-salt": [
    { who: "anna", do: "take", what: "board", on: "hoď" },
    { who: "anna", do: "go", to: "pot-left" },
    { who: "anna", do: "pour", what: "board", to: "pot" },
    { who: "anna", do: "go", to: "board" },
    { who: "anna", do: "put", what: "board", to: "board-place" },
    { who: "anna", do: "go", to: "board-back" },
    { do: "take", what: "salt", on: "soľ" },
    // Not on his name: Anna is still at the pot then.
    { who: "marek", do: "go", to: "pot-left", on: "soľ" },
    // A step over to him, so the salt changes hands at the chest beside the pot, not across it at head height.
    { do: "go", to: "at-stove" },
    { do: "give", what: "salt", to: "marek" },
    { do: "go", to: "cook" },
  ],
  "marek-a-little": [{ do: "shake", what: "salt", to: "pot", on: "start" }],
  "maria-not-a-little": [
    { do: "go", to: "at-stove", on: "marek" },
    { do: "take", what: "salt" },
    { do: "wag", on: "nesyp" },
    { who: "anna", do: "laugh", on: "preboha" },
    { who: "marek", do: "shrug", on: "toľko" },
    { do: "go", to: "cook", on: "after" },
    { do: "put", what: "salt", to: "salt-place" },
    { who: "marek", do: "go", to: "aside", on: "after" },
  ],
  "anna-top-up": [
    { do: "go", to: "jug-left", on: "nevadí" },
    { do: "take", what: "jug" },
    { do: "go", to: "pot-left" },
    { do: "pour", what: "jug", to: "pot", on: "dolejeme" },
  ],
  "maria-cook-an-hour": [
    { who: "anna", do: "go", to: "jug-left", on: "start" },
    { who: "anna", do: "put", what: "jug", to: "jug-place" },
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
        ["Tak", STOP, "mrkva,", PAUSE, "soľ", STOP],
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
  // He reaches for it while it rings, and Mária looks over at once; Anna, across the table, already faces him and keeps her spoon up.
  "marek-its-her": [
    { do: "take", what: "phone", on: "before" },
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
    // Hungry, he checks how long half an hour is.
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

const ASK_HOD = `${PREFIX}marek-which-hod`;
const ASK_SADNITE = `${PREFIX}marek-which-sadnite`;
const ASK_NECAKAJTE = `${PREFIX}marek-which-necakajte`;

/** What Anna says once more where the listener's picks went mostly wrong. */
const ONCE_MORE: Part[] = [
  "Ešte raz, pomaly: ",
  PAUSE,
  mark("hoď"),
  " mrkvu do hrnca, ",
  PAUSE,
  mark("sadnite"),
  " si, ",
  PAUSE,
  mark("nečakajte"),
  " na mňa.",
];

const help: ListeningChapter = {
  id: `${PREFIX}help`,
  titleSk: "Pomôžte Marekovi",
  title: "Your game: help Marek pick the command",
  lines: [
    line(
      "anna-back-in-studio",
      "Anna",
      ["Dobré ráno! Sme späť v štúdiu. ", PAUSE, "A rastlinka je stále žltá."],
      "Good morning! We're back in the studio. And the little plant is still yellow.",
    ),
    line(
      "marek-yesterday-orders",
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
      "anna-do-you-remember",
      "Anna",
      [
        CHUCKLE,
        "Ako vždy. ",
        PAUSE,
        "No nič. Marek, pamätáš si, čo ti včera všetko hovorila Mária?",
      ],
      "As always. Anyway. Marek, do you remember everything Mária told you yesterday?",
      { to: "Marek" },
    ),
    line(
      "marek-lots-of-them",
      "Marek",
      [SURPRISED, "Ja? ", PAUSE, "Ojoj… ", PAUSE, "bolo toho veľa."],
      "Me? Uh-oh… there was a lot of it.",
    ),
    line(
      "marek-listeners-help-me",
      "Marek",
      [EXCITED, "Milí poslucháči, ", mark("pomôžte"), " mi!"],
      "Dear listeners, help me!",
    ),
    line(
      "anna-listeners-choose",
      "Anna",
      [
        "Takže predsa len potrebuješ pomoc. ",
        PAUSE,
        "No dobre: poslucháči vyberú a ty to povieš.",
      ],
      "So you need help after all. Oh well: the listeners will choose and you'll say it.",
    ),
    // The forms in the question stay unlit, or the transcript would give the answer away.
    {
      ...line(
        "anna-first-hodit",
        "Anna",
        [
          "Prvé: hodiť. ",
          PAUSE,
          "Čo mi včera povedala Mária, keď sme robili polievku? ",
          PAUSE,
          "Hod mrkvu do hrnca, alebo hoď mrkvu do hrnca?",
        ],
        "First: hodiť, to throw. What did Mária tell me yesterday when we were making the soup? Hod mrkvu do hrnca, or hoď mrkvu do hrnca?",
      ),
      wait: BEAT_MS,
    },
    listenerPicks(
      line(
        "marek-which-hod",
        "Marek",
        ["Mrkvu si pamätám, ale slovo nie. ", PAUSE, "Čo poviete, pomocníci?"],
        "I remember the carrots, but not the word. What do you say, helpers?",
      ),
      {
        prompt: "Čo má Marek povedať?",
        choices: [
          {
            id: "hod",
            label: "Hod mrkvu do hrnca",
            english: "Throw the carrots in the pot",
          },
          {
            id: "hod-soft",
            label: "Hoď mrkvu do hrnca",
            english: "Throw the carrots in the pot",
          },
        ],
        answerId: "hod-soft",
        judge: "Anna",
      },
    ),
    onPath(
      line(
        "marek-hod-soft-you-say",
        "Marek",
        [
          mark("Hoď"),
          ", hovoríte? ",
          PAUSE,
          "Áno: Anna, ",
          mark("hoď"),
          " mrkvu do hrnca!",
        ],
        "Hoď, you say? Yes: Anna, throw the carrots in the pot!",
        { to: "Anna" },
      ),
      { ask: ASK_HOD, picks: ["hod-soft"] },
    ),
    onPath(
      line(
        "marek-hod-you-say",
        "Marek",
        ["Hod, hovoríte? ", PAUSE, "Áno: Anna, hod mrkvu do hrnca!"],
        "Hod, you say? Yes: Anna, throw the carrots in the pot! (Wrong on purpose.)",
        { to: "Anna" },
      ),
      { ask: ASK_HOD, picks: ["hod"] },
    ),
    {
      ...onPath(
        line(
          "marek-hod-myself",
          "Marek",
          ["Tak si vyberiem sám: ", PAUSE, "Anna, ", mark("hoď"), " mrkvu do hrnca!"],
          "Then I'll pick myself: Anna, throw the carrots in the pot!",
          { to: "Anna" },
        ),
        { ask: ASK_HOD, picks: [NO_PICK] },
      ),
      wait: BEAT_MS,
    },
    onPath(
      line(
        "anna-hod-right",
        "Anna",
        ["Správne! ", PAUSE, "Hodia, takže ", mark("hoď"), "."],
        "Right! Hodia (they throw), so hoď.",
      ),
      { ask: ASK_HOD, picks: ["hod-soft", NO_PICK] },
    ),
    onPath(
      line(
        "marek-you-cut-carrots",
        "Marek",
        ["Ale mrkvu si nakrájala ty."],
        "But it was you who cut up the carrots.",
      ),
      { ask: ASK_HOD, picks: ["hod-soft", NO_PICK] },
    ),
    onPath(
      line(
        "anna-big-pieces",
        "Anna",
        [CHUCKLE, "Hej. ", PAUSE, "Tie veľké kúsky."],
        "Yeah. Those big pieces.",
      ),
      { ask: ASK_HOD, picks: ["hod-soft", NO_PICK] },
    ),
    onPath(
      line(
        "anna-hod-wrong",
        "Anna",
        [
          "Nesprávne! ",
          PAUSE,
          "Nie hod, ale ",
          mark("hoď"),
          ". ",
          PAUSE,
          "Hodia, takže ",
          mark("hoď"),
          ".",
        ],
        "Wrong! Not hod, but hoď. Hodia (they throw), so hoď.",
      ),
      { ask: ASK_HOD, picks: ["hod"] },
    ),
    onPath(
      line(
        "marek-carrot-throw",
        "Marek",
        [CHUCKLE, "Hod mrkvou", STOP, PAUSE, "To je nejaký nový šport?"],
        "A carrot throw… Is that some new sport?",
      ),
      { ask: ASK_HOD, picks: ["hod"] },
    ),
    onPath(
      line(
        "anna-hod-the-carrots",
        "Anna",
        ["Nie, Marek. ", PAUSE, mark("Hoď"), " mrkvu do hrnca."],
        "No, Marek. Throw the carrots in the pot.",
      ),
      { ask: ASK_HOD, picks: ["hod"] },
    ),
    {
      ...line(
        "anna-second-sadnut",
        "Anna",
        [
          "Dobre, ideme ďalej. ",
          PAUSE,
          "Druhé: sadnúť si. ",
          PAUSE,
          "Čo nám povedala Mária pri stole? ",
          PAUSE,
          "Sadni si, alebo sadnite si?",
        ],
        "OK, moving on. Second: sadnúť si, to sit down. What did Mária tell us at the table? Sadni si, or sadnite si?",
      ),
      wait: BEAT_MS,
    },
    listenerPicks(
      line(
        "marek-which-sadnite",
        "Marek",
        ["Ja som vtedy myslel len na polievku. ", PAUSE, "Pomôžete mi?"],
        "I was only thinking about the soup then. Will you help me?",
      ),
      {
        prompt: "Čo má Marek povedať?",
        choices: [
          { id: "sadni", label: "Sadni si", english: "Sit down" },
          { id: "sadnite", label: "Sadnite si", english: "Sit down" },
        ],
        answerId: "sadnite",
        judge: "Anna",
      },
    ),
    onPath(
      line(
        "marek-sadnite-you-say",
        "Marek",
        [
          mark("Sadnite"),
          " si, vravíte? ",
          PAUSE,
          "Dobre: milí poslucháči, ",
          mark("sadnite"),
          " si!",
        ],
        "Sadnite si, you say? OK: dear listeners, sit down!",
      ),
      { ask: ASK_SADNITE, picks: ["sadnite"] },
    ),
    onPath(
      line(
        "marek-sadni-you-say",
        "Marek",
        [
          mark("Sadni"),
          " si, vravíte? ",
          PAUSE,
          "Dobre: milí poslucháči, ",
          mark("sadni"),
          " si!",
        ],
        "Sadni si, you say? OK: dear listeners, sit down! (Wrong on purpose: sadni is for one person.)",
      ),
      { ask: ASK_SADNITE, picks: ["sadni"] },
    ),
    {
      ...onPath(
        line(
          "marek-sadnite-guess",
          "Marek",
          ["Tak si tipnem: ", PAUSE, "milí poslucháči, ", mark("sadnite"), " si!"],
          "Then I'll take a guess: dear listeners, sit down!",
        ),
        { ask: ASK_SADNITE, picks: [NO_PICK] },
      ),
      wait: BEAT_MS,
    },
    onPath(
      line(
        "anna-sadnite-right",
        "Anna",
        [
          "Správne! ",
          PAUSE,
          "Mária to povedala nám všetkým, takže ",
          mark("sadnite"),
          " si.",
        ],
        "Right! Mária said it to all of us, so sadnite si.",
      ),
      { ask: ASK_SADNITE, picks: ["sadnite", NO_PICK] },
    ),
    onPath(
      line(
        "marek-whoever-sits",
        "Marek",
        [CHUCKLE, "A kto už sedí, nech sedí."],
        "And whoever is already sitting, stay sitting.",
      ),
      { ask: ASK_SADNITE, picks: ["sadnite", NO_PICK] },
    ),
    onPath(
      line(
        "anna-sadnite-wrong",
        "Anna",
        [
          "Nesprávne! ",
          PAUSE,
          mark("Sadni"),
          " si je pre jedného. ",
          PAUSE,
          "Mária to povedala nám všetkým: ",
          mark("sadnite"),
          " si.",
        ],
        "Wrong! Sadni si is for one person. Mária said it to all of us: sadnite si.",
      ),
      { ask: ASK_SADNITE, picks: ["sadni"] },
    ),
    onPath(
      line(
        "marek-one-sat-down",
        "Marek",
        ["Hm. ", PAUSE, "Tak si sadol len jeden poslucháč."],
        "Hmm. So only one listener sat down.",
      ),
      { ask: ASK_SADNITE, picks: ["sadni"] },
    ),
    onPath(
      line(
        "anna-the-rest-stand",
        "Anna",
        [CHUCKLE, "A ostatní stoja."],
        "And the rest are standing.",
      ),
      { ask: ASK_SADNITE, picks: ["sadni"] },
    ),
    {
      ...line(
        "anna-last-cakat",
        "Anna",
        [
          "A posledné: čakať. ",
          PAUSE,
          "Pamätáš si, čo nám včera povedala Lucia po telefóne?",
        ],
        "And the last one: čakať, to wait. Do you remember what Lucia told us on the phone yesterday?",
      ),
      wait: BEAT_MS,
    },
    line("marek-shes-late", "Marek", ["Že mešká."], "That she's late."),
    line(
      "anna-and-then",
      "Anna",
      [
        CHUCKLE,
        "To áno. ",
        PAUSE,
        "A potom? ",
        PAUSE,
        "Nečakajte na mňa, alebo čakajte na mňa?",
      ],
      "Yes, that. And then? Nečakajte na mňa, or čakajte na mňa?",
    ),
    listenerPicks(
      line(
        "marek-which-necakajte",
        "Marek",
        ["Poslucháči, vy ste to počuli. ", PAUSE, "Ktoré to bolo?"],
        "Listeners, you heard it. Which one was it?",
      ),
      {
        prompt: "Čo má Marek povedať?",
        // The same gloss for both, or the card would answer for the listener.
        choices: [
          { id: "necakajte", label: "Nečakajte na mňa", english: "What Lucia said" },
          { id: "cakajte", label: "Čakajte na mňa", english: "What Lucia said" },
        ],
        answerId: "necakajte",
        judge: "Anna",
      },
    ),
    onPath(
      line(
        "marek-necakajte-you-say",
        "Marek",
        [
          mark("Nečakajte"),
          "? ",
          PAUSE,
          "Jasné: ",
          mark("nečakajte"),
          " na mňa, pokojne ",
          mark("jedzte"),
          "!",
        ],
        "Nečakajte? Sure: don't wait for me, go ahead and eat!",
      ),
      { ask: ASK_NECAKAJTE, picks: ["necakajte"] },
    ),
    onPath(
      line(
        "marek-cakajte-you-say",
        "Marek",
        [
          mark("Čakajte"),
          "? ",
          PAUSE,
          "Jasné: ",
          mark("čakajte"),
          " na mňa, pokojne ",
          mark("jedzte"),
          "!",
        ],
        "Čakajte? Sure: wait for me, go ahead and eat! (Wrong on purpose.)",
      ),
      { ask: ASK_NECAKAJTE, picks: ["cakajte"] },
    ),
    {
      ...onPath(
        line(
          "marek-necakajte-myself",
          "Marek",
          [
            "Tak si spomeniem sám: ",
            PAUSE,
            mark("nečakajte"),
            " na mňa, pokojne ",
            mark("jedzte"),
            "!",
          ],
          "Then I'll remember it myself: don't wait for me, go ahead and eat!",
        ),
        { ask: ASK_NECAKAJTE, picks: [NO_PICK] },
      ),
      wait: BEAT_MS,
    },
    onPath(
      line(
        "anna-necakajte-right",
        "Anna",
        ["Správne! ", PAUSE, "Nechcela, aby sme na ňu čakali."],
        "Right! She didn't want us to wait for her.",
      ),
      { ask: ASK_NECAKAJTE, picks: ["necakajte", NO_PICK] },
    ),
    onPath(
      line(
        "marek-hungry-again",
        "Marek",
        [HAPPY, "Mňam. ", PAUSE, "Už som zase hladný."],
        "Yum. I'm hungry again already.",
      ),
      { ask: ASK_NECAKAJTE, picks: ["necakajte", NO_PICK] },
    ),
    onPath(
      line(
        "anna-necakajte-wrong",
        "Anna",
        ["Nesprávne! ", PAUSE, "Čakať na ňu a pokojne jesť? ", PAUSE, "To naraz nejde."],
        "Wrong! Wait for her and go ahead and eat? You can't do both at once.",
      ),
      { ask: ASK_NECAKAJTE, picks: ["cakajte"] },
    ),
    onPath(
      line(
        "marek-wait-and-eat",
        "Marek",
        ["Prečo nie? ", PAUSE, "Ja viem čakať aj jesť naraz."],
        "Why not? I can wait and eat at the same time.",
      ),
      { ask: ASK_NECAKAJTE, picks: ["cakajte"] },
    ),
    onPath(
      line(
        "anna-lucia-said",
        "Anna",
        [
          CHUCKLE,
          "To ti verím. ",
          PAUSE,
          "Ale Lucia povedala: ",
          mark("nečakajte"),
          " na mňa.",
        ],
        "That I believe. But Lucia said: don't wait for me.",
      ),
      { ask: ASK_NECAKAJTE, picks: ["cakajte"] },
    ),
    ...ending(
      { score: [3] },
      [
        "anna-three-of-three",
        "Anna",
        [HAPPY, "Tri z troch! ", PAUSE, "Marek, s pomocníkmi ti to ide ešte lepšie."],
        "Three out of three! Marek, with helpers it goes even better for you.",
      ],
      [
        "marek-only-ask-them",
        "Marek",
        ["Tak sa odteraz budem pýtať už len ich."],
        "Then from now on I'll ask only them.",
      ],
      [
        "anna-i-can-go-home",
        "Anna",
        ["Tak to ja môžem ísť domov."],
        "Then I can go home.",
      ],
      [
        "marek-no-stay",
        "Marek",
        [CHUCKLE, "Nie, nie, ", mark("zostaň"), "!"],
        "No, no, stay!",
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
        "marek-like-the-soup",
        "Marek",
        [CHUCKLE, "Skoro výborne", STOP, PAUSE, "ako tá polievka."],
        "Almost excellent… like that soup.",
      ],
      [
        "anna-a-bit-salty",
        "Anna",
        [CHUCKLE, "Trochu slaná", STOP, PAUSE, "ale výborná."],
        "A bit salty… but excellent.",
      ],
      ["marek-yeah-yeah", "Marek", [SIGH, "Hej, hej."], "Yeah, yeah."],
    ),
    ...ending(
      { score: [1] },
      [
        "anna-one-of-three",
        "Anna",
        [
          "Jedna z troch. ",
          PAUSE,
          "Hm",
          STOP,
          PAUSE,
          "Marek, kde si našiel takých pomocníkov?",
        ],
        "One out of three. Hmm… Marek, where did you find helpers like that?",
      ],
      [
        "marek-they-found-me",
        "Marek",
        [CHUCKLE, "Ja som ich nehľadal. ", PAUSE, "Oni našli mňa!"],
        "I wasn't looking for them. They found me!",
      ],
      [
        "anna-once-more-one",
        "Anna",
        ["Nevadí. ", PAUSE, ...ONCE_MORE],
        "Never mind. Once more, slowly: throw the carrots in the pot, sit down, don't wait for me.",
      ],
      [
        "marek-got-it-almost",
        "Marek",
        [
          mark("Hoď"),
          ", ",
          mark("sadnite"),
          ", ",
          mark("nečakajte"),
          STOP,
          PAUSE,
          "Mám to! ",
          PAUSE,
          "Skoro.",
        ],
        "Hoď, sadnite, nečakajte… Got it! Almost.",
      ],
    ),
    ...ending(
      { score: [0] },
      [
        "anna-none-of-three",
        "Anna",
        ["Nula z troch! ", PAUSE, "Nevadí. ", PAUSE, ...ONCE_MORE],
        "Zero out of three! Never mind. Once more, slowly: throw the carrots in the pot, sit down, don't wait for me.",
      ],
      ["marek-and-the-salt", "Marek", ["A soľ?"], "And the salt?"],
      [
        "anna-enough-salt",
        "Anna",
        [CHUCKLE, "Soli už bolo dosť."],
        "There's been enough salt already.",
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
        "marek-good-sleep",
        "Marek",
        ["Vidíš? ", PAUSE, "Stačí sa dobre vyspať."],
        "See? You just need a good night's sleep.",
      ],
      [
        "anna-sleep-tonight-too",
        "Anna",
        [CHUCKLE, "Tak sa ", mark("vyspi"), " aj dnes!"],
        "Then get a good sleep tonight too!",
      ],
      ["marek-promise", "Marek", ["Sľubujem."], "I promise."],
    ),
  ],
  checks: [
    {
      id: `${PREFIX}check-hod`,
      gap: "Anna, ___ mrkvu do hrnca.",
      prompt: "Ako to povedala Mária?",
      promptEnglish: "How did Mária say it?",
      choices: [
        { id: "hod-soft", label: "hoď" },
        {
          id: "hod",
          label: "hod",
          whyWrong:
            "**Hod** is a noun, a throw: that is Marek's new sport. The command has the soft ď: **hodia**, so **hoď**.",
        },
        {
          id: "hodi",
          label: "hodí",
          whyWrong:
            "**Hodí** means she will throw: it says what someone will do, it is not a command.",
        },
      ],
      answerId: "hod-soft",
      feedback: {
        english: "Anna, throw the carrots in the pot.",
        why: "Anna says **hodia, takže hoď**: drop the ending and keep the soft ď.",
      },
    },
    {
      id: `${PREFIX}check-sadnite`,
      gap: "___ si. A Lucia stále nikde?",
      prompt: "Čo povedala Mária pri stole?",
      promptEnglish: "What did Mária say at the table?",
      choices: [
        { id: "sadnite", label: "Sadnite" },
        {
          id: "sadni",
          label: "Sadni",
          whyWrong:
            "**Sadni si** is for one person. Mária says it to the whole table: **sadnite si**.",
        },
        {
          id: "sadnime",
          label: "Sadnime",
          whyWrong:
            "**Sadnime si** means let's sit down, with the speaker in it. Mária tells her guests: **sadnite si**.",
        },
      ],
      answerId: "sadnite",
      feedback: {
        english: "Sit down. And Lucia's still not here?",
        why: "Anna says **sadni si je pre jedného**: Mária says it to the whole table, so **sadnite si**.",
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
    // In front of him, a hand clear of his mug.
    { do: "put", what: "headphones", to: "desk", dx: 38 },
    { do: "stand", on: "už" },
    { do: "go", to: "plant" },
  ],
  // Bent to it as he says sorry, before the water.
  "marek-sorry-plant": [
    { do: "take", what: "can", on: "start" },
    { do: "lean", to: "plant" },
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
    "Anna and Marek cook soup at Mária's and take Lucia's call. The next morning, with the studio plant still waiting for water, Marek needs your help with the commands.",
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
  chapters: [intro, kitchen, table, help, outro],
};
