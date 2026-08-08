/**
 * Fill remaining empty dictionary examples with safe curated templates,
 * and add imperfective/perfective pattern pairs.
 *
 * Usage: bun scripts/dictionary/fill-empty-examples.ts
 * Then: bun scripts/dictionary/apply-curated-examples.ts
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { words } from "../../src/lib/content/data";
import { isDamagedExampleTemplate } from "../../src/lib/content/example-quality";
import type { Example } from "../../src/lib/content/types";
import { ROOT } from "../lib/paths";

const CURATED_PATH = path.join(ROOT, "content", "dictionary", "curated-examples.json");

function firstGloss(english: string): string {
  return english
    .split(";")[0]!
    .replace(/\s*\([^)]*\)/gu, "")
    .replace(/^not\s+to\s+/iu, "")
    .replace(/^to\s+/iu, "")
    .replace(/\s+\bit\b$/iu, "")
    .replace(/\s+/gu, " ")
    .trim();
}

type VerbFrame =
  | "negated"
  | "stative"
  | "event"
  | "with_person"
  | "person_object"
  | "perception_si"
  | "perception"
  | "acknowledge"
  | "motion"
  | "activity"
  | "change"
  | "transitive";

/** Lemmas that usually need si in this citation form. */
const SI_PERCEPTION = new Set([
  "uvedomovať",
  "všimnúť",
  "nevšimnúť",
  "pomyslieť",
  "zamyslieť",
]);

/** Lemmas that usually need sa in event/possibility frames. */
const SA_EVENT = new Set([
  "dariť",
  "diať",
  "nedariť",
  "vyskytovať",
  "vyskytnúť",
  "nepodariť",
  "pribudnúť",
  "snažiť",
  "udiať",
  "odohrávať",
  "vznikať",
]);

function englishVerbGloss(english: string): string {
  let bare = firstGloss(english)
    .replace(/^to\s+/i, "")
    .trim();

  if (/^(cannot|can't)$/i.test(bare)) return "be able to";
  if (/^can$/i.test(bare)) return "be able to";
  if (/^must$/i.test(bare)) return "have to";
  if (/^not\s+/i.test(bare)) bare = bare.replace(/^not\s+/i, "").trim();
  return bare;
}

function classifyVerbFrame(slovak: string, bareGloss: string): VerbFrame {
  const gloss = bareGloss.toLowerCase();
  const lemma = slovak.toLocaleLowerCase("sk");

  if (lemma.startsWith("ne")) return "negated";
  if (SA_EVENT.has(lemma)) return "event";

  if (
    /contain|include|mean|weigh|equal|belong|consist|concern|regard|exist|constitute|amount|depend|apply to|refer|comprise|represent|correspond|differ|resemble|lack|suffice|seem|be related|be based|be added/i.test(
      gloss,
    )
  ) {
    return "stative";
  }

  if (
    /occur|happen|take place|arise|emerge|appear|follow\b|go well|not to succeed/i.test(
      gloss,
    )
  ) {
    return "event";
  }

  if (
    /say goodbye|discuss|talk|negotiate|converse|chat|argue with|speak with/i.test(gloss)
  ) {
    return "with_person";
  }

  if (
    /invite|meet|visit|help|thank|love|hate|kiss|hug|marry|know\b|recognize/i.test(gloss)
  ) {
    return "person_object";
  }

  if (/admit|acknowledge|confess|concede|allow|permit|tolerate|suppose/i.test(gloss)) {
    return "acknowledge";
  }

  if (/notice|look|feel|smell|taste|watch|observe|listen|see\b/i.test(gloss)) {
    return SI_PERCEPTION.has(lemma) ? "perception_si" : "perception";
  }

  if (
    /go\b|come|walk|run|drive|fly|travel|arrive|leave|return|enter|exit|move|fall|rise|climb|swim|descend|overcome/i.test(
      gloss,
    )
  ) {
    return "motion";
  }

  if (
    /increase|decrease|raise|reduce|improve|change|grow|shrink|expand|strengthen|weaken|accelerate|slow/i.test(
      gloss,
    )
  ) {
    return "change";
  }

  if (
    /sleep|laugh|cry|smile|wait|work|play|rest|sit|stand|lie|live|die|dream|think|hope|fear/i.test(
      gloss,
    )
  ) {
    return "activity";
  }

  return "transitive";
}

function verbExample(slovak: string, english: string): Example {
  const bare = englishVerbGloss(english);
  const lemma = slovak.toLocaleLowerCase("sk");
  const frame = classifyVerbFrame(slovak, bare);

  switch (frame) {
    case "negated":
      return {
        slovak: `Je ťažké ${slovak}.`,
        english: `It is hard to ${bare}.`,
        note: "Curated",
      };
    case "stative":
      return {
        slovak: `To môže ${slovak}.`,
        english: `That can ${bare}.`,
        note: "Curated",
      };
    case "event":
      if (SA_EVENT.has(lemma)) {
        return {
          slovak: `Môže sa to ${slovak}.`,
          english: `It can ${bare}.`,
          note: "Curated",
        };
      }
      return {
        slovak: `Môže to ${slovak}.`,
        english: `It can ${bare}.`,
        note: "Curated",
      };
    case "with_person":
      return {
        slovak: `Chcem s tebou ${slovak}.`,
        english: `I want to ${bare} with you.`,
        note: "Curated",
      };
    case "person_object":
      return {
        slovak: `Chcem ťa ${slovak}.`,
        english: `I want to ${bare} you.`,
        note: "Curated",
      };
    case "perception_si":
      return {
        slovak: `Chcem si to ${slovak}.`,
        english: `I want to ${bare} it.`,
        note: "Curated",
      };
    case "perception":
      return {
        slovak: `Snažím sa ${slovak}.`,
        english: `I'm trying to ${bare}.`,
        note: "Curated",
      };
    case "acknowledge":
      return {
        slovak: `Musím ${slovak}, že som sa mýlil.`,
        english: `I have to ${bare} that I was wrong.`,
        note: "Curated",
      };
    case "change":
      return {
        slovak: `Chcem ${slovak} kvalitu.`,
        english: `I want to ${bare} the quality.`,
        note: "Curated",
      };
    case "transitive":
      return {
        slovak: `Chcem ${slovak}.`,
        english: `I want to ${bare}.`,
        note: "Curated",
      };
    case "motion":
    case "activity":
      return {
        slovak: `Chcem ${slovak}.`,
        english: `I want to ${bare}.`,
        note: "Curated",
      };
  }
}

type AdjFrame =
  "person" | "house" | "project" | "work" | "neuter" | "relational" | "attributive";

function hashPick<T>(key: string, options: readonly T[]): T {
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) >>> 0;
  }
  return options[hash % options.length]!;
}

function classifyAdjectiveFrame(slovak: string, gloss: string): AdjFrame {
  const g = gloss.toLowerCase();
  const lemma = slovak.toLocaleLowerCase("sk");

  // Host gender must match citation ending — never Tá práca + mužský tvar.
  if (/á$/i.test(slovak)) return "work";
  if (/é$/i.test(slovak)) return "neuter";

  if (/(ský|cký|ov)$/iu.test(lemma)) return "relational";

  if (
    /\b(kind|brave|smart|clever|honest|friendly|happy|sad|angry|calm|patient|lazy|rich|poor|young|old|nice|polite|rude|funny|serious|proud|shy|wise|stupid|good|bad|evil|cruel|gentle|loyal|jealous|nervous|tired|ill|sick|healthy|strong|weak|famous|popular|lonely|lucky|careful|careless|selfish|generous|strict|fair|unfair|silent|noisy|busy|free|alive|dead|married|single|drunk|sober|awake|asleep)\b/i.test(
      g,
    )
  ) {
    return "person";
  }

  if (
    /\b(big|small|large|tiny|long|short|tall|wide|narrow|high|low|heavy|light|new|empty|full|open|closed|clean|dirty|hot|cold|warm|soft|hard|fast|slow|thick|thin|deep|shallow|round|flat|sharp|dull|bright|dark|wet|dry|quiet|loud|cheap|expensive|beautiful|ugly|modern|ancient|wooden|metal|glass|broken|fresh|raw|ripe|sweet|sour|bitter|salty)\b/i.test(
      g,
    )
  ) {
    return "house";
  }

  if (
    /\b(important|useful|necessary|difficult|easy|possible|impossible|ready|special|main|basic|key|official|public|private|legal|illegal|professional|financial|political|social|cultural|technical|scientific|economic|military|national|international|local|global|central|final|initial|current|previous|next|future|past|common|rare|typical|normal|strange|odd|clear|unclear|simple|complex|general|specific|positive|negative|active|passive|effective|efficient|successful|failed|safe|dangerous|risk|available|missing|complete|incomplete|correct|wrong|true|false|real|fake|original|similar|different|equal|unique|ordinary|electronic|electric|industrial|investment|visual|commercial|strategic|monetary|medical|agricultural|constitutional|presidential|parliamentary|religious|church|tourist|residential|energy|critical|ideal|dramatic|available|global|media|royal|moral|adjacent|costly|recent|distinct|absolute|binding|dance|championship|written|color|colour|steady|complex|evening|market|present|long-term|research|personnel|staff|communication|potential|peace|news|reporting|skilled|clever)\b/i.test(
      g,
    )
  ) {
    return "project";
  }

  // Prefer plán hosts over byt for unknown domain leftovers.
  return hashPick(lemma, ["attributive", "project"] as const);
}

function adjectiveExample(slovak: string, english: string): Example {
  const gloss = firstGloss(english);
  const frame = classifyAdjectiveFrame(slovak, gloss);

  switch (frame) {
    case "person":
      return {
        slovak: `Ten muž je ${slovak}.`,
        english: `That man is ${gloss}.`,
        note: "Curated",
      };
    case "house":
      return {
        slovak: `Hľadám ${slovak} byt.`,
        english: `I'm looking for ${article(gloss)}${gloss} flat.`,
        note: "Curated",
      };
    case "project":
      return {
        slovak: `Hľadáme ${slovak} plán.`,
        english: `We're looking for ${article(gloss)}${gloss} plan.`,
        note: "Curated",
      };
    case "attributive":
      return {
        slovak: `Potrebujeme ${slovak} plán.`,
        english: `We need ${article(gloss)}${gloss} plan.`,
        note: "Curated",
      };
    case "work":
      // Predicative keeps citation -á form (no accusative inflection needed).
      return {
        slovak: `Tá práca je ${slovak}.`,
        english: `That job is ${gloss}.`,
        note: "Curated",
      };
    case "neuter":
      return {
        slovak: `To riešenie je ${slovak}.`,
        english: `That solution is ${gloss}.`,
        note: "Curated",
      };
    case "relational":
      return {
        slovak: `To je ${slovak} podnik.`,
        english: `That is ${article(gloss.replace(/^of\s+/iu, ""))}${gloss.replace(/^of\s+/iu, "")} company.`,
        note: "Curated",
      };
  }
}

/** Lemmas that are plural or plurale tantum — need "Toto sú", not "Toto je". */
const PLURAL_NOUNS = new Set([
  "ľudia",
  "deti",
  "peniaze",
  "dvere",
  "ústá",
  "ústa",
  "okuliare",
  "nožnice",
  "šaty",
  "financie",
  "vianoce",
  "prázdniny",
  "noviny",
  "dáta",
  "data",
]);

type NounFrame = "plural" | "person" | "place" | "measure" | "thing";

function nounGenderNumeral(slovak: string): { sk: string; en: string } {
  const lemma = slovak.toLocaleLowerCase("sk");
  if (/[aá]$/u.test(lemma) || /osť$/u.test(lemma)) {
    return { sk: "Jedna", en: "One" };
  }
  if (/[oé]$/u.test(lemma) || /ie$/u.test(lemma) || /um$/u.test(lemma)) {
    return { sk: "Jedno", en: "One" };
  }
  return { sk: "Jeden", en: "One" };
}

function classifyNounFrame(slovak: string, gloss: string): NounFrame {
  const lemma = slovak.toLocaleLowerCase("sk");
  if (PLURAL_NOUNS.has(lemma)) return "plural";

  const g = gloss.toLowerCase();
  if (
    /\b(teacher|student|pupil|doctor|nurse|man|woman|person|people|child|boy|girl|friend|father|mother|brother|sister|parent|worker|boss|king|queen|police|soldier|player|writer|artist|driver|guest|neighbor|neighbour|citizen|member|leader|expert|specialist|lawyer|judge|priest|cook|waiter|engineer|manager|author|actor|actress|singer|farmer|miner|pilot|sailor|officer|guard|thief|victim|witness|client|customer|patient|colleague|partner|owner|director|minister|president|mayor|priest|monk|nun|baby|teenager|adult|stranger|enemy|hero|fool|genius)\b/i.test(
      g,
    )
  ) {
    return "person";
  }
  if (
    /\b(school|station|city|town|village|park|street|road|house|home|flat|apartment|building|hospital|church|shop|store|market|office|room|hotel|restaurant|bridge|river|mountain|forest|garden|airport|university|library|museum|factory|bank|square|stop|place|country|region|district|capital|border|coast|island|lake|sea|ocean|valley|field|farm|yard|garage|kitchen|bathroom|bedroom|hall|cinema|theater|theatre|stadium|gym|pool|zoo|cafe|bar|pub|club|temple|mosque|castle|palace|tower|wall|door|window|floor|roof|basement|attic|prison|jail|court|embassy|ministry)\b/i.test(
      g,
    )
  ) {
    return "place";
  }
  if (
    /\b(unit|percent|percentage|part|piece|amount|sum|number|count|degree|level|rate|share|portion|dose|item|point|score|mark|grade|measure|quantity|size|length|width|height|weight|volume|pair|set|group|team|series|chapter|page|section|version|copy|example|case|instance|type|kind|sort|form|mode|phase|stage|step|layer|bit|byte|meter|metre|kilometer|kilometre|hour|minute|second|day|week|month|year|crown|euro|dollar|cent)\b/i.test(
      g,
    )
  ) {
    return "measure";
  }
  return "thing";
}

function nounExample(slovak: string, english: string): Example {
  const gloss = firstGloss(english);
  const frame = classifyNounFrame(slovak, gloss);

  switch (frame) {
    case "plural":
      return {
        slovak: `Toto sú ${slovak}.`,
        english: `These are ${gloss}.`,
        note: "Curated",
      };
    case "person":
      return {
        slovak: `To je ${slovak}.`,
        english: `That is ${article(gloss)}${gloss}.`,
        note: "Curated",
      };
    case "place":
      return {
        slovak: `Kde je ${slovak}?`,
        english: `Where is ${article(gloss)}${gloss}?`,
        note: "Curated",
      };
    case "measure": {
      const num = nounGenderNumeral(slovak);
      return {
        slovak: `${num.sk} ${slovak} stačí.`,
        english: `${num.en} ${gloss} is enough.`,
        note: "Curated",
      };
    }
    case "thing":
      return {
        slovak: `Toto je ${slovak}.`,
        english: `This is ${article(gloss)}${gloss}.`,
        note: "Curated",
      };
  }
}

function article(gloss: string): string {
  if (/^(a|an|the)\s/i.test(gloss)) return "";
  // Plural English glosses often end in s — skip article
  if (/\bs$/i.test(gloss) && !/ss$/i.test(gloss)) return "";
  // Mass / uncountable — no article
  if (
    /^(information|advice|news|evidence|equipment|research|knowledge|progress|traffic|weather|furniture|luggage|homework|money)\b/i.test(
      gloss,
    )
  ) {
    return "";
  }
  // "university", "unit", "euro" — /juː/ or consonant-like u
  if (/^uni/i.test(gloss) || /^eu/i.test(gloss) || /^one\b/i.test(gloss)) return "a ";
  if (/^[aeiou]/i.test(gloss)) return "an ";
  return "a ";
}

function placeExample(slovak: string): Example {
  const capital = slovak.charAt(0).toLocaleUpperCase("sk") + slovak.slice(1);
  return {
    slovak: `${capital} je pekné mesto.`,
    english: `${capital} is a nice city.`,
    note: "Curated",
  };
}

/** Predicative / modal particles that cannot sit in “Urobím to X.” */
const ADVERB_PREDICATIVE = new Set([
  "treba",
  "možno",
  "isto",
  "určite",
  "pravdepodobne",
  "zrejme",
  "asi",
  "snáď",
  "samozrejme",
]);

const ADVERB_QUANTITY = new Set([
  "veľa",
  "málo",
  "dosť",
  "trochu",
  "príliš",
  "priveľmi",
  "mnoho",
  "viac",
  "menej",
  "najviac",
  "najmenej",
]);

const ADVERB_TIME_SENTENCE_INITIAL = new Set([
  "dnes",
  "včera",
  "zajtra",
  "teraz",
  "potom",
  "neskôr",
  "predtým",
  "nakoniec",
  "napokon",
  "doteraz",
  "vlani",
  "zajtra",
  "hneď",
  "už",
  "ešte",
  "stále",
  "často",
  "občas",
  "nikdy",
  "vždy",
  "znova",
  "znovu",
  "opäť",
  "najprv",
  "dodnes",
  "tentoraz",
]);

/** Discourse / connective adverbs — need clausal hosts, not manner slots. */
const ADVERB_DISCOURSE = new Set([
  "zároveň",
  "pritom",
  "naďalej",
  "čoraz",
  "preto",
  "teda",
  "však",
  "napríklad",
  "konkrétne",
  "predovšetkým",
  "napokon",
  "ostatne",
  "mimochodom",
  "naproti",
  "naopak",
  "teda",
  "čiže",
  "takže",
  "proste",
  "jednoducho",
  "vlastne",
  "skutočne",
  "naozaj",
  "skôr",
  "radšej",
  "hlavne",
  "najmä",
  "iba",
  "len",
  "tiež",
  "taktiež",
  "takisto",
  "rovnako",
  "podobne",
  "inak",
  "súčasne",
  "súčasne",
  "vzápätí",
  "následne",
]);

type AdverbFrame = "predicative" | "quantity" | "time" | "discourse" | "manner";

function classifyAdverbFrame(slovak: string): AdverbFrame {
  const lemma = slovak.toLocaleLowerCase("sk");
  if (ADVERB_PREDICATIVE.has(lemma)) return "predicative";
  if (ADVERB_QUANTITY.has(lemma)) return "quantity";
  if (ADVERB_DISCOURSE.has(lemma)) return "discourse";
  if (ADVERB_TIME_SENTENCE_INITIAL.has(lemma)) return "time";
  return "manner";
}

function adverbExample(slovak: string, english: string): Example {
  const gloss = firstGloss(english);
  const frame = classifyAdverbFrame(slovak);
  const lemma = slovak.toLocaleLowerCase("sk");

  switch (frame) {
    case "predicative":
      if (lemma === "treba") {
        return {
          slovak: "Treba to urobiť hneď.",
          english: "It needs to be done right away.",
          note: "Curated",
        };
      }
      if (lemma === "možno") {
        return {
          slovak: "Možno príde neskôr.",
          english: "Maybe he/she will come later.",
          note: "Curated",
        };
      }
      return {
        slovak: `${slovak.charAt(0).toLocaleUpperCase("sk")}${slovak.slice(1)} príde zajtra.`,
        english: `${gloss.charAt(0).toUpperCase()}${gloss.slice(1)} he/she will come tomorrow.`,
        note: "Curated",
      };
    case "quantity":
      return {
        slovak: `Mám ${slovak} práce.`,
        english: `I have ${gloss} of work.`,
        note: "Curated",
      };
    case "time":
      return {
        slovak: `${slovak.charAt(0).toLocaleUpperCase("sk")}${slovak.slice(1)} to urobím.`,
        english: `${gloss.charAt(0).toUpperCase()}${gloss.slice(1)} I'll do it.`,
        note: "Curated",
      };
    case "discourse":
      if (lemma === "čoraz") {
        return {
          slovak: "Je to čoraz ťažšie.",
          english: "It's getting harder and harder.",
          note: "Curated",
        };
      }
      return {
        slovak: `${slovak.charAt(0).toLocaleUpperCase("sk")}${slovak.slice(1)} pracujeme na tom.`,
        english: `${gloss.charAt(0).toUpperCase()}${gloss.slice(1)} we are working on it.`,
        note: "Curated",
      };
    case "manner":
      return {
        slovak: `Ide to ${slovak}.`,
        english: `It's going ${gloss}.`,
        note: "Curated",
      };
  }
}

function exampleFor(word: {
  category: string;
  english: string;
  slovak: string;
}): Example {
  let example: Example;

  switch (word.category) {
    case "Verbs":
      example = verbExample(word.slovak, word.english);
      break;
    case "Adjectives":
      example = adjectiveExample(word.slovak, word.english);
      break;
    case "Places":
      example = placeExample(word.slovak);
      break;
    case "Adverbs":
      example = adverbExample(word.slovak, word.english);
      break;
    default:
      example = nounExample(word.slovak, word.english);
  }

  return { ...example, isPracticeFrame: true };
}

/** Second-frame templates for topping up underfilled lemmas. */
function alternateExampleFor(word: {
  category: string;
  english: string;
  slovak: string;
}): Example {
  const gloss = firstGloss(word.english);
  const { slovak } = word;
  let example: Example;

  switch (word.category) {
    case "Verbs": {
      const bare = englishVerbGloss(word.english);
      const frame = classifyVerbFrame(slovak, bare);
      if (frame === "acknowledge") {
        example = {
          slovak: `Nechcem to ${slovak}.`,
          english: `I don't want to ${bare} it.`,
          note: "Curated",
        };
      } else {
        example = {
          slovak: `Snažím sa ${slovak}.`,
          english: `I'm trying to ${bare}.`,
          note: "Curated",
        };
      }
      break;
    }
    case "Adjectives":
      example = {
        slovak: `To je ${slovak} príklad.`,
        english: `That is ${article(gloss)}${gloss} example.`,
        note: "Curated",
      };
      break;
    case "Adverbs": {
      const frame = classifyAdverbFrame(slovak);
      if (frame === "predicative") {
        if (slovak.toLocaleLowerCase("sk") === "treba") {
          example = {
            slovak: "Treba počkať.",
            english: "One must wait.",
            note: "Curated",
          };
        } else if (slovak.toLocaleLowerCase("sk") === "možno") {
          example = {
            slovak: "Možno zajtra.",
            english: "Maybe tomorrow.",
            note: "Curated",
          };
        } else {
          example = {
            slovak: `${slovak.charAt(0).toLocaleUpperCase("sk")}${slovak.slice(1)} to stihne.`,
            english: `${gloss.charAt(0).toUpperCase()}${gloss.slice(1)} he/she will make it.`,
            note: "Curated",
          };
        }
      } else if (frame === "quantity") {
        example = {
          slovak: `Je toho ${slovak}.`,
          english: `There is ${gloss} of it.`,
          note: "Curated",
        };
      } else if (frame === "time") {
        example = {
          slovak: `Urobíme to ${slovak}.`,
          english: `We'll do it ${gloss}.`,
          note: "Curated",
        };
      } else if (frame === "discourse") {
        example = {
          slovak: `${slovak.charAt(0).toLocaleUpperCase("sk")}${slovak.slice(1)} som odišiel skôr.`,
          english: `${gloss.charAt(0).toUpperCase()}${gloss.slice(1)} I left earlier.`,
          note: "Curated",
        };
      } else {
        example = {
          slovak: `Hovorí ${slovak}.`,
          english: `He/she speaks ${gloss}.`,
          note: "Curated",
        };
      }
      break;
    }
    case "Places": {
      const capital = slovak.charAt(0).toLocaleUpperCase("sk") + slovak.slice(1);
      example = {
        slovak: `Navštívim ${capital}.`,
        english: `I'll visit ${capital}.`,
        note: "Curated",
      };
      break;
    }
    default: {
      const lemma = slovak.toLocaleLowerCase("sk");
      if (PLURAL_NOUNS.has(lemma)) {
        example = {
          slovak: `Kde sú ${slovak}?`,
          english: `Where are the ${gloss}?`,
          note: "Curated",
        };
      } else {
        example = {
          slovak: `Hľadám ${slovak}.`,
          english: `I'm looking for ${article(gloss)}${gloss}.`,
          note: "Curated",
        };
      }
    }
  }

  return { ...example, isPracticeFrame: true };
}

const MIN_EXAMPLES = 2;

const aspectPatterns: Record<string, Example[]> = {
  robit: [
    {
      slovak: "Robím úlohu.",
      english: "I'm doing the homework.",
      note: "Curated",
      demonstrates: "robiť — ongoing / imperfective",
    },
    {
      slovak: "Urobím úlohu.",
      english: "I'll get the homework done.",
      note: "Curated",
      demonstrates: "urobiť — completed (see urobiť)",
    },
  ],
  urobit: [
    {
      slovak: "Urobím úlohu.",
      english: "I'll get the homework done.",
      note: "Curated",
      demonstrates: "urobiť — completed / perfective",
    },
    {
      slovak: "Robím úlohu.",
      english: "I'm doing the homework.",
      note: "Curated",
      demonstrates: "robiť — ongoing (see robiť)",
    },
  ],
  brat: [
    {
      slovak: "Beriem knihu.",
      english: "I'm taking a book.",
      note: "Curated",
      demonstrates: "brať — ongoing / imperfective",
    },
    {
      slovak: "Vezmem knihu.",
      english: "I'll take a book.",
      note: "Curated",
      demonstrates: "vziať — one completed take (see vziať)",
    },
  ],
  vziat: [
    {
      slovak: "Vezmem knihu.",
      english: "I'll take a book.",
      note: "Curated",
      demonstrates: "vziať — one completed take",
    },
    {
      slovak: "Beriem knihu.",
      english: "I'm taking a book.",
      note: "Curated",
      demonstrates: "brať — ongoing (see brať)",
    },
  ],
  pisat: [
    {
      slovak: "Píšem list.",
      english: "I'm writing a letter.",
      note: "Curated",
      demonstrates: "písať — ongoing / imperfective",
    },
    {
      slovak: "Napíšem list.",
      english: "I'll write a letter.",
      note: "Curated",
      demonstrates: "napísať — write to completion (see napísať)",
    },
  ],
  napisat: [
    {
      slovak: "Napíšem list.",
      english: "I'll write a letter.",
      note: "Curated",
      demonstrates: "napísať — write to completion",
    },
    {
      slovak: "Píšem list.",
      english: "I'm writing a letter.",
      note: "Curated",
      demonstrates: "písať — ongoing (see písať)",
    },
  ],
  citat: [
    {
      slovak: "Čítam knihu.",
      english: "I'm reading a book.",
      note: "Curated",
      demonstrates: "čítať — ongoing / imperfective",
    },
    {
      slovak: "Prečítam knihu.",
      english: "I'll read the book through.",
      note: "Curated",
      demonstrates: "prečítať — read through (see prečítať)",
    },
  ],
  precitat: [
    {
      slovak: "Prečítam knihu.",
      english: "I'll read the book through.",
      note: "Curated",
      demonstrates: "prečítať — read through",
    },
    {
      slovak: "Čítam knihu.",
      english: "I'm reading a book.",
      note: "Curated",
      demonstrates: "čítať — ongoing (see čítať)",
    },
  ],
  kupovat: [
    {
      slovak: "Kupujem knihu.",
      english: "I'm buying a book.",
      note: "Curated",
      demonstrates: "kupovať — ongoing / imperfective",
    },
    {
      slovak: "Kúpim knihu.",
      english: "I'll buy a book.",
      note: "Curated",
      demonstrates: "kúpiť — one purchase (see kúpiť)",
    },
  ],
  kupit: [
    {
      slovak: "Kúpim knihu.",
      english: "I'll buy a book.",
      note: "Curated",
      demonstrates: "kúpiť — one purchase",
    },
    {
      slovak: "Kupujem knihu.",
      english: "I'm buying a book.",
      note: "Curated",
      demonstrates: "kupovať — ongoing (see kupovať)",
    },
  ],
  jest: [
    {
      slovak: "Jem chlieb.",
      english: "I'm eating bread.",
      note: "Curated",
      demonstrates: "jesť — ongoing / imperfective",
    },
    {
      slovak: "Zjem chlieb.",
      english: "I'll eat the bread up.",
      note: "Curated",
      demonstrates: "zjesť — eat up (see zjesť)",
    },
  ],
  zjest: [
    {
      slovak: "Zjem chlieb.",
      english: "I'll eat the bread up.",
      note: "Curated",
      demonstrates: "zjesť — eat up",
    },
    {
      slovak: "Jem chlieb.",
      english: "I'm eating bread.",
      note: "Curated",
      demonstrates: "jesť — ongoing (see jesť)",
    },
  ],
  pit: [
    {
      slovak: "Pijem vodu.",
      english: "I'm drinking water.",
      note: "Curated",
      demonstrates: "piť — ongoing / imperfective",
    },
    {
      slovak: "Vypijem vodu.",
      english: "I'll drink the water up.",
      note: "Curated",
      demonstrates: "vypiť — drink up (see vypiť)",
    },
  ],
  vypit: [
    {
      slovak: "Vypijem vodu.",
      english: "I'll drink the water up.",
      note: "Curated",
      demonstrates: "vypiť — drink up",
    },
    {
      slovak: "Pijem vodu.",
      english: "I'm drinking water.",
      note: "Curated",
      demonstrates: "piť — ongoing (see piť)",
    },
  ],
};

const curated = JSON.parse(readFileSync(CURATED_PATH, "utf8")) as Record<
  string,
  Example[]
>;

const damagedCurated: string[] = [];
for (const [slug, examples] of Object.entries(curated)) {
  const lemma =
    words.find((word) => word.slug === slug && word.kind === "word")?.slovak ?? slug;
  for (const example of examples) {
    if (example.isPracticeFrame) continue;
    if (isDamagedExampleTemplate(example.slovak, lemma)) {
      damagedCurated.push(`${slug}: ${example.slovak}`);
    }
  }
}
if (damagedCurated.length > 0) {
  throw new Error(
    `Curated examples contain damaged fill templates (${damagedCurated.length}). Fix curated-examples.json first:\n` +
      damagedCurated.slice(0, 20).join("\n") +
      (damagedCurated.length > 20 ? `\n… +${damagedCurated.length - 20} more` : ""),
  );
}

Object.assign(curated, aspectPatterns);

const empty = words.filter((word) => word.kind === "word" && word.examples.length === 0);
let filled = 0;

for (const word of empty) {
  if (curated[word.slug]) continue;
  curated[word.slug] = [exampleFor(word)];
  filled += 1;
}

let toppedUp = 0;

const HAND_CURATED_SLUGS = new Set([
  "ocitnut",
  "podielat",
  "stretavat",
  "zavisiet",
  "tatransky",
  "vracat",
  "informacia",
]);

for (const word of words) {
  if (word.kind !== "word") continue;
  if (word.category === "Verbs") continue;
  if (HAND_CURATED_SLUGS.has(word.slug)) continue;
  if (word.examples.some((example) => Boolean(example.demonstrates))) continue;

  const existing = curated[word.slug] ?? [];
  const existingKeys = new Set(
    word.examples.map((example) => example.slovak.toLocaleLowerCase("sk")),
  );
  const curatedKeys = new Set(
    existing.map((example) => example.slovak.toLocaleLowerCase("sk")),
  );
  const knownCount = new Set([...existingKeys, ...curatedKeys]).size;
  if (knownCount >= MIN_EXAMPLES) continue;

  const extras: Example[] = [];
  for (const candidate of [exampleFor(word), alternateExampleFor(word)]) {
    const key = candidate.slovak.toLocaleLowerCase("sk");
    if (existingKeys.has(key) || curatedKeys.has(key)) continue;
    if (extras.some((example) => example.slovak.toLocaleLowerCase("sk") === key)) {
      continue;
    }
    extras.push(candidate);
    if (knownCount + extras.length >= MIN_EXAMPLES) break;
  }

  if (extras.length === 0) continue;

  // Keep any hand rows already in curated; append practice top-ups.
  curated[word.slug] = [...existing, ...extras];
  toppedUp += 1;
}

writeFileSync(CURATED_PATH, `${JSON.stringify(curated, null, 2)}\n`);
console.log(`Aspect pattern pairs: ${Object.keys(aspectPatterns).length}`);
console.log(`Template-filled empty lemmas: ${filled}`);
console.log(`Topped up underfilled lemmas (<${MIN_EXAMPLES}): ${toppedUp}`);
console.log(`Total curated keys: ${Object.keys(curated).length}`);
