import type { MarkedPart } from "$lib/learning/marked-text";
import {
  CHUCKLE,
  PAUSE,
  SIGH,
  afterThinking,
  lineWriter,
  rightOrWrong,
  staged,
} from "../dialogue";
import type { Cue } from "$lib/stick-figure/acts";
import type { ListeningChapter, ListeningEpisode } from "../types";

const PREFIX = "podcast-possessives-";
const line = lineWriter(PREFIX);

/** A possessive, the episode's topic, lit in the transcript. */
function mark(text: string): Exclude<MarkedPart, string> {
  return { role: "possessive", text };
}

const INTRO_ACTS: Record<string, Cue[]> = {
  "marek-whose-umbrella": [
    { do: "take", what: "umbrella", on: "mám" },
    { do: "raise", what: "umbrella", on: "dáždnik" },
  ],
  "anna-not-mine": [{ do: "point", to: "umbrella", on: "môj" }],
  "marek-so-whose": [{ do: "put", what: "umbrella", to: "desk", dx: 30, on: "nie" }],
  "anna-good-question": [{ who: "marek", do: "take", what: "umbrella", on: "školy" }],
};

const intro: ListeningChapter = {
  id: `${PREFIX}intro`,
  titleSk: "Úvod",
  title: "An umbrella nobody owns",
  setup: {
    objects: [
      { id: "umbrella", kind: "umbrella", start: { where: { on: "desk", dx: 30 } } },
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
          "Dnes máme tému: ",
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
        "Today we have a topic: môj, tvoj, jeho, jej. And svoj.",
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
        "anna-good-question",
        "Anna",
        ["To je dobrá otázka. Možno je zo školy. Poďme do jazykovej školy!"],
        "That's a good question. Maybe it's from the school. Let's go to the language school!",
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
        english: "Today we have a topic: môj, tvoj, jeho, jej. And svoj.",
        why: "Anna says: **Dnes máme tému: môj, tvoj, jeho, jej.**",
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

const PHOTOS_ACTS: Record<string, Cue[]> = {
  "marek-phone-photos": [
    { do: "take", what: "phone", on: "telefón" },
    { do: "raise", what: "phone", on: "fotky" },
  ],
  "anna-show-me": [{ do: "nod", on: "ukáž" }],
  // He holds each photo up to show it, and puts the phone away only once they are done with them.
  "marek-first-photo": [{ do: "raise", what: "phone", on: "fotka" }],
  "marek-house-and-car": [{ do: "raise", what: "phone", on: "fotka" }],
  "marek-old-but-mine": [{ do: "raise", what: "phone", on: "fotka" }],
  "marek-test-again": [{ do: "pocket", what: "phone", on: "skúška" }],
};

const photos: ListeningChapter = {
  id: `${PREFIX}photos`,
  titleSk: "Kto je to?",
  title: "The photo game",
  setup: {
    objects: [{ id: "phone", kind: "phone", start: { where: { pocket: "marek" } } }],
  },
  lines: staged(
    PREFIX,
    [
      line(
        "marek-phone-photos",
        "Marek",
        ["Sme späť v štúdiu. Anna, mám tu telefón. Na telefóne mám fotky."],
        "We're back in the studio. Anna, I have my phone here. I have photos on the phone.",
      ),
      line("anna-show-me", "Anna", ["Ukáž! Kto je to?"], "Show me! Who is it?"),
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
      line(
        "anna-your-house",
        "Anna",
        ["To je ", mark("tvoj"), " dom?"],
        "Is that your house?",
      ),
      line(
        "marek-parents-house",
        "Marek",
        [
          "Nie, to je dom ",
          mark("mojich"),
          " rodičov. ",
          PAUSE,
          mark("Ich"),
          " dom je pri lese.",
        ],
        "No, that's my parents' house. Their house is by the forest.",
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
        "anna-nice-photos",
        "Anna",
        ["Pekné fotky! A teraz malá skúška pre Mareka."],
        "Nice photos! And now a little test for Marek.",
      ),
      line(
        "marek-test-again",
        "Marek",
        ["Zase skúška? No dobre."],
        "A test again? All right then.",
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
  "marek-is-it-yours": [{ do: "raise", what: "umbrella", on: "dáždnik" }],
  "maria-mine-is-black": [{ do: "point", to: "umbrella", on: "modrý" }],
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
        "marek-is-it-yours",
        "Marek",
        ["Máme tu dáždnik. Nie je ", mark("náš"), ". ", PAUSE, "Je ", mark("váš"), "?"],
        "We have an umbrella here. It's not ours. Is it yours?",
      ),
      line(
        "maria-mine-is-black",
        "Mária",
        [
          "Hm… ",
          PAUSE,
          mark("Môj"),
          " nie. ",
          mark("Môj"),
          " dáždnik je čierny a tento je modrý.",
        ],
        "Hmm… not mine. My umbrella is black and this one is blue.",
      ),
      line(
        "anna-your-students",
        "Anna",
        ["Možno je to dáždnik ", mark("vašej"), " študentky?"],
        "Maybe it's the umbrella of one of your students?",
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
        "marek-where-is-student",
        "Marek",
        ["Výborne! A kde je ", mark("vaša"), " študentka?"],
        "Excellent! And where is your student?",
      ),
      line(
        "maria-course-tomorrow",
        "Mária",
        ["Dnes tu nie je. ", mark("Jej"), " kurz je zajtra o deviatej."],
        "She's not here today. Her course is tomorrow at nine.",
      ),
      line(
        "anna-come-tomorrow",
        "Anna",
        ["Dobre, prídeme zajtra. Ďakujeme!"],
        "OK, we'll come tomorrow. Thank you!",
      ),
      line(
        "maria-see-you-tomorrow",
        "Mária",
        ["Prosím. Tak zajtra!"],
        "You're welcome. See you tomorrow, then!",
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
          whyWrong:
            "**Márie** means Mária's. She says **môj nie**: her umbrella is black.",
        },
        {
          id: "marek",
          label: "Marekov.",
          whyWrong: "**Marekov** means Marek's. He is only holding it: **nie je náš**.",
        },
      ],
      answerId: "lucia",
      feedback: {
        english: "There's a name here: Lucia. Lucia is our student.",
        why: "Mária reads the name and says **Lucia je naša študentka**.",
      },
    },
    {
      id: `${PREFIX}check-vas-form`,
      gap: "Je ___?",
      prompt: "Ktoré slovo povedal Marek pani Márii?",
      promptEnglish: "Which word did Marek say to Mária?",
      replayLineId: `${PREFIX}marek-is-it-yours`,
      choices: [
        { id: "vas", label: "váš" },
        {
          id: "tvoj",
          label: "tvoj",
          whyWrong:
            "**Tvoj** is for someone you call **ty**, a friend. Marek says **dobrý deň** to Mária and keeps to **vy**.",
        },
        {
          id: "nas",
          label: "náš",
          whyWrong:
            "**Náš** means ours. Marek says **nie je náš** first, then asks **je váš?**",
        },
      ],
      answerId: "vas",
      feedback: {
        english: "Is it yours?",
        why: "Marek speaks to Mária formally, so **váš**, like **vy**.",
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
  "marek-blue-umbrella": [{ do: "raise", what: "umbrella", on: "modrý" }],
  "lucia-mine": [
    { who: "marek", do: "give", what: "umbrella", to: "lucia", on: "môj" },
    { do: "nod", on: "ďakujem" },
  ],
  "marek-in-my-bag": [
    { do: "take", what: "keys", on: "taške" },
    { do: "raise", what: "keys", on: "sú" },
  ],
  "lucia-marek-and-his-keys": [
    { do: "laugh", on: "kľúče" },
    { do: "wave", on: "majte" },
  ],
  "anna-back-to-studio": [{ do: "wave", on: "maj" }],
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
      // His keys are in his bag, as Anna says: he carries it in his other hand.
      { id: "bag", kind: "bag", start: { where: { hand: "marek", side: "rear" } } },
      { id: "keys", kind: "keys", start: { where: { in: "bag" } } },
    ],
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
        "marek-what-are-you-doing",
        "Marek",
        ["Ahoj, Lucia! Čo tu robíš?"],
        "Hi, Lucia! What are you doing here?",
      ),
      line(
        "lucia-looking-for-umbrella",
        "Lucia",
        ["Hľadám ", mark("svoj"), " dáždnik. ", PAUSE, "Nie je v škole a nie je doma."],
        "I'm looking for my umbrella. It's not at school and it's not at home.",
      ),
      line("marek-blue-umbrella", "Marek", ["Modrý dáždnik?"], "A blue umbrella?"),
      line("lucia-yes-blue", "Lucia", ["Áno! Modrý."], "Yes! Blue."),
      line(
        "marek-whose-is-this",
        "Marek",
        ["Čí je tento dáždnik?"],
        "Whose umbrella is this?",
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
        "marek-i-look-for-my-keys",
        "Marek",
        [
          "Nič sa nestalo. ",
          PAUSE,
          "Lucia hľadá ",
          mark("svoj"),
          " dáždnik a ja hľadám ",
          mark("svoje"),
          " kľúče.",
        ],
        "No harm done. Lucia is looking for her umbrella and I'm looking for my keys.",
      ),
      line(
        "anna-keys-in-your-bag",
        "Anna",
        [SIGH, "Zase? ", mark("Tvoje"), " kľúče sú v ", mark("tvojej"), " taške, Marek."],
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
        ["Marek a ", mark("jeho"), " kľúče! ", PAUSE, "Ďakujem ešte raz. Majte sa!"],
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
      gap: "Lucia hľadá ___ dáždnik.",
      prompt: "Ktoré slovo povedal Marek?",
      promptEnglish: "Which word did Marek say?",
      replayLineId: `${PREFIX}marek-i-look-for-my-keys`,
      choices: [
        { id: "svoj", label: "svoj" },
        {
          id: "jej",
          label: "jej",
          whyWrong:
            "**Jej dáždnik** would be another woman's umbrella. Lucia looks for her own, so **svoj**.",
        },
        {
          id: "moj",
          label: "môj",
          whyWrong: "**Môj** would be Marek's own umbrella. He is talking about Lucia's.",
        },
      ],
      answerId: "svoj",
      feedback: {
        english: "Lucia is looking for her umbrella.",
        why: "Lucia is the subject and the owner: **svoj**. Marek says the same about himself: **svoje kľúče**.",
      },
    },
    {
      id: `${PREFIX}check-where-keys`,
      prompt: "Kde sú Marekove kľúče?",
      promptEnglish: "Where are Marek's keys?",
      replayLineId: `${PREFIX}anna-keys-in-your-bag`,
      choices: [
        { id: "bag", label: "V jeho taške." },
        {
          id: "studio",
          label: "V štúdiu.",
          whyWrong:
            "**V štúdiu** means in the studio. Anna says **v tvojej taške**, in your bag.",
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
        english: "Your keys are in your bag, Marek.",
        why: "Anna says **v tvojej taške**. After **v**, **tvoja** becomes **tvojej**, like **v tej taške**.",
      },
    },
  ],
};

const QUIZ_ACTS: Record<string, Cue[]> = {
  "anna-back-right-or-wrong": [{ do: "nod", on: "skúška" }],
  "marek-thats-hard": [{ do: "shrug", on: "ťažké" }],
};

const quiz: ListeningChapter = {
  id: `${PREFIX}quiz`,
  titleSk: "Správne alebo nesprávne?",
  title: "Right or wrong? Marek takes the quiz",
  // Each place keeps its own set, so the studio still has the umbrella Marek gave back on the square.
  setup: { state: { umbrella: { where: { pocket: "lucia" } } } },
  lines: staged(
    PREFIX,
    [
      line(
        "anna-back-right-or-wrong",
        "Anna",
        [
          "Lucia má ",
          mark("svoj"),
          " dáždnik a ty ",
          mark("svoje"),
          " kľúče. ",
          PAUSE,
          "Tak teraz malá skúška, Marek.",
        ],
        "Lucia has her umbrella and you have your keys. So now a little test, Marek.",
      ),
      line(
        "anna-the-rules",
        "Anna",
        ["Marek povie vetu a vy hádajte: je správna, alebo nesprávna?"],
        "Marek says a sentence and you guess: is it right, or wrong?",
      ),
      rightOrWrong(
        line(
          "marek-second-sentence",
          "Marek",
          [
            "Pre mňa? ",
            PAUSE,
            "Tak dobre… ",
            PAUSE,
            "Idem do kina so ",
            mark("svojou"),
            " sestrou.",
          ],
          "For me? All right then… I'm going to the cinema with my sister.",
        ),
        "right",
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
            ": so ",
            mark("svojou"),
            " sestrou.",
          ],
          "Right! I am going and the sister is mine: so svojou sestrou.",
        ),
      ),
      line(
        "marek-i-know-that",
        "Marek",
        ["Super! ", PAUSE, "Tak to už viem."],
        "Great! So I know that one now.",
      ),
      line(
        "anna-we-will-see",
        "Anna",
        [CHUCKLE, "Uvidíme. ", PAUSE, "Ďalšia?"],
        "We'll see. Next one?",
      ),
      rightOrWrong(
        line(
          "marek-first-sentence",
          "Marek",
          ["Hm… ", PAUSE, mark("Moja"), " brat je učiteľ."],
          "Hmm… Moja brat je učiteľ.",
        ),
        "wrong",
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
        "marek-should-have-known",
        "Marek",
        ["Ajaj. ", PAUSE, "To som mal vedieť."],
        "Oh no. I should have known that.",
      ),
      line(
        "anna-you-should-have",
        "Anna",
        [CHUCKLE, "To si mal. ", PAUSE, "Skús ešte jednu."],
        "You should have. Try one more.",
      ),
      rightOrWrong(
        line(
          "marek-third-sentence",
          "Marek",
          ["Tak… ", PAUSE, mark("Svoj"), " brat je učiteľ."],
          "So… Svoj brat je učiteľ.",
        ),
        "wrong",
      ),
      afterThinking(
        line(
          "anna-svoj-not-subject",
          "Anna",
          [
            "Nesprávne! ",
            PAUSE,
            mark("Svoj"),
            " sa tu nehodí: podmet je brat. ",
            PAUSE,
            "Správne je: ",
            mark("jeho"),
            " brat je učiteľ.",
          ],
          "Wrong! Svoj doesn't fit here: the subject is brat. The right form is: jeho brat je učiteľ.",
        ),
      ),
      line("marek-thats-hard", "Marek", [SIGH, "To je ťažké."], "That's hard."),
      line(
        "anna-last-one",
        "Anna",
        ["Je. ", PAUSE, "Ale ešte jedna, posledná."],
        "It is. But one more, the last one.",
      ),
      rightOrWrong(
        line(
          "marek-last-sentence",
          "Marek",
          ["Dobre… ", PAUSE, mark("Ich"), " auto je červené."],
          "OK… Their car is red.",
        ),
        "right",
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
            " sa nikdy nemenia. ",
            mark("Jeho"),
            " auto, ",
            mark("jej"),
            " auto, ",
            mark("ich"),
            " auto.",
          ],
          "Right! Jeho, jej, ich never change. Jeho auto, jej auto, ich auto.",
        ),
      ),
      line(
        "marek-thats-easy",
        "Marek",
        [mark("Jeho"), ", ", mark("jej"), ", ", mark("ich"), ". ", PAUSE, "To je ľahké!"],
        "Jeho, jej, ich. That's easy!",
      ),
      line(
        "anna-and-you",
        "Anna",
        [CHUCKLE, "Pred chvíľou to bolo ťažké! ", PAUSE, "A vy? Koľko ste mali správne?"],
        "A moment ago it was hard! And you? How many did you get right?",
      ),
      afterThinking(
        line(
          "marek-not-counting",
          "Marek",
          [CHUCKLE, "Ja radšej nebudem počítať."],
          "I'd rather not count.",
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
        english: "Svoj doesn't fit here: the subject is brat.",
        why: "**Svoj** can't be part of the subject. The brother is the subject, so **jeho brat**.",
      },
    },
    {
      id: `${PREFIX}check-ich-form`,
      gap: "___ auto je červené.",
      prompt: "Ktoré slovo povedal Marek?",
      promptEnglish: "Which word did Marek say?",
      replayLineId: `${PREFIX}marek-last-sentence`,
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
    { do: "put", what: "marek-umbrella", to: "desk", dx: 31, on: "máš" },
    { do: "slide", what: "marek-umbrella", to: "desk", dx: -20 },
  ],
  "anna-yours-is-small": [
    { do: "take", what: "marek-umbrella", on: "ďakujem" },
    { do: "raise", what: "marek-umbrella", on: "malý" },
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
        start: { where: { pocket: "marek" } },
      },
    ],
  },
  lines: staged(
    PREFIX,
    [
      line(
        "marek-thats-all",
        "Marek",
        ["To je všetko na dnes."],
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
        "anna-raining-where-umbrella",
        "Anna",
        ["Marek, vonku prší. ", PAUSE, "Kde je ", mark("môj"), " dáždnik?"],
        "Marek, it's raining outside. Where is my umbrella?",
      ),
      line(
        "marek-yours-is-at-home",
        "Marek",
        [mark("Tvoj"), " dáždnik? ", PAUSE, mark("Tvoj"), " dáždnik je doma, Anna."],
        "Your umbrella? Your umbrella is at home, Anna.",
      ),
      line(
        "anna-yes-at-home",
        "Anna",
        [SIGH, "Áno. ", mark("Môj"), " dáždnik je doma."],
        "Yes. My umbrella is at home.",
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
  slug: "possessives",
  number: 2,
  level: "A1–A2",
  titleSk: "Čí je to dáždnik?",
  title: "Whose umbrella is this?",
  topic: "môj, jeho, svoj",
  promise:
    "Anna and Marek find an umbrella nobody owns, look at family photos, ask at the language school and meet Lucia on the square.",
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
