<script lang="ts">
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";

  import { pronunciationEntries } from "$lib/catalog/entries";
  import { sentenceCase } from "$lib/catalog/search/ui";

  const groups = ["Rhythm", "Vowels", "Consonants", "Spelling"] as const;

  const areas = groups
    .map((group) => ({
      group,
      topics: pronunciationEntries
        .filter((topic) => topic.pathGroup === group)
        .toSorted((a, b) => a.order - b.order),
    }))
    .filter((area) => area.topics.length > 0);
</script>

<main class="py-10 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[800px]">
    <header>
      <h1 class="m-0 text-[1.85rem] leading-tight sm:text-[2.15rem]">Pronunciation</h1>

      <Lead>
        Stress, vowel length, and the consonants English ears miss. Five short topics.
      </Lead>
    </header>

    <div class="mt-8">
      {#each areas as area (area.group)}
        <section
          id={area.group.toLowerCase()}
          class="scroll-mt-24"
          aria-labelledby="{area.group}-heading"
        >
          <h2
            id="{area.group}-heading"
            class="m-0 pt-8 font-serif text-xl tracking-tight text-slate-900"
          >
            {area.group}
          </h2>

          <ul class="m-0 mt-3 list-none border-t border-slate-200 p-0">
            {#each area.topics as topic (topic.slug)}
              <li class="border-b border-slate-200">
                <a
                  class="group grid grid-cols-1 items-baseline gap-x-6 gap-y-0.5 py-3 no-underline sm:grid-cols-[14rem_minmax(0,1fr)]"
                  href="/pronunciation/{topic.slug}"
                >
                  <span>
                    <strong
                      class="font-serif text-lg font-semibold text-slate-900 group-hover:text-blue-800"
                    >
                      {sentenceCase(topic.english)}
                    </strong>
                    <span class="mt-0.5 block text-sm text-slate-500" lang="sk">
                      {topic.slovak}
                    </span>
                  </span>

                  <span class="text-[0.95rem] leading-snug text-slate-600">
                    {topic.summary}
                  </span>
                </a>
              </li>
            {/each}
          </ul>
        </section>
      {/each}
    </div>
  </PageShell>
</main>
