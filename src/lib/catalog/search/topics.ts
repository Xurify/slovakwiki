import { grammarEntries } from "../entries";
import { lessons } from "../lessons";
import { practiceSets } from "../practice";

/** One learning topic: a lesson with its practice sets and grammar page, linked as one row. */
export interface SearchTopic {
  grammarHref?: string;
  id: string;
  lessonHref: string;
  practiceHref?: string;
  /** Slovak name from the grammar page, when the lesson has one. */
  slovak?: string;
  summary: string;
  title: string;
}

/**
 * The grammar page is the lesson's reference link to `/grammar/<lesson slug>`,
 * so a lesson only claims a grammar page it already points at.
 */
export function buildSearchTopics(): SearchTopic[] {
  return lessons.map((lesson) => {
    const id = `${lesson.track}/${lesson.slug}`;
    const grammarHref = lesson.referenceLinks.find(
      (link) => link.href === `/grammar/${lesson.slug}`,
    )?.href;
    const grammar = grammarHref
      ? grammarEntries.find((entry) => entry.slug === lesson.slug)
      : undefined;
    const practice = practiceSets.find((set) => set.lessonId === id);

    return {
      id,
      title: lesson.title,
      summary: lesson.promise,
      lessonHref: `/lessons/${id}`,
      ...(practice ? { practiceHref: `/practice/${practice.id}` } : {}),
      ...(grammarHref ? { grammarHref } : {}),
      ...(grammar ? { slovak: grammar.slovak } : {}),
    };
  });
}
