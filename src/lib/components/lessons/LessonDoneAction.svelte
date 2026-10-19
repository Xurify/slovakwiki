<script lang="ts">
  import type { Snippet } from "svelte";

  import ArrowRight from "$lib/components/ui/ArrowRight.svelte";
  import Button from "$lib/components/ui/Button.svelte";

  /** Footer CTA on the lesson done screen. `primary` gets focus on mount. */
  let {
    href,
    primary = false,
    children,
  }: {
    href: string;
    primary?: boolean;
    children: Snippet;
  } = $props();
</script>

<Button
  class="min-w-0 flex-1 whitespace-nowrap px-4 sm:min-w-36 sm:flex-none sm:px-8"
  variant={primary ? "accent" : "secondary"}
  {href}
  data-done-primary={primary || undefined}
>
  {@render children()}

  {#if primary}
    <ArrowRight />
  {/if}
</Button>
