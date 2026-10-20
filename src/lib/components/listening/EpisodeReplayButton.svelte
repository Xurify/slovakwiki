<script lang="ts">
  import { onDestroy } from "svelte";

  import { playStoryLineAudio, stopStoryLineAudio } from "$lib/lesson-story/story-audio";

  /**
   * Replays one episode line through the shared story element, so it never
   * talks over the podcast: the player pauses first via `onbeforeplay`.
   */
  let {
    label = "Listen again",
    onbeforeplay,
    src,
  }: {
    label?: string;
    onbeforeplay?: () => void;
    src?: string;
  } = $props();

  let playing = $state(false);
  let epoch = 0;

  function toggle(): void {
    if (playing) {
      epoch += 1;
      playing = false;
      stopStoryLineAudio();
      return;
    }

    onbeforeplay?.();
    epoch += 1;
    const mine = epoch;
    playing = true;
    playStoryLineAudio(src, "", {
      onEnded: () => {
        if (mine === epoch) playing = false;
      },
    });
  }

  onDestroy(() => {
    if (playing) stopStoryLineAudio();
  });
</script>

<button
  class="relative inline-grid size-10 shrink-0 cursor-pointer place-items-center rounded-full border border-slate-300 bg-surface text-blue-900 shadow-(--shadow-border) transition-[background-color,border-color,box-shadow] duration-150 ease-out hover:border-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 {playing
    ? 'border-blue-800 bg-blue-50'
    : ''}"
  type="button"
  aria-pressed={playing}
  aria-label={playing ? `Stop: ${label}` : label}
  disabled={!src}
  onclick={toggle}
>
  <svg
    class="size-[1.125rem] fill-none stroke-current"
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
</button>
