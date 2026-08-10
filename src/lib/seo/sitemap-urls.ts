import {
  caseTopics,
  grammarEntries,
  pronunciationEntries,
  words,
} from "$lib/content/data";
import { FREQUENCY_PARTS } from "$lib/content/frequency-types";
import { canonicalWordSlug } from "$lib/content/lemma-senses";
import { lessonPath, lessonTracks, lessons } from "$lib/content/lessons";
import { practiceSets } from "$lib/content/practice";
import { SITE_ORIGIN } from "$lib/seo/site";

export interface SitemapGroup {
  /** File name, e.g. `sitemap-dictionary.xml`. */
  filename: string;
  /** Short label for build logs. */
  label: string;
  urls: string[];
}

function absolute(path: string): string {
  return `${SITE_ORIGIN}${path.startsWith("/") ? path : `/${path}`}`;
}

function uniqueSorted(paths: string[]): string[] {
  return [...new Set(paths)].sort((left, right) => left.localeCompare(right, "en"));
}

/** All prerendered + hub URLs, grouped for separate sitemap files. */
export function buildSitemapGroups(): SitemapGroup[] {
  const pages = uniqueSorted([
    "/",
    "/dictionary",
    "/grammar",
    "/lessons",
    "/practice",
    "/pronunciation",
    "/glossary",
    "/resources",
    "/references",
    "/downloads",
    ...FREQUENCY_PARTS.map((partOfSpeech) => `/dictionary/common/${partOfSpeech}`),
  ]);

  const dictionary = uniqueSorted(
    words
      .filter(
        (entry) =>
          entry.kind === "word" && entry.slug === canonicalWordSlug(entry, words),
      )
      .map((entry) => `/dictionary/${entry.slug}`),
  );

  const grammar = uniqueSorted([
    ...grammarEntries.map((entry) => `/grammar/${entry.slug}`),
    ...caseTopics.map((topic) => `/grammar/cases/${topic.slug}`),
  ]);

  const lessonsUrls = uniqueSorted([
    ...lessonTracks.map((track) => `/lessons/${track.id}`),
    ...lessons.map((lesson) => lessonPath(lesson)),
  ]);

  const practice = uniqueSorted([...practiceSets.map((set) => `/practice/${set.id}`)]);

  const pronunciation = uniqueSorted(
    pronunciationEntries.map((entry) => `/pronunciation/${entry.slug}`),
  );

  return [
    { filename: "sitemap-pages.xml", label: "pages", urls: pages.map(absolute) },
    {
      filename: "sitemap-dictionary.xml",
      label: "dictionary",
      urls: dictionary.map(absolute),
    },
    { filename: "sitemap-grammar.xml", label: "grammar", urls: grammar.map(absolute) },
    {
      filename: "sitemap-lessons.xml",
      label: "lessons",
      urls: lessonsUrls.map(absolute),
    },
    {
      filename: "sitemap-practice.xml",
      label: "practice",
      urls: practice.map(absolute),
    },
    {
      filename: "sitemap-pronunciation.xml",
      label: "pronunciation",
      urls: pronunciation.map(absolute),
    },
  ];
}
