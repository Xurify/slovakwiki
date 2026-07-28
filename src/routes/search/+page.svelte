<script lang="ts">
  import { page } from "$app/state";
  import EntryCard from "$lib/components/EntryCard.svelte";
  import { searchEntries } from "$lib/content/search";

  let query = $derived(page.url.searchParams.get("q") ?? "");
  let results = $derived(searchEntries(query));
</script>

<svelte:head>
  <title>{query ? `${query} — Search` : "Search"} | Slovak Wiki</title>
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
    <div class="results-layout">
      <div class="results-main">
        {#if results.length}
          <div class="results-head">
            <h2 id="results-heading">Matches</h2>
            <a class="text-link" href="/wiki">Complete index</a>
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
      </div>

      <aside aria-label="Search guidance">
        <section>
          <p class="rail-label">Search notes</p>
          <p>Slovak diacritics are optional. English meanings and topic names also work.</p>
        </section>
        <section>
          <p class="rail-label">Current query</p>
          <strong>{query || "None"}</strong>
          <span>{results.length} {results.length === 1 ? "match" : "matches"}</span>
        </section>
        <section>
          <p class="rail-label">Browse instead</p>
          <a href="/wiki">Open Slovak Wiki</a>
        </section>
      </aside>
    </div>
  </section>
</main>

<style>
  .page-intro {
    padding-block: 30px;
    border-bottom: 1px solid var(--line);
    background: color-mix(in srgb, var(--surface-subtle) 45%, transparent);
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
    font-family: var(--font-reading);
    font-size: 0.88rem;
  }

  .results {
    padding-block: 30px 64px;
  }

  .results-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 210px;
    gap: 34px;
  }

  .results-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 20px;
    padding-bottom: 13px;
    border-bottom: 1px solid var(--line-strong);
  }

  .results-head h2 {
    font-size: 1.2rem;
  }

  .result-list {
    border-bottom: 1px solid var(--line);
  }

  aside {
    padding-left: 18px;
    border-left: 1px solid var(--line);
  }

  aside section + section {
    margin-top: 28px;
  }

  .rail-label {
    margin: 0 0 9px;
    color: var(--accent);
    font-size: 0.61rem;
    font-weight: 750;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  aside p:not(.rail-label) {
    margin: 0;
    color: var(--ink-soft);
    font-family: var(--font-reading);
    font-size: 0.82rem;
    line-height: 1.55;
  }

  aside strong,
  aside span {
    display: block;
  }

  aside strong {
    overflow: hidden;
    color: var(--accent-dark);
    font-family: var(--font-reading);
    text-overflow: ellipsis;
  }

  aside span {
    margin-top: 2px;
    color: var(--muted);
    font-size: 0.66rem;
  }

  aside a {
    color: var(--accent-dark);
    font-family: var(--font-reading);
    font-size: 0.8rem;
    text-decoration: underline;
    text-underline-offset: 3px;
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

  @media (max-width: 760px) {
    .results-layout {
      grid-template-columns: 1fr;
    }

    aside {
      padding: 24px 0 0;
      border-top: 1px solid var(--line);
      border-left: 0;
    }
  }
</style>
