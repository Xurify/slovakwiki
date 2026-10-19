<script lang="ts">
  import type { TextSegment } from "./search-page-model";
  import { matchMarkClass } from "./search-results-ui";

  let { segments }: { segments: TextSegment[] } = $props();
</script>

{#each segments as segment, index (index)}
  {#if segment.mark}
    <mark class={matchMarkClass}>{segment.text}</mark>
  {:else}
    {segment.text}
  {/if}
{/each}
