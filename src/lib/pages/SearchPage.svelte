<script lang="ts">
  import Button from "$lib/components/ui/Button.svelte";
  import Eyebrow from "$lib/components/ui/Eyebrow.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  import EntryCard from "$lib/components/EntryCard.svelte";
  import { searchEntries } from "$lib/content/search";

  let { query = "" }: { query?: string } = $props();

  let results = $derived(searchEntries(query));
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[880px]">
    <nav class="mb-6 flex gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
      <TextLink href="/wiki">Dictionary</TextLink>
      <span aria-hidden="true">/</span>
      <span>Search</span>
    </nav>

    <header class="max-w-[640px]">
      <Eyebrow>Search</Eyebrow>
      <h1>{query ? `Results for “${query}”` : "Search the reference"}</h1>
      <p
        class="mt-3 font-serif text-sm text-slate-600"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {results.length}
        {results.length === 1 ? "entry" : "entries"} found. Slovak diacritics are optional.
      </p>
    </header>

    <section class="mt-10" aria-labelledby="results-heading">
      {#if results.length}
        <div
          class="flex items-baseline justify-between gap-5 border-b border-slate-200 pb-3"
        >
          <h2 id="results-heading" class="text-xl">Matches</h2>
          <TextLink href="/wiki">Complete index</TextLink>
        </div>
        <div>
          {#each results as entry (entry.slug)}
            <EntryCard {entry} />
          {/each}
        </div>
      {:else}
        <div class="max-w-[520px] py-12">
          <Eyebrow>No result</Eyebrow>
          <h2 id="results-heading" class="mt-2">No matching entry yet</h2>
          <p class="font-serif text-slate-600">
            Try an English meaning, a shorter Slovak word, or the complete index.
          </p>
          <Button class="mt-5" href="/wiki">Browse the dictionary</Button>
        </div>
      {/if}
    </section>
  </PageShell>
</main>
