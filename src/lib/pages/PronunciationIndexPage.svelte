<script lang="ts">
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";

  import { pronunciationEntries } from "$lib/content/data";
  import { sentenceCase } from "$lib/content/search-ui";

  const groups = ["Rhythm", "Vowels", "Consonants", "Spelling"] as const;

  const panelClass =
    "overflow-hidden rounded-(--frame-radius) bg-surface ring-1 ring-inset ring-slate-200";

  const rowLinkClass =
    "block border-b border-slate-200 px-4 py-4 transition-colors last:border-b-0 hover:bg-blue-50/50";
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[880px]">
    <header class="max-w-[640px]">
      <h1>Pronunciation</h1>
      <Lead>Sounds, stress, vowel length, and marked consonants in Slovak.</Lead>
    </header>

    <div class="mt-12 space-y-10" aria-label="Pronunciation topics">
      {#each groups as group (group)}
        {@const topics = pronunciationEntries.filter(
          (topic) => topic.pathGroup === group,
        )}
        {#if topics.length}
          <section>
            <h2 class="mb-3 text-xl">{group}</h2>
            <div class={panelClass}>
              {#each topics as topic (topic.slug)}
                <a class={rowLinkClass} href="/pronunciation/{topic.slug}">
                  <strong class="font-serif text-base text-blue-800">
                    {sentenceCase(topic.english)}
                  </strong>
                  <span class="mt-1 block font-serif text-sm text-slate-500" lang="sk">
                    {topic.slovak}
                  </span>
                  <p class="m-0 mt-2 font-serif text-sm leading-relaxed text-slate-600">
                    {topic.summary}
                  </p>
                </a>
              {/each}
            </div>
          </section>
        {/if}
      {/each}
    </div>
  </PageShell>
</main>
