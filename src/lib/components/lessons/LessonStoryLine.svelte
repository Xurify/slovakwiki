<script lang="ts">
  import { onMount } from "svelte";
  import AudioButton from "$lib/components/audio/AudioButton.svelte";
  import LessonCharacterAvatar from "$lib/components/lessons/LessonCharacterAvatar.svelte";
  import { isLearnerSpeaker } from "$lib/lesson-story/story-cast";
  import { unlockStoryAudio } from "$lib/lesson-story/story-audio";
  import type { DialogueTurn } from "$lib/learning/types";

  let {
    audioSrc,
    line,
    newest = false,
    showEnglish = false,
  }: {
    audioSrc?: string;
    line: DialogueTurn;
    newest?: boolean;
    /** When true, English gloss is always visible. */
    showEnglish?: boolean;
  } = $props();

  const learner = $derived(isLearnerSpeaker(line.speaker));
  const audioText = $derived(line.audio?.transcript ?? line.slovak);
  let enter = $state(false);
  let englishOpen = $state(false);

  const englishVisible = $derived(showEnglish || englishOpen);

  onMount(() => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      enter = true;
      return;
    }

    requestAnimationFrame(() => {
      enter = true;
    });
  });

  function revealEnglish(): void {
    englishOpen = true;
  }
</script>

<li
  class="story-line flex w-full list-none gap-3 {learner
    ? 'flex-row-reverse'
    : 'flex-row'} {enter ? 'story-line-in' : 'story-line-prep'} {newest
    ? 'story-line-newest'
    : 'story-line-past'}"
>
  <LessonCharacterAvatar speaker={line.speaker} size="md" class="mt-1" />

  <article
    class="max-w-[min(100%,22rem)] rounded-(--frame-radius) px-4 py-3.5 shadow-(--shadow-border) sm:max-w-md sm:px-5 sm:py-4 {learner
      ? 'bg-emerald-50/90 ring-1 ring-emerald-600/15 ring-inset'
      : 'bg-surface/90 ring-1 ring-slate-200/80 ring-inset'}"
    aria-label={englishVisible
      ? `${line.speaker}: ${line.slovak}. ${line.english}`
      : `${line.speaker}: ${line.slovak}`}
  >
    <div class="flex items-start justify-between gap-3">
      <p
        class="m-0 text-[0.62rem] font-bold tracking-[0.14em] uppercase {learner
          ? 'text-emerald-700'
          : 'text-slate-500'}"
      >
        {line.speaker}
      </p>

      {#if audioSrc}
        <AudioButton
          size="sm"
          src={audioSrc}
          text={audioText}
          label={`Listen: ${line.speaker}`}
          beforePlay={unlockStoryAudio}
        />
      {/if}
    </div>

    <p
      class="m-0 mt-2 font-serif text-[clamp(1.15rem,2.8vw,1.45rem)] font-semibold leading-snug tracking-tight text-slate-900"
      lang="sk"
    >
      {line.slovak}
    </p>

    {#if englishVisible}
      <p class="m-0 mt-1.5 text-sm leading-relaxed text-slate-600">{line.english}</p>
    {:else if line.english}
      <button
        class="mt-2 cursor-pointer border-0 bg-transparent p-0 text-left text-xs font-semibold tracking-wide text-blue-700 underline decoration-blue-700/30 underline-offset-2 transition-colors hover:text-blue-900 hover:decoration-blue-900/50"
        type="button"
        onclick={revealEnglish}
      >
        Show English
      </button>
    {/if}
  </article>
</li>

<style>
  .story-line-prep {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
    filter: blur(4px);
  }

  .story-line-in {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
    transition:
      opacity 420ms cubic-bezier(0.2, 0, 0, 1),
      transform 420ms cubic-bezier(0.2, 0, 0, 1),
      filter 420ms cubic-bezier(0.2, 0, 0, 1);
  }

  .story-line-past {
    opacity: 0.72;
    transition: opacity 360ms cubic-bezier(0.2, 0, 0, 1);
  }

  .story-line-newest {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .story-line-prep,
    .story-line-in,
    .story-line-past {
      opacity: 1;
      transform: none;
      filter: none;
      transition: none;
    }
  }
</style>
