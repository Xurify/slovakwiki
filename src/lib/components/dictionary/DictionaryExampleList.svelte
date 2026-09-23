<script lang="ts">
  import { referenceCardClass } from "$lib/components/reference/reference-ui";

  import { highlightLemmaInText } from "$lib/catalog/dictionary/highlight-lemma";
  import type { Example } from "$lib/catalog/types";

  type ExampleItem = { example: Example; index: number };

  let {
    audioKeyPrefix,
    audioSrcs,
    category,
    items,
    lemma,
  }: {
    /** Mount keys are `${audioKeyPrefix}-e${index}` — must match the page's audio targets. */
    audioKeyPrefix: string;
    audioSrcs: readonly string[];
    category: string;
    items: readonly ExampleItem[];
    lemma: string;
  } = $props();

  const groups = $derived.by(() => {
    if (!items.some((item) => item.example.demonstrates)) {
      return [{ label: "", items: [...items] }];
    }

    const byLabel = new Map<string, ExampleItem[]>();
    for (const item of items) {
      const label = item.example.demonstrates?.trim() || "More examples";
      byLabel.set(label, [...(byLabel.get(label) ?? []), item]);
    }
    return [...byLabel].map(([label, grouped]) => ({ label, items: grouped }));
  });

  const fromTatoeba = $derived(items.some((item) => item.example.note === "Tatoeba"));
</script>

<div class="{referenceCardClass} mt-5">
  {#each groups as group, groupIndex (group.label)}
    {#if group.label}
      <p
        class="m-0 border-b border-slate-200/70 bg-slate-50/70 px-5 py-2 text-xs font-semibold text-slate-600 {groupIndex >
        0
          ? 'border-t'
          : ''}"
      >
        {group.label}
      </p>
    {/if}

    <ul class="m-0 list-none divide-y divide-slate-200/70 p-0">
      {#each group.items as item (`${item.example.slovak}-${item.index}`)}
        <li class="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 px-5 py-4">
          <div class="min-w-0">
            <p class="m-0 font-serif text-lg leading-snug text-slate-900" lang="sk">
              {#each highlightLemmaInText(item.example.slovak, lemma, category) as part, partIndex (`${partIndex}-${part.text}`)}
                {#if part.hit}
                  <span
                    class="rounded-[3px] bg-blue-100 px-0.5 font-semibold text-blue-800"
                    >{part.text}</span
                  >
                {:else}
                  {part.text}
                {/if}
              {/each}
            </p>

            <p class="m-0 mt-1 text-sm leading-relaxed text-slate-600">
              {item.example.english}
            </p>

            {#if item.example.isPracticeFrame}
              <p class="m-0 mt-1.5 text-xs text-slate-500">Practice frame</p>
            {:else if item.example.note === "Tatoeba" && item.example.tatoebaId}
              <p class="m-0 mt-1.5 text-xs">
                <a
                  class="text-slate-500 underline decoration-slate-300 underline-offset-2 hover:text-blue-800"
                  href={`https://tatoeba.org/sentences/show/${item.example.tatoebaId}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Tatoeba #{item.example.tatoebaId}
                </a>
              </p>
            {/if}
          </div>

          {#if audioSrcs[item.index]}
            <span
              class="inline-grid size-8 shrink-0"
              data-audio-mount={`${audioKeyPrefix}-e${item.index}`}
            ></span>
          {/if}
        </li>
      {/each}
    </ul>
  {/each}

  {#if fromTatoeba}
    <p
      class="m-0 border-t border-slate-200/70 bg-slate-50/60 px-5 py-2.5 text-xs text-slate-500"
    >
      Examples from
      <a
        class="text-blue-800 underline underline-offset-2"
        href="https://tatoeba.org/"
        rel="noopener noreferrer"
        target="_blank">Tatoeba</a
      >
      (CC BY 2.0 FR).
    </p>
  {/if}
</div>
