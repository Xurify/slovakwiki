<script lang="ts">
  import type { Snippet } from "svelte";

  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  let { search }: { search: Snippet } = $props();
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[640px]">
    <nav class="mb-6 flex gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
      <TextLink href="/">Home</TextLink>
      <span aria-hidden="true">/</span>
      <span>Search</span>
    </nav>

    <header class="max-w-[520px]">
      <h1>Find a word, topic, or lesson</h1>
      <Lead class="mt-3">
        Type to search the dictionary, grammar, cases, pronunciation, lessons, and
        practice. Diacritics are optional.
      </Lead>
    </header>

    <div class="mt-8">
      {@render search()}
    </div>
  </PageShell>
</main>
