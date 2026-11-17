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
import type { StickPictureId } from "$lib/stick-figure/pictures";
import type { ListeningChapter, ListeningEpisode } from "../types";

const PREFIX = "podcast-possessives-";
const line = lineWriter(PREFIX);
/** A beat before a line, where the talk turns. */
const BEAT_MS = 1200;

/** A possessive, the episode's topic, lit in the transcript. */
function mark(text: string): Exclude<MarkedPart, string> {
  return { role: "possessive", text };
}

const INTRO_ACTS: Record<string, Cue[]> = {
  "marek-whose-umbrella": [
    { do: "take", what: "umbrella", hand: "far", on: "mám" },
    { do: "raise", what: "umbrella", on: "dáždnik" },
  ],
  "anna-not-mine": [{ do: "point", to: "umbrella", on: "môj" }],
  "marek-so-whose": [{ do: "put", what: "umbrella", to: "desk", dx: 38, on: "nie" }],
  "anna-students-yesterday": [
    { do: "stand", on: "poďme" },
    { who: "marek", do: "stand", on: "poďme" },
  ],
};

const intro: ListeningChapter = {
  id: `${PREFIX}intro`,
  titleSk: "Úvod",
  title: "An umbrella nobody owns",
  setup: {
    objects: [
      { id: "umbrella", kind: "umbrella", start: { where: { on: "desk", dx: 38 } } },
    ],
  },
  lines: staged(
    PREFIX,
    [
      line(
        "anna-this-is-podcast",
        "Anna",
        ["Ahojte! Tu je podcast Slovak Wiki. Ja som Anna."],
        "Hi! This is the Slovak Wiki podcast. I'm Anna.",
      ),
      line(
        "marek-i-am-marek",
        "Marek",
        ["A ja som Marek. Ahojte!"],
        "And I'm Marek. Hi!",
      ),
      line(
        "anna-topic",
        "Anna",
        [
          "Dnešná téma je: ",
          mark("môj"),
          ", ",
          mark("tvoj"),
          ", ",
          mark("jeho"),
          ", ",
          mark("jej"),
          ". ",
          PAUSE,
          "A ",
          mark("svoj"),
          ".",
        ],
        "Today's topic is: môj, tvoj, jeho, jej. And svoj.",
      ),
      line(
        "marek-whose-umbrella",
        "Marek",
        ["Dobrá téma. Mám tu dáždnik. ", PAUSE, "Čí je to dáždnik?"],
        "Good topic. I have an umbrella here. Whose umbrella is it?",
      ),
      line(
        "anna-not-mine",
        "Anna",
        ["Hm… ", PAUSE, mark("Môj"), " nie. ", mark("Môj"), " dáždnik je doma."],
        "Hmm… not mine. My umbrella is at home.",
      ),
      line(
        "marek-so-whose",
        "Marek",
        [mark("Tvoj"), " nie, ", mark("môj"), " nie. ", PAUSE, "Tak čí?"],
        "Not yours, not mine. So whose?",
      ),
      line(
        "anna-students-yesterday",
        "Anna",
        [
          "To je dobrá otázka. ",
          PAUSE,
          "Včera tu boli študenti z jazykovej školy. Poďme sa tam opýtať!",
        ],
        "That's a good question. Yesterday some students from the language school were here. Let's go and ask there!",
      ),
    ],
    INTRO_ACTS,
  ),
  checks: [
    {
      id: `${PREFIX}check-topic`,
      prompt: "Aká je dnešná téma?",
      promptEnglish: "What is today's topic?",
      replayLineId: `${PREFIX}anna-topic`,
      choices: [
        { id: "possessives", label: "Môj, tvoj, jeho, jej." },
        {
          id: "demonstratives",
          label: "Ten, tá, to.",
          whyWrong:
            "**Ten, tá, to** was the first episode. Today Anna names **môj, tvoj, jeho, jej**.",
        },
        {
          id: "weather",
          label: "Počasie.",
          whyWrong:
            "**Počasie** is the weather. An umbrella turns up, but the topic is **môj, tvoj, jeho, jej**.",
        },
      ],
      answerId: "possessives",
      feedback: {
        english: "Today's topic is: môj, tvoj, jeho, jej. And svoj.",
        why: "Anna says: **Dnešná téma je: môj, tvoj, jeho, jej.**",
      },
    },
    {
      id: `${PREFIX}check-annas-umbrella`,
      prompt: "Kde je Annin dáždnik?",
      promptEnglish: "Where is Anna's umbrella?",
      replayLineId: `${PREFIX}anna-not-mine`,
      choices: [
        { id: "home", label: "Doma." },
        {
          id: "studio",
          label: "V štúdiu.",
          whyWrong:
            "**V štúdiu** means in the studio. The umbrella in the studio is not hers: **môj nie**.",
        },
        {
          id: "marek",
          label: "Má ho Marek.",
          whyWrong:
            "**Má ho Marek** means Marek has it. Marek holds an umbrella, but Anna says **môj dáždnik je doma**.",
        },
      ],
      answerId: "home",
      feedback: {
        english: "Not mine. My umbrella is at home.",
        why: "Anna says **môj dáždnik je doma**: **dáždnik** is masculine, so **môj**.",
      },
    },
  ],
};

/** Turns the screen to Anna with the photo on it, and she leans in to see it. */
function showPhoto(picture: StickPictureId): Cue[] {
  return [
    { do: "show", what: "phone", to: "anna", picture, on: "fotka", keep: true },
    { who: "anna", do: "lean", to: "marek", on: "fotka" },
  ];
}

/** The same photo again on each line they talk about it, so it is up after a jump to that line, and Anna still leaning in to see it. */
function stillShowing(picture: StickPictureId): Cue[] {
  return [
    {
      who: "marek",
      do: "show",
      what: "phone",
      to: "anna",
      picture,
      on: "start",
      keep: true,
    },
    { who: "anna", do: "lean", to: "marek", on: "start" },
  ];
}

const PHOTOS_ACTS: Record<string, Cue[]> = {
  "anna-back-weekend-photos": [
    { who: "marek", do: "take", what: "phone", on: "before" },
    { who: "marek", do: "look", to: "phone", on: "before" },
    { who: "anna", do: "look", to: "phone", on: "fotky" },
  ],
  "marek-photos-in-phone": [
    { do: "raise", what: "phone", on: "vidieť" },
    { who: "anna", do: "lean", to: "marek", on: "chceš" },
  ],
  "anna-show-me": [{ do: "nod", on: "ukáž" }],
  // He holds each photo out to her, and puts the phone away only once they are done with them.
  "marek-first-photo": showPhoto("photo-man-dog"),
  "anna-your-brother": stillShowing("photo-man-dog"),
  "marek-my-friend-peter": stillShowing("photo-man-dog"),
  "anna-his-dog": stillShowing("photo-man-dog"),
  "marek-dog-called-dunco": stillShowing("photo-man-dog"),
  "anna-dog-big-second": stillShowing("photo-man-dog"),
  "marek-house-and-car": showPhoto("photo-house"),
  "anna-your-house": stillShowing("photo-house"),
  "marek-parents-house": stillShowing("photo-house"),
  "anna-their-car": stillShowing("photo-house"),
  "marek-my-car": stillShowing("photo-house"),
  "anna-your-car-old": stillShowing("photo-house"),
  // "Staré, ale moje!" is still about the car, so the house stays up until the third photo.
  "marek-old-but-mine": [
    ...stillShowing("photo-house"),
    ...showPhoto("photo-mother-girl"),
  ],
  "anna-your-sister": stillShowing("photo-mother-girl"),
  "marek-sister-zuzana": stillShowing("photo-mother-girl"),
  "anna-her-daughter-age": stillShowing("photo-mother-girl"),
  "marek-five-years": stillShowing("photo-mother-girl"),
  "anna-five-lovely-family": [
    { who: "marek", do: "pocket", what: "phone", on: "rodina" },
  ],
};

const photos: ListeningChapter = {
  id: `${PREFIX}photos`,
  titleSk: "Kto je to?",
  title: "Marek's photos",
  // Each place keeps its own set, so the studio still has the umbrella Marek gave back on the square.
  setup: {
    state: { umbrella: { where: { pocket: "lucia" } } },
    objects: [{ id: "phone", kind: "phone", start: { where: { pocket: "marek" } } }],
  },
  lines: staged(
    PREFIX,
    [
      line(
        "anna-back-weekend-photos",
        "Anna",
        [
          "Sme späť v štúdiu. ",
          PAUSE,
          "Marek, čo si to tam pozeráš? Fotky od rodičov z víkendu?",
        ],
        "We're back in the studio. Marek, what are you looking at? Photos from your parents' place at the weekend?",
      ),
      line(
        "marek-photos-in-phone",
        "Marek",
        ["Áno. Chceš ich vidieť?"],
        "Yes. Want to see them?",
      ),
      line("anna-show-me", "Anna", ["Ukáž, ukáž!"], "Show me, show me!"),
      line(
        "marek-first-photo",
        "Marek",
        ["Prvá fotka. ", PAUSE, "Hádaj: kto je ten muž?"],
        "First photo. Guess: who is that man?",
      ),
      line(
        "anna-your-brother",
        "Anna",
        ["Hm… ", PAUSE, "Je to ", mark("tvoj"), " brat?"],
        "Hmm… is it your brother?",
      ),
      line(
        "marek-my-friend-peter",
        "Marek",
        [
          "Nie, to nie je ",
          mark("môj"),
          " brat. ",
          PAUSE,
          "To je ",
          mark("môj"),
          " kamarát Peter.",
        ],
        "No, that's not my brother. That's my friend Peter.",
      ),
      line(
        "anna-his-dog",
        "Anna",
        ["Aha. A ten pes? To je ", mark("jeho"), " pes?"],
        "I see. And that dog? Is it his dog?",
      ),
      line(
        "marek-dog-called-dunco",
        "Marek",
        ["Áno, to je ", mark("jeho"), " pes. Volá sa Dunčo."],
        "Yes, that's his dog. He's called Dunčo.",
      ),
      line(
        "anna-dog-big-second",
        "Anna",
        [mark("Jeho"), " pes je veľký! A druhá fotka?"],
        "His dog is big! And the second photo?",
      ),
      line(
        "marek-house-and-car",
        "Marek",
        ["Druhá fotka: dom a auto."],
        "Second photo: a house and a car.",
      ),
      line("anna-your-house", "Anna", ["A čí je ten dom?"], "And whose house is that?"),
      line(
        "marek-parents-house",
        "Marek",
        [
          "To je dom ",
          mark("mojich"),
          " rodičov. ",
          PAUSE,
          mark("Ich"),
          " dom je pri lese.",
        ],
        "That's my parents' house. Their house is by the forest.",
      ),
      line(
        "anna-their-car",
        "Anna",
        ["A to auto? To je ", mark("ich"), " auto?"],
        "And that car? Is it their car?",
      ),
      line(
        "marek-my-car",
        "Marek",
        ["Nie, to je ", mark("moje"), " auto. ", mark("Ich"), " auto je červené."],
        "No, that's my car. Their car is red.",
      ),
      line(
        "anna-your-car-old",
        "Anna",
        [mark("Tvoje"), " auto je staré, Marek."],
        "Your car is old, Marek.",
      ),
      line(
        "marek-old-but-mine",
        "Marek",
        ["Staré, ale ", mark("moje"), "! ", PAUSE, "A tretia fotka: žena a dievča."],
        "Old, but mine! And the third photo: a woman and a girl.",
      ),
      line(
        "anna-your-sister",
        "Anna",
        ["Hm… ", PAUSE, "To je ", mark("tvoja"), " sestra?"],
        "Hmm… is that your sister?",
      ),
      line(
        "marek-sister-zuzana",
        "Marek",
        [
          "Presne tak! To je ",
          mark("moja"),
          " sestra Zuzana. ",
          PAUSE,
          "A to je ",
          mark("jej"),
          " dcéra Ema.",
        ],
        "Exactly! That's my sister Zuzana. And that's her daughter Ema.",
      ),
      line(
        "anna-her-daughter-age",
        "Anna",
        [mark("Jej"), " dcéra je milá. Koľko má rokov?"],
        "Her daughter is sweet. How old is she?",
      ),
      line("marek-five-years", "Marek", ["Má päť rokov."], "She's five."),
      line(
        "anna-five-lovely-family",
        "Anna",
        ["Päť rokov! ", PAUSE, "Krásna rodina, Marek."],
        "Five! A lovely family, Marek.",
      ),
    ],
    PHOTOS_ACTS,
  ),
  checks: [
    {
      id: `${PREFIX}check-who-is-peter`,
      prompt: "Kto je Peter?",
      promptEnglish: "Who is Peter?",
      replayLineId: `${PREFIX}marek-my-friend-peter`,
      choices: [
        { id: "friend", label: "Marekov kamarát." },
        {
          id: "brother",
          label: "Marekov brat.",
          whyWrong:
            "**Marekov brat** is Marek's brother. Anna guesses that, and Marek says **nie**.",
        },
        {
          id: "neighbour",
          label: "Marekov sused.",
          whyWrong:
            "**Marekov sused** is Marek's neighbour. Marek says **môj kamarát Peter**.",
        },
      ],
      answerId: "friend",
      feedback: {
        english: "No, that's not my brother. That's my friend Peter.",
        why: "Marek says **to je môj kamarát Peter**: **kamarát** is masculine, so **môj**.",
      },
    },
    {
      id: `${PREFIX}check-car-form`,
      gap: "Nie, to je ___ auto.",
      prompt: "Ktoré slovo povedal Marek?",
      promptEnglish: "Which word did Marek say?",
      replayLineId: `${PREFIX}marek-my-car`,
      choices: [
        { id: "moje", label: "moje" },
        {
          id: "moj",
          label: "môj",
          whyWrong: "**Môj** goes with masculine nouns: **môj brat**, **môj dom**.",
        },
        {
          id: "moja",
          label: "moja",
          whyWrong: "**Moja** goes with feminine nouns: **moja sestra**.",
        },
      ],
      answerId: "moje",
      feedback: {
        english: "No, that's my car.",
        why: "**Auto** is neuter, so **moje auto**. The owner is a man, but the word follows the noun.",
      },
    },
    {
      id: `${PREFIX}check-red-car`,
      prompt: "Čie auto je červené?",
      promptEnglish: "Whose car is red?",
      replayLineId: `${PREFIX}marek-my-car`,
      choices: [
        { id: "parents", label: "Auto Marekových rodičov." },
        {
          id: "marek",
          label: "Marekovo auto.",
          whyWrong:
            "**Marekovo auto** is Marek's car, the old one. He says **ich auto je červené**.",
        },
        {
          id: "peter",
          label: "Petrovo auto.",
          whyWrong:
            "**Petrovo auto** is Peter's car. Peter is on the first photo with his dog, not with a car.",
        },
      ],
      answerId: "parents",
      feedback: {
        english: "Their car is red.",
        why: "Marek says **ich auto je červené**, and **ich** points at **mojich rodičov**, his parents.",
      },
    },
  ],
};

const SCHOOL_ACTS: Record<string, Cue[]> = {
  "marek-students-left-umbrella": [
    { do: "raise", what: "umbrella", on: "dáždnik" },
    { do: "give", what: "umbrella", to: "maria", on: "náš" },
  ],
  // She holds it up to read the name on the handle, and lays it on the counter while she sees to them.
  "maria-name-lucia": [
    { do: "raise", what: "umbrella", on: "pozriem" },
    { do: "put", what: "umbrella", to: "counter", dx: 16, on: "študentka" },
  ],
  "anna-square-thanks": [{ who: "marek", do: "nod", on: "ďakujeme" }],
  // The students' sentences for the quiz, a sheet from the desk: Marek reads them out in the studio.
  "maria-sentences-for-podcast": [
    { do: "take", what: "sentences", on: "niečo" },
    { do: "give", what: "sentences", to: "marek", on: "vety" },
  ],
  "anna-a-test-for-listeners": [
    { who: "marek", do: "put", what: "sentences", to: "bag", on: "skúška" },
  ],
  // The umbrella back to them, for Lucia.
  "maria-youre-welcome": [
    { do: "take", what: "umbrella", on: "prosím" },
    { do: "give", what: "umbrella", to: "marek", on: "dovidenia" },
  ],
};

const school: ListeningChapter = {
  id: `${PREFIX}school`,
  stage: "registration",
  titleSk: "Je váš?",
  title: "At the language school: is it yours?",
  setup: {
    objects: [
      {
        id: "umbrella",
        kind: "umbrella",
        start: { where: { hand: "marek", side: "lead" } },
      },
      // His keys are in it, for the square.
      { id: "bag", kind: "bag", start: { where: { hand: "marek", side: "rear" } } },
      {
        id: "sentences",
        kind: "clipboard",
        start: { where: { on: "counter", dx: -14 }, look: "sheet" },
      },
    ],
  },
  lines: staged(
    PREFIX,
    [
      line(
        "anna-now-at-school",
        "Anna",
        ["Teraz sme v jazykovej škole, na registrácii."],
        "Now we're at the language school, at the registration desk.",
      ),
      line("marek-good-day", "Marek", ["Dobrý deň!"], "Good day!", { to: "Mária" }),
      line(
        "maria-how-can-i-help",
        "Mária",
        ["Dobrý deň. Ako vám môžem pomôcť?"],
        "Good day. How can I help you?",
      ),
      line(
        "marek-students-left-umbrella",
        "Marek",
        [
          "Včera boli u nás v štúdiu ",
          mark("vaši"),
          " študenti. ",
          PAUSE,
          "A niekto tam nechal tento dáždnik. Nie je ",
          mark("náš"),
          ".",
        ],
        "Yesterday your students were at our studio. And someone left this umbrella there. It isn't ours.",
      ),
      line(
        "maria-name-lucia",
        "Mária",
        [
          "Moment, pozriem sa. ",
          PAUSE,
          "Áno! Tu je meno: Lucia. ",
          PAUSE,
          "Lucia je ",
          mark("naša"),
          " študentka.",
        ],
        "One moment, let me look. Yes! There's a name here: Lucia. Lucia is our student.",
      ),
      line(
        "marek-where-find-her",
        "Marek",
        ["Aha, Lucia! Tú poznáme. A kde ju nájdeme?"],
        "Oh, Lucia! We know her. And where can we find her?",
      ),
      line(
        "maria-course-tomorrow",
        "Mária",
        [
          "Dnes tu nie je. ",
          mark("Jej"),
          " kurz je zajtra o deviatej. ",
          PAUSE,
          "Ale často sedáva v kaviarni na námestí.",
        ],
        "She's not here today. Her course is tomorrow at nine. But she often sits in the café on the square.",
      ),
      line(
        "anna-square-thanks",
        "Anna",
        ["Na námestí? ", PAUSE, "Super, ďakujeme!"],
        "On the square? Great, thank you!",
        { gestures: ["ask", "nod"] },
      ),
      line(
        "maria-sentences-for-podcast",
        "Mária",
        [
          "A ešte niečo pre ",
          mark("váš"),
          " podcast: ",
          PAUSE,
          "vety od ",
          mark("našich"),
          " študentov. ",
          PAUSE,
          "Sú v nich chyby!",
        ],
        "And something else for your podcast: sentences from our students. They have mistakes in them!",
      ),
      line(
        "anna-a-test-for-listeners",
        "Anna",
        [
          "Chyby? ",
          PAUSE,
          "Výborne, to bude malá skúška pre ",
          mark("našich"),
          " poslucháčov. Ďakujeme!",
        ],
        "Mistakes? Great, that'll be a little test for our listeners. Thank you!",
        { gestures: ["ask", "chuckle", "nod"] },
      ),
      line(
        "maria-youre-welcome",
        "Mária",
        ["Prosím. Dovidenia!"],
        "You're welcome. Goodbye!",
      ),
      line("marek-goodbye", "Marek", ["Dovidenia!"], "Goodbye!"),
      line(
        "anna-goodbye-to-square",
        "Anna",
        ["Dovidenia! ", PAUSE, "A teraz poďme na námestie."],
        "Goodbye! And now let's go to the square.",
      ),
    ],
    SCHOOL_ACTS,
  ),
  checks: [
    {
      id: `${PREFIX}check-whose-umbrella`,
      prompt: "Čí je ten dáždnik?",
      promptEnglish: "Whose umbrella is it?",
      replayLineId: `${PREFIX}maria-name-lucia`,
      choices: [
        { id: "lucia", label: "Lucie, študentky." },
        {
          id: "maria",
          label: "Márie.",
          whyWrong: "**Márie** means Mária's. She only reads the name on it: **Lucia**.",
        },
        {
          id: "marek",
          label: "Marekov.",
          whyWrong: "**Marekov** means Marek's. He says **nie je náš**: it isn't ours.",
        },
      ],
      answerId: "lucia",
      feedback: {
        english: "There's a name here: Lucia. Lucia is our student.",
        why: "Mária reads the name and says **Lucia je naša študentka**.",
      },
    },
    {
      id: `${PREFIX}check-vasi-form`,
      gap: "Včera boli u nás v štúdiu ___ študenti.",
      prompt: "Ktoré slovo povedal Marek pani Márii?",
      promptEnglish: "Which word did Marek say to Mária?",
      replayLineId: `${PREFIX}marek-students-left-umbrella`,
      choices: [
        { id: "vasi", label: "vaši" },
        {
          id: "tvoji",
          label: "tvoji",
          whyWrong:
            "**Tvoji** is for someone you call **ty**, a friend. Marek says **dobrý deň** to Mária and keeps to **vy**.",
        },
        {
          id: "nasi",
          label: "naši",
          whyWrong:
            "**Naši študenti** would be the studio's own students. They came from Mária's school: **vaši študenti**.",
        },
      ],
      answerId: "vasi",
      feedback: {
        english: "Yesterday your students were at our studio.",
        why: "Marek speaks to Mária formally, so **vaši**, like **vy**. **Študenti** are men or a mixed group, so **vaši**, not **vaše**.",
      },
    },
    {
      id: `${PREFIX}check-course-when`,
      prompt: "Kedy má Lucia kurz?",
      promptEnglish: "When is Lucia's course?",
      replayLineId: `${PREFIX}maria-course-tomorrow`,
      choices: [
        { id: "tomorrow-nine", label: "Zajtra o deviatej." },
        {
          id: "today",
          label: "Dnes.",
          whyWrong:
            "**Dnes** is today. Mária says **dnes tu nie je**, she is not here today.",
        },
        {
          id: "tomorrow-five",
          label: "Zajtra o piatej.",
          whyWrong: "**O piatej** is at five. Mária says **o deviatej**, at nine.",
        },
      ],
      answerId: "tomorrow-nine",
      feedback: {
        english: "Her course is tomorrow at nine.",
        why: "Mária says **jej kurz je zajtra o deviatej**. **Jej** never changes.",
      },
    },
  ],
};

const SQUARE_ACTS: Record<string, Cue[]> = {
  // She is at the café, as Mária said, and comes over when Anna spots her.
  "anna-now-on-square": [
    { who: "marek", do: "look", to: "lucia", on: "pozri" },
    { do: "point", to: "lucia", on: "lucia" },
    { who: "lucia", do: "go", to: "marek", on: "lucia" },
  ],
  "marek-blue-umbrella": [{ do: "raise", what: "umbrella", on: "tento" }],
  "marek-is-it-yours-lucia": [{ do: "give", what: "umbrella", to: "lucia", on: "páči" }],
  "lucia-mine": [{ do: "nod", on: "ďakujem" }],
  "marek-you-looked-i-look": [{ do: "pat", on: "kľúče" }],
  "marek-in-my-bag": [
    { do: "take", what: "keys", on: "taške" },
    { do: "raise", what: "keys", on: "sú" },
  ],
  "lucia-marek-and-his-keys": [
    { who: "marek", do: "pocket", what: "keys", on: "ďakujem" },
    { do: "laugh", on: "kľúče" },
    { do: "wave", on: "majte" },
  ],
  // She turns to go as Anna waves her off.
  "anna-back-to-studio": [
    { do: "wave", on: "maj" },
    { who: "lucia", do: "leave", to: "right", on: "lucia" },
  ],
};

const square: ListeningChapter = {
  id: `${PREFIX}square`,
  stage: "plaza",
  titleSk: "Hľadám svoj dáždnik",
  title: "On the square: Lucia is looking for her umbrella",
  setup: {
    objects: [
      {
        id: "umbrella",
        kind: "umbrella",
        start: { where: { hand: "marek", side: "lead" } },
      },
      // His keys are in his bag, as Anna says, with Mária's sheet: he carries it in his other hand.
      { id: "bag", kind: "bag", start: { where: { hand: "marek", side: "rear" } } },
      { id: "keys", kind: "keys", start: { where: { in: "bag" } } },
      {
        id: "sentences",
        kind: "clipboard",
        start: { where: { in: "bag" }, look: "sheet" },
      },
    ],
    spots: { lucia: "cafe" },
  },
  lines: staged(
    PREFIX,
    [
      line(
        "anna-now-on-square",
        "Anna",
        ["Teraz sme na námestí. ", PAUSE, "Marek, pozri, tam je Lucia!"],
        "Now we're on the square. Marek, look, there's Lucia!",
      ),
      line("lucia-hello", "Lucia", ["Ahoj, Anna! Ahoj, Marek!"], "Hi, Anna! Hi, Marek!"),
      line(
        "marek-looking-for-you",
        "Marek",
        ["Ahoj, Lucia! Hľadáme ťa."],
        "Hi, Lucia! We're looking for you.",
      ),
      line(
        "lucia-looking-for-umbrella",
        "Lucia",
        [
          "Mňa? ",
          PAUSE,
          "Ja hľadám ",
          mark("svoj"),
          " dáždnik. ",
          PAUSE,
          "Včera som ho ešte mala.",
        ],
        "Me? I'm looking for my umbrella. I still had it yesterday.",
      ),
      line(
        "marek-blue-umbrella",
        "Marek",
        ["Tento modrý dáždnik?"],
        "This blue umbrella?",
      ),
      line(
        "lucia-yes-blue",
        "Lucia",
        ["Áno! Je na ňom ", mark("moje"), " meno."],
        "Yes! My name is on it.",
      ),
      line(
        "marek-is-it-yours-lucia",
        "Marek",
        ["Tak je to ", mark("tvoj"), " dáždnik. ", PAUSE, "Nech sa páči!"],
        "So it's your umbrella. Here you are!",
      ),
      line(
        "lucia-mine",
        "Lucia",
        [mark("Môj"), "! To je ", mark("môj"), " dáždnik! Ďakujem!"],
        "Mine! That's my umbrella! Thank you!",
      ),
      line(
        "anna-it-was-in-studio",
        "Anna",
        ["Bol v ", mark("našom"), " štúdiu."],
        "It was in our studio.",
      ),
      line(
        "lucia-in-your-studio",
        "Lucia",
        ["Vo ", mark("vašom"), " štúdiu? Aha, áno. Prepáčte!"],
        "In your studio? Oh, yes. Sorry!",
      ),
      line(
        "marek-you-looked-i-look",
        "Marek",
        [
          "Nič sa nestalo. ",
          PAUSE,
          "Ty si hľadala ",
          mark("svoj"),
          " dáždnik",
          STOP,
          PAUSE,
          "a ja teraz hľadám ",
          mark("svoje"),
          " kľúče!",
        ],
        "No harm done. You were looking for your umbrella… and now I'm looking for my keys!",
      ),
      line(
        "anna-keys-in-bag",
        "Anna",
        [SIGH, "Zase? ", PAUSE, "Kľúče máš v taške, Marek."],
        "Again? Your keys are in your bag, Marek.",
      ),
      line(
        "marek-in-my-bag",
        "Marek",
        ["V ", mark("mojej"), " taške… ", PAUSE, "Áno! Tu sú."],
        "In my bag… Yes! Here they are.",
      ),
      line(
        "lucia-marek-and-his-keys",
        "Lucia",
        [
          CHUCKLE,
          "Marek a ",
          mark("jeho"),
          " kľúče! ",
          PAUSE,
          "Ďakujem ešte raz. Majte sa!",
        ],
        "Marek and his keys! Thanks again. Take care!",
      ),
      line(
        "anna-back-to-studio",
        "Anna",
        ["Maj sa, Lucia! ", PAUSE, "Poďme späť do štúdia."],
        "Take care, Lucia! Let's go back to the studio.",
      ),
    ],
    SQUARE_ACTS,
  ),
  checks: [
    {
      id: `${PREFIX}check-lucia-looks-for`,
      prompt: "Čo hľadá Lucia?",
      promptEnglish: "What is Lucia looking for?",
      replayLineId: `${PREFIX}lucia-looking-for-umbrella`,
      choices: [
        { id: "umbrella", label: "Svoj dáždnik." },
        {
          id: "keys",
          label: "Svoje kľúče.",
          whyWrong:
            "**Svoje kľúče** are her own keys. It is Marek who looks for keys, again.",
        },
        {
          id: "bag",
          label: "Svoju tašku.",
          whyWrong: "**Svoju tašku** is her own bag. Lucia says **hľadám svoj dáždnik**.",
        },
      ],
      answerId: "umbrella",
      feedback: {
        english: "I'm looking for my umbrella.",
        why: "Lucia says **hľadám svoj dáždnik**: she is the subject and the owner, so **svoj**.",
      },
    },
    {
      id: `${PREFIX}check-svoj-form`,
      gap: "Ty si hľadala ___ dáždnik.",
      prompt: "Ktoré slovo povedal Marek?",
      promptEnglish: "Which word did Marek say?",
      replayLineId: `${PREFIX}marek-you-looked-i-look`,
      choices: [
        { id: "svoj", label: "svoj" },
        {
          id: "jej",
          label: "jej",
          whyWrong:
            "**Jej dáždnik** would be another woman's umbrella. Lucia looked for her own, so **svoj**.",
        },
        {
          id: "moj",
          label: "môj",
          whyWrong: "**Môj** would be Marek's own umbrella. He is talking about Lucia's.",
        },
      ],
      answerId: "svoj",
      feedback: {
        english: "You were looking for your umbrella.",
        why: "Lucia did the looking and owns the umbrella: **svoj**. Marek says the same about himself: **svoje kľúče**.",
      },
    },
    {
      id: `${PREFIX}check-where-keys`,
      prompt: "Kde sú Marekove kľúče?",
      promptEnglish: "Where are Marek's keys?",
      replayLineId: `${PREFIX}marek-in-my-bag`,
      choices: [
        { id: "bag", label: "V jeho taške." },
        {
          id: "studio",
          label: "V štúdiu.",
          whyWrong:
            "**V štúdiu** means in the studio. Marek finds them **v mojej taške**, in his bag.",
        },
        {
          id: "lucia",
          label: "Má ich Lucia.",
          whyWrong:
            "**Má ich Lucia** means Lucia has them. Lucia has her umbrella; the keys are in Marek's bag.",
        },
      ],
      answerId: "bag",
      feedback: {
        english: "In my bag… Yes! Here they are.",
        why: "Marek says **v mojej taške**. After **v**, **moja** becomes **mojej**, like **v tej taške**.",
      },
    },
  ],
};

const QUIZ_ACTS: Record<string, Cue[]> = {
  "anna-now-a-test": [{ do: "nod", on: "skúška" }],
  // He reads each sentence off Mária's sheet, held up over the desk, and lays it down when they are done.
  "marek-sentence-cinema": [
    { do: "raise", what: "sentences", on: "start" },
    { do: "look", to: "sentences", on: "start" },
  ],
  "marek-sentence-moja-brat": [
    { do: "raise", what: "sentences", on: "start" },
    { do: "look", to: "sentences", on: "start" },
  ],
  "marek-sentence-svoj-brat": [
    { do: "raise", what: "sentences", on: "start" },
    { do: "look", to: "sentences", on: "start" },
  ],
  "marek-students-do-this": [{ do: "shrug", on: "veľa" }],
  "marek-sentence-ich-auto": [
    { do: "raise", what: "sentences", on: "start" },
    { do: "look", to: "sentences", on: "start" },
  ],
  "marek-better-than-students": [
    { do: "put", what: "sentences", to: "desk", dx: 30, on: "študenti" },
  ],
};

const quiz: ListeningChapter = {
  id: `${PREFIX}quiz`,
  titleSk: "Správne alebo nesprávne?",
  title: "Your game: right or wrong?",
  setup: {
    // The sheet Mária gave them at the school.
    objects: [
      {
        id: "sentences",
        kind: "clipboard",
        start: { where: { hand: "marek", side: "rear" }, look: "sheet" },
      },
    ],
  },
  lines: staged(
    PREFIX,
    [
      {
        ...line(
          "anna-now-a-test",
          "Anna",
          ["No a teraz malá skúška."],
          "And now a little test.",
        ),
        wait: BEAT_MS,
      },
      line("marek-for-me", "Marek", ["Pre mňa?"], "For me?"),
      line(
        "anna-for-listeners-sentences",
        "Anna",
        [
          CHUCKLE,
          "Nie, pre ",
          mark("našich"),
          " poslucháčov. ",
          PAUSE,
          "Pani Mária nám v škole dala vety od ",
          mark("svojich"),
          " študentov.",
        ],
        "No, for our listeners. At the school, Mária gave us sentences from her students.",
      ),
      line(
        "anna-the-rules",
        "Anna",
        ["Marek povie vetu a vy hádajte: je správna, alebo nesprávna?"],
        "Marek says a sentence and you guess: is it right, or wrong?",
      ),
      rightOrWrong(
        line(
          "marek-sentence-cinema",
          "Marek",
          [
            "Tak dobre",
            STOP,
            PAUSE,
            "Prvá veta: ",
            PAUSE,
            "Idem do kina so ",
            mark("svojou"),
            " sestrou.",
          ],
          "All right then… First sentence: I'm going to the cinema with my sister.",
        ),
        "right",
        "Idem do kina so svojou sestrou.",
      ),
      afterThinking(
        line(
          "anna-svojou-right",
          "Anna",
          [
            "Správne! ",
            PAUSE,
            "Ja idem a sestra je ",
            mark("moja"),
            ", takže: so ",
            mark("svojou"),
            " sestrou.",
          ],
          "Right! I'm going and the sister is mine, so: so svojou sestrou.",
        ),
      ),
      line("marek-good-student", "Marek", ["Dobrý študent!"], "Good student!"),
      line(
        "anna-we-will-see",
        "Anna",
        [CHUCKLE, "Uvidíme. ", PAUSE, "Ďalšia?"],
        "We'll see. Next one?",
      ),
      rightOrWrong(
        line(
          "marek-sentence-moja-brat",
          "Marek",
          ["Druhá veta: ", PAUSE, "Moja brat je učiteľ."],
          "Second sentence: My brother is a teacher.",
        ),
        "wrong",
        "Moja brat je učiteľ.",
      ),
      afterThinking(
        line(
          "anna-brat-masculine",
          "Anna",
          ["Nesprávne! ", PAUSE, "Brat je mužský rod: ", mark("môj"), " brat."],
          "Wrong! Brat is masculine: môj brat.",
        ),
      ),
      line(
        "marek-poor-student",
        "Marek",
        ["Ajaj, chudák študent."],
        "Oh dear, poor student.",
      ),
      line(
        "anna-still-learning",
        "Anna",
        [CHUCKLE, "Nevadí, ešte sa učí."],
        "Never mind, they're still learning.",
      ),
      rightOrWrong(
        line(
          "marek-sentence-svoj-brat",
          "Marek",
          ["Tretia veta: ", PAUSE, "Svoj brat je učiteľ."],
          "Third sentence: My brother is a teacher.",
        ),
        "wrong",
        "Svoj brat je učiteľ.",
      ),
      afterThinking(
        line(
          "anna-svoj-not-in-subject",
          "Anna",
          [
            "Nesprávne! ",
            PAUSE,
            "Brat je tu podmet a ",
            mark("svoj"),
            " nemôže byť v podmete. ",
            PAUSE,
            "Správne je: ",
            mark("môj"),
            " brat je učiteľ.",
          ],
          "Wrong! Brat is the subject here, and svoj can't be in the subject. The right one is: môj brat je učiteľ.",
        ),
      ),
      line(
        "marek-students-do-this",
        "Marek",
        ["Túto chybu robí veľa študentov."],
        "Lots of students make this mistake.",
      ),
      line(
        "anna-it-is-hard",
        "Anna",
        ["Áno, je to ťažké. ", PAUSE, "A posledná veta?"],
        "Yes, it's hard. And the last sentence?",
      ),
      rightOrWrong(
        line(
          "marek-sentence-ich-auto",
          "Marek",
          ["Štvrtá veta: ", PAUSE, mark("Ich"), " auto je červené."],
          "Fourth sentence: Their car is red.",
        ),
        "right",
        "Ich auto je červené.",
      ),
      afterThinking(
        line(
          "anna-ich-never-changes",
          "Anna",
          [
            "Správne! ",
            PAUSE,
            mark("Jeho"),
            ", ",
            mark("jej"),
            ", ",
            mark("ich"),
            " sa nemenia: ",
            mark("ich"),
            " brat, ",
            mark("ich"),
            " sestra, ",
            mark("ich"),
            " auto.",
          ],
          "Right! Jeho, jej, ich don't change: ich brat, ich sestra, ich auto.",
        ),
      ),
      line(
        "marek-thats-easy",
        "Marek",
        [mark("Jeho"), ", ", mark("jej"), ", ", mark("ich"), ". ", PAUSE, "To je ľahké!"],
        "Jeho, jej, ich. That's easy!",
      ),
      line(
        "anna-for-you-and-you",
        "Anna",
        [CHUCKLE, "Pre teba áno! ", PAUSE, "A vy? Koľko ste mali správne?"],
        "For you, yes! And you? How many did you get right?",
      ),
      afterThinking(
        line(
          "marek-better-than-students",
          "Marek",
          ["Ak všetky štyri, tak ste lepší ako študenti pani Márie!"],
          "If all four, you're better than Mária's students!",
        ),
      ),
    ],
    QUIZ_ACTS,
  ),
  checks: [
    {
      id: `${PREFIX}check-wrong-sentence`,
      prompt: "Ktorá veta je podľa Anny nesprávna?",
      promptEnglish: "Which sentence does Anna call wrong?",
      choices: [
        { id: "svoj-brat", label: "Svoj brat je učiteľ." },
        {
          id: "kino",
          label: "Idem do kina so svojou sestrou.",
          whyWrong: "Anna says **správne**: the one going is the owner, so **svojou**.",
        },
        {
          id: "ich-auto",
          label: "Ich auto je červené.",
          whyWrong: "Anna says **správne**: **ich** never changes.",
        },
      ],
      answerId: "svoj-brat",
      feedback: {
        english:
          "Brat is the subject here, and svoj can't be in the subject. The right one is: môj brat je učiteľ.",
        why: "**Svoj** can't be part of the subject. The brother is the subject, so it is **môj brat**.",
      },
    },
    {
      id: `${PREFIX}check-ich-form`,
      gap: "___ auto je červené.",
      prompt: "Ktoré slovo povedal Marek?",
      promptEnglish: "Which word did Marek say?",
      replayLineId: `${PREFIX}marek-sentence-ich-auto`,
      choices: [
        { id: "ich", label: "Ich" },
        {
          id: "jejich",
          label: "Jejich",
          whyWrong: "**Jejich** is Czech. Slovak says **ich**.",
        },
        {
          id: "jej",
          label: "Jej",
          whyWrong:
            "**Jej** is her. The car belongs to two people, Marek's parents: **ich**.",
        },
      ],
      answerId: "ich",
      feedback: {
        english: "Their car is red.",
        why: "**Ich** is their, and it never changes: **ich auto**, **ich dom**.",
      },
    },
  ],
};

const OUTRO_ACTS: Record<string, Cue[]> = {
  "marek-here-take-mine": [
    { do: "take", what: "marek-umbrella", on: "páči" },
    { do: "put", what: "marek-umbrella", to: "desk", dx: 38, on: "máš" },
    { do: "slide", what: "marek-umbrella", to: "desk", dx: -38 },
  ],
  "anna-raining-umbrella-home": [
    { do: "look", to: "dvere", on: "vonku" },
    { do: "point", to: "dvere", on: "prší" },
  ],
  "anna-yours-is-small": [{ do: "take", what: "marek-umbrella", on: "ďakujem" }],
  "anna-now-mine": [{ do: "raise", what: "marek-umbrella", on: "môj" }],
  "marek-only-till-tomorrow": [
    { do: "point", to: "marek-umbrella", on: "zajtra" },
    { who: "anna", do: "stand", on: "after" },
    { who: "anna", do: "leave", to: "door", on: "after" },
  ],
};

const outro: ListeningChapter = {
  id: `${PREFIX}outro`,
  titleSk: "Záver",
  title: "It's raining",
  setup: {
    // A small folding one, from his pocket: "Tvoj dáždnik je naozaj malý."
    objects: [
      {
        id: "marek-umbrella",
        kind: "umbrella",
        start: { where: { pocket: "marek" }, look: "small" },
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
        "anna-thanks-for-listening",
        "Anna",
        ["Ďakujeme, že počúvate. Majte sa pekne!"],
        "Thank you for listening. Take care!",
      ),
      line("marek-bye", "Marek", ["Ahojte!"], "Bye!"),
      line(
        "anna-raining-umbrella-home",
        "Anna",
        ["Marek, vonku prší! ", PAUSE, SIGH, "A ", mark("môj"), " dáždnik je doma."],
        "Marek, it's raining outside! And my umbrella is at home.",
      ),
      line(
        "marek-you-said-so",
        "Marek",
        [CHUCKLE, "Ja viem. ", PAUSE, "Povedala si to na začiatku."],
        "I know. You said so at the start.",
      ),
      line(
        "marek-here-take-mine",
        "Marek",
        ["Nech sa páči, tu máš ", mark("môj"), "."],
        "Here you are, take mine.",
      ),
      line(
        "anna-yours-is-small",
        "Anna",
        ["Ďakujem! ", PAUSE, mark("Tvoj"), " dáždnik je naozaj malý."],
        "Thanks! Your umbrella is really small.",
      ),
      line(
        "marek-small-but-mine",
        "Marek",
        ["Malý, ale ", mark("môj"), "!"],
        "Small, but mine!",
      ),
      {
        ...line(
          "anna-now-mine",
          "Anna",
          [CHUCKLE, "Malý, ale teraz ", mark("môj"), "!"],
          "Small, but mine now!",
        ),
        wait: BEAT_MS,
      },
      line(
        "marek-only-till-tomorrow",
        "Marek",
        ["Ej! ", PAUSE, "Len do zajtra!"],
        "Hey! Only till tomorrow!",
      ),
    ],
    OUTRO_ACTS,
  ),
  checks: [
    {
      id: `${PREFIX}check-whose-umbrella-end`,
      prompt: "Čí dáždnik má Anna na konci?",
      promptEnglish: "Whose umbrella does Anna have at the end?",
      replayLineId: `${PREFIX}marek-here-take-mine`,
      choices: [
        { id: "marek", label: "Marekov." },
        {
          id: "own",
          label: "Svoj.",
          whyWrong:
            "**Svoj** would be her own. Hers is at home: **môj dáždnik je doma**.",
        },
        {
          id: "lucia",
          label: "Luciin.",
          whyWrong: "**Luciin** means Lucia's. Lucia took hers home from the square.",
        },
      ],
      answerId: "marek",
      feedback: {
        english: "Here you are, take mine.",
        why: "Marek says **tu máš môj**: **môj** stands alone for **môj dáždnik**.",
      },
    },
  ],
};

export const possessivesEpisode: ListeningEpisode = {
  id: "listening/possessives",
  cover: { segment: "Hľadám svoj dáždnik", atMs: 20000 },
  slug: "possessives",
  number: 2,
  level: "A1–A2",
  titleSk: "Čí je to dáždnik?",
  title: "Whose umbrella is this?",
  topic: "Possessives",
  promise:
    "Anna and Marek find an umbrella nobody owns, ask at the language school, find Lucia on the square and look at Marek's family photos back in the studio. At the end, you decide whether students' sentences are right.",
  grammarSlug: "possessives",
  lessonId: "grammar/possessives",
  practiceSetId: "possessives",
  speakers: ["Anna", "Marek", "Mária", "Lucia"],
  vocabulary: [
    { slovak: "dáždnik", english: "umbrella" },
    { slovak: "kamarát", english: "friend" },
    { slovak: "sestra", english: "sister" },
    { slovak: "auto", english: "car" },
    { slovak: "kľúče", english: "keys" },
    { slovak: "Čí je to?", english: "Whose is it?" },
  ],
  chapters: [intro, school, square, photos, quiz, outro],
};
