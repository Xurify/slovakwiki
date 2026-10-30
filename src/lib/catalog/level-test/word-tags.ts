import { words } from "../dictionary/words";
import { pronounLemmas } from "../search/pronouns";
import { formsVerified, searchFormsForLemma } from "../search/forms";
import type { GrammaticalCase, WordClass, WordTag } from "$lib/level-test/types";

/**
 * Slovak's neplnovýznamové slová: prepositions, conjunctions and particles,
 * plus the clitics sa and si. They never inflect, so one list covers them.
 */
const FUNCTION_WORDS = new Set(
  [
    "bez cez do k ku kvôli medzi na nad o od odo okolo okrem oproti po pod podľa počas",
    "pre pred pri proti s so u v vďaka vedľa vo z za zo",
    "a aby ak ako ale alebo ani až či i keď kým lebo než no pretože preto teda však že",
    "aj asi by iba len nech nie tiež už ešte veď",
    "sa si",
  ]
    .join(" ")
    .split(" "),
);

/** Question, relative and indefinite pronouns, which decline like the rest. */
const OTHER_PRONOUN =
  /^(?:kto|čo|koho|komu|čom|čím|niečo|nič|ničím|ničoho|niekto|niekoho|nikto|nikoho|nikomu|všetko|všetci|všetky|všetka|všetku)$|^(?:ktor|každ|niektor|mnoh|žiadn|nijak|všetk|ak|tak|in)(?:ý|á|é|í|ého|ej|ému|om|ú|ou|ých|ým|ými)$/u;

const NUMBER =
  /^(?:jeden|jedna|jedno|dva|dve|tri|štyri|päť|šesť|sedem|osem|deväť|desať|\p{L}+násť|dvadsať|tridsať|štyridsať|\p{L}+desiat|sto|tisíc)$|^(?:prv|druh|štvrt|piat|šiest|siedm|ôsm|deviat|desiat)(?:ý|á|é|í|ej|ého|ému|om|ou|ú|ých|ým|ými)$|^(?:piat|šiest|siedm|ôsm|deviat|desiat)(?:y|a|e|eho|emu|u|ych|ym|ymi)$|^tret(?:í|ieho|iemu|ia|ie|iu|ej|ích|ím|ími)$|^treť(?:om|ou)$|^(?:dvaja|traja|štyria)$|^(?:dv|tr)(?:och|om|oma|omi)$|^štyr(?:och|om|mi)$|^(?:piat|šiest|siedm|ôsm|deviat|desiat|\p{L}+nást|dvadsiat|tridsiat|štyridsiat|\p{L}+desiat)(?:ich|im|imi)$|^jedn(?:ého|ej|ému|om|ým|ou|u)$|^ob(?:a|e|aja|idva|idve|idvaja|och|om|oma)$/u;

/**
 * Adverbs that look like a noun (málo, a small amount, is the rarer reading)
 * or end like an adjective (predtým).
 */
const ADVERBS = new Set(["málo", "predtým", "potým", "medzitým", "zatým"]);

/**
 * Verb forms spelled like a noun form, read as the verb after the clitic sa or
 * si: "na ulici sa zdravia" (they greet each other), not the genitive of zdravie.
 */
const REFLEXIVE_VERB_FORMS = new Map<string, string>([["zdravia", "zdraviť"]]);

/** Comparative stems that do not come from the positive by adding -ší. */
const COMPARATIVE_BASES = new Map<string, string>([
  ["lepš", "dobrý"],
  ["horš", "zlý"],
  ["väčš", "veľký"],
  ["menš", "malý"],
  ["krajš", "pekný"],
  ["vyšš", "vysoký"],
  ["nižš", "nízky"],
  ["hlbš", "hlboký"],
  ["širš", "široký"],
  ["užš", "úzky"],
  ["kratš", "krátky"],
  ["bližš", "blízky"],
  ["ľahš", "ľahký"],
  ["ťažš", "ťažký"],
  ["sladš", "sladký"],
  ["tenš", "tenký"],
]);

/** naj-, then a comparative in -ší or -ejší with a soft adjective ending. */
const COMPARATIVE =
  /^(?:naj)?(\p{L}+?(?:ejš|š))(?:í|ia|ie|ieho|iemu|iu|ej|om|ou|ích|ím|ími)$/u;

/**
 * Endings only adjectives (and participles) take, for words the dictionary
 * lacks: -ý, -é, -ého… and, after a long syllable, the shortened -ny, -ne…
 */
const ADJECTIVE_ENDING =
  /^\p{L}{2,}(?:ý|é|ého|ému|ých|ým|ými)$|(?:[áéíóúýô]|i[aeu])[^aeiouyáéíóúýôä]*n(?:y|e|eho|emu|ych|ym|ymi)$/u;

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
  /** A place or other name: its forms are capitalised, never a plain word. */
  proper: boolean;
}

let pronounIndex: Map<string, PronounForm> | undefined;
let dictionaryIndex: Map<string, DictionaryForm> | undefined;
/** Headwords of every category, so "potom" stays an adverb, not a form of "pot". */
let headwords: Map<string, DictionaryForm | null> | undefined;
let slugForms: Map<string, { entry: DictionaryForm; forms: Set<string> }> | undefined;

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
  slugForms = new Map();
  for (const entry of words) {
    const wordClass = CLASS_FOR_CATEGORY[entry.category];
    if (!wordClass) {
      if (!headwords.has(lower(entry.slovak))) headwords.set(lower(entry.slovak), null);
      if (entry.category === "Adverbs") {
        const candidate: DictionaryForm = {
          slug: entry.slug,
          lemma: entry.slovak,
          class: "other",
          verified: false,
          rank: entry.frequency?.rank ?? Number.MAX_SAFE_INTEGER,
          proper: false,
        };
        slugForms.set(entry.slug, {
          entry: candidate,
          forms: new Set([lower(entry.slovak)]),
        });
      }
      continue;
    }
    const candidate: DictionaryForm = {
      slug: entry.slug,
      lemma: entry.slovak,
      class: wordClass,
      verified: formsVerified(entry.slovak, entry.category, entry.gender),
      rank: entry.frequency?.rank ?? Number.MAX_SAFE_INTEGER,
      proper: entry.category === "Places" || /^\p{Lu}/u.test(entry.slovak),
    };
    const forms = [
      entry.slovak,
      ...searchFormsForLemma(entry.slovak, entry.category, entry.gender),
    ];
    for (const form of forms) {
      const key = lower(form);
      if (better(candidate, index.get(key))) index.set(key, candidate);
    }
    slugForms.set(entry.slug, { entry: candidate, forms: new Set(forms.map(lower)) });
    const head = headwords.get(lower(entry.slovak));
    if (!head || better(candidate, head)) headwords.set(lower(entry.slovak), candidate);
  }
  return index;
}

function lookup(word: string): DictionaryForm | null | undefined {
  dictionaryIndex ??= buildDictionaryIndex();
  const head = headwords?.get(word);
  if (head === null) return null;
  return head ?? dictionaryIndex.get(word);
}

function adjectiveLemma(lemma: string): { lemma: string; slug?: string } {
  const entry = lookup(lemma);
  return entry?.class === "adjective" && entry.lemma === lemma
    ? { lemma, slug: entry.slug }
    : { lemma };
}

/** Adjective readings the lookup misses: an adverb's adjective twin, comparatives, negations, participles. */
function adjectiveFallback(word: string): WordTag | undefined {
  const asAdverb = lookup(word) === null ? dictionaryIndex?.get(word) : undefined;
  if (asAdverb?.class === "adjective") {
    return { class: "adjective", lemma: asAdverb.lemma, slug: asAdverb.slug };
  }
  const comparative = COMPARATIVE.exec(word)?.[1];
  if (comparative) {
    const irregular = COMPARATIVE_BASES.get(comparative);
    if (irregular) return { class: "adjective", ...adjectiveLemma(irregular) };
    const stem = comparative.replace(/(?:ejš|š)$/u, "");
    for (const base of [`${stem}ý`, `${stem}y`]) {
      if (lookup(base)?.class === "adjective") {
        return { class: "adjective", ...adjectiveLemma(base) };
      }
    }
    if (comparative.endsWith("ejš")) return { class: "adjective" };
  }
  if (word.startsWith("ne") && lookup(word.slice(2))?.class === "adjective") {
    return { class: "adjective" };
  }
  if (ADJECTIVE_ENDING.test(word)) return { class: "adjective" };
  return undefined;
}

export interface TagContext {
  /** The word before, as written. */
  previous?: string;
  /** The word after, as written. */
  next?: string;
  /** The dictionary entry an item was built from, which beats a homograph's. */
  slug?: string;
}

/**
 * Build-time only (it expands every dictionary lemma). Unknown words come back
 * as "other": they still count, under vocabulary, but name no grammar topic.
 */
export function tagWord(surface: string, context: TagContext = {}): WordTag {
  const word = lower(surface);
  if (FUNCTION_WORDS.has(word)) return { class: "functionWord" };
  if (ADVERBS.has(word)) return { class: "other" };
  if (OTHER_PRONOUN.test(word)) return { class: "pronoun" };
  if (NUMBER.test(word)) return { class: "numeral", topic: "numbers-and-numerals" };

  const previous = context.previous ? lower(context.previous) : undefined;
  const reflexive = REFLEXIVE_VERB_FORMS.get(word);
  if (reflexive && (previous === "sa" || previous === "si")) {
    return { class: "verb", lemma: reflexive };
  }

  const verbTopic = VERB_TOPICS.get(word);
  if (verbTopic) return { class: "verb", ...verbTopic };

  pronounIndex ??= buildPronounIndex();
  const pronoun = pronounIndex.get(word);
  if (pronoun) {
    return {
      class: "pronoun",
      lemma: pronoun.lemma,
      ...(pronoun.topic ? { topic: pronoun.topic } : {}),
      cases: pronoun.cases,
    };
  }

  dictionaryIndex ??= buildDictionaryIndex();
  const fromSlug = context.slug ? slugForms?.get(context.slug) : undefined;
  if (fromSlug?.forms.has(word)) {
    const { entry } = fromSlug;
    return { class: entry.class, lemma: entry.lemma, slug: entry.slug };
  }

  const entry = lookup(word);
  if (entry) return { class: entry.class, lemma: entry.lemma, slug: entry.slug };

  // In -e an adverb and the neuter or plural of its adjective look alike:
  // "nižšie úrody" but "na adresu nižšie". Only a noun after it (or a word the
  // dictionary lacks, mostly nouns: plodiny) makes it the adjective, and an
  // adjective only when it agrees in -e or -é ("hlbšie názorové rozdiely", not
  // "mimoriadne dôležitý").
  const adjective = adjectiveFallback(word);
  if (!adjective) return { class: "other" };
  if (!word.endsWith("e")) return adjective;
  const next = context.next ? lower(context.next) : undefined;
  const nextClass = next ? tagWord(next).class : undefined;
  const agrees = nextClass === "adjective" && /[eé]$/u.test(next ?? "");
  const unknown =
    nextClass === "other" &&
    next !== undefined &&
    lookup(next) !== null &&
    !adjectiveFallback(next);
  const beforeNoun = nextClass === "noun" || unknown;
  return beforeNoun || agrees ? adjective : { class: "other" };
}

/**
 * A plain Slovak word as written in lower case: a dictionary word, one of its
 * forms, or a function word. Names (Nemecka, Číny) and stray spellings are not.
 */
export function isCommonWord(surface: string): boolean {
  const word = lower(surface);
  if (FUNCTION_WORDS.has(word) || OTHER_PRONOUN.test(word) || NUMBER.test(word))
    return true;
  if (VERB_TOPICS.has(word)) return true;
  pronounIndex ??= buildPronounIndex();
  if (pronounIndex.has(word)) return true;
  dictionaryIndex ??= buildDictionaryIndex();
  const head = headwords?.get(word);
  if (head === null) return true;
  const entry = head ?? dictionaryIndex.get(word);
  return entry !== undefined && !entry.proper;
}
