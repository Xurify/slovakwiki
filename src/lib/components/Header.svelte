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
  <div class="header-inner">
    <a class="brand" href="/" aria-label="Slovak Wiki home">
      <span>Slovak</span>
      <strong>Wiki</strong>
    </a>

    <form class="header-search" role="search" onsubmit={handleSubmit}>
      <label class="sr-only" for="header-search">Search Slovak Wiki</label>
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="m21 21-4.35-4.35m2.35-5.15a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
      </svg>
      <input
        id="header-search"
        bind:value={query}
        type="search"
        placeholder="Search or ask…"
      >
      <button type="submit">Go</button>
    </form>

    <nav aria-label="Main navigation">
      {#each links as link (link.href)}
        <a href={link.href} aria-current={isActive(link.href) ? "page" : undefined}>
          {link.label}
        </a>
      {/each}
    </nav>
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
    border: 2px solid var(--accent);
    border-radius: 6px;
    background: var(--surface);
    color: var(--accent-dark);
    font-weight: 700;
  }

  .skip-link:focus {
    transform: translateY(0);
  }

  .site-header {
    position: sticky;
    z-index: 20;
    top: 0;
    min-height: var(--header-height);
    border-bottom: 1px solid var(--line);
    background: color-mix(in srgb, var(--paper) 94%, transparent);
    backdrop-filter: blur(12px);
  }

  .header-inner {
    display: grid;
    width: calc(100% - 32px);
    min-height: var(--header-height);
    grid-template-columns: minmax(150px, 1fr) minmax(280px, 430px) minmax(150px, 1fr);
    align-items: center;
    gap: 24px;
    margin-inline: auto;
  }

  @media (min-width: 801px) {
    .header-inner { grid-template-columns: 1fr; }
    .brand, nav { display: none; }
    .header-search { max-width: 430px; justify-self: center; }
  }

  .brand {
    display: inline-flex;
    width: fit-content;
    align-items: baseline;
    gap: 5px;
    font-size: 0.82rem;
  }

  .brand span {
    color: var(--muted-strong);
  }

  .brand strong {
    color: var(--ink);
    font-family: var(--font-reading);
    font-size: 1rem;
  }

  nav {
    display: flex;
    justify-self: end;
    align-self: stretch;
  }

  nav a {
    display: flex;
    min-width: 58px;
    align-items: center;
    justify-content: center;
    border-bottom: 2px solid transparent;
    color: var(--muted);
    font-size: 0.76rem;
    font-weight: 650;
  }

  nav a:hover {
    color: var(--ink);
  }

  nav a[aria-current="page"] {
    border-bottom-color: var(--accent);
    color: var(--accent-dark);
  }

  .header-search {
    display: flex;
    width: 100%;
    min-height: 34px;
    align-items: center;
    border: 1px solid var(--line-strong);
    border-radius: 9px;
    background: color-mix(in srgb, var(--surface) 75%, transparent);
  }

  .header-search:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent-soft) 80%, transparent);
  }

  .header-search svg {
    width: 15px;
    margin-left: 11px;
    fill: none;
    stroke: var(--muted);
    stroke-linecap: round;
    stroke-width: 1.8;
  }

  .header-search input {
    min-width: 0;
    min-height: 34px;
    flex: 1;
    border: 0;
    outline: 0;
    background: transparent;
    padding: 0 10px;
    color: var(--ink);
    font-size: 0.76rem;
  }

  .header-search button {
    min-width: 46px;
    align-self: stretch;
    border: 0;
    border-left: 1px solid var(--line);
    border-radius: 0 8px 8px 0;
    background: transparent;
    color: var(--accent-dark);
    cursor: pointer;
    font-size: 0.7rem;
    font-weight: 750;
  }

  .header-search button:hover {
    background: var(--accent-soft);
  }

  @media (max-width: 760px) {
    .header-inner {
      grid-template-columns: 1fr auto;
      gap: 0 10px;
      padding-top: 5px;
    }

    nav a {
      min-width: 52px;
      min-height: 42px;
    }

    .header-search {
      grid-column: 1 / -1;
      grid-row: 2;
      margin-block: 4px 9px;
    }

    .header-search,
    .header-search input {
      min-height: 42px;
    }
  }

  @media (max-width: 390px) {
    .header-inner {
      width: calc(100% - 20px);
    }

    .brand span {
      display: none;
    }

    nav a {
      min-width: 48px;
      font-size: 0.72rem;
    }
  }

  @media (min-width: 801px) {
    .header-inner { grid-template-columns: 1fr; }
    .site-header .brand,
    .site-header nav { display: none; }
    .header-search { max-width: 430px; justify-self: center; }
  }
</style>
