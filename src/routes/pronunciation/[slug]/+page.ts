import { error } from "@sveltejs/kit";

import { pronunciationEntries } from "$lib/content/data";

export function entries(): Array<{ slug: string }> {
  return pronunciationEntries.map((entry) => ({ slug: entry.slug }));
}

export function load({ params }) {
  const entry = pronunciationEntries.find((topic) => topic.slug === params.slug);
  if (!entry) {
    error(404, "Pronunciation topic not found");
  }
  return { entry };
}
