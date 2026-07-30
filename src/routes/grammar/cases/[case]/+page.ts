import { error } from "@sveltejs/kit";

import { caseTopicBySlug, caseTopics } from "$lib/content/data";

export function entries(): Array<{ case: string }> {
  return caseTopics.map((topic) => ({ case: topic.slug }));
}

export function load({ params }) {
  const topic = caseTopicBySlug.get(params.case);
  if (!topic) {
    error(404, "Case topic not found");
  }
  return { topic };
}
