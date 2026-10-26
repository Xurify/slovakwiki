<script lang="ts">
  import { highlightLemmaInText } from "$lib/catalog/dictionary/highlight-lemma";
  import type { Example } from "$lib/catalog/types";

  /**
   * One example sentence: audio host (or a bullet), Slovak with the lemma
   * highlighted, English below, and the Tatoeba credit beside it.
   */
  let {
    example,
    lemma,
    category,
    gender,
    audioKey,
  }: {
    example: Example;
    lemma: string;
    category: string;
    /** Noun gender, so the highlight finds its case forms. */
    gender?: string;
    /** `data-audio-mount` key the audio island fills; omit when there is no clip. */
    audioKey?: string;
  } = $props();

  const parts = $derived(highlightLemmaInText(example.slovak, lemma, category, gender));
</script>

<li
  class="group/row grid grid-cols-[1.75rem_minmax(0,1fr)_auto] items-start gap-x-3 border-b border-slate-200/70 py-3 last:border-b-0 max-[560px]:grid-cols-[1.75rem_minmax(0,1fr)]"
>
  <!-- Centred on the Slovak line's lowercase letters, as in GrammarSentence. -->
  <span class="mt-0.5 grid min-h-7 place-items-center">
    {#if audioKey}
      <span class="inline-grid size-7 place-items-center" data-audio-mount={audioKey}
      ></span>
    {:else}
      <span class="text-xs text-slate-400" aria-hidden="true">•</span>
    {/if}
  </span>

  <div class="min-w-0">
    <p
      class="m-0 pt-0.5 font-serif text-lg leading-snug text-pretty text-slate-900"
      lang="sk"
    >
      {#each parts as part, partIndex (`${partIndex}-${part.text}`)}
        {#if part.hit}
          <span class="rounded-sm bg-mark px-px font-semibold">{part.text}</span>
        {:else}
          {part.text}
        {/if}
      {/each}
    </p>

    <p class="m-0 mt-0.5 text-sm leading-snug text-slate-600">{example.english}</p>
  </div>

  {#if example.note === "Tatoeba" && example.tatoebaId}
    <a
      class="pt-1 text-xs tabular-nums text-slate-500 no-underline transition-colors duration-150 ease-out hover:text-blue-800 max-[560px]:col-start-2 max-[560px]:pt-1.5"
      href={`https://tatoeba.org/sentences/show/${example.tatoebaId}`}
      rel="noopener noreferrer"
      target="_blank"
      title="View on Tatoeba"
    >
      Tatoeba #{example.tatoebaId}
      <span class="sr-only"> (opens in a new tab)</span>
    </a>
  {/if}
</li>
