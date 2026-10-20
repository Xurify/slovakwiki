<script lang="ts">
  import SearchBox from "./SearchBox.svelte";

  let {
    pathname,
    query = "",
  }: {
    pathname: string;
    query?: string;
  } = $props();

  const searchClass = $derived(
    pathname === "/search" || pathname === "/search/"
      ? "hidden"
      : pathname === "/practice"
        ? "max-[800px]:hidden"
        : "max-[800px]:order-3 max-[800px]:basis-full max-[800px]:max-w-none",
  );
</script>

<SearchBox
  class={searchClass}
  id="header-search"
  initialQuery={query}
  placeholder="Search words, grammar, lessons"
/>
