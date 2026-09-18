<script lang="ts">
  let {
    slovak,
    class: className = "text-[clamp(1.35rem,2.6vw,1.7rem)] text-slate-900",
    blankClass = "border-blue-800",
  }: {
    slovak: string;
    class?: string;
    blankClass?: string;
  } = $props();

  const parts = $derived(slovak.split(/(______)/));
</script>

<p
  class="m-0 font-serif font-semibold leading-snug tracking-tight text-balance {className}"
  lang="sk"
>
  <span class="sr-only">{slovak}</span>
  <span aria-hidden="true">
    {#each parts as part, index (index)}
      {#if part === "______"}
        <span
          class="mx-0.5 inline-block min-w-[4.5ch] border-b-2 align-baseline {blankClass}"
        ></span>
      {:else}
        {part}
      {/if}
    {/each}
  </span>
</p>
