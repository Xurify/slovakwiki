<script lang="ts">
  import { eyebrowClass, iconButtonClass } from "$lib/components/ui/system-ui";
  import MarkedText from "$lib/components/learning/MarkedText.svelte";
  import LessonCharacterAvatar from "$lib/components/lessons/LessonCharacterAvatar.svelte";
  import type { DialogueTurn } from "$lib/learning/types";

  /** One transcript row: portrait, speaker, the line, and a play-from-here control. */
  let {
    current = false,
    line,
    number,
    onpause,
    onplay,
    playing = false,
    showEnglish = false,
  }: {
    current?: boolean;
    line: DialogueTurn;
    number: number;
    onpause: () => void;
    onplay: () => void;
    /** The podcast is playing this line right now. */
    playing?: boolean;
    showEnglish?: boolean;
  } = $props();

  let englishOpen = $state(false);

  const englishVisible = $derived(showEnglish || englishOpen);
</script>

<li
  class="flex list-none gap-3 border-b border-slate-200/70 px-4 py-3.5 last:border-b-0 sm:px-5 {current
    ? 'bg-blue-50/40'
    : ''}"
  data-episode-line={line.id}
  aria-current={current ? "true" : undefined}
>
  <LessonCharacterAvatar speaker={line.speaker} size="sm" class="mt-0.5" />

  <div class="flex min-w-0 flex-1 items-start justify-between gap-3">
    <div class="min-w-0">
      <p class="{eyebrowClass} {current ? 'text-blue-800' : 'text-slate-500'}">
        {line.speaker}
      </p>

      <p
        class="m-0 mt-1 font-serif text-lg font-semibold leading-snug text-slate-900 sm:text-xl"
      >
        <MarkedText text={line.slovak} marks={line.marks} />
      </p>

      {#if englishVisible}
        <p class="m-0 mt-1 text-sm leading-relaxed text-slate-600">{line.english}</p>
      {:else}
        <button
          class="mt-1.5 cursor-pointer border-0 bg-transparent p-0 text-left text-xs font-semibold text-blue-800 underline decoration-blue-800/30 underline-offset-2 transition-colors duration-150 hover:decoration-blue-800"
          type="button"
          onclick={() => (englishOpen = true)}
        >
          Show English
        </button>
      {/if}
    </div>

    <button
      class="{iconButtonClass} size-9 rounded-full {playing
        ? 'bg-blue-600 text-paper hover:bg-blue-700'
        : 'bg-subtle text-blue-800 hover:bg-blue-50'}"
      type="button"
      aria-label={playing ? `Pause at line ${number}` : `Play from line ${number}`}
      aria-pressed={playing}
      onclick={playing ? onpause : onplay}
    >
      <svg
        class="size-4"
        viewBox="0 0 24 24"
        fill="currentColor"
        stroke="none"
        aria-hidden="true"
      >
        {#if playing}
          <rect x="7" y="6" width="3.5" height="12" rx="1" />
          <rect x="13.5" y="6" width="3.5" height="12" rx="1" />
        {:else}
          <path d="M8 5.5v13l10-6.5Z" />
        {/if}
      </svg>
    </button>
  </div>
</li>
