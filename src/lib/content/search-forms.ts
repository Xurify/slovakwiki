/**
 * Heuristic Slovak surface forms for dictionary search (Pagefind + in-app).
 * Not a full paradigm — covers common person / agreement shapes learners type.
 */

const LONG_VOWEL = /[áäéíóôúý]/u;

/**
 * High-frequency irregular bases — hand list beats broken heuristics.
 * Prefixed verbs inherit via {@link resolveIrregular} when the base is prefixable.
 */
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
  // ísť derivatives keep their own stems — do not prefix from ísť.
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
  dôjsť: ["dôjdem", "dôjdeš", "dôjde", "došiel", "došla"],
  vyjsť: ["vyjdem", "vyjdeš", "vyjde", "vyšiel", "vyšla"],
  zájsť: ["zájdem", "zájdeš", "zájde", "zašiel", "zašla"],
  vojsť: ["vojdem", "vojdeš", "vojde", "vošiel", "vošla"],
  ujsť: ["ujdem", "ujdeš", "ujde", "ušiel", "ušla"],
  zísť: ["zídem", "zídeš", "zíde", "zišiel", "zišla"],
  obísť: ["obídem", "obídeš", "obíde", "obišiel", "obišla"],
  prejsť: ["prejdem", "prejdeš", "prejde", "prešiel", "prešla"],
  podísť: ["podídem", "podídeš", "podíde", "podišiel", "podišla"],
  rozísť: ["rozídem", "rozídeš", "rozíde", "rozišiel", "rozišla"],
  vzísť: ["vzídem", "vzídeš", "vzíde", "vzišiel", "vzišla"],
  neísť: ["neidem", "neideš", "neide", "neideme", "neidete", "neidú"],
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
  vziať: ["vezmem", "vezmeš", "vezme", "vezmeme", "vezmete", "vezmú", "vzal", "vzala"],
  dať: ["dám", "dáš", "dá", "dáme", "dáte", "dajú", "dal", "dala", "dalo", "dali"],
  povedať: ["poviem", "povieš", "povie", "povieme", "poviete", "povedia", "povedal"],
  brať: [
    "beriem",
    "berieš",
    "berie",
    "berieme",
    "beriete",
    "berú",
    "ber",
    "berte",
    "bral",
    "brala",
    "bralo",
    "brali",
  ],
  prať: [
    "periem",
    "perieš",
    "perie",
    "perieme",
    "periete",
    "perú",
    "per",
    "perte",
    "pral",
  ],
  písať: [
    "píšem",
    "píšeš",
    "píše",
    "píšeme",
    "píšete",
    "píšu",
    "píš",
    "píšte",
    "písal",
    "písala",
  ],
  kázať: ["kážem", "kážeš", "káže", "kážeme", "kážete", "kážu", "káž", "kážte", "kázal"],
  plakať: [
    "plačem",
    "plačeš",
    "plače",
    "plačeme",
    "plačete",
    "plačú",
    "plač",
    "plačte",
    "plakal",
  ],
  skákať: [
    "skáčem",
    "skáčeš",
    "skáče",
    "skáčeme",
    "skáčete",
    "skáču",
    "skáč",
    "skáčte",
    "skákal",
  ],
  hádzať: [
    "hádžem",
    "hádžeš",
    "hádže",
    "hádžeme",
    "hádžete",
    "hádžu",
    "hádž",
    "hádžte",
    "hádzal",
  ],
  lámať: ["lámem", "lámeš", "láme", "lámeme", "lámete", "lámu", "lámal"],
  orať: ["orem", "oreš", "ore", "oreme", "orete", "orú", "oral"],
  klamať: ["klamem", "klameš", "klame", "klameme", "klamete", "klamú", "klamal"],
  viazať: ["viažem", "viažeš", "viaže", "viažeme", "viažete", "viažu", "viazal"],
  kopať: ["kopem", "kopeš", "kope", "kopeme", "kopete", "kopú", "kopal"],
  spať: [
    "spím",
    "spíš",
    "spí",
    "spíme",
    "spíte",
    "spia",
    "spi",
    "spite",
    "spal",
    "spala",
  ],
  stáť: [
    "stojím",
    "stojíš",
    "stojí",
    "stojíme",
    "stojíte",
    "stoja",
    "stál",
    "stála",
    "stálo",
  ],
  báť: ["bojím", "bojíš", "bojí", "bojíme", "bojíte", "boja", "bál", "bála"],
  // Soft -ať / -ieť → -ím (also covered by heuristics; listed for prefix inheritance).
  bežať: ["bežím", "bežíš", "beží", "bežíme", "bežíte", "bežia", "bežal"],
  ležať: ["ležím", "ležíš", "leží", "ležíme", "ležíte", "ležia", "ležal"],
  držať: ["držím", "držíš", "drží", "držíme", "držíte", "držia", "držal"],
  kričať: ["kričím", "kričíš", "kričí", "kričíme", "kričíte", "kričia", "kričal"],
  mlčať: ["mlčím", "mlčíš", "mlčí", "mlčíme", "mlčíte", "mlčia", "mlčal"],
  trčať: ["trčím", "trčíš", "trčí", "trčíme", "trčíte", "trčia", "trčal"],
  sedieť: ["sedím", "sedíš", "sedí", "sedíme", "sedíte", "sedia", "sedel"],
  horieť: ["horím", "horíš", "horí", "horíme", "horíte", "horia", "horel"],
  bolieť: ["bolím", "bolíš", "bolí", "bolíme", "bolíte", "bolia", "bolel"],
  visieť: ["visím", "visíš", "visí", "visíme", "visíte", "visia", "visel"],
  trpieť: ["trpím", "trpíš", "trpí", "trpíme", "trpíte", "trpia", "trpel"],
  myslieť: ["myslím", "myslíš", "myslí", "myslíme", "myslíte", "myslia", "myslel"],
  hľadieť: ["hľadím", "hľadíš", "hľadí", "hľadíme", "hľadíte", "hľadia", "hľadel"],
  vravieť: ["vravím", "vravíš", "vraví", "vravíme", "vravíte", "vravia", "vravel"],
  // Consonant-stem infinitives.
  niesť: [
    "nesiem",
    "nesieš",
    "nesie",
    "nesieme",
    "nesiete",
    "nesú",
    "nes",
    "neste",
    "niesol",
    "niesla",
  ],
  viesť: [
    "vediem",
    "vedieš",
    "vedie",
    "vedieme",
    "vediete",
    "vedú",
    "veď",
    "veďte",
    "viedol",
    "viedla",
  ],
  viezť: [
    "veziem",
    "vezieš",
    "vezie",
    "vezieme",
    "veziete",
    "vezú",
    "vez",
    "vezte",
    "viezol",
    "viezla",
  ],
  rásť: [
    "rastiem",
    "rastieš",
    "rastie",
    "rastieme",
    "rastiete",
    "rastú",
    "rastol",
    "rastla",
  ],
  piecť: ["pečiem", "pečieš", "pečie", "pečieme", "pečiete", "pečú", "piekol", "piekla"],
  tiecť: ["tečiem", "tečieš", "tečie", "tečieme", "tečiete", "tečú", "tiekol", "tiekla"],
  liezť: ["leziem", "lezieš", "lezie", "lezieme", "leziete", "lezú", "liezol", "liezla"],
  klásť: [
    "kladiem",
    "kladieš",
    "kladie",
    "kladieme",
    "kladiete",
    "kladú",
    "kladol",
    "kladla",
  ],
  pásť: ["pasiem", "pasieš", "pasie", "pasieme", "pasiete", "pasú", "pásol", "pásla"],
  // Short -iť / -yť.
  piť: [
    "pijem",
    "piješ",
    "pije",
    "pijeme",
    "pijete",
    "pijú",
    "pi",
    "pite",
    "pil",
    "pila",
  ],
  biť: [
    "bijem",
    "biješ",
    "bije",
    "bijeme",
    "bijete",
    "bijú",
    "bi",
    "bite",
    "bil",
    "bila",
  ],
  šiť: [
    "šijem",
    "šiješ",
    "šije",
    "šijeme",
    "šijete",
    "šijú",
    "ši",
    "šite",
    "šil",
    "šila",
  ],
  žiť: [
    "žijem",
    "žiješ",
    "žije",
    "žijeme",
    "žijete",
    "žijú",
    "ži",
    "žite",
    "žil",
    "žila",
  ],
  kryť: ["kryjem", "kryješ", "kryje", "kryjeme", "kryjete", "kryjú", "kryl", "kryla"],
  myť: ["myjem", "myješ", "myje", "myjeme", "myjete", "myjú", "myl", "myla"],
  // -nem / -ujem irregulars.
  stať: ["stanem", "staneš", "stane", "staneme", "stanete", "stanú", "stal", "stala"],
  ostať: [
    "ostanem",
    "ostaneš",
    "ostane",
    "ostaneme",
    "ostanete",
    "ostanú",
    "ostal",
    "ostala",
  ],
  začať: ["začnem", "začneš", "začne", "začneme", "začnete", "začnú", "začal", "začala"],
  počuť: [
    "počujem",
    "počuješ",
    "počuje",
    "počujeme",
    "počujete",
    "počujú",
    "počul",
    "počula",
  ],
  priať: ["prajem", "praješ", "praje", "prajeme", "prajete", "prajú", "prial", "priala"],
  smieť: ["smiem", "smieš", "smie", "smieme", "smiete", "smejú", "smel", "smela"],
  umrieť: ["umriem", "umrieš", "umrie", "umrieme", "umriete", "umrú", "umrel", "umrela"],
  zomrieť: [
    "zomriem",
    "zomrieš",
    "zomrie",
    "zomrieme",
    "zomriete",
    "zomrú",
    "zomrel",
    "zomrela",
  ],
  hnať: [
    "ženem",
    "ženieš",
    "ženie",
    "ženieme",
    "ženiete",
    "ženú",
    "žeň",
    "žeňte",
    "hnal",
    "hnala",
  ],
  rozumieť: [
    "rozumiem",
    "rozumieš",
    "rozumie",
    "rozumieme",
    "rozumiete",
    "rozumejú",
    "rozumel",
    "rozumela",
  ],
};

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
