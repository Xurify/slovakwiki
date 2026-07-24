import { error } from "@sveltejs/kit";

import { grammarEntries } from "$lib/content/data";

export function entries(): Array<{ slug: string }> {
  return grammarEntries.map((entry) => ({ slug: entry.slug }));
}

export function load({ params }) {
  const entry = grammarEntries.find((topic) => topic.slug === params.slug);
  if (!entry) {
    error(404, "Grammar topic not found");
  }
  return { entry };
}
