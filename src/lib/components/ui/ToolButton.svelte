<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  import SceneIcon, {
    type SceneIconName,
  } from "$lib/components/stick-figure/SceneIcon.svelte";
  import { cx } from "$lib/ui/classes";

  let {
    children,
    class: className = "",
    icon,
    label,
    pressed,
    ref = $bindable(),
    tip,
    tipSide = "top",
    ...rest
  }: Omit<HTMLButtonAttributes, "children" | "class"> & {
    /** Drawn instead of an icon, such as a speed like `0.8×`. */
    children?: Snippet;
    class?: string;
    icon?: SceneIconName;
    /** The button's name, and its tooltip unless `tip` says otherwise. */
    label: string;
    /** Makes it a toggle: when on, it turns blue and shows a short bar underneath. */
    pressed?: boolean;
    ref?: HTMLButtonElement;
    /** `false` hides it, as while the menu it opens is showing. */
    tip?: string | false;
    tipSide?: "bottom" | "top";
  } = $props();
</script>

<button
  bind:this={ref}
  class={cx(
    "group relative inline-grid size-11 shrink-0 cursor-pointer place-items-center rounded-(--control-radius) border-0 bg-transparent",
    "transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent",
    pressed
      ? "text-blue-700 hover:bg-blue-50"
      : "text-slate-500 hover:bg-subtle hover:text-slate-900 aria-expanded:bg-subtle aria-expanded:text-slate-900",
    className,
  )}
  type="button"
  aria-label={label}
  aria-pressed={pressed}
  {...rest}
>
  {#if icon}
    <SceneIcon class="size-5" name={icon} />
  {:else if children}
    {@render children()}
  {/if}

  {#if pressed !== undefined}
    <span
      class={cx(
        "absolute inset-x-3 bottom-1.5 h-0.5 rounded-full bg-current transition-opacity duration-150 ease-out",
        pressed ? "opacity-100" : "opacity-0",
      )}
      aria-hidden="true"
    ></span>
  {/if}

  {#if tip !== false}
    <span
      class={cx(
        "pointer-events-none absolute left-1/2 z-30 w-max -translate-x-1/2 rounded-(--control-radius) bg-surface px-2 py-1",
        "font-sans text-xs font-semibold text-slate-800 opacity-0 shadow-(--shadow-float)",
        "transition-opacity duration-150 ease-out group-hover:opacity-100 group-focus-visible:opacity-100",
        tipSide === "top" ? "bottom-[calc(100%+0.25rem)]" : "top-[calc(100%+0.25rem)]",
      )}
      aria-hidden="true"
    >
      {tip ?? label}
    </span>
  {/if}
</button>
