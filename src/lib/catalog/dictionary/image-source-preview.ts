export const IMAGE_SOURCE_IDS = [
  "sk",
  "en",
  "commons",
  "openverse",
  "pexels",
  "unsplash",
  "pixabay",
] as const;

export type ImageSourceId = (typeof IMAGE_SOURCE_IDS)[number];

export interface ImageSourceHit {
  fileTitle: string;
  query?: string;
  sourcePageUrl?: string;
  thumbUrl: string;
}

export interface ImageSourcePreviewRow {
  aiPick?: {
    confidence: "high" | "low";
    fileTitle?: string;
    model: string;
    reason: string;
    sourceId?: ImageSourceId | "live";
  };
  category: string;
  english: string;
  hits: Partial<Record<ImageSourceId, ImageSourceHit | null>>;
  liveSrc?: string;
  slovak: string;
  slug: string;
}

export interface ImageSourcePreviewFile {
  generatedAt: string;
  rows: ImageSourcePreviewRow[];
  /** Sources not queried in this snapshot, with the reason (e.g. missing API key). */
  skipped?: Partial<Record<ImageSourceId, string>>;
}

export const SOURCE_ORDERS: Array<{ id: string; label: string; order: ImageSourceId[] }> =
  [
    { id: "sk-en-commons", label: "SK → EN → Commons", order: ["sk", "en", "commons"] },
    { id: "en-sk-commons", label: "EN → SK → Commons", order: ["en", "sk", "commons"] },
    { id: "commons-en-sk", label: "Commons → EN → SK", order: ["commons", "en", "sk"] },
    {
      id: "openverse-commons-en",
      label: "Openverse → Commons → EN",
      order: ["openverse", "commons", "en"],
    },
    {
      id: "commons-openverse-sk",
      label: "Commons → Openverse → SK",
      order: ["commons", "openverse", "sk"],
    },
    {
      id: "pexels-unsplash-pixabay",
      label: "Pexels → Unsplash → Pixabay",
      order: ["pexels", "unsplash", "pixabay"],
    },
  ];

const SOURCE_LABELS: Record<ImageSourceId, string> = {
  sk: "SK wiki",
  en: "EN wiki",
  commons: "Commons",
  openverse: "Openverse",
  pexels: "Pexels",
  unsplash: "Unsplash",
  pixabay: "Pixabay",
};

export function sourceLabel(id: ImageSourceId): string {
  return SOURCE_LABELS[id];
}

/** First source in `order` that returned a thumb. */
export function pickWinner(
  hits: ImageSourcePreviewRow["hits"],
  order: readonly ImageSourceId[],
): ImageSourceId | undefined {
  for (const id of order) {
    if (hits[id]?.thumbUrl) return id;
  }
  return undefined;
}
