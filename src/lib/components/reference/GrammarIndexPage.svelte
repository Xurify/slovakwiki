<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import { grammarEntries } from "$lib/catalog/entries";
  import { sentenceCase } from "$lib/catalog/search/ui";
  import type { GrammarTopic } from "$lib/catalog/types";
  import { cx } from "$lib/ui/classes";

  type GrammarGroup = (typeof groups)[number];

  const groups = ["Nouns", "Verbs", "Numbers", "Sentence building"] as const;

  const groupPurpose: Record<GrammarGroup, string> = {
    Nouns: "Gender and cases — how nouns change in a sentence.",
    Verbs: "Present forms, byť / mať, and aspect pairs.",
    Numbers: "Counting, quantity agreement, and clock time.",
    "Sentence building": "Word order, formality, negation, and questions.",
  };

  const groupAnchor: Record<GrammarGroup, string> = {
    Nouns: "group-nouns",
    Verbs: "group-verbs",
    Numbers: "group-numbers",
    "Sentence building": "group-sentence-building",
  };

  const chapters = groups.map((group, index) => ({
    group,
    number: String(index + 1).padStart(2, "0"),
    topics: grammarEntries.filter((topic) => topic.pathGroup === group),
  }));

  function blurb(topic: GrammarTopic): string {
    return topic.summary.trim() || topic.lookFor.trim();
  }

  const contentsLinkClass = cx(
    "group flex h-full flex-col border-t-2 border-slate-300 pt-3 no-underline",
    "transition-colors hover:border-blue-600",
    "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600",
  );

  const topicRowClass = cx(
    "group grid gap-x-8 gap-y-3 px-6 py-5 no-underline transition-colors",
    "hover:bg-blue-50/40 md:grid-cols-[minmax(0,1fr)_13.5rem] md:items-center",
    "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-600",
    "max-[560px]:px-4",
  );
</script>

<main class="py-14 pb-24 max-[600px]:py-8">
  <PageShell class="max-w-[1080px]">
    <header class="grid gap-x-12 gap-y-4 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-end">
      <div>
        <h1 class="text-balance">Grammar</h1>

        <Lead class="max-w-[34rem] text-pretty">
          Short explanations of the patterns you meet in the lessons — what changes, why,
          and real sentences that show it.
        </Lead>
      </div>

      <p class="m-0 text-sm leading-relaxed text-slate-600 lg:pb-1.5 lg:text-right">
        New to terms like <em>case</em> or <em>aspect</em>?
        <TextLink class="inline-flex items-center gap-1" href="/glossary">
          Open the glossary <ArrowRight />
        </TextLink>
      </p>
    </header>

    <nav class="mt-12" aria-label="Grammar contents">
      <ol
        class="m-0 grid list-none grid-cols-2 gap-x-6 gap-y-6 p-0 max-[600px]:gap-x-4 max-[600px]:gap-y-4 lg:grid-cols-4"
      >
        {#each chapters as chapter (chapter.group)}
          <li>
            <a class={contentsLinkClass} href="#{groupAnchor[chapter.group]}">
              <span
                class="font-sans text-xs font-bold tracking-[0.12em] text-slate-500 tabular-nums group-hover:text-blue-800"
              >
                {chapter.number}
              </span>

              <span
                class="mt-1.5 font-serif text-xl leading-tight tracking-tight text-slate-900 group-hover:text-blue-800"
              >
                {chapter.group}
              </span>

              <span
                class="mt-2 text-sm leading-relaxed text-slate-600 max-[600px]:hidden"
              >
                {chapter.topics.map((topic) => sentenceCase(topic.english)).join(" · ")}
              </span>
            </a>
          </li>
        {/each}
      </ol>
    </nav>

    <div class="mt-20 grid gap-20 max-[600px]:mt-14 max-[600px]:gap-14">
      {#each chapters as chapter (chapter.group)}
        <section
          id={groupAnchor[chapter.group]}
          class="grid scroll-mt-24 gap-x-12 gap-y-6 lg:grid-cols-[15rem_minmax(0,1fr)]"
          aria-labelledby="{groupAnchor[chapter.group]}-heading"
        >
          <div class="lg:sticky lg:top-24 lg:self-start">
            <p
              class="m-0 font-serif text-[3.25rem] leading-none text-blue-600/35 tabular-nums max-[600px]:text-[2.5rem]"
              aria-hidden="true"
            >
              {chapter.number}
            </p>

            <h2
              id="{groupAnchor[chapter.group]}-heading"
              class="m-0 mt-3 text-[1.75rem] leading-tight tracking-tight text-balance"
            >
              {chapter.group}
            </h2>

            <p
              class="m-0 mt-2 max-w-[22rem] text-sm leading-relaxed text-pretty text-slate-600"
            >
              {groupPurpose[chapter.group]}
            </p>

            <p class="m-0 mt-3 text-xs text-slate-500 tabular-nums">
              {chapter.topics.length}
              {chapter.topics.length === 1 ? "topic" : "topics"}
            </p>

            {#if chapter.group === "Numbers"}
              <TextLink
                class="mt-4 inline-flex items-center gap-1 text-sm"
                href="/grammar/telling-time#clock-drill"
              >
                Practice the clock <ArrowRight />
              </TextLink>
            {/if}
          </div>

          <ul
            class="m-0 list-none divide-y divide-slate-200/70 overflow-hidden rounded-(--frame-radius) bg-surface p-0 shadow-(--shadow-border)"
          >
            {#each chapter.topics as topic (topic.slug)}
              {@const example = topic.examples[0]}

              <li>
                <a class={topicRowClass} href="/grammar/{topic.slug}">
                  <span class="min-w-0">
                    <span class="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                      <span
                        class="font-serif text-xl leading-snug font-semibold tracking-tight text-slate-900 group-hover:text-blue-800"
                      >
                        {sentenceCase(topic.english)}
                      </span>

                      <span class="inline-flex items-baseline gap-2.5">
                        <span class="font-serif text-base text-blue-800" lang="sk">
                          {topic.slovak}
                        </span>

                        <ArrowRight class="text-slate-400 group-hover:text-blue-800" />
                      </span>
                    </span>

                    <span
                      class="mt-1.5 block max-w-[46ch] text-sm leading-relaxed text-pretty text-slate-600"
                    >
                      {blurb(topic)}
                    </span>
                  </span>

                  {#if example}
                    <span
                      class="block border-slate-200 max-md:border-t max-md:pt-3 md:border-l md:py-1 md:pl-5"
                    >
                      <span
                        class="block font-serif text-[0.98rem] leading-snug text-slate-900 italic"
                        lang="sk"
                      >
                        {example.slovak}
                      </span>

                      <span class="mt-0.5 block text-xs leading-snug text-slate-500">
                        {example.english}
                      </span>
                    </span>
                  {/if}
                </a>
              </li>
            {/each}
          </ul>
        </section>
      {/each}
    </div>
  </PageShell>
</main>
