<script lang="ts">
  import {
    primaryNavigation,
    referenceNavigation,
    sidebarNavigationIsActive,
  } from "$lib/navigation";

  let { pathname }: { pathname: string } = $props();

  const isActive = (href: string): boolean => sidebarNavigationIsActive(pathname, href);
  const studyNavigation = primaryNavigation.filter((item) => item.href !== "/wiki");
</script>

<aside
  class="sticky top-0 flex h-screen flex-col border-r border-(--line) bg-(--paper) px-4 pb-4 pt-6 max-[800px]:hidden"
  aria-label="Site navigation"
>
  <a
    class="mb-[42px] ml-[9px] inline-flex items-baseline gap-[5px] text-[0.83rem]"
    href="/"
    aria-label="Slovak Wiki home"
  >
    <span class="text-(--muted-strong)">Slovak</span>
    <strong class="font-(--font-reading) text-[1.05rem] text-(--ink)">Wiki</strong>
  </a>

  <p
    class="mb-2 ml-2.5 text-[0.61rem] font-extrabold uppercase tracking-[0.12em] text-(--muted)"
  >
    Study
  </p>
  <nav class="grid gap-px" aria-label="Study navigation">
    {#each studyNavigation as item (item.href)}
      <a
        class="min-h-10 rounded-r-(--control-radius) border-l-[3px] border-transparent px-2.5 py-[9px] text-[0.84rem] text-(--ink-soft) hover:bg-(--surface-subtle) hover:text-(--accent-dark) aria-[current=page]:border-(--action) aria-[current=page]:bg-(--surface-selected) aria-[current=page]:font-bold aria-[current=page]:text-(--ink)"
        href={item.href}
        aria-current={isActive(item.href) ? "page" : undefined}
      >
        {item.label}
      </a>
    {/each}
  </nav>

  <nav class="mt-[33px] grid gap-px" aria-label="Reference navigation">
    <p
      class="mb-2 ml-2.5 text-[0.61rem] font-extrabold uppercase tracking-[0.12em] text-(--muted)"
    >
      Reference
    </p>
    {#each referenceNavigation as item (item.href)}
      <a
        class="min-h-10 rounded-r-(--control-radius) border-l-[3px] border-transparent px-2.5 py-[9px] text-[0.84rem] text-(--ink-soft) hover:bg-(--surface-subtle) hover:text-(--accent-dark) aria-[current=page]:border-(--action) aria-[current=page]:bg-(--surface-selected) aria-[current=page]:font-bold aria-[current=page]:text-(--ink)"
        href={item.href}
        aria-current={isActive(item.href) ? "page" : undefined}
      >
        {item.label}
      </a>
    {/each}
  </nav>

  <div
    class="mt-auto flex gap-3.5 border-t border-(--line) px-[9px] pt-[13px] text-[0.69rem] text-(--muted)"
  >
    <a
      class="hover:text-(--accent-dark) hover:underline hover:underline-offset-3"
      href="/search"
    >
      Search
    </a>
    <a
      class="hover:text-(--accent-dark) hover:underline hover:underline-offset-3"
      href="/"
    >
      About
    </a>
  </div>
</aside>
