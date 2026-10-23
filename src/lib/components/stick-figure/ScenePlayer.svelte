<script lang="ts" module>
  import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
  import type { ListeningCheck } from "$lib/catalog/listening";
  import type { TextMark } from "$lib/learning/marked-text";
  import type { DialogueSayChoices } from "$lib/learning/types";
  import type { StageSetting } from "$lib/stick-figure/stage-setting";
  import type { StickGestureId } from "$lib/stick-figure/gestures";
  import type { TimeOfDay } from "$lib/stick-figure/scene-mood";
  import type { Said, TalkNode } from "$lib/stick-figure/talk";
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
    /** Keeps their place after a goodbye: Alex, whom the others visit. */
    stays?: boolean;
    to?: LessonCharacterId;
    vowels?: string;
  }

  /** A conversation that branches on Alex's replies, with the one he talks with. */
  export interface PlayerTalk {
    nodes: TalkNode<PlayerLine>[];
    who: LessonCharacterId;
  }

  export interface PlayerScene {
    /** Questions on what was heard, asked once the scene has played: a podcast chapter's. */
    checks?: ListeningCheck[];
    /** Under the name in the list of scenes: the lesson's title, or the name in English. */
    english?: string;
    /** Where the scene comes from: its lesson or podcast episode. */
    href?: string;
    hrefLabel?: string;
    id: string;
    /** Before it starts, in place of the place and the cast: the hour and who comes. */
    intro?: Said;
    /** The lines as played without picking: a talk's along the first reply that fits. */
    lines: PlayerLine[];
    /** A line it is named after, or the podcast chapter's name. */
    name: string;
    /** Who stands where, left to right, so a series keeps its hosts in their places. */
    order?: LessonCharacterId[];
    setting: StageSetting;
    /** Branches on what Alex says, so its lines follow his picks. */
    talk?: PlayerTalk;
    /** The hour, when the lines do not say it with a greeting. */
    time?: TimeOfDay;
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
  import { playStoryLineAudio } from "$lib/lesson-story/story-audio";
  import { listedCharacters } from "$lib/catalog/lessons/character-ids";
  import MarkedText from "$lib/components/learning/MarkedText.svelte";
  import { splitEmphasis } from "$lib/components/practice/practice-feedback-ui";
  import Button from "$lib/components/ui/Button.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";
  import { dataPanelClass } from "$lib/components/ui/data-list-ui";
  import { chipClass, eyebrowMutedClass, panelClass } from "$lib/components/ui/system-ui";
  import {
    STORY_PREFS_CHANGE_EVENT,
    getStoryShowEnglish,
    setStoryShowEnglish,
  } from "$lib/lesson-story/prefs";
  import { focusUnlessTyping } from "$lib/listening/focus";
  import { shuffledTiles } from "$lib/stick-figure/caption";
  import { directScene, type DirectedLine } from "$lib/stick-figure/scene-direction";
  import { sceneMood, type SceneMood } from "$lib/stick-figure/scene-mood";
  import { defaultReply, fits, replyChoices, walkTalk } from "$lib/stick-figure/talk";
  import EpisodeCheck from "$lib/components/listening/EpisodeCheck.svelte";
  import {
    accusativeOf,
    accusativeRule,
    findAsks,
    findEnglish,
    formChanges,
    findPrompt,
    findWhy,
    hereIs,
    thatIs,
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
  import SceneIcon, { type SceneIconName } from "./SceneIcon.svelte";
  import SceneSay from "./SceneSay.svelte";
  import SceneSettings, { type SceneSetting } from "./SceneSettings.svelte";
  import SceneTurn from "./SceneTurn.svelte";
  import StickStage from "./StickStage.svelte";
  import { STICK_NAME_CLASSES } from "./stick-figure-ui";

  type Mode = "watch" | "play" | "find";
  /**
   * Pick Alex's line from the choices, build it from its words, or say it;
   * adaptive moves between them as the learner gets lines right or not.
   */
  type Turn = "pick" | "build" | "say" | "adaptive";
  type Phase = "ready" | "playing" | "paused" | "turn" | "done";

  interface DoneAction {
    icon: SceneIconName;
    label: string;
    run: () => void;
    /** A Slovak name after the label: the next scene's. */
    slovak?: string;
  }

  let {
    groups,
    thingWords = {},
  }: {
    groups: PlayerSceneGroup[];
    /** Dictionary link and clip for a scene thing's word, keyed by the word. */
    thingWords?: Record<string, { href?: string; src?: string }>;
  } = $props();

  /** Ways to take a scene. */
  const MODES: Array<{ id: Mode; label: string }> = [
    { id: "watch", label: "Watch" },
    { id: "play", label: "Play as" },
    { id: "find", label: "Find it" },
  ];

  /** After a slip, before the one spoken to answers it, so Alex's bubble is read first. */
  const ANSWER_DELAY_MS = 900;

  const TURNS: Array<{ id: Turn; label: string; task: string }> = [
    { id: "pick", label: "Pick the line", task: "pick what to say" },
    { id: "build", label: "Build it", task: "build the line from its words" },
    { id: "say", label: "Say it", task: "say the line out loud" },
    {
      id: "adaptive",
      label: "Adaptive",
      task: "answer: picking first, then building the line and saying it as you get lines right, and back a step after a slip",
    },
  ];
  /** Two right the first time in a row moves adaptive on a step. */
  const STEP_UP_AFTER = 2;

  const PLACES: Record<StageSetting, string> = {
    cafe: "At the café",
    classroom: "In class",
    counter: "At the front desk",
    default: "In the park by the Danube",
    home: "At home",
    market: "At the market",
    plaza: "On the old town square",
    registration: "At the front desk",
    street: "On the street, by the tram stop",
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
  let scriptOpen = $state(false);
  /** Alex's lines answered so far, and whether each was right the first time. */
  let firstTries = $state<Record<number, boolean>>({});
  let stage = $state<ReturnType<typeof StickStage>>();
  let player = $state<HTMLElement>();

  /** Rounds of Find it played on this scene, so Play again asks in a new order. */
  let findRound = 0;
  let queue = $state<string[]>([]);
  let findAt = $state(0);
  /** How each thing went: found on the first tap, found after a miss, or shown. */
  let results = $state<Record<string, "first" | "later" | "shown">>({});
  let missedTarget = $state(false);
  /** Things found on the first tap in a row. */
  let streak = $state(0);
  let findNote = $state<{
    english: string;
    tone: "right" | "wrong" | "shown";
    text: string;
    why?: string;
  }>();

  let checkAt = $state(0);
  let checksRight = $state(0);

  /** Each talk node's reply picked so far, by index; the rest follow the first that fits. */
  let picks = $state<Record<string, number>>({});
  /** Adaptive's step: picking, building, saying. */
  let adaptiveStep = $state(0);
  /** Lines right the first time in a row since adaptive last moved. */
  let adaptiveRun = 0;

  let timer = 0;
  let findTimer = 0;
  let answerTimer = 0;

  const scenes = $derived(groups.flatMap((group) => group.scenes));
  const scene = $derived(scenes.find((option) => option.id === sceneId) ?? scenes[0]);
  /** The scene after this one in its group: the podcast's next chapter. */
  const nextScene = $derived.by(() => {
    const group = groups.find((option) => option.scenes.includes(scene));
    const index = group?.scenes.indexOf(scene) ?? -1;
    return index === -1 ? undefined : group?.scenes[index + 1];
  });
  const checks = $derived(scene.checks ?? []);
  /** A talk walked along Alex's picks: its lines, and which node each of his turns answers. */
  const walked = $derived(scene.talk ? walkTalk(scene.talk.nodes, picks) : undefined);
  const sceneLines = $derived(walked?.lines ?? scene.lines);
  const checking = $derived(phase === "done" && checkAt < checks.length);
  const lines = $derived<DirectedLine[]>(
    sceneLines.map((line) => ({
      characterId: line.onStage ? line.characterId : null,
      gestures: line.gestures,
      mouth: line.mouth,
      props: line.props,
      slovak: line.slovak,
      src: line.src,
      stays: line.stays,
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
  const soundscape = $derived(ambienceFor(scene.setting, mood));
  const soundKey = $derived(JSON.stringify(soundscape));
  const mood = $derived.by((): SceneMood => {
    const told = sceneMood(
      sceneLines.map((line) => line.slovak),
      // Past the last line once it is over, where the rain has let up.
      phase === "done" ? sceneLines.length : shown >= 0 ? shown : at,
    );
    return { ...told, time: scene.time ?? told.time };
  });
  const caption = $derived(shown >= 0 ? sceneLines[shown] : undefined);
  const turn = $derived(phase === "turn" ? sceneLines[at] : undefined);
  /** The talk node Alex's turn answers, when the scene branches. */
  const turnNode = $derived(phase === "turn" ? walked?.turns.get(at) : undefined);
  /** How this turn is answered: the kind picked, or adaptive's step. */
  const turnNow = $derived.by((): Exclude<Turn, "adaptive"> => {
    if (turnKind !== "adaptive") return turnKind;
    const steps: Array<Exclude<Turn, "adaptive">> = recordable
      ? ["pick", "build", "say"]
      : ["pick", "build"];
    return steps[Math.min(adaptiveStep, steps.length - 1)];
  });
  /** In a talk, the replies that fit, when there is more than one to choose between. */
  const intents = $derived(
    (turnNode?.replies ?? []).flatMap((reply, index) =>
      fits(reply) ? [{ english: reply.line.english, index }] : [],
    ),
  );
  /** Whose name sits on the dialogue box: the speaker of the line showing, or Alex at his turn. */
  const tag = $derived.by(
    (): { characterId: LessonCharacterId; name: string } | undefined => {
      if (mode === "find" || checking || phase === "done") return undefined;
      // In a talk, the box keeps the other person's line over Alex's replies.
      const line = turn && scene.talk && answering ? answering : (turn ?? caption);
      // A board or a notice has nobody on stage saying it, so no name goes on the box.
      return line?.onStage
        ? { characterId: line.characterId, name: line.speaker }
        : undefined;
    },
  );
  /** In a talk, at Alex's turn: what the other person has just said, which he answers. */
  const answering = $derived(caption && !caption.learner ? caption : undefined);
  const learnerCount = $derived(sceneLines.filter((line) => line.learner).length);
  const findable = $derived(direction.things.length > 0);
  /** Taking Alex's part needs Alex in the scene, and finding things needs things. */
  const modes = $derived(
    MODES.filter(
      (option) =>
        (option.id !== "play" || learnerCount > 0) && (option.id !== "find" || findable),
    ),
  );
  const learnerName = $derived(
    sceneLines.find((line) => line.learner)?.speaker ?? "Alex",
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
  /** How the round asks for each thing, in the round's order. */
  const findAsk = $derived(findAsks(inOrder(direction.things))[findAt]);
  const findTarget = $derived(
    direction.things.find((thing) => thing.id === queue[findAt]),
  );
  const found = $derived(Object.keys(results).filter((id) => results[id] !== "shown"));
  const firstTaps = $derived(
    Object.values(results).filter((result) => result === "first").length,
  );
  const settings = $derived<SceneSetting[]>([
    // Find it asks in Slovak only: the English would give the answer away.
    ...(mode === "find"
      ? []
      : [
          {
            description: "Translations under the Slovak lines",
            label: "Show English",
            on: showEnglish,
            ontoggle: toggleEnglish,
          },
        ]),
    ...(mode === "find"
      ? []
      : [
          {
            description: "Lines play at three-quarter speed",
            label: "Slower",
            on: slower,
            ontoggle: () => {
              slower = !slower;
            },
          },
        ]),
    ...(mode === "watch" || mode === "play"
      ? [
          {
            description:
              "Hear each line before you read it, then go on when you are ready",
            label: "Listen first",
            on: listenFirst,
            ontoggle: () => {
              listenFirst = !listenFirst;
            },
          },
        ]
      : []),
    {
      description: "The sound of the place, quieter under the voices",
      label: "Background sound",
      on: ambient,
      ontoggle: () => {
        ambient = !ambient;
      },
    },
  ]);
  /**
   * Once the scene is over, the main step first: on to the next way to take
   * it, then the next scene. A turn missed on the way plays the scene again first.
   */
  const doneActions = $derived.by((): DoneAction[] => {
    const again: DoneAction = {
      icon: "replay",
      label: mode === "play" ? "Play again" : "Watch again",
      run: playScene,
    };
    const next: DoneAction[] = nextScene
      ? [
          {
            icon: "next",
            label: checks.length > 0 ? "Next segment" : "Next scene",
            run: () => void goNext(),
            slovak: nextScene.name,
          },
        ]
      : [];
    const find: DoneAction[] = findable
      ? [
          {
            icon: "find",
            label: "Find things in the scene",
            run: () => selectMode("find"),
          },
        ]
      : [];

    if (mode === "play" && takeCount > 0) {
      return [
        { icon: "play", label: "Watch it in your voice", run: () => watchWith(true) },
        { icon: "mic", label: "Record again", run: recordAgain },
        ...find,
        ...next,
      ];
    }

    const play: DoneAction[] =
      mode === "watch" && learnerCount > 0
        ? [{ icon: "person", label: `Play as ${learnerName}`, run: playAlex }]
        : [];
    const voice: DoneAction[] =
      mode === "watch" && takeCount > 0
        ? [
            {
              icon: "listen",
              label: ownVoice
                ? `Watch with ${learnerName}'s voice`
                : "Watch in your voice",
              run: () => watchWith(!ownVoice),
            },
          ]
        : [];
    // A podcast goes on chapter by chapter; a lesson scene takes each way in turn.
    const onward = checks.length > 0 ? [...next, ...find] : [...play, ...find, ...next];
    const missed = mode === "play" && firstTryCount < learnerCount;

    return missed || onward.length === 0
      ? [again, ...voice, ...onward]
      : [onward[0], again, ...voice, ...onward.slice(1)];
  });
  const castNames = $derived(
    direction.cast.map((id) => {
      const character = characters.find((candidate) => candidate.id === id);
      const name = character?.displayName ?? id;
      return character?.kind === "recurring" ? name : `the ${name.toLowerCase()}`;
    }),
  );

  $effect(() => {
    if (!ambient) return;

    const player = untrack(() => playAmbience(soundscape));
    ambience = player;
    return () => {
      player?.stop();
      if (ambience === player) ambience = undefined;
    };
  });

  // One player for the whole visit: the weather fades in and out of it rather than restarting it.
  $effect(() => {
    void soundKey;
    untrack(() => ambience?.set(soundscape));
  });

  onMount(() => {
    recordable = canRecord();
    const linked = new URLSearchParams(window.location.search).get(SCENE_PARAM);
    if (linked && scenes.some((option) => option.id === linked)) sceneId = linked;
    if (scene.talk) mode = "play";

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
    window.clearTimeout(answerTimer);
    stage?.stop();
    speaking = false;
  }

  function reset(): void {
    halt();
    phase = "ready";
    at = 0;
    shown = -1;
    firstTries = {};
    picks = {};
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
    // A talk is there to be played: watching it only shows one way through.
    if (scene.talk) mode = "play";
    if (mode === "play" && learnerCount === 0) mode = "watch";
    if (mode === "find" && !findable) mode = "watch";
    if (same) stage?.place(0);
    if (mode === "find") startFind();
  }

  /** On to the next scene in its group, playing once the stage has its cast. */
  async function goNext(): Promise<void> {
    if (!nextScene) return;
    selectScene(nextScene.id);
    void scrollToPlayer();
    await tick();
    if (mode !== "find") playScene();
  }

  function openScene(id: string): void {
    selectScene(id);
    void scrollToPlayer();
  }

  /** Back up to the player from the list under it, unless its top is in view already. */
  async function scrollToPlayer(): Promise<void> {
    await tick();
    if (!player) return;

    focusUnlessTyping(player);
    const top = Number.parseFloat(getComputedStyle(player).scrollMarginTop) || 0;
    if (player.getBoundingClientRect().top >= top) return;
    player.scrollIntoView({
      block: "start",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }

  function resolveCheck(correct: boolean): void {
    if (correct) checksRight += 1;
    checkAt += 1;
  }

  function replay(lineId: string | undefined, onEnded: () => void): void {
    const index = sceneLines.findIndex((line) => line.id === lineId);
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
    const line = sceneLines[index];

    if (!line) {
      phase = "done";
      stage?.foldUmbrellas();
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
    if (listenFirst && sceneLines[index + 1]) {
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
    // The one Alex talks with walks onto the square as the talk begins.
    if (scene.talk && phase === "ready" && at === 0) stage?.arrive(scene.talk.who, 1);
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

  /**
   * Alex's line is in: the reply picked, when the talk branches on it. The
   * talk takes that way, and the stage restages before the line plays.
   */
  async function answered(
    firstTry: boolean,
    heard = false,
    choice?: string,
  ): Promise<void> {
    if (!heard) playAnswerSfx("correct");
    window.clearTimeout(answerTimer);
    const node = turnNode;
    if (node && choice !== undefined) {
      picks = { ...picks, [node.id]: Number(choice) };
      await tick();
    }
    if (!heard) stepAdaptive(firstTry);
    firstTries = { ...firstTries, [at]: firstTry };
    phase = "playing";
    const index = at;
    say(index, () => advance(index));
  }

  /** Adaptive moves on a step after a run of lines right the first time, and back one after a slip. */
  function stepAdaptive(firstTry: boolean): void {
    if (turnKind !== "adaptive") return;
    if (!firstTry) {
      adaptiveRun = 0;
      adaptiveStep = Math.max(0, adaptiveStep - 1);
      return;
    }
    adaptiveRun += 1;
    if (adaptiveRun < STEP_UP_AFTER) return;
    adaptiveRun = 0;
    adaptiveStep = Math.min(adaptiveStep + 1, recordable ? 2 : 1);
  }

  /**
   * A line that does not fit, said in a bubble. The one spoken to takes it
   * as they would: in a talk, a laugh, a puzzled look or a stiffening, then
   * their answer to it; otherwise a moment's thought.
   */
  function missed(said: string, choice?: string): void {
    const line = sceneLines[at];
    if (!line) return;

    playAnswerSfx("incorrect");
    stage?.say(line.characterId, said);
    const listener = scene.talk?.who ?? direction.stagings[at]?.addressee;
    const miss =
      choice === undefined ? undefined : turnNode?.replies?.[Number(choice)]?.miss;
    if (!listener) return;

    stage?.gesture(listener, miss?.reaction ?? "think");
    const answer = miss?.answer;
    if (!answer) return;

    window.clearTimeout(answerTimer);
    answerTimer = window.setTimeout(() => {
      stage?.say(listener, answer.slovak);
      if (answer.src) playStoryLineAudio(answer.src, answer.slovak);
    }, ANSWER_DELAY_MS);
  }

  /** In a talk, which of the replies that fit Alex will build or say. */
  function chooseIntent(index: number): void {
    if (turnNode) picks = { ...picks, [turnNode.id]: index };
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
    stepAdaptive(true);
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

  function startFind(again = false): void {
    window.clearTimeout(findTimer);
    findRound = again ? findRound + 1 : 0;
    // Only what the stage shows: a phone slices off the ends of the room.
    const { height, width } = stage?.size() ?? { height: 0, width: 0 };
    queue = shuffledTiles(
      thingsInView(direction.things, scene.setting, width, height).map(({ id }) => id),
      `${scene.id}-${findRound}`,
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
      findNote = {
        english: tapped ? findEnglish(tapped, "wrong") : "",
        tone: "wrong",
        text: tapped ? thatIs(tapped) : "",
      };
      stage?.light(id);
      if (who) stage?.gesture(who, "shake");
      return;
    }

    playAnswerSfx("correct");
    results = { ...results, [id]: missedTarget ? "later" : "first" };
    if (!missedTarget) streak += 1;
    findNote = {
      english: findEnglish(target, "right"),
      tone: "right",
      text: "Áno!",
      why: findWhy(target, findAsk),
    };
    if (who) stage?.gesture(who, "nod");
    nextThing();
  }

  function showThing(): void {
    const target = findTarget;
    if (!target || (findNote && findNote.tone !== "wrong")) return;

    results = { ...results, [target.id]: "shown" };
    streak = 0;
    findNote = {
      english: findEnglish(target, "shown"),
      tone: "shown",
      text: hereIs(target),
      why: findWhy(target, findAsk),
    };
    stage?.light(target.id);
    nextThing();
  }

  function hiddenLine(index: number): boolean {
    const line = sceneLines[index];
    return mode === "play" && Boolean(line?.learner) && !(index in firstTries);
  }

  function inOrder(things: readonly SceneThing[]): SceneThing[] {
    return queue.flatMap((id) => things.filter((thing) => thing.id === id));
  }
</script>

{#snippet answerKinds()}
  <div class="flex flex-wrap gap-2" role="group" aria-label="How to answer">
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
{/snippet}

{#snippet sceneLink(
  name: string,
  english: string | undefined,
  current: boolean,
  onclick: () => void,
)}
  <li class="min-w-0">
    <button
      class={cx(
        "block h-full w-full cursor-pointer rounded-(--control-radius) border-0 px-3 py-2.5 text-left",
        "transition-colors duration-150 ease-out hover:bg-blue-50/50",
        current ? "bg-blue-50/70" : "bg-transparent",
      )}
      type="button"
      aria-current={current ? "true" : undefined}
      {onclick}
    >
      <span
        class={cx(
          "block font-serif text-base leading-snug",
          current ? "font-semibold text-slate-900" : "text-slate-800",
        )}
        lang="sk"
      >
        {name}
      </span>
      {#if english}
        <span class="block text-sm leading-snug text-slate-500">{english}</span>
      {/if}
    </button>
  </li>
{/snippet}

<main class="py-12 pb-24 max-[600px]:py-8">
  <PageShell class="max-w-[1040px]">
    <header class="max-w-[680px]">
      <h1 class="m-0 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Scenes
      </h1>
      <Lead class="mt-3">
        Prototype. Watch a dialogue with each word lit as it is said, take Alex's part, or
        find things in the scene by their Slovak names.
      </Lead>
    </header>

    <section
      bind:this={player}
      class="mt-8 scroll-mt-24 focus-visible:outline-none max-[800px]:scroll-mt-[136px]"
      aria-labelledby="scene-title"
      tabindex="-1"
    >
      <div class="flex items-start justify-between gap-4">
        <h2
          id="scene-title"
          class="m-0 pt-0.5 font-serif text-2xl tracking-tight text-pretty text-slate-900"
          lang="sk"
        >
          {scene.name}
        </h2>

        <SceneSettings class="-mr-2" {settings} />
      </div>

      <div class="mt-3 flex flex-wrap gap-2" role="group" aria-label="Mode">
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

      <div class="{panelClass} mt-3 overflow-hidden">
        <StickStage
          bind:this={stage}
          class="border-b border-slate-200"
          {direction}
          {found}
          {lines}
          {mood}
          onthing={mode === "find" ? tapThing : undefined}
          setting={scene.setting}
          {thingWords}
        />

        <!-- The dialogue box: whose line it is sits on its top edge, as in a dialogue game. -->
        <div class="relative px-5 pt-6 pb-5 sm:px-6">
          {#if tag}
            <span
              class={cx(
                "absolute -top-3.5 left-5 inline-flex items-center rounded-(--control-radius) bg-surface px-2.5 py-1 sm:left-6",
                "text-sm font-semibold shadow-(--shadow-border) ring-1 ring-slate-200",
                STICK_NAME_CLASSES[tag.characterId] ?? "text-slate-600",
              )}
            >
              {tag.name}
            </span>
          {/if}

          {#if mode === "find"}
            {#if findTarget}
              {@const prompt = findPrompt(findTarget, findAsk)}

              <p class={eyebrowMutedClass}>Tap it in the scene</p>
              {#key prompt.slovak}
                <p
                  class="m-0 mt-1 animate-rise font-serif text-3xl text-slate-900 max-[600px]:text-2xl"
                  lang="sk"
                >
                  <MarkedText text={prompt.slovak} marks={prompt.marks} />
                </p>
              {/key}

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
                  <span class="mr-1 ml-1.5 text-slate-600">{findNote.english}</span>
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
              <div class="animate-rise">
                <p class="m-0 font-serif text-2xl text-slate-900">
                  {firstTaps} of {queue.length} found on the first tap.
                </p>
                <p class="m-0 mt-2 text-sm leading-relaxed text-pretty text-slate-600">
                  After <span class="font-serif text-base" lang="sk">ukáž na</span> a noun
                  is in the accusative,
                  <span class="font-serif text-base" lang="sk">akuzatív</span>: the case
                  that answers
                  <span class="font-serif text-base" lang="sk">Koho? Čo?</span>, whom?
                  what? Some nouns change their ending for it, and the rest stay the same.
                </p>

                <ul
                  class="m-0 mt-3 list-none divide-y divide-slate-200 rounded-(--control-radius) p-0 ring-1 ring-slate-200 ring-inset"
                >
                  {#each inOrder(direction.things) as thing (thing.id)}
                    <li class="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 px-3 py-2">
                      <span class="font-serif text-base text-slate-900" lang="sk">
                        {thing.word}
                        {#if formChanges(thing)}
                          <span class="text-slate-400" aria-hidden="true">→</span>
                          <span class="text-emerald-700">{accusativeOf(thing)}</span>
                        {/if}
                      </span>
                      <span class="text-sm text-slate-600">{thing.english}</span>
                      <span class="text-sm text-slate-500">{accusativeRule(thing)}</span>
                    </li>
                  {/each}
                </ul>

                <div class="mt-4 flex flex-wrap items-center gap-x-2 gap-y-2">
                  {#if nextScene}
                    <Button class="mr-2" variant="accent" onclick={goNext}>
                      <SceneIcon name="next" />
                      <span>Next scene: <span lang="sk">{nextScene.name}</span></span>
                    </Button>
                    <SceneAction icon="replay" onclick={() => startFind(true)}>
                      Play again
                    </SceneAction>
                  {:else}
                    <Button variant="accent" onclick={() => startFind(true)}>
                      <SceneIcon name="replay" />
                      Play again
                    </Button>
                  {/if}
                </div>
              </div>
            {:else}
              <p class="m-0 text-slate-600">Nothing to find in this place yet.</p>
            {/if}
          {:else if turn}
            {@const pick = turnNode ? (picks[turnNode.id] ?? defaultReply(turnNode)) : 0}
            <!-- In a talk the English is the reply chosen below when there is a choice of them. -->
            {@const english =
              scene.talk && (turnNow === "pick" || intents.length > 1)
                ? undefined
                : turn.english}

            {#if scene.talk && answering}
              <div class="mb-5 border-b border-slate-200 pb-4">
                <SceneCaption
                  cue={captionCue}
                  english={answering.english}
                  marks={answering.marks}
                  plan={direction.plans[shown]}
                  playing={speaking}
                  {showEnglish}
                  slovak={answering.slovak}
                  things={direction.things}
                />
              </div>
            {/if}

            {#if turnNow !== "pick" && intents.length > 1}
              <div class="mb-4" role="group" aria-label="What to say">
                <p class={eyebrowMutedClass}>What do you want to say?</p>
                <div class="mt-2 flex flex-wrap gap-2">
                  {#each intents as intent (intent.index)}
                    <button
                      class={chipClass(intent.index === pick)}
                      type="button"
                      aria-pressed={intent.index === pick}
                      onclick={() => chooseIntent(intent.index)}
                    >
                      {intent.english}
                    </button>
                  {/each}
                </div>
              </div>
            {/if}

            {#key `${at}-${pick}-${turnNow}`}
              {#if turnNow === "say"}
                <SceneSay
                  aside={answerKinds}
                  {english}
                  marks={turn.marks}
                  onhear={hearFirst}
                  ontake={useTake}
                  {showEnglish}
                  slovak={turn.slovak}
                  speaker={turn.speaker}
                />
              {:else}
                <SceneTurn
                  aside={answerKinds}
                  {english}
                  id={turn.id}
                  ondone={(firstTry, choice) => void answered(firstTry, false, choice)}
                  onmiss={missed}
                  sayChoices={turnNow !== "pick"
                    ? undefined
                    : turnNode
                      ? replyChoices(turnNode)
                      : turn.sayChoices}
                  slovak={turn.slovak}
                />
              {/if}
            {/key}

            <SceneAction class="mt-3 -ml-2.5" icon="listen" onclick={hearIt}>
              {turnNow === "say"
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
                replayLine={sceneLines.find((line) => line.id === check.replayLineId)}
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

              {#if scene.talk && scored}
                {@const said = sceneLines.flatMap((line, index) =>
                  line.learner ? [{ index, line }] : [],
                )}

                <p class="{eyebrowMutedClass} mt-4">What {learnerName} said</p>
                <ol
                  class="m-0 mt-2 grid list-none gap-1 rounded-(--control-radius) p-3 ring-1 ring-slate-200 ring-inset"
                >
                  {#each said as { index, line } (index)}
                    <li class="flex flex-wrap items-baseline gap-x-2.5">
                      <span
                        class={cx(
                          "font-serif text-base",
                          firstTries[index] === false
                            ? "text-rose-800"
                            : "text-slate-900",
                        )}
                        lang="sk"
                      >
                        {line.slovak}
                      </span>
                      <span class="text-sm text-slate-500">{line.english}</span>
                    </li>
                  {/each}
                </ol>
                {#if said.some(({ index }) => firstTries[index] === false)}
                  <p class="m-0 mt-2 text-sm text-slate-600">
                    The lines that took another try are red.
                  </p>
                {/if}
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
                {#each doneActions as action, index (action.label)}
                  {#if index === 0}
                    <Button class="mr-2" variant="accent" onclick={action.run}>
                      <SceneIcon name={action.icon} />
                      <span>
                        {action.label}{#if action.slovak}:
                          <span lang="sk">{action.slovak}</span>{/if}
                      </span>
                    </Button>
                  {:else}
                    <SceneAction icon={action.icon} onclick={action.run}>
                      {action.label}
                    </SceneAction>
                  {/if}
                {/each}
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
              things={direction.things}
            />
          {:else}
            <div class="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
              <div class="min-w-0">
                {#if scene.intro}
                  <p class="m-0 font-serif text-2xl text-slate-900" lang="sk">
                    {scene.intro.slovak}
                  </p>
                  {#if showEnglish}
                    <p class="m-0 mt-1 text-base text-slate-600">{scene.intro.english}</p>
                  {/if}
                {:else}
                  <p class="m-0 font-serif text-2xl text-slate-900">
                    {PLACES[scene.setting]}: {listOf(castNames)}.
                  </p>
                {/if}
                <p class="m-0 mt-1 text-slate-600">
                  {#if mode === "play" && scene.talk}
                    The talk goes where your replies take it. It stops at each of
                    {learnerName}'s lines for you to
                    {TURNS.find(({ id }) => id === turnKind)?.task}.
                  {:else if mode === "play"}
                    The scene stops at each of {learnerName}'s lines for you to
                    {TURNS.find(({ id }) => id === turnKind)?.task}.
                  {:else if checks.length > 0}
                    Each word lights up as it is said. Then
                    {checks.length === 1 ? "a question" : `${checks.length} questions`} on what
                    you heard.
                  {:else}
                    Each word lights up as it is said. Tap a dotted word or anything in
                    the scene to see it.
                  {/if}
                </p>
              </div>

              {#if mode === "play"}
                {@render answerKinds()}
              {/if}
            </div>
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
        {:else if mode !== "find" && phase !== "turn" && phase !== "done"}
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
              Line {Math.min(at + 1, sceneLines.length)} of {sceneLines.length}
            </span>
          </div>
        {/if}
      </div>

      <!-- The questions are on what was heard, so the text waits until they are answered. -->
      {#if mode !== "find" && !checking}
        <div class="mt-3 flex justify-end">
          <TextLink
            aria-expanded={scriptOpen}
            onclick={() => {
              scriptOpen = !scriptOpen;
            }}
          >
            {scriptOpen ? "Hide the script" : "Show the script"}
          </TextLink>
        </div>

        {#if scriptOpen}
          <ol
            class="{panelClass} m-0 mt-3 list-none divide-y divide-slate-200 overflow-hidden p-0"
          >
            {#each sceneLines as line, index (line.id)}
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
                    <span
                      class="mt-0.5 block font-serif text-lg text-slate-900"
                      lang="sk"
                    >
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
      {/if}
    </section>

    <nav class="mt-12 grid gap-6" aria-label="All scenes">
      {#each groups as group (`${group.label}-${group.slovak}`)}
        <div>
          <h2 class="m-0 text-sm font-semibold text-slate-700">
            {group.label}
            {#if group.slovak}
              <span class="ml-1 font-serif text-slate-900" lang="sk">{group.slovak}</span>
            {/if}
          </h2>

          <ul
            class="{dataPanelClass} m-0 mt-2.5 grid list-none gap-1 p-1.5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {#each group.scenes as option (option.id)}
              {@render sceneLink(
                option.name,
                option.english,
                option.id === scene.id,
                () => openScene(option.id),
              )}
            {/each}
          </ul>
        </div>
      {/each}
    </nav>
  </PageShell>
</main>
