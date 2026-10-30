<script lang="ts">
  import { eyebrowMutedClass } from "$lib/components/ui/system-ui";
  import type { Snippet } from "svelte";

  import SfxMuteToggle from "$lib/audio/SfxMuteToggle.svelte";
  import ThemeToggle from "./ThemeToggle.svelte";
  import BrandLockup from "$lib/components/ui/BrandLockup.svelte";
  import {
    isReferenceSection,
    navigationIsActive,
    primaryNavigation,
    referenceNavigationGroups,
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

  const topLinkClass =
    "relative inline-flex h-10 items-center px-3 text-[0.85rem] font-semibold leading-none text-panel-inverse-ink/80 transition-colors duration-150 hover:text-panel-inverse-ink after:absolute after:inset-x-3 after:bottom-1.5 after:h-px after:origin-left after:scale-x-0 after:bg-panel-inverse-ink after:transition-transform after:duration-150 aria-[current=page]:text-panel-inverse-ink aria-[current=page]:after:scale-x-100";

  const menuGroupLabelClass = `${eyebrowMutedClass} px-2.5 pt-2 pb-1`;

  const menuItemClass =
    "flex items-center justify-between gap-3 rounded-(--control-radius) px-2.5 py-1.5 text-sm text-slate-700 no-underline transition-colors duration-150 hover:bg-subtle hover:text-slate-900 aria-[current=page]:font-semibold aria-[current=page]:text-blue-800";

  const drawerLinkClass =
    "block border-b border-slate-200 py-3.5 text-[0.95rem] font-semibold text-slate-800 no-underline aria-[current=page]:text-blue-800";

  const drawerItemClass =
    "block border-b border-slate-200/70 py-3 text-[0.95rem] text-slate-800 no-underline aria-[current=page]:font-semibold aria-[current=page]:text-blue-800";
</script>

<a
  class="fixed left-3 top-3 z-[100] -translate-y-[160%] rounded-(--control-radius) bg-(--surface) px-3.5 py-2.5 font-bold text-(--accent-strong) shadow-(--shadow-border) transition-transform focus:translate-y-0"
  href="#main-content"
>
  Skip to main content
</a>

<header
  bind:this={headerEl}
  class="sticky top-0 border-b border-panel-inverse-ink/12 bg-panel-inverse {menuOpen
    ? 'z-[80]'
    : 'z-50'}"
>
  <div
    class="mx-auto flex min-h-(--header-height) w-[min(var(--workspace-max),calc(100%-48px))] items-center gap-8 max-[800px]:w-[calc(100%-28px)] max-[480px]:w-[calc(100%-24px)] max-[800px]:flex-wrap max-[800px]:gap-x-3 max-[800px]:gap-y-2.5 max-[800px]:py-3"
  >
    <a class="inline-flex shrink-0 items-center" href="/" aria-label="Slovak Wiki home">
      <BrandLockup size="header" tone="inverse" />
    </a>

    {#if search}
      {@render search()}
    {/if}

    <nav
      class="ml-auto hidden items-center gap-1 min-[801px]:flex"
      aria-label="Main navigation"
    >
      {#each primaryNavigation as link (link.href)}
        <a
          class={topLinkClass}
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
          class="flex h-10 cursor-pointer list-none items-center gap-1 px-3 text-[0.85rem] font-semibold leading-none transition-colors duration-150 hover:text-panel-inverse-ink group-open:text-panel-inverse-ink marker:content-none [&::-webkit-details-marker]:hidden {referenceOpen
            ? 'text-panel-inverse-ink'
            : 'text-panel-inverse-ink/80'}"
        >
          More
          <svg
            class="w-3 fill-none stroke-current stroke-2 transition-transform duration-150 group-open:rotate-180"
            aria-hidden="true"
            viewBox="0 0 24 24"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </summary>

        <div
          class="absolute top-full left-0 z-50 mt-1.5 w-60 rounded-(--frame-radius) bg-surface py-1 shadow-(--shadow-float)"
          role="menu"
        >
          {#each referenceNavigationGroups as group (group.label)}
            <div
              class="border-t border-slate-200/80 px-1.5 py-1 first:border-t-0"
              role="group"
              aria-label={group.label}
            >
              <p class={menuGroupLabelClass} aria-hidden="true">{group.label}</p>

              {#each group.items as item (item.href)}
                <a
                  class={menuItemClass}
                  href={item.href}
                  role="menuitem"
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.label}

                  {#if isActive(item.href)}
                    <span
                      class="size-1.5 shrink-0 rounded-full bg-current"
                      aria-hidden="true"
                    ></span>
                  {/if}
                </a>
              {/each}
            </div>
          {/each}
        </div>
      </details>

      <SfxMuteToggle class="ml-1" tone="inverse" />
      <ThemeToggle tone="inverse" />
    </nav>

    <div class="ml-auto flex shrink-0 items-center gap-0.5 min-[801px]:hidden">
      <SfxMuteToggle tone="inverse" />
      <ThemeToggle tone="inverse" />

      <button
        class="flex min-h-11 min-w-11 cursor-pointer items-center justify-center border-0 bg-transparent p-2 text-panel-inverse-ink"
        type="button"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        aria-controls="mobile-navigation"
        onclick={toggleMenu}
      >
        {#if menuOpen}
          <svg
            class="h-6 w-6 fill-none stroke-current stroke-2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        {:else}
          <svg
            class="h-6 w-6 fill-none stroke-current stroke-2"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        {/if}
      </button>
    </div>
  </div>
</header>

<div
  class="fixed inset-x-0 bottom-0 z-[60] touch-manipulation select-none bg-panel-inverse/30 p-0 transition-opacity duration-200 ease-out [-webkit-touch-callout:none] min-[801px]:hidden {menuOpen
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
  class="fixed bottom-0 right-0 z-[70] flex w-[min(20rem,calc(100vw-2.5rem))] flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-transparent border-l border-slate-200 bg-paper px-5 pb-8 pt-3 shadow-(--shadow-float) transition-transform duration-200 ease-out will-change-transform select-none min-[801px]:hidden {menuOpen
    ? 'translate-x-0'
    : 'pointer-events-none translate-x-full'}"
  style:top="{headerOffset}px"
  id="mobile-navigation"
  aria-label="Mobile navigation"
  aria-hidden={!menuOpen}
  inert={!menuOpen}
>
  {#each primaryNavigation as link (link.href)}
    <a
      class={drawerLinkClass}
      href={link.href}
      aria-current={isActive(link.href) ? "page" : undefined}
      tabindex={menuOpen ? 0 : -1}
      onclick={closeMenu}
    >
      {link.label}
    </a>
  {/each}

  {#each referenceNavigationGroups as group (group.label)}
    <p class="{eyebrowMutedClass} mb-1 mt-5">
      {group.label}
    </p>

    {#each group.items as item (item.href)}
      <a
        class={drawerItemClass}
        href={item.href}
        aria-current={isActive(item.href) ? "page" : undefined}
        tabindex={menuOpen ? 0 : -1}
        onclick={closeMenu}
      >
        {item.label}
      </a>
    {/each}
  {/each}
</nav>
