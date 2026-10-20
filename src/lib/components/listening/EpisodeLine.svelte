<script lang="ts">
  import { grammarMarkClass } from "$lib/components/reference/grammar-topic-ui";
  import { eyebrowClass } from "$lib/components/ui/system-ui";
  import MarkedText from "$lib/components/learning/MarkedText.svelte";
  import LessonCharacterAvatar from "$lib/components/lessons/LessonCharacterAvatar.svelte";
  import type { DialogueTurn } from "$lib/learning/types";
  import { cx } from "$lib/ui/classes";

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
    /** The dialogue is playing this line right now. */
    playing?: boolean;
    showEnglish?: boolean;
  } = $props();
</script>

<li
  class={cx(
    "flex list-none gap-3 border-b border-slate-200/70 px-4 py-3 last:border-b-0 sm:px-5",
    current && "bg-blue-50/40",
  )}
  aria-current={current ? "true" : undefined}
>
  <LessonCharacterAvatar speaker={line.speaker} size="sm" class="mt-0.5" />

  <div class="flex min-w-0 flex-1 items-start justify-between gap-3">
    <div class="min-w-0">
      <p class="{eyebrowClass} {current ? 'text-blue-800' : 'text-slate-500'}">
        {line.speaker}
      </p>

      <p
        class="m-0 mt-1 font-serif text-lg leading-snug font-semibold text-slate-900 sm:text-xl"
      >
        <MarkedText text={line.slovak} marks={line.marks} markClass={grammarMarkClass} />
      </p>

      {#if showEnglish}
        <p class="m-0 mt-1 text-sm leading-relaxed text-slate-600">{line.english}</p>
      {/if}
    </div>

    <button
      class={cx(
        "inline-grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border-0",
        "transition-colors duration-150 ease-out",
        playing
          ? "bg-blue-600 text-paper hover:bg-blue-700"
          : "bg-transparent text-blue-800 hover:bg-blue-50",
      )}
      type="button"
      aria-label={playing ? `Pause line ${number}` : `Play line ${number}`}
      onclick={playing ? onpause : onplay}
    >
      <svg class="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
