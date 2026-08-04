<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  let {
    class: className = "",
    label = "Listen to Slovak",
    size = "md",
    src,
    text,
    variant = "default",
  }: {
    class?: string;
    label?: string;
    size?: "sm" | "md" | "lg";
    src?: string;
    text: string;
    variant?: "default" | "inverse";
  } = $props();

  let playing = $state(false);
  let supported = $state<boolean | undefined>(undefined);
  let audio: HTMLAudioElement | undefined;
  let utterance: SpeechSynthesisUtterance | undefined;

  onMount(() => {
    supported = src ? true : Boolean(window.speechSynthesis);
  });

  function stop(): void {
    audio?.pause();
    if (audio) audio.currentTime = 0;
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    playing = false;
  }

  function play(): void {
    if (supported === false) return;
    stop();
    playing = true;

    if (src) {
      audio = new Audio(src);
      audio.onended = () => (playing = false);
      audio.onerror = () => {
        // Missing local/R2 file → browser TTS fallback
        if (typeof window !== "undefined" && window.speechSynthesis) {
          utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = "sk-SK";
          utterance.rate = 0.82;
          utterance.onend = () => (playing = false);
          utterance.onerror = () => (playing = false);
          window.speechSynthesis.speak(utterance);
          return;
        }
        playing = false;
      };
      void audio.play().catch(() => (playing = false));
      return;
    }

    if (typeof window === "undefined" || !window.speechSynthesis) {
      playing = false;
      return;
    }

    utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "sk-SK";
    utterance.rate = 0.82;
    utterance.onend = () => (playing = false);
    utterance.onerror = () => (playing = false);
    window.speechSynthesis.speak(utterance);
  }

  function toggle(): void {
    if (playing) stop();
    else play();
  }

  const sizeClass = $derived(
    size === "lg"
      ? "h-11 w-11"
      : size === "sm"
        ? "h-8 w-8"
        : "h-9 w-9",
  );

  const iconClass = $derived(
    size === "lg" ? "h-[1.05rem] w-[1.05rem]" : size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5",
  );

  const variantClass = $derived(
    variant === "inverse"
      ? "border-panel-inverse-ink/30 bg-panel-inverse-ink/12 text-panel-inverse-ink hover:border-panel-inverse-ink/55 hover:bg-panel-inverse-ink/20 [&.playing]:border-panel-inverse-ink/65 [&.playing]:bg-panel-inverse-ink/25"
      : "border-slate-300 bg-(--surface) text-blue-800 hover:border-blue-600 hover:bg-blue-50 [&.playing]:border-blue-600 [&.playing]:bg-blue-50",
  );

  const buttonClass = $derived(
    `audio-button relative inline-grid shrink-0 cursor-pointer place-items-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${sizeClass} ${variantClass} ${className}`,
  );

  onDestroy(stop);
</script>

<button
  class={buttonClass}
  class:playing
  disabled={supported === false}
  type="button"
  aria-label={supported === false
    ? `${label}: unavailable`
    : playing
      ? `Stop: ${label}`
      : `${label}: ${text}`}
  onclick={toggle}
>
  <span class="audio-icon" class:audio-icon-visible={!playing} aria-hidden="true">
    <!-- Play triangle: path biased right for optical center -->
    <svg class={iconClass} viewBox="0 0 16 16" fill="currentColor">
      <path d="M5.6 3.2v9.6L13.2 8 5.6 3.2Z" />
    </svg>
  </span>

  <span class="audio-icon" class:audio-icon-visible={playing} aria-hidden="true">
    <svg class={iconClass} viewBox="0 0 16 16" fill="currentColor">
      <rect x="4.25" y="4.25" width="7.5" height="7.5" rx="0.75" />
    </svg>
  </span>

  <span class="sr-only">{playing ? "Stop audio" : "Play audio"}</span>
</button>

<style>
  .audio-icon {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    opacity: 0;
    scale: 0.25;
    filter: blur(4px);
    transition-property: opacity, scale, filter;
    transition-duration: 180ms;
    transition-timing-function: cubic-bezier(0.2, 0, 0, 1);
  }

  .audio-icon-visible {
    opacity: 1;
    scale: 1;
    filter: blur(0);
  }

  @media (prefers-reduced-motion: reduce) {
    .audio-icon {
      transition: none;
      filter: none;
      scale: 1;
    }

    .audio-icon:not(.audio-icon-visible) {
      opacity: 0;
    }
  }
</style>
