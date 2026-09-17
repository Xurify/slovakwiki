<script lang="ts">
  let {
    slovak,
    size = "card",
  }: {
    slovak: string;
    size?: "card" | "featured";
  } = $props();

  const parts = $derived(slovak.split(/(______)/));

  const textClass = $derived(
    size === "featured"
      ? "m-0 mt-4 font-serif text-[clamp(1.8rem,4vw,2.75rem)] font-semibold leading-[1.1] tracking-tight text-balance text-slate-900"
      : "m-0 font-serif text-[clamp(1.35rem,2.6vw,1.7rem)] font-semibold leading-snug tracking-tight text-balance text-slate-900",
  );
</script>

<p class={textClass} lang="sk">
  <span class="sr-only">{slovak}</span>
  <span aria-hidden="true">
    {#each parts as part, index (index)}
      {#if part === "______"}
        <span
          class="mx-0.5 inline-block min-w-[4.5ch] border-b-2 border-rose-500 align-baseline"
        ></span>
      {:else}
        {part}
      {/if}
    {/each}
  </span>
</p>
