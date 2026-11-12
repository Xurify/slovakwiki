import { aspectItems, type AuthoredChooseVerbItem } from "$lib/catalog/level-test/aspect";
import type { CefrLevel } from "$lib/level-test/scale";
import type { ChoiceExercise, PracticeItem } from "$lib/learning/types";

export const aspectLessonId = "grammar/aspect";

const aspectSource = {
  kind: "lesson" as const,
  label: "Aspect: imperfective and perfective",
  href: "/lessons/grammar/aspect",
};

/** The lesson teaches A1–A2 cues; the harder items stay in the level test. */
const PRACTICE_LEVELS: ReadonlySet<CefrLevel> = new Set(["A1", "A2"]);

export const ASPECT_SESSION_SIZE = 10;

const ASPECT_IDS = ["imperfective", "perfective"] as const;

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const WHY_WRONG = {
  imperfective: (form: string) =>
    `**${capitalize(form)}** is the imperfective: an action going on, repeated, or lasting a while.`,
  perfective: (form: string) =>
    `**${capitalize(form)}** is the perfective: one action, done, with its result.`,
};

// Slovak letters with diacritics never occur in the English of a why line.
const SLOVAK_LETTER = /[áäčďéíĺľňóôŕšťúýž]/i;
// Slovak words in the sentence that are also English words in the why line.
const ENGLISH_HOMOGRAPHS = new Set(["a", "do", "to", "on", "so", "is", "it", "me"]);

function words(text: string): string[] {
  return text.toLowerCase().match(/\p{L}+/gu) ?? [];
}

/**
 * The authored why lines name their cue in plain Slovak (“Práve means…”,
 * “Za jeden víkend says…”). Bold every Slovak word in them, joining runs.
 */
export function aspectWhy(
  item: Pick<AuthoredChooseVerbItem, "why" | "options" | "answer" | "before" | "after">,
): string {
  const slovak = new Set(
    words([item.before, item.after, ...item.options].join(" ")).filter(
      (word) => !ENGLISH_HOMOGRAPHS.has(word),
    ),
  );

  const marked = item.why
    .replace(/\p{L}+/gu, (word) =>
      slovak.has(word.toLowerCase()) || SLOVAK_LETTER.test(word) ? `**${word}**` : word,
    )
    .replace(/\*\* \*\*/g, " ");
  if (marked.includes("**")) return marked;

  // A why line with no Slovak in it ends on the aspect: name the form there.
  const answer = item.options[item.answer];
  return marked.replace(/perfective\.$/, `perfective: **${answer}**.`);
}

function sentence(item: AuthoredChooseVerbItem, form: string): string {
  return `${item.before}${form}${item.after}`;
}

function shortId(item: Pick<AuthoredChooseVerbItem, "id">): string {
  return item.id.replace(/^cv-/, "");
}

export function aspectPracticeItemId(item: Pick<AuthoredChooseVerbItem, "id">): string {
  return `grammar/aspect-${shortId(item)}`;
}

/** One choose-the-verb item as a choice between the two full sentences, imperfective first. */
export function aspectChoiceExercise(
  item: AuthoredChooseVerbItem,
  id: string,
): ChoiceExercise {
  const answer = ASPECT_IDS[item.answer];

  return {
    id,
    type: "choice",
    practiceItemId: aspectPracticeItemId(item),
    prompt: item.english,
    choices: ASPECT_IDS.map((aspect, index) => {
      const form = item.options[index];
      const label = sentence(item, form);
      return aspect === answer
        ? { id: aspect, label }
        : { id: aspect, label, whyWrong: WHY_WRONG[aspect](form) };
    }),
    answerId: answer,
    feedback: {
      correction: sentence(item, item.options[item.answer]),
      english: item.english,
      why: aspectWhy(item),
    },
  };
}

export function aspectItem(id: string): AuthoredChooseVerbItem {
  const item = aspectItems.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`Unknown aspect item: ${id}`);
  return item;
}

export const aspectPracticeItems: PracticeItem[] = aspectItems
  .filter((item) => PRACTICE_LEVELS.has(item.level))
  .map((item) => {
    const task = aspectChoiceExercise(item, `review-aspect-${shortId(item)}`);
    return {
      id: task.practiceItemId,
      source: aspectSource,
      task,
      feedback: task.feedback,
    };
  });

export const aspectPracticeItemIds = aspectPracticeItems.map((item) => item.id);
