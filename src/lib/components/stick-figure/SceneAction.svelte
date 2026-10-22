<script lang="ts">
  import type { Snippet } from "svelte";

  import { cx } from "$lib/ui/classes";
  import SceneIcon, { type SceneIconName } from "./SceneIcon.svelte";

  let {
    children,
    class: className = "",
    href,
    icon,
    ...rest
  }: {
    children: Snippet;
    class?: string;
    href?: string;
    icon?: SceneIconName;
    [key: string]: unknown;
  } = $props();
</script>

<svelte:element
  this={href ? "a" : "button"}
  class={cx(
    "inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-(--control-radius) border-0 bg-transparent px-2.5",
    "text-sm font-bold text-blue-800 no-underline transition-colors duration-150 ease-out",
    "hover:bg-blue-50 aria-pressed:bg-blue-50",
    className,
  )}
  {href}
  type={href ? undefined : "button"}
  {...rest}
>
  {#if icon}
    <SceneIcon name={icon} />
  {/if}
  {@render children()}
</svelte:element>
