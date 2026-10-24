import type { APIRoute } from "astro";

import { buildLevelTestBank } from "$lib/catalog/level-test/bank";

/** Fetched when a test starts, so the item pool stays out of the page HTML. */
export const GET: APIRoute = () =>
  new Response(JSON.stringify(buildLevelTestBank()), {
    headers: { "content-type": "application/json" },
  });
