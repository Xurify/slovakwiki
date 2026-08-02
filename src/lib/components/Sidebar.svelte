<script lang="ts">
  import { page } from "$app/state";
  import { primaryNavigation, referenceNavigation, sidebarNavigationIsActive } from "$lib/navigation";

  const isActive = (href: string): boolean => sidebarNavigationIsActive(page.url.pathname, href);
  const studyNavigation = primaryNavigation.filter((item) => item.href !== "/wiki");
</script>

<aside class="sticky top-0 flex h-screen flex-col border-r border-[var(--line)] bg-[color-mix(in_srgb,var(--paper)_88%,var(--surface))] px-4 pb-4 pt-[25px] shadow-[8px_0_18px_-20px_rgb(24_47_61_/_55%)] max-[800px]:hidden" aria-label="Site navigation">
  <a class="mb-[42px] ml-[9px] inline-flex items-baseline gap-[5px] text-[0.83rem]" href="/" aria-label="Slovak Wiki home">
    <span class="text-[var(--muted-strong)]">Slovak</span><strong class="font-[var(--font-reading)] text-[1.05rem] text-[var(--ink)]">Wiki</strong>
  </a>

  <p class="mb-2 ml-2.5 text-[0.61rem] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">Study</p>
  <nav class="grid gap-px" aria-label="Study navigation">
    {#each studyNavigation as item (item.href)}
      <a class="min-h-10 rounded-r-[var(--control-radius)] border-l-[3px] border-transparent px-2.5 py-[9px] text-[0.84rem] text-[var(--ink-soft)] hover:bg-[var(--surface-subtle)] hover:text-[var(--accent-dark)] aria-[current=page]:border-[var(--action)] aria-[current=page]:bg-[var(--surface-selected)] aria-[current=page]:font-bold aria-[current=page]:text-[var(--ink)]" href={item.href} aria-current={isActive(item.href) ? "page" : undefined}>{item.label}</a>
    {/each}
  </nav>

  <nav class="mt-[33px] grid gap-px" aria-label="Reference navigation">
    <p class="mb-2 ml-2.5 text-[0.61rem] font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">Reference</p>
    {#each referenceNavigation as item (item.href)}
      <a class="min-h-10 rounded-r-[var(--control-radius)] border-l-[3px] border-transparent px-2.5 py-[9px] text-[0.84rem] text-[var(--ink-soft)] hover:bg-[var(--surface-subtle)] hover:text-[var(--accent-dark)] aria-[current=page]:border-[var(--action)] aria-[current=page]:bg-[var(--surface-selected)] aria-[current=page]:font-bold aria-[current=page]:text-[var(--ink)]" href={item.href} aria-current={isActive(item.href) ? "page" : undefined}>{item.label}</a>
    {/each}
  </nav>

  <div class="mt-auto flex gap-3.5 border-t border-[var(--line)] px-[9px] pt-[13px] text-[0.69rem] text-[var(--muted)]">
    <a class="hover:text-[var(--accent-dark)] hover:underline hover:underline-offset-3" href="/search">Search</a><a class="hover:text-[var(--accent-dark)] hover:underline hover:underline-offset-3" href="/">About</a>
  </div>
</aside>
