import type { APIRoute } from "astro";

import { buildDictionaryIndexSidecar } from "$lib/catalog/dictionary/browse";
import {
  buildWordLinkIndex,
  resolveWordLink,
  type WordLinkIndex,
} from "$lib/search/word-link";

export const prerender = false;

let index: WordLinkIndex | undefined;

/**
 * A link other sites can build from any Slovak word: `/w/vaňa`, `/w/ženy`,
 * `/w?q=dobrý deň`. A 302, not a 301, since the same word may land on a new
 * entry once the dictionary grows.
 */
export const GET: APIRoute = ({ params, url }) => {
  index ??= buildWordLinkIndex(buildDictionaryIndexSidecar());
  const query = params.word || url.searchParams.get("q") || "";

  return new Response(null, {
    status: 302,
    headers: {
      Location: resolveWordLink(query, index),
      "Cache-Control": "public, max-age=300, s-maxage=86400",
    },
  });
};
