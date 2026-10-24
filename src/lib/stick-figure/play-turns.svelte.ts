/**
 * Pick Alex's line from the choices, build it from its words, or say it;
 * adaptive moves between them as the learner gets lines right or not.
 */
export type TurnKind = "pick" | "build" | "say" | "adaptive";

/** How one turn is answered. */
export type TurnStep = Exclude<TurnKind, "adaptive">;

export const TURN_KINDS: ReadonlyArray<{ id: TurnKind; label: string; task: string }> = [
  { id: "pick", label: "Pick the line", task: "pick what to say" },
  { id: "build", label: "Build it", task: "build the line from its words" },
  { id: "say", label: "Say it", task: "say the line out loud" },
  {
    id: "adaptive",
    label: "Harder as you go",
    task: "answer: picking first, then building the line and saying it as you get lines right, and back a step after a slip",
  },
];

/** Two right the first time in a row moves adaptive on a step. */
const STEP_UP_AFTER = 2;

/** The learner's turns in Play as: how they answer, what they picked, how each went. */
export class PlayTurns {
  kind = $state<TurnKind>("pick");
  /** The browser can record from a microphone, so Say it is offered. */
  recordable = $state(false);
  /** Each talk node's reply picked so far, by index; the rest follow the first that fits. */
  picks = $state<Record<string, number>>({});
  /** The learner's lines answered so far, and whether each was right the first time. */
  firstTries = $state<Record<number, boolean>>({});

  /** Adaptive's step: picking, building, saying. */
  #step = $state(0);
  /** Lines right the first time in a row since adaptive last moved. */
  #run = 0;

  get kinds(): ReadonlyArray<{ id: TurnKind; label: string; task: string }> {
    return TURN_KINDS.filter(({ id }) => id !== "say" || this.recordable);
  }

  /** How this turn is answered: the kind picked, or adaptive's step. */
  get now(): TurnStep {
    if (this.kind !== "adaptive") return this.kind;
    const steps: TurnStep[] = this.recordable
      ? ["pick", "build", "say"]
      : ["pick", "build"];
    return steps[Math.min(this.#step, steps.length - 1)];
  }

  get task(): string | undefined {
    return TURN_KINDS.find(({ id }) => id === this.kind)?.task;
  }

  get firstTryCount(): number {
    return Object.values(this.firstTries).filter(Boolean).length;
  }

  /** Line `index` is answered; a line the learner only listened to does not move adaptive. */
  answered(index: number, firstTry: boolean, heard = false): void {
    if (!heard) this.#stepAdaptive(firstTry);
    this.firstTries = { ...this.firstTries, [index]: firstTry };
  }

  /** In a talk, the reply the learner means at node `nodeId`. */
  choose(nodeId: string, index: number): void {
    this.picks = { ...this.picks, [nodeId]: index };
  }

  /** A new run of the scene: nothing picked or answered yet. Adaptive keeps its step. */
  reset(): void {
    this.picks = {};
    this.firstTries = {};
  }

  #stepAdaptive(firstTry: boolean): void {
    if (this.kind !== "adaptive") return;
    if (!firstTry) {
      this.#run = 0;
      this.#step = Math.max(0, this.#step - 1);
      return;
    }
    this.#run += 1;
    if (this.#run < STEP_UP_AFTER) return;
    this.#run = 0;
    this.#step = Math.min(this.#step + 1, this.recordable ? 2 : 1);
  }
}
