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
  <title>{entry.slovak} — {entry.english} | Slovak Atlas</title>
  <meta name="description" content={entry.summary}>
</svelte:head>

<main>
  <header class="entry-header">
    <div class="shell">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="/wiki">Reference index</a>
        <span aria-hidden="true">/</span>
        <span>{kindLabel[entry.kind]}</span>
      </nav>
      <p class="eyebrow">{entry.category}</p>
      <div class="title-row">
        <h1 lang="sk">{entry.slovak}</h1>
        <p>{entry.english}</p>
      </div>
      <p class="summary">{entry.summary}</p>
    </div>
  </header>

  <div class="shell entry-layout">
    <article>
      <section aria-labelledby="usage-heading">
        <p class="section-label">Usage</p>
        <h2 id="usage-heading">How to use it</h2>
        {#each entry.body as paragraph, index (index)}
          <p>{paragraph}</p>
        {/each}
      </section>

      <section aria-labelledby="examples-heading">
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

      <section class="source" aria-labelledby="source-heading">
        <p class="section-label">Source</p>
        <h2 id="source-heading">Reference</h2>
        <a href={entry.source}>Jazykovedný ústav Ľudovíta Štúra SAV ↗</a>
      </section>
    </article>

    <aside aria-labelledby="related-heading">
      <h2 id="related-heading">Related entries</h2>
      <ul>
        {#each entry.related as relatedSlug (relatedSlug)}
          {@const relatedEntry = entryBySlug.get(relatedSlug)}
          {#if relatedEntry}
            <li>
              <a href="/{routeBase[relatedEntry.kind]}/{relatedEntry.slug}">
                <span>
                  <strong lang="sk">{relatedEntry.slovak}</strong>
                  <small>{relatedEntry.english}</small>
                </span>
                <span aria-hidden="true">›</span>
              </a>
            </li>
          {/if}
        {/each}
      </ul>
    </aside>
  </div>
</main>

<style>
  .entry-header {
    padding-block: 28px 34px;
    border-bottom: 1px solid var(--line);
    background: var(--surface-subtle);
  }

  .breadcrumb {
    display: flex;
    gap: 8px;
    margin-bottom: 26px;
    color: var(--muted);
    font-size: 0.76rem;
  }

  .breadcrumb a {
    color: var(--blue);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .title-row {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 12px 24px;
  }

  h1 {
    color: var(--ink);
    font-size: clamp(2.5rem, 5vw, 4.2rem);
  }

  .title-row > p {
    margin: 0;
    color: var(--muted-strong);
    font-size: 1.12rem;
    font-weight: 600;
  }

  .summary {
    max-width: 720px;
    margin: 14px 0 0;
    color: var(--muted);
  }

  .entry-layout {
    display: grid;
    grid-template-columns: minmax(0, 760px) minmax(230px, 280px);
    align-items: start;
    justify-content: space-between;
    gap: 64px;
    padding-block: 40px 68px;
  }

  article section + section {
    margin-top: 42px;
    padding-top: 32px;
    border-top: 1px solid var(--line);
  }

  article h2 {
    margin-bottom: 16px;
    font-size: 1.45rem;
  }

  article section > p:not(.section-label) {
    max-width: 70ch;
    color: var(--muted-strong);
  }

  aside {
    position: sticky;
    top: 82px;
    border-top: 3px solid var(--ink);
  }

  aside h2 {
    padding: 14px 8px 11px;
    border-bottom: 1px solid var(--line);
    font-size: 0.82rem;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  aside ul,
  .examples {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  aside a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    min-height: 58px;
    padding: 10px 8px;
    border-bottom: 1px solid var(--line);
  }

  aside a:hover {
    background: var(--surface-subtle);
  }

  aside a > span:first-child {
    display: grid;
    gap: 2px;
  }

  aside strong {
    color: var(--blue);
    font-size: 0.9rem;
  }

  aside small {
    color: var(--muted);
    font-size: 0.72rem;
  }

  aside a > span:last-child {
    color: var(--blue);
  }

  .examples {
    border-top: 1px solid var(--line);
  }

  .examples li {
    display: grid;
    grid-template-columns: 34px 1fr;
    gap: 14px;
    padding-block: 15px;
    border-bottom: 1px solid var(--line);
  }

  .number {
    color: var(--muted);
    font-size: 0.7rem;
    font-weight: 750;
  }

  .examples p {
    margin: 0 0 3px;
    color: var(--ink);
    font-size: 1rem;
    font-weight: 650;
  }

  .examples small {
    color: var(--muted);
  }

  .source a {
    color: var(--blue);
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  @media (max-width: 850px) {
    .entry-layout {
      grid-template-columns: 1fr;
      gap: 42px;
    }

    aside {
      position: static;
    }
  }

  @media (max-width: 600px) {
    .entry-header {
      padding-block: 22px 28px;
    }

    .entry-layout {
      padding-block: 30px 50px;
    }
  }
</style>
