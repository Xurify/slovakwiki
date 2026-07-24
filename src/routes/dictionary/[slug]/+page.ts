import { error } from "@sveltejs/kit";

import { words } from "$lib/content/data";

export function entries(): Array<{ slug: string }> {
  return words.map((entry) => ({ slug: entry.slug }));
}

export function load({ params }) {
  const entry = words.find((word) => word.slug === params.slug);
  if (!entry) {
    error(404, "Word not found");
  }
  return { entry };
}
