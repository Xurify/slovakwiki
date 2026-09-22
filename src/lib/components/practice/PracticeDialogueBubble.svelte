<script lang="ts">
  import AudioButton from "$lib/audio/AudioButton.svelte";
  import MarkedText from "$lib/components/learning/MarkedText.svelte";
  import {
    DIALOGUE_SPEAKER_CLASS,
    dialogueSpeakerLabel,
  } from "$lib/components/practice/dialogue-speaker";
  import type { DialogueTurn } from "$lib/learning/types";

  let {
    audioSrcs = {},
    line,
  }: {
    audioSrcs?: Record<string, string>;
    line: DialogueTurn;
  } = $props();

  const text = $derived(line.audio?.transcript ?? line.slovak);
  const src = $derived(audioSrcs[line.id] ?? line.audio?.src);
  const speakerLabel = $derived(dialogueSpeakerLabel(line.speaker));
  let englishOpen = $state(false);

  const englishVisible = $derived(
    Boolean(line.english) && (!line.englishToggle || englishOpen),
  );
</script>

<article
  class="rounded-(--control-radius) border border-slate-200 bg-slate-50/80 px-4 py-3.5"
  aria-label={line.english ? `${line.slovak}. ${line.english}` : line.slovak}
>
  <div class="flex items-start justify-between gap-3">
    <div class="min-w-0 flex-1">
      {#if speakerLabel}
        <p class="m-0 mb-2 {DIALOGUE_SPEAKER_CLASS}">{speakerLabel}</p>
      {/if}

      <p
        class="m-0 font-serif text-[clamp(1.15rem,2.8vw,1.4rem)] font-semibold leading-snug text-slate-900"
      >
        <MarkedText text={line.slovak} marks={line.marks} />
      </p>
    </div>

    <AudioButton size="sm" {src} {text} label={`Listen: ${line.slovak}`} />
  </div>

  {#if englishVisible}
    <p class="m-0 mt-1.5 text-sm leading-snug text-slate-500">{line.english}</p>
  {:else if line.english && line.englishToggle}
    <button
      class="mt-2 cursor-pointer border-0 bg-transparent p-0 text-left text-xs font-semibold tracking-wide text-blue-700 underline decoration-blue-700/30 underline-offset-2"
      type="button"
      onclick={() => {
        englishOpen = true;
      }}
    >
      Show English
    </button>
  {/if}
</article>
