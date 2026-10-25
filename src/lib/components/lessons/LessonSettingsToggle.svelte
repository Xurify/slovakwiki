<script lang="ts">
  let {
    description,
    label,
    on,
    ontoggle,
  }: {
    description: string;
    label: string;
    on: boolean;
    ontoggle: () => void;
  } = $props();

  const trackClass = $derived(
    [
      "mt-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full px-0.5 transition-colors",
      on ? "bg-blue-700" : "bg-slate-300",
    ].join(" "),
  );

  const thumbClass = $derived(
    [
      "size-4 rounded-full bg-white shadow-sm transition-transform",
      on ? "translate-x-4" : "translate-x-0",
    ].join(" "),
  );
</script>

<button
  class="flex w-full cursor-pointer items-start justify-between gap-3 px-3.5 py-3 text-left transition-colors hover:bg-subtle focus-visible:outline-offset-[-2px]"
  type="button"
  aria-pressed={on}
  onclick={ontoggle}
>
  <span class="min-w-0">
    <span class="block text-sm font-semibold text-slate-900">{label}</span>
    <span class="mt-0.5 block text-xs leading-snug text-pretty text-slate-500">
      {description}
    </span>
  </span>

  <span class={trackClass} aria-hidden="true">
    <span class={thumbClass}></span>
  </span>
</button>
