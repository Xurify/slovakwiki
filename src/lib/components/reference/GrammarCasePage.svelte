<script lang="ts">
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import GrammarExampleList from "$lib/components/reference/GrammarExampleList.svelte";
  import GrammarTopicSection from "$lib/components/reference/GrammarTopicSection.svelte";
  import {
    grammarCardClass,
    grammarEyebrowClass,
    grammarRowsClass,
  } from "$lib/components/reference/grammar-topic-ui";
  import { caseTopics } from "$lib/catalog/entries";
  import { motifArtSrc } from "$lib/catalog/motifs/art";
  import { grammarMotifId } from "$lib/catalog/reference/grammar-motifs";
  import { grammarEntries } from "$lib/catalog/reference/grammar";
  import type { CaseTopic } from "$lib/catalog/types";
  import { cx } from "$lib/ui/classes";

  let { data }: { data: { topic: CaseTopic } } = $props();

  const topic = $derived(data.topic);

  const overview = grammarEntries.find((entry) => entry.slug === "cases-overview");
  const roles = new Map(
    (overview?.caseOverview ?? []).map((item) => [item.slug, item.role] as const),
  );

  const question = $derived.by(() => {
    const [sk = "", en] = topic.question.split(" · ");
    return { sk, en };
  });

  const position = $derived(caseTopics.findIndex((entry) => entry.slug === topic.slug));

  /** Case notes explain the example, so they read as "what this shows". */
  const examples = $derived(
    topic.examples.map((example) => ({
      ...example,
      demonstrates: example.demonstrates ?? example.note,
      note: undefined,
    })),
  );

  const caseLinkClass =
    "group grid grid-cols-[1.25rem_minmax(0,1fr)] items-baseline gap-2 px-5 py-2 text-sm no-underline transition-colors hover:bg-slate-50";
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[1080px]">
    <div class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:gap-x-12 lg:gap-y-12">
      <header class="max-w-2xl lg:col-start-1">
        <nav
          class="mb-5 flex flex-wrap gap-2 text-xs text-slate-500"
          aria-label="Breadcrumb"
        >
          <TextLink href="/grammar">Grammar</TextLink>
          <span aria-hidden="true">/</span>
          <TextLink href="/grammar/cases-overview">Cases</TextLink>
        </nav>

        <p class={grammarEyebrowClass}>
          Case {position + 1} of {caseTopics.length}
          {#if roles.get(topic.slug)}
            <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
            {roles.get(topic.slug)}
          {/if}
        </p>

        <h1 class="mt-2 text-balance">{topic.name}</h1>

        <p class="m-0 mt-2 text-lg text-slate-500">
          <span class="font-serif text-xl text-blue-800" lang="sk">{question.sk}</span>
          {#if question.en}
            <span class="ml-1">{question.en}</span>
          {/if}
        </p>

        <Lead class="text-pretty">{topic.summary}</Lead>
      </header>

      <aside
        class="flex flex-col gap-4 max-lg:order-1 lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start"
        aria-label="All cases"
      >
        <nav class={grammarCardClass} aria-label="The six cases">
          <div class="relative h-28 overflow-hidden border-b border-slate-200/70">
            <img
              src={motifArtSrc(grammarMotifId("cases-overview"))}
              alt=""
              width="512"
              height="512"
              decoding="async"
              class="absolute inset-0 size-full object-cover"
            />
          </div>

          <p class={cx(grammarEyebrowClass, "px-5 pt-4 pb-1.5")}>The six cases</p>

          <ol class="m-0 list-none p-0 pb-2">
            {#each caseTopics as entry, index (entry.slug)}
              {@const current = entry.slug === topic.slug}

              <li>
                <a
                  class={cx(caseLinkClass, current && "bg-blue-50/70")}
                  href="/grammar/cases/{entry.slug}"
                  aria-current={current ? "page" : undefined}
                >
                  <span class="font-serif text-xs text-slate-400 tabular-nums">
                    {index + 1}
                  </span>

                  <span
                    class={cx(
                      "min-w-0 group-hover:text-blue-800",
                      current ? "font-semibold text-slate-900" : "text-slate-700",
                    )}
                  >
                    {entry.name}
                  </span>
                </a>
              </li>
            {/each}
          </ol>

          <p class="m-0 border-t border-slate-200/70 px-5 py-3 text-sm">
            <TextLink href="/grammar/cases-overview#cases">Compare all six</TextLink>
          </p>
        </nav>
      </aside>

      <div class="min-w-0 space-y-12 lg:col-start-1">
        {#if topic.status === "ready"}
          <GrammarTopicSection id="role" title="Role in a sentence">
            <div class="flex max-w-[62ch] flex-col gap-3">
              {#each topic.body as paragraph (paragraph)}
                <p
                  class="m-0 font-serif text-lg leading-relaxed text-pretty text-slate-900"
                >
                  {paragraph}
                </p>
              {/each}
            </div>
          </GrammarTopicSection>

          <GrammarTopicSection id="examples" title="In real sentences">
            <GrammarExampleList {examples} />
          </GrammarTopicSection>
        {:else}
          <section class={cx(grammarCardClass, "px-5 py-4")}>
            <h2 class="m-0 font-serif text-xl text-slate-900">Coming soon</h2>

            <p class="m-0 mt-1.5 max-w-[62ch] text-sm leading-relaxed text-slate-600">
              This case page is still being written. The cases overview has its role and
              question words.
            </p>
          </section>
        {/if}

        {#if topic.researchPrompts.length > 0}
          <GrammarTopicSection
            id="try"
            title="Try it yourself"
            intro="Small tasks to do with your own Slovak reading."
          >
            <ul class={cx(grammarCardClass, grammarRowsClass)}>
              {#each topic.researchPrompts as prompt (prompt)}
                <li
                  class="grid grid-cols-[1rem_minmax(0,1fr)] gap-3 px-5 py-3 text-sm leading-relaxed text-slate-700"
                >
                  <span class="text-slate-400" aria-hidden="true">→</span>
                  {prompt}
                </li>
              {/each}
            </ul>
          </GrammarTopicSection>
        {/if}

        <p id="source" class="m-0 text-sm text-slate-500">
          Source:
          <TextLink href={topic.source} rel="noopener noreferrer" target="_blank">
            Jazykovedný ústav Ľudovíta Štúra SAV ↗
          </TextLink>
          <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
          Full attribution on <TextLink href="/references">References</TextLink>.
        </p>
      </div>
    </div>
  </PageShell>
</main>
