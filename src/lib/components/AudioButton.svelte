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
    size === "lg" ? "size-12" : size === "sm" ? "size-7" : "size-8",
  );

  const iconClass = $derived(
    size === "lg" ? "size-6" : size === "sm" ? "size-4" : "size-4.5",
  );

  const variantClass = $derived(
    variant === "inverse"
      ? "border-panel-inverse-ink/65 bg-panel-inverse-ink/20 text-panel-inverse-ink hover:border-panel-inverse-ink hover:bg-panel-inverse-ink/30 [&.playing]:border-panel-inverse-ink [&.playing]:bg-panel-inverse-ink/36"
      : "border-slate-300 bg-(--surface) text-blue-900 shadow-(--shadow-border) hover:border-blue-700 hover:bg-blue-50 hover:shadow-(--shadow-border-hover) [&.playing]:border-blue-700 [&.playing]:bg-blue-50",
  );

  const buttonClass = $derived(
    `inline-grid shrink-0 cursor-pointer place-items-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${sizeClass} ${variantClass} ${className}`,
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
  <!--
    Speaker (not play triangle): reads as “listen”, sits in a square
    viewBox so grid centering just works — no optical nudge wars.
  -->
  <svg
    class="{iconClass} fill-none stroke-current"
    viewBox="0 0 24 24"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    {#if playing}
      <path d="M11 6 7 9.5H4v5h3L11 18V6Z" fill="currentColor" stroke="none" />
      <path d="M15 10.5v3M18 9v6" />
    {:else}
      <path d="M11 6 7 9.5H4v5h3L11 18V6Z" fill="currentColor" stroke="none" />
      <path d="M15.2 9.2a4.2 4.2 0 0 1 0 5.6M18.2 7a7 7 0 0 1 0 10" />
    {/if}
  </svg>

  <span class="sr-only">{playing ? "Stop audio" : "Play audio"}</span>
</button>
