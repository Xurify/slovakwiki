<script lang="ts">
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  let { data } = $props();

  const topic = $derived(data.topic);
</script>

<main class="py-12 pb-20 max-[560px]:py-8">
  <PageShell class="max-w-[760px]">
    <article>
      <nav
        class="mb-6 flex flex-wrap gap-2 text-xs text-slate-500"
        aria-label="Breadcrumb"
      >
        <TextLink href="/grammar">Grammar</TextLink>
        <span aria-hidden="true">/</span>
        <TextLink href="/grammar/cases-overview">Cases</TextLink>
        <span aria-hidden="true">/</span>
        <span>{topic.name}</span>
      </nav>

      <header class="border-b border-slate-200 pb-8">
        <Eyebrow>Slovak cases</Eyebrow>
        <h1>{topic.name}</h1>
        <p class="mt-2 font-serif text-lg text-blue-800">{topic.question}</p>
        <p class="mt-4 font-serif text-lg text-slate-700">{topic.summary}</p>
      </header>

      {#if topic.status === "ready"}
        <section class="scroll-mt-[88px] pt-10">
          <Eyebrow>What it does</Eyebrow>
          <h2 class="mb-4">Role in a sentence</h2>
          {#each topic.body as paragraph (paragraph)}
            <p class="max-w-[66ch] font-serif leading-7 text-slate-700">
              {paragraph}
            </p>
          {/each}
        </section>

        <section class="scroll-mt-[88px] mt-10 border-t border-slate-200 pt-10">
          <Eyebrow>Annotated examples</Eyebrow>
          <h2 class="mb-4">What this shows</h2>
          <ol class="m-0 grid list-none gap-3 p-0">
            {#each topic.examples as example (example.slovak)}
              <li class="grid gap-1 border-l-2 border-blue-800 py-1 pl-5">
                <strong class="font-serif" lang="sk">{example.slovak}</strong>
                <span class="text-sm text-slate-500">{example.english}</span>
                {#if example.note}
                  <small class="mt-1 font-serif text-sm text-blue-800"
                    >{example.note}</small
                  >
                {/if}
              </li>
            {/each}
          </ol>
        </section>
      {:else}
        <section class="mt-10 border-l-2 border-blue-800 py-2 pl-6">
          <Eyebrow>Research draft</Eyebrow>
          <h2 class="mb-3">Build this reference</h2>
          <p class="mb-0 max-w-[66ch] font-serif leading-7 text-slate-700">
            This case has its own page now. Add the researched rule, common prepositions,
            endings, and examples here when ready.
          </p>
        </section>
      {/if}

      {#if topic.researchPrompts.length}
        <section class="mt-10 border-t border-slate-200 pt-10">
          <Eyebrow>
            {topic.status === "ready" ? "Practice prompts" : "Research prompts"}
          </Eyebrow>
          <h2 class="mb-4">
            {topic.status === "ready" ? "Try this next" : "What to add"}
          </h2>
          <ul class="m-0 grid list-none gap-2 p-0">
            {#each topic.researchPrompts as prompt (prompt)}
              <li class="border-b border-slate-200 py-3 font-serif text-slate-700">
                {prompt}
              </li>
            {/each}
          </ul>
        </section>
      {/if}

      <section
        id="source"
        class="mt-10 border-t border-slate-200 pt-10"
        aria-labelledby="source-heading"
      >
        <Eyebrow>Source</Eyebrow>
        <h2 id="source-heading" class="mb-3">Reference</h2>
        <TextLink href={topic.source}>Jazykovedný ústav Ľudovíta Štúra SAV ↗</TextLink>
        <p class="mt-3 text-sm text-slate-500">
          Full attribution on
          <TextLink href="/references">References</TextLink>.
        </p>
      </section>
    </article>
  </PageShell>
</main>
