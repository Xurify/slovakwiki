<script lang="ts">
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import GrammarCaseMap from "$lib/components/reference/GrammarCaseMap.svelte";
  import GrammarExampleList from "$lib/components/reference/GrammarExampleList.svelte";
  import {
    grammarHeadingClass,
    grammarProseClass,
  } from "$lib/components/reference/grammar-topic-ui";
  import { caseTopics } from "$lib/catalog/entries";
  import { grammarEntries } from "$lib/catalog/reference/grammar";
  import type { CaseTopic } from "$lib/catalog/types";

  let { data }: { data: { topic: CaseTopic } } = $props();

  const topic = $derived(data.topic);

  const overview = grammarEntries.find((entry) => entry.slug === "cases-overview");
  const caseMap = overview?.caseOverview ?? [];
  const roles = new Map(caseMap.map((item) => [item.slug, item.role] as const));

  const question = $derived.by(() => {
    const [sk = "", en] = topic.question.split(" · ");
    return { sk, en };
  });

  const position = $derived(caseTopics.findIndex((entry) => entry.slug === topic.slug));
  const role = $derived(roles.get(topic.slug));
  const previous = $derived(caseTopics[position - 1]);
  const next = $derived(caseTopics[position + 1]);

  /** Case notes explain the example, so they read as "what this shows". */
  const examples = $derived(
    topic.examples.map((example) => ({
      ...example,
      demonstrates: example.demonstrates ?? example.note,
      note: undefined,
    })),
  );
</script>

<main class="py-10 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[800px]">
    <header>
      <nav
        class="mb-4 flex flex-wrap gap-2 text-xs text-slate-500"
        aria-label="Breadcrumb"
      >
        <TextLink href="/grammar">Grammar</TextLink>
        <span aria-hidden="true">/</span>
        <TextLink href="/grammar/cases-overview">Cases</TextLink>
      </nav>

      <p class="m-0 text-sm text-slate-500">
        Case {position + 1} of {caseTopics.length}
        {#if role}
          <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
          {role}
        {/if}
      </p>

      <h1 class="m-0 mt-1 text-[1.85rem] leading-tight sm:text-[2.15rem]">
        {topic.name}
      </h1>

      <p class="m-0 mt-1 font-serif text-xl text-blue-800" lang="sk">
        {topic.slovakName}
      </p>

      <p class="m-0 mt-3 flex flex-wrap items-baseline gap-x-3">
        <span class="font-serif text-lg text-slate-900" lang="sk">{question.sk}</span>
        {#if question.en}
          <span class="text-[0.95rem] text-slate-600">{question.en}</span>
        {/if}
      </p>

      <p class="m-0 mt-3 max-w-[62ch] text-[1.02rem] leading-relaxed text-slate-600">
        {topic.summary}
      </p>
    </header>

    <section id="role" class="mt-8" aria-labelledby="role-heading">
      <h2 id="role-heading" class={grammarHeadingClass}>Role in a sentence</h2>

      <div class="mt-3 flex flex-col gap-3">
        {#if topic.status === "ready"}
          {#each topic.body as paragraph (paragraph)}
            <p class={grammarProseClass}>{paragraph}</p>
          {/each}
        {:else}
          <p class="m-0 max-w-[62ch] text-[1.02rem] leading-relaxed text-slate-600">
            This case page is still being written. The cases overview has its role and
            question words.
          </p>
        {/if}
      </div>
    </section>

    {#if topic.status === "ready" && examples.length > 0}
      <section id="examples" class="mt-8" aria-labelledby="examples-heading">
        <h2 id="examples-heading" class={grammarHeadingClass}>In real sentences</h2>

        <div class="mt-3">
          <GrammarExampleList {examples} />
        </div>
      </section>
    {/if}

    {#if topic.researchPrompts.length > 0}
      <section id="try" class="mt-8" aria-labelledby="try-heading">
        <h2 id="try-heading" class={grammarHeadingClass}>Try it yourself</h2>

        <ol class="m-0 mt-3 list-none border-t border-slate-200 p-0">
          {#each topic.researchPrompts as prompt, index (prompt)}
            <li
              class="grid grid-cols-[1.5rem_minmax(0,1fr)] items-baseline gap-x-3 border-b border-slate-200 py-2.5"
            >
              <span class="text-sm text-slate-400 tabular-nums">{index + 1}</span>
              <span class="text-[1.02rem] leading-relaxed text-slate-800">{prompt}</span>
            </li>
          {/each}
        </ol>
      </section>
    {/if}

    <section id="cases" class="mt-8" aria-labelledby="cases-heading">
      <h2 id="cases-heading" class={grammarHeadingClass}>The six cases</h2>

      <div class="mt-3">
        <GrammarCaseMap cases={caseMap} current={topic.slug} />
      </div>
    </section>

    <nav
      class="mt-10 grid gap-3 border-t border-slate-200 pt-4 sm:grid-cols-2"
      aria-label="Other cases"
    >
      {#if previous}
        <a
          class="group text-sm no-underline"
          href="/grammar/cases/{previous.slug}"
          rel="prev"
        >
          <span class="text-slate-500">Previous</span>
          <span
            class="mt-0.5 block font-serif text-base text-blue-800 group-hover:underline"
          >
            {previous.name}
          </span>
        </a>
      {/if}

      {#if next}
        <a
          class="group text-sm no-underline sm:col-start-2 sm:text-right"
          href="/grammar/cases/{next.slug}"
          rel="next"
        >
          <span class="text-slate-500">Next</span>
          <span
            class="mt-0.5 block font-serif text-base text-blue-800 group-hover:underline"
          >
            {next.name}
          </span>
        </a>
      {/if}
    </nav>

    <p class="m-0 mt-8 text-sm text-slate-500">
      Source:
      <TextLink href={topic.source} rel="noopener noreferrer" target="_blank">
        Jazykovedný ústav Ľudovíta Štúra SAV ↗
      </TextLink>
      <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
      Full attribution on <TextLink href="/references">References</TextLink>.
    </p>
  </PageShell>
</main>
