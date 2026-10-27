import type { MarkedPart } from "$lib/learning/marked-text";
import { CHUCKLE, PAUSE, STOP, afterThinking, lineWriter } from "../dialogue";
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

const plate: ListeningChapter = {
  id: `${PREFIX}plate`,
  titleSk: "Prázdny tanier",
  title: "An empty plate",
  lines: [
    card(
      "card-studio-three",
      "Štvrtok. Tri hodiny popoludní. Štúdio Slovak Wiki.",
      "Thursday. Three in the afternoon. The Slovak Wiki studio.",
    ),
    line(
      "marek-cake-is-gone",
      "Marek",
      ["Anna! ", PAUSE, "Môj koláč je preč!"],
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
        " Lucia.",
      ],
      "In the morning Mária came from the school. At noon the waiter came from the café. And at one Lucia came.",
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
      "marek-no-time-hungry",
      "Marek",
      [past("Nemal som"), " čas. ", PAUSE, "Ráno ", past("som bol"), " veľmi hladný."],
      "I had no time. In the morning I was very hungry.",
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
  checks: [
    {
      id: `${PREFIX}check-what-is-gone`,
      prompt: "Čo je preč?",
      promptEnglish: "What is gone?",
      replayLineId: `${PREFIX}marek-cake-is-gone`,
      choices: [
        { id: "cake", label: "Marekov koláč." },
        {
          id: "keys",
          label: "Marekove kľúče.",
          whyWrong:
            "**Marekove kľúče** are Marek's keys. Not this time: **môj koláč je preč**.",
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
      gap: "Ráno som ___ veľmi hladný.",
      prompt: "Ktoré slovo povedal Marek?",
      promptEnglish: "Which word did Marek say?",
      replayLineId: `${PREFIX}marek-no-time-hungry`,
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
        english: "In the morning I was very hungry.",
        why: "A man says **bol som**; **som** stands second, after **ráno**.",
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

const school: ListeningChapter = {
  id: `${PREFIX}school`,
  stage: "registration",
  titleSk: "Boli ste v štúdiu?",
  title: "Mária: were you in the studio?",
  lines: [
    card(
      "card-school-half-past-three",
      "Jazyková škola. Pol štvrtej.",
      "The language school. Half past three.",
    ),
    line(
      "anna-question-for-maria",
      "Anna",
      ["Dobrý deň, pani Mária. Mám pre vás otázku."],
      "Good day, Mária. I have a question for you.",
      { to: "Mária" },
    ),
    line(
      "maria-ask-away",
      "Mária",
      ["Dobrý deň, Anna. Pýtajte sa."],
      "Good day, Anna. Ask away.",
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
      { props: [null, null] },
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
        past("som pracovala"),
        " tu.",
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
      "maria-marek-was-hungry",
      "Mária",
      [
        "Prosím. ",
        PAUSE,
        "A Anna",
        STOP,
        PAUSE,
        "Marek ",
        past("bol"),
        " ráno veľmi hladný.",
      ],
      "You're welcome. And Anna… Marek was very hungry in the morning.",
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

const cafe: ListeningChapter = {
  id: `${PREFIX}cafe`,
  stage: "cafe",
  titleSk: "Pozeral na koláč",
  title: "The waiter: he was looking at the cake",
  lines: [
    card("card-cafe-four", "Kaviareň. Štyri hodiny.", "The café. Four o'clock."),
    line(
      "anna-you-were-in-studio",
      "Anna",
      ["Dobrý deň. ", PAUSE, "Vy ", past("ste dnes boli"), " u nás v štúdiu, áno?"],
      "Good day. You were at our studio today, right?",
      { to: "Waiter" },
    ),
    line(
      "waiter-brought-coffee",
      "Waiter",
      ["Dobrý deň! Áno, na obed. ", PAUSE, past("Priniesol som"), " kávu pre Mareka."],
      "Good day! Yes, at noon. I brought a coffee for Marek.",
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
        past("pozeral"),
        " na koláč.",
      ],
      "I did. It was on the table, still whole. And Marek was sitting at the table, looking at the cake.",
    ),
    line(
      "anna-looked-at-cake",
      "Anna",
      [past("Pozeral"), " na koláč?"],
      "Looking at the cake?",
    ),
    line(
      "waiter-long-then-back",
      "Waiter",
      ["Áno. Dlho. ", PAUSE, "Potom ", past("som išiel"), " späť do kaviarne."],
      "Yes. For a long time. Then I went back to the café.",
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
      ["Ja? Nie! ", PAUSE, "Nič ", past("som nejedol"), ". Ja mám koláče tu."],
      "Me? No! I ate nothing. I have my cakes here.",
    ),
    line(
      "anna-true-to-market",
      "Anna",
      ["Pravda. Ďakujem. ", PAUSE, "Teraz na trh, za Luciou."],
      "True. Thank you. Now to the market, to see Lucia.",
    ),
  ],
  checks: [
    {
      id: `${PREFIX}check-what-marek-did-at-noon`,
      prompt: "Čo robil Marek na obed?",
      promptEnglish: "What was Marek doing at noon?",
      replayLineId: `${PREFIX}waiter-marek-looked-at-cake`,
      choices: [
        { id: "looked", label: "Sedel pri stole a pozeral na koláč." },
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
        why: "Third person needs no **som**: **Marek sedel a pozeral**.",
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

const market: ListeningChapter = {
  id: `${PREFIX}market`,
  stage: "market",
  titleSk: "Už len polovica",
  title: "Lucia: only half of it",
  lines: [
    card("card-market-half-past-four", "Trh. Pol piatej.", "The market. Half past four."),
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
      "lucia-marek-alone-not-hungry",
      "Lucia",
      [
        "Áno. A Marek ",
        past("bol"),
        " sám. ",
        PAUSE,
        past("Povedal"),
        ", že už nemá hlad.",
      ],
      "Yes. And Marek was alone. He said he wasn't hungry any more.",
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
      replayLineId: `${PREFIX}lucia-marek-alone-not-hungry`,
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
        english: "He said he wasn't hungry any more.",
        why: "Lucia says **povedal, že už nemá hlad**: **povedal** is past, what he said stays present.",
      },
    },
  ],
};

const whodunit: ListeningChapter = {
  id: `${PREFIX}whodunit`,
  titleSk: "Kto to bol?",
  title: "Who was it? The clues, and your turn",
  lines: [
    card("card-studio-five", "Štúdio. Päť hodín.", "The studio. Five o'clock."),
    line(
      "anna-sit-down-what-we-know",
      "Anna",
      ["Marek, sadni si. ", PAUSE, "Toto vieme."],
      "Marek, sit down. This is what we know.",
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
        past("pozeral"),
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
    line(
      "anna-nobody-ate",
      "Anna",
      [
        "Mária ",
        past("nejedla"),
        ". Čašník ",
        past("nejedol"),
        ". Lucia ",
        past("nejedla"),
        ". ",
        PAUSE,
        "A ja ",
        past("som bola"),
        " celý deň v meste.",
      ],
      "Mária didn't eat. The waiter didn't eat. Lucia didn't eat. And I was in town all day.",
    ),
    line(
      "anna-so-who-guess",
      "Anna",
      [
        "Tak kto ",
        past("bol"),
        " v štúdiu celý deň? ",
        PAUSE,
        "Kto ",
        past("bol"),
        " ráno hladný a na obed už nie? ",
        PAUSE,
        "Hádajte s nami!",
      ],
      "So who was in the studio all day? Who was hungry in the morning and not any more at noon? Guess along with us!",
    ),
    line("marek-hm-dont-know", "Marek", ["Hm… ", PAUSE, "neviem."], "Hmm… I don't know."),
  ],
  checks: [
    {
      id: `${PREFIX}check-who-ate-the-cake`,
      prompt: "Kto zjedol koláč?",
      promptEnglish: "Who ate the cake?",
      choices: [
        { id: "marek", label: "Marek." },
        {
          id: "lucia",
          label: "Lucia.",
          whyWrong:
            "**Lucia** was there five minutes, took her umbrella and went home. Half the cake was already gone when she came.",
        },
        {
          id: "maria",
          label: "Mária.",
          whyWrong:
            "**Mária** was there at nine, said no to a piece, and worked at the school all day.",
        },
        {
          id: "waiter",
          label: "Čašník.",
          whyWrong:
            "**Čašník** brought a coffee and went back to the café: **nič som nejedol**. He has his own cakes.",
        },
      ],
      answerId: "marek",
      feedback: {
        english:
          "Who was in the studio all day? Who was hungry in the morning and not any more at noon?",
        why: "Marek **bol v štúdiu celý deň**, **bol ráno hladný**, and at one **už nemal hlad**. Everyone else has an alibi.",
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

const closed: ListeningChapter = {
  id: `${PREFIX}closed`,
  titleSk: "Prípad uzavretý",
  title: "Case closed",
  lines: [
    card("card-five-minutes-later", "Päť minút neskôr.", "Five minutes later."),
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
          " hladný. Na obed ",
          past("si už nemal"),
          " hlad.",
        ],
        "Marek. You were in the studio all day. In the morning you were hungry. At noon you weren't hungry any more.",
      ),
    ),
    line(
      "anna-give-me-your-bag",
      "Anna",
      ["A tvoja taška. ", PAUSE, "Daj mi ju, prosím."],
      "And your bag. Give it to me, please.",
      { props: [null, null] },
    ),
    line("marek-here-is-the-bag", "Marek", ["Nech sa páči."], "Here you are.", {
      props: [null],
    }),
    line(
      "anna-crumbs-in-the-bag",
      "Anna",
      ["Hm", STOP, PAUSE, "Omrvinky."],
      "Hmm… Crumbs.",
      { gestures: ["show", "stress"] },
    ),
    line(
      "marek-maybe-i-ate-it",
      "Marek",
      [
        "Omrvinky",
        STOP,
        PAUSE,
        "Počkaj",
        STOP,
        PAUSE,
        "Možno ",
        past("som"),
        " ho ",
        past("zjedol"),
        " ja?",
      ],
      "Crumbs… Wait… Maybe I did eat it?",
    ),
    line(
      "anna-do-you-remember",
      "Anna",
      ["Ty. ", PAUSE, "Spomínaš si?"],
      "You. Do you remember?",
    ),
    line(
      "marek-small-piece",
      "Marek",
      [
        "Hm",
        STOP,
        PAUSE,
        "Ráno ",
        past("som pracoval"),
        STOP,
        PAUSE,
        "a ",
        past("mal som"),
        " hlad. ",
        PAUSE,
        past("Vzal som si"),
        STOP,
        PAUSE,
        "malý kúsok. ",
        PAUSE,
        "Len jeden.",
      ],
      "Hmm… In the morning I was working… and I was hungry. I took… a small piece. Just one.",
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
    line("anna-so-the-whole-cake", "Anna", ["Takže celý koláč."], "So the whole cake."),
    line(
      "marek-didnt-even-notice",
      "Marek",
      [
        "Celý koláč. ",
        PAUSE,
        "Prepáč, Anna. ",
        PAUSE,
        "Ja ",
        past("som si"),
        " to ani ",
        past("nevšimol"),
        ".",
      ],
      "The whole cake. Sorry, Anna. I didn't even notice.",
    ),
    line(
      "anna-case-closed",
      "Anna",
      ["Prípad uzavretý. ", PAUSE, "Zajtra koláč kupujem ja. A schovám ho."],
      "Case closed. Tomorrow I'm buying the cake. And I'm hiding it.",
    ),
    line("marek-where", "Marek", ["Kam?"], "Where?"),
    line(
      "anna-wont-tell-you",
      "Anna",
      [CHUCKLE, "To ti nepoviem."],
      "I'm not telling you.",
    ),
    card(
      "card-the-end",
      "Koniec. Ďakujeme, že počúvate.",
      "The end. Thank you for listening.",
    ),
  ],
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
        english: "In the morning I was working and I was hungry. I took a small piece.",
        why: "Marek says **vzal som si malý kúsok**: **som** second, then **si**, as in **vzala som si** earlier.",
      },
    },
    {
      id: `${PREFIX}check-nevsimol-form`,
      gap: "Ja som si to ani ___.",
      prompt: "Ktoré slovo povedal Marek?",
      promptEnglish: "Which word did Marek say?",
      replayLineId: `${PREFIX}marek-didnt-even-notice`,
      choices: [
        { id: "nevsimol", label: "nevšimol" },
        {
          id: "nevsimla",
          label: "nevšimla",
          whyWrong: "**Nevšimla** is what a woman says. Marek is a man: **nevšimol**.",
        },
        {
          id: "nie-vsimol",
          label: "nie všimol",
          whyWrong:
            "**Ne-** joins the **-l** form: **nevšimol**. Only present **byť** keeps **nie** apart.",
        },
      ],
      answerId: "nevsimol",
      feedback: {
        english: "I didn't even notice.",
        why: "**Všimnúť si** keeps its **si**, and the **-l** form for a man is **všimol**: **nevšimol som si**.",
      },
    },
  ],
};

export const pastTenseEpisode: ListeningEpisode = {
  id: "listening/past-tense",
  slug: "past-tense",
  number: 4,
  level: "A1–A2",
  titleSk: "Kto zjedol koláč?",
  title: "Who ate the cake?",
  topic: "bol, bola, boli",
  promise:
    "A detective story. Marek's poppy-seed cake is gone, and Anna questions everyone who was in the studio today. You name the culprit before she does.",
  grammarSlug: "past-tense",
  speakers: ["Anna", "Marek", "Mária", "Waiter", "Lucia", "Scene"],
  vocabulary: [
    { slovak: "koláč", english: "cake" },
    { slovak: "tanier", english: "plate" },
    { slovak: "polovica", english: "half" },
    { slovak: "omrvinky", english: "crumbs" },
    {
      slovak: "Kde si bol? Kde si bola?",
      english: "Where were you? (to a man, to a woman)",
    },
    { slovak: "Čo sa stalo?", english: "What happened?" },
  ],
  chapters: [plate, school, cafe, market, whodunit, closed],
};
