<script lang="ts">
  import { goto } from "$app/navigation";

  let query = $state("");
  let menuOpen = $state(false);

  function handleSubmit(event: SubmitEvent): void {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      goto(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    }
  }
</script>

<header class="header">
  <div class="shell header-inner">
    <a class="brand" href="/" aria-label="Slovak Atlas home">
      <span>Slovak Atlas</span>
    </a>

    <nav class:open={menuOpen} aria-label="Main navigation">
      <a href="/learn">Learn</a>
      <a href="/wiki">Wiki</a>
      <a href="/quiz">Quiz</a>
    </nav>

    <form class="header-search" role="search" onsubmit={handleSubmit}>
      <label class="sr-only" for="header-search">Search Slovak Atlas</label>
      <input
        id="header-search"
        bind:value={query}
        type="search"
        placeholder="Search a word or topic"
      >
      <button type="submit" aria-label="Search">↗</button>
    </form>

    <button
      class="menu"
      type="button"
      aria-label="Toggle navigation"
      aria-expanded={menuOpen}
      onclick={() => (menuOpen = !menuOpen)}
    >
      <span></span><span></span>
    </button>
  </div>
</header>

<style>
  .header {
    position: sticky;
    z-index: 20;
    top: 0;
    border-bottom: 1px solid var(--line);
    background: color-mix(in oklch, var(--paper) 95%, transparent);
    backdrop-filter: blur(18px);
  }

  .header-inner {
    display: grid;
    grid-template-columns: auto 1fr minmax(230px, 330px);
    align-items: center;
    min-height: 62px;
    gap: 38px;
  }

  .brand {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: var(--blue);
    font-family: "Fraunces Variable", serif;
    font-size: 1.2rem;
    font-weight: 680;
  }

  nav {
    display: flex;
    gap: 22px;
  }

  nav a {
    color: var(--muted);
    font-size: 0.92rem;
    font-weight: 650;
  }

  nav a:hover {
    color: var(--blue);
  }

  .header-search {
    display: flex;
    overflow: hidden;
    border: 1px solid var(--line);
    border-radius: 7px;
    background: var(--surface);
  }

  .header-search input {
    min-width: 0;
    flex: 1;
    border: 0;
    outline: 0;
    background: transparent;
    padding: 10px 12px;
    color: var(--ink);
    font-size: 0.86rem;
  }

  .header-search button {
    width: 40px;
    border: 0;
    background: transparent;
    color: var(--blue);
    cursor: pointer;
    font-size: 1.1rem;
  }

  .menu {
    display: none;
    border: 0;
    background: transparent;
  }

  .sr-only {
    position: absolute;
    overflow: hidden;
    width: 1px;
    height: 1px;
    clip: rect(0, 0, 0, 0);
  }

  @media (max-width: 800px) {
    .header-inner {
      grid-template-columns: 1fr auto;
      gap: 12px;
      min-height: 58px;
    }

    .header-search {
      grid-column: 1 / -1;
      margin-bottom: 12px;
    }

    nav {
      position: absolute;
      top: 58px;
      right: 14px;
      display: none;
      min-width: 160px;
      flex-direction: column;
      gap: 0;
      padding: 8px;
      border: 1px solid var(--line);
      border-radius: 7px;
      background: var(--surface);
      box-shadow: var(--shadow);
    }

    nav.open {
      display: flex;
    }

    nav a {
      padding: 12px;
    }

    .menu {
      display: grid;
      width: 42px;
      height: 42px;
      place-content: center;
      gap: 6px;
      cursor: pointer;
    }

    .menu span {
      display: block;
      width: 21px;
      height: 2px;
      background: var(--ink);
    }
  }
</style>
