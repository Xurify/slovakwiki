<script lang="ts">
  import PronunciationTopicDetail from "$lib/components/PronunciationTopicDetail.svelte";

  let { data } = $props();
</script>

<PronunciationTopicDetail topic={data.entry} />
