<script lang="ts">
  import SearchBox from "$lib/components/SearchBox.svelte";

  let {
    pathname,
    query = "",
  }: {
    pathname: string;
    query?: string;
  } = $props();

  const searchClass = $derived(
    pathname === "/"
      ? "max-[800px]:hidden"
      : "max-[800px]:order-3 max-[800px]:w-full max-[800px]:max-w-none",
  );
</script>

<SearchBox class={searchClass} id="header-search" initialQuery={query} />
