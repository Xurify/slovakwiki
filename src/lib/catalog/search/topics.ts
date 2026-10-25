import { grammarEntries } from "../entries";
import { lessons } from "../lessons";
import { practiceSets } from "../practice";
import { sentenceCase } from "./ui";

/** One learning topic: a lesson with its practice sets and grammar page, or a standalone grammar page. */
export interface SearchTopic {
  grammarHref?: string;
  id: string;
  lessonHref?: string;
  practiceHref?: string;
  /** Slovak name from the grammar page, when the topic has one. */
  slovak?: string;
  summary: string;
  title: string;
}

/**
 * The grammar page is the lesson's reference link to `/grammar/<lesson slug>`,
 * so a lesson only claims a grammar page it already points at.
 */
export function buildSearchTopics(): SearchTopic[] {
  const claimedGrammarHrefs = new Set<string>();
  const lessonTopics: SearchTopic[] = lessons.map((lesson) => {
    const id = `${lesson.track}/${lesson.slug}`;
    const grammarHref = lesson.referenceLinks.find(
      (link) => link.href === `/grammar/${lesson.slug}`,
    )?.href;
    if (grammarHref) {
      claimedGrammarHrefs.add(grammarHref);
    }
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

  const standaloneGrammarTopics: SearchTopic[] = grammarEntries
    .filter((entry) => !claimedGrammarHrefs.has(`/grammar/${entry.slug}`))
    .map((entry) => ({
      id: `grammar/${entry.slug}`,
      title: sentenceCase(entry.english),
      summary: entry.summary,
      grammarHref: `/grammar/${entry.slug}`,
      slovak: entry.slovak,
    }));

  return [...lessonTopics, ...standaloneGrammarTopics];
}
