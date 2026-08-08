/**
 * Heuristic Slovak surface forms for dictionary search (Pagefind + in-app).
 * Not a full paradigm — covers common person / agreement shapes learners type.
 */

const LONG_VOWEL = /[áäéíóôúý]/u;

/** High-frequency irregulars — hand list beats broken heuristics. */
const IRREGULAR: Record<string, string[]> = {
  byť: [
    "som",
    "si",
    "je",
    "sme",
    "ste",
    "sú",
    "bol",
    "bola",
    "bolo",
    "boli",
    "budem",
    "budeš",
    "bude",
    "budeme",
    "budete",
    "budú",
  ],
  mať: ["mám", "máš", "má", "máme", "máte", "majú", "mal", "mala", "malo", "mali"],
  ísť: [
    "idem",
    "ideš",
    "ide",
    "ideme",
    "idete",
    "idú",
    "išiel",
    "išla",
    "išlo",
    "išli",
    "pôjdem",
    "pôjdeš",
    "pôjde",
  ],
  chodiť: ["chodím", "chodíš", "chodí", "chodíme", "chodíte", "chodia", "chodil"],
  jesť: ["jem", "ješ", "je", "jeme", "jete", "jedia", "jedol", "jedla", "jedlo", "jedli"],
  vedieť: [
    "viem",
    "vieš",
    "vie",
    "vieme",
    "viete",
    "vedia",
    "vedel",
    "vedela",
    "vedelo",
    "vedeli",
  ],
  vidieť: [
    "vidím",
    "vidíš",
    "vidí",
    "vidíme",
    "vidíte",
    "vidia",
    "videl",
    "videla",
    "videlo",
    "videli",
  ],
  môcť: [
    "môžem",
    "môžeš",
    "môže",
    "môžeme",
    "môžete",
    "môžu",
    "mohol",
    "mohla",
    "mohlo",
    "mohli",
  ],
  musieť: [
    "musím",
    "musíš",
    "musí",
    "musíme",
    "musíte",
    "musia",
    "musel",
    "musela",
    "muselo",
    "museli",
  ],
  chcieť: [
    "chcem",
    "chceš",
    "chce",
    "chceme",
    "chcete",
    "chcú",
    "chcel",
    "chcela",
    "chcelo",
    "chceli",
  ],
  prísť: [
    "prídem",
    "prídeš",
    "príde",
    "prídeme",
    "prídete",
    "prídu",
    "prišiel",
    "prišla",
  ],
  odísť: ["odídem", "odídeš", "odíde", "odišiel", "odišla"],
  nájsť: ["nájdem", "nájdeš", "nájde", "našiel", "našla"],
  vziať: ["vezmem", "vezmeš", "vezme", "vezmeme", "vezmete", "vezmú", "vzal", "vzala"],
  dať: ["dám", "dáš", "dá", "dáme", "dáte", "dajú", "dal", "dala", "dalo", "dali"],
  povedať: ["poviem", "povieš", "povie", "povieme", "poviete", "povedia", "povedal"],
};

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

function conjugateVerb(lemma: string): string[] {
  const reflexive = lemma.toLocaleLowerCase("sk").endsWith(" sa");
  const lower = reflexive
    ? lemma.toLocaleLowerCase("sk").slice(0, -3)
    : lemma.toLocaleLowerCase("sk");
  const irregular = IRREGULAR[lower];
  if (irregular) {
    return reflexive ? irregular.map((form) => `${form} sa`) : [...irregular];
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
    const base = lower.slice(0, -1);
    const pastStem = lower.slice(0, -3);
    forms = [
      ...personFromBase(base, ["m", "š", "", "me", "te", "jú"]),
      `${pastStem}el`,
      `${pastStem}ela`,
      `${pastStem}elo`,
      `${pastStem}eli`,
    ];
  } else if (lower.endsWith("iť")) {
    const stem = lower.slice(0, -2);
    const short = LONG_VOWEL.test(stem);
    const person = short
      ? personFromBase(stem, ["im", "iš", "i", "ime", "ite", "ia"])
      : personFromBase(stem, ["ím", "íš", "í", "íme", "íte", "ia"]);
    forms = [...person, `${stem}il`, `${stem}ila`, `${stem}ilo`, `${stem}ili`];
  } else if (lower.endsWith("ať")) {
    const stem = lower.slice(0, -2);
    forms = [
      ...personFromBase(stem, ["ám", "áš", "á", "áme", "áte", "ajú"]),
      `${stem}al`,
      `${stem}ala`,
      `${stem}alo`,
      `${stem}ali`,
    ];
  } else if (lower.endsWith("eť") || lower.endsWith("yť") || lower.endsWith("uť")) {
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
