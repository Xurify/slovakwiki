import type { SearchExample } from "$lib/catalog/search/documents";
import {
  describePronounForm,
  findPronounForms,
  pronounFormVocabulary,
  pronounLemmas,
  wordCategoryLabel,
  type PronounLemma,
} from "$lib/catalog/search/pronouns";
import type { SearchTopic } from "$lib/catalog/search/topics";
import {
  normalizeSearchText,
  SEARCH_WEIGHTS,
  searchMetaLabel,
  type SearchDocKind,
} from "$lib/catalog/search/ui";
import { nounGenderLabel } from "$lib/catalog/types";

import {
  MATCH_ORDER,
  rankDictionaryMatches,
  type DictionaryIndexEntry,
  type PreparedEntry,
  type WordMatch,
  type WordMatchKind,
} from "./dictionary-lookup";
import type { SpellingCandidate } from "./did-you-mean";
import { isSearchDocKind, type PagefindResultData } from "./pagefind-client";

export type BestMatch =
  | {
      /** The dictionary entry spelled like the pronoun, when there is one. */
      entry?: DictionaryIndexEntry;
      formOf?: { description: string; form: string };
      pronoun: PronounLemma;
      type: "pronoun";
    }
  | {
      formOf?: { form: string };
      entry: DictionaryIndexEntry;
      type: "word";
    };

export type OtherWord =
  | { kind: WordMatchKind; match: WordMatch; type: "word" }
  | { kind: WordMatchKind; pronoun: PronounLemma; type: "pronoun" };

export interface WordResults {
  best: BestMatch | null;
  others: OtherWord[];
}

/** Gender tells same-spelled entries (domáci) apart. */
export function wordMetaLabel(entry: DictionaryIndexEntry): string {
  const category = searchMetaLabel(
    "word",
    wordCategoryLabel(entry.slovak, entry.category),
  );
  if (!entry.gender) return category;
  return `${category} · ${nounGenderLabel(entry.gender, entry.pluralOnlyGender).english}`;
}

function pronounGlosses(pronoun: PronounLemma): string[] {
  return pronoun.english
    .split(/[,;()]/u)
    .map((part) => normalizeSearchText(part))
    .filter(Boolean);
}

export function buildWordResults(
  query: string,
  dictionary: readonly PreparedEntry[],
  limit = 12,
): WordResults {
  const normalized = normalizeSearchText(query);
  if (!normalized) {
    return { best: null, others: [] };
  }

  const dictionaryMatches = rankDictionaryMatches(dictionary, normalized);
  const pronounHits = findPronounForms(normalized);

  const pronounLemmaHit = pronounHits.find(
    (hit) => normalizeSearchText(hit.pronoun.lemma) === normalized,
  );
  const lemmaWord = dictionaryMatches.find((match) => match.kind === "lemma");
  const formWord = dictionaryMatches.find((match) => match.kind === "form");

  const entryFor = (pronoun: PronounLemma): DictionaryIndexEntry | undefined => {
    const lemma = normalizeSearchText(pronoun.lemma);
    return dictionary.find((prepared) => prepared.slovak === lemma)?.entry;
  };

  let best: BestMatch | null = null;
  if (pronounLemmaHit) {
    const entry = entryFor(pronounLemmaHit.pronoun);
    best = {
      type: "pronoun",
      pronoun: pronounLemmaHit.pronoun,
      ...(entry ? { entry } : {}),
    };
  } else if (lemmaWord) {
    best = { type: "word", entry: lemmaWord.entry };
  } else if (pronounHits[0]) {
    const entry = entryFor(pronounHits[0].pronoun);
    best = {
      type: "pronoun",
      pronoun: pronounHits[0].pronoun,
      ...(entry ? { entry } : {}),
      formOf: {
        form: query.trim(),
        description: describePronounForm(pronounHits[0].matches),
      },
    };
  } else if (formWord) {
    best = {
      type: "word",
      entry: formWord.entry,
      ...(formWord.entry.formsVerified
        ? { formOf: { form: formWord.form ?? query.trim() } }
        : {}),
    };
  } else {
    const glossPronoun = pronounLemmas.find((pronoun) =>
      pronounGlosses(pronoun).includes(normalized),
    );
    const glossWord = dictionaryMatches.find((match) => match.kind === "gloss");
    if (glossPronoun) {
      const entry = entryFor(glossPronoun);
      best = { type: "pronoun", pronoun: glossPronoun, ...(entry ? { entry } : {}) };
    } else if (glossWord) {
      best = { type: "word", entry: glossWord.entry };
    }
  }

  const bestPronoun = best?.type === "pronoun" ? best.pronoun : undefined;
  const bestEntry = best?.entry;

  const others: OtherWord[] = dictionaryMatches
    .filter((match) => match.entry !== bestEntry)
    .map((match) => ({ type: "word" as const, kind: match.kind, match }));

  const alreadyListed = (pronoun: PronounLemma): boolean => {
    const entry = entryFor(pronoun);
    return (
      entry !== undefined && dictionaryMatches.some((match) => match.entry === entry)
    );
  };

  for (const hit of pronounHits) {
    if (hit.pronoun !== bestPronoun && !alreadyListed(hit.pronoun)) {
      others.push({ type: "pronoun", kind: "form", pronoun: hit.pronoun });
    }
  }

  for (const pronoun of pronounLemmas) {
    if (
      pronoun === bestPronoun ||
      pronounHits.some((hit) => hit.pronoun === pronoun) ||
      alreadyListed(pronoun)
    ) {
      continue;
    }
    const lemma = normalizeSearchText(pronoun.lemma);
    if (normalized.length >= 2 && lemma.startsWith(normalized)) {
      others.push({ type: "pronoun", kind: "prefix", pronoun });
    } else if (pronounGlosses(pronoun).includes(normalized)) {
      others.push({ type: "pronoun", kind: "gloss", pronoun });
    }
  }

  return {
    best,
    others: others
      .toSorted((first, second) => MATCH_ORDER[first.kind] - MATCH_ORDER[second.kind])
      .slice(0, limit),
  };
}

export function buildSpellingCandidates(
  dictionary: readonly PreparedEntry[],
): SpellingCandidate[] {
  const candidates: SpellingCandidate[] = [];

  for (const prepared of dictionary) {
    const { entry } = prepared;
    const rank = entry.frequencyRank;
    candidates.push({
      text: entry.slovak,
      normalized: prepared.slovak,
      ...(rank !== undefined ? { frequencyRank: rank } : {}),
    });
    prepared.forms.forEach((normalized, index) => {
      candidates.push({
        text: entry.forms?.[index] ?? normalized,
        normalized,
        ...(rank !== undefined ? { frequencyRank: rank } : {}),
      });
    });
  }

  // Pronouns are among the most common words; rank them ahead of rare lemmas.
  for (const { form } of pronounFormVocabulary()) {
    const display = displayPronounForm(form);
    candidates.push({ text: display, normalized: form, frequencyRank: 0 });
  }

  return candidates;
}

function displayPronounForm(normalized: string): string {
  for (const pronoun of pronounLemmas) {
    for (const row of pronoun.table) {
      for (const cell of Object.values(row.cells).flat()) {
        if (normalizeSearchText(cell) === normalized) return cell;
      }
    }
  }
  return normalized;
}

export interface TextSegment {
  mark: boolean;
  text: string;
}

function normalizedWithMap(text: string): { indexes: number[]; normalized: string } {
  let normalized = "";
  const indexes: number[] = [];
  for (let index = 0; index < text.length; index += 1) {
    const piece = normalizeSearchText(text[index]!) || (text[index] === " " ? " " : "");
    for (const char of piece) {
      normalized += char;
      indexes.push(index);
    }
  }
  return { normalized, indexes };
}

const LETTER = /[\p{L}\p{N}]/u;

export function markMatches(
  text: string,
  query: string,
  { prefix = false }: { prefix?: boolean } = {},
): TextSegment[] | null {
  const needle = normalizeSearchText(query);
  if (!needle) return null;

  const { normalized, indexes } = normalizedWithMap(text);
  const ranges: Array<[number, number]> = [];
  let from = 0;

  while (from <= normalized.length - needle.length) {
    const at = normalized.indexOf(needle, from);
    if (at === -1) break;

    const end = at + needle.length;
    const startsWord = at === 0 || !LETTER.test(normalized[at - 1]!);
    const endsWord = end === normalized.length || !LETTER.test(normalized[end]!);

    if (startsWord && (endsWord || prefix)) {
      let wordEnd = end;
      if (prefix) {
        while (wordEnd < normalized.length && LETTER.test(normalized[wordEnd]!)) {
          wordEnd += 1;
        }
      }
      ranges.push([indexes[at]!, indexes[wordEnd - 1]! + 1]);
    }
    from = end;
  }

  if (ranges.length === 0) return null;

  const segments: TextSegment[] = [];
  let cursor = 0;
  for (const [start, end] of ranges) {
    if (start > cursor) segments.push({ text: text.slice(cursor, start), mark: false });
    segments.push({ text: text.slice(start, end), mark: true });
    cursor = end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), mark: false });
  return segments;
}

export interface ExampleMatch {
  english: TextSegment[];
  slovak: TextSegment[];
}

export function usesWholeWord(example: ExampleMatch | null, query: string): boolean {
  const needle = normalizeSearchText(query);
  return (
    example?.slovak.some(
      (segment) => segment.mark && normalizeSearchText(segment.text) === needle,
    ) ?? false
  );
}

export function pickExample(
  examples: readonly SearchExample[],
  query: string,
): ExampleMatch | null {
  const plain = (text: string): TextSegment[] => [{ text, mark: false }];

  for (const prefix of [false, true]) {
    for (const example of examples) {
      const slovak = markMatches(example.slovak, query, { prefix });
      if (slovak) return { slovak, english: plain(example.english) };
    }
  }

  for (const example of examples) {
    const english = markMatches(example.english, query);
    if (english) return { slovak: plain(example.slovak), english };
  }

  return null;
}

export function parseExamplesMeta(value: string | undefined): SearchExample[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is SearchExample =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as SearchExample).slovak === "string" &&
        typeof (item as SearchExample).english === "string",
    );
  } catch {
    return [];
  }
}

export interface TopicLink {
  href: string;
  kind: SearchDocKind;
  label: string;
}

export interface TopicRow {
  key: string;
  links: TopicLink[];
  slovak?: string;
  summary: string;
  title: string;
}

export function topicRow(topic: SearchTopic): TopicRow {
  return {
    key: topic.id,
    title: topic.title,
    summary: topic.summary,
    ...(topic.slovak ? { slovak: topic.slovak } : {}),
    links: [
      ...(topic.lessonHref
        ? [{ label: "Lesson", kind: "lesson" as const, href: topic.lessonHref }]
        : []),
      ...(topic.practiceHref
        ? [{ label: "Practice", kind: "practice" as const, href: topic.practiceHref }]
        : []),
      ...(topic.grammarHref
        ? [{ label: "Grammar", kind: "grammar" as const, href: topic.grammarHref }]
        : []),
    ],
  };
}

/** Keeps topics where the query hits a heavy block (title, summary, gloss), not just body text. */
export function namedTopicHits(
  hits: readonly PagefindResultData[],
): PagefindResultData[] {
  return hits.filter((hit) =>
    hit.weighted_locations.some((location) => location.weight >= SEARCH_WEIGHTS.gloss),
  );
}

/** One row per topic: its lesson, practice and grammar hits merge. The lead topic goes first. */
export function groupTopicHits(
  hits: readonly PagefindResultData[],
  topics: readonly SearchTopic[],
  leadTopicId?: string,
): TopicRow[] {
  const byHref = new Map<string, SearchTopic>();
  for (const topic of topics) {
    for (const href of [topic.lessonHref, topic.practiceHref, topic.grammarHref]) {
      if (href) byHref.set(href, topic);
    }
  }

  const rows: TopicRow[] = [];
  const seen = new Set<string>();

  const lead = leadTopicId ? topics.find((topic) => topic.id === leadTopicId) : undefined;
  if (lead) {
    rows.push(topicRow(lead));
    seen.add(lead.id);
  }

  for (const hit of hits) {
    const href = hit.url.split(/[?#]/u)[0] ?? hit.url;
    const topic = byHref.get(href);

    if (topic) {
      if (seen.has(topic.id)) continue;
      seen.add(topic.id);
      rows.push(topicRow(topic));
      continue;
    }

    if (seen.has(href)) continue;
    seen.add(href);

    const kind: SearchDocKind = isSearchDocKind(hit.meta.kind)
      ? hit.meta.kind
      : "grammar";
    rows.push({
      key: href,
      title: hit.meta.title ?? href,
      summary: hit.meta.summary ?? "",
      links: [{ label: searchMetaLabel(kind), kind, href: hit.url }],
    });
  }

  return rows;
}
