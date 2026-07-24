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
      <p class="eyebrow">Search</p>
      <h1>{query ? `“${query}”` : "Search the atlas"}</h1>
      <p>
        {results.length} {results.length === 1 ? "entry" : "entries"} found. Slovak
        diacritics are optional.
      </p>
    </div>
  </header>

  <section class="shell results">
    {#if results.length}
      <div class="results-head">
        <h2>Matches</h2>
        <a href="/wiki">Browse complete index</a>
      </div>
      <div class="grid">
        {#each results as entry}
          <EntryCard {entry} />
        {/each}
      </div>
    {:else}
      <div class="empty">
        <p class="section-label">No result</p>
        <h2>No matching entry yet</h2>
        <p>Try an English meaning, a shorter Slovak word, or the complete index.</p>
        <a class="button" href="/wiki">Browse the wiki</a>
      </div>
    {/if}
  </section>
</main>

<style>
  .page-intro {
    padding-block: 46px;
    border-bottom: 1px solid var(--line);
    background: var(--sky);
  }

  h1 {
    color: var(--plum);
    font-family: "Fraunces Variable", serif;
    font-size: 3.4rem;
    font-weight: 650;
  }

  .page-intro p:last-child {
    margin: 13px 0 0;
    color: var(--muted);
  }

  .results {
    padding-block: 42px 78px;
  }

  .results-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    margin-bottom: 18px;
  }

  .results-head h2,
  .empty h2 {
    color: var(--plum);
    font-family: "Fraunces Variable", serif;
  }

  .results-head a {
    color: var(--coral);
    font-size: 0.78rem;
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .empty {
    max-width: 620px;
    padding: 45px 0;
    text-align: left;
  }

  .empty > p:not(.section-label) {
    color: var(--muted);
  }

  .empty .button {
    margin-top: 14px;
  }
</style>
