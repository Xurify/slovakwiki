import lemmaFrequencyIndex from "../../../content/frequency/lemma-index.json";
import dictionaryWords from "../../../content/dictionary/words.json";
import { normalizeLemma } from "./frequency";
import { type FrequencyPos } from "./frequency-types";
import type {
  CaseTopic,
  ContentEntry,
  Example,
  GrammarTopic,
  PronunciationTopic,
  WordFrequency,
  WordOrigin,
} from "./types";

const dictionarySource = "https://slovnik.juls.savba.sk/";
const languageSource = "https://www.juls.savba.sk/";
const julsSourceLabel = "Jazykovedný ústav Ľudovíta Štúra SAV";
const snkSourceUrl =
  "https://korpus.sk/korpusy-a-databazy/korpusy-snk/prim-8-0/top-1000-korpusu-prim-8-0/top-1000-korpusu-prim-8-0-public-all/";

type WordSeed = Pick<
  ContentEntry,
  "slug" | "slovak" | "english" | "category" | "examples" | "related"
>;

type LemmaFrequencyHit = { pos: FrequencyPos; rank: number };

const frequencyIndex = lemmaFrequencyIndex as Record<string, LemmaFrequencyHit>;

const CATEGORY_TO_POS: Record<string, FrequencyPos> = {
  Verbs: "verb",
  Nouns: "noun",
  Adjectives: "adjective",
};

function wordFrequency(word: WordSeed): WordFrequency | undefined {
  const preferredPos = CATEGORY_TO_POS[word.category];
  const exactLower = word.slovak.toLocaleLowerCase("sk");

  if (preferredPos) {
    const preferredExact = frequencyIndex[`exact:${exactLower}|${preferredPos}`];
    if (preferredExact) return preferredExact;
  }

  const exact = frequencyIndex[`exact:${exactLower}`];
  if (exact) return exact;

  // Diacritic-fold only for mass POS publishes — never attach a folded rank to
  // curated topic words (slovensky ≠ slovenský).
  if (!preferredPos) return undefined;

  const key = normalizeLemma(word.slovak);
  const preferred = frequencyIndex[`${key}|${preferredPos}`];
  if (preferred) return preferred;

  return frequencyIndex[key];
}

const curatedWordSeed: WordSeed[] = [
  {
    slug: "ahoj",
    slovak: "ahoj",
    english: "hello; hi; bye",
    category: "Greetings",
    examples: [
      { slovak: "Ahoj, ako sa máš?", english: "Hi, how are you?" },
      { slovak: "Ahoj, maj sa!", english: "Bye, take care!" },
    ],
    related: ["dobry-den", "dovidenia"],
  },
  {
    slug: "dakujem",
    slovak: "ďakujem",
    english: "thank you",
    category: "Essentials",
    examples: [
      { slovak: "Ďakujem za pomoc.", english: "Thank you for the help." },
      { slovak: "Ďakujem pekne.", english: "Thank you kindly." },
    ],
    related: ["prosim", "prepacte"],
  },
  {
    slug: "prosim",
    slovak: "prosím",
    english: "please; you’re welcome",
    category: "Essentials",
    examples: [
      { slovak: "Jednu kávu, prosím.", english: "One coffee, please." },
      { slovak: "Ďakujem. — Prosím.", english: "Thank you. — You’re welcome." },
    ],
    related: ["dakujem", "ano"],
  },
  {
    slug: "ano",
    slovak: "áno",
    english: "yes",
    category: "Essentials",
    examples: [
      { slovak: "Áno, rozumiem.", english: "Yes, I understand." },
      { slovak: "Áno, prosím.", english: "Yes, please." },
    ],
    related: ["nie", "rozumiem"],
  },
  {
    slug: "nie",
    slovak: "nie",
    english: "no; not",
    category: "Essentials",
    examples: [
      { slovak: "Nie, ďakujem.", english: "No, thank you." },
      { slovak: "Nie je to pravda.", english: "That is not true." },
    ],
    related: ["ano", "dakujem"],
  },
  {
    slug: "dobry-den",
    slovak: "dobrý deň",
    english: "good day; hello",
    category: "Greetings",
    examples: [
      { slovak: "Dobrý deň, pani Nováková.", english: "Hello, Ms. Nováková." },
      { slovak: "Dobrý deň, ako sa máte?", english: "Good day, how are you?" },
    ],
    related: ["ahoj", "dovidenia"],
  },
  {
    slug: "dovidenia",
    slovak: "dovidenia",
    english: "goodbye",
    category: "Greetings",
    examples: [
      { slovak: "Ďakujem, dovidenia.", english: "Thank you, goodbye." },
      { slovak: "Dovidenia, prajem pekný deň.", english: "Goodbye, have a nice day." },
    ],
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
      { slovak: "Prepáčte, nerozumiem.", english: "Sorry, I don’t understand." },
    ],
    related: ["prosim", "kde"],
  },
  {
    slug: "ako",
    slovak: "ako",
    english: "how; as; like",
    category: "Questions",
    examples: [
      { slovak: "Ako sa voláš?", english: "What is your name?" },
      {
        slovak: "Ako sa to povie po slovensky?",
        english: "How do you say that in Slovak?",
      },
    ],
    related: ["kde", "co"],
  },
  {
    slug: "kde",
    slovak: "kde",
    english: "where",
    category: "Questions",
    examples: [
      { slovak: "Kde bývaš?", english: "Where do you live?" },
      { slovak: "Kde je toaleta?", english: "Where is the toilet?" },
    ],
    related: ["ako", "co"],
  },
  {
    slug: "co",
    slovak: "čo",
    english: "what",
    category: "Questions",
    examples: [
      { slovak: "Čo to znamená?", english: "What does that mean?" },
      { slovak: "Čo robíš?", english: "What are you doing?" },
    ],
    related: ["ako", "kde"],
  },
  {
    slug: "kto",
    slovak: "kto",
    english: "who",
    category: "Questions",
    examples: [
      { slovak: "Kto je to?", english: "Who is that?" },
      { slovak: "Kto hovorí po anglicky?", english: "Who speaks English?" },
    ],
    related: ["co", "kde"],
  },
  {
    slug: "kolko",
    slovak: "koľko",
    english: "how much; how many",
    category: "Questions",
    examples: [
      { slovak: "Koľko to stojí?", english: "How much does it cost?" },
      { slovak: "Koľko máš rokov?", english: "How old are you?" },
    ],
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
      { slovak: "Áno, rozumiem.", english: "Yes, I understand." },
    ],
    related: ["hovorit", "slovensky"],
  },
  {
    slug: "hovorit",
    slovak: "hovoriť",
    english: "to speak",
    category: "Conversation",
    examples: [
      {
        slovak: "Hovorím po slovensky.",
        english: "I speak Slovak.",
        note: "Curated",
        demonstrates: "hovoriť — speak (language / ongoing)",
      },
      {
        slovak: "Poviem to po slovensky.",
        english: "I'll say it in Slovak.",
        note: "Curated",
        demonstrates: "povedať — say (see povedať)",
      },
    ],
    related: ["povedat", "rozumiem", "slovensky"],
  },
  {
    slug: "slovensky",
    slovak: "slovensky",
    english: "in Slovak",
    category: "Conversation",
    examples: [
      { slovak: "Učím sa po slovensky.", english: "I am learning Slovak." },
      { slovak: "Hovoríte po slovensky?", english: "Do you speak Slovak?" },
    ],
    related: ["hovorit", "ucit-sa"],
  },
  {
    slug: "ucit-sa",
    slovak: "učiť sa",
    english: "to learn; to study",
    category: "Learning",
    examples: [
      { slovak: "Učím sa nové slová.", english: "I am learning new words." },
      { slovak: "Učíš sa každý deň?", english: "Do you study every day?" },
    ],
    related: ["slovensky", "slovo"],
  },
  {
    slug: "slovo",
    slovak: "slovo",
    english: "word",
    category: "Learning",
    examples: [
      { slovak: "Toto slovo je nové.", english: "This word is new." },
      { slovak: "Neviem to slovo.", english: "I don’t know that word." },
    ],
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
      { slovak: "Učím sa cudzí jazyk.", english: "I am learning a foreign language." },
    ],
    related: ["slovo", "slovensky"],
  },
  {
    slug: "dom",
    slovak: "dom",
    english: "house; home",
    category: "Everyday life",
    examples: [
      { slovak: "Náš dom je malý.", english: "Our house is small." },
      { slovak: "Mám nový dom.", english: "I have a new house." },
    ],
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
      { slovak: "Mám veľkú rodinu.", english: "I have a big family." },
    ],
    related: ["dom", "priatel"],
  },
  {
    slug: "priatel",
    slovak: "priateľ",
    english: "friend; boyfriend",
    category: "People",
    examples: [
      { slovak: "Peter je môj priateľ.", english: "Peter is my friend." },
      { slovak: "Idem s priateľom.", english: "I am going with a friend." },
    ],
    related: ["rodina", "clovek"],
  },
  {
    slug: "clovek",
    slovak: "človek",
    english: "person; human",
    category: "People",
    examples: [
      { slovak: "Je to dobrý človek.", english: "He is a good person." },
      {
        slovak: "Každý človek potrebuje priateľov.",
        english: "Every person needs friends.",
      },
    ],
    related: ["priatel", "muz", "zena"],
  },
  {
    slug: "muz",
    slovak: "muž",
    english: "man; husband",
    category: "People",
    examples: [
      { slovak: "Ten muž čaká.", english: "That man is waiting." },
      {
        slovak: "Môj muž pracuje v Bratislave.",
        english: "My husband works in Bratislava.",
      },
    ],
    related: ["zena", "clovek"],
  },
  {
    slug: "zena",
    slovak: "žena",
    english: "woman; wife",
    category: "People",
    examples: [
      { slovak: "Tá žena číta.", english: "That woman is reading." },
      { slovak: "Moja žena je učiteľka.", english: "My wife is a teacher." },
    ],
    related: ["muz", "clovek"],
  },
  {
    slug: "jedlo",
    slovak: "jedlo",
    english: "food; meal",
    category: "Food",
    examples: [
      { slovak: "Toto jedlo je výborné.", english: "This food is excellent." },
      { slovak: "Kde je dobré jedlo?", english: "Where is good food?" },
    ],
    related: ["voda", "kava", "kolac"],
  },
  {
    slug: "voda",
    slovak: "voda",
    english: "water",
    category: "Food",
    examples: [
      { slovak: "Prosím si pohár vody.", english: "I’d like a glass of water." },
      { slovak: "Pijem veľa vody.", english: "I drink a lot of water." },
    ],
    related: ["jedlo", "kava"],
  },
  {
    slug: "kava",
    slovak: "káva",
    english: "coffee",
    category: "Food",
    examples: [
      { slovak: "Dáte si kávu?", english: "Would you like coffee?" },
      { slovak: "Ráno pijem kávu.", english: "I drink coffee in the morning." },
      { slovak: "Poprosím čiernu kávu.", english: "Black coffee, please." },
    ],
    related: ["voda", "jedlo", "kolac"],
  },
  {
    slug: "kolac",
    slovak: "koláč",
    english: "cake; pastry",
    category: "Food",
    examples: [
      { slovak: "Moja mama pečie koláč.", english: "My mom is baking a cake." },
      { slovak: "Ten koláč je výborný.", english: "That cake is excellent." },
    ],
    related: ["jedlo", "chlieb", "kava", "voda"],
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
      { slovak: "Bývam v malom meste.", english: "I live in a small town." },
    ],
    related: ["dom", "stanica"],
  },
  {
    slug: "stanica",
    slovak: "stanica",
    english: "station",
    category: "Travel",
    examples: [
      { slovak: "Stanica je blízko.", english: "The station is nearby." },
      { slovak: "Idem na stanicu.", english: "I am going to the station." },
    ],
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
      { slovak: "Kde si môžem kúpiť lístok?", english: "Where can I buy a ticket?" },
    ],
    related: ["stanica", "kolko"],
  },
];

const wordSeed: WordSeed[] = [...curatedWordSeed, ...(dictionaryWords as WordSeed[])];
const curatedSlugs = new Set(curatedWordSeed.map((word) => word.slug));

function wordBody(word: WordSeed): string[] {
  const patternNote = PATTERN_USAGE_NOTES[word.slug];
  return patternNote ? [patternNote] : [];
}

/** Extra Usage copy for high-confusion pattern lemmas. */
const PATTERN_USAGE_NOTES: Record<string, string> = {
  rad: "English “to like” is not one Slovak verb. Use mať rád for a thing or person, and rád + a verb for an activity. Páčiť sa and ľúbiť cover nearby meanings.",
  pacit:
    "Páčiť sa frames liking from the thing’s side: it appeals to me. Compare mať rád on rád for the more direct “I like …”.",
  ist: "Ísť is for going now or once. Chodiť covers the habit — the same destination, different aspect.",
  chodit:
    "Chodiť is the habit. Ísť is the one trip happening now — compare the pair with the same place.",
  byt: "Byť changes meaning with what follows: a place (where), z + place (origin), or a noun (who/what you are).",
  vediet:
    "Vedieť + infinitive is “know how.” Vedieť, že … is “know that” — same verb, different frame.",
  dat: "Dať hands something over. Dať si is what you order or take for yourself (coffee, food).",
  pozerat: "Pozerať is looking or watching on purpose. Vidieť is perceiving — seeing.",
  vidiet: "Vidieť is seeing. Pozerať is the active looking or watching.",
  pocuvat: "Počúvať is listening on purpose. Počuť is hearing — the sound reaching you.",
  pocut: "Počuť is hearing. Počúvať is the active listening.",
  moct: "Môcť, musieť, and chcieť take the same infinitive — ability, obligation, and want side by side.",
  musiet:
    "Musieť, môcť, and chcieť take the same infinitive — obligation, ability, and want side by side.",
  chciet:
    "Chcieť, môcť, and musieť take the same infinitive — want, ability, and obligation side by side.",
  volat: "Volať someone is calling them. Volať sa says what you are called — your name.",
  lubit:
    "Ľúbiť is stronger than mať rád — closer to love. For everyday “like,” start with rád / mať rád.",
  bat: "Báť sa alone is a general fear. Add a noun (or infinitive) for what you are afraid of.",
  stat: "Stať sa means happen or become — not the same lemma as stáť (stand / cost).",
  "stat-v": "Stáť is stand or cost. Happen / become is stať sa — see stať.",
  hladat: "Hľadať means to search. Nájsť means to find — same object, different stage.",
  najst:
    "Nájsť means to find. Hľadať means to search — compare the pair with the same object.",
  zacat:
    "Začať starts an action. Prestať stops it — same infinitive for a clean contrast.",
  prestat: "Prestať stops an action. Začať starts it — same infinitive side by side.",
  hovorit:
    "Hovoriť is speaking as a process or language skill. Povedať is one utterance — saying something.",
  povedat:
    "Povedať is saying or telling once. Hovoriť covers ongoing speech or speaking a language.",
  prist: "Prísť is coming / arriving. Odísť is leaving — same place, opposite direction.",
  odist: "Odísť is leaving. Prísť is arriving — same place, opposite direction.",
  dostat: "Dostať receives something. Dostať sa is getting yourself somewhere.",
  robit: "Robiť is the ongoing action. Urobiť finishes it — same task, different aspect.",
  urobit: "Urobiť completes the task. Robiť is still doing it — compare the pair.",
  brat: "Brať is taking as a process. Vziať is one completed take.",
  vziat: "Vziať takes once, to completion. Brať is the ongoing taking.",
  pisat: "Písať is writing as you go. Napísať finishes the text.",
  napisat: "Napísať writes something to completion. Písať is the ongoing writing.",
  citat: "Čítať is reading along the way. Prečítať means reading it through.",
  precitat: "Prečítať reads something through. Čítať is the ongoing reading.",
  kupovat: "Kupovať is the buying process. Kúpiť is one completed purchase.",
  kupit: "Kúpiť buys once. Kupovať is shopping / buying as a process.",
  jest: "Jesť is eating. Zjesť finishes the food — eats it up.",
  zjest: "Zjesť eats something up. Jesť is the ongoing eating.",
  pit: "Piť is drinking. Vypiť finishes the drink.",
  vypit: "Vypiť drinks something up. Piť is the ongoing drinking.",
};

function frequencyExampleNote(examples: Example[]): string {
  const hasTatoeba = examples.some((example) => example.note === "Tatoeba");
  const hasPractice = examples.some((example) => example.isPracticeFrame);
  const hasReviewed = examples.some(
    (example) =>
      (example.note === "Curated" || example.demonstrates) && !example.isPracticeFrame,
  );

  if (hasTatoeba && !hasPractice && !hasReviewed) {
    return "English gloss from the frequency publish path. Example sentences from Tatoeba (CC BY 2.0 FR).";
  }
  if (hasTatoeba) {
    return "English gloss from the frequency publish path. Includes Tatoeba example sentences when present.";
  }
  if (hasReviewed && !hasPractice) {
    return "English gloss from the frequency publish path. Hand-reviewed example sentences.";
  }
  if (hasPractice) {
    return "English gloss from the frequency publish path. Practice frames used until a corpus example is available.";
  }
  return "English gloss from the frequency publish path.";
}

function wordAttribution(origin: WordOrigin, examples: Example[]) {
  if (origin === "curated") {
    return {
      source: dictionarySource,
      sourceLabel: julsSourceLabel,
    };
  }

  return {
    source: snkSourceUrl,
    sourceLabel: "Slovak National Corpus (SNK)",
    sourceNote: frequencyExampleNote(examples),
  };
}

const mappedWords: ContentEntry[] = wordSeed.map((word) => {
  const origin: WordOrigin = curatedSlugs.has(word.slug) ? "curated" : "frequency";
  const frequency = wordFrequency(word);
  const attribution = wordAttribution(origin, word.examples);

  return {
    ...word,
    kind: "word",
    summary: `${word.slovak} means “${word.english}.”`,
    body: wordBody(word),
    origin,
    frequency,
    ...attribution,
    tags: [word.category.toLowerCase(), "beginner"],
  };
});

/** Same-POS related links for frequency words with empty `related`. */
function glossToken(english: string): string | null {
  const first = english.split(";")[0]!.trim().toLowerCase();
  const stripped = first
    .replace(/^not\s+to\s+/i, "")
    .replace(/^not\s+/i, "")
    .replace(/^to\s+/i, "")
    .replace(/^(a|an|the)\s+/i, "");
  const raw = stripped.split(/[\s,/(-]+/)[0] ?? "";
  const token = raw.replace(/[^a-z]/gi, "");
  if (token.length < 3) return null;

  const stopwords = new Set([
    "and",
    "are",
    "been",
    "being",
    "did",
    "does",
    "for",
    "from",
    "had",
    "has",
    "have",
    "into",
    "not",
    "the",
    "was",
    "were",
    "with",
  ]);
  if (stopwords.has(token)) return null;
  return token;
}

function attachRelatedNeighbors(entries: ContentEntry[]): ContentEntry[] {
  const maxPeers = 3;

  const glossBuckets = new Map<string, ContentEntry[]>();
  for (const entry of entries) {
    if (!entry.frequency || entry.related.length > 0) continue;
    const token = glossToken(entry.english);
    if (!token) continue;
    const key = `${entry.frequency.pos}::${token}`;
    const list = glossBuckets.get(key) ?? [];
    list.push(entry);
    glossBuckets.set(key, list);
  }

  const glossRelated = new Map<string, string[]>();
  for (const list of glossBuckets.values()) {
    if (list.length < 2) continue;
    for (const entry of list) {
      const peers = list
        .filter((other) => other.slug !== entry.slug)
        .sort(
          (first, second) =>
            Math.abs((first.frequency?.rank ?? 0) - (entry.frequency?.rank ?? 0)) -
            Math.abs((second.frequency?.rank ?? 0) - (entry.frequency?.rank ?? 0)),
        )
        .slice(0, maxPeers)
        .map((other) => other.slug);
      if (peers.length > 0) glossRelated.set(entry.slug, peers);
    }
  }

  const byPos: Record<FrequencyPos, ContentEntry[]> = {
    verb: [],
    noun: [],
    adjective: [],
  };

  for (const entry of entries) {
    if (!entry.frequency || entry.related.length > 0) continue;
    if (glossRelated.has(entry.slug)) continue;
    byPos[entry.frequency.pos].push(entry);
  }

  for (const pos of Object.keys(byPos) as FrequencyPos[]) {
    byPos[pos].sort(
      (first, second) => (first.frequency?.rank ?? 0) - (second.frequency?.rank ?? 0),
    );
  }

  const rankNeighbors = new Map<string, string[]>();

  for (const pos of Object.keys(byPos) as FrequencyPos[]) {
    const list = byPos[pos];

    for (let index = 0; index < list.length; index += 1) {
      const entry = list[index]!;
      const related: string[] = [];
      const previous = list[index - 1];
      const next = list[index + 1];
      if (previous) related.push(previous.slug);
      if (next) related.push(next.slug);
      if (related.length > 0) rankNeighbors.set(entry.slug, related);
    }
  }

  return entries.map((entry) => {
    if (entry.related.length > 0) return entry;
    const fromGloss = glossRelated.get(entry.slug);
    if (fromGloss) return { ...entry, related: fromGloss };
    const fromRank = rankNeighbors.get(entry.slug);
    return fromRank ? { ...entry, related: fromRank } : entry;
  });
}

export const words: ContentEntry[] = attachRelatedNeighbors(mappedWords);

export const grammarEntries: GrammarTopic[] = [
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
    lookFor: "Match the adjective ending to the noun's gender: -ý, -á, or -é.",
    pathGroup: "Nouns",
    order: 1,
    rule: [
      "Every Slovak noun has a grammatical gender: masculine, feminine, or neuter.",
      "Learn each noun with its gender because it changes adjective endings, pronouns, and past-tense verbs.",
    ],
    pattern: {
      label: "Adjective endings follow gender",
      lines: [
        "masculine adjective ending: -ý",
        "feminine adjective ending: -á",
        "neuter adjective ending: -é",
      ],
    },
    watchOut:
      "A final letter can suggest gender, but it does not guarantee it. Learn the noun and its pattern together.",
    nextSlug: "cases-overview",
  },
  {
    slug: "numbers-and-numerals",
    slovak: "číslovky",
    english: "numbers and numerals",
    category: "Numbers",
    kind: "grammar",
    summary: "Numbers change the form that follows them, especially from five upward.",
    body: [
      "Use jeden with a singular noun. Dva or dve, tri, and štyri use different quantity patterns; dva is masculine and neuter, while dve is feminine and neuter.",
      "With päť and higher numbers, the following noun usually uses a genitive plural form. Learn useful whole phrases for ages, prices, and quantities before tackling full declension tables.",
    ],
    examples: [
      {
        slovak: "Mám dvadsať rokov.",
        english: "I am twenty years old.",
        practiceItemId: "everyday/age-with-rokov",
      },
      {
        slovak: "Stojí to päť eur.",
        english: "It costs five euros.",
        practiceItemId: "everyday/simple-price",
      },
    ],
    related: ["grammatical-gender", "questions", "kolko", "mat-present", "telling-time"],
    source: languageSource,
    tags: ["nouns", "numbers", "beginner"],
    lookFor:
      "Notice whether the number is jeden, dva/dve, tri/štyri, or päť and higher. The noun form changes with the group.",
    pathGroup: "Numbers",
    order: 1,
    rule: [
      "Jeden goes with a singular noun; dva/dve, tri, and štyri use plural-like noun forms.",
      "Päť and higher numbers usually take a genitive plural noun form.",
    ],
    pattern: {
      label: "Quantity patterns",
      lines: [
        "jeden lístok · one ticket",
        "dva / dve, tri, štyri + quantity form",
        "päť+ + genitive plural",
      ],
    },
    watchOut:
      "Do not assume every number uses the same noun form. Start with fixed phrases such as dvadsať rokov and päť eur.",
    nextSlug: "telling-time",
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
      {
        slovak: "Čítam knihu.",
        english: "I am reading a book.",
        demonstrates: "The ending -m shows that I am the person reading.",
        practiceItemId: "grammar/first-person-reading",
      },
    ],
    related: ["rozumiem", "hovorit", "ucit-sa", "byt-present", "mat-present"],
    source: languageSource,
    tags: ["verbs", "present tense", "beginner"],
    lookFor: "Find the final letters on the verb. They tell you who is doing the action.",
    pathGroup: "Verbs",
    order: 3,
    rule: [
      "Present-tense endings show who performs an action, so Slovak often omits the subject pronoun.",
      "Memorize common verbs as a complete pattern instead of translating one ending at a time.",
    ],
    pattern: {
      label: "Čítať — to read",
      lines: [
        "ja čítam",
        "ty čítaš",
        "on / ona číta",
        "my čítame",
        "vy čítate",
        "oni / ony čítajú",
      ],
    },
    watchOut:
      "The infinitive is not a shortcut to the present tense. Learn each verb's stem and endings together.",
    nextSlug: "byt-present",
    lessonLink: {
      href: "/lessons/grammar/present-tense-i",
      label: "Present-tense endings",
    },
  },
  {
    slug: "byt-present",
    slovak: "byť",
    english: "to be (present)",
    category: "Verbs",
    kind: "grammar",
    summary: "Use byť to say who or what someone is, and where someone or something is.",
    body: [
      "Byť is irregular in the present tense: som, si, je, sme, ste, sú. Slovak often leaves out the subject pronoun because the verb form already identifies it.",
      "Use byť for identity and location: Som študent. and Kaviareň je tu. Do not use byť for age; Slovak says Mám dvadsať rokov.",
    ],
    examples: [
      {
        slovak: "Som študent.",
        english: "I am a student.",
        practiceItemId: "grammar/byt-som",
      },
      {
        slovak: "Ste z Kanady?",
        english: "Are you from Canada?",
        practiceItemId: "grammar/byt-ste",
      },
      {
        slovak: "Kaviareň je tu.",
        english: "The café is here.",
        practiceItemId: "grammar/byt-je-location",
      },
    ],
    related: ["mat-present", "present-tense", "ty-vs-vy", "negation"],
    source: languageSource,
    tags: ["verbs", "present tense", "beginner"],
    lookFor:
      "Find the form of byť, then identify whether it gives an identity or a location.",
    pathGroup: "Verbs",
    order: 4,
    rule: [
      "The present forms of byť are som, si, je, sme, ste, and sú.",
      "Use byť for identity and location; use mať with rokov to state age.",
    ],
    pattern: {
      label: "Byť — to be",
      lines: ["ja som", "ty si", "on / ona / ono je", "my sme", "vy ste", "oni / ony sú"],
    },
    watchOut:
      "Do not translate English age with byť. Say Mám dvadsať rokov, literally “I have twenty years.”",
    nextSlug: "mat-present",
    lessonLink: {
      href: "/lessons/grammar/byt-present",
      label: "Present forms of byť",
    },
  },
  {
    slug: "mat-present",
    slovak: "mať",
    english: "to have (present)",
    category: "Verbs",
    kind: "grammar",
    summary: "Use mať to say what you have and how old you are.",
    body: [
      "Mať is irregular in the present tense: mám, máš, má, máme, máte, majú. Use it for possession, availability, and age.",
      "Slovak states age with mať: Mám dvadsať rokov. Máš is informal singular “you have”; máte is formal singular or plural “you have.”",
    ],
    examples: [
      {
        slovak: "Mám čas.",
        english: "I have time.",
        practiceItemId: "grammar/mat-mam",
      },
      {
        slovak: "Máš kartu?",
        english: "Do you have a card?",
        practiceItemId: "grammar/mat-mas",
      },
      {
        slovak: "Nemám hotovosť.",
        english: "I do not have cash.",
        practiceItemId: "grammar/mat-nemam",
      },
    ],
    related: ["byt-present", "numbers-and-numerals", "negation", "ty-vs-vy"],
    source: languageSource,
    tags: ["verbs", "present tense", "beginner"],
    lookFor:
      "Match the mať ending to the person, then notice ne- attached in negative forms.",
    pathGroup: "Verbs",
    order: 5,
    rule: [
      "The present forms of mať are mám, máš, má, máme, máte, and majú.",
      "Use mať with rokov for age, and use máte for formal singular or plural you.",
    ],
    pattern: {
      label: "Mať — to have",
      lines: [
        "ja mám",
        "ty máš",
        "on / ona / ono má",
        "my máme",
        "vy máte",
        "oni / ony majú",
      ],
    },
    watchOut:
      "Do not say Som dvadsať rokov for age. Use Mám dvadsať rokov; attach ne- to make nemám.",
    nextSlug: "aspect",
    lessonLink: {
      href: "/lessons/grammar/mat-present",
      label: "Present forms of mať",
    },
  },
  {
    slug: "aspect",
    slovak: "vid",
    english: "aspect",
    category: "Verbs",
    kind: "grammar",
    summary:
      "Slovak verbs mark whether an action is ongoing or completed — not just when it happens.",
    body: [
      "Most verbs come in imperfective / perfective pairs. The imperfective covers process, habit, or an unbounded activity. The perfective frames one completed or result-focused event.",
      "Prefixes often build perfectives: písať → napísať, čítať → prečítať, robiť → urobiť. The prefix can also change meaning, so learn common pairs in full sentences.",
      "Future tense depends on aspect: imperfective usually uses budem + infinitive (budem písať), while perfective uses a present-looking form with future meaning (napíšem).",
    ],
    examples: [
      {
        slovak: "Písal list.",
        english: "He was writing / wrote a letter (process).",
        demonstrates: "Imperfective písať — ongoing or unbounded writing.",
      },
      {
        slovak: "Napísal list.",
        english: "He wrote the letter (finished it).",
        demonstrates: "Perfective napísať — the letter is done.",
      },
      {
        slovak: "Chodím do práce.",
        english: "I go to work (habitually).",
        demonstrates: "Habitual motion verb chodiť — repeated trips, not one journey.",
      },
    ],
    related: [
      "robit",
      "urobit",
      "pisat",
      "napisat",
      "citat",
      "precitat",
      "ist",
      "chodit",
    ],
    source: languageSource,
    tags: ["verbs", "aspect", "intermediate"],
    lookFor:
      "Ask whether the speaker means the process/habit or the completed result — that choice is aspect.",
    pathGroup: "Verbs",
    order: 6,
    rule: [
      "Aspect is separate from tense: the same past time can be imperfective (process) or perfective (completed).",
      "Learn frequent pairs together (robiť / urobiť, písať / napísať) instead of translating English tense forms one-to-one.",
    ],
    pattern: {
      label: "Same idea, different aspect",
      lines: [
        "robiť → urobiť · do / get done",
        "písať → napísať · write / write to completion",
        "čítať → prečítať · read / read through",
        "ísť / chodiť · one trip vs habit",
      ],
    },
    termSections: [
      {
        id: "imperfective",
        title: "Imperfective",
        body: "Marks process, habit, or an action without a fixed endpoint — what was going on, not that it finished.",
      },
      {
        id: "perfective",
        title: "Perfective",
        body: "Marks a completed, bounded, or result-focused event — one trip to the finish line.",
      },
      {
        id: "habitual",
        title: "Habitual motion",
        body: "Motion verbs like chodiť cover repeated or multi-direction travel. Ísť covers one trip now or once.",
      },
    ],
    watchOut:
      "Do not map English progressive vs simple past onto aspect. Slovak chooses imperfective or perfective by how the event is framed, then places it in time.",
    nextSlug: "word-order",
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
    lookFor:
      "First, identify who or what performs the action. That noun is usually nominative.",
    caseOverview: [
      {
        slug: "nominative",
        name: "Nominative",
        question: "Kto? Čo? · Who? What?",
        role: "Subject",
        explanation:
          "Names the person, thing, or idea doing the action. In Peter číta knihu, Peter is nominative.",
      },
      {
        slug: "genitive",
        name: "Genitive",
        question: "Koho? Čoho? · Whose? Of what?",
        role: "Possession or source",
        explanation:
          "Marks possession, amounts, absence, and phrases after z, od, do, or bez.",
      },
      {
        slug: "dative",
        name: "Dative",
        question: "Komu? Čomu? · To whom? To what?",
        role: "Recipient",
        explanation: "Marks the person or thing receiving or benefiting from an action.",
      },
      {
        slug: "accusative",
        name: "Accusative",
        question: "Koho? Čo? · Whom? What?",
        role: "Direct object",
        explanation: "Marks the person or thing directly affected by an action.",
      },
      {
        slug: "locative",
        name: "Locative",
        question: "O kom? O čom? · About whom? About what?",
        role: "Location or topic",
        explanation:
          "Appears after selected prepositions for location and topics, such as v, na, and o.",
      },
      {
        slug: "instrumental",
        name: "Instrumental",
        question: "S kým? S čím? · With whom? With what?",
        role: "Company or tool",
        explanation: "Marks company, tools, and means, especially after s or so.",
      },
    ],
    pathGroup: "Nouns",
    order: 2,
    rule: [
      "Cases change noun endings according to the noun's role in a sentence.",
      "Begin by recognizing subjects in nominative and direct objects in accusative. Add other cases through common phrases.",
    ],
    pattern: {
      label: "The noun changes with its role",
      lines: ["Mám kávu. · I have coffee.", "Bývam v meste. · I live in the city."],
    },
    watchOut:
      "Do not try to memorize all six case tables at once. Start with patterns you can use in complete phrases.",
    nextSlug: "present-tense",
  },
  {
    slug: "word-order",
    slovak: "slovosled",
    english: "word order",
    category: "Sentence building",
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
    related: ["present-tense", "cases-overview", "ty-vs-vy"],
    source: languageSource,
    tags: ["sentences", "word order", "intermediate"],
    lookFor: "Compare what moves to the front. That position receives emphasis.",
    pathGroup: "Sentence building",
    order: 4,
    rule: [
      "Slovak word order is flexible because case endings preserve grammatical roles.",
      "Neutral sentences often follow subject–verb–object, while a moved word receives emphasis.",
    ],
    pattern: {
      label: "Position changes emphasis",
      lines: ["subject + verb + object → neutral", "moved word → emphasis"],
    },
    watchOut:
      "Flexible does not mean random. Put familiar information earlier and the new or emphasized part later.",
    nextSlug: "ty-vs-vy",
  },
  {
    slug: "ty-vs-vy",
    slovak: "tykanie a vykanie",
    english: "informal and formal you",
    category: "Sentence building",
    kind: "grammar",
    summary:
      "Use ty with one person informally and vy for formal address or more than one person.",
    body: [
      "Use ty with friends, family, children, and people who invite you to be informal. Use vy with strangers, customers, older people, or professional contacts until they suggest ty.",
      "Vy takes plural verb forms even for one person: Máte čas? Informal ty uses singular forms: Máš čas? Use Prepáč informally and Prepáčte formally. In letters to one formal addressee, capitalize Vy, Vám, and Váš.",
    ],
    examples: [
      {
        slovak: "Ako sa máte?",
        english: "How are you? (formal)",
        practiceItemId: "everyday/formal-greeting",
      },
      {
        slovak: "Prepáč, nerozumiem.",
        english: "Sorry, I do not understand. (informal)",
      },
      {
        slovak: "Prepáčte, nerozumiem.",
        english: "Sorry, I do not understand. (formal)",
      },
    ],
    related: ["questions", "word-order", "byt-present", "mat-present"],
    source: languageSource,
    tags: ["sentences", "formality", "beginner"],
    lookFor: "Check whether the situation calls for ty or vy, then match the verb form.",
    pathGroup: "Sentence building",
    order: 5,
    rule: [
      "Use ty with one person informally and vy for formal address or more than one person.",
      "Formal vy uses plural verb forms; capitalize Vy, Vám, and Váš in letters to one formal addressee.",
    ],
    pattern: {
      label: "Informal and formal address",
      lines: [
        "ty máš · informal singular",
        "vy máte · formal singular or plural",
        "Prepáč · informal / Prepáčte · formal",
      ],
    },
    watchOut:
      "Do not mix ty forms with vy forms in one conversation. Formal Vy is capitalized in letters to one person, not in ordinary plural vy.",
    nextSlug: "negation",
    lessonLink: {
      href: "/lessons/everyday/meet-someone",
      label: "Greetings and introductions",
    },
  },
  {
    slug: "negation",
    slovak: "zápor",
    english: "negation",
    category: "Sentence building",
    kind: "grammar",
    summary: "Slovak usually makes a finite verb negative with ne-.",
    body: [
      "Attach ne- to a finite verb: mám becomes nemám and rozumiem becomes nerozumiem. Nie can stand alone as “no,” but it does not normally sit separately before a finite verb.",
      "Learn common negative verb forms as whole words. Slovak also regularly uses verbal negation with negative words such as nikto and nič.",
    ],
    examples: [
      {
        slovak: "Nie, ďakujem.",
        english: "No, thank you.",
        practiceItemId: "everyday/negative-answer",
      },
      {
        slovak: "Nerozumiem.",
        english: "I do not understand.",
        practiceItemId: "everyday/not-understand",
      },
      {
        slovak: "Nemám čas.",
        english: "I do not have time.",
        practiceItemId: "everyday/negative-verb-placement",
      },
    ],
    related: ["word-order", "questions", "nie", "rozumiem", "byt-present", "mat-present"],
    source: languageSource,
    tags: ["sentences", "negation", "beginner"],
    lookFor: "Find ne- attached to the finite verb: nemám, nerozumiem, neviem.",
    pathGroup: "Sentence building",
    order: 6,
    rule: [
      "Form most finite verb negatives with ne- attached to the verb.",
      "Use nie alone for a negative answer; do not usually say nie mám or nie rozumiem.",
    ],
    pattern: {
      label: "Negation attaches to the verb",
      lines: ["mám → nemám", "rozumiem → nerozumiem", "Nie, ďakujem. → No, thank you."],
    },
    watchOut: "Double negation is normal in Slovak: Nikto nevolal means “Nobody called.”",
    nextSlug: "questions",
    lessonLink: {
      href: "/lessons/everyday/negation-in-conversation",
      label: "Negation in conversation",
    },
  },
  {
    slug: "questions",
    slovak: "otázky",
    english: "questions",
    category: "Sentence building",
    kind: "grammar",
    summary:
      "Use question words for information, or statement order with rising intonation for yes/no questions.",
    body: [
      "Question words such as kto, čo, kde, odkiaľ, and koľko usually come first. The rest of the question keeps normal Slovak word order.",
      "Yes/no questions often keep statement order and use rising intonation in speech: Hovoríte po slovensky? There is no English-style do-support.",
    ],
    examples: [
      {
        slovak: "Odkiaľ ste?",
        english: "Where are you from?",
        practiceItemId: "everyday/ask-origin",
      },
      {
        slovak: "Koľko to stojí?",
        english: "How much does it cost?",
        practiceItemId: "everyday/simple-price",
      },
      {
        slovak: "O koľkej?",
        english: "At what time?",
        practiceItemId: "everyday/meeting-time",
      },
    ],
    related: [
      "word-order",
      "negation",
      "numbers-and-numerals",
      "ty-vs-vy",
      "kto",
      "co",
      "kde",
      "kolko",
    ],
    source: languageSource,
    tags: ["sentences", "questions", "beginner"],
    lookFor:
      "Identify the question word first, then notice that the rest keeps ordinary Slovak sentence order.",
    pathGroup: "Sentence building",
    order: 7,
    rule: [
      "Put a question word first when you ask for information.",
      "For many yes/no questions, keep statement order and signal the question with intonation.",
    ],
    pattern: {
      label: "Question word or intonation",
      lines: [
        "Odkiaľ ste? · Where are you from?",
        "Koľko to stojí? · How much does it cost?",
        "Hovoríte po slovensky? · Do you speak Slovak?",
      ],
    },
    watchOut:
      "Do not add an English-style auxiliary. Hovoríte po slovensky? is already a complete yes/no question.",
    lessonLink: {
      href: "/lessons/everyday/meet-someone",
      label: "Greetings and introductions",
    },
  },
  {
    slug: "telling-time",
    slovak: "koľko je hodín",
    english: "telling time",
    category: "Numbers",
    kind: "grammar",
    summary:
      "Slovak clock time looks ahead to the next hour, and the verb agrees with the number.",
    body: [
      "Ask Koľko je hodín? Answer with Je for one, Sú for two to four, and Je again for five and higher with a genitive plural noun form.",
      "Half and quarter phrases name the coming hour: pol tretej is 2:30, štvrť na tri is 2:15, and trištvrte na tri is 2:45.",
    ],
    examples: [
      {
        slovak: "Koľko je hodín?",
        english: "What time is it?",
      },
      {
        slovak: "Sú tri hodiny.",
        english: "It is three o’clock.",
      },
      {
        slovak: "Je pol tretej.",
        english: "It is half past two.",
        practiceItemId: "everyday/half-past-time",
      },
      {
        slovak: "Stretneme sa o tretej.",
        english: "We will meet at three.",
        practiceItemId: "everyday/meeting-time",
      },
      {
        slovak: "Je trištvrte na tri.",
        english: "It is quarter to three.",
        practiceItemId: "everyday/quarter-time",
      },
    ],
    related: ["numbers-and-numerals", "questions", "kolko"],
    source: languageSource,
    tags: ["numbers", "time", "beginner"],
    lookFor:
      "Is the number 1, 2–4, or 5+? That decides je/sú and hodina/hodiny/hodín. For halves and quarters, name the hour you are heading toward.",
    pathGroup: "Numbers",
    order: 2,
    rule: [
      "Je jedna hodina, Sú dve/tri/štyri hodiny, and Je päť hodín. The same 1 / 2–4 / 5+ pattern applies to minúta; sekunda follows the numbers hub.",
      "Half and quarter look forward: Je pol tretej (2:30), Je štvrť na tri (2:15), Je trištvrte na tri (2:45). With pol, always use Je — never Sú.",
      "Minutes past use X hodín a Y minút (Desať hodín a päť minút). Minutes to use o Y minút X (O päť minút desať).",
      "For appointments, use o + a locative feminine form: O tretej. For approximate time, use okolo piatej.",
      "Everyday speech often uses a 12-hour clock plus ráno, doobeda, popoludní, or večer. Timetables prefer 24-hour forms such as Je pätnásť hodín. Midday is poludnie; midnight is polnoc.",
    ],
    pattern: {
      label: "Hour agreement and looking ahead",
      lines: [
        "1 → Je jedna hodina.",
        "2–4 → Sú dve / tri / štyri hodiny.",
        "5+ → Je päť hodín.",
        "2:30 → Je pol tretej.",
        "2:15 → Je štvrť na tri.",
        "2:45 → Je trištvrte na tri.",
        "at / around → o tretej · okolo piatej",
      ],
    },
    termSections: [
      {
        id: "pol",
        title: "pol",
        body: "Pol names the coming hour in the genitive: pol tretej is halfway to three (2:30). Always Je pol…, never Sú pol…",
      },
      {
        id: "stvrt",
        title: "štvrť na",
        body: "Štvrť na + the next hour means quarter past the previous hour: štvrť na tri is 2:15. After twelve, prefer štvrť na jednu.",
      },
      {
        id: "tristvrte",
        title: "trištvrte na",
        body: "Trištvrte na + the next hour means three-quarters toward that hour: trištvrte na tri is 2:45.",
      },
    ],
    watchOut:
      "Pol tretej is 2:30, not 3:30 — Slovak names the hour it is heading toward. At 12:15, prefer Je štvrť na jednu, not *jeden*.",
    lessonLink: {
      href: "/lessons/everyday/days-dates-and-time",
      label: "Days, dates, and time",
    },
  },
];

export const caseTopics: CaseTopic[] = [
  {
    slug: "nominative",
    name: "Nominative",
    question: "Kto? Čo? · Who? What?",
    summary:
      "The nominative names the subject: the person, thing, or idea doing the action.",
    body: [
      "Use nominative for the subject of a sentence. It answers who or what performs the action.",
      "In Peter číta knihu, Peter is nominative because Peter performs the reading. The object knihu uses a different case.",
    ],
    examples: [
      {
        slovak: "Peter číta knihu.",
        english: "Peter is reading a book.",
        note: "Peter is nominative because he performs the action.",
      },
      {
        slovak: "Mesto je veľké.",
        english: "The city is large.",
        note: "Mesto is nominative because it is the subject being described.",
      },
    ],
    researchPrompts: [
      "Collect three nouns in nominative from your own Slovak reading.",
      "Compare a masculine, feminine, and neuter noun in the nominative.",
    ],
    status: "ready",
    source: languageSource,
  },
  {
    slug: "genitive",
    name: "Genitive",
    question: "Koho? Čoho? · Whose? Of what?",
    summary:
      "The genitive marks possession, amounts, absence, and several common prepositional relationships.",
    body: [
      "Use genitive for possession and relationships between nouns. It also appears after words for amounts and after negated byť or mať in some expressions.",
      "Common prepositions such as z, od, do, and bez regularly introduce the genitive. Learn each preposition with a useful phrase.",
    ],
    examples: [
      {
        slovak: "Som z Kanady.",
        english: "I am from Canada.",
        note: "z takes the genitive: Kanada becomes Kanady.",
      },
      {
        slovak: "Pohár vody.",
        english: "A glass of water.",
        note: "vody identifies what the glass contains.",
      },
    ],
    researchPrompts: [
      "Notice one genitive phrase with z, od, do, or bez.",
      "Build a phrase showing possession or amount.",
    ],
    status: "ready",
    source: languageSource,
  },
  {
    slug: "dative",
    name: "Dative",
    question: "Komu? Čomu? · To whom? To what?",
    summary:
      "The dative marks the person or thing that receives, benefits from, or is affected by an action.",
    body: [
      "Use dative for an indirect object: the person or thing something is given, said, or done to.",
      "Some verbs and expressions select the dative without a visible preposition. Learn the form with the verb that governs it.",
    ],
    examples: [
      {
        slovak: "Dám Petrovi knihu.",
        english: "I will give Peter a book.",
        note: "Petrovi is the recipient.",
      },
      {
        slovak: "Pomáham mame.",
        english: "I am helping my mother.",
        note: "mame is the person receiving help.",
      },
    ],
    researchPrompts: [
      "Find a verb that takes a person in the dative.",
      "Compare a dative recipient with an accusative object.",
    ],
    status: "ready",
    source: languageSource,
  },
  {
    slug: "accusative",
    name: "Accusative",
    question: "Koho? Čo? · Whom? What?",
    summary:
      "The accusative marks the direct object: the person or thing directly affected by an action.",
    body: [
      "Use accusative for what or whom you see, have, want, read, or otherwise act on directly.",
      "For many feminine nouns, the accusative ending differs from the nominative. Learn the object form inside a complete phrase.",
    ],
    examples: [
      {
        slovak: "Mám kávu.",
        english: "I have coffee.",
        note: "kávu is the direct object of mám.",
      },
      {
        slovak: "Vidím mesto.",
        english: "I see the city.",
        note: "mesto is the thing directly seen.",
      },
    ],
    researchPrompts: [
      "Underline the direct object in three Slovak sentences.",
      "Practise one feminine noun in nominative and accusative.",
    ],
    status: "ready",
    source: languageSource,
  },
  {
    slug: "locative",
    name: "Locative",
    question: "O kom? O čom? · About whom? About what?",
    summary:
      "The locative is used after selected prepositions for location and for talking about a person or topic.",
    body: [
      "The locative appears with prepositions such as v, na, and o. It is not used on its own; the preposition helps determine the meaning.",
      "Use it for where something is and for the topic of speech or thought. Learn the preposition and noun as a pair.",
    ],
    examples: [
      {
        slovak: "Bývam v meste.",
        english: "I live in the city.",
        note: "v meste expresses a location.",
      },
      {
        slovak: "Hovorím o škole.",
        english: "I am talking about school.",
        note: "o škole marks the topic.",
      },
    ],
    researchPrompts: [
      "Collect one location phrase with v or na.",
      "Find a sentence using o for its topic.",
    ],
    status: "ready",
    source: languageSource,
  },
  {
    slug: "instrumental",
    name: "Instrumental",
    question: "S kým? S čím? · With whom? With what?",
    summary:
      "The instrumental marks company, tools, and other means, especially after s or so.",
    body: [
      "Use instrumental after s or so for the person or thing accompanying someone. It also marks the tool used to perform an action.",
      "Some roles and states use instrumental without s. Start with common phrases, then notice the endings in context.",
    ],
    examples: [
      {
        slovak: "Idem s priateľom.",
        english: "I am going with a friend.",
        note: "s priateľom marks company.",
      },
      {
        slovak: "Píšem perom.",
        english: "I write with a pen.",
        note: "perom identifies the tool.",
      },
    ],
    researchPrompts: [
      "Find a phrase with s or so plus a person.",
      "Name one tool you use with instrumental.",
    ],
    status: "ready",
    source: languageSource,
  },
];

export const caseTopicBySlug = new Map(caseTopics.map((topic) => [topic.slug, topic]));

export const pronunciationEntries: PronunciationTopic[] = [
  {
    slug: "slovak-alphabet",
    slovak: "slovenská abeceda",
    english: "Slovak alphabet",
    category: "Spelling",
    kind: "pronunciation",
    summary: "Learn the letters, diacritics, and ch as one Slovak digraph.",
    body: [
      "The Slovak alphabet has 46 letters, including letters with diacritics and the digraphs dz, dž, and ch. Acute marks show long vowels, while the caron marks several changed consonants and vowels.",
      "Treat ch as one letter in the alphabet and as one sound in a word. It comes after h in alphabetical order, so chlieb begins with the single digraph ch, not a separate c followed by h.",
    ],
    examples: [
      { slovak: "čo", english: "what" },
      { slovak: "žena", english: "woman" },
      { slovak: "chlieb", english: "bread" },
    ],
    related: ["soft-consonants", "vowel-length", "co", "zena", "dakujem"],
    source: languageSource,
    tags: ["alphabet", "spelling", "beginner"],
    pathGroup: "Spelling",
    order: 1,
    goal: "Recognize Slovak letters and the digraph ch.",
    contrasts: [
      { left: "c", right: "č", note: "plain c / caron" },
      { left: "s", right: "š", note: "plain s / caron" },
      { left: "ch", right: "c + h", note: "one digraph / two letters" },
    ],
    mouthCue:
      "Read each marked letter clearly, then make ch as one breathy sound instead of pausing between c and h.",
    practiceWords: ["čo", "žena", "chlieb"],
    practicePhrase: {
      slovak: "Čo je chlieb?",
      english: "What is bread?",
    },
    nextSlug: "first-syllable-stress",
  },
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
    related: ["dakujem", "vowel-length", "rhythmic-law"],
    source: languageSource,
    tags: ["stress", "rhythm", "beginner"],
    pathGroup: "Rhythm",
    order: 2,
    goal: "Hear and place the steady first-syllable beat.",
    contrasts: [
      { left: "BRAtislava", right: "bra-ti-SLA-va", note: "Stress first syllable" },
      { left: "ĎAkujem", right: "ďa-KU-jem", note: "Keep later syllables light" },
    ],
    mouthCue:
      "Give the first syllable a small lift. Keep the rest even; do not stretch it for stress.",
    practiceWords: ["Bratislava", "ďakujem", "prosím"],
    practicePhrase: { slovak: "Ďakujem za pomoc.", english: "Thank you for the help." },
    nextSlug: "rhythmic-law",
  },
  {
    slug: "rhythmic-law",
    slovak: "rytmický zákon",
    english: "rhythmic law",
    category: "Rhythm",
    kind: "pronunciation",
    summary: "Native Slovak generally avoids two successive long syllables.",
    body: [
      "In native Slovak words, two long syllables usually do not follow one another. A long vowel or diphthong counts as a long syllable nucleus, so the next syllable is often shortened.",
      "This is why speakers say krásny rather than *krásný, bývam rather than *bývám, and múdry rather than *múdrý.",
      "Loans, some morphological environments, and compounds can be exceptions. Treat the rhythmic law as a strong native-word tendency, not a rule for generating every form.",
    ],
    examples: [
      { slovak: "krásny", english: "beautiful" },
      { slovak: "bývam", english: "I live" },
      { slovak: "múdry", english: "clever; wise" },
    ],
    related: ["vowel-length", "first-syllable-stress"],
    source: languageSource,
    tags: ["rhythm", "vowels", "intermediate"],
    pathGroup: "Rhythm",
    order: 3,
    goal: "Hear and produce the shortening that prevents two successive long syllables.",
    contrasts: [
      {
        left: "krásny",
        right: "krásný",
        note: "standard Slovak / two long syllables avoided",
      },
      { left: "bývam", right: "bývám", note: "standard Slovak / second vowel shortened" },
      { left: "múdry", right: "múdrý", note: "standard Slovak / second vowel shortened" },
    ],
    mouthCue:
      "Hold the first long vowel or diphthong, then keep the following syllable short and light instead of stretching both.",
    practiceWords: ["krásny", "bývam", "múdry", "mlieko"],
    practicePhrase: {
      slovak: "Bývam v krásnom dome.",
      english: "I live in a beautiful house.",
    },
    nextSlug: "vowel-length",
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
    related: ["kava", "listok", "first-syllable-stress", "rhythmic-law"],
    source: languageSource,
    tags: ["vowels", "length", "beginner"],
    pathGroup: "Vowels",
    order: 4,
    goal: "Hold marked vowels longer without moving the stress.",
    contrasts: [
      { left: "a", right: "á", note: "short / long" },
      { left: "i", right: "í", note: "short / long" },
    ],
    mouthCue:
      "Keep the vowel shape steady. Length means more time, not more force or a different vowel.",
    practiceWords: ["káva", "lístok", "áno"],
    practicePhrase: { slovak: "Prosím si kávu.", english: "I would like coffee." },
    nextSlug: "soft-consonants",
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
    pathGroup: "Consonants",
    order: 5,
    goal: "Treat marked consonants as distinct sounds, not decorated letters.",
    contrasts: [
      { left: "c", right: "č", note: "plain / caron" },
      { left: "s", right: "š", note: "plain / caron" },
    ],
    mouthCue:
      "For č, š, and ž, raise the tongue slightly and let the sound pass further back in the mouth.",
    practiceWords: ["čo", "žena", "ďakujem"],
    practicePhrase: { slovak: "Čo to znamená?", english: "What does that mean?" },
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
