import { curatedEssentialsSeed } from "./curated-essentials-seed";
import lemmaFrequencyIndex from "../../../../content/frequency/lemma-index.json";
import dictionaryWords from "../../../../content/dictionary/words.json";
import { normalizeLemma } from "../frequency";
import { type FrequencyPartOfSpeech } from "../frequency/types";
import { dictionarySource, julsSourceLabel, snkSourceUrl } from "../sources";
import type { ContentEntry, Example, WordFrequency, WordOrigin } from "../types";

/**
 * Hand-authored lemma row (curated seed + `words.json`).
 * Template, homes, slug/category rules: `content/dictionary/README.md`.
 */
type WordSeed = Pick<
  ContentEntry,
  | "slug"
  | "slovak"
  | "english"
  | "category"
  | "examples"
  | "related"
  | "topics"
  | "register"
>;

type LemmaFrequencyHit = { partOfSpeech: FrequencyPartOfSpeech; rank: number };

const frequencyIndex = lemmaFrequencyIndex as Record<string, LemmaFrequencyHit>;

const CATEGORY_TO_PART_OF_SPEECH: Record<string, FrequencyPartOfSpeech> = {
  Verbs: "verb",
  Nouns: "noun",
  Adjectives: "adjective",
  Adverbs: "adverb",
};

function wordFrequency(word: WordSeed): WordFrequency | undefined {
  const preferredPartOfSpeech = CATEGORY_TO_PART_OF_SPEECH[word.category];
  const exactLower = word.slovak.toLocaleLowerCase("sk");

  // Curated topical buckets (Phrases / Places / …) never inherit a POS rank
  // from a same-spelling adverb/verb/noun (slovensky Phrases ≠ adverb rank).
  if (!preferredPartOfSpeech) return undefined;

  const preferredExact = frequencyIndex[`exact:${exactLower}|${preferredPartOfSpeech}`];
  if (preferredExact) return preferredExact;

  const key = normalizeLemma(word.slovak);
  const preferred = frequencyIndex[`${key}|${preferredPartOfSpeech}`];
  if (preferred) return preferred;

  return undefined;
}

const curatedWordSeed: WordSeed[] = [
  {
    slug: "ahoj",
    slovak: "ahoj",
    english: "hello; hi; bye",
    category: "Phrases",
    topics: ["Greetings"],
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
    category: "Phrases",
    topics: ["Essentials"],
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
    category: "Phrases",
    topics: ["Essentials"],
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
    category: "Phrases",
    topics: ["Essentials"],
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
    category: "Phrases",
    topics: ["Essentials"],
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
    category: "Phrases",
    topics: ["Greetings"],
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
    category: "Phrases",
    topics: ["Greetings"],
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
    category: "Phrases",
    topics: ["Essentials"],
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
    category: "Phrases",
    topics: ["Questions"],
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
    category: "Phrases",
    topics: ["Questions"],
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
    category: "Phrases",
    topics: ["Questions"],
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
    category: "Phrases",
    topics: ["Questions"],
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
    category: "Phrases",
    topics: ["Questions"],
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
    category: "Phrases",
    topics: ["Conversation"],
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
    category: "Verbs",
    topics: ["Conversation"],
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
    category: "Phrases",
    topics: ["Conversation"],
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
    category: "Verbs",
    topics: ["Learning"],
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
    category: "Nouns",
    topics: ["Learning"],
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
    category: "Nouns",
    topics: ["Learning"],
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
    category: "Nouns",
    topics: ["Everyday life"],
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
    category: "Nouns",
    topics: ["Everyday life"],
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
    category: "Nouns",
    topics: ["People"],
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
    category: "Nouns",
    topics: ["People"],
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
    category: "Nouns",
    topics: ["People"],
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
    category: "Nouns",
    topics: ["People"],
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
    category: "Nouns",
    topics: ["Food"],
    examples: [
      { slovak: "Toto jedlo je výborné.", english: "This food is excellent." },
      { slovak: "Kde je dobré jedlo?", english: "Where is good food?" },
    ],
    related: [
      "voda",
      "kava",
      "kolac",
      "vecera",
      "obed",
      "ranajky",
      "mlieko",
      "polievka",
      "caj",
      "chlieb",
      "syr",
      "maslo",
      "cukor",
    ],
  },
  {
    slug: "voda",
    slovak: "voda",
    english: "water",
    category: "Nouns",
    topics: ["Food"],
    examples: [
      { slovak: "Prosím si pohár vody.", english: "I’d like a glass of water." },
      { slovak: "Pijem veľa vody.", english: "I drink a lot of water." },
    ],
    related: ["jedlo", "kava", "vecera", "obed", "ranajky", "polievka", "caj"],
  },
  {
    slug: "kava",
    slovak: "káva",
    english: "coffee",
    category: "Nouns",
    topics: ["Food"],
    examples: [
      { slovak: "Dáte si kávu?", english: "Would you like coffee?" },
      { slovak: "Ráno pijem kávu.", english: "I drink coffee in the morning." },
      { slovak: "Poprosím čiernu kávu.", english: "Black coffee, please." },
    ],
    related: ["voda", "jedlo", "kolac", "caj", "mlieko", "cukor"],
  },
  {
    slug: "kolac",
    slovak: "koláč",
    english: "cake; pastry",
    category: "Nouns",
    topics: ["Food"],
    examples: [
      { slovak: "Moja mama pečie koláč.", english: "My mom is baking a cake." },
      { slovak: "Ten koláč je výborný.", english: "That cake is excellent." },
    ],
    related: ["jedlo", "chlieb", "kava", "voda", "syr", "maslo", "cukor"],
  },
  {
    slug: "vecera",
    slovak: "večera",
    english: "dinner; evening meal",
    category: "Nouns",
    topics: ["Food"],
    examples: [
      { slovak: "Večera je o šiestej.", english: "Dinner is at six." },
      { slovak: "Na večeru mám polievku.", english: "I have soup for dinner." },
    ],
    related: ["jedlo", "obed", "ranajky", "polievka", "chlieb"],
  },
  {
    slug: "obed",
    slovak: "obed",
    english: "lunch",
    category: "Nouns",
    topics: ["Food"],
    examples: [
      { slovak: "Obed je pripravený.", english: "Lunch is ready." },
      {
        slovak: "Na obed jem chlieb a syr.",
        english: "I eat bread and cheese for lunch.",
      },
    ],
    related: ["jedlo", "vecera", "ranajky", "polievka", "chlieb", "syr"],
  },
  {
    slug: "ranajky",
    slovak: "raňajky",
    english: "breakfast",
    category: "Nouns",
    topics: ["Food"],
    examples: [
      { slovak: "Raňajky mám o siedmej.", english: "I have breakfast at seven." },
      {
        slovak: "Na raňajky jem chlieb s maslom.",
        english: "I eat bread with butter for breakfast.",
      },
    ],
    related: ["jedlo", "vecera", "obed", "chlieb", "maslo", "caj"],
  },
  {
    slug: "mlieko",
    slovak: "mlieko",
    english: "milk",
    category: "Nouns",
    topics: ["Food"],
    examples: [
      { slovak: "Pijem ráno mlieko.", english: "I drink milk in the morning." },
      { slovak: "Mlieko je v chladničke.", english: "The milk is in the fridge." },
    ],
    related: ["kava", "caj", "maslo", "cukor"],
  },
  {
    slug: "polievka",
    slovak: "polievka",
    english: "soup",
    category: "Nouns",
    topics: ["Food"],
    examples: [
      { slovak: "Polievka je horúca.", english: "The soup is hot." },
      { slovak: "Dám si zeleninovú polievku.", english: "I’ll have vegetable soup." },
    ],
    related: ["jedlo", "vecera", "obed", "voda", "chlieb"],
  },
  {
    slug: "caj",
    slovak: "čaj",
    english: "tea",
    category: "Nouns",
    topics: ["Food"],
    examples: [
      { slovak: "Večer pijem čaj.", english: "I drink tea in the evening." },
      { slovak: "Prosím si teplý čaj.", english: "I’d like hot tea." },
    ],
    related: ["kava", "voda", "mlieko", "cukor", "vecera"],
  },
  // chlieb lives in words.json (frequency + Tatoeba); keep related links only
  {
    slug: "syr",
    slovak: "syr",
    english: "cheese",
    category: "Nouns",
    topics: ["Food"],
    examples: [
      { slovak: "Mám rád slovenský syr.", english: "I like Slovak cheese." },
      { slovak: "Syr je na stole.", english: "The cheese is on the table." },
    ],
    related: ["chlieb", "maslo", "obed", "jedlo"],
  },
  {
    slug: "maslo",
    slovak: "maslo",
    english: "butter",
    category: "Nouns",
    topics: ["Food"],
    examples: [
      { slovak: "Maslo je v chladničke.", english: "The butter is in the fridge." },
      { slovak: "Na chlieb dávam maslo.", english: "I put butter on bread." },
    ],
    related: ["chlieb", "syr", "mlieko", "ranajky"],
  },
  {
    slug: "cukor",
    slovak: "cukor",
    english: "sugar",
    category: "Nouns",
    topics: ["Food"],
    examples: [
      { slovak: "Dáš si cukor do čaju?", english: "Do you want sugar in your tea?" },
      { slovak: "Káva je bez cukru.", english: "The coffee is without sugar." },
    ],
    related: ["caj", "kava", "kolac", "mlieko"],
  },
  {
    slug: "mesto",
    slovak: "mesto",
    english: "city; town",
    category: "Places",
    topics: ["Places"],
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
    category: "Nouns",
    topics: ["Travel"],
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
    category: "Nouns",
    topics: ["Travel"],
    examples: [
      {
        slovak: "Jeden lístok do Košíc, prosím.",
        english: "One ticket to Košice, please.",
      },
      { slovak: "Kde si môžem kúpiť lístok?", english: "Where can I buy a ticket?" },
    ],
    related: ["stanica", "kolko"],
  },
  ...curatedEssentialsSeed,
];

const curatedSlugs = new Set(curatedWordSeed.map((word) => word.slug));
const wordSeed: WordSeed[] = [
  ...curatedWordSeed,
  ...(dictionaryWords as WordSeed[]).filter((word) => !curatedSlugs.has(word.slug)),
];

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
    tags: [
      word.category.toLowerCase(),
      ...(word.topics ?? []).map((topic) => topic.toLowerCase()),
      ...(word.register ? [word.register] : []),
      "beginner",
    ],
  };
});

/** Same-part-of-speech related links for frequency words with empty `related`. */
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
    const key = `${entry.frequency.partOfSpeech}::${token}`;
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

  const byPartOfSpeech: Record<FrequencyPartOfSpeech, ContentEntry[]> = {
    verb: [],
    noun: [],
    adjective: [],
    adverb: [],
  };

  for (const entry of entries) {
    if (!entry.frequency || entry.related.length > 0) continue;
    if (glossRelated.has(entry.slug)) continue;
    byPartOfSpeech[entry.frequency.partOfSpeech].push(entry);
  }

  for (const partOfSpeech of Object.keys(byPartOfSpeech) as FrequencyPartOfSpeech[]) {
    byPartOfSpeech[partOfSpeech].sort(
      (first, second) => (first.frequency?.rank ?? 0) - (second.frequency?.rank ?? 0),
    );
  }

  const rankNeighbors = new Map<string, string[]>();

  for (const partOfSpeech of Object.keys(byPartOfSpeech) as FrequencyPartOfSpeech[]) {
    const list = byPartOfSpeech[partOfSpeech];

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
