<script lang="ts" module>
  import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";
  import type { LessonSceneArtId } from "$lib/lesson-story/story-settings";
  import type { StickGestureId } from "$lib/stick-figure/gestures";
  import type { StickPropId } from "$lib/stick-figure/props";

  export interface StickLabLine {
    characterId: LessonCharacterId;
    english: string;
    gestures?: StickGestureId[];
    id: string;
    /** Loudness track of the clip (`content/audio/mouth.json`). */
    mouth?: string;
    props?: Array<StickPropId | null>;
    slovak: string;
    speaker: string;
    src?: string;
    /** Who the line is said to, when it is not the person it replies to. */
    to?: LessonCharacterId;
    /** Aligned vowel per mouth frame. */
    vowels?: string;
  }

  /** Dictionary links for a scene thing's word, where the dictionary has it. */
  export interface StickThingWord {
    href?: string;
    /** The lemma clip. */
    src?: string;
  }

  export interface StickLabScene {
    id: string;
    lines: StickLabLine[];
    /** Where it plays: picks the drawn backdrop and the painted lesson plate. */
    setting: LessonSceneArtId;
    title: string;
  }
</script>

<script lang="ts">
  import { untrack } from "svelte";

  import {
    characterIdForSpeaker,
    listedCharacters,
  } from "$lib/catalog/lessons/character-ids";
  import AudioButton from "$lib/audio/AudioButton.svelte";
  import { nounGenderLabel } from "$lib/catalog/types";
  import Button from "$lib/components/ui/Button.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";
  import {
    chipClass,
    eyebrowMutedClass,
    panelClass,
    tagClass,
  } from "$lib/components/ui/system-ui";
  import {
    playStoryLineAudio,
    stopStoryLineAudio,
    storyAudioClock,
  } from "$lib/lesson-story/story-audio";
  import { dialogueSpeakerLabel } from "$lib/components/practice/dialogue-speaker";
  import { lessonSceneSrc } from "$lib/lesson-story/story-settings";
  import { STICK_GESTURE_IDS, gesturePeak } from "$lib/stick-figure/gestures";
  import {
    gesturePlan,
    planLine,
    reactionPlan,
    type LineBeat,
    type LinePlan,
    type PointTarget,
  } from "$lib/stick-figure/line-plan";
  import { decodeMouthTrack, decodeVowelTrack } from "$lib/stick-figure/mouth-track";
  import {
    STICK_PROP_IDS,
    gesturesWithProps,
    heldProps,
    lineProps,
  } from "$lib/stick-figure/props";
  import { STICK_PICTURE_NAMES } from "$lib/stick-figure/pictures";
  import { REST_POSE } from "$lib/stick-figure/pose";
  import { solveRig, type Point } from "$lib/stick-figure/rig";
  import {
    SCENE_THINGS,
    aimAt,
    backdropAlign,
    backdropToStage,
    figureToStage,
    linePoints,
    thingCenter,
    thingWithDemonstrative,
  } from "$lib/stick-figure/scene-things";
  import { parseScript, sceneSnippet, stageName } from "$lib/stick-figure/script";
  import { stepsFor, walkDuration } from "$lib/stick-figure/walk";
  import {
    restFacing,
    stageLine,
    type CastFacing,
    type Facing,
    type StageReaction,
  } from "$lib/stick-figure/staging";
  import { cx } from "$lib/ui/classes";
  import StickBackdrop from "./StickBackdrop.svelte";
  import StickFigure from "./StickFigure.svelte";
  import StickFigureActor from "./StickFigureActor.svelte";

  interface ActorState {
    cue: number;
    plan?: LinePlan;
    talking: boolean;
  }

  /** Figure widths each figure stands from its mark. */
  type Offsets = Partial<Record<LessonCharacterId, number>>;

  /** A figure's slot as the stage lays it out, before any walk moves it. */
  interface Mark {
    left: number;
    top: number;
    width: number;
  }

  let {
    scenes,
    thingWords = {},
  }: {
    scenes: StickLabScene[];
    /** Keyed by the thing's word. */
    thingWords?: Record<string, StickThingWord>;
  } = $props();

  const SCRIPT_SCENE_ID = "script";
  /** How long a thing stays lit after a line names it. */
  const LIT_MS = 1600;
  const CARD_WIDTH = 220;
  /** Centre to centre, in figure widths, when one figure stands beside another to look at something. */
  const BESIDE_WIDTHS = 0.8;
  /** Where an arm leaves the body, and where a hand holds a prop out to show it, in rig space. */
  const SHOULDER: Point = { x: 0, y: solveRig(REST_POSE).leadShoulder.y };
  const SHOWN_HAND: Point = solveRig(gesturePeak("show")).leadArm.end;

  const PLACES: Array<{ id: LessonSceneArtId; label: string }> = [
    { id: "default", label: "Park" },
    { id: "plaza", label: "Square" },
    { id: "cafe", label: "Café" },
    { id: "home", label: "Home" },
    { id: "market", label: "Market" },
    { id: "registration", label: "Front desk" },
    { id: "classroom", label: "Classroom" },
  ];

  const characters = listedCharacters();

  const REACTION_COPY: Partial<Record<StickGestureId, string>> = {
    lean: "leans in",
    nod: "nods",
    show: "holds it up",
  };

  let sceneId = $state("");
  let activeLineId = $state<string | null>(null);
  let playingScene = $state(false);
  let actors = $state<Partial<Record<LessonCharacterId, ActorState>>>({});
  let benchCharacter = $state<LessonCharacterId>("anna");
  let bench = $state<ActorState>({ cue: 0, talking: false });
  let benchGesture = $state<StickGestureId | null>(null);
  let copied = $state(false);
  let painted = $state(false);
  let facings = $state<CastFacing>({});
  let offsets = $state<Offsets>({});
  let walks = $state<Partial<Record<LessonCharacterId, { cue: number; ms: number }>>>({});
  let stageEl = $state<HTMLDivElement>();
  const slots: Partial<Record<LessonCharacterId, HTMLDivElement>> = {};
  /** When each walk in flight ends, on the `performance.now()` clock. */
  let walkEndsAt: Partial<Record<LessonCharacterId, number>> = {};
  /** The line whose props are in hand: the one playing, or the last one played. */
  let heldAt = $state(-1);
  let lit = $state<string[]>([]);
  let picked = $state<string>();
  let stageWidth = $state(0);
  let stageHeight = $state(0);
  let benchProp = $state<StickPropId | undefined>();
  let scriptSetting = $state<LessonSceneArtId>("cafe");
  let tryLine = $state("Dobrý deň. Prepáčte, kde je stanica?");
  let scriptText = $state(
    [
      "Waiter: Dobrý deň. Dáte si kávu?",
      "Anna: Áno, prosím.",
      "Alex > Waiter: Ja si dám čaj.",
      "Anna: Pozri, to sú fotky z Kanady.",
      "Alex: Super! Kto je ten muž?",
      "Anna: To je môj brat Tom.",
      "Alex > Waiter: Prepáčte, koľko to stojí?",
      "Waiter: Štyri eurá päťdesiat.",
      "Alex: Ďakujem.",
      "Waiter: Nech sa páči. Prajem pekný deň!",
    ].join("\n"),
  );

  const script = $derived(parseScript(scriptText));
  const scriptScene = $derived<StickLabScene>({
    id: SCRIPT_SCENE_ID,
    lines: script.lines.map((line) => ({
      ...line,
      english: "",
      to: line.to ? characterIdForSpeaker(line.to) : undefined,
    })),
    setting: scriptSetting,
    title: "Your script",
  });
  const allScenes = $derived([...scenes, scriptScene]);
  const scene = $derived(
    allScenes.find((option) => option.id === sceneId) ?? allScenes[0],
  );
  const cast = $derived([
    ...new Set(
      scene.lines
        .filter((line) => dialogueSpeakerLabel(line.speaker))
        .map((line) => line.characterId),
    ),
  ]);
  const voicedCount = $derived(scene.lines.filter((line) => line.src).length);
  const trackedCount = $derived(scene.lines.filter((line) => line.mouth).length);
  const lineCues = $derived(
    scene.lines.map((line) => lineProps(line.slovak, line.props)),
  );
  const things = $derived(SCENE_THINGS[scene.setting] ?? []);
  const pickedThing = $derived(things.find((thing) => thing.id === picked));
  /** The word card sits under the thing, or over it when the thing is low on the stage. */
  const card = $derived.by(() => {
    if (!pickedThing) return undefined;

    const align = backdropAlign(scene.setting);
    const { box } = pickedThing;
    const top = backdropToStage(box, stageWidth, stageHeight, align);
    const bottom = backdropToStage(
      { x: box.x + box.width / 2, y: box.y + box.height },
      stageWidth,
      stageHeight,
      align,
    );
    const centre = backdropToStage(
      thingCenter(pickedThing),
      stageWidth,
      stageHeight,
      align,
    );
    const below = bottom.y + 8 < stageHeight * 0.55;

    return {
      below,
      left: Math.min(
        Math.max(8, centre.x - CARD_WIDTH / 2),
        Math.max(8, stageWidth - CARD_WIDTH - 8),
      ),
      y: below ? Math.max(8, bottom.y + 8) : Math.max(8, stageHeight - top.y + 8),
    };
  });
  const held = $derived(
    heldProps(
      scene.lines.map((line, index) => ({
        characterId: dialogueSpeakerLabel(line.speaker) ? line.characterId : null,
        props: lineCues[index],
      })),
    ),
  );
  const resting = $derived(restFacing(cast));
  const stagings = $derived(
    scene.lines.map((_, index, lines) =>
      stageLine(
        lines.map((line) => ({
          characterId: dialogueSpeakerLabel(line.speaker) ? line.characterId : null,
          props: line.props,
          slovak: line.slovak,
          to: line.to,
        })),
        index,
        cast,
        things,
      ),
    ),
  );
  const linePlans = $derived(
    new Map(
      scene.lines.map((line, index) => [
        line.id,
        planLine(line.slovak, {
          gestures: gesturesWithProps(lineCues[index], line.gestures),
          lips: line.vowels ? decodeVowelTrack(line.vowels) : undefined,
          points: dialogueSpeakerLabel(line.speaker)
            ? linePoints(line.slovak, things, stagings[index]?.looksAt)
            : [],
          track: line.mouth ? decodeMouthTrack(line.mouth) : undefined,
        }),
      ]),
    ),
  );
  const tryPlan = $derived(planLine(tryLine));

  let playToken = 0;
  let sceneTimer = 0;
  let lineTimer = 0;
  let benchTimer = 0;

  // A new scene, or an edit to the script, starts everyone where its first line finds them.
  $effect(() => {
    void stagings;
    untrack(() => placeStage(0));
  });

  /** "wave → self", with repeated talking beats said once. */
  function gestureSequence(plan: LinePlan | undefined): string {
    const gestures = plan?.beats.map((beat) => beat.gesture) ?? [];
    return gestures
      .filter((gesture, index) => gesture !== gestures[index - 1])
      .join(" → ");
  }

  function nameOf(id: LessonCharacterId): string {
    return characters.find((character) => character.id === id)?.displayName ?? id;
  }

  function reactionCopy(reaction: StageReaction): string {
    return `${nameOf(reaction.characterId)} ${REACTION_COPY[reaction.gesture] ?? reaction.gesture}`;
  }

  function pointCopy(target: PointTarget, index: number): string {
    if (target.kind === "prop") {
      const prop = held[index]?.[target.holder];
      return `Points at ${nameOf(target.holder)}'s ${prop ?? "hands"}`;
    }
    const thing = things.find((candidate) => candidate.id === target.id);
    return `Points at the ${thing?.word ?? target.id}`;
  }

  function selectScene(id: string): void {
    stop();
    actors = {};
    heldAt = -1;
    picked = undefined;
    lit = [];
    if (id === scene.id) placeStage(0);
    sceneId = id;
  }

  // Layout positions, not the drawn ones: a walk in flight moves the figure
  // with a transform, which offsetLeft leaves out.
  function markOf(id: LessonCharacterId): Mark | undefined {
    const slot = slots[id];
    if (!slot) return undefined;
    return { left: slot.offsetLeft, top: slot.offsetTop, width: slot.offsetWidth };
  }

  function standing(mark: Mark, offset = 0): Mark {
    return { ...mark, left: mark.left + offset * mark.width };
  }

  /** Walk a figure to `offset` figure widths from its mark, a step at a time. */
  function walkTo(id: LessonCharacterId, offset: number): void {
    const from = offsets[id] ?? 0;
    if (from === offset) return;

    const ms = walkDuration(stepsFor(offset - from));
    walks = { ...walks, [id]: { cue: (walks[id]?.cue ?? 0) + 1, ms } };
    offsets = { ...offsets, [id]: offset };
    // Reduced motion puts the figure there at once, so nobody waits on the walk.
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      walkEndsAt[id] = performance.now() + ms;
    }
  }

  /** Figure widths from a figure's mark to where it stands beside `to`, wherever `to` stands in `at`. */
  function beside(
    id: LessonCharacterId,
    to: LessonCharacterId,
    toward: Facing,
    at: Offsets = offsets,
  ): number {
    const mark = markOf(id);
    const other = markOf(to);
    if (!mark || !other) return toward * 0.5;

    const gap = (standing(other, at[to]).left - mark.left) / mark.width;
    return Math.abs(gap) > BESIDE_WIDTHS ? gap - Math.sign(gap) * BESIDE_WIDTHS : 0;
  }

  /** Figure widths from a figure's mark to just past the stage edge on that side. */
  function offStage(id: LessonCharacterId, direction: Facing): number {
    const mark = markOf(id);
    if (!mark || !stageEl) return direction * 4;

    const distance =
      direction > 0 ? stageEl.clientWidth - mark.left : mark.left + mark.width;
    return direction * (distance / mark.width + 0.1);
  }

  /** Where everyone stands and faces as line `index` begins, as if the scene had played to it. */
  function stageBefore(index: number): { facings: CastFacing; offsets: Offsets } {
    let placedFacings: CastFacing = {};
    const placed: Offsets = {};

    for (const { enter } of stagings) {
      if (enter) placed[enter.characterId] = offStage(enter.characterId, enter.from);
    }

    stagings.slice(0, index).forEach((staging, at) => {
      const speaker = scene.lines[at].characterId;
      placedFacings = { ...placedFacings, ...staging.facing };

      if (staging.enter) placed[staging.enter.characterId] = 0;
      if (staging.approach) {
        const { characterId, toward } = staging.approach;
        placed[characterId] = beside(characterId, speaker, toward, placed);
      }
      if (staging.exit) {
        placedFacings[speaker] = staging.exit;
        placed[speaker] = offStage(speaker, staging.exit);
      }
    });

    return { facings: placedFacings, offsets: placed };
  }

  /** Put everyone where line `index` finds them, without walking there. */
  function placeStage(index: number): void {
    const placed = stageBefore(index);
    facings = placed.facings;
    offsets = placed.offsets;
    walks = {};
    walkEndsAt = {};
  }

  /** Stage px of what a point aims at, as everyone stands now. */
  function targetOf(target: PointTarget): Point | undefined {
    if (target.kind === "thing") {
      const thing = things.find((candidate) => candidate.id === target.id);
      if (!thing || !stageEl) return undefined;
      return backdropToStage(
        thingCenter(thing),
        stageEl.clientWidth,
        stageEl.clientHeight,
        backdropAlign(scene.setting),
      );
    }

    const mark = markOf(target.holder);
    if (!mark) return undefined;
    const facing = facings[target.holder] ?? resting[target.holder] ?? 1;
    return figureToStage(SHOWN_HAND, standing(mark, offsets[target.holder]), facing);
  }

  /**
   * The plan with each point aimed from where the speaker stands, and the
   * way the first one turns them. A hand holding a prop leaves the pointing
   * to the other one.
   */
  function aimLine(
    id: LessonCharacterId,
    plan: LinePlan,
    holding: boolean,
  ): { facing?: Facing; plan: LinePlan } {
    const mark = markOf(id);
    const from = mark && figureToStage(SHOULDER, standing(mark, offsets[id]), 1);
    let facing: Facing | undefined;

    const beats = plan.beats.map((beat) => {
      const to = beat.point && targetOf(beat.point.target);
      if (!beat.point || !from || !to) return beat;

      const aim = aimAt(from, to);
      facing ??= aim.facing;
      return {
        ...beat,
        point: { ...beat.point, ...aim, hand: holding ? ("rear" as const) : undefined },
      };
    });

    return { facing, plan: { ...plan, beats } };
  }

  function light(id: string): void {
    lit = [...lit, id];
    window.setTimeout(() => {
      const at = lit.indexOf(id);
      if (at !== -1) lit = lit.toSpliced(at, 1);
    }, LIT_MS);
  }

  function onBeat(beat: LineBeat): void {
    if (beat.point?.target.kind === "thing") light(beat.point.target.id);
  }

  function stop(): void {
    playToken += 1;
    window.clearTimeout(sceneTimer);
    window.clearTimeout(lineTimer);
    stopStoryLineAudio();
    for (const actor of Object.values(actors)) actor.talking = false;
    playingScene = false;
    activeLineId = null;
  }

  function cueActor(id: LessonCharacterId, plan: LinePlan | undefined): void {
    actors[id] = { cue: (actors[id]?.cue ?? 0) + 1, plan, talking: true };
  }

  function playLine(line: StickLabLine, onDone?: () => void): void {
    playToken += 1;
    const token = playToken;

    const plan = linePlans.get(line.id);
    const index = scene.lines.findIndex((other) => other.id === line.id);
    const staging = stagings[index];
    heldAt = index;

    for (const actor of Object.values(actors)) actor.talking = false;
    facings = { ...facings, ...staging?.facing };
    if (dialogueSpeakerLabel(line.speaker) !== null && plan) {
      const aimed = aimLine(
        line.characterId,
        plan,
        Boolean(held[index]?.[line.characterId]),
      );
      if (aimed.facing) facings = { ...facings, [line.characterId]: aimed.facing };
      cueActor(line.characterId, aimed.plan);
    }
    if (staging?.approach) {
      const { characterId, toward } = staging.approach;
      walkTo(characterId, beside(characterId, line.characterId, toward));
    }
    if (staging?.enter) {
      const { characterId, from } = staging.enter;
      facings = { ...facings, [characterId]: from === 1 ? -1 : 1 };
      walkTo(characterId, 0);
    }

    for (const reaction of staging?.reactions ?? []) {
      const span = plan?.sentences[reaction.sentence];
      if (!plan || !span) continue;

      const at = span.start + (span.end - span.start) * reaction.at;
      cueActor(reaction.characterId, reactionPlan(plan, reaction.gesture, at));
    }
    activeLineId = line.id;

    const onEnded = () => {
      if (token !== playToken) return;

      for (const actor of Object.values(actors)) actor.talking = false;
      if (staging?.exit) {
        facings = { ...facings, [line.characterId]: staging.exit };
        walkTo(line.characterId, offStage(line.characterId, staging.exit));
      }
      onDone?.();
    };

    if (line.src) {
      playStoryLineAudio(line.src, line.slovak, { onEnded });
      return;
    }

    // No clip yet: run the line for its text-timed length on the wall clock.
    stopStoryLineAudio();
    window.clearTimeout(lineTimer);
    lineTimer = window.setTimeout(onEnded, plan?.durationMs ?? 1600);
  }

  function playScene(): void {
    stop();
    placeStage(0);
    playingScene = true;
    const lines = scene.lines;

    const step = (index: number): void => {
      const line = lines[index];

      if (!line) {
        playingScene = false;
        activeLineId = null;
        return;
      }

      // Someone still walking on gets to their mark before they speak.
      const walking = (walkEndsAt[line.characterId] ?? 0) - performance.now();
      if (walking > 0) {
        sceneTimer = window.setTimeout(() => step(index), walking);
        return;
      }

      playLine(line, () => {
        sceneTimer = window.setTimeout(() => step(index + 1), 450);
      });
    };

    step(0);
  }

  function copySnippet(): void {
    void navigator.clipboard?.writeText(sceneSnippet(script.lines)).then(() => {
      copied = true;
      window.setTimeout(() => {
        copied = false;
      }, 1500);
    });
  }

  function playBench(plan: LinePlan, gesture: StickGestureId | null = null): void {
    window.clearTimeout(benchTimer);
    benchGesture = gesture;
    bench = { cue: bench.cue + 1, plan, talking: true };
    benchTimer = window.setTimeout(() => {
      bench.talking = false;
    }, plan.durationMs);
  }
</script>

<main class="py-12 pb-24 max-[600px]:py-8">
  <PageShell class="max-w-[1040px]">
    <header class="max-w-[680px]">
      <h1 class="m-0 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Stick figures
      </h1>
      <Lead class="mt-3">
        Prototype. The lesson cast as SVG figures that gesture while their line plays. The
        gesture comes from the Slovak text and the mouth from the recording, so no line
        needs hand animation. Tap anything in the drawn scene for its Slovak word, and
        draft a new dialogue under Your script.
      </Lead>
    </header>

    <section class="mt-10" aria-labelledby="stick-scene">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <h2 id="stick-scene" class="m-0 font-serif text-2xl font-semibold text-slate-900">
          Scene
        </h2>

        <div class="flex flex-wrap gap-2">
          {#each allScenes as option (option.id)}
            <button
              class={chipClass(option.id === scene.id)}
              type="button"
              onclick={() => selectScene(option.id)}
            >
              {option.title}
            </button>
          {/each}
        </div>
      </div>

      {#if scene.id === SCRIPT_SCENE_ID}
        <div class="{panelClass} mt-5 p-5">
          <label class="{eyebrowMutedClass} block" for="stick-script">
            One line per row: Speaker: line. Anna &gt; Waiter: line says who it is for. A
            [gesture] before a sentence overrides it.
          </label>
          <textarea
            id="stick-script"
            class={cx(
              "mt-2 block min-h-40 w-full resize-y rounded-(--control-radius) border border-slate-300 bg-control p-3",
              "font-mono text-sm leading-relaxed text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100",
            )}
            bind:value={scriptText}
            oninput={stop}
            spellcheck="false"
            lang="sk"></textarea>

          {#if script.problems.length > 0}
            <ul class="m-0 mt-3 list-none p-0 text-sm text-rose-700">
              {#each script.problems as problem, index (index)}
                <li>Row {problem.line}: {problem.message}</li>
              {/each}
            </ul>
          {/if}

          <p class="{eyebrowMutedClass} mt-4">Place</p>
          <div class="mt-2 flex flex-wrap gap-2">
            {#each PLACES as place (place.id)}
              <button
                class={chipClass(place.id === scriptSetting)}
                type="button"
                onclick={() => {
                  scriptSetting = place.id;
                }}
              >
                {place.label}
              </button>
            {/each}
          </div>

          <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            <TextLink onclick={copySnippet}>
              {copied ? "Copied" : "Copy as lesson scene"}
            </TextLink>
            <p class="m-0 text-sm text-slate-500">
              Paste it into a lesson, then
              <code class="font-mono text-xs"
                >bun scripts/audio/generate.ts -- --lessons-only --missing-only</code
              >
              makes the clips and their mouth tracks.
            </p>
          </div>
        </div>
      {/if}

      <div class="{panelClass} mt-5 overflow-hidden">
        <div
          class="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-200 px-5 py-3"
        >
          <Button variant="accent" onclick={playingScene ? stop : playScene}>
            {playingScene ? "Stop" : "Play scene"}
          </Button>

          <p class="m-0 text-sm text-slate-500">
            {#if scene.id === SCRIPT_SCENE_ID}
              No clips yet: lines run on text timing with a timed mouth.
            {:else}
              {voicedCount} of {scene.lines.length} lines have a clip, {trackedCount} a mouth
              track.
            {/if}
          </p>

          <TextLink
            class="ml-auto"
            onclick={() => {
              painted = !painted;
            }}
          >
            {painted ? "Show drawn backdrop" : "Show painted backdrop"}
          </TextLink>
        </div>

        <div
          bind:this={stageEl}
          bind:clientWidth={stageWidth}
          bind:clientHeight={stageHeight}
          class="relative flex h-[300px] items-end justify-center gap-[6%] overflow-hidden border-b border-slate-200 px-6 pb-3 max-[600px]:h-[240px]"
        >
          {#if painted}
            <img
              class="absolute inset-0 size-full object-cover object-center"
              src={lessonSceneSrc[scene.setting]}
              alt=""
              width="1536"
              height="1024"
              decoding="async"
            />
          {:else}
            <StickBackdrop
              class="absolute inset-0 size-full"
              {lit}
              onpick={(id) => {
                picked = picked === id ? undefined : id;
              }}
              {picked}
              setting={scene.setting}
            />
          {/if}

          {#each cast as characterId (characterId)}
            <div
              class={cx(
                "pointer-events-none relative w-full transition-transform ease-linear",
                cast.length > 2
                  ? "max-w-[110px] max-[600px]:max-w-[80px]"
                  : "max-w-[150px] max-[600px]:max-w-[120px]",
              )}
              bind:this={slots[characterId]}
              style:transform="translateX({(offsets[characterId] ?? 0) * 100}%)"
              style:transition-duration="{walks[characterId]?.ms ?? 0}ms"
            >
              <StickFigureActor
                {characterId}
                clock={storyAudioClock}
                cue={actors[characterId]?.cue ?? 0}
                facing={facings[characterId] ?? resting[characterId] ?? 1}
                plan={actors[characterId]?.plan}
                prop={held[heldAt]?.[characterId]}
                onbeat={onBeat}
                talking={actors[characterId]?.talking ?? false}
                walk={walks[characterId]}
              />
            </div>
          {/each}

          {#if pickedThing && card && !painted}
            {@const word = thingWords[pickedThing.word]}
            <div
              class={cx(
                "absolute z-10 animate-rise rounded-(--control-radius) bg-surface p-3",
                "shadow-(--shadow-float) ring-1 ring-slate-200",
              )}
              style:left="{card.left}px"
              style:top={card.below ? `${card.y}px` : undefined}
              style:bottom={card.below ? undefined : `${card.y}px`}
              style:width="{CARD_WIDTH}px"
            >
              <div class="flex items-center gap-3">
                {#if word?.src}
                  <AudioButton
                    label="Listen: {pickedThing.word}"
                    size="sm"
                    src={word.src}
                    text={pickedThing.word}
                  />
                {/if}

                <div class="min-w-0">
                  <p
                    class="m-0 font-serif text-lg font-semibold text-slate-900"
                    lang="sk"
                  >
                    {thingWithDemonstrative(pickedThing)}
                  </p>
                  <p class="m-0 text-sm text-slate-600">{pickedThing.english}</p>
                </div>
              </div>

              <p class="m-0 mt-2 text-xs text-slate-500">
                {nounGenderLabel(pickedThing.gender).english}
              </p>

              {#if word?.href}
                <TextLink class="mt-1 inline-block" href={word.href}>
                  Open in the dictionary
                </TextLink>
              {/if}
            </div>
          {/if}
        </div>

        <ol class="m-0 list-none divide-y divide-slate-200 p-0">
          {#each scene.lines as line, index (line.id)}
            {@const staging = stagings[index]}
            <li>
              <button
                class={cx(
                  "flex w-full cursor-pointer items-start gap-4 border-0 px-5 py-3.5 text-left",
                  "transition-colors duration-150 ease-out hover:bg-subtle",
                  line.id === activeLineId ? "bg-blue-50" : "bg-transparent",
                )}
                type="button"
                onclick={() => {
                  stop();
                  placeStage(index);
                  playLine(line);
                }}
              >
                <span class="min-w-0 flex-1">
                  <span class="{eyebrowMutedClass} block">{stageName(line.speaker)}</span>
                  <span
                    class="mt-1 block font-serif text-lg font-semibold text-slate-900"
                    lang="sk"
                  >
                    {line.slovak}
                  </span>
                  {#if line.english}
                    <span class="mt-0.5 block text-sm text-slate-500">{line.english}</span
                    >
                  {/if}

                  <span class="mt-1.5 flex flex-wrap gap-x-4 text-sm text-slate-500">
                    {#if dialogueSpeakerLabel(line.speaker)}
                      <span>Gestures: {gestureSequence(linePlans.get(line.id))}</span>
                    {/if}

                    {#if staging?.addressee}
                      <span>To {nameOf(staging.addressee)}</span>
                    {/if}

                    {#each staging?.reactions ?? [] as reaction (reaction.characterId)}
                      <span>{reactionCopy(reaction)}</span>
                    {/each}

                    {#each [...new Set(lineCues[index]?.filter((prop) => prop))] as prop (prop)}
                      <span>Shows the {prop}</span>
                    {/each}

                    {#each linePlans.get(line.id)?.pictures ?? [] as cue (cue.picture)}
                      <span>{STICK_PICTURE_NAMES[cue.picture]} over the head</span>
                    {/each}

                    {#each linePlans.get(line.id)?.beats ?? [] as beat, beatIndex (beatIndex)}
                      {#if beat.point}
                        <span>{pointCopy(beat.point.target, index)}</span>
                      {/if}
                    {/each}

                    {#if staging?.approach}
                      <span>{nameOf(staging.approach.characterId)} walks over</span>
                    {/if}

                    {#if staging?.enter}
                      <span>{nameOf(staging.enter.characterId)} walks in</span>
                    {/if}

                    {#if staging?.exit}
                      <span>Walks off after</span>
                    {/if}

                    {#if scene.id !== SCRIPT_SCENE_ID && !line.src}
                      <span>No clip</span>
                    {:else if scene.id !== SCRIPT_SCENE_ID && !line.mouth}
                      <span>No mouth track</span>
                    {/if}
                  </span>
                </span>
              </button>
            </li>
          {/each}
        </ol>
      </div>
    </section>

    <section class="mt-12" aria-labelledby="stick-gestures">
      <h2
        id="stick-gestures"
        class="m-0 font-serif text-2xl font-semibold text-slate-900"
      >
        Gestures
      </h2>

      <div class="{panelClass} mt-5 grid gap-6 p-6 sm:grid-cols-[200px_1fr]">
        <div
          class="mx-auto w-full max-w-[200px] rounded-(--control-radius) bg-portrait-ground px-4 pt-3"
        >
          <StickFigureActor
            characterId={benchCharacter}
            cue={bench.cue}
            plan={bench.plan}
            prop={benchProp}
            talking={bench.talking}
          />
        </div>

        <div class="min-w-0">
          <p class={eyebrowMutedClass}>Character</p>
          <div class="mt-2 flex flex-wrap gap-2">
            {#each characters as character (character.id)}
              <button
                class={chipClass(character.id === benchCharacter)}
                type="button"
                onclick={() => {
                  benchCharacter = character.id;
                }}
              >
                {character.displayName}
              </button>
            {/each}
          </div>

          <p class="{eyebrowMutedClass} mt-5">Gesture</p>
          <div class="mt-2 flex flex-wrap gap-2">
            {#each STICK_GESTURE_IDS as gesture (gesture)}
              <button
                class={chipClass(gesture === benchGesture)}
                type="button"
                onclick={() => playBench(gesturePlan(gesture), gesture)}
              >
                {gesture}
              </button>
            {/each}
          </div>

          <p class="{eyebrowMutedClass} mt-5">Holds</p>
          <div class="mt-2 flex flex-wrap gap-2">
            <button
              class={chipClass(benchProp === undefined)}
              type="button"
              onclick={() => {
                benchProp = undefined;
              }}
            >
              Nothing
            </button>
            {#each STICK_PROP_IDS as prop (prop)}
              <button
                class={chipClass(prop === benchProp)}
                type="button"
                onclick={() => {
                  benchProp = prop;
                  playBench(gesturePlan("show"), "show");
                }}
              >
                {prop}
              </button>
            {/each}
          </div>

          <label class="{eyebrowMutedClass} mt-5 block" for="stick-try-line">
            Try a line
          </label>
          <div class="mt-2 flex gap-2">
            <input
              id="stick-try-line"
              class={cx(
                "min-h-11 min-w-0 flex-1 rounded-(--control-radius) border border-slate-300 bg-control px-3",
                "font-serif text-lg text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100",
              )}
              bind:value={tryLine}
              autocomplete="off"
              lang="sk"
            />
            <Button variant="secondary" onclick={() => playBench(tryPlan)}>Play</Button>
          </div>
          <p class="m-0 mt-2 text-sm text-slate-500">
            Picks <span class={tagClass}>{gestureSequence(tryPlan)}</span>
          </p>
        </div>
      </div>
    </section>

    <section class="mt-12" aria-labelledby="stick-cast">
      <h2 id="stick-cast" class="m-0 font-serif text-2xl font-semibold text-slate-900">
        Cast
      </h2>

      <ul class="mt-5 grid list-none grid-cols-3 gap-4 p-0 sm:grid-cols-5 lg:grid-cols-9">
        {#each characters as character (character.id)}
          <li class="{panelClass} flex flex-col items-center p-2 pb-3">
            <div class="w-full rounded-(--control-radius) bg-portrait-ground px-2 pt-2">
              <StickFigure characterId={character.id} class="mx-auto max-w-[96px]" />
            </div>
            <span class="mt-2 text-xs font-semibold text-slate-600">
              {character.displayName}
            </span>
          </li>
        {/each}
      </ul>
    </section>
  </PageShell>
</main>
