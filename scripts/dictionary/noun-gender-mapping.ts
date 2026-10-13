/**
 * Pure mapping from Wiktionary (kaikki.org JSONL) noun records → `NounGender`.
 * Used by `import-noun-gender.ts`; covered by `noun-gender-mapping.test.ts`.
 *
 * Two Wiktionary editions, both CC BY-SA via kaikki.org:
 * - English Wiktionary: gender code in the `sk-noun` head template (`m-pr`, `f-p`, …)
 *   plus sense tags. Most precise; checked first.
 * - Polish Wiktionary: record-level tags (`masculine` + `animate` / `inanimate`,
 *   `feminine`, `neuter`, `plural` for plural headwords). Much wider coverage;
 *   fills gaps and breaks English ties.
 */

import type { NounGender } from "../../src/lib/catalog/types";

/** Subset of a kaikki.org JSONL record that gender resolution reads. */
export interface KaikkiNounRecord {
  word: string;
  pos: string;
  tags?: string[];
  head_templates?: Array<{ name: string; args?: Record<string, string> }>;
  senses?: Array<{ glosses?: string[]; tags?: string[] }>;
}

export type GenderSource =
  | "hand-override"
  | "english-wiktionary"
  | "english-wiktionary-gloss-match"
  | "polish-wiktionary"
  | "ending-rule";

export type GenderResolution =
  | { gender: NounGender; source: GenderSource; note?: string }
  | { gender: null; reason: "ambiguous" | "missing"; note: string };

/** One edition's answer for a lemma: a gender, competing genders, or nothing. */
export type EditionVerdict =
  | { kind: "gender"; gender: NounGender; glossMatched?: boolean }
  | { kind: "ambiguous"; genders: NounGender[] }
  | { kind: "none" };

/**
 * Single English Wiktionary `sk-noun` code → gender:
 * `m-pr` (person), `m-anml` (animal), `m-in`, `f`, `n`; a `-p` suffix marks pluralia tantum.
 */
export function genderFromCode(code: string): NounGender | null {
  const trimmed = code.trim();
  if (/-p$/.test(trimmed)) return "plural-only";
  switch (trimmed) {
    case "m-pr":
    case "m-anml":
    case "m-an":
      return "masculine-animate";
    case "m-in":
      return "masculine-inanimate";
    case "f":
      return "feminine";
    case "n":
      return "neuter";
    default:
      return null;
  }
}

/** Slovak declension pattern (vzor) named in `decl=` → the gender it declines as. */
const DECLENSION_PATTERN_GENDER: Record<string, NounGender> = {
  chlap: "masculine-animate",
  hrdina: "masculine-animate",
  dub: "masculine-inanimate",
  stroj: "masculine-inanimate",
  žena: "feminine",
  ulica: "feminine",
  dlaň: "feminine",
  kosť: "feminine",
  gazdiná: "feminine",
  idea: "feminine",
  mesto: "neuter",
  srdce: "neuter",
  vysvedčenie: "neuter",
  dievča: "neuter",
};

export function genderFromDeclensionPattern(
  pattern: string | undefined,
): NounGender | null {
  if (!pattern || pattern.includes(",")) return null;
  return DECLENSION_PATTERN_GENDER[pattern.trim()] ?? null;
}

/** Every gender a comma list of codes (`m-pr,m-in`) names. */
export function gendersFromHeadCode(code: string | undefined): NounGender[] {
  if (!code) return [];
  const genders = code
    .split(",")
    .map(genderFromCode)
    .filter((gender): gender is NounGender => gender !== null);
  return [...new Set(genders)];
}

/**
 * Gender from a tag list — English sense tags (`["masculine", "person"]`) or
 * Polish record tags (`["animate", "masculine"]`). Masculine without animacy → null.
 */
export function genderFromTags(
  tags: readonly string[],
  pluralTag: "plural-only" | "plural" = "plural-only",
): NounGender | null {
  if (tags.includes(pluralTag)) return "plural-only";
  if (tags.includes("masculine")) {
    if (tags.includes("inanimate")) return "masculine-inanimate";
    if (
      tags.includes("person") ||
      tags.includes("animate") ||
      tags.includes("animal-not-person")
    ) {
      return "masculine-animate";
    }
    return null;
  }
  if (tags.includes("feminine") && tags.includes("neuter")) return null;
  if (tags.includes("feminine")) return "feminine";
  if (tags.includes("neuter")) return "neuter";
  return null;
}

function lemmaSenses(record: KaikkiNounRecord) {
  return (record.senses ?? []).filter((sense) => !(sense.tags ?? []).includes("form-of"));
}

/** Inflected-form stubs (`nohavice` as genitive singular of `nohavica`) are not lemmas. */
export function isLemmaRecord(record: KaikkiNounRecord): boolean {
  if (record.pos !== "noun") return false;
  if ((record.tags ?? []).includes("form-of")) return false;
  return lemmaSenses(record).length > 0;
}

/**
 * English Wiktionary record → genders it names. Head template wins; sense tags
 * fill in when the head is bare. Plural-only when every lemma sense says so
 * (nohavice is `f` + `plural-only`).
 */
export function gendersFromEnglishRecord(record: KaikkiNounRecord): NounGender[] {
  const senses = lemmaSenses(record);
  const allPluralOnly =
    senses.length > 0 &&
    senses.every((sense) => (sense.tags ?? []).includes("plural-only"));
  if (allPluralOnly) return ["plural-only"];

  const head = record.head_templates?.find((template) => template.name === "sk-noun");
  const fromHead = gendersFromHeadCode(head?.args?.["1"]);
  if (fromHead.length > 0) {
    // A feminine / neuter code that contradicts its own declension pattern is a
    // Wiktionary slip (želanie `f` + pattern vysvedčenie) — surface both genders.
    // Masculine codes are exempt: hrdina-type nouns legitimately decline like žena.
    const patternGender = genderFromDeclensionPattern(head?.args?.["decl"]);
    const [onlyGender] = fromHead;
    if (
      fromHead.length === 1 &&
      (onlyGender === "feminine" || onlyGender === "neuter") &&
      patternGender &&
      patternGender !== onlyGender
    ) {
      return [onlyGender, patternGender];
    }
    return fromHead;
  }

  const fromTags = senses
    .map((sense) => genderFromTags(sense.tags ?? []))
    .filter((gender): gender is NounGender => gender !== null);
  return [...new Set(fromTags)];
}

/** Polish Wiktionary record → gender (record-level tags; `plural` = plural headword). */
export function genderFromPolishRecord(record: KaikkiNounRecord): NounGender | null {
  const tags = record.tags ?? [];
  const genderTags = ["masculine", "feminine", "neuter"].filter((tag) =>
    tags.includes(tag),
  );
  // `feminine` + `masculine` + `plural` (džínsy) — plural headword, gender unclear.
  if (genderTags.length > 1 && !tags.includes("plural")) return null;
  return genderFromTags(tags, "plural");
}

const GLOSS_STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "as",
  "by",
  "for",
  "from",
  "in",
  "of",
  "on",
  "or",
  "the",
  "to",
  "with",
]);

export function glossTokens(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z]+/)
      .filter((token) => token.length > 1 && !GLOSS_STOPWORDS.has(token)),
  );
}

function glossOverlap(english: string, record: KaikkiNounRecord): number {
  const ours = glossTokens(english);
  const theirs = glossTokens(
    lemmaSenses(record)
      .flatMap((sense) => sense.glosses ?? [])
      .join(" "),
  );
  let shared = 0;
  for (const token of ours) if (theirs.has(token)) shared += 1;
  return shared;
}

function verdictFrom(genders: Iterable<NounGender>): EditionVerdict {
  const distinct = [...new Set(genders)];
  if (distinct.length === 0) return { kind: "none" };
  if (distinct.length === 1) return { kind: "gender", gender: distinct[0]! };
  return { kind: "ambiguous", genders: distinct };
}

/**
 * English Wiktionary verdict. When homographs disagree (kuli, kop), the record
 * whose glosses best overlap our English gloss wins — strict winner only.
 */
export function englishVerdict(
  english: string,
  records: readonly KaikkiNounRecord[],
): EditionVerdict {
  const candidates = records
    .filter(isLemmaRecord)
    .map((record) => ({ record, genders: gendersFromEnglishRecord(record) }))
    .filter((candidate) => candidate.genders.length > 0);

  const overall = verdictFrom(candidates.flatMap((candidate) => candidate.genders));
  if (overall.kind !== "ambiguous") return overall;

  const scored = candidates.map((candidate) => ({
    ...candidate,
    score: glossOverlap(english, candidate.record),
  }));
  const bestScore = Math.max(...scored.map((candidate) => candidate.score));
  const winners = verdictFrom(
    scored
      .filter((candidate) => candidate.score === bestScore)
      .flatMap((candidate) => candidate.genders),
  );
  if (bestScore > 0 && winners.kind === "gender") {
    return { ...winners, glossMatched: true };
  }
  return overall;
}

export function polishVerdict(records: readonly KaikkiNounRecord[]): EditionVerdict {
  return verdictFrom(
    records
      .filter(isLemmaRecord)
      .map(genderFromPolishRecord)
      .filter((gender): gender is NounGender => gender !== null),
  );
}

/**
 * Confident Slovak ending rules — only for lemmas both editions leave unresolved.
 * Deliberately narrow: endings like bare -a, -da, -ta, -teľ, -ník, -ár, -ač, -ok
 * mix genders or animacy (hrdina, predseda, starosta, zviera, menovateľ, vysávač,
 * svedok) and stay unset.
 */
const ENDING_RULES: ReadonlyArray<{ ending: RegExp; gender: NounGender; label: string }> =
  [
    { ending: /osť$/, gender: "feminine", label: "ending -osť (pattern kosť)" },
    {
      ending: /[czsrg]ia$/,
      gender: "feminine",
      label: "ending -cia / -zia / -sia / -ria / -gia (pattern ulica)",
    },
    { ending: /ka$/, gender: "feminine", label: "ending -ka (pattern žena)" },
    { ending: /[bv]a$/, gender: "feminine", label: "ending -ba / -va (pattern žena)" },
    { ending: /úra$/, gender: "feminine", label: "ending -úra (pattern žena)" },
    { ending: /ňa$/, gender: "feminine", label: "ending -ňa (pattern ulica)" },
    { ending: /[aá]reň$/, gender: "feminine", label: "ending -areň (pattern dlaň)" },
    {
      // Not -cie / -rie / -gie / -sie / -zie: plural headwords of -ia nouns (financie, dioptrie).
      ending: /(?<![crgsz])ie$/,
      gender: "neuter",
      label: "ending -ie (pattern vysvedčenie)",
    },
    { ending: /[ie]um$/, gender: "neuter", label: "ending -ium / -eum (pattern múzeum)" },
    { ending: /o$/, gender: "neuter", label: "ending -o (pattern mesto)" },
    {
      ending: /izmus$/,
      gender: "masculine-inanimate",
      label: "ending -izmus (pattern dub)",
    },
    {
      ending: /ista$/,
      gender: "masculine-animate",
      label: "ending -ista (pattern hrdina)",
    },
    {
      // sudca, zástupca, obhajca, záujemca, strážca, hovorca, správca — not ovca (sheep).
      ending: /(?:[dpjmžr]|(?<!^o)v)ca$/,
      gender: "masculine-animate",
      label: "ending -dca / -pca / -jca / -mca / -žca / -rca / -vca (pattern hrdina)",
    },
  ];

/**
 * Exempt from ending rules: masculine person nouns in -o (pattern hrdina) and
 * quantity words filed under Nouns that do not decline like nouns (málo).
 */
const ENDING_RULE_EXEMPT = new Set([
  "dedo",
  "dedko",
  "strýko",
  "ujo",
  "tato",
  "oco",
  "ocko",
  "málo",
  "veľa",
]);

export function genderFromEnding(
  lemma: string,
): { gender: NounGender; label: string } | null {
  const lower = lemma.toLocaleLowerCase("sk");
  // Multi-word or capitalised (proper) headwords: no rule applies confidently.
  if (/\s/.test(lower) || lemma !== lower) return null;
  if (ENDING_RULE_EXEMPT.has(lower)) return null;
  for (const rule of ENDING_RULES) {
    if (rule.ending.test(lower)) return { gender: rule.gender, label: rule.label };
  }
  return null;
}

function describe(edition: string, verdict: EditionVerdict): string | null {
  if (verdict.kind === "gender") return `${edition}: ${verdict.gender}`;
  if (verdict.kind === "ambiguous") return `${edition}: ${verdict.genders.join(" / ")}`;
  return null;
}

/**
 * Combine both editions + ending rules for one lemma:
 * 1. English Wiktionary gives one gender → use it (Polish disagreement is noted).
 * 2. English silent → Polish gender. English ambiguous → Polish breaks the tie
 *    only when it picks one of the English candidates.
 * 3. Otherwise a confident ending rule, restricted to genders the editions list.
 */
export function resolveNounGender(
  lemma: string,
  english: string,
  sources: {
    english: readonly KaikkiNounRecord[];
    polish: readonly KaikkiNounRecord[];
  },
): GenderResolution {
  const fromEnglish = englishVerdict(english, sources.english);
  const fromPolish = polishVerdict(sources.polish);

  if (fromEnglish.kind === "gender") {
    const disagreement =
      fromPolish.kind === "gender" && fromPolish.gender !== fromEnglish.gender
        ? `Polish Wiktionary says ${fromPolish.gender}`
        : undefined;
    return {
      gender: fromEnglish.gender,
      source: fromEnglish.glossMatched
        ? "english-wiktionary-gloss-match"
        : "english-wiktionary",
      ...(disagreement ? { note: disagreement } : {}),
    };
  }

  const rule = genderFromEnding(lemma);

  if (fromPolish.kind === "gender") {
    // Polish Wiktionary slips (oddelenie tagged masculine) lose to a confident
    // ending — both go to review rather than either winning silently.
    if (rule && rule.gender !== fromPolish.gender) {
      return {
        gender: null,
        reason: "ambiguous",
        note: `Polish Wiktionary: ${fromPolish.gender}; ${rule.label} says ${rule.gender}`,
      };
    }
    if (fromEnglish.kind === "none") {
      return { gender: fromPolish.gender, source: "polish-wiktionary" };
    }
    if (fromEnglish.genders.includes(fromPolish.gender)) {
      return {
        gender: fromPolish.gender,
        source: "polish-wiktionary",
        note: `breaks English Wiktionary tie (${fromEnglish.genders.join(" / ")})`,
      };
    }
  }

  const listed = [
    describe("English Wiktionary", fromEnglish),
    describe("Polish Wiktionary", fromPolish),
  ]
    .filter((part): part is string => part !== null)
    .join("; ");
  const listedGenders = new Set<NounGender>([
    ...(fromEnglish.kind === "ambiguous" ? fromEnglish.genders : []),
    ...(fromPolish.kind === "ambiguous" ? fromPolish.genders : []),
    ...(fromPolish.kind === "gender" ? [fromPolish.gender] : []),
  ]);

  // An ending says nothing about animacy when Wiktionary lists both (sprievodca:
  // guide person vs guidebook) — leave those for review.
  const animacyTie =
    listedGenders.has("masculine-animate") && listedGenders.has("masculine-inanimate");
  if (
    rule &&
    !animacyTie &&
    (listedGenders.size === 0 || listedGenders.has(rule.gender))
  ) {
    return {
      gender: rule.gender,
      source: "ending-rule",
      note: listed ? `${rule.label}; ${listed}` : rule.label,
    };
  }

  if (listedGenders.size > 0) {
    return { gender: null, reason: "ambiguous", note: listed };
  }

  const hasMasculineOnly = sources.polish.filter(isLemmaRecord).some((record) => {
    const tags = record.tags ?? [];
    return (
      tags.includes("masculine") &&
      !["animate", "inanimate", "feminine", "neuter", "plural"].some((tag) =>
        tags.includes(tag),
      )
    );
  });
  return {
    gender: null,
    reason: "missing",
    note: hasMasculineOnly
      ? "Polish Wiktionary: masculine, animacy not given"
      : sources.english.length + sources.polish.length > 0
        ? "Wiktionary noun record has no gender"
        : "not in either Wiktionary edition",
  };
}
