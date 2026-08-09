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
    variant?: "primary" | "accent" | "secondary";
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
    class:text-white={variant === "primary" || variant === "accent"}
    class:hover:bg-rose-700={variant === "primary"}
    class:bg-blue-600={variant === "accent"}
    class:hover:bg-blue-700={variant === "accent"}
    class:disabled:bg-slate-200={variant === "accent"}
    class:disabled:text-slate-500={variant === "accent"}
    class:disabled:hover:bg-slate-200={variant === "accent"}
    class:bg-control={variant === "secondary"}
    class:text-blue-800={variant === "secondary"}
    class:shadow-(--shadow-border)={variant === "secondary"}
    class:hover:bg-control-hover={variant === "secondary"}
    class:hover:shadow-(--shadow-border-hover)={variant === "secondary"}
    class="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-(--control-radius) border-0 px-4 font-sans font-bold transition-[background-color,box-shadow,transform,scale] duration-150 ease-out active:scale-[0.98] {className}"
    {href}
    {...rest}
  >
    {@render children()}
  </a>
{:else}
  <button
    class:bg-rose-600={variant === "primary"}
    class:text-white={variant === "primary" || variant === "accent"}
    class:hover:bg-rose-700={variant === "primary"}
    class:bg-blue-600={variant === "accent"}
    class:hover:bg-blue-700={variant === "accent"}
    class:disabled:bg-slate-200={variant === "accent"}
    class:disabled:text-slate-500={variant === "accent"}
    class:disabled:hover:bg-slate-200={variant === "accent"}
    class:bg-control={variant === "secondary"}
    class:text-blue-800={variant === "secondary"}
    class:shadow-(--shadow-border)={variant === "secondary"}
    class:hover:bg-control-hover={variant === "secondary"}
    class:hover:shadow-(--shadow-border-hover)={variant === "secondary"}
    class="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-(--control-radius) border-0 px-4 font-sans font-bold transition-[background-color,box-shadow,transform,scale] duration-150 ease-out active:scale-[0.98] disabled:opacity-65 {className}"
    {type}
    {disabled}
    {...rest}
  >
    {@render children()}
  </button>
{/if}
