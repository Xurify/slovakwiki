import { dictionaryPathFromIndexFields } from "$lib/catalog/dictionary/lemma-senses";
import { normalizeSearchText } from "$lib/catalog/search/ui";

export interface WordLinkEntry {
  forms?: string[];
  hash?: string;
  hrefSlug?: string;
  slovak: string;
  slug: string;
}

type Lookup = Map<string, WordLinkEntry[]>;

export interface WordLinkIndex {
  forms: Lookup;
  foldedForms: Lookup;
  foldedLemmas: Lookup;
  lemmas: Lookup;
}

function spelled(value: string): string {
  return value.normalize("NFC").toLocaleLowerCase("sk").trim();
}

function add(lookup: Lookup, key: string, entry: WordLinkEntry): void {
  if (!key) return;
  const list = lookup.get(key);
  if (!list) {
    lookup.set(key, [entry]);
  } else if (!list.includes(entry)) {
    list.push(entry);
  }
}

export function buildWordLinkIndex(entries: readonly WordLinkEntry[]): WordLinkIndex {
  const index: WordLinkIndex = {
    forms: new Map(),
    foldedForms: new Map(),
    foldedLemmas: new Map(),
    lemmas: new Map(),
  };

  for (const entry of entries) {
    add(index.lemmas, spelled(entry.slovak), entry);
    add(index.foldedLemmas, normalizeSearchText(entry.slovak), entry);
    for (const form of entry.forms ?? []) {
      add(index.forms, spelled(form), entry);
      add(index.foldedForms, normalizeSearchText(form), entry);
    }
  }

  return index;
}

/** `/w/dobrý_deň` reads like Wikipedia's links: an underscore is a space. */
export function wordLinkQuery(raw: string): string {
  return raw.replaceAll("_", " ").replace(/\s+/gu, " ").trim();
}

function pageOf(entry: WordLinkEntry): string {
  return `/dictionary/${entry.hrefSlug ?? entry.slug}`;
}

/** The one page these entries share, or nothing when they are on different pages. */
function onePage(entries: readonly WordLinkEntry[]): string | undefined {
  const pages = new Set(entries.map(pageOf));
  if (pages.size !== 1) return undefined;

  return entries.length === 1
    ? dictionaryPathFromIndexFields(entries[0]!)
    : pageOf(entries[0]!);
}

/**
 * Where a link to a word lands. The spelling typed wins over forms and over a
 * match without diacritics, so `málo` and `malo` (a form of mať) each find
 * their own page. The first kind of match that finds anything decides: if it
 * fits more than one page, the link goes to search, which lists them all.
 */
export function resolveWordLink(query: string, index: WordLinkIndex): string {
  const text = wordLinkQuery(query);
  if (!text) return "/dictionary";

  const exact = spelled(text);
  const folded = normalizeSearchText(text);
  const matches = [
    index.lemmas.get(exact),
    index.forms.get(exact),
    index.foldedLemmas.get(folded),
    index.foldedForms.get(folded),
  ].find((entries) => entries?.length);

  const page = matches ? onePage(matches) : undefined;
  return page ?? `/search?q=${encodeURIComponent(text)}`;
}
