import { existsSync } from "node:fs";
import path from "node:path";

import { normalizeAudioText } from "$lib/catalog/audio/core";
import { resolveDictionaryAudioSrc } from "$lib/catalog/audio/resolve-server";
import { entryBySlug, words } from "$lib/catalog/entries";
import {
  getImageManifestEntry,
  imagesUseCdn,
  resolveImageSrc,
} from "$lib/catalog/dictionary/images";
import {
  canonicalWordSlug,
  entryHref,
  lemmaSenseGroup,
  relatedSlugsForLemmaPage,
} from "$lib/catalog/dictionary/lemma-senses";
import { contentCacheKey } from "$lib/build/cache-key";
import type { ContentEntry } from "$lib/catalog/types";

export type DictionaryPageProps = {
  entry: ContentEntry;
  exampleAudioSrcs: string[];
  image:
    | {
        artist?: string;
        caption: string;
        license?: string;
        licenseUrl?: string;
        sourcePageUrl?: string;
        src: string;
      }
    | undefined;
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
  if (!imageEntry || imageEntry.status !== "ok" || !imageEntry.file) return undefined;

  // Local/dev: require file on disk. Prod CDN: trust manifest (files on R2).
  if (!imagesUseCdn()) {
    const diskPath = path.join(
      process.cwd(),
      "static",
      "images",
      "dictionary",
      imageEntry.file,
    );
    if (!existsSync(diskPath)) return undefined;
  }

  return {
    artist: imageEntry.artist,
    caption: imageEntry.caption?.trim() || fallbackCaption,
    license: imageEntry.license,
    licenseUrl: imageEntry.licenseUrl,
    sourcePageUrl: imageEntry.sourcePageUrl,
    src: resolveImageSrc(imageEntry.file, imageEntry.uploadedAt ?? imageEntry.fetchedAt),
  };
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

  return {
    entry,
    senses: senses.map((sense) => ({
      entry: sense,
      exampleAudioSrcs: exampleAudioSrcsFor(sense),
    })),
    relatedEntries,
    lemmaAudioSrc: resolveDictionaryAudioSrc(entry.slovak, "lemma"),
    exampleAudioSrcs: exampleAudioSrcsFor(entry),
    image: resolveLemmaImage(entry.slug, titleEnglish),
  };
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
