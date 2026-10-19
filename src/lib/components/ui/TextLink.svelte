<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    href,
    class: className = "",
    children,
    ...rest
  }: {
    href?: string;
    class?: string;
    children: Snippet;
    [key: string]: unknown;
  } = $props();
</script>

<svelte:element
  this={href ? "a" : "button"}
  class="cursor-pointer border-0 bg-transparent p-0 text-[0.82rem] font-bold text-blue-800 underline decoration-[color-mix(in_srgb,var(--accent)_55%,transparent)] underline-offset-[3px] {className}"
  {href}
  type={href ? undefined : "button"}
  {...rest}
>
  {@render children()}
</svelte:element>
