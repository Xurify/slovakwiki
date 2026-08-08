<script lang="ts">
  import AudioButton from "$lib/components/AudioButton.svelte";
  import type { DialogueTurn } from "$lib/content/learning-types";

  let {
    audioSrcs = {},
    mountPrefix,
    scene,
  }: {
    audioSrcs?: Record<string, string>;
    /** When set, render SSR placeholders for AudioMountHost instead of live buttons. */
    mountPrefix?: string;
    scene: DialogueTurn[];
  } = $props();
</script>

<div class="border-t border-slate-200" aria-label="Lesson dialogue">
  {#each scene as line (line.id)}
    {@const text = line.audio?.transcript ?? line.slovak}
    {@const src = audioSrcs[line.id] ?? line.audio?.src}

    <article
      class="grid grid-cols-[5.5rem_2rem_minmax(0,1fr)_minmax(10rem,0.65fr)] items-center gap-x-3 gap-y-1 border-b border-slate-200 px-3 py-3.5 odd:bg-slate-50 max-[640px]:grid-cols-[5.5rem_2rem_minmax(0,1fr)] max-[640px]:gap-y-1"
    >
      <span class="text-xs font-medium text-slate-500">{line.speaker}</span>

      {#if mountPrefix}
        <span
          class="inline-grid size-7 shrink-0 place-items-center"
          data-audio-mount={`${mountPrefix}-${line.id}`}
        ></span>
      {:else}
        <AudioButton size="sm" {src} {text} label={`Listen: ${line.speaker}`} />
      {/if}

      <p
        class="m-0 font-serif text-lg font-semibold leading-6 text-slate-900 max-[640px]:col-span-3"
        lang="sk"
      >
        {line.slovak}
      </p>

      <small
        class="text-xs leading-5 text-slate-500 max-[640px]:col-span-3 max-[640px]:pl-[calc(5.5rem+2rem+0.75rem)]"
      >
        {line.english}
      </small>
    </article>
  {/each}
</div>
