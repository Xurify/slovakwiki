import imagesManifest from "../../../content/images/manifest.json";

export type ImageStatus = "missing" | "ok" | "rejected";

export interface ImageManifestEntry {
  /** Creator / artist from Commons extmetadata (HTML stripped when stored). */
  artist?: string;
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
  /** Link to the file description page (Commons or Wikipedia). */
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
  caption: string;
  license?: string;
  licenseUrl?: string;
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
export function resolveImageSrc(file: string): string {
  const key = imageObjectKey(file);
  const base = imageBaseUrl();
  if (base) return `${base}/${key}`;
  return `/${key}`;
}

/**
 * Build a UI view from a manifest entry when status is `ok` and `file` is set.
 * Callers that need disk presence (Astro SSG) should check the file separately.
 */
export function dictionaryImageView(
  slug: string,
  fallbackCaption: string,
): DictionaryImageView | undefined {
  const entry = manifest[slug];
  if (!entry || entry.status !== "ok" || !entry.file) return undefined;

  return {
    artist: entry.artist,
    caption: entry.caption?.trim() || fallbackCaption,
    license: entry.license,
    licenseUrl: entry.licenseUrl,
    sourcePageUrl: entry.sourcePageUrl,
    src: resolveImageSrc(entry.file),
  };
}
