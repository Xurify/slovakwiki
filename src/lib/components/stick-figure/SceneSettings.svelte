<script lang="ts" module>
  import type { SceneIconName } from "./SceneIcon.svelte";

  interface SceneSettingBase {
    /** Only where the label does not already say what the setting does. */
    description?: string;
    group?: string;
    label: string;
  }

  export interface SceneSettingToggle extends SceneSettingBase {
    icon?: SceneIconName;
    kind?: "toggle";
    on: boolean;
    ontoggle: () => void;
  }

  export interface SceneSettingVolume extends SceneSettingBase {
    kind: "volume";
    oninput: (value: number) => void;
    value: number;
  }

  export type SceneSetting = SceneSettingToggle | SceneSettingVolume;
</script>

<script lang="ts">
  import LessonSettingsToggle from "$lib/components/lessons/LessonSettingsToggle.svelte";
  import LessonSettingsVolume from "$lib/components/lessons/LessonSettingsVolume.svelte";
  import { iconButtonClass } from "$lib/components/ui/system-ui";
  import ToolButton from "$lib/components/ui/ToolButton.svelte";
  import { cx } from "$lib/ui/classes";

  import SceneIcon from "./SceneIcon.svelte";

  let {
    class: className = "",
    label = "Scene settings",
    settings,
    side = "bottom",
  }: {
    class?: string;
    label?: string;
    settings: SceneSetting[];
    /** Preferred side of the gear on desktop; phones use a bottom sheet. */
    side?: "bottom" | "top";
  } = $props();

  const id = $props.id();

  let open = $state(false);
  let at = $state<{ maxHeight: number; right: number; top: number }>();
  let root: HTMLDivElement;
  let menu: HTMLDivElement;
  let toggle = $state<HTMLButtonElement>();

  const blocks = $derived.by(() => {
    const volumes = settings.filter((setting) => setting.kind === "volume");
    const grouped = new Map<string, SceneSetting[]>();
    for (const setting of settings) {
      if (setting.kind === "volume") continue;
      const key = setting.group ?? "";
      const items = grouped.get(key);
      if (items) items.push(setting);
      else grouped.set(key, [setting]);
    }
    return [
      ...(volumes.length > 0 ? [{ key: "volume", label: "", items: volumes }] : []),
      ...Array.from(grouped, ([label, items]) => ({ key: `group-${label}`, label, items })),
    ];
  });

  // Not modal: the page stays live, so the player still works and the stage stays in view
  // while a setting changes it.
  function show(): void {
    open = true;
    at = undefined;
    menu.showPopover();
    place();
    Array.from(menu.querySelectorAll<HTMLElement>("button, input"))
      .find((control) => control.getClientRects().length > 0)
      ?.focus({ preventScroll: true });
  }

  function hide(returnFocus: boolean): void {
    if (!open) return;
    open = false;
    menu.hidePopover();
    if (returnFocus) toggle?.focus({ preventScroll: true });
  }

  function place(): void {
    if (!open || !toggle) return;
    if (window.innerWidth < 640) {
      at = undefined;
      return;
    }

    const gap = 8;
    const box = toggle.getBoundingClientRect();
    const roomAbove = Math.max(0, box.top - gap * 2);
    const roomBelow = Math.max(0, window.innerHeight - box.bottom - gap * 2);
    const height = menu.scrollHeight;
    const above =
      side === "top"
        ? roomAbove >= height || roomAbove >= roomBelow
        : roomBelow < height && roomAbove > roomBelow;
    const maxHeight = window.innerHeight - gap * 2;
    const panelHeight = Math.min(height, maxHeight);
    const preferredTop = above ? box.top - gap - panelHeight : box.bottom + gap;

    at = {
      maxHeight,
      right: Math.max(
        gap,
        Math.min(
          window.innerWidth - box.right,
          window.innerWidth - menu.offsetWidth - gap,
        ),
      ),
      top: Math.max(gap, Math.min(preferredTop, window.innerHeight - panelHeight - gap)),
    };
  }

  function onPointerDown(event: PointerEvent): void {
    if (open && event.target instanceof Node && !root.contains(event.target)) {
      hide(false);
    }
  }

  function onKeyDown(event: KeyboardEvent): void {
    if (open && event.key === "Escape") hide(true);
  }

  function onFocusOut(event: FocusEvent): void {
    if (event.relatedTarget instanceof Node && !root.contains(event.relatedTarget)) {
      hide(false);
    }
  }
</script>

<svelte:window
  onkeydown={onKeyDown}
  onpointerdown={onPointerDown}
  onresize={place}
  onscroll={place}
/>

<div bind:this={root} class="relative {className}" onfocusout={onFocusOut}>
  <ToolButton
    bind:ref={toggle}
    icon="settings"
    {label}
    tip={open ? false : "Settings"}
    tipSide={side}
    aria-controls={id}
    aria-expanded={open}
    aria-haspopup="dialog"
    onclick={() => (open ? hide(true) : show())}
  />

  <div
    bind:this={menu}
    {id}
    class={cx(
      "fixed inset-x-3 top-auto bottom-[max(0.75rem,env(safe-area-inset-bottom))] m-0 w-auto max-w-none",
      "max-h-[85dvh] flex-col overflow-hidden border-0 p-0 [&:popover-open]:flex [&:popover-open]:animate-rise",
      "rounded-(--frame-radius) bg-surface text-slate-900 shadow-(--shadow-float)",
      "sm:inset-auto sm:w-72 sm:max-h-[calc(100dvh-1rem)]",
    )}
    style:right={at ? `${at.right}px` : undefined}
    style:top={at ? `${at.top}px` : undefined}
    style:max-height={at ? `${at.maxHeight}px` : undefined}
    popover="manual"
    role="dialog"
    aria-labelledby="{id}-title"
  >
    <div
      class="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200/70 py-1 pr-1.5 pl-4 sm:hidden"
    >
      <h2 id="{id}-title" class="m-0 font-sans text-base font-semibold">{label}</h2>

      <button
        class={cx(iconButtonClass, "size-11 text-slate-500 hover:bg-subtle hover:text-slate-900")}
        type="button"
        aria-label="Close settings"
        onclick={() => hide(true)}
      >
        <SceneIcon class="size-[1.125rem]" name="close" />
      </button>
    </div>

    <div class="min-h-0 overflow-y-auto overscroll-contain p-1.5">
      {#each blocks as block, index (block.key)}
        <section class={cx(index > 0 && "mt-1.5 border-t border-slate-200/70 pt-1.5")}>
          {#if block.label}
            <h3 class="m-0 px-2.5 pt-1 pb-0.5 font-sans text-xs font-semibold text-slate-500">
              {block.label}
            </h3>
          {/if}

          <ul class="m-0 list-none p-0">
            {#each block.items as setting (setting.label)}
              <li>
                {#if setting.kind === "volume"}
                  <LessonSettingsVolume
                    description={setting.description}
                    id="{id}-volume"
                    label={setting.label}
                    oninput={setting.oninput}
                    value={setting.value}
                  />
                {:else}
                  <LessonSettingsToggle
                    icon={setting.icon}
                    label={setting.label}
                    description={setting.description}
                    on={setting.on}
                    ontoggle={setting.ontoggle}
                  />
                {/if}
              </li>
            {/each}
          </ul>
        </section>
      {/each}
    </div>
  </div>
</div>
