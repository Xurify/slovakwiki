/** Turns `GrammarPattern.lines` strings into shapes the topic page can lay out. */

export interface ParadigmCell {
  pronoun: string;
  form: string;
  /** Shared start of every form; empty when the verb is too irregular to split. */
  stem: string;
  ending: string;
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

export type PatternView =
  | { kind: "paradigm"; singular: ParadigmCell[]; plural: ParadigmCell[] }
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

  const pairs = lines.map((line) => PARADIGM_LINE.exec(line));
  const matched = pairs.every(
    (match, index) => match !== null && PERSONS[index]!.test(match[1]!),
  );
  if (!matched) return undefined;

  const forms = pairs.map((match) => match![2]!);
  const prefix = commonPrefix(forms);
  const stem = prefix.length >= MIN_STEM ? prefix : "";

  const cells = pairs.map((match) => {
    const form = match![2]!;
    return { pronoun: match![1]!, form, stem, ending: form.slice(stem.length) };
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

export function parsePattern(lines: readonly string[]): PatternView {
  return parseParadigm(lines) ?? { kind: "rows", rows: lines.map(parsePatternRow) };
}

/** Quarters and halves name the coming hour (štvrť na tri, pol tretej, trištvrte na tri). */
export function namesHourAhead(minute: number): boolean {
  return minute === 15 || minute === 30 || minute === 45;
}
