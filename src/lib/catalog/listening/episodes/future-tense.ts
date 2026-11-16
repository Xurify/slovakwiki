import type { MarkedPart } from "$lib/learning/marked-text";
import {
  CHUCKLE,
  EXCITED,
  HAPPY,
  PAUSE,
  SIGH,
  STOP,
  SURPRISED,
  afterThinking,
  guess,
  lineWriter,
  listenerPicks,
  staged,
} from "../dialogue";
import type { ListeningChapter, ListeningEpisode } from "../types";

/**
 * A radio play about a robot and a dog who does not know him yet. Everyone
 * talks about the next three days, so the future comes up the way it does
 * in life: a flight, a promise, a ball about to be thrown. The turn is
 * Domo working out why Dunčo is sad at six, and the answer is the other
 * future, budem with an imperfective verb: budem čakať s tebou.
 */

const PREFIX = "podcast-future-tense-";
const line = lineWriter(PREFIX);

/** A future form, the episode's topic, lit in the transcript. */
function future(text: string): Exclude<MarkedPart, string> {
  return { role: "contrast", text };
}

/** A scene card: the day and the clock, read by the narrator, nobody on stage. */
function card(id: string, slovak: string, english: string) {
  return line(id, "Scene", [slovak], english);
}

/** Dunčo's lines are barks, clips of a real dog rather than a voice. */
function dog(id: string, bark: string, english: string, to?: string, props?: ["ball"]) {
  return line(id, "Dunčo", [bark], english, {
    ...(to ? { to } : {}),
    ...(props ? { props } : {}),
  });
}

const friday: ListeningChapter = {
  id: `${PREFIX}friday`,
  stage: "home",
  titleSk: "Budeš mi chýbať",
  title: "I'll miss you",
  setup: {
    // Dunčo starts at the rug's left edge, so Marek can kneel beside him without crowding Anna.
    spots: { dog: "dog-spot" },
    objects: [
      // Packed: he has the suitcase in hand as Anna comes to say goodbye.
      {
        id: "suitcase",
        kind: "suitcase",
        start: { where: { hand: "marek", side: "rear" } },
      },
    ],
  },
  lines: staged(
    PREFIX,
    [
      card(
        "card-friday-evening",
        "Piatok večer. U Mareka doma.",
        "Friday evening. At Marek's.",
      ),
      line(
        "anna-all-packed",
        "Anna",
        ["Ahoj, Marek! ", PAUSE, "Tak čo, už si zbalený?"],
        "Hi, Marek! So, are you packed?",
        { to: "Marek" },
      ),
      line(
        "marek-suitcase-passport",
        "Marek",
        ["Kufor mám. ", PAUSE, "Pas mám. ", PAUSE, "Hm, a kde je Domo?"],
        "Suitcase, check. Passport, check. Hmm, and where's Domo?",
      ),
      line(
        "domo-good-evening-here",
        "Domo",
        ["Dobrý večer. Som tu, pán Marek."],
        "Good evening. I'm here, Mr Marek.",
        { to: "Marek" },
      ),
      line(
        "anna-is-that-him",
        "Anna",
        [SURPRISED, "Jéj, to je on? ", PAUSE, "Tvoj nový robot?"],
        "Oh, is that him? Your new robot?",
        { to: "Marek" },
      ),
      line(
        "marek-this-is-domo",
        "Marek",
        [HAPPY, "Áno. Toto je Domo."],
        "Yes. This is Domo.",
        {
          to: "Anna",
        },
      ),
      line(
        "marek-this-is-anna",
        "Marek",
        [
          "Domo, a toto je Anna, moja susedka. ",
          PAUSE,
          "Kým ",
          future("budem"),
          " preč, ",
          future("bude"),
          " ti pomáhať s Dunčom.",
        ],
        "Domo, and this is Anna, my neighbour. While I'm away, she'll help you with Dunčo.",
        { to: "Domo" },
      ),
      line(
        "marek-this-is-dunco",
        "Marek",
        ["A toto je Dunčo, môj pes."],
        "And this is Dunčo, my dog.",
        { to: "Domo" },
      ),
      line(
        "marek-flying-to-london",
        "Marek",
        [
          "Dunčo, zajtra ráno ",
          future("poletím"),
          " do Londýna. ",
          PAUSE,
          "A Domo ",
          future("bude"),
          " s tebou tri dni.",
        ],
        "Dunčo, tomorrow morning I'm flying to London. And Domo will be with you for three days.",
        { to: "Dunčo" },
      ),
      dog("dunco-growls-at-domo", "Vrrr…", "Grrr…", "Domo"),
      line(
        "domo-dunco-doesnt-know-me",
        "Domo",
        ["Hm. ", PAUSE, "Dunčo ma ešte nepozná."],
        "Hmm. Dunčo doesn't know me yet.",
      ),
      line(
        "anna-ill-come-tomorrow",
        "Anna",
        [
          "Neboj sa, Domo. Ja ",
          future("prídem"),
          " zajtra ráno. ",
          PAUSE,
          "A ",
          future("pôjdeme"),
          " spolu do parku.",
        ],
        "Don't worry, Domo. I'll come tomorrow morning. And we'll go to the park together.",
        { to: "Domo" },
      ),
      line(
        "domo-when-will-you-be-home",
        "Domo",
        ["Pán Marek, a kedy ", future("budete"), " doma?"],
        "Mr Marek, and when will you be home?",
        { to: "Marek" },
      ),
      line(
        "marek-monday-evening",
        "Marek",
        [
          "V pondelok o šiestej večer. ",
          PAUSE,
          "Vtedy chodievam domov z práce. ",
          PAUSE,
          "A Dunčo ma vždy čaká pri okne.",
        ],
        "On Monday at six in the evening. That's when I usually get home from work. And Dunčo always waits for me by the window.",
      ),
      line(
        "domo-six-window-save",
        "Domo",
        ["O šiestej. Pri okne. ", PAUSE, future("Uložím"), " si to."],
        "At six. By the window. I'll save that.",
      ),
      line(
        "marek-ill-miss-you",
        "Marek",
        [
          SIGH,
          "Dunčo",
          STOP,
          PAUSE,
          future("Budeš"),
          " mi chýbať. ",
          PAUSE,
          future("Budeš poslúchať"),
          "?",
        ],
        "Dunčo… I'll miss you. Will you do as you're told?",
        { to: "Dunčo" },
      ),
      dog("dunco-soft-bark-friday", "Haf.", "Woof.", "Marek"),
      line(
        "anna-both-will-be-fine",
        "Anna",
        [
          "Nerob si starosti, Marek. ",
          PAUSE,
          "Obaja ",
          future("budú"),
          " v poriadku. ",
          PAUSE,
          "Šťastnú cestu!",
        ],
        "Don't worry about it, Marek. They'll both be fine. Have a good trip!",
        { to: "Marek" },
      ),
    ],
    {
      "anna-all-packed": [{ do: "wave", on: "ahoj" }],
      "domo-good-evening-here": [
        { do: "enter", from: "off-right", to: "rug-right", on: "before" },
      ],
      "marek-suitcase-passport": [
        { do: "look", to: "suitcase", on: "kufor" },
        { do: "pat", on: "pas" },
      ],
      "marek-this-is-anna": [{ do: "point", to: "anna", on: "anna" }],
      "marek-this-is-dunco": [{ do: "point", to: "dog", on: "dunčo" }],
      "marek-monday-evening": [{ do: "point", to: "okno", on: "okne" }],
      "domo-six-window-save": [{ do: "compute", on: "uložím" }],
      // The case goes down first, so his hands are free for the dog.
      "marek-ill-miss-you": [
        { do: "go", to: "kneel-by-dog", on: "before" },
        { do: "put", what: "suitcase", to: "by-dog", on: "before" },
        { who: "dog", do: "face", to: "marek", on: "before" },
        { do: "kneel", to: "dog", on: "dunčo" },
      ],
      "dunco-soft-bark-friday": [{ who: "marek", do: "kneel", to: "dog", on: "start" }],
      "anna-both-will-be-fine": [
        { who: "marek", do: "take", what: "suitcase", on: "start" },
        { do: "wave", on: "šťastnú" },
        { do: "go", to: "off-left", on: "after" },
      ],
    },
  ),
  checks: [
    {
      id: `${PREFIX}check-who-stays-with-dunco`,
      prompt: "Kto bude tri dni s Dunčom?",
      promptEnglish: "Who will be with Dunčo for three days?",
      replayLineId: `${PREFIX}marek-flying-to-london`,
      choices: [
        { id: "domo", label: "Domo, robot." },
        {
          id: "marek",
          label: "Marek.",
          whyWrong:
            "Marek will not be there: zajtra ráno **poletím** do Londýna, I'll fly to London.",
        },
        {
          id: "anna",
          label: "Anna.",
          whyWrong:
            "Anna only comes in the morning: **prídem** zajtra ráno. It is Domo who **bude** with Dunčo.",
        },
      ],
      answerId: "domo",
      feedback: {
        english: "And Domo will be with you for three days.",
        why: "**Domo bude** tri dni s Dunčom. **Bude** is the future of **je**: he will be.",
      },
    },
    {
      id: `${PREFIX}check-budes-form`,
      gap: "Dunčo… ___ mi chýbať.",
      prompt: "Ktoré slovo povedal Marek?",
      promptEnglish: "Which word did Marek say?",
      replayLineId: `${PREFIX}marek-ill-miss-you`,
      choices: [
        { id: "budes", label: "Budeš" },
        {
          id: "budem",
          label: "Budem",
          whyWrong:
            "**Budem** is I will. In Slovak the one who is missed does the missing: **ty mi budeš chýbať**.",
        },
        {
          id: "bude",
          label: "Bude",
          whyWrong:
            "**Bude** is he will. Marek talks to Dunčo, so it is **ty**: **budeš**.",
        },
      ],
      answerId: "budes",
      feedback: {
        english: "Dunčo… I'll miss you.",
        why: "**Budeš mi chýbať** is you will be missing to me: I'll miss you. **Budeš** + **chýbať**, the time it lasts.",
      },
    },
  ],
};

const morning: ListeningChapter = {
  cast: ["Dunčo", "Domo", "Anna"],
  id: `${PREFIX}morning`,
  stage: "home",
  titleSk: "Ešte stále ma nepoznáš?",
  title: "You still don't know me?",
  setup: {
    // Dunčo starts at rug-left, off the spot Domo comes to, so the bowl is set down in front of him, not behind.
    spots: { dog: "rug-left" },
    objects: [
      {
        id: "bowl",
        kind: "bowl",
        start: { where: { hand: "robot", side: "lead" }, fill: "kibble" },
      },
      // Dunčo's things: his ball on the mat by the sofa, his lead on its peg by the window.
      { id: "ball", kind: "ball", start: { where: { on: "by-sofa", dx: 0 } } },
      { id: "lead", kind: "lead", start: { where: { on: "pegs", dx: 0 } } },
    ],
  },
  lines: staged(
    PREFIX,
    [
      card(
        "card-saturday-seven",
        "Sobota. Sedem hodín ráno.",
        "Saturday. Seven in the morning.",
      ),
      line(
        "domo-good-morning-food",
        "Domo",
        ["Dobré ráno, Dunčo. ", PAUSE, "Tu sú granule."],
        "Good morning, Dunčo. Here's your kibble.",
        { to: "Dunčo" },
      ),
      dog("dunco-growls-morning", "Vrrr…", "Grrr…", "Domo"),
      line(
        "domo-still-dont-know-me",
        "Domo",
        ["Hm. ", PAUSE, "Ešte stále ma nepoznáš?"],
        "Hmm. You still don't know me?",
        { to: "Dunčo" },
      ),
      line(
        "anna-good-morning-how-are-you",
        "Anna",
        ["Dobré ráno! ", PAUSE, "Tak čo, ako sa máte?"],
        "Good morning! So, how are you two doing?",
        { to: "Domo" },
      ),
      line(
        "domo-he-wont-eat",
        "Domo",
        ["Pani Anna, Dunčo nechce jesť. ", PAUSE, "Stále na mňa vrčí."],
        "Ms Anna, Dunčo won't eat. He keeps growling at me.",
        { to: "Anna" },
      ),
      line(
        "anna-it-will-pass",
        "Anna",
        [
          CHUCKLE,
          "To nič. ",
          PAUSE,
          "Dunčo si na teba ",
          future("zvykne"),
          ". ",
          PAUSE,
          "Vieš čo?",
        ],
        "Never mind. Dunčo will get used to you. Tell you what.",
        { to: "Domo" },
      ),
      line(
        "anna-heres-his-ball",
        "Anna",
        [
          "Tu máš jeho loptičku. ",
          PAUSE,
          "V parku mu ju ",
          future("hodíš"),
          ". ",
          future("Uvidíš"),
          ".",
        ],
        "Here's his ball. In the park you'll throw it for him. You'll see.",
        { to: "Domo" },
      ),
      line(
        "domo-ill-try",
        "Domo",
        ["Hm. ", PAUSE, "Dobre. ", future("Skúsim"), " to."],
        "Hmm. All right. I'll try.",
      ),
      line(
        "anna-lets-go-park",
        "Anna",
        [EXCITED, "Tak poďme! ", PAUSE, "Dunčo, ideme do parku!"],
        "Let's go, then! Dunčo, we're going to the park!",
        { to: "Dunčo" },
      ),
      dog("dunco-park-bark", "Haf! Haf!", "Woof! Woof!", "Anna"),
    ],
    {
      "domo-good-morning-food": [
        { do: "enter", from: "off-right", to: "rug-mid", on: "before" },
        { do: "put", what: "bowl", to: "by-dog", on: "granule" },
      ],
      "anna-good-morning-how-are-you": [
        { do: "enter", from: "off-right", to: "rug-mid-right", on: "before" },
      ],
      "anna-it-will-pass": [
        { do: "go", to: "by-sofa", on: "vieš" },
        { do: "take", what: "ball" },
      ],
      "anna-heres-his-ball": [
        { do: "go", to: "rug-mid-right", on: "before" },
        { do: "give", what: "ball", to: "robot", on: "tu" },
      ],
      "anna-lets-go-park": [
        { do: "go", to: "pegs", on: "poďme" },
        { do: "take", what: "lead" },
      ],
      "dunco-park-bark": [
        { who: "anna", do: "go", to: "dog", on: "start" },
        { who: "anna", do: "leash", what: "lead", to: "dog" },
        { who: "anna", do: "leave", to: "left", on: "after" },
        { do: "leave", to: "left", on: "after" },
        { who: "robot", do: "leave", to: "left", on: "after" },
      ],
    },
  ),
  checks: [
    {
      id: `${PREFIX}check-why-dunco-growls`,
      prompt: "Prečo Dunčo vrčí?",
      promptEnglish: "Why is Dunčo growling?",
      replayLineId: `${PREFIX}domo-still-dont-know-me`,
      choices: [
        { id: "doesnt-know", label: "Ešte nepozná Doma." },
        {
          id: "hungry",
          label: "Je hladný.",
          whyWrong:
            "**Je hladný** means he's hungry. Domo gives him food and he won't eat it.",
        },
        {
          id: "park",
          label: "Chce ísť do parku.",
          whyWrong:
            "**Chce ísť do parku** means he wants to go to the park. He barks happily only when Anna says **ideme do parku**.",
        },
      ],
      answerId: "doesnt-know",
      feedback: {
        english: "Hmm. You still don't know me?",
        why: "On Friday Domo said **Dunčo ma ešte nepozná**. Today it is **stále**: still.",
      },
    },
    {
      id: `${PREFIX}check-hodis-form`,
      gap: "V parku mu ju ___.",
      prompt: "Ktoré slovo povedala Anna?",
      promptEnglish: "Which word did Anna say?",
      replayLineId: `${PREFIX}anna-heres-his-ball`,
      choices: [
        { id: "hodis", label: "hodíš" },
        {
          id: "hadzes",
          label: "hádžeš",
          whyWrong:
            "**Hádžeš** is you are throwing, or you throw again and again. Anna means one throw, later, in the park.",
        },
        {
          id: "hodim",
          label: "hodím",
          whyWrong: "**Hodím** is I'll throw. Anna gives Domo the ball: **ty** throw it.",
        },
      ],
      answerId: "hodis",
      feedback: {
        english: "In the park you'll throw it for him.",
        why: "**Hodiť** is perfective, so **hodíš** is already the future: you will throw it, once.",
      },
    },
  ],
};

const park: ListeningChapter = {
  id: `${PREFIX}park`,
  stage: "default",
  titleSk: "V parku",
  title: "In the park",
  setup: {
    spots: {
      anna: "park-left",
      robot: "park-mid",
      dog: "park-dog",
    },
    objects: [
      { id: "ball", kind: "ball", start: { where: { hand: "robot", side: "lead" } } },
      { id: "phone", kind: "phone", start: { where: { pocket: "anna" } } },
    ],
  },
  lines: staged(
    PREFIX,
    [
      card(
        "card-park-half-eight",
        "Park pri Dunaji. Pol deviatej ráno.",
        "The park by the Danube. Half past eight in the morning.",
      ),
      line(
        "anna-now-throw-it",
        "Anna",
        ["Tak, Domo. ", PAUSE, "Teraz mu hoď loptičku."],
        "Right, Domo. Now throw him the ball.",
        { props: guess(2), to: "Domo" },
      ),
      line(
        "domo-i-will-throw-now",
        "Domo",
        ["Dobre. ", PAUSE, future("Hodím"), " loptičku. ", PAUSE, "Teraz!"],
        "All right. I'll throw the ball. Now!",
      ),
      line(
        "anna-look-he-runs",
        "Anna",
        [EXCITED, "Pozri, ako beží!"],
        "Look at him run!",
        {
          to: "Domo",
        },
      ),
      line(
        "domo-twenty-thirty-metres",
        "Domo",
        ["Dvadsať metrov. ", PAUSE, "Tridsať. ", PAUSE, "Hm, kam beží?"],
        "Twenty metres. Thirty. Hmm, where is he running?",
      ),
      dog("dunco-brings-ball", "Haf! Haf!", "Woof! Woof!", "Domo", ["ball"]),
      line(
        "domo-to-me",
        "Domo",
        [SURPRISED, "Mne? ", PAUSE, "Nesie loptičku mne?"],
        "To me? He's bringing the ball to me?",
        { to: "Anna" },
      ),
      line(
        "anna-he-likes-you",
        "Anna",
        [CHUCKLE, "Áno, tebe. ", PAUSE, "Už ťa má rád."],
        "Yes, to you. He likes you now.",
        { to: "Domo" },
      ),
      line(
        "domo-he-likes-me",
        "Domo",
        [HAPPY, "Má ma rád. ", PAUSE, future("Uložím"), " si to."],
        "He likes me. I'll save that.",
      ),
      line(
        "anna-ill-take-a-photo",
        "Anna",
        [
          "Počkaj, ",
          future("odfotím"),
          " vás. ",
          PAUSE,
          future("Pošlem"),
          " to Marekovi. ",
          PAUSE,
          future("Bude"),
          " sa smiať.",
        ],
        "Wait, I'll take a picture of you two. I'll send it to Marek. He'll laugh.",
        { props: ["phone", "phone", "phone"] },
      ),
      line(
        "anna-i-have-to-go",
        "Anna",
        ["No, ja už musím ísť. ", PAUSE, "Večer ti ", future("napíšem"), ", dobre?"],
        "Well, I have to go now. I'll text you in the evening, OK?",
        { props: guess(2), to: "Domo" },
      ),
      line(
        "domo-thank-you-anna",
        "Domo",
        ["Dobre. ", PAUSE, "Ďakujem, pani Anna."],
        "All right. Thank you, Ms Anna.",
      ),
      line(
        "anna-bye-both",
        "Anna",
        ["Ahoj, Domo! ", PAUSE, "Ahoj, Dunčo!"],
        "Bye, Domo! Bye, Dunčo!",
        { props: guess(2) },
      ),
      dog("dunco-bye-anna", "Haf!", "Woof!", "Anna"),
      line(
        "domo-haf-means-hi",
        "Domo",
        [
          "Ahoj",
          STOP,
          PAUSE,
          "haf. ",
          PAUSE,
          "Haf znamená ahoj. ",
          PAUSE,
          future("Uložím"),
          " si to.",
        ],
        "Bye… woof. Woof means ahoj: hi, or bye. I'll save that.",
      ),
    ],
    {
      "domo-he-likes-me": [{ do: "compute", on: "uložím" }],
      "domo-i-will-throw-now": [
        { do: "face", to: "off-right", on: "hodím" },
        { do: "throw", what: "ball", to: "dog", on: "teraz" },
        { who: "dog", do: "go", to: "off-right", on: "teraz", run: true },
      ],
      // He comes back at a run while Domo still counts, so the stage is never empty for long.
      "domo-twenty-thirty-metres": [
        { who: "dog", do: "take", what: "ball", on: "tridsať" },
        { who: "dog", do: "go", to: "back-right", run: true },
      ],
      // He keeps it in his mouth: a robot standing can't reach down that far.
      "dunco-brings-ball": [{ do: "look", to: "robot", on: "start" }],
      "domo-to-me": [{ do: "look", to: "dog", on: "mne" }],
      "anna-bye-both": [
        { do: "wave", on: "ahoj" },
        { do: "go", to: "off-left", on: "after" },
      ],
      "domo-haf-means-hi": [{ do: "compute", on: "uložím" }],
      "anna-ill-take-a-photo": [
        { do: "take", what: "phone", on: "počkaj" },
        { do: "raise", what: "phone", on: "odfotím" },
        { do: "pocket", what: "phone", on: "end" },
      ],
    },
  ),
  checks: [
    {
      id: `${PREFIX}check-who-gets-the-ball`,
      prompt: "Komu priniesol Dunčo loptičku?",
      promptEnglish: "Who did Dunčo bring the ball to?",
      replayLineId: `${PREFIX}domo-to-me`,
      choices: [
        { id: "domo", label: "Domovi." },
        {
          id: "anna",
          label: "Anne.",
          whyWrong:
            "**Anne** means to Anna, but Anna laughs and says **áno, tebe**: to you, Domo.",
        },
        {
          id: "nobody",
          label: "Nikomu. Loptičku nechcel.",
          whyWrong:
            "**Nikomu** means to nobody. Dunčo ran thirty metres and brought it back to Domo.",
        },
      ],
      answerId: "domo",
      feedback: {
        english: "To me? He's bringing the ball to me?",
        why: "Domo can't believe it: **mne?** Anna says why: **už ťa má rád**, he likes you now.",
      },
    },
    {
      id: `${PREFIX}check-odfotim-form`,
      gap: "Počkaj, ___ vás.",
      prompt: "Ktoré slovo povedala Anna?",
      promptEnglish: "Which word did Anna say?",
      replayLineId: `${PREFIX}anna-ill-take-a-photo`,
      choices: [
        { id: "odfotim", label: "odfotím" },
        {
          id: "budem-odfotit",
          label: "budem odfotiť",
          whyWrong:
            "**Budem** never goes with a perfective verb like **odfotiť**. Its present form is already the future.",
        },
        {
          id: "fotim",
          label: "fotím",
          whyWrong:
            "**Fotím** is I am taking pictures, now. Anna means one picture, in a moment: **odfotím**.",
        },
      ],
      answerId: "odfotim",
      feedback: {
        english: "Wait, I'll take a picture of you two.",
        why: "**Odfotiť** is perfective, so **odfotím** means I will take it, one picture, done.",
      },
    },
  ],
};

const six: ListeningChapter = {
  id: `${PREFIX}six`,
  stage: "home",
  titleSk: "O šiestej",
  title: "At six",
  setup: {
    // At six Dunčo is already at the window, looking out: the clue Domo has to read.
    spots: { dog: "window-dog", robot: "rug-mid" },
    // Back from the park: the lead on its peg again.
    state: { lead: { where: { on: "pegs", dx: 0 }, clipped: false } },
  },
  lines: staged(
    PREFIX,
    [
      card(
        "card-saturday-six",
        "Sobota. Šesť hodín večer.",
        "Saturday. Six in the evening.",
      ),
      dog("dunco-whines-at-six", "Kňu…", "(whines)"),
      line(
        "domo-ill-give-dinner",
        "Domo",
        ["Dunčo? Čo ti je? ", PAUSE, future("Dám"), " ti jesť, dobre?"],
        "Dunčo? What's wrong? I'll give you something to eat, OK?",
        { to: "Dunčo" },
      ),
      dog("dunco-whines-again", "Kňu…", "(whines)"),
      line(
        "domo-not-even-the-ball",
        "Domo",
        ["Nechceš jesť", STOP, PAUSE, "Ani loptičku nechceš."],
        "You don't want to eat… You don't even want the ball.",
        { to: "Dunčo" },
      ),
      line(
        "domo-why-is-he-sad",
        "Domo",
        ["Hm. ", PAUSE, "Kňučí", STOP, PAUSE, "asi je smutný. ", PAUSE, "Ale prečo?"],
        "Hmm. He's whining… he's probably sad. But why?",
        { props: guess(3) },
      ),
    ],
    {
      "dunco-whines-at-six": [{ do: "face", to: "off-left", on: "before" }],
      "domo-ill-give-dinner": [{ do: "go", to: "window", on: "dunčo" }],
      "domo-not-even-the-ball": [
        { do: "offer", what: "ball", to: "dog", on: "loptičku" },
        { do: "pocket", what: "ball", on: "after" },
      ],
    },
  ),
  checks: [
    {
      id: `${PREFIX}check-why-is-dunco-sad`,
      prompt: "Prečo je Dunčo smutný?",
      promptEnglish: "Why is Dunčo sad?",
      choices: [
        { id: "misses-marek", label: "Čaká na Mareka." },
        {
          id: "paw",
          label: "Bolí ho labka.",
          whyWrong:
            "**Bolí ho labka** means his paw hurts. This morning he ran thirty metres after the ball. Listen to what time it is, and where he stands.",
        },
        {
          id: "anna",
          label: "Chýba mu Anna.",
          whyWrong:
            "**Chýba mu Anna** means he misses Anna. But he whines at six, by the window, and Marek said who comes home **o šiestej**.",
        },
        {
          id: "out",
          label: "Chce ísť von.",
          whyWrong:
            "**Chce ísť von** means he wants to go out. He was in the park this morning, and at six he is waiting for someone.",
        },
      ],
      answerId: "misses-marek",
      feedback: {
        english:
          "That's when I usually get home from work. And Dunčo always waits for me by the window.",
        why: "Marek said it on Friday: at six **chodievam domov z práce** … **Dunčo ma vždy čaká pri okne.** But Marek is in London.",
      },
    },
    {
      id: `${PREFIX}check-dam-form`,
      gap: "Dunčo? Čo ti je? ___ ti jesť, dobre?",
      prompt: "Ktoré slovo povedal Domo?",
      promptEnglish: "Which word did Domo say?",
      replayLineId: `${PREFIX}domo-ill-give-dinner`,
      choices: [
        { id: "dam", label: "Dám" },
        {
          id: "budem-dat",
          label: "Budem dať",
          whyWrong:
            "**Budem** never goes with a perfective verb like **dať**. Its present form is already the future.",
        },
        {
          id: "davam",
          label: "Dávam",
          whyWrong:
            "**Dávam** is I am giving, or I give every day. Domo means once, in a moment: **dám**.",
        },
      ],
      answerId: "dam",
      feedback: {
        english: "I'll give you something to eat, OK?",
        why: "**Dať** is perfective, so **dám** means I will give it, once.",
      },
    },
  ],
};

const atWindow: ListeningChapter = {
  id: `${PREFIX}window`,
  stage: "home",
  titleSk: "Budem čakať s tebou",
  title: "I'll wait with you",
  lines: staged(
    PREFIX,
    [
      listenerPicks(
        card(
          "card-guess-with-us",
          "Prečo je Dunčo smutný? Hádajte s nami!",
          "Why is Dunčo sad? Guess along with us!",
        ),
        {
          prompt: "Prečo je Dunčo smutný?",
          choices: [
            {
              id: "misses-marek",
              label: "Čaká na Mareka.",
              english: "He's waiting for Marek.",
            },
            { id: "paw", label: "Bolí ho labka.", english: "His paw hurts." },
            { id: "anna", label: "Chýba mu Anna.", english: "He misses Anna." },
            { id: "out", label: "Chce ísť von.", english: "He wants to go out." },
          ],
          answerId: "misses-marek",
          judge: "Domo",
        },
      ),
      afterThinking(
        line(
          "domo-six-window-i-know",
          "Domo",
          ["Šesť hodín. ", PAUSE, "Okno. ", PAUSE, EXCITED, "Už viem!"],
          "Six o'clock. The window. Now I know!",
        ),
      ),
      line(
        "domo-you-wait-for-marek",
        "Domo",
        ["Dunčo, ty čakáš na pána Mareka", STOP],
        "Dunčo, you're waiting for Mr Marek…",
        { to: "Dunčo" },
      ),
      dog("dunco-whines-yes", "Kňu…", "(whines)"),
      line(
        "domo-not-today",
        "Domo",
        [
          SIGH,
          "Ale dnes ",
          future("nepríde"),
          ". Ani zajtra. ",
          PAUSE,
          future("Príde"),
          " až v pondelok.",
        ],
        "But he won't come today. Not tomorrow either. He won't come until Monday.",
        { to: "Dunčo" },
      ),
      {
        ...line(
          "domo-i-will-wait-with-you",
          "Domo",
          [
            "Tak dobre, Dunčo. ",
            PAUSE,
            future("Budem čakať"),
            " s tebou. ",
            PAUSE,
            "Tu, pri okne.",
          ],
          "All right, Dunčo. I'll wait with you. Right here by the window.",
          { to: "Dunčo" },
        ),
        wait: 1000,
      },
      dog("dunco-soft-bark-window", "Haf.", "Woof.", "Domo"),
      line(
        "domo-anna-writes",
        "Domo",
        [
          "Počkaj, Dunčo",
          STOP,
          PAUSE,
          "správa. ",
          PAUSE,
          "Pani Anna píše, že pán Marek videl fotku a smial sa. ",
          PAUSE,
          "Zajtra nám ",
          future("zavolá"),
          ".",
        ],
        "Wait, Dunčo… a message. Ms Anna writes that Mr Marek saw the photo and laughed. Tomorrow he'll call us.",
        { props: guess(4), ring: "message" },
      ),
      line(
        "domo-we-will-wait-together",
        "Domo",
        [
          HAPPY,
          "Vidíš, Dunčo? Všetko ",
          future("bude"),
          " v poriadku. ",
          PAUSE,
          "A zajtra o šiestej ",
          future("budeme čakať"),
          " spolu.",
        ],
        "See, Dunčo? Everything will be fine. And tomorrow at six we'll wait together.",
        { to: "Dunčo" },
      ),
      dog("dunco-soft-bark-together", "Haf.", "Woof.", "Domo"),
      line(
        "domo-now-youll-eat",
        "Domo",
        ["A teraz už ", future("budeš"), " jesť?"],
        "And now you'll eat?",
        { to: "Dunčo" },
      ),
      dog("dunco-eats-bark", "Haf!", "Woof!", "Domo"),
      line(
        "domo-hes-hungry",
        "Domo",
        ["Má hlad. ", PAUSE, future("Uložím"), " si to."],
        "He's hungry. I'll save that.",
      ),
    ],
    {
      "dunco-whines-yes": [{ do: "face", to: "off-left", on: "before" }],
      // Off to his bowl, still where Domo put it this morning, and his head goes down into it.
      "dunco-eats-bark": [
        { do: "go", to: "rug-left", on: "end" },
        { do: "nod" },
        { do: "nod" },
      ],
      "domo-hes-hungry": [
        { do: "look", to: "dog", on: "start" },
        { do: "compute", on: "uložím" },
        { who: "dog", do: "nod", on: "start" },
      ],
    },
  ),
  checks: [
    {
      id: `${PREFIX}check-what-domo-will-do`,
      prompt: "Čo bude Domo robiť dnes večer?",
      promptEnglish: "What will Domo do this evening?",
      replayLineId: `${PREFIX}domo-i-will-wait-with-you`,
      choices: [
        { id: "wait", label: "Bude čakať s Dunčom pri okne." },
        {
          id: "park",
          label: "Pôjde s Dunčom do parku.",
          whyWrong:
            "**Pôjde do parku** means he will go to the park. That was the morning. Now Domo says **tu, pri okne**: here, by the window.",
        },
        {
          id: "call",
          label: "Zavolá Marekovi.",
          whyWrong:
            "**Zavolá Marekovi** means he will call Marek. It is the other way round: Marek **zavolá** tomorrow.",
        },
      ],
      answerId: "wait",
      feedback: {
        english: "All right, Dunčo. I'll wait with you. Right here by the window.",
        why: "**Budem čakať** is **budem** + an imperfective verb: the time Domo will spend, not one task done.",
      },
    },
    {
      id: `${PREFIX}check-budeme-form`,
      gap: "A zajtra o šiestej ___ čakať spolu.",
      prompt: "Ktoré slovo povedal Domo?",
      promptEnglish: "Which word did Domo say?",
      replayLineId: `${PREFIX}domo-we-will-wait-together`,
      choices: [
        { id: "budeme", label: "budeme" },
        {
          id: "budem",
          label: "budem",
          whyWrong:
            "**Budem** is I will. Domo says it is the two of them: **spolu**, together.",
        },
        {
          id: "budu",
          label: "budú",
          whyWrong:
            "**Budú** is they will. Domo is one of the two who wait, so he says **we**.",
        },
      ],
      answerId: "budeme",
      feedback: {
        english: "And tomorrow at six we'll wait together.",
        why: "**My budeme**: Domo and Dunčo, **spolu**. The **-me** ending is **we**, as in **pôjdeme**.",
      },
    },
  ],
};

const monday: ListeningChapter = {
  cast: ["Dunčo", "Domo", "Marek"],
  id: `${PREFIX}monday`,
  stage: "home",
  titleSk: "Som doma",
  title: "I'm home",
  lines: staged(
    PREFIX,
    [
      card(
        "card-monday-six",
        "Pondelok. Šesť hodín večer.",
        "Monday. Six in the evening.",
      ),
      line(
        "domo-six-lets-go-window",
        "Domo",
        ["Je šesť hodín, Dunčo. ", PAUSE, "Poďme k oknu."],
        "It's six o'clock, Dunčo. Let's go to the window.",
        { to: "Dunčo" },
      ),
      dog("dunco-whines-monday", "Kňu…", "(whines)", "Domo"),
      line(
        "domo-today-he-will-come",
        "Domo",
        ["Ja viem. ", PAUSE, "Ale dnes ", future("príde"), ". ", future("Uvidíš"), "."],
        "I know. But today he's coming. You'll see.",
        { to: "Dunčo" },
      ),
      line(
        "marek-good-evening-home",
        "Marek",
        [EXCITED, "Ahojte! ", PAUSE, "Už som doma!"],
        "Hi, you two! I'm home!",
        { props: ["suitcase", "suitcase"], to: "Dunčo" },
      ),
      dog("dunco-overjoyed", "Haf! Haf! Haf!", "Woof! Woof! Woof!", "Marek"),
      line(
        "marek-missed-you-too",
        "Marek",
        [HAPPY, "Dunčo! Poď sem! ", PAUSE, "Aj ty si mi chýbal."],
        "Dunčo! Come here! I missed you too.",
        { to: "Dunčo" },
      ),
      line(
        "marek-how-were-you",
        "Marek",
        ["Domo, ako ste sa mali, vy dvaja?"],
        "Domo, how did you two get on?",
        { to: "Domo" },
      ),
      line(
        "domo-we-waited-together",
        "Domo",
        [
          "Dobre, pán Marek. ",
          PAUSE,
          "V sobotu aj v nedeľu o šiestej sme čakali pri okne. ",
          PAUSE,
          "Spolu.",
        ],
        "Fine, Mr Marek. On Saturday and on Sunday at six we waited by the window. Together.",
        { to: "Marek" },
      ),
      {
        ...line(
          "marek-together-thank-you",
          "Marek",
          [SURPRISED, "Spolu? ", PAUSE, HAPPY, "Ďakujem, Domo."],
          "Together? Thank you, Domo.",
          { to: "Domo" },
        ),
        // A breath for "Spolu." to land before Marek takes it in.
        wait: 1000,
      },
      dog("dunco-thanks-bark", "Haf!", "Woof!", "Domo"),
      line(
        "domo-hi-or-thanks",
        "Domo",
        [
          "Haf znamená ahoj. ",
          PAUSE,
          "Alebo",
          STOP,
          "ďakujem? ",
          PAUSE,
          future("Uložím"),
          " si oboje.",
        ],
        "Woof means hi. Or… thank you? I'll save both.",
      ),
      line(
        "marek-both-are-right",
        "Marek",
        [CHUCKLE, "Oboje je správne, Domo."],
        "Both are right, Domo.",
        { to: "Domo" },
      ),
      dog("dunco-last-bark", "Haf!", "Woof!", "Domo"),
      line("domo-tries-haf", "Domo", [HAPPY, "Haf."], "Woof.", { to: "Dunčo" }),
      line(
        "marek-you-understand-each-other",
        "Marek",
        [CHUCKLE, "Vidím, že sa už rozumiete. ", PAUSE, "Ako na tej fotke z parku."],
        "I can see you understand each other now. Just like in that photo from the park.",
      ),
      {
        ...card(
          "card-the-end",
          "Koniec. Ďakujeme, že ste počúvali.",
          "The end. Thank you for listening.",
        ),
        wait: 2000,
      },
    ],
    {
      "domo-six-lets-go-window": [
        { do: "go", to: "window", on: "oknu" },
        { who: "dog", do: "go", to: "window-dog", on: "oknu" },
      ],
      "marek-good-evening-home": [
        { do: "enter", from: "off-right", to: "rug-right", on: "before" },
        { do: "wave", on: "ahojte" },
      ],
      "domo-today-he-will-come": [
        { who: "dog", do: "face", to: "off-left", on: "start" },
      ],
      // The case goes down so both hands are free, and he gets down to the dog's height as it arrives.
      "marek-missed-you-too": [
        { do: "put", what: "suitcase", to: "by-sofa", on: "dunčo" },
        { who: "dog", do: "go", to: "marek", on: "sem", run: true },
        { do: "kneel", to: "dog" },
      ],
      "marek-how-were-you": [{ who: "robot", do: "go", to: "rug-mid", on: "domo" }],
      "marek-together-thank-you": [{ do: "nod", on: "ďakujem" }],
      "domo-hi-or-thanks": [{ do: "compute", on: "uložím" }],
    },
  ),
  checks: [
    {
      id: `${PREFIX}check-why-marek-thanks`,
      prompt: "Prečo Marek hovorí: ďakujem, Domo?",
      promptEnglish: "Why does Marek say: thank you, Domo?",
      replayLineId: `${PREFIX}domo-we-waited-together`,
      choices: [
        { id: "waited", label: "Domo čakal s Dunčom pri okne." },
        {
          id: "dinner",
          label: "Domo mu dával večeru.",
          whyWrong:
            "**Dával večeru** means he gave him dinner. Domo tells Marek something else: where they were at six.",
        },
        {
          id: "ball",
          label: "Domo kúpil novú loptičku.",
          whyWrong:
            "**Kúpil loptičku** means he bought a ball. The ball is the old one from the park.",
        },
      ],
      answerId: "waited",
      feedback: {
        english: "On Saturday and on Sunday at six we waited by the window. Together.",
        why: "Marek did not know: **sme čakali** … **spolu**. Dunčo was not alone at six.",
      },
    },
    {
      id: `${PREFIX}check-sme-cakali`,
      gap: "V sobotu aj v nedeľu o šiestej ___ pri okne.",
      prompt: "Ktoré slová povedal Domo?",
      promptEnglish: "Which words did Domo say?",
      replayLineId: `${PREFIX}domo-we-waited-together`,
      choices: [
        { id: "sme-cakali", label: "sme čakali" },
        {
          id: "budeme-cakat",
          label: "budeme čakať",
          whyWrong:
            "**Budeme čakať** is we will wait, Saturday's promise. On Monday it is done, so it is the past.",
        },
        {
          id: "cakame",
          label: "čakáme",
          whyWrong:
            "**Čakáme** is we are waiting, now. Marek is home: nobody waits any more.",
        },
      ],
      answerId: "sme-cakali",
      feedback: {
        english: "On Saturday and on Sunday at six we waited by the window.",
        why: "Saturday's **budeme čakať** has come true, so now it is **sme čakali**: we waited.",
      },
    },
  ],
};

export const futureTenseEpisode: ListeningEpisode = {
  id: "listening/future-tense",
  cover: { segment: "V parku", atMs: 26000 },
  slug: "future-tense",
  number: 7,
  level: "A1–A2",
  titleSk: "Budem čakať s tebou",
  title: "I'll wait with you",
  topic: "Future tense",
  promise:
    "A radio play. Marek flies to London and leaves his dog Dunčo with Domo, a robot Dunčo doesn't know yet. At six Dunčo is sad, and you can work out why before Domo does.",
  grammarSlug: "future-tense",
  speakers: ["Dunčo", "Anna", "Marek", "Domo", "Scene"],
  vocabulary: [
    { slovak: "pes", english: "dog" },
    { slovak: "loptička", english: "ball" },
    { slovak: "hodiť", english: "to throw" },
    { slovak: "čakať", english: "to wait" },
    { slovak: "Budeš mi chýbať.", english: "I'll miss you." },
    { slovak: "Budem čakať s tebou.", english: "I'll wait with you." },
    { slovak: "Všetko bude v poriadku.", english: "Everything will be fine." },
  ],
  chapters: [friday, morning, park, six, atWindow, monday],
};
