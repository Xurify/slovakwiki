import type { WordOrigin } from "$lib/content/types";

export const DICTIONARY_PAGE_SIZE = 50;
export const COMMON_RANK_MAX = 500;

export const BROWSE_CATEGORY_LABELS = [
  "Nouns",
  "Verbs",
  "Adjectives",
  "Adverbs",
  "Places",
  "Phrases",
] as const;

export const BROWSE_TOPIC_SLUGS = [
  "all",
  "featured",
  "common",
  "nouns",
  "verbs",
  "adjectives",
  "adverbs",
  "places",
  "phrases",
] as const;

export type BrowseTopicSlug = (typeof BROWSE_TOPIC_SLUGS)[number];

export interface DictionaryIndexEntry {
  category: string;
  english: string;
  frequencyRank?: number;
  origin?: WordOrigin;
  slug: string;
  slovak: string;
}

export interface TopicOption {
  count: number;
  label: string;
  slug: BrowseTopicSlug;
}

export interface WikiPageView {
  letter: string;
  page: number;
  topic: BrowseTopicSlug;
  topicOptions: TopicOption[];
  totalCount: number;
  totalPages: number;
  visibleEntries: DictionaryIndexEntry[];
  letters: string[];
}

export interface BrowseQueryState {
  letter: string;
  page: number;
  topic: BrowseTopicSlug;
}

function categoryForTopic(topic: BrowseTopicSlug): string | null {
  switch (topic) {
    case "nouns":
      return "Nouns";
    case "verbs":
      return "Verbs";
    case "adjectives":
      return "Adjectives";
    case "adverbs":
      return "Adverbs";
    case "places":
      return "Places";
    case "phrases":
      return "Phrases";
    default:
      return null;
  }
}

export function isBrowseTopicSlug(value: string): value is BrowseTopicSlug {
  return (BROWSE_TOPIC_SLUGS as readonly string[]).includes(value);
}

export function parseBrowseSearchParams(params: URLSearchParams): BrowseQueryState {
  const topicParam = params.get("topic") ?? "all";
  const topic = isBrowseTopicSlug(topicParam) ? topicParam : "all";
  const letterParam = params.get("letter");
  const letter = letterParam?.trim() ? letterParam.toLocaleUpperCase("sk") : "all";
  const page = Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1);

  return { topic, letter, page };
}

export function buildBrowseQueryHref(
  topic: BrowseTopicSlug,
  letter: string,
  page: number,
): string {
  const params = new URLSearchParams();

  if (topic !== "all") {
    params.set("topic", topic);
  }

  if (letter !== "all") {
    params.set("letter", letter.toLocaleLowerCase("sk"));
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `/dictionary?${query}` : "/dictionary";
}

export function filterBrowseEntries(
  entries: DictionaryIndexEntry[],
  topic: BrowseTopicSlug,
  letter: string,
): DictionaryIndexEntry[] {
  return entries
    .filter((entry) => {
      if (topic === "featured") {
        return entry.origin === "curated";
      }

      if (topic === "common") {
        return (
          entry.frequencyRank !== undefined && entry.frequencyRank <= COMMON_RANK_MAX
        );
      }

      const category = categoryForTopic(topic);
      if (category) {
        return entry.category === category;
      }

      return true;
    })
    .filter(
      (entry) =>
        letter === "all" ||
        entry.slovak.at(0)?.toLocaleUpperCase("sk") === letter.toLocaleUpperCase("sk"),
    )
    .toSorted((first, second) => first.slovak.localeCompare(second.slovak, "sk"));
}

export function browseLetters(entries: DictionaryIndexEntry[]): string[] {
  return [
    ...new Set(
      entries.map((entry) => entry.slovak.at(0)?.toLocaleUpperCase("sk") ?? "#"),
    ),
  ].toSorted((first, second) => first.localeCompare(second, "sk"));
}

export function buildTopicOptions(entries: DictionaryIndexEntry[]): TopicOption[] {
  const categoryCounts = new Map<string, number>();

  for (const entry of entries) {
    categoryCounts.set(entry.category, (categoryCounts.get(entry.category) ?? 0) + 1);
  }

  const featuredCount = entries.filter((entry) => entry.origin === "curated").length;
  const commonCount = entries.filter(
    (entry) =>
      entry.frequencyRank !== undefined && entry.frequencyRank <= COMMON_RANK_MAX,
  ).length;

  return [
    { slug: "all", label: "All words", count: entries.length },
    { slug: "featured", label: "Featured", count: featuredCount },
    { slug: "common", label: "Common", count: commonCount },
    ...BROWSE_CATEGORY_LABELS.map((category) => ({
      slug: category.toLowerCase() as BrowseTopicSlug,
      label: category,
      count: categoryCounts.get(category) ?? 0,
    })).filter((option) => option.count > 0),
  ];
}

export function buildWikiViewFromEntries(
  entries: DictionaryIndexEntry[],
  topic: BrowseTopicSlug,
  letter: string,
  page: number,
): WikiPageView {
  const filtered = filterBrowseEntries(entries, topic, letter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / DICTIONARY_PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * DICTIONARY_PAGE_SIZE;

  return {
    topic,
    letter,
    page: safePage,
    totalPages,
    totalCount: filtered.length,
    visibleEntries: filtered.slice(start, start + DICTIONARY_PAGE_SIZE),
    topicOptions: buildTopicOptions(entries),
    letters: browseLetters(entries),
  };
}

export function buildPageItems(current: number, total: number): Array<number | "gap"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const items: Array<number | "gap"> = [];
  const windowStart = Math.max(2, current - 1);
  const windowEnd = Math.min(total - 1, current + 1);

  items.push(1);
  if (windowStart > 2) items.push("gap");
  for (let page = windowStart; page <= windowEnd; page += 1) {
    items.push(page);
  }
  if (windowEnd < total - 1) items.push("gap");
  items.push(total);

  return items;
}

export function hasActiveBrowseFilters(topic: BrowseTopicSlug, letter: string): boolean {
  return topic !== "all" || letter !== "all";
}

export function resetBrowseHref(): string {
  return "/dictionary";
}

export function browseStateNeedsIndex(state: BrowseQueryState): boolean {
  return state.topic !== "all" || state.letter !== "all" || state.page > 1;
}
