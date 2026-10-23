import { words } from "../dictionary/words";
import { pronounLemmas } from "../search/pronouns";
import { formsVerified, searchFormsForLemma } from "../search/forms";
import type { GrammaticalCase, WordClass, WordTag } from "$lib/level-test/types";

/** Prepositions, conjunctions, particles and question words: one list covers them. */
const FUNCTION_WORDS = new Set(
  [
    "a aj ak ako ale alebo ani asi až aby bez cez či do hneď i iba k keď kým ku kvôli",
    "lebo len medzi na nad nech nie no o od odo okolo okrem oproti po pod podľa počas",
    "pre pred preto pretože pri proti s sa si so teda tiež u už v vedľa veď však vo z",
    "za zo že ešte než kde kedy prečo kto čo koho komu čom čím ktorý ktorá ktoré ktorí",
    "ktorého ktorej ktorému ktorom ktorým ktorú ktorých ktorými",
  ]
    .join(" ")
    .split(" "),
);

/** Každý, niektorý, všetci…: they decline, but they work as function words, not content words. */
const QUANTIFIER =
  /^(?:každ|niektor|mnoh|všetk|všetc|žiadn|nijak)\p{L}*$|^(?:niečo|nič|niekto|nikto|všetko)$/u;

const NUMBER =
  /^(?:jeden|jedna|jedno|dva|dve|tri|štyri|päť|šesť|sedem|osem|deväť|desať|\p{L}+násť|dvadsať|tridsať|štyridsať|\p{L}+desiat|sto|tisíc)$|^(?:prv|druh|tret|štvrt|piat|šiest|siedm|ôsm|deviat|desiat)(?:ý|á|é|í|ej|ého|ému|om|ou|ú|ých|ým|ými)$/u;

/** Forms of byť and mať, which have their own grammar pages and lessons. */
const VERB_TOPICS = new Map<string, { lemma: string; topic: string }>([
  ..."som je sme ste sú bol bola bolo boli budem budeš bude budeme budete budú byť"
    .split(" ")
    .map((form) => [form, { lemma: "byť", topic: "byt-present" }] as const),
  ..."mám máš má máme máte majú mal mala malo mali mať"
    .split(" ")
    .map((form) => [form, { lemma: "mať", topic: "mat-present" }] as const),
]);

const CLASS_FOR_CATEGORY: Record<string, WordClass> = {
  Nouns: "noun",
  Places: "noun",
  Verbs: "verb",
  Adjectives: "adjective",
};

interface PronounForm {
  lemma: string;
  topic?: string;
  cases: GrammaticalCase[];
}

interface DictionaryForm {
  slug: string;
  lemma: string;
  class: WordClass;
  verified: boolean;
  rank: number;
}

let pronounIndex: Map<string, PronounForm> | undefined;
let dictionaryIndex: Map<string, DictionaryForm> | undefined;
/** Headwords of every category, so "potom" stays an adverb, not a form of "pot". */
let headwords: Map<string, DictionaryForm | null> | undefined;

function lower(value: string): string {
  return value.normalize("NFC").toLocaleLowerCase("sk");
}

function buildPronounIndex(): Map<string, PronounForm> {
  const index = new Map<string, PronounForm>();
  for (const pronoun of pronounLemmas) {
    const topic = pronoun.topicId?.split("/")[1];
    for (const row of pronoun.table) {
      for (const forms of Object.values(row.cells)) {
        for (const form of forms) {
          const key = lower(form);
          const entry = index.get(key) ?? { lemma: pronoun.lemma, topic, cases: [] };
          if (!entry.cases.includes(row.case)) entry.cases.push(row.case);
          index.set(key, entry);
        }
      }
    }
  }
  return index;
}

/** Real forms beat search-key guesses; among equals the commoner lemma wins. */
function better(next: DictionaryForm, current: DictionaryForm | undefined): boolean {
  if (!current) return true;
  if (next.verified !== current.verified) return next.verified;
  return next.rank < current.rank;
}

function buildDictionaryIndex(): Map<string, DictionaryForm> {
  const index = new Map<string, DictionaryForm>();
  headwords = new Map();
  for (const entry of words) {
    const wordClass = CLASS_FOR_CATEGORY[entry.category];
    if (!wordClass) {
      if (!headwords.has(lower(entry.slovak))) headwords.set(lower(entry.slovak), null);
      continue;
    }
    const candidate: DictionaryForm = {
      slug: entry.slug,
      lemma: entry.slovak,
      class: wordClass,
      verified: formsVerified(entry.slovak, entry.category, entry.gender),
      rank: entry.frequency?.rank ?? Number.MAX_SAFE_INTEGER,
    };
    const forms = [
      entry.slovak,
      ...searchFormsForLemma(entry.slovak, entry.category, entry.gender),
    ];
    for (const form of forms) {
      const key = lower(form);
      if (better(candidate, index.get(key))) index.set(key, candidate);
    }
    const head = headwords.get(lower(entry.slovak));
    if (!head || better(candidate, head)) headwords.set(lower(entry.slovak), candidate);
  }
  return index;
}

/**
 * Build-time only (it expands every dictionary lemma). Unknown words come back
 * as "other": they still count, under vocabulary, but name no grammar topic.
 */
export function tagWord(surface: string): WordTag {
  const word = lower(surface);
  if (FUNCTION_WORDS.has(word) || QUANTIFIER.test(word)) return { class: "functionWord" };
  if (NUMBER.test(word)) return { class: "other", topic: "numbers-and-numerals" };

  const verbTopic = VERB_TOPICS.get(word);
  if (verbTopic) return { class: "verb", ...verbTopic };

  pronounIndex ??= buildPronounIndex();
  const pronoun = pronounIndex.get(word);
  if (pronoun) {
    return {
      class: "functionWord",
      lemma: pronoun.lemma,
      ...(pronoun.topic ? { topic: pronoun.topic } : {}),
      cases: pronoun.cases,
    };
  }

  dictionaryIndex ??= buildDictionaryIndex();
  const head = headwords?.get(word);
  if (head === null) return { class: "other" };
  const entry = head ?? dictionaryIndex.get(word);
  if (entry) return { class: entry.class, lemma: entry.lemma, slug: entry.slug };

  return { class: "other" };
}
