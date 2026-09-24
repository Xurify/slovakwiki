<script lang="ts">
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import GrammarCaseMap from "$lib/components/reference/GrammarCaseMap.svelte";
  import GrammarExampleList from "$lib/components/reference/GrammarExampleList.svelte";
  import GrammarHero from "$lib/components/reference/GrammarHero.svelte";
  import GrammarLinkStrip, {
    type StripLink,
  } from "$lib/components/reference/GrammarLinkStrip.svelte";
  import GrammarSection from "$lib/components/reference/GrammarSection.svelte";
  import {
    grammarNoteClass,
    grammarProseClass,
  } from "$lib/components/reference/grammar-topic-ui";
  import { caseTopics } from "$lib/catalog/entries";
  import { motifArtSrc } from "$lib/catalog/motifs/art";
  import { grammarMotifId } from "$lib/catalog/reference/grammar-motifs";
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

  /** Case notes explain the example, so they read as "what this shows". */
  const examples = $derived(
    topic.examples.map((example) => ({
      ...example,
      demonstrates: example.demonstrates ?? example.note,
      note: undefined,
    })),
  );

  const stripLinks = $derived.by(() => {
    const previous = caseTopics[position - 1];
    const next = caseTopics[position + 1];
    const links: StripLink[] = [];

    if (previous) {
      links.push({
        eyebrow: "Previous case",
        label: previous.name,
        href: `/grammar/cases/${previous.slug}`,
        rel: "prev",
      });
    }

    links.push({
      eyebrow: "All cases",
      label: "Compare all six",
      href: "/grammar/cases-overview#cases",
    });

    if (next) {
      links.push({
        eyebrow: "Next case",
        label: next.name,
        href: `/grammar/cases/${next.slug}`,
        rel: "next",
      });
    }

    return links;
  });

  const ready = $derived(topic.status === "ready");
  const hasPrompts = $derived(topic.researchPrompts.length > 0);
</script>

<main class="pb-24 max-[880px]:pb-16">
  <PageShell>
    <GrammarHero
      crumbs={[
        { href: "/grammar", label: "Grammar" },
        { href: "/grammar/cases-overview", label: "Cases" },
      ]}
      eyebrow="Case {position + 1} of {caseTopics.length}{role ? ` · ${role}` : ''}"
      slovak={topic.slovakName}
      english={topic.name}
      summary={topic.summary}
      art={motifArtSrc(grammarMotifId("cases-overview"))}
    >
      <p class="m-0 mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span class="font-serif text-[1.4rem] text-blue-800" lang="sk">{question.sk}</span
        >

        {#if question.en}
          <span class="text-[0.95rem] text-slate-500">{question.en}</span>
        {/if}
      </p>
    </GrammarHero>

    <GrammarLinkStrip links={stripLinks} label="Other cases" />

    <GrammarSection id="role" index="01" label="Role" title="Role in a sentence">
      {#if ready}
        <div class="flex flex-col gap-4">
          {#each topic.body as paragraph (paragraph)}
            <p class={grammarProseClass}>{paragraph}</p>
          {/each}
        </div>
      {:else}
        <p class={grammarNoteClass}>
          This case page is still being written. The cases overview has its role and
          question words.
        </p>
      {/if}
    </GrammarSection>

    {#if ready && examples.length > 0}
      <GrammarSection
        id="examples"
        index="02"
        label="Sentences"
        title="In real sentences"
      >
        <GrammarExampleList {examples} />
      </GrammarSection>
    {/if}

    {#if hasPrompts}
      <GrammarSection
        id="try"
        index={ready && examples.length > 0 ? "03" : "02"}
        label="Try"
        title="Try it yourself"
        intro="Small tasks to do with your own Slovak reading."
      >
        <ol class="m-0 list-none border-t border-slate-200 p-0">
          {#each topic.researchPrompts as prompt, index (prompt)}
            <li
              class="grid grid-cols-[2.25rem_minmax(0,1fr)] items-baseline gap-x-4 border-b border-slate-200 py-4"
            >
              <span
                class="font-serif text-[1.2rem] leading-none font-semibold tracking-[-0.05em] text-slate-300 tabular-nums"
              >
                {index + 1}
              </span>

              <span class="font-serif text-[1.1rem] leading-relaxed text-slate-900">
                {prompt}
              </span>
            </li>
          {/each}
        </ol>
      </GrammarSection>
    {/if}

    <GrammarSection
      id="cases"
      index={String(
        2 + Number(ready && examples.length > 0) + Number(hasPrompts),
      ).padStart(2, "0")}
      label="Cases"
      title="The six cases"
    >
      <GrammarCaseMap cases={caseMap} current={topic.slug} />

      <p class="m-0 mt-12 text-[0.82rem] text-slate-500">
        Source:
        <TextLink href={topic.source} rel="noopener noreferrer" target="_blank">
          Jazykovedný ústav Ľudovíta Štúra SAV ↗
        </TextLink>
        <span class="mx-1 text-slate-400" aria-hidden="true">·</span>
        Full attribution on <TextLink href="/references">References</TextLink>.
      </p>
    </GrammarSection>
  </PageShell>
</main>
