/**
 * Heuristic Slovak surface forms for dictionary search (Pagefind + in-app).
 * Not a full paradigm — covers common person / agreement shapes learners type.
 */

import { IRREGULAR } from "./forms-irregulars";

const LONG_VOWEL = /[áäéíóôúý]/u;

/** Soft -ieť verbs that take -iem (not default -ím). Bare heuristic fallback. */
const IET_E_CLASS = new Set(["rozumieť", "umieť"]);

/**
 * Bases whose stem alternation survives productive prefixes (vybrať ← brať).
 * Motion ísť-family and byť are exact-match only.
 */
const PREFIXABLE = new Set([
  "brať",
  "prať",
  "písať",
  "kázať",
  "plakať",
  "skákať",
  "hádzať",
  "lámať",
  "orať",
  "klamať",
  "viazať",
  "kopať",
  "spať",
  "stáť",
  "báť",
  "bežať",
  "ležať",
  "držať",
  "kričať",
  "mlčať",
  "trčať",
  "sedieť",
  "horieť",
  "bolieť",
  "visieť",
  "trpieť",
  "myslieť",
  "hľadieť",
  "vravieť",
  "niesť",
  "viesť",
  "viezť",
  "rásť",
  "piecť",
  "tiecť",
  "liezť",
  "klásť",
  "pásť",
  "piť",
  "biť",
  "šiť",
  "žiť",
  "kryť",
  "myť",
  "stať",
  "ostať",
  "začať",
  "počuť",
  "priať",
  "môcť",
  "vedieť",
  "vidieť",
  "chcieť",
  "jesť",
  "vziať",
  "dať",
  "povedať",
  "mať",
  "smieť",
  "umrieť",
  "hnať",
  "rozumieť",
]);

/** Prefix + base pairs that look related but conjugate differently. */
const PREFIX_BLOCK: Record<string, ReadonlySet<string>> = {
  // odpovedať is regular -ám, not poviem-type.
  povedať: new Set(["od"]),
};

/** Longest-first productive verb prefixes (incl. negation). */
const VERB_PREFIXES = [
  "neod",
  "nepre",
  "nepri",
  "neroz",
  "nevy",
  "neza",
  "nezo",
  "nedo",
  "nepo",
  "neob",
  "neu",
  "nev",
  "nez",
  "nes",
  "nen",
  "pred",
  "prek",
  "pre",
  "pri",
  "pro",
  "pod",
  "nad",
  "odo",
  "od",
  "ob",
  "do",
  "na",
  "ná",
  "po",
  "vy",
  "za",
  "zo",
  "roz",
  "ne",
  "u",
  "v",
  "z",
  "s",
];

function uniqueForms(forms: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const form of forms) {
    const key = form.toLocaleLowerCase("sk");
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(form);
  }
  return out;
}

function personFromBase(
  base: string,
  endings: [string, string, string, string, string, string],
): string[] {
  return endings.map((ending) => `${base}${ending}`);
}

function resolveIrregular(lower: string): string[] | null {
  const exact = IRREGULAR[lower];
  if (exact) return [...exact];

  // Negation of any listed irregular (neprísť, nemôcť). Skip byť — "nesom" is not used.
  if (lower.startsWith("ne") && lower.length > 4) {
    const negated = lower.slice(2);
    if (negated !== "byť" && IRREGULAR[negated]) {
      return IRREGULAR[negated].map((form) => `ne${form}`);
    }
  }

  for (const prefix of VERB_PREFIXES) {
    if (!lower.startsWith(prefix) || lower.length <= prefix.length + 2) continue;

    const base = lower.slice(prefix.length);
    if (!PREFIXABLE.has(base)) continue;
    if (PREFIX_BLOCK[base]?.has(prefix)) continue;

    const forms = IRREGULAR[base];
    if (!forms) continue;

    return forms.map((form) => `${prefix}${form}`);
  }

  return null;
}

function conjugateVerb(lemma: string): string[] {
  const reflexive = lemma.toLocaleLowerCase("sk").endsWith(" sa");
  const lower = reflexive
    ? lemma.toLocaleLowerCase("sk").slice(0, -3)
    : lemma.toLocaleLowerCase("sk");

  const irregular = resolveIrregular(lower);
  if (irregular) {
    return reflexive ? irregular.map((form) => `${form} sa`) : irregular;
  }

  if (!lower.endsWith("ť") || lower.length < 3) return [];

  let forms: string[] = [];

  if (lower.endsWith("ovať")) {
    const stem = lower.slice(0, -4);
    forms = [
      ...personFromBase(stem, ["ujem", "uješ", "uje", "ujeme", "ujete", "ujú"]),
      `${stem}oval`,
      `${stem}ovala`,
      `${stem}ovalo`,
      `${stem}ovali`,
    ];
  } else if (lower.endsWith("ávať")) {
    const stem = lower.slice(0, -4);
    forms = [
      ...personFromBase(stem, ["ávam", "ávaš", "áva", "ávame", "ávate", "ávajú"]),
      `${stem}ával`,
      `${stem}ávala`,
      `${stem}ávalo`,
      `${stem}ávali`,
    ];
  } else if (lower.endsWith("núť")) {
    const stem = lower.slice(0, -3);
    forms = [
      ...personFromBase(stem, ["nem", "neš", "ne", "neme", "nete", "nú"]),
      `${stem}nul`,
      `${stem}nula`,
      `${stem}nulo`,
      `${stem}nuli`,
    ];
  } else if (lower.endsWith("ieť")) {
    const pastStem = lower.slice(0, -3);
    if (IET_E_CLASS.has(lower)) {
      const base = lower.slice(0, -1);
      forms = [
        ...personFromBase(base, ["m", "š", "", "me", "te", "jú"]),
        `${pastStem}el`,
        `${pastStem}ela`,
        `${pastStem}elo`,
        `${pastStem}eli`,
      ];
    } else {
      // Default -ieť → -ím (sedieť, myslieť, horieť…).
      forms = [
        ...personFromBase(pastStem, ["ím", "íš", "í", "íme", "íte", "ia"]),
        `${pastStem}el`,
        `${pastStem}ela`,
        `${pastStem}elo`,
        `${pastStem}eli`,
      ];
    }
  } else if (lower.endsWith("iť")) {
    const stem = lower.slice(0, -2);
    // Monosyllabic stems: biť, piť, šiť, žiť → bijem… (prefixed via IRREGULAR).
    if (stem.length <= 1) {
      forms = [
        ...personFromBase(stem, ["ijem", "iješ", "ije", "ijeme", "ijete", "ijú"]),
        `${stem}il`,
        `${stem}ila`,
        `${stem}ilo`,
        `${stem}ili`,
      ];
    } else {
      const short = LONG_VOWEL.test(stem);
      const person = short
        ? personFromBase(stem, ["im", "iš", "i", "ime", "ite", "ia"])
        : personFromBase(stem, ["ím", "íš", "í", "íme", "íte", "ia"]);
      forms = [...person, `${stem}il`, `${stem}ila`, `${stem}ilo`, `${stem}ili`];
    }
  } else if (lower.endsWith("yť")) {
    const stem = lower.slice(0, -2);
    forms = [
      ...personFromBase(stem, ["yjem", "yješ", "yje", "yjeme", "yjete", "yjú"]),
      `${stem}yl`,
      `${stem}yla`,
      `${stem}ylo`,
      `${stem}yli`,
    ];
  } else if (lower.endsWith("ať")) {
    const stem = lower.slice(0, -2);
    forms = [
      ...personFromBase(stem, ["ám", "áš", "á", "áme", "áte", "ajú"]),
      // Soft-stem presents (vracať → vraciam), in addition to regular -ám.
      ...["iam", "iaš", "ia", "iame", "iate"].map((ending) => `${stem}${ending}`),
      `${stem}al`,
      `${stem}ala`,
      `${stem}alo`,
      `${stem}ali`,
    ];
  } else if (lower.endsWith("eť") || lower.endsWith("uť")) {
    const base = lower.slice(0, -1);
    forms = personFromBase(base, ["m", "š", "", "me", "te", "jú"]);
  } else {
    const base = lower.slice(0, -1);
    forms = personFromBase(base, ["m", "š", "", "me", "te", "jú"]);
  }

  return reflexive ? forms.map((form) => `${form} sa`) : forms;
}

function adjectiveForms(lemma: string): string[] {
  const lower = lemma.toLocaleLowerCase("sk");

  if (lower.endsWith("ý")) {
    const stem = lower.slice(0, -1);
    return [`${stem}á`, `${stem}é`, `${stem}í`, `${stem}ého`, `${stem}ému`, `${stem}ým`];
  }

  if (lower.endsWith("í")) {
    const stem = lower.slice(0, -1);
    return [`${stem}ia`, `${stem}ie`, `${stem}ích`, `${stem}ím`];
  }

  if (lower.endsWith("á")) {
    const stem = lower.slice(0, -1);
    return [`${stem}é`, `${stem}ej`, `${stem}ú`, `${stem}ých`];
  }

  return [];
}

function nounForms(lemma: string): string[] {
  const lower = lemma.toLocaleLowerCase("sk");

  // Feminine -a: learners often search accusative -u / genitive -y.
  if (lower.endsWith("a") && lower.length >= 3) {
    const stem = lower.slice(0, -1);
    return [`${stem}u`, `${stem}y`, `${stem}e`, `${stem}ou`, `${stem}ách`];
  }

  // Neuter -o / -e
  if (lower.endsWith("o") && lower.length >= 3) {
    const stem = lower.slice(0, -1);
    return [`${stem}a`, `${stem}u`, `${stem}om`, `${stem}ách`];
  }

  if (lower.endsWith("e") && lower.length >= 3 && !lower.endsWith("ie")) {
    const stem = lower.slice(0, -1);
    return [`${stem}a`, `${stem}u`, `${stem}om`];
  }

  // Hard consonant nouns: light genitive / locative guesses
  if (/[bcdfghjklmnpqrstvwxzťďňľčžš]$/u.test(lower) && lower.length >= 4) {
    return [`${lower}a`, `${lower}u`, `${lower}om`, `${lower}och`];
  }

  return [];
}

/**
 * Extra searchable tokens for a dictionary lemma.
 * Excludes the lemma itself (already indexed as title).
 */
export function searchFormsForLemma(slovak: string, category: string): string[] {
  const lower = slovak.toLocaleLowerCase("sk");

  let forms: string[] = [];
  switch (category) {
    case "Verbs":
      forms = conjugateVerb(slovak);
      break;
    case "Adjectives":
      forms = adjectiveForms(slovak);
      break;
    case "Nouns":
    case "Places":
      forms = nounForms(slovak);
      break;
    case "Adverbs":
    case "Phrases":
      // Fixed phrases / function words / adverbs — no productive inflection index.
      forms = [];
      break;
    default:
      forms = [];
  }

  return uniqueForms(forms).filter((form) => form.toLocaleLowerCase("sk") !== lower);
}

/** @internal exported for unit tests */
export function conjugateVerbForTest(lemma: string): string[] {
  return uniqueForms(conjugateVerb(lemma));
}
