/** Parses `GrammarPattern.lines` into typed rows for the pattern table. */

export type PatternTimeRow = {
  kind: "time";
  digital: string;
  hour: number;
  lookingAhead: boolean;
  minute: number;
  slovak: string;
};

export type PatternPersonRow = {
  kind: "person";
  /** Empty when the forms share no regular stem (e.g. byť). */
  ending: string;
  form: string;
  pronoun: string;
  stem: string;
};

export type PatternChangeRow = {
  kind: "change";
  from: string;
  gloss?: string;
  to: string;
};

export type PatternGlossRow = {
  kind: "gloss";
  english: string;
  slovak: string;
};

export type PatternLabelRow = {
  kind: "label";
  label: string;
  value: string;
};

export type PatternPlainRow = {
  kind: "plain";
  text: string;
};

export type PatternRow =
  | PatternChangeRow
  | PatternGlossRow
  | PatternLabelRow
  | PatternPersonRow
  | PatternPlainRow
  | PatternTimeRow;

const PERSON_PATTERN = /^((?:ja|ty|my|vy)|(?:on|oni)(?: \/ (?:ona|ono|ony))*) (\S+)$/;
const TIME_PATTERN = /^(\d{1,2}):(\d{2})$/;
const SLOVAK_LETTERS = /[áäčďéíĺľňóôŕšťúýž]/i;
const MIN_STEM_LENGTH = 3;
/** Quarter and half phrases name the coming hour (štvrť na tri, pol tretej, trištvrte na tri). */
const LOOKING_AHEAD_MINUTES = new Set([15, 30, 45]);

export function looksSlovak(text: string): boolean {
  return SLOVAK_LETTERS.test(text);
}

function splitOnce(text: string, separator: string): [string, string] | null {
  const parts = text.split(separator);
  if (parts.length !== 2) return null;
  const [left, right] = parts.map((part) => part.trim());
  if (!left || !right) return null;
  return [left, right];
}

function commonPrefix(values: readonly string[]): string {
  if (values.length === 0) return "";
  let prefix = values[0]!;
  for (const value of values.slice(1)) {
    while (!value.startsWith(prefix)) prefix = prefix.slice(0, -1);
  }
  return prefix;
}

function parseLine(line: string, withClocks: boolean): PatternRow {
  const arrow = splitOnce(line, "→");

  if (arrow) {
    const [left, right] = arrow;
    const time = TIME_PATTERN.exec(left);

    if (withClocks && time) {
      const minute = Number(time[2]);
      return {
        kind: "time",
        digital: left,
        hour: Number(time[1]),
        lookingAhead: LOOKING_AHEAD_MINUTES.has(minute),
        minute,
        slovak: right,
      };
    }

    if (withClocks) return { kind: "label", label: left, value: right };

    const glossed = splitOnce(right, "·");
    return glossed
      ? { kind: "change", from: left, to: glossed[0], gloss: glossed[1] }
      : { kind: "change", from: left, to: right };
  }

  const person = PERSON_PATTERN.exec(line);
  if (person) {
    return {
      kind: "person",
      pronoun: person[1]!,
      form: person[2]!,
      stem: "",
      ending: "",
    };
  }

  const glossed = splitOnce(line, "·");
  if (glossed) return { kind: "gloss", slovak: glossed[0], english: glossed[1] };

  const labelled = splitOnce(line, ":");
  if (labelled) return { kind: "label", label: labelled[0], value: labelled[1] };

  return { kind: "plain", text: line };
}

export function parsePatternLines(
  lines: readonly string[],
  { withClocks = false }: { withClocks?: boolean } = {},
): PatternRow[] {
  const rows = lines.map((line) => parseLine(line, withClocks));
  const persons = rows.filter((row): row is PatternPersonRow => row.kind === "person");
  const stem = commonPrefix(persons.map((row) => row.form));

  if (stem.length >= MIN_STEM_LENGTH) {
    for (const row of persons) {
      row.stem = stem;
      row.ending = row.form.slice(stem.length);
    }
  }

  return rows;
}
