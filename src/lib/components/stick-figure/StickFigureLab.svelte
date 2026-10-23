<script lang="ts">
  import {
    listedCharacters,
    type LessonCharacterId,
  } from "$lib/catalog/lessons/character-ids";
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
  import { STICK_GESTURE_IDS, type StickGestureId } from "$lib/stick-figure/gestures";
  import {
    gesturePlan,
    planLine,
    type LinePlan,
    type PointTarget,
  } from "$lib/stick-figure/line-plan";
  import { STICK_PROP_IDS, type StickPropId } from "$lib/stick-figure/props";
  import { STICK_PICTURE_NAMES } from "$lib/stick-figure/pictures";
  import { directScene } from "$lib/stick-figure/scene-direction";
  import type { Scene } from "$lib/stick-figure/scene-line";
  import {
    TIMES_OF_DAY,
    WEATHERS,
    sceneMood,
    type TimeOfDay,
    type Weather,
  } from "$lib/stick-figure/scene-mood";
  import type { StageReaction } from "$lib/stick-figure/staging";
  import { cx } from "$lib/ui/classes";
  import StickFigure from "./StickFigure.svelte";
  import StickFigureActor from "./StickFigureActor.svelte";
  import StickStage from "./StickStage.svelte";

  interface ActorState {
    cue: number;
    plan?: LinePlan;
    talking: boolean;
  }

  let {
    scenes,
    thingWords = {},
  }: {
    scenes: Scene[];
    /** Dictionary link and clip for a scene thing's word, keyed by the word. */
    thingWords?: Record<string, { href?: string; src?: string }>;
  } = $props();

  const characters = listedCharacters();

  const MOOD_LABELS: Record<TimeOfDay | Weather, string> = {
    clear: "Clear",
    cloudy: "Cloudy",
    day: "Day",
    evening: "Evening",
    morning: "Morning",
    night: "Night",
    rain: "Rain",
    snow: "Snow",
    sunny: "Sunny",
  };

  const REACTION_COPY: Partial<Record<StickGestureId, string>> = {
    lean: "leans in",
    nod: "nods",
    show: "holds it up",
  };

  let sceneId = $state("");
  let activeLineId = $state<string | null>(null);
  let playingScene = $state(false);
  let stage = $state<ReturnType<typeof StickStage>>();
  let benchCharacter = $state<LessonCharacterId>("anna");
  let bench = $state<ActorState>({ cue: 0, talking: false });
  let benchGesture = $state<StickGestureId | null>(null);
  /** Light and weather picked here instead of read from the dialogue. */
  let timeOverride = $state<TimeOfDay>();
  let weatherOverride = $state<Weather>();
  let benchProp = $state<StickPropId | undefined>();
  let tryLine = $state("Dobrý deň. Prepáčte, kde je stanica?");
  const scene = $derived(scenes.find((option) => option.id === sceneId) ?? scenes[0]);
  const direction = $derived(directScene(scene.lines, scene.setting));
  const spoken = $derived(sceneMood(scene.lines.map((line) => line.slovak)));
  const mood = $derived({
    time: timeOverride ?? spoken.time,
    weather: weatherOverride ?? spoken.weather,
  });
  const voicedCount = $derived(scene.lines.filter((line) => line.src).length);
  const trackedCount = $derived(scene.lines.filter((line) => line.mouth).length);
  const tryPlan = $derived(planLine(tryLine));

  let sceneTimer = 0;
  let benchTimer = 0;

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
      const prop = direction.lines[index]?.held[target.holder];
      return `Points at ${nameOf(target.holder)}'s ${prop ?? "hands"}`;
    }
    const thing = direction.things.find((candidate) => candidate.id === target.id);
    return `Points at the ${thing?.word ?? target.id}`;
  }

  function selectScene(id: string): void {
    stop();
    const same = id === scene.id;
    sceneId = id;
    if (same) stage?.place(0);
  }

  function stop(): void {
    window.clearTimeout(sceneTimer);
    stage?.stop();
    playingScene = false;
    activeLineId = null;
  }

  function playLine(index: number): void {
    stop();
    stage?.place(index);
    activeLineId = scene.lines[index]?.id ?? null;
    stage?.play(index);
  }

  function playScene(): void {
    stop();
    stage?.place(0);
    playingScene = true;

    const step = (index: number): void => {
      const line = scene.lines[index];

      if (!line) {
        playingScene = false;
        activeLineId = null;
        return;
      }

      // Someone still walking on gets to their mark before they speak.
      const walking = stage?.walking(scene.lines[index].characterId) ?? 0;
      if (walking > 0) {
        sceneTimer = window.setTimeout(() => step(index), walking);
        return;
      }

      activeLineId = line.id;
      stage?.play(index, () => {
        sceneTimer = window.setTimeout(() => step(index + 1), 450);
      });
    };

    step(0);
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
        needs hand animation. Tap anything in the drawn scene for its Slovak word.
      </Lead>
      <p class="m-0 mt-3 text-sm text-slate-600">
        This page is for staging. Learners play the same scenes on
        <TextLink href="/dev/scenes">Scenes</TextLink>.
      </p>
    </header>

    <section class="mt-10" aria-labelledby="stick-scene">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <h2 id="stick-scene" class="m-0 font-serif text-2xl font-semibold text-slate-900">
          Scene
        </h2>

        <div class="flex flex-wrap gap-2">
          {#each scenes as option (option.id)}
            <button
              class={chipClass(option.id === scene.id)}
              type="button"
              onclick={() => selectScene(option.id)}
            >
              {option.english ?? option.name}
            </button>
          {/each}
        </div>
      </div>

      <div class="{panelClass} mt-5 overflow-hidden">
        <div
          class="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-200 px-5 py-3"
        >
          <Button variant="accent" onclick={playingScene ? stop : playScene}>
            {playingScene ? "Stop" : "Play scene"}
          </Button>

          <p class="m-0 text-sm text-slate-500">
            {voicedCount} of {scene.lines.length} lines have a clip, {trackedCount} a mouth
            track.
          </p>
        </div>

        <div
          class="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-slate-200 px-5 py-2.5"
        >
          <div class="flex flex-wrap gap-1.5" role="group" aria-label="Time of day">
            {#each TIMES_OF_DAY as time (time)}
              <button
                class={chipClass(time === mood.time)}
                type="button"
                aria-pressed={time === mood.time}
                onclick={() => {
                  timeOverride = time;
                }}
              >
                {MOOD_LABELS[time]}
              </button>
            {/each}
          </div>

          <div class="flex flex-wrap gap-1.5" role="group" aria-label="Weather">
            {#each WEATHERS as weather (weather)}
              <button
                class={chipClass(weather === mood.weather)}
                type="button"
                aria-pressed={weather === mood.weather}
                onclick={() => {
                  weatherOverride = weather;
                }}
              >
                {MOOD_LABELS[weather]}
              </button>
            {/each}
          </div>

          {#if timeOverride || weatherOverride}
            <TextLink
              onclick={() => {
                timeOverride = undefined;
                weatherOverride = undefined;
              }}
            >
              As the dialogue says
            </TextLink>
          {/if}
        </div>

        <StickStage
          bind:this={stage}
          class="border-b border-slate-200"
          {direction}
          lines={scene.lines}
          {mood}
          setting={scene.setting}
          {thingWords}
        />

        <ol class="m-0 list-none divide-y divide-slate-200 p-0">
          {#each scene.lines as line, index (line.id)}
            {@const { plan, props, staging } = direction.lines[index]}
            <li>
              <button
                class={cx(
                  "flex w-full cursor-pointer items-start gap-4 border-0 px-5 py-3.5 text-left",
                  "transition-colors duration-150 ease-out hover:bg-subtle",
                  line.id === activeLineId ? "bg-blue-50" : "bg-transparent",
                )}
                type="button"
                onclick={() => playLine(index)}
              >
                <span class="min-w-0 flex-1">
                  <span class="{eyebrowMutedClass} block">{line.speaker}</span>
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
                    {#if line.characterId}
                      <span>Gestures: {gestureSequence(plan)}</span>
                    {/if}

                    {#if staging.addressee}
                      <span>To {nameOf(staging.addressee)}</span>
                    {/if}

                    {#each staging.reactions as reaction (reaction.characterId)}
                      <span>{reactionCopy(reaction)}</span>
                    {/each}

                    {#each [...new Set(props.filter((prop) => prop))] as prop (prop)}
                      <span>Shows the {prop}</span>
                    {/each}

                    {#each plan.pictures ?? [] as cue (cue.picture)}
                      <span>{STICK_PICTURE_NAMES[cue.picture]} over the head</span>
                    {/each}

                    {#each plan.beats as beat, beatIndex (beatIndex)}
                      {#if beat.point}
                        <span>{pointCopy(beat.point.target, index)}</span>
                      {/if}
                    {/each}

                    {#if staging.approach}
                      <span>{nameOf(staging.approach.characterId)} walks over</span>
                    {/if}

                    {#if staging.enter}
                      <span>{nameOf(staging.enter.characterId)} walks in</span>
                    {/if}

                    {#if staging.exit}
                      <span>Walks off after</span>
                    {/if}

                    {#if !line.src}
                      <span>No clip</span>
                    {:else if !line.mouth}
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
