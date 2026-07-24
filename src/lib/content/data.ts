import type { ContentEntry } from "./types";

const dictionarySource = "https://slovnik.juls.savba.sk/";
const languageSource = "https://www.juls.savba.sk/";

const wordSeed: Pick<
  ContentEntry,
  "slug" | "slovak" | "english" | "category" | "examples" | "related"
>[] = [
  {
    slug: "ahoj",
    slovak: "ahoj",
    english: "hello; hi; bye",
    category: "Greetings",
    examples: [{ slovak: "Ahoj, ako sa máš?", english: "Hi, how are you?" }],
    related: ["dobry-den", "dovidenia"],
  },
  {
    slug: "dakujem",
    slovak: "ďakujem",
    english: "thank you",
    category: "Essentials",
    examples: [{ slovak: "Ďakujem za pomoc.", english: "Thank you for the help." }],
    related: ["prosim", "prepacte"],
  },
  {
    slug: "prosim",
    slovak: "prosím",
    english: "please; you’re welcome",
    category: "Essentials",
    examples: [{ slovak: "Jednu kávu, prosím.", english: "One coffee, please." }],
    related: ["dakujem", "ano"],
  },
  {
    slug: "ano",
    slovak: "áno",
    english: "yes",
    category: "Essentials",
    examples: [{ slovak: "Áno, rozumiem.", english: "Yes, I understand." }],
    related: ["nie", "rozumiem"],
  },
  {
    slug: "nie",
    slovak: "nie",
    english: "no; not",
    category: "Essentials",
    examples: [{ slovak: "Nie, ďakujem.", english: "No, thank you." }],
    related: ["ano", "dakujem"],
  },
  {
    slug: "dobry-den",
    slovak: "dobrý deň",
    english: "good day; hello",
    category: "Greetings",
    examples: [{ slovak: "Dobrý deň, pani Nováková.", english: "Hello, Ms. Nováková." }],
    related: ["ahoj", "dovidenia"],
  },
  {
    slug: "dovidenia",
    slovak: "dovidenia",
    english: "goodbye",
    category: "Greetings",
    examples: [{ slovak: "Ďakujem, dovidenia.", english: "Thank you, goodbye." }],
    related: ["ahoj", "dobry-den"],
  },
  {
    slug: "prepacte",
    slovak: "prepáčte",
    english: "excuse me; sorry",
    category: "Essentials",
    examples: [
      {
        slovak: "Prepáčte, kde je stanica?",
        english: "Excuse me, where is the station?",
      },
    ],
    related: ["prosim", "kde"],
  },
  {
    slug: "ako",
    slovak: "ako",
    english: "how; as; like",
    category: "Questions",
    examples: [{ slovak: "Ako sa voláš?", english: "What is your name?" }],
    related: ["kde", "co"],
  },
  {
    slug: "kde",
    slovak: "kde",
    english: "where",
    category: "Questions",
    examples: [{ slovak: "Kde bývaš?", english: "Where do you live?" }],
    related: ["ako", "co"],
  },
  {
    slug: "co",
    slovak: "čo",
    english: "what",
    category: "Questions",
    examples: [{ slovak: "Čo to znamená?", english: "What does that mean?" }],
    related: ["ako", "kde"],
  },
  {
    slug: "kto",
    slovak: "kto",
    english: "who",
    category: "Questions",
    examples: [{ slovak: "Kto je to?", english: "Who is that?" }],
    related: ["co", "kde"],
  },
  {
    slug: "kolko",
    slovak: "koľko",
    english: "how much; how many",
    category: "Questions",
    examples: [{ slovak: "Koľko to stojí?", english: "How much does it cost?" }],
    related: ["ako", "listok"],
  },
  {
    slug: "rozumiem",
    slovak: "rozumiem",
    english: "I understand",
    category: "Conversation",
    examples: [
      {
        slovak: "Trochu rozumiem po slovensky.",
        english: "I understand a little Slovak.",
      },
    ],
    related: ["hovorit", "slovensky"],
  },
  {
    slug: "hovorit",
    slovak: "hovoriť",
    english: "to speak",
    category: "Conversation",
    examples: [{ slovak: "Hovoríte po anglicky?", english: "Do you speak English?" }],
    related: ["rozumiem", "slovensky"],
  },
  {
    slug: "slovensky",
    slovak: "slovensky",
    english: "in Slovak",
    category: "Conversation",
    examples: [{ slovak: "Učím sa po slovensky.", english: "I am learning Slovak." }],
    related: ["hovorit", "ucit-sa"],
  },
  {
    slug: "ucit-sa",
    slovak: "učiť sa",
    english: "to learn; to study",
    category: "Learning",
    examples: [{ slovak: "Učím sa nové slová.", english: "I am learning new words." }],
    related: ["slovensky", "slovo"],
  },
  {
    slug: "slovo",
    slovak: "slovo",
    english: "word",
    category: "Learning",
    examples: [{ slovak: "Toto slovo je nové.", english: "This word is new." }],
    related: ["ucit-sa", "jazyk"],
  },
  {
    slug: "jazyk",
    slovak: "jazyk",
    english: "language; tongue",
    category: "Learning",
    examples: [
      {
        slovak: "Slovenčina je slovanský jazyk.",
        english: "Slovak is a Slavic language.",
      },
    ],
    related: ["slovo", "slovensky"],
  },
  {
    slug: "dom",
    slovak: "dom",
    english: "house; home",
    category: "Everyday life",
    examples: [{ slovak: "Náš dom je malý.", english: "Our house is small." }],
    related: ["rodina", "mesto"],
  },
  {
    slug: "rodina",
    slovak: "rodina",
    english: "family",
    category: "Everyday life",
    examples: [
      {
        slovak: "Moja rodina žije na Slovensku.",
        english: "My family lives in Slovakia.",
      },
    ],
    related: ["dom", "priatel"],
  },
  {
    slug: "priatel",
    slovak: "priateľ",
    english: "friend; boyfriend",
    category: "People",
    examples: [{ slovak: "Peter je môj priateľ.", english: "Peter is my friend." }],
    related: ["rodina", "clovek"],
  },
  {
    slug: "clovek",
    slovak: "človek",
    english: "person; human",
    category: "People",
    examples: [{ slovak: "Je to dobrý človek.", english: "He is a good person." }],
    related: ["priatel", "muz", "zena"],
  },
  {
    slug: "muz",
    slovak: "muž",
    english: "man; husband",
    category: "People",
    examples: [{ slovak: "Ten muž čaká.", english: "That man is waiting." }],
    related: ["zena", "clovek"],
  },
  {
    slug: "zena",
    slovak: "žena",
    english: "woman; wife",
    category: "People",
    examples: [{ slovak: "Tá žena číta.", english: "That woman is reading." }],
    related: ["muz", "clovek"],
  },
  {
    slug: "jedlo",
    slovak: "jedlo",
    english: "food; meal",
    category: "Food",
    examples: [{ slovak: "Toto jedlo je výborné.", english: "This food is excellent." }],
    related: ["voda", "kava"],
  },
  {
    slug: "voda",
    slovak: "voda",
    english: "water",
    category: "Food",
    examples: [
      { slovak: "Prosím si pohár vody.", english: "I’d like a glass of water." },
    ],
    related: ["jedlo", "kava"],
  },
  {
    slug: "kava",
    slovak: "káva",
    english: "coffee",
    category: "Food",
    examples: [{ slovak: "Dáte si kávu?", english: "Would you like coffee?" }],
    related: ["voda", "jedlo"],
  },
  {
    slug: "mesto",
    slovak: "mesto",
    english: "city; town",
    category: "Places",
    examples: [
      {
        slovak: "Bratislava je hlavné mesto.",
        english: "Bratislava is the capital city.",
      },
    ],
    related: ["dom", "stanica"],
  },
  {
    slug: "stanica",
    slovak: "stanica",
    english: "station",
    category: "Travel",
    examples: [{ slovak: "Stanica je blízko.", english: "The station is nearby." }],
    related: ["mesto", "listok"],
  },
  {
    slug: "listok",
    slovak: "lístok",
    english: "ticket; small leaf",
    category: "Travel",
    examples: [
      {
        slovak: "Jeden lístok do Košíc, prosím.",
        english: "One ticket to Košice, please.",
      },
    ],
    related: ["stanica", "kolko"],
  },
];

export const words: ContentEntry[] = wordSeed.map((word) => ({
  ...word,
  kind: "word",
  summary: `${word.slovak} means “${word.english}.”`,
  body: [
    `Use “${word.slovak}” in everyday Slovak. Listen for its natural stress on the first syllable.`,
    "Read the example aloud, then replace one part of the sentence with a word you already know.",
  ],
  source: dictionarySource,
  tags: [word.category.toLowerCase(), "beginner"],
}));

export const grammarEntries: ContentEntry[] = [
  {
    slug: "grammatical-gender",
    slovak: "gramatický rod",
    english: "grammatical gender",
    category: "Nouns",
    kind: "grammar",
    summary: "Slovak nouns belong to masculine, feminine, or neuter gender.",
    body: [
      "Gender affects adjective endings, pronouns, and past-tense verbs. Learn a noun together with its gender.",
      "Many masculine nouns end in a consonant, many feminine nouns end in -a, and many neuter nouns end in -o or -e. These patterns help, but exceptions exist.",
    ],
    examples: [
      { slovak: "dobrý muž", english: "a good man" },
      { slovak: "dobrá žena", english: "a good woman" },
      { slovak: "dobré mesto", english: "a good city" },
    ],
    related: ["muz", "zena", "mesto"],
    source: languageSource,
    tags: ["nouns", "gender", "beginner"],
  },
  {
    slug: "present-tense",
    slovak: "prítomný čas",
    english: "present tense",
    category: "Verbs",
    kind: "grammar",
    summary: "Present-tense endings show who performs an action.",
    body: [
      "Slovak often omits subject pronouns because the verb ending already identifies the person.",
      "Learn common verbs as full patterns. For rozumieť: rozumiem, rozumieš, rozumie, rozumieme, rozumiete, rozumejú.",
    ],
    examples: [
      { slovak: "Rozumiem.", english: "I understand." },
      { slovak: "Hovoríte po slovensky?", english: "Do you speak Slovak?" },
    ],
    related: ["rozumiem", "hovorit", "ucit-sa"],
    source: languageSource,
    tags: ["verbs", "present tense", "beginner"],
  },
  {
    slug: "cases-overview",
    slovak: "pády",
    english: "cases overview",
    category: "Nouns",
    kind: "grammar",
    summary: "Six active cases change word endings according to their role.",
    body: [
      "Modern Slovak uses nominative, genitive, dative, accusative, locative, and instrumental forms. A limited vocative survives in a few expressions.",
      "Start by recognizing nominative subjects and accusative direct objects. Add other cases with common prepositions and phrases.",
    ],
    examples: [
      { slovak: "Mám kávu.", english: "I have coffee." },
      { slovak: "Bývam v meste.", english: "I live in the city." },
    ],
    related: ["kava", "mesto", "grammatical-gender"],
    source: languageSource,
    tags: ["cases", "nouns", "intermediate"],
  },
  {
    slug: "word-order",
    slovak: "slovosled",
    english: "word order",
    category: "Sentences",
    kind: "grammar",
    summary:
      "Slovak word order is flexible, but neutral sentences often follow subject–verb–object.",
    body: [
      "Case endings preserve grammatical roles, allowing speakers to move words for emphasis.",
      "Place known information earlier and new or emphasized information later. Keep unstressed short pronouns near the beginning.",
    ],
    examples: [
      { slovak: "Peter číta knihu.", english: "Peter is reading a book." },
      { slovak: "Knihu číta Peter.", english: "It is Peter who is reading the book." },
    ],
    related: ["present-tense", "cases-overview"],
    source: languageSource,
    tags: ["sentences", "word order", "intermediate"],
  },
];

export const pronunciationEntries: ContentEntry[] = [
  {
    slug: "first-syllable-stress",
    slovak: "prízvuk na prvej slabike",
    english: "first-syllable stress",
    category: "Rhythm",
    kind: "pronunciation",
    summary: "Slovak normally stresses the first syllable of a word.",
    body: [
      "Keep the stress steady and light. Long vowel marks show vowel length, not stress.",
      "Prepositions can form one rhythmic unit with the following word, so the stress may fall on the preposition.",
    ],
    examples: [
      { slovak: "BRAtislava", english: "Bratislava" },
      { slovak: "ĎAkujem", english: "thank you" },
    ],
    related: ["dakujem", "vowel-length"],
    source: languageSource,
    tags: ["stress", "rhythm", "beginner"],
  },
  {
    slug: "vowel-length",
    slovak: "dĺžka samohlások",
    english: "vowel length",
    category: "Vowels",
    kind: "pronunciation",
    summary: "Acute marks make vowels longer and can distinguish words.",
    body: [
      "Hold á, é, í, ó, ú, and ý for roughly twice as long as their short partners.",
      "Length is meaningful. Preserve it even when the syllable does not carry stress.",
    ],
    examples: [
      { slovak: "káva", english: "coffee" },
      { slovak: "lístok", english: "ticket" },
    ],
    related: ["kava", "listok", "first-syllable-stress"],
    source: languageSource,
    tags: ["vowels", "length", "beginner"],
  },
  {
    slug: "soft-consonants",
    slovak: "mäkké spoluhlásky",
    english: "soft consonants",
    category: "Consonants",
    kind: "pronunciation",
    summary: "The letters č, š, ž, ď, ť, ň, and ľ represent distinct consonants.",
    body: [
      "The caron changes the consonant sound. Treat each marked letter as its own sound rather than decoration.",
      "Practice minimal contrasts slowly, then place each sound in a short phrase.",
    ],
    examples: [
      { slovak: "čo", english: "what" },
      { slovak: "žena", english: "woman" },
    ],
    related: ["co", "zena", "dakujem"],
    source: languageSource,
    tags: ["consonants", "diacritics", "beginner"],
  },
];

export const allEntries: ContentEntry[] = [
  ...words,
  ...grammarEntries,
  ...pronunciationEntries,
];

export const entryBySlug = new Map(allEntries.map((entry) => [entry.slug, entry]));

export function validateContent(entries: ContentEntry[]): string[] {
  const issues: string[] = [];
  const slugs = new Set<string>();

  for (const entry of entries) {
    if (slugs.has(entry.slug)) {
      issues.push(`Duplicate slug: ${entry.slug}`);
    }
    slugs.add(entry.slug);

    if (!entry.source) {
      issues.push(`Missing source: ${entry.slug}`);
    }
    if (entry.examples.some((example) => !(example.english && example.slovak))) {
      issues.push(`Incomplete example: ${entry.slug}`);
    }
  }

  for (const entry of entries) {
    for (const relatedSlug of entry.related) {
      if (!slugs.has(relatedSlug)) {
        issues.push(`Broken relation: ${entry.slug} → ${relatedSlug}`);
      }
    }
  }

  return issues;
}
