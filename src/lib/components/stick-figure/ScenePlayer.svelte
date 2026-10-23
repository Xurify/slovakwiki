<script lang="ts">
  import { onMount, tick, untrack } from "svelte";

  import { playAnswerSfx } from "$lib/audio/sfx";
  import {
    listedCharacters,
    type LessonCharacterId,
  } from "$lib/catalog/lessons/character-ids";
  import EpisodeCheck from "$lib/components/listening/EpisodeCheck.svelte";
  import { panelClass } from "$lib/components/ui/system-ui";
  import {
    STORY_PREFS_CHANGE_EVENT,
    getStoryShowEnglish,
    setStoryShowEnglish,
  } from "$lib/lesson-story/prefs";
  import { playStoryLineAudio } from "$lib/lesson-story/story-audio";
  import {
    ambienceFor,
    playAmbience,
    type AmbiencePlayer,
  } from "$lib/stick-figure/ambience";
  import { thingsInView } from "$lib/stick-figure/backdrop-geometry";
  import { FindRound } from "$lib/stick-figure/find-round.svelte";
  import { PLACES, thingsIn } from "$lib/stick-figure/places";
  import { PlayTurns } from "$lib/stick-figure/play-turns.svelte";
  import { canRecord } from "$lib/stick-figure/recorder";
  import { directScene } from "$lib/stick-figure/scene-direction";
  import type { Scene } from "$lib/stick-figure/scene-line";
  import { sceneMood, type SceneMood } from "$lib/stick-figure/scene-mood";
  import { ScenePlayback } from "$lib/stick-figure/scene-playback.svelte";
  import { walkTalk } from "$lib/stick-figure/talk";
  import type { Take } from "$lib/stick-figure/take";
  import { cx } from "$lib/ui/classes";
  import ChipGroup from "./ChipGroup.svelte";
  import FindPanel from "./FindPanel.svelte";
  import PlaybackBar from "./PlaybackBar.svelte";
  import PlayTurn from "./PlayTurn.svelte";
  import SceneAction from "./SceneAction.svelte";
  import SceneCaption from "./SceneCaption.svelte";
  import SceneDone, { type DoneAction } from "./SceneDone.svelte";
  import SceneScript from "./SceneScript.svelte";
  import SceneSettings, { type SceneSetting } from "./SceneSettings.svelte";
  import StickStage from "./StickStage.svelte";
  import { STICK_NAME_CLASSES } from "./stick-figure-ui";

  /** Ways to take a scene. */
  type Mode = "watch" | "play" | "find";

  /**
   * One scene on the stage with its dialogue box: watch it, take Alex's
   * part, or find things in it. The page around it picks the scene.
   */
  let {
    next,
    onnext,
    scene,
    thingWords = {},
  }: {
    /** The scene after this one in its group: the podcast's next segment. */
    next?: Scene;
    onnext?: () => void;
    scene: Scene;
    /** Dictionary link and clip for a scene thing's word, keyed by the word. */
    thingWords?: Record<string, { href?: string; src?: string }>;
  } = $props();

  /** After a slip, before the one spoken to answers it, so Alex's bubble is read first. */
  const ANSWER_DELAY_MS = 900;

  const characters = listedCharacters();

  let mode = $state<Mode>("watch");
  let takes = $state<Record<number, Take>>({});
  /** Alex's lines in the learner's recordings instead of Alex's clips. */
  let ownVoice = $state(false);
  let ambient = $state(false);
  let ambience: AmbiencePlayer | undefined;
  let showEnglish = $state(false);
  let slower = $state(false);
  let listenFirst = $state(false);
  let scriptOpen = $state(false);
  let checkAt = $state(0);
  let checksRight = $state(0);
  let stage = $state<ReturnType<typeof StickStage>>();
  let answerTimer = 0;

  const turns = new PlayTurns();
  const playback = new ScenePlayback({
    lines: () => sceneLines,
    stage: () => stage,
    holdsAt: (index) => unanswered(index),
    takeAt: (index) => {
      const take = ownVoice ? takes[index] : undefined;
      return take && { plan: dubbed.lines[index].plan, src: take.src };
    },
    rate: () => (slower ? 0.75 : 1),
    listenFirst: () => listenFirst,
    // The one Alex talks with walks onto the square as the talk begins.
    onStart: () => {
      if (scene.talk) stage?.arrive(scene.talk.who, 1);
    },
    onEnd: () => {
      if (mode === "play") cheer();
    },
  });
  const find = new FindRound({
    things: () => direction.things,
    stage: () => stage,
    asker: () => direction.cast.find((id) => !entering.has(id)),
    onEnd: () => cheer(),
  });

  const checks = $derived(scene.checks ?? []);
  /** A talk walked along Alex's picks: its lines, and which node each of his turns answers. */
  const walked = $derived(
    scene.talk ? walkTalk(scene.talk.nodes, turns.picks) : undefined,
  );
  const sceneLines = $derived(walked?.lines ?? scene.lines);
  const direction = $derived(directScene(sceneLines, scene.setting, scene.order));
  /** The same scene timed to the learner's takes, for the lines they recorded. */
  const dubbed = $derived(
    Object.keys(takes).length === 0
      ? direction
      : directScene(
          sceneLines.map((line, index) => {
            const take = takes[index];
            return take
              ? { ...line, mouth: take.mouth, src: take.src, vowels: undefined }
              : line;
          }),
          scene.setting,
          scene.order,
        ),
  );
  /** Who walks on during the scene, so is not there when it starts. */
  const entering = $derived(
    new Set(
      direction.lines.flatMap(({ staging: { enter } }) =>
        enter ? [enter.characterId] : [],
      ),
    ),
  );
  const takeCount = $derived(Object.keys(takes).length);
  const mood = $derived.by((): SceneMood => {
    const told = sceneMood(
      sceneLines.map((line) => line.slovak),
      // Past the last line once it is over, where the rain has let up.
      playback.phase === "done"
        ? sceneLines.length
        : playback.shown >= 0
          ? playback.shown
          : playback.at,
    );
    return { ...told, time: scene.time ?? told.time };
  });
  const soundscape = $derived(ambienceFor(scene.setting, mood));
  const soundKey = $derived(JSON.stringify(soundscape));
  const checking = $derived(playback.phase === "done" && checkAt < checks.length);
  const caption = $derived(playback.shown >= 0 ? sceneLines[playback.shown] : undefined);
  const turn = $derived(playback.phase === "turn" ? sceneLines[playback.at] : undefined);
  /** The talk node Alex's turn answers, when the scene branches. */
  const turnNode = $derived(
    playback.phase === "turn" ? walked?.turns.get(playback.at) : undefined,
  );
  /** In a talk, at Alex's turn: what the other person has just said, which he answers. */
  const answering = $derived(caption && !caption.learner ? caption : undefined);
  /** Whose name sits on the dialogue box: the speaker of the line showing, or Alex at his turn. */
  const tag = $derived.by(
    (): { characterId: LessonCharacterId; name: string } | undefined => {
      if (mode === "find" || checking || playback.phase === "done") return undefined;
      // In a talk, the box keeps the other person's line over Alex's replies.
      const line = turn && scene.talk && answering ? answering : (turn ?? caption);
      // A board or a notice has nobody on stage saying it, so no name goes on the box.
      return line?.characterId
        ? { characterId: line.characterId, name: line.speaker }
        : undefined;
    },
  );
  const learnerCount = $derived(sceneLines.filter((line) => line.learner).length);
  const learnerName = $derived(
    sceneLines.find((line) => line.learner)?.speaker ?? "Alex",
  );
  const findable = $derived(direction.things.length > 0);
  /** Taking Alex's part needs Alex in the scene, and finding things needs things. */
  const modes = $derived([
    { id: "watch" as const, label: "Watch" },
    ...(learnerCount > 0
      ? [{ id: "play" as const, label: `Play as ${learnerName}` }]
      : []),
    ...(findable ? [{ id: "find" as const, label: "Find it" }] : []),
  ]);
  /** The things the dialogue names, in the order it names them. */
  const sceneWords = $derived(
    [
      ...new Set(
        direction.lines.flatMap(({ plan }) =>
          plan.beats.flatMap(({ point }) =>
            point?.target.kind === "thing" ? [point.target.id] : [],
          ),
        ),
      ),
    ].flatMap((id) => direction.things.filter((thing) => thing.id === id)),
  );
  const scored = $derived(mode === "play" && learnerCount > 0);
  const score = $derived.by(() => {
    if (checks.length > 0) return `${checksRight} of ${checks.length} answered right.`;
    if (!scored) return undefined;
    if (turns.kind === "say") {
      return `You said ${takeCount} of ${learnerName}'s ${learnerCount} ${learnerCount === 1 ? "line" : "lines"}.`;
    }
    return `${turns.firstTryCount} of ${learnerCount} of ${learnerName}'s lines right the first time.`;
  });
  /** In a talk, what Alex said, and which lines took another try. */
  const said = $derived(
    scene.talk && scored
      ? sceneLines.flatMap((line, index) =>
          line.learner ? [{ firstTry: turns.firstTries[index], line }] : [],
        )
      : [],
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
          {
            description: "Lines play at three-quarter speed",
            label: "Slower",
            on: slower,
            ontoggle: () => {
              slower = !slower;
            },
          },
          {
            description:
              "Hear each line before you read it, then go on when you are ready",
            label: "Listen first",
            on: listenFirst,
            ontoggle: () => {
              listenFirst = !listenFirst;
            },
          },
        ]),
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
      run: playFromTheTop,
    };
    const onward: DoneAction[] =
      next && onnext
        ? [
            {
              icon: "next",
              label: checks.length > 0 ? "Next segment" : "Next scene",
              run: onnext,
              slovak: next.name,
            },
          ]
        : [];
    const findThings: DoneAction[] = findable
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
        ...findThings,
        ...onward,
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
    // A podcast goes on segment by segment; a lesson scene takes each way in turn.
    const ahead =
      checks.length > 0
        ? [...onward, ...findThings]
        : [...play, ...findThings, ...onward];
    const missed = mode === "play" && turns.firstTryCount < learnerCount;

    return missed || ahead.length === 0
      ? [again, ...voice, ...ahead]
      : [ahead[0], again, ...voice, ...ahead.slice(1)];
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

  // Another scene starts from its top, without the last one's recordings.
  $effect(() => {
    void scene.id;
    untrack(() => {
      reset();
      dropTakes();
      // A talk is there to be played: watching it only shows one way through.
      if (scene.talk) mode = "play";
      if (mode === "play" && learnerCount === 0) mode = "watch";
      if (mode === "find" && !findable) mode = "watch";
      if (mode === "find") startFind();
    });
  });

  onMount(() => {
    turns.recordable = canRecord();
    showEnglish = getStoryShowEnglish() === "on";
    const sync = () => {
      showEnglish = getStoryShowEnglish() === "on";
    };
    window.addEventListener(STORY_PREFS_CHANGE_EVENT, sync);
    return () => window.removeEventListener(STORY_PREFS_CHANGE_EVENT, sync);
  });

  /** Play the scene, unless it is a round of Find it: the next scene starts this way. */
  export function start(): void {
    if (mode !== "find") playback.play();
  }

  /** The same scene again from its top. */
  export function restart(): void {
    reset();
    stage?.place(0);
    if (mode === "find") startFind();
  }

  function listOf(names: readonly string[]): string {
    if (names.length < 2) return names.join("");
    return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
  }

  function reset(): void {
    playback.reset();
    turns.reset();
    find.stop();
    find.note = undefined;
    window.clearTimeout(answerTimer);
    checkAt = 0;
    checksRight = 0;
  }

  function dropTakes(): void {
    for (const take of Object.values(takes)) URL.revokeObjectURL(take.src);
    takes = {};
    ownVoice = false;
  }

  function selectMode(next: Mode): void {
    reset();
    stage?.place(0);
    mode = next;
    if (next === "find") startFind();
  }

  function playFromTheTop(): void {
    reset();
    stage?.place(0);
    playback.play();
  }

  function playAlex(): void {
    selectMode("play");
    playback.play();
  }

  function recordAgain(): void {
    dropTakes();
    playAlex();
  }

  function watchWith(own: boolean): void {
    selectMode("watch");
    ownVoice = own;
    playback.play();
  }

  /** The learner's line `index`, while they have still to say it. */
  function unanswered(index: number): boolean {
    return (
      mode === "play" &&
      Boolean(sceneLines[index]?.learner) &&
      !(index in turns.firstTries)
    );
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
    playback.replay(index, onEnded);
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
      turns.choose(node.id, Number(choice));
      await tick();
    }
    turns.answered(playback.at, firstTry, heard);
    playback.answered();
  }

  /**
   * A line that does not fit, said in a bubble. The one spoken to takes it
   * as they would: in a talk, a laugh, a puzzled look or a stiffening, then
   * their answer to it; otherwise a moment's thought.
   */
  function missed(said: string, choice?: string): void {
    const line = sceneLines[playback.at];
    if (!line?.characterId) return;

    playAnswerSfx("incorrect");
    stage?.say(line.characterId, said);
    const listener = scene.talk?.who ?? direction.lines[playback.at]?.staging.addressee;
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

  function useTake(take: Take): void {
    takes = { ...takes, [playback.at]: take };
    ownVoice = true;
    turns.answered(playback.at, true);
    playback.answered();
  }

  function toggleEnglish(): void {
    // Saving the setting fires the change event, whose listener already sets
    // showEnglish; flipping it again here would undo that.
    const next = !showEnglish;
    setStoryShowEnglish(next ? "on" : "off");
    showEnglish = next;
  }

  function startFind(again = false): void {
    // Only what the stage shows: a phone slices off the ends of the room.
    const { height, width } = stage?.size() ?? { height: 0, width: 0 };
    const shown = thingsInView(
      thingsIn(direction.things, scene.setting, mood),
      scene.setting,
      width,
      height,
    );
    find.start(
      shown.map(({ id }) => id),
      scene.id,
      again,
    );
  }

  /** Everyone on stage at the end of a round: arms up for a clean one, a wave otherwise. */
  function cheer(): void {
    const clean =
      mode === "find"
        ? find.firstTaps === find.queue.length
        : learnerCount > 0 && turns.firstTryCount === learnerCount;
    for (const id of direction.cast) {
      if (mode === "find" && entering.has(id)) continue;
      stage?.gesture(id, clean ? "cheer" : "wave");
    }
  }
</script>

{#snippet heard()}
  {#if answering}
    <SceneCaption
      cue={playback.cue}
      english={answering.english}
      marks={answering.marks}
      plan={direction.lines[playback.shown]?.plan}
      playing={playback.speaking}
      {showEnglish}
      slovak={answering.slovak}
      things={direction.things}
    />
  {/if}
{/snippet}

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

<ChipGroup
  class="mt-3"
  label="Mode"
  onselect={selectMode}
  options={modes}
  selected={mode}
/>

<div class="{panelClass} mt-3 overflow-hidden">
  <StickStage
    bind:this={stage}
    class="border-b border-slate-200"
    {direction}
    found={find.found}
    lines={sceneLines}
    {mood}
    onthing={mode === "find" ? (id) => find.tap(id) : undefined}
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
      <FindPanel
        next={next?.name}
        {onnext}
        onagain={() => startFind(true)}
        round={find}
        things={direction.things}
      />
    {:else if turn}
      {#key playback.at}
        <PlayTurn
          heard={scene.talk && answering ? heard : undefined}
          node={turnNode}
          onanswer={(firstTry, choice) => void answered(firstTry, false, choice)}
          onhear={() => void answered(false, true)}
          onhearfirst={() => playback.hear(playback.at)}
          onmiss={missed}
          ontake={useTake}
          {showEnglish}
          {turn}
          {turns}
        />
      {/key}
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
          stopReplay={() => playback.halt()}
          total={checks.length}
        />
      {/key}
    {:else if playback.phase === "done"}
      <SceneDone
        actions={doneActions}
        href={scene.href}
        hrefLabel={scene.hrefLabel}
        {learnerName}
        {said}
        {score}
        {thingWords}
        words={sceneWords}
      />
    {:else if caption}
      <SceneCaption
        cue={playback.cue}
        english={caption.english}
        {listenFirst}
        marks={caption.marks}
        onthing={(id) => stage?.light(id)}
        plan={(ownVoice && takes[playback.shown] ? dubbed : direction).lines[
          playback.shown
        ]?.plan}
        playing={playback.speaking}
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
              {PLACES[scene.setting].label}: {listOf(castNames)}.
            </p>
          {/if}
          <p class="m-0 mt-1 text-slate-600">
            {#if mode === "play" && scene.talk}
              The talk goes where your replies take it. It stops at each of
              {learnerName}'s lines for you to {turns.task}.
            {:else if mode === "play"}
              The scene stops at each of {learnerName}'s lines for you to {turns.task}.
            {:else if checks.length > 0}
              Each word lights up as it is said. Then
              {checks.length === 1 ? "a question" : `${checks.length} questions`} on what you
              heard.
            {:else}
              Each word lights up as it is said. Tap a dotted word or anything in the
              scene to see it.
            {/if}
          </p>
        </div>

        {#if mode === "play"}
          <ChipGroup
            label="How to answer"
            onselect={(id) => {
              turns.kind = id;
            }}
            options={turns.kinds}
            selected={turns.kind}
          />
        {/if}
      </div>
    {/if}
  </div>

  {#if mode === "find" && find.target}
    <div
      class="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-200 px-5 py-3 sm:px-6"
    >
      <SceneAction class="-ml-2.5" icon="find" onclick={() => find.show()}
        >Show me</SceneAction
      >
      {#if find.streak > 1}
        <span class="ml-auto animate-rise text-sm font-semibold text-emerald-700">
          {find.streak} in a row
        </span>
      {/if}
      <span class={cx("text-sm text-slate-500", find.streak < 2 && "ml-auto")}>
        {Object.keys(find.results).length} of {find.queue.length}
      </span>
    </div>
  {:else if mode !== "find" && playback.phase !== "turn" && playback.phase !== "done"}
    <PlaybackBar
      count={sceneLines.length}
      {learnerName}
      {listenFirst}
      onplay={() => playback.play()}
      ontogglevoice={() => {
        ownVoice = !ownVoice;
      }}
      {ownVoice}
      {playback}
      voiced={mode === "watch" && takeCount > 0}
    />
  {/if}
</div>

<!-- The questions are on what was heard, so the text waits until they are answered. -->
{#if mode !== "find" && !checking}
  <SceneScript
    bind:open={scriptOpen}
    hidden={unanswered}
    lines={sceneLines}
    onpick={(index) => playback.startAt(index)}
    shown={playback.shown}
    {showEnglish}
  />
{/if}
