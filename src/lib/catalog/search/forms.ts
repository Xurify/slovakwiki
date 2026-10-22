/**
 * Heuristic Slovak surface forms for dictionary search (Pagefind + in-app).
 * Not a full paradigm — covers common person / agreement shapes learners type.
 */

import {
  ANIMATE_NOMINATIVE_PLURAL,
  GENITIVE_A,
  GENITIVE_A_OR_U,
  GENITIVE_U,
  IRREGULAR,
  IRREGULAR_NOUNS,
  KEEP_OK,
  KOST_FEMININE,
  LOCATIVE_SINGULAR,
  OBLIQUE_STEMS,
  SINGULAR_ONLY,
  SOFT_A_FEMININE,
} from "./forms-irregulars";

const VOWEL = /[aáäeéiíoóôuúyý]/u;

const VOWEL_FINAL = /[aáäeéiíoóôuúyý]$/u;

const VOWEL_OR_SYLLABIC_FINAL = /(?:[aáäeéiíoóôuúyý]|[^aáäeéiíoóôuúyý][rl])$/u;

const SOFT_FINAL = /(?:[cčďjľňšťž]|dz|dž)$/u;

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
  "stavať",
  "chovať",
]);

/** Prefix + base pairs that look related but conjugate differently. */
const PREFIX_BLOCK: Record<string, ReadonlySet<string>> = {
  // odpovedať, vypovedať and napovedať are regular -ám, not poviem-type.
  povedať: new Set(["od", "vy", "na"]),
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
  "zne",
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
  "o",
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

/**
 * Whether the stem's last syllable is long, so the rhythmic law shortens the
 * ending after it: čítam, lúkam, krásny. A syllabic r or l is short: náplniam.
 */
function longLastSyllable(stem: string): boolean {
  for (let index = stem.length - 1; index >= 0; index -= 1) {
    const letter = stem[index]!;
    if (/[áéíóúýôŕĺ]/u.test(letter)) return true;
    if (VOWEL.test(letter)) return /[aeu]/u.test(letter) && stem[index - 1] === "i";

    const syllabic =
      /[rl]/u.test(letter) &&
      index > 0 &&
      index < stem.length - 1 &&
      !VOWEL.test(stem[index - 1]!) &&
      !VOWEL.test(stem[index + 1]!);
    if (syllabic) return false;
  }
  return false;
}

type PersonEndings = [string, string, string, string, string, string];

function personFromBase(base: string, endings: PersonEndings): string[] {
  return endings.map((ending) => `${base}${ending}`);
}

function blockedPrefix(base: string, prefix: string): boolean {
  const blocked = PREFIX_BLOCK[base];
  return !!blocked && (blocked.has(prefix) || blocked.has(prefix.replace(/^ne/u, "")));
}

/**
 * Prefixed irregular, also through stacked prefixes: využiť ← užiť ← žiť. A
 * one-letter outer prefix does not stack (snažiť is not s + na + žiť).
 */
function prefixedIrregular(lower: string, depth: number): string[] | null {
  for (const prefix of VERB_PREFIXES) {
    if (!lower.startsWith(prefix) || lower.length <= prefix.length + 2) continue;

    const base = lower.slice(prefix.length);
    if (blockedPrefix(base, prefix)) continue;

    const forms = PREFIXABLE.has(base)
      ? IRREGULAR[base]
      : depth > 0 && prefix.replace(/^ne/u, "").length !== 1
        ? prefixedIrregular(base, depth - 1)
        : null;
    if (forms) return forms.map((form) => `${prefix}${form}`);
  }

  return null;
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

  return prefixedIrregular(lower, 2);
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
    // After a vowel or syllabic r/l: minúť → miniem, minul. Otherwise stretnúť →
    // stretnem, stretol (stretnul is colloquial but still searched).
    forms = VOWEL_OR_SYLLABIC_FINAL.test(stem)
      ? [
          ...personFromBase(stem, ["niem", "nieš", "nie", "nieme", "niete", "nú"]),
          `${stem}nul`,
          `${stem}nula`,
          `${stem}nulo`,
          `${stem}nuli`,
        ]
      : [
          ...personFromBase(stem, ["nem", "neš", "ne", "neme", "nete", "nú"]),
          `${stem}ol`,
          `${stem}la`,
          `${stem}lo`,
          `${stem}li`,
          `${stem}nul`,
          `${stem}nula`,
        ];
  } else if (lower.endsWith("ieť")) {
    const pastStem = lower.slice(0, -3);
    // pozrieť → pozriem, pozrú; znieť → zniem, znejú.
    const rootIem = /[^aáäeéiíoóôuúyý][rn]ieť$/u.test(lower);
    if (IET_E_CLASS.has(lower) || rootIem) {
      const base = lower.slice(0, -1);
      const plural = lower.endsWith("rieť") ? `${pastStem}ú` : `${pastStem}ejú`;
      forms = [
        ...["m", "š", "", "me", "te"].map((ending) => `${base}${ending}`),
        plural,
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
      // After j the third person plural drops the i: spojiť → spoja.
      const plural = stem.endsWith("j") ? "a" : "ia";
      const person = longLastSyllable(stem)
        ? personFromBase(stem, ["im", "iš", "i", "ime", "ite", plural])
        : personFromBase(stem, ["ím", "íš", "í", "íme", "íte", plural]);
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
  } else if (lower.endsWith("iať")) {
    // siať → sejem, smiať → smejem, naliať → nalejem.
    const stem = lower.slice(0, -3);
    forms = [
      ...personFromBase(stem, ["ejem", "eješ", "eje", "ejeme", "ejete", "ejú"]),
      `${stem}ial`,
      `${stem}iala`,
      `${stem}ialo`,
      `${stem}iali`,
    ];
  } else if (lower.endsWith("ať")) {
    const stem = lower.slice(0, -2);
    // c and š stems take -iam (vracať → vraciam) unless a long syllable shortens it.
    const present: PersonEndings = longLastSyllable(stem)
      ? ["am", "aš", "a", "ame", "ate", "ajú"]
      : /[cš]$/u.test(stem)
        ? ["iam", "iaš", "ia", "iame", "iate", "ajú"]
        : ["ám", "áš", "á", "áme", "áte", "ajú"];
    forms = [
      ...personFromBase(stem, present),
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

/** Endings after the stem, by the nominative ending: pekný, krásny, cudzí, domáci. */
const ADJECTIVE_ENDINGS: Record<string, string[]> = {
  ý: ["á", "é", "í", "ého", "ému", "om", "ým", "ú", "ej", "ou", "ých", "ými"],
  y: ["a", "e", "i", "eho", "emu", "om", "ym", "u", "ej", "ou", "ych", "ymi"],
  í: ["ia", "ie", "ieho", "iemu", "om", "ím", "iu", "ej", "ou", "ích", "ími"],
  i: ["a", "e", "eho", "emu", "om", "im", "u", "ej", "ou", "ich", "imi"],
};

const FEMININE_OR_NEUTER_ENDINGS = new Set([
  "á",
  "a",
  "é",
  "e",
  "ú",
  "u",
  "ia",
  "ie",
  "iu",
  "ej",
  "ou",
]);

function adjectiveParts(lower: string): [string, string[]] | null {
  const stem = lower.slice(0, -1);
  const endings = ADJECTIVE_ENDINGS[lower.at(-1) ?? ""];
  if (!endings || !stem || VOWEL_FINAL.test(stem)) return null;
  // A short -y or -i comes only after a long syllable (krásny); sexy does not decline.
  if (/[yi]$/u.test(lower) && !longLastSyllable(stem)) return null;
  return [stem, endings];
}

function adjectiveForms(lemma: string): string[] {
  const lower = lemma.toLocaleLowerCase("sk");

  if (lower.endsWith("á")) {
    const stem = lower.slice(0, -1);
    return [`${stem}é`, `${stem}ej`, `${stem}ú`, `${stem}ých`];
  }

  const parts = adjectiveParts(lower);
  if (!parts) return [];
  const [stem, endings] = parts;
  return endings.map((ending) => `${stem}${ending}`);
}

interface NounForms {
  plural: string[];
  singular: string[];
}

const NO_FORMS: NounForms = { plural: [], singular: [] };

/** ď, ť, ň, ľ are written without the caron before e and i: gule, náplni. */
const PLAIN: Record<string, string> = { ď: "d", ť: "t", ň: "n", ľ: "l" };

/** A neuter -e stem is soft, so pole has poľa, poľom. */
const SOFTENED: Record<string, string> = { d: "ď", t: "ť", n: "ň", l: "ľ" };

function inflect(stem: string, ending: string): string {
  // After j the i of -ia… drops: nádejam, not nádejiam.
  if (stem.endsWith("j") && ending.startsWith("ia")) return `${stem}${ending.slice(1)}`;
  const plain = PLAIN[stem.at(-1) ?? ""];
  return plain && /^[eéií]/u.test(ending)
    ? `${stem.slice(0, -1)}${plain}${ending}`
    : `${stem}${ending}`;
}

function soften(stem: string): string {
  const soft = SOFTENED[stem.at(-1) ?? ""];
  return soft ? `${stem.slice(0, -1)}${soft}` : stem;
}

function syllableCount(word: string): number {
  let count = 0;
  for (let index = 0; index < word.length; index += 1) {
    const letter = word[index]!;
    const previous = word[index - 1] ?? "";
    if (VOWEL.test(letter)) {
      if (!VOWEL.test(previous)) count += 1;
    } else if (
      /[rlŕĺ]/u.test(letter) &&
      previous &&
      !VOWEL.test(previous) &&
      !VOWEL.test(word[index + 1] ?? "")
    ) {
      count += 1;
    }
  }
  return count;
}

/** Hard -a (žena), soft -a (ulica, guľa), -ia (reštaurácia), dlaň and kosť types. */
function feminineForms(lower: string): NounForms {
  if (lower.endsWith("a")) {
    const stem = lower.slice(0, -1);
    if (/[^aáäeéiíoóôuúyý]i$/u.test(stem)) {
      // -ia nouns keep the long endings even after a long syllable: reštauráciám.
      return {
        singular: [`${stem}e`, `${stem}i`, `${stem}u`, `${stem}ou`],
        plural: [`${stem}e`, `${stem}í`, `${stem}ám`, `${stem}ách`, `${stem}ami`],
      };
    }
    if (!stem || VOWEL_FINAL.test(stem)) return NO_FORMS;

    const short = longLastSyllable(stem);
    if (SOFT_FINAL.test(stem) || SOFT_A_FEMININE.has(lower)) {
      return {
        singular: [inflect(stem, "e"), inflect(stem, "i"), `${stem}u`, `${stem}ou`],
        plural: [
          inflect(stem, "e"),
          inflect(stem, short ? "am" : "iam"),
          inflect(stem, short ? "ach" : "iach"),
          `${stem}ami`,
        ],
      };
    }
    return {
      singular: [`${stem}y`, `${stem}e`, `${stem}u`, `${stem}ou`],
      plural: [
        `${stem}y`,
        `${stem}${short ? "am" : "ám"}`,
        `${stem}${short ? "ach" : "ách"}`,
        `${stem}ami`,
      ],
    };
  }

  if (VOWEL_FINAL.test(lower)) return NO_FORMS;

  // pieseň → piesne, obec → obce, cirkev → cirkvi.
  const stem =
    OBLIQUE_STEMS[lower] ??
    (syllableCount(lower) > 1 && /[^i]e[ňcv]$/u.test(lower)
      ? `${lower.slice(0, -2)}${lower.at(-1)}`
      : lower);
  const kost = KOST_FEMININE.has(lower) || /(?:[^ä]sť|oc|[sv])$/u.test(lower);
  const genitive = inflect(stem, kost ? "i" : "e");
  // piesňam after a long syllable; cirkev keeps the hard endings: cirkvám.
  const plural = longLastSyllable(stem) ? "a" : stem.endsWith("v") ? "á" : "ia";
  return {
    singular: [genitive, inflect(stem, "i"), `${stem}ou`],
    plural: [
      genitive,
      inflect(stem, "í"),
      inflect(stem, `${plural}m`),
      inflect(stem, `${plural}ch`),
      `${stem}ami`,
    ],
  };
}

const MASCULINE_MOBILE_VOWEL: [RegExp, string][] = [
  [/i?ec$/u, "c"],
  [/íček$/u, "íčk"],
  [/j[eo]m$/u, "jm"],
  [/čet$/u, "čt"],
  [/ysel$/u, "ysl"],
  [/mus$/u, "m"],
  [/(met|st)er$/u, "$1r"],
];

/** Stem of the other cases: koniec → konca, výsledok → výsledku, meter → metra. */
function masculineStem(lower: string): string {
  const listed = OBLIQUE_STEMS[lower];
  if (listed) return listed;
  if (syllableCount(lower) < 2) return lower;

  if (/ok$/u.test(lower) && !/(?:rok|skok|blok)$/u.test(lower) && !KEEP_OK.has(lower)) {
    return `${lower.slice(0, -2)}k`;
  }
  for (const [pattern, replacement] of MASCULINE_MOBILE_VOWEL) {
    if (pattern.test(lower)) return lower.replace(pattern, replacement);
  }
  return lower;
}

/** -ami after a dropped vowel or m (koncami, domami), -mi otherwise (stolmi). */
function masculineInstrumentalPlural(lower: string, stem: string): string {
  return stem.length < lower.length || stem.endsWith("m") ? `${stem}ami` : `${stem}mi`;
}

/** Hard -ý / -y / -í / -i nouns decline like adjectives: dospelý → dospelého. */
function adjectivalMasculineForms(lower: string): NounForms | null {
  const parts = adjectiveParts(lower);
  if (!parts) return null;
  const [stem, endings] = parts;
  return {
    singular: endings
      .filter((ending) => !FEMININE_OR_NEUTER_ENDINGS.has(ending))
      .map((ending) => `${stem}${ending}`),
    plural: [],
  };
}

function animateNominativePlural(lower: string, stem: string): string[] {
  const listed = ANIMATE_NOMINATIVE_PLURAL[lower];
  if (listed) return listed;
  if (/(?:teľ|[cčďjľňšťž]an|slovan)$/u.test(lower)) return [inflect(stem, "ia")];
  if (stem.endsWith("ch")) return [`${stem.slice(0, -2)}si`];
  if (/[gh]$/u.test(stem)) return [`${stem}ovia`];
  if (stem.endsWith("k")) return [`${stem.slice(0, -1)}ci`];
  return [inflect(stem, "i")];
}

/** chlap (-ovi, technici), hrdina, dedo, and adjectival nouns (dospelý). */
function masculineAnimateForms(lower: string): NounForms {
  const adjectival = adjectivalMasculineForms(lower);
  if (adjectival) return adjectival;

  if (lower.endsWith("a")) {
    const stem = lower.slice(0, -1);
    return {
      singular: [`${stem}u`, `${stem}ovi`, `${stem}om`],
      plural: [
        /(?:ist|ast|it)a$/u.test(lower) ? `${stem}i` : `${stem}ovia`,
        `${stem}ov`,
        `${stem}och`,
        `${stem}ami`,
      ],
    };
  }
  if (lower.endsWith("o")) {
    const stem = lower.slice(0, -1);
    return {
      singular: [`${stem}a`, `${stem}ovi`, `${stem}om`],
      plural: [`${stem}ovia`, `${stem}ov`, `${stem}och`, `${stem}mi`],
    };
  }
  if (VOWEL_FINAL.test(lower)) return NO_FORMS;

  const stem = masculineStem(lower);
  return {
    singular: [`${stem}a`, `${stem}ovi`, `${stem}om`],
    plural: [
      ...animateNominativePlural(lower, stem),
      `${stem}ov`,
      `${stem}och`,
      masculineInstrumentalPlural(lower, stem),
    ],
  };
}

/** Hard stems with locative -i: materiáli, hoteli, softvéri. */
const MASCULINE_LOCATIVE_I = /(?:ál|[^i]el|ér)$/u;

/**
 * dub and stroj types. The genitive -a / -u is lexical: -u unless listed
 * (odrazu, jazyka), but soft stems, -ík and -ček take -a. Kalendár, papier and
 * meter (metra, metre) decline like stroj. Place names take -a (z Prešova).
 */
function masculineInanimateForms(lower: string, place: boolean): NounForms {
  if (VOWEL_FINAL.test(lower)) return NO_FORMS;

  const stem = masculineStem(lower);
  const soft =
    SOFT_FINAL.test(stem) ||
    (/(?:ár|iar|ier)$/u.test(stem) && syllableCount(stem) > 1) ||
    (/[bdtn]r$/u.test(stem) && lower.endsWith("er"));
  const genitives = GENITIVE_U.has(lower)
    ? ["u"]
    : place || soft || GENITIVE_A.has(lower) || /(?:ík|ček)$/u.test(lower)
      ? ["a"]
      : GENITIVE_A_OR_U.has(lower)
        ? ["a", "u"]
        : ["u"];
  const locative = LOCATIVE_SINGULAR[lower]
    ? `${stem}${LOCATIVE_SINGULAR[lower]}`
    : soft
      ? inflect(stem, "i")
      : /(?:k|g|h|ch)$/u.test(stem)
        ? `${stem}u`
        : `${stem}${MASCULINE_LOCATIVE_I.test(stem) ? "i" : "e"}`;

  return {
    singular: [
      ...genitives.map((ending) => `${stem}${ending}`),
      `${stem}u`,
      locative,
      `${stem}om`,
    ],
    plural: [
      soft ? inflect(stem, "e") : `${stem}y`,
      `${stem}ov`,
      `${stem}och`,
      masculineInstrumentalPlural(lower, stem),
    ],
  };
}

/** mesto: -e in the locative, -u after k, g, h or a vowel (v jablku, v rádiu). */
function mestoForms(stem: string): NounForms {
  if (!stem) return NO_FORMS;
  const short = longLastSyllable(stem);
  const locative = /(?:[kgh]|[aáäeéiíoóôuúyý])$/u.test(stem) ? "u" : "e";
  return {
    singular: [`${stem}a`, `${stem}u`, `${stem}${locative}`, `${stem}om`],
    plural: [
      `${stem}${short ? "a" : "á"}`,
      `${stem}${short ? "am" : "ám"}`,
      `${stem}${short ? "ach" : "ách"}`,
      `${stem}ami`,
    ],
  };
}

/** mesto, srdce / pole, vysvedčenie, dievča, and -um loans (centrum, múzeum). */
function neuterForms(lower: string): NounForms {
  if (lower.endsWith("ie")) {
    const stem = lower.slice(0, -2);
    return {
      singular: [`${stem}ia`, `${stem}iu`, `${stem}í`, `${stem}ím`],
      plural: [`${stem}ia`, `${stem}í`, `${stem}iam`, `${stem}iach`, `${stem}iami`],
    };
  }
  if (lower.endsWith("um")) {
    const stem = lower.slice(0, -2);
    if (!VOWEL_FINAL.test(stem)) return mestoForms(stem);
    return {
      singular: [`${stem}a`, `${stem}u`, `${stem}om`],
      plural: [`${stem}á`, `${stem}í`, `${stem}ám`, `${stem}ách`, `${stem}ami`],
    };
  }
  if (lower.endsWith("o")) return mestoForms(lower.slice(0, -1));
  if (lower.endsWith("e")) {
    // finále and skóre do not decline.
    if (/(?:finále|skóre)$/u.test(lower)) return NO_FORMS;
    const stem = soften(lower.slice(0, -1));
    const short = longLastSyllable(stem);
    return {
      singular: [`${stem}a`, `${stem}u`, inflect(stem, "i"), `${stem}om`],
      plural: [
        inflect(stem, short ? "a" : "ia"),
        inflect(stem, short ? "am" : "iam"),
        inflect(stem, short ? "ach" : "iach"),
        `${stem}ami`,
      ],
    };
  }
  if (/[aä]$/u.test(lower)) {
    return {
      singular: [`${lower}ťa`, `${lower}ťu`, `${lower}ti`, `${lower}ťom`],
      plural: [`${lower}tá`, `${lower}t`, `${lower}tám`, `${lower}tách`, `${lower}tami`],
    };
  }
  return NO_FORMS;
}

/**
 * Plural-only nouns: ústa, financie, and -y / -e plurals, which are feminine
 * (noviny, nohavice) or masculine (preteky, okuliare), so both sets are keys.
 */
function pluralOnlyForms(lower: string): string[] {
  if (lower.endsWith("ie")) {
    const stem = lower.slice(0, -1);
    return [`${stem}í`, `${stem}ám`, `${stem}ách`, `${stem}ami`];
  }
  if (/[aá]$/u.test(lower)) {
    const stem = lower.slice(0, -1);
    if (stem.endsWith("i")) return [`${stem}am`, `${stem}ach`, `${stem.slice(0, -1)}ami`];
    const short = longLastSyllable(stem);
    return [
      `${stem}${short ? "am" : "ám"}`,
      `${stem}${short ? "ach" : "ách"}`,
      `${stem}ami`,
    ];
  }
  if (/[ye]$/u.test(lower)) {
    const stem = lower.endsWith("e") ? soften(lower.slice(0, -1)) : lower.slice(0, -1);
    const short = longLastSyllable(stem);
    const feminine = lower.endsWith("y")
      ? [`${stem}${short ? "am" : "ám"}`, `${stem}${short ? "ach" : "ách"}`]
      : [inflect(stem, short ? "am" : "iam"), inflect(stem, short ? "ach" : "iach")];
    return [
      ...feminine,
      `${stem}ami`,
      `${stem}ov`,
      `${stem}om`,
      `${stem}och`,
      `${stem}mi`,
    ];
  }
  return [];
}

/** Places and the few nouns without a gender: guess it from the ending. */
function inferredGender(lower: string): string | undefined {
  if (lower.endsWith("a")) return "feminine";
  if (/(?:o|e|um)$/u.test(lower)) return "neuter";
  return VOWEL_FINAL.test(lower) ? undefined : "masculine-inanimate";
}

function nounForms(lemma: string, category: string, gender?: string): string[] {
  const lower = lemma.toLocaleLowerCase("sk");
  const irregular = IRREGULAR_NOUNS[lower];
  if (irregular) return irregular;
  if (gender === "plural-only") return pluralOnlyForms(lower);

  // Place names in -e, -é or -y are plural or adjectival (Košice, Humenné, Tatry).
  const place = category === "Places";
  if (place && /[eéy]$/u.test(lower)) return [];

  let forms = NO_FORMS;
  switch (gender ?? inferredGender(lower)) {
    case "feminine":
      forms = feminineForms(lower);
      break;
    case "masculine-animate":
      forms = masculineAnimateForms(lower);
      break;
    case "masculine-inanimate":
      forms = masculineInanimateForms(lower, place);
      break;
    case "neuter":
      forms = neuterForms(lower);
      break;
  }

  return place || SINGULAR_ONLY.has(lower)
    ? forms.singular
    : [...forms.singular, ...forms.plural];
}

const formCache = new Map<string, string[]>();

/**
 * Extra searchable tokens for a dictionary lemma.
 * Excludes the lemma itself (already indexed as title).
 * Nouns need their gender (náplň → náplne, not náplňa); without it the ending decides.
 */
export function searchFormsForLemma(
  slovak: string,
  category: string,
  gender?: string,
): string[] {
  const cacheKey = `${category}\0${gender ?? ""}\0${slovak}`;
  const cached = formCache.get(cacheKey);
  if (cached) return cached;

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
      forms = nounForms(slovak, category, gender);
      break;
    case "Adverbs":
    case "Phrases":
      // Fixed phrases / function words / adverbs — no productive inflection index.
      forms = [];
      break;
    default:
      forms = [];
  }

  const filtered = uniqueForms(forms).filter(
    (form) => form.toLocaleLowerCase("sk") !== lower,
  );
  formCache.set(cacheKey, filtered);
  return filtered;
}

/**
 * Whether {@link searchFormsForLemma} gives real forms of this word, so a page may
 * show them as its forms. Other paradigms stay search keys only: their guesses
 * (pesa for pes, čítám for čítať) must never reach a learner as Slovak.
 */
export function formsVerified(
  slovak: string,
  category: string,
  gender?: string,
): boolean {
  const lower = slovak.toLocaleLowerCase("sk").replace(/ s[ai]$/u, "");

  if (category === "Adjectives") return adjectiveParts(lower) !== null;

  if (category === "Verbs") {
    if (resolveIrregular(lower)) return true;
    if (/(?:ovať|ávať)$/u.test(lower)) return true;
    const stem = lower.slice(0, -2);
    return (
      lower.endsWith("iť") && !lower.endsWith("ieť") && /[aáäeéiíoóôuúyý]/u.test(stem)
    );
  }

  if (category === "Nouns") {
    // Hard and soft -a feminines (žena, ulica) and hard -o neuters (mesto), short stems only.
    const feminine = gender === "feminine" && lower.endsWith("a");
    const neuter = gender === "neuter" && lower.endsWith("o");
    const stem = lower.slice(0, -1);
    return (
      (feminine || neuter) &&
      /[^aáäeéiíoóôuúyý]$/u.test(stem) &&
      (feminine || !SOFT_FINAL.test(stem)) &&
      !longLastSyllable(stem)
    );
  }

  return false;
}

/** @internal exported for unit tests */
export function conjugateVerbForTest(lemma: string): string[] {
  return uniqueForms(conjugateVerb(lemma));
}
