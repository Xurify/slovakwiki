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
  import {
    characterIdForSpeaker,
    listedCharacters,
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
  import { dialogueSpeakerLabel } from "$lib/components/practice/dialogue-speaker";
  import { STICK_GESTURE_IDS } from "$lib/stick-figure/gestures";
  import {
    gesturePlan,
    planLine,
    type LinePlan,
    type PointTarget,
  } from "$lib/stick-figure/line-plan";
  import { STICK_PROP_IDS } from "$lib/stick-figure/props";
  import { STICK_PICTURE_NAMES } from "$lib/stick-figure/pictures";
  import { directScene, type DirectedLine } from "$lib/stick-figure/scene-direction";
  import { parseScript, sceneSnippet, stageName } from "$lib/stick-figure/script";
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
    scenes: StickLabScene[];
    /** Keyed by the thing's word. */
    thingWords?: Record<string, StickThingWord>;
  } = $props();

  const SCRIPT_SCENE_ID = "script";

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
  let stage = $state<ReturnType<typeof StickStage>>();
  let benchCharacter = $state<LessonCharacterId>("anna");
  let bench = $state<ActorState>({ cue: 0, talking: false });
  let benchGesture = $state<StickGestureId | null>(null);
  let copied = $state(false);
  let painted = $state(false);
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
  const directedLines = $derived<DirectedLine[]>(
    scene.lines.map((line) => ({
      characterId: dialogueSpeakerLabel(line.speaker) ? line.characterId : null,
      gestures: line.gestures,
      mouth: line.mouth,
      props: line.props,
      slovak: line.slovak,
      src: line.src,
      to: line.to,
      vowels: line.vowels,
    })),
  );
  const direction = $derived(directScene(directedLines, scene.setting));
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
      const prop = direction.held[index]?.[target.holder];
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
      const walking = stage?.walking(directedLines[index].characterId) ?? 0;
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

        <StickStage
          bind:this={stage}
          class="border-b border-slate-200"
          {direction}
          lines={directedLines}
          {painted}
          setting={scene.setting}
          {thingWords}
        />

        <ol class="m-0 list-none divide-y divide-slate-200 p-0">
          {#each scene.lines as line, index (line.id)}
            {@const staging = direction.stagings[index]}
            {@const plan = direction.plans[index]}
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
                      <span>Gestures: {gestureSequence(plan)}</span>
                    {/if}

                    {#if staging?.addressee}
                      <span>To {nameOf(staging.addressee)}</span>
                    {/if}

                    {#each staging?.reactions ?? [] as reaction (reaction.characterId)}
                      <span>{reactionCopy(reaction)}</span>
                    {/each}

                    {#each [...new Set(direction.props[index]?.filter((prop) => prop))] as prop (prop)}
                      <span>Shows the {prop}</span>
                    {/each}

                    {#each plan?.pictures ?? [] as cue (cue.picture)}
                      <span>{STICK_PICTURE_NAMES[cue.picture]} over the head</span>
                    {/each}

                    {#each plan?.beats ?? [] as beat, beatIndex (beatIndex)}
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
