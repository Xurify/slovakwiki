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

  // Keep the label flush with the new-tab hint. A space inside the link
  // shows up before punctuation that follows it.
</script>

<svelte:element
  this={href ? "a" : "button"}
  class="cursor-pointer border-0 bg-transparent p-0 text-[0.82rem] font-bold text-blue-800 underline decoration-[color-mix(in_srgb,var(--accent)_55%,transparent)] underline-offset-[3px] {href
    ? ''
    : 'py-1'} {className}"
  {href}
  type={href ? undefined : "button"}
  {...rest}
  >{@render children()}{#if rest.target === "_blank"}<span class="sr-only"
      >{" (opens in a new tab)"}</span
    >{/if}</svelte:element
>
