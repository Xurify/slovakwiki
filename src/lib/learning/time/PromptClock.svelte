<script lang="ts">
  import ClockIllustration from "./ClockIllustration.svelte";
  import { formatClockFaceLabel } from "./clock";

  let {
    hour,
    minute,
    submitted = false,
    size = 120,
  }: {
    hour: number;
    minute: number;
    submitted?: boolean;
    size?: number;
  } = $props();

  const digital = $derived(formatClockFaceLabel({ hour, minute }));
</script>

<div class="mt-6 grid justify-items-center gap-2">
  <ClockIllustration {hour} {minute} {size} label={digital} />

  {#if submitted}
    <p
      class="m-0 font-sans text-sm font-semibold tabular-nums text-slate-500"
      aria-hidden="true"
    >
      {digital}
    </p>
  {/if}
</div>
