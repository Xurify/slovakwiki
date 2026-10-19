<script lang="ts">
  import type { Snippet } from "svelte";

  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  let { search }: { search: Snippet } = $props();
</script>

<main class="py-10 pb-20 max-[600px]:py-6">
  <PageShell class="max-w-[760px]">
    <nav class="mb-4 flex gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
      <TextLink href="/">Home</TextLink>
      <span aria-hidden="true">/</span>
      <span>Search</span>
    </nav>

    <h1 class="sr-only">Search Slovak Wiki</h1>

    {@render search()}
  </PageShell>
</main>
