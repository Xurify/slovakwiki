<script lang="ts">
  import type { Snippet } from "svelte";

  import PageShell from "$lib/components/ui/PageShell.svelte";

  import type { Lesson } from "$lib/learning/types";

  let {
    data: _data,
    player,
  }: {
    data: { lesson: Lesson };
    player: Snippet;
  } = $props();
</script>

<main class="pt-8 pb-14 max-[600px]:pt-6 max-[600px]:pb-10">
  <PageShell class="max-w-[720px]">
    {@render player()}
  </PageShell>
</main>
