<script lang="ts" module>
  import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
  import type { ListeningCheck } from "$lib/catalog/listening";
  import type { TextMark } from "$lib/learning/marked-text";
  import type { DialogueSayChoices } from "$lib/learning/types";
  import type { StageSetting } from "$lib/stick-figure/stage-setting";
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
    /** Questions on what was heard, asked once the scene has played: a podcast chapter's. */
    checks?: ListeningCheck[];
    /** Where the scene comes from: its lesson or podcast episode. */
    href?: string;
    hrefLabel?: string;
    id: string;
    lines: PlayerLine[];
    /** A line it is named after, or the podcast chapter's name. */
    name: string;
    /** Who stands where, left to right, so a series keeps its hosts in their places. */
    order?: LessonCharacterId[];
    setting: StageSetting;
  }

  export interface PlayerSceneGroup {
    label: string;
    /** The Slovak name after the label: the podcast episode's. */
    slovak?: string;
    scenes: PlayerScene[];
  }
</script>

<script lang="ts">
  import { onMount, tick, untrack } from "svelte";

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
    DAY_ROUNDS,
    GREETINGS,
    TIME_WORDS,
    dayName,
    dayWho,
    dayWhy,
    greetingGloss,
    greetingTurnId,
    isDayRight,
    pairOf,
    replyTurnId,
    type Greeting,
  } from "$lib/stick-figure/scene-day";
  import { ChoiceOptions } from "$lib/learning/exercises";
  import EpisodeCheck from "$lib/components/listening/EpisodeCheck.svelte";
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
    thingsInView,
    type SceneThing,
  } from "$lib/stick-figure/scene-things";
  import { cx } from "$lib/ui/classes";
  import {
    ambienceFor,
    playAmbience,
    type AmbiencePlayer,
  } from "$lib/stick-figure/ambience";
  import { canRecord } from "$lib/stick-figure/recorder";
  import type { Take } from "$lib/stick-figure/take";
  import SceneAction from "./SceneAction.svelte";
  import SceneCaption from "./SceneCaption.svelte";
  import SceneIcon from "./SceneIcon.svelte";
  import SceneSay from "./SceneSay.svelte";
  import SceneTurn from "./SceneTurn.svelte";
  import StickStage from "./StickStage.svelte";

  type Mode = "watch" | "play" | "find" | "day";
  /** Pick Alex's line from the lesson's choices, build it from its words, or say it. */
  type Turn = "pick" | "build" | "say";
  type Phase = "ready" | "playing" | "paused" | "turn" | "done";

  let {
    day = [],
    groups,
    thingWords = {},
  }: {
    /** Alex's greetings and the answers of the people on the square, with their clips. */
    day?: PlayerLine[];
    groups: PlayerSceneGroup[];
    /** Dictionary link and clip for a scene thing's word, keyed by the word. */
    thingWords?: Record<string, { href?: string; src?: string }>;
  } = $props();

  /** Ways to take a lesson scene; the day on the square is a game of its own. */
  const MODES: Array<{ id: Exclude<Mode, "day">; label: string }> = [
    { id: "watch", label: "Watch" },
    { id: "play", label: "Play as" },
    { id: "find", label: "Find it" },
  ];

  /** Long enough to read what was said back before the next person comes. */
  const DAY_PAUSE_MS = 2600;

  const TURNS: Array<{ id: Turn; label: string }> = [
    { id: "pick", label: "Pick the line" },
    { id: "build", label: "Build it" },
    { id: "say", label: "Say it" },
  ];

  const PLACES: Record<StageSetting, string> = {
    cafe: "At the café",
    classroom: "In class",
    counter: "At the front desk",
    default: "In the park by the Danube",
    home: "At home",
    market: "At the market",
    plaza: "On the old town square",
    registration: "At the front desk",
    studio: "In the podcast studio",
  };

  /** The scene a link opens: `?scene=podcast-demonstratives-market`. */
  const SCENE_PARAM = "scene";

  /** Between one line and the next, as in the lesson story. */
  const LINE_GAP_MS = 450;
  /** Long enough to read why the found word looks the way it does. */
  const FOUND_PAUSE_MS = 1800;

  const characters = listedCharacters();

  let sceneId = $state("");
  let mode = $state<Mode>("watch");
  let turnKind = $state<Turn>("pick");
  /** The browser can record from a microphone, so Say it is offered. */
  let recordable = $state(false);
  let takes = $state<Record<number, Take>>({});
  /** Alex's lines in the learner's recordings instead of Alex's clips. */
  let ownVoice = $state(false);
  let ambient = $state(false);
  let ambience: AmbiencePlayer | undefined;
  let phase = $state<Phase>("ready");
  /** The line the scene is on: playing, waiting for Alex, or next after a pause. */
  let at = $state(0);
  /** The line in the caption: the one playing, or the last one played. */
  let shown = $state(-1);
  let speaking = $state(false);
  let captionCue = $state(0);
  let showEnglish = $state(false);
  let slower = $state(false);
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

  let checkAt = $state(0);
  let checksRight = $state(0);

  let dayAt = $state(0);
  let dayPicked = $state<Greeting | null>(null);
  let dayMissed = $state(false);
  let dayResults = $state<Record<string, boolean>>({});
  let dayNote = $state<{ right: boolean; text: string }>();
  /** What Alex said in each round, for the stage to play back. */
  let daySaid = $state<Record<string, Greeting>>({});
  /** True while a greeting and its answer play, so the next pick waits. */
  let dayBusy = $state(false);
  /** True once the person has started answering, so their line shows as it is said. */
  let dayReplied = $state(false);

  let timer = 0;
  let findTimer = 0;
  let dayTimer = 0;

  const scenes = $derived(groups.flatMap((group) => group.scenes));
  const scene = $derived(scenes.find((option) => option.id === sceneId) ?? scenes[0]);
  /** The scene after this one in its group: the podcast's next chapter. */
  const nextScene = $derived.by(() => {
    const group = groups.find((option) => option.scenes.includes(scene));
    const index = group?.scenes.indexOf(scene) ?? -1;
    return index === -1 ? undefined : group?.scenes[index + 1];
  });
  const checks = $derived(scene.checks ?? []);
  const checking = $derived(phase === "done" && checkAt < checks.length);
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
  const direction = $derived(directScene(lines, scene.setting, scene.order));
  /** The same scene timed to the learner's takes, for the lines they recorded. */
  const dubbed = $derived(
    Object.keys(takes).length === 0
      ? direction
      : directScene(
          lines.map((line, index) => {
            const take = takes[index];
            return take
              ? { ...line, mouth: take.mouth, src: take.src, vowels: undefined }
              : line;
          }),
          scene.setting,
          scene.order,
        ),
  );
  const turns = $derived(TURNS.filter(({ id }) => id !== "say" || recordable));
  const takeCount = $derived(Object.keys(takes).length);
  const soundscape = $derived(
    ambienceFor(mode === "day" ? "plaza" : scene.setting, mood),
  );
  const soundKey = $derived(JSON.stringify(soundscape));
  const dayRound = $derived(DAY_ROUNDS[dayAt]);
  /** The person on the square now, or the last one once the day is over. */
  const dayVisitor = $derived(DAY_ROUNDS[Math.min(dayAt, DAY_ROUNDS.length - 1)].who);
  // Keyed on who, not the round, so moving on to the goodbye does not restage them.
  const dayPair = $derived(
    pairOf(
      DAY_ROUNDS,
      DAY_ROUNDS.findIndex((round) => round.who === dayVisitor),
    ),
  );
  const dayLines = $derived<DirectedLine[]>(
    dayPair.flatMap((round) => {
      const said = daySaid[round.id] ?? round.answers[0];
      return [
        dayLine(greetingTurnId(said), "alex", said),
        dayLine(replyTurnId(round), round.who, round.reply.slovak),
      ];
    }),
  );
  const dayDirection = $derived(directScene(dayLines, "plaza"));
  const mood = $derived(
    mode === "day"
      ? {
          time: (dayRound ?? DAY_ROUNDS[DAY_ROUNDS.length - 1]).time,
          weather: "clear" as const,
        }
      : sceneMood(scene.lines.map((line) => line.slovak)),
  );
  const caption = $derived(shown >= 0 ? scene.lines[shown] : undefined);
  const turn = $derived(phase === "turn" ? scene.lines[at] : undefined);
  const learnerCount = $derived(scene.lines.filter((line) => line.learner).length);
  /** Taking Alex's part needs Alex in the scene. */
  const modes = $derived(
    MODES.filter((option) => option.id !== "play" || learnerCount > 0),
  );
  const learnerName = $derived(
    scene.lines.find((line) => line.learner)?.speaker ?? "Alex",
  );
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

  $effect(() => {
    void soundKey;
    if (!ambient) return;

    const player = untrack(() => playAmbience(soundscape));
    ambience = player;
    return () => {
      player?.stop();
      if (ambience === player) ambience = undefined;
    };
  });

  onMount(() => {
    recordable = canRecord();
    const linked = new URLSearchParams(window.location.search).get(SCENE_PARAM);
    if (linked && scenes.some((option) => option.id === linked)) sceneId = linked;

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
    window.clearTimeout(dayTimer);
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
    checkAt = 0;
    checksRight = 0;
  }

  function dropTakes(): void {
    for (const take of Object.values(takes)) URL.revokeObjectURL(take.src);
    takes = {};
    ownVoice = false;
  }

  function selectScene(id: string): void {
    const same = id === scene.id;
    reset();
    if (!same) dropTakes();
    sceneId = id;
    const url = new URL(window.location.href);
    url.searchParams.set(SCENE_PARAM, id);
    window.history.replaceState(window.history.state, "", url);
    if (mode === "day") mode = "watch";
    if (mode === "play" && learnerCount === 0) mode = "watch";
    if (same) stage?.place(0);
    if (mode === "find") startFind();
  }

  /** On to the podcast's next chapter, playing once the stage has its cast. */
  async function nextChapter(): Promise<void> {
    if (!nextScene) return;
    selectScene(nextScene.id);
    await tick();
    playScene();
  }

  function resolveCheck(correct: boolean): void {
    if (correct) checksRight += 1;
    checkAt += 1;
  }

  function replay(lineId: string | undefined, onEnded: () => void): void {
    const index = scene.lines.findIndex((line) => line.id === lineId);
    if (index === -1) {
      onEnded();
      return;
    }

    halt();
    stage?.place(index);
    shown = index;
    stage?.play(index, onEnded, slower ? 0.75 : 1);
  }

  function selectMode(next: Mode): void {
    reset();
    stage?.place(0);
    mode = next;
    if (next === "find") startFind();
    if (next === "day") void startDay();
  }

  /** A line of the game with its clip; Alex stays on the square after each goodbye. */
  function dayLine(
    id: string,
    characterId: LessonCharacterId,
    slovak: string,
  ): DirectedLine {
    const line = day.find((option) => option.id === id);
    return {
      characterId,
      mouth: line?.mouth,
      slovak,
      src: line?.src,
      stays: characterId === "alex",
      vowels: line?.vowels,
    };
  }

  /** Stage the square with its first visitor on the way, once the stage has the cast. */
  async function startDay(): Promise<void> {
    window.clearTimeout(dayTimer);
    dayAt = 0;
    dayPicked = null;
    dayMissed = false;
    dayResults = {};
    dayNote = undefined;
    daySaid = {};
    dayBusy = false;
    dayReplied = false;
    await tick();
    stage?.arrive(dayPair[0].who, 1);
  }

  function sayOnSquare(picked: Greeting | null): void {
    const round = dayRound;
    if (!picked || !round || dayBusy) return;

    dayPicked = picked;
    if (!isDayRight(round, picked)) {
      playAnswerSfx("incorrect");
      stage?.say("alex", picked);
      stage?.gesture(round.who, "think");
      dayMissed = true;
      dayNote = { right: false, text: dayWhy(round, picked) };
      return;
    }

    playAnswerSfx("correct");
    dayResults = { ...dayResults, [round.id]: !dayMissed };
    daySaid = { ...daySaid, [round.id]: picked };
    dayNote = { right: true, text: round.notes?.[picked] ?? "" };
    dayBusy = true;

    // The stage restages for the greeting Alex picked before it can play it.
    const index = dayPair.indexOf(round) * 2;
    void tick().then(() => {
      stage?.play(index, () => {
        dayReplied = true;
        stage?.play(index + 1, () => {
          dayTimer = window.setTimeout(() => void nextOnSquare(), DAY_PAUSE_MS);
        });
      });
    });
  }

  async function nextOnSquare(): Promise<void> {
    const gone = dayRound?.leaving;
    dayAt += 1;
    dayPicked = null;
    dayMissed = false;
    dayNote = undefined;
    dayBusy = false;
    dayReplied = false;
    if (gone && dayRound) {
      await tick();
      stage?.arrive(dayRound.who, 1);
    }
  }

  /** The learner's take of line `index`, when it should be heard in Alex's place. */
  function takeAt(index: number): Take | undefined {
    return ownVoice ? takes[index] : undefined;
  }

  function say(index: number, onDone?: () => void): void {
    shown = index;
    speaking = true;
    captionCue += 1;
    const take = takeAt(index);
    stage?.play(
      index,
      () => {
        speaking = false;
        onDone?.();
      },
      slower ? 0.75 : 1,
      take && { plan: dubbed.plans[index], src: take.src },
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

  function playAlex(): void {
    selectMode("play");
    playScene();
  }

  function recordAgain(): void {
    dropTakes();
    playAlex();
  }

  function watchWith(own: boolean): void {
    selectMode("watch");
    ownVoice = own;
    playScene();
  }

  function pause(): void {
    halt();
    phase = "paused";
  }

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

  /** Alex's own clip of the turn's line, to copy before recording; the turn waits. */
  function hearFirst(): void {
    halt();
    const index = at;
    stage?.place(index);
    speaking = true;
    stage?.play(index, () => {
      speaking = false;
    });
  }

  function useTake(take: Take): void {
    takes = { ...takes, [at]: take };
    ownVoice = true;
    firstTries = { ...firstTries, [at]: true };
    phase = "playing";
    const index = at;
    say(index, () => advance(index));
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
    // Only what the stage shows: a phone slices off the ends of the room.
    const { height, width } = stage?.size() ?? { height: 0, width: 0 };
    queue = shuffledTiles(
      thingsInView(direction.things, scene.setting, width, height).map(({ id }) => id),
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
        part, or find things in the scene by their Slovak names.
      </Lead>
    </header>

    <nav class="mt-8 grid gap-4" aria-label="Scenes">
      {#each groups as group (`${group.label}-${group.slovak}`)}
        <!-- A grid item grows to its content, which would stop the chips scrolling. -->
        <div class="min-w-0">
          <p class={eyebrowMutedClass}>
            {group.label}
            {#if group.slovak}
              <span class="ml-1 font-serif text-slate-700" lang="sk">{group.slovak}</span>
            {/if}
          </p>

          <ul
            class={cx(
              "m-0 mt-2 flex list-none flex-wrap gap-2 p-0",
              "max-[600px]:-mx-4 max-[600px]:flex-nowrap max-[600px]:overflow-x-auto max-[600px]:px-4 max-[600px]:pb-1",
              // The page keeps 12px a side below 480px, 16px above.
              "max-[480px]:-mx-3 max-[480px]:px-3",
            )}
          >
            {#each group.scenes as option (option.id)}
              <li class="shrink-0">
                <button
                  class="{chipClass(
                    option.id === scene.id && mode !== 'day',
                  )} whitespace-nowrap"
                  type="button"
                  aria-pressed={option.id === scene.id && mode !== "day"}
                  lang="sk"
                  onclick={() => selectScene(option.id)}
                >
                  {option.name}
                </button>
              </li>
            {/each}
          </ul>
        </div>
      {/each}

      <div>
        <p class={eyebrowMutedClass}>Games</p>
        <button
          class="{chipClass(mode === 'day')} mt-2 whitespace-nowrap"
          type="button"
          aria-pressed={mode === "day"}
          lang="sk"
          onclick={() => selectMode("day")}
        >
          Deň na námestí
        </button>
      </div>
    </nav>

    <section class="mt-6" aria-label="Scene">
      <div class="flex flex-wrap items-center justify-between gap-3">
        {#if mode !== "day"}
          <div class="flex flex-wrap items-center gap-x-5 gap-y-2">
            <div class="flex gap-2" role="group" aria-label="Mode">
              {#each modes as option (option.id)}
                <button
                  class={chipClass(option.id === mode)}
                  type="button"
                  aria-pressed={option.id === mode}
                  onclick={() => selectMode(option.id)}
                >
                  {option.id === "play" ? `Play as ${learnerName}` : option.label}
                </button>
              {/each}
            </div>

            {#if mode === "play"}
              <div
                class="flex gap-2"
                role="group"
                aria-label="How Alex's lines are asked"
              >
                {#each turns as option (option.id)}
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
        {/if}

        <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
          <TextLink
            aria-pressed={ambient}
            onclick={() => {
              ambient = !ambient;
            }}
          >
            {ambient ? "Stop background sound" : "Play background sound"}
          </TextLink>

          <!-- Find it asks in Slovak only: the English would give the answer away. -->
          {#if mode !== "find"}
            <TextLink onclick={toggleEnglish}>
              {showEnglish ? "Hide English" : "Show English"}
            </TextLink>
          {/if}
        </div>
      </div>

      <div class="{panelClass} mt-3 overflow-hidden">
        <StickStage
          bind:this={stage}
          class="border-b border-slate-200"
          direction={mode === "day" ? dayDirection : direction}
          {found}
          lines={mode === "day" ? dayLines : lines}
          {mood}
          onthing={mode === "find" ? tapThing : undefined}
          setting={mode === "day" ? "plaza" : scene.setting}
          {thingWords}
        />

        <div class="px-5 py-5 sm:px-6">
          {#if mode === "day"}
            {#if dayRound}
              {@const when = TIME_WORDS[dayRound.time]}
              {@const who = dayWho(dayRound.who)}

              {#key dayRound.id}
                <div class="animate-rise">
                  <p class={eyebrowMutedClass}>
                    <span lang="sk">{when.slovak}</span>
                    <span class="font-normal">{when.english}</span>
                  </p>
                  <p
                    class="m-0 mt-1 font-serif text-2xl leading-snug text-slate-900 max-[600px]:text-xl"
                    lang="sk"
                  >
                    {dayRound.prompt.slovak}
                  </p>
                  <p class="m-0 mt-1 text-sm text-slate-600">
                    <span class="font-semibold text-slate-700" lang="sk"
                      >{who.slovak}</span
                    >
                    <span class="ml-2">{who.english}</span>
                  </p>

                  {#if dayNote?.right && dayPicked}
                    <ol
                      class="m-0 mt-4 list-none divide-y divide-slate-200 border-t border-slate-200 p-0"
                    >
                      <li class="py-3">
                        <span class="block text-sm font-semibold text-slate-500"
                          >Alex</span
                        >
                        <span
                          class="mt-0.5 block font-serif text-lg text-slate-900"
                          lang="sk"
                        >
                          {dayPicked}
                        </span>
                        {#if showEnglish}
                          <span class="block text-sm text-slate-500">
                            {greetingGloss(dayPicked)}
                          </span>
                        {/if}
                      </li>
                      {#if dayReplied}
                        <li class="animate-rise py-3">
                          <span class="block text-sm font-semibold text-slate-500">
                            {dayName(dayRound.who)}
                          </span>
                          <span
                            class="mt-0.5 block font-serif text-lg text-slate-900"
                            lang="sk"
                          >
                            {dayRound.reply.slovak}
                          </span>
                          {#if showEnglish}
                            <span class="block text-sm text-slate-500">
                              {dayRound.reply.english}
                            </span>
                          {/if}
                        </li>
                      {/if}
                    </ol>

                    {#if dayNote.text}
                      <p
                        class="m-0 mt-3 text-sm leading-relaxed text-pretty text-slate-600"
                      >
                        {#each splitEmphasis(dayNote.text) as part, index (index)}
                          {#if part.type === "em"}
                            <strong class="font-semibold text-slate-800"
                              >{part.value}</strong
                            >
                          {:else}
                            {part.value}
                          {/if}
                        {/each}
                      </p>
                    {/if}
                  {:else}
                    <ChoiceOptions
                      choices={GREETINGS.map((greeting) => ({
                        id: greeting,
                        label: greeting,
                      }))}
                      bind:selectedId={
                        () => dayPicked, (id) => sayOnSquare(id as Greeting | null)
                      }
                      columns={2}
                      submitted={false}
                      wrongChoiceId={dayNote && !dayNote.right ? dayPicked : null}
                      variant="cards"
                    />

                    {#if dayNote && !dayNote.right}
                      <p
                        class="m-0 mt-3 animate-rise text-sm leading-relaxed text-pretty text-rose-800"
                        role="status"
                      >
                        {#each splitEmphasis(dayNote.text) as part, index (index)}
                          {#if part.type === "em"}
                            <strong class="font-semibold">{part.value}</strong>
                          {:else}
                            {part.value}
                          {/if}
                        {/each}
                      </p>
                    {/if}
                  {/if}
                </div>
              {/key}
            {:else}
              <div class="animate-rise">
                <p class="m-0 font-serif text-2xl text-slate-900">
                  {Object.values(dayResults).filter(Boolean).length} of {DAY_ROUNDS.length}
                  right the first time.
                </p>

                <p class="{eyebrowMutedClass} mt-4">Who came by</p>
                <ul class="m-0 mt-2 flex list-none flex-wrap gap-2 p-0">
                  {#each DAY_ROUNDS.filter((round) => !round.leaving) as meet (meet.id)}
                    {@const leave = pairOf(DAY_ROUNDS, DAY_ROUNDS.indexOf(meet))[1]}
                    <li
                      class="inline-flex items-center gap-2 rounded-(--control-radius) bg-subtle px-3 py-1.5"
                    >
                      <span class="font-serif text-base text-slate-900"
                        >{dayName(meet.who)}</span
                      >
                      <span class="text-sm text-slate-500" lang="sk">
                        {meet.answers[0].slice(0, -1)} · {leave.answers[0].slice(0, -1)}
                      </span>
                    </li>
                  {/each}
                </ul>

                <div class="mt-4 flex flex-wrap items-center gap-4">
                  <Button variant="accent" onclick={startDay}>
                    <SceneIcon name="replay" />
                    Play again
                  </Button>
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
                  <SceneAction icon="replay" onclick={() => startFind(level)}
                    >Play again</SceneAction
                  >
                </div>
              </div>
            {:else}
              <p class="m-0 text-slate-600">Nothing to find in this place yet.</p>
            {/if}
          {:else if turn}
            {#key at}
              {#if turnKind === "say"}
                <SceneSay
                  english={turn.english}
                  marks={turn.marks}
                  onhear={hearFirst}
                  ontake={useTake}
                  {showEnglish}
                  slovak={turn.slovak}
                  speaker={turn.speaker}
                />
              {:else}
                <SceneTurn
                  english={turn.english}
                  id={turn.id}
                  ondone={answered}
                  onmiss={missed}
                  sayChoices={turnKind === "pick" ? turn.sayChoices : undefined}
                  slovak={turn.slovak}
                  speaker={turn.speaker}
                />
              {/if}
            {/key}

            <SceneAction class="mt-3 -ml-2.5" icon="listen" onclick={hearIt}>
              {turnKind === "say"
                ? `Let ${turn.speaker} say it`
                : `Hear ${turn.speaker} say it`}
            </SceneAction>
          {:else if checking}
            {@const check = checks[checkAt]}

            {#key check.id}
              <EpisodeCheck
                {check}
                doneLabel="See how you did"
                questionNumber={checkAt + 1}
                onresolve={resolveCheck}
                playReplay={(onEnded) => replay(check.replayLineId, onEnded)}
                replayLine={scene.lines.find((line) => line.id === check.replayLineId)}
                stopReplay={halt}
                total={checks.length}
              />
            {/key}
          {:else if phase === "done"}
            {@const scored = mode === "play" && learnerCount > 0}

            <div class="animate-rise">
              {#if checks.length > 0}
                <p class="m-0 font-serif text-2xl text-slate-900">
                  {checksRight} of {checks.length} answered right.
                </p>
              {:else if mode === "play" && turnKind === "say" && learnerCount > 0}
                <p class="m-0 font-serif text-2xl text-slate-900">
                  You said {takeCount} of {learnerName}'s {learnerCount}
                  {learnerCount === 1 ? "line" : "lines"}.
                </p>
              {:else if scored}
                <p class="m-0 font-serif text-2xl text-slate-900">
                  {firstTryCount} of {learnerCount} of {learnerName}'s lines right the
                  first time.
                </p>
              {/if}

              {#if sceneWords.length > 0}
                <p class={cx(eyebrowMutedClass, (scored || checks.length > 0) && "mt-4")}>
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

              <div
                class={cx(
                  "flex flex-wrap items-center gap-x-2 gap-y-2",
                  (scored || checks.length > 0 || sceneWords.length > 0) && "mt-4",
                )}
              >
                {#if nextScene && checks.length > 0}
                  <Button class="mr-2" variant="accent" onclick={nextChapter}>
                    <span>Next chapter: <span lang="sk">{nextScene.name}</span></span>
                  </Button>
                  <SceneAction icon="replay" onclick={playScene}>Watch again</SceneAction>
                {:else if mode === "play" && takeCount > 0}
                  <Button class="mr-2" variant="accent" onclick={() => watchWith(true)}>
                    <SceneIcon name="play" />
                    Watch it in your voice
                  </Button>
                  <SceneAction icon="mic" onclick={recordAgain}>Record again</SceneAction>
                {:else}
                  <Button class="mr-2" variant="accent" onclick={playScene}>
                    <SceneIcon name="replay" />
                    {mode === "play" ? "Play again" : "Watch again"}
                  </Button>
                {/if}
                {#if mode === "watch" && takeCount > 0}
                  <SceneAction icon="listen" onclick={() => watchWith(!ownVoice)}>
                    {ownVoice
                      ? `Watch with ${learnerName}'s voice`
                      : "Watch in your voice"}
                  </SceneAction>
                {/if}
                {#if mode === "watch" && learnerCount > 0}
                  <SceneAction icon="person" onclick={playAlex}>
                    Play as {learnerName}
                  </SceneAction>
                {/if}
                {#if direction.things.length > 0}
                  <SceneAction icon="find" onclick={() => selectMode("find")}>
                    Find things in the scene
                  </SceneAction>
                {/if}
                {#if scene.href}
                  <SceneAction href={scene.href} icon="book"
                    >{scene.hrefLabel}</SceneAction
                  >
                {/if}
              </div>
            </div>
          {:else if caption}
            <SceneCaption
              cue={captionCue}
              english={caption.english}
              {listenFirst}
              marks={caption.marks}
              onthing={(id) => stage?.light(id)}
              plan={(takeAt(shown) ? dubbed : direction).plans[shown]}
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
              {:else if checks.length > 0}
                Each word lights up as it is said. Then
                {checks.length === 1 ? "a question" : `${checks.length} questions`} on what
                you heard.
              {:else}
                Each word lights up as it is said. Tap a dotted word or anything in the
                scene to see it.
              {/if}
            </p>
          {/if}
        </div>

        {#if mode === "find" && findTarget}
          <div
            class="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-200 px-5 py-3 sm:px-6"
          >
            <SceneAction class="-ml-2.5" icon="find" onclick={showThing}
              >Show me</SceneAction
            >
            {#if streak > 1}
              <span class="ml-auto animate-rise text-sm font-semibold text-emerald-700">
                {streak} in a row
              </span>
            {/if}
            <span class={cx("text-sm text-slate-500", streak < 2 && "ml-auto")}>
              {Object.keys(results).length} of {queue.length}
            </span>
          </div>
        {:else if mode !== "find" && mode !== "day" && phase !== "turn" && phase !== "done"}
          <div
            class="flex flex-wrap items-center gap-x-2 gap-y-2 border-t border-slate-200 px-5 py-3 sm:px-6"
          >
            {#if phase === "playing"}
              <Button class="mr-2" variant="secondary" onclick={pause}>
                <SceneIcon name="pause" />
                Pause
              </Button>
            {:else}
              <Button class="mr-2" variant="accent" onclick={playScene}>
                <SceneIcon name="play" />
                {#if phase === "paused"}
                  {listenFirst ? "Next line" : "Resume"}
                {:else}
                  Play scene
                {/if}
              </Button>
            {/if}

            {#if shown >= 0}
              <SceneAction onclick={again}>Again</SceneAction>
            {/if}

            <SceneAction
              aria-pressed={slower}
              onclick={() => {
                slower = !slower;
              }}
            >
              {slower ? "Normal speed" : "Slower"}
            </SceneAction>

            <SceneAction
              aria-pressed={listenFirst}
              onclick={() => {
                listenFirst = !listenFirst;
              }}
            >
              {listenFirst ? "Show text as it is said" : "Listen first"}
            </SceneAction>

            {#if mode === "watch" && takeCount > 0}
              <SceneAction
                aria-pressed={ownVoice}
                icon="mic"
                onclick={() => {
                  ownVoice = !ownVoice;
                }}
              >
                {ownVoice ? `Use ${learnerName}'s voice` : "Use your voice"}
              </SceneAction>
            {/if}

            <span class="ml-auto text-sm text-slate-500">
              Line {Math.min(at + 1, scene.lines.length)} of {scene.lines.length}
            </span>
          </div>
        {/if}
      </div>

      <!-- The questions are on what was heard, so the text waits until they are answered. -->
      {#if mode !== "find" && mode !== "day" && !checking}
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
