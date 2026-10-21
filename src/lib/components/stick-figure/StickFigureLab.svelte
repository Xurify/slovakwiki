<script lang="ts" module>
  import type { LessonCharacterId } from "$lib/catalog/lessons/character-ids";

  export interface StickLabLine {
    characterId: LessonCharacterId;
    english: string;
    id: string;
    /** Loudness track of the clip (`content/audio/mouth.json`). */
    mouth?: string;
    slovak: string;
    speaker: string;
    src?: string;
  }

  export interface StickLabScene {
    /** Lesson scene plate; a light painting, so ink limbs read in both themes. */
    backdrop: string;
    id: string;
    lines: StickLabLine[];
    title: string;
  }
</script>

<script lang="ts">
  import { listedCharacters } from "$lib/catalog/lessons/character-ids";
  import Button from "$lib/components/ui/Button.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
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
  import { STICK_GESTURE_IDS, type StickGestureId } from "$lib/stick-figure/gestures";
  import { gesturePlan, planLine, type LinePlan } from "$lib/stick-figure/line-plan";
  import { decodeMouthTrack } from "$lib/stick-figure/mouth-track";
  import { cx } from "$lib/ui/classes";
  import StickFigure from "./StickFigure.svelte";
  import StickFigureActor from "./StickFigureActor.svelte";

  interface ActorState {
    cue: number;
    plan?: LinePlan;
    talking: boolean;
  }

  let { scenes }: { scenes: StickLabScene[] } = $props();

  const characters = listedCharacters();

  let sceneId = $state("");
  let activeLineId = $state<string | null>(null);
  let playingScene = $state(false);
  let actors = $state<Partial<Record<LessonCharacterId, ActorState>>>({});
  let benchCharacter = $state<LessonCharacterId>("anna");
  let bench = $state<ActorState>({ cue: 0, talking: false });
  let benchGesture = $state<StickGestureId | null>(null);
  let tryLine = $state("Dobrý deň. Prepáčte, kde je stanica?");

  const scene = $derived(scenes.find((option) => option.id === sceneId) ?? scenes[0]);
  const cast = $derived([...new Set(scene?.lines.map((line) => line.characterId))]);
  const voicedCount = $derived(scene?.lines.filter((line) => line.src).length ?? 0);
  const trackedCount = $derived(scene?.lines.filter((line) => line.mouth).length ?? 0);
  const linePlans = $derived(
    new Map(
      scene?.lines.map((line) => [
        line.id,
        planLine(line.slovak, line.mouth ? decodeMouthTrack(line.mouth) : undefined),
      ]),
    ),
  );
  const tryPlan = $derived(planLine(tryLine));

  let playToken = 0;
  let sceneTimer = 0;
  let benchTimer = 0;

  /** "wave → self", with repeated talking beats said once. */
  function gestureSequence(plan: LinePlan | undefined): string {
    const gestures = plan?.beats.map((beat) => beat.gesture) ?? [];
    return gestures
      .filter((gesture, index) => gesture !== gestures[index - 1])
      .join(" → ");
  }

  function selectScene(id: string): void {
    stop();
    actors = {};
    sceneId = id;
  }

  function stop(): void {
    playToken += 1;
    window.clearTimeout(sceneTimer);
    stopStoryLineAudio();
    for (const actor of Object.values(actors)) actor.talking = false;
    playingScene = false;
    activeLineId = null;
  }

  function playLine(line: StickLabLine, onDone?: () => void): void {
    playToken += 1;
    const token = playToken;

    for (const actor of Object.values(actors)) actor.talking = false;
    actors[line.characterId] = {
      cue: (actors[line.characterId]?.cue ?? 0) + 1,
      plan: linePlans.get(line.id),
      talking: true,
    };
    activeLineId = line.id;

    playStoryLineAudio(line.src, line.slovak, {
      onEnded: () => {
        if (token !== playToken) return;

        const actor = actors[line.characterId];
        if (actor) actor.talking = false;
        onDone?.();
      },
    });
  }

  function playScene(): void {
    if (!scene) return;

    stop();
    playingScene = true;
    const lines = scene.lines;

    const step = (index: number): void => {
      const line = lines[index];

      if (!line) {
        playingScene = false;
        activeLineId = null;
        return;
      }

      playLine(line, () => {
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
      <p
        class="m-0 font-mono text-xs font-medium tracking-widest text-blue-700 uppercase"
      >
        Cast & Motion
      </p>
      <h1 class="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        Stick figures
      </h1>
      <Lead class="mt-3">
        Prototype. The lesson cast as SVG figures that gesture while their line plays. The
        gesture comes from the Slovak text, so no line needs hand animation.
      </Lead>
    </header>

    {#if scene}
      <section class="mt-10" aria-labelledby="stick-scene">
        <div class="flex flex-wrap items-end justify-between gap-4">
          <h2
            id="stick-scene"
            class="m-0 font-serif text-2xl font-semibold text-slate-900"
          >
            Scene
          </h2>

          <div class="flex flex-wrap gap-2">
            {#each scenes as option (option.id)}
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

        <div class="{panelClass} mt-5 overflow-hidden">
          <div
            class="relative flex h-[300px] items-end justify-center gap-[10%] overflow-hidden border-b border-slate-200 px-6 pb-3 max-[600px]:h-[240px]"
          >
            <img
              class="absolute inset-0 size-full object-cover object-center"
              src={scene.backdrop}
              alt=""
              width="1536"
              height="1024"
              decoding="async"
            />

            {#each cast as characterId, index (characterId)}
              <div class="relative w-full max-w-[150px] max-[600px]:max-w-[120px]">
                <StickFigureActor
                  {characterId}
                  clock={storyAudioClock}
                  cue={actors[characterId]?.cue ?? 0}
                  facing={index === 0 ? 1 : -1}
                  plan={actors[characterId]?.plan}
                  talking={actors[characterId]?.talking ?? false}
                />
              </div>
            {/each}
          </div>

          <ol class="m-0 list-none divide-y divide-slate-200 p-0">
            {#each scene.lines as line (line.id)}
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
                    playLine(line);
                  }}
                >
                  <span class="min-w-0 flex-1">
                    <span class="{eyebrowMutedClass} block">{line.speaker}</span>
                    <span
                      class="mt-1 block font-serif text-lg font-semibold text-slate-900"
                      lang="sk"
                    >
                      {line.slovak}
                    </span>
                    <span class="mt-0.5 block text-sm text-slate-500">{line.english}</span
                    >
                  </span>

                  <span class="{tagClass} shrink-0">
                    {gestureSequence(linePlans.get(line.id))}
                  </span>
                </button>
              </li>
            {/each}
          </ol>

          <div
            class="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-200 px-5 py-4"
          >
            <Button variant="accent" onclick={playingScene ? stop : playScene}>
              {playingScene ? "Stop" : "Play scene"}
            </Button>

            <p class="m-0 text-sm text-slate-500">
              {voicedCount} of {scene.lines.length} lines have a clip, {trackedCount} a mouth
              track. Lines without a clip hold for 1.6 s.
            </p>
          </div>
        </div>
      </section>
    {/if}

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
