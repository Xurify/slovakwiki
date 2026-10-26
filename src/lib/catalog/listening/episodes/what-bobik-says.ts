import {
  CHUCKLE,
  EXCITED,
  HAPPY,
  PAUSE,
  SIGH,
  STOP,
  SURPRISED,
  lineWriter,
} from "../dialogue";
import type { ListeningChapter, ListeningEpisode } from "../types";

/**
 * A radio play with no grammar topic: a story to follow by ear. Marek's new
 * home robot knows a hundred languages and none of them is the dog's. Over
 * one day Robo learns what Bobík's barks mean, and the last one he learns is
 * the one that brings Marek home. Every line Bobík has is a real bark (see
 * `scripts/audio/barks.ts`): "Haf!" is a full bark, "Haf." a small one.
 */

const PREFIX = "podcast-what-bobik-says-";
const line = lineWriter(PREFIX);

/** A scene card: the place and the clock, read by the narrator, nobody on stage. */
function card(id: string, slovak: string, english: string) {
  return line(id, "Scene", [slovak], english);
}

/** Marek's side of the call Robo makes, heard over the line. */
function marekOnCall(id: string, parts: Parameters<typeof line>[2], english: string) {
  return line(id, "Marek", parts, english, { overPhone: true });
}

const morning: ListeningChapter = {
  id: `${PREFIX}morning`,
  stage: "home",
  titleSk: "Nový pomocník",
  title: "The new helper",
  lines: [
    card(
      "card-monday-seven",
      "Pondelok. Sedem hodín ráno. Marekov byt.",
      "Monday. Seven in the morning. Marek's flat.",
    ),
    line(
      "robo-good-morning",
      "Robo",
      ["Systém spustený. ", PAUSE, "Dobré ráno. Som Robo, váš nový domáci robot."],
      "System started. Good morning. I'm Robo, your new home robot.",
    ),
    line(
      "marek-say-ty",
      "Marek",
      [EXCITED, "Super, funguje! ", PAUSE, "Ahoj, Robo! Ja som Marek. Môžeš mi tykať."],
      "Great, it works! Hi, Robo! I'm Marek. You can say ty to me.",
    ),
    line(
      "robo-hundred-languages",
      "Robo",
      [
        "Dobre, Marek. Tykám ti. ",
        PAUSE,
        "Viem po slovensky, po anglicky, po nemecky",
        STOP,
        PAUSE,
        "Viem sto jazykov.",
      ],
      "OK, Marek. Ty it is. I speak Slovak, English, German… I know a hundred languages.",
    ),
    line("bobik-woof-stranger", "Bobík", ["Haf! Haf!"], "Woof! Woof!"),
    line(
      "robo-dont-know-this-one",
      "Robo",
      ["Prepáč. ", PAUSE, "Tento jazyk neviem."],
      "Sorry. I don't know this language.",
      { to: "Bobík" },
    ),
    line(
      "marek-this-is-bobik",
      "Marek",
      [CHUCKLE, "To je Bobík. Môj pes."],
      "That's Bobík. My dog.",
    ),
    line(
      "marek-off-to-work",
      "Marek",
      [
        "Pozri, musím ísť do práce. ",
        PAUSE,
        "Bobík je celý deň sám. O dvanástej ide von. Večer dostane jesť.",
      ],
      "Look, I have to go to work. Bobík is alone all day. At twelve he goes out. In the evening he gets his food.",
      { to: "Robo" },
    ),
    line(
      "robo-noted-schedule",
      "Robo",
      ["Dvanásť hodín: von. Večer: jesť. ", PAUSE, "Zapisujem."],
      "Twelve o'clock: out. Evening: food. Noted.",
    ),
    line(
      "marek-where-keys",
      "Marek",
      ["Výborne. ", PAUSE, "No nič", STOP, "Kde sú moje kľúče?"],
      "Great. Anyway… where are my keys?",
    ),
    line("robo-in-your-hand", "Robo", ["V tvojej ruke."], "In your hand."),
    line(
      "marek-home-at-seven",
      "Marek",
      [SURPRISED, "Aha. ", PAUSE, "Prídem domov o siedmej. Majte sa, chlapci!"],
      "Oh. I'll be home at seven. Bye, boys!",
    ),
    line("bobik-woof-after-marek", "Bobík", ["Haf."], "Woof."),
    line(
      "robo-just-us",
      "Robo",
      ["Bobík", STOP, PAUSE, "Sme sami."],
      "Bobík… it's just us.",
      { to: "Bobík" },
    ),
  ],
  checks: [
    {
      id: `${PREFIX}check-how-many-languages`,
      prompt: "Koľko jazykov vie Robo ráno?",
      promptEnglish: "How many languages does Robo know in the morning?",
      replayLineId: `${PREFIX}robo-hundred-languages`,
      choices: [
        { id: "hundred", label: "Sto jazykov." },
        {
          id: "three",
          label: "Tri jazyky.",
          whyWrong:
            "**Tri jazyky** is three languages. Robo names three, then says the number: **viem sto jazykov**.",
        },
        {
          id: "none",
          label: "Ani jeden.",
          whyWrong:
            "**Ani jeden** means not one. Robo knows a hundred; only the dog's is missing: **tento jazyk neviem**.",
        },
      ],
      answerId: "hundred",
      feedback: {
        english: "I know a hundred languages.",
        why: "Robo says **viem sto jazykov**, and then finds the one he doesn't: **tento jazyk neviem**.",
      },
    },
    {
      id: `${PREFIX}check-where-keys`,
      prompt: "Kde sú Marekove kľúče?",
      promptEnglish: "Where are Marek's keys?",
      replayLineId: `${PREFIX}robo-in-your-hand`,
      choices: [
        { id: "hand", label: "V jeho ruke." },
        {
          id: "bag",
          label: "V taške.",
          whyWrong:
            "**V taške** means in the bag. Marek is holding them as he asks: **v tvojej ruke**.",
        },
        {
          id: "table",
          label: "Na stole.",
          whyWrong:
            "**Na stole** means on the table. Robo sees them in Marek's hand: **v tvojej ruke**.",
        },
      ],
      answerId: "hand",
      feedback: {
        english: "In your hand.",
        why: "Robo answers **v tvojej ruke**: Robo sees everything, except what Bobík means.",
      },
    },
  ],
};

const lead: ListeningChapter = {
  id: `${PREFIX}lead`,
  stage: "home",
  titleSk: "Haf znamená von",
  title: "Woof means out",
  lines: [
    card("card-eleven", "Jedenásť hodín.", "Eleven o'clock."),
    line("bobik-woof-insists", "Bobík", ["Haf! Haf! Haf!"], "Woof! Woof! Woof!"),
    line(
      "robo-thats-the-plan",
      "Robo",
      ["Bobík, je jedenásť. Von ideme o dvanástej. ", PAUSE, "Taký je plán."],
      "Bobík, it's eleven. We go out at twelve. That's the plan.",
      { to: "Bobík" },
    ),
    line("bobik-woof-again", "Bobík", ["Haf! Haf!"], "Woof! Woof!"),
    line(
      "robo-are-you-hungry",
      "Robo",
      ["Hm… ", PAUSE, "Si hladný?"],
      "Hmm… are you hungry?",
    ),
    line("bobik-woof-answer", "Bobík", ["Haf!"], "Woof!"),
    line(
      "robo-not-an-answer",
      "Robo",
      ["Je to áno? Alebo nie? ", PAUSE, "To nie je odpoveď."],
      "Is that yes? Or no? That isn't an answer.",
    ),
    line(
      "robo-dictionary",
      "Robo",
      ["Hľadám v slovníku. ", PAUSE, "Haf: zvuk psa. ", PAUSE, "To viem aj ja."],
      "I'm looking it up. Woof: the sound a dog makes. I know that myself.",
      { gestures: ["compute"] },
    ),
    line("bobik-woof-with-lead", "Bobík", ["Haf! Haf!"], "Woof! Woof!"),
    line(
      "robo-the-lead",
      "Robo",
      [
        "Prečo pozeráš hore? ",
        PAUSE,
        "Čo tam je? Vodítko! ",
        PAUSE,
        "Aha. Ty chceš von. Teraz.",
      ],
      "Why are you looking up? What's up there? The lead! Oh. You want to go out. Now.",
      // He points at the lead on its peg; it stays there until they go and get it.
      { props: [null, null, null, null, null, null], to: "Bobík" },
    ),
    line("bobik-woof-yes", "Bobík", ["Haf!"], "Woof!"),
    line(
      "robo-change-of-plan",
      "Robo",
      [
        "Zmena plánu. ",
        PAUSE,
        "Zapisujem: tento haf znamená von. ",
        PAUSE,
        "Poďme po vodítko.",
      ],
      "Change of plan. Noted: this woof means out. Let's get the lead.",
      { props: [null, null, null] },
    ),
    line(
      "robo-off-to-square",
      "Robo",
      ["Tak. ", PAUSE, "Ideme na námestie."],
      "There. We're going to the square.",
      { props: ["leash"], to: "Bobík" },
    ),
  ],
  checks: [
    {
      id: `${PREFIX}check-what-bobik-wants`,
      prompt: "Čo chce Bobík o jedenástej?",
      promptEnglish: "What does Bobík want at eleven?",
      replayLineId: `${PREFIX}robo-the-lead`,
      choices: [
        { id: "out", label: "Ísť von." },
        {
          id: "eat",
          label: "Jesť.",
          whyWrong:
            "**Jesť** means to eat. Robo asks **si hladný?**, but the bark is no answer; the lead is.",
        },
        {
          id: "sleep",
          label: "Spať.",
          whyWrong:
            "**Spať** means to sleep. Bobík barks and looks up at his lead: **ty chceš von**.",
        },
      ],
      answerId: "out",
      feedback: {
        english: "You want to go out. Now.",
        why: "Bobík looks up at his **vodítko**, and Robo gets it: **ty chceš von. Teraz.**",
      },
    },
    {
      id: `${PREFIX}check-what-bobik-has`,
      prompt: "Čo je hore, kam pozerá Bobík?",
      promptEnglish: "What is up where Bobík is looking?",
      replayLineId: `${PREFIX}robo-the-lead`,
      choices: [
        { id: "lead", label: "Vodítko." },
        {
          id: "ball",
          label: "Loptu.",
          whyWrong: "**Lopta** is a ball. Nobody mentions one; Robo says **vodítko!**",
        },
        {
          id: "dictionary",
          label: "Slovník.",
          whyWrong:
            "**Slovník** is a dictionary, and it is Robo's: **hľadám v slovníku**. It does not help.",
        },
      ],
      answerId: "lead",
      feedback: {
        english: "What's up there? The lead!",
        why: "**Čo tam je? Vodítko!** A lead means a walk.",
      },
    },
  ],
};

const square: ListeningChapter = {
  id: `${PREFIX}square`,
  carrying: { Robo: "leash" },
  stage: "plaza",
  titleSk: "Na námestí",
  title: "On the square",
  lines: [
    card(
      "card-old-town",
      "Staré mesto. Pol dvanástej.",
      "The old town. Half past eleven.",
    ),
    line(
      "anna-hi-bobik",
      "Anna",
      ["Ahoj, Bobík! Ahoj, zlatko!"],
      "Hi, Bobík! Hello, sweetie!",
      {
        to: "Bobík",
      },
    ),
    line("bobik-woof-for-anna", "Bobík", ["Haf! Haf!"], "Woof! Woof!", { to: "Anna" }),
    line(
      "robo-good-day-anna",
      "Robo",
      ["Aha, kamarátka. ", PAUSE, "Dobrý deň. Som Robo, Marekov nový robot."],
      "Ah, a friend. Good day. I'm Robo, Marek's new robot.",
      { to: "Anna" },
    ),
    line(
      "anna-i-am-anna",
      "Anna",
      ["Ahoj, Robo. Ja som Anna, Marekova kamarátka."],
      "Hi, Robo. I'm Anna, Marek's friend.",
    ),
    line(
      "robo-bobik-says-hello",
      "Robo",
      ["Bobík hovorí: ahoj, Anna."],
      "Bobík says: hello, Anna.",
    ),
    line(
      "anna-you-understand-dogs",
      "Anna",
      [CHUCKLE, "Ty rozumieš psom?"],
      "You understand dogs?",
    ),
    line(
      "robo-two-words",
      "Robo",
      ["Učím sa. ", PAUSE, "Zatiaľ viem dve slová: von a ahoj."],
      "I'm learning. So far I know two words: out and hello.",
    ),
    line("anna-where-is-marek", "Anna", ["A kde je Marek?"], "And where's Marek?"),
    line("robo-at-work", "Robo", ["V práci."], "At work."),
    line(
      "anna-works-a-lot",
      "Anna",
      [SIGH, "Ako vždy. ", PAUSE, "Marek veľa pracuje."],
      "As always. Marek works a lot.",
    ),
    line(
      "anna-look-at-tail",
      "Anna",
      [
        "Vieš, Robo",
        STOP,
        PAUSE,
        "pes nehovorí len haf. ",
        PAUSE,
        "Pozri sa na chvost. Keď vrtí chvostom, je šťastný.",
      ],
      "You know, Robo… a dog doesn't only say woof. Look at his tail. When he wags it, he's happy.",
    ),
    line("robo-tail-noted", "Robo", ["Chvost. ", PAUSE, "Zapisujem."], "Tail. Noted."),
    line(
      "anna-bye",
      "Anna",
      ["Dobre, musím ísť. Majte sa, chlapci!"],
      "Right, I have to go. Bye, boys!",
    ),
    line("bobik-woof-bye", "Bobík", ["Haf!"], "Woof!"),
    line(
      "robo-dog-is-hard",
      "Robo",
      ["Bobík hovorí: dovidenia. ", PAUSE, "Alebo ahoj? ", PAUSE, "Psí jazyk je ťažký."],
      "Bobík says goodbye. Or hello? Dog language is hard.",
    ),
    line(
      "robo-come-home",
      "Robo",
      ["Poď, Bobík. Ideme domov."],
      "Come on, Bobík. We're going home.",
      { to: "Bobík" },
    ),
  ],
  checks: [
    {
      id: `${PREFIX}check-where-marek`,
      prompt: "Kde je Marek?",
      promptEnglish: "Where is Marek?",
      replayLineId: `${PREFIX}robo-at-work`,
      choices: [
        { id: "work", label: "V práci." },
        {
          id: "home",
          label: "Doma.",
          whyWrong:
            "**Doma** means at home. Only Robo and Bobík are there: Marek is **v práci**.",
        },
        {
          id: "square",
          label: "Na námestí.",
          whyWrong:
            "**Na námestí** is where Anna meets Robo and Bobík. Marek is **v práci**, as always.",
        },
      ],
      answerId: "work",
      feedback: {
        english: "At work.",
        why: "Robo says **v práci**, and Anna sighs: **ako vždy. Marek veľa pracuje.**",
      },
    },
    {
      id: `${PREFIX}check-happy-dog`,
      prompt: "Kedy je pes šťastný?",
      promptEnglish: "When is a dog happy?",
      replayLineId: `${PREFIX}anna-look-at-tail`,
      choices: [
        { id: "wags", label: "Keď vrtí chvostom." },
        {
          id: "barks",
          label: "Keď šteká.",
          whyWrong:
            "**Keď šteká** means when he barks. Anna's point is that a bark alone says little: **pes nehovorí len haf**.",
        },
        {
          id: "sleeps",
          label: "Keď spí.",
          whyWrong: "**Keď spí** means when he sleeps. Anna says to look at the tail.",
        },
      ],
      answerId: "wags",
      feedback: {
        english: "When he wags his tail, he's happy.",
        why: "**Pozri sa na chvost. Keď vrtí chvostom, je šťastný.** Robo will need this tonight.",
      },
    },
  ],
};

const waiting: ListeningChapter = {
  id: `${PREFIX}window`,
  stage: "home",
  titleSk: "Tichý haf",
  title: "A quiet woof",
  lines: [
    card(
      "card-eight-evening",
      "Marekov byt. Osem hodín večer.",
      "Marek's flat. Eight in the evening.",
    ),
    line(
      "robo-marek-said-seven",
      "Robo",
      ["Marek povedal: o siedmej. ", PAUSE, "Teraz je osem."],
      "Marek said: at seven. Now it's eight.",
    ),
    line("bobik-quiet-woof", "Bobík", ["Haf."], "Woof."),
    line(
      "robo-this-woof-different",
      "Robo",
      ["Bobík? ", PAUSE, "Tento haf je iný. Je tichý."],
      "Bobík? This woof is different. It's quiet.",
      { to: "Bobík" },
    ),
    line(
      "robo-not-out-not-hungry",
      "Robo",
      [
        "Chceš von? ",
        PAUSE,
        "Nie. Nevrtíš chvostom. ",
        PAUSE,
        "Si hladný? ",
        PAUSE,
        "Nie. Večera je ešte v miske.",
      ],
      "Do you want to go out? No. You're not wagging your tail. Are you hungry? No. Your dinner is still in the bowl.",
    ),
    line(
      "robo-you-are-waiting",
      "Robo",
      [
        "Hm… ",
        PAUSE,
        "Sedíš pri okne. Celý večer. ",
        PAUSE,
        "Pozeráš na ulicu. ",
        PAUSE,
        "Čakáš na Mareka.",
      ],
      "Hmm… You're sitting by the window. All evening. Watching the street. You're waiting for Marek.",
      { gestures: ["compute"] },
    ),
    line("bobik-quiet-yes", "Bobík", ["Haf."], "Woof."),
    line(
      "robo-calling-marek",
      "Robo",
      ["Rozumiem. ", PAUSE, "Volám Marekovi."],
      "I understand. I'm calling Marek.",
      // He is the phone: nothing comes out of a pocket for Bobík to come and see.
      { props: [null, null] },
    ),
    line("robo-call-hi", "Robo", ["Ahoj, Marek. Tu je Robo."], "Hi, Marek. It's Robo.", {
      ring: "dial",
      to: "Marek",
    }),
    marekOnCall(
      "marek-call-whats-up",
      [SURPRISED, "Robo? ", PAUSE, "Čo sa stalo? Je všetko v poriadku?"],
      "Robo? What's happened? Is everything all right?",
    ),
    line(
      "robo-call-bobik-waits",
      "Robo",
      ["Áno. ", PAUSE, "Ale Bobík sedí pri okne. Čaká na teba. Od siedmej."],
      "Yes. But Bobík is sitting by the window. He's waiting for you. Since seven.",
      { to: "Marek" },
    ),
    marekOnCall(
      "marek-call-coming",
      [SIGH, "Ach jaj. ", PAUSE, "Bobík", STOP, "Povedz mu, že už idem domov."],
      "Oh dear. Bobík… Tell him I'm on my way home.",
    ),
    line(
      "robo-marek-coming-home",
      "Robo",
      ["Bobík. ", PAUSE, "Marek ide domov."],
      "Bobík. Marek is coming home.",
      { to: "Bobík" },
    ),
    line("bobik-woof-glad", "Bobík", ["Haf! Haf!"], "Woof! Woof!"),
  ],
  checks: [
    {
      id: `${PREFIX}check-why-window`,
      prompt: "Prečo sedí Bobík pri okne?",
      promptEnglish: "Why is Bobík sitting by the window?",
      replayLineId: `${PREFIX}robo-you-are-waiting`,
      choices: [
        { id: "waiting", label: "Čaká na Mareka." },
        {
          id: "out",
          label: "Chce ísť von.",
          whyWrong:
            "**Chce ísť von** means he wants to go out. Robo checks the tail: **nevrtíš chvostom**.",
        },
        {
          id: "hungry",
          label: "Je hladný.",
          whyWrong:
            "**Je hladný** means he's hungry. His dinner is untouched: **večera je ešte v miske**.",
        },
      ],
      answerId: "waiting",
      feedback: {
        english: "You're watching the street. You're waiting for Marek.",
        why: "Robo works it out: **pozeráš na ulicu. Čakáš na Mareka.**",
      },
    },
    {
      id: `${PREFIX}check-who-robo-calls`,
      prompt: "Komu volá Robo?",
      promptEnglish: "Who does Robo call?",
      replayLineId: `${PREFIX}robo-calling-marek`,
      choices: [
        { id: "marek", label: "Marekovi." },
        {
          id: "anna",
          label: "Anne.",
          whyWrong:
            "**Anne** means to Anna. Robo calls the one Bobík waits for: **volám Marekovi**.",
        },
        {
          id: "nobody",
          label: "Nikomu.",
          whyWrong:
            "**Nikomu** means nobody. Robo says **volám Marekovi** and talks to him.",
        },
      ],
      answerId: "marek",
      feedback: {
        english: "I'm calling Marek.",
        why: "**Volám Marekovi**: Robo tells him **Bobík čaká na teba**, and Marek is on his way.",
      },
    },
  ],
};

const home: ListeningChapter = {
  id: `${PREFIX}home`,
  stage: "home",
  titleSk: "Stojeden",
  title: "A hundred and one",
  lines: [
    card(
      "card-half-past-eight",
      "Pol deviatej večer.",
      "Half past eight in the evening.",
    ),
    line(
      "marek-im-home",
      "Marek",
      [EXCITED, "Ahoj, Bobík! Som doma!"],
      "Hi, Bobík! I'm home!",
      { to: "Bobík" },
    ),
    line("bobik-overjoyed", "Bobík", ["Haf! Haf! Haf!"], "Woof! Woof! Woof!"),
    line(
      "marek-sorry-what-says",
      "Marek",
      ["Prepáč, Bobík. Prepáč. ", PAUSE, "Robo, čo hovorí?"],
      "Sorry, Bobík. Sorry. Robo, what's he saying?",
    ),
    line("robo-at-last", "Robo", ["Hovorí: konečne."], "He's saying: at last."),
    line(
      "marek-change-of-plan",
      "Marek",
      [
        SIGH,
        "Má pravdu. ",
        PAUSE,
        "Zmena plánu. Zajtra pracujem z domu. ",
        PAUSE,
        "A pôjdeme na námestie. Všetci traja.",
      ],
      "He's right. Change of plan. Tomorrow I'm working from home. And we'll go to the square. All three of us.",
    ),
    line("bobik-woof-to-plan", "Bobík", ["Haf! Haf!"], "Woof! Woof!"),
    line(
      "robo-yes-and-hungry",
      "Robo",
      ["Hovorí: áno. ", PAUSE, "Vrtí chvostom. ", PAUSE, "A ešte: teraz som hladný."],
      "He's saying: yes. He's wagging his tail. And also: now I'm hungry.",
    ),
    line(
      "marek-hungry-at-last",
      "Marek",
      [HAPPY, "Hladný? ", PAUSE, "Konečne! Poď, Bobík, večera!"],
      "Hungry? At last! Come on, Bobík, dinner!",
      { to: "Bobík" },
    ),
    line("bobik-small-new-woof", "Bobík", ["Haf."], "Woof."),
    line(
      "robo-dont-know-this-one-yet",
      "Robo",
      ["Tento haf", STOP, PAUSE, "Neviem."],
      "This woof… I don't know.",
      { gestures: ["compute"] },
    ),
    line(
      "marek-work-for-tomorrow",
      "Marek",
      [CHUCKLE, "Tak to máš prácu na zajtra."],
      "Then that's your job for tomorrow.",
      { to: "Robo" },
    ),
    line(
      "robo-hundred-and-two",
      "Robo",
      ["Ráno sto jazykov. ", PAUSE, "Teraz stojeden. ", PAUSE, "Zajtra stodva jazykov."],
      "This morning, a hundred languages. Now a hundred and one. Tomorrow, a hundred and two languages.",
    ),
    line("bobik-last-woof", "Bobík", ["Haf!"], "Woof!"),
  ],
  checks: [
    {
      id: `${PREFIX}check-at-last`,
      prompt: "Čo hovorí Bobík, keď príde Marek? Podľa Roba.",
      promptEnglish: "What does Bobík say when Marek comes in? According to Robo.",
      replayLineId: `${PREFIX}robo-at-last`,
      choices: [
        { id: "at-last", label: "Konečne." },
        {
          id: "good-night",
          label: "Dobrú noc.",
          whyWrong:
            "**Dobrú noc** means good night. Bobík has waited all evening: **konečne**.",
        },
        {
          id: "hello",
          label: "Ahoj.",
          whyWrong:
            "**Ahoj** was Bobík's word for Anna on the square. For Marek, Robo hears more: **konečne**.",
        },
      ],
      answerId: "at-last",
      feedback: {
        english: "He's saying: at last.",
        why: "**Hovorí: konečne.** And Marek agrees: **má pravdu**.",
      },
    },
    {
      id: `${PREFIX}check-tomorrow`,
      prompt: "Čo urobí Marek zajtra?",
      promptEnglish: "What will Marek do tomorrow?",
      replayLineId: `${PREFIX}marek-change-of-plan`,
      choices: [
        { id: "home", label: "Bude pracovať z domu." },
        {
          id: "early",
          label: "Pôjde do práce skoro.",
          whyWrong:
            "**Pôjde do práce skoro** means he'll go to work early. He changes the plan: **zajtra pracujem z domu**.",
        },
        {
          id: "new-robot",
          label: "Kúpi nového robota.",
          whyWrong:
            "**Kúpi nového robota** means he'll buy a new robot. Robo is staying.",
        },
      ],
      answerId: "home",
      feedback: {
        english: "Change of plan. Tomorrow I'm working from home.",
        why: "Marek borrows Robo's words: **zmena plánu. Zajtra pracujem z domu.**",
      },
    },
  ],
};

export const whatBobikSaysEpisode: ListeningEpisode = {
  id: "listening/what-bobik-says",
  slug: "what-bobik-says",
  number: 5,
  level: "A1–A2",
  titleSk: "Čo hovorí Bobík?",
  title: "What is Bobík saying?",
  promise:
    "A story with no grammar lesson in it. Marek's new robot knows a hundred languages, but not the one his dog speaks. Over one day, he learns it.",
  speakers: ["Marek", "Bobík", "Robo", "Anna", "Scene"],
  vocabulary: [
    { slovak: "pes", english: "dog" },
    { slovak: "haf", english: "woof" },
    { slovak: "von", english: "out, outside" },
    { slovak: "vodítko", english: "lead, leash" },
    { slovak: "vrtieť chvostom", english: "to wag your tail" },
    { slovak: "konečne", english: "at last" },
  ],
  chapters: [morning, lead, square, waiting, home],
};
