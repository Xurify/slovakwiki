<script lang="ts">
  import { onMount } from "svelte";

  import { pushSearchHistory } from "$lib/client/search-history";
  import EntryDetail from "$lib/components/EntryDetail.svelte";
  import type { ContentEntry } from "$lib/content/types";

  let { data }: { data: { entry: ContentEntry } } = $props();

  onMount(() => {
    if (data.entry.kind !== "word") {
      return;
    }

    pushSearchHistory(localStorage, {
      href: `/dictionary/${data.entry.slug}`,
      kind: "word",
      label: data.entry.slovak,
    });
  });
</script>

<EntryDetail entry={data.entry} />
