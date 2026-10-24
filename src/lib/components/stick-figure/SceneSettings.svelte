<script lang="ts" module>
  export interface SceneSetting {
    description: string;
    label: string;
    on: boolean;
    ontoggle: () => void;
  }
</script>

<script lang="ts">
  import { onMount, tick } from "svelte";

  import LessonSettingsToggle from "$lib/components/lessons/LessonSettingsToggle.svelte";
  import { iconButtonClass } from "$lib/components/ui/system-ui";
  import { cx } from "$lib/ui/classes";
  import SceneIcon from "./SceneIcon.svelte";

  let {
    class: className = "",
    label = "Scene settings",
    settings,
    side = "bottom",
  }: {
    class?: string;
    /** What the menu is called, for the button and the dialog. */
    label?: string;
    settings: SceneSetting[];
    /** Where the menu opens: above the gear when it sits at the foot of a clipped card. */
    side?: "bottom" | "top";
  } = $props();

  /** Room between the gear and the menu. */
  const GAP = 6;

  let open = $state(false);
  /**
   * Where the menu stands, in viewport pixels: it is fixed, so the clipped
   * card the gear sits in cannot cut it off. Unset while it is measured.
   */
  let at = $state<{ right: number; top: number }>();
  let root: HTMLDivElement | undefined = $state();
  let menu: HTMLDivElement | undefined = $state();
  let toggle: HTMLButtonElement | undefined = $state();

  async function show(): Promise<void> {
    open = true;
    at = undefined;
    await tick();
    place();

    // Without a scroll: the menu is in view already.
    await tick();
    menu?.querySelector("button")?.focus({ preventScroll: true });
  }

  /** Stand the menu by its gear: on `side`, unless that puts it under the sticky header or off the bottom of the screen. */
  function place(): void {
    if (!root || !menu) return;

    const header = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
    const box = root.getBoundingClientRect();
    const height = menu.offsetHeight;
    const fitsAbove = box.top - GAP - height >= header;
    const fitsBelow = box.bottom + GAP + height <= window.innerHeight;
    const above = side === "top" ? fitsAbove || !fitsBelow : !fitsBelow && fitsAbove;
    at = {
      right: window.innerWidth - box.right,
      top: above ? box.top - GAP - height : box.bottom + GAP,
    };
  }

  /** Close the menu; `returnFocus` when the keyboard closed it, so focus is not lost. */
  function hide(returnFocus: boolean): void {
    if (!open) return;
    open = false;
    if (returnFocus) toggle?.focus();
  }

  function onFocusOut(event: FocusEvent): void {
    if (event.relatedTarget instanceof Node && root?.contains(event.relatedTarget))
      return;
    open = false;
  }

  onMount(() => {
    function onPointerDown(event: PointerEvent): void {
      if (!open || !root) return;
      if (event.target instanceof Node && root.contains(event.target)) return;
      open = false;
    }

    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === "Escape") hide(true);
    }

    // Fixed to the viewport, the menu follows its gear as the page scrolls.
    function onScroll(): void {
      if (open) place();
    }

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  });
</script>

<div class="relative {className}" bind:this={root} onfocusout={onFocusOut}>
  <button
    bind:this={toggle}
    class={cx(
      iconButtonClass,
      "size-11 hover:bg-subtle hover:text-slate-900",
      open ? "bg-subtle text-slate-900" : "text-slate-500",
    )}
    type="button"
    aria-label={label}
    aria-expanded={open}
    aria-haspopup="dialog"
    aria-controls={open ? "scene-settings" : undefined}
    title={label}
    onclick={() => {
      if (open) hide(true);
      else void show();
    }}
  >
    <SceneIcon class="size-[1.125rem]" name="settings" />
  </button>

  {#if open}
    <div
      bind:this={menu}
      id="scene-settings"
      class={cx(
        "fixed z-40 w-[min(17.5rem,calc(100vw-2rem))] overflow-hidden",
        at === undefined && "invisible",
        "rounded-(--frame-radius) bg-surface shadow-(--shadow-float)",
      )}
      style:right={at ? `${at.right}px` : undefined}
      style:top={at ? `${at.top}px` : undefined}
      role="dialog"
      aria-label={label}
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
