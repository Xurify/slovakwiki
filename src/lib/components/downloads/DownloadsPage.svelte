<script lang="ts">
  import type { Snippet } from "svelte";

  import Lead from "$lib/components/ui/Lead.svelte";
  import PageShell from "$lib/components/ui/PageShell.svelte";
  import TextLink from "$lib/components/ui/TextLink.svelte";
  import { SITE_ORIGIN } from "$lib/seo/site";

  let { builder }: { builder: Snippet } = $props();

  const codeClass =
    "rounded-[4px] bg-subtle px-1 py-px font-mono text-[0.8em] text-slate-700";
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
        Every lemma with its gloss, related words and example sentences, as one file you
        can open in a spreadsheet, a script or Anki.
      </Lead>
    </header>

    <div class="mt-10">
      {@render builder()}
    </div>

    <section class="mt-8 max-w-[640px]" aria-labelledby="downloads-notes">
      <h2
        id="downloads-notes"
        class="m-0 font-serif text-xl tracking-tight text-slate-900"
      >
        About the files
      </h2>

      <ul
        class="m-0 mt-3 grid list-none gap-2 p-0 text-sm leading-relaxed text-slate-600"
      >
        <li>
          CSV and TSV exports with examples come as two files, words and examples, joined
          on <code class={codeClass}>slug</code>. The examples file repeats the spelled
          <code class={codeClass}>lemma</code> so it reads on its own.
        </li>
        <li>
          Anki phrases is a headerless TSV: the Slovak sentence, then the English, one
          card per line.
        </li>
        <li>
          Example sentences from Tatoeba are CC BY 2.0 FR. Every source is listed on
          <TextLink href="/references">References</TextLink>.
        </li>
      </ul>
    </section>

    <section class="mt-8 max-w-[640px]" aria-labelledby="downloads-links">
      <h2
        id="downloads-links"
        class="m-0 font-serif text-xl tracking-tight text-slate-900"
      >
        Link to a word
      </h2>

      <ul
        class="m-0 mt-3 grid list-none gap-2 p-0 text-sm leading-relaxed text-slate-600"
      >
        <li>
          Put any Slovak word after <code class={codeClass}>{SITE_ORIGIN}/w/</code>. A
          headword or one of its forms opens the entry:
          <TextLink href="/w/vína">/w/vína</TextLink> opens víno. Diacritics can be left
          out when only one word fits.
        </li>
        <li>
          A word that fits more than one entry, or none, opens search for it. Write a
          space as <code class={codeClass}>_</code> or
          <code class={codeClass}>%20</code>:
          <TextLink href="/w/dobrý_deň">/w/dobrý_deň</TextLink>.
        </li>
        <li>
          Browsers that offer to add a site as a search engine can add this one; it uses
          the same links.
        </li>
      </ul>
    </section>
  </PageShell>
</main>
