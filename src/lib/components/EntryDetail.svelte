<script lang="ts">
  import { entryBySlug } from "$lib/content/data";
  import type { ContentEntry } from "$lib/content/types";

  let { entry }: { entry: ContentEntry } = $props();

  const routeBase = {
    grammar: "grammar",
    pronunciation: "pronunciation",
    word: "dictionary",
  };
</script>

<svelte:head>
  <title>{entry.slovak} — {entry.english} | Slovak Atlas</title>
  <meta name="description" content={entry.summary}>
</svelte:head>

<main>
  <header class="entry-hero">
    <div class="shell">
      <a class="back" href="/wiki">← Reference index</a>
      <p class="eyebrow">{entry.kind} · {entry.category}</p>
      <div class="title-row">
        <h1 lang="sk">{entry.slovak}</h1>
        <p>{entry.english}</p>
      </div>
      <p class="summary">{entry.summary}</p>
    </div>
  </header>

  <div class="shell entry-layout">
    <article>
      <section>
        <p class="section-label">Usage</p>
        <h2>How to use it</h2>
        {#each entry.body as paragraph}
          <p>{paragraph}</p>
        {/each}
      </section>

      <section>
        <p class="section-label">Examples</p>
        <h2>In a sentence</h2>
        <div class="examples">
          {#each entry.examples as example, index}
            <div class="example">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <p lang="sk">{example.slovak}</p>
                <small>{example.english}</small>
              </div>
            </div>
          {/each}
        </div>
      </section>

      <section class="source">
        <p class="section-label">Source</p>
        <h2>Reference</h2>
        <a href={entry.source}>Jazykovedný ústav Ľudovíta Štúra SAV ↗</a>
      </section>
    </article>

    <aside>
      <p class="section-label">Related entries</p>
      {#each entry.related as relatedSlug}
        {@const relatedEntry = entryBySlug.get(relatedSlug)}
        {#if relatedEntry}
          <a href="/{routeBase[relatedEntry.kind]}/{relatedEntry.slug}">
            <strong lang="sk">{relatedEntry.slovak}</strong>
            <span>{relatedEntry.english}</span>
            <small>→</small>
          </a>
        {/if}
      {/each}
    </aside>
  </div>
</main>

<style>
  .entry-hero {
    padding-block: 30px 48px;
    border-bottom: 1px solid var(--line);
    background: var(--sky);
  }

  .back {
    display: inline-block;
    margin-bottom: 32px;
    color: var(--blue);
    font-size: 0.78rem;
    font-weight: 700;
  }

  .title-row {
    display: flex;
    align-items: baseline;
    gap: 26px;
  }

  h1 {
    color: var(--coral);
    font-family: "Fraunces Variable", serif;
    font-size: 4.6rem;
    font-weight: 630;
  }

  .title-row > p {
    margin: 0;
    color: var(--plum);
    font-family: "Fraunces Variable", serif;
    font-size: 1.4rem;
    font-style: italic;
  }

  .summary {
    max-width: 680px;
    margin: 15px 0 0;
    color: var(--muted);
  }

  .entry-layout {
    display: grid;
    grid-template-columns: minmax(0, 720px) 280px;
    align-items: start;
    justify-content: space-between;
    gap: 70px;
    padding-block: 50px 82px;
  }

  article section + section {
    margin-top: 54px;
    padding-top: 38px;
    border-top: 1px solid var(--line);
  }

  .section-label {
    margin: 0 0 8px;
    color: var(--ochre);
    font-size: 0.71rem;
    font-weight: 780;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  h2 {
    margin-bottom: 19px;
    color: var(--plum);
    font-family: "Fraunces Variable", serif;
    font-size: 2rem;
  }

  article section > p:not(.section-label) {
    max-width: 68ch;
    color: var(--muted);
  }

  aside {
    position: sticky;
    top: 88px;
    padding: 24px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: var(--surface);
  }

  aside > a {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 3px 10px;
    padding-block: 13px;
    border-bottom: 1px solid var(--line);
  }

  aside > a:last-child {
    border-bottom: 0;
  }

  aside strong {
    color: var(--plum);
  }

  aside span {
    color: var(--muted);
    font-size: 0.76rem;
  }

  aside small {
    grid-row: 1 / 3;
    grid-column: 2;
    align-self: center;
    color: var(--coral);
  }

  .examples {
    border-top: 1px solid var(--line);
  }

  .example {
    display: grid;
    grid-template-columns: 38px 1fr;
    gap: 16px;
    padding-block: 18px;
    border-bottom: 1px solid var(--line);
  }

  .example > span {
    color: var(--coral);
    font-size: 0.72rem;
    font-weight: 750;
  }

  .example p {
    margin: 0 0 4px;
    color: var(--plum);
    font-family: "Fraunces Variable", serif;
    font-size: 1.1rem;
    font-weight: 600;
  }

  .example small {
    color: var(--muted);
  }

  .source a {
    color: var(--coral);
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  @media (max-width: 850px) {
    .entry-layout {
      grid-template-columns: 1fr;
      gap: 46px;
    }

    aside {
      position: static;
    }
  }

  @media (max-width: 600px) {
    .entry-hero {
      padding-block: 24px 38px;
    }

    .title-row {
      align-items: start;
      flex-direction: column;
      gap: 2px;
    }

    h1 {
      font-size: 3.5rem;
    }

    .entry-layout {
      padding-block: 38px 62px;
    }
  }
</style>
