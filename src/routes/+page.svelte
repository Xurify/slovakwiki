<script lang="ts">
  import { goto } from "$app/navigation";
  import { grammarEntries, pronunciationEntries, words } from "$lib/content/data";

  let query = $state("");

  function handleSubmit(event: SubmitEvent): void {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      goto(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    }
  }

  const featuredWord = words.find((word) => word.slug === "dakujem") ?? words[0];
  const popularWords = words.slice(0, 6);
  const lessonSteps = [
    { label: "Greetings", detail: "6 phrases", status: "Ready" },
    { label: "Polite replies", detail: "Coming next", status: "Next" },
    { label: "Introducing yourself", detail: "Coming next", status: "Next" },
    { label: "Food and drink", detail: "Coming next", status: "Next" },
  ];
</script>

<svelte:head>
  <title>Slovak Wiki — Slovak language reference and lessons</title>
  <meta
    name="description"
    content="A practical Slovak dictionary, grammar reference, pronunciation guide, and beginner course for English speakers."
  >
</svelte:head>

<main>
  <section class="intro">
    <div class="shell intro-grid">
      <div>
        <p class="eyebrow">Slovak for English speakers</p>
        <h1>Look it up. Learn it. Use it.</h1>
        <p class="lead">
          A compact Slovak dictionary, grammar reference, pronunciation guide,
          and beginner path.
        </p>
      </div>

      <form class="main-search" role="search" onsubmit={handleSubmit}>
        <label for="home-search">Search the reference</label>
        <div>
          <input
            id="home-search"
            bind:value={query}
            type="search"
            placeholder="Try ďakujem, cases, or soft consonants"
          >
          <button type="submit">Search</button>
        </div>
        <p>
          Popular:
          {#each popularWords as word (word.slug)}
            <a href="/dictionary/{word.slug}" lang="sk">{word.slovak}</a>
          {/each}
        </p>
      </form>
    </div>
  </section>

  <section class="shell dashboard" aria-label="Learning dashboard">
    <div class="primary-column">
      <article class="panel featured">
        <div class="panel-head">
          <div>
            <p class="section-label">Word to know</p>
            <h2 lang="sk">{featuredWord.slovak}</h2>
          </div>
          <span class="translation">{featuredWord.english}</span>
        </div>

        <dl>
          <div>
            <dt>Level</dt>
            <dd>A1 beginner</dd>
          </div>
          <div>
            <dt>Use</dt>
            <dd>Polite speech</dd>
          </div>
          <div>
            <dt>Topic</dt>
            <dd>{featuredWord.category}</dd>
          </div>
        </dl>

        <blockquote>
          <p lang="sk">{featuredWord.examples[0].slovak}</p>
          <footer>{featuredWord.examples[0].english}</footer>
        </blockquote>

        <a class="text-link" href="/dictionary/{featuredWord.slug}">Open full entry →</a>
      </article>

      <section class="panel index-panel" aria-labelledby="words-heading">
        <div class="panel-head">
          <div>
            <p class="section-label">Dictionary</p>
            <h2 id="words-heading">Essential words</h2>
          </div>
          <a class="text-link" href="/wiki">Full index</a>
        </div>
        <ul class="word-list">
          {#each words.slice(0, 12) as word (word.slug)}
            <li>
              <a href="/dictionary/{word.slug}">
                <strong lang="sk">{word.slovak}</strong>
                <span>{word.english}</span>
                <span aria-hidden="true">›</span>
              </a>
            </li>
          {/each}
        </ul>
      </section>
    </div>

    <aside class="secondary-column">
      <section class="panel path" aria-labelledby="path-heading">
        <div class="panel-head">
          <div>
            <p class="section-label">Beginner path</p>
            <h2 id="path-heading">Start with greetings</h2>
          </div>
          <span class="count">1 / 4</span>
        </div>
        <p class="panel-copy">Four short lessons cover the language you need first.</p>
        <ol>
          {#each lessonSteps as step, index (`${step.label}-${index}`)}
            <li class={index === 0 ? "current" : ""} aria-current={index === 0 ? "step" : undefined}>
              <span class="step-number">{index + 1}</span>
              <span>
                <strong>{step.label}</strong>
                <small>{step.detail}</small>
              </span>
              <small>{step.status}</small>
            </li>
          {/each}
        </ol>
        <a class="button" href="/learn">Begin lesson 1</a>
      </section>

      <section class="panel reference" aria-labelledby="reference-heading">
        <div class="panel-head">
          <div>
            <p class="section-label">Reference</p>
            <h2 id="reference-heading">Browse by topic</h2>
          </div>
        </div>

        <div class="reference-group">
          <h3>Grammar</h3>
          <ul>
            {#each grammarEntries.slice(0, 4) as entry (entry.slug)}
              <li>
                <a href="/grammar/{entry.slug}">
                  <span>{entry.english}</span>
                  <small lang="sk">{entry.slovak}</small>
                </a>
              </li>
            {/each}
          </ul>
        </div>

        <div class="reference-group">
          <h3>Pronunciation</h3>
          <ul>
            {#each pronunciationEntries.slice(0, 3) as entry (entry.slug)}
              <li>
                <a href="/pronunciation/{entry.slug}">
                  <span>{entry.english}</span>
                  <small lang="sk">{entry.slovak}</small>
                </a>
              </li>
            {/each}
          </ul>
        </div>
      </section>
    </aside>
  </section>
</main>

<style>
  .intro {
    border-bottom: 1px solid var(--line);
    background: color-mix(in srgb, var(--surface-subtle) 36%, transparent);
  }

  .intro-grid {
    display: grid;
    grid-template-columns: minmax(320px, 0.85fr) minmax(420px, 1.15fr);
    align-items: center;
    gap: 64px;
    padding-block: 42px;
  }

  .intro h1 {
    max-width: 650px;
  }

  .main-search label {
    display: block;
    margin-bottom: 8px;
    font-size: 0.78rem;
    font-weight: 750;
  }

  .main-search > div {
    display: flex;
    min-height: 48px;
    border: 1px solid var(--line-strong);
    border-radius: 9px;
    background: color-mix(in srgb, var(--surface) 78%, transparent);
  }

  .main-search > div:focus-within {
    border-color: var(--blue);
  }

  .main-search input {
    min-width: 0;
    flex: 1;
    border: 0;
    outline: 0;
    padding: 0 14px;
    background: transparent;
  }

  .main-search button {
    min-width: 92px;
    border: 0;
    border-radius: 0 8px 8px 0;
    background: var(--accent);
    color: white;
    cursor: pointer;
    font-weight: 750;
  }

  .main-search button:hover {
    background: var(--accent-dark);
  }

  .main-search > p {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 12px;
    margin: 10px 0 0;
    color: var(--muted);
    font-size: 0.75rem;
  }

  .main-search a {
    color: var(--accent-dark);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .dashboard {
    display: grid;
    grid-template-columns: minmax(0, 1.5fr) minmax(300px, 0.68fr);
    align-items: start;
    gap: 20px;
    padding-block: 28px 64px;
  }

  .primary-column,
  .secondary-column {
    display: grid;
    gap: 20px;
  }

  .panel {
    border: 1px solid var(--line);
    border-radius: 10px;
    background: color-mix(in srgb, var(--surface) 58%, transparent);
    padding: 24px;
  }

  .panel-head {
    display: flex;
    align-items: start;
    justify-content: space-between;
    gap: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--line);
  }

  .panel-head h2 {
    font-size: 1.28rem;
  }

  .featured .panel-head h2 {
    color: var(--ink);
    font-size: 2.2rem;
  }

  .translation {
    color: var(--muted-strong);
    font-size: 0.9rem;
    font-weight: 650;
  }

  dl {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    margin: 0;
    padding-block: 17px;
    border-bottom: 1px solid var(--line);
  }

  dl > div {
    display: grid;
    gap: 3px;
  }

  dt {
    color: var(--muted);
    font-size: 0.7rem;
  }

  dd {
    margin: 0;
    font-size: 0.82rem;
    font-weight: 650;
  }

  blockquote {
    margin: 18px 0 15px;
    padding: 13px 16px;
    border: 1px solid var(--line);
    border-left: 3px solid var(--accent);
    border-radius: 8px;
    background: color-mix(in srgb, var(--surface-subtle) 65%, transparent);
  }

  blockquote p {
    margin: 0;
    font-family: var(--font-reading);
    font-weight: 650;
  }

  blockquote footer {
    margin-top: 4px;
    color: var(--muted);
    font-size: 0.8rem;
  }

  .word-list,
  .reference ul,
  .path ol {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .word-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }

  .word-list li:nth-child(odd) {
    border-right: 1px solid var(--line);
  }

  .word-list a {
    display: grid;
    grid-template-columns: minmax(90px, 0.75fr) 1fr auto;
    gap: 12px;
    min-height: 48px;
    align-items: center;
    padding: 8px 12px;
    border-bottom: 1px solid var(--line);
    font-size: 0.82rem;
  }

  .word-list a:hover,
  .reference a:hover {
    background: color-mix(in srgb, var(--surface-subtle) 64%, transparent);
  }

  .word-list strong {
    color: var(--accent-dark);
    font-family: var(--font-reading);
  }

  .word-list span {
    color: var(--muted);
  }

  .path .panel-copy {
    margin: 15px 0;
    color: var(--muted);
    font-size: 0.85rem;
  }

  .count {
    color: var(--muted);
    font-size: 0.75rem;
    font-weight: 700;
  }

  .path li {
    display: grid;
    grid-template-columns: 28px 1fr auto;
    align-items: center;
    gap: 10px;
    min-height: 53px;
    border-bottom: 1px solid var(--line);
    color: var(--muted);
  }

  .path li.current {
    color: var(--ink);
  }

  .step-number {
    display: grid;
    width: 24px;
    height: 24px;
    place-items: center;
    border: 1px solid var(--line-strong);
    border-radius: 50%;
    font-size: 0.7rem;
  }

  .current .step-number {
    border-color: var(--accent);
    background: var(--accent);
    color: white;
  }

  .path li > span:nth-child(2) {
    display: grid;
    gap: 2px;
  }

  .path strong {
    font-size: 0.82rem;
  }

  .path small {
    color: var(--muted);
    font-size: 0.68rem;
  }

  .path .button {
    width: 100%;
    margin-top: 18px;
  }

  .reference-group + .reference-group {
    margin-top: 22px;
  }

  .reference h3 {
    margin: 16px 0 7px;
    color: var(--muted);
    font-size: 0.72rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .reference a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    min-height: 42px;
    padding: 7px 6px;
    border-bottom: 1px solid var(--line);
    color: var(--accent-dark);
    font-family: var(--font-reading);
    font-size: 0.8rem;
  }

  .reference small {
    max-width: 46%;
    overflow: hidden;
    color: var(--muted);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (max-width: 900px) {
    .intro-grid,
    .dashboard {
      grid-template-columns: 1fr;
    }

    .intro-grid {
      gap: 28px;
    }
  }

  @media (max-width: 600px) {
    .intro-grid {
      padding-block: 28px;
    }

    .main-search > div {
      flex-direction: column;
    }

    .main-search input,
    .main-search button {
      min-height: 46px;
    }

    .panel {
      padding: 18px;
    }

    .word-list {
      grid-template-columns: 1fr;
    }

    .word-list li:nth-child(odd) {
      border-right: 0;
    }

    dl {
      gap: 12px;
    }

    .word-list a {
      grid-template-columns: minmax(82px, 0.75fr) 1fr auto;
    }
  }
</style>
