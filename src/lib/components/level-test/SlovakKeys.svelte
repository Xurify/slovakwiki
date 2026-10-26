<script lang="ts">
  import { sessionCharKeyClass } from "$lib/components/practice/practice-session-ui";

  import { SK_CHARS, typeIntoFocused } from "./level-test-ui";

  let { disabled = false }: { disabled?: boolean } = $props();
</script>

<div class="flex flex-wrap gap-1.5" role="group" aria-label="Slovak letters">
  {#each SK_CHARS as char (char)}
    <!-- mousedown keeps focus in the text field the letter is meant for. -->
    <button
      class={sessionCharKeyClass}
      type="button"
      tabindex="-1"
      {disabled}
      onmousedown={(event) => event.preventDefault()}
      onclick={() => typeIntoFocused(char)}
    >
      {char}
    </button>
  {/each}
</div>
