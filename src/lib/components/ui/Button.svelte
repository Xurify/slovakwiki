<script lang="ts">
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

</script>

{#if href}
  <a
    class:bg-rose-600={variant === "primary"}
    class:text-white={variant === "primary"}
    class:hover:bg-rose-700={variant === "primary"}
    class:bg-transparent={variant === "secondary"}
    class:text-blue-800={variant === "secondary"}
    class:shadow-(--shadow-border)={variant === "secondary"}
    class:hover:bg-blue-50={variant === "secondary"}
    class:hover:shadow-(--shadow-border-hover)={variant === "secondary"}
    class="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-(--control-radius) border-0 px-4 font-sans font-bold transition-[background-color,box-shadow,transform,scale] active:scale-[0.96] {className}"
    {href}
    {...rest}
  >
    {@render children()}
  </a>
{:else}
  <button
    class:bg-rose-600={variant === "primary"}
    class:text-white={variant === "primary"}
    class:hover:bg-rose-700={variant === "primary"}
    class:bg-transparent={variant === "secondary"}
    class:text-blue-800={variant === "secondary"}
    class:shadow-(--shadow-border)={variant === "secondary"}
    class:hover:bg-blue-50={variant === "secondary"}
    class:hover:shadow-(--shadow-border-hover)={variant === "secondary"}
    class="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-(--control-radius) border-0 px-4 font-sans font-bold transition-[background-color,box-shadow,transform,scale] active:scale-[0.96] disabled:opacity-65 {className}"
    {type}
    {disabled}
    {...rest}
  >
    {@render children()}
  </button>
{/if}
