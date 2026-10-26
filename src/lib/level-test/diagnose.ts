import { estimateAbility, type Observation } from "./estimate";
import { foldDiacritics, normalizeTyped, tokenizeWords } from "./grade";
import {
  SCALE_POINTS_PER_LOGIT,
  cefrForScore,
  clampScale,
  probabilityCorrect,
  type CefrLevel,
} from "./scale";
import { AREA_MINIMUM, areaForTag } from "./areas";
import type {
  AiIssue,
  AiIssueTopic,
  GrammaticalCase,
  ItemResponse,
  ProductionRecord,
  StepKind,
  StudyArea,
  TestMode,
  WordTag,
} from "./types";

export type AreaGroup =
  | "vocabulary"
  | "declension"
  | "conjugation"
  | "aspect"
  | "wordOrder"
  | "functionWords"
  | "spelling"
  | "pronunciation";

/**
 * Everything a Slovak learner is expected to master (CEFR: vocabulary range,
 * grammatical accuracy, orthographic and phonological control), whether or not
 * this test measures it yet: an area the test cannot reach is shown as such,
 * not hidden. Reading, listening, writing and speaking are skills, scored above.
 */
export const AREA_GROUPS: readonly {
  id: AreaGroup;
  label: string;
  slovak: string;
  areas: readonly StudyArea[];
}[] = [
  {
    id: "vocabulary",
    label: "Vocabulary",
    slovak: "slovná zásoba",
    areas: ["vocabulary"],
  },
  {
    id: "declension",
    label: "Declension",
    slovak: "skloňovanie",
    areas: ["nouns", "adjectives", "pronouns", "numerals"],
  },
  {
    id: "conjugation",
    label: "Conjugation",
    slovak: "časovanie",
    areas: ["conjugation"],
  },
  { id: "aspect", label: "Aspect", slovak: "vid", areas: ["aspect"] },
  { id: "wordOrder", label: "Word order", slovak: "slovosled", areas: ["wordOrder"] },
  {
    id: "functionWords",
    label: "Function words",
    slovak: "neplnovýznamové slová",
    areas: ["functionWords"],
  },
  { id: "spelling", label: "Spelling", slovak: "pravopis", areas: ["spelling"] },
  {
    id: "pronunciation",
    label: "Pronunciation",
    slovak: "výslovnosť",
    areas: ["vowelLength", "intelligibility"],
  },
];

export const STUDY_AREA_INFO: Record<
  StudyArea,
  { label: string; slovak: string; what: string }
> = {
  vocabulary: {
    label: "Vocabulary",
    slovak: "slovná zásoba",
    what: "knowing which words are real Slovak, and which word a sentence needs",
  },
  nouns: {
    label: "Noun cases",
    slovak: "pády podstatných mien",
    what: "case and number endings on nouns",
  },
  adjectives: {
    label: "Adjective agreement",
    slovak: "zhoda prídavných mien",
    what: "adjective endings that match their noun's gender, number and case",
  },
  pronouns: {
    label: "Pronouns",
    slovak: "zámená",
    what: "the forms of ten, môj, ktorý, každý and the personal pronouns",
  },
  numerals: {
    label: "Numbers",
    slovak: "číslovky",
    what: "numbers and ordinals, and the forms they take",
  },
  conjugation: {
    label: "Conjugation",
    slovak: "časovanie",
    what: "verb endings for person, number and tense, and for gender in the past (odišiel, odišla)",
  },
  aspect: {
    label: "Aspect",
    slovak: "vid",
    what: "choosing robiť or urobiť: an action in progress or a finished one",
  },
  wordOrder: {
    label: "Word order",
    slovak: "slovosled",
    what: "where sa, si, som and the other short words go in a sentence",
  },
  functionWords: {
    label: "Function words",
    slovak: "neplnovýznamové slová",
    what: "prepositions, conjunctions and particles such as nie, aj and len, and sa or si",
  },
  spelling: {
    label: "Spelling",
    slovak: "pravopis",
    what: "long vowels, háčeks, ä and ô, and i or y",
  },
  vowelLength: {
    label: "Hearing vowel length",
    slovak: "dĺžka samohlások",
    what: "hearing short and long vowels apart, as in mala and malá",
  },
  intelligibility: {
    label: "Being understood",
    slovak: "zrozumiteľnosť",
    what: "how much of what you said aloud speech recognition understood",
  },
};

/**
 * Tasks whose answers the AI scorer reads for each point of grammar it sees
 * used; Interactive Listening ends with a written summary.
 */
const WRITTEN: readonly StepKind[] = [
  "interactiveListening",
  "writePhoto",
  "interactiveWriting",
  "writingSample",
];
const FREE_PRODUCTION: readonly StepKind[] = [
  ...WRITTEN,
  "speakPhoto",
  "readThenSpeak",
  "speakingSample",
];

/** The test tasks that give evidence for each area; empty means no task does yet. */
export const AREA_SOURCES: Record<StudyArea, readonly StepKind[]> = {
  vocabulary: [
    "readSelect",
    "listenSelect",
    "fillBlank",
    "readComplete",
    "listenType",
    "interactiveReading",
    ...FREE_PRODUCTION,
  ],
  nouns: [
    "fillBlank",
    "readComplete",
    "listenType",
    "interactiveReading",
    ...FREE_PRODUCTION,
  ],
  adjectives: [
    "fillBlank",
    "readComplete",
    "listenType",
    "interactiveReading",
    ...FREE_PRODUCTION,
  ],
  pronouns: ["fillBlank", "readComplete", "listenType", "interactiveReading"],
  numerals: ["fillBlank", "readComplete", "listenType", "interactiveReading"],
  conjugation: [
    "fillBlank",
    "readComplete",
    "listenType",
    "interactiveReading",
    ...FREE_PRODUCTION,
  ],
  aspect: ["chooseVerb", "interactiveReading", ...FREE_PRODUCTION],
  wordOrder: ["placeClitic", "interactiveReading", ...FREE_PRODUCTION],
  functionWords: [
    "fillBlank",
    "readComplete",
    "listenType",
    "interactiveReading",
    ...FREE_PRODUCTION,
  ],
  spelling: ["fillBlank", "readComplete", "listenType", ...WRITTEN],
  vowelLength: ["listenLength"],
  intelligibility: ["readAloud"],
};

/** Fewer answers than this and an area says more about luck than about the learner. */
export const MIN_EVIDENCE = AREA_MINIMUM;

/** The least an area must sit from the overall score to count as a strength or a gap. */
export const DELTA_THRESHOLD = 5;

/**
 * Beyond the floor, an area must sit this many of its own posterior SDs from
 * the overall score: with three answers 2 of 3 right at the learner's level is
 * noise, while three misses there are not.
 */
export const DELTA_SE = 1.2;

/** One miss in a handful is a slip, not a gap, however hard the item was. */
export const MIN_GAP_MISSES = 2;

/**
 * Each area starts at the learner's overall level. With sd 15, three misses
 * pull it down about a band; a single slip barely moves it.
 */
const AREA_PRIOR_SD = 15;

export type AccentSlipKind = "long" | "hacek" | "aeo" | "iy" | "extra";

export const ACCENT_SLIP_INFO: Record<
  AccentSlipKind,
  { label: string; link: StudyLink }
> = {
  long: {
    label: "Long vowels: á, é, í, ó, ú, ý",
    link: { label: "Vowel length", href: "/pronunciation/vowel-length" },
  },
  hacek: {
    label: "Háček letters: č, š, ž, ď, ť, ň, ľ",
    link: { label: "Soft consonants", href: "/pronunciation/soft-consonants" },
  },
  aeo: {
    label: "ä and ô",
    link: { label: "The Slovak alphabet", href: "/pronunciation/slovak-alphabet" },
  },
  iy: {
    label: "i or y",
    link: { label: "Soft consonants", href: "/pronunciation/soft-consonants" },
  },
  extra: {
    label: "Accents where none belong",
    link: { label: "Vowel length", href: "/pronunciation/vowel-length" },
  },
};

export interface StudyLink {
  label: string;
  href: string;
}

export interface AreaSummary {
  area: StudyArea;
  score: number;
  level: CefrLevel;
  /** Share of the available credit earned, 0–100; dictations give partial credit. */
  percent: number;
  total: number;
  /** Area score minus the overall score. */
  delta: number;
  /** Credit earned minus the credit expected at the overall level. */
  surplus: number;
  /** Posterior SD of the area's score. */
  se: number;
  /** Answers not fully right. */
  misses: number;
}

export interface Example {
  expected: string;
  given: string;
  /** Chosen from options rather than typed. */
  picked?: boolean;
  /** "dieťa", "byť", "ten (instrumental)": what the word is, when we know. */
  note?: string;
  href?: string;
}

export interface AccentSlip {
  kind: AccentSlipKind;
  count: number;
  examples: Example[];
}

export interface WordToLearn {
  text: string;
  english?: string;
  href?: string;
}

export type AreaStatus =
  | { kind: "measured"; summary: AreaSummary }
  /** Some answers, too few to judge. */
  | { kind: "thin"; count: number }
  /** A task exists for it but did not run or got no answer this time. */
  | { kind: "skipped"; reason: string }
  /** No task in the test measures it yet. */
  | { kind: "untested" };

export interface AreaResult {
  area: StudyArea;
  status: AreaStatus;
}

export interface GroupResult {
  group: AreaGroup;
  /** The group's own estimate, from all its areas' answers together. */
  status: AreaStatus;
  areas: AreaResult[];
}

export interface Gap {
  area: StudyArea;
  /** Null when only the AI's notes on writing or speaking point here. */
  summary: AreaSummary | null;
  examples: Example[];
  links: StudyLink[];
}

/** What ran, so an unmeasured area can say why. */
export interface RunContext {
  stepKinds: ReadonlySet<string>;
  mode: TestMode;
  microphone: boolean;
  transcription: boolean;
}

export interface Diagnosis {
  center: number;
  groups: GroupResult[];
  strengths: AreaSummary[];
  gaps: Gap[];
  accentSlips: AccentSlip[];
  wordsToLearn: WordToLearn[];
  /** Made-up words the learner took for real ones. */
  fakeWordsAccepted: number;
}

const LETTER_KINDS = new Set(["fillBlank", "readComplete"]);
const LONG = new Set([..."áéíóúýĺŕ"]);
const HACEK = new Set([..."čšžďťňľ"]);

const ISSUE_AREA: Record<AiIssueTopic, StudyArea> = {
  nounEndings: "nouns",
  adjectiveAgreement: "adjectives",
  verbForms: "conjugation",
  aspect: "aspect",
  functionWords: "functionWords",
  wordOrder: "wordOrder",
  accents: "spelling",
  vocabulary: "vocabulary",
};

const CASE_PAGE: Record<GrammaticalCase, string> = {
  nominative: "/grammar/cases/nominative",
  genitive: "/grammar/cases/genitive",
  dative: "/grammar/cases/dative",
  accusative: "/grammar/cases/accusative",
  locative: "/grammar/cases/locative",
  instrumental: "/grammar/cases/instrumental",
};

const TOPIC_LINKS: Record<string, StudyLink[]> = {
  "byt-present": [
    { label: "Byť: to be", href: "/grammar/byt-present" },
    { label: "Lesson: byť", href: "/lessons/grammar/byt-present" },
  ],
  "mat-present": [
    { label: "Mať: to have", href: "/grammar/mat-present" },
    { label: "Lesson: mať", href: "/lessons/grammar/mat-present" },
  ],
  demonstratives: [
    { label: "Ten, tento, tamten", href: "/grammar/demonstratives" },
    { label: "Lesson: ten, tento, tamten", href: "/lessons/grammar/demonstratives" },
  ],
  possessives: [
    { label: "Môj, jeho, svoj", href: "/grammar/possessives" },
    { label: "Lesson: possessives", href: "/lessons/grammar/possessives" },
  ],
  "numbers-and-numerals": [
    { label: "Numbers and numerals", href: "/grammar/numbers-and-numerals" },
  ],
  aspect: [{ label: "Aspect: robiť or urobiť", href: "/grammar/aspect" }],
  wordOrder: [{ label: "Word order", href: "/grammar/word-order" }],
};

const AREA_LINKS: Record<StudyArea, StudyLink[]> = {
  vocabulary: [
    { label: "The most common nouns", href: "/dictionary/common/noun" },
    { label: "The most common verbs", href: "/dictionary/common/verb" },
  ],
  nouns: [
    { label: "The six cases", href: "/grammar/cases-overview" },
    { label: "Grammatical gender", href: "/grammar/grammatical-gender" },
  ],
  adjectives: [
    { label: "Grammatical gender", href: "/grammar/grammatical-gender" },
    { label: "The most common adjectives", href: "/dictionary/common/adjective" },
  ],
  pronouns: [
    { label: "Ten, tento, tamten", href: "/grammar/demonstratives" },
    { label: "Môj, jeho, svoj", href: "/grammar/possessives" },
  ],
  numerals: [
    { label: "Numbers and numerals", href: "/grammar/numbers-and-numerals" },
    { label: "Lesson: numbers", href: "/lessons/everyday/numbers-and-personal-details" },
  ],
  conjugation: [
    { label: "Present tense", href: "/grammar/present-tense" },
    { label: "Lesson: present-tense endings", href: "/lessons/grammar/present-tense-i" },
    { label: "Practice: present-tense endings", href: "/practice/present-tense-i" },
  ],
  aspect: [{ label: "Aspect: robiť or urobiť", href: "/grammar/aspect" }],
  wordOrder: [{ label: "Word order", href: "/grammar/word-order" }],
  functionWords: [
    { label: "Word order", href: "/grammar/word-order" },
    { label: "Negation", href: "/grammar/negation" },
  ],
  spelling: [
    { label: "Vowel length", href: "/pronunciation/vowel-length" },
    { label: "The Slovak alphabet", href: "/pronunciation/slovak-alphabet" },
  ],
  vowelLength: [
    { label: "Vowel length", href: "/pronunciation/vowel-length" },
    { label: "The Slovak alphabet", href: "/pronunciation/slovak-alphabet" },
  ],
  intelligibility: [
    { label: "First-syllable stress", href: "/pronunciation/first-syllable-stress" },
    { label: "Vowel length", href: "/pronunciation/vowel-length" },
    { label: "Soft consonants", href: "/pronunciation/soft-consonants" },
  ],
};

function isTyped(response: ItemResponse): response is ItemResponse & {
  expected: string;
  given: string;
} {
  return typeof response.expected === "string" && typeof response.given === "string";
}

function fold(value: string): string {
  return foldDiacritics(normalizeTyped(value));
}

/**
 * Letter gaps judged on the letters alone, i and y aside, so a missing háček or
 * a wrong i counts under spelling, not grammar.
 */
function areaScore(response: ItemResponse): number {
  if (isTyped(response) && LETTER_KINDS.has(response.kind)) {
    return toIy(fold(response.expected)) === toIy(fold(response.given)) ? 1 : 0;
  }
  return response.score;
}

function slipKind(expected: string, given: string): AccentSlipKind | null {
  if (expected === given) return null;
  if (LONG.has(expected) && foldDiacritics(expected) === given) return "long";
  if (HACEK.has(expected)) return "hacek";
  if (expected === "ä" || expected === "ô") return "aeo";
  if (foldDiacritics(given) === expected) return "extra";
  if (LONG.has(expected)) return "long";
  return null;
}

function toIy(value: string): string {
  return value.replace(/y/gu, "i");
}

interface WordCheck {
  /** Null when this word says nothing about accents or i/y. */
  right: boolean | null;
  slips: AccentSlipKind[];
}

/** Accents and i/y on one word the learner otherwise got right. */
function checkWord(expected: string, given: string): WordCheck {
  const foldedExpected = foldDiacritics(expected);
  const foldedGiven = foldDiacritics(given);
  const hasMarks = expected !== foldedExpected || given !== foldedGiven;

  if (foldedExpected === foldedGiven) {
    if (!hasMarks) return { right: null, slips: [] };
    if (expected === given) return { right: true, slips: [] };
    const givenChars = [...given];
    const slips = [...expected]
      .map((char, index) => slipKind(char, givenChars[index] ?? ""))
      .filter((kind): kind is AccentSlipKind => kind !== null);
    return { right: false, slips: slips.length ? slips : ["long"] };
  }

  if (toIy(foldedExpected) === toIy(foldedGiven)) return { right: false, slips: ["iy"] };
  return { right: null, slips: [] };
}

interface WordPair {
  expected: string;
  given: string;
}

interface MatchedWord extends WordPair {
  /** The letters the learner typed, when part of the word was printed for them. */
  typed?: WordPair;
}

/**
 * A letter gap prints the first half of the word (the C-test rule in ctest.ts
 * and the bank build), so its accents are the learner's only in the rest.
 */
function typedPart(expected: string, given: string): WordPair | null {
  const letters = [...expected];
  const printed = letters.slice(0, Math.floor(letters.length / 2)).join("");
  if (!given.startsWith(printed)) return null;
  return { expected: expected.slice(printed.length), given: given.slice(printed.length) };
}

/** Word pairs where the learner wrote the same word, accents and i/y aside. */
function matchedWords(response: ItemResponse & WordPair): MatchedWord[] {
  if (LETTER_KINDS.has(response.kind)) {
    const expected = normalizeTyped(response.expected);
    const given = normalizeTyped(response.given);
    if (!given) return [];
    const typed = typedPart(expected, given);
    return [{ expected, given, ...(typed ? { typed } : {}) }];
  }

  const unused = tokenizeWords(response.given);
  const pairs: WordPair[] = [];
  for (const word of tokenizeWords(response.expected)) {
    const index = unused.findIndex(
      (candidate) => toIy(foldDiacritics(candidate)) === toIy(foldDiacritics(word)),
    );
    if (index === -1) continue;
    pairs.push({ expected: word, given: unused[index] ?? "" });
    unused.splice(index, 1);
  }
  return pairs;
}

interface AccentEvidence {
  observations: Observation[];
  slips: Map<AccentSlipKind, AccentSlip>;
}

function accentEvidence(responses: readonly ItemResponse[]): AccentEvidence {
  const observations: Observation[] = [];
  const slips = new Map<AccentSlipKind, AccentSlip>();

  for (const response of responses) {
    if (!isTyped(response)) continue;
    let judged = 0;
    let right = 0;
    for (const { typed, ...pair } of matchedWords(response)) {
      const check = checkWord(
        typed?.expected ?? pair.expected,
        typed?.given ?? pair.given,
      );
      if (check.right === null) continue;
      judged += 1;
      if (check.right) right += 1;
      for (const kind of new Set(check.slips)) {
        const slip = slips.get(kind) ?? { kind, count: 0, examples: [] };
        slip.count += 1;
        const known = slip.examples.some((example) => example.expected === pair.expected);
        if (!known && slip.examples.length < 3) slip.examples.push({ ...pair });
        slips.set(kind, slip);
      }
    }
    if (judged > 0) {
      observations.push({ difficulty: response.difficulty, score: right / judged });
    }
  }

  return { observations, slips };
}

interface DictationArea {
  observations: Observation[];
  missedTags: WordTag[];
  examples: Example[];
}

/** Shares most of its letters with the wanted word: the same word with another ending. */
function sameStem(expected: string, given: string): boolean {
  const a = toIy(foldDiacritics(expected));
  const b = toIy(foldDiacritics(given));
  let prefix = 0;
  while (prefix < a.length && a[prefix] === b[prefix]) prefix += 1;
  return prefix >= 3 && prefix >= a.length - 3 && Math.abs(a.length - b.length) <= 3;
}

/**
 * Listen and Type, word by word: each word of the sentence is evidence for its
 * own area, one observation per area per sentence so a long sentence does not
 * outweigh a C-test gap. Accents and i/y are left to spelling.
 */
function dictationEvidence(
  responses: readonly ItemResponse[],
): Map<StudyArea, DictationArea> {
  const byArea = new Map<StudyArea, DictationArea>();

  for (const response of responses) {
    if (!isTyped(response) || !response.wordTags) continue;
    const words = tokenizeWords(response.expected);
    if (words.length !== response.wordTags.length) continue;

    const unused = tokenizeWords(response.given);
    const tally = new Map<StudyArea, { right: number; total: number }>();

    words.forEach((word, index) => {
      const tag = response.wordTags?.[index] ?? { class: "other" };
      const area = areaForTag(tag);
      const counts = tally.get(area) ?? { right: 0, total: 0 };
      counts.total += 1;
      tally.set(area, counts);

      const exact = unused.findIndex(
        (candidate) => toIy(foldDiacritics(candidate)) === toIy(foldDiacritics(word)),
      );
      if (exact !== -1) {
        counts.right += 1;
        unused.splice(exact, 1);
        return;
      }

      const entry = byArea.get(area) ?? {
        observations: [],
        missedTags: [],
        examples: [],
      };
      entry.missedTags.push(tag);
      const near = unused.findIndex((candidate) => sameStem(word, candidate));
      if (near !== -1) {
        entry.examples.push({
          expected: word,
          given: unused[near] ?? "",
          ...(noteFor(tag) ? { note: noteFor(tag) } : {}),
          ...(tag.slug ? { href: `/dictionary/${tag.slug}` } : {}),
        });
        unused.splice(near, 1);
      }
      byArea.set(area, entry);
    });

    for (const [area, counts] of tally) {
      const entry = byArea.get(area) ?? {
        observations: [],
        missedTags: [],
        examples: [],
      };
      entry.observations.push({
        difficulty: response.difficulty,
        score: counts.right / counts.total,
      });
      byArea.set(area, entry);
    }
  }

  return byArea;
}

function noteFor(tag: WordTag | undefined): string | undefined {
  if (!tag?.lemma) return undefined;
  if (tag.cases?.length) return `${tag.lemma}, ${tag.cases.join(" or ")}`;
  return tag.lemma;
}

function exampleFor(response: ItemResponse): Example | null {
  if (response.choice) {
    return {
      expected: response.choice.expected,
      given: response.choice.given,
      picked: true,
      ...(response.choice.why ? { note: response.choice.why } : {}),
    };
  }
  if (!isTyped(response)) return null;
  const given = response.given.trim();
  return {
    expected: response.expected,
    given,
    ...(noteFor(response.tag) ? { note: noteFor(response.tag) } : {}),
    ...(response.tag?.slug ? { href: `/dictionary/${response.tag.slug}` } : {}),
  };
}

function uniqueExamples(examples: readonly Example[]): Example[] {
  const seen = new Set<string>();
  return examples.filter((example) => {
    const key = normalizeTyped(example.expected);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function uniqueLinks(links: readonly StudyLink[]): StudyLink[] {
  const seen = new Set<string>();
  return links.filter((link) => {
    if (seen.has(link.href)) return false;
    seen.add(link.href);
    return true;
  });
}

/** The pages that teach what the misses have in common, most specific first. */
function linksFor(
  area: StudyArea,
  missedTags: readonly WordTag[],
  issues: readonly AiIssue[],
  slips: readonly AccentSlip[],
): StudyLink[] {
  const specific: StudyLink[] = [];

  for (const tag of missedTags) {
    const topic = tag.topic;
    if (topic && TOPIC_LINKS[topic]) specific.push(...TOPIC_LINKS[topic]);
    for (const grammaticalCase of tag.cases ?? []) {
      if (grammaticalCase === "nominative") continue;
      const name = grammaticalCase[0]?.toUpperCase() + grammaticalCase.slice(1);
      specific.push({ label: `${name} case`, href: CASE_PAGE[grammaticalCase] });
    }
  }
  for (const issue of issues) {
    if (issue.topic === "aspect") specific.push(...(TOPIC_LINKS.aspect ?? []));
    if (issue.topic === "wordOrder") specific.push(...(TOPIC_LINKS.wordOrder ?? []));
  }
  if (area === "spelling") {
    for (const slip of slips) specific.push(ACCENT_SLIP_INFO[slip.kind].link);
  }

  return uniqueLinks([...specific, ...AREA_LINKS[area]]).slice(0, 4);
}

function wordsToLearn(responses: readonly ItemResponse[]): WordToLearn[] {
  const seen = new Set<string>();
  const missed: WordToLearn[] = [];
  for (const response of responses) {
    const word = response.word;
    if (!word?.real || response.score >= 1 || seen.has(word.text)) continue;
    seen.add(word.text);
    missed.push({
      text: word.text,
      ...(word.english ? { english: word.english } : {}),
      ...(word.slug ? { href: `/dictionary/${word.slug}` } : {}),
    });
  }
  return missed.slice(0, 10);
}

/**
 * A part is at the answer's level when about 85% of its uses are right, CEFR's
 * "good control" with occasional slips; at 50% a writer who gets 60–80% of
 * their endings right would look strong.
 */
const PRODUCTION_ACCURACY = 0.85;

const PRODUCTION_OFFSET =
  SCALE_POINTS_PER_LOGIT * Math.log(PRODUCTION_ACCURACY / (1 - PRODUCTION_ACCURACY));

/**
 * Writing and speaking, as the AI scorer counted them: one observation per
 * answer and area, at the level that answer was written or spoken at, so a
 * long essay does not outweigh the short tasks.
 */
function productionEvidence(
  production: readonly ProductionRecord[],
): Map<StudyArea, Observation[]> {
  const byArea = new Map<StudyArea, Observation[]>();
  for (const record of production) {
    const result = record.status === "scored" ? record.result : undefined;
    if (!result?.usage) continue;
    for (const [topic, usage] of Object.entries(result.usage)) {
      const total = (usage?.right ?? 0) + (usage?.wrong ?? 0);
      if (!usage || total === 0) continue;
      const area = ISSUE_AREA[topic as AiIssueTopic];
      byArea.set(area, [
        ...(byArea.get(area) ?? []),
        { difficulty: result.score - PRODUCTION_OFFSET, score: usage.right / total },
      ]);
    }
  }
  return byArea;
}

/** Why an area with a task behind it got no evidence in this run. */
function skippedReason(area: StudyArea, run: RunContext): string {
  const sources = AREA_SOURCES[area];
  if (sources.some((kind) => run.stepKinds.has(kind))) return "No answers this time.";
  if (run.mode === "quick") return "Not part of the quick test.";
  if (sources.includes("readAloud")) {
    if (!run.transcription) return "Needs speech recognition, not set up yet.";
    if (!run.microphone) return "Needs a microphone.";
  }
  return "Not part of this run.";
}

function summarize(
  area: StudyArea,
  observations: readonly Observation[],
  center: number,
): AreaSummary {
  const prior = { mean: center, sd: AREA_PRIOR_SD };
  const estimate = estimateAbility(observations, prior);
  // Near 0 or 100 the scale cuts off half the prior, which alone pulls an
  // estimate about 12 points inward; measure the move from the prior instead.
  const edgePull = estimateAbility([], prior).theta - center;
  const score = Math.round(clampScale(estimate.theta - edgePull));
  const earned = observations.reduce((sum, observation) => sum + observation.score, 0);
  const expected = observations.reduce(
    (sum, observation) =>
      sum + probabilityCorrect(center, observation.difficulty, observation.guess),
    0,
  );
  return {
    area,
    score,
    level: cefrForScore(score),
    percent: Math.round((earned / observations.length) * 100),
    total: observations.length,
    delta: score - Math.round(center),
    surplus: earned - expected,
    se: estimate.se,
    misses: observations.filter((observation) => observation.score < 1).length,
  };
}

function clearOfCenter(summary: AreaSummary): boolean {
  return Math.abs(summary.delta) >= Math.max(DELTA_THRESHOLD, DELTA_SE * summary.se);
}

function statusFor(
  area: StudyArea,
  observations: readonly Observation[],
  center: number,
  run: RunContext,
): AreaStatus {
  if (observations.length >= MIN_EVIDENCE) {
    return { kind: "measured", summary: summarize(area, observations, center) };
  }
  if (observations.length > 0) return { kind: "thin", count: observations.length };
  if (AREA_SOURCES[area].length === 0) return { kind: "untested" };
  return { kind: "skipped", reason: skippedReason(area, run) };
}

/**
 * Breaks one test into the parts of Slovak it touched. Each area gets its own
 * ability on the test's 0–100 scale, pulled toward the overall score so a few
 * answers cannot swing it; an area well below the rest is a gap worth study.
 * Areas the run could not reach say so, and why.
 */
export function diagnose(
  responses: readonly ItemResponse[],
  production: readonly ProductionRecord[],
  center: number,
  run: RunContext,
): Diagnosis {
  const dictation = dictationEvidence(responses);
  const produced = productionEvidence(production);
  const accents = accentEvidence(responses);
  const accentSlips = [...accents.slips.values()].sort((a, b) => b.count - a.count);

  const issues = production.flatMap((record) =>
    record.status === "scored" ? (record.result?.issues ?? []) : [],
  );

  function observationsFor(area: StudyArea): Observation[] {
    if (area === "spelling")
      return [...accents.observations, ...(produced.get(area) ?? [])];
    if (area === "intelligibility") {
      return responses
        .filter((response) => response.kind === "readAloud")
        .map((response) => ({ difficulty: response.difficulty, score: response.score }));
    }
    return [
      ...responses
        .filter((response) => response.area === area)
        .map((response) => ({
          difficulty: response.difficulty,
          score: areaScore(response),
          guess: response.guess,
        })),
      ...(dictation.get(area)?.observations ?? []),
      ...(produced.get(area) ?? []),
    ];
  }

  const groups: GroupResult[] = AREA_GROUPS.map((group) => {
    const perArea = group.areas.map((area) => ({
      area,
      observations: observationsFor(area),
    }));
    const areas = perArea.map(({ area, observations }) => ({
      area,
      status: statusFor(area, observations, center, run),
    }));
    const all = perArea.flatMap(({ observations }) => observations);
    // A group of one area shares its status; a larger group pools its answers.
    const status =
      areas.length === 1
        ? (areas[0]?.status ?? { kind: "untested" })
        : all.length >= MIN_EVIDENCE
          ? {
              kind: "measured" as const,
              summary: summarize(group.areas[0] ?? "vocabulary", all, center),
            }
          : (areas.find((entry) => entry.status.kind === "thin")?.status ??
            areas.find((entry) => entry.status.kind === "skipped")?.status ?? {
              kind: "untested" as const,
            });
    return { group: group.id, status, areas };
  });

  const measured = groups.flatMap((group) =>
    group.areas.flatMap((entry) =>
      entry.status.kind === "measured" ? [entry.status.summary] : [],
    ),
  );

  // Near 0 or 100 the estimate cannot move past the edge, so the delta alone can
  // call an area strong with nothing right; the raw surplus has to agree.
  const strengths = measured
    .filter(
      (summary) => clearOfCenter(summary) && summary.delta > 0 && summary.surplus > 0,
    )
    .sort((a, b) => b.delta - a.delta);

  const weak = new Map<StudyArea, AreaSummary | null>(
    measured
      .filter(
        (summary) =>
          clearOfCenter(summary) &&
          summary.delta < 0 &&
          summary.surplus < 0 &&
          summary.misses >= MIN_GAP_MISSES,
      )
      .sort((a, b) => a.delta - b.delta)
      .map((summary) => [summary.area, summary]),
  );
  // Two slips of one kind in free writing or speech are a pattern even when the
  // short tasks never reached that area.
  for (const area of Object.keys(STUDY_AREA_INFO) as StudyArea[]) {
    const count = issues.filter((issue) => ISSUE_AREA[issue.topic] === area).length;
    if (count >= 2 && !weak.has(area) && !strengths.some((s) => s.area === area)) {
      weak.set(area, measured.find((summary) => summary.area === area) ?? null);
    }
  }

  const gaps: Gap[] = [...weak].map(([area, summary]) => {
    const misses = responses.filter(
      (response) => response.area === area && areaScore(response) < 1,
    );
    const heard = dictation.get(area);
    const areaIssues = issues.filter((issue) => ISSUE_AREA[issue.topic] === area);
    const examples = uniqueExamples([
      ...misses.flatMap((miss) => exampleFor(miss) ?? []),
      ...(heard?.examples ?? []),
      ...areaIssues.map((issue) => ({ expected: issue.correct, given: issue.wrote })),
    ]).slice(0, 4);
    const missedTags = [
      ...misses.flatMap((miss) => (miss.tag ? [miss.tag] : [])),
      ...(heard?.missedTags ?? []),
    ];
    return {
      area,
      summary,
      examples:
        area === "spelling"
          ? accentSlips.flatMap((slip) => slip.examples).slice(0, 4)
          : examples,
      links: linksFor(area, missedTags, areaIssues, accentSlips),
    };
  });

  return {
    center: Math.round(center),
    groups,
    strengths,
    gaps,
    accentSlips,
    wordsToLearn: wordsToLearn(responses),
    fakeWordsAccepted: responses.filter(
      (response) => response.word && !response.word.real && response.score < 1,
    ).length,
  };
}

/** When no area lags, the next topics for the learner's level. */
export const NEXT_STEPS: Record<CefrLevel, StudyLink[]> = {
  A1: [
    {
      label: "Lesson: greetings and introductions",
      href: "/lessons/everyday/meet-someone",
    },
    { label: "Lesson: byť", href: "/lessons/grammar/byt-present" },
    { label: "Lesson: present-tense endings", href: "/lessons/grammar/present-tense-i" },
    { label: "The most common nouns", href: "/dictionary/common/noun" },
  ],
  A2: [
    { label: "The six cases", href: "/grammar/cases-overview" },
    { label: "Lesson: ten, tento, tamten", href: "/lessons/grammar/demonstratives" },
    { label: "Lesson: possessives", href: "/lessons/grammar/possessives" },
    { label: "Negation", href: "/grammar/negation" },
  ],
  B1: [
    { label: "Aspect: robiť or urobiť", href: "/grammar/aspect" },
    { label: "Word order", href: "/grammar/word-order" },
    { label: "Instrumental case", href: "/grammar/cases/instrumental" },
    { label: "Listening episodes", href: "/listening" },
  ],
  B2: [
    { label: "Aspect: robiť or urobiť", href: "/grammar/aspect" },
    { label: "Word order", href: "/grammar/word-order" },
    { label: "Listening episodes", href: "/listening" },
    { label: "The most common adjectives", href: "/dictionary/common/adjective" },
  ],
  C1: [
    { label: "Word order", href: "/grammar/word-order" },
    { label: "Listening episodes", href: "/listening" },
  ],
  C2: [{ label: "Listening episodes", href: "/listening" }],
};
