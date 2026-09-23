<script lang="ts">
  import type { Snippet } from "svelte";

  import ReferenceRailCard from "$lib/components/reference/ReferenceRailCard.svelte";
  import ReferenceRailList from "$lib/components/reference/ReferenceRailList.svelte";
  import {
    referenceCardClass,
    referenceEyebrowClass,
    referencePageGridClass,
  } from "$lib/components/reference/reference-ui";
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";

  import { buildBrowseQueryHref } from "$lib/catalog/dictionary/browse-query";
  import {
    FREQUENCY_PART_OF_SPEECH_LABEL,
    FREQUENCY_PARTS,
  } from "$lib/catalog/frequency/types";

  let { browse }: { browse?: Snippet } = $props();

  const commonLists = FREQUENCY_PARTS.map((part) => ({
    href: `/dictionary/common/${part}`,
    primary: FREQUENCY_PART_OF_SPEECH_LABEL[part],
    secondary: "Ranked by corpus frequency",
  }));

  const moreReference = [
    {
      href: "/grammar",
      primary: "Grammar",
      secondary: "Short explanations of common patterns",
    },
    {
      href: "/pronunciation",
      primary: "Pronunciation",
      secondary: "Sounds, stress, and vowel length",
    },
    {
      href: "/glossary",
      primary: "Glossary",
      secondary: "Short definitions of grammar terms",
    },
    {
      href: "/downloads",
      primary: "Downloads",
      secondary: "Words and examples as CSV, TSV, or JSON",
    },
  ];
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[1080px]">
    <div class={referencePageGridClass}>
      <header class="max-w-xl lg:col-start-1">
        <h1 class="text-balance">Dictionary</h1>

        <Lead class="text-pretty">
          Every word comes with its meaning, real example sentences, and audio. Search in
          English or Slovak, or browse by part of speech and first letter.
        </Lead>
      </header>

      <aside
        class="flex min-w-0 flex-col gap-4 max-lg:order-last lg:sticky lg:top-24 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start"
        aria-label="Where to begin"
      >
        <article class={referenceCardClass} aria-labelledby="dictionary-start-heading">
          <div class="px-5 pt-4 pb-5">
            <p class={referenceEyebrowClass}>New to Slovak?</p>

            <h2
              id="dictionary-start-heading"
              class="m-0 mt-2 font-serif text-xl leading-snug tracking-tight text-balance text-slate-900"
            >
              Start with the starter set
            </h2>

            <p class="m-0 mt-2 text-sm leading-relaxed text-pretty text-slate-600">
              A short, hand-picked list of everyday words, each with example sentences you
              can listen to.
            </p>

            <Button
              href={buildBrowseQueryHref("featured", "all", 1)}
              variant="accent"
              class="mt-5 w-full px-4"
            >
              Browse the starter set
              <ArrowRight />
            </Button>
          </div>
        </article>

        <ReferenceRailCard
          title="Most common words"
          headingId="dictionary-common-heading"
          description="The words you'll meet most, from the Slovak National Corpus."
        >
          <ReferenceRailList items={commonLists} />
        </ReferenceRailCard>

        <ReferenceRailCard title="More reference" headingId="dictionary-more-heading">
          <ReferenceRailList items={moreReference} />
        </ReferenceRailCard>
      </aside>

      <div class="min-w-0 lg:col-start-1">
        {#if browse}
          {@render browse()}
        {/if}
      </div>
    </div>
  </PageShell>
</main>
