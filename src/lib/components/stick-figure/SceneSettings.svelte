<script lang="ts" module>
  export interface SceneSettingToggle {
    description: string;
    kind?: "toggle";
    label: string;
    on: boolean;
    ontoggle: () => void;
  }

  export interface SceneSettingVolume {
    description: string;
    kind: "volume";
    label: string;
    oninput: (value: number) => void;
    value: number;
  }

  export type SceneSetting = SceneSettingToggle | SceneSettingVolume;
</script>

<script lang="ts">
  import { onMount, tick } from "svelte";

  import LessonSettingsToggle from "$lib/components/lessons/LessonSettingsToggle.svelte";
  import LessonSettingsVolume from "$lib/components/lessons/LessonSettingsVolume.svelte";
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
  let at = $state<{ maxHeight: number; right: number; top: number }>();
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

  /**
   * Stand the menu by its gear: on `side` when it fits there, else on the side
   * with more room, and never taller than the room it has — a phone screen can
   * be shorter than five rows, and the top row must stay reachable.
   */
  function place(): void {
    if (!root || !menu) return;

    const header = document.querySelector("header")?.getBoundingClientRect().bottom ?? 0;
    const box = root.getBoundingClientRect();
    const height = menu.offsetHeight;
    const roomAbove = box.top - GAP - Math.max(header, 0);
    const roomBelow = window.innerHeight - box.bottom - GAP;
    const above =
      side === "top"
        ? roomBelow < height || roomAbove >= roomBelow
        : roomBelow < height && roomAbove > roomBelow;
    const room = Math.max(0, above ? roomAbove : roomBelow);
    at = {
      maxHeight: room,
      right: window.innerWidth - box.right,
      top: above
        ? Math.max(header, box.top - GAP - Math.min(height, room))
        : box.bottom + GAP,
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
        "fixed z-40 w-[min(17.5rem,calc(100vw-2rem))] overflow-x-hidden overflow-y-auto",
        at === undefined && "invisible",
        "rounded-(--frame-radius) bg-surface shadow-(--shadow-float)",
      )}
      style:right={at ? `${at.right}px` : undefined}
      style:top={at ? `${at.top}px` : undefined}
      style:max-height={at ? `${at.maxHeight}px` : undefined}
      role="dialog"
      aria-label={label}
    >
      <ul class="m-0 list-none p-0">
        {#each settings as setting (setting.label)}
          <li class="border-b border-slate-200/70 last:border-b-0">
            {#if setting.kind === "volume"}
              <LessonSettingsVolume
                description={setting.description}
                id="scene-settings-volume"
                label={setting.label}
                oninput={setting.oninput}
                value={setting.value}
              />
            {:else}
              <LessonSettingsToggle
                label={setting.label}
                description={setting.description}
                on={setting.on}
                ontoggle={setting.ontoggle}
              />
            {/if}
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>
