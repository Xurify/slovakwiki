<script lang="ts">
  import {
    navigationIsActive,
    primaryNavigation,
    referenceNavigation,
  } from "$lib/navigation";

  let { pathname, query = "" }: { pathname: string; query?: string } = $props();

  function isActive(href: string): boolean {
    return navigationIsActive(pathname, href);
  }
</script>

<a
  class="fixed left-3 top-3 z-[100] -translate-y-[160%] rounded-(--control-radius) bg-(--surface) px-3.5 py-2.5 font-bold text-(--accent-dark) shadow-(--shadow-border) transition-transform focus:translate-y-0"
  href="#main-content"
>
  Skip to main content
</a>

<header
  class="sticky top-0 z-50 border-b border-(--line) bg-(--paper)/95 backdrop-blur-md"
>
  <div
    class="mx-auto flex min-h-(--header-height) w-[min(var(--workspace-max),calc(100%-48px))] items-center gap-6 max-[800px]:w-[calc(100%-28px)] max-[680px]:flex-wrap max-[680px]:gap-x-3 max-[680px]:py-3"
  >
    <a class="inline-flex shrink-0 items-baseline gap-1.5" href="/" aria-label="Slovak Wiki home">
      <span class="text-[0.78rem] font-semibold tracking-wide text-(--muted-strong)">Slovak</span>
      <strong class="font-serif text-[1.35rem] font-semibold text-(--ink)">Wiki</strong>
    </a>

    <nav class="hidden items-center gap-1 min-[801px]:flex" aria-label="Main navigation">
      {#each primaryNavigation.filter((item) => item.href !== "/wiki") as link (link.href)}
        <a
          class="relative px-3 py-2 text-[0.82rem] font-semibold text-(--muted-strong) transition-colors hover:text-(--ink) after:absolute after:inset-x-3 after:bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-(--accent) after:transition-transform aria-[current=page]:text-(--accent-dark) aria-[current=page]:after:scale-x-100"
          href={link.href}
          aria-current={isActive(link.href) ? "page" : undefined}
        >
          {link.label}
        </a>
      {/each}

      <details class="group relative">
        <summary
          class="flex cursor-pointer list-none items-center gap-1 px-3 py-2 text-[0.82rem] font-semibold text-(--muted-strong) transition-colors hover:text-(--ink) group-open:text-(--accent-dark) marker:content-none [&::-webkit-details-marker]:hidden"
        >
          Reference
          <svg
            class="w-3 fill-none stroke-current stroke-2 transition-transform group-open:rotate-180"
            aria-hidden="true"
            viewBox="0 0 24 24"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </summary>

        <div
          class="absolute left-0 top-full z-50 mt-1 min-w-[220px] border border-(--line) bg-(--surface) py-1 shadow-(--shadow-border)"
          role="menu"
        >
          {#each referenceNavigation as item (item.href)}
            <a
              class="block px-4 py-2.5 font-serif text-sm text-(--ink-soft) hover:bg-(--surface-subtle) hover:text-(--accent-dark) aria-[current=page]:bg-(--surface-selected) aria-[current=page]:font-semibold aria-[current=page]:text-(--accent-dark)"
              href={item.href}
              role="menuitem"
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </a>
          {/each}
        </div>
      </details>
    </nav>

    <form
      class="ml-auto flex min-h-10 w-full max-w-[280px] items-center rounded-(--control-radius) border border-(--line-strong) bg-(--surface) transition-[box-shadow,border-color] focus-within:border-(--accent) focus-within:shadow-[0_0_0_3px_var(--accent-soft)] max-[680px]:order-3 max-[680px]:max-w-none"
      action="/search"
      method="get"
      role="search"
    >
      <label class="sr-only" for="header-search">Search Slovak Wiki</label>
      <svg
        class="ml-3 w-4 shrink-0 fill-none stroke-(--muted) stroke-[1.8]"
        aria-hidden="true"
        viewBox="0 0 24 24"
      >
        <path d="m21 21-4.35-4.35m2.35-5.15a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
      </svg>
      <input
        class="min-h-[38px] min-w-0 flex-1 border-0 bg-transparent px-2.5 text-[0.8rem] text-(--ink) outline-none"
        id="header-search"
        name="q"
        value={query}
        type="search"
        placeholder="Search…"
      />
    </form>

    <details class="relative max-[800px]:block min-[801px]:hidden">
      <summary
        class="flex cursor-pointer list-none p-2 text-(--ink-soft) marker:content-none [&::-webkit-details-marker]:hidden"
        aria-label="Menu"
      >
        <svg class="h-6 w-6 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </summary>

      <nav
        class="absolute right-0 top-full z-50 mt-2 w-[min(280px,calc(100vw-28px))] border border-(--line) bg-(--paper) px-4 py-3 shadow-(--shadow-border)"
        aria-label="Mobile navigation"
      >
        {#each primaryNavigation.filter((item) => item.href !== "/wiki") as link (link.href)}
          <a
            class="block border-b border-(--line) py-3 text-[0.9rem] font-semibold text-(--ink-soft) aria-[current=page]:text-(--accent-dark)"
            href={link.href}
            aria-current={isActive(link.href) ? "page" : undefined}
          >
            {link.label}
          </a>
        {/each}

        <p class="mb-2 mt-4 text-[0.64rem] font-bold uppercase tracking-[0.1em] text-(--muted)">
          Reference
        </p>
        {#each referenceNavigation as item (item.href)}
          <a
            class="block py-2.5 pl-2 font-serif text-sm text-(--ink-soft) aria-[current=page]:font-semibold aria-[current=page]:text-(--accent-dark)"
            href={item.href}
            aria-current={isActive(item.href) ? "page" : undefined}
          >
            {item.label}
          </a>
        {/each}
      </nav>
    </details>
  </div>
</header>
