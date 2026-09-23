<script lang="ts">
  import type { Snippet } from "svelte";

  import { referenceCardClass } from "$lib/components/reference/reference-ui";

  let {
    title,
    headingId,
    description,
    class: className = "",
    children,
  }: {
    title: string;
    headingId: string;
    description?: string;
    class?: string;
    children: Snippet;
  } = $props();
</script>

<section class="{referenceCardClass} {className}" aria-labelledby={headingId}>
  <div class="border-b border-slate-200/70 px-5 pt-4 pb-3">
    <h2
      id={headingId}
      class="m-0 font-serif text-lg leading-snug tracking-tight text-slate-900"
    >
      {title}
    </h2>

    {#if description}
      <p class="m-0 mt-0.5 text-xs leading-relaxed text-pretty text-slate-500">
        {description}
      </p>
    {/if}
  </div>

  {@render children()}
</section>
