<script lang="ts">
  import type { Snippet } from "svelte";

  import { cx } from "$lib/ui/classes";

  let {
    children,
    class: className,
    disabled = false,
    onclick,
    pressed,
  }: {
    children: Snippet;
    class?: string;
    disabled?: boolean;
    onclick: () => void;
    pressed?: boolean;
  } = $props();
</script>

<button
  class={cx(
    "inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-(--control-radius) border-0 px-2.5 text-sm font-semibold",
    "transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-50",
    pressed
      ? "bg-blue-50 text-blue-800"
      : "bg-transparent text-slate-600 hover:bg-subtle hover:text-slate-900",
    className,
  )}
  type="button"
  aria-pressed={pressed}
  {disabled}
  {onclick}
>
  {@render children()}
</button>
