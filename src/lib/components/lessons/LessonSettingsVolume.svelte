<script lang="ts">
  let {
    description,
    id,
    label,
    oninput,
    value,
  }: {
    description: string;
    id: string;
    label: string;
    oninput: (value: number) => void;
    value: number;
  } = $props();

  const percent = $derived(Math.round(value * 100));
</script>

<div class="px-3.5 py-3">
  <label class="flex items-baseline justify-between gap-3" for={id}>
    <span class="text-sm font-semibold text-slate-900">{label}</span>

    <span class="text-xs tabular-nums text-slate-500">{percent}%</span>
  </label>

  <input
    {id}
    class="mt-2.5 block w-full"
    type="range"
    min="0"
    max="100"
    step="1"
    value={percent}
    style="--range-fill: {percent}%"
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={percent}
    aria-valuetext="{percent} percent"
    oninput={(event) => {
      const target = event.currentTarget;

      if (target instanceof HTMLInputElement) oninput(Number(target.value) / 100);
    }}
  />

  <p class="m-0 mt-1.5 text-xs leading-snug text-pretty text-slate-500">{description}</p>
</div>
