<script lang="ts">
  import { goto } from "$app/navigation";
  import { grammarEntries, pronunciationEntries, words } from "$lib/content/data";

  let query = $state("");

  function handleSubmit(event: SubmitEvent): void {
    event.preventDefault();
    if (query.trim()) {
      goto(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  const featuredWord = words.find((word) => word.slug === "dakujem") ?? words[0];
  const popularWords = words.slice(0, 7);
  const alphabet = [
    "A",
    "Á",
    "B",
    "C",
    "Č",
    "D",
    "Ď",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "Ľ",
    "M",
    "N",
    "Ň",
    "O",
    "P",
    "R",
    "S",
    "Š",
    "T",
    "Ť",
    "U",
    "V",
    "Z",
    "Ž",
  ];
  const lessonSteps = [
    { label: "Greetings", status: "current" },
    { label: "Polite replies", status: "upcoming" },
    { label: "Introducing yourself", status: "upcoming" },
    { label: "Food and drink", status: "upcoming" },
  ];
</script>

<svelte:head>
  <title>Slovak Atlas — Slovak language reference and lessons</title>
  <meta
    name="description"
    content="A practical Slovak dictionary, grammar reference, pronunciation guide, and beginner course for English speakers."
  >
</svelte:head>

<main>
  <section class="hero">
    <div class="diacritics" aria-hidden="true">
      <span>ˇ</span><span>´</span><span>ô</span><span>ä</span><span>ľ</span>
    </div>
    <div class="shell home-shell hero-grid">
      <div class="hero-copy">
        <p class="eyebrow">Slovak for English speakers</p>
        <h1>Practical Slovak,<br>step by step.</h1>
        <p>Look up a word, understand a grammar pattern, or start at the beginning.</p>
      </div>

      <form class="main-search" role="search" onsubmit={handleSubmit}>
        <label for="home-search">Search Slovak Atlas</label>
        <div>
          <input
            id="home-search"
            bind:value={query}
            type="search"
            placeholder="Words, grammar, pronunciation"
          >
          <button type="submit">Search</button>
        </div>
        <p>
          Popular:
          {#each popularWords as word}
            <a href="/dictionary/{word.slug}" lang="sk">{word.slovak}</a>
          {/each}
        </p>
      </form>
    </div>
  </section>

  <section class="workspace">
    <div class="shell home-shell workspace-grid">
      <article class="word">
        <p class="section-label">Word to know</p>
        <div class="word-heading">
          <h2 lang="sk">{featuredWord.slovak}</h2>
          <span>{featuredWord.english}</span>
        </div>
        <div class="rule"></div>
        <dl>
          <div class="meta-item">
            <dt>Level</dt>
            <dd>A1 beginner</dd>
          </div>
          <div class="meta-item">
            <dt>Use</dt>
            <dd>Polite everyday speech</dd>
          </div>
          <div class="meta-item">
            <dt>Topic</dt>
            <dd>{featuredWord.category}</dd>
          </div>
        </dl>
        <div class="example">
          <p lang="sk">{featuredWord.examples[0].slovak}</p>
          <span>{featuredWord.examples[0].english}</span>
        </div>
        <a class="text-link" href="/dictionary/{featuredWord.slug}"
          >Read the full entry →</a
        >
      </article>

      <article class="path">
        <p class="section-label">Beginner path</p>
        <h2>Start here</h2>
        <p class="path-intro">Four short lessons cover the language you need first.</p>
        <ol>
          {#each lessonSteps as step, index}
            <li class:current={step.status === "current"}>
              <span>{index + 1}</span>
              <strong>{step.label}</strong>
              <small>{step.status === "current" ? "Ready" : "Next"}</small>
            </li>
          {/each}
        </ol>
        <a class="button" href="/learn">Begin lesson 1</a>
      </article>
    </div>

    <div class="shell home-shell index-grid">
      <section>
        <div class="index-head">
          <p class="section-label">Words</p>
          <a href="/wiki">Full index</a>
        </div>
        <div class="alphabet" aria-label="Slovak alphabet">
          {#each alphabet as letter}
            <span>{letter}</span>
          {/each}
        </div>
        <div class="word-columns">
          {#each words.slice(0, 12) as word}
            <a href="/dictionary/{word.slug}">
              <span class="word-name" lang="sk">{word.slovak}</span>
              <small class="word-meaning">{word.english}</small>
            </a>
          {/each}
        </div>
      </section>

      <section>
        <div class="index-head">
          <p class="section-label">Grammar</p>
          <a href="/wiki">All topics</a>
        </div>
        <div class="topic-list">
          {#each grammarEntries as entry}
            <a href="/grammar/{entry.slug}">
              <strong class="topic-name">{entry.english}</strong>
              <span class="topic-translation" lang="sk">{entry.slovak}</span>
            </a>
          {/each}
        </div>
      </section>

      <section>
        <div class="index-head">
          <p class="section-label">Pronunciation</p>
          <a href="/wiki">All guides</a>
        </div>
        <div class="topic-list">
          {#each pronunciationEntries as entry}
            <a href="/pronunciation/{entry.slug}">
              <strong class="topic-name">{entry.english}</strong>
              <span class="topic-translation" lang="sk">{entry.slovak}</span>
            </a>
          {/each}
        </div>
      </section>
    </div>
  </section>
</main>

<style>
  .hero {
    position: relative;
    overflow: hidden;
    border-bottom: 1px solid var(--line);
    background: var(--sky);
  }

  .home-shell {
    width: min(1370px, calc(100% - 34px));
  }

  .hero-grid {
    display: grid;
    grid-template-columns: minmax(430px, 0.78fr) minmax(580px, 1.22fr);
    align-items: center;
    gap: 110px;
    padding-block: 48px 50px;
  }

  .hero-copy {
    position: relative;
    z-index: 1;
  }

  h1 {
    color: var(--plum);
    font-family: "Fraunces Variable", serif;
    font-size: 3.25rem;
    font-weight: 650;
    line-height: 1.02;
  }

  .hero-copy > p:last-child {
    max-width: 530px;
    margin: 15px 0 0;
    color: var(--muted);
  }

  .main-search {
    position: relative;
    z-index: 1;
  }

  .main-search label {
    display: block;
    margin-bottom: 9px;
    font-size: 0.8rem;
    font-weight: 700;
  }

  .main-search > div {
    display: flex;
    min-height: 54px;
    border: 1px solid var(--plum);
    border-radius: 7px;
    background: var(--surface);
    box-shadow: 0 5px 0 color-mix(in oklch, var(--plum) 11%, transparent);
  }

  .main-search input {
    min-width: 0;
    flex: 1;
    border: 0;
    outline: 0;
    background: transparent;
    padding: 0 17px;
    color: var(--ink);
  }

  .main-search button {
    min-width: 104px;
    border: 0;
    border-radius: 0 6px 6px 0;
    background: var(--coral);
    color: var(--coral-foreground);
    cursor: pointer;
    font-weight: 760;
  }

  .main-search > p {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 13px;
    margin: 13px 0 0;
    color: var(--muted);
    font-size: 0.76rem;
  }

  .main-search a {
    color: var(--plum);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .diacritics {
    position: absolute;
    inset: 0 1% 0 auto;
    width: 240px;
    color: color-mix(in oklch, var(--blue) 17%, transparent);
    font-family: "Fraunces Variable", serif;
    pointer-events: none;
  }

  .diacritics span {
    position: absolute;
    font-size: 2.8rem;
  }

  .diacritics span:nth-child(1) {
    top: 15%;
    left: 10%;
  }
  .diacritics span:nth-child(2) {
    top: 52%;
    left: 72%;
    color: var(--coral);
  }
  .diacritics span:nth-child(3) {
    top: 13%;
    left: 73%;
  }
  .diacritics span:nth-child(4) {
    top: 49%;
    left: 24%;
    font-size: 5rem;
  }
  .diacritics span:nth-child(5) {
    top: 70%;
    left: 62%;
  }

  .workspace {
    padding-block: 0 72px;
    background: var(--surface);
  }

  .workspace-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    overflow: hidden;
    border: 1px solid var(--line);
    border-radius: 0;
    background: var(--surface);
    box-shadow: none;
  }

  .workspace-grid article {
    padding: 34px 46px 30px;
  }

  .workspace-grid article + article {
    border-left: 1px solid var(--line);
  }

  .section-label {
    margin: 0;
    color: var(--ochre);
    font-size: 0.71rem;
    font-weight: 780;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .word-heading {
    display: flex;
    align-items: baseline;
    gap: 20px;
    margin-top: 12px;
  }

  .word-heading h2 {
    margin: 0;
    color: var(--coral);
    font-family: "Fraunces Variable", serif;
    font-size: 3.75rem;
    font-weight: 620;
  }

  .word-heading span {
    color: var(--muted);
    font-family: "Fraunces Variable", serif;
    font-size: 1.15rem;
    font-style: italic;
  }

  .rule {
    height: 1px;
    margin-block: 14px 18px;
    background: var(--line);
  }

  dl {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    margin: 0;
  }

  .meta-item {
    display: grid;
    gap: 5px;
  }

  dt {
    color: var(--muted);
    font-size: 0.7rem;
  }

  dd {
    margin: 0;
    font-size: 0.84rem;
    font-weight: 650;
  }

  .example {
    margin-block: 20px 15px;
    padding: 14px 18px;
    border-radius: 4px;
    background: var(--sage-soft);
  }

  .example p {
    margin: 0 0 3px;
    color: var(--plum);
    font-family: "Fraunces Variable", serif;
    font-size: 1.08rem;
    font-weight: 600;
  }

  .example span {
    color: var(--muted);
    font-size: 0.8rem;
    font-style: italic;
  }

  .text-link,
  .index-head a {
    color: var(--coral);
    font-size: 0.78rem;
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .path h2 {
    margin: 11px 0 0;
    color: var(--plum);
    font-family: "Fraunces Variable", serif;
    font-size: 2.2rem;
  }

  .path-intro {
    margin: 10px 0 19px;
    color: var(--muted);
    font-size: 0.87rem;
  }

  .path ol {
    margin: 0 0 24px;
    padding: 0;
    border-top: 1px solid var(--line);
    list-style: none;
  }

  .path li {
    display: grid;
    grid-template-columns: 26px 1fr auto;
    align-items: center;
    gap: 10px;
    padding-block: 10px;
    border-bottom: 1px solid var(--line);
  }

  .path li > span {
    display: grid;
    width: 22px;
    height: 22px;
    place-items: center;
    border: 1px solid var(--line);
    border-radius: 50%;
    color: var(--muted);
    font-size: 0.7rem;
  }

  .path li.current > span {
    border-color: var(--coral);
    background: var(--coral);
    color: var(--coral-foreground);
  }

  .path li strong {
    font-size: 0.85rem;
  }

  .path li small {
    color: var(--muted);
    font-size: 0.7rem;
  }

  .index-grid {
    display: grid;
    grid-template-columns: 1.25fr 0.9fr 0.9fr;
    overflow: hidden;
    border: 1px solid var(--line);
    border-top: 0;
    border-radius: 0;
    background: var(--surface);
    box-shadow: none;
  }

  .index-grid > section {
    padding: 25px 32px 30px;
  }

  .index-grid > section + section {
    border-left: 1px solid var(--line);
  }

  .index-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .alphabet {
    display: flex;
    flex-wrap: wrap;
    gap: 9px 13px;
    margin-block: 19px;
    color: var(--plum);
    font-family: "Fraunces Variable", serif;
    font-size: 0.86rem;
    font-weight: 650;
  }

  .alphabet span:first-child {
    color: var(--coral);
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 4px;
  }

  .word-columns {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px 18px;
  }

  .word-columns a,
  .topic-list a {
    display: grid;
    gap: 2px;
  }

  .word-name,
  .topic-name {
    color: var(--plum);
    font-size: 0.78rem;
  }

  .word-meaning,
  .topic-translation {
    overflow: hidden;
    color: var(--muted);
    font-size: 0.68rem;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .word-columns a:hover .word-name,
  .topic-list a:hover .topic-name {
    color: var(--coral);
    text-decoration: underline;
  }

  .topic-list {
    display: grid;
    gap: 13px;
    margin-top: 20px;
  }

  @media (max-width: 900px) {
    .hero-grid {
      grid-template-columns: 1fr;
      gap: 34px;
      padding-block: 48px;
    }

    .home-shell {
      width: min(100% - 28px, 760px);
    }

    .diacritics {
      opacity: 0.55;
    }

    .index-grid {
      grid-template-columns: 1fr 1fr;
    }

    .index-grid > section:first-child {
      grid-column: 1 / -1;
      border-bottom: 1px solid var(--line);
    }

    .index-grid > section:nth-child(2) {
      border-left: 0;
    }
  }

  @media (max-width: 680px) {
    h1 {
      font-size: 2.7rem;
    }

    .main-search > div {
      min-height: 0;
      flex-direction: column;
    }

    .main-search input {
      min-height: 50px;
    }

    .main-search button {
      min-height: 46px;
      border-radius: 0 0 6px 6px;
    }

    .workspace-grid,
    .index-grid {
      grid-template-columns: 1fr;
    }

    .workspace-grid article {
      padding: 30px 24px;
    }

    .workspace-grid article + article,
    .index-grid > section + section {
      border-top: 1px solid var(--line);
      border-left: 0;
    }

    .index-grid > section:first-child {
      grid-column: auto;
    }

    .word-heading {
      align-items: start;
      flex-direction: column;
      gap: 0;
    }

    .word-heading h2 {
      font-size: 3.4rem;
    }

    dl {
      gap: 16px;
    }

    .word-columns {
      grid-template-columns: 1fr 1fr;
    }
  }
</style>
