<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  import { applyAudioVolume } from "$lib/audio/volume";

  /** A clip the learner may play a fixed number of times. */
  let {
    src,
    maxPlays = Number.POSITIVE_INFINITY,
    label = "Play the recording",
    size = "lg",
    autoplay = false,
    onended,
    onfailed,
  }: {
    src: string;
    maxPlays?: number;
    label?: string;
    size?: "lg" | "md" | "sm";
    autoplay?: boolean;
    onended?: () => void;
    /** The clip could not load: the task leaves this question out of the score. */
    onfailed?: () => void;
  } = $props();

  // Long enough for a slow mobile connection to start a short clip.
  const LOAD_TIMEOUT_MS = 8000;

  let plays = $state(0);
  let playing = $state(false);
  let failed = $state(false);
  let audio: HTMLAudioElement | undefined;
  let loadTimer: ReturnType<typeof setTimeout> | undefined;

  const left = $derived(maxPlays - plays);
  const exhausted = $derived(Number.isFinite(maxPlays) && left <= 0);
  const dim = $derived(size === "lg" ? "size-20" : size === "md" ? "size-14" : "size-10");
  const icon = $derived(size === "lg" ? "size-9" : size === "md" ? "size-7" : "size-5");

  /** A clip that never gets data never errors either; give up on it. */
  function waitForData(): void {
    if (!playing || loadTimer !== undefined) return;
    loadTimer = setTimeout(fail, LOAD_TIMEOUT_MS);
  }

  function stopWaiting(): void {
    clearTimeout(loadTimer);
    loadTimer = undefined;
  }

  function play(): void {
    if (playing || exhausted) return;
    audio ??= new Audio(src);
    applyAudioVolume(audio);
    audio.currentTime = 0;
    audio.onended = () => {
      playing = false;
      onended?.();
    };
    audio.onerror = fail;
    audio.onstalled = waitForData;
    audio.onwaiting = waitForData;
    audio.oncanplay = stopWaiting;
    audio.onplaying = stopWaiting;
    plays += 1;
    playing = true;
    if (audio.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) waitForData();
    audio.play().catch((error: unknown) => {
      playing = false;
      plays -= 1;
      // NotAllowedError is a blocked autoplay; the learner can still press play.
      if (error instanceof DOMException && error.name === "NotAllowedError")
        stopWaiting();
      else fail();
    });
  }

  function fail(): void {
    stopWaiting();
    audio?.pause();
    playing = false;
    if (failed) return;
    failed = true;
    onfailed?.();
  }

  // Once, on mount: a blocked autoplay must not be retried by an effect.
  onMount(() => {
    if (autoplay) play();
  });

  onDestroy(() => {
    stopWaiting();
    if (!audio) return;
    audio.onended = null;
    audio.onerror = null;
    audio.onstalled = null;
    audio.onwaiting = null;
    audio.oncanplay = null;
    audio.onplaying = null;
    audio.pause();
  });
</script>

<div class="inline-flex flex-col items-center gap-2" class:w-32={size === "lg"}>
  <button
    class="inline-grid {dim} cursor-pointer place-items-center rounded-full border-0 text-paper transition-[background-color,box-shadow] duration-150 ease-out disabled:cursor-not-allowed {playing
      ? 'bg-blue-700 shadow-[0_0_0_6px_var(--accent-soft)]'
      : 'bg-blue-600 hover:bg-blue-700'} disabled:bg-slate-300"
    type="button"
    aria-label={label}
    disabled={exhausted && !playing}
    onclick={play}
  >
    <svg
      class="{icon} translate-x-px fill-none stroke-current"
      viewBox="0 0 24 24"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path
        d="M11 5 6.5 8.5H4a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h2.5L11 19Z"
        fill="currentColor"
      />
      <path d="M15.5 9a4 4 0 0 1 0 6" />
      <path d="M18.5 6a8 8 0 0 1 0 12" />
    </svg>
  </button>

  {#if failed}
    <p class="m-0 max-w-32 text-center text-xs font-semibold text-rose-700">
      The recording could not load. It won't count.
    </p>
  {:else if Number.isFinite(maxPlays)}
    <p class="m-0 text-xs font-semibold text-blue-800">
      {left === 1 ? "1 play left" : `${Math.max(0, left)} plays left`}
    </p>
  {/if}
</div>
