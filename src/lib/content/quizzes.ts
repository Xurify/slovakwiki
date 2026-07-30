export interface QuizContextLine {
  english?: string;
  label?: string;
  slovak: string;
}

export interface QuizQuestion {
  answerId: string;
  context?: QuizContextLine[];
  explanation: string;
  id: string;
  options: Array<{
    id: string;
    label: string;
  }>;
  prompt: string;
  reviewHref: string;
  reviewLabel: string;
}

export interface QuizPack {
  description: string;
  id: string;
  level: string;
  questions: QuizQuestion[];
  title: string;
  topics: string[];
}

export const quizPacks: QuizPack[] = [
  {
    id: "everyday-slovak",
    title: "Everyday Slovak",
    description: "Useful questions, polite replies, and travel phrases.",
    level: "Beginner",
    topics: ["Questions", "Polite phrases", "Travel"],
    questions: [
      {
        id: "find-the-station",
        prompt: "You need to find the station. Which word completes the sentence?",
        context: [{ slovak: "Prepáčte, ___ je stanica?" }],
        options: [
          { id: "kde", label: "kde" },
          { id: "kto", label: "kto" },
          { id: "kolko", label: "koľko" },
        ],
        answerId: "kde",
        explanation:
          "Kde means “where.” The complete question is “Prepáčte, kde je stanica?”",
        reviewHref: "/dictionary/kde",
        reviewLabel: "kde",
      },
      {
        id: "ask-the-price",
        prompt: "You want to ask the price. Which word completes the question?",
        context: [{ slovak: "___ to stojí?" }],
        options: [
          { id: "ako", label: "ako" },
          { id: "kolko", label: "koľko" },
          { id: "co", label: "čo" },
        ],
        answerId: "kolko",
        explanation:
          "Koľko means “how much” or “how many.” “Koľko to stojí?” asks how much something costs.",
        reviewHref: "/dictionary/kolko",
        reviewLabel: "koľko",
      },
      {
        id: "decline-coffee",
        prompt: "You do not want coffee. What is the polite reply?",
        context: [
          {
            label: "Server",
            slovak: "Dáte si kávu?",
            english: "Would you like coffee?",
          },
        ],
        options: [
          { id: "no-thanks", label: "Nie, ďakujem." },
          { id: "excuse-me", label: "Prepáčte." },
          { id: "goodbye", label: "Dovidenia." },
        ],
        answerId: "no-thanks",
        explanation:
          "“Nie, ďakujem” means “No, thank you.” It answers the question and keeps the reply polite.",
        reviewHref: "/dictionary/nie",
        reviewLabel: "nie",
      },
      {
        id: "one-ticket",
        prompt: "You are buying a ticket to Košice. Which word completes the request?",
        context: [{ slovak: "Jeden ___ do Košíc, prosím." }],
        options: [
          { id: "listok", label: "lístok" },
          { id: "mesto", label: "mesto" },
          { id: "stanica", label: "stanica" },
        ],
        answerId: "listok",
        explanation:
          "Lístok means “ticket.” The full request is “Jeden lístok do Košíc, prosím.”",
        reviewHref: "/dictionary/listok",
        reviewLabel: "lístok",
      },
      {
        id: "understand-a-little",
        prompt: "Which reply says that you understand a little Slovak?",
        context: [
          {
            label: "Speaker",
            slovak: "Hovoríte po slovensky?",
            english: "Do you speak Slovak?",
          },
        ],
        options: [
          { id: "understand", label: "Trochu rozumiem po slovensky." },
          { id: "learning", label: "Učím sa nové slová." },
          { id: "meaning", label: "Čo to znamená?" },
        ],
        answerId: "understand",
        explanation:
          "“Trochu rozumiem po slovensky” means “I understand a little Slovak.”",
        reviewHref: "/dictionary/rozumiem",
        reviewLabel: "rozumiem",
      },
      {
        id: "public-greeting",
        prompt: "You walk into a shop. How should you greet the cashier?",
        options: [
          { id: "dobry-den", label: "Dobrý deň." },
          { id: "ahoj", label: "Ahoj!" },
          { id: "dovidenia", label: "Dovidenia." },
        ],
        answerId: "dobry-den",
        explanation:
          "Dobrý deň is the polite greeting for shops, offices, and people you do not know.",
        reviewHref: "/dictionary/dobry-den",
        reviewLabel: "dobrý deň",
      },
    ],
  },
  {
    id: "grammar-basics",
    title: "Grammar basics",
    description: "Subjects, adjective endings, verb endings, and word order.",
    level: "Beginner",
    topics: ["Nouns", "Verbs", "Sentences"],
    questions: [
      {
        id: "subject-peter",
        prompt: "In this sentence, who is doing the reading?",
        context: [
          {
            slovak: "Peter číta knihu.",
            english: "Peter is reading a book.",
          },
        ],
        options: [
          { id: "peter", label: "Peter" },
          { id: "cita", label: "číta" },
          { id: "knihu", label: "knihu" },
        ],
        answerId: "peter",
        explanation:
          "Peter is doing the action, so Peter is the subject. The subject is in the nominative case.",
        reviewHref: "/grammar/cases/nominative",
        reviewLabel: "the nominative case",
      },
      {
        id: "subject-mesto",
        prompt: "What is being described as large?",
        context: [
          {
            slovak: "Mesto je veľké.",
            english: "The city is large.",
          },
        ],
        options: [
          { id: "mesto", label: "mesto" },
          { id: "je", label: "je" },
          { id: "velke", label: "veľké" },
        ],
        answerId: "mesto",
        explanation:
          "Mesto is the subject. A subject can be described; it does not always perform an action.",
        reviewHref: "/grammar/cases/nominative",
        reviewLabel: "the nominative case",
      },
      {
        id: "feminine-agreement",
        prompt: "Which adjective completes the sentence?",
        context: [
          {
            slovak: "___ žena číta.",
            english: "The good woman is reading.",
          },
        ],
        options: [
          { id: "dobry", label: "Dobrý" },
          { id: "dobra", label: "Dobrá" },
          { id: "dobre", label: "Dobré" },
        ],
        answerId: "dobra",
        explanation:
          "Žena is feminine, so the adjective takes the feminine ending -á: dobrá žena.",
        reviewHref: "/grammar/grammatical-gender",
        reviewLabel: "grammatical gender",
      },
      {
        id: "first-person-ending",
        prompt: "The verb ends in -m. What does that tell you?",
        context: [{ slovak: "Rozumiem." }],
        options: [
          { id: "i", label: "The speaker means “I.”" },
          { id: "you", label: "The speaker means “you.”" },
          { id: "past", label: "The action happened in the past." },
        ],
        answerId: "i",
        explanation:
          "In rozumiem, the final -m marks the first-person singular: “I understand.”",
        reviewHref: "/grammar/present-tense",
        reviewLabel: "present-tense endings",
      },
      {
        id: "second-person-ending",
        prompt: "Which sentence means “You understand” when speaking to one person informally?",
        options: [
          { id: "rozumiem", label: "Rozumiem." },
          { id: "rozumies", label: "Rozumieš." },
          { id: "rozumie", label: "Rozumie." },
        ],
        answerId: "rozumies",
        explanation:
          "Rozumieš ends in -š, the common second-person singular ending. Rozumiem means “I understand.”",
        reviewHref: "/grammar/present-tense",
        reviewLabel: "present-tense endings",
      },
      {
        id: "neutral-word-order",
        prompt: "Which sentence uses the most neutral word order?",
        options: [
          { id: "svo", label: "Peter číta knihu." },
          { id: "osv", label: "Knihu Peter číta." },
          { id: "vso", label: "Číta Peter knihu." },
        ],
        answerId: "svo",
        explanation:
          "Subject–verb–object is the usual neutral order: Peter číta knihu. Other orders are possible when context changes the emphasis.",
        reviewHref: "/grammar/word-order",
        reviewLabel: "word order",
      },
    ],
  },
  {
    id: "spelling-pronunciation",
    title: "Spelling & pronunciation",
    description: "First-syllable stress, long vowels, and marked consonants.",
    level: "Beginner",
    topics: ["Stress", "Vowel length", "Diacritics"],
    questions: [
      {
        id: "dakujem-stress",
        prompt: "Which syllable is normally stressed in ďakujem?",
        context: [{ slovak: "ďa · ku · jem", english: "thank you" }],
        options: [
          { id: "first", label: "ďa — the first syllable" },
          { id: "middle", label: "ku — the middle syllable" },
          { id: "last", label: "jem — the last syllable" },
        ],
        answerId: "first",
        explanation:
          "Slovak normally stresses the first syllable, so ďakujem begins with the stress.",
        reviewHref: "/pronunciation/first-syllable-stress",
        reviewLabel: "first-syllable stress",
      },
      {
        id: "kava-long-vowel",
        prompt: "What does the mark over á tell you?",
        context: [{ slovak: "káva", english: "coffee" }],
        options: [
          { id: "longer", label: "Hold the vowel longer." },
          { id: "louder", label: "Say the vowel louder." },
          { id: "silent", label: "Do not pronounce the vowel." },
        ],
        answerId: "longer",
        explanation:
          "The acute mark shows vowel length. Á is held longer than a plain a.",
        reviewHref: "/pronunciation/vowel-length",
        reviewLabel: "vowel length",
      },
      {
        id: "stress-and-length",
        prompt: "How should you pronounce the first syllable of káva?",
        context: [{ slovak: "ká · va", english: "coffee" }],
        options: [
          { id: "both", label: "Stress it and hold á longer." },
          { id: "stress-short", label: "Stress it but shorten á." },
          { id: "final-stress", label: "Hold á longer but stress va." },
        ],
        answerId: "both",
        explanation:
          "Káva has first-syllable stress and a long á. Stress and vowel length are separate features.",
        reviewHref: "/pronunciation/vowel-length",
        reviewLabel: "vowel length",
      },
      {
        id: "spelling-co",
        prompt: "Which is the correct Slovak spelling for “what”?",
        options: [
          { id: "co-caron", label: "čo" },
          { id: "co", label: "co" },
          { id: "co-long", label: "čó" },
        ],
        answerId: "co-caron",
        explanation:
          "Čo begins with č. The caron changes c into a different consonant.",
        reviewHref: "/pronunciation/soft-consonants",
        reviewLabel: "marked consonants",
      },
      {
        id: "spelling-zena",
        prompt: "Which is the correct Slovak spelling for “woman”?",
        options: [
          { id: "zena-caron", label: "žena" },
          { id: "zena", label: "zena" },
          { id: "zena-long", label: "žená" },
        ],
        answerId: "zena-caron",
        explanation:
          "Žena begins with ž. Ž and z are different consonants in Slovak.",
        reviewHref: "/pronunciation/soft-consonants",
        reviewLabel: "marked consonants",
      },
      {
        id: "spelling-listok",
        prompt: "Which is the correct Slovak spelling for “ticket”?",
        options: [
          { id: "listok-correct", label: "lístok" },
          { id: "listok-short", label: "listok" },
          { id: "listok-last", label: "listók" },
        ],
        answerId: "listok-correct",
        explanation:
          "Lístok has a long í in the first syllable. The acute mark belongs over i.",
        reviewHref: "/pronunciation/vowel-length",
        reviewLabel: "vowel length",
      },
    ],
  },
];
