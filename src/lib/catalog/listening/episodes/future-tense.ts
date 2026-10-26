import type { MarkedPart } from "$lib/learning/marked-text";
import { CHUCKLE, PAUSE, STOP, afterThinking, lineWriter } from "../dialogue";
import type { ListeningChapter, ListeningEpisode } from "../types";

/**
 * A radio play about a robot who plans and a dog who waits. Domo thinks in
 * results, one perfective future after another (pôjdem, dám, uvarím), and
 * none of them reaches Dunčo. What does is the other future, budem with an
 * imperfective verb: the time you spend. The episode's turn is that
 * contrast, and its last line pays off the first scene: všetko bude v
 * poriadku becomes všetko je v poriadku.
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
function dog(id: string, bark: string, english: string) {
  return line(id, "Dunčo", [bark], english);
}

const plan: ListeningChapter = {
  id: `${PREFIX}plan`,
  stage: "home",
  titleSk: "Mám plán",
  title: "I have a plan",
  lines: [
    card(
      "card-friday-evening",
      "Piatok večer. U Mareka doma.",
      "Friday evening. At Marek's.",
    ),
    line(
      "anna-is-that-the-robot",
      "Anna",
      ["Marek, to je on? ", PAUSE, "Tvoj nový robot?"],
      "Marek, is that him? Your new robot?",
      { to: "Marek" },
    ),
    line(
      "marek-flying-to-london",
      "Marek",
      [
        "Áno. Toto je Domo. ",
        PAUSE,
        "Zajtra ráno ",
        future("poletím"),
        " do Londýna a Domo ",
        future("bude"),
        " tu s Dunčom.",
      ],
      "Yes. This is Domo. Tomorrow morning I'm flying to London, and Domo will be here with Dunčo.",
    ),
    line(
      "domo-good-evening",
      "Domo",
      [
        "Dobrý večer, pani Anna. ",
        PAUSE,
        "Tri dni sa ",
        future("budem starať"),
        " o Dunča.",
      ],
      "Good evening, Anna. For three days I will take care of Dunčo.",
      { to: "Anna" },
    ),
    dog("dunco-growls-at-domo", "Vrrr…", "Grrr…"),
    line(
      "anna-he-doesnt-know-you",
      "Anna",
      ["Hm. ", PAUSE, "Dunčo ťa ešte nepozná."],
      "Hmm. Dunčo doesn't know you yet.",
      { to: "Domo" },
    ),
    line(
      "domo-i-have-a-plan",
      "Domo",
      ["To nevadí. Mám plán."],
      "That doesn't matter. I have a plan.",
    ),
    line("anna-what-plan", "Anna", ["Aký plán?"], "What plan?"),
    line(
      "domo-plan-seven-eight",
      "Domo",
      [
        "O siedmej ",
        future("pôjdem"),
        " s Dunčom von. O ôsmej mu ",
        future("dám"),
        " granule. ",
        PAUSE,
        "Potom ",
        future("budem upratovať"),
        ".",
      ],
      "At seven I'll go out with Dunčo. At eight I'll give him his food. Then I'll be cleaning.",
    ),
    line("anna-and-evening", "Anna", ["A večer?"], "And in the evening?"),
    line(
      "marek-window-at-six",
      "Marek",
      ["Večer o šiestej Dunčo vždy sedí pri okne. ", PAUSE, "Čaká na mňa."],
      "At six in the evening Dunčo always sits by the window. He waits for me.",
      { to: "Domo" },
    ),
    line(
      "domo-when-will-you-be-home",
      "Domo",
      ["Pán Marek, a kedy ", future("budete"), " doma?"],
      "Mr Marek, and when will you be home?",
    ),
    line(
      "marek-monday-at-six",
      "Marek",
      ["V pondelok o šiestej. ", PAUSE, "A ", future("kúpim"), " mu novú loptičku."],
      "On Monday at six. And I'll buy him a new ball.",
      { props: [null, null] },
    ),
    line(
      "anna-i-will-write",
      "Anna",
      [
        "Ja ",
        future("prídem"),
        " zajtra ráno. ",
        PAUSE,
        "A každý večer ti ",
        future("budem písať"),
        ", ako sa má Dunčo.",
      ],
      "I'll come tomorrow morning. And every evening I'll write to you how Dunčo is doing.",
      { to: "Marek" },
    ),
    line(
      "domo-everything-will-be-fine",
      "Domo",
      [
        "Ďakujem, pani Anna. Ale to ",
        future("nebude"),
        " treba. ",
        PAUSE,
        "Všetko ",
        future("bude"),
        " v poriadku.",
      ],
      "Thank you, Anna. But that won't be needed. Everything will be fine.",
      { to: "Anna" },
    ),
    line(
      "marek-i-will-call",
      "Marek",
      ["Dobre. ", PAUSE, "A v nedeľu vám ", future("zavolám"), "."],
      "All right. And I'll call you on Sunday.",
      { to: "Domo" },
    ),
    line(
      "marek-will-you-be-good",
      "Marek",
      ["Dunčo", STOP, PAUSE, future("Budeš"), " dobrý?"],
      "Dunčo… Will you be good?",
      { to: "Dunčo" },
    ),
    dog("dunco-one-bark", "Haf!", "Woof!"),
  ],
  checks: [
    {
      id: `${PREFIX}check-where-marek-flies`,
      prompt: "Kam poletí Marek?",
      promptEnglish: "Where is Marek flying?",
      replayLineId: `${PREFIX}marek-flying-to-london`,
      choices: [
        { id: "london", label: "Do Londýna." },
        {
          id: "vienna",
          label: "Do Viedne.",
          whyWrong: "**Do Viedne** means to Vienna. Marek says **poletím do Londýna**.",
        },
        {
          id: "nowhere",
          label: "Nikam, bude doma.",
          whyWrong:
            "**Bude doma** means he will be at home. That is Domo and Dunčo: **Domo bude tu s Dunčom**.",
        },
      ],
      answerId: "london",
      feedback: {
        english: "Tomorrow morning I'm flying to London.",
        why: "**Poletím** is the future of **letieť**: one trip, so **po-**, as **pôjdem** is for **ísť**.",
      },
    },
    {
      id: `${PREFIX}check-dunco-at-six`,
      prompt: "Čo robí Dunčo každý večer o šiestej?",
      promptEnglish: "What does Dunčo do every evening at six?",
      replayLineId: `${PREFIX}marek-window-at-six`,
      choices: [
        { id: "window", label: "Sedí pri okne a čaká na Mareka." },
        {
          id: "eats",
          label: "Žerie granule.",
          whyWrong:
            "**Žerie granule** means he eats his food (**žrať** is eating, for animals). That is in Domo's plan, at eight in the morning.",
        },
        {
          id: "walk",
          label: "Ide von s Domom.",
          whyWrong:
            "**Ide von** means he goes out. Domo plans that for seven in the morning: **o siedmej pôjdem s Dunčom von**.",
        },
      ],
      answerId: "window",
      feedback: {
        english:
          "At six in the evening Dunčo always sits by the window. He waits for me.",
        why: "Marek says **vždy sedí pri okne** and **čaká na mňa**: present tense, because it happens every evening.",
      },
    },
    {
      id: `${PREFIX}check-budete-form`,
      gap: "Pán Marek, a kedy ___ doma?",
      prompt: "Ktoré slovo povedal Domo?",
      promptEnglish: "Which word did Domo say?",
      replayLineId: `${PREFIX}domo-when-will-you-be-home`,
      choices: [
        { id: "budete", label: "budete" },
        {
          id: "budes",
          label: "budeš",
          whyWrong:
            "**Budeš** is for someone you call **ty**. Domo says **pán Marek**, so he uses **vy**.",
        },
        {
          id: "bude",
          label: "bude",
          whyWrong:
            "**Bude** is he or she: **kedy bude doma?** asks about someone else, not Marek himself.",
        },
      ],
      answerId: "budete",
      feedback: {
        english: "Mr Marek, and when will you be home?",
        why: "Domo calls Marek **pán Marek** and uses **vy**: the future of **byť** for **vy** is **budete**.",
      },
    },
  ],
};

const morning: ListeningChapter = {
  id: `${PREFIX}morning`,
  stage: "home",
  titleSk: "Vrrr znamená nie",
  title: "Grrr means no",
  lines: [
    card(
      "card-saturday-seven",
      "Sobota. Sedem hodín ráno.",
      "Saturday. Seven in the morning.",
    ),
    line(
      "domo-good-morning-out",
      "Domo",
      [
        "Dobré ráno, Dunčo. ",
        PAUSE,
        "Je sedem hodín. Teraz ",
        future("pôjdeme"),
        " von.",
      ],
      "Good morning, Dunčo. It's seven o'clock. Now we'll go out.",
    ),
    dog("dunco-growls-no", "Vrrr…", "Grrr…"),
    line(
      "domo-dont-understand",
      "Domo",
      ["Nerozumiem. ", PAUSE, "Tento jazyk nemám."],
      "I don't understand. I don't have this language.",
    ),
    line(
      "anna-good-morning-going-out",
      "Anna",
      ["Dobré ráno! ", PAUSE, "Tak čo, ", future("pôjdete"), " von?"],
      "Good morning! So, are you two going out?",
    ),
    line(
      "domo-dunco-says-grrr",
      "Domo",
      ["Dobré ráno, pani Anna. ", PAUSE, "Dunčo nechce. Robí vrrr."],
      "Good morning, Anna. Dunčo doesn't want to. He goes grrr.",
    ),
    line(
      "anna-dog-dictionary",
      "Anna",
      [
        CHUCKLE,
        "Vrrr znamená nie. ",
        PAUSE,
        "Haf znamená ahoj. ",
        PAUSE,
        "A kňu znamená: som smutný.",
      ],
      "Grrr means no. Woof means hi. And whine means: I'm sad.",
    ),
    line(
      "domo-saves-it",
      "Domo",
      ["Vrrr je nie. Haf je ahoj. Kňu je smutný. ", PAUSE, future("Uložím"), " si to."],
      "Grrr is no. Woof is hi. Whine is sad. I'll save that.",
    ),
    line(
      "anna-here-is-the-ball",
      "Anna",
      [
        "Pozri, tu je jeho loptička. ",
        PAUSE,
        "Tu máš. Ty ju ",
        future("ponesieš"),
        " a Dunčo ",
        future("pôjde"),
        " za ňou.",
      ],
      "Look, here's his ball. Here you go. You'll carry it, and Dunčo will go after it.",
    ),
    line(
      "domo-park-other-dogs",
      "Domo",
      [
        future("Ponesiem"),
        " loptičku. ",
        PAUSE,
        "A v parku ",
        future("budú"),
        " iné psy? ",
        PAUSE,
        "To nie je v pláne.",
      ],
      "I'll carry the ball. And there will be other dogs in the park? That's not in the plan.",
    ),
    dog("dunco-bark-at-ball", "Haf!", "Woof!"),
    line(
      "anna-see-lets-go-to-park",
      "Anna",
      ["Vidíš? Haf! ", PAUSE, "Poďme do parku."],
      "See? Woof! Let's go to the park.",
      { to: "Domo" },
    ),
  ],
  checks: [
    {
      id: `${PREFIX}check-what-grrr-means`,
      prompt: "Čo znamená vrrr?",
      promptEnglish: "What does grrr mean?",
      replayLineId: `${PREFIX}anna-dog-dictionary`,
      choices: [
        { id: "no", label: "Nie." },
        {
          id: "hi",
          label: "Ahoj.",
          whyWrong: "**Ahoj** means hi, and in Dunčo's language that is **haf**.",
        },
        {
          id: "sad",
          label: "Som smutný.",
          whyWrong: "**Som smutný** means I'm sad: Anna says that is **kňu**.",
        },
      ],
      answerId: "no",
      feedback: {
        english: "Grrr means no.",
        why: "Anna says **vrrr znamená nie**. Keep the other two: **haf** is hi, **kňu** is sad.",
      },
    },
    {
      id: `${PREFIX}check-ponesies-form`,
      gap: "Tu máš. Ty ju ___ a Dunčo pôjde za ňou.",
      prompt: "Ktoré slovo povedala Anna?",
      promptEnglish: "Which word did Anna say?",
      replayLineId: `${PREFIX}anna-here-is-the-ball`,
      choices: [
        { id: "ponesies", label: "ponesieš" },
        {
          id: "nesies",
          label: "nesieš",
          whyWrong:
            "**Nesieš** is the present: you are carrying it now. Anna means at the park, later.",
        },
        {
          id: "ponesie",
          label: "ponesie",
          whyWrong:
            "**Ponesie** is he or she will carry. Anna hands the ball to Domo and says **ty**.",
        },
      ],
      answerId: "ponesies",
      feedback: {
        english: "You'll carry it, and Dunčo will go after it.",
        why: "One-trip motion verbs make the future with **po-**: **niesť** → **ponesieš**, as **ísť** → **pôjde**.",
      },
    },
  ],
};

const park: ListeningChapter = {
  id: `${PREFIX}park`,
  stage: "default",
  titleSk: "To nebolo v pláne",
  title: "That wasn't in the plan",
  lines: [
    card(
      "card-park",
      "Park pri Dunaji. Pol ôsmej.",
      "The park by the Danube. Half past seven.",
    ),
    line(
      "anna-throw-the-ball",
      "Anna",
      ["Tak, Domo. ", PAUSE, "Hoď loptičku!"],
      "Right, Domo. Throw the ball!",
      { props: [null, null] },
    ),
    line(
      "domo-twenty-metres",
      "Domo",
      [
        future("Hodím"),
        " loptičku. Dvadsať metrov. ",
        PAUSE,
        "Dunčo ",
        future("pobeží"),
        " za ňou.",
      ],
      "I'll throw the ball. Twenty metres. Dunčo will run after it.",
    ),
    dog("dunco-runs-barking", "Haf! Haf!", "Woof! Woof!"),
    line(
      "anna-now-he-will-bring-it",
      "Anna",
      ["Výborne! ", PAUSE, "A teraz ti ju ", future("prinesie"), "."],
      "Well done! And now he'll bring it to you.",
      { to: "Domo" },
    ),
    line(
      "domo-he-will-bring-it-to-you",
      "Domo",
      ["Nie. ", future("Prinesie"), " ju vám, pani Anna. ", PAUSE, "Dunčo ma nemá rád."],
      "No. He'll bring it to you, Anna. Dunčo doesn't like me.",
    ),
    line(
      "anna-he-brought-it-to-you",
      "Anna",
      ["Pozri! ", PAUSE, "Priniesol ju tebe!"],
      "Look! He brought it to you!",
    ),
    line(
      "domo-not-in-the-plan",
      "Domo",
      ["Mne? ", PAUSE, "To nebolo v pláne."],
      "To me? That wasn't in the plan.",
    ),
    dog("dunco-hello-bark", "Haf!", "Woof!"),
    line(
      "domo-hello-dunco",
      "Domo",
      ["Haf je ahoj. ", PAUSE, "Ahoj, Dunčo."],
      "Woof is hi. Hi, Dunčo.",
      { to: "Dunčo" },
    ),
    line(
      "anna-tell-marek",
      "Anna",
      [
        "Toto ",
        future("napíšem"),
        " Marekovi. ",
        PAUSE,
        "Večer si to ",
        future("prečíta"),
        ".",
      ],
      "I'm going to write this to Marek. He'll read it tonight.",
      { props: ["phone", null] },
    ),
  ],
  checks: [
    {
      id: `${PREFIX}check-who-gets-the-ball`,
      prompt: "Komu Dunčo priniesol loptičku?",
      promptEnglish: "Who did Dunčo bring the ball to?",
      replayLineId: `${PREFIX}anna-he-brought-it-to-you`,
      choices: [
        { id: "domo", label: "Domovi." },
        {
          id: "anna",
          label: "Anne.",
          whyWrong:
            "**Anne** means to Anna. That is what Domo expected, **prinesie ju vám**, but Anna says **priniesol ju tebe**.",
        },
        {
          id: "nobody",
          label: "Nikomu, nechal ju v parku.",
          whyWrong:
            "**Nikomu** means to nobody. He brought it back, and Domo is surprised: **mne?**",
        },
      ],
      answerId: "domo",
      feedback: {
        english: "Look! He brought it to you!",
        why: "Anna says **priniesol ju tebe**, and Domo answers **mne?** Dunčo likes him after all.",
      },
    },
    {
      id: `${PREFIX}check-pobezi-form`,
      gap: "Dunčo ___ za ňou.",
      prompt: "Ktoré slovo povedal Domo?",
      promptEnglish: "Which word did Domo say?",
      replayLineId: `${PREFIX}domo-twenty-metres`,
      choices: [
        { id: "pobezi", label: "pobeží" },
        {
          id: "bude-bezat",
          label: "bude bežať",
          whyWrong:
            "**Bude bežať** is running for a while. Domo means one run, after one ball: **pobeží**.",
        },
        {
          id: "bezi",
          label: "beží",
          whyWrong:
            "**Beží** is running now. The ball is still in Domo's hand: **hodím** is still to come.",
        },
      ],
      answerId: "pobezi",
      feedback: {
        english: "I'll throw the ball. Twenty metres. Dunčo will run after it.",
        why: "**Bežať** takes **po-** for one run in the future: **pobeží**, like **poletím** and **ponesiem**.",
      },
    },
  ],
};

const six: ListeningChapter = {
  id: `${PREFIX}six`,
  stage: "home",
  titleSk: "Šesť hodín",
  title: "Six o'clock",
  lines: [
    card(
      "card-saturday-six",
      "Sobota. Šesť hodín večer.",
      "Saturday. Six in the evening.",
    ),
    line(
      "domo-good-evening-dinner",
      "Domo",
      ["Dobrý večer, Dunčo. ", PAUSE, "Je šesť hodín. ", future("Uvarím"), " ti večeru."],
      "Good evening, Dunčo. It's six o'clock. I'll cook you dinner.",
    ),
    dog("dunco-whines-at-window", "Kňu…", "(whines)"),
    line(
      "domo-whine-is-sad",
      "Domo",
      ["Kňu je smutný. ", PAUSE, "Prečo si smutný, Dunčo?"],
      "Whine is sad. Why are you sad, Dunčo?",
    ),
    line(
      "domo-not-sick-has-ball",
      "Domo",
      [
        "Nie si chorý. ",
        PAUSE,
        "Granule máš. Loptičku máš. ",
        PAUSE,
        "A mňa už máš rád.",
      ],
      "You're not ill. You have your food. You have your ball. And you like me now.",
      { props: [null, null, null, null] },
    ),
    dog("dunco-whines-again", "Kňu…", "(whines)"),
    line(
      "domo-what-will-i-do",
      "Domo",
      ["Nerozumiem. ", PAUSE, "Čo ", future("budem robiť"), "?"],
      "I don't understand. What will I do?",
    ),
    line(
      "domo-why-is-he-sad-guess",
      "Domo",
      [
        "Je šesť hodín. ",
        PAUSE,
        "Dunčo sedí pri okne. ",
        PAUSE,
        "Prečo je smutný? ",
        PAUSE,
        "Hádajte s nami!",
      ],
      "It's six o'clock. Dunčo is sitting by the window. Why is he sad? Guess along with us!",
    ),
  ],
  checks: [
    {
      id: `${PREFIX}check-why-is-dunco-sad`,
      prompt: "Prečo je Dunčo smutný?",
      promptEnglish: "Why is Dunčo sad?",
      choices: [
        { id: "misses-marek", label: "Čaká na Mareka. Chýba mu." },
        {
          id: "ill",
          label: "Je chorý.",
          whyWrong:
            "**Je chorý** means he is ill. In the park he ran twenty metres after the ball, and Domo says **nie si chorý**.",
        },
        {
          id: "hungry",
          label: "Nemá granule.",
          whyWrong:
            "**Nemá granule** means he has no food. He has: **granule máš**, and Domo will cook him dinner too.",
        },
        {
          id: "domo",
          label: "Nemá rád Doma.",
          whyWrong:
            "**Nemá rád Doma** means he doesn't like Domo. In the park he brought the ball to Domo: **priniesol ju tebe**.",
        },
      ],
      answerId: "misses-marek",
      feedback: {
        english:
          "At six in the evening Dunčo always sits by the window. He waits for me.",
        why: "Marek said it on Friday: **večer o šiestej Dunčo vždy sedí pri okne. Čaká na mňa.** Marek is in London.",
      },
    },
    {
      id: `${PREFIX}check-uvarim-form`,
      gap: "Je šesť hodín. ___ ti večeru.",
      prompt: "Ktoré slovo povedal Domo?",
      promptEnglish: "Which word did Domo say?",
      replayLineId: `${PREFIX}domo-good-evening-dinner`,
      choices: [
        { id: "uvarim", label: "Uvarím" },
        {
          id: "budem-uvarit",
          label: "Budem uvariť",
          whyWrong:
            "**Budem** never goes with a perfective verb like **uvariť**. Its present form is already the future.",
        },
        {
          id: "varim",
          label: "Varím",
          whyWrong:
            "**Varím** is I am cooking, now. Domo means one dinner, done: **uvarím**.",
        },
      ],
      answerId: "uvarim",
      feedback: {
        english: "It's six o'clock. I'll cook you dinner.",
        why: "**Uvariť** is perfective, so **uvarím** means I will cook it, one dinner, finished.",
      },
    },
  ],
};

const change: ListeningChapter = {
  id: `${PREFIX}change`,
  stage: "home",
  titleSk: "Zmením plán",
  title: "I'll change the plan",
  lines: [
    card("card-five-minutes-later", "Päť minút neskôr.", "Five minutes later."),
    afterThinking(
      line(
        "domo-he-waits-for-marek",
        "Domo",
        ["Okno. ", PAUSE, "Šesť hodín. ", PAUSE, "Dunčo čaká na pána Mareka."],
        "The window. Six o'clock. Dunčo is waiting for Marek.",
      ),
    ),
    line(
      "domo-not-today",
      "Domo",
      [
        "Dunčo, pán Marek ",
        future("príde"),
        " v pondelok. ",
        PAUSE,
        "Dnes ",
        future("nepríde"),
        ". Ani zajtra.",
      ],
      "Dunčo, Marek is coming on Monday. He won't come today. Not tomorrow either.",
      { to: "Dunčo" },
    ),
    dog("dunco-whines-quietly", "Kňu…", "(whines)"),
    line(
      "domo-i-will-change-the-plan",
      "Domo",
      ["Dobre. ", PAUSE, future("Zmením"), " plán."],
      "All right. I'll change the plan.",
    ),
    line(
      "domo-i-will-wait-with-you",
      "Domo",
      [
        "Dnes ",
        future("nebudem upratovať"),
        ". ",
        PAUSE,
        future("Budem čakať"),
        " s tebou.",
      ],
      "Today I won't be cleaning. I'll wait with you.",
    ),
    line(
      "domo-tomorrow-too",
      "Domo",
      ["A zajtra o šiestej ", future("budeme čakať"), " znova. ", PAUSE, "Spolu."],
      "And tomorrow at six we'll wait again. Together.",
    ),
    dog("dunco-soft-bark", "Haf.", "Woof."),
    line(
      "domo-hi-or-thanks",
      "Domo",
      ["Haf je ahoj. ", PAUSE, "Alebo", STOP, PAUSE, "ďakujem?"],
      "Woof is hi. Or… thank you?",
    ),
  ],
  checks: [
    {
      id: `${PREFIX}check-what-domo-will-do`,
      prompt: "Čo bude Domo robiť dnes večer?",
      promptEnglish: "What will Domo do this evening?",
      replayLineId: `${PREFIX}domo-i-will-wait-with-you`,
      choices: [
        { id: "wait", label: "Bude čakať s Dunčom." },
        {
          id: "clean",
          label: "Bude upratovať.",
          whyWrong:
            "**Bude upratovať** was the plan. Now Domo says **dnes nebudem upratovať**.",
        },
        {
          id: "call",
          label: "Zavolá Marekovi.",
          whyWrong:
            "**Zavolá Marekovi** means he will call Marek. Domo does not call; he stays: **budem čakať s tebou**.",
        },
      ],
      answerId: "wait",
      feedback: {
        english: "Today I won't be cleaning. I'll wait with you.",
        why: "**Budem čakať** is **budem** + an imperfective verb: the time Domo will spend, not one task done.",
      },
    },
    {
      id: `${PREFIX}check-budeme-form`,
      gap: "A zajtra o šiestej ___ čakať znova.",
      prompt: "Ktoré slovo povedal Domo?",
      promptEnglish: "Which word did Domo say?",
      replayLineId: `${PREFIX}domo-tomorrow-too`,
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
        english: "And tomorrow at six we'll wait again. Together.",
        why: "**My budeme**: Domo and Dunčo, **spolu**. The **-me** ending is **we**, as in **pôjdeme**.",
      },
    },
  ],
};

const monday: ListeningChapter = {
  id: `${PREFIX}monday`,
  stage: "home",
  titleSk: "Všetko je v poriadku",
  title: "Everything is fine",
  lines: [
    card("card-monday-six", "Pondelok. Šesť hodín večer.", "Monday. Six in the evening."),
    line(
      "domo-six-we-wait",
      "Domo",
      ["Dunčo, je šesť hodín. ", PAUSE, future("Budeme čakať"), "."],
      "Dunčo, it's six o'clock. We'll wait.",
    ),
    line(
      "marek-good-evening-home",
      "Marek",
      ["Dobrý večer! ", PAUSE, "Som doma!"],
      "Good evening! I'm home!",
    ),
    dog("dunco-overjoyed", "Haf! Haf! Haf!", "Woof! Woof! Woof!"),
    line(
      "marek-missed-you-ball",
      "Marek",
      ["Ahoj, Dunčo! Aj ty si mi chýbal. ", PAUSE, "Pozri, tu je nová loptička."],
      "Hi, Dunčo! I missed you too. Look, here's a new ball.",
      { to: "Dunčo" },
    ),
    line(
      "marek-he-doesnt-want-ball",
      "Marek",
      [CHUCKLE, "Loptičku nechce. ", PAUSE, "Domo, ako ste sa mali?"],
      "He doesn't want the ball. Domo, how were you two?",
      { props: [null, null], to: "Domo" },
    ),
    line(
      "domo-plan-didnt-work",
      "Domo",
      [
        "Môj plán nefungoval, pán Marek. ",
        PAUSE,
        "Tak sme čakali. ",
        PAUSE,
        "Každý večer o šiestej. Pri okne.",
      ],
      "My plan didn't work, Mr Marek. So we waited. Every evening at six. By the window.",
    ),
    line(
      "marek-what-does-dunco-say",
      "Marek",
      ["Viem. Anna mi písala. ", PAUSE, "A čo hovorí Dunčo?"],
      "I know. Anna wrote to me. And what does Dunčo say?",
    ),
    dog("dunco-answers-marek", "Haf!", "Woof!"),
    line(
      "domo-everything-is-fine",
      "Domo",
      ["Haf. ", PAUSE, "To znamená: ", PAUSE, "všetko je v poriadku."],
      "Woof. That means: everything is fine.",
    ),
    card(
      "card-the-end",
      "Koniec. Ďakujeme, že počúvate.",
      "The end. Thank you for listening.",
    ),
  ],
  checks: [
    {
      id: `${PREFIX}check-what-dunco-wants`,
      prompt: "Čo chce Dunčo, keď príde Marek?",
      promptEnglish: "What does Dunčo want when Marek comes?",
      replayLineId: `${PREFIX}marek-he-doesnt-want-ball`,
      choices: [
        { id: "marek", label: "Mareka, nie loptičku." },
        {
          id: "ball",
          label: "Novú loptičku.",
          whyWrong:
            "**Novú loptičku** means the new ball, but Marek laughs: **loptičku nechce**.",
        },
        {
          id: "dinner",
          label: "Večeru.",
          whyWrong:
            "**Večeru** means dinner. Nobody talks about food: Dunčo barks three times for Marek.",
        },
      ],
      answerId: "marek",
      feedback: {
        english: "He doesn't want the ball.",
        why: "Marek says **loptičku nechce**: what Dunčo waited for was Marek himself.",
      },
    },
    {
      id: `${PREFIX}check-bude-to-je`,
      prompt: "V piatok Domo povedal: všetko bude v poriadku. Čo hovorí teraz?",
      promptEnglish:
        "On Friday Domo said: everything will be fine. What does he say now?",
      replayLineId: `${PREFIX}domo-everything-is-fine`,
      choices: [
        { id: "je", label: "Všetko je v poriadku." },
        {
          id: "bude",
          label: "Všetko bude v poriadku.",
          whyWrong:
            "**Bude** is the future, what Domo said on Friday. Marek is home now, so it is not later any more.",
        },
        {
          id: "bolo",
          label: "Všetko bolo v poriadku.",
          whyWrong:
            "**Bolo** is the past: was fine. Domo talks about now, with Marek at home.",
        },
      ],
      answerId: "je",
      feedback: {
        english: "Woof. That means: everything is fine.",
        why: "Friday's **bude** has come true: **všetko je v poriadku**. **Bude** is the future of **je**.",
      },
    },
  ],
};

export const futureTenseEpisode: ListeningEpisode = {
  id: "listening/future-tense",
  slug: "future-tense",
  number: 7,
  level: "A1–A2",
  titleSk: "Budem čakať s tebou",
  title: "I'll wait with you",
  topic: "budem, pôjdem, uvarím",
  promise:
    "A radio play. Marek flies to London and leaves his dog Dunčo with Domo, a robot with a plan for everything. You find out why Dunčo is sad before Domo does.",
  grammarSlug: "future-tense",
  speakers: ["Dunčo", "Anna", "Marek", "Domo", "Scene"],
  vocabulary: [
    { slovak: "pes", english: "dog" },
    { slovak: "loptička", english: "ball" },
    { slovak: "plán", english: "plan" },
    { slovak: "čakať", english: "to wait" },
    { slovak: "Budem čakať.", english: "I will wait." },
    { slovak: "Všetko bude v poriadku.", english: "Everything will be fine." },
  ],
  chapters: [plan, morning, park, six, change, monday],
};
