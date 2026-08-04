import type { Lesson, LessonTrack, LessonTrackId } from "./learning-types";

export const lessonTracks: LessonTrack[] = [
  {
    id: "everyday",
    title: "Everyday Slovak",
    description: "Useful Slovak for meeting people and handling everyday situations.",
  },
  {
    id: "grammar",
    title: "Grammar",
    description: "Language patterns you can use in a real Slovak sentence.",
  },
  {
    id: "pronunciation",
    title: "Pronunciation",
    description: "Hear, read, and say the Slovak sounds that matter first.",
  },
];

export const lessons: Lesson[] = [
  {
    id: "everyday/meet-someone",
    track: "everyday",
    slug: "meet-someone",
    group: "Core tools",
    title: "Greetings and introductions",
    promise: "Greet someone politely, introduce yourself, and say where you are from.",
    scene: [
      {
        id: "anna-greeting",
        speaker: "Anna",
        slovak: "Dobrý deň. Volám sa Anna.",
        english: "Hello. My name is Anna.",
        audio: { transcript: "Dobrý deň. Volám sa Anna." },
      },
      {
        id: "you-introduction",
        speaker: "You",
        slovak: "Dobrý deň. Volám sa Alex.",
        english: "Hello. My name is Alex.",
        audio: { transcript: "Dobrý deň. Volám sa Alex." },
      },
      {
        id: "anna-origin",
        speaker: "Anna",
        slovak: "Teší ma. Odkiaľ ste?",
        english: "Nice to meet you. Where are you from?",
        audio: { transcript: "Teší ma. Odkiaľ ste?" },
      },
      {
        id: "you-origin",
        speaker: "You",
        slovak: "Som z Kanady.",
        english: "I am from Canada.",
        audio: { transcript: "Som z Kanady." },
      },
      {
        id: "anna-slovak",
        speaker: "Anna",
        slovak: "Hovoríte po slovensky?",
        english: "Do you speak Slovak?",
        audio: { transcript: "Hovoríte po slovensky?" },
      },
      {
        id: "you-learning",
        speaker: "You",
        slovak: "Trochu. Ešte sa učím.",
        english: "A little. I am still learning.",
        audio: { transcript: "Trochu. Ešte sa učím." },
      },
    ],
    keyPhrases: [
      {
        slovak: "Dobrý deň.",
        english: "Hello; good day.",
        note: "A safe polite greeting for a new or public interaction.",
        audio: { transcript: "Dobrý deň." },
      },
      {
        slovak: "Volám sa …",
        english: "My name is …",
        audio: { transcript: "Volám sa." },
      },
      {
        slovak: "Som z …",
        english: "I am from …",
        audio: { transcript: "Som z." },
      },
      {
        slovak: "Ešte sa učím.",
        english: "I am still learning.",
        audio: { transcript: "Ešte sa učím." },
      },
    ],
    pattern: {
      title: "Polite first contact",
      body: "Start with Dobrý deň when you do not know the person. Ahoj is for friends, peers, and people already using informal Slovak with you.",
    },
    exercises: [
      {
        id: "meet-someone-greeting",
        type: "choice",
        practiceItemId: "everyday/formal-greeting",
        prompt:
          "You are meeting Anna, the organiser, for the first time. What do you say?",
        choices: [
          { id: "formal", label: "Dobrý deň. Volám sa Alex." },
          { id: "informal", label: "Ahoj!" },
          { id: "leaving", label: "Dovidenia." },
        ],
        answerId: "formal",
        feedback: {
          correction: "Dobrý deň. Volám sa Alex.",
          english: "Hello. My name is Alex.",
          why: "Dobrý deň is the safe polite opening. Ahoj is for an informal interaction; Dovidenia is for leaving.",
        },
      },
      {
        id: "meet-someone-name",
        type: "build",
        practiceItemId: "everyday/introduction",
        prompt: "Anna has introduced herself. Build your reply.",
        tiles: ["Alex.", "sa", "Dobrý deň.", "Volám"],
        answer: ["Dobrý deň.", "Volám", "sa", "Alex."],
        feedback: {
          correction: "Dobrý deň. Volám sa Alex.",
          english: "Hello. My name is Alex.",
          why: "Volám sa is the everyday way to introduce yourself. The little word sa belongs with volám.",
        },
      },
      {
        id: "meet-someone-origin",
        type: "typed",
        task: "complete",
        practiceItemId: "everyday/origin",
        context: [
          {
            id: "origin-question",
            speaker: "Anna",
            slovak: "Odkiaľ ste?",
            english: "Where are you from?",
          },
        ],
        prompt: "Write: “I am from Canada.”",
        inputLabel: "Your Slovak answer",
        answer: "Som z Kanady.",
        feedback: {
          correction: "Som z Kanady.",
          english: "I am from Canada.",
          why: "Use Som z … for where you are from. The country follows z in its Slovak form: Kanada → Kanady.",
        },
      },
      {
        id: "meet-someone-personal",
        type: "personal",
        prompt:
          "Say the same answer with your own country. Then say it once without looking.",
        example: "Som z Kanady.",
      },
    ],
    referenceLinks: [
      { href: "/dictionary/dobry-den", label: "Dobrý deň" },
      { href: "/dictionary/ahoj", label: "Ahoj" },
      { href: "/dictionary/ucit-sa", label: "učiť sa" },
      { href: "/grammar/ty-vs-vy", label: "ty and vy" },
    ],
  },
  {
    id: "everyday/numbers-and-personal-details",
    track: "everyday",
    slug: "numbers-and-personal-details",
    group: "Core tools",
    title: "Numbers and personal details",
    promise: "Say your age, give phone digits, and understand a simple price.",
    scene: [
      {
        id: "registration-welcome",
        speaker: "Mária",
        slovak: "Dobrý deň. Ste tu na registráciu?",
        english: "Hello. Are you here for registration?",
        audio: { transcript: "Dobrý deň. Ste tu na registráciu?" },
      },
      {
        id: "registration-yes",
        speaker: "You",
        slovak: "Áno, som.",
        english: "Yes, I am.",
        audio: { transcript: "Áno, som." },
      },
      {
        id: "registration-age",
        speaker: "Mária",
        slovak: "Koľko máte rokov?",
        english: "How old are you?",
        audio: { transcript: "Koľko máte rokov?" },
      },
      {
        id: "registration-age-answer",
        speaker: "You",
        slovak: "Mám dvadsaťosem rokov.",
        english: "I am twenty-eight years old.",
        audio: { transcript: "Mám dvadsaťosem rokov." },
      },
      {
        id: "registration-phone",
        speaker: "Mária",
        slovak: "A vaše telefónne číslo?",
        english: "And your phone number?",
        audio: { transcript: "A vaše telefónne číslo?" },
      },
      {
        id: "registration-phone-answer",
        speaker: "You",
        slovak: "Moje číslo je nula deväť nula, jeden dva tri, štyri päť šesť.",
        english: "My number is zero nine zero, one two three, four five six.",
        audio: {
          transcript: "Moje číslo je nula deväť nula, jeden dva tri, štyri päť šesť.",
        },
      },
    ],
    keyPhrases: [
      {
        slovak: "Mám … rokov.",
        english: "I am … years old.",
        note: "Use rokov after the number when you say your age.",
        audio: { transcript: "Mám rokov." },
      },
      {
        slovak: "Moje číslo je …",
        english: "My number is …",
        note: "Say each phone digit separately.",
        audio: { transcript: "Moje číslo je." },
      },
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
    pattern: {
      title: "Age, digits, and prices",
      body: "For age, use Mám + number + rokov: Mám dvadsaťosem rokov. For a phone number, say the digits one by one. Ask Koľko to stojí? and answer Stojí to + price.",
    },
    exercises: [
      {
        id: "numbers-age",
        type: "choice",
        practiceItemId: "everyday/age-with-rokov",
        prompt: "You are twenty-eight. What do you say?",
        choices: [
          { id: "age", label: "Mám dvadsaťosem rokov." },
          { id: "number", label: "Moje číslo je dvadsaťosem." },
          { id: "price", label: "Stojí to dvadsaťosem eur." },
        ],
        answerId: "age",
        feedback: {
          correction: "Mám dvadsaťosem rokov.",
          english: "I am twenty-eight years old.",
          why: "Use Mám + number + rokov for your age.",
        },
      },
      {
        id: "numbers-phone",
        type: "build",
        practiceItemId: "everyday/phone-number-digits",
        prompt: "Build the phone-number answer.",
        tiles: ["jeden", "Moje", "číslo", "je", "nula", "deväť", "nula."],
        answer: ["Moje", "číslo", "je", "nula", "deväť", "nula.", "jeden"],
        feedback: {
          correction: "Moje číslo je nula deväť nula jeden.",
          english: "My number is zero nine zero one.",
          why: "Phone numbers are normally spoken digit by digit.",
        },
      },
      {
        id: "numbers-price",
        type: "typed",
        task: "complete",
        practiceItemId: "everyday/simple-price",
        prompt: "Write: “It costs five euros.”",
        inputLabel: "Your Slovak answer",
        answer: "Stojí to päť eur.",
        feedback: {
          correction: "Stojí to päť eur.",
          english: "It costs five euros.",
          why: "Use stojí to for a simple price. After päť, use eur.",
        },
      },
      {
        id: "numbers-personal",
        type: "personal",
        prompt: "Say your age and then say four digits of your phone number aloud.",
        example: "Mám dvadsaťosem rokov. Moje číslo je nula deväť nula jeden.",
      },
    ],
    referenceLinks: [
      { href: "/grammar/numbers-and-numerals", label: "Numbers and numerals" },
      { href: "/grammar/questions", label: "Questions" },
    ],
  },
  {
    id: "everyday/days-dates-and-time",
    track: "everyday",
    slug: "days-dates-and-time",
    group: "Core tools",
    title: "Days, dates, and time",
    promise: "Arrange a meeting with a day and a clock time.",
    scene: [
      {
        id: "meeting-today",
        speaker: "Anna",
        slovak: "Dnes je pondelok.",
        english: "Today is Monday.",
        audio: { transcript: "Dnes je pondelok." },
      },
      {
        id: "meeting-suggestion",
        speaker: "Anna",
        slovak: "Stretneme sa v utorok?",
        english: "Shall we meet on Tuesday?",
        audio: { transcript: "Stretneme sa v utorok?" },
      },
      {
        id: "meeting-time",
        speaker: "You",
        slovak: "Áno. O tretej?",
        english: "Yes. At three?",
        audio: { transcript: "Áno. O tretej?" },
      },
      {
        id: "meeting-half-past",
        speaker: "Anna",
        slovak: "Lepšie o pol tretej.",
        english: "Better at half past two.",
        audio: { transcript: "Lepšie o pol tretej." },
      },
    ],
    keyPhrases: [
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
      {
        slovak: "O tretej.",
        english: "At three o’clock.",
        audio: { transcript: "O tretej." },
      },
      {
        slovak: "O pol tretej.",
        english: "At half past two.",
        note: "Literally, halfway to three.",
        audio: { transcript: "O pol tretej." },
      },
    ],
    pattern: {
      title: "Days and appointment times",
      body: "Use v + a day for when something happens: Stretneme sa v utorok. Use o + a clock time for an appointment: O tretej. O pol tretej means 2:30, halfway to three. Quarters also look ahead: O štvrť na tri is 2:15, and O trištvrte na tri is 2:45.",
    },
    visual: {
      type: "clock-grid",
      title: "Match the face to the phrase",
      items: [
        {
          time: { hour: 3, minute: 0 },
          slovak: "O tretej.",
          english: "At three o’clock.",
        },
        {
          time: { hour: 2, minute: 30 },
          slovak: "O pol tretej.",
          english: "At half past two.",
        },
        {
          time: { hour: 2, minute: 15 },
          slovak: "O štvrť na tri.",
          english: "At quarter past two.",
        },
        {
          time: { hour: 2, minute: 45 },
          slovak: "O trištvrte na tri.",
          english: "At quarter to three.",
        },
      ],
    },
    exercises: [
      {
        id: "days-meeting-day",
        type: "typed",
        task: "complete",
        practiceItemId: "everyday/day-meeting",
        prompt: "Write: “We will meet on Tuesday.”",
        inputLabel: "Your Slovak answer",
        answer: "Stretneme sa v utorok.",
        feedback: {
          correction: "Stretneme sa v utorok.",
          english: "We will meet on Tuesday.",
          why: "Use v before the day when arranging a meeting.",
        },
      },
      {
        id: "days-meeting-time",
        type: "choice",
        practiceItemId: "everyday/meeting-time",
        prompt: "Anna asks when you can meet at 3:00. What do you say?",
        choices: [
          { id: "three", label: "O tretej.", clock: { hour: 3, minute: 0 } },
          { id: "four", label: "O štvrtej.", clock: { hour: 4, minute: 0 } },
          {
            id: "half-past",
            label: "O pol tretej.",
            clock: { hour: 2, minute: 30 },
          },
        ],
        answerId: "three",
        feedback: {
          correction: "O tretej.",
          english: "At three o’clock.",
          why: "Use o + the time for an appointment.",
        },
      },
      {
        id: "days-half-past",
        type: "build",
        practiceItemId: "everyday/half-past-time",
        prompt: "Build the answer for 2:30.",
        tiles: ["tretej.", "O", "pol"],
        answer: ["O", "pol", "tretej."],
        feedback: {
          correction: "O pol tretej.",
          english: "At half past two.",
          why: "Pol tretej is halfway to three, so it means 2:30.",
        },
      },
      {
        id: "days-quarter-time",
        type: "choice",
        practiceItemId: "everyday/quarter-time",
        prompt: "The film starts at 2:45. Which time do you say?",
        choices: [
          {
            id: "three-quarters",
            label: "O trištvrte na tri.",
            clock: { hour: 2, minute: 45 },
          },
          {
            id: "quarter",
            label: "O štvrť na tri.",
            clock: { hour: 2, minute: 15 },
          },
          {
            id: "half-past",
            label: "O pol tretej.",
            clock: { hour: 2, minute: 30 },
          },
        ],
        answerId: "three-quarters",
        feedback: {
          correction: "O trištvrte na tri.",
          english: "At quarter to three.",
          why: "Trištvrte na tri is three-quarters toward three, so it means 2:45.",
        },
      },
      {
        id: "days-personal",
        type: "personal",
        prompt: "Arrange a real or imagined meeting: choose a day and a time.",
        example: "Stretneme sa v piatok o tretej.",
      },
    ],
    referenceLinks: [
      { href: "/grammar/telling-time", label: "Telling time" },
      { href: "/grammar/numbers-and-numerals", label: "Numbers and numerals" },
      { href: "/grammar/questions", label: "Questions" },
    ],
  },
  {
    id: "everyday/negation-in-conversation",
    track: "everyday",
    slug: "negation-in-conversation",
    group: "Core tools",
    title: "Negation in conversation",
    promise: "Refuse politely, say you do not understand, and use common negative verbs.",
    scene: [
      {
        id: "cafe-offer",
        speaker: "Waiter",
        slovak: "Dáte si kávu?",
        english: "Would you like coffee?",
        audio: { transcript: "Dáte si kávu?" },
      },
      {
        id: "cafe-refusal",
        speaker: "You",
        slovak: "Nie, ďakujem. Nemám teraz čas.",
        english: "No, thank you. I do not have time now.",
        audio: { transcript: "Nie, ďakujem. Nemám teraz čas." },
      },
      {
        id: "cafe-menu",
        speaker: "Waiter",
        slovak: "Rozumiete menu?",
        english: "Do you understand the menu?",
        audio: { transcript: "Rozumiete menu?" },
      },
      {
        id: "cafe-clarification",
        speaker: "You",
        slovak: "Nerozumiem. Nie je to pre mňa.",
        english: "I do not understand. It is not for me.",
        audio: { transcript: "Nerozumiem. Nie je to pre mňa." },
      },
    ],
    keyPhrases: [
      {
        slovak: "Nie, ďakujem.",
        english: "No, thank you.",
        audio: { transcript: "Nie, ďakujem." },
      },
      {
        slovak: "Nerozumiem.",
        english: "I do not understand.",
        audio: { transcript: "Nerozumiem." },
      },
      {
        slovak: "Nemám …",
        english: "I do not have …",
        audio: { transcript: "Nemám." },
      },
      {
        slovak: "Nie je to …",
        english: "It is not …",
        audio: { transcript: "Nie je to." },
      },
    ],
    pattern: {
      title: "Put nie with the verb",
      body: "In Slovak, nie attaches to the verb: rozumiem → nerozumiem, mám → nemám, je → nie je. Learn frequent negative forms as complete chunks, then use them in a short answer.",
    },
    exercises: [
      {
        id: "negation-refusal",
        type: "choice",
        practiceItemId: "everyday/negative-answer",
        prompt: "You do not want coffee. What is a polite reply?",
        choices: [
          { id: "no", label: "Nie, ďakujem." },
          { id: "yes", label: "Áno, ďakujem." },
          { id: "leaving", label: "Dovidenia." },
        ],
        answerId: "no",
        feedback: {
          correction: "Nie, ďakujem.",
          english: "No, thank you.",
          why: "Nie, ďakujem is a brief, polite refusal.",
        },
      },
      {
        id: "negation-understanding",
        type: "typed",
        task: "complete",
        practiceItemId: "everyday/not-understand",
        prompt: "Write: “I do not understand.”",
        inputLabel: "Your Slovak answer",
        answer: "Nerozumiem.",
        feedback: {
          correction: "Nerozumiem.",
          english: "I do not understand.",
          why: "Nie joins the front of rozumiem: nerozumiem.",
        },
      },
      {
        id: "negation-verb-placement",
        type: "build",
        practiceItemId: "everyday/negative-verb-placement",
        prompt: "Build: “I do not have time.”",
        tiles: ["čas.", "Nemám"],
        answer: ["Nemám", "čas."],
        feedback: {
          correction: "Nemám čas.",
          english: "I do not have time.",
          why: "The negative stays with the verb: nemám, not mám nie.",
        },
      },
      {
        id: "negation-personal",
        type: "personal",
        prompt:
          "Refuse one offer politely, then say one thing you do not understand or do not have.",
        example: "Nie, ďakujem. Nerozumiem. / Nemám čas.",
      },
    ],
    referenceLinks: [
      { href: "/grammar/negation", label: "Negation" },
      { href: "/grammar/word-order", label: "Word order" },
    ],
  },
  {
    id: "grammar/present-tense-i",
    track: "grammar",
    slug: "present-tense-i",
    title: "Present-tense endings",
    promise: "Use the six present-tense endings to say who is doing the action.",
    scene: [
      {
        id: "peter-reads",
        speaker: "Anna",
        slovak: "Peter číta knihu.",
        english: "Peter is reading a book.",
        audio: { transcript: "Peter číta knihu." },
      },
      {
        id: "ask-you",
        speaker: "Anna",
        slovak: "Čítaš knihu?",
        english: "Are you reading a book?",
        audio: { transcript: "Čítaš knihu?" },
      },
      {
        id: "you-read",
        speaker: "You",
        slovak: "Áno, čítam.",
        english: "Yes, I am reading.",
        audio: { transcript: "Áno, čítam." },
      },
    ],
    keyPhrases: [
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
        note: "on / ona · no extra ending",
        audio: { transcript: "číta" },
      },
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
    pattern: {
      title: "Six endings, one present tense",
      body: "Čítať shows the pattern: čítam, čítaš, číta, čítame, čítate, čítajú. Slovak often drops ja, ty, and my because the ending already says who acts. Vy covers both plural you and formal singular you.",
    },
    exercises: [
      {
        id: "present-tense-choose",
        type: "choice",
        practiceItemId: "grammar/first-person-reading",
        prompt:
          "You are describing yourself. Which sentence means “I am reading a book”?",
        choices: [
          { id: "first-person", label: "Čítam knihu." },
          { id: "third-person", label: "Číta knihu." },
          { id: "second-person", label: "Čítaš knihu." },
        ],
        answerId: "first-person",
        feedback: {
          correction: "Čítam knihu.",
          english: "I am reading a book.",
          why: "The ending -m marks I. Číta is he/she; čítaš is informal you.",
        },
      },
      {
        id: "present-tense-repair",
        type: "typed",
        task: "repair",
        practiceItemId: "grammar/repair-first-person-reading",
        context: [
          {
            id: "lesson-reading-broken",
            speaker: "Sentence",
            slovak: "Ja číta knihu.",
            english: "I am reading a book.",
          },
        ],
        prompt: "Repair this sentence.",
        inputLabel: "Correct Slovak sentence",
        answer: "Čítam knihu.",
        acceptedAnswers: ["Ja čítam knihu."],
        feedback: {
          correction: "Čítam knihu.",
          english: "I am reading a book.",
          why: "Číta is he/she reads. Change it to čítam for I. Ja is possible for emphasis, but the verb ending already says who is acting.",
        },
      },
      {
        id: "present-tense-we-choose",
        type: "choice",
        practiceItemId: "grammar/today-reading",
        prompt: "Which sentence means “Today we are reading a book”?",
        choices: [
          { id: "we", label: "Dnes čítame knihu." },
          { id: "i", label: "Dnes čítam knihu." },
          { id: "they", label: "Dnes čítajú knihu." },
        ],
        answerId: "we",
        feedback: {
          correction: "Dnes čítame knihu.",
          english: "Today we are reading a book.",
          why: "Čítame ends in -me for we. Čítam is I; čítajú is they.",
        },
      },
      {
        id: "present-tense-personal",
        type: "personal",
        prompt:
          "Say one true present-tense sentence about yourself or about someone else.",
        example: "Dnes pracujem. / Peter číta noviny.",
      },
    ],
    referenceLinks: [{ href: "/grammar/present-tense", label: "Present tense" }],
  },
  {
    id: "grammar/byt-present",
    track: "grammar",
    slug: "byt-present",
    title: "Present forms of byť",
    promise: "Say who you are and where you are with som / ste / je.",
    scene: [
      {
        id: "byt-check-in-name",
        speaker: "Receptionist",
        slovak: "Dobrý deň. Ste Alex?",
        english: "Hello. Are you Alex?",
        audio: { transcript: "Dobrý deň. Ste Alex?" },
      },
      {
        id: "byt-check-in-answer",
        speaker: "You",
        slovak: "Áno, som Alex.",
        english: "Yes, I am Alex.",
        audio: { transcript: "Áno, som Alex." },
      },
      {
        id: "byt-check-in-location",
        speaker: "Receptionist",
        slovak: "Je to tu prvýkrát?",
        english: "Is this your first time here?",
        audio: { transcript: "Je to tu prvýkrát?" },
      },
      {
        id: "byt-check-in-group",
        speaker: "You",
        slovak: "Áno. Sme tu s priateľmi.",
        english: "Yes. We are here with friends.",
        audio: { transcript: "Áno. Sme tu s priateľmi." },
      },
    ],
    keyPhrases: [
      {
        slovak: "Som …",
        english: "I am …",
        audio: { transcript: "Som." },
      },
      {
        slovak: "Ste …?",
        english: "Are you …? (formal / plural)",
        audio: { transcript: "Ste?" },
      },
      {
        slovak: "Je to …",
        english: "It is …",
        audio: { transcript: "Je to." },
      },
      {
        slovak: "Sme …",
        english: "We are …",
        audio: { transcript: "Sme." },
      },
    ],
    pattern: {
      title: "Present forms of byť",
      body: "Byť (to be) is irregular: som, si, je, sme, ste, sú. Use it for identity and location: Som Alex. Sme tu. Do not use byť for age: Slovak uses mať, as in Mám dvadsať rokov.",
    },
    exercises: [
      {
        id: "byt-som",
        type: "choice",
        practiceItemId: "grammar/byt-som",
        prompt: "Which answer means “I am Alex”?",
        choices: [
          { id: "i-am", label: "Som Alex." },
          { id: "you-are", label: "Ste Alex." },
          { id: "we-are", label: "Sme Alex." },
        ],
        answerId: "i-am",
        feedback: {
          correction: "Som Alex.",
          english: "I am Alex.",
          why: "Som is the first-person singular form of byť: I am.",
        },
      },
      {
        id: "byt-ste",
        type: "build",
        practiceItemId: "grammar/byt-ste",
        prompt: "Build the polite question: “Are you Alex?”",
        tiles: ["Alex?", "Ste"],
        answer: ["Ste", "Alex?"],
        feedback: {
          correction: "Ste Alex?",
          english: "Are you Alex?",
          why: "Ste is used for formal singular you and plural you.",
        },
      },
      {
        id: "byt-je-location",
        type: "typed",
        task: "complete",
        practiceItemId: "grammar/byt-je-location",
        prompt: "Write: “The café is here.”",
        inputLabel: "Your Slovak answer",
        answer: "Kaviareň je tu.",
        feedback: {
          correction: "Kaviareň je tu.",
          english: "The café is here.",
          why: "Je is the he/she/it form of byť. Use it to say where one thing is.",
        },
      },
      {
        id: "byt-personal",
        type: "personal",
        prompt: "Say who you are and where you are. Then make one sentence with sme.",
        example: "Som Alex. Som v kaviarni. Sme tu s priateľmi.",
      },
    ],
    referenceLinks: [
      { href: "/grammar/byt-present", label: "Byť" },
      { href: "/grammar/ty-vs-vy", label: "ty and vy" },
      { href: "/grammar/mat-present", label: "Mať" },
    ],
  },
  {
    id: "grammar/mat-present",
    track: "grammar",
    slug: "mat-present",
    title: "Present forms of mať",
    promise: "Say what you have, your age, and that you don’t have something.",
    scene: [
      {
        id: "mat-cafe-time",
        speaker: "Mária",
        slovak: "Máš čas na kávu?",
        english: "Do you have time for coffee?",
        audio: { transcript: "Máš čas na kávu?" },
      },
      {
        id: "mat-cafe-answer",
        speaker: "You",
        slovak: "Áno, mám čas.",
        english: "Yes, I have time.",
        audio: { transcript: "Áno, mám čas." },
      },
      {
        id: "mat-cafe-age",
        speaker: "Mária",
        slovak: "Koľko máš rokov?",
        english: "How old are you?",
        audio: { transcript: "Koľko máš rokov?" },
      },
      {
        id: "mat-cafe-age-answer",
        speaker: "You",
        slovak: "Mám dvadsaťosem rokov.",
        english: "I am twenty-eight years old.",
        audio: { transcript: "Mám dvadsaťosem rokov." },
      },
      {
        id: "mat-cafe-possession",
        speaker: "You",
        slovak: "Nemám hotovosť, ale mám kartu.",
        english: "I do not have cash, but I have a card.",
        audio: { transcript: "Nemám hotovosť, ale mám kartu." },
      },
    ],
    keyPhrases: [
      {
        slovak: "Mám …",
        english: "I have …",
        audio: { transcript: "Mám." },
      },
      {
        slovak: "Máš …?",
        english: "Do you have …? (informal)",
        audio: { transcript: "Máš?" },
      },
      {
        slovak: "Nemám …",
        english: "I do not have …",
        audio: { transcript: "Nemám." },
      },
      {
        slovak: "Mám … rokov.",
        english: "I am … years old.",
        audio: { transcript: "Mám rokov." },
      },
    ],
    pattern: {
      title: "Present forms of mať",
      body: "Mať (to have) is mám, máš, má, máme, máte, majú. Máš is informal singular you; máte is formal singular or plural you. Slovak says Mám dvadsať rokov for age, not Som dvadsať rokov. Add ne- to make a negative: mám → nemám.",
    },
    exercises: [
      {
        id: "mat-mam",
        type: "choice",
        practiceItemId: "grammar/mat-mam",
        prompt: "Which sentence means “I have time”?",
        choices: [
          { id: "i-have", label: "Mám čas." },
          { id: "you-have", label: "Máš čas." },
          { id: "i-am", label: "Som čas." },
        ],
        answerId: "i-have",
        feedback: {
          correction: "Mám čas.",
          english: "I have time.",
          why: "Mám is the first-person singular form of mať: I have.",
        },
      },
      {
        id: "mat-mas",
        type: "build",
        practiceItemId: "grammar/mat-mas",
        prompt: "Build the informal question: “Do you have a card?”",
        tiles: ["kartu?", "Máš"],
        answer: ["Máš", "kartu?"],
        feedback: {
          correction: "Máš kartu?",
          english: "Do you have a card?",
          why: "Máš is used when speaking informally to one person.",
        },
      },
      {
        id: "mat-nemam",
        type: "typed",
        task: "complete",
        practiceItemId: "grammar/mat-nemam",
        prompt: "Write: “I do not have cash.”",
        inputLabel: "Your Slovak answer",
        answer: "Nemám hotovosť.",
        feedback: {
          correction: "Nemám hotovosť.",
          english: "I do not have cash.",
          why: "Put ne- onto mám to make the negative form nemám.",
        },
      },
      {
        id: "mat-personal",
        type: "personal",
        prompt:
          "Say your age, then name one thing you have and one thing you do not have.",
        example: "Mám dvadsaťosem rokov. Mám kartu. Nemám hotovosť.",
      },
    ],
    referenceLinks: [
      { href: "/grammar/mat-present", label: "Mať" },
      { href: "/grammar/byt-present", label: "Byť" },
      { href: "/grammar/numbers-and-numerals", label: "Numbers and numerals" },
      { href: "/grammar/negation", label: "Negation" },
    ],
  },
  {
    id: "pronunciation/first-syllable-stress",
    track: "pronunciation",
    slug: "first-syllable-stress",
    title: "First-syllable stress",
    promise: "Hear the regular first-syllable stress in common Slovak words.",
    scene: [
      {
        id: "anna-thanks",
        speaker: "Anna",
        slovak: "Ďakujem za pomoc.",
        english: "Thank you for the help.",
        audio: { transcript: "Ďakujem za pomoc." },
      },
      {
        id: "stress-mark",
        speaker: "Notice",
        slovak: "ĎA-ku-jem",
        english: "The first syllable takes the steady beat.",
        audio: { transcript: "ďakujem" },
      },
    ],
    keyPhrases: [
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
    pattern: {
      title: "Stress is usually first",
      body: "In ordinary Slovak words, the first syllable carries the main beat. This is separate from vowel length: a long vowel is held longer, not automatically stressed.",
    },
    exercises: [
      {
        id: "stress-choose",
        type: "choice",
        practiceItemId: "pronunciation/dakujem-stress",
        prompt: "Which syllable is normally stressed in ďakujem?",
        choices: [
          { id: "first", label: "ďa — the first syllable" },
          { id: "middle", label: "ku — the middle syllable" },
          { id: "last", label: "jem — the last syllable" },
        ],
        answerId: "first",
        feedback: {
          correction: "ĎA-ku-jem",
          why: "Slovak normally puts the main stress on the first syllable of a word.",
        },
      },
      {
        id: "stress-build",
        type: "build",
        practiceItemId: "pronunciation/thanks-phrase",
        prompt: "Build the phrase Anna said.",
        tiles: ["pomoc.", "Ďakujem", "za"],
        answer: ["Ďakujem", "za", "pomoc."],
        feedback: {
          correction: "Ďakujem za pomoc.",
          english: "Thank you for the help.",
          why: "Keep the first beat on ĎA- in ďakujem, then say the rest of the phrase evenly.",
        },
      },
      {
        id: "stress-personal",
        type: "personal",
        prompt: "Listen, then say these aloud: ďakujem, Bratislava, prosím.",
      },
    ],
    referenceLinks: [
      { href: "/pronunciation/first-syllable-stress", label: "First-syllable stress" },
      { href: "/dictionary/dakujem", label: "ďakujem" },
    ],
  },
];

export const lessonById = new Map(lessons.map((lesson) => [lesson.id, lesson]));

export function lessonPath(lesson: Pick<Lesson, "slug" | "track">): string {
  return `/lessons/${lesson.track}/${lesson.slug}`;
}

export function lessonsForTrack(track: LessonTrackId): Lesson[] {
  return lessons.filter((lesson) => lesson.track === track);
}

export function validateLessons(): string[] {
  const issues: string[] = [];
  const ids = new Set<string>();

  for (const lesson of lessons) {
    if (ids.has(lesson.id)) issues.push(`Duplicate lesson: ${lesson.id}`);
    ids.add(lesson.id);

    if (!lesson.scene.length) issues.push(`Missing scene: ${lesson.id}`);
    if (!lesson.exercises.length) issues.push(`Missing exercises: ${lesson.id}`);
    if (lesson.exercises.filter((exercise) => exercise.type !== "personal").length < 2) {
      issues.push(`Too few graded exercises: ${lesson.id}`);
    }
  }

  return issues;
}
