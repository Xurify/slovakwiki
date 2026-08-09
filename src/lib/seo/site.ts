/** Production origin — keep in sync with `site` in `astro.config.ts`. */
export const SITE_ORIGIN = "https://slovak.wiki";

export const SITE_NAME = "Slovak Wiki";

/** Build an absolute URL from a site path (may include `#fragment`). */
export function absoluteSiteUrl(path: string): string {
  const hashIndex = path.indexOf("#");
  const pathname = hashIndex === -1 ? path : path.slice(0, hashIndex);
  const fragment = hashIndex === -1 ? "" : path.slice(hashIndex);
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${SITE_ORIGIN}${normalized}${fragment}`;
}

/** Canonical path for a page — strips query string; fragments omitted (section anchors are not separate URLs). */
export function canonicalPathFromUrl(url: URL): string {
  return url.pathname;
}
