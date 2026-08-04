/**
 * Shared helpers for Wikimedia dictionary image fetch / status.
 */

import { access, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { words } from "../../src/lib/content/data";
import {
  type ImageManifestEntry,
  type ImageOverride,
  type ImageStatus,
} from "../../src/lib/content/images";
import { canonicalWordSlug, lemmaSenseGroup } from "../../src/lib/content/lemma-senses";
import { ROOT } from "../lib/paths";

export const IMAGES_DIR = path.join(ROOT, "static", "images", "dictionary");
export const MANIFEST_PATH = path.join(ROOT, "content", "images", "manifest.json");
export const OVERRIDES_PATH = path.join(ROOT, "content", "images", "overrides.json");

export const USER_AGENT =
  "slovak.wiki-dictionary-images/0.1 (https://slovak.wiki; educational dictionary)";

export const THUMB_WIDTH = 640;
export const MIN_THUMB_PX = 80;

export const IMAGE_CACHE_CONTROL = "public, max-age=31536000, immutable";

/** Public / R2 object key for a dictionary image file. */
export function imageObjectKey(file: string): string {
  return `images/dictionary/${file}`;
}

export function contentTypeForImageFile(file: string): string {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".webp") return "image/webp";
  if (ext === ".png") return "image/png";
  if (ext === ".gif") return "image/gif";
  if (ext === ".svg") return "image/svg+xml";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  return "application/octet-stream";
}

/** Filenames present under `static/images/dictionary/`. */
export async function listLocalImageFiles(): Promise<string[]> {
  try {
    const names = await readdir(IMAGES_DIR);
    return names
      .filter((name) => /\.(webp|png|jpe?g|gif|svg)$/i.test(name))
      .sort((a, b) => a.localeCompare(b, "en"));
  } catch {
    return [];
  }
}

export type ImageManifest = Record<string, ImageManifestEntry>;
export type ImageOverrides = Record<string, ImageOverride>;

export interface ImageTarget {
  category: string;
  english: string;
  /** Preferred English gloss for EN Wikipedia fallback (noun sense when present). */
  gloss: string;
  slovak: string;
  slug: string;
  topics?: string[];
}

export function parseArgs(argv: string[]): {
  dryRun: boolean;
  force: boolean;
  limit: number | undefined;
  only: string | undefined;
  partOfSpeech: string | undefined;
} {
  let dryRun = false;
  let force = false;
  let limit: number | undefined;
  let only: string | undefined;
  let partOfSpeech: string | undefined;

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dry-run") dryRun = true;
    else if (arg === "--force") force = true;
    else if (arg === "--limit") {
      const value = Number(argv[i + 1]);
      if (!Number.isFinite(value) || value < 1) {
        throw new Error("--limit requires a positive number");
      }
      limit = Math.floor(value);
      i += 1;
    } else if (arg === "--only") {
      only = argv[i + 1];
      if (!only) throw new Error("--only requires a slug");
      i += 1;
    } else if (arg === "--pos") {
      partOfSpeech = argv[i + 1];
      if (!partOfSpeech) {
        throw new Error("--pos requires a value (noun|verb|adjective)");
      }
      i += 1;
    } else if (arg?.startsWith("-")) {
      throw new Error(`Unknown flag: ${arg}`);
    }
  }

  return { dryRun, force, limit, only, partOfSpeech };
}

export function normalizePartOfSpeechFilter(
  partOfSpeech: string | undefined,
): string | undefined {
  if (!partOfSpeech) return undefined;
  const key = partOfSpeech.trim().toLowerCase();
  if (key === "noun" || key === "nouns") return "Nouns";
  if (key === "verb" || key === "verbs") return "Verbs";
  if (key === "adjective" || key === "adjectives" || key === "adj") return "Adjectives";
  // Allow exact category match (Places, Food, …)
  return partOfSpeech.trim();
}

/** First usable English search title from a gloss string. */
export function glossSearchTitle(english: string): string {
  let part = english.split(";")[0]?.trim() ?? "";
  part = part.split(",")[0]?.trim() ?? "";
  part = part.replace(/\([^)]*\)/g, "").trim();
  return part;
}

/** Strip infinitive markers from an English gloss fragment. */
export function stripInfinitiveMarker(value: string): string {
  return value
    .replace(/^not to\s+/i, "")
    .replace(/^to\s+/i, "")
    .trim();
}

/**
 * Irregular / preferred Commons search phrases keyed by English verb head.
 * Prefer “person + action + object” over bare verbs (bare “read” → Lancashire town).
 */
const VERB_SCENE_QUERIES: Record<string, string[]> = {
  go: ["person walking street", "people walking outdoors"],
  walk: ["person walking street", "people walking outdoors"],
  run: ["person running outdoors", "runner athletic race"],
  swim: ["person swimming pool", "swimmer in water"],
  float: ["person floating water"],
  eat: ["person eating food", "people eating meal"],
  drink: ["person drinking water glass", "person drinking from cup"],
  write: ["person writing with pen", "hand writing on paper"],
  read: ["person reading book", "someone reading a book"],
  sleep: ["person sleeping in bed", "child sleeping"],
  sit: ["person sitting on chair", "people sitting"],
  stand: ["person standing upright", "people standing"],
  cook: ["person cooking kitchen", "chef cooking food"],
  boil: ["pot boiling water stove"],
  listen: ["person listening headphones", "people listening"],
  look: ["person looking at something", "people watching"],
  watch: ["person watching television", "audience watching"],
  open: ["person opening door", "hand opening door"],
  close: ["person closing door", "hand closing door"],
  shut: ["person closing door"],
  buy: ["person shopping buying", "customer buying store"],
  sell: ["person selling market", "vendor selling goods"],
  ride: ["person riding bicycle", "people riding bike"],
  drive: ["person driving car", "driver behind wheel"],
  teach: ["teacher teaching classroom", "person teaching"],
  learn: ["student learning classroom", "person studying"],
  play: ["children playing outdoors", "person playing ball"],
  wait: ["person waiting sitting", "people waiting"],
  speak: ["person speaking microphone", "people talking"],
  talk: ["people talking conversation"],
  give: ["person giving gift", "handing over gift"],
  take: ["person taking photo", "hand taking object"],
  come: ["person arriving walking", "people coming"],
  see: ["person looking eyes", "people watching"],
  find: ["person finding searching"],
  send: ["person sending mail letter", "posting letter"],
  die: ["wilted flower", "candle extinguished"],
  live: ["people living everyday life"],
  work: ["person working office", "people working"],
  do: ["person working hands", "people doing work"],
  make: ["person making something hands", "craftsperson making"],
  get: ["person receiving package"],
  put: ["person putting object shelf"],
  keep: ["person holding carefully"],
  think: ["person thinking thoughtful"],
  know: ["student learning book"],
  want: ["person choosing wishing"],
  say: ["person speaking talking"],
  tell: ["person speaking story"],
  must: [],
  can: [],
  be: [],
  have: [],
};

function irregularPresentParticiple(head: string): string | undefined {
  const irregular: Record<string, string> = {
    run: "running",
    swim: "swimming",
    sit: "sitting",
    get: "getting",
    put: "putting",
    begin: "beginning",
    stop: "stopping",
    lie: "lying",
    die: "dying",
    write: "writing",
    ride: "riding",
    drive: "driving",
    make: "making",
    take: "taking",
    come: "coming",
    give: "giving",
    have: "having",
  };
  if (irregular[head]) return irregular[head];
  if (head.endsWith("ie")) return `${head.slice(0, -2)}ying`;
  if (head.endsWith("e") && !head.endsWith("ee") && !head.endsWith("ye")) {
    return `${head.slice(0, -1)}ing`;
  }
  return `${head}ing`;
}

/**
 * Ranked Commons search queries for a verb gloss.
 * Prefer concrete “person …” scenes; bare verbs are last-resort only.
 */
export function verbActionQueries(english: string): string[] {
  const ABSTRACT = new Set([
    "be",
    "have",
    "can",
    "must",
    "will",
    "shall",
    "may",
    "might",
    "would",
    "could",
    "should",
    "ought",
  ]);

  const senses = english
    .split(";")
    .map((part) => stripInfinitiveMarker(glossSearchTitle(part)))
    .filter(Boolean);

  const queries: string[] = [];
  const seen = new Set<string>();

  function push(query: string | undefined): void {
    const cleaned = query?.trim().replace(/\s+/g, " ");
    if (!cleaned) return;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    queries.push(cleaned);
  }

  for (const sense of senses) {
    const head = sense.split(/\s+/)[0]?.toLowerCase() ?? "";
    if (!head || ABSTRACT.has(head)) continue;

    for (const scene of VERB_SCENE_QUERIES[head] ?? []) {
      push(scene);
    }

    const participle = irregularPresentParticiple(head);
    if (participle) {
      push(`person ${participle}`);
      push(`people ${participle}`);
    }

    // Multi-word gloss already somewhat concrete (“look for”).
    if (sense.includes(" ")) {
      push(`person ${sense}`);
    }
  }

  return queries;
}

/** Best single Commons query for a verb gloss (first ranked scene). */
export function verbActionQuery(english: string): string | undefined {
  return verbActionQueries(english)[0];
}

export function isVerbLikeCategory(category: string): boolean {
  return category === "Verbs";
}

/** Themes safe for automatic Commons gloss search (concrete referents). */
const COMMONS_SAFE_TOPICS = new Set([
  "Food",
  "Places",
  "People",
  "Everyday life",
  "Travel",
]);

function commonsTheme(target: ImageTarget): string | undefined {
  if (target.category === "Places") return "Places";
  return target.topics?.find((topic) => COMMONS_SAFE_TOPICS.has(topic));
}

/** True when target has a concrete learner theme (Food, Places, …). */
export function hasCommonsSafeTheme(target: ImageTarget): boolean {
  return commonsTheme(target) !== undefined;
}

const ABSTRACT_GLOSS_HEAD =
  /^(state|act|process|quality|condition|feeling|sense|amount|number|way|manner|kind|type|form|part|fact|idea|concept|system|level|rate|role|case|point|time|end|use|result|effect|change|order|group|set|list|area|side|line|thing|absolute|relative|general|special|particular|various|certain|possible|necessary|important|basic|main|real|true|false|same|other|own|such|whole|total|public|private|social|political|economic|cultural|national|international|official|personal|natural|normal|usual|common|simple|complex|modern|ancient|former|future|present|past|final|initial|primary|secondary|positive|negative|active|passive|direct|indirect|internal|external|local|global|original|typical|specific|available|responsible|successful|professional|traditional|potential|actual|current|previous|next|following|related|similar|different|additional|extra|further)$/i;

const ABSTRACT_GLOSS_SUFFIX =
  /(tion|sion|ness|ity|ment|ance|ence|ancy|ency|ism|ogy|ics|hood|ship|itude|ability|ibility)$/i;

/** True when an English gloss head looks imageable (not abstract junk). */
export function glossLooksConcrete(english: string): boolean {
  const head = glossSearchTitle(english).toLowerCase().trim();
  if (head.length < 3) return false;
  const parts = head.split(/\s+/).filter(Boolean);
  if (parts.length > 4) return false;
  if (/^(and|or|of|to|be|have|do|not|a|an|the)$/i.test(head)) return false;

  // Multi-word: trust a concrete first token ("train station", "apple pie").
  if (parts.length > 1) {
    const first = parts[0] ?? "";
    if (ABSTRACT_GLOSS_HEAD.test(first)) return false;
    if (ABSTRACT_GLOSS_SUFFIX.test(first)) return false;
    return first.length >= 3;
  }

  if (ABSTRACT_GLOSS_HEAD.test(head)) return false;
  if (ABSTRACT_GLOSS_SUFFIX.test(head)) return false;
  return true;
}

/**
 * Auto-promote Commons only for concrete learner themes (Food, Places, …)
 * when Wikipedia pageimages miss (e.g. obed → “lunch meal”).
 * General Nouns / adjectives / verbs: stage → promote (polysemy risk).
 */
export function allowsCommonsAutoPromote(target: ImageTarget): boolean {
  if (!commonsTheme(target)) return false;
  const head = glossSearchTitle(target.gloss);
  if (!head || head.length < 4) return false;
  // Tiny discourse glosses → concert/brand false friends (“yes”, “okay”).
  if (/^(yes|yeah|no|nope|ok|okay|hi|hey|bye|please|thanks)$/i.test(head)) {
    return false;
  }
  return true;
}

/** Ranked Commons search queries from gloss + topic (obed → lunch / lunch meal). */
export function nounCommonsQueries(target: ImageTarget): string[] {
  const head = glossSearchTitle(target.gloss);
  if (!head) return [];

  const queries: string[] = [];
  const seen = new Set<string>();
  const push = (query: string): void => {
    const cleaned = query.trim().replace(/\s+/g, " ");
    if (!cleaned) return;
    const key = cleaned.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    queries.push(cleaned);
  };

  push(head);

  switch (commonsTheme(target)) {
    case "Food":
      push(`${head} food`);
      push(`${head} meal`);
      push(`${head} dish`);
      break;
    case "Places":
      push(`${head} building`);
      push(`${head} place`);
      push(`${head} city`);
      break;
    case "People":
      push(`${head} person`);
      push(`${head} people`);
      break;
    case "Travel":
      push(`${head} transport`);
      push(`${head} station`);
      break;
    case "Everyday life":
      push(`${head} house`);
      push(`${head} home`);
      break;
    default:
      break;
  }

  return queries;
}

const REJECTED_COMMONS_TITLE =
  /\b(icon|logo|symbol|flag_of|coat_of_arms|map_of|diagram|svg|nude|naked|nudes|porn|nsfw|sexual|disambiguation|signature|qr[_ -]?code|poster|album|cover|screenshot|trailer|movie|film|titlepage|title)\b/i;

export function isRejectedCommonsTitle(title: string): boolean {
  return REJECTED_COMMONS_TITLE.test(title);
}

/**
 * Prefer Commons files whose title *starts* with the gloss headword
 * (avoids mid-title brand hits like “Foo Absolute Bar…”).
 * `allowArticle`: also accept “A/The {head} …” (Food/Places); Nouns stay strict.
 */
export function commonsTitleMatchesGloss(
  fileTitle: string,
  glossHead: string,
  options?: { allowArticle?: boolean },
): boolean {
  const head = glossHead.trim().toLowerCase();
  if (head.length < 3) return false;
  const norm = fileTitle
    .replace(/^File:/i, "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\.[a-z0-9]+$/i, "")
    .trim();
  if (norm === head || norm.startsWith(`${head} `)) return true;
  if (!options?.allowArticle) return false;
  // Allow leading article: "A lunch …" / "The lunch …"
  const article = norm.match(/^(a|an|the)\s+(.+)$/i);
  if (!article?.[2]) return false;
  const rest = article[2];
  return rest === head || rest.startsWith(`${head} `);
}

export function stripHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeCommonsFile(name: string): string {
  const trimmed = name.trim();
  if (/^File:/i.test(trimmed)) return trimmed.replace(/^File:/i, "File:");
  return `File:${trimmed}`;
}

export function extensionFromMimeOrUrl(mime: string | undefined, url: string): string {
  if (mime === "image/webp") return "webp";
  if (mime === "image/png") return "png";
  if (mime === "image/gif") return "gif";
  if (mime === "image/jpeg" || mime === "image/jpg") return "jpg";
  const match = url.match(/\.([a-z0-9]+)(?:\?|$)/i);
  const ext = match?.[1]?.toLowerCase();
  if (ext === "jpeg") return "jpg";
  if (ext && ["jpg", "png", "webp", "gif"].includes(ext)) return ext;
  return "jpg";
}

export function isBitmapMime(mime: string | undefined): boolean {
  if (!mime) return true;
  return mime.startsWith("image/") && !mime.includes("svg");
}

/** Canonical lemma pages — one target per dictionary route. */
export function collectImageTargets(options?: {
  only?: string;
  partOfSpeech?: string;
}): ImageTarget[] {
  const partOfSpeechFilter = normalizePartOfSpeechFilter(options?.partOfSpeech);
  const seen = new Set<string>();
  const targets: ImageTarget[] = [];

  for (const entry of words) {
    if (entry.kind !== "word") continue;

    const slug = canonicalWordSlug(entry, words);
    if (seen.has(slug)) continue;
    if (options?.only && slug !== options.only) continue;

    seen.add(slug);

    const senses = lemmaSenseGroup(entry, words);
    const canonical = senses.find((sense) => sense.slug === slug) ?? entry;
    const nounSense = senses.find((sense) => sense.category === "Nouns");
    const glossSource = nounSense ?? canonical;

    if (partOfSpeechFilter && canonical.category !== partOfSpeechFilter) {
      // Include if any sense matches the part-of-speech filter (multi-sense lemmas).
      if (!senses.some((sense) => sense.category === partOfSpeechFilter)) continue;
    }

    targets.push({
      category: canonical.category,
      english: canonical.english,
      gloss: glossSource.english,
      slovak: canonical.slovak,
      slug,
      topics: canonical.topics,
    });
  }

  return targets.sort((a, b) => a.slug.localeCompare(b.slug, "en"));
}

export async function loadManifest(): Promise<ImageManifest> {
  try {
    return JSON.parse(await readFile(MANIFEST_PATH, "utf8")) as ImageManifest;
  } catch {
    return {};
  }
}

export async function saveManifest(manifest: ImageManifest): Promise<void> {
  const sorted = Object.fromEntries(
    Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b, "en")),
  );
  await writeFile(MANIFEST_PATH, `${JSON.stringify(sorted, null, 2)}\n`, "utf8");
}

export async function loadOverrides(): Promise<ImageOverrides> {
  try {
    return JSON.parse(await readFile(OVERRIDES_PATH, "utf8")) as ImageOverrides;
  } catch {
    return {};
  }
}

export async function ensureImagesDir(): Promise<void> {
  await mkdir(IMAGES_DIR, { recursive: true });
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export function localImagePath(file: string): string {
  return path.join(IMAGES_DIR, file);
}

export function missingEntry(now: string): ImageManifestEntry {
  return { fetchedAt: now, status: "missing" };
}

export function rejectedEntry(now: string): ImageManifestEntry {
  return { fetchedAt: now, status: "rejected" };
}

export function shouldSkipTarget(
  slug: string,
  manifest: ImageManifest,
  force: boolean,
): boolean {
  if (force) return false;
  const entry = manifest[slug];
  if (!entry || entry.status !== "ok" || !entry.file) return false;
  return true;
}

export async function shouldSkipWithDisk(
  slug: string,
  manifest: ImageManifest,
  force: boolean,
): Promise<boolean> {
  if (!shouldSkipTarget(slug, manifest, force)) return false;
  const file = manifest[slug]?.file;
  if (!file) return false;
  return fileExists(localImagePath(file));
}

export { type ImageManifestEntry, type ImageStatus };
