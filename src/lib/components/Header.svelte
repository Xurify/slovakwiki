<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { navigationIsActive, primaryNavigation } from "$lib/navigation";

  let query = $state("");

  function isActive(href: string): boolean {
    return navigationIsActive(page.url.pathname, href);
  }

  function handleSubmit(event: SubmitEvent): void {
    event.preventDefault();
    const trimmedQuery = query.trim();
    if (trimmedQuery) goto(`/search?q=${encodeURIComponent(trimmedQuery)}`);
  }
</script>

<a
  class="fixed left-3 top-3 z-[100] -translate-y-[160%] rounded-[var(--control-radius)] bg-[var(--surface)] px-3.5 py-2.5 font-bold text-[var(--accent-dark)] shadow-[var(--shadow-border)] transition-transform focus:translate-y-0"
  href="#main-content"
>Skip to main content</a>

<header class="sticky top-0 z-20 min-h-[var(--header-height)] border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--paper)_92%,transparent)] shadow-[0_1px_0_rgb(255_255_255_/_60%),0_8px_18px_-16px_rgb(24_47_61_/_38%)] backdrop-blur-xl">
  <div class="mx-auto grid min-h-[var(--header-height)] w-[calc(100%-32px)] grid-cols-[minmax(150px,1fr)_minmax(280px,430px)_minmax(150px,1fr)] items-center gap-6 min-[801px]:grid-cols-1 max-[760px]:grid-cols-[1fr_auto] max-[760px]:gap-x-2 max-[760px]:pt-1 max-[390px]:w-[calc(100%-20px)]">
    <a class="inline-flex w-fit items-baseline gap-[5px] text-[0.82rem] min-[801px]:hidden" href="/" aria-label="Slovak Wiki home">
      <span class="text-[var(--muted-strong)]">Slovak</span>
      <strong class="font-[var(--font-reading)] text-base text-[var(--ink)]">Wiki</strong>
    </a>

    <form class="flex min-h-[36px] w-full items-center rounded-[var(--control-radius)] border border-[var(--line-strong)] bg-[var(--surface)] shadow-[0_1px_2px_rgb(24_47_61_/_4%)] transition-[border-color,box-shadow] focus-within:border-[var(--accent)] focus-within:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent-soft)_80%,transparent),0_2px_6px_rgb(24_47_61_/_8%)] max-[760px]:col-span-full max-[760px]:row-start-2 max-[760px]:my-1 max-[760px]:mb-[9px] max-[760px]:min-h-[42px] min-[801px]:max-w-[430px] min-[801px]:justify-self-center" role="search" onsubmit={handleSubmit}>
      <label class="sr-only" for="header-search">Search Slovak Wiki</label>
      <svg class="ml-[11px] w-[15px] shrink-0 fill-none stroke-[var(--muted)] stroke-[1.8]" aria-hidden="true" viewBox="0 0 24 24">
        <path d="m21 21-4.35-4.35m2.35-5.15a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
      </svg>
      <input class="min-h-[34px] min-w-0 flex-1 border-0 bg-transparent px-2.5 text-[0.76rem] text-[var(--ink)] outline-0 max-[760px]:min-h-[42px]" id="header-search" bind:value={query} type="search" placeholder="Search or ask…">
      <button class="min-w-[46px] cursor-pointer self-stretch rounded-r-[var(--control-radius)] border-0 border-l border-[var(--line)] bg-transparent text-[0.7rem] font-extrabold text-[var(--accent-dark)] hover:bg-[var(--accent-soft)]" type="submit">Go</button>
    </form>

    <nav class="flex justify-self-end self-stretch min-[801px]:hidden" aria-label="Main navigation">
      {#each primaryNavigation as link (link.href)}
        <a class="flex min-w-[58px] items-center justify-center border-b-2 border-transparent text-[0.76rem] font-semibold text-[var(--muted)] hover:text-[var(--ink)] max-[760px]:min-w-0 max-[760px]:min-h-[42px] max-[760px]:px-[7px] max-[390px]:px-[5px] max-[390px]:text-[0.67rem] aria-[current=page]:border-[var(--accent)] aria-[current=page]:text-[var(--accent-dark)]" href={link.href} aria-current={isActive(link.href) ? "page" : undefined}>
          {link.label}
        </a>
      {/each}
    </nav>
  </div>
</header>
