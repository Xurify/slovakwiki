<script lang="ts" module>
  import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
  import type { TextMark } from "$lib/learning/marked-text";
  import type { DialogueSayChoices } from "$lib/learning/types";
  import type { LessonSceneArtId } from "$lib/lesson-story/story-settings";
  import type { StickGestureId } from "$lib/stick-figure/gestures";
  import type { StickPropId } from "$lib/stick-figure/props";

  export interface PlayerLine {
    characterId: LessonCharacterId;
    english: string;
    gestures?: StickGestureId[];
    id: string;
    /** Alex's line, which the learner can take. */
    learner: boolean;
    marks?: TextMark[];
    /** Loudness track of the clip, encoded. */
    mouth?: string;
    /** False for a line nobody on stage says: the narrator. */
    onStage: boolean;
    props?: Array<StickPropId | null>;
    sayChoices?: DialogueSayChoices;
    slovak: string;
    /** The name shown over the line: Alex, not You. */
    speaker: string;
    src?: string;
    to?: LessonCharacterId;
    vowels?: string;
  }

  export interface PlayerScene {
    id: string;
    lessonHref: string;
    lines: PlayerLine[];
    /** The line it is named after. */
    name: string;
    setting: LessonSceneArtId;
  }
</script>

<script lang="ts">
  import { onMount } from "svelte";

  import AudioButton from "$lib/audio/AudioButton.svelte";
  import { playAnswerSfx } from "$lib/audio/sfx";
  import { listedCharacters } from "$lib/catalog/lessons/character-ids";
  import MarkedText from "$lib/components/learning/MarkedText.svelte";
  import { splitEmphasis } from "$lib/components/practice/practice-feedback-ui";
  import Button from "$lib/components/ui/Button.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";
  import { chipClass, eyebrowMutedClass, panelClass } from "$lib/components/ui/system-ui";
  import {
    STORY_PREFS_CHANGE_EVENT,
    getStoryShowEnglish,
    setStoryShowEnglish,
  } from "$lib/lesson-story/prefs";
  import { shuffledTiles } from "$lib/stick-figure/caption";
  import { directScene, type DirectedLine } from "$lib/stick-figure/scene-direction";
  import { sceneMood } from "$lib/stick-figure/scene-mood";
  import {
    GREETINGS,
    GREET_ROUNDS,
    TIME_WORDS,
    greetWhy,
    isGreetRight,
    type Greeting,
    type GreetRound,
  } from "$lib/stick-figure/scene-greet";
  import { playStoryLineAudio } from "$lib/lesson-story/story-audio";
  import { ChoiceOptions } from "$lib/learning/exercises";
  import {
    FIND_LEVELS,
    accusativeOf,
    findPrompt,
    findWhy,
    hereIs,
    thatIs,
    type FindLevel,
  } from "$lib/stick-figure/scene-find";
  import {
    thingWithDemonstrative,
    type SceneThing,
  } from "$lib/stick-figure/scene-things";
  import { cx } from "$lib/ui/classes";
  import SceneCaption from "./SceneCaption.svelte";
  import SceneTurn from "./SceneTurn.svelte";
  import StickStage from "./StickStage.svelte";

  type Mode = "watch" | "play" | "find" | "greet";
  /** Pick Alex's line from the lesson's choices, or build it from its words. */
  type Turn = "pick" | "build";
  type Phase = "ready" | "playing" | "paused" | "turn" | "done";

  let {
    scenes,
    greetingClips = {},
    thingWords = {},
  }: {
    /** The dictionary clip for each greeting, where there is one. */
    greetingClips?: Partial<Record<Greeting, string>>;
    scenes: PlayerScene[];
    /** Dictionary link and clip for a scene thing's word, keyed by the word. */
    thingWords?: Record<string, { href?: string; src?: string }>;
  } = $props();

  const MODES: Array<{ id: Mode; label: string }> = [
    { id: "watch", label: "Watch" },
    { id: "play", label: "Play Alex" },
    { id: "find", label: "Find it" },
    { id: "greet", label: "Greet" },
  ];

  /** Mária on the square: someone Alex says Dobrý deň to, not Ahoj. */
  const GREET_LINES: DirectedLine[] = [
    { characterId: "maria", slovak: "Dobrý deň." },
    { characterId: "alex", slovak: "Dobrý deň." },
  ];
  const GREET_DIRECTION = directScene(GREET_LINES, "plaza");
  /** Long enough to hear the greeting and see it answered. */
  const GREETED_PAUSE_MS = 2200;

  const TURNS: Array<{ id: Turn; label: string }> = [
    { id: "pick", label: "Pick the line" },
    { id: "build", label: "Build it" },
  ];

  const PLACES: Record<LessonSceneArtId, string> = {
    cafe: "At the café",
    classroom: "In class",
    counter: "At the front desk",
    default: "In the park by the Danube",
    home: "At home",
    market: "At the market",
    plaza: "On the old town square",
    registration: "At the front desk",
  };

  /** Between one line and the next, as in the lesson story. */
  const LINE_GAP_MS = 450;
  /** Long enough to read why the found word looks the way it does. */
  const FOUND_PAUSE_MS = 1800;

  const characters = listedCharacters();

  let sceneId = $state("");
  let mode = $state<Mode>("watch");
  let turnKind = $state<Turn>("pick");
  let phase = $state<Phase>("ready");
  /** The line the scene is on: playing, waiting for Alex, or next after a pause. */
  let at = $state(0);
  /** The line in the caption: the one playing, or the last one played. */
  let shown = $state(-1);
  let speaking = $state(false);
  let captionCue = $state(0);
  let showEnglish = $state(false);
  let slower = $state(false);
  /** Hear each line before reading it. */
  let listenFirst = $state(false);
  /** Alex's lines answered so far, and whether each was right the first time. */
  let firstTries = $state<Record<number, boolean>>({});
  let stage = $state<ReturnType<typeof StickStage>>();

  let level = $state<FindLevel>("find");
  let queue = $state<string[]>([]);
  let findAt = $state(0);
  /** How each thing went: found on the first tap, found after a miss, or shown. */
  let results = $state<Record<string, "first" | "later" | "shown">>({});
  let missedTarget = $state(false);
  /** Things found on the first tap in a row. */
  let streak = $state(0);
  let findNote = $state<{
    tone: "right" | "wrong" | "shown";
    text: string;
    why?: string;
  }>();

  let greetQueue = $state<GreetRound[]>([]);
  let greetAt = $state(0);
  let greetPicked = $state<Greeting | null>(null);
  let greetMissed = $state(false);
  /** Each round: right the first time or not. */
  let greetResults = $state<Record<string, boolean>>({});
  let greetNote = $state<{ right: boolean; text: string }>();

  let timer = 0;
  let findTimer = 0;
  let greetTimer = 0;

  const scene = $derived(scenes.find((option) => option.id === sceneId) ?? scenes[0]);
  const lines = $derived<DirectedLine[]>(
    scene.lines.map((line) => ({
      characterId: line.onStage ? line.characterId : null,
      gestures: line.gestures,
      mouth: line.mouth,
      props: line.props,
      slovak: line.slovak,
      src: line.src,
      to: line.to,
      vowels: line.vowels,
    })),
  );
  const direction = $derived(directScene(lines, scene.setting));
  const greetRound = $derived(greetQueue[greetAt]);
  const mood = $derived(
    mode === "greet"
      ? { time: greetRound?.time ?? "day", weather: "clear" as const }
      : sceneMood(scene.lines.map((line) => line.slovak)),
  );
  const caption = $derived(shown >= 0 ? scene.lines[shown] : undefined);
  const turn = $derived(phase === "turn" ? scene.lines[at] : undefined);
  const learnerCount = $derived(scene.lines.filter((line) => line.learner).length);
  const firstTryCount = $derived(Object.values(firstTries).filter(Boolean).length);
  /** The things the dialogue names, in the order it names them. */
  const sceneWords = $derived(
    [
      ...new Set(
        direction.plans.flatMap((plan) =>
          plan.beats.flatMap(({ point }) =>
            point?.target.kind === "thing" ? [point.target.id] : [],
          ),
        ),
      ),
    ].flatMap((id) => direction.things.filter((thing) => thing.id === id)),
  );
  const findTarget = $derived(
    direction.things.find((thing) => thing.id === queue[findAt]),
  );
  const found = $derived(Object.keys(results).filter((id) => results[id] !== "shown"));
  const firstTaps = $derived(
    Object.values(results).filter((result) => result === "first").length,
  );
  const castNames = $derived(
    direction.cast.map((id) => {
      const character = characters.find((candidate) => candidate.id === id);
      const name = character?.displayName ?? id;
      return character?.kind === "recurring" ? name : `the ${name.toLowerCase()}`;
    }),
  );

  onMount(() => {
    showEnglish = getStoryShowEnglish() === "on";
    const sync = () => {
      showEnglish = getStoryShowEnglish() === "on";
    };
    window.addEventListener(STORY_PREFS_CHANGE_EVENT, sync);
    return () => window.removeEventListener(STORY_PREFS_CHANGE_EVENT, sync);
  });

  function listOf(names: readonly string[]): string {
    if (names.length < 2) return names.join("");
    return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
  }

  function halt(): void {
    window.clearTimeout(timer);
    window.clearTimeout(findTimer);
    window.clearTimeout(greetTimer);
    stage?.stop();
    speaking = false;
  }

  function reset(): void {
    halt();
    phase = "ready";
    at = 0;
    shown = -1;
    firstTries = {};
    findNote = undefined;
  }

  function selectScene(id: string): void {
    const same = id === scene.id;
    reset();
    sceneId = id;
    // Greeting Mária is the same on any scene, so picking one means watching it.
    if (mode === "greet") mode = "watch";
    if (same) stage?.place(0);
    if (mode === "find") startFind();
  }

  function selectMode(next: Mode): void {
    reset();
    stage?.place(0);
    mode = next;
    if (next === "find") startFind();
    if (next === "greet") startGreet();
  }

  function startGreet(): void {
    window.clearTimeout(greetTimer);
    greetQueue = shuffledTiles([...GREET_ROUNDS], "greet");
    greetAt = 0;
    greetPicked = null;
    greetMissed = false;
    greetResults = {};
    greetNote = undefined;
  }

  function greet(picked: Greeting | null): void {
    const round = greetRound;
    if (!picked || !round || greetNote?.right) return;

    greetPicked = picked;
    stage?.say("alex", picked);

    if (!isGreetRight(round, picked)) {
      playAnswerSfx("incorrect");
      greetMissed = true;
      greetNote = { right: false, text: greetWhy(round, picked) };
      stage?.gesture("maria", "think");
      return;
    }

    playAnswerSfx("correct");
    const clip = greetingClips[picked];
    if (clip) playStoryLineAudio(clip, picked);
    greetResults = { ...greetResults, [round.id]: !greetMissed };
    greetNote = {
      right: true,
      text: picked === round.answers[0] ? "Áno!" : `Áno! ${round.note ?? ""}`,
    };
    stage?.gesture("alex", "wave");
    greetTimer = window.setTimeout(() => {
      stage?.gesture("maria", "wave");
      greetTimer = window.setTimeout(() => {
        greetAt += 1;
        greetPicked = null;
        greetMissed = false;
        greetNote = undefined;
      }, GREETED_PAUSE_MS);
    }, 500);
  }

  /** Play line `index` with its caption; `onDone` runs when its clip ends. */
  function say(index: number, onDone?: () => void): void {
    shown = index;
    speaking = true;
    captionCue += 1;
    stage?.play(
      index,
      () => {
        speaking = false;
        onDone?.();
      },
      slower ? 0.75 : 1,
    );
  }

  function step(index: number): void {
    const line = scene.lines[index];

    if (!line) {
      phase = "done";
      if (mode === "play") cheer();
      return;
    }

    at = index;
    const walking = stage?.walking(lines[index].characterId) ?? 0;
    if (walking > 0) {
      timer = window.setTimeout(() => step(index), walking);
      return;
    }

    if (mode === "play" && line.learner && !(index in firstTries)) {
      phase = "turn";
      return;
    }

    say(index, () => advance(index));
  }

  /**
   * After a line: on to the next, or, when the learner listens first, wait
   * on its words until they ask for the next line.
   */
  function advance(index: number): void {
    if (listenFirst && scene.lines[index + 1]) {
      at = index + 1;
      phase = "paused";
      return;
    }
    timer = window.setTimeout(() => step(index + 1), LINE_GAP_MS);
  }

  function playScene(): void {
    if (phase === "done") {
      reset();
      stage?.place(0);
    }
    halt();
    phase = "playing";
    step(at);
  }

  /** From watching straight into taking Alex's part, from the top. */
  function playAlex(): void {
    selectMode("play");
    playScene();
  }

  function pause(): void {
    halt();
    phase = "paused";
  }

  /** Start the scene from line `index`, everyone where that line finds them. */
  function startAt(index: number): void {
    halt();
    stage?.place(index);
    phase = "playing";
    step(index);
  }

  /** The line in the caption once more; the scene then waits on the one after it. */
  function again(): void {
    if (shown < 0) return;

    const line = shown;
    halt();
    stage?.place(line);
    phase = "paused";
    say(line, () => {
      at = line + 1;
    });
  }

  function answered(firstTry: boolean, heard = false): void {
    if (!heard) playAnswerSfx("correct");
    firstTries = { ...firstTries, [at]: firstTry };
    phase = "playing";
    const index = at;
    say(index, () => advance(index));
  }

  function missed(said: string): void {
    const line = scene.lines[at];
    if (!line) return;

    playAnswerSfx("incorrect");
    stage?.say(line.characterId, said);
    const listener = direction.stagings[at]?.addressee;
    if (listener) stage?.gesture(listener, "think");
  }

  function hearIt(): void {
    answered(false, true);
  }

  function toggleEnglish(): void {
    // Saving the setting fires the change event, whose listener already sets
    // showEnglish; flipping it again here would undo that.
    const next = !showEnglish;
    setStoryShowEnglish(next ? "on" : "off");
    showEnglish = next;
  }

  /** Whoever stands first on stage asks for each thing and answers each tap. */
  function asker(): LessonCharacterId | undefined {
    const entering = new Set(
      direction.stagings.flatMap(({ enter }) => (enter ? [enter.characterId] : [])),
    );
    return direction.cast.find((id) => !entering.has(id));
  }

  function startFind(next: FindLevel = level): void {
    window.clearTimeout(findTimer);
    level = next;
    queue = shuffledTiles(
      direction.things.map((thing) => thing.id),
      `${scene.id}-${next}`,
    );
    findAt = 0;
    results = {};
    missedTarget = false;
    streak = 0;
    findNote = undefined;
    const who = asker();
    if (who) stage?.gesture(who, "ask");
  }

  /** On to the next thing once the learner has read why this one looks as it does. */
  function nextThing(): void {
    const who = asker();
    findTimer = window.setTimeout(() => {
      findNote = undefined;
      missedTarget = false;
      findAt += 1;
      if (findAt < queue.length) {
        if (who) stage?.gesture(who, "ask");
        return;
      }
      cheer();
    }, FOUND_PAUSE_MS);
  }

  /** Everyone on stage at the end of a round: arms up for a clean one, a wave otherwise. */
  function cheer(): void {
    const clean =
      mode === "find"
        ? firstTaps === queue.length
        : learnerCount > 0 && firstTryCount === learnerCount;
    const entering = new Set(
      direction.stagings.flatMap(({ enter }) => (enter ? [enter.characterId] : [])),
    );
    for (const id of direction.cast) {
      if (mode === "find" && entering.has(id)) continue;
      stage?.gesture(id, clean ? "cheer" : "wave");
    }
  }

  function tapThing(id: string): void {
    const target = findTarget;
    if (!target || (findNote && findNote.tone !== "wrong")) return;

    const tapped = direction.things.find((thing) => thing.id === id);
    const who = asker();

    if (id !== target.id) {
      missedTarget = true;
      streak = 0;
      playAnswerSfx("incorrect");
      findNote = { tone: "wrong", text: tapped ? thatIs(tapped) : "" };
      stage?.light(id);
      if (who) stage?.gesture(who, "shake");
      return;
    }

    playAnswerSfx("correct");
    results = { ...results, [id]: missedTarget ? "later" : "first" };
    if (!missedTarget) streak += 1;
    findNote = { tone: "right", text: "Áno!", why: findWhy(target, level) };
    if (who) stage?.gesture(who, "nod");
    nextThing();
  }

  function showThing(): void {
    const target = findTarget;
    if (!target || (findNote && findNote.tone !== "wrong")) return;

    results = { ...results, [target.id]: "shown" };
    streak = 0;
    findNote = { tone: "shown", text: hereIs(target), why: findWhy(target, level) };
    stage?.light(target.id);
    nextThing();
  }

  function nextLevel(): FindLevel | undefined {
    const index = FIND_LEVELS.findIndex(({ id }) => id === level);
    return FIND_LEVELS[index + 1]?.id;
  }

  function hiddenLine(index: number): boolean {
    const line = scene.lines[index];
    return mode === "play" && Boolean(line?.learner) && !(index in firstTries);
  }

  function inOrder(things: readonly SceneThing[]): SceneThing[] {
    return queue.flatMap((id) => things.filter((thing) => thing.id === id));
  }
</script>

<main class="py-12 pb-24 max-[600px]:py-8">
  <PageShell class="max-w-[1040px]">
    <header class="max-w-[680px]">
      <h1 class="m-0 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Scenes
      </h1>
      <Lead class="mt-3">
        Prototype. Watch a lesson's dialogue with each word lit as it is said, take Alex's
        part, or find things in the room by their Slovak names.
      </Lead>
    </header>

    <nav class="mt-8" aria-label="Scenes">
      <ul
        class={cx(
          "m-0 flex list-none flex-wrap gap-2 p-0",
          "max-[600px]:-mx-4 max-[600px]:flex-nowrap max-[600px]:overflow-x-auto max-[600px]:px-4 max-[600px]:pb-1",
          // The page keeps 12px a side below 480px, 16px above.
          "max-[480px]:-mx-3 max-[480px]:px-3",
        )}
      >
        {#each scenes as option (option.id)}
          <li class="shrink-0">
            <button
              class="{chipClass(option.id === scene.id)} whitespace-nowrap"
              type="button"
              aria-pressed={option.id === scene.id}
              lang="sk"
              onclick={() => selectScene(option.id)}
            >
              {option.name}
            </button>
          </li>
        {/each}
      </ul>
    </nav>

    <section class="mt-6" aria-label="Scene">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-x-5 gap-y-2">
          <div class="flex gap-2" role="group" aria-label="Mode">
            {#each MODES as option (option.id)}
              <button
                class={chipClass(option.id === mode)}
                type="button"
                aria-pressed={option.id === mode}
                onclick={() => selectMode(option.id)}
              >
                {option.label}
              </button>
            {/each}
          </div>

          {#if mode === "play"}
            <div class="flex gap-2" role="group" aria-label="How Alex's lines are asked">
              {#each TURNS as option (option.id)}
                <button
                  class={chipClass(option.id === turnKind)}
                  type="button"
                  aria-pressed={option.id === turnKind}
                  onclick={() => {
                    turnKind = option.id;
                  }}
                >
                  {option.label}
                </button>
              {/each}
            </div>
          {/if}
        </div>

        <TextLink onclick={toggleEnglish}>
          {showEnglish ? "Hide English" : "Show English"}
        </TextLink>
      </div>

      <div class="{panelClass} mt-3 overflow-hidden">
        <StickStage
          bind:this={stage}
          class="border-b border-slate-200"
          direction={mode === "greet" ? GREET_DIRECTION : direction}
          {found}
          lines={mode === "greet" ? GREET_LINES : lines}
          {mood}
          onthing={mode === "find" ? tapThing : undefined}
          setting={mode === "greet" ? "plaza" : scene.setting}
          {thingWords}
        />

        <div class="min-h-44 px-5 py-5 sm:px-6">
          {#if mode === "greet"}
            {#if greetRound}
              {@const when = TIME_WORDS[greetRound.time]}

              <p class={eyebrowMutedClass}>
                <span lang="sk">{when.slovak}</span>
                <span class="font-normal">{when.english}</span>
              </p>
              <p class="m-0 mt-1 text-lg text-slate-900">
                {greetRound.leaving
                  ? "Alex is saying goodbye to Mária. What does Alex say?"
                  : "Alex meets Mária on the square. What does Alex say?"}
              </p>

              {#key greetRound.id}
                <ChoiceOptions
                  choices={GREETINGS.map((greeting) => ({
                    id: greeting,
                    label: greeting,
                  }))}
                  bind:selectedId={
                    () => greetPicked, (id) => greet(id as Greeting | null)
                  }
                  submitted={Boolean(greetNote?.right)}
                  wrongChoiceId={greetNote && !greetNote.right ? greetPicked : null}
                  correctIds={greetNote?.right ? greetRound.answers : null}
                  variant="cards"
                />
              {/key}

              {#if greetNote}
                <p
                  class={cx(
                    "m-0 mt-3 animate-rise text-sm leading-relaxed text-pretty",
                    greetNote.right ? "text-emerald-800" : "text-rose-800",
                  )}
                  role="status"
                >
                  {#each splitEmphasis(greetNote.text) as part, index (index)}
                    {#if part.type === "em"}
                      <strong class="font-semibold">{part.value}</strong>
                    {:else}
                      {part.value}
                    {/if}
                  {/each}
                </p>
              {/if}
            {:else}
              <div class="animate-rise">
                <p class="m-0 font-serif text-2xl text-slate-900">
                  {Object.values(greetResults).filter(Boolean).length} of {greetQueue.length}
                  right the first time.
                </p>
                <p class="m-0 mt-1 text-slate-600">
                  Dobrý večer stays a hello however late it gets. Dobrú noc only ever says
                  goodbye.
                </p>
                <div class="mt-4 flex flex-wrap items-center gap-4">
                  <Button variant="accent" onclick={startGreet}>Play again</Button>
                </div>
              </div>
            {/if}
          {:else if mode === "find"}
            {#if findTarget}
              {@const prompt = findPrompt(findTarget, level)}

              <div class="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
                <div class="min-w-0">
                  <p class={eyebrowMutedClass}>Tap it in the scene</p>
                  {#key prompt.slovak}
                    <p class="m-0 mt-1 animate-rise font-serif text-3xl text-slate-900">
                      <MarkedText text={prompt.slovak} marks={prompt.marks} />
                    </p>
                  {/key}
                  {#if showEnglish}
                    <p class="m-0 mt-1 text-base text-slate-600">{prompt.english}</p>
                  {/if}
                </div>

                <div class="flex flex-wrap gap-2" role="group" aria-label="Level">
                  {#each FIND_LEVELS as option (option.id)}
                    <button
                      class={chipClass(option.id === level)}
                      type="button"
                      aria-pressed={option.id === level}
                      lang="sk"
                      onclick={() => startFind(option.id)}
                    >
                      {option.label}
                    </button>
                  {/each}
                </div>
              </div>

              {#if findNote}
                <p
                  class={cx(
                    "m-0 mt-3 animate-rise text-sm leading-relaxed text-pretty",
                    findNote.tone === "right" && "text-emerald-800",
                    findNote.tone === "wrong" && "text-rose-800",
                    findNote.tone === "shown" && "text-slate-700",
                  )}
                  role="status"
                >
                  <span class="font-serif text-base font-semibold" lang="sk">
                    {findNote.text}
                  </span>
                  {#if findNote.why}
                    {#each splitEmphasis(findNote.why) as part, index (index)}
                      {#if part.type === "em"}
                        <strong class="font-semibold">{part.value}</strong>
                      {:else}
                        {part.value}
                      {/if}
                    {/each}
                  {/if}
                </p>
              {/if}
            {:else if queue.length > 0}
              {@const upNext = nextLevel()}

              <div class="animate-rise">
                <p class="m-0 font-serif text-2xl text-slate-900">
                  {firstTaps} of {queue.length} found on the first tap.
                </p>

                {#if level !== "where"}
                  <ul class="m-0 mt-3 flex list-none flex-wrap gap-x-5 gap-y-1 p-0">
                    {#each inOrder(direction.things) as thing (thing.id)}
                      <li class="font-serif text-base text-slate-700" lang="sk">
                        {thing.word}
                        <span class="text-slate-400" aria-hidden="true">→</span>
                        <span
                          class={accusativeOf(thing) === thing.word
                            ? undefined
                            : "text-emerald-700"}
                        >
                          {accusativeOf(thing)}
                        </span>
                      </li>
                    {/each}
                  </ul>
                {/if}

                <div class="mt-4 flex flex-wrap items-center gap-4">
                  {#if upNext}
                    <Button variant="accent" onclick={() => startFind(upNext)}>
                      Next: {FIND_LEVELS.find(({ id }) => id === upNext)?.label}
                    </Button>
                  {/if}
                  <TextLink onclick={() => startFind(level)}>Play again</TextLink>
                </div>
              </div>
            {:else}
              <p class="m-0 text-slate-600">Nothing to find in this place yet.</p>
            {/if}
          {:else if turn}
            {#key at}
              <SceneTurn
                english={turn.english}
                id={turn.id}
                ondone={answered}
                onmiss={missed}
                sayChoices={turnKind === "pick" ? turn.sayChoices : undefined}
                slovak={turn.slovak}
                speaker={turn.speaker}
              />
            {/key}

            <TextLink class="mt-4 inline-block" onclick={hearIt}>
              Hear {turn.speaker} say it
            </TextLink>
          {:else if phase === "done"}
            <div class="animate-rise">
              {#if mode === "play" && learnerCount > 0}
                <p class="m-0 font-serif text-2xl text-slate-900">
                  {firstTryCount} of {learnerCount} of Alex's lines right the first time.
                </p>
              {:else if learnerCount > 0}
                <p class="m-0 font-serif text-2xl text-slate-900">
                  Now say Alex's lines yourself.
                </p>
              {/if}

              {#if sceneWords.length > 0}
                <p class={cx(eyebrowMutedClass, learnerCount > 0 && "mt-4")}>
                  Things the dialogue named
                </p>
                <ul class="m-0 mt-2 flex list-none flex-wrap gap-2 p-0">
                  {#each sceneWords as thing (thing.id)}
                    {@const word = thingWords[thing.word]}
                    <li
                      class="inline-flex items-center gap-2 rounded-(--control-radius) bg-subtle py-1.5 pr-3 pl-1.5"
                    >
                      {#if word?.src}
                        <AudioButton
                          label="Listen: {thing.word}"
                          size="sm"
                          src={word.src}
                          text={thing.word}
                        />
                      {/if}
                      <span class="font-serif text-base text-slate-900" lang="sk">
                        {thingWithDemonstrative(thing)}
                      </span>
                      <span class="text-sm text-slate-500">{thing.english}</span>
                    </li>
                  {/each}
                </ul>
              {/if}

              <div class="mt-4 flex flex-wrap items-center gap-4">
                {#if mode === "watch" && learnerCount > 0}
                  <Button variant="accent" onclick={playAlex}>Play Alex</Button>
                {:else if direction.things.length > 0}
                  <Button variant="accent" onclick={() => selectMode("find")}>
                    Find things in the room
                  </Button>
                {/if}
                <TextLink onclick={playScene}>
                  {mode === "play" ? "Play again" : "Watch again"}
                </TextLink>
                {#if mode === "watch" && learnerCount > 0 && direction.things.length > 0}
                  <TextLink onclick={() => selectMode("find")}
                    >Find things in the room</TextLink
                  >
                {/if}
                <TextLink href={scene.lessonHref}>Open the lesson</TextLink>
              </div>
            </div>
          {:else if caption}
            <SceneCaption
              cue={captionCue}
              english={caption.english}
              {listenFirst}
              marks={caption.marks}
              onthing={(id) => stage?.light(id)}
              plan={direction.plans[shown]}
              playing={speaking}
              {showEnglish}
              slovak={caption.slovak}
              speaker={caption.speaker}
              things={direction.things}
            />
          {:else}
            <p class="m-0 font-serif text-2xl text-slate-900">
              {PLACES[scene.setting]}: {listOf(castNames)}.
            </p>
            <p class="m-0 mt-1 text-slate-600">
              {#if mode === "play"}
                The scene stops at each of Alex's lines for you to say it.
              {:else}
                Each word lights up as it is said. Tap a dotted word or anything in the
                room to see it.
              {/if}
            </p>
          {/if}
        </div>

        {#if mode === "find" && findTarget}
          <div
            class="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-200 px-5 py-3 sm:px-6"
          >
            <TextLink onclick={showThing}>Show me</TextLink>
            {#if streak > 1}
              <span class="ml-auto animate-rise text-sm font-semibold text-emerald-700">
                {streak} in a row
              </span>
            {/if}
            <span class={cx("text-sm text-slate-500", streak < 2 && "ml-auto")}>
              {Object.keys(results).length} of {queue.length}
            </span>
          </div>
        {:else if mode !== "find" && mode !== "greet" && phase !== "turn" && phase !== "done"}
          <div
            class="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-200 px-5 py-3 sm:px-6"
          >
            {#if phase === "playing"}
              <Button variant="secondary" onclick={pause}>Pause</Button>
            {:else}
              <Button variant="accent" onclick={playScene}>
                {#if phase === "paused"}
                  {listenFirst ? "Next line" : "Resume"}
                {:else}
                  Play scene
                {/if}
              </Button>
            {/if}

            {#if shown >= 0}
              <TextLink onclick={again}>Again</TextLink>
            {/if}

            <TextLink
              aria-pressed={slower}
              onclick={() => {
                slower = !slower;
              }}
            >
              {slower ? "Normal speed" : "Slower"}
            </TextLink>

            <TextLink
              aria-pressed={listenFirst}
              onclick={() => {
                listenFirst = !listenFirst;
              }}
            >
              {listenFirst ? "Show text as it is said" : "Listen first"}
            </TextLink>

            <span class="ml-auto text-sm text-slate-500">
              Line {Math.min(at + 1, scene.lines.length)} of {scene.lines.length}
            </span>
          </div>
        {/if}
      </div>

      {#if mode !== "find" && mode !== "greet"}
        <ol
          class="{panelClass} m-0 mt-4 list-none divide-y divide-slate-200 overflow-hidden p-0"
        >
          {#each scene.lines as line, index (line.id)}
            <li>
              <button
                class={cx(
                  "block w-full cursor-pointer border-0 px-5 py-3 text-left sm:px-6",
                  "transition-colors duration-150 ease-out hover:bg-subtle",
                  index === shown ? "bg-blue-50" : "bg-transparent",
                )}
                type="button"
                onclick={() => startAt(index)}
              >
                <span class="block text-sm font-semibold text-slate-500"
                  >{line.speaker}</span
                >

                {#if hiddenLine(index)}
                  <span class="mt-0.5 block text-base text-slate-500 italic">
                    Your line: {line.english}
                  </span>
                {:else}
                  <span class="mt-0.5 block font-serif text-lg text-slate-900">
                    <MarkedText text={line.slovak} marks={line.marks} />
                  </span>
                  {#if showEnglish}
                    <span class="block text-sm text-slate-500">{line.english}</span>
                  {/if}
                {/if}
              </button>
            </li>
          {/each}
        </ol>
      {/if}
    </section>
  </PageShell>
</main>
