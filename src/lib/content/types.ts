export type EntryKind = "word" | "grammar" | "pronunciation";

export interface Example {
  english: string;
  slovak: string;
}

export interface ContentEntry {
  aliases?: string[];
  body: string[];
  category: string;
  english: string;
  examples: Example[];
  kind: EntryKind;
  related: string[];
  slug: string;
  slovak: string;
  source: string;
  summary: string;
  tags: string[];
}
