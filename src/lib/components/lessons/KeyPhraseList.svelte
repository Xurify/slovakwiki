<script lang="ts">
  import AudioButton from "$lib/components/AudioButton.svelte";
  import type { KeyPhrase } from "$lib/content/learning-types";

  let { phrases }: { phrases: KeyPhrase[] } = $props();
</script>

<ol class="mt-4 grid list-none grid-cols-2 gap-px overflow-hidden rounded-(--control-radius) border border-slate-200 bg-slate-200 p-0 max-[560px]:grid-cols-1">
  {#each phrases as phrase (phrase.slovak)}
    <li class="grid min-w-0 min-h-[100px] gap-1 bg-(--surface) px-4 py-3.5">
      <div class="flex min-w-0 items-center gap-2.5">
        <strong class="min-w-0 font-serif text-lg text-slate-800" lang="sk">{phrase.slovak}</strong>
        <AudioButton src={phrase.audio?.src} text={phrase.audio?.transcript ?? phrase.slovak} />
      </div>
      <span class="text-sm text-slate-600">{phrase.english}</span>
      {#if phrase.note}<small class="max-w-[37ch] text-sm leading-5 text-slate-500">{phrase.note}</small>{/if}
    </li>
  {/each}
</ol>
