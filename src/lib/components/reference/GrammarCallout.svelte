<script lang="ts">
  import { referenceCardClass } from "$lib/components/reference/reference-ui";
  import { cx } from "$lib/ui/classes";

  let {
    tone,
    label,
    text,
    class: className = "",
  }: {
    tone: "look" | "watch";
    label: string;
    text: string;
    class?: string;
  } = $props();

  const iconClass = $derived(
    cx(
      "flex size-8 items-center justify-center rounded-full",
      tone === "look" ? "bg-blue-100 text-blue-800" : "bg-rose-50 text-rose-700",
    ),
  );
</script>

<aside
  class="{referenceCardClass} grid grid-cols-[auto_minmax(0,1fr)] gap-x-3.5 px-5 py-4 {className}"
>
  <span class={iconClass} aria-hidden="true">
    {#if tone === "look"}
      <svg class="size-4" viewBox="0 0 16 16" fill="none">
        <circle cx="7" cy="7" r="4.25" stroke="currentColor" stroke-width="1.75" />
        <path
          d="m10.25 10.25 3 3"
          stroke="currentColor"
          stroke-width="1.75"
          stroke-linecap="round"
        />
      </svg>
    {:else}
      <svg class="size-4" viewBox="0 0 16 16" fill="none">
        <path d="M8 4v5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        <circle cx="8" cy="12" r="1.1" fill="currentColor" />
      </svg>
    {/if}
  </span>

  <div class="min-w-0 self-center">
    <p
      class="m-0 font-sans text-[0.64rem] font-bold tracking-[0.14em] uppercase {tone ===
      'look'
        ? 'text-blue-800'
        : 'text-rose-700'}"
    >
      {label}
    </p>

    <p
      class="m-0 mt-1 max-w-[62ch] font-serif leading-relaxed text-pretty text-slate-700"
    >
      {text}
    </p>
  </div>
</aside>
