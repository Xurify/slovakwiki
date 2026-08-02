<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";

  import { pronunciationEntries } from "$lib/content/data";
  import { sentenceCase } from "$lib/content/search-documents";

  const groups = ["Rhythm", "Vowels", "Consonants", "Spelling"] as const;

  const rowLinkClass =
    "group grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-b border-slate-200 -mx-4 px-4 py-5 transition-colors hover:bg-[color-mix(in_srgb,var(--surface-subtle)_50%,transparent)] max-[650px]:grid-cols-1";
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[880px]">
    <header class="max-w-[640px]">
      <Eyebrow>Reference</Eyebrow>
      <h1>Pronunciation</h1>
      <Lead>Sounds, stress, vowel length, and marked consonants in Slovak.</Lead>
    </header>

    <div class="mt-12 space-y-12" aria-label="Pronunciation topics">
      {#each groups as group (group)}
        {@const topics = pronunciationEntries.filter(
          (topic) => topic.pathGroup === group,
        )}
        {#if topics.length}
          <section>
            <h2 class="border-b border-slate-200 pb-3 text-xl">{group}</h2>
            <div>
              {#each topics as topic (topic.slug)}
                <a class={rowLinkClass} href="/pronunciation/{topic.slug}">
                  <div class="grid gap-1">
                    <strong class="font-serif text-lg text-blue-800"
                      >{sentenceCase(topic.english)}</strong
                    >
                    <span class="font-serif text-sm text-slate-500" lang="sk"
                      >{topic.slovak}</span
                    >
                    <p
                      class="m-0 max-w-[56ch] font-serif text-sm leading-relaxed text-slate-600"
                    >
                      {topic.summary}
                    </p>
                  </div>
                  <ArrowRight class="mt-1 text-blue-800 max-[650px]:hidden" />
                </a>
              {/each}
            </div>
          </section>
        {/if}
      {/each}
    </div>
  </PageShell>
</main>
