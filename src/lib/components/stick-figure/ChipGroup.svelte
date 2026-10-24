<script lang="ts" generics="Id extends string | number">
  import { chipClass } from "$lib/components/ui/system-ui";
  import { cx } from "$lib/ui/classes";

  /** A row of chips that picks one option: a mode, a way to answer, what to say. */
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

<div class={cx("flex flex-wrap gap-2", className)} role="group" aria-label={label}>
  {#each options as option (option.id)}
    <button
      class={chipClass(option.id === selected)}
      type="button"
      aria-pressed={option.id === selected}
      onclick={() => onselect(option.id)}
    >
      {option.label}
    </button>
  {/each}
</div>
