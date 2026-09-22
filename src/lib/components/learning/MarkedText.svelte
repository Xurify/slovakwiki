<script lang="ts">
  import {
    markRoleClass,
    segmentsFromMarks,
    type TextMark,
  } from "$lib/learning/marked-text";

  let {
    marks,
    text,
  }: {
    marks?: TextMark[];
    text: string;
  } = $props();

  const segments = $derived(segmentsFromMarks(text, marks));
</script>

<span lang="sk">
  {#each segments as segment, index (index)}
    {#if segment.role}
      <span class={markRoleClass(segment.role)}>{segment.text}</span>
    {:else}
      {segment.text}
    {/if}
  {/each}
</span>
