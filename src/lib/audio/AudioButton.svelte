<script lang="ts">
  import { onDestroy, onMount, tick } from "svelte";
  import {
    AUDIO_VOLUME_CHANGE_EVENT,
    applyAudioVolume,
    getAudioVolume,
  } from "$lib/audio/volume";
  import { SFX_CHANGE_EVENT, getStoredSfxPreference } from "$lib/audio/sfx";

  let {
    allowTtsFallback = false,
    beforePlay,
    class: className = "",
    label = "Listen to Slovak",
    size = "md",
    src,
    text,
    variant = "default",
  }: {
    /**
     * When false (default), never fall back to browser speechSynthesis if `src`
     * is set — system voices mispronounce Slovak. Only use TTS when there is no
     * clip URL (e.g. dictionary lemma not generated yet).
     */
    allowTtsFallback?: boolean;
    /** Runs inside the click/play gesture (e.g. unlock story autoplay). */
    beforePlay?: () => void;
    class?: string;
    label?: string;
    size?: "sm" | "md" | "lg";
    src?: string;
    text: string;
    variant?: "default" | "inverse";
  } = $props();

  let playing = $state(false);

  let ringMode = $state<"off" | "progress" | "spin">("off");
  let supported = $state<boolean | undefined>(undefined);
  let audio: HTMLAudioElement | undefined;
  let utterance: SpeechSynthesisUtterance | undefined;
  let progressCircle: SVGCircleElement | undefined = $state();
  let raf = 0;

  const ringLength = 2 * Math.PI * 10;

  onMount(() => {
    supported = src ? true : Boolean(window.speechSynthesis);

    function onMuteChange(): void {
      if (getStoredSfxPreference() === "off") stop();
    }

    function onVolumeChange(): void {
      if (audio) applyAudioVolume(audio);
      if (utterance) utterance.volume = getAudioVolume();
    }

    window.addEventListener(SFX_CHANGE_EVENT, onMuteChange);
    window.addEventListener(AUDIO_VOLUME_CHANGE_EVENT, onVolumeChange);
    return () => {
      window.removeEventListener(SFX_CHANGE_EVENT, onMuteChange);
      window.removeEventListener(AUDIO_VOLUME_CHANGE_EVENT, onVolumeChange);
    };
  });

  const canUseTts = $derived(allowTtsFallback || !src);

  function clearProgressLoop(): void {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function setRingProgress(value: number): void {
    progressCircle?.setAttribute("stroke-dashoffset", String(ringLength * (1 - value)));
  }

  function trackAudioProgress(): void {
    clearProgressLoop();
    setRingProgress(0);

    const tick = (): void => {
      if (!audio || !playing) return;

      const { duration, currentTime } = audio;
      if (Number.isFinite(duration) && duration > 0) {
        setRingProgress(Math.min(1, Math.max(0, currentTime / duration)));
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
  }

  function speakFallback(): void {
    if (!canUseTts) {
      stop();
      return;
    }

    if (typeof window === "undefined" || !window.speechSynthesis) {
      stop();
      return;
    }

    clearProgressLoop();
    ringMode = "spin";
    utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "sk-SK";
    utterance.rate = 0.82;
    utterance.volume = getAudioVolume();
    utterance.onend = () => stop();
    utterance.onerror = () => stop();
    window.speechSynthesis.speak(utterance);
  }

  function stop(): void {
    clearProgressLoop();
    audio?.pause();
    if (audio) {
      audio.onended = null;
      audio.onerror = null;
      audio.currentTime = 0;
    }
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    playing = false;
    ringMode = "off";
    setRingProgress(0);
  }

  function play(): void {
    if (supported === false) return;

    beforePlay?.();
    stop();
    playing = true;

    if (src) {
      ringMode = "progress";
      audio = new Audio(src);
      audio.preload = "auto";
      applyAudioVolume(audio);
      audio.onended = () => stop();
      audio.onerror = () => {
        if (canUseTts) speakFallback();
        else stop();
      };
      void audio
        .play()
        .then(async () => {
          await tick();
          trackAudioProgress();
        })
        .catch(() => {
          if (canUseTts) speakFallback();
          else stop();
        });
      return;
    }

    if (canUseTts) speakFallback();
    else {
      playing = false;
    }
  }

  function toggle(): void {
    if (playing) stop();
    else play();
  }

  const sizeClass = $derived(
    size === "lg" ? "size-12" : size === "sm" ? "size-7" : "size-8",
  );

  const iconClass = $derived(
    size === "lg" ? "size-6" : size === "sm" ? "size-4" : "size-[1.125rem]",
  );

  const variantClass = $derived(
    variant === "inverse"
      ? "border-panel-inverse-ink/50 bg-panel-inverse-ink/12 text-panel-inverse-ink hover:border-panel-inverse-ink/75 hover:bg-panel-inverse-ink/20 [&.playing]:border-panel-inverse-ink/80 [&.playing]:bg-panel-inverse-ink/28"
      : "border-slate-300 bg-(--surface) text-blue-900 shadow-(--shadow-border) hover:border-blue-700 hover:bg-blue-50 hover:shadow-(--shadow-border-hover) [&.playing]:border-blue-800 [&.playing]:bg-blue-50 [&.playing]:shadow-(--shadow-border-hover)",
  );

  const buttonClass = $derived(
    `audio-button relative inline-grid shrink-0 cursor-pointer place-items-center rounded-full border transition-[background-color,border-color,box-shadow] duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${sizeClass} ${variantClass} ${className}`,
  );

  onDestroy(stop);
</script>

<button
  class={buttonClass}
  class:playing
  disabled={supported === false}
  type="button"
  aria-pressed={playing}
  aria-label={supported === false
    ? `${label}: unavailable`
    : playing
      ? `Stop: ${label}`
      : `${label}: ${text}`}
  onclick={toggle}
>
  {#if ringMode !== "off"}
    <svg
      class="pointer-events-none absolute inset-0 size-full"
      class:audio-ring-spin={ringMode === "spin"}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        class="fill-none stroke-current opacity-20"
        cx="12"
        cy="12"
        r="10"
        stroke-width="1.75"
      />

      {#if ringMode === "progress"}
        <circle
          bind:this={progressCircle}
          class="fill-none stroke-current"
          cx="12"
          cy="12"
          r="10"
          stroke-width="1.75"
          stroke-linecap="round"
          transform="rotate(-90 12 12)"
          stroke-dasharray={ringLength}
          stroke-dashoffset={ringLength}
        />
      {:else}
        <g class="audio-spin-group">
          <circle
            class="fill-none stroke-current"
            cx="12"
            cy="12"
            r="10"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-dasharray="16 47"
          />
        </g>
      {/if}
    </svg>
  {/if}

  <svg
    class="relative {iconClass} fill-none stroke-current"
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

  <span class="sr-only">{playing ? "Stop audio" : "Play audio"}</span>
</button>

<style>
  .audio-ring-spin .audio-spin-group {
    transform-origin: 12px 12px;
    animation: audio-spin 0.9s linear infinite;
  }

  @keyframes audio-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .audio-ring-spin .audio-spin-group {
      animation: none;
    }
  }
</style>
