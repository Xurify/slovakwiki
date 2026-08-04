<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  let {
    label = "Listen to Slovak",
    size = "md",
    src,
    text,
    variant = "default",
  }: {
    label?: string;
    size?: "md" | "lg";
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
    size === "lg" ? "h-14 w-14 text-[0.78rem]" : "h-10 w-10 text-[0.62rem]",
  );

  const variantClass = $derived(
    variant === "inverse"
      ? "border-panel-inverse-ink/25 bg-panel-inverse-ink/10 text-panel-inverse-ink hover:border-panel-inverse-ink/50 hover:bg-panel-inverse-ink/18 [&.playing]:border-panel-inverse-ink/60 [&.playing]:bg-panel-inverse-ink/22"
      : "border-(--line-strong) bg-(--surface) text-(--accent-strong) shadow-(--shadow-border) hover:border-(--accent) hover:bg-(--accent-soft) hover:shadow-(--shadow-border-hover) [&.playing]:border-(--accent) [&.playing]:bg-(--accent-soft)",
  );

  const buttonClass = $derived(
    `audio-button relative inline-grid shrink-0 cursor-pointer place-items-center rounded-full border disabled:cursor-not-allowed disabled:opacity-50 ${sizeClass} ${variantClass}`,
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
  <span class="audio-icon" class:audio-icon-visible={!playing} aria-hidden="true">▶</span>
  <span class="audio-icon" class:audio-icon-visible={playing} aria-hidden="true">■</span>
  <span class="sr-only">{playing ? "Stop audio" : "Play audio"}</span>
</button>

<style>
  .audio-icon {
    position: absolute;
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
