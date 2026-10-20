import {
  SEARCH_WEIGHTS,
  type SearchDocument,
} from "../../src/lib/catalog/search/documents";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/** `key[value]` reads the attribute, so commas inside the value don't split it into more keys. */
function metaTag(key: string, value: string): string {
  return `<data data-pagefind-meta="${key}[value]" value="${escapeHtml(value)}"></data>`;
}

/**
 * Custom records have no weights, so each document is indexed as a small HTML page
 * whose blocks carry `data-pagefind-weight`.
 */
export function searchDocumentHtml(document: SearchDocument): string {
  const meta: Record<string, string | undefined> = {
    title: document.title,
    kind: document.kind,
    summary: document.summary,
    category: document.category,
    register: document.register,
    examples: document.examples?.length ? JSON.stringify(document.examples) : undefined,
  };

  const metaTags = Object.entries(meta)
    .filter((entry): entry is [string, string] => Boolean(entry[1]))
    .map(([key, value]) => metaTag(key, value));

  const blocks = document.sections.map(
    (section) =>
      `<p data-pagefind-weight="${SEARCH_WEIGHTS[section.weight]}">${escapeHtml(section.text)}</p>`,
  );

  return [
    '<!doctype html><html lang="sk"><head><meta charset="utf-8"></head><body>',
    ...metaTags,
    `<data data-pagefind-filter="kind[value]" value="${document.kind}"></data>`,
    ...blocks,
    "</body></html>",
  ].join("");
}
