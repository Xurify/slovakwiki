<script lang="ts">
  import type { Snippet } from "svelte";

  import ThemeToggle from "./ThemeToggle.svelte";
  import BrandLockup from "$lib/components/ui/BrandLockup.svelte";
  import {
    isReferenceSection,
    navigationIsActive,
    primaryNavigation,
    referenceNavigation,
  } from "./navigation";

  let {
    pathname,
    search,
  }: {
    pathname: string;
    search?: Snippet;
  } = $props();

  let menuOpen = $state(false);
  let referenceMenuOpen = $state(false);
  let referenceDetailsEl = $state<HTMLDetailsElement | null>(null);
  let headerEl = $state<HTMLElement | null>(null);
  let headerOffset = $state(72);

  function isActive(href: string): boolean {
    return navigationIsActive(pathname, href);
  }

  function closeMenu(): void {
    menuOpen = false;
  }

  function toggleMenu(): void {
    menuOpen = !menuOpen;
  }

  const referenceOpen = $derived(isReferenceSection(pathname));

  const drawerMotion = $derived(
    menuOpen
      ? "duration-300 ease-[cubic-bezier(0.2,0,0,1)]"
      : "duration-200 ease-[cubic-bezier(0.2,0,0,1)]",
  );

  function linkDelay(index: number): string {
    return menuOpen ? `${80 + index * 45}ms` : "0ms";
  }

  $effect(() => {
    if (!headerEl) {
      return;
    }

    function syncOffset(): void {
      if (!headerEl) {
        return;
      }
      headerOffset = Math.ceil(headerEl.getBoundingClientRect().height);
    }

    syncOffset();

    const observer = new ResizeObserver(syncOffset);
    observer.observe(headerEl);

    return () => observer.disconnect();
  });

  $effect(() => {
    function onResize(): void {
      if (window.matchMedia("(min-width: 801px)").matches) {
        closeMenu();
      }
    }

    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  });

  $effect(() => {
    if (!referenceMenuOpen) {
      return;
    }

    function onPointerDown(event: PointerEvent): void {
      const target = event.target;
      if (!(target instanceof Node) || referenceDetailsEl?.contains(target)) {
        return;
      }

      referenceMenuOpen = false;
    }

    function onKeydown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        referenceMenuOpen = false;
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeydown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeydown);
    };
  });

  $effect(() => {
    if (!menuOpen) {
      return;
    }

    function onKeydown(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        closeMenu();
      }
    }

    window.getSelection()?.removeAllRanges();

    const main = document.getElementById("main-content");
    const footer = document.querySelector("footer");
    main?.setAttribute("inert", "");
    footer?.setAttribute("inert", "");

    const previousOverflow = document.body.style.overflow;
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.overflow = "hidden";
    document.body.style.userSelect = "none";
    document.addEventListener("keydown", onKeydown);

    return () => {
      main?.removeAttribute("inert");
      footer?.removeAttribute("inert");
      document.body.style.overflow = previousOverflow;
      document.body.style.userSelect = previousUserSelect;
      document.removeEventListener("keydown", onKeydown);
    };
  });
</script>

<a
  class="fixed left-3 top-3 z-[100] -translate-y-[160%] rounded-(--control-radius) bg-(--surface) px-3.5 py-2.5 font-bold text-(--accent-strong) shadow-(--shadow-border) transition-transform focus:translate-y-0"
  href="#main-content"
>
  Skip to main content
</a>

<header
  bind:this={headerEl}
  class="sticky top-0 border-b border-(--line) bg-(--paper)/95 backdrop-blur-md {menuOpen
    ? 'z-[80]'
    : 'z-50'}"
>
  <div
    class="mx-auto flex min-h-(--header-height) w-[min(var(--workspace-max),calc(100%-48px))] items-center gap-6 max-[800px]:w-[calc(100%-28px)] max-[480px]:w-[calc(100%-24px)] max-[800px]:flex-wrap max-[800px]:gap-x-3 max-[800px]:gap-y-2.5 max-[800px]:py-3"
  >
    <a class="inline-flex shrink-0 items-center" href="/" aria-label="Slovak Wiki home">
      <BrandLockup size="header" />
    </a>

    <nav class="hidden items-center gap-1 min-[801px]:flex" aria-label="Main navigation">
      {#each primaryNavigation as link (link.href)}
        <a
          class="relative inline-flex h-10 items-center px-3 text-[0.82rem] font-semibold leading-none text-(--muted-strong) transition-colors hover:text-(--ink) after:absolute after:inset-x-3 after:bottom-1.5 after:h-px after:origin-left after:scale-x-0 after:bg-(--accent) after:transition-transform aria-[current=page]:text-(--accent-strong) aria-[current=page]:after:scale-x-100"
          href={link.href}
          aria-current={isActive(link.href) ? "page" : undefined}
        >
          {link.label}
        </a>
      {/each}

      <details
        bind:this={referenceDetailsEl}
        bind:open={referenceMenuOpen}
        class="group relative"
      >
        <summary
          class="flex h-10 cursor-pointer list-none items-center gap-1 px-3 text-[0.82rem] font-semibold leading-none text-(--muted-strong) transition-colors hover:text-(--ink) group-open:text-(--accent-strong) marker:content-none [&::-webkit-details-marker]:hidden {referenceOpen
            ? 'text-(--accent-strong)'
            : ''}"
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
              class="block px-4 py-2.5 font-serif text-sm text-(--ink-soft) hover:bg-(--surface-subtle) hover:text-(--accent-strong) aria-[current=page]:bg-(--surface-selected) aria-[current=page]:font-semibold aria-[current=page]:text-(--accent-strong)"
              href={item.href}
              role="menuitem"
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </a>
          {/each}
        </div>
      </details>

      <ThemeToggle class="ml-1" />
    </nav>

    {#if search}
      {@render search()}
    {/if}

    <div class="ml-auto flex shrink-0 items-center gap-0.5 min-[801px]:hidden">
      <ThemeToggle />

      <button
        class="flex min-h-10 min-w-10 cursor-pointer items-center justify-center border-0 bg-transparent p-2 text-(--ink-soft) transition-transform duration-150 ease-out active:scale-[0.98]"
        type="button"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls="mobile-navigation"
        onclick={toggleMenu}
      >
        <span class="relative block h-6 w-6" aria-hidden="true">
          <svg
            class="absolute inset-0 h-6 w-6 fill-none stroke-current stroke-2 transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)] {menuOpen
              ? 'scale-100 opacity-100 blur-0'
              : 'scale-[0.25] opacity-0 blur-[4px]'}"
            viewBox="0 0 24 24"
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>

          <svg
            class="h-6 w-6 fill-none stroke-current stroke-2 transition-[opacity,filter,scale] duration-300 ease-[cubic-bezier(0.2,0,0,1)] {menuOpen
              ? 'scale-[0.25] opacity-0 blur-[4px]'
              : 'scale-100 opacity-100 blur-0'}"
            viewBox="0 0 24 24"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </span>
      </button>
    </div>
  </div>
</header>

<div
  class="fixed inset-x-0 bottom-0 z-[60] touch-manipulation select-none bg-panel-inverse/30 p-0 backdrop-blur-[1px] transition-[opacity,backdrop-filter] [-webkit-touch-callout:none] min-[801px]:hidden {drawerMotion} {menuOpen
    ? 'opacity-100'
    : 'pointer-events-none opacity-0'}"
  style:top="{headerOffset}px"
  role="presentation"
  aria-hidden="true"
  inert={!menuOpen}
  onpointerdown={(event) => {
    event.preventDefault();
    closeMenu();
  }}
  oncontextmenu={(event) => event.preventDefault()}
></div>

<nav
  class="fixed bottom-0 right-0 z-[70] flex w-[min(20rem,calc(100vw-2.5rem))] flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-transparent border-l border-(--line) bg-(--paper) px-5 pb-8 pt-4 shadow-(--shadow-border) transition-transform will-change-transform select-none min-[801px]:hidden {drawerMotion} {menuOpen
    ? 'translate-x-0'
    : 'pointer-events-none translate-x-full'}"
  style:top="{headerOffset}px"
  id="mobile-navigation"
  aria-label="Mobile navigation"
  aria-hidden={!menuOpen}
  inert={!menuOpen}
>
  {#each primaryNavigation as link, index (link.href)}
    <a
      class="block border-b border-(--line) py-3.5 text-[0.95rem] font-semibold text-(--ink-soft) transition-[opacity,transform,filter] aria-[current=page]:text-(--accent-strong) {drawerMotion} {menuOpen
        ? 'translate-y-0 opacity-100 blur-0'
        : 'translate-y-3 opacity-0 blur-[4px]'}"
      style:transition-delay={linkDelay(index)}
      href={link.href}
      aria-current={isActive(link.href) ? "page" : undefined}
      tabindex={menuOpen ? 0 : -1}
      onclick={closeMenu}
    >
      {link.label}
    </a>
  {/each}

  <p
    class="mb-1 mt-5 text-[0.64rem] font-bold uppercase tracking-[0.1em] text-(--muted) transition-[opacity,transform,filter] {drawerMotion} {menuOpen
      ? 'translate-y-0 opacity-100 blur-0'
      : 'translate-y-3 opacity-0 blur-[4px]'}"
    style:transition-delay={linkDelay(primaryNavigation.length)}
  >
    Reference
  </p>

  {#each referenceNavigation as item, index (item.href)}
    <a
      class="block border-b border-(--line)/70 py-3 font-serif text-[0.95rem] text-(--ink-soft) transition-[opacity,transform,filter] aria-[current=page]:font-semibold aria-[current=page]:text-(--accent-strong) {drawerMotion} {menuOpen
        ? 'translate-y-0 opacity-100 blur-0'
        : 'translate-y-3 opacity-0 blur-[4px]'}"
      style:transition-delay={linkDelay(primaryNavigation.length + 1 + index)}
      href={item.href}
      aria-current={isActive(item.href) ? "page" : undefined}
      tabindex={menuOpen ? 0 : -1}
      onclick={closeMenu}
    >
      {item.label}
    </a>
  {/each}
</nav>
