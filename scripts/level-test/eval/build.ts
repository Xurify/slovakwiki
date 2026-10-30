import { listeningSets } from "../../../src/lib/catalog/level-test/listening";
import {
  interactiveWritingPrompts,
  readThenSpeakPrompts,
  speakingSamplePrompts,
  writingSamplePrompts,
} from "../../../src/lib/catalog/level-test/prompts";
import {
  MAX_PROMPT_CHARS,
  MAX_RESPONSE_CHARS,
  type ScoreRequest,
} from "../../../src/lib/level-test/server/score";
import type { ProductionKind } from "../../../src/lib/level-test/types";
import { asTranscript, hasCzech, stripDiacritics } from "./text";
import type {
  AdversarialInput,
  EvalBase,
  EvalCase,
  Expectation,
  Mutation,
  PhotoRef,
  PlacedMutation,
} from "./types";

// Same wording as WritingTask.svelte and SpeakingTask.svelte send.
export const WRITE_PHOTO_PROMPT = "Napíšte aspoň jednu vetu o tom, čo vidíte na fotke.";
export const SPEAK_PHOTO_PROMPT =
  "Povedzte, čo vidíte na fotke. Opíšte čo najviac detailov.";

/** The scorer lists at most four issues, so recall is counted against this. */
export const MAX_LISTED_ISSUES = 4;

const SPOKEN: ReadonlySet<ProductionKind> = new Set([
  "speakPhoto",
  "readThenSpeak",
  "speakingSample",
]);

export function isSpoken(kind: ProductionKind): boolean {
  return SPOKEN.has(kind);
}

interface TaskSource {
  id: string;
  kind: ProductionKind;
  promptId?: string;
  photo?: string;
  listening?: string;
}

interface Task {
  prompt: string;
  /** Interactive Writing sends both questions inside the answer, as the test does. */
  questions?: [string, string];
  contentKey?: string[];
  imageUrl?: string;
  /** What the learner read before answering: the prompt, or a listening scenario. */
  shown: string;
}

function photoUrl(slug: string, photos: ReadonlyMap<string, PhotoRef>, owner: string) {
  const photo = photos.get(slug);
  if (!photo) throw new Error(`${owner}: no photo "${slug}"`);
  return photo.src;
}

function taskFor(source: TaskSource, photos: ReadonlyMap<string, PhotoRef>): Task {
  const { id, kind, promptId } = source;
  switch (kind) {
    case "writePhoto":
    case "speakPhoto": {
      if (!source.photo) throw new Error(`${id}: photo task without a photo`);
      const prompt = kind === "writePhoto" ? WRITE_PHOTO_PROMPT : SPEAK_PHOTO_PROMPT;
      return { prompt, shown: prompt, imageUrl: photoUrl(source.photo, photos, id) };
    }
    case "summarizeConversation": {
      const set = listeningSets.find((entry) => entry.id === source.listening);
      if (!set) throw new Error(`${id}: no listening set "${source.listening}"`);
      return {
        prompt: `Summarize the conversation. Scenario: ${set.scenario.text}`,
        shown: set.scenario.text,
        contentKey: set.summaryKey,
      };
    }
    case "interactiveWriting": {
      const prompt = interactiveWritingPrompts.find((entry) => entry.id === promptId);
      if (!prompt?.followUp)
        throw new Error(`${id}: no interactive prompt "${promptId}"`);
      return {
        prompt: `${prompt.slovak} / ${prompt.followUp.slovak}`,
        shown: prompt.slovak,
        questions: [prompt.slovak, prompt.followUp.slovak],
      };
    }
    case "writingSample":
    case "readThenSpeak":
    case "speakingSample": {
      const pool =
        kind === "writingSample"
          ? writingSamplePrompts
          : kind === "readThenSpeak"
            ? readThenSpeakPrompts
            : speakingSamplePrompts;
      const prompt = pool.find((entry) => entry.id === promptId);
      if (!prompt) throw new Error(`${id}: no ${kind} prompt "${promptId}"`);
      return { prompt: prompt.slovak, shown: prompt.slovak };
    }
  }
}

/** The answer as the test sends it; Interactive Writing repeats each question above its answer. */
function assemble(task: Task, first: string, second = ""): string {
  if (!task.questions) return first;
  const [question, followUp] = task.questions;
  return `${question}\n${first.trim()}\n\n${followUp}\n${second.trim()}`;
}

/** Puts every mutation into `text` at once and records where each `to` ends up. */
export function placeMutations(
  text: string,
  mutations: readonly Mutation[],
  owner = "mutation",
): { text: string; placed: PlacedMutation[] } {
  const located = mutations.map((mutation) => {
    const first = text.indexOf(mutation.from);
    if (first < 0) throw new Error(`${owner}: "${mutation.from}" is not in the answer`);
    if (text.indexOf(mutation.from, first + 1) >= 0) {
      throw new Error(`${owner}: "${mutation.from}" occurs more than once`);
    }
    if (mutation.from === mutation.to)
      throw new Error(`${owner}: "${mutation.from}" is unchanged`);
    return { mutation, at: first };
  });

  located.sort((a, b) => a.at - b.at);
  for (let index = 1; index < located.length; index++) {
    const previous = located[index - 1]!;
    if (previous.at + previous.mutation.from.length > located[index]!.at) {
      throw new Error(
        `${owner}: "${previous.mutation.from}" overlaps "${located[index]!.mutation.from}"`,
      );
    }
  }

  let output = "";
  let cursor = 0;
  const placed: PlacedMutation[] = [];
  for (const { mutation, at } of located) {
    output += text.slice(cursor, at);
    placed.push({
      ...mutation,
      start: output.length,
      end: output.length + mutation.to.length,
    });
    output += mutation.to;
    cursor = at + mutation.from.length;
  }
  output += text.slice(cursor);
  return { text: output, placed };
}

/** Error counts for each base: one, three and all, without repeats. */
export function errorCounts(total: number): number[] {
  return [...new Set([1, 3, total])].filter((count) => count >= 1 && count <= total);
}

function checkBase(base: EvalBase, task: Task, clean: string): void {
  const owner = base.id;
  if (hasCzech(base.response) || (base.followUp && hasCzech(base.followUp))) {
    throw new Error(`${owner}: the clean answer contains a Czech form`);
  }
  if (base.mutations.length === 0) throw new Error(`${owner}: no mutations`);
  if (base.followUp && base.kind !== "interactiveWriting") {
    throw new Error(`${owner}: only Interactive Writing has a follow-up answer`);
  }
  if (isSpoken(base.kind) !== (base.seconds !== undefined)) {
    throw new Error(`${owner}: spoken answers, and only they, need seconds`);
  }
  for (const mutation of base.mutations) {
    if (mutation.topic !== "accents") continue;
    if (isSpoken(base.kind))
      throw new Error(`${owner}: accents are not scored in speech`);
    if (stripDiacritics(mutation.from) !== stripDiacritics(mutation.to)) {
      throw new Error(`${owner}: accent error "${mutation.to}" changes more than marks`);
    }
  }
  if (task.prompt.length > MAX_PROMPT_CHARS) throw new Error(`${owner}: prompt too long`);
  if (clean.length > MAX_RESPONSE_CHARS) throw new Error(`${owner}: answer too long`);
  if (base.wrongPhoto && base.wrongPhoto === base.photo) {
    throw new Error(`${owner}: the wrong photo is the answer's own photo`);
  }
}

function request(
  base: { kind: ProductionKind; seconds?: number },
  task: Task,
  response: string,
  imageUrl = task.imageUrl,
): ScoreRequest {
  return {
    kind: base.kind,
    prompt: task.prompt,
    response,
    ...(base.seconds !== undefined ? { durationSeconds: base.seconds } : {}),
    ...(task.contentKey ? { contentKey: task.contentKey } : {}),
    ...(imageUrl ? { imageUrl } : {}),
  };
}

/** Every case the eval sends: clean answers, the same answers with errors, and the rule cases. */
export function buildCases(
  bases: readonly EvalBase[],
  adversarial: readonly AdversarialInput[],
  photos: ReadonlyMap<string, PhotoRef>,
): EvalCase[] {
  const cases: EvalCase[] = [];
  const ids = new Set<string>();
  const add = (entry: EvalCase) => {
    if (ids.has(entry.id)) throw new Error(`Duplicate case id ${entry.id}`);
    ids.add(entry.id);
    cases.push(entry);
  };

  bases.forEach((base, index) => {
    const task = taskFor(base, photos);
    const clean = assemble(task, base.response, base.followUp);
    checkBase(base, task, clean);
    const shared = {
      group: base.id,
      split: index % 3 === 0 ? ("dev" as const) : ("test" as const),
      source: base.source,
      targetLevel: base.targetLevel,
    };
    const cleanExpect: Expectation = {
      noIssues: true,
      ...(base.targetLevel === "C1" ? { minScore: 60 } : {}),
    };

    add({
      ...shared,
      id: `${base.id}/clean`,
      variant: "clean",
      request: request(base, task, clean),
      errors: [],
      expect: cleanExpect,
    });

    placeMutations(clean, base.mutations, base.id);
    for (const count of errorCounts(base.mutations.length)) {
      const { text, placed } = placeMutations(
        clean,
        base.mutations.slice(0, count),
        base.id,
      );
      add({
        ...shared,
        id: `${base.id}/errors-${count}`,
        variant: "errors",
        request: request(base, task, text),
        errors: placed,
        expect: {},
      });
    }

    if (isSpoken(base.kind)) {
      add({
        ...shared,
        id: `${base.id}/asr`,
        variant: "asr",
        request: request(base, task, asTranscript(clean)),
        errors: [],
        expect: { noIssues: true },
      });
    }

    if (base.wrongPhoto) {
      add({
        ...shared,
        id: `${base.id}/wrong-photo`,
        variant: "wrongPhoto",
        request: request(base, task, clean, photoUrl(base.wrongPhoto, photos, base.id)),
        errors: [],
        expect: { maxContent: 20 },
      });
    }
  });

  adversarial.forEach((input, index) => {
    const task = taskFor(input, photos);
    const answer = input.response ?? task.shown;
    add({
      id: input.id,
      group: input.id,
      variant: "adversarial",
      split: index % 3 === 0 ? "dev" : "test",
      source: "claude",
      request: request(input, task, assemble(task, answer)),
      errors: [],
      expect: input.expect,
    });
  });

  return cases;
}
