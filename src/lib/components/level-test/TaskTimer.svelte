<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  let {
    seconds,
    label = "for this question",
    onexpire,
  }: {
    seconds: number;
    label?: string;
    onexpire?: () => void;
  } = $props();

  let remaining = $state(0);
  let expired = false;
  let timer: ReturnType<typeof setInterval> | undefined;

  const display = $derived(
    `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`,
  );
  const low = $derived(remaining <= Math.min(10, Math.ceil(seconds * 0.2)));

  // Wall-clock based so a throttled background tab cannot stretch the time.
  onMount(() => {
    const endsAt = performance.now() + seconds * 1000;
    remaining = seconds;

    timer = setInterval(() => {
      remaining = Math.max(0, Math.ceil((endsAt - performance.now()) / 1000));
      if (remaining === 0 && !expired) {
        expired = true;
        clearInterval(timer);
        onexpire?.();
      }
    }, 200);
  });

  onDestroy(() => clearInterval(timer));
</script>

<p
  class="m-0 inline-flex items-center gap-1.5 text-xs text-slate-500"
  role="timer"
  aria-label={`${display} left ${label}`}
>
  <svg
    class="size-4 fill-none stroke-current {low ? 'text-rose-700' : ''}"
    viewBox="0 0 24 24"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="13" r="8" />
    <path d="M12 9v4l2.5 2.5M10 2h4" />
  </svg>

  <span
    class="font-semibold tabular-nums transition-colors duration-150 ease-out {low
      ? 'text-rose-700'
      : 'text-slate-900'}"
  >
    {display}
  </span>

  <span aria-hidden="true">{label}</span>
</p>
