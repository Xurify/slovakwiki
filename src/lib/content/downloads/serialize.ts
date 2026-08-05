import type {
  DictionaryExportFile,
  DownloadExampleField,
  DownloadFormat,
  DownloadWordField,
  ExportExample,
  ExportOptions,
  ExportWord,
  ProjectedExampleRow,
  ProjectedExport,
  ProjectedWordRow,
} from "./types";
import { DEFAULT_EXAMPLE_FIELDS } from "./types";

function toSet<T extends string>(
  value: ReadonlySet<T> | readonly T[] | undefined,
  fallback: readonly T[],
): Set<T> {
  if (!value) {
    return new Set(fallback);
  }

  return value instanceof Set ? new Set(value) : new Set(value);
}

function categoryAllowed(
  category: string,
  categories: ReadonlySet<string> | undefined,
): boolean {
  if (!categories || categories.size === 0) {
    return true;
  }

  return categories.has(category);
}

function projectExample(
  slug: string,
  lemma: string,
  example: ExportExample,
  fields: ReadonlySet<DownloadExampleField>,
): ProjectedExampleRow {
  const row: ProjectedExampleRow = {};

  if (fields.has("slug")) {
    row.slug = slug;
  }

  if (fields.has("lemma")) {
    row.lemma = lemma;
  }

  if (fields.has("slovak")) {
    row.slovak = example.slovak;
  }

  if (fields.has("english")) {
    row.english = example.english;
  }

  return row;
}

/** Nested JSON examples: sentence fields only (parent word carries slug / lemma). */
function projectExampleJson(
  example: ExportExample,
  fields: ReadonlySet<DownloadExampleField>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};

  if (fields.has("slovak")) {
    out.slovak = example.slovak;
  }

  if (fields.has("english")) {
    out.english = example.english;
  }

  return out;
}

/** Filter + project dictionary words for download. */
export function projectExport(
  words: readonly ExportWord[],
  options: ExportOptions,
): ProjectedExport {
  const fieldSet = toSet(options.fields, []);
  const exampleFieldSet = toSet(options.exampleFields, DEFAULT_EXAMPLE_FIELDS);
  const categories =
    options.categories === undefined
      ? undefined
      : toSet(
          options.categories instanceof Set ? options.categories : options.categories,
          [],
        );
  const categoryFilter = categories && categories.size > 0 ? categories : undefined;

  const includeExamples = fieldSet.has("examples");
  const wordFieldKeys = (
    ["slug", "slovak", "english", "category", "related"] as const
  ).filter((field) => fieldSet.has(field));

  const wordRows: ProjectedWordRow[] = [];
  const exampleRows: ProjectedExampleRow[] = [];
  const wordsJson: Array<Record<string, unknown>> = [];

  for (const word of words) {
    if (!categoryAllowed(word.category, categoryFilter)) {
      continue;
    }

    const jsonRow: Record<string, unknown> = {};
    const flatRow: ProjectedWordRow = {};

    for (const key of wordFieldKeys) {
      const value = word[key];
      jsonRow[key] = value;
      if (key === "related") {
        flatRow.related = Array.isArray(value) ? value.join("|") : "";
      } else {
        flatRow[key] = value as string;
      }
    }

    if (includeExamples) {
      jsonRow.examples = word.examples.map((example) =>
        projectExampleJson(example, exampleFieldSet),
      );

      for (const example of word.examples) {
        exampleRows.push(
          projectExample(word.slug, word.slovak, example, exampleFieldSet),
        );
      }
    }

    // Lemmas file: skip rows that have no word fields (examples-only preset).
    if (wordFieldKeys.length > 0) {
      wordRows.push(flatRow);
      wordsJson.push(jsonRow);
    } else if (includeExamples) {
      // JSON examples-only: slug + spelled lemma + nested sentences.
      wordsJson.push({
        slug: word.slug,
        lemma: word.slovak,
        examples: jsonRow.examples,
      });
    }
  }

  return { exampleRows, includeExamples, wordRows, wordsJson };
}

export function attributionComment(
  meta: Pick<DictionaryExportFile, "attribution" | "generatedAt" | "source">,
): string {
  return `# ${meta.source} · ${meta.generatedAt} · ${meta.attribution}`;
}

export function toExportJson(
  meta: Pick<DictionaryExportFile, "attribution" | "generatedAt" | "source">,
  wordsJson: Array<Record<string, unknown>>,
): string {
  return `${JSON.stringify(
    {
      generatedAt: meta.generatedAt,
      source: meta.source,
      attribution: meta.attribution,
      words: wordsJson,
    },
    null,
    2,
  )}\n`;
}

function escapeDelimitedCell(value: string, separator: string): string {
  const needsQuotes =
    value.includes(separator) ||
    value.includes('"') ||
    value.includes("\n") ||
    value.includes("\r");

  if (!needsQuotes) {
    return value;
  }

  return `"${value.replaceAll('"', '""')}"`;
}

function cellToString(value: string | number | string[] | undefined): string {
  if (value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.join("|");
  }

  return String(value);
}

/** Build CSV or TSV text. Optional leading `#` attribution comment and/or header row. */
export function toDelimited(
  rows: Array<Record<string, string | number | string[] | undefined>>,
  headers: readonly string[],
  separator: "," | "\t",
  options?: { comment?: string; includeHeader?: boolean },
): string {
  const lines: string[] = [];
  const includeHeader = options?.includeHeader !== false;
  const comment = options?.comment;

  if (comment) {
    lines.push(comment.startsWith("#") ? comment : `# ${comment}`);
  }

  if (includeHeader) {
    lines.push(
      headers.map((header) => escapeDelimitedCell(header, separator)).join(separator),
    );
  }

  for (const row of rows) {
    lines.push(
      headers
        .map((header) => escapeDelimitedCell(cellToString(row[header]), separator))
        .join(separator),
    );
  }

  return `${lines.join("\n")}\n`;
}

export function separatorForFormat(format: Exclude<DownloadFormat, "json">): "," | "\t" {
  return format === "csv" ? "," : "\t";
}

export function extensionForFormat(format: DownloadFormat): string {
  return format;
}

export interface DownloadFilenames {
  examples?: string;
  words?: string;
  /** Single JSON filename when format is json. */
  json?: string;
}

export function buildDownloadFilenames(
  format: DownloadFormat,
  options: {
    ankiPhrases?: boolean;
    includeExamples: boolean;
    wordsOnly: boolean;
    examplesOnly: boolean;
  },
): DownloadFilenames {
  const ext = extensionForFormat(format);

  if (format === "json") {
    if (options.examplesOnly) {
      return { json: `slovak-wiki-examples.${ext}` };
    }

    if (options.wordsOnly) {
      return { json: `slovak-wiki-lemmas.${ext}` };
    }

    return { json: `slovak-wiki-dictionary.${ext}` };
  }

  if (options.ankiPhrases) {
    return { examples: `slovak-wiki-anki-phrases.${ext}` };
  }

  if (options.examplesOnly) {
    return { examples: `slovak-wiki-examples.${ext}` };
  }

  if (options.wordsOnly || !options.includeExamples) {
    return { words: `slovak-wiki-lemmas.${ext}` };
  }

  return {
    words: `slovak-wiki-words.${ext}`,
    examples: `slovak-wiki-examples.${ext}`,
  };
}

export function wordHeaders(fields: ReadonlySet<DownloadWordField>): string[] {
  const headers: string[] = [];

  for (const field of ["slug", "slovak", "english", "category", "related"] as const) {
    if (fields.has(field)) {
      headers.push(field);
    }
  }

  return headers;
}

export function exampleHeaders(fields: ReadonlySet<DownloadExampleField>): string[] {
  const headers: string[] = [];

  for (const field of ["slug", "lemma", "slovak", "english"] as const) {
    if (fields.has(field)) {
      headers.push(field);
    }
  }

  return headers;
}

/** Serialize a projected export into one or two file payloads. */
export function buildDownloadPayloads(
  meta: Pick<DictionaryExportFile, "attribution" | "generatedAt" | "source">,
  projected: ProjectedExport,
  options: ExportOptions,
): Array<{ filename: string; body: string; mime: string }> {
  const fieldSet = toSet(options.fields, []);
  const exampleFieldSet = toSet(options.exampleFields, DEFAULT_EXAMPLE_FIELDS);
  const wordsOnly = !projected.includeExamples && fieldSet.size > 0;
  const examplesOnly = projected.includeExamples && wordHeaders(fieldSet).length === 0;
  const includeHeader = options.includeHeader !== false;
  const includeAttributionComment = options.includeAttributionComment !== false;
  const ankiPhrases =
    examplesOnly &&
    !includeHeader &&
    !includeAttributionComment &&
    exampleFieldSet.size === 2 &&
    exampleFieldSet.has("slovak") &&
    exampleFieldSet.has("english");

  const filenames = buildDownloadFilenames(options.format, {
    includeExamples: projected.includeExamples,
    wordsOnly,
    examplesOnly,
    ankiPhrases,
  });

  const comment = includeAttributionComment ? attributionComment(meta) : undefined;
  const out: Array<{ filename: string; body: string; mime: string }> = [];

  if (options.format === "json") {
    const filename = filenames.json ?? "slovak-wiki-dictionary.json";
    out.push({
      filename,
      body: toExportJson(meta, projected.wordsJson),
      mime: "application/json;charset=utf-8",
    });
    return out;
  }

  const separator = separatorForFormat(options.format);
  const mime =
    options.format === "csv"
      ? "text/csv;charset=utf-8"
      : "text/tab-separated-values;charset=utf-8";

  if (filenames.words && projected.wordRows.length > 0) {
    out.push({
      filename: filenames.words,
      body: toDelimited(projected.wordRows, wordHeaders(fieldSet), separator, {
        comment,
        includeHeader,
      }),
      mime,
    });
  }

  if (filenames.examples && projected.includeExamples) {
    out.push({
      filename: filenames.examples,
      body: toDelimited(
        projected.exampleRows,
        exampleHeaders(exampleFieldSet),
        separator,
        { comment, includeHeader },
      ),
      mime,
    });
  }

  return out;
}

export function distinctCategories(words: readonly ExportWord[]): string[] {
  return [...new Set(words.map((word) => word.category))].sort((a, b) =>
    a.localeCompare(b),
  );
}
