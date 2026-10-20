import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import type { CefrLevel } from "$lib/level-test/scale";
import type { ListenCompleteQuestion } from "$lib/level-test/types";

/**
 * Interactive Listening scenarios. The narrator reads the scenario, the
 * partner speaks each turn in their own lesson voice, and the learner picks a
 * reply. Reply options avoid past-tense forms so they fit any speaker's gender.
 */
export interface AuthoredLine {
  text: string;
  english: string;
}

export interface AuthoredListeningSet {
  id: string;
  level: CefrLevel;
  partner: LessonCharacterId;
  partnerName: string;
  scenario: AuthoredLine;
  complete: ListenCompleteQuestion[];
  turns: { line: AuthoredLine; options: string[]; answer: number }[];
  summaryKey: string[];
}

export const LISTENING_NARRATOR: LessonCharacterId = "narrator";

export const listeningSets: AuthoredListeningSet[] = [
  {
    id: "ucenie-s-marekom",
    level: "A2",
    partner: "marek",
    partnerName: "Marek",
    scenario: {
      text: "Študuješ na univerzite v Bratislave. Volá ti tvoj spolužiak Marek. Budúci týždeň máte skúšku z histórie a Marek sa chce s tebou učiť.",
      english:
        "You study at a university in Bratislava. Your classmate Marek is calling you. Next week you have a history exam, and Marek wants to study with you.",
    },
    complete: [
      {
        before: "Marek je tvoj",
        after: ".",
        english: "Marek is your ___.",
        accepted: ["spolužiak"],
      },
      {
        before: "Budúci týždeň máte skúšku z",
        after: ".",
        english: "Next week you have an exam in ___.",
        accepted: ["histórie", "dejín"],
      },
      {
        before: "Marek sa chce s tebou",
        after: ".",
        english: "Marek wants to ___ with you.",
        accepted: ["učiť", "spolu učiť"],
      },
    ],
    turns: [
      {
        line: {
          text: "Ahoj! Máš chvíľu? Chcem sa ťa niečo opýtať.",
          english: "Hi! Have you got a minute? I want to ask you something.",
        },
        options: [
          "Dobrý deň, pán profesor.",
          "Ahoj, jasné. O čo ide?",
          "Ďakujem, nemám hlad.",
        ],
        answer: 1,
      },
      {
        line: {
          text: "Nechceš sa so mnou učiť na skúšku z histórie?",
          english: "Do you want to study for the history exam with me?",
        },
        options: [
          "Jasné, to je dobrý nápad. Kedy máš čas?",
          "Skúška je z histórie.",
          "Nie, dnes je pekné počasie.",
        ],
        answer: 0,
      },
      {
        line: {
          text: "Mne by sa hodila streda popoludní. Čo ty?",
          english: "Wednesday afternoon would suit me. What about you?",
        },
        options: [
          "Streda je tretí deň v týždni.",
          "Popoludní je vonku teplo.",
          "V stredu nemôžem, ale vo štvrtok popoludní mám čas.",
        ],
        answer: 2,
      },
      {
        line: {
          text: "Dobre, tak vo štvrtok. Môžeme sa stretnúť v knižnici?",
          english: "OK, Thursday then. Can we meet in the library?",
        },
        options: [
          "Áno, v knižnici je ticho. To je dobrý nápad.",
          "Knihy sú na poličke.",
          "Štvrtok je po strede.",
        ],
        answer: 0,
      },
      {
        line: {
          text: "Super. Prinesieš aj svoje poznámky z prednášok?",
          english: "Great. Will you bring your lecture notes too?",
        },
        options: [
          "Poznámky sú v kine.",
          "Jasné, prinesiem ich.",
          "Prednášky sú každý deň.",
        ],
        answer: 1,
      },
      {
        line: {
          text: "Tak sa uvidíme vo štvrtok o druhej. Maj sa!",
          english: "See you on Thursday at two, then. Bye!",
        },
        options: [
          "Dobrú noc, pani učiteľka.",
          "Prepáč, neviem, kde je štvrtok.",
          "Dobre, uvidíme sa. Ahoj!",
        ],
        answer: 2,
      },
    ],
    summaryKey: [
      "Marek chce, aby sa spolu učili na skúšku z histórie.",
      "V stredu to nejde, stretnú sa vo štvrtok o druhej popoludní.",
      "Stretnú sa v knižnici.",
      "Študent prinesie poznámky z prednášok.",
    ],
  },
  {
    id: "nahradny-test",
    level: "B1",
    partner: "maria",
    partnerName: "Mária",
    scenario: {
      text: "Navštevuješ kurz slovenčiny v jazykovej škole. Minulý týždeň bol test, ale pre chorobu ťa v škole nebolo. Ideš do kancelárie za pani Máriou, ktorá v škole rieši termíny. Chceš sa s ňou dohodnúť na náhradnom termíne.",
      english:
        "You attend a Slovak course at a language school. There was a test last week, but you were off sick. You go to the office to see Mária, who handles dates at the school. You want to agree on a make-up date with her.",
    },
    complete: [
      {
        before: "Navštevuješ kurz",
        after: "v jazykovej škole.",
        english: "You attend a ___ course at a language school.",
        accepted: ["slovenčiny", "slovenského jazyka"],
      },
      {
        before: "Minulý týždeň bol",
        after: ", ale v škole ťa nebolo.",
        english: "Last week there was a ___, but you were not at school.",
        accepted: ["test"],
      },
      {
        before: "Chceš sa dohodnúť na náhradnom",
        after: ".",
        english: "You want to agree on a make-up ___.",
        accepted: ["termíne"],
      },
    ],
    turns: [
      {
        line: {
          text: "Dobrý deň. Potrebujete niečo?",
          english: "Hello. Do you need something?",
        },
        options: [
          "Ahoj, čo robíš?",
          "Dobrý deň. Môžem sa vás niečo opýtať?",
          "Dovidenia, pani Mária.",
        ],
        answer: 1,
      },
      {
        line: { text: "Samozrejme. O čo ide?", english: "Of course. What is it about?" },
        options: [
          "Minulý týždeň ma nebolo na teste, lebo mi nebolo dobre.",
          "Test bol veľmi ľahký, ďakujem.",
          "Ide o počasie, vonku prší.",
        ],
        answer: 0,
      },
      {
        line: {
          text: "Aha, rozumiem. Test si môžete napísať v piatok ráno alebo v pondelok popoludní.",
          english:
            "I see. You can take the test on Friday morning or on Monday afternoon.",
        },
        options: [
          "Ráno zvyčajne raňajkujem.",
          "Ďakujem, test sa mi veľmi páčil.",
          "Piatok ráno mi vyhovuje viac.",
        ],
        answer: 2,
      },
      {
        line: {
          text: "Dobre. Je to v miestnosti číslo dvanásť, o ôsmej. Budete potrebovať aj slovník?",
          english:
            "Good. It is in room twelve, at eight. Will you need a dictionary too?",
        },
        options: [
          "Dvanásť plus osem je dvadsať.",
          "Nie, slovník nepotrebujem, ďakujem.",
          "Áno, miestnosť je veľmi pekná.",
        ],
        answer: 1,
      },
      {
        line: {
          text: "Ešte niečo. Prineste si, prosím, aj potvrdenie od lekára.",
          english: "One more thing. Please bring a doctor's note as well.",
        },
        options: [
          "Lekár je môj brat.",
          "Nie, lekára nepotrebujem.",
          "Dobre, prinesiem ho.",
        ],
        answer: 2,
      },
      {
        line: {
          text: "Tak sa uvidíme v piatok. Dovidenia.",
          english: "See you on Friday, then. Goodbye.",
        },
        options: ["Ďakujem, dovidenia.", "Ahoj, maj sa!", "Uvidíme sa zajtra večer."],
        answer: 0,
      },
    ],
    summaryKey: [
      "Študent nebol na teste, lebo bol chorý.",
      "Test si napíše v piatok ráno o ôsmej v miestnosti dvanásť.",
      "Slovník nepotrebuje.",
      "Musí priniesť potvrdenie od lekára.",
    ],
  },
];
