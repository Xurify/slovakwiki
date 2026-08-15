/**
 * Apply hand/agent verb overlays + aspect clusters.
 * Does not mint conjugation-stamp frames (`Prečo sa ${sg2}?`).
 *
 * Write unique sentences into `content/dictionary/curated-examples.json`, then:
 *   bun scripts/dictionary/author-verb-examples.ts
 *   bun scripts/dictionary/apply-curated-examples.ts
 */

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { EXAMPLE_DISPLAY_LIMIT } from "../../src/lib/catalog/dictionary/example-limits";
import {
  isDamagedExampleTemplate,
  isWeakFillTemplate,
} from "../../src/lib/catalog/dictionary/example-quality";
import type { ContentEntry, Example } from "../../src/lib/catalog/types";
import { lemmaToSlug } from "../../src/lib/catalog/frequency";
import { ROOT } from "../lib/paths";

type WordSeed = Pick<
  ContentEntry,
  "slug" | "slovak" | "english" | "category" | "examples" | "related"
>;

const CURATED_PATH = path.join(ROOT, "content", "dictionary", "curated-examples.json");
const WORDS_PATH = path.join(ROOT, "content", "dictionary", "words.json");
const CLUSTERS_PATH = path.join(ROOT, "content", "dictionary", "related-clusters.json");

function curated(slovak: string, english: string): Example {
  return { slovak, english, note: "Curated" };
}

/** Agent-written unique sentences only — no slot templates. */
const HAND_OVERRIDES: Record<string, Example[]> = {
  ospravedlnovat: [
    curated("Ospravedlňujem sa za neskorú odpoveď.", "I'm sorry for the late response."),
    curated(
      "Ospravedlňuješ sa mi za každú maličkosť.",
      "You apologize to me for every little thing.",
    ),
    curated(
      "Kolega sa ospravedlňuje za včerajšiu scénu.",
      "A colleague is apologizing for yesterday's scene.",
    ),
    curated(
      "Celý večer sa ospravedlňovali za ten omyl.",
      "They spent the whole evening apologizing for that mistake.",
    ),
  ],
  odpustat: [
    curated("Odpúšťam ti tú chybu.", "I forgive you for that mistake."),
    curated("Ťažko mu odpúšťam.", "I find it hard to forgive him."),
    curated("Prosím, odpúšťajme si navzájom.", "Please, let's forgive each other."),
    curated("Nie každému sa dá ľahko odpúšťať.", "Not everyone is easy to forgive."),
  ],
  hrat: [
    curated(
      "Dnes večer hrám futbal s kamarátmi.",
      "I'm playing football with friends tonight.",
    ),
    curated("Hráš na gitare?", "Do you play the guitar?"),
    curated("Deti hrajú pred školou.", "The kids are playing in front of the school."),
    curated(
      "Včera sme hrali karty do noci.",
      "Yesterday we played cards late into the night.",
    ),
  ],
  cakat: [
    curated("Čakám ťa pred stanicou.", "I'm waiting for you in front of the station."),
    curated("Čakáš na autobus?", "Are you waiting for the bus?"),
    curated("Lekárka čaká v ambulancii.", "The doctor is waiting in the office."),
    curated(
      "Čakali sme na vlak pol hodiny.",
      "We waited for the train for half an hour.",
    ),
  ],
  zit: [
    curated("Žijem v Bratislave.", "I live in Bratislava."),
    curated("Kde žiješ?", "Where do you live?"),
    curated("Starí rodičia žijú na dedine.", "My grandparents live in a village."),
    curated("Dlhé roky sme žili v Košiciach.", "We lived in Košice for years."),
  ],
  potrebovat: [
    curated("Potrebujem tvoju pomoc.", "I could use your help."),
    curated("Potrebuješ ceruzku?", "Do you need a pencil?"),
    curated("Firma potrebuje nových ľudí.", "The company needs new people."),
    curated("Včera sme potrebovali viac času.", "Yesterday we needed more time."),
  ],
  pracovat: [
    curated("Pracujem z domu.", "I work from home."),
    curated("Kde pracuješ?", "Where do you work?"),
    curated("Sestra pracuje v nemocnici.", "My sister works at a hospital."),
    curated(
      "Celý víkend sme pracovali na projekte.",
      "We worked on the project all weekend.",
    ),
  ],
  vratit: [
    curated("Zajtra ti vrátim knihu.", "I'll return the book to you tomorrow."),
    curated("Kedy mi vrátiš peniaze?", "When will you give me the money back?"),
    curated("Vrátia nám zálohu do týždňa.", "They'll refund the deposit within a week."),
    curated(
      "Včera sme vrátili kľúče na recepciu.",
      "Yesterday we returned the keys at reception.",
    ),
  ],
  pozriet: [
    curated("Pozriem si ten film večer.", "I'll watch that film this evening."),
    curated("Pozrieš sa na to?", "Will you take a look at it?"),
    curated("Pozrieme sa na zmluvu spolu.", "We'll look at the contract together."),
    curated("Včera sme sa pozreli na novú mapu.", "Yesterday we looked at the new map."),
  ],
  ukazat: [
    curated("Ukážem ti cestu k stanici.", "I'll show you the way to the station."),
    curated("Ukážeš mi tú fotku?", "Will you show me that photo?"),
    curated(
      "Sprievodca ukáže hrad z druhej strany.",
      "The guide will show the castle from the other side.",
    ),
    curated("Učiteľka nám ukázala mapu.", "The teacher showed us a map."),
  ],
  zostat: [
    curated("Zostanem tu do večera.", "I'll stay here until evening."),
    curated("Zostaneš na večeru?", "Are you staying for dinner?"),
    curated("Zostali sme vonku až do dažďa.", "We stayed outside until the rain."),
    curated("Prečo zostal v práci tak neskoro?", "Why did he stay at work so late?"),
  ],
  sediet: [
    curated("Sedím pri okne.", "I'm sitting by the window."),
    curated("Prečo sedíš vzadu?", "Why are you sitting in the back?"),
    curated("Starý pán sedí na lavičke.", "An old man is sitting on the bench."),
    curated("Sedeli sme v prvej rade.", "We sat in the first row."),
  ],
  odpovedat: [
    curated("Odpovedám na každý e-mail.", "I reply to every email."),
    curated("Odpovedáš vždy hneď?", "Do you always answer right away?"),
    curated("Učiteľka odpovedá trpezlivo.", "The teacher answers patiently."),
    curated("Na otázku sme odpovedali hneď.", "We answered the question right away."),
  ],
  spat: [
    curated("Spím málo, keď mám skúšky.", "I sleep little when I have exams."),
    curated("Spíš ešte?", "Are you still sleeping?"),
    curated("Dieťa spí v izbe.", "The child is sleeping in the room."),
    curated("Včera sme spali do desiatej.", "Yesterday we slept until ten."),
  ],
  ucit: [
    curated("Učím deti matematiku.", "I teach the children math."),
    curated("Učíš na univerzite?", "Do you teach at the university?"),
    curated("Otec učí syna šoférovať.", "Dad is teaching his son to drive."),
    curated(
      "Roky sme učili na tej istej škole.",
      "We taught at the same school for years.",
    ),
  ],
};

function liveCount(word: WordSeed): number {
  return word.examples.filter((example) => !isWeakFillTemplate(example, word.slovak))
    .length;
}

function asciiStem(slug: string): string {
  return slug.replace(/-(v|n|a|adv)$/u, "").replace(/(ovat|avat|at|it)$/u, "");
}

function aspectPartnerSlug(slug: string): string | undefined {
  if (slug.endsWith("ovat")) return `${slug.slice(0, -4)}it`;
  if (slug.endsWith("avat")) return `${slug.slice(0, -4)}it`;
  if (slug.endsWith("it") && !slug.endsWith("ovat") && !slug.endsWith("avit")) {
    return `${slug.slice(0, -2)}ovat`;
  }
  if (slug.endsWith("at") && !slug.endsWith("ovat") && !slug.endsWith("avat")) {
    return `${slug.slice(0, -2)}it`;
  }
  return undefined;
}

const dictionaryWords = JSON.parse(readFileSync(WORDS_PATH, "utf8")) as WordSeed[];
const curatedOverlay = JSON.parse(readFileSync(CURATED_PATH, "utf8")) as Record<
  string,
  Example[]
>;

let skippedEnough = 0;
let skippedNoOverlay = 0;

for (const word of dictionaryWords) {
  if (word.category !== "Verbs") continue;
  if (liveCount(word) >= EXAMPLE_DISPLAY_LIMIT) {
    skippedEnough += 1;
    continue;
  }

  const existing = curatedOverlay[word.slug] ?? [];
  const existingGood = existing.filter(
    (example) =>
      !isWeakFillTemplate(example, word.slovak) &&
      !isDamagedExampleTemplate(example.slovak, word.slovak),
  );
  if (existingGood.length >= EXAMPLE_DISPLAY_LIMIT) {
    skippedEnough += 1;
    continue;
  }

  skippedNoOverlay += 1;
}

for (const [slug, examples] of Object.entries(HAND_OVERRIDES)) {
  curatedOverlay[slug] = examples;
}

writeFileSync(CURATED_PATH, `${JSON.stringify(curatedOverlay, null, 2)}\n`);

const verbsBySlug = new Map(
  dictionaryWords
    .filter((word) => word.category === "Verbs")
    .map((word) => [word.slug, word]),
);
const clusters = JSON.parse(readFileSync(CLUSTERS_PATH, "utf8")) as Record<
  string,
  string[]
>;

let clusterAdded = 0;
for (const word of verbsBySlug.values()) {
  const partnerSlug = aspectPartnerSlug(word.slug);
  if (!partnerSlug) continue;
  const partner = verbsBySlug.get(partnerSlug);
  if (!partner) continue;
  if (asciiStem(word.slug).length < 5) continue;
  if (asciiStem(word.slug) !== asciiStem(partnerSlug)) continue;

  const key = `aspect-${lemmaToSlug(word.slovak)}-${lemmaToSlug(partner.slovak)}`;
  const alt = `aspect-${lemmaToSlug(partner.slovak)}-${lemmaToSlug(word.slovak)}`;
  if (clusters[key] || clusters[alt]) continue;

  const a = word.slug;
  const b = partner.slug;
  const [first, second] = a < b ? [a, b] : [b, a];
  clusters[`aspect-${first}-${second}`] = [first, second];
  clusterAdded += 1;
}

writeFileSync(CLUSTERS_PATH, `${JSON.stringify(clusters, null, 2)}\n`);

console.log(`Hand/agent overlays written: ${Object.keys(HAND_OVERRIDES).length}`);
console.log(`Already at display floor: ${skippedEnough}`);
console.log(`Skipped (needs agent overlay): ${skippedNoOverlay}`);
console.log(`Aspect clusters added: ${clusterAdded}`);
console.log(`→ ${path.relative(ROOT, CURATED_PATH)}`);
console.log(`→ ${path.relative(ROOT, CLUSTERS_PATH)}`);
