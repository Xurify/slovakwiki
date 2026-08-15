<script lang="ts">
  import SearchBox from "$lib/components/search/SearchBox.svelte";

  interface PopularWord {
    href: string;
    slovak: string;
  }

  let { popularWords }: { popularWords: PopularWord[] } = $props();
</script>

<div class="mt-9 max-w-[480px]">
  <SearchBox
    id="home-search"
    size="hero"
    placeholder="ďakujem, cases, soft consonants…"
  />

  <p
    class="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[0.78rem] text-slate-500"
  >
    <span>Try</span>
    {#each popularWords as word, index (word.href)}
      {#if index > 0}
        <span class="text-slate-300" aria-hidden="true">·</span>
      {/if}
      <a
        class="font-serif text-blue-800 underline decoration-blue-800/25 underline-offset-[3px] hover:decoration-blue-800"
        href={word.href}
        lang="sk"
      >
        {word.slovak}
      </a>
    {/each}
  </p>
</div>
