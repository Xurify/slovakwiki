<script lang="ts">
  import {
    markRoleClass,
    segmentsFromMarks,
    type TextMark,
    type TextRole,
  } from "$lib/learning/marked-text";

  let {
    markClass = markRoleClass,
    marks,
    text,
  }: {
    markClass?: (role: TextRole) => string;
    marks?: TextMark[];
    text: string;
  } = $props();

  const segments = $derived(segmentsFromMarks(text, marks));
</script>

<span lang="sk">
  {#each segments as segment, index (index)}
    {#if segment.role}
      <span class={markClass(segment.role)}>{segment.text}</span>
    {:else}
      {segment.text}
    {/if}
  {/each}
</span>
