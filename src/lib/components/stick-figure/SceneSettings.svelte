<script lang="ts" module>
  export interface SceneSetting {
    description: string;
    label: string;
    on: boolean;
    ontoggle: () => void;
  }
</script>

<script lang="ts">
  import { onMount } from "svelte";

  import LessonSettingsToggle from "$lib/components/lessons/LessonSettingsToggle.svelte";
  import { iconButtonClass } from "$lib/components/ui/system-ui";
  import { cx } from "$lib/ui/classes";
  import SceneIcon from "./SceneIcon.svelte";

  let {
    class: className = "",
    settings,
  }: {
    class?: string;
    settings: SceneSetting[];
  } = $props();

  let open = $state(false);
  let root: HTMLDivElement | undefined = $state();

  onMount(() => {
    function onPointerDown(event: PointerEvent): void {
      if (!open || !root) return;
      if (event.target instanceof Node && root.contains(event.target)) return;
      open = false;
    }

    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") open = false;
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  });
</script>

<div class="relative {className}" bind:this={root}>
  <button
    class={cx(
      iconButtonClass,
      "size-9 hover:bg-subtle hover:text-slate-900",
      open ? "bg-subtle text-slate-900" : "text-slate-500",
    )}
    type="button"
    aria-label="Scene settings"
    aria-expanded={open}
    aria-haspopup="dialog"
    aria-controls={open ? "scene-settings" : undefined}
    title="Scene settings"
    onclick={() => {
      open = !open;
    }}
  >
    <SceneIcon class="size-[1.125rem]" name="settings" />
  </button>

  {#if open}
    <div
      id="scene-settings"
      class={cx(
        "absolute top-[calc(100%+0.375rem)] right-0 z-40 w-[min(17.5rem,calc(100vw-2rem))] overflow-hidden",
        "rounded-(--frame-radius) bg-surface shadow-(--shadow-float)",
      )}
      role="dialog"
      aria-label="Scene settings"
    >
      <ul class="m-0 list-none p-0">
        {#each settings as setting (setting.label)}
          <li class="border-b border-slate-200/70 last:border-b-0">
            <LessonSettingsToggle {...setting} />
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>
