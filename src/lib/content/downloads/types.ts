/** Types for dictionary data downloads (/downloads). */

export const DOWNLOAD_WORD_FIELDS = [
  "slug",
  "slovak",
  "english",
  "category",
  "related",
  "examples",
] as const;

export type DownloadWordField = (typeof DOWNLOAD_WORD_FIELDS)[number];

/** Flat example-file columns. Nested JSON examples omit slug/lemma (parent has them). */
export const DOWNLOAD_EXAMPLE_FIELDS = ["slug", "lemma", "slovak", "english"] as const;

export type DownloadExampleField = (typeof DOWNLOAD_EXAMPLE_FIELDS)[number];

export type DownloadFormat = "json" | "csv" | "tsv";

export interface ExportExample {
  english: string;
  slovak: string;
}

export interface ExportWord {
  category: string;
  english: string;
  examples: ExportExample[];
  /** Spelled lemma forms (diacritics), not URL slugs. */
  related: string[];
  slug: string;
  slovak: string;
}

export interface DictionaryExportFile {
  attribution: string;
  generatedAt: string;
  source: string;
  words: ExportWord[];
}

export interface ExportOptions {
  /** Empty / omit = all categories present in the payload. */
  categories?: ReadonlySet<string> | readonly string[];
  /** Example columns when emitting examples file / nested examples. */
  exampleFields?: ReadonlySet<DownloadExampleField> | readonly DownloadExampleField[];
  format: DownloadFormat;
  /** Word-level columns. Include `"examples"` to nest or emit examples file. */
  fields: ReadonlySet<DownloadWordField> | readonly DownloadWordField[];
  /**
   * Delimited files: write a header row. Default true.
   * Anki phrase imports usually want false.
   */
  includeHeader?: boolean;
  /**
   * Delimited files: leading `#` attribution comment. Default true.
   * Anki phrase imports usually want false.
   */
  includeAttributionComment?: boolean;
}

export interface ProjectedWordRow {
  [key: string]: string | number | string[] | undefined;
}

export interface ProjectedExampleRow {
  [key: string]: string | number | undefined;
}

export interface ProjectedExport {
  exampleRows: ProjectedExampleRow[];
  includeExamples: boolean;
  wordRows: ProjectedWordRow[];
  /** Nested words for JSON (only selected fields). */
  wordsJson: Array<Record<string, unknown>>;
}

export const DEFAULT_ATTRIBUTION =
  "Includes Tatoeba sentences (CC BY 2.0 FR). See https://slovak.wiki/references";

export const DEFAULT_WORD_FIELDS: readonly DownloadWordField[] = [
  "slug",
  "slovak",
  "english",
  "category",
  "related",
  "examples",
];

export const DEFAULT_EXAMPLE_FIELDS: readonly DownloadExampleField[] = [
  "slug",
  "lemma",
  "slovak",
  "english",
];

export const LEMMAS_ONLY_FIELDS: readonly DownloadWordField[] = [
  "slug",
  "slovak",
  "english",
  "category",
];

export const EXAMPLES_ONLY_WORD_FIELDS: readonly DownloadWordField[] = ["examples"];

/** Anki import: Front = Slovak sentence, Back = English. */
export const ANKI_PHRASES_EXAMPLE_FIELDS: readonly DownloadExampleField[] = [
  "slovak",
  "english",
];
