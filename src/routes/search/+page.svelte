<script lang="ts">
  import { page } from "$app/state";
  import EntryCard from "$lib/components/EntryCard.svelte";
  import { searchEntries } from "$lib/content/search";

  let query = $derived(page.url.searchParams.get("q") ?? "");
  let results = $derived(searchEntries(query));
</script>

<svelte:head>
  <title>{query ? `${query} — Search` : "Search"} | Slovak Atlas</title>
</svelte:head>

<main>
  <header class="page-intro">
    <div class="shell">
      <nav aria-label="Breadcrumb">
        <a href="/wiki">Reference index</a>
        <span aria-hidden="true">/</span>
        <span>Search</span>
      </nav>
      <h1>{query ? `Results for “${query}”` : "Search the atlas"}</h1>
      <p role="status" aria-live="polite" aria-atomic="true">
        {results.length} {results.length === 1 ? "entry" : "entries"} found.
        Slovak diacritics are optional.
      </p>
    </div>
  </header>

  <section class="shell results" aria-labelledby="results-heading">
    {#if results.length}
      <div class="results-head">
        <h2 id="results-heading">Matches</h2>
        <a class="text-link" href="/wiki">Browse complete index</a>
      </div>
      <div class="result-list">
        {#each results as entry (entry.slug)}
          <EntryCard {entry} />
        {/each}
      </div>
    {:else}
      <div class="empty">
        <p class="section-label">No result</p>
        <h2 id="results-heading">No matching entry yet</h2>
        <p>Try an English meaning, a shorter Slovak word, or the complete index.</p>
        <a class="button" href="/wiki">Browse the wiki</a>
      </div>
    {/if}
  </section>
</main>

<style>
  .page-intro {
    padding-block: 30px;
    border-bottom: 1px solid var(--line);
    background: var(--surface-subtle);
  }

  nav {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    color: var(--muted);
    font-size: 0.76rem;
  }

  nav a {
    color: var(--blue);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .page-intro h1 {
    font-size: clamp(1.8rem, 4vw, 2.7rem);
  }

  .page-intro p {
    margin: 10px 0 0;
    color: var(--muted);
    font-size: 0.88rem;
  }

  .results {
    padding-block: 30px 64px;
  }

  .results-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 20px;
    padding-bottom: 13px;
    border-bottom: 3px solid var(--ink);
  }

  .results-head h2 {
    font-size: 1.2rem;
  }

  .result-list {
    border-bottom: 1px solid var(--line);
  }

  .empty {
    max-width: 620px;
  }

  .empty > p:not(.section-label) {
    color: var(--muted);
  }

  .empty .button {
    margin-top: 12px;
  }
</style>
