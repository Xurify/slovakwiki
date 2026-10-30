<script lang="ts">
  import SceneIcon, {
    type SceneIconName,
  } from "$lib/components/stick-figure/SceneIcon.svelte";
  import { cx } from "$lib/ui/classes";

  let {
    description,
    icon,
    label,
    on,
    ontoggle,
  }: {
    description?: string;
    icon?: SceneIconName;
    label: string;
    on: boolean;
    ontoggle: () => void;
  } = $props();

  const id = $props.id();
</script>

<button
  class={cx(
    "flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-(--control-radius) px-2.5 py-2 text-left",
    "transition-colors duration-150 ease-out hover:bg-subtle focus-visible:outline-offset-[-2px]",
  )}
  type="button"
  role="switch"
  aria-checked={on}
  aria-labelledby="{id}-label"
  aria-describedby={description ? `${id}-description` : undefined}
  onclick={ontoggle}
>
  {#if icon}
    <SceneIcon
      class={cx(
        "size-[1.125rem] transition-colors duration-150 ease-out",
        on ? "text-blue-700" : "text-slate-500",
      )}
      name={icon}
    />
  {/if}

  <span class="min-w-0 flex-1">
    <span id="{id}-label" class="block text-sm font-medium text-slate-900">
      {label}
    </span>

    {#if description}
      <span
        id="{id}-description"
        class="block text-xs leading-snug text-pretty text-slate-500"
      >
        {description}
      </span>
    {/if}
  </span>

  <span
    class={cx(
      "inline-flex h-5 w-9 shrink-0 items-center rounded-full p-0.5",
      "transition-colors duration-150 ease-out",
      on ? "bg-blue-600" : "bg-slate-300",
    )}
    aria-hidden="true"
  >
    <span
      class={cx("size-4 rounded-full bg-white shadow-sm", on ? "translate-x-4" : "translate-x-0")}
    ></span>
  </span>
</button>
