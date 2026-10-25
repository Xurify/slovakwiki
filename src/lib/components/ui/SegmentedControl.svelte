<script lang="ts" generics="Id extends string | number">
  import { cx } from "$lib/ui/classes";

  /** One choice among a few short ones, side by side in one quiet frame: a mode, a way to answer. */
  let {
    class: className = "",
    label,
    onselect,
    options,
    selected,
  }: {
    class?: string;
    /** Names the group for screen readers. */
    label: string;
    onselect: (id: Id) => void;
    options: ReadonlyArray<{ id: Id; label: string }>;
    selected: Id | undefined;
  } = $props();
</script>

<div
  class={cx(
    "inline-flex max-w-full flex-wrap rounded-(--control-radius) bg-subtle p-0.5 ring-1 ring-slate-200 ring-inset",
    className,
  )}
  role="group"
  aria-label={label}
>
  {#each options as option (option.id)}
    <button
      class={cx(
        "min-h-9 cursor-pointer rounded-[calc(var(--control-radius)-2px)] border-0 px-3.5 text-sm font-semibold whitespace-nowrap",
        "transition-[color,background-color,box-shadow] duration-150 ease-out",
        option.id === selected
          ? "bg-surface text-slate-900 shadow-(--shadow-border)"
          : "bg-transparent text-slate-600 hover:text-slate-900",
      )}
      type="button"
      aria-pressed={option.id === selected}
      onclick={() => onselect(option.id)}
    >
      {option.label}
    </button>
  {/each}
</div>
