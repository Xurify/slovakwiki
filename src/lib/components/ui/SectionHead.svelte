<script lang="ts">
  import type { Snippet } from "svelte";

  /**
   * Section opener shared by index pages: serif title, optional description,
   * and a small right-hand aside (a count or a link). Mirrors the track head on
   * the lessons page so every index reads the same way.
   */
  let {
    title,
    id,
    href,
    description,
    aside,
    class: className = "",
  }: {
    title: string;
    id: string;
    /** Makes the title a link. */
    href?: string;
    description?: string;
    aside?: Snippet;
    class?: string;
  } = $props();
</script>

<div class={className}>
  <div class="mb-1 flex items-baseline justify-between gap-4">
    <div class="min-w-0">
      <h2
        {id}
        class="m-0 font-serif text-xl tracking-tight text-balance text-slate-900 sm:text-2xl"
      >
        {#if href}
          <a class="text-inherit no-underline hover:underline" {href}>{title}</a>
        {:else}
          {title}
        {/if}
      </h2>
    </div>

    {#if aside}
      <span class="shrink-0 text-xs tabular-nums text-slate-500">
        {@render aside()}
      </span>
    {/if}
  </div>

  {#if description}
    <p class="m-0 mt-2 max-w-xl text-sm leading-relaxed text-pretty text-slate-600">
      {description}
    </p>
  {/if}
</div>
