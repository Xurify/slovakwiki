<script lang="ts">
  import AudioButton from "$lib/audio/AudioButton.svelte";
  import MarkedText from "$lib/components/learning/MarkedText.svelte";
  import LessonCharacterAvatar from "$lib/components/lessons/LessonCharacterAvatar.svelte";
  import { isLearnerSpeaker } from "$lib/lesson-story/story-cast";
  import { stopStoryLineAudio } from "$lib/lesson-story/story-audio";
  import type { DialogueTurn } from "$lib/learning/types";

  /**
   * One line of a lesson dialogue, laid out like a script: portrait, speaker,
   * the Slovak line, its English underneath. The learner's own lines carry a
   * light blue tint; every row enters with the shared `animate-rise`.
   */
  let {
    audioSrc,
    line,
    newest = false,
    showEnglish = false,
  }: {
    audioSrc?: string;
    line: DialogueTurn;
    /** Marks the row the teach step scrolls to after a reveal. */
    newest?: boolean;
    /** When true, English gloss is always visible. */
    showEnglish?: boolean;
  } = $props();

  const learner = $derived(isLearnerSpeaker(line.speaker));
  const audioText = $derived(line.audio?.transcript ?? line.slovak);
  let englishOpen = $state(false);

  const englishVisible = $derived(showEnglish || englishOpen);

  function revealEnglish(): void {
    englishOpen = true;
  }
</script>

<li
  class="flex animate-rise list-none gap-3 border-b border-slate-200/70 px-4 py-4 last:border-b-0 sm:px-5 {learner
    ? 'bg-blue-50/40'
    : ''} {newest ? 'story-line-newest' : ''}"
  data-story-en-open={englishVisible ? "" : undefined}
  aria-label={englishVisible
    ? `${line.speaker}: ${line.slovak}. ${line.english}`
    : `${line.speaker}: ${line.slovak}`}
>
  <LessonCharacterAvatar speaker={line.speaker} size="sm" class="mt-0.5" />

  <div class="flex min-w-0 flex-1 items-start justify-between gap-3">
    <div class="min-w-0">
      <p
        class="m-0 text-[0.64rem] font-bold tracking-[0.14em] uppercase {learner
          ? 'text-blue-800'
          : 'text-slate-500'}"
      >
        {line.speaker}
      </p>

      <p
        class="m-0 mt-1 font-serif text-lg font-semibold leading-snug text-slate-900 sm:text-xl"
      >
        <MarkedText text={line.slovak} marks={line.marks} />
      </p>

      {#if line.english}
        <p class="story-en-gloss m-0 mt-1 text-sm leading-relaxed text-slate-600">
          {line.english}
        </p>

        <button
          class="story-en-toggle mt-1.5 cursor-pointer border-0 bg-transparent p-0 text-left text-xs font-semibold text-blue-800 underline decoration-blue-800/30 underline-offset-2 transition-colors duration-150 hover:decoration-blue-800"
          type="button"
          onclick={revealEnglish}
        >
          Show English
        </button>
      {/if}
    </div>

    {#if audioSrc}
      <AudioButton
        size="sm"
        src={audioSrc}
        text={audioText}
        label={`Listen: ${line.speaker}`}
        beforePlay={stopStoryLineAudio}
      />
    {/if}
  </div>
</li>
