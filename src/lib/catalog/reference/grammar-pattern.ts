/** Turns a grammar pattern into the shape the topic page lays out. */

import type {
  Example,
  GrammarPattern,
  GrammarTablePattern,
  GrammarTopic,
} from "../types";

export function isGrammarTable(pattern: GrammarPattern): pattern is GrammarTablePattern {
  return "rows" in pattern;
}

export interface ParadigmCell {
  pronoun: string;
  form: string;
  /** Shared start of every form; empty when the verb is too irregular to split. */
  stem: string;
  ending: string;
  /** English after ` · ` (ja som · I am). */
  gloss?: string;
}

export interface PatternRow {
  /** Text before `:` in "label: value" lines. */
  label?: string;
  main: string;
  /** Text after `→`. */
  result?: string;
  /** English after ` · `; its presence means `main` is Slovak. */
  gloss?: string;
}

/** A phrase split around the part the pattern is about. */
export interface MarkedPhrase {
  before: string;
  mark: string;
  after: string;
}

export interface PatternTile {
  label: string;
  ending: string;
  example?: { english: string; slovak: MarkedPhrase };
}

export interface PatternGridRow {
  label: string;
  cells: MarkedPhrase[];
}

export type PatternView =
  | { kind: "paradigm"; singular: ParadigmCell[]; plural: ParadigmCell[] }
  | { kind: "tiles"; tiles: PatternTile[] }
  | { kind: "grid"; rowLabel: string; columns: string[]; rows: PatternGridRow[] }
  | { kind: "rows"; rows: PatternRow[] };

const PERSONS = [
  /^ja$/,
  /^ty$/,
  /^on(?: \/ ona)?(?: \/ ono)?$/,
  /^my$/,
  /^vy$/,
  /^oni \/ ony$/,
] as const;

const PARADIGM_LINE = /^(.+?) (\S+)$/;
const MIN_STEM = 2;

function commonPrefix(forms: readonly string[]): string {
  const [first = "", ...rest] = forms;
  let length = first.length;
  for (const form of rest) {
    let index = 0;
    while (index < length && form[index] === first[index]) index += 1;
    length = index;
  }
  return first.slice(0, length);
}

function parseParadigm(lines: readonly string[]): PatternView | undefined {
  if (lines.length !== PERSONS.length) return undefined;

  const split = lines.map((line) => {
    const [head = "", ...glossParts] = line.split(" · ");
    return {
      match: PARADIGM_LINE.exec(head),
      gloss: glossParts.length > 0 ? glossParts.join(" · ") : undefined,
    };
  });
  const matched = split.every(
    ({ match }, index) => match !== null && PERSONS[index]!.test(match[1]!),
  );
  if (!matched) return undefined;

  const forms = split.map(({ match }) => match![2]!);
  const prefix = commonPrefix(forms);
  const stem = prefix.length >= MIN_STEM ? prefix : "";

  const cells: ParadigmCell[] = split.map(({ match, gloss }) => {
    const form = match![2]!;
    return { pronoun: match![1]!, form, stem, ending: form.slice(stem.length), gloss };
  });

  return { kind: "paradigm", singular: cells.slice(0, 3), plural: cells.slice(3) };
}

export function parsePatternRow(line: string): PatternRow {
  const [head = "", ...glossParts] = line.split(" · ");
  const gloss = glossParts.length > 0 ? glossParts.join(" · ") : undefined;

  const arrow = head.indexOf("→");
  if (arrow !== -1) {
    return {
      main: head.slice(0, arrow).trim(),
      result: head.slice(arrow + 1).trim(),
      gloss,
    };
  }

  const colon = head.indexOf(": ");
  if (colon !== -1 && gloss === undefined) {
    return { label: head.slice(0, colon).trim(), main: head.slice(colon + 2).trim() };
  }

  return { main: head.trim(), gloss };
}

/** Marks the first word that ends in `suffix` (dobrý muž → dobr[ý] muž). */
export function markSuffix(phrase: string, suffix: string): MarkedPhrase | undefined {
  const match = new RegExp(`(\\p{L}*?)(${suffix})(?=\\P{L}|$)`, "u").exec(phrase);
  if (!match || match[1] === "") return undefined;

  const start = match.index + match[1]!.length;
  return {
    before: phrase.slice(0, start),
    mark: suffix,
    after: phrase.slice(start + suffix.length),
  };
}

/** The prefix a derived form adds (mám → [ne]mám, robiť → [u]robiť). */
export function addedPrefix(row: PatternRow): MarkedPhrase | undefined {
  const { main, result } = row;
  if (!result || result.length <= main.length || !result.endsWith(main)) return undefined;

  return { before: "", mark: result.slice(0, result.length - main.length), after: main };
}

export function markAgainst(base: string, form: string): MarkedPhrase {
  if (form !== base && form.startsWith(base)) {
    return { before: base, mark: form.slice(base.length), after: "" };
  }
  if (form !== base && form.endsWith(base)) {
    return { before: "", mark: form.slice(0, form.length - base.length), after: base };
  }
  // toho + -to drops the middle o: tohto. Mark the same -to as táto.
  const head = base.slice(0, -1);
  const tail = base.slice(-1);
  if (head && form === `${head}t${tail}`) {
    return { before: head, mark: `t${tail}`, after: "" };
  }
  return { before: form, mark: "", after: "" };
}

const EXPLICIT_MARK = /^(.*)\[(.+)\](.*)$/u;

/** A table cell without its `[ending]` brackets. */
export function plainCell(cell: string): string {
  return cell.replace(/[[\]]/gu, "");
}

/** `moj[ej]` marks the ending where the form does not grow out of the row's first cell. */
function markCell(base: string, cell: string): MarkedPhrase {
  const explicit = EXPLICIT_MARK.exec(cell);
  if (!explicit) return markAgainst(base, cell);

  return { before: explicit[1]!, mark: explicit[2]!, after: explicit[3]! };
}

/** A phrase with its `[part]` marked, or unmarked when it has no brackets. */
export function markedPhrase(text: string): MarkedPhrase {
  return markCell(text, text);
}

export function tableView(pattern: GrammarTablePattern): PatternView {
  const { rowLabel, columns, rows } = pattern;

  for (const row of rows) {
    if (row.cells.length !== columns.length) {
      throw new Error(
        `"${pattern.label}" row "${row.label}" has ${row.cells.length} cells, expected ${columns.length}`,
      );
    }
  }

  return {
    kind: "grid",
    rowLabel,
    columns: [...columns],
    rows: rows.map((row) => ({
      label: row.label,
      cells: row.cells.map((form) => markCell(plainCell(row.cells[0] ?? ""), form)),
    })),
  } satisfies PatternView;
}

function parseTiles(rows: readonly PatternRow[], examples: readonly Example[]) {
  const endings = rows.every((row) => row.label && row.main.startsWith("-"));
  if (!endings) return undefined;

  const paired = examples.length === rows.length;

  const tiles: PatternTile[] = rows.map((row, index) => {
    const ending = row.main.slice(1);
    const example = paired ? examples[index] : undefined;
    const slovak = example ? markSuffix(example.slovak, ending) : undefined;

    return {
      label: row.label!,
      ending: row.main,
      example: example && slovak ? { english: example.english, slovak } : undefined,
    };
  });

  return { kind: "tiles", tiles } as const;
}

export function parsePattern(
  lines: readonly string[],
  examples: readonly Example[] = [],
): PatternView {
  const paradigm = parseParadigm(lines);
  if (paradigm) return paradigm;

  const rows = lines.map(parsePatternRow);
  return parseTiles(rows, examples) ?? { kind: "rows", rows };
}

export function patternView(
  pattern: GrammarPattern,
  examples: readonly Example[] = [],
): PatternView {
  if (isGrammarTable(pattern)) return tableView(pattern);
  return parsePattern(pattern.lines, examples);
}

/** Anchor for a further table's heading ("Arrive, leave, go in, go out" → arrive-leave-go-in-go-out). */
export function patternAnchor(label: string): string {
  return label
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function patternForms(pattern: GrammarPattern): string[] {
  if (!isGrammarTable(pattern)) return [];

  const forms = new Set<string>();
  for (const row of pattern.rows) {
    for (const cell of row.cells) {
      for (const word of plainCell(cell).match(/\p{L}+/gu) ?? []) {
        forms.add(word.toLocaleLowerCase("sk"));
      }
    }
  }
  return [...forms];
}

/** Labels and forms a table contributes to search, in place of the old line strings. */
export function patternSearchLines(pattern: GrammarPattern): string[] {
  if (isGrammarTable(pattern)) {
    return pattern.rows.flatMap((row) => [row.label, ...row.cells.map(plainCell)]);
  }
  return pattern.lines.map(plainCell);
}

/** Quarters and halves name the coming hour (štvrť na tri, pol tretej, trištvrte na tri). */
export function namesHourAhead(minute: number): boolean {
  return minute === 15 || minute === 30 || minute === 45;
}

/** Every example on a topic page: the main table's, then each further table's. */
export function grammarExamples(topic: GrammarTopic): Example[] {
  return [
    ...topic.examples,
    ...(topic.morePatterns ?? []).flatMap((pattern) => pattern.examples ?? []),
  ];
}
