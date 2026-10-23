import { playAnswerSfx } from "$lib/audio/sfx";
import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
import { shuffledTiles } from "./caption";
import {
  findAsks,
  findEnglish,
  findWhy,
  hereIs,
  thatIs,
  type FindAsk,
} from "./scene-find";
import type { StageControl } from "./stage-control";
import type { SceneThing } from "./thing-words";

/** Found on the first tap, found after a miss, or shown. */
export type FindResult = "first" | "later" | "shown";

export interface FindNote {
  english: string;
  tone: "right" | "wrong" | "shown";
  text: string;
  why?: string;
}

export interface FindRoundOptions {
  things: () => readonly SceneThing[];
  stage: () => StageControl | undefined;
  /** Who asks for each thing and answers each tap. */
  asker: () => LessonCharacterId | undefined;
  /** Every thing in the round has been found or shown. */
  onEnd: () => void;
}

/** Long enough to read why the found word looks the way it does. */
const FOUND_PAUSE_MS = 1800;

/**
 * Find it: someone on stage asks for each thing in turn, in Slovak, and
 * the learner taps it. A wrong tap is named, a right one is explained,
 * and Show me points it out.
 */
export class FindRound {
  /** The round's things, by id, in the order it asks for them. */
  queue = $state<string[]>([]);
  at = $state(0);
  results = $state<Record<string, FindResult>>({});
  /** Things found on the first tap in a row. */
  streak = $state(0);
  note = $state<FindNote>();

  #missed = false;
  #round = 0;
  #timer = 0;
  readonly #options: FindRoundOptions;

  constructor(options: FindRoundOptions) {
    this.#options = options;
  }

  /** What the round asks for now, if it is still going. */
  get target(): SceneThing | undefined {
    return this.#options.things().find((thing) => thing.id === this.queue[this.at]);
  }

  /** How the round asks for the thing it is on. */
  get ask(): FindAsk | undefined {
    return findAsks(this.inOrder(this.#options.things()))[this.at];
  }

  get found(): string[] {
    return Object.keys(this.results).filter((id) => this.results[id] !== "shown");
  }

  get firstTaps(): number {
    return Object.values(this.results).filter((result) => result === "first").length;
  }

  /** `things` in the order the round asks for them. */
  inOrder(things: readonly SceneThing[]): SceneThing[] {
    return this.queue.flatMap((id) => things.filter((thing) => thing.id === id));
  }

  /** A round over the things with `ids`, shuffled by `seed`; `again` asks in a new order. */
  start(ids: readonly string[], seed: string, again = false): void {
    this.stop();
    this.#round = again ? this.#round + 1 : 0;
    this.queue = shuffledTiles(ids, `${seed}-${this.#round}`);
    this.at = 0;
    this.results = {};
    this.#missed = false;
    this.streak = 0;
    this.note = undefined;
    this.#gesture("ask");
  }

  stop(): void {
    window.clearTimeout(this.#timer);
  }

  tap(id: string): void {
    const target = this.target;
    if (!target || (this.note && this.note.tone !== "wrong")) return;

    if (id !== target.id) {
      const tapped = this.#options.things().find((thing) => thing.id === id);
      this.#missed = true;
      this.streak = 0;
      playAnswerSfx("incorrect");
      this.note = {
        english: tapped ? findEnglish(tapped, "wrong") : "",
        tone: "wrong",
        text: tapped ? thatIs(tapped) : "",
      };
      this.#options.stage()?.light(id);
      this.#gesture("shake");
      return;
    }

    playAnswerSfx("correct");
    this.results = { ...this.results, [id]: this.#missed ? "later" : "first" };
    if (!this.#missed) this.streak += 1;
    this.note = {
      english: findEnglish(target, "right"),
      tone: "right",
      text: "Áno!",
      why: this.ask && findWhy(target, this.ask),
    };
    this.#gesture("nod");
    this.#next();
  }

  /** Show me: point the thing out, and count it as shown. */
  show(): void {
    const target = this.target;
    if (!target || (this.note && this.note.tone !== "wrong")) return;

    this.results = { ...this.results, [target.id]: "shown" };
    this.streak = 0;
    this.note = {
      english: findEnglish(target, "shown"),
      tone: "shown",
      text: hereIs(target),
      why: this.ask && findWhy(target, this.ask),
    };
    this.#options.stage()?.light(target.id);
    this.#next();
  }

  /** On to the next thing once the learner has read why this one looks as it does. */
  #next(): void {
    this.#timer = window.setTimeout(() => {
      this.note = undefined;
      this.#missed = false;
      this.at += 1;
      if (this.at < this.queue.length) {
        this.#gesture("ask");
        return;
      }
      this.#options.onEnd();
    }, FOUND_PAUSE_MS);
  }

  #gesture(gesture: "ask" | "nod" | "shake"): void {
    const who = this.#options.asker();
    if (who) this.#options.stage()?.gesture(who, gesture);
  }
}
