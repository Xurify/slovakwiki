<script lang="ts">
  import { cx, shell } from "$lib/ui/classes";

  import { grammarEntries } from "$lib/content/data";

  const groups = ["Nouns", "Verbs", "Sentences"] as const;
</script>

<main>
  <header class="border-b border-slate-200 bg-slate-50 py-7">
    <div class={shell}>
      <p class="mb-4 text-xs font-semibold uppercase tracking-wide text-blue-700">
        Reference / Grammar
      </p>
      <h1 class="text-5xl font-semibold tracking-tight text-slate-900">Grammar</h1>
      <p class="mt-3 max-w-2xl font-serif text-base text-slate-700">
        Rules and patterns for understanding Slovak sentences.
        <a class="text-blue-700 underline underline-offset-2" href="/grammar/terms"
          >Language terms →</a
        >
      </p>
    </div>
  </header>

  <section class={cx(shell, "max-w-5xl", "space-y-7", "py-8", "pb-16")} aria-label="Grammar topics">
    {#each groups as group (group)}
      {@const topics = grammarEntries.filter((topic) => topic.pathGroup === group)}
      {#if topics.length}
        <section>
          <h2 class="border-b border-slate-300 pb-2 text-xl font-semibold text-slate-900">
            {group}
          </h2>
          <div class="border-b border-slate-200">
            {#each topics as topic (topic.slug)}
              <a
                class="group grid min-h-[4.25rem] grid-cols-[minmax(150px,.76fr)_minmax(135px,.62fr)_minmax(0,1.5fr)_18px] items-center gap-[18px] border-t border-slate-200 px-3 py-3 hover:bg-slate-50 max-[650px]:grid-cols-[1fr_16px] max-[650px]:gap-x-2.5 max-[650px]:gap-y-1 max-[650px]:py-3"
                href="/grammar/{topic.slug}"
              >
                <strong class="font-serif text-base text-blue-800 hover:underline"
                  >{topic.english}</strong
                >
                <span class="font-serif text-sm text-slate-500 max-[650px]:col-start-1" lang="sk"
                  >{topic.slovak}</span
                >
                <p class="m-0 font-serif text-sm leading-5 text-slate-700 max-[650px]:col-start-1">
                  {topic.summary}
                </p>
                <i
                  class="text-xl not-italic text-blue-600 transition duration-150 ease-out group-hover:translate-x-[0.15rem] group-hover:text-(--accent-dark) max-[650px]:col-start-2 max-[650px]:row-span-3"
                  aria-hidden="true">›</i
                >
              </a>
            {/each}
          </div>
        </section>
      {/if}
    {/each}
  </section>
</main>
