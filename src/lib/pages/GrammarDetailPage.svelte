<script lang="ts">
  import GrammarTopicDetail from "$lib/components/GrammarTopicDetail.svelte";

  let { data } = $props();
</script>

<GrammarTopicDetail topic={data.entry} />
