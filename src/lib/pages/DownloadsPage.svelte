<script lang="ts">
  import type { Snippet } from "svelte";

  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";

  let { builder }: { builder: Snippet } = $props();
</script>

<main class="py-12 pb-20 max-[600px]:py-8">
  <PageShell class="max-w-[880px]">
    <nav class="mb-6 flex gap-2 text-xs text-slate-500" aria-label="Breadcrumb">
      <TextLink href="/dictionary">Dictionary</TextLink>
      <span aria-hidden="true">/</span>
      <span>Downloads</span>
    </nav>

    <header class="max-w-[640px]">
      <h1 class="text-balance">Download the dictionary</h1>
      <Lead class="text-pretty">
        Ready-made packs, or a custom export by format and category. Sources and licenses:
        <TextLink href="/references">References</TextLink>.
      </Lead>
    </header>

    <div class="mt-10">
      {@render builder()}
    </div>
  </PageShell>
</main>
