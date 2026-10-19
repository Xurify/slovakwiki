/**
 * Which words a lesson has shown before it tests them.
 *
 * A word counts as introduced once it appears in a scene line or a key term of the
 * current or an earlier beat. Inflected forms match by a shared stem (see
 * `sameWord`), so introducing "taška" covers "tašku" — a lesson that teaches case
 * endings has to be able to test them.
 */

import type { Lesson, LessonExercise, LessonVisual, PracticeTask } from "./types";

/**
 * Grammar words, question words, greetings, and the cast's names. They carry the
 * pattern being taught or are learned before any lesson, so they never block a check.
 */
const CORE_WORDS = new Set(
  [
    // byť, mať, and personal pronouns
    "som si je sme ste sú byť mám máš má máme máte majú",
    "ja ty on ona ono my vy oni ony ma mi ťa ti ho mu ju jej nás nám vás vám ich im sa si ním ňou nimi ňom nej nich",
    // prepositions and conjunctions
    "a aj ale alebo že do z zo s so o v vo na u bez k ku pre za od po pri",
    // questions, answers, courtesy
    "kto čo kde kam kedy ako koľko prečo áno nie prosím ďakujem ahoj dovidenia dobrý deň tu tam",
    // ten, tento, tamten in every form
    "ten tá to tí tie toho tomu tom tým tou tú tej tých tými",
    "tento táto toto títo tieto tohto tomuto tomto týmto touto túto tejto týchto týmito",
    "tamten tamtá tamto tamtí tamtie tamtoho tamtomu tamtom tamtým tamtou tamtú tamtej tamtých tamtými",
    // possessives in every form
    "môj moja moje moji môjho môjmu mojom mojím mojou moju mojej mojich mojim mojimi",
    "tvoj tvoja tvoje tvoji tvojho tvojmu tvojom tvojím tvojou tvoju tvojej tvojich tvojim tvojimi",
    "svoj svoja svoje svoji svojho svojmu svojom svojím svojou svoju svojej svojich svojim svojimi",
    "náš naša naše naši nášho nášmu našom naším našou našu našej našich našim našimi",
    "váš vaša vaše vaši vášho vášmu vašom vaším vašou vašu vašej vašich vašim vašimi",
    "jeho čí čia čie",
    // names in the lesson cast
    "anna tom marek eva peter alex mária lucia",
  ]
    .join(" ")
    .split(" "),
);

export function contentWords(text: string): string[] {
  return text
    .toLocaleLowerCase("sk")
    .split(/[^\p{L}]+/u)
    .filter((word) => word.length > 0 && !CORE_WORDS.has(word));
}

/**
 * Two forms of one word: they share a stem of at least three letters that leaves at
 * most three letters of the shorter form (taška/tašku, chlapci/chlapcovi). A form
 * under three letters only matches one letter longer (dá/dám), so "ku" never covers
 * "kufor". Stem changes such as deti/deťom need the noun's own forms; see
 * `withNounForms`.
 */
export function sameWord(first: string, second: string): boolean {
  if (first === second) return true;
  let shared = 0;
  while (shared < first.length && first[shared] === second[shared]) shared += 1;
  const shorter = Math.min(first.length, second.length);
  const longer = Math.max(first.length, second.length);
  if (shorter < 3) return shared === shorter && longer - shorter === 1;
  return shared >= Math.max(3, shorter - 3);
}

function knows(known: readonly string[], word: string): boolean {
  return known.some((candidate) => sameWord(candidate, word));
}

/** Every Slovak line a learner has to read or produce in a task. */
export function taskSlovak(task: LessonExercise | PracticeTask): string[] {
  if (task.type === "personal") return [];

  const lines = [task.feedback.correction ?? ""];
  // A repair line is wrong on purpose (tyto for tieto); its other words are in the answer.
  const repair = task.type === "typed" && task.task === "repair";
  if (!repair) for (const turn of task.context ?? []) lines.push(turn.slovak);
  if (task.type === "choice" || task.type === "selectAll") {
    lines.push(...task.choices.map((choice) => choice.label ?? ""));
  }
  if (task.type === "build") lines.push(...task.tiles);
  if (task.type === "typed") lines.push(task.answer, ...(task.acceptedAnswers ?? []));
  if (task.type === "cloze") lines.push(task.frame.replace("{}", task.answer));
  return lines;
}

/** Slovak a clock grid or form table puts on screen. */
function visualSlovak(visual: LessonVisual): string[] {
  if (visual.type === "clock-grid") return visual.items.map((item) => item.slovak);
  return visual.sections.flatMap((section) => section.rows.flatMap((row) => row.cells));
}

export interface UnintroducedWord {
  beatId: string;
  exerciseId: string;
  word: string;
}

/** Words the lesson's exercises use before any scene line or key term has shown them. */
export function unintroducedLessonWords(lesson: Lesson): UnintroducedWord[] {
  const sceneById = new Map(lesson.scene.map((line) => [line.id, line.slovak]));
  const known: string[] = [];
  const missing: UnintroducedWord[] = [];

  for (const beat of lesson.beats) {
    for (const lineId of beat.teach.sceneLineIds ?? []) {
      known.push(...contentWords(sceneById.get(lineId) ?? ""));
    }
    for (const phrase of beat.teach.phrases ?? []) {
      known.push(...contentWords(phrase.slovak));
    }
    for (const visual of [beat.teach.visual ?? []].flat()) {
      known.push(...visualSlovak(visual).flatMap(contentWords));
    }

    for (const exercise of beat.exercises) {
      const seen = new Set<string>();
      for (const word of taskSlovak(exercise).flatMap(contentWords)) {
        if (seen.has(word) || knows(known, word)) continue;
        seen.add(word);
        missing.push({ beatId: beat.id, exerciseId: exercise.id, word });
      }
    }
  }

  return missing;
}

/** Every word the whole lesson shows: its scene and its key terms. */
export function lessonWords(lesson: Lesson): string[] {
  return [
    ...lesson.scene.flatMap((line) => contentWords(line.slovak)),
    ...lesson.keyPhrases.flatMap((phrase) => contentWords(phrase.slovak)),
  ];
}

/**
 * Adds every case form of a noun the lesson shows in any form, so practice can decline
 * it (deti → deťom, ženy → žien) without each form being in the scene.
 */
export function withNounForms(
  known: readonly string[],
  nouns: ReadonlyArray<{ forms: Record<string, string> }>,
): string[] {
  const extra = nouns
    .map((entry) =>
      Object.values(entry.forms).map((form) => form.toLocaleLowerCase("sk")),
    )
    .filter((forms) => forms.some((form) => knows(known, form)))
    .flat();
  return [...known, ...extra];
}

/** Words in a practice task that the lesson behind it never shows. */
export function unintroducedTaskWords(
  task: PracticeTask,
  known: readonly string[],
): string[] {
  return [...new Set(taskSlovak(task).flatMap(contentWords))].filter(
    (word) => !knows(known, word),
  );
}
