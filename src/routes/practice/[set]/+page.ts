import { error } from "@sveltejs/kit";

import { practiceSetById, practiceSets } from "$lib/content/practice";

export function entries(): Array<{ set: string }> {
  return practiceSets.map((set) => ({ set: set.id }));
}

export function load({ params }) {
  const set = practiceSetById.get(params.set);
  if (!set) error(404, "Practice topic not found");
  return { set };
}
