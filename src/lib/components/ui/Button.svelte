<script lang="ts">
  import { button, buttonSecondary, cx } from "$lib/ui/classes";

  import type { Snippet } from "svelte";

  let {
    href,
    variant = "primary",
    class: className = "",
    type = "button",
    disabled = false,
    children,
    ...rest
  }: {
    href?: string;
    variant?: "primary" | "secondary";
    class?: string;
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    children: Snippet;
    [key: string]: unknown;
  } = $props();

  const classes = $derived(
    cx(variant === "secondary" ? buttonSecondary : button, className),
  );
</script>

{#if href}
  <a class={classes} {href} {...rest}>{@render children()}</a>
{:else}
  <button class={classes} {type} {disabled} {...rest}>{@render children()}</button>
{/if}
