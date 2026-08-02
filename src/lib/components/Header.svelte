<script lang="ts">
  import { navigationIsActive, primaryNavigation } from "$lib/navigation";

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
  class="sticky top-0 z-20 min-h-(--header-height) border-b border-(--line) bg-(--paper)"
>
  <div
    class="mx-auto grid min-h-(--header-height) w-[min(var(--workspace-max),calc(100%-64px))] grid-cols-[minmax(150px,1fr)_minmax(280px,520px)_minmax(150px,1fr)] items-center gap-6 min-[801px]:grid-cols-1 max-[800px]:w-[calc(100%-40px)] max-[760px]:grid-cols-[1fr_auto] max-[760px]:gap-x-2 max-[760px]:pt-1 max-[390px]:w-[calc(100%-20px)]"
  >
    <a
      class="inline-flex w-fit items-baseline gap-[5px] text-[0.82rem] min-[801px]:hidden"
      href="/"
      aria-label="Slovak Wiki home"
    >
      <span class="text-(--muted-strong)">Slovak</span>
      <strong class="font-(--font-reading) text-base text-(--ink)">Wiki</strong>
    </a>

    <form
      class="flex min-h-10 w-full items-center rounded-(--control-radius) border border-(--line-strong) bg-(--surface) max-[760px]:col-span-full max-[760px]:row-start-2 max-[760px]:my-1 max-[760px]:mb-[9px] max-[760px]:min-h-[42px] min-[801px]:max-w-[520px] min-[801px]:justify-self-center"
      action="/search"
      method="get"
      role="search"
    >
      <label class="sr-only" for="header-search">Search Slovak Wiki</label>
      <svg
        class="ml-[11px] w-[15px] shrink-0 fill-none stroke-(--muted) stroke-[1.8]"
        aria-hidden="true"
        viewBox="0 0 24 24"
      >
        <path d="m21 21-4.35-4.35m2.35-5.15a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
      </svg>
      <input
        class="min-h-[34px] min-w-0 flex-1 border-0 bg-transparent px-2.5 text-[0.76rem] text-(--ink) outline-none max-[760px]:min-h-[42px]"
        id="header-search"
        name="q"
        value={query}
        type="search"
        placeholder="Search or ask…"
      />
      <button
        class="min-w-[46px] cursor-pointer self-stretch rounded-r-(--control-radius) border-0 border-l border-(--line) bg-transparent text-[0.7rem] font-extrabold text-(--accent-dark) hover:bg-(--accent-soft)"
        type="submit"
      >
        Go
      </button>
    </form>

    <nav
      class="flex justify-self-end self-stretch min-[801px]:hidden"
      aria-label="Main navigation"
    >
      {#each primaryNavigation as link (link.href)}
        <a
          class="flex min-w-[58px] items-center justify-center border-b-2 border-transparent text-[0.76rem] font-semibold text-(--muted) hover:text-(--ink) max-[760px]:min-w-0 max-[760px]:min-h-[42px] max-[760px]:px-[7px] max-[390px]:px-[5px] max-[390px]:text-[0.67rem] aria-[current=page]:border-(--accent) aria-[current=page]:text-(--accent-dark)"
          href={link.href}
          aria-current={isActive(link.href) ? "page" : undefined}
        >
          {link.label}
        </a>
      {/each}
    </nav>
  </div>
</header>
