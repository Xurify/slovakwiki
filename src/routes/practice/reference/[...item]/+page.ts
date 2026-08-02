import { error } from "@sveltejs/kit";

import { practiceItemById, practiceItems } from "$lib/content/practice";

export function entries(): Array<{ item: string }> {
  return practiceItems.map((item) => ({ item: item.id }));
}

export function load({ params }) {
  const item = practiceItemById.get(params.item);
  if (!item) error(404, "Practice item not found");
  return { item };
}
