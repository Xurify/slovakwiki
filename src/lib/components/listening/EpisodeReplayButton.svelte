<script lang="ts">
  import { onDestroy } from "svelte";

  import { playStoryLineAudio, stopStoryLineAudio } from "$lib/lesson-story/story-audio";
  import { cx } from "$lib/ui/classes";

  let {
    label,
    onbeforeplay,
    play,
    src,
    stop = stopStoryLineAudio,
  }: {
    label: string;
    onbeforeplay?: () => void;
    /** Plays the line some other way than its clip alone, such as acted on a stage. */
    play?: (onEnded: () => void) => void;
    src?: string;
    stop?: () => void;
  } = $props();

  let playing = $state(false);
  let epoch = 0;

  function toggle(): void {
    if (playing) {
      epoch += 1;
      playing = false;
      stop();
      return;
    }

    onbeforeplay?.();
    epoch += 1;
    const mine = epoch;
    const onEnded = () => {
      if (mine === epoch) playing = false;
    };
    playing = true;
    if (play) play(onEnded);
    else playStoryLineAudio(src, "", { onEnded });
  }

  onDestroy(() => {
    if (playing) stop();
  });
</script>

<button
  class={cx(
    "inline-flex min-h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-sm font-semibold text-blue-800",
    "transition-[background-color,border-color] duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-50",
    playing
      ? "border-blue-700 bg-blue-50"
      : "border-slate-300 bg-surface hover:border-blue-700 hover:bg-blue-50",
  )}
  type="button"
  aria-pressed={playing}
  disabled={!src && !play}
  onclick={toggle}
>
  <svg
    class="size-4 fill-none stroke-current"
    viewBox="0 0 24 24"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    {#if playing}
      <rect
        x="7"
        y="6.5"
        width="3.25"
        height="11"
        rx="1"
        fill="currentColor"
        stroke="none"
      />
      <rect
        x="13.75"
        y="6.5"
        width="3.25"
        height="11"
        rx="1"
        fill="currentColor"
        stroke="none"
      />
    {:else}
      <path d="M11 6 7 9.5H4v5h3L11 18V6Z" fill="currentColor" stroke="none" />
      <path d="M15.2 9.2a4.2 4.2 0 0 1 0 5.6M18.2 7a7 7 0 0 1 0 10" />
    {/if}
  </svg>

  {label}
</button>
