import type { LessonBeat, LessonExercise } from "$lib/learning/types";

/** Beat groupings for lessons — teach metadata + exercise slices. */
export const meetSomeoneBeats: LessonBeat[] = [
  {
    id: "greeting",
    title: "Greet and introduce",
    teach: {
      sceneLineIds: ["anna-greeting", "you-introduction"],
      phrases: [
        {
          slovak: "Volám sa …",
          english: "My name is …",
          note: "Use volám sa + your name. Avoid an English-shaped “My name is …” calque.",
          audio: { transcript: "Volám sa." },
        },
      ],
      note: "Start with Dobrý deň when you do not know the person. Ahoj is for friends and informal settings.",
    },
    exercises: [] as LessonExercise[],
  },
  {
    id: "origin",
    title: "Where you're from",
    teach: {
      sceneLineIds: ["anna-origin", "you-origin"],
      phrases: [
        {
          slovak: "Som z …",
          english: "I am from …",
          note: "z takes genitive: Kanada → Kanady. Odkiaľ ste? is the polite ask.",
          audio: { transcript: "Som z." },
        },
      ],
    },
    exercises: [] as LessonExercise[],
  },
  {
    id: "your-turn",
    title: "Your turn",
    teach: {
      sceneLineIds: ["anna-slovak", "you-learning"],
      phrases: [
        {
          slovak: "Ešte sa učím.",
          english: "I am still learning.",
          note: "A soft way to say your Slovak is still early — pairs well after Trochu.",
          audio: { transcript: "Ešte sa učím." },
        },
      ],
    },
    exercises: [] as LessonExercise[],
  },
];

export function withMeetSomeoneExercises(
  greeting: LessonExercise,
  name: LessonExercise,
  origin: LessonExercise,
  personal: LessonExercise,
): LessonBeat[] {
  return [
    { ...meetSomeoneBeats[0]!, exercises: [greeting, name] },
    { ...meetSomeoneBeats[1]!, exercises: [origin] },
    { ...meetSomeoneBeats[2]!, exercises: [personal] },
  ];
}

export const numbersBeats: LessonBeat[] = [
  {
    id: "age",
    title: "Say your age",
    teach: {
      sceneLineIds: [
        "registration-welcome",
        "registration-yes",
        "registration-age",
        "registration-age-answer",
      ],
      phrases: [
        {
          slovak: "Mám … rokov.",
          english: "I am … years old.",
          note: "Use rokov after the number when you say your age.",
          audio: { transcript: "Mám rokov." },
        },
      ],
    },
    exercises: [] as LessonExercise[],
  },
  {
    id: "phone",
    title: "Phone digits",
    teach: {
      sceneLineIds: ["registration-phone", "registration-phone-answer"],
      phrases: [
        {
          slovak: "Moje číslo je …",
          english: "My number is …",
          note: "Say each phone digit separately.",
          audio: { transcript: "Moje číslo je." },
        },
      ],
    },
    exercises: [] as LessonExercise[],
  },
  {
    id: "price",
    title: "How much does it cost?",
    teach: {
      phrases: [
        {
          slovak: "Koľko to stojí?",
          english: "How much does it cost?",
          audio: { transcript: "Koľko to stojí?" },
        },
        {
          slovak: "Stojí to päť eur.",
          english: "It costs five euros.",
          audio: { transcript: "Stojí to päť eur." },
        },
      ],
      note: "Ask Koľko to stojí? and answer Stojí to + price.",
    },
    exercises: [] as LessonExercise[],
  },
  {
    id: "your-turn",
    title: "Your turn",
    teach: {},
    exercises: [] as LessonExercise[],
  },
];

export function withNumbersExercises(
  age: LessonExercise,
  phone: LessonExercise,
  price: LessonExercise,
  personal: LessonExercise,
): LessonBeat[] {
  return [
    { ...numbersBeats[0]!, exercises: [age] },
    { ...numbersBeats[1]!, exercises: [phone] },
    { ...numbersBeats[2]!, exercises: [price] },
    { ...numbersBeats[3]!, exercises: [personal] },
  ];
}

export const negationBeats: LessonBeat[] = [
  {
    id: "refuse",
    title: "Refuse politely",
    teach: {
      sceneLineIds: ["cafe-offer", "cafe-refusal"],
      phrases: [
        {
          slovak: "Nie, ďakujem.",
          english: "No, thank you.",
          audio: { transcript: "Nie, ďakujem." },
        },
        {
          slovak: "Nemám …",
          english: "I do not have …",
          audio: { transcript: "Nemám." },
        },
      ],
    },
    exercises: [] as LessonExercise[],
  },
  {
    id: "understand",
    title: "Say you do not understand",
    teach: {
      sceneLineIds: ["cafe-menu", "cafe-clarification"],
      phrases: [
        {
          slovak: "Nerozumiem.",
          english: "I do not understand.",
          audio: { transcript: "Nerozumiem." },
        },
        {
          slovak: "Nie je to …",
          english: "It is not …",
          audio: { transcript: "Nie je to." },
        },
      ],
      note: "Nie attaches to the verb: rozumiem → nerozumiem, mám → nemám.",
    },
    exercises: [] as LessonExercise[],
  },
  {
    id: "your-turn",
    title: "Your turn",
    teach: {},
    exercises: [] as LessonExercise[],
  },
];

export function withNegationExercises(
  refusal: LessonExercise,
  understanding: LessonExercise,
  placement: LessonExercise,
  personal: LessonExercise,
): LessonBeat[] {
  return [
    { ...negationBeats[0]!, exercises: [refusal, placement] },
    { ...negationBeats[1]!, exercises: [understanding] },
    { ...negationBeats[2]!, exercises: [personal] },
  ];
}

export const presentTenseBeats: LessonBeat[] = [
  {
    id: "endings",
    title: "Who is acting",
    teach: {
      sceneLineIds: ["peter-reads", "ask-you", "you-read"],
      phrases: [
        {
          slovak: "čítam",
          english: "I read",
          note: "ja · ending -m",
          audio: { transcript: "čítam" },
        },
        {
          slovak: "čítaš",
          english: "you read (informal)",
          note: "ty · ending -š",
          audio: { transcript: "čítaš" },
        },
        {
          slovak: "číta",
          english: "he/she reads",
          note: "on / ona",
          audio: { transcript: "číta" },
        },
      ],
      note: "Čítam, čítaš, číta, čítame, čítate, čítajú — the ending shows who acts.",
    },
    exercises: [] as LessonExercise[],
  },
  {
    id: "we-form",
    title: "We and they",
    teach: {
      phrases: [
        {
          slovak: "čítame",
          english: "we read",
          note: "my · ending -me",
          audio: { transcript: "čítame" },
        },
        {
          slovak: "čítate",
          english: "you read (plural / formal)",
          note: "vy · ending -te",
          audio: { transcript: "čítate" },
        },
        {
          slovak: "čítajú",
          english: "they read",
          note: "oni / ony · ending -jú",
          audio: { transcript: "čítajú" },
        },
      ],
    },
    exercises: [] as LessonExercise[],
  },
  {
    id: "your-turn",
    title: "Your turn",
    teach: {},
    exercises: [] as LessonExercise[],
  },
];

export function withPresentTenseExercises(
  choose: LessonExercise,
  repair: LessonExercise,
  weChoose: LessonExercise,
  personal: LessonExercise,
): LessonBeat[] {
  return [
    { ...presentTenseBeats[0]!, exercises: [choose, repair] },
    { ...presentTenseBeats[1]!, exercises: [weChoose] },
    { ...presentTenseBeats[2]!, exercises: [personal] },
  ];
}

export const bytBeats: LessonBeat[] = [
  {
    id: "identity",
    title: "Who you are",
    teach: {
      sceneLineIds: ["byt-check-in-name", "byt-check-in-answer"],
      phrases: [
        { slovak: "Som …", english: "I am …", audio: { transcript: "Som." } },
        {
          slovak: "Ste …?",
          english: "Are you …? (formal / plural)",
          audio: { transcript: "Ste?" },
        },
      ],
      note: "Som, si, je, sme, ste, sú — byť is irregular.",
    },
    exercises: [] as LessonExercise[],
  },
  {
    id: "location",
    title: "Where things are",
    teach: {
      sceneLineIds: ["byt-check-in-location", "byt-check-in-group"],
      phrases: [
        { slovak: "Je to …", english: "It is …", audio: { transcript: "Je to." } },
        { slovak: "Sme …", english: "We are …", audio: { transcript: "Sme." } },
      ],
      note: "Do not use byť for age — Slovak uses mať: Mám dvadsať rokov.",
    },
    exercises: [] as LessonExercise[],
  },
  {
    id: "your-turn",
    title: "Your turn",
    teach: {},
    exercises: [] as LessonExercise[],
  },
];

export function withBytExercises(
  som: LessonExercise,
  ste: LessonExercise,
  je: LessonExercise,
  personal: LessonExercise,
): LessonBeat[] {
  return [
    { ...bytBeats[0]!, exercises: [som, ste] },
    { ...bytBeats[1]!, exercises: [je] },
    { ...bytBeats[2]!, exercises: [personal] },
  ];
}

export const matBeats: LessonBeat[] = [
  {
    id: "have",
    title: "What you have",
    teach: {
      sceneLineIds: ["mat-cafe-time", "mat-cafe-answer"],
      phrases: [
        { slovak: "Mám …", english: "I have …", audio: { transcript: "Mám." } },
        {
          slovak: "Máš …?",
          english: "Do you have …? (informal)",
          audio: { transcript: "Máš?" },
        },
      ],
    },
    exercises: [] as LessonExercise[],
  },
  {
    id: "age-negative",
    title: "Age and negation",
    teach: {
      sceneLineIds: ["mat-cafe-age", "mat-cafe-age-answer", "mat-cafe-possession"],
      phrases: [
        {
          slovak: "Mám … rokov.",
          english: "I am … years old.",
          audio: { transcript: "Mám rokov." },
        },
        {
          slovak: "Nemám …",
          english: "I do not have …",
          audio: { transcript: "Nemám." },
        },
      ],
      note: "Mám dvadsať rokov for age. Add ne- for negative: nemám.",
    },
    exercises: [] as LessonExercise[],
  },
  {
    id: "your-turn",
    title: "Your turn",
    teach: {},
    exercises: [] as LessonExercise[],
  },
];

export function withMatExercises(
  mam: LessonExercise,
  mas: LessonExercise,
  nemam: LessonExercise,
  personal: LessonExercise,
): LessonBeat[] {
  return [
    { ...matBeats[0]!, exercises: [mam, mas] },
    { ...matBeats[1]!, exercises: [nemam] },
    { ...matBeats[2]!, exercises: [personal] },
  ];
}

export const stressBeats: LessonBeat[] = [
  {
    id: "stress",
    title: "First-syllable stress",
    teach: {
      sceneLineIds: ["anna-thanks", "stress-mark"],
      phrases: [
        {
          slovak: "ĎA-ku-jem",
          english: "thank you",
          note: "Stress the first syllable. Keep the other two lighter.",
          audio: { transcript: "ďakujem" },
        },
        {
          slovak: "BRA-ti-sla-va",
          english: "Bratislava",
          note: "The same first-syllable pattern.",
          audio: { transcript: "Bratislava" },
        },
      ],
      note: "In ordinary Slovak words, the first syllable carries the main beat.",
    },
    exercises: [] as LessonExercise[],
  },
  {
    id: "your-turn",
    title: "Your turn",
    teach: {},
    exercises: [] as LessonExercise[],
  },
];

export function withStressExercises(
  choose: LessonExercise,
  build: LessonExercise,
  personal: LessonExercise,
): LessonBeat[] {
  return [
    { ...stressBeats[0]!, exercises: [choose, build] },
    { ...stressBeats[1]!, exercises: [personal] },
  ];
}

export const daysDatesTimeBeatShells: Omit<LessonBeat, "exercises">[] = [
  {
    id: "meeting-day",
    title: "Pick a day",
    teach: {
      sceneLineIds: ["meeting-today", "meeting-suggestion"],
      phrases: [
        {
          slovak: "Dnes je pondelok.",
          english: "Today is Monday.",
          audio: { transcript: "Dnes je pondelok." },
        },
        {
          slovak: "Stretneme sa v utorok.",
          english: "We will meet on Tuesday.",
          audio: { transcript: "Stretneme sa v utorok." },
        },
      ],
      note: "Use v before the day when arranging a meeting.",
    },
  },
  {
    id: "clock-basics",
    title: "Clock times",
    teach: {
      sceneLineIds: ["meeting-time", "meeting-half-past"],
      phrases: [
        {
          slovak: "O tretej.",
          english: "3:00 — three o'clock.",
          audio: { transcript: "O tretej." },
        },
        {
          slovak: "O pol tretej.",
          english: "2:30 — half past two.",
          note: "Literally, halfway to three.",
          audio: { transcript: "O pol tretej." },
        },
      ],
    },
  },
  {
    id: "quarters",
    title: "Quarters and faces",
    teach: {
      phrases: [
        {
          slovak: "O štvrť na tri.",
          english: "2:15 — quarter past two.",
          audio: { transcript: "O štvrť na tri." },
        },
        {
          slovak: "O trištvrte na tri.",
          english: "2:45 — quarter to three.",
          audio: { transcript: "O trištvrte na tri." },
        },
      ],
      note: "Quarters name the hour ahead, like pol tretej.",
    },
  },
  {
    id: "registers",
    title: "Two questions",
    teach: {
      phrases: [
        {
          slovak: "Koľko je hodín?",
          english: "What time is it?",
          audio: { transcript: "Koľko je hodín?" },
        },
        {
          slovak: "O koľkej?",
          english: "At what time?",
          audio: { transcript: "O koľkej?" },
        },
      ],
      note: "Koľko je hodín? → Je/Sú …. O koľkej? → O tretej (locative).",
    },
  },
  {
    id: "duration",
    title: "In X minutes",
    teach: {
      phrases: [
        {
          slovak: "O dve hodiny.",
          english: "In two hours.",
          audio: { transcript: "O dve hodiny." },
        },
        {
          slovak: "O päť minút.",
          english: "In five minutes.",
          audio: { transcript: "O päť minút." },
        },
        {
          slovak: "Okolo tretej.",
          english: "Around three o'clock.",
          audio: { transcript: "Okolo tretej." },
        },
      ],
      note: "Duration uses o + accusative. Okolo is approximate.",
    },
  },
  {
    id: "your-turn",
    title: "Your turn",
    teach: {},
  },
];

export function withDaysDatesTimeExercises(
  shells: Omit<LessonBeat, "exercises">[],
  graded: LessonExercise[],
  clockVisual?: LessonBeat["teach"]["visual"],
): LessonBeat[] {
  const personal = graded[graded.length - 1];
  const rest = graded.slice(0, -1);

  const clockShell = shells[1];
  const clockTeach =
    clockShell && clockVisual
      ? { ...clockShell, teach: { ...clockShell.teach, visual: clockVisual } }
      : clockShell;

  return [
    { ...shells[0]!, exercises: rest.slice(0, 2) },
    { ...(clockTeach ?? shells[1]!), exercises: rest.slice(2, 5) },
    { ...shells[2]!, exercises: rest.slice(5, 8) },
    { ...shells[3]!, exercises: rest.slice(8, 10) },
    { ...shells[4]!, exercises: rest.slice(10, 12) },
    { ...shells[5]!, exercises: personal ? [personal] : [] },
  ];
}
