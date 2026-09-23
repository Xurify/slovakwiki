<script lang="ts">
  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import { cx } from "$lib/ui/classes";

  export type ReferenceRailItem = {
    current?: boolean;
    href: string;
    primary: string;
    /** Set when the primary line is Slovak. */
    primaryLang?: "sk";
    secondary?: string;
    secondaryLang?: "sk";
  };

  let { items }: { items: readonly ReferenceRailItem[] } = $props();

  function rowClass(current: boolean | undefined): string {
    return cx(
      "group flex items-center justify-between gap-3 px-5 py-2.5 no-underline transition-colors duration-150",
      current ? "bg-blue-50" : "hover:bg-slate-50",
    );
  }
</script>

<ul class="m-0 list-none divide-y divide-slate-200/70 p-0">
  {#each items as item (item.href)}
    <li>
      <a
        class={rowClass(item.current)}
        href={item.href}
        aria-current={item.current ? "page" : undefined}
      >
        <span class="min-w-0">
          <span
            class="block font-serif text-[0.98rem] leading-snug font-semibold tracking-tight text-balance text-slate-900 group-hover:text-blue-800"
            lang={item.primaryLang}
          >
            {item.primary}
          </span>

          {#if item.secondary}
            <span
              class="mt-0.5 block text-xs leading-snug text-pretty text-slate-600"
              lang={item.secondaryLang}
            >
              {item.secondary}
            </span>
          {/if}
        </span>

        {#if item.current}
          <span
            class="shrink-0 text-[0.64rem] font-bold tracking-[0.14em] text-blue-800 uppercase"
          >
            Here
          </span>
        {:else}
          <span class="shrink-0 text-blue-800 opacity-60 group-hover:opacity-100">
            <ArrowRight />
          </span>
        {/if}
      </a>
    </li>
  {/each}
</ul>
