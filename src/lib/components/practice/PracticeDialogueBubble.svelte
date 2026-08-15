<script lang="ts">
  import AudioButton from "$lib/audio/AudioButton.svelte";
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
</script>

<article
  class="rounded-(--control-radius) border border-slate-200 bg-slate-50/80 px-4 py-3.5"
  aria-label={line.english ? `${line.slovak}. ${line.english}` : line.slovak}
>
  <div class="flex items-start justify-between gap-3">
    <p
      class="m-0 font-serif text-[clamp(1.15rem,2.8vw,1.4rem)] font-semibold leading-snug text-slate-900"
    >
      <span lang="sk">{line.slovak}</span>
    </p>

    <AudioButton size="sm" {src} {text} label={`Listen: ${line.slovak}`} />
  </div>

  {#if line.english}
    <p class="m-0 mt-1.5 text-sm leading-snug text-slate-500">{line.english}</p>
  {/if}
</article>
