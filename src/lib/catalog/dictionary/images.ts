import imagesManifest from "../../../../content/images/manifest.json";

export type ImageStatus = "missing" | "ok" | "rejected";

/** Where the picture came from. Absent on older entries, which are all Wikimedia. */
export type ImageSource = "wikimedia" | "unsplash" | "pixabay";

export interface ImageManifestEntry {
  /** Creator / artist from Commons extmetadata (HTML stripped when stored). */
  artist?: string;
  /** Photographer profile page (Unsplash / Pixabay). */
  artistUrl?: string;
  /** Display caption; usually the English gloss. */
  caption?: string;
  /** Commons / wiki file title, e.g. `Koláč.jpg`. */
  commonsFile?: string;
  fetchedAt: string;
  /** Filename under `static/images/dictionary/`, e.g. `kolac.webp`. */
  file?: string;
  /** Short license label (CC BY-SA 4.0, Public domain, …). */
  license?: string;
  /** License deed / info URL when available. */
  licenseUrl?: string;
  /**
   * Image URL at the source. Unsplash entries are served from here: the API
   * terms require hotlinking instead of copying to our own storage.
   */
  originalUrl?: string;
  /** Search phrase that found a hand-picked stock photo. */
  query?: string;
  source?: ImageSource;
  /** Photo id at the source (Unsplash / Pixabay). */
  sourceId?: string;
  /** Link to the file description page (Commons, Wikipedia, Unsplash, Pixabay). */
  sourcePageUrl?: string;
  status: ImageStatus;
  /** ISO timestamp when last uploaded to R2. */
  uploadedAt?: string;
  /** Wikipedia article title that supplied the page image. */
  wikiTitle?: string;
  wikiLang?: "en" | "sk";
}

export interface ImageOverride {
  /** Force a specific Commons / wiki file (with or without `File:` prefix). */
  commonsFile?: string;
  /** Skip auto-fetch and hide the image. */
  reject?: boolean;
}

export interface DictionaryImageView {
  artist?: string;
  artistUrl?: string;
  caption: string;
  license?: string;
  licenseUrl?: string;
  sourceLabel: string;
  sourcePageUrl?: string;
  src: string;
}

type ManifestMap = Record<string, ImageManifestEntry>;

const manifest = imagesManifest as ManifestMap;

export function getImageManifestEntry(slug: string): ImageManifestEntry | undefined {
  return manifest[slug];
}

/** Relative object / public path key: `images/dictionary/{file}`. */
export function imageObjectKey(file: string): string {
  return `images/dictionary/${file}`;
}

function imageBaseUrl(): string | undefined {
  return import.meta.env.PUBLIC_IMAGE_BASE_URL?.replace(/\/$/, "");
}

/** True when lemma images resolve from CDN (no local disk required at build). */
export function imagesUseCdn(): boolean {
  return Boolean(imageBaseUrl());
}

/**
 * Public URL for a dictionary lemma image.
 * - With `PUBLIC_IMAGE_BASE_URL` → R2 / CDN (`…/images/dictionary/{file}`)
 * - Without → local Astro static `/images/dictionary/{file}`
 */
export function resolveImageSrc(file: string, version?: string): string {
  const key = imageObjectKey(file);
  const base = imageBaseUrl();
  const src = base ? `${base}/${key}` : `/${key}`;
  if (!version) return src;
  return `${src}?v=${encodeURIComponent(version)}`;
}

/** Unsplash asks for these on every link back to them. */
const UNSPLASH_REFERRAL = "utm_source=slovak_wiki&utm_medium=referral";

function withUnsplashReferral(url: string | undefined): string | undefined {
  if (!url) return undefined;
  return `${url}${url.includes("?") ? "&" : "?"}${UNSPLASH_REFERRAL}`;
}

/** Hotlinked entries carry no `file`; everything else is served from our storage. */
export function isHotlinkedImage(entry: ImageManifestEntry): boolean {
  return entry.source === "unsplash" && Boolean(entry.originalUrl);
}

/** Public URL for an `ok` entry, or `undefined` when it has nothing to show. */
export function manifestImageSrc(entry: ImageManifestEntry): string | undefined {
  if (entry.status !== "ok") return undefined;
  if (isHotlinkedImage(entry)) return entry.originalUrl;
  if (!entry.file) return undefined;
  return resolveImageSrc(entry.file, entry.uploadedAt ?? entry.fetchedAt);
}

export function imageSourceLabel(entry: ImageManifestEntry): string {
  if (entry.source === "unsplash") return "Unsplash";
  if (entry.source === "pixabay") return "Pixabay";
  return "Wikimedia";
}

/**
 * Build a UI view from an `ok` manifest entry.
 * Callers that need disk presence (Astro SSG) should check the file separately.
 */
export function dictionaryImageView(
  slug: string,
  fallbackCaption: string,
): DictionaryImageView | undefined {
  const entry = manifest[slug];
  if (!entry) return undefined;
  const src = manifestImageSrc(entry);
  if (!src) return undefined;

  const unsplash = entry.source === "unsplash";
  return {
    artist: entry.artist,
    artistUrl: unsplash ? withUnsplashReferral(entry.artistUrl) : entry.artistUrl,
    caption: entry.caption?.trim() || fallbackCaption,
    license: entry.license,
    licenseUrl: entry.licenseUrl,
    sourceLabel: imageSourceLabel(entry),
    sourcePageUrl: unsplash
      ? withUnsplashReferral(entry.sourcePageUrl)
      : entry.sourcePageUrl,
    src,
  };
}
