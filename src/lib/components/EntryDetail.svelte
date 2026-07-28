<script lang="ts">
  import { entryBySlug } from "$lib/content/data";
  import type { ContentEntry } from "$lib/content/types";

  let { entry }: { entry: ContentEntry } = $props();

  const routeBase = {
    grammar: "grammar",
    pronunciation: "pronunciation",
    word: "dictionary",
  };

  const kindLabel = {
    grammar: "Grammar",
    pronunciation: "Pronunciation",
    word: "Dictionary",
  };
</script>

<svelte:head>
  <title>{entry.slovak} — {entry.english} | Slovak Wiki</title>
  <meta name="description" content={entry.summary}>
</svelte:head>

<main class="entry">
  <div class="entry-shell">
    <article class="entry-content">
      <header class="entry-header">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="/wiki">Reference</a>
          <span aria-hidden="true">/</span>
          <span>{kindLabel[entry.kind]}</span>
        </nav>
        <h1 lang="sk">{entry.slovak}</h1>
        <div class="entry-meta">
          <span class="status-dot" aria-hidden="true"></span>
          <strong>{entry.english}</strong>
          <span>{entry.category}</span>
        </div>
        <p class="summary">{entry.summary}</p>
      </header>

      <section id="usage" aria-labelledby="usage-heading">
        <p class="section-label">Usage</p>
        <h2 id="usage-heading">How to use it</h2>
        {#each entry.body as paragraph, index (index)}
          <p>{paragraph}</p>
        {/each}
      </section>

      <section id="examples" aria-labelledby="examples-heading">
        <p class="section-label">Examples</p>
        <h2 id="examples-heading">In a sentence</h2>
        <ol class="examples">
          {#each entry.examples as example, index (`${example.slovak}-${index}`)}
            <li>
              <span class="number">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p lang="sk">{example.slovak}</p>
                <small>{example.english}</small>
              </div>
            </li>
          {/each}
        </ol>
      </section>

      <section class="source" id="source" aria-labelledby="source-heading">
        <p class="section-label">Source</p>
        <h2 id="source-heading">Reference</h2>
        <a href={entry.source}>Jazykovedný ústav Ľudovíta Štúra SAV ↗</a>
      </section>
    </article>

    <aside class="entry-context" aria-label="Entry navigation">
      <section>
        <p class="rail-label">On this page</p>
        <nav aria-label="Page sections">
          <a class="active" href="#usage">How to use it</a>
          <a href="#examples">Examples</a>
          <a href="#source">Reference</a>
        </nav>
      </section>

      <section>
        <p class="rail-label">Related entries</p>
        <ul>
          {#each entry.related as relatedSlug (relatedSlug)}
            {@const relatedEntry = entryBySlug.get(relatedSlug)}
            {#if relatedEntry}
              <li>
                <a href="/{routeBase[relatedEntry.kind]}/{relatedEntry.slug}">
                  <strong lang="sk">{relatedEntry.slovak}</strong>
                  <small>{relatedEntry.english}</small>
                </a>
              </li>
            {/if}
          {/each}
        </ul>
      </section>
    </aside>
  </div>
</main>

<style>
  .entry-shell {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 210px;
  }

  .entry-context {
    position: sticky;
    top: var(--header-height);
    height: fit-content;
    min-width: 0;
    padding: 28px 18px 46px;
  }

  .entry-context {
    border-left: 1px solid var(--line);
  }

  .rail-label {
    margin: 0 0 9px;
    color: var(--muted);
    font-size: 0.61rem;
    font-weight: 750;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .entry-context nav {
    display: grid;
    border-left: 2px solid var(--line);
  }

  .entry-context nav a {
    padding: 5px 0 5px 10px;
    color: var(--ink-soft);
    font-family: var(--font-reading);
    font-size: 0.8rem;
  }

  .entry-context nav a:hover {
    color: var(--accent-dark);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .entry-context nav a.active {
    border-left: 2px solid var(--accent);
    margin-left: -2px;
    color: var(--accent-dark);
  }

  .entry-content {
    width: min(100%, 760px);
    justify-self: center;
    padding: 34px 30px 74px;
  }

  .entry-header {
    padding-bottom: 28px;
    border-bottom: 1px solid var(--line);
  }

  .breadcrumb {
    display: flex;
    gap: 7px;
    margin-bottom: 20px;
    color: var(--muted);
    font-size: 0.7rem;
  }

  .breadcrumb a {
    color: var(--accent-dark);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  h1 {
    font-size: clamp(2.7rem, 5vw, 4.4rem);
  }

  .entry-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 7px 12px;
    margin-top: 12px;
    color: var(--muted);
    font-size: 0.72rem;
  }

  .entry-meta strong {
    color: var(--accent-dark);
    font-family: var(--font-reading);
    font-size: 0.92rem;
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border: 2px solid var(--accent-soft);
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
  }

  .summary {
    max-width: 66ch;
    margin: 18px 0 0;
    color: var(--ink-soft);
    font-family: var(--font-reading);
    font-size: 1.03rem;
  }

  .entry-content > section {
    scroll-margin-top: 72px;
    padding-top: 34px;
  }

  .entry-content > section + section {
    margin-top: 24px;
    border-top: 1px solid var(--line);
  }

  .entry-content h2 {
    margin-bottom: 10px;
    font-size: 1.48rem;
  }

  .entry-content section > p:not(.section-label) {
    max-width: 67ch;
    color: var(--ink-soft);
    font-family: var(--font-reading);
    font-size: 0.98rem;
    line-height: 1.7;
  }

  .examples {
    margin: 18px 0 0;
    padding: 0;
    border: 1px solid var(--line);
    border-radius: 10px;
    background: color-mix(in srgb, var(--surface-subtle) 58%, transparent);
    list-style: none;
  }

  .examples li {
    display: grid;
    grid-template-columns: 32px 1fr;
    gap: 12px;
    padding: 14px 16px;
    border-bottom: 1px solid var(--line);
  }

  .examples li:last-child {
    border-bottom: 0;
  }

  .number {
    color: var(--accent);
    font-size: 0.65rem;
    font-weight: 750;
  }

  .examples p {
    margin: 0 0 2px;
    color: var(--ink);
    font-family: var(--font-reading);
    font-size: 1rem;
    font-weight: 650;
  }

  .examples small {
    color: var(--muted);
    font-size: 0.75rem;
  }

  .source a {
    color: var(--accent-dark);
    font-family: var(--font-reading);
    font-weight: 650;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .entry-context section + section {
    margin-top: 30px;
  }

  .entry-context ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .entry-context li {
    border-bottom: 1px solid var(--line);
  }

  .entry-context li a {
    display: grid;
    gap: 2px;
    padding-block: 9px;
  }

  .entry-context li strong {
    color: var(--accent-dark);
    font-family: var(--font-reading);
    font-size: 0.82rem;
  }

  .entry-context li small {
    overflow: hidden;
    color: var(--muted);
    font-size: 0.68rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (max-width: 1080px) {
    .entry-shell {
      display: block;
    }

    .entry-context {
      position: static;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      padding: 24px 30px 42px;
      border-top: 1px solid var(--line);
      border-left: 0;
    }

    .entry-context section + section {
      margin-top: 0;
    }
  }

  @media (max-width: 760px) {
    .entry-content {
      padding: 28px 14px 52px;
    }

    .entry-context {
      display: grid;
      grid-template-columns: 1fr;
      gap: 26px;
      padding: 26px 14px 40px;
    }
  }
</style>
