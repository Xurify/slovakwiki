import {
  listedCharacters,
  type LessonCharacterId,
} from "$lib/catalog/lessons/character-ids";
import type { DialogueTurn } from "$lib/learning/types";
import type { TimeOfDay } from "./scene-mood";

type Said = { english: string; slovak: string };

/** Something Alex could say. A choice without `why` fits. */
export interface DayChoice extends Said {
  /** Why it does not fit here, and what does. */
  why?: string;
}

/** Alex says one line, and the person answers. */
export interface DayExchange {
  choices: readonly DayChoice[];
  id: string;
  reply: Said;
}

/** One person crossing the square: Alex greets them, talks, and sees them off. */
export interface DayVisit {
  /** The stage direction before Alex's first line. */
  arrive: Said;
  exchanges: readonly DayExchange[];
  id: string;
  time: TimeOfDay;
  who: LessonCharacterId;
}

/** Who each person is to Alex, so the learner can tell ty from vy before picking. */
const PEOPLE: Partial<Record<LessonCharacterId, Said>> = {
  anna: { english: "Your friend.", slovak: "Tvoja kamarátka." },
  lucia: {
    english: "The shop assistant. Not a friend.",
    slovak: "Predavačka z obchodu. Nie je to kamarátka.",
  },
  marek: { english: "Your friend.", slovak: "Tvoj kamarát." },
  maria: {
    english: "The lady from the language school. Not a friend.",
    slovak: "Pani z jazykovej školy. Nie je to kamarátka.",
  },
};

export const DAY_VISITS: readonly DayVisit[] = [
  {
    arrive: { english: "Marek is coming over.", slovak: "Prichádza Marek." },
    exchanges: [
      {
        choices: [
          { english: "Hi.", slovak: "Ahoj." },
          {
            english: "Good day.",
            slovak: "Dobrý deň.",
            why: "**Dobrý deň** is for people you say vy to. Marek is a friend: **Ahoj**.",
          },
          {
            english: "Good night.",
            slovak: "Dobrú noc.",
            why: "**Dobrú noc** is a goodbye for the night, never a hello. To a friend: **Ahoj**.",
          },
        ],
        id: "marek-hello",
        reply: { english: "Hi, Alex! How are you?", slovak: "Ahoj, Alex! Ako sa máš?" },
      },
      {
        choices: [
          {
            english: "Good, thanks. And you?",
            slovak: "Dobre, ďakujem. A vy?",
            why: "**A vy?** is for people you say vy to. Marek is a friend: **A ty?**",
          },
          { english: "Good, thanks. And you?", slovak: "Dobre, ďakujem. A ty?" },
          {
            english: "No, thank you.",
            slovak: "Nie, ďakujem.",
            why: "**Nie, ďakujem** turns down an offer. Marek asked how you are: **Dobre, ďakujem**.",
          },
        ],
        id: "marek-how",
        reply: {
          english: "Good too. I have to go now.",
          slovak: "Aj ja dobre. Už musím ísť.",
        },
      },
      {
        choices: [
          {
            english: "Goodbye.",
            slovak: "Dovidenia.",
            why: "**Dovidenia** is for people you say vy to. To a friend: **Maj sa**.",
          },
          {
            english: "Good morning.",
            slovak: "Dobré ráno.",
            why: "**Dobré ráno** is a hello. Marek is leaving: **Maj sa**.",
          },
          { english: "Take care.", slovak: "Maj sa." },
        ],
        id: "marek-bye",
        reply: { english: "Take care, Alex!", slovak: "Maj sa, Alex!" },
      },
    ],
    id: "marek",
    time: "morning",
    who: "marek",
  },
  {
    arrive: { english: "Lucia is coming over.", slovak: "Prichádza Lucia." },
    exchanges: [
      {
        choices: [
          {
            english: "Hi.",
            slovak: "Čau.",
            why: "**Čau** is for friends. Lucia is not a friend: **Dobrý deň**.",
          },
          { english: "Good day.", slovak: "Dobrý deň." },
          {
            english: "Good evening.",
            slovak: "Dobrý večer.",
            why: "**Dobrý večer** is for the evening. In the afternoon: **Dobrý deň**.",
          },
        ],
        id: "lucia-hello",
        reply: { english: "Good day. How are you?", slovak: "Dobrý deň. Ako sa máte?" },
      },
      {
        choices: [
          { english: "Good, thanks. And you?", slovak: "Dobre, ďakujem. A vy?" },
          {
            english: "Good, thanks. And you?",
            slovak: "Dobre, ďakujem. A ty?",
            why: "**A ty?** is for friends. Lucia says vy to you, so: **A vy?**",
          },
          {
            english: "Yes, please.",
            slovak: "Áno, prosím.",
            why: "**Áno, prosím** says yes to an offer. Lucia asked how you are: **Dobre, ďakujem**.",
          },
        ],
        id: "lucia-how",
        reply: {
          english: "Fine, thank you. I'm on my way to work.",
          slovak: "Ďakujem, dobre. Idem do práce.",
        },
      },
      {
        choices: [
          {
            english: "Take care.",
            slovak: "Maj sa.",
            why: "**Maj sa** is for friends. To Lucia: **Dovidenia**.",
          },
          {
            english: "Good night.",
            slovak: "Dobrú noc.",
            why: "**Dobrú noc** is for parting at night. In the afternoon: **Dovidenia**.",
          },
          { english: "Goodbye.", slovak: "Dovidenia." },
        ],
        id: "lucia-bye",
        reply: { english: "Goodbye. Have a nice day!", slovak: "Dovidenia. Pekný deň!" },
      },
    ],
    id: "lucia",
    time: "day",
    who: "lucia",
  },
  {
    arrive: { english: "Anna is coming over.", slovak: "Prichádza Anna." },
    exchanges: [
      {
        choices: [
          {
            english: "Good night.",
            slovak: "Dobrú noc.",
            why: "**Dobrú noc** is a goodbye for the night, never a hello. To a friend: **Čau**.",
          },
          { english: "Hi.", slovak: "Čau." },
          {
            english: "Good day.",
            slovak: "Dobrý deň.",
            why: "**Dobrý deň** is for people you say vy to, in the daytime. Anna is a friend: **Čau**.",
          },
        ],
        id: "anna-hello",
        reply: {
          english: "Hi, Alex! Where are you going?",
          slovak: "Ahoj, Alex! Kam ideš?",
        },
      },
      {
        choices: [
          { english: "I'm going home. And you?", slovak: "Idem domov. A ty?" },
          {
            english: "I'm at home. And you?",
            slovak: "Som doma. A ty?",
            why: "**Som doma** says where you are. **Kam?** asks where to: **Idem domov**.",
          },
          {
            english: "Good, thanks. And you?",
            slovak: "Dobre, ďakujem. A ty?",
            why: "That answers **Ako sa máš?** Anna asked **Kam ideš?**, where you are going: **Idem domov**.",
          },
        ],
        id: "anna-where",
        reply: {
          english: "I'm going to the cinema. I have to go now.",
          slovak: "Ja idem do kina. Už musím ísť.",
        },
      },
      {
        choices: [
          { english: "Take care.", slovak: "Maj sa." },
          {
            english: "Goodbye.",
            slovak: "Dovidenia.",
            why: "**Dovidenia** is for people you say vy to. To a friend: **Maj sa**.",
          },
          {
            english: "Good evening.",
            slovak: "Dobrý večer.",
            why: "**Dobrý večer** is a hello. Anna is leaving: **Maj sa**.",
          },
        ],
        id: "anna-bye",
        reply: { english: "Bye! Take care!", slovak: "Čau! Maj sa pekne!" },
      },
    ],
    id: "anna",
    time: "evening",
    who: "anna",
  },
  {
    arrive: { english: "Mária is coming over.", slovak: "Prichádza pani Mária." },
    exchanges: [
      {
        choices: [
          {
            english: "Good night.",
            slovak: "Dobrú noc.",
            why: "**Dobrú noc** is a goodbye for the night, never a hello. Late at night: **Dobrý večer**.",
          },
          {
            english: "Hi.",
            slovak: "Ahoj.",
            why: "**Ahoj** is for friends. Pani Mária is not a friend: **Dobrý večer**.",
          },
          { english: "Good evening.", slovak: "Dobrý večer." },
        ],
        id: "maria-hello",
        reply: {
          english: "Good evening, Alex. Are you going home?",
          slovak: "Dobrý večer, Alex. Idete domov?",
        },
      },
      {
        choices: [
          { english: "Yes, I'm going home.", slovak: "Áno, idem domov." },
          {
            english: "Yes, you're going home.",
            slovak: "Áno, idete domov.",
            why: "**Idete** is what she says to you. About yourself you say **idem**: **Áno, idem domov**.",
          },
          {
            english: "Yes, I'm at home.",
            slovak: "Áno, som doma.",
            why: "**Som doma** says you are home already. You are on the square: **Áno, idem domov**.",
          },
        ],
        id: "maria-home",
        reply: {
          english: "Me too. It's late already.",
          slovak: "Ja tiež. Je už neskoro.",
        },
      },
      {
        choices: [
          {
            english: "Good evening.",
            slovak: "Dobrý večer.",
            why: "**Dobrý večer** is a hello. Parting late at night: **Dobrú noc**.",
          },
          { english: "Good night.", slovak: "Dobrú noc." },
          {
            english: "Bye.",
            slovak: "Čau.",
            why: "**Čau** is for friends. To pani Mária: **Dobrú noc**.",
          },
        ],
        id: "maria-bye",
        reply: { english: "Good night, Alex.", slovak: "Dobrú noc, Alex." },
      },
    ],
    id: "maria",
    time: "night",
    who: "maria",
  },
];

export const TIME_WORDS: Record<TimeOfDay, Said> = {
  day: { english: "afternoon", slovak: "Popoludnie" },
  evening: { english: "evening", slovak: "Večer" },
  morning: { english: "morning", slovak: "Ráno" },
  night: { english: "late at night", slovak: "Noc" },
};

export function dayName(id: LessonCharacterId): string {
  return listedCharacters().find((character) => character.id === id)?.displayName ?? id;
}

export function dayWho(id: LessonCharacterId): Said {
  return PEOPLE[id] ?? { english: "", slovak: "" };
}

/** What Alex says in an exchange when nothing has been picked yet: the first that fits. */
export function dayAnswer(exchange: DayExchange): DayChoice {
  return exchange.choices.find((choice) => !choice.why) ?? exchange.choices[0];
}

export function alexTurnId(slovak: string): string {
  const slug = slovak
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("sk")
    .replace(/[^a-z]+/g, "-")
    .replace(/^-|-$/g, "");
  return `day/say/${slug}`;
}

export function replyTurnId(exchange: DayExchange): string {
  return `day/${exchange.id}`;
}

/** Every voiced line of the game as a dialogue turn, so it is timed like a lesson scene. */
export function dayTurns(): DialogueTurn[] {
  const speakers = Object.fromEntries(
    listedCharacters().map((character) => [character.id, character.speakers[0] ?? ""]),
  );
  const exchanges = DAY_VISITS.flatMap((visit) =>
    visit.exchanges.map((exchange) => ({ exchange, who: visit.who })),
  );
  // Wrong picks are said in a bubble, so only the lines that fit get a clip.
  const alex = new Map(
    exchanges.flatMap(({ exchange }) =>
      exchange.choices
        .filter((choice) => !choice.why)
        .map((choice) => [alexTurnId(choice.slovak), choice] as const),
    ),
  );

  return [
    ...[...alex].map(([id, choice]) => ({
      english: choice.english,
      id,
      slovak: choice.slovak,
      speaker: speakers.alex,
    })),
    ...exchanges.map(({ exchange, who }) => ({
      english: exchange.reply.english,
      id: replyTurnId(exchange),
      slovak: exchange.reply.slovak,
      speaker: speakers[who],
    })),
  ];
}
