import { lemmaToSlug } from "$lib/catalog/frequency";
import { listedCharacters } from "$lib/catalog/lessons/character-ids";
import type { DialogueTurn } from "$lib/learning/types";
import {
  withLineIds,
  type Said,
  type Talk,
  type TalkReaction,
  type TalkReply,
} from "./talk";

/**
 * A day on the square: four people cross it, each at another hour, and
 * Alex talks with each about one thing. Friends get ty and Ahoj; the shop
 * assistant and the lady from the language school get vy and Dobrý deň.
 * The talks branch on what Alex says, and a slip is answered the way that
 * person would: Marek laughs, Lucia and pani Mária stiffen or ask back.
 */

/** A reply that fits and where it leads. */
function fit(slovak: string, english: string, next?: string): TalkReply {
  return { line: { english, slovak }, next };
}

/** A reply that does not fit: why, how it is taken, and what the other person says to it. */
function slip(
  slovak: string,
  english: string,
  why: string,
  reaction: TalkReaction,
  answer?: [slovak: string, english: string],
): TalkReply {
  return {
    line: { english, slovak },
    miss: { answer: answer && { english: answer[1], slovak: answer[0] }, reaction, why },
  };
}

function say(slovak: string, english: string): Said {
  return { english, slovak };
}

const marek: Talk = {
  id: "day-marek",
  name: "Čo robíš cez víkend?",
  intro: say(
    "Ráno. Prichádza Marek, tvoj kamarát.",
    "Morning. Here comes Marek, your friend.",
  ),
  setting: "plaza",
  time: "morning",
  topic: "Plans for the weekend",
  who: "marek",
  nodes: [
    {
      id: "hello",
      says: [],
      replies: [
        fit("Ahoj, Marek!", "Hi, Marek!", "how"),
        slip(
          "Dobrý deň, Marek.",
          "Good day, Marek.",
          "**Dobrý deň** is for people you say vy to. Marek is your friend: **Ahoj**.",
          "laugh",
          ["Dobrý deň? Prečo tak formálne? Ahoj!", "Good day? Why so formal? Hi!"],
        ),
        fit("Čau, Marek!", "Hi, Marek!", "how"),
        slip(
          "Dobrú noc, Marek.",
          "Good night, Marek.",
          "**Dobrú noc** is a goodbye for the night, never a hello. In the morning, to a friend: **Ahoj**.",
          "puzzle",
          ["Dobrú noc? Veď je ráno!", "Good night? But it's morning!"],
        ),
      ],
    },
    {
      id: "how",
      says: [
        say(
          "Ahoj, Alex! Ako sa máš? Vyzeráš trochu unavene.",
          "Hi, Alex! How are you? You look a bit tired.",
        ),
      ],
      replies: [
        slip(
          "Mám sa dobre, ďakujem. A vy?",
          "I'm fine, thanks. And you?",
          "**A vy?** is for people you say vy to. Marek is a friend: **A ty?**",
          "laugh",
          ["A vy? Alex, veď sme kamaráti!", "And you (formal)? Alex, we're friends!"],
        ),
        fit("Mám sa dobre, ďakujem. A ty?", "I'm fine, thanks. And you?", "good"),
        fit(
          "Som trochu unavený. Málo som spal.",
          "I'm a bit tired. I didn't sleep much.",
          "tired",
        ),
        slip(
          "Som trochu unavená.",
          "I'm a bit tired.",
          "**Unavená** is the feminine form. Alex is a man: **unavený**.",
          "laugh",
          ["Unavená? Myslíš unavený, nie?", "Unavená? You mean unavený, right?"],
        ),
      ],
    },
    {
      id: "good",
      says: [
        say(
          "Aj ja, ďakujem. Počuj, čo robíš cez víkend? Ja idem v sobotu do Tatier.",
          "Me too, thanks. Listen, what are you doing at the weekend? I'm going to the Tatras on Saturday.",
        ),
      ],
      replies: weekendReplies(),
    },
    {
      id: "tired",
      says: [
        say(
          "Chudák. Daj si kávu! Počuj, a čo robíš cez víkend? Ja idem v sobotu do Tatier.",
          "Poor you. Have a coffee! Listen, what are you doing at the weekend? I'm going to the Tatras on Saturday.",
        ),
      ],
      replies: weekendReplies(),
    },
    {
      id: "trip",
      says: [
        say(
          "Jasné, poď! Vlak ide o siedmej ráno z hlavnej stanice. Nezabudni si teplú bundu, hore je zima.",
          "Sure, come! The train leaves at seven in the morning from the main station. Don't forget a warm jacket, it's cold up there.",
        ),
      ],
      replies: [
        fit(
          "Dobre. O siedmej som na stanici.",
          "OK. I'll be at the station at seven.",
          "trip-bye",
        ),
        slip(
          "Dobre. O sedem som na stanici.",
          "OK. I'll be at the station at seven.",
          "Times take **o** and the ordinal: **o siedmej**, at seven.",
          "puzzle",
          ["O siedmej, áno.", "At seven, yes."],
        ),
        fit(
          "O siedmej? To je skoro! Ale dobre.",
          "At seven? That's early! But OK.",
          "trip-bye",
        ),
      ],
    },
    {
      id: "study",
      says: [
        say(
          "Škoda! Tak možno inokedy. A čo sa učíš? Slovenčinu?",
          "Pity! Another time, then. And what are you studying? Slovak?",
        ),
      ],
      replies: [
        slip(
          "Áno, slovenský.",
          "Yes, Slovak.",
          "**Slovenský** is the adjective, as in a Slovak book. The language is **slovenčina**, and after **učiť sa**, **slovenčinu**.",
          "puzzle",
          ["Slovenský? Myslíš slovenčinu?", "Slovenský? You mean Slovak, the language?"],
        ),
        fit(
          "Áno, slovenčinu. Mám v pondelok test.",
          "Yes, Slovak. I have a test on Monday.",
          "study-bye",
        ),
        fit(
          "Áno. Slovenčina je ťažká, ale pekná.",
          "Yes. Slovak is hard, but beautiful.",
          "study-bye",
        ),
      ],
    },
    {
      id: "trip-bye",
      says: [
        say(
          "Super, teším sa! Tak v sobotu o siedmej. Už musím ísť do práce.",
          "Great, I'm looking forward to it! Saturday at seven, then. I have to go to work now.",
        ),
      ],
      replies: [
        fit("Ahoj, maj sa!", "Bye, take care!", "trip-end"),
        slip(
          "Dovidenia, pán Marek.",
          "Goodbye, Mr Marek.",
          "**Dovidenia** and **pán** are for people you say vy to. To a friend: **Ahoj, maj sa!**",
          "laugh",
          ["Pán Marek? Ahoj, Alex!", "Mr Marek? Bye, Alex!"],
        ),
        fit("Čau, uvidíme sa v sobotu!", "Bye, see you on Saturday!", "trip-end"),
      ],
    },
    {
      id: "study-bye",
      says: [
        say(
          "Tak veľa šťastia na teste! Už musím ísť do práce.",
          "Good luck with the test, then! I have to go to work now.",
        ),
      ],
      replies: [
        slip(
          "Ďakujem! Majte sa!",
          "Thanks! Take care!",
          "**Majte sa** is for vy, or for more than one. To one friend: **Maj sa**.",
          "laugh",
          [
            "Majte sa? Som len jeden! Maj sa!",
            "Majte sa? There's only one of me! Take care!",
          ],
        ),
        fit("Ďakujem! Maj sa!", "Thanks! Take care!", "study-end"),
        fit("Vďaka! Ahoj!", "Thanks! Bye!", "study-end"),
      ],
    },
    { id: "trip-end", says: [say("Maj sa, Alex!", "Take care, Alex!")] },
    { id: "study-end", says: [say("Ahoj, Alex! Maj sa!", "Bye, Alex! Take care!")] },
  ],
};

function weekendReplies(): TalkReply[] {
  return [
    fit("To je super! Môžem ísť s tebou?", "That's great! Can I come with you?", "trip"),
    slip(
      "To je super! Môžem ísť s vami?",
      "That's great! Can I come with you?",
      "**S vami** is with you for vy, or with more than one. Marek goes alone and is your friend: **s tebou**.",
      "laugh",
      [
        "S vami? Idem sám. Ale poď so mnou!",
        "With you all? I'm going alone. But come with me!",
      ],
    ),
    fit("Ja som doma. Musím sa učiť.", "I'm at home. I have to study.", "study"),
    slip(
      "Aj ja idem v Tatrách!",
      "I'm going to the Tatras too!",
      "**V Tatrách** says where you are. Going there is **do Tatier**.",
      "puzzle",
      ["V Tatrách? Myslíš do Tatier?", "In the Tatras? You mean to the Tatras?"],
    ),
  ];
}

const lucia: Talk = {
  id: "day-lucia",
  name: "Idete k nám do obchodu?",
  intro: say(
    "Popoludnie. Prichádza Lucia, predavačka z obchodu na námestí. Nie je to kamarátka.",
    "Afternoon. Here comes Lucia, the shop assistant from the shop on the square. Not a friend.",
  ),
  setting: "plaza",
  time: "day",
  topic: "At the shop",
  who: "lucia",
  nodes: [
    {
      id: "hello",
      says: [],
      replies: [
        slip(
          "Ahoj, Lucia!",
          "Hi, Lucia!",
          "**Ahoj** is for friends. Lucia is the shop assistant, so vy and **Dobrý deň**.",
          "frown",
          ["Ehm… dobrý deň.", "Er… good afternoon."],
        ),
        fit("Dobrý deň!", "Good afternoon!", "shop"),
        slip(
          "Dobrý večer!",
          "Good evening!",
          "**Dobrý večer** is for the evening. In the afternoon: **Dobrý deň**.",
          "puzzle",
          [
            "Dobrý deň. Ešte je len popoludnie.",
            "Good afternoon. It's only the afternoon.",
          ],
        ),
      ],
    },
    {
      id: "shop",
      says: [
        say(
          "Dobrý deň! Idete k nám do obchodu? Dnes máme čerstvý chlieb a rožky z pekárne.",
          "Good afternoon! Are you coming to our shop? Today we have fresh bread and rolls from the bakery.",
        ),
      ],
      replies: [
        fit("Áno, potrebujem chlieb a mlieko.", "Yes, I need bread and milk.", "inside"),
        slip(
          "Áno, potrebuje chlieb a mlieko.",
          "Yes, he needs bread and milk.",
          "**Potrebuje** is he or she needs. About yourself: **potrebujem**.",
          "puzzle",
          ["Kto potrebuje? Vy?", "Who needs it? You?"],
        ),
        fit(
          "Dnes nie, ďakujem. Idem domov.",
          "Not today, thanks. I'm going home.",
          "later",
        ),
        slip(
          "Dnes nie, ďakujem. Maj sa.",
          "Not today, thanks. Take care.",
          "**Maj sa** is for friends. To Lucia, with vy: **Dovidenia**.",
          "frown",
          ["Ehm… dovidenia?", "Er… goodbye?"],
        ),
      ],
    },
    {
      id: "inside",
      says: [
        say(
          "Výborne. Chlieb je ešte teplý a mlieko máme v chladničke vzadu. Potrebujete ešte niečo?",
          "Excellent. The bread is still warm, and the milk is in the fridge at the back. Do you need anything else?",
        ),
      ],
      replies: [
        fit(
          "Áno, ešte syr, prosím. Koľko stojí?",
          "Yes, some cheese too, please. How much is it?",
          "cheese",
        ),
        slip(
          "Áno, ešte syr, prosím. Koľko stojíš?",
          "Yes, some cheese too, please. How much are you?",
          "**Koľko stojíš?** asks what *you* cost. The cheese costs: **Koľko stojí?**",
          "laugh",
          ["Ja? Ja nie som na predaj!", "Me? I'm not for sale!"],
        ),
        fit("Nie, ďakujem. To je všetko.", "No, thanks. That's all.", "pay"),
        slip(
          "Nie, ďakujem. To sú všetci.",
          "No, thanks. That's everyone.",
          "**Všetci** means everyone. Nothing more is **To je všetko**.",
          "puzzle",
          ["Všetci? Aha, to je všetko?", "Everyone? Oh, that's all?"],
        ),
      ],
    },
    {
      id: "cheese",
      says: [
        say(
          "Tento syr stojí tri eurá. Ten údený stojí štyri.",
          "This cheese costs three euros. The smoked one costs four.",
        ),
      ],
      replies: [
        fit("Dám si ten údený, prosím.", "I'll take the smoked one, please.", "pay"),
        slip(
          "Dám si tú údenú, prosím.",
          "I'll take the smoked one, please.",
          "**Syr** is masculine, so **ten údený**. **Tú údenú** would be for a feminine noun.",
          "puzzle",
          ["Ten údený? Nech sa páči.", "The smoked one? Here you are."],
        ),
        fit(
          "Tak ten za tri eurá, prosím.",
          "The one for three euros, then, please.",
          "pay",
        ),
        slip(
          "Dám si tri eurá.",
          "I'll have three euros.",
          "That orders the money, not the cheese: **ten za tri eurá**, the one for three euros.",
          "puzzle",
          [
            "Tri eurá? Myslíte syr za tri eurá?",
            "Three euros? You mean the cheese for three euros?",
          ],
        ),
      ],
    },
    {
      id: "pay",
      says: [
        say(
          "Môžete platiť kartou alebo v hotovosti. Pokladňa je hneď pri dverách.",
          "You can pay by card or in cash. The till is right by the door.",
        ),
      ],
      replies: [
        fit("Zaplatím kartou.", "I'll pay by card.", "bye"),
        slip(
          "Zaplatím karta.",
          "I'll pay card.",
          "Paying with something takes the instrumental: **kartou**, by card.",
          "puzzle",
          ["Kartou? Áno, samozrejme.", "By card? Yes, of course."],
        ),
        fit("Zaplatím v hotovosti.", "I'll pay in cash.", "bye"),
      ],
    },
    {
      id: "later",
      says: [
        say(
          "Dobre. Zajtra otvárame o siedmej, tak príďte ráno, keď je chlieb najčerstvejší.",
          "All right. Tomorrow we open at seven, so come in the morning, when the bread is freshest.",
        ),
      ],
      replies: [
        fit("Ďakujem, prídem ráno.", "Thanks, I'll come in the morning.", "bye"),
        slip(
          "Ďakujem, prídem v siedmej.",
          "Thanks, I'll come at seven.",
          "Times take **o**: **o siedmej**, at seven.",
          "puzzle",
          ["O siedmej, áno.", "At seven, yes."],
        ),
        fit("O siedmej? Dobre, ďakujem.", "At seven? All right, thanks.", "bye"),
      ],
    },
    {
      id: "bye",
      says: [say("Ďakujem. Prajem vám pekný deň!", "Thank you. Have a nice day!")],
      replies: [
        fit("Ďakujem, aj vám. Dovidenia!", "Thanks, you too. Goodbye!", "end"),
        slip(
          "Ďakujem, aj tebe. Ahoj!",
          "Thanks, you too. Bye!",
          "**Tebe** and **Ahoj** are for friends. To Lucia: **aj vám**, **Dovidenia**.",
          "frown",
          ["Ehm… aj vám. Dovidenia.", "Er… you too. Goodbye."],
        ),
        fit("Dovidenia!", "Goodbye!", "end"),
        slip(
          "Dobrú noc!",
          "Good night!",
          "**Dobrú noc** is for parting at night. In the afternoon: **Dovidenia**.",
          "puzzle",
          ["Dobrú noc? Je predsa popoludnie.", "Good night? But it's the afternoon."],
        ),
      ],
    },
    { id: "end", says: [say("Dovidenia!", "Goodbye!")] },
  ],
};

const anna: Talk = {
  id: "day-anna",
  name: "Ideš so mnou?",
  intro: say(
    "Večer. Prichádza Anna, tvoja kamarátka.",
    "Evening. Here comes Anna, your friend.",
  ),
  setting: "plaza",
  time: "evening",
  topic: "An evening at the cinema",
  who: "anna",
  nodes: [
    {
      id: "hello",
      says: [],
      replies: [
        slip(
          "Dobrý večer, Anna.",
          "Good evening, Anna.",
          "**Dobrý večer** is for people you say vy to. Anna is your friend: **Ahoj** or **Čau**.",
          "laugh",
          [
            "Dobrý večer? Ty si dnes nejaký formálny!",
            "Good evening? You're very formal today!",
          ],
        ),
        fit("Ahoj, Anna!", "Hi, Anna!", "cinema"),
        fit("Čau!", "Hi!", "cinema"),
        slip(
          "Dobrú noc, Anna.",
          "Good night, Anna.",
          "**Dobrú noc** is a goodbye for the night, never a hello. To a friend: **Ahoj**.",
          "puzzle",
          ["Dobrú noc? Veď sa len stretávame!", "Good night? We've only just met!"],
        ),
      ],
    },
    {
      id: "cinema",
      says: [
        say(
          "Ahoj, Alex! Počuj, dnes večer dávajú v kine novú slovenskú komédiu. Ideš so mnou?",
          "Hi, Alex! Listen, there's a new Slovak comedy on at the cinema tonight. Are you coming with me?",
        ),
      ],
      replies: [
        fit(
          "Áno, rád! O koľkej to začína?",
          "Yes, I'd love to! What time does it start?",
          "time",
        ),
        slip(
          "Áno, rada!",
          "Yes, I'd love to!",
          "**Rada** is the feminine form. A man says **rád**.",
          "laugh",
          ["Rada? Myslíš rád, nie?", "Rada? You mean rád, don't you?"],
        ),
        fit(
          "Dnes nemôžem. Môžeme ísť zajtra?",
          "I can't tonight. Can we go tomorrow?",
          "tomorrow",
        ),
        slip(
          "Áno! O koľko to začína?",
          "Yes! What time does it start?",
          "Asking the time it starts is **O koľkej?**",
          "puzzle",
          ["O koľkej? O ôsmej.", "What time? At eight."],
        ),
      ],
    },
    {
      id: "time",
      says: [
        say(
          "O ôsmej. Lístky kúpim ja a ty kúpiš popcorn, dobre?",
          "At eight. I'll buy the tickets and you buy the popcorn, OK?",
        ),
      ],
      replies: [
        fit("Dobre, kúpim veľký popcorn.", "OK, I'll buy a big popcorn.", "meet"),
        slip(
          "Dobre, kúpiš popcorn.",
          "OK, you'll buy the popcorn.",
          "**Kúpiš** is you will buy. About yourself: **kúpim**.",
          "laugh",
          ["Nie, nie, ty kúpiš popcorn!", "No, no, you're buying the popcorn!"],
        ),
        fit("Dobre. Kde sa stretneme?", "OK. Where shall we meet?", "meet"),
        slip(
          "Dobre, kúpim veľká popcorn.",
          "OK, I'll buy a big popcorn.",
          "**Popcorn** is masculine, so **veľký popcorn**.",
          "puzzle",
          ["Veľký popcorn? Super.", "A big popcorn? Great."],
        ),
      ],
    },
    {
      id: "tomorrow",
      says: [
        say(
          "Zajtra? Zajtra mám tréning do siedmej. Ale potom môžem. Čo povieš na deviatu?",
          "Tomorrow? Tomorrow I have training until seven. But after that I can. What about nine?",
        ),
      ],
      replies: [
        fit("O deviatej? Super.", "At nine? Great.", "meet"),
        slip(
          "Áno, zajtra nemôžem.",
          "Yes, I can't tomorrow.",
          "**Nemôžem** means I can't, so it turns her down again. To say yes: **O deviatej? Super.**",
          "puzzle",
          ["Nemôžeš? Tak kedy môžeš?", "You can't? So when can you?"],
        ),
        fit("To je neskoro, ale dobre.", "That's late, but OK.", "meet"),
        slip(
          "Dobre, o deviatej môžeš.",
          "OK, you can at nine.",
          "**Môžeš** is you can. About yourself: **môžem**.",
          "laugh",
          ["Ja môžem, áno. A ty?", "I can, yes. And you?"],
        ),
      ],
    },
    {
      id: "meet",
      says: [
        say(
          "Tak sa stretneme pred kinom. Kino je na rohu, vedľa kaviarne. Nemeškaj!",
          "Then we'll meet in front of the cinema. It's on the corner, next to the café. Don't be late!",
        ),
      ],
      replies: [
        fit("Nebudem meškať. Ahoj!", "I won't be late. Bye!", "end"),
        slip(
          "Dovidenia, Anna.",
          "Goodbye, Anna.",
          "**Dovidenia** is for people you say vy to. To a friend: **Ahoj** or **Maj sa**.",
          "laugh",
          ["Dovidenia? Ahoj, Alex!", "Goodbye? Bye, Alex!"],
        ),
        fit("Neboj sa. Maj sa!", "Don't worry. Take care!", "end"),
        slip(
          "Stretneme sa pred kino.",
          "We'll meet in front of the cinema.",
          "Where you meet, **pred** takes the instrumental: **pred kinom**.",
          "puzzle",
          ["Pred kinom, áno!", "In front of the cinema, yes!"],
        ),
      ],
    },
    { id: "end", says: [say("Čau! Maj sa pekne!", "Bye! Take care!")] },
  ],
};

const maria: Talk = {
  id: "day-maria",
  name: "Máte domácu úlohu?",
  intro: say(
    "Noc. Prichádza pani Mária z jazykovej školy. Nie je to kamarátka.",
    "Late at night. Here comes Mrs Mária from the language school. Not a friend.",
  ),
  setting: "plaza",
  time: "night",
  topic: "Homework for tomorrow",
  who: "maria",
  nodes: [
    {
      id: "hello",
      says: [],
      replies: [
        fit("Dobrý večer, pani Mária.", "Good evening, Mrs Mária.", "lesson"),
        slip(
          "Ahoj, Mária!",
          "Hi, Mária!",
          "**Ahoj** is for friends. Pani Mária gets vy: **Dobrý večer, pani Mária**.",
          "frown",
          ["Ahoj? Dobrý večer, Alex.", "Hi? Good evening, Alex."],
        ),
        slip(
          "Dobrú noc!",
          "Good night!",
          "**Dobrú noc** is a goodbye for the night, never a hello. Late at night it is still **Dobrý večer**.",
          "puzzle",
          [
            "Dobrú noc? Prichádzate, alebo odchádzate?",
            "Good night? Are you coming or going?",
          ],
        ),
        fit("Dobrý večer!", "Good evening!", "lesson"),
      ],
    },
    {
      id: "lesson",
      says: [
        say(
          "Dobrý večer, Alex. Ešte nie ste doma? Zajtra o deviatej máte hodinu. Máte domácu úlohu?",
          "Good evening, Alex. Not home yet? You have a lesson at nine tomorrow. Do you have your homework?",
        ),
      ],
      replies: [
        fit("Áno, mám. Je v taške.", "Yes, I do. It's in my bag.", "done"),
        slip(
          "Áno, máte.",
          "Yes, you do.",
          "**Máte** is what she says to you. About yourself: **mám**.",
          "puzzle",
          ["Ja? Nie, vy, Alex.", "Me? No, you, Alex."],
        ),
        fit("Ešte nie. Urobím ju dnes večer.", "Not yet. I'll do it tonight.", "notyet"),
        slip(
          "Ešte nie. Robil som ju včera.",
          "Not yet. I was doing it yesterday.",
          "**Včera** is yesterday, but it isn't done yet: **urobím ju dnes večer**.",
          "puzzle",
          ["Včera? Ale veď ešte nie je hotová.", "Yesterday? But it isn't finished yet."],
        ),
      ],
    },
    {
      id: "done",
      says: [
        say(
          "Výborne! Zajtra budete hovoriť o rodine, tak si prineste fotku rodiny.",
          "Excellent! Tomorrow you'll talk about family, so bring a photo of your family.",
        ),
      ],
      replies: [
        fit("Dobre, prinesiem fotku.", "All right, I'll bring a photo.", "bye"),
        slip(
          "Dobre, prinesiem fotka.",
          "All right, I'll bring a photo.",
          "**Priniesť** takes the accusative: fotka becomes **fotku**.",
          "puzzle",
          ["Fotku, áno.", "A photo, yes."],
        ),
        fit(
          "Dobre. Mám pekné fotky z leta.",
          "All right. I have nice photos from the summer.",
          "bye",
        ),
      ],
    },
    {
      id: "notyet",
      says: [
        say(
          "Tak nechoďte spať neskoro. Úloha nie je dlhá, len desať viet o rodine.",
          "Then don't go to bed late. The homework isn't long, only ten sentences about family.",
        ),
      ],
      replies: [
        fit("Dobre, napíšem ju hneď.", "All right, I'll write it straight away.", "bye"),
        slip(
          "Desať vety? To je ľahké.",
          "Ten sentences? That's easy.",
          "From five on, numbers take the genitive plural: **desať viet**.",
          "puzzle",
          ["Desať viet, áno.", "Ten sentences, yes."],
        ),
        fit("Desať viet? To je ľahké.", "Ten sentences? That's easy.", "bye"),
      ],
    },
    {
      id: "bye",
      says: [
        say(
          "Tak dobrú noc, Alex. Vidíme sa zajtra o deviatej.",
          "Good night then, Alex. See you tomorrow at nine.",
        ),
      ],
      replies: [
        fit("Dobrú noc, pani Mária.", "Good night, Mrs Mária.", "end"),
        slip(
          "Dobrý večer!",
          "Good evening!",
          "**Dobrý večer** is a hello. Parting late at night: **Dobrú noc**.",
          "puzzle",
          ["Dobrý večer? Veď sa už lúčime.", "Good evening? But we're saying goodbye."],
        ),
        fit("Ďakujem, dobrú noc!", "Thanks, good night!", "end"),
        slip(
          "Čau, Mária!",
          "Bye, Mária!",
          "**Čau** is for friends. To pani Mária: **Dobrú noc**.",
          "frown",
          ["Ehm… dobrú noc, Alex.", "Er… good night, Alex."],
        ),
      ],
    },
    { id: "end", says: [say("Dovidenia, Alex.", "Goodbye, Alex.")] },
  ],
};

export const DAY_TALKS: readonly Talk[] = [marek, lucia, anna, maria];

/** Alex's lines that fit share one clip wherever they come up: `day/say/<slug>`. */
export function alexTurnId(slovak: string): string {
  return `day/say/${lemmaToSlug(slovak)}`;
}

/** The talks with an id on every line, so each can find its clip. */
export function dayTalks(): Array<Talk<Said & { id: string }>> {
  return DAY_TALKS.map((talk) => withLineIds(talk, alexTurnId));
}

/**
 * Every voiced line of the day as a dialogue turn: what the four say, their
 * answers to Alex's slips, and Alex's lines that fit. A slip is only shown
 * in a bubble, so it gets no clip.
 */
export function dayTurns(): DialogueTurn[] {
  const speakers = Object.fromEntries(
    listedCharacters().map((character) => [character.id, character.speakers[0] ?? ""]),
  );
  const turns = new Map<string, DialogueTurn>();

  for (const talk of dayTalks()) {
    for (const node of talk.nodes) {
      for (const line of node.says) {
        turns.set(line.id, { ...line, speaker: speakers[talk.who] });
      }
      for (const reply of node.replies ?? []) {
        if (!reply.miss)
          turns.set(reply.line.id, { ...reply.line, speaker: speakers.alex });
        const answer = reply.miss?.answer;
        if (answer) turns.set(answer.id, { ...answer, speaker: speakers[talk.who] });
      }
    }
  }

  return [...turns.values()];
}
