<script lang="ts">
  import BrandLockup from "$lib/components/ui/BrandLockup.svelte";
  import { eyebrowMutedClass } from "$lib/components/ui/system-ui";
  import { cx } from "$lib/ui/classes";

  import {
    levelTestNavigation,
    navigationIsActive,
    primaryNavigation,
    referenceNavigationGroups,
    type NavigationGroup,
  } from "./navigation";

  let { pathname }: { pathname: string } = $props();

  /** Header's primary links and the level test, then the More menu, in the same order. */
  const groups: NavigationGroup[] = [
    { label: "Study", items: [...primaryNavigation, levelTestNavigation] },
    ...referenceNavigationGroups,
  ];
</script>

<footer class="border-t border-slate-200 bg-paper">
  <div
    class={cx(
      "mx-auto flex w-[min(var(--workspace-max),calc(100%-48px))] items-start justify-between gap-x-12 gap-y-8 py-10",
      "max-[900px]:flex-col",
      "max-[800px]:w-[calc(100%-28px)]",
      "max-[560px]:py-8",
      "max-[480px]:w-[calc(100%-24px)]",
    )}
  >
    <div class="w-56 shrink-0">
      <a class="inline-flex w-fit" href="/" aria-label="Slovak Wiki home">
        <BrandLockup size="footer" />
      </a>

      <p class="m-0 mt-3 text-sm text-slate-500">
        Reference and practice for English speakers.
      </p>
    </div>

    <nav
      class="grid w-full min-w-0 flex-1 grid-cols-4 gap-x-8 gap-y-8 max-[680px]:grid-cols-2"
      aria-label="Footer"
    >
      {#each groups as group (group.label)}
        <div class="space-y-2">
          <p class={eyebrowMutedClass}>{group.label}</p>

          <ul class="m-0 flex list-none flex-col p-0">
            {#each group.items as item (item.href)}
              <li>
                <a
                  class={cx(
                    "inline-block py-1 text-sm text-slate-800 transition-colors duration-150",
                    "hover:text-slate-900 hover:underline",
                    "aria-[current=page]:font-semibold aria-[current=page]:text-slate-900",
                  )}
                  href={item.href}
                  aria-current={navigationIsActive(pathname, item.href)
                    ? "page"
                    : undefined}
                >
                  {item.label}
                </a>
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </nav>
  </div>
</footer>
