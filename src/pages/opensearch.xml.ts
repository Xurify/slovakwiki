import type { APIRoute } from "astro";

import { SITE_NAME, SITE_ORIGIN } from "$lib/seo/site";

/** Lets a browser add the site as a search engine; queries go through the word link. */
export const GET: APIRoute = () => {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/" xmlns:moz="http://www.mozilla.org/2006/browser/search/">
  <ShortName>${SITE_NAME}</ShortName>
  <Description>Look up Slovak words, grammar and lessons</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <Image width="32" height="32" type="image/x-icon">${SITE_ORIGIN}/favicon.ico</Image>
  <Url type="text/html" method="get" template="${SITE_ORIGIN}/w?q={searchTerms}"/>
  <moz:SearchForm>${SITE_ORIGIN}/search</moz:SearchForm>
</OpenSearchDescription>
`;

  return new Response(body, {
    headers: { "Content-Type": "application/opensearchdescription+xml; charset=utf-8" },
  });
};
