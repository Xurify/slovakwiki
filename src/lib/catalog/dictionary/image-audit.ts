import { words } from "./words";
import {
  getImageManifestEntry,
  manifestImageSrc,
  type ImageManifestEntry,
} from "./images";

export type ImageAuditSource = "sk-wiki" | "en-wiki" | "commons" | "unsplash" | "pixabay";

export interface DictionaryImageAuditRow {
  caption: string;
  category: string;
  commonsFile?: string;
  english: string;
  /** Absent for hotlinked stock photos. */
  file?: string;
  slovak: string;
  slug: string;
  source: ImageAuditSource;
  sourcePageUrl?: string;
  src: string;
  wikiLang?: "en" | "sk";
  wikiTitle?: string;
}

export function imageAuditSource(entry: ImageManifestEntry): ImageAuditSource {
  if (entry.source === "unsplash" || entry.source === "pixabay") return entry.source;
  if (entry.wikiTitle?.startsWith("Commons:")) return "commons";
  if (entry.wikiLang === "en") return "en-wiki";
  if (entry.wikiLang === "sk") return "sk-wiki";
  return "commons";
}

/** Live `ok` images for `/dev/images`. Disk check stays in the page when not on CDN. */
export function listOkDictionaryImages(): DictionaryImageAuditRow[] {
  const seen = new Set<string>();
  const rows: DictionaryImageAuditRow[] = [];

  for (const word of words) {
    if (word.kind !== "word") continue;
    if (seen.has(word.slug)) continue;
    seen.add(word.slug);

    const entry = getImageManifestEntry(word.slug);
    const src = entry && manifestImageSrc(entry);
    if (!entry || !src) continue;

    rows.push({
      caption: entry.caption?.trim() || word.english,
      category: word.category,
      commonsFile: entry.commonsFile,
      english: word.english,
      file: entry.file,
      slovak: word.slovak,
      slug: word.slug,
      source: imageAuditSource(entry),
      sourcePageUrl: entry.sourcePageUrl,
      src,
      wikiLang: entry.wikiLang,
      wikiTitle: entry.wikiTitle,
    });
  }

  return rows.sort((a, b) => a.slug.localeCompare(b.slug, "en"));
}
