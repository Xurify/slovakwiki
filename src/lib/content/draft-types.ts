export type DraftStatus = "pending" | "approved" | "rejected" | "promoted";

export type DraftPos = "verb" | "noun" | "adjective";

export interface DraftExample {
  english: string;
  slovak: string;
  tatoebaId?: number;
}

export interface DraftEntry {
  category?: string;
  english?: string;
  examples?: DraftExample[];
  frequencyRank: number;
  notes?: string;
  pos: DraftPos;
  promotedAt?: string;
  slovak: string;
  slug: string;
  sources: string[];
  status: DraftStatus;
}
