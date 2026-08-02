<script lang="ts">
  import { button, cx, shell } from "$lib/ui/classes";

  import EntryCard from "$lib/components/EntryCard.svelte";
  import { searchEntries } from "$lib/content/search";

  let { query = "" }: { query?: string } = $props();
  let results = $derived(searchEntries(query));
</script>

<main>
  <header class="border-b border-slate-200 bg-slate-50 py-8"><div class={shell}><nav class="mb-5 flex gap-2 text-xs text-slate-500" aria-label="Breadcrumb"><a class="text-blue-700 underline underline-offset-2" href="/wiki">Reference index</a><span>/</span><span>Search</span></nav><h1 class="text-4xl font-semibold tracking-tight text-slate-900">{query ? `Results for “${query}”` : "Search the atlas"}</h1><p class="mt-2 font-serif text-sm text-slate-600" role="status" aria-live="polite" aria-atomic="true">{results.length} {results.length === 1 ? "entry" : "entries"} found. Slovak diacritics are optional.</p></div></header>
  <section class={cx(shell, "py-8", "pb-16")} aria-labelledby="results-heading">
    <div class="grid grid-cols-[minmax(0,1fr)_210px] gap-8 max-[760px]:grid-cols-1">
      <div>
        {#if results.length}
          <div class="flex items-baseline justify-between gap-5 border-b border-slate-300 pb-3"><h2 id="results-heading" class="text-xl font-semibold text-slate-900">Matches</h2><a class="text-xs font-bold text-blue-800 underline underline-offset-2" href="/wiki">Complete index</a></div>
          <div class="border-b border-slate-200">{#each results as entry (entry.slug)}<EntryCard {entry} />{/each}</div>
        {:else}
          <div class="max-w-[620px] py-12"><p class="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-700">No result</p><h2 id="results-heading" class="text-xl font-semibold text-slate-900">No matching entry yet</h2><p class="font-serif text-slate-600">Try an English meaning, a shorter Slovak word, or the complete index.</p><a class={cx(button, "mt-3")} href="/wiki">Browse the wiki</a></div>
        {/if}
      </div>
      <aside class="border-l border-slate-200 pl-5 max-[760px]:border-l-0 max-[760px]:border-t max-[760px]:pl-0 max-[760px]:pt-6" aria-label="Search guidance">
        <section><p class="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-700">Search notes</p><p class="font-serif text-sm leading-6 text-slate-700">Slovak diacritics are optional. English meanings and topic names also work.</p></section>
        <section class="mt-7"><p class="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-700">Current query</p><strong class="block truncate font-serif text-blue-800">{query || "None"}</strong><span class="mt-0.5 block text-xs text-slate-500">{results.length} {results.length === 1 ? "match" : "matches"}</span></section>
        <section class="mt-7"><p class="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-700">Browse instead</p><a class="font-serif text-sm text-blue-800 underline underline-offset-2" href="/wiki">Open Slovak Wiki</a></section>
      </aside>
    </div>
  </section>
</main>
