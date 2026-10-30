<script lang="ts">
  import type { Snippet } from "svelte";

  import TaskTimer from "./TaskTimer.svelte";
  import { taskHeadingClass } from "./level-test-ui";

  /**
   * One test screen: the clock top left, the instruction centred,
   * the task, and Next at the bottom right.
   */
  let {
    heading,
    seconds = null,
    timerLabel,
    onexpire,
    wide = false,
    meta,
    footer,
    children,
  }: {
    heading: string;
    /** Null when the learner chose an untimed test. */
    seconds?: number | null;
    timerLabel?: string;
    onexpire?: () => void;
    wide?: boolean;
    /** Small text on the right of the clock row (step within a task). */
    meta?: string;
    footer?: Snippet;
    children: Snippet;
  } = $props();
</script>

<section
  class="mx-auto w-full overflow-hidden rounded-(--frame-radius) bg-surface shadow-(--shadow-border) animate-rise {wide
    ? 'max-w-[1040px]'
    : 'max-w-[720px]'}"
  aria-labelledby="level-test-heading"
>
  <div class="px-7 pt-5 pb-8 max-[560px]:px-4 max-[560px]:pb-6">
    <div class="flex min-h-6 items-center justify-between gap-3">
      {#if seconds}
        <TaskTimer {seconds} label={timerLabel} {onexpire} />
      {:else}
        <p class="m-0 text-xs text-slate-500">Untimed</p>
      {/if}

      {#if meta}
        <p class="m-0 text-xs font-semibold tabular-nums text-slate-500">{meta}</p>
      {/if}
    </div>

    <h2
      id="level-test-heading"
      class="{taskHeadingClass} focus-visible:outline-none"
      tabindex="-1"
    >
      {heading}
    </h2>

    <div class="mt-7">
      {@render children()}
    </div>
  </div>

  {#if footer}
    <footer
      class="flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 bg-subtle/60 px-7 py-4 max-[560px]:px-4"
    >
      {@render footer()}
    </footer>
  {/if}
</section>
