import type { APIRoute } from "astro";
import { getSecret } from "astro:env/server";

import { json } from "$lib/level-test/server/guard";
import type { ScoringCapabilities } from "$lib/level-test/types";

export const prerender = false;

/** Which AI-scored tasks can run; the test shows the rest as planned. */
export const GET: APIRoute = () => {
  const capabilities: ScoringCapabilities = {
    scoring: Boolean(getSecret("ANTHROPIC_API_KEY")),
    transcription: Boolean(getSecret("ELEVENLABS_API_KEY")),
  };
  return json(capabilities);
};
