import { curatedEssentialsSeed } from "./curated-essentials-seed";
import lemmaFrequencyIndex from "../../../../content/frequency/lemma-index.json";
import dictionaryWords from "../../../../content/dictionary/words.json";
import variantFormGroups from "../../../../content/dictionary/variant-forms.json";
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
  | "gender"
  | "pluralOnlyGender"
  | "dialect"
  | "declension"
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
      {
        slovak: "Ahoj, Zuzana! Dlho sme sa nevideli.",
        english: "Hi, Zuzana! Long time no see.",
      },
      { slovak: "Tak ahoj, uvidíme sa zajtra.", english: "Bye then, see you tomorrow." },
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
      {
        slovak: "Ďakujem, to je od vás milé.",
        english: "Thank you, that's kind of you.",
      },
      {
        slovak: "Ako sa máš? — Dobre, ďakujem.",
        english: "How are you? — Fine, thank you.",
      },
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
      { slovak: "Prosím, sadnite si.", english: "Please sit down." },
      {
        slovak: "Prosím? Môžete to zopakovať?",
        english: "Pardon? Could you say that again?",
      },
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
      { slovak: "Máš čas? — Áno, mám.", english: "Do you have time? — Yes, I do." },
      { slovak: "Áno, hneď prídem.", english: "Yes, I'm coming right away." },
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
      { slovak: "Nie, to nie je moja taška.", english: "No, that isn't my bag." },
      { slovak: "Dnes nie, možno zajtra.", english: "Not today, maybe tomorrow." },
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
      {
        slovak: "Dobrý deň, máte voľný stôl?",
        english: "Hello, do you have a free table?",
      },
      {
        slovak: "Dobrý deň, hľadám poštu.",
        english: "Hello, I'm looking for the post office.",
      },
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
      {
        slovak: "Dovidenia a ďakujem za všetko.",
        english: "Goodbye and thank you for everything.",
      },
      { slovak: "Dovidenia, pán doktor.", english: "Goodbye, doctor." },
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
      {
        slovak: "Prepáčte, je toto miesto voľné?",
        english: "Excuse me, is this seat free?",
      },
      { slovak: "Prepáčte, že meškám.", english: "Sorry I'm late." },
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
      { slovak: "Ako sa dostanem na stanicu?", english: "How do I get to the station?" },
      { slovak: "Je vysoký ako otec.", english: "He's as tall as his father." },
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
      { slovak: "Kde je najbližšia lekáreň?", english: "Where is the nearest pharmacy?" },
      { slovak: "Neviem, kde sú kľúče.", english: "I don't know where the keys are." },
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
      { slovak: "Čo si dáte na obed?", english: "What will you have for lunch?" },
      { slovak: "Čo hľadáš?", english: "What are you looking for?" },
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
      { slovak: "Kto ešte chce kávu?", english: "Who else wants coffee?" },
      { slovak: "Kto má dnes narodeniny?", english: "Whose birthday is it today?" },
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
      { slovak: "Koľko je hodín?", english: "What time is it?" },
      {
        slovak: "Koľko ľudí príde na večeru?",
        english: "How many people are coming to dinner?",
      },
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
      {
        slovak: "Rozumiem všetkému, čo hovoríš.",
        english: "I understand everything you're saying.",
      },
      { slovak: "Teraz už rozumiem, ďakujem.", english: "Now I understand, thanks." },
    ],
    related: ["hovorit", "slovensky"],
  },
  {
    slug: "hovorit",
    slovak: "hovoriť",
    english: "to speak; to talk; to say (imperfective)",
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
      { slovak: "Hovorte pomalšie, prosím.", english: "Please speak more slowly." },
      { slovak: "Včera som hovoril s Petrom.", english: "Yesterday I talked to Peter." },
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
      {
        slovak: "Babka hovorí len po slovensky.",
        english: "Grandma speaks only Slovak.",
      },
      { slovak: "Rozumieš po slovensky?", english: "Do you understand Slovak?" },
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
      {
        slovak: "Včera som sa učil do noci.",
        english: "Yesterday I studied late into the night.",
      },
      { slovak: "Musím sa učiť na skúšku.", english: "I have to study for an exam." },
    ],
    related: ["slovensky", "slovo"],
  },
  {
    slug: "slovo",
    slovak: "slovo",
    english: "word",
    category: "Nouns",
    gender: "neuter",
    topics: ["Learning"],
    examples: [
      { slovak: "Toto slovo je nové.", english: "This word is new." },
      { slovak: "Neviem to slovo.", english: "I don’t know that word." },
      { slovak: "Ako sa píše to slovo?", english: "How do you spell that word?" },
      {
        slovak: "Poznám už sto slovenských slov.",
        english: "I already know a hundred Slovak words.",
      },
    ],
    related: ["ucit-sa", "jazyk"],
  },
  {
    slug: "jazyk",
    slovak: "jazyk",
    english: "language; tongue",
    category: "Nouns",
    gender: "masculine-inanimate",
    topics: ["Learning"],
    examples: [
      {
        slovak: "Slovenčina je slovanský jazyk.",
        english: "Slovak is a Slavic language.",
      },
      { slovak: "Učím sa cudzí jazyk.", english: "I am learning a foreign language." },
      { slovak: "Akými jazykmi hovoríš?", english: "What languages do you speak?" },
      { slovak: "Popálil som si jazyk.", english: "I burnt my tongue." },
    ],
    related: ["slovo", "slovensky"],
  },
  {
    slug: "dom",
    slovak: "dom",
    english: "house; home",
    category: "Nouns",
    gender: "masculine-inanimate",
    topics: ["Everyday life"],
    declension: {
      singular: ["dom", "domu", "domu", "dom", "dome", "domom"],
      plural: ["domy", "domov", "domom", "domy", "domoch", "domami"],
    },
    examples: [
      { slovak: "Náš dom je malý.", english: "Our house is small." },
      { slovak: "Mám nový dom.", english: "I have a new house." },
      { slovak: "Bývame v starom dome.", english: "We live in an old house." },
      {
        slovak: "Pred domom stojí auto.",
        english: "There's a car in front of the house.",
      },
    ],
    related: ["rodina", "mesto"],
  },
  {
    slug: "rodina",
    slovak: "rodina",
    english: "family",
    category: "Nouns",
    gender: "feminine",
    topics: ["Everyday life"],
    declension: {
      singular: ["rodina", "rodiny", "rodine", "rodinu", "rodine", "rodinou"],
      plural: ["rodiny", "rodín", "rodinám", "rodiny", "rodinách", "rodinami"],
    },
    examples: [
      {
        slovak: "Moja rodina žije na Slovensku.",
        english: "My family lives in Slovakia.",
      },
      { slovak: "Mám veľkú rodinu.", english: "I have a big family." },
      {
        slovak: "Víkend trávim s rodinou.",
        english: "I spend the weekend with my family.",
      },
      { slovak: "Mám rodinu v Košiciach.", english: "I have family in Košice." },
    ],
    related: ["dom", "priatel"],
  },
  {
    slug: "priatel",
    slovak: "priateľ",
    english: "friend; boyfriend",
    category: "Nouns",
    gender: "masculine-animate",
    topics: ["People"],
    declension: {
      singular: [
        "priateľ",
        "priateľa",
        "priateľovi",
        "priateľa",
        "priateľovi",
        "priateľom",
      ],
      plural: [
        "priatelia",
        "priateľov",
        "priateľom",
        "priateľov",
        "priateľoch",
        "priateľmi",
      ],
    },
    examples: [
      { slovak: "Peter je môj priateľ.", english: "Peter is my friend." },
      { slovak: "Idem s priateľom.", english: "I am going with a friend." },
      { slovak: "Zuzana má nového priateľa.", english: "Zuzana has a new boyfriend." },
      {
        slovak: "Moji priatelia bývajú v Žiline.",
        english: "My friends live in Žilina.",
      },
    ],
    related: ["priatelka", "kamarat", "priatelstvo", "rodina", "clovek"],
  },
  {
    slug: "clovek",
    slovak: "človek",
    english: "person; human",
    category: "Nouns",
    gender: "masculine-animate",
    topics: ["People"],
    examples: [
      { slovak: "Je to dobrý človek.", english: "He is a good person." },
      {
        slovak: "Každý človek potrebuje priateľov.",
        english: "Every person needs friends.",
      },
      { slovak: "Toho človeka nepoznám.", english: "I don't know that person." },
      {
        slovak: "Na námestí je veľa ľudí.",
        english: "There are a lot of people on the square.",
      },
    ],
    related: ["priatel", "muz", "zena"],
  },
  {
    slug: "muz",
    slovak: "muž",
    english: "man; husband",
    category: "Nouns",
    gender: "masculine-animate",
    topics: ["People"],
    examples: [
      { slovak: "Ten muž čaká.", english: "That man is waiting." },
      {
        slovak: "Môj muž pracuje v Bratislave.",
        english: "My husband works in Bratislava.",
      },
      {
        slovak: "Na stanici ma čakal nejaký muž.",
        english: "A man was waiting for me at the station.",
      },
      {
        slovak: "V parku hrajú muži futbal.",
        english: "Some men are playing football in the park.",
      },
    ],
    related: ["zena", "clovek"],
  },
  {
    slug: "zena",
    slovak: "žena",
    english: "woman; wife",
    category: "Nouns",
    gender: "feminine",
    topics: ["People"],
    declension: {
      singular: ["žena", "ženy", "žene", "ženu", "žene", "ženou"],
      plural: ["ženy", "žien", "ženám", "ženy", "ženách", "ženami"],
    },
    examples: [
      { slovak: "Tá žena číta.", english: "That woman is reading." },
      { slovak: "Moja žena je učiteľka.", english: "My wife is a teacher." },
      {
        slovak: "Vedľa mňa sedela mladá žena.",
        english: "A young woman was sitting next to me.",
      },
      { slovak: "Kúpil som žene kvety.", english: "I bought my wife flowers." },
    ],
    related: ["muz", "clovek"],
  },
  {
    slug: "jedlo",
    slovak: "jedlo",
    english: "food; meal",
    category: "Nouns",
    gender: "neuter",
    topics: ["Food"],
    examples: [
      { slovak: "Toto jedlo je výborné.", english: "This food is excellent." },
      { slovak: "Kde je dobré jedlo?", english: "Where is good food?" },
      { slovak: "Pred jedlom si umy ruky.", english: "Wash your hands before eating." },
      { slovak: "Slovenské jedlá sú chutné.", english: "Slovak dishes are tasty." },
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
    gender: "feminine",
    topics: ["Food"],
    examples: [
      { slovak: "Prosím si pohár vody.", english: "I’d like a glass of water." },
      { slovak: "Pijem veľa vody.", english: "I drink a lot of water." },
      { slovak: "Je táto voda pitná?", english: "Is this water safe to drink?" },
      { slovak: "Voda v jazere je studená.", english: "The water in the lake is cold." },
    ],
    related: ["jedlo", "kava", "vecera", "obed", "ranajky", "polievka", "caj"],
  },
  {
    slug: "kava",
    slovak: "káva",
    english: "coffee",
    category: "Nouns",
    gender: "feminine",
    topics: ["Food"],
    examples: [
      { slovak: "Dáte si kávu?", english: "Would you like coffee?" },
      { slovak: "Ráno pijem kávu.", english: "I drink coffee in the morning." },
      { slovak: "Poprosím čiernu kávu.", english: "Black coffee, please." },
      { slovak: "Ideme na kávu?", english: "Shall we go for a coffee?" },
    ],
    related: ["voda", "jedlo", "kolac", "caj", "mlieko", "cukor"],
  },
  {
    slug: "kolac",
    slovak: "koláč",
    english: "cake; pastry",
    category: "Nouns",
    gender: "masculine-inanimate",
    topics: ["Food"],
    examples: [
      { slovak: "Moja mama pečie koláč.", english: "My mom is baking a cake." },
      { slovak: "Ten koláč je výborný.", english: "That cake is excellent." },
      { slovak: "Dáš si kúsok koláča?", english: "Would you like a piece of cake?" },
      { slovak: "Babka piekla jablkový koláč.", english: "Grandma baked an apple cake." },
    ],
    related: ["jedlo", "chlieb", "kava", "voda", "syr", "maslo", "cukor"],
  },
  {
    slug: "vecera",
    slovak: "večera",
    english: "dinner; evening meal",
    category: "Nouns",
    gender: "feminine",
    topics: ["Food"],
    examples: [
      { slovak: "Večera je o šiestej.", english: "Dinner is at six." },
      { slovak: "Na večeru mám polievku.", english: "I have soup for dinner." },
      {
        slovak: "Po večeri ideme na prechádzku.",
        english: "After dinner we go for a walk.",
      },
      { slovak: "Pozývam ťa na večeru.", english: "I'm inviting you to dinner." },
    ],
    related: ["jedlo", "obed", "ranajky", "polievka", "chlieb"],
  },
  {
    slug: "obed",
    slovak: "obed",
    english: "lunch",
    category: "Nouns",
    gender: "masculine-inanimate",
    topics: ["Food"],
    examples: [
      { slovak: "Obed je pripravený.", english: "Lunch is ready." },
      {
        slovak: "Na obed jem chlieb a syr.",
        english: "I eat bread and cheese for lunch.",
      },
      { slovak: "Na obed chodím do jedálne.", english: "I go to the canteen for lunch." },
      { slovak: "Pozvala ma na obed.", english: "She invited me to lunch." },
    ],
    related: ["jedlo", "vecera", "ranajky", "polievka", "chlieb", "syr"],
  },
  {
    slug: "ranajky",
    slovak: "raňajky",
    english: "breakfast",
    category: "Nouns",
    gender: "plural-only",
    pluralOnlyGender: "feminine",
    topics: ["Food"],
    examples: [
      { slovak: "Raňajky mám o siedmej.", english: "I have breakfast at seven." },
      {
        slovak: "Na raňajky jem chlieb s maslom.",
        english: "I eat bread with butter for breakfast.",
      },
      { slovak: "Raňajky sú hotové.", english: "Breakfast is ready." },
      { slovak: "Po raňajkách idem do práce.", english: "After breakfast I go to work." },
    ],
    related: ["jedlo", "vecera", "obed", "chlieb", "maslo", "caj"],
  },
  {
    slug: "omrvinky",
    slovak: "omrvinky",
    english: "crumbs",
    category: "Nouns",
    gender: "plural-only",
    pluralOnlyGender: "feminine",
    topics: ["Food"],
    examples: [
      { slovak: "Na stole sú omrvinky.", english: "There are crumbs on the table." },
      {
        slovak: "Kto jedol koláč? Všade sú omrvinky.",
        english: "Who ate the cake? There are crumbs everywhere.",
      },
      {
        slovak: "Marek má na taške omrvinky.",
        english: "Marek has crumbs on his bag.",
      },
      {
        slovak: "Pozametaj tie omrvinky, prosím.",
        english: "Sweep up those crumbs, please.",
      },
      { slovak: "Vtáky jedia omrvinky z chleba.", english: "Birds eat breadcrumbs." },
    ],
    related: ["kolac", "chlieb", "stol", "tanier"],
  },
  {
    slug: "mlieko",
    slovak: "mlieko",
    english: "milk",
    category: "Nouns",
    gender: "neuter",
    topics: ["Food"],
    examples: [
      { slovak: "Pijem ráno mlieko.", english: "I drink milk in the morning." },
      { slovak: "Mlieko je v chladničke.", english: "The milk is in the fridge." },
      { slovak: "Kúp, prosím, mlieko a chlieb.", english: "Please buy milk and bread." },
      { slovak: "Pijem kávu bez mlieka.", english: "I drink my coffee without milk." },
    ],
    related: ["kava", "caj", "maslo", "cukor"],
  },
  {
    slug: "polievka",
    slovak: "polievka",
    english: "soup",
    category: "Nouns",
    gender: "feminine",
    topics: ["Food"],
    examples: [
      { slovak: "Polievka je horúca.", english: "The soup is hot." },
      { slovak: "Dám si zeleninovú polievku.", english: "I’ll have vegetable soup." },
      { slovak: "Máte dnes nejakú polievku?", english: "Do you have any soup today?" },
      { slovak: "Táto polievka je príliš slaná.", english: "This soup is too salty." },
    ],
    related: ["jedlo", "vecera", "obed", "voda", "chlieb"],
  },
  {
    slug: "caj",
    slovak: "čaj",
    english: "tea",
    category: "Nouns",
    gender: "masculine-inanimate",
    topics: ["Food"],
    examples: [
      { slovak: "Večer pijem čaj.", english: "I drink tea in the evening." },
      { slovak: "Prosím si teplý čaj.", english: "I’d like hot tea." },
      { slovak: "Uvarím ti čaj.", english: "I'll make you some tea." },
      { slovak: "Čaj je ešte horúci.", english: "The tea is still hot." },
    ],
    related: ["kava", "voda", "mlieko", "cukor", "vecera"],
  },
  {
    slug: "dzus",
    slovak: "džús",
    english: "juice",
    category: "Nouns",
    gender: "masculine-inanimate",
    topics: ["Food"],
    examples: [
      { slovak: "Kúpil som pomarančový džús.", english: "I bought orange juice." },
      { slovak: "Dám si pohár džúsu.", english: "I'll have a glass of juice." },
      {
        slovak: "Fľaša s džúsom je na stole.",
        english: "The bottle of juice is on the table.",
      },
      { slovak: "Tento džús je príliš sladký.", english: "This juice is too sweet." },
    ],
    related: ["caj", "kava", "voda", "mlieko"],
  },
  // chlieb lives in words.json (frequency + Tatoeba); keep related links only
  {
    slug: "syr",
    slovak: "syr",
    english: "cheese",
    category: "Nouns",
    gender: "masculine-inanimate",
    topics: ["Food"],
    examples: [
      { slovak: "Mám rád slovenský syr.", english: "I like Slovak cheese." },
      { slovak: "Syr je na stole.", english: "The cheese is on the table." },
      { slovak: "Tento syr je z Liptova.", english: "This cheese is from Liptov." },
      {
        slovak: "Do cestovín dám trochu syra.",
        english: "I'll put a little cheese in the pasta.",
      },
    ],
    related: ["chlieb", "maslo", "obed", "jedlo"],
  },
  {
    slug: "maslo",
    slovak: "maslo",
    english: "butter",
    category: "Nouns",
    gender: "neuter",
    topics: ["Food"],
    examples: [
      { slovak: "Maslo je v chladničke.", english: "The butter is in the fridge." },
      { slovak: "Na chlieb dávam maslo.", english: "I put butter on bread." },
      { slovak: "Na pečenie potrebujem maslo.", english: "I need butter for baking." },
      { slovak: "Kúpiš aj maslo?", english: "Will you buy butter too?" },
    ],
    related: ["chlieb", "syr", "mlieko", "ranajky"],
  },
  {
    slug: "cukor",
    slovak: "cukor",
    english: "sugar",
    category: "Nouns",
    gender: "masculine-inanimate",
    topics: ["Food"],
    examples: [
      { slovak: "Dáš si cukor do čaju?", english: "Do you want sugar in your tea?" },
      { slovak: "Káva je bez cukru.", english: "The coffee is without sugar." },
      {
        slovak: "Koľko cukru dáš do koláča?",
        english: "How much sugar do you put in the cake?",
      },
      { slovak: "Podáš mi cukor?", english: "Can you pass me the sugar?" },
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
      { slovak: "Ideme do mesta.", english: "We're going into town." },
      {
        slovak: "Košice sú druhé najväčšie mesto na Slovensku.",
        english: "Košice is the second-largest city in Slovakia.",
      },
    ],
    related: ["dom", "stanica"],
  },
  {
    slug: "stanica",
    slovak: "stanica",
    english: "station",
    category: "Nouns",
    gender: "feminine",
    topics: ["Travel"],
    examples: [
      { slovak: "Stanica je blízko.", english: "The station is nearby." },
      { slovak: "Idem na stanicu.", english: "I am going to the station." },
      {
        slovak: "Na stanici čakám na vlak.",
        english: "I'm waiting for the train at the station.",
      },
      {
        slovak: "Ako ďaleko je to od stanice?",
        english: "How far is it from the station?",
      },
    ],
    related: ["mesto", "listok"],
  },
  {
    slug: "listok",
    slovak: "lístok",
    english: "ticket; small leaf",
    category: "Nouns",
    gender: "masculine-inanimate",
    topics: ["Travel"],
    examples: [
      {
        slovak: "Jeden lístok do Košíc, prosím.",
        english: "One ticket to Košice, please.",
      },
      { slovak: "Kde si môžem kúpiť lístok?", english: "Where can I buy a ticket?" },
      { slovak: "Máte lístok na autobus?", english: "Do you have a bus ticket?" },
      {
        slovak: "Na strome sú prvé zelené lístky.",
        english: "The first green leaves are on the tree.",
      },
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
  daco: "Dačo means the same as niečo — something. Both are standard Slovak; niečo is the more common word.",
  rad: "English “to like” is not one Slovak verb. Use mať rád for a thing or person, and rád + a verb for an activity. Páčiť sa and ľúbiť cover nearby meanings.",
  pacit:
    "Páčiť sa frames liking from the thing’s side: it appeals to me. Compare mať rád (see the rád entry) for the more direct “I like …”.",
  ist: "Ísť is for going now or once. Chodiť covers the habit — the same destination; both verbs are imperfective.",
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
  const hasReviewed = examples.some(
    (example) => example.note === "Curated" || example.demonstrates,
  );

  const meaning = "English meanings were added with the corpus frequency list.";

  if (hasTatoeba && !hasReviewed) {
    return `${meaning} Example sentences come from Tatoeba.`;
  }
  if (hasTatoeba) {
    return `${meaning} Some example sentences are hand-checked; the rest come from Tatoeba.`;
  }
  if (hasReviewed) {
    return `${meaning} Example sentences are hand-checked.`;
  }
  return meaning;
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
      ...(word.dialect ? ["dialect"] : []),
      "beginner",
    ],
  };
});

/**
 * Primary English sense as a grouping key: the first `;` segment without
 * `to` / `not to` / article prefixes or aspect/gender markers. Whole sense,
 * not first word, so "female friend" never pairs with "female boss"; meaning
 * qualifiers stay, so "pass (the ball)" never pairs with "pass".
 */
function primaryGloss(english: string): string | null {
  const gloss = english
    .split(";")[0]!
    .toLowerCase()
    .replace(/\((?:imperfective|perfective|habitual|f\.|m\.)\)/g, "")
    .trim()
    .replace(/^not\s+(?:to\s+)?/, "")
    .replace(/^to\s+/, "")
    .replace(/^(?:a|an|the)\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
  return gloss.length >= 3 ? gloss : null;
}

/**
 * Fill empty `related` on frequency words with same-part-of-speech peers that
 * share a primary sense (aspect partners, negations, near-synonyms). Words with
 * no such peer keep `related: []`: frequency-rank neighbours are not related
 * words (the entry's rank already links to the common-words list). Variant
 * spellings are skipped: they are the same word as their base, not a peer of it.
 */
function attachGlossPeers(entries: ContentEntry[]): ContentEntry[] {
  const maxPeers = 3;

  const glossBuckets = new Map<string, ContentEntry[]>();
  for (const entry of entries) {
    if (!entry.frequency || entry.related.length > 0 || entry.variantOf) continue;
    const gloss = primaryGloss(entry.english);
    if (!gloss) continue;
    const key = `${entry.frequency.partOfSpeech}::${gloss}`;
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

  return entries.map((entry) => {
    const peers = glossRelated.get(entry.slug);
    return peers ? { ...entry, related: peers } : entry;
  });
}

/**
 * Forms of one word share one page. The first slug in each group heads the page
 * and the rest point at it. The order is set by hand in `variant-forms.json`,
 * not by frequency, so the standard form stays the head.
 */
function markVariants(entries: ContentEntry[]): ContentEntry[] {
  const bySlug = new Map(entries.map((entry) => [entry.slug, entry]));
  const baseBySlug = new Map<string, string>();

  for (const group of variantFormGroups) {
    const [head, ...forms] = group;
    if (!head || !bySlug.has(head)) continue;

    for (const form of forms) {
      if (bySlug.has(form)) baseBySlug.set(form, head);
    }
  }

  return entries.map((entry) => {
    const variantOf = baseBySlug.get(entry.slug);
    return variantOf ? { ...entry, variantOf } : entry;
  });
}

export const words: ContentEntry[] = attachGlossPeers(markVariants(mappedWords));
