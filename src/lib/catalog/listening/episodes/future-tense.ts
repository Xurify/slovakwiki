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
  lines: [
    card(
      "card-friday-evening",
      "Piatok večer. U Mareka doma.",
      "Friday evening. At Marek's.",
    ),
    line(
      "marek-suitcase-passport",
      "Marek",
      ["No", STOP, "kufor mám, pas mám. ", PAUSE, "Hm, a kde je Domo?"],
      "Well… suitcase, check, passport, check. Hmm, and where's Domo?",
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
      "marek-flying-to-london",
      "Marek",
      [
        HAPPY,
        "Áno. Toto je Domo. ",
        PAUSE,
        "Zajtra ráno ",
        future("poletím"),
        " do Londýna. A Domo ",
        future("bude"),
        " tri dni s Dunčom.",
      ],
      "Yes. This is Domo. Tomorrow morning I'm flying to London. And Domo will be with Dunčo for three days.",
      { to: "Anna" },
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
        "V pondelok večer. ",
        PAUSE,
        "Každý večer o šiestej prichádzam z práce. ",
        PAUSE,
        "A Dunčo ma vždy čaká pri okne.",
      ],
      "On Monday evening. Every evening at six I come home from work. And Dunčo always waits for me by the window.",
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
        future("Budeš"),
        " dobrý?",
      ],
      "Dunčo… I'll miss you. Will you be good?",
      { to: "Dunčo" },
    ),
    dog("dunco-soft-bark-friday", "Haf.", "Woof.", "Marek"),
    line(
      "anna-both-will-be-fine",
      "Anna",
      ["Neboj sa, Marek. ", PAUSE, "Obaja ", future("budú"), " v poriadku."],
      "Don't worry, Marek. They'll both be fine.",
      { to: "Marek" },
    ),
  ],
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
        english: "And Domo will be with Dunčo for three days.",
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
  titleSk: "Psí slovník",
  title: "A dog dictionary",
  lines: [
    card(
      "card-saturday-seven",
      "Sobota. Sedem hodín ráno.",
      "Saturday. Seven in the morning.",
    ),
    line(
      "domo-good-morning-food",
      "Domo",
      ["Dobré ráno, Dunčo. ", PAUSE, "Tu sú granule."],
      "Good morning, Dunčo. Here's your food.",
      { to: "Dunčo" },
    ),
    dog("dunco-growls-morning", "Vrrr…", "Grrr…", "Domo"),
    line(
      "domo-no-such-language",
      "Domo",
      ["Nerozumiem. ", PAUSE, "Tento jazyk nemám."],
      "I don't understand. I don't have this language.",
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
      ["Pani Anna, Dunčo nechce jesť. ", PAUSE, "Robí vrrr."],
      "Anna, Dunčo won't eat. He goes grrr.",
      { to: "Anna" },
    ),
    line(
      "anna-dog-dictionary",
      "Anna",
      [
        CHUCKLE,
        "Vrrr znamená: ešte ťa nepoznám. ",
        PAUSE,
        "Haf znamená: ahoj. ",
        PAUSE,
        "A kňu",
        STOP,
        "to je smutný pes.",
      ],
      "Grrr means: I don't know you yet. Woof means: hi. And a whine… that's a sad dog.",
      { to: "Domo" },
    ),
    line(
      "domo-repeats-dictionary",
      "Domo",
      ["Vrrr: nepoznám ťa. Haf: ahoj. Kňu: smutný. ", PAUSE, future("Uložím"), " si to."],
      "Grrr: I don't know you. Woof: hi. Whine: sad. I'll save that.",
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
  checks: [
    {
      id: `${PREFIX}check-what-vrrr-means`,
      prompt: "Čo znamená vrrr?",
      promptEnglish: "What does grrr mean?",
      replayLineId: `${PREFIX}anna-dog-dictionary`,
      choices: [
        { id: "doesnt-know", label: "Ešte ťa nepoznám." },
        {
          id: "hungry",
          label: "Som hladný.",
          whyWrong:
            "**Som hladný** means I'm hungry. Dunčo has food and won't eat it: he doesn't know Domo yet.",
        },
        {
          id: "hi",
          label: "Ahoj.",
          whyWrong:
            "**Ahoj** is what **haf** means, Anna says. **Vrrr** is the other one.",
        },
      ],
      answerId: "doesnt-know",
      feedback: {
        english: "Grrr means: I don't know you yet.",
        why: "Anna says **vrrr znamená: ešte ťa nepoznám**. **Ešte** … **nepoznám** is not yet.",
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
  lines: [
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
    line("anna-look-he-runs", "Anna", [EXCITED, "Pozri, ako beží!"], "Look at him run!", {
      to: "Domo",
    }),
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
      [SURPRISED, "Mne? ", PAUSE, "Loptičku dáva mne?"],
      "To me? He's giving the ball to me?",
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
      ["Má ma rád. ", PAUSE, future("Uložím"), " si to."],
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
      [
        "No, ja už musím ísť do práce. ",
        PAUSE,
        "Večer ti ",
        future("napíšem"),
        ", dobre?",
      ],
      "Well, I have to go to work now. I'll text you in the evening, OK?",
      { props: guess(2), to: "Domo" },
    ),
    line(
      "domo-thank-you-anna",
      "Domo",
      ["Dobre. ", PAUSE, "Ďakujem, pani Anna."],
      "All right. Thank you, Anna.",
    ),
    line(
      "anna-bye-both",
      "Anna",
      ["Ahoj, Domo! ", PAUSE, "Ahoj, Dunčo!"],
      "Bye, Domo! Bye, Dunčo!",
      { props: guess(2) },
    ),
    dog("dunco-bye-anna", "Haf!", "Woof!", "Anna"),
  ],
  checks: [
    {
      id: `${PREFIX}check-who-gets-the-ball`,
      prompt: "Komu dal Dunčo loptičku?",
      promptEnglish: "Who did Dunčo give the ball to?",
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
        english: "To me? He's giving the ball to me?",
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
  lines: [
    card(
      "card-saturday-six",
      "Sobota. Šesť hodín večer.",
      "Saturday. Six in the evening.",
    ),
    dog("dunco-whines-at-six", "Kňu…", "(whines)", "Domo"),
    line(
      "domo-ill-cook-dinner",
      "Domo",
      ["Dunčo? Čo je? ", PAUSE, future("Uvarím"), " ti večeru, dobre?"],
      "Dunčo? What is it? I'll cook you dinner, OK?",
      { to: "Dunčo" },
    ),
    dog("dunco-whines-again", "Kňu…", "(whines)", "Domo"),
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
      [
        "Hm. Nie je chorý. ",
        PAUSE,
        "Kňu znamená smutný. ",
        PAUSE,
        "Ale prečo je smutný? ",
        PAUSE,
        "Hádajte s nami!",
      ],
      "Hmm. He isn't ill. A whine means sad. But why is he sad? Guess along with us!",
      { props: guess(4) },
    ),
  ],
  checks: [
    {
      id: `${PREFIX}check-why-is-dunco-sad`,
      prompt: "Prečo je Dunčo smutný?",
      promptEnglish: "Why is Dunčo sad?",
      choices: [
        { id: "misses-marek", label: "Je šesť hodín. Čaká na Mareka." },
        {
          id: "ill",
          label: "Je chorý.",
          whyWrong:
            "**Je chorý** means he is ill. In the morning he ran thirty metres after the ball, and Domo says **nie je chorý**.",
        },
        {
          id: "domo",
          label: "Nemá rád Doma.",
          whyWrong:
            "**Nemá rád Doma** means he doesn't like Domo. In the park he brought Domo the ball: **už ťa má rád**.",
        },
        {
          id: "hungry",
          label: "Je hladný.",
          whyWrong:
            "**Je hladný** means he is hungry. Domo offers dinner and Dunčo still whines.",
        },
      ],
      answerId: "misses-marek",
      feedback: {
        english:
          "Every evening at six I come home from work. And Dunčo always waits for me by the window.",
        why: "Marek said it on Friday: **každý večer o šiestej** … **Dunčo ma vždy čaká pri okne.** But Marek is in London.",
      },
    },
    {
      id: `${PREFIX}check-uvarim-form`,
      gap: "Dunčo? Čo je? ___ ti večeru, dobre?",
      prompt: "Ktoré slovo povedal Domo?",
      promptEnglish: "Which word did Domo say?",
      replayLineId: `${PREFIX}domo-ill-cook-dinner`,
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
        english: "I'll cook you dinner, OK?",
        why: "**Uvariť** is perfective, so **uvarím** means I will cook it, one dinner, finished.",
      },
    },
  ],
};

const atWindow: ListeningChapter = {
  id: `${PREFIX}window`,
  stage: "home",
  titleSk: "Budem čakať s tebou",
  title: "I'll wait with you",
  lines: [
    card(
      "card-a-moment-later",
      "O chvíľu neskôr. Je večer.",
      "A moment later. It's evening.",
    ),
    afterThinking(
      line(
        "domo-six-window-i-know",
        "Domo",
        ["Šesť hodín. ", PAUSE, "Okno. ", PAUSE, "Už viem!"],
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
    dog("dunco-whines-yes", "Kňu…", "(whines)", "Domo"),
    line(
      "domo-not-today",
      "Domo",
      [
        "Ale dnes ",
        future("nepríde"),
        ". Ani zajtra. ",
        PAUSE,
        future("Príde"),
        " až v pondelok.",
      ],
      "But he won't come today. Not tomorrow either. He's only coming on Monday.",
      { to: "Dunčo" },
    ),
    line(
      "domo-i-will-wait-with-you",
      "Domo",
      ["Poďme k oknu, Dunčo. ", PAUSE, future("Budem čakať"), " s tebou."],
      "Let's go to the window, Dunčo. I'll wait with you.",
      { to: "Dunčo" },
    ),
    dog("dunco-soft-bark-window", "Haf.", "Woof.", "Domo"),
    line(
      "domo-anna-writes",
      "Domo",
      [
        "Pani Anna píše. ",
        PAUSE,
        "Marek videl fotku. Smial sa. ",
        PAUSE,
        "Zajtra vám ",
        future("zavolá"),
        ".",
      ],
      "Anna's written. Marek saw the photo. He laughed. Tomorrow he'll call you both.",
      { props: guess(4), ring: "message" },
    ),
    line(
      "domo-we-will-wait-together",
      "Domo",
      [
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
  ],
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
            "**Pôjde do parku** means he will go to the park. That was the morning. Now Domo says **poďme k oknu**.",
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
        english: "Let's go to the window, Dunčo. I'll wait with you.",
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
  lines: [
    card("card-monday-six", "Pondelok. Šesť hodín večer.", "Monday. Six in the evening."),
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
      [EXCITED, "Dobrý večer! ", PAUSE, "Som doma!"],
      "Good evening! I'm home!",
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
      ["Domo, ako ste sa mali?"],
      "Domo, how did you two get on?",
      { to: "Domo" },
    ),
    line(
      "domo-we-waited-together",
      "Domo",
      [
        "Dobre, pán Marek. ",
        PAUSE,
        "Každý večer o šiestej sme čakali pri okne. ",
        PAUSE,
        "Spolu.",
      ],
      "Fine, Mr Marek. Every evening at six we waited by the window. Together.",
      { to: "Marek" },
    ),
    line(
      "marek-together-thank-you",
      "Marek",
      [SURPRISED, "Spolu? ", PAUSE, HAPPY, "Ďakujem, Domo."],
      "Together? Thank you, Domo.",
      { to: "Domo" },
    ),
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
    card(
      "card-the-end",
      "Koniec. Ďakujeme, že počúvate.",
      "The end. Thank you for listening.",
    ),
  ],
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
          label: "Domo uvaril večeru.",
          whyWrong:
            "**Uvaril večeru** means he cooked dinner. Nobody talks about food: Domo tells Marek where they were at six.",
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
        english: "Every evening at six we waited by the window. Together.",
        why: "Marek did not know: **sme čakali** … **spolu**. Dunčo was not alone at six.",
      },
    },
    {
      id: `${PREFIX}check-sme-cakali`,
      gap: "Každý večer o šiestej ___ pri okne.",
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
        english: "Every evening at six we waited by the window.",
        why: "Saturday's **budeme čakať** has come true, so now it is **sme čakali**: we waited.",
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
