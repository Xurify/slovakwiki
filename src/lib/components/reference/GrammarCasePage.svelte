<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import GrammarExampleList from "$lib/components/reference/GrammarExampleList.svelte";
  import ReferenceRailCard from "$lib/components/reference/ReferenceRailCard.svelte";
  import ReferenceRailList from "$lib/components/reference/ReferenceRailList.svelte";
  import ReferenceTopicNav from "$lib/components/reference/ReferenceTopicNav.svelte";
  import {
    referenceCardClass,
    referenceH2Class,
    referencePageGridClass,
    referenceRailClass,
    referenceSectionClass,
  } from "$lib/components/reference/reference-ui";
  import { caseTopics } from "$lib/catalog/entries";
  import { caseNeighbors } from "$lib/catalog/reference/grammar-path";
  import type { CaseTopic } from "$lib/catalog/types";

  let { data }: { data: { topic: CaseTopic } } = $props();

  const topic = $derived(data.topic);
  const neighbors = $derived(caseNeighbors(topic));
  const step = $derived(caseTopics.findIndex((entry) => entry.slug === topic.slug) + 1);

  const caseItems = $derived(
    caseTopics.map((entry) => ({
      current: entry.slug === topic.slug,
      href: `/grammar/cases/${entry.slug}`,
      primary: entry.name,
      secondary: entry.question,
    })),
  );

  const examples = $derived(
    topic.examples.map((example) => ({
      english: example.english,
      note: example.note,
      practiceItemId: example.practiceItemId,
      slovak: example.slovak,
    })),
  );
</script>

<main class="py-10 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[1080px]">
    <div class={referencePageGridClass}>
      <article class="min-w-0 max-w-[700px]">
        <nav
          class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500"
          aria-label="Breadcrumb"
        >
          <TextLink class="text-xs" href="/grammar">Grammar</TextLink>
          <span aria-hidden="true">/</span>
          <TextLink class="text-xs" href="/grammar/cases-overview">Cases</TextLink>

          {#if step > 0}
            <span class="text-slate-400" aria-hidden="true">·</span>
            <span class="tabular-nums">Case {step} of {caseTopics.length}</span>
          {/if}
        </nav>

        <header class="mt-5">
          <h1 class="text-balance">{topic.name}</h1>
          <p class="m-0 mt-2 font-serif text-lg text-blue-800">{topic.question}</p>
          <Lead class="text-pretty">{topic.summary}</Lead>
        </header>

        {#if topic.status === "ready"}
          <section class={referenceSectionClass} aria-labelledby="case-role-heading">
            <h2 id="case-role-heading" class={referenceH2Class}>Role in a sentence</h2>

            <div class="mt-4 grid gap-3">
              {#each topic.body as paragraph (paragraph)}
                <p
                  class="m-0 max-w-[62ch] font-serif leading-relaxed text-pretty text-slate-700"
                >
                  {paragraph}
                </p>
              {/each}
            </div>
          </section>

          <section class={referenceSectionClass} aria-labelledby="case-examples-heading">
            <h2 id="case-examples-heading" class={referenceH2Class}>Examples</h2>

            <div class="mt-5">
              <GrammarExampleList {examples} />
            </div>
          </section>
        {:else}
          <section
            class="{referenceCardClass} mt-10 px-5 py-4"
            aria-labelledby="case-draft-heading"
          >
            <h2 id="case-draft-heading" class="m-0 font-serif text-lg text-slate-900">
              Build this reference
            </h2>
            <p class="m-0 mt-1 max-w-[62ch] text-sm leading-relaxed text-slate-600">
              This case has its own page now. Add the researched rule, common
              prepositions, endings, and examples here when ready.
            </p>
          </section>
        {/if}

        {#if topic.researchPrompts.length}
          <section class={referenceSectionClass} aria-labelledby="case-try-heading">
            <h2 id="case-try-heading" class={referenceH2Class}>
              {topic.status === "ready" ? "Try it yourself" : "What to add"}
            </h2>

            <ul
              class="{referenceCardClass} m-0 mt-5 list-none divide-y divide-slate-200/70 p-0"
            >
              {#each topic.researchPrompts as prompt (prompt)}
                <li class="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-3 px-5 py-3.5">
                  <span class="mt-0.5 text-sm font-bold text-blue-800" aria-hidden="true"
                    >→</span
                  >
                  <p class="m-0 text-sm leading-relaxed text-pretty text-slate-700">
                    {prompt}
                  </p>
                </li>
              {/each}
            </ul>
          </section>
        {/if}

        <ReferenceTopicNav
          {neighbors}
          nextLabel="Next case"
          previousLabel="Previous case"
          slovakNames={false}
        />

        <p
          id="source"
          class="m-0 mt-10 scroll-mt-24 text-xs leading-relaxed text-slate-500"
        >
          Source:
          <a
            class="text-blue-800 underline underline-offset-2"
            href={topic.source}
            rel="noopener noreferrer"
            target="_blank"
          >
            Jazykovedný ústav Ľudovíta Štúra SAV ↗
          </a>
          <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
          Full attribution on
          <a class="text-blue-800 underline underline-offset-2" href="/references"
            >References</a
          >.
        </p>
      </article>

      <aside class={referenceRailClass} aria-label="All cases">
        <ReferenceRailCard
          title="The six cases"
          headingId="case-rail-heading"
          description="Each case marks a different role in the sentence."
        >
          <ReferenceRailList items={caseItems} />

          <a
            class="flex items-center justify-center gap-1.5 border-t border-slate-200/70 px-5 py-3 text-sm font-bold text-blue-800 no-underline hover:underline"
            href="/grammar/cases-overview"
          >
            Cases overview
            <ArrowRight />
          </a>
        </ReferenceRailCard>
      </aside>
    </div>
  </PageShell>
</main>
