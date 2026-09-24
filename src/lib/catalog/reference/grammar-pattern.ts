/** Turns `GrammarPattern.lines` strings into shapes the topic page can lay out. */

import type { Example } from "../types";

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

export type PatternView =
  | { kind: "paradigm"; singular: ParadigmCell[]; plural: ParadigmCell[] }
  | { kind: "tiles"; tiles: PatternTile[] }
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

/** Quarters and halves name the coming hour (štvrť na tri, pol tretej, trištvrte na tri). */
export function namesHourAhead(minute: number): boolean {
  return minute === 15 || minute === 30 || minute === 45;
}
