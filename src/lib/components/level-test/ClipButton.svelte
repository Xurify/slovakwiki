<script lang="ts">
  import { onDestroy } from "svelte";

  import { applyAudioVolume } from "$lib/audio/volume";

  /** A clip the learner may play a fixed number of times, like the DET's audio items. */
  let {
    src,
    maxPlays = Number.POSITIVE_INFINITY,
    label = "Play the recording",
    size = "lg",
    autoplay = false,
    onended,
  }: {
    src: string;
    maxPlays?: number;
    label?: string;
    size?: "lg" | "md" | "sm";
    autoplay?: boolean;
    onended?: () => void;
  } = $props();

  let plays = $state(0);
  let playing = $state(false);
  let failed = $state(false);
  let audio: HTMLAudioElement | undefined;

  const left = $derived(maxPlays - plays);
  const exhausted = $derived(Number.isFinite(maxPlays) && left <= 0);
  const dim = $derived(size === "lg" ? "size-20" : size === "md" ? "size-14" : "size-10");
  const icon = $derived(size === "lg" ? "size-9" : size === "md" ? "size-7" : "size-5");

  function play(): void {
    if (playing || exhausted) return;
    audio ??= new Audio(src);
    applyAudioVolume(audio);
    audio.currentTime = 0;
    audio.onended = () => {
      playing = false;
      onended?.();
    };
    audio.onerror = () => {
      playing = false;
      failed = true;
    };
    plays += 1;
    playing = true;
    audio.play().catch(() => {
      playing = false;
      plays -= 1;
    });
  }

  $effect(() => {
    if (autoplay) play();
  });

  onDestroy(() => audio?.pause());
</script>

<div class="inline-flex flex-col items-center gap-2">
  <button
    class="inline-grid {dim} cursor-pointer place-items-center rounded-full border-0 text-paper transition-[background-color,box-shadow] duration-150 ease-out disabled:cursor-not-allowed {playing
      ? 'bg-blue-700 shadow-[0_0_0_6px_var(--accent-soft)]'
      : 'bg-blue-600 hover:bg-blue-700'} disabled:bg-slate-300"
    type="button"
    aria-label={label}
    disabled={exhausted && !playing}
    onclick={play}
  >
    <svg class="{icon} fill-current" viewBox="0 0 24 24" aria-hidden="true">
      {#if playing}
        <path
          d="M4 9v6h4l5 4V5L8 9H4Zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4Zm-2.5-8.8v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6Z"
        />
      {:else}
        <path
          d="M4 9v6h4l5 4V5L8 9H4Zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4Z"
        />
      {/if}
    </svg>
  </button>

  {#if failed}
    <p class="m-0 text-xs font-semibold text-rose-700">The recording could not load.</p>
  {:else if Number.isFinite(maxPlays)}
    <p class="m-0 text-xs font-semibold tracking-wide text-blue-800 uppercase">
      {left === 1 ? "1 play left" : `${Math.max(0, left)} plays left`}
    </p>
  {/if}
</div>
