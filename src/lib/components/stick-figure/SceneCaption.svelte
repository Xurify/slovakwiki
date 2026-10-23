<script lang="ts">
  import { storyAudioClock } from "$lib/lesson-story/story-audio";
  import { markRoleClass, type TextMark } from "$lib/learning/marked-text";
  import { captionRuns } from "$lib/stick-figure/caption";
  import { foldLine } from "$lib/stick-figure/slovak-text";
  import type { LinePlan } from "$lib/stick-figure/line-plan";
  import { planTime, wordAt } from "$lib/stick-figure/performance";
  import { thingNamed, type SceneThing } from "$lib/stick-figure/thing-words";
  import { cx } from "$lib/ui/classes";

  let {
    cue,
    english,
    listenFirst = false,
    marks,
    onthing,
    plan,
    playing,
    showEnglish,
    slovak,
    things = [],
  }: {
    /** Bump when the line starts playing, so the highlight follows it from its first word. */
    cue: number;
    english?: string;
    /** Keep the words back until the line has been heard. */
    listenFirst?: boolean;
    marks?: TextMark[];
    /** A word that names something in the scene is a button that shows it. */
    onthing?: (id: string) => void;
    plan?: LinePlan;
    playing: boolean;
    showEnglish: boolean;
    slovak: string;
    things?: readonly SceneThing[];
  } = $props();

  let current = $state(-1);

  const runs = $derived(captionRuns(slovak, marks));
  const named = $derived(
    runs.map((run) =>
      run.word === undefined ? undefined : thingNamed(foldLine(run.text), things),
    ),
  );

  $effect(() => {
    void cue;
    if (!playing) {
      current = -1;
      return;
    }

    const startedAt = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      current = wordAt(plan, planTime(plan, storyAudioClock(), now - startedAt));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  });
</script>

<div aria-live="polite">
  {#if listenFirst && playing}
    <p class="m-0 font-serif text-2xl leading-snug text-slate-400 max-[600px]:text-xl">
      Listen…
    </p>
  {:else}
    <p
      class="m-0 animate-rise font-serif text-2xl leading-snug text-slate-900 max-[600px]:text-xl"
      lang="sk"
    >
      {#each runs as run, index (index)}
        {@const thing = named[index]}
        {@const said = run.word !== undefined && run.word === current}

        {#if thing && onthing}
          <button
            class={cx(
              "cursor-pointer rounded-sm border-0 bg-transparent p-0 font-serif text-inherit",
              "underline decoration-slate-400 decoration-dotted underline-offset-4",
              "transition-colors duration-150 ease-out hover:decoration-blue-600",
              run.role && markRoleClass(run.role),
              said && "bg-blue-100",
            )}
            type="button"
            onclick={() => onthing(thing.id)}
          >
            {run.text}
          </button>
        {:else}
          <span
            class={cx(
              "rounded-sm transition-colors duration-150 ease-out",
              run.role && markRoleClass(run.role),
              said && "bg-blue-100",
            )}>{run.text}</span
          >
        {/if}
      {/each}
    </p>

    {#if showEnglish && english}
      <p class="m-0 mt-1.5 text-base text-slate-600">{english}</p>
    {/if}
  {/if}
</div>
