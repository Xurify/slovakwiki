<script lang="ts">
  import AudioButton from "$lib/components/AudioButton.svelte";
  import type { DialogueTurn } from "$lib/content/learning-types";

  let { scene }: { scene: DialogueTurn[] } = $props();
</script>

<div class="border-t border-slate-200" aria-label="Lesson dialogue">
  {#each scene as line (line.id)}
    <article
      class="grid grid-cols-[92px_minmax(0,1fr)_minmax(160px,0.7fr)] items-baseline gap-4 border-b border-slate-200 px-3 py-4 odd:bg-slate-50 max-[640px]:grid-cols-1 max-[640px]:gap-1"
    >
      <div
        class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700"
      >
        <span>{line.speaker}</span><AudioButton
          src={line.audio?.src}
          text={line.audio?.transcript ?? line.slovak}
        />
      </div>
      <p class="m-0 font-serif text-lg font-semibold leading-6 text-slate-900" lang="sk">
        {line.slovak}
      </p>
      <small class="text-xs leading-5 text-slate-500">{line.english}</small>
    </article>
  {/each}
</div>
