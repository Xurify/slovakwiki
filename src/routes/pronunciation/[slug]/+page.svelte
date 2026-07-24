<script lang="ts">
  import EntryDetail from "$lib/components/EntryDetail.svelte";

  let { data } = $props();
</script>

<EntryDetail entry={data.entry} />
