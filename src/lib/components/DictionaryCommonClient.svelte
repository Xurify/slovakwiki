<script lang="ts">
  import { mount, onDestroy, onMount, unmount } from "svelte";

  import DictionaryCommonList from "$lib/components/DictionaryCommonList.svelte";
  import DictionaryCommonSearch from "$lib/components/DictionaryCommonSearch.svelte";
  import type { FrequencyPartOfSpeech } from "$lib/content/frequency-types";

  let {
    partOfSpeech,
    totalCount,
  }: {
    partOfSpeech: FrequencyPartOfSpeech;
    totalCount: number;
  } = $props();

  const instances: Array<ReturnType<typeof mount>> = [];

  onMount(() => {
    const filterHost = document.querySelector<HTMLElement>("[data-common-filter]");
    if (filterHost) {
      filterHost.replaceChildren();
      instances.push(
        mount(DictionaryCommonSearch, { target: filterHost, props: { partOfSpeech } }),
      );
    }

    const listHost = document.querySelector<HTMLElement>("[data-common-list-controls]");
    if (listHost) {
      listHost.replaceChildren();
      instances.push(
        mount(DictionaryCommonList, { target: listHost, props: { totalCount } }),
      );
    }
  });

  onDestroy(() => {
    for (const instance of instances) {
      unmount(instance);
    }
  });
</script>

<span class="sr-only" aria-hidden="true"></span>
