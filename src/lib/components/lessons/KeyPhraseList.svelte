<script lang="ts">
  import AudioButton from "$lib/components/AudioButton.svelte";
  import type { KeyPhrase } from "$lib/content/learning-types";

  let { phrases }: { phrases: KeyPhrase[] } = $props();
</script>

<ol class="mt-[18px] grid list-none grid-cols-2 border-t border-slate-200 p-0 max-[560px]:grid-cols-1">
  {#each phrases as phrase (phrase.slovak)}
    <li class="grid min-h-[100px] gap-1 border-b border-r border-slate-200 px-4 py-3.5 first:border-l max-[560px]:border-l">
      <div class="flex items-center gap-2">
        <strong class="font-serif text-lg text-slate-800" lang="sk">{phrase.slovak}</strong>
        <AudioButton src={phrase.audio?.src} text={phrase.audio?.transcript ?? phrase.slovak} />
      </div>
      <span class="text-xs text-slate-600">{phrase.english}</span>
      {#if phrase.note}<small class="max-w-[37ch] text-xs leading-5 text-slate-500">{phrase.note}</small>{/if}
    </li>
  {/each}
</ol>
