import type { MarkedPart } from "$lib/learning/marked-text";
import {
  CHUCKLE,
  NO_PICK,
  PAUSE,
  SIGH,
  STOP,
  SURPRISED,
  afterThinking,
  lineWriter,
  listenerPicks,
  onPath,
  staged,
} from "../dialogue";
import type { Cue } from "$lib/stick-figure/acts";
import type { ListeningChapter, ListeningEpisode } from "../types";

/**
 * A detective story told as a radio play. Nobody introduces a topic: Marek's
 * cake is gone, and the past tense is what alibis are made of. A scene card,
 * read by the narrator, opens each scene with the place and the clock; the
 * learner collects a clue in each scene's questions and has to name the
 * culprit before Anna does.
 */

const PREFIX = "podcast-past-tense-";
const line = lineWriter(PREFIX);

/** A past-tense form, the episode's topic, lit in the transcript. */
function past(text: string): Exclude<MarkedPart, string> {
  return { role: "contrast", text };
}

/** A scene card: the place and the clock, read by the narrator, nobody on stage. */
function card(id: string, slovak: string, english: string) {
  return line(id, "Scene", [slovak], english);
}

const PLATE_ACTS: Record<string, Cue[]> = {
  "marek-cake-is-gone": [{ do: "point", to: "plate", on: "preč" }],
  // He points at it rather than lifting it: held up at the desk, the plate crossed his mic.
  "marek-brought-cake": [{ do: "point", to: "plate", on: "tanier" }],
  "anna-empty-plate-who": [{ do: "look", to: "plate", on: "Prázdny" }],
  // Her mind made up while he answers: headphones off and down on the desk.
  "marek-no-time-breakfast": [
    { do: "look", to: "plate", on: "Nemal" },
    { who: "anna", do: "take", what: "anna-headphones", on: "Raňajky" },
    { who: "anna", do: "put", what: "anna-headphones", to: "desk", dx: -38 },
  ],
  // Off to the school: up, and out through the door while she says where she is going.
  "anna-detective-to-school": [
    { do: "stand", on: "detektívka" },
    { do: "leave", to: "door", on: "Najprv" },
    { who: "marek", do: "look", to: "door", on: "Máriou" },
  ],
};

const plate: ListeningChapter = {
  id: `${PREFIX}plate`,
  titleSk: "Prázdny tanier",
  title: "An empty plate",
  // All that is left of the cake: the plate on the desk, crumbs on it.
  setup: {
    objects: [
      { id: "plate", kind: "plate", start: { where: { on: "desk", dx: 38 } } },
      {
        id: "anna-headphones",
        kind: "headphones",
        start: { where: { wear: "anna" }, of: "anna" },
      },
    ],
  },
  lines: staged(
    PREFIX,
    [
      card(
        "card-studio-three",
        "Štvrtok. Tri hodiny popoludní. Štúdio Slovak Wiki.",
        "Thursday. Three in the afternoon. The Slovak Wiki studio.",
      ),
      line(
        "marek-cake-is-gone",
        "Marek",
        [SURPRISED, "Anna! ", PAUSE, "Môj koláč je preč!"],
        "Anna! My cake is gone!",
      ),
      line("anna-what-cake", "Anna", ["Aký koláč?"], "What cake?"),
      line(
        "marek-brought-cake",
        "Marek",
        [
          "Ráno ",
          past("som priniesol"),
          " koláč. Veľký makový koláč. ",
          past("Bol"),
          " tu, na stole. ",
          PAUSE,
          "A teraz je tu len tanier.",
        ],
        "In the morning I brought a cake. A big poppy-seed cake. It was here, on the table. And now there's only a plate here.",
      ),
      line(
        "anna-empty-plate-who",
        "Anna",
        ["Hm. Prázdny tanier. ", PAUSE, "Kto ", past("bol"), " dnes v štúdiu?"],
        "Hmm. An empty plate. Who was in the studio today?",
      ),
      line(
        "marek-three-people",
        "Marek",
        ["Ja. Ty. ", PAUSE, "A ešte traja ľudia."],
        "Me. You. And three more people.",
      ),
      line("anna-who", "Anna", ["Kto?"], "Who?"),
      line(
        "marek-who-came",
        "Marek",
        [
          "Ráno ",
          past("prišla"),
          " Mária zo školy. ",
          PAUSE,
          "Na obed ",
          past("prišiel"),
          " čašník z kaviarne. ",
          PAUSE,
          "A o jednej ",
          past("prišla"),
          " Lucia z trhu.",
        ],
        "In the morning Mária came from the school. At noon the waiter came from the café. And at one Lucia came from the market.",
      ),
      line(
        "marek-and-you-anna",
        "Marek",
        ["A ty, Anna? Kde ", past("si bola"), " ty?"],
        "And you, Anna? Where were you?",
      ),
      line(
        "anna-in-town-all-day",
        "Anna",
        [
          "Ja? Ja ",
          past("som bola"),
          " celý deň v meste. ",
          past("Prišla som"),
          " o tretej.",
        ],
        "Me? I was in town all day. I came at three.",
      ),
      line(
        "anna-and-you-marek",
        "Anna",
        ["A ty, Marek? Čo ", past("si robil"), "?"],
        "And you, Marek? What did you do?",
      ),
      line(
        "marek-worked-all-day",
        "Marek",
        [past("Pracoval som"), ". Celý deň ", past("som bol"), " tu."],
        "I worked. I was here all day.",
      ),
      line("anna-and-breakfast", "Anna", ["A raňajky?"], "And breakfast?"),
      line(
        "marek-no-time-breakfast",
        "Marek",
        ["Raňajky? ", PAUSE, past("Nemal som"), " čas."],
        "Breakfast? I had no time.",
      ),
      line(
        "anna-detective-to-school",
        "Anna",
        [
          "Aha. ",
          PAUSE,
          "Dobre. Ja som teraz detektívka. ",
          PAUSE,
          "Najprv do školy, za Máriou.",
        ],
        "I see. OK. I'm the detective now. First to the school, to see Mária.",
      ),
    ],
    PLATE_ACTS,
  ),
  checks: [
    {
      id: `${PREFIX}check-what-is-gone`,
      prompt: "Čo je preč?",
      promptEnglish: "What is gone?",
      replayLineId: `${PREFIX}marek-cake-is-gone`,
      choices: [
        { id: "cake", label: "Marekov koláč." },
        {
          id: "maria",
          label: "Mária zo školy.",
          whyWrong:
            "**Mária zo školy** came in the morning and went back: **ráno prišla Mária zo školy**. What is gone is **môj koláč**.",
        },
        {
          id: "plate",
          label: "Tanier.",
          whyWrong:
            "**Tanier** is the plate, and it is the one thing still there: **teraz je tu len tanier**.",
        },
      ],
      answerId: "cake",
      feedback: {
        english: "My cake is gone!",
        why: "Marek says **môj koláč je preč**, and only the plate is left: **je tu len tanier**.",
      },
    },
    {
      id: `${PREFIX}check-bol-form`,
      gap: "Celý deň som ___ tu.",
      prompt: "Ktoré slovo povedal Marek?",
      promptEnglish: "Which word did Marek say?",
      replayLineId: `${PREFIX}marek-worked-all-day`,
      choices: [
        { id: "bol", label: "bol" },
        {
          id: "bola",
          label: "bola",
          whyWrong: "**Bola** is what a woman says: Anna says **bola som v meste**.",
        },
        {
          id: "boli",
          label: "boli",
          whyWrong:
            "**Boli** is for more than one person, or for someone you call **vy**.",
        },
      ],
      answerId: "bol",
      feedback: {
        english: "I was here all day.",
        why: "A man says **bol som**; **som** stands second, after **celý deň**.",
      },
    },
    {
      id: `${PREFIX}check-who-came-at-one`,
      prompt: "Kto prišiel o jednej?",
      promptEnglish: "Who came at one?",
      replayLineId: `${PREFIX}marek-who-came`,
      choices: [
        { id: "lucia", label: "Lucia." },
        {
          id: "maria",
          label: "Mária.",
          whyWrong: "**Mária** came in the morning: **ráno prišla Mária**.",
        },
        {
          id: "waiter",
          label: "Čašník.",
          whyWrong: "**Čašník** came at noon: **na obed prišiel čašník**.",
        },
      ],
      answerId: "lucia",
      feedback: {
        english: "And at one Lucia came.",
        why: "**O jednej prišla Lucia**: a woman came, so **prišla**; for the waiter Marek says **prišiel**.",
      },
    },
  ],
};

const SCHOOL_ACTS: Record<string, Cue[]> = {
  // Anna comes in at the Vchod door while the card is read and steps up to the desk; Mária works behind it.
  "card-school-half-past-three": [{ who: "anna", do: "enter", to: "guest", on: "start" }],
  "anna-did-you-see-cake": [
    { who: "maria", do: "put", what: "form", to: "counter", dx: -10, on: "start" },
  ],
  "maria-saw-whole-cake": [{ do: "shrug", on: "nechcela" }],
  // She turns to go once Mária has said goodbye, and out the way she came.
  "maria-goodbye": [
    { do: "wave", on: "dovidenia" },
    { who: "anna", do: "leave", to: "door", on: "end" },
  ],
};

const school: ListeningChapter = {
  id: `${PREFIX}school`,
  stage: "registration",
  titleSk: "Boli ste v štúdiu?",
  title: "Mária: were you in the studio?",
  setup: {
    objects: [
      {
        id: "form",
        kind: "clipboard",
        start: { where: { hand: "maria", side: "lead" } },
      },
    ],
    spots: { maria: "behind-counter" },
  },
  lines: staged(
    PREFIX,
    [
      card(
        "card-school-half-past-three",
        "Jazyková škola. Pol štvrtej.",
        "The language school. Half past three.",
      ),
      line(
        "anna-question-for-maria",
        "Anna",
        ["Dobrý deň, pani Mária. Mám pre vás otázku."],
        "Hello, Mária. I have a question for you.",
        { to: "Mária" },
      ),
      line(
        "maria-ask-away",
        "Mária",
        ["Dobrý deň, Anna. Pýtajte sa."],
        "Hello, Anna. Ask away.",
      ),
      line(
        "anna-were-you-in-studio",
        "Anna",
        [past("Boli ste"), " dnes ráno v štúdiu?"],
        "Were you in the studio this morning?",
      ),
      line(
        "maria-at-nine-form",
        "Mária",
        [
          "Áno, ",
          past("bola som"),
          " tam o deviatej. ",
          PAUSE,
          past("Priniesla som"),
          " Marekovi formulár.",
        ],
        "Yes, I was there at nine. I brought Marek a form.",
      ),
      line(
        "anna-did-you-see-cake",
        "Anna",
        ["Marekov koláč je preč. ", PAUSE, past("Videli ste"), " ho ráno?"],
        "Marek's cake is gone. Did you see it in the morning?",
      ),
      line(
        "maria-saw-whole-cake",
        "Mária",
        [
          past("Videla som"),
          ". ",
          past("Bol"),
          " na stole, ešte celý. ",
          PAUSE,
          "Marek mi ",
          past("ponúkol"),
          " kúsok, ale ja ",
          past("som nechcela"),
          ". Ráno nejem sladké.",
        ],
        "I did. It was on the table, still whole. Marek offered me a piece, but I didn't want one. I don't eat sweets in the morning.",
      ),
      line(
        "anna-how-long-there",
        "Anna",
        ["Ako dlho ", past("ste tam boli"), "?"],
        "How long were you there?",
      ),
      line(
        "maria-ten-minutes-school",
        "Mária",
        [
          "Desať minút. O pol desiatej ",
          past("som už bola"),
          " v škole. ",
          PAUSE,
          "Celý deň ",
          past("som"),
          " tu ",
          past("pracovala"),
          ".",
        ],
        "Ten minutes. At half past nine I was already at school. I worked here all day.",
      ),
      line(
        "anna-thanks-thats-all",
        "Anna",
        ["Ďakujem. To je všetko."],
        "Thank you. That's all.",
      ),
      line(
        "maria-marek-told-me-hungry",
        "Mária",
        [
          "Prosím. ",
          PAUSE,
          "A Anna",
          STOP,
          PAUSE,
          "Marek mi ráno ",
          past("povedal"),
          ", že je strašne hladný.",
        ],
        "You're welcome. And Anna… this morning Marek told me he was terribly hungry.",
      ),
      line(
        "anna-interesting",
        "Anna",
        ["Hm. ", PAUSE, "To je zaujímavé."],
        "Hmm. That's interesting.",
      ),
      line(
        "maria-student-good-luck",
        "Mária",
        ["Prepáčte, o chvíľu mám študenta. ", PAUSE, "Veľa šťastia, pani detektívka!"],
        "Excuse me, I have a student in a moment. Good luck, detective!",
      ),
      line("anna-thanks-goodbye", "Anna", ["Ďakujem. Dovidenia!"], "Thank you. Goodbye!"),
      line("maria-goodbye", "Mária", ["Dovidenia."], "Goodbye."),
    ],
    SCHOOL_ACTS,
  ),
  checks: [
    {
      id: `${PREFIX}check-boli-ste`,
      gap: "___ dnes ráno v štúdiu?",
      prompt: "Ako sa Anna pýtala pani Márie?",
      promptEnglish: "How did Anna ask Mária?",
      replayLineId: `${PREFIX}anna-were-you-in-studio`,
      choices: [
        { id: "boli-ste", label: "Boli ste" },
        {
          id: "bola-si",
          label: "Bola si",
          whyWrong:
            "**Bola si** is for a friend, someone you call **ty**. Anna says **dobrý deň** and **vy** to Mária.",
        },
        {
          id: "bola-ste",
          label: "Bola ste",
          whyWrong:
            "**Ste** needs the plural form **boli**, even when it is one woman you ask.",
        },
      ],
      answerId: "boli-ste",
      feedback: {
        english: "Were you in the studio this morning?",
        why: "Formal **vy** takes the plural form, even for one person: **boli ste**.",
      },
    },
    {
      id: `${PREFIX}check-why-maria-no-cake`,
      prompt: "Prečo Mária nejedla koláč?",
      promptEnglish: "Why didn't Mária eat the cake?",
      replayLineId: `${PREFIX}maria-saw-whole-cake`,
      choices: [
        { id: "no-sweets", label: "Ráno neje sladké." },
        {
          id: "no-time",
          label: "Nemala čas.",
          whyWrong:
            "**Nemala čas** means she had no time. She had ten minutes and gives another reason.",
        },
        {
          id: "no-offer",
          label: "Marek jej nič neponúkol.",
          whyWrong:
            "**Nič neponúkol** means he offered nothing. Mária says **Marek mi ponúkol kúsok**.",
        },
      ],
      answerId: "no-sweets",
      feedback: {
        english:
          "Marek offered me a piece, but I didn't want one. I don't eat sweets in the morning.",
        why: "Mária says **ja som nechcela**, with the woman's form **nechcela**, and **ráno nejem sladké**.",
      },
    },
  ],
};

/** Anna comes in off the street to the counter, where the waiter works behind the bar, and goes out the same way. */
const CAFE_ACTS: Record<string, Cue[]> = {
  "card-cafe-four": [{ who: "anna", do: "enter", to: "counter", on: "start" }],
  "anna-you-were-in-studio": [{ do: "face", to: "waiter", on: "start" }],
  "waiter-ate-nothing": [{ do: "look", to: "kolac", on: "Koláčov" }],
  "anna-poppy-cake-you-too": [{ do: "point", to: "kolac", on: "koláč" }],
  "anna-true-goodbye-market": [
    { do: "wave", on: "dovidenia" },
    { who: "waiter", do: "wave", on: "dovidenia" },
    { do: "leave", to: "door", on: "Teraz" },
  ],
};

const cafe: ListeningChapter = {
  id: `${PREFIX}cafe`,
  stage: "cafe",
  titleSk: "Pozeral sa na koláč",
  title: "The waiter: he was looking at the cake",
  setup: { spots: { waiter: "back" } },
  lines: staged(
    PREFIX,
    [
      card("card-cafe-four", "Kaviareň. Štyri hodiny.", "The café. Four o'clock."),
      line(
        "anna-you-were-in-studio",
        "Anna",
        ["Dobrý deň. ", PAUSE, "Vy ", past("ste dnes boli"), " u nás v štúdiu, áno?"],
        "Hello. You were at our studio today, right?",
        { to: "Waiter" },
      ),
      line(
        "waiter-brought-coffee",
        "Waiter",
        ["Dobrý deň! Áno, na obed. ", PAUSE, past("Priniesol som"), " kávu pre Mareka."],
        "Hello! Yes, at noon. I brought a coffee for Marek.",
        // The coffee was at noon; he has nothing in his hands now.
        { props: [null, null, null] },
      ),
      line(
        "anna-and-the-cake",
        "Anna",
        [
          "Na stole ",
          past("bol"),
          " koláč. Teraz je preč. ",
          PAUSE,
          past("Videli ste"),
          " ho?",
        ],
        "There was a cake on the table. Now it's gone. Did you see it?",
      ),
      line(
        "waiter-marek-looked-at-cake",
        "Waiter",
        [
          past("Videl som"),
          ". ",
          past("Bol"),
          " na stole, ešte celý. ",
          PAUSE,
          "A Marek ",
          past("sedel"),
          " pri stole a ",
          past("pozeral sa"),
          " na koláč.",
        ],
        "I did. It was on the table, still whole. And Marek was sitting at the table, looking at the cake.",
      ),
      line(
        "anna-looked-at-cake",
        "Anna",
        [past("Pozeral sa"), " na koláč?"],
        "Looking at the cake?",
      ),
      line(
        "waiter-long-then-back",
        "Waiter",
        ["Áno. ", PAUSE, "Potom ", past("som išiel"), " späť do kaviarne."],
        "Yes. Then I went back to the café.",
      ),
      line(
        "anna-did-you-eat",
        "Anna",
        ["A vy? ", past("Jedli ste"), " niečo v štúdiu?"],
        "And you? Did you eat anything in the studio?",
      ),
      line(
        "waiter-ate-nothing",
        "Waiter",
        [
          "Ja? Nie! ",
          PAUSE,
          "Nič ",
          past("som nejedol"),
          ". ",
          PAUSE,
          "Koláčov tu mám dosť.",
        ],
        "Me? No! I ate nothing. I've got plenty of cakes here.",
      ),
      line(
        "anna-poppy-cake-you-too",
        "Anna",
        ["Hm", STOP, PAUSE, "Makový koláč máte aj vy."],
        "Hmm… You have poppy-seed cake too.",
      ),
      line(
        "waiter-but-its-ours",
        "Waiter",
        ["Áno, ale ten je náš!"],
        "Yes, but that one is ours!",
      ),
      line(
        "anna-true-goodbye-market",
        "Anna",
        ["To je pravda. Ďakujem, dovidenia! ", PAUSE, "Teraz na trh, za Luciou."],
        "That's true. Thank you, goodbye! Now to the market, to see Lucia.",
      ),
    ],
    CAFE_ACTS,
  ),
  checks: [
    {
      id: `${PREFIX}check-what-marek-did-at-noon`,
      prompt: "Čo robil Marek na obed?",
      promptEnglish: "What was Marek doing at noon?",
      replayLineId: `${PREFIX}waiter-marek-looked-at-cake`,
      choices: [
        { id: "looked", label: "Sedel pri stole a pozeral sa na koláč." },
        {
          id: "ate",
          label: "Jedol koláč.",
          whyWrong:
            "**Jedol koláč** means he was eating the cake. The waiter saw it whole: **bol na stole, ešte celý**.",
        },
        {
          id: "coffee-with-anna",
          label: "Pil kávu s Annou.",
          whyWrong:
            "**S Annou** means with Anna, but Anna was in town all day; the coffee was **pre Mareka** alone.",
        },
      ],
      answerId: "looked",
      feedback: {
        english: "Marek was sitting at the table, looking at the cake.",
        why: "Third person needs no **som**: **Marek sedel a pozeral sa**.",
      },
    },
    {
      id: `${PREFIX}check-nejedol-form`,
      gap: "Nič som ___.",
      prompt: "Ktoré slovo povedal čašník?",
      promptEnglish: "Which word did the waiter say?",
      replayLineId: `${PREFIX}waiter-ate-nothing`,
      choices: [
        { id: "nejedol", label: "nejedol" },
        {
          id: "nejedla",
          label: "nejedla",
          whyWrong: "**Nejedla** is what a woman says. The waiter is a man: **nejedol**.",
        },
        {
          id: "nie-jedol",
          label: "nie jedol",
          whyWrong:
            "**Ne-** joins the **-l** form: **nejedol**. Only present **byť** keeps **nie** apart.",
        },
      ],
      answerId: "nejedol",
      feedback: {
        english: "I ate nothing.",
        why: "**Jesť** has its own form, **jedol**, and **ne-** joins it: **nič som nejedol**.",
      },
    },
  ],
};

/**
 * The umbrella lies on Lucia's counter: held at her hip, the counter hid all
 * but a blue stub that read as a bottle. She holds it up on "dáždnik".
 */
const MARKET_ACTS: Record<string, Cue[]> = {
  "card-market-half-past-four": [
    { who: "anna", do: "enter", from: "off-left", to: "aside", on: "start" },
  ],
  "anna-question-for-lucia": [{ do: "face", to: "lucia", on: "start" }],
  "lucia-came-for-umbrella": [
    { do: "take", what: "lucia-umbrella", on: "Prišla" },
    { do: "raise", what: "lucia-umbrella", on: "dáždnik" },
  ],
  "anna-what-did-you-do-there": [
    {
      who: "lucia",
      do: "put",
      what: "lucia-umbrella",
      to: "counter",
      dx: -11,
      on: "start",
    },
  ],
  "lucia-only-half": [{ do: "shrug", on: "polovica" }],

  "lucia-marek-alone-offered": [{ do: "shrug", on: "ponáhľala" }],
  "anna-not-hungry-back-to-studio": [
    { do: "wave", on: "Maj" },
    { who: "lucia", do: "wave", on: "Maj" },
    { do: "leave", to: "left", on: "Teraz" },
  ],
};

const market: ListeningChapter = {
  id: `${PREFIX}market`,
  stage: "market",
  titleSk: "Už len polovica",
  title: "Lucia: only half of it",
  setup: {
    objects: [
      {
        id: "lucia-umbrella",
        kind: "umbrella",
        start: { where: { on: "counter", dx: -11 }, of: "lucia" },
      },
    ],
    // She sells from behind her counter.
    spots: { lucia: "behind-counter" },
  },
  lines: staged(
    PREFIX,
    [
      card(
        "card-market-half-past-four",
        "Trh. Pol piatej.",
        "The market. Half past four.",
      ),
      line(
        "anna-question-for-lucia",
        "Anna",
        ["Ahoj, Lucia. Mám pre teba otázku."],
        "Hi, Lucia. I have a question for you.",
        { to: "Lucia" },
      ),
      line(
        "lucia-what-happened",
        "Lucia",
        ["Ahoj, Anna! Čo sa ", past("stalo"), "?"],
        "Hi, Anna! What happened?",
      ),
      line(
        "anna-where-were-you-at-one",
        "Anna",
        ["Marekov koláč je preč. ", PAUSE, "Kde ", past("si bola"), " dnes o jednej?"],
        "Marek's cake is gone. Where were you today at one?",
      ),
      line(
        "lucia-came-for-umbrella",
        "Lucia",
        [
          "O jednej? ",
          PAUSE,
          past("Bola som"),
          " u vás v štúdiu. ",
          past("Prišla som"),
          " po svoj dáždnik.",
        ],
        "At one? I was at your studio. I came for my umbrella.",
        { props: [null, null, null] },
      ),
      line(
        "anna-what-did-you-do-there",
        "Anna",
        ["A čo ", past("si tam robila"), "?"],
        "And what did you do there?",
      ),
      line(
        "lucia-took-umbrella-went-home",
        "Lucia",
        [
          "Nič. ",
          past("Vzala som si"),
          " dáždnik a ",
          past("išla som"),
          " domov. ",
          PAUSE,
          past("Bola som"),
          " tam päť minút.",
        ],
        "Nothing. I took my umbrella and went home. I was there five minutes.",
        { props: [null, null, null] },
      ),
      line(
        "anna-did-you-see-cake-lucia",
        "Anna",
        [past("Videla si"), " koláč?"],
        "Did you see the cake?",
      ),
      line(
        "lucia-only-half",
        "Lucia",
        [
          past("Videla"),
          ". ",
          PAUSE,
          past("Bol"),
          " na stole. ",
          PAUSE,
          "Ale už len polovica.",
        ],
        "I did. It was on the table. But only half of it by then.",
      ),
      line(
        "anna-only-half-at-one",
        "Anna",
        ["Len polovica? O jednej?"],
        "Only half? At one?",
      ),
      line(
        "lucia-marek-alone-offered",
        "Lucia",
        [
          "Áno. A Marek ",
          past("bol"),
          " sám. ",
          PAUSE,
          past("Ponúkol"),
          " mi kúsok a ",
          past("povedal"),
          ", že on už nemá hlad. ",
          PAUSE,
          "Ale ja ",
          past("som sa ponáhľala"),
          ".",
        ],
        "Yes. And Marek was alone. He offered me a piece and said he wasn't hungry any more. But I was in a hurry.",
      ),
      line(
        "anna-not-hungry-back-to-studio",
        "Anna",
        [
          "Už nemá hlad",
          STOP,
          PAUSE,
          "Ďakujem, Lucia. Maj sa! ",
          PAUSE,
          "Teraz späť do štúdia.",
        ],
        "Not hungry any more… Thanks, Lucia. Take care! Now back to the studio.",
      ),
    ],
    MARKET_ACTS,
  ),
  checks: [
    {
      id: `${PREFIX}check-how-much-cake-at-one`,
      prompt: "Koľko koláča bolo na stole o jednej?",
      promptEnglish: "How much cake was on the table at one?",
      replayLineId: `${PREFIX}lucia-only-half`,
      choices: [
        { id: "half", label: "Len polovica." },
        {
          id: "whole",
          label: "Celý koláč.",
          whyWrong:
            "**Celý koláč** is what Mária and the waiter saw, in the morning and at noon. Lucia says **už len polovica**.",
        },
        {
          id: "nothing",
          label: "Nič.",
          whyWrong:
            "**Nič** means nothing. That is the plate at three. At one Lucia still saw half.",
        },
      ],
      answerId: "half",
      feedback: {
        english: "It was on the table. But only half of it by then.",
        why: "Lucia says **bol na stole, ale už len polovica**: at one, half the cake was gone.",
      },
    },
    {
      id: `${PREFIX}check-som-si-order`,
      gap: "Vzala ___ dáždnik a išla som domov.",
      prompt: "Ktoré slová povedala Lucia?",
      promptEnglish: "Which words did Lucia say?",
      replayLineId: `${PREFIX}lucia-took-umbrella-went-home`,
      choices: [
        { id: "som-si", label: "som si" },
        {
          id: "si-som",
          label: "si som",
          whyWrong: "**Som** comes before **si**: **vzala som si**.",
        },
        {
          id: "som",
          label: "som",
          whyWrong: "**Vzať si** keeps its **si**: taking something for yourself.",
        },
      ],
      answerId: "som-si",
      feedback: {
        english: "I took my umbrella and went home.",
        why: "**Som** takes second place and **si** follows it: **vzala som si dáždnik**.",
      },
    },
    {
      id: `${PREFIX}check-what-marek-said`,
      prompt: "Čo povedal Marek Lucii?",
      promptEnglish: "What did Marek say to Lucia?",
      replayLineId: `${PREFIX}lucia-marek-alone-offered`,
      choices: [
        { id: "not-hungry", label: "Že už nemá hlad." },
        {
          id: "hungry",
          label: "Že má hlad.",
          whyWrong:
            "**Má hlad** means he is hungry. That was the morning; at one he **už nemá hlad**.",
        },
        {
          id: "cake-gone",
          label: "Že koláč je preč.",
          whyWrong:
            "**Koláč je preč** is what he tells Anna at three. At one half of it was still there.",
        },
      ],
      answerId: "not-hungry",
      feedback: {
        english: "He offered me a piece and said he wasn't hungry any more.",
        why: "Lucia says **povedal, že on už nemá hlad**: **povedal** is past, what he said stays present.",
      },
    },
  ],
};

/** Anna back from town, in at the studio door, down at her place at the desk, and her headphones back on. */
const WHODUNIT_ACTS: Record<string, Cue[]> = {
  "card-studio-five": [
    { who: "anna", do: "enter", to: "inside", on: "start" },
    { who: "anna", do: "sit", to: "desk-left" },
  ],
  "anna-back-what-we-know": [
    { do: "take", what: "anna-headphones", on: "Tak" },
    { do: "put", what: "anna-headphones", to: "anna" },
  ],
  "anna-noon-waiter-you-looked": [{ who: "marek", do: "look", to: "anna", on: "ty" }],
  "marek-only-looking": [{ do: "shrug", on: "pozeral" }],
  "marek-half-hm": [{ do: "look", to: "plate", on: "Hm" }],
  // A finger for each of the three who came by.
  "anna-they-were-here-briefly": [{ do: "count", on: "start" }],
  // Off to make a coffee: the five minutes the next scene skips.
  "anna-think-coffee": [
    { do: "take", what: "anna-headphones", on: "start" },
    { do: "put", what: "anna-headphones", to: "desk", dx: -38 },
    { do: "take", what: "anna-mug", on: "Ja" },
    { do: "stand", on: "idem" },
    { do: "leave", to: "door", on: "kávu" },
    { who: "marek", do: "look", to: "door", on: "kávu" },
  ],
};

const whodunit: ListeningChapter = {
  id: `${PREFIX}whodunit`,
  titleSk: "Kto to bol?",
  title: "Who was it? The clues, and your turn",
  setup: {
    objects: [
      { id: "plate", kind: "plate", start: { where: { on: "desk", dx: 38 } } },
      {
        id: "anna-headphones",
        kind: "headphones",
        start: { where: { on: "desk", dx: -38 }, of: "anna" },
      },
      // Her own mug, where the desk draws it, so she can take it to make her coffee.
      { id: "anna-mug", kind: "cup", start: { where: { on: "desk", dx: -24 } } },
    ],
  },
  lines: staged(
    PREFIX,
    [
      card("card-studio-five", "Štúdio. Päť hodín.", "The studio. Five o'clock."),
      line(
        "anna-back-what-we-know",
        "Anna",
        [
          "Som späť, Marek. ",
          PAUSE,
          "Tak. Čo ",
          past("sme sa"),
          " dnes ",
          past("dozvedeli"),
          "?",
        ],
        "I'm back, Marek. Right. What did we find out today?",
      ),
      line(
        "anna-nine-maria-whole",
        "Anna",
        ["Mária hovorí: o deviatej ", past("bol"), " koláč celý."],
        "Mária says: at nine the cake was whole.",
      ),
      line(
        "anna-noon-waiter-you-looked",
        "Anna",
        [
          "A potom na obed: čašník hovorí, že koláč ",
          past("bol"),
          " celý. ",
          PAUSE,
          "A že ty ",
          past("si sedel"),
          " a ",
          past("pozeral sa"),
          " na koláč.",
        ],
        "And then at noon: the waiter says the cake was whole. And that you were sitting there, looking at the cake.",
      ),
      line(
        "marek-only-looking",
        "Marek",
        ["Len ", past("som sa pozeral"), "!"],
        "I was only looking!",
      ),
      line(
        "anna-one-lucia-half",
        "Anna",
        [
          "A o jednej? ",
          PAUSE,
          "Lucia hovorí, že na stole ",
          past("bola"),
          " už len polovica.",
        ],
        "And at one? Lucia says only half was left on the table.",
      ),
      line("marek-half-hm", "Marek", ["Polovica? ", PAUSE, "Hm."], "Half? Hmm."),
      line(
        "anna-they-were-here-briefly",
        "Anna",
        [
          "Mária, čašník a Lucia ",
          past("boli"),
          " v štúdiu len chvíľu. ",
          PAUSE,
          "A ",
          past("nejedli"),
          ". ",
          PAUSE,
          "A ja ",
          past("som bola"),
          " celý deň v meste.",
        ],
        "Mária, the waiter and Lucia were only in the studio for a moment. And they didn't eat. And I was in town all day.",
      ),
      line(
        "anna-so-who-guess",
        "Anna",
        ["Tak kto ", past("bol"), " v štúdiu celý deň? ", PAUSE, "Hádajte aj vy!"],
        "So who was in the studio all day? Have a guess too!",
      ),
      line(
        "marek-hm-dont-know",
        "Marek",
        ["Hm… ", PAUSE, "neviem."],
        "Hmm… I don't know.",
      ),
      line(
        "anna-think-coffee",
        "Anna",
        ["Porozmýšľaj. ", PAUSE, "Ja si idem uvariť kávu."],
        "Think about it. I'm going to make myself a coffee.",
      ),
    ],
    WHODUNIT_ACTS,
  ),
  checks: [
    {
      id: `${PREFIX}check-boli-plural`,
      gap: "Mária, čašník a Lucia ___ v štúdiu len chvíľu.",
      prompt: "Ktoré slovo povedala Anna?",
      promptEnglish: "Which word did Anna say?",
      replayLineId: `${PREFIX}anna-they-were-here-briefly`,
      choices: [
        { id: "boli", label: "boli" },
        {
          id: "bol",
          label: "bol",
          whyWrong:
            "**Bol** is for one man or one masculine thing: **koláč bol celý**. Here there are three people.",
        },
        {
          id: "bola",
          label: "bola",
          whyWrong:
            "**Bola** is for one woman: **Lucia bola v štúdiu**. Here there are three people.",
        },
      ],
      answerId: "boli",
      feedback: {
        english: "Mária, the waiter and Lucia were only in the studio for a moment.",
        why: "More than one person takes **-li**: **boli**, and in the same line **nejedli**.",
      },
    },
    {
      id: `${PREFIX}check-bola-polovica`,
      gap: "Na stole ___ už len polovica.",
      prompt: "Ktoré slovo povedala Anna?",
      promptEnglish: "Which word did Anna say?",
      replayLineId: `${PREFIX}anna-one-lucia-half`,
      choices: [
        { id: "bola", label: "bola" },
        {
          id: "bol",
          label: "bol",
          whyWrong:
            "**Bol** goes with a masculine subject: **koláč bol celý**. Here the subject is **polovica**.",
        },
        {
          id: "bolo",
          label: "bolo",
          whyWrong:
            "**Bolo** is the neuter form, as in **čo sa stalo**. **Polovica** is feminine.",
        },
      ],
      answerId: "bola",
      feedback: {
        english: "Only half was left on the table.",
        why: "The **-l** form agrees with the subject: **polovica** is feminine, so **bola**.",
      },
    },
  ],
};

const ASK_WHO = `${PREFIX}anna-i-know-and-you`;

const CLOSED_ACTS: Record<string, Cue[]> = {
  // The cut of the card: the clock runs on to five past five. The skip is Marek's so that Anna's
  // first cue is her entrance, which starts her out of the room, away making her coffee.
  "card-five-minutes-later": [
    { who: "marek", do: "skip", minutes: 5, on: "start" },
    { who: "anna", do: "enter", to: "inside", on: "dark" },
    { who: "anna", do: "sit", to: "desk-left", on: "dark" },
  ],
  // The coffee down by her place first, then her headphones back on.
  "anna-i-know-and-you": [
    { do: "put", what: "anna-mug", to: "desk", dx: -24, on: "Tak" },
    { do: "take", what: "anna-headphones" },
    { do: "put", what: "anna-headphones", to: "anna" },
  ],
  // She turns to look at his teeth; a lean at the desk took her head into her own mic.
  "anna-smile-poppy-seeds": [
    { do: "look", to: "marek", on: "usmej" },
    { who: "marek", do: "grin", seeds: true, on: "usmej" },
  ],
  // The seeds show on "Mak…"; the grin drops as he works it out.
  "marek-did-i-eat-it": [
    { who: "marek", do: "grin", off: true, on: "No" },
    { do: "shrug", on: "Možno" },
  ],
  "marek-stopped-counting": [
    { do: "count", on: "Potom" },
    { do: "facepalm", on: "nepočítal" },
  ],
  "anna-so-the-whole-cake": [{ do: "look", to: "plate", on: "celý" }],
  "marek-sorry-so-good": [{ do: "look", to: "plate", on: "Bol" }],
};

const closed: ListeningChapter = {
  id: `${PREFIX}closed`,
  titleSk: "Prípad uzavretý",
  title: "Case closed",
  setup: {
    objects: [
      { id: "plate", kind: "plate", start: { where: { on: "desk", dx: 38 } } },
      {
        id: "anna-headphones",
        kind: "headphones",
        start: { where: { on: "desk", dx: -38 }, of: "anna" },
      },
      // Back with the coffee she went to make.
      { id: "anna-mug", kind: "cup", start: { where: { hand: "anna", side: "lead" } } },
    ],
  },
  lines: staged(
    PREFIX,
    [
      card("card-five-minutes-later", "Päť minút neskôr.", "Five minutes later."),
      // The listener names the culprit here; Anna's next line gives the answer.
      listenerPicks(
        line(
          "anna-i-know-and-you",
          "Anna",
          [
            "Tak. ",
            PAUSE,
            "Ja už viem, kto zjedol koláč. ",
            PAUSE,
            "A vy, milí poslucháči?",
          ],
          "Right. I know who ate the cake now. And you, dear listeners?",
        ),
        {
          prompt: "Kto zjedol koláč?",
          choices: [
            // A name glossed with itself only repeats it.
            { id: "marek", label: "Marek", english: "" },
            {
              id: "lucia",
              label: "Lucia",
              english: "",
              whyWrong:
                "**Lucia** was there five minutes and saw half the cake already gone: **bola tam päť minút**.",
            },
            {
              id: "maria",
              label: "Mária",
              english: "",
              whyWrong:
                "**Mária** was there at nine and the cake was still whole: **ráno nejem sladké**.",
            },
            {
              id: "waiter",
              label: "Čašník",
              english: "The waiter",
              whyWrong:
                "**Čašník** says **nič som nejedol**, and the cake was still whole when he left at noon.",
            },
          ],
          answerId: "marek",
          judge: "Anna",
        },
      ),
      onPath(
        line(
          "marek-you-know-already",
          "Marek",
          ["Vy už viete? ", PAUSE, "Ja ešte nie."],
          "You know already? I don't yet.",
        ),
        { ask: ASK_WHO, picks: ["marek", "lucia", "maria", "waiter"] },
      ),
      onPath(
        line(
          "anna-nobody-ill-tell-you",
          "Anna",
          ["Nikto? ", PAUSE, "Dobre, tak vám to poviem."],
          "Nobody? All right, then I'll tell you.",
        ),
        { ask: ASK_WHO, picks: [NO_PICK] },
      ),
      onPath(
        line(
          "marek-still-dont-know",
          "Marek",
          ["Hm", STOP, PAUSE, "Ja stále neviem."],
          "Hmm… I still don't know.",
        ),
        { ask: ASK_WHO, picks: [NO_PICK] },
      ),
      afterThinking(
        line(
          "anna-marek-you-were-here",
          "Anna",
          [
            "Marek. ",
            PAUSE,
            "Ty ",
            past("si bol"),
            " v štúdiu celý deň. Ráno ",
            past("si bol"),
            " hladný. O jednej ",
            past("si už nemal"),
            " hlad.",
          ],
          "Marek. You were in the studio all day. In the morning you were hungry. At one you weren't hungry any more.",
        ),
      ),
      line(
        "anna-smile-poppy-seeds",
        "Anna",
        [
          "Marek, usmej sa. ",
          PAUSE,
          "Hm",
          STOP,
          PAUSE,
          "Mak. ",
          PAUSE,
          "Máš mak na zuboch.",
        ],
        "Marek, smile. Hmm… Poppy seeds. You've got poppy seeds on your teeth.",
      ),
      line(
        "marek-did-i-eat-it",
        "Marek",
        [
          "Mak",
          STOP,
          PAUSE,
          "No",
          STOP,
          PAUSE,
          "Možno ",
          past("som"),
          " ho ",
          past("zjedol"),
          " ja.",
        ],
        "Poppy seeds… Well… Maybe I ate it.",
      ),
      line(
        "anna-do-you-remember",
        "Anna",
        ["Možno? ", PAUSE, "Spomeň si, Marek."],
        "Maybe? Think back, Marek.",
      ),
      line(
        "marek-small-piece",
        "Marek",
        [
          "Hm",
          STOP,
          PAUSE,
          "Na obed ",
          past("som pracoval"),
          STOP,
          PAUSE,
          "a ",
          past("mal som"),
          " hlad. ",
          PAUSE,
          "Čašník ",
          past("odišiel"),
          STOP,
          PAUSE,
          "a ja ",
          past("som si vzal"),
          STOP,
          PAUSE,
          "malý kúsok. ",
          PAUSE,
          "Len jeden.",
        ],
        "Hmm… At noon I was working… and I was hungry. The waiter left… and I took… a small piece. Just one.",
      ),
      line("anna-and-then", "Anna", ["A potom?"], "And then?"),
      line(
        "marek-stopped-counting",
        "Marek",
        [
          "Potom",
          STOP,
          PAUSE,
          "ešte jeden. ",
          PAUSE,
          "Pri káve",
          STOP,
          PAUSE,
          "ešte jeden. ",
          PAUSE,
          "A potom",
          STOP,
          PAUSE,
          past("som už nepočítal"),
          ".",
        ],
        "Then… one more. With the coffee… one more. And then… I stopped counting.",
      ),
      // A beat for "I stopped counting" to land.
      {
        ...line(
          "anna-so-the-whole-cake",
          "Anna",
          ["Takže celý koláč."],
          "So the whole cake.",
        ),
        wait: 1000,
      },
      line(
        "marek-sorry-so-good",
        "Marek",
        [
          "Celý koláč. ",
          PAUSE,
          "Prepáč, Anna. ",
          PAUSE,
          past("Bol"),
          " taký dobrý",
          STOP,
        ],
        "The whole cake. Sorry, Anna. It was so good…",
        { gestures: ["muse", "apologize", "muse"] },
      ),
      line(
        "anna-case-closed",
        "Anna",
        [
          "Prípad uzavretý. ",
          PAUSE,
          "A ja ",
          past("som"),
          " z neho ",
          past("nemala"),
          " ani kúsok. ",
          PAUSE,
          "Zajtra koláč kupujem ja. A schovám ho.",
        ],
        "Case closed. And I didn't get a single piece. Tomorrow I'm buying the cake. And I'm hiding it.",
      ),
      line("marek-where", "Marek", ["Kam?"], "Where?"),
      line(
        "anna-wont-tell-you",
        "Anna",
        [CHUCKLE, "To ti nepoviem."],
        "I'm not telling you.",
      ),
      line(
        "marek-ill-find-it",
        "Marek",
        [SIGH, "Škoda. ", PAUSE, "Ja ho aj tak nájdem."],
        "Pity. I'll find it anyway.",
      ),
      line("anna-well-see", "Anna", [CHUCKLE, "To uvidíme."], "We'll see about that."),
      {
        ...card(
          "card-the-end",
          "Koniec. Ďakujeme, že ste počúvali.",
          "The end. Thank you for listening.",
        ),
        wait: 1500,
      },
    ],
    CLOSED_ACTS,
  ),
  checks: [
    {
      id: `${PREFIX}check-how-it-started`,
      prompt: "Ako to začalo?",
      promptEnglish: "How did it start?",
      replayLineId: `${PREFIX}marek-small-piece`,
      choices: [
        { id: "small-piece", label: "Marek si vzal malý kúsok." },
        {
          id: "whole",
          label: "Marek zjedol celý koláč naraz.",
          whyWrong:
            "**Naraz** means all at once. It went piece by piece: **malý kúsok**, **ešte jeden**, and then he stopped counting.",
        },
        {
          id: "coffee",
          label: "Čašník mu dal koláč ku káve.",
          whyWrong:
            "**Dal mu koláč** means he gave him the cake. The waiter only brought coffee; the cake was Marek's own.",
        },
      ],
      answerId: "small-piece",
      feedback: {
        english:
          "At noon I was working and I was hungry. The waiter left and I took a small piece.",
        why: "Marek says **vzal som si malý kúsok**: **som** second, then **si**, as in **vzala som si** earlier.",
      },
    },
    {
      id: `${PREFIX}check-nemala-form`,
      gap: "A ja som z neho ___ ani kúsok.",
      prompt: "Ktoré slovo povedala Anna?",
      promptEnglish: "Which word did Anna say?",
      replayLineId: `${PREFIX}anna-case-closed`,
      choices: [
        { id: "nemala", label: "nemala" },
        {
          id: "nemal",
          label: "nemal",
          whyWrong: "**Nemal** is what a man says. Anna is a woman: **nemala**.",
        },
        {
          id: "nie-mala",
          label: "nie mala",
          whyWrong:
            "**Ne-** joins the **-l** form: **nemala**. Only present **byť** keeps **nie** apart.",
        },
      ],
      answerId: "nemala",
      feedback: {
        english: "And I didn't get a single piece.",
        why: "A woman says **mala**, and **ne-** joins it: **a ja som z neho nemala ani kúsok**.",
      },
    },
  ],
};

export const pastTenseEpisode: ListeningEpisode = {
  id: "listening/past-tense",
  cover: { segment: "Pozeral sa na koláč", atMs: 28500, x: 0.62 },
  slug: "past-tense",
  number: 4,
  level: "A1–A2",
  titleSk: "Kto zjedol koláč?",
  title: "Who ate the cake?",
  topic: "Past tense",
  promise:
    "A detective story. Marek's poppy-seed cake is gone, and Anna questions everyone who was in the studio today. You name the culprit before she does.",
  grammarSlug: "past-tense",
  speakers: ["Anna", "Marek", "Mária", "Waiter", "Lucia", "Scene"],
  vocabulary: [
    { slovak: "koláč", english: "cake" },
    { slovak: "tanier", english: "plate" },
    { slovak: "polovica", english: "half" },
    { slovak: "mak", english: "poppy seed" },
    { slovak: "Kde si bol?", english: "Where were you? (to a man)" },
    { slovak: "Kde si bola?", english: "Where were you? (to a woman)" },
    { slovak: "Čo sa stalo?", english: "What happened?" },
  ],
  chapters: [plate, school, cafe, market, whodunit, closed],
};
