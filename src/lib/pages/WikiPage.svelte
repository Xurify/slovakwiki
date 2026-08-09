<script lang="ts">
  import type { Snippet } from "svelte";

  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  let { browse }: { browse?: Snippet } = $props();
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[880px]">
    <header class="max-w-[640px]">
      <h1>Dictionary</h1>
      <Lead>
        Search or browse every lemma by letter and part of speech. Featured is a short
        curated starter set; Common is the SNK top 500 per list. For full ranked lists,
        open Most common.
      </Lead>
      <p class="mt-4 text-sm text-slate-500">
        Also browse the
        <TextLink href="/dictionary/common/noun"
          >most common verbs, nouns, adjectives, and adverbs</TextLink
        >.
      </p>
    </header>

    {#if browse}
      {@render browse()}
    {/if}

    <nav
      class="mt-14 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-200 pt-8 text-sm"
      aria-label="Other reference"
    >
      <TextLink href="/dictionary/common/noun">Most common</TextLink>
      <TextLink href="/grammar">Grammar</TextLink>
      <TextLink href="/pronunciation">Pronunciation</TextLink>
      <TextLink href="/glossary">Glossary</TextLink>
      <TextLink href="/references">References</TextLink>
      <TextLink href="/downloads">Downloads</TextLink>
      <TextLink href="/lessons">Lessons</TextLink>
    </nav>
  </PageShell>
</main>
