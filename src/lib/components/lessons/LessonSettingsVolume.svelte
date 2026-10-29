<script lang="ts">
  import SceneIcon from "$lib/components/stick-figure/SceneIcon.svelte";
  import { cx } from "$lib/ui/classes";

  let {
    description,
    id,
    label,
    oninput,
    value,
  }: {
    description?: string;
    id: string;
    label: string;
    oninput: (value: number) => void;
    value: number;
  } = $props();

  // Keep the last audible level while this panel is closed as well as open.
  let restoreVolume = 1;

  const percent = $derived(Math.round(value * 100));
  const icon = $derived(
    value === 0 ? "volume-off" : value < 0.5 ? "volume-low" : "volume-high",
  );

  function toggleMute(): void {
    if (value > 0) {
      restoreVolume = value;
      oninput(0);
    } else {
      oninput(restoreVolume);
    }
  }
</script>

<div class="px-0.5">
  <div class="flex min-h-11 items-center gap-1.5">
    <button
      class={cx(
        "inline-grid size-11 shrink-0 cursor-pointer place-items-center rounded-(--control-radius)",
        "transition-colors duration-150 ease-out hover:bg-subtle",
        value > 0 ? "text-blue-700" : "text-slate-500",
      )}
      type="button"
      aria-label={value === 0 ? "Unmute" : "Mute"}
      onclick={toggleMute}
    >
      <SceneIcon class="size-5" name={icon} />
    </button>

    <input
      {id}
      class="block min-h-11 min-w-0 flex-1"
      type="range"
      min="0"
      max="100"
      step="1"
      value={percent}
      style:--range-fill="{percent}%"
      aria-label={label}
      aria-describedby={description ? `${id}-description` : undefined}
      aria-valuetext="{percent} percent"
      oninput={(event) => oninput(Number(event.currentTarget.value) / 100)}
    />

    <span
      class="w-11 shrink-0 pr-2 text-right text-xs font-semibold text-slate-500 tabular-nums"
      aria-hidden="true"
    >
      {percent}%
    </span>
  </div>

  {#if description}
    <p
      id="{id}-description"
      class="m-0 px-2 pb-1 text-xs leading-snug text-pretty text-slate-500"
    >
      {description}
    </p>
  {/if}
</div>
