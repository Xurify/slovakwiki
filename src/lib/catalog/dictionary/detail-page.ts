import { existsSync } from "node:fs";
import path from "node:path";

import { normalizeAudioText } from "$lib/catalog/audio/core";
import { resolveDictionaryAudioSrc } from "$lib/catalog/audio/resolve-server";
import { entryBySlug, words } from "$lib/catalog/entries";
import {
  dictionaryImageView,
  getImageManifestEntry,
  imagesUseCdn,
  isHotlinkedImage,
  type DictionaryImageView,
} from "$lib/catalog/dictionary/images";
import {
  canonicalWordSlug,
  entryHref,
  lemmaSenseGroup,
  relatedSlugsForLemmaPage,
} from "$lib/catalog/dictionary/lemma-senses";
import { entriesNear, type NearbyEntry } from "$lib/catalog/dictionary/entries-near";
import {
  frequencyNeighbors,
  type FrequencyNeighbor,
} from "$lib/catalog/dictionary/frequency-neighbors";
import { frequencyListFor } from "$lib/catalog/frequency/load";
import { contentCacheKey } from "$lib/build/cache-key";
import type { ContentEntry } from "$lib/catalog/types";

export type DictionaryPageProps = {
  entry: ContentEntry;
  entriesNear: NearbyEntry[];
  exampleAudioSrcs: string[];
  frequencyNeighbors: FrequencyNeighbor[];
  image: DictionaryImageView | undefined;
  lemmaAudioSrc: string;
  relatedEntries: Array<{
    english: string;
    href: string;
    kind: ContentEntry["kind"];
    slug: string;
    slovak: string;
  }>;
  senses: Array<{
    entry: ContentEntry;
    exampleAudioSrcs: string[];
  }>;
  variantOf: { href: string; slovak: string } | undefined;
  variants: Array<{ href: string; slovak: string }>;
};

let lemmaTexts: Set<string> | undefined;

function lemmaTextSet(): Set<string> {
  lemmaTexts ??= new Set(
    words
      .filter((entry) => entry.kind === "word")
      .map((entry) => normalizeAudioText(entry.slovak))
      .filter(Boolean),
  );
  return lemmaTexts;
}

function exampleAudioSrcsFor(entry: ContentEntry): string[] {
  return entry.examples.map((example) => {
    const text = normalizeAudioText(example.slovak);
    const kind = lemmaTextSet().has(text) ? "lemma" : "example";
    return resolveDictionaryAudioSrc(example.slovak, kind);
  });
}

function resolveLemmaImage(
  slug: string,
  fallbackCaption: string,
): DictionaryPageProps["image"] {
  const imageEntry = getImageManifestEntry(slug);
  if (!imageEntry) return undefined;

  // Local/dev: require file on disk. Prod CDN: trust manifest (files on R2).
  if (!imagesUseCdn() && !isHotlinkedImage(imageEntry) && imageEntry.file) {
    const diskPath = path.join(
      process.cwd(),
      "static",
      "images",
      "dictionary",
      imageEntry.file,
    );
    if (!existsSync(diskPath)) return undefined;
  }

  return dictionaryImageView(slug, fallbackCaption);
}

/** Props for a lemma page, or `undefined` when the slug is not a canonical page. */
function dictionaryPageProps(entry: ContentEntry): DictionaryPageProps | undefined {
  if (entry.slug !== canonicalWordSlug(entry, words)) return undefined;

  const senses = lemmaSenseGroup(entry, words);

  const relatedEntries = relatedSlugsForLemmaPage(senses)
    .map((slug) => entryBySlug.get(slug))
    .filter((related): related is NonNullable<typeof related> => related !== undefined)
    .map((related) => ({
      english: related.english,
      href: entryHref(related, words),
      kind: related.kind,
      slug: related.slug,
      slovak: related.slovak,
    }));

  const titleEnglish = senses.map((sense) => sense.english).join(" · ");

  const variantBase = entry.variantOf ? entryBySlug.get(entry.variantOf) : undefined;

  return {
    entry,
    variantOf: variantBase
      ? { href: entryHref(variantBase, words), slovak: variantBase.slovak }
      : undefined,
    variants: [...variantsOf(entry.slug)]
      .sort((first, second) => first.slovak.localeCompare(second.slovak, "sk"))
      .map((variant) => ({
        href: entryHref(variant, words),
        slovak: variant.slovak,
      })),
    senses: senses.map((sense) => ({
      entry: sense,
      exampleAudioSrcs: exampleAudioSrcsFor(sense),
    })),
    relatedEntries,
    lemmaAudioSrc: resolveDictionaryAudioSrc(entry.slovak, "lemma"),
    entriesNear: entriesNear(entry, words),
    exampleAudioSrcs: exampleAudioSrcsFor(entry),
    frequencyNeighbors: entry.frequency
      ? frequencyNeighbors(
          entry.frequency,
          frequencyListFor(entry.frequency.partOfSpeech),
          words,
        )
      : [],
    image: resolveLemmaImage(entry.slug, titleEnglish),
  };
}

let variantsByBase: Map<string, ContentEntry[]> | undefined;

function variantsOf(slug: string): ContentEntry[] {
  if (!variantsByBase) {
    variantsByBase = new Map();
    for (const word of words) {
      if (!word.variantOf) continue;
      const list = variantsByBase.get(word.variantOf) ?? [];
      list.push(word);
      variantsByBase.set(word.variantOf, list);
    }
  }
  return variantsByBase.get(slug) ?? [];
}

let wordBySlug: Map<string, ContentEntry> | undefined;

export function dictionaryPagePropsForSlug(
  slug: string,
): DictionaryPageProps | undefined {
  wordBySlug ??= new Map(words.map((entry) => [entry.slug, entry]));
  const entry = wordBySlug.get(slug);
  return entry ? dictionaryPageProps(entry) : undefined;
}

export function dictionaryStaticPaths() {
  return words.flatMap((entry) => {
    const props = dictionaryPageProps(entry);
    if (!props) return [];

    return [
      {
        params: { slug: entry.slug },
        props,
        cacheKey: contentCacheKey(props),
      },
    ];
  });
}
