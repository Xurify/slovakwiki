<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";

  let query = $state("");

  const links = [
    { href: "/learn", label: "Learn" },
    { href: "/wiki", label: "Wiki" },
    { href: "/quiz", label: "Quiz" },
  ];

  function isActive(href: string): boolean {
    return page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
  }

  function handleSubmit(event: SubmitEvent): void {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      goto(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    }
  }
</script>

<a class="skip-link" href="#main-content">Skip to main content</a>

<header class="site-header">
  <div class="shell header-inner">
    <a class="brand" href="/" aria-label="Slovak Atlas home">Slovak Atlas</a>

    <nav aria-label="Main navigation">
      {#each links as link (link.href)}
        <a href={link.href} aria-current={isActive(link.href) ? "page" : undefined}>
          {link.label}
        </a>
      {/each}
    </nav>

    <form class="header-search" role="search" onsubmit={handleSubmit}>
      <label class="sr-only" for="header-search">Search Slovak Atlas</label>
      <input
        id="header-search"
        bind:value={query}
        type="search"
        placeholder="Search words or topics"
      >
      <button type="submit">Search</button>
    </form>
  </div>
</header>

<style>
  .skip-link {
    position: fixed;
    z-index: 100;
    top: 8px;
    left: 8px;
    transform: translateY(-160%);
    padding: 10px 14px;
    border: 2px solid var(--blue);
    background: var(--surface);
    color: var(--blue);
    font-weight: 700;
  }

  .skip-link:focus {
    transform: translateY(0);
  }

  .site-header {
    position: sticky;
    z-index: 20;
    top: 0;
    border-bottom: 1px solid var(--line);
    background: var(--surface);
  }

  .header-inner {
    display: grid;
    grid-template-columns: auto auto minmax(250px, 1fr);
    align-items: center;
    min-height: 58px;
    gap: 32px;
  }

  .brand {
    color: var(--ink);
    font-size: 1.02rem;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  nav {
    display: flex;
    align-self: stretch;
  }

  nav a {
    display: flex;
    min-width: 68px;
    align-items: center;
    justify-content: center;
    border-bottom: 3px solid transparent;
    color: var(--muted);
    font-size: 0.88rem;
    font-weight: 650;
  }

  nav a:hover {
    color: var(--ink);
  }

  nav a[aria-current="page"] {
    border-bottom-color: var(--blue);
    color: var(--blue);
  }

  .header-search {
    display: flex;
    justify-self: end;
    width: min(100%, 410px);
    border: 1px solid var(--line-strong);
    background: var(--surface);
  }

  .header-search:focus-within {
    border-color: var(--blue);
  }

  .header-search input {
    min-width: 0;
    min-height: 38px;
    flex: 1;
    border: 0;
    outline: 0;
    background: transparent;
    padding: 0 11px;
    color: var(--ink);
    font-size: 0.84rem;
  }

  .header-search button {
    min-width: 68px;
    border: 0;
    border-left: 1px solid var(--line);
    background: var(--surface-subtle);
    color: var(--blue);
    cursor: pointer;
    font-size: 0.78rem;
    font-weight: 750;
  }

  .header-search button:hover {
    background: var(--blue-light);
  }

  @media (max-width: 760px) {
    .header-inner {
      grid-template-columns: 1fr auto;
      gap: 0 14px;
      padding-top: 8px;
    }

    nav a {
      min-width: 58px;
      min-height: 42px;
    }

    .header-search {
      grid-column: 1 / -1;
      justify-self: stretch;
      width: 100%;
      margin-block: 7px 10px;
    }
  }

  @media (max-width: 400px) {
    .brand {
      font-size: 0.92rem;
    }

    nav a {
      min-width: 52px;
      font-size: 0.8rem;
    }
  }
</style>
